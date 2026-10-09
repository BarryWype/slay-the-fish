import { describe, expect, it } from 'vitest';
import { CHOKE_COLUMNS, encounterType, generateMap, MAP_COLUMNS, MAP_LANES, MAX_EVENTS_IN_A_ROW, FIRST_EVENT_COLUMN, tierForColumn, type GameMap } from '../src/engine';
import { gameData } from '../src/content';
import { testData } from './fixtures';

const mapFor = (seed: number): GameMap => generateMap({ rng: seed }, testData);
const SEEDS = Array.from({ length: 50 }, (_, i) => i * 7919 + 1);

describe('map generation', () => {
  it('has 21 columns with a single starting node and no encounter at the start', () => {
    const map = mapFor(1);
    expect(map.columns).toHaveLength(MAP_COLUMNS);
    expect(map.columns[0]).toHaveLength(1);
    expect(map.columns[0][0]).toMatchObject({ id: '0-0', creatureType: null });
  });

  it.each(SEEDS)('seed %i: the last column is a single boss fight from the deepest tier', (seed) => {
    const tiered = {
      ...testData,
      encounters: [1, 2, 3].map((tier) => ({ id: `t${tier}`, name: `T${tier}`, tier, enemies: ['dummy'] })),
    };
    const { columns } = generateMap({ rng: seed }, tiered);
    expect(columns[MAP_COLUMNS - 1]).toHaveLength(1);
    expect(columns[MAP_COLUMNS - 1][0]).toMatchObject({ tier: 3, creatureType: 'fish' });
  });

  it.each(SEEDS)('seed %i: every event has a way forward and is reachable', (seed) => {
    const { columns } = mapFor(seed);
    columns.forEach((column, c) => {
      expect(column.length).toBeGreaterThanOrEqual(1);
      expect(column.length).toBeLessThanOrEqual(MAP_LANES);
      for (const node of column) {
        if (c < columns.length - 1) {
          expect(node.next.length).toBeGreaterThanOrEqual(1);
          // A grid step reaches at most 3 lanes; single events fan out to the whole next column.
          if (column.length > 1) expect(node.next.length).toBeLessThanOrEqual(3);
          // Destinations are always in the next column.
          for (const id of node.next) expect(id.startsWith(`${c + 1}-`)).toBe(true);
        } else {
          expect(node.next).toEqual([]);
        }
        if (c > 0) {
          const incoming = columns[c - 1].filter((n) => n.next.includes(node.id));
          expect(incoming.length).toBeGreaterThanOrEqual(1);
          expect(testData.encounters.some((e) => encounterType(e, testData) === node.creatureType)).toBe(true);
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

  it('deeper columns are higher tiers, showing only creature types found at that depth', () => {
    const tiered = {
      ...testData,
      encounters: [
        { id: 't1', name: 'T1', tier: 1, enemies: ['dummy'] },
        { id: 't2', name: 'T2', tier: 2, enemies: ['cycler'] },
        { id: 't3', name: 'T3', tier: 3, enemies: ['dummy'] },
      ],
    };
    for (const seed of SEEDS.slice(0, 10)) {
      const { columns } = generateMap({ rng: seed }, tiered);
      for (const node of columns.slice(1).flat()) expect(node.creatureType).toBe(node.tier === 2 ? 'shell' : 'fish');
      const tiers = columns.slice(1).map((col) => col.map((n) => n.tier));
      tiers.forEach((col, i) => col.forEach((t) => expect(t).toBe(tierForColumn(i + 1, MAP_COLUMNS, 3))));
      expect(tiers.map((col) => col[0])).toEqual([...Array(7).fill(1), ...Array(7).fill(2), ...Array(6).fill(3)]);
    }
  });

  it('the number of choices depends on the seed', () => {
    const choiceCounts = new Set(SEEDS.flatMap((s) => mapFor(s).columns.flat().map((n) => n.next.length)));
    expect([...choiceCounts].filter((n) => n > 0 && n <= 3).sort()).toEqual([1, 2, 3]);
  });

  it('start, choke columns and boss are single events; the rest fill the lanes', () => {
    for (const seed of SEEDS) {
      const { columns } = mapFor(seed);
      columns.forEach((column, c) => {
        const single = c === 0 || c === MAP_COLUMNS - 1 || CHOKE_COLUMNS.includes(c);
        if (single) expect(column, `seed ${seed} column ${c}`).toHaveLength(1);
        // The first grid column after a single one always branches.
        if (c > 0 && !single && columns[c - 1].length === 1) expect(column.length).toBeGreaterThanOrEqual(2);
        for (const node of column) expect(node.lane).toBeGreaterThanOrEqual(0);
        for (const node of column) expect(node.lane).toBeLessThan(MAP_LANES);
        // Rows follow the lanes top to bottom, so row order is lane order.
        expect(column.map((n) => n.lane)).toEqual([...column.map((n) => n.lane)].sort((a, b) => a - b));
      });
    }
  });

  it('most columns are 3+ events wide, and most events have a single way forward', () => {
    const columns = SEEDS.flatMap((s) => mapFor(s).columns).filter((c) => c.length > 1);
    expect(columns.filter((c) => c.length >= 3).length / columns.length).toBeGreaterThan(0.75);
    const nodes = columns.flat().filter((n) => n.column < MAP_COLUMNS - 2 && !CHOKE_COLUMNS.includes(n.column + 1));
    expect(nodes.filter((n) => n.next.length === 1).length / nodes.length).toBeGreaterThan(0.5);
  });

  it('a grid step moves at most one lane', () => {
    for (const seed of SEEDS) {
      const { columns } = mapFor(seed);
      for (const node of columns.flat()) {
        if (columns[node.column].length === 1) continue;
        for (const id of node.next) {
          const target = columns[node.column + 1].find((n) => n.id === id)!;
          if (columns[target.column].length > 1) expect(Math.abs(target.lane - node.lane)).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('about 30% of nodes are events, never 3 in a row on any route; start and boss are not', () => {
    let events = 0;
    let nodes = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const { columns } = generateMap({ rng: seed }, gameData);
      expect(columns[0][0].kind).toBe('start');
      expect(columns[MAP_COLUMNS - 1][0].kind).toBe('fight');
      const streak = new Map<string, number>();
      for (const column of columns) {
        for (const node of column) {
          const before = Math.max(0, ...columns.flat().filter((n) => n.next.includes(node.id)).map((n) => streak.get(n.id) ?? 0));
          streak.set(node.id, node.kind === 'event' ? before + 1 : 0);
          expect(streak.get(node.id), `seed ${seed} ${node.id}`).toBeLessThanOrEqual(MAX_EVENTS_IN_A_ROW);
          if (node.kind === 'event') expect(node.creatureType).toBeNull();
          if (node.kind === 'event') expect(node.column).toBeGreaterThanOrEqual(FIRST_EVENT_COLUMN);
        }
      }
      const middle = columns.slice(1, -1).flat();
      nodes += middle.length;
      events += middle.filter((n) => n.kind === 'event').length;
    }
    expect(events / nodes).toBeGreaterThan(0.27);
    expect(events / nodes).toBeLessThan(0.33);
  });

  it('content without events makes a map of fights only', () => {
    expect(mapFor(1).columns.slice(1).flat().every((n) => n.kind === 'fight')).toBe(true);
  });
});
