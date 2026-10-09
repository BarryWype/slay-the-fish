import type { CreatureTypeDef } from '../engine';

/**
 * Every creature has exactly one type (see creatures.ts). Builds' cards are strong against some of them.
 * Map events show a type (`icon`); the creature met there is drawn from that type when you arrive.
 */
export const creatureTypes = [
  // terrain: patch in the `terrain` sheet (scripts/generate-map-terrain.mjs), in this order.
  { id: 'smallFish', name: 'Small fish', icon: '🐠', terrain: { sheet: 'terrain', index: 1 } }, // shallows
  { id: 'sportFish', name: 'Sport fish', icon: '🐟', terrain: { sheet: 'terrain', index: 2 } }, // open water
  { id: 'bigFish', name: 'Big fish', icon: '🐋', terrain: { sheet: 'terrain', index: 3 } }, // ocean swell
  { id: 'rockFish', name: 'Rock fish', icon: '🪨', terrain: { sheet: 'terrain', index: 4 } }, // reef
  { id: 'deepSea', name: 'Deep sea', icon: '🌑', terrain: { sheet: 'terrain', index: 5 } }, // abyss
  { id: 'crustacean', name: 'Crustacean', icon: '🦀', terrain: { sheet: 'terrain', index: 6 } }, // boulders
  { id: 'shellfish', name: 'Shellfish', icon: '🐚', terrain: { sheet: 'terrain', index: 7 } }, // sandbank
  { id: 'tentacled', name: 'Tentacled', icon: '🐙', terrain: { sheet: 'terrain', index: 8 } }, // kelp
  { id: 'critter', name: 'Critter', icon: '⭐', terrain: { sheet: 'terrain', index: 9 } }, // tide pool
] as const satisfies readonly CreatureTypeDef[];

export type CreatureType = (typeof creatureTypes)[number]['id'];
