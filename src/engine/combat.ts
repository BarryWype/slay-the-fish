import { BASE_ENERGY, PLAYER_ID, STARTING_HAND_SIZE } from './constants';
import { equipmentEffects, escapeRateReduction } from './equipment';
import { isAlive, resolveEffect } from './effects';
import { chooseIntent, executeIntent } from './intents';
import { discardHand, drawCards } from './piles';
import { nextInt, shuffleInPlace } from './rng';
import { escapeRise, tickStatuses } from './statuses';
import type { CombatAction, CombatState, GameData } from './types';
import { addLog, clone } from './util';

export interface CombatConfig {
  seed: number;
  /** Card definition ids. */
  deck: string[];
  /** Enemy definition ids. */
  enemies: string[];
  playerHp: number;
  playerMaxHp: number;
  /** Equipment ids carried into the fight. */
  equipment?: string[];
}

export function createCombat(config: CombatConfig, data: GameData): CombatState {
  const state: CombatState = {
    seed: config.seed,
    rng: config.seed | 0,
    turn: 0,
    phase: 'playerTurn',
    player: {
      id: PLAYER_ID,
      name: data.character.name,
      hp: config.playerHp,
      maxHp: config.playerMaxHp,
      block: 0,
      statuses: {},
      energy: 0,
      maxEnergy: BASE_ENERGY,
    },
    enemies: [],
    piles: {
      draw: config.deck.map((defId, i) => ({ uid: `c${i}`, defId })),
      hand: [],
      discard: [],
      exhaust: [],
    },
    log: [],
  };

  config.enemies.forEach((defId, i) => {
    const def = data.enemies[defId];
    if (!def) throw new Error(`Unknown enemy "${defId}"`);
    const maxHp = nextInt(state, def.hp[0], def.hp[1]);
    state.enemies.push({
      id: `e${i}`,
      defId,
      tags: [...(def.tags ?? [])],
      name: def.name,
      hp: maxHp,
      maxHp,
      block: 0,
      statuses: { ...def.startingStatuses },
      intent: null,
      moveHistory: [],
      escape: def.escapeStart,
      escapeAt: def.escapeAt,
      escapeRate: def.escapeRate,
    });
  });

  for (const effect of equipmentEffects(config.equipment ?? [], data)) {
    if (effect.type !== 'slowEscape') continue;
    for (const enemy of state.enemies) enemy.escapeRate -= escapeRateReduction(enemy.escapeRate, effect.percent);
  }

  shuffleInPlace(state, state.piles.draw);
  for (const enemy of state.enemies) chooseIntent(state, enemy, data);
  startPlayerTurn(state);
  return state;
}

/** Returns a reason the action is illegal, or null if it can be applied. */
export function validateAction(state: CombatState, action: CombatAction, data: GameData): string | null {
  if (state.phase !== 'playerTurn') return 'The combat is over.';
  if (action.type === 'endTurn') return null;

  const card = state.piles.hand.find((c) => c.uid === action.cardUid);
  if (!card) return 'That card is not in your hand.';
  const def = data.cards[card.defId];
  if (!def) return `Unknown card "${card.defId}".`;
  if (def.cost > state.player.energy) return 'Not enough energy.';
  if (def.target === 'enemy') {
    const target = state.enemies.find((e) => e.id === action.targetId);
    if (!target || !isAlive(target)) return 'Choose a living enemy to target.';
  }
  return null;
}

/** Can this card in hand be played right now (ignoring target choice)? */
export function isCardPlayable(state: CombatState, cardUid: string, data: GameData): boolean {
  if (state.phase !== 'playerTurn') return false;
  const card = state.piles.hand.find((c) => c.uid === cardUid);
  const def = card && data.cards[card.defId];
  return !!def && def.cost <= state.player.energy;
}

/**
 * The reducer. Never mutates `state`: returns a new state, or the very same
 * object if the action is illegal (check with `validateAction` for the reason).
 */
export function applyAction(state: CombatState, action: CombatAction, data: GameData): CombatState {
  if (validateAction(state, action, data) !== null) return state;
  const next = clone(state);
  switch (action.type) {
    case 'playCard':
      playCard(next, action.cardUid, action.targetId, data);
      break;
    case 'endTurn':
      endTurn(next, data);
      break;
  }
  return next;
}

/** Rebuild a combat exactly from its config and the list of actions taken. */
export function replayCombat(config: CombatConfig, actions: CombatAction[], data: GameData): CombatState {
  return actions.reduce((state, action) => applyAction(state, action, data), createCombat(config, data));
}

// --- internals (operate on the private working copy) -----------------------

function startPlayerTurn(state: CombatState): void {
  state.turn++;
  state.player.block = 0;
  state.player.energy = state.player.maxEnergy;
  addLog(state, `— Turn ${state.turn} —`);
  drawCards(state, STARTING_HAND_SIZE);
}

function playCard(state: CombatState, cardUid: string, targetId: string | undefined, data: GameData): void {
  const index = state.piles.hand.findIndex((c) => c.uid === cardUid);
  // Remove the card first: while its effects resolve it's in no pile, so a
  // mid-effect reshuffle can't pick it up.
  const [card] = state.piles.hand.splice(index, 1);
  const def = data.cards[card.defId];
  state.player.energy -= def.cost;
  addLog(state, `${state.player.name} plays ${def.name}.`);

  const ctx = { sourceId: PLAYER_ID, targetId: def.target === 'enemy' ? targetId : undefined };
  for (const effect of def.effects) {
    resolveEffect(state, effect, ctx);
    if (checkCombatEnd(state)) break;
  }

  if (def.exhaust || def.type === 'power') state.piles.exhaust.push(card);
  else state.piles.discard.push(card);
}

function endTurn(state: CombatState, data: GameData): void {
  discardHand(state);
  tickStatuses(state.player);

  for (const enemy of state.enemies) {
    if (!isAlive(enemy)) continue;
    enemy.block = 0;
    executeIntent(state, enemy, data);
    if (checkCombatEnd(state)) return;
    if (isAlive(enemy)) enemy.escape = Math.min(enemy.escapeAt, enemy.escape + escapeRise(enemy));
    if (checkCombatEnd(state)) return;
  }
  for (const enemy of state.enemies) {
    if (!isAlive(enemy)) continue;
    tickStatuses(enemy);
    chooseIntent(state, enemy, data);
  }

  startPlayerTurn(state);
}

function checkCombatEnd(state: CombatState): boolean {
  if (state.phase !== 'playerTurn') return true;
  const escaped = state.enemies.find((e) => isAlive(e) && e.escape >= e.escapeAt);
  if (state.player.hp <= 0) {
    state.phase = 'lost';
    addLog(state, 'Defeat...');
  } else if (escaped) {
    state.phase = 'fled';
    addLog(state, `${escaped.name} got away!`);
  } else if (state.enemies.every((e) => !isAlive(e))) {
    state.phase = 'won';
    addLog(state, 'Victory!');
  }
  return state.phase !== 'playerTurn';
}
