import { applyAction, buildGameData, createCombat, type CombatState } from '../src/engine';

/**
 * Test-only content with fixed numbers, so engine tests don't break when a
 * designer rebalances the real cards.
 */
export const testData = buildGameData({
  character: { name: 'Tester', maxHp: 80, home: { name: 'Home' } },
  cards: [
    { id: 'strike', name: 'Strike', type: 'attack', rarity: 'starter', cost: 1, target: 'enemy', effects: [{ type: 'dealDamage', amount: 6 }] },
    { id: 'defend', name: 'Defend', type: 'skill', rarity: 'starter', cost: 1, target: 'none', effects: [{ type: 'gainBlock', amount: 5 }] },
    {
      id: 'bash', name: 'Bash', type: 'attack', rarity: 'starter', cost: 2, target: 'enemy',
      effects: [{ type: 'dealDamage', amount: 8 }, { type: 'applyStatus', status: 'vulnerable', amount: 2 }],
    },
    { id: 'twin', name: 'Twin', type: 'attack', rarity: 'common', cost: 1, target: 'enemy', effects: [{ type: 'dealDamage', amount: 5, hits: 2 }] },
    { id: 'flex', name: 'Flex', type: 'power', rarity: 'rare', cost: 1, target: 'none', effects: [{ type: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
    { id: 'weaken', name: 'Weaken', type: 'skill', rarity: 'common', cost: 0, target: 'enemy', effects: [{ type: 'applyStatus', status: 'weak', amount: 2 }] },
    { id: 'ponder', name: 'Ponder', type: 'skill', rarity: 'common', cost: 0, target: 'none', effects: [{ type: 'drawCards', amount: 2 }] },
    { id: 'adrenaline', name: 'Adrenaline', type: 'skill', rarity: 'uncommon', cost: 0, target: 'none', exhaust: true, effects: [{ type: 'gainEnergy', amount: 1 }] },
    { id: 'heavy', name: 'Heavy', type: 'attack', rarity: 'common', cost: 3, target: 'enemy', effects: [{ type: 'dealDamage', amount: 20 }] },
    { id: 'calm', name: 'Calm', type: 'skill', rarity: 'common', cost: 0, target: 'enemy', effects: [{ type: 'changeEscape', amount: -10 }] },
    { id: 'spook', name: 'Spook', type: 'skill', rarity: 'common', cost: 0, target: 'enemy', effects: [{ type: 'changeEscape', amount: 10 }] },
    { id: 'pin', name: 'Pin', type: 'skill', rarity: 'common', cost: 0, target: 'enemy', effects: [{ type: 'changeEscapeRate', amount: -3 }] },
    { id: 'snare', name: 'Snare', type: 'skill', rarity: 'common', cost: 0, target: 'enemy', effects: [{ type: 'applyStatus', status: 'snared', amount: 1 }] },
    { id: 'lure', name: 'Lure', type: 'skill', rarity: 'common', cost: 0, target: 'none', build: 'angler', effects: [{ type: 'drawCards', amount: 1 }] },
    {
      id: 'hook', name: 'Hook', type: 'attack', rarity: 'starter', cost: 1, target: 'enemy',
      effects: [{ type: 'dealDamage', amount: 5, hits: 2, bonus: { against: ['fish'], amount: 4 } }],
    },
  ],
  enemies: [
    {
      id: 'dummy', name: 'Dummy', hp: [100, 100], sellValue: 5, escapeAt: 1000, escapeStart: 4, escapeRate: 1, tags: ['fish'],
      moves: [{ id: 'hit', name: 'Hit', effects: [{ type: 'dealDamage', amount: 10 }] }],
      pattern: { type: 'sequence', moves: ['hit'] },
    },
    {
      id: 'cycler', name: 'Cycler', hp: [20, 30], escapeAt: 1000, escapeStart: 4, escapeRate: 1, tags: ['shell'],
      moves: [
        { id: 'a', name: 'A', effects: [{ type: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
        { id: 'b', name: 'B', effects: [{ type: 'gainBlock', amount: 5 }] },
        { id: 'c', name: 'C', effects: [{ type: 'dealDamage', amount: 3 }] },
      ],
      pattern: { type: 'sequence', moves: ['a', 'b', 'c'], loopFrom: 1 },
    },
    {
      id: 'gambler', name: 'Gambler', hp: [30, 30], escapeAt: 1000, escapeStart: 4, escapeRate: 1,
      moves: [
        { id: 'x', name: 'X', effects: [{ type: 'dealDamage', amount: 1 }] },
        { id: 'y', name: 'Y', effects: [{ type: 'gainBlock', amount: 1 }] },
      ],
      pattern: { type: 'weighted', weights: { x: 1, y: 1 }, maxConsecutive: 1 },
    },
  ],
  encounters: [{ id: 'dummy', name: 'Dummy', enemies: ['dummy'] }],
  builds: [
    { id: 'basic', name: 'Basic', description: '', starterDeck: ['strike', 'defend'], strongAgainst: [] },
    { id: 'angler', name: 'Angler', description: '', starterDeck: ['hook', 'defend'], strongAgainst: ['fish'], startingEquipment: ['reel'] },
  ],
  events: [],
  shop: [],
  equipment: [
    { id: 'reel', name: 'Reel', description: '', effects: [{ type: 'slowEscape', percent: 20 }] },
    { id: 'spear', name: 'Spear', description: '', effects: [{ type: 'sellOnCapture', bonusPercent: 20 }] },
  ],
  creatureTypes: [
    { id: 'fish', name: 'Fish' },
    { id: 'shell', name: 'Shell' },
  ],
});

export function setup(
  deck: string[],
  opts: { enemies?: string[]; seed?: number; hp?: number; equipment?: string[] } = {},
): CombatState {
  return createCombat(
    {
      seed: opts.seed ?? 1,
      deck,
      enemies: opts.enemies ?? ['dummy'],
      playerHp: opts.hp ?? 80,
      playerMaxHp: 80,
      equipment: opts.equipment,
    },
    testData,
  );
}

/** Play the first card in hand with the given definition id. */
export function play(state: CombatState, defId: string, targetId = 'e0'): CombatState {
  const card = state.piles.hand.find((c) => c.defId === defId);
  if (!card) throw new Error(`No "${defId}" in hand: ${state.piles.hand.map((c) => c.defId).join(', ')}`);
  return applyAction(state, { type: 'playCard', cardUid: card.uid, targetId }, testData);
}

export function endTurn(state: CombatState): CombatState {
  return applyAction(state, { type: 'endTurn' }, testData);
}

export function repeat(id: string, n: number): string[] {
  return Array.from({ length: n }, () => id);
}
