import type { BuildDef } from '../engine';
import type { CreatureType } from './creatureTypes';

/**
 * Creature types each build specialises in. Build cards in cards.ts use these
 * in their damage `bonus`, so changing a list here retargets the whole build.
 */
export const ROD_TARGETS: CreatureType[] = ['sportFish', 'smallFish', 'deepSea'];
export const SPEAR_TARGETS: CreatureType[] = ['rockFish', 'bigFish', 'tentacled'];
export const FORAGING_TARGETS: CreatureType[] = ['crustacean', 'shellfish', 'critter'];

/** Starting builds, chosen before the first fight. Each sets the starter deck and equipment. */
export const builds: BuildDef[] = [
  {
    id: 'rod',
    name: 'Rod fishing',
    description: 'Patience and a good cast. Lands fish that bite on a line.',
    starterDeck: ['cast', 'cast', 'cast', 'cast', 'cast', 'bucket', 'bucket', 'bucket', 'bucket', 'setTheHook'],
    strongAgainst: ROD_TARGETS,
    sprite: { sheet: 'gear', index: 1 },
    startingEquipment: ['reliableReel'],
  },
  {
    id: 'spear',
    name: 'Spear fishing',
    description: 'Dive in and strike. Hunts the big, the rocky and the tentacled.',
    starterDeck: ['stick', 'stick', 'stick', 'stick', 'stick', 'bucket', 'bucket', 'bucket', 'bucket', 'harpoon'],
    strongAgainst: SPEAR_TARGETS,
    sprite: { sheet: 'gear', index: 29 },
    startingEquipment: ['sharpSpear'],
  },
  {
    id: 'foraging',
    name: 'Foraging',
    description: 'Nets and crab nets along the shore. Scoops up everything with a shell.',
    starterDeck: ['smallNet', 'smallNet', 'smallNet', 'smallNet', 'smallNet', 'bucket', 'bucket', 'bucket', 'bucket', 'crabNet'],
    strongAgainst: FORAGING_TARGETS,
    sprite: { sheet: 'gear', index: 23 },
    startingEquipment: ['rubberDuck'],
  },
];
