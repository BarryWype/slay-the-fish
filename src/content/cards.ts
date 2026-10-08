import type { CardDef } from '../engine';
import { FORAGING_TARGETS, ROD_TARGETS, SPEAR_TARGETS } from './builds';

/**
 * Every card in the game. Rules text is generated from `effects`
 * (set `description` to override it). See README → "Adding a card".
 *
 * A damage `bonus` adds damage per hit against the listed creature types,
 * e.g. `bonus: { against: ROD_TARGETS, amount: 4 }`.
 */
export const cards: CardDef[] = [
  // --- Starter: shared ------------------------------------------------------
  {
    id: 'bucket',
    name: 'Bucket',
    art: '🪣',
    type: 'skill',
    rarity: 'starter',
    cost: 1,
    target: 'none',
    effects: [{ type: 'gainBlock', amount: 5 }],
  },

  // --- Starter: rod fishing -------------------------------------------------
  {
    id: 'cast',
    name: 'Cast',
    art: '🎣',
    type: 'attack',
    rarity: 'starter',
    cost: 1,
    target: 'enemy',
    effects: [{ type: 'dealDamage', amount: 5, bonus: { against: ROD_TARGETS, amount: 4 } }],
  },
  {
    id: 'setTheHook',
    name: 'Set the Hook',
    art: '🪝',
    type: 'attack',
    rarity: 'starter',
    cost: 2,
    target: 'enemy',
    effects: [
      { type: 'dealDamage', amount: 7, bonus: { against: ROD_TARGETS, amount: 4 } },
      { type: 'applyStatus', status: 'vulnerable', amount: 2 },
    ],
  },

  // --- Starter: spear fishing -----------------------------------------------
  {
    id: 'stick',
    name: 'Sharp Stick',
    art: '🪵',
    type: 'attack',
    rarity: 'starter',
    cost: 1,
    target: 'enemy',
    effects: [{ type: 'dealDamage', amount: 5, bonus: { against: SPEAR_TARGETS, amount: 4 } }],
  },
  {
    id: 'harpoon',
    name: 'Harpoon',
    art: '🔱',
    type: 'attack',
    rarity: 'starter',
    cost: 2,
    target: 'enemy',
    effects: [{ type: 'dealDamage', amount: 10, bonus: { against: SPEAR_TARGETS, amount: 6 } }],
  },

  // --- Starter: foraging ----------------------------------------------------
  {
    id: 'smallNet',
    name: 'Small Net',
    art: '🥅',
    type: 'attack',
    rarity: 'starter',
    cost: 1,
    target: 'enemy',
    effects: [{ type: 'dealDamage', amount: 5, bonus: { against: FORAGING_TARGETS, amount: 4 } }],
  },
  {
    id: 'crabNet',
    name: 'Crab Net',
    art: '🦀',
    type: 'attack',
    rarity: 'starter',
    cost: 2,
    target: 'enemy',
    effects: [
      { type: 'dealDamage', amount: 7, bonus: { against: FORAGING_TARGETS, amount: 4 } },
      { type: 'applyStatus', status: 'weak', amount: 2 },
    ],
  },

  // --- Rewards: gear picked up along the shore ----------------------------
  {
    id: 'doubleCast',
    name: 'Double Cast',
    art: '🎣',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    target: 'enemy',
    effects: [{ type: 'dealDamage', amount: 5, hits: 2 }],
  },
  {
    id: 'skippingStones',
    name: 'Skipping Stones',
    art: '🪨',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    target: 'none',
    effects: [{ type: 'dealDamage', amount: 3, hits: 3, target: 'randomEnemy' }],
  },
  {
    id: 'oarSwing',
    name: 'Oar Swing',
    art: '🛶',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    target: 'enemy',
    effects: [
      { type: 'dealDamage', amount: 9 },
      { type: 'drawCards', amount: 1 },
    ],
  },
  {
    id: 'paddleSplash',
    name: 'Paddle Splash',
    art: '💦',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    target: 'enemy',
    effects: [
      { type: 'gainBlock', amount: 5 },
      { type: 'dealDamage', amount: 5 },
    ],
  },
  {
    id: 'heavySinker',
    name: 'Heavy Sinker',
    art: '⚓',
    type: 'attack',
    rarity: 'common',
    cost: 2,
    target: 'enemy',
    effects: [
      { type: 'dealDamage', amount: 12 },
      { type: 'applyStatus', status: 'weak', amount: 2 },
    ],
  },
  {
    id: 'wideNet',
    name: 'Wide Net',
    art: '🕸️',
    type: 'attack',
    rarity: 'common',
    cost: 1,
    target: 'none',
    effects: [
      { type: 'dealDamage', amount: 4, target: 'allEnemies' },
      { type: 'applyStatus', status: 'vulnerable', amount: 1, target: 'allEnemies' },
    ],
  },
  {
    id: 'rainCoat',
    name: 'Rain Coat',
    art: '🧥',
    type: 'skill',
    rarity: 'common',
    cost: 1,
    target: 'none',
    effects: [
      { type: 'gainBlock', amount: 8 },
      { type: 'drawCards', amount: 1 },
    ],
  },
  {
    id: 'tackleBox',
    name: 'Tackle Box',
    art: '🧰',
    type: 'skill',
    rarity: 'uncommon',
    cost: 0,
    target: 'none',
    effects: [{ type: 'drawCards', amount: 3 }],
  },
  {
    id: 'grandmasSandwich',
    name: "Grandma's Sandwich",
    art: '🥪',
    type: 'skill',
    rarity: 'uncommon',
    cost: 1,
    target: 'none',
    exhaust: true,
    effects: [{ type: 'gainEnergy', amount: 2 }],
  },
  {
    id: 'reelItIn',
    name: 'Reel It In',
    art: '🧵',
    type: 'skill',
    rarity: 'uncommon',
    cost: 1,
    target: 'enemy',
    exhaust: true,
    effects: [{ type: 'applyStatus', status: 'strength', amount: -2 }],
  },
  {
    id: 'luckyHat',
    name: 'Lucky Hat',
    art: '👒',
    type: 'power',
    rarity: 'rare',
    cost: 1,
    target: 'none',
    effects: [{ type: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
  },
];
