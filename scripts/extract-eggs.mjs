// Cuts the egg animations out of src/ui/assets/egg.png (art by VIERGACHT):
//
//   node scripts/extract-eggs.mjs   (or: npm run eggs)
//
// The source has four eggs, each a block of 5 rows of 32x32 cells on a flat green background.
// Rows 4 (idle, 6 frames) and 5 (hatching, 12 frames) of each egg are written to
// src/ui/assets/eggs/<colour>.png: 12x2 cells, idle on top, the green made transparent.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const SOURCE = 'src/ui/assets/egg.png';
const OUT_DIR = 'src/ui/assets/eggs';
const CELL = 32;
const COLUMNS = 12;
/** Top-left corner of each egg's block in the source. */
const EGGS = { beige: [0, 0], gold: [416, 0], purple: [0, 192], white: [416, 192] };
/** Source rows (0-based within a block) copied to output rows 0 and 1. */
const ROWS = [3, 4];

const source = PNG.sync.read(readFileSync(SOURCE));
const at = (x, y) => (y * source.width + x) * 4;
const [bgR, bgG, bgB] = source.data.subarray(0, 3);
const isBackground = (o) =>
  Math.abs(source.data[o] - bgR) + Math.abs(source.data[o + 1] - bgG) + Math.abs(source.data[o + 2] - bgB) < 30;

mkdirSync(OUT_DIR, { recursive: true });
for (const [colour, [left, top]] of Object.entries(EGGS)) {
  const out = new PNG({ width: CELL * COLUMNS, height: CELL * ROWS.length });
  ROWS.forEach((row, outRow) => {
    for (let y = 0; y < CELL; y++) {
      for (let x = 0; x < CELL * COLUMNS; x++) {
        const from = at(left + x, top + row * CELL + y);
        if (isBackground(from)) continue;
        const to = ((outRow * CELL + y) * out.width + x) * 4;
        out.data.set(source.data.subarray(from, from + 3), to);
        out.data[to + 3] = 255;
      }
    }
  });
  writeFileSync(`${OUT_DIR}/${colour}.png`, PNG.sync.write(out));
}
console.log(`Wrote ${Object.keys(EGGS).length} eggs to ${OUT_DIR}.`);
