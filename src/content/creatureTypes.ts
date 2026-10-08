import type { CreatureTypeDef } from '../engine';

/** Every creature has exactly one type (see creatures.ts). Builds' cards are strong against some of them. */
export const creatureTypes = [
  { id: 'smallFish', name: 'Small fish' },
  { id: 'sportFish', name: 'Sport fish' },
  { id: 'bigFish', name: 'Big fish' },
  { id: 'rockFish', name: 'Rock fish' },
  { id: 'deepSea', name: 'Deep sea' },
  { id: 'crustacean', name: 'Crustacean' },
  { id: 'shellfish', name: 'Shellfish' },
  { id: 'tentacled', name: 'Tentacled' },
  { id: 'critter', name: 'Critter' },
] as const satisfies readonly CreatureTypeDef[];

export type CreatureType = (typeof creatureTypes)[number]['id'];
