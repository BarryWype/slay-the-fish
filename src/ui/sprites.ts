import fishesUrl from './assets/fishes.png';
import gearUrl from './assets/fishing_gear.png';
import objectsUrl from './assets/objects.png';

export interface SpriteSheet {
  url: string;
  columns: number;
  rows: number;
  /** Size of one cell in source pixels. */
  cell: number;
}

/** Sheets that content can reference by name (`sprite: { sheet, index }`). */
export const SHEETS: Record<string, SpriteSheet> = {
  fishes: { url: fishesUrl, columns: 12, rows: 12, cell: 32 },
  gear: { url: gearUrl, columns: 6, rows: 6, cell: 32 },
  objects: { url: objectsUrl, columns: 5, rows: 4, cell: 32 },
};

/**
 * Animated sheets made by `npm run sprites`: assets/creatures/NNN.png, one per
 * `fishes` sprite. 6 frames × 4 rows of 48×48 px.
 */
export const ANIMATION_FRAME = 48;
export const ANIMATION_FRAMES = 6;
export type AnimationName = 'idle' | 'attack' | 'capture' | 'flee';
export const ANIMATIONS: Record<AnimationName, { row: number; fps: number; loop: boolean }> = {
  idle: { row: 0, fps: 6, loop: true },
  attack: { row: 1, fps: 12, loop: false },
  capture: { row: 2, fps: 9, loop: false },
  flee: { row: 3, fps: 12, loop: false },
};

const creatureFiles = import.meta.glob<string>('./assets/creatures/*.png', { eager: true, query: '?url', import: 'default' });
const animatedByIndex: Record<number, string> = {};
for (const [path, url] of Object.entries(creatureFiles)) {
  const match = /(\d+)\.png$/.exec(path);
  if (match) animatedByIndex[Number(match[1])] = url;
}

/** URL of the animated sheet for a sprite, if one exists. */
export function animatedSheetFor(sprite: { sheet: string; index: number }): string | undefined {
  return sprite.sheet === 'fishes' ? animatedByIndex[sprite.index] : undefined;
}

/** Column/row of a 1-based index, counted left to right, top to bottom. */
export function cellOf(sheet: SpriteSheet, index: number) {
  return { column: (index - 1) % sheet.columns, row: Math.floor((index - 1) / sheet.columns) };
}
