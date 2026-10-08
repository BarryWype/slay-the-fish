// Generates one animated sprite sheet per creature from src/ui/assets/fishes.png.
//
//   npm run sprites            -> creates missing sheets only (hand-edited sheets are kept)
//   npm run sprites -- --force -> regenerates every sheet
//
// Output: src/ui/assets/creatures/NNN.png (NNN = number in fish_names.pdf).
// Each sheet is 6 columns x 4 rows of 48x48 frames:
//   row 0 idle    (loops)    gentle bob
//   row 1 attack  (once)     wind-up, lunge towards the player (left), impact flash
//   row 2 capture (once)     a net drops over the creature and lifts it out
//   row 3 flee    (once)     turns around and swims off to the right
// The source creatures face left (towards the player).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const SOURCE = 'src/ui/assets/fishes.png';
const OUT_DIR = 'src/ui/assets/creatures';
const SRC_CELL = 32;
const SRC_COLUMNS = 12;
const COUNT = 144;
const FRAME = 48;
const PAD = (FRAME - SRC_CELL) / 2; // creature is centred in the frame
const FRAMES = 6;
const ROWS = 4;

const force = process.argv.includes('--force');

/** Frame recipes. Every value is optional: dx/dy shift in px, sx/sy scale, flip, flash (0..1 white). */
const IDLE = [{ dy: 0 }, { dy: -1 }, { dy: -1 }, { dy: 0 }, { dy: 1 }, { dy: 1 }];
const ATTACK = [
  {},
  { dx: 2, sx: 0.95, sy: 1.05 },
  { dx: 4, sx: 0.9, sy: 1.08 },
  { dx: -4, sx: 1.1, sy: 0.95 },
  { dx: -8, sx: 1.15, sy: 0.92, flash: 0.45 },
  { dx: -3 },
];
// rimY: where the net's rim is (top of the bag). Fish lifts with the net at the end.
const CAPTURE = [
  { net: -30 },
  { net: -17 },
  { net: -4 },
  { net: 6, dy: 1, sx: 0.92, sy: 0.95 },
  { net: 4, dy: -1, sx: 0.9, sy: 0.95 },
  { net: 1, dy: -4, sx: 0.9, sy: 0.95 },
];
const FLEE = [
  { dy: 0 },
  { sx: 0.35 }, // mid-turn
  { flip: true },
  { flip: true, dx: 6, dy: -1 },
  { flip: true, dx: 18, dy: -2 },
  { flip: true, dx: 48, dy: -2 }, // gone
];
const ROW_RECIPES = [IDLE, ATTACK, CAPTURE, FLEE];

const NET_MESH = [232, 228, 214, 255];
const NET_EDGE = [196, 188, 168, 255];
const NET_RIM = [118, 80, 44, 255];
const NET_HANDLE = [156, 110, 62, 255];

function readCell(sheet, index) {
  const col = (index - 1) % SRC_COLUMNS;
  const row = Math.floor((index - 1) / SRC_COLUMNS);
  const cell = new Uint8Array(SRC_CELL * SRC_CELL * 4);
  for (let y = 0; y < SRC_CELL; y++) {
    for (let x = 0; x < SRC_CELL; x++) {
      const s = ((row * SRC_CELL + y) * sheet.width + col * SRC_CELL + x) * 4;
      cell.set(sheet.data.subarray(s, s + 4), (y * SRC_CELL + x) * 4);
    }
  }
  return cell;
}

function setPixel(out, fx, fy, x, y, rgba) {
  if (x < 0 || y < 0 || x >= FRAME || y >= FRAME) return;
  const i = ((fy * FRAME + y) * out.width + fx * FRAME + x) * 4;
  out.data.set(rgba, i);
}

/** Draw the creature into frame (fx, fy), nearest-neighbour, transformed around its centre. */
function drawCreature(out, fx, fy, cell, { dx = 0, dy = 0, sx = 1, sy = 1, flip = false, flash = 0 }) {
  const c = SRC_CELL / 2;
  for (let y = 0; y < FRAME; y++) {
    for (let x = 0; x < FRAME; x++) {
      const lx = x - PAD - dx;
      const ly = y - PAD - dy;
      let srcX = Math.floor(c + (lx + 0.5 - c) / sx);
      const srcY = Math.floor(c + (ly + 0.5 - c) / sy);
      if (flip) srcX = SRC_CELL - 1 - srcX;
      if (srcX < 0 || srcY < 0 || srcX >= SRC_CELL || srcY >= SRC_CELL) continue;
      const i = (srcY * SRC_CELL + srcX) * 4;
      if (cell[i + 3] === 0) continue;
      const mix = (v) => Math.round(v + (255 - v) * flash);
      setPixel(out, fx, fy, x, y, [mix(cell[i]), mix(cell[i + 1]), mix(cell[i + 2]), cell[i + 3]]);
    }
  }
}

/** A landing net: half-ellipse mesh bag hanging from a rim at `rimY`, with a handle going up. */
function drawNet(out, fx, fy, rimY) {
  const cx = 23.5;
  const rx = 21;
  const depth = 34;
  const inside = (x, y) => y >= rimY && ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - rimY) / depth) ** 2 <= 1;
  for (let y = Math.max(0, rimY); y < Math.min(FRAME, rimY + depth); y++) {
    for (let x = 0; x < FRAME; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y + 1);
      if (edge) setPixel(out, fx, fy, x, y, NET_EDGE);
      else if ((x + y) % 5 === 0 || (x - y + 100) % 5 === 0) setPixel(out, fx, fy, x, y, NET_MESH);
    }
  }
  for (let x = Math.round(cx - rx); x <= Math.round(cx + rx); x++) {
    setPixel(out, fx, fy, x, rimY, NET_RIM);
    setPixel(out, fx, fy, x, rimY - 1, NET_RIM);
  }
  for (let y = 0; y < rimY - 1; y++) {
    setPixel(out, fx, fy, 23, y, NET_HANDLE);
    setPixel(out, fx, fy, 24, y, NET_HANDLE);
  }
}

const sheet = PNG.sync.read(readFileSync(SOURCE));
mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
let skipped = 0;
for (let no = 1; no <= COUNT; no++) {
  const file = `${OUT_DIR}/${String(no).padStart(3, '0')}.png`;
  if (!force && existsSync(file)) {
    skipped++;
    continue;
  }
  const cell = readCell(sheet, no);
  const out = new PNG({ width: FRAME * FRAMES, height: FRAME * ROWS });
  ROW_RECIPES.forEach((recipe, row) => {
    recipe.forEach((frame, col) => {
      drawCreature(out, col, row, cell, frame);
      if (frame.net !== undefined) drawNet(out, col, row, frame.net);
    });
  });
  writeFileSync(file, PNG.sync.write(out));
  written++;
}

console.log(`Creature sprites: ${written} written, ${skipped} kept (use --force to regenerate all).`);
