import { nextFloat, nextInt, shuffleInPlace, type RngHolder } from './rng';
import type { EncounterDef, GameData } from './types';

/** Columns including the starting point. Travel goes left (column 0) to right. */
export const MAP_COLUMNS = 21;
/** Fixed horizontal lanes events sit in. Single-event columns use the middle one. */
export const MAP_LANES = 5;
/** Paths traced from start to boss: more paths, more events and more ways to branch. */
export const MAP_PATHS = 6;
/** Columns every route goes through (besides the start and the boss), as a single node. */
export const CHOKE_COLUMNS: number[] = [];
/**
 * "Harbour" columns of 3–4 fixed nodes: one "finish the session" node, a dead end where the
 * run ends successfully (the bucket comes home), and shops. Every route can reach a shop.
 * Only when the content has shop items.
 */
export const SHOP_COLUMNS = [10];
const HARBOUR_SIZE: [number, number] = [3, 4];
/**
 * Chance a fight from `FIRST_EVENT_COLUMN` on rolls an event instead. Columns before that and
 * rolls refused by `MAX_EVENTS_IN_A_ROW` stay fights, so overall about 30% of nodes are events.
 */
export const EVENT_CHANCE = 0.39;
/** No route meets more events than this in a row. */
export const MAX_EVENTS_IN_A_ROW = 2;
/** The first map column that can hold an event; earlier ones are all fights. */
export const FIRST_EVENT_COLUMN = 3;

export type MapNodeKind = 'start' | 'fight' | 'event' | 'shop' | 'leave';

export interface MapNode {
  /** `${column}-${row}` */
  id: string;
  column: number;
  /** Position within its column, top to bottom. */
  row: number;
  /** Which of the `MAP_LANES` horizontal lanes it sits in (0 = top). */
  lane: number;
  kind: MapNodeKind;
  /** Depth tier of the node (0 for the starting point). */
  tier: number;
  /** Creature type met at a fight; the encounter is drawn from it on arrival. `null` for every other kind. */
  creatureType: string | null;
  /** Ids of the nodes reachable from here, in the next column. */
  next: string[];
}

export interface GameMap {
  columns: MapNode[][];
}

/**
 * Built like Slay the Spire's map. The start, the boss and every choke column
 * hold a single node; between them, `MAP_PATHS` paths walk across a grid of
 * `MAP_LANES` lanes, each step staying in its lane or moving one up or down,
 * never crossing a link already drawn. Events are wherever a path passes and
 * links are the paths' steps, so routes branch and merge naturally, every event
 * is reachable and has a way forward, and links never cross. Harbour columns
 * (`SHOP_COLUMNS`) are fixed too, linked to their neighbours by lane (`linkByLane`),
 * and events are then placed on top (`placeEvents`).
 */
export function generateMap(holder: RngHolder, data: GameData, columnCount = MAP_COLUMNS): GameMap {
  const middle = Math.floor(MAP_LANES / 2);
  const single = (column: number) => column === 0 || column === columnCount - 1 || CHOKE_COLUMNS.includes(column);
  const harbours = data.shop.length ? SHOP_COLUMNS : [];
  const fixed = (column: number) => single(column) || harbours.includes(column);
  // lanes[column] = occupied lanes; edges[column] = "from>to" lane links into the next column.
  const lanes: Set<number>[] = Array.from({ length: columnCount }, (_, c) => {
    if (single(c)) return new Set([middle]);
    if (!harbours.includes(c)) return new Set<number>();
    const allLanes = shuffleInPlace(holder, Array.from({ length: MAP_LANES }, (_, l) => l));
    return new Set(allLanes.slice(0, nextInt(holder, ...HARBOUR_SIZE)));
  });
  const edges: Set<string>[] = Array.from({ length: columnCount }, () => new Set());

  // Trace the paths through each stretch of grid columns between two fixed ones.
  for (let first = 1; first < columnCount - 1; ) {
    if (fixed(first)) {
      first++;
      continue;
    }
    let last = first;
    while (!fixed(last + 1)) last++;
    for (let path = 0; path < MAP_PATHS; path++) {
      // The first two paths start in different lanes so a stretch always branches.
      let lane = nextInt(holder, 0, MAP_LANES - 1);
      while (path === 1 && lanes[first].size === 1 && lanes[first].has(lane)) lane = nextInt(holder, 0, MAP_LANES - 1);
      lanes[first].add(lane);
      for (let column = first; column < last; column++) {
        const options = shuffleInPlace(holder, [lane - 1, lane, lane + 1].filter((l) => l >= 0 && l < MAP_LANES));
        // Going straight never crosses a neighbour's link, so there is always an option.
        const to = options.find((l) => !crosses(edges[column], lane, l))!;
        edges[column].add(`${lane}>${to}`);
        lanes[column + 1].add(to);
        lane = to;
      }
    }
    first = last + 1;
  }

  const maxTier = Math.max(...data.encounters.map(encounterTier));
  const columns: MapNode[][] = lanes.map((occupied, column) => {
    const tier = tierForColumn(column, columnCount, maxTier);
    const types = typesAtTier(tier, data);
    return [...occupied]
      .sort((a, b) => a - b)
      .map((lane, row) => ({
        id: `${column}-${row}`,
        column,
        row,
        lane,
        kind: (column === 0 ? 'start' : 'fight') as MapNodeKind,
        tier,
        creatureType: column === 0 ? null : types[nextInt(holder, 0, types.length - 1)],
        next: [],
      }));
  });
  for (const column of harbours) {
    const nodes = columns[column];
    for (const node of nodes) Object.assign(node, { kind: 'shop', creatureType: null });
    nodes[nextInt(holder, 0, nodes.length - 1)].kind = 'leave';
  }
  for (let column = 0; column < columnCount - 1; column++) {
    const [from, to] = [columns[column], columns[column + 1]];
    if (single(column) || single(column + 1)) {
      // Into or out of a single-node column, everything links to everything.
      for (const node of from) node.next = to.map((t) => t.id);
    } else if (harbours.includes(column) || harbours.includes(column + 1)) {
      // The finish node is a dead end; only shops lead on.
      linkByLane(from.filter((n) => n.kind !== 'leave'), to);
    } else {
      for (const node of from) node.next = to.filter((t) => edges[column].has(`${node.lane}>${t.lane}`)).map((t) => t.id);
    }
  }
  if (Object.keys(data.events).length) placeEvents(holder, columns);
  return { columns };
}

