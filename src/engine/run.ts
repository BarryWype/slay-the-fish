import { createCombat } from './combat';
import { instantSaleValue } from './equipment';
import { encountersFor, findNode, generateMap, typesAtTier, type GameMap, type MapNode } from './map';
import { nextFloat, nextInt, shuffleInPlace } from './rng';
import type { CombatState, GameData } from './types';
import { clone } from './util';

/** Everything that persists between fights. */
export interface RunState {
  seed: number;
  rng: number;
  /** Starting build id. */
  build: string;
  hp: number;
  maxHp: number;
  deck: string[];
  floor: number;
  map: GameMap;
  /** Id of the map node the player is standing on. */
  position: string;
  /** Node ids travelled through, starting point included. */
  visited: string[];
  /**
   * The bucket: enemy definition ids of the creatures caught this run and not sold, in order
   * (duplicates allowed). It only reaches the home aquarium if the run is won (`bringCatchHome`).
   */
  bucket: string[];
  coins: number;
  /** Equipment ids carried this run. */
  equipment: string[];
}

export const CARD_REWARD_COUNT = 3;
/** Chance that an event turns out to be an ordinary fight. */
export const EVENT_FIGHT_CHANCE = 0.1;
export const START_NODE_ID = '0-0';

/** Start a run with the chosen build's starter deck. The map depends only on the seed. */
export function createRun(seed: number, data: GameData, buildId: string, maxHp = data.character.maxHp): RunState {
  const build = data.builds[buildId];
  if (!build) throw new Error(`Unknown build "${buildId}"`);
  const run: RunState = {
    seed,
    rng: seed | 0,
    build: buildId,
    hp: maxHp,
    maxHp,
    deck: [...build.starterDeck],
    floor: 1,
    map: { columns: [] },
    position: START_NODE_ID,
    visited: [START_NODE_ID],
    bucket: [],
    coins: 0,
    equipment: [...(build.startingEquipment ?? [])],
  };
  run.map = generateMap(run, data);
  return run;
}

/** Nodes the player can travel to next (1–3, or none at the end of the map). */
export function availableDestinations(run: RunState): MapNode[] {
  const current = findNode(run.map, run.position);
  return (current?.next ?? []).map((id) => findNode(run.map, id)!);
}

export function isMapComplete(run: RunState): boolean {
  return availableDestinations(run).length === 0;
}

/** A copy of the run standing on an adjacent node of `kind`. Throws if there's no such node. */
function moveTo(run: RunState, nodeId: string, kind: MapNode['kind']): { next: RunState; node: MapNode } {
  const node = availableDestinations(run).find((n) => n.id === nodeId);
  if (!node || node.kind !== kind) throw new Error(`Can't travel to a ${kind} at "${nodeId}" from "${run.position}".`);
  const next = clone(run);
  next.position = node.id;
  next.visited.push(node.id);
  return { next, node };
}

/** Move to an adjacent fight and start it. Throws if the node isn't a reachable fight. */
export function travelTo(run: RunState, nodeId: string, data: GameData): { run: RunState; combat: CombatState } {
  const { next, node } = moveTo(run, nodeId, 'fight');
  return { run: next, combat: startFight(next, node, data) };
}

/**
 * Start the fight at `node` (advancing `next`'s RNG): an encounter of its creature
 * type and tier, which is only decided on arrival.
 */
function startFight(next: RunState, node: MapNode, data: GameData): CombatState {
  const pool = encountersFor(node, data);
  const encounter = pool[nextInt(next, 0, pool.length - 1)];
  const combatSeed = nextInt(next, 0, 0x7fffffff);
  return createCombat(
    {
      seed: combatSeed,
      deck: next.deck,
      enemies: encounter.enemies,
      playerHp: next.hp,
      playerMaxHp: next.maxHp,
      equipment: next.equipment,
    },
    data,
  );
}

/**
 * Move to an adjacent event. With `EVENT_FIGHT_CHANCE` it's an ordinary fight against a
 * creature type found at that depth; otherwise the event is drawn among those allowed at
 * that column.
 */
export function visitEvent(
  run: RunState,
  nodeId: string,
  data: GameData,
): { run: RunState; eventId: string; combat?: undefined } | { run: RunState; combat: CombatState; eventId?: undefined } {
  const { next, node } = moveTo(run, nodeId, 'event');
  if (nextFloat(next) < EVENT_FIGHT_CHANCE) {
    const types = typesAtTier(node.tier, data);
    const fightNode = { ...node, creatureType: types[nextInt(next, 0, types.length - 1)] };
    return { run: next, combat: startFight(next, fightNode, data) };
  }
  const ids = Object.values(data.events)
    .filter((e) => node.column >= (e.minColumn ?? 0))
    .map((e) => e.id);
  if (!ids.length) throw new Error(`No event can happen at column ${node.column}.`);
  return { run: next, eventId: ids[nextInt(next, 0, ids.length - 1)] };
}

/** Move to an adjacent "finish the session" node: a dead end, the run ends there as a success (see `bringCatchHome`). */
export function visitLeave(run: RunState, nodeId: string): RunState {
  return moveTo(run, nodeId, 'leave').next;
}

/** Move to an adjacent shop. */
export function visitShop(run: RunState, nodeId: string): RunState {
  return moveTo(run, nodeId, 'shop').next;
}

/**
 * Carry the fight's outcome into the run: HP, floor, and (on a win) the creatures
 * captured, which go into the bucket unless equipment sells them on the spot.
 */
export function finishCombat(run: RunState, combat: CombatState, data: GameData): RunState {
  const next = { ...clone(run), hp: Math.max(0, combat.player.hp) };
  if (combat.phase !== 'won') return next;
  next.floor++;
  for (const enemy of combat.enemies) {
    const sale = instantSaleValue(enemy.defId, run.equipment, data);
    if (sale === null) next.bucket.push(enemy.defId);
    else next.coins += sale;
  }
  return next;
}

/** Sell the bucket's creature at index `slot` for its sell value. */
export function sellCreature(run: RunState, slot: number, data: GameData): RunState {
  const id = run.bucket[slot];
  if (id === undefined) throw new Error(`Nothing captured at slot ${slot}`);
  return {
    ...clone(run),
    bucket: run.bucket.filter((_, i) => i !== slot),
    coins: run.coins + (data.enemies[id]?.sellValue ?? 0),
  };
}

/**
 * The home aquarium after a successful run (boss beaten, or the session finished at a leave node):
 * everything still in the bucket joins it. A lost or abandoned run never calls this, so its
 * bucket is lost.
 */
export function bringCatchHome(home: readonly string[], run: RunState): string[] {
  return [...home, ...run.bucket];
}

/** Offer `count` distinct non-starter cards: shared ones plus those of the run's build. */
export function rollCardRewards(
  run: RunState,
  data: GameData,
  count = CARD_REWARD_COUNT,
): { run: RunState; choices: string[] } {
  const next = clone(run);
  const pool = Object.values(data.cards)
    .filter((c) => c.rarity !== 'starter' && (c.build === undefined || c.build === run.build))
    .map((c) => c.id);
  return { run: next, choices: shuffleInPlace(next, pool).slice(0, count) };
}

export function addCardToDeck(run: RunState, cardId: string, data: GameData): RunState {
  if (!data.cards[cardId]) throw new Error(`Unknown card "${cardId}"`);
  return { ...clone(run), deck: [...run.deck, cardId] };
}
