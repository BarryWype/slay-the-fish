import { describe, expect, it } from 'vitest';
import { generateMap, MAP_COLUMNS, type GameMap } from '../src/engine';
import { testData } from './fixtures';

const mapFor = (seed: number): GameMap => generateMap({ rng: seed }, testData);
const SEEDS = Array.from({ length: 50 }, (_, i) => i * 7919 + 1);

describe('map generation', () => {
  it('has 10 columns with a single starting node and no encounter at the start', () => {
    const map = mapFor(1);
    expect(map.columns).toHaveLength(MAP_COLUMNS);
    expect(map.columns[0]).toHaveLength(1);
    expect(map.columns[0][0]).toMatchObject({ id: '0-0', encounterId: null });
  });

  it.each(SEEDS)('seed %i: every node offers 1–3 destinations and is reachable', (seed) => {
    const { columns } = mapFor(seed);
    columns.forEach((column, c) => {
      expect(column.length).toBeGreaterThanOrEqual(1);
      expect(column.length).toBeLessThanOrEqual(3);
      for (const node of column) {
        if (c < columns.length - 1) {
          expect(node.next.length).toBeGreaterThanOrEqual(1);
          expect(node.next.length).toBeLessThanOrEqual(3);
          // Destinations are always in the next column.
          for (const id of node.next) expect(id.startsWith(`${c + 1}-`)).toBe(true);
        } else {
          expect(node.next).toEqual([]);
        }
        if (c > 0) {
          const incoming = columns[c - 1].filter((n) => n.next.includes(node.id));
          expect(incoming.length).toBeGreaterThanOrEqual(1);
          expect(testData.encounters.some((e) => e.id === node.encounterId)).toBe(true);
        }
      }
    });
  });

  it.each(SEEDS)('seed %i: paths never cross', (seed) => {
    const { columns } = mapFor(seed);
    for (let c = 0; c < columns.length - 1; c++) {
      const edges = columns[c].flatMap((n) => n.next.map((id) => [n.row, Number(id.split('-')[1])]));
      for (const [a1, b1] of edges) {
        for (const [a2, b2] of edges) {
          if (a1 < a2) expect(b1).toBeLessThanOrEqual(b2);
        }
      }
    }
  });

  it('is deterministic per seed, and varies between seeds', () => {
    expect(mapFor(42)).toEqual(mapFor(42));
    const shapes = new Set(SEEDS.map((s) => mapFor(s).columns.map((c) => c.length).join('')));
    expect(shapes.size).toBeGreaterThan(1);
  });

  it('deeper columns use higher-tier encounters', () => {
    const tiered = {
      ...testData,
      encounters: [1, 2, 3].map((tier) => ({ id: `t${tier}`, name: `T${tier}`, tier, enemies: ['dummy'] })),
    };
    for (const seed of SEEDS.slice(0, 10)) {
      const { columns } = generateMap({ rng: seed }, tiered);
      const tiers = columns.slice(1).map((col) => col.map((n) => Number(n.encounterId!.slice(1))));
      // 9 fight columns split into 3 bands: 1,1,1,2,2,2,3,3,3
      tiers.forEach((col, i) => col.forEach((t) => expect(t).toBe(1 + Math.floor(i / 3))));
    }
  });

  it('the number of choices depends on the seed', () => {
    const choiceCounts = new Set(SEEDS.flatMap((s) => mapFor(s).columns.flat().map((n) => n.next.length)));
    expect([...choiceCounts].filter((n) => n > 0).sort()).toEqual([1, 2, 3]);
  });
});
