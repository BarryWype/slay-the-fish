// Generates the map's terrain patches: one pixel-art "island" per creature type,
// drawn under the fight nodes of that type.
//
//   node scripts/generate-map-terrain.mjs   (or: npm run terrain)
//
// Output: src/ui/assets/terrain.png, one row of 40x40 tiles in TILES order.
// Each tile is an irregular blob (transparent outside) with a dark 1px outline.
// Everything is seeded, so re-running gives the same image.

import { writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const OUT = 'src/ui/assets/terrain.png';
const TILE = 40;

/** Tile order = sprite index - 1 in the `terrain` sheet (see sprites.ts / creatureTypes.ts). */
const TILES = ['shallows', 'openWater', 'ocean', 'reef', 'abyss', 'boulders', 'sandbank', 'kelp', 'tidePool'];

// --- tiny helpers ------------------------------------------------------------

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise in [0, 1), `cell` px per lattice step. */
function valueNoise(seed, cell) {
  const rand = rng(seed);
  const size = Math.ceil(TILE / cell) + 2;
  const grid = Array.from({ length: size * size }, rand);
  const at = (x, y) => grid[(y % size) * size + (x % size)];
  const smooth = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const gx = x / cell;
    const gy = y / cell;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const tx = smooth(gx - x0);
    const ty = smooth(gy - y0);
    const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
    const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
    return top * (1 - ty) + bottom * ty;
  };
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const darken = ([r, g, b], f) => [Math.round(r * f), Math.round(g * f), Math.round(b * f)];

/** Irregular blob: is (x, y) inside the island? */
function blobMask(seed) {
  const wobble = rng(seed);
  const bumps = Array.from({ length: 5 }, () => [wobble() * Math.PI * 2, 0.6 + wobble() * 1.4]);
  const c = (TILE - 1) / 2;
  return (x, y) => {
    const angle = Math.atan2(y - c, x - c);
    const r = 16.5 + bumps.reduce((sum, [phase, k]) => sum + Math.sin(angle * Math.round(k + 1) + phase) * 0.9, 0);
    return Math.hypot(x - c, y - c) <= r;
  };
}

// Hand-drawn pixel patterns: X = colour, o = shade, . = background.
const SCALLOP = ['.XXX.', 'XoXoX', 'XoXoX', '.ooo.'];
const STARFISH = ['...X...', '...X...', 'XXXoXXX', '.XoooX.', '..XXX..', '.XX.XX.', '.X...X.'];

// --- one painter per terrain: (x, y) -> [r, g, b] -----------------------------

const PAINTERS = {
  /** Small fish: shallow turquoise water, sand showing through, sun glints. */
  shallows(seed) {
    const n = valueNoise(seed, 8);
    const sparkle = rng(seed + 1);
    return (x, y) => {
      const v = n(x, y);
      if (v > 0.72) return hex('#e6d39a');
      if (v > 0.62) return hex('#a9e0d0');
      if (sparkle() < 0.025) return hex('#f4ffff');
      return v > 0.4 ? hex('#6fd0dc') : hex('#58c0d2');
    };
  },
  /** Sport fish: mid-blue water with short wave crests. */
  openWater(seed) {
    const n = valueNoise(seed, 10);
    return (x, y) => {
      const crest = Math.sin(x * 0.55 + Math.floor(y / 6) * 2.1) > 0.82 && y % 6 === 0;
      if (crest) return hex('#9fd3ef');
      return n(x, y) > 0.5 ? hex('#3a8cc0') : hex('#2f7cb0');
    };
  },
  /** Big fish: dark open ocean, long swells and a little foam. */
  ocean(seed) {
    const n = valueNoise(seed, 12);
    const foam = rng(seed + 2);
    return (x, y) => {
      const swell = (y + Math.round(Math.sin(x * 0.25) * 2)) % 9;
      if (swell === 0) return foam() < 0.15 ? hex('#cfe6f5') : hex('#3c76b0');
      if (swell === 1) return hex('#2a5e98');
      return n(x, y) > 0.55 ? hex('#1f5490') : hex('#1a4880');
    };
  },
  /** Rock fish: a reef, rock clusters dotted with coral. */
  reef(seed) {
    const rock = valueNoise(seed, 6);
    const coral = rng(seed + 3);
    return (x, y) => {
      const v = rock(x, y);
      if (v > 0.48) {
        if (coral() < 0.07) return coral() < 0.5 ? hex('#ef7f7f') : hex('#f3a64d');
        const lit = rock(x - 1, y - 1) > rock(x + 1, y + 1);
        return v > 0.6 ? (lit ? hex('#a4a8b2') : hex('#7f848f')) : hex('#666b76');
      }
      if (v > 0.44) return hex('#474d58');
      return hex('#2b7391');
    };
  },
  /** Deep sea: near-black water with faint glowing dots. */
  abyss(seed) {
    const n = valueNoise(seed, 9);
    const glow = rng(seed + 4);
    return (x, y) => {
      const g = glow();
      if (g < 0.012) return hex('#6ff2e0');
      if (g < 0.018) return hex('#b48cff');
      return n(x, y) > 0.55 ? hex('#16264d') : hex('#0e1a36');
    };
  },
  /** Crustacean: sand with big shaded boulders. */
  boulders(seed) {
    const rock = valueNoise(seed, 9);
    const grain = rng(seed + 5);
    return (x, y) => {
      const v = rock(x, y);
      if (v > 0.58) {
        const lit = rock(x - 1, y - 1) > rock(x + 1, y + 1);
        return v > 0.68 ? (lit ? hex('#b1b4ba') : hex('#8b8f97')) : hex('#6c7078');
      }
      if (v > 0.54) return hex('#5a5d64');
      return grain() < 0.06 ? hex('#c7ad76') : hex('#dcc38d');
    };
  },
  /** Shellfish: rippled sand with scallop shells. */
  sandbank() {
    // Top-left corners of 5x4 scallops, and whether each is pink.
    const shells = [[9, 9, false], [22, 7, true], [27, 18, false], [12, 22, true], [20, 28, false]];
    return (x, y) => {
      for (const [sx, sy, pink] of shells) {
        const px = SCALLOP[y - sy]?.[x - sx];
        if (px === 'X') return pink ? hex('#f2a7b4') : hex('#fbf3e4');
        if (px === 'o') return pink ? hex('#c9707f') : hex('#cbbfa6');
      }
      const ripple = (y + Math.round(Math.sin(x * 0.4) * 1.5)) % 5 === 0;
      return ripple ? hex('#cbb17b') : hex('#e6cf98');
    };
  },
  /** Tentacled: a kelp forest of swaying blades. */
  kelp(seed) {
    const r = rng(seed + 7);
    const blades = Array.from({ length: 7 }, () => [3 + r() * 34, r() * 6, 0.6 + r() * 0.5]);
    return (x, y) => {
      for (const [bx, phase, light] of blades) {
        const cx = bx + Math.sin(y * 0.3 + phase) * 2;
        if (Math.abs(x - cx) < 1.2) return light > 0.85 ? hex('#7cc46a') : hex('#4f9a4f');
        if (Math.abs(x - cx) < 1.8) return hex('#36703e');
      }
      return (x + y) % 7 === 0 ? hex('#2b6157') : hex('#22524a');
    };
  },
  /** Critter: a tide pool in a rock rim, with a starfish. */
  tidePool(seed) {
    const n = valueNoise(seed, 6);
    const c = (TILE - 1) / 2;
    return (x, y) => {
      const d = Math.hypot(x - c, y - c) + (n(x, y) - 0.5) * 4;
      if (d > 12) return n(x, y) > 0.5 ? hex('#8a867c') : hex('#6f6c63');
      if (d > 11) return hex('#4d4a44');
      const star = STARFISH[y - 17]?.[x - 19];
      if (star === 'X') return hex('#f08a3c');
      if (star === 'o') return hex('#c25e1f');
      return n(x, y) > 0.55 ? hex('#5cc0cf') : hex('#46aabd');
    };
  },
};

// --- assemble the sheet ---------------------------------------------------------

const png = new PNG({ width: TILE * TILES.length, height: TILE });
TILES.forEach((name, i) => {
  const seed = 1000 + i * 97;
  const inside = blobMask(seed);
  const paint = PAINTERS[name](seed);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      const [r, g, b] = edge ? darken(paint(x, y), 0.55) : paint(x, y);
      const o = (y * png.width + i * TILE + x) * 4;
      png.data[o] = r;
      png.data[o + 1] = g;
      png.data[o + 2] = b;
      png.data[o + 3] = 255;
    }
  }
});
writeFileSync(OUT, PNG.sync.write(png));
console.log(`Wrote ${OUT} (${TILES.length} tiles of ${TILE}x${TILE}).`);