/**
 * Links each `from` node to the `to` nodes in its lane or the lanes next to it, then makes
 * sure every `from` node has somewhere to go besides a finish node, and every `to` node is
 * reachable (each time picking the closest lane).
 */
function linkByLane(from: MapNode[], to: MapNode[]): void {
  const distance = (a: MapNode, b: MapNode) => Math.abs(a.lane - b.lane);
  const closest = (node: MapNode, pool: MapNode[]) => pool.reduce((best, n) => (distance(node, n) < distance(node, best) ? n : best));
  const links = new Map(from.map((f) => [f, to.filter((t) => distance(f, t) <= 1)]));
  const onward = to.filter((t) => t.kind !== 'leave');
  for (const [f, targets] of links) if (!targets.some((t) => t.kind !== 'leave')) targets.push(closest(f, onward));
  for (const t of to) if (![...links.values()].some((targets) => targets.includes(t))) links.get(closest(t, from))!.push(t);
  for (const [f, targets] of links) f.next = [...new Set(targets)].sort((a, b) => a.row - b.row).map((t) => t.id);
}

/**
 * Turns about `EVENT_CHANCE` of the fights from `FIRST_EVENT_COLUMN` on into events,
 * column by column, so that no route meets more than `MAX_EVENTS_IN_A_ROW` in a row.
 * The boss stays a fight.
 */
function placeEvents(holder: RngHolder, columns: MapNode[][]): void {
  // Longest run of events ending at each node, over every route leading to it.
  const streak = new Map<string, number>();
  for (let column = FIRST_EVENT_COLUMN; column < columns.length - 1; column++) {
    for (const node of columns[column]) {
      if (node.kind !== 'fight') continue;
      const before = Math.max(0, ...columns[column - 1].filter((n) => n.next.includes(node.id)).map((n) => streak.get(n.id) ?? 0));
      if (before < MAX_EVENTS_IN_A_ROW && nextFloat(holder) < EVENT_CHANCE) {
        node.kind = 'event';
        node.creatureType = null;
        streak.set(node.id, before + 1);
      }
    }
  }
}

/** Would a link from lane `a` to lane `b` cross one of `edges` ("from>to" lanes)? */
function crosses(edges: Set<string>, a: number, b: number): boolean {
  for (const edge of edges) {
    const [a2, b2] = edge.split('>').map(Number);
    if ((a < a2 && b > b2) || (a > a2 && b < b2)) return true;
  }
  return false;
}

export function encounterTier(encounter: EncounterDef): number {
  return encounter.tier ?? 1;
}

/** Creature types with a fight at this depth tier (all of them if none); each is equally likely on the map. */
export function typesAtTier(tier: number, data: GameData): string[] {
  const tierPool = data.encounters.filter((e) => encounterTier(e) === tier);
  return [...new Set((tierPool.length ? tierPool : data.encounters).map((e) => encounterType(e, data)))];
}

/** An encounter's creature type: its first enemy's. */
export function encounterType(encounter: EncounterDef, data: GameData): string {
  return data.enemies[encounter.enemies[0]]?.tags?.[0] ?? '';
}

/** Encounters a map node can lead to: its type at its tier, else its type at any tier, else anything. */
export function encountersFor(node: MapNode, data: GameData): EncounterDef[] {
  const ofType = data.encounters.filter((e) => encounterType(e, data) === node.creatureType);
  const atTier = ofType.filter((e) => encounterTier(e) === node.tier);
  return atTier.length ? atTier : ofType.length ? ofType : data.encounters;
}

/** Split the fight columns (1..columnCount-1) into `maxTier` equal bands, shallow to deep. */
export function tierForColumn(column: number, columnCount: number, maxTier: number): number {
  if (column === 0) return 0;
  return 1 + Math.floor(((column - 1) * maxTier) / (columnCount - 1));
}

export function findNode(map: GameMap, id: string): MapNode | undefined {
  for (const column of map.columns) {
    const node = column.find((n) => n.id === id);
    if (node) return node;
  }
  return undefined;
}
