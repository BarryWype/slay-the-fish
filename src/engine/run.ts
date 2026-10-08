import { createCombat } from './combat';
import { findNode, generateMap, type GameMap, type MapNode } from './map';
import { nextInt, shuffleInPlace } from './rng';
import type { CombatState, GameData } from './types';
import { clone } from './util';

/** Everything that persists between fights. */
export interface RunState {
  seed: number;
  rng: number;
  hp: number;
  maxHp: number;
  deck: string[];
  floor: number;
  map: GameMap;
  /** Id of the map node the player is standing on. */
  position: string;
  /** Node ids travelled through, starting point included. */
  visited: string[];
  /** Enemy definition ids of every creature beaten this run, in order (duplicates allowed). */
  captured: string[];
}

export const CARD_REWARD_COUNT = 3;
export const START_NODE_ID = '0-0';

export function createRun(seed: number, data: GameData, maxHp = data.character.maxHp): RunState {
  const run: RunState = {
    seed,
    rng: seed | 0,
    hp: maxHp,
    maxHp,
    deck: [...data.starterDeck],
    floor: 1,
    map: { columns: [] },
    position: START_NODE_ID,
    visited: [START_NODE_ID],
    captured: [],
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

/** Move to an adjacent node and start its fight. Throws if the node isn't reachable. */
export function travelTo(run: RunState, nodeId: string, data: GameData): { run: RunState; combat: CombatState } {
  const node = availableDestinations(run).find((n) => n.id === nodeId);
  if (!node?.encounterId) throw new Error(`Can't travel to "${nodeId}" from "${run.position}".`);
  const encounter = data.encounters.find((e) => e.id === node.encounterId);
  if (!encounter) throw new Error(`Unknown encounter "${node.encounterId}"`);

  const next = clone(run);
  next.position = node.id;
  next.visited.push(node.id);
  const combatSeed = nextInt(next, 0, 0x7fffffff);
  const combat = createCombat(
    { seed: combatSeed, deck: next.deck, enemies: encounter.enemies, playerHp: next.hp, playerMaxHp: next.maxHp },
    data,
  );
  return { run: next, combat };
}

/** Carry the fight's outcome into the run: HP, floor, and (on a win) the creatures captured. */
export function finishCombat(run: RunState, combat: CombatState): RunState {
  const won = combat.phase === 'won';
  return {
    ...clone(run),
    hp: Math.max(0, combat.player.hp),
    floor: won ? run.floor + 1 : run.floor,
    captured: won ? [...run.captured, ...combat.enemies.map((e) => e.defId)] : [...run.captured],
  };
}

/** Offer `count` distinct non-starter cards. */
export function rollCardRewards(
  run: RunState,
  data: GameData,
  count = CARD_REWARD_COUNT,
): { run: RunState; choices: string[] } {
  const next = clone(run);
  const pool = Object.values(data.cards)
    .filter((c) => c.rarity !== 'starter')
    .map((c) => c.id);
  return { run: next, choices: shuffleInPlace(next, pool).slice(0, count) };
}

export function addCardToDeck(run: RunState, cardId: string, data: GameData): RunState {
  if (!data.cards[cardId]) throw new Error(`Unknown card "${cardId}"`);
  return { ...clone(run), deck: [...run.deck, cardId] };
}
