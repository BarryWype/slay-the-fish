import { nextInt, type RngHolder } from './rng';
import type { EncounterDef, GameData } from './types';

/** Columns including the starting point. Travel goes left (column 0) to right. */
export const MAP_COLUMNS = 10;
export const MAX_NODES_PER_COLUMN = 3;

export interface MapNode {
  /** `${column}-${row}` */
  id: string;
  column: number;
  row: number;
  /** The fight waiting here. `null` for the starting point. */
  encounterId: string | null;
  /** Ids of the nodes reachable from here, in the next column. */
  next: string[];
}

export interface GameMap {
  columns: MapNode[][];
}

/**
 * Column 0 is a single starting node; every other column has 1–3 nodes.
 * Each column's rows split its height into equal bands, and two nodes in
 * neighbouring columns are linked when their bands overlap. That gives every
 * node 1–3 ways forward, makes every node reachable, and paths never cross.
 */
export function generateMap(holder: RngHolder, data: GameData, columnCount = MAP_COLUMNS): GameMap {
  const maxTier = Math.max(...data.encounters.map(encounterTier));
  const columns: MapNode[][] = [];
  for (let column = 0; column < columnCount; column++) {
    const size = column === 0 ? 1 : nextInt(holder, 1, MAX_NODES_PER_COLUMN);
    const tier = tierForColumn(column, columnCount, maxTier);
    const tierPool = data.encounters.filter((e) => encounterTier(e) === tier);
    const pool = tierPool.length ? tierPool : data.encounters;
    columns.push(
      Array.from({ length: size }, (_, row) => ({
        id: `${column}-${row}`,
        column,
        row,
        encounterId: column === 0 ? null : pool[nextInt(holder, 0, pool.length - 1)].id,
        next: [],
      })),
    );
  }
  for (let column = 0; column < columnCount - 1; column++) {
    const from = columns[column];
    const to = columns[column + 1];
    for (const node of from) {
      node.next = to.filter((t) => bandsOverlap(node.row, from.length, t.row, to.length)).map((t) => t.id);
    }
  }
  return { columns };
}

function encounterTier(encounter: EncounterDef): number {
  return encounter.tier ?? 1;
}

/** Split the fight columns (1..columnCount-1) into `maxTier` equal bands, shallow to deep. */
export function tierForColumn(column: number, columnCount: number, maxTier: number): number {
  if (column === 0) return 0;
  return 1 + Math.floor(((column - 1) * maxTier) / (columnCount - 1));
}

/** Do bands [rowA/sizeA, (rowA+1)/sizeA] and [rowB/sizeB, (rowB+1)/sizeB] overlap (by more than a point)? */
function bandsOverlap(rowA: number, sizeA: number, rowB: number, sizeB: number): boolean {
  return rowA * sizeB < (rowB + 1) * sizeA && rowB * sizeA < (rowA + 1) * sizeB;
}

export function findNode(map: GameMap, id: string): MapNode | undefined {
  for (const column of map.columns) {
    const node = column.find((n) => n.id === id);
    if (node) return node;
  }
  return undefined;
}
