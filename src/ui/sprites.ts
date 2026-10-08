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

/** Column/row of a 1-based index, counted left to right, top to bottom. */
export function cellOf(sheet: SpriteSheet, index: number) {
  return { column: (index - 1) % sheet.columns, row: Math.floor((index - 1) / sheet.columns) };
}
