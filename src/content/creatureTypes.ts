import type { CreatureTypeDef } from '../engine';

/**
 * Every creature has exactly one type (see creatures.ts). Builds' cards are strong against some of them.
 * Map events show a type (`icon`); the creature met there is drawn from that type when you arrive.
 */
export const creatureTypes = [
  { id: 'smallFish', name: 'Small fish', icon: '🐠' },
  { id: 'sportFish', name: 'Sport fish', icon: '🐟' },
  { id: 'bigFish', name: 'Big fish', icon: '🐋' },
  { id: 'rockFish', name: 'Rock fish', icon: '🪨' },
  { id: 'deepSea', name: 'Deep sea', icon: '🌑' },
  { id: 'crustacean', name: 'Crustacean', icon: '🦀' },
  { id: 'shellfish', name: 'Shellfish', icon: '🐚' },
  { id: 'tentacled', name: 'Tentacled', icon: '🐙' },
  { id: 'critter', name: 'Critter', icon: '⭐' },
] as const satisfies readonly CreatureTypeDef[];

export type CreatureType = (typeof creatureTypes)[number]['id'];
