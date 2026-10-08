import { describe, expect, it } from 'vitest';
import { gameData } from '../src/content';
import {
  applyAction,
  createCombat,
  isCardPlayable,
  nextFloat,
  replayCombat,
  type CombatAction,
  type CombatConfig,
  type CombatState,
} from '../src/engine';

const config = (seed: number): CombatConfig => ({
  seed,
  deck: gameData.starterDeck,
  enemies: ['pike'],
  playerHp: 80,
  playerMaxHp: 80,
});

/** A naive bot: play the first playable card on the first living enemy, else end turn. */
function autoplay(seed: number): { actions: CombatAction[]; final: CombatState } {
  let state = createCombat(config(seed), gameData);
  const actions: CombatAction[] = [];
  for (let i = 0; i < 500 && state.phase === 'playerTurn'; i++) {
    const card = state.piles.hand.find((c) => isCardPlayable(state, c.uid, gameData));
    const target = state.enemies.find((e) => e.hp > 0)!;
    const action: CombatAction = card ? { type: 'playCard', cardUid: card.uid, targetId: target.id } : { type: 'endTurn' };
    actions.push(action);
    state = applyAction(state, action, gameData);
  }
  return { actions, final: state };
}

describe('seeded RNG', () => {
  it('produces the same sequence for the same seed', () => {
    const a = { rng: 42 };
    const b = { rng: 42 };
    const seqA = Array.from({ length: 20 }, () => nextFloat(a));
    const seqB = Array.from({ length: 20 }, () => nextFloat(b));
    expect(seqA).toEqual(seqB);
    for (const v of seqA) expect(v >= 0 && v < 1).toBe(true);
  });
});

describe('determinism', () => {
  it('the same seed creates an identical combat', () => {
    expect(createCombat(config(7), gameData)).toEqual(createCombat(config(7), gameData));
  });

  it('different seeds shuffle differently', () => {
    const orders = new Set(
      [1, 2, 3, 4, 5].map((seed) =>
        createCombat(config(seed), gameData)
          .piles.draw.map((c) => c.uid)
          .join(','),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it('a whole fight can be replayed exactly from seed + actions', () => {
    for (const seed of [1, 99, 123456]) {
      const { actions, final } = autoplay(seed);
      expect(final.phase).not.toBe('playerTurn');
      expect(replayCombat(config(seed), actions, gameData)).toEqual(final);
    }
  });

  it('applyAction never mutates the state it is given', () => {
    const state = createCombat(config(3), gameData);
    const snapshot = JSON.stringify(state);
    const next = applyAction(state, { type: 'playCard', cardUid: state.piles.hand[0].uid, targetId: 'e0' }, gameData);
    applyAction(next, { type: 'endTurn' }, gameData);
    expect(JSON.stringify(state)).toBe(snapshot);
    expect(next).not.toBe(state);
  });
});
