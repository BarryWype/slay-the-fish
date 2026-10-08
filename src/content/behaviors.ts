import type { EnemyMove, IntentPattern } from '../engine';

/**
 * Shared move sets. A creature in creatures.ts picks one by name, so
 * rebalancing e.g. every predator happens here, in one place.
 *
 * Moves are lists of the same effect primitives cards use. From a creature's
 * point of view, `target` (the default) is the player and `self` is itself.
 * Patterns: 'sequence' plays moves in order (looping from `loopFrom`);
 * 'weighted' picks randomly by weight, never more than `maxConsecutive` in a row.
 */
export interface Behavior {
  moves: EnemyMove[];
  pattern: IntentPattern;
}

export const behaviors = {
  /** Small, colourful, more annoying than dangerous. */
  reefFish: {
    moves: [
      { id: 'nibble', name: 'Nibble', effects: [{ type: 'dealDamage', amount: 5 }] },
      { id: 'dartAway', name: 'Dart Away', effects: [{ type: 'gainBlock', amount: 6 }] },
      { id: 'flashColors', name: 'Flash Colors', effects: [{ type: 'applyStatus', status: 'weak', amount: 1 }] },
    ],
    pattern: { type: 'weighted', firstMove: 'nibble', weights: { nibble: 50, dartAway: 25, flashColors: 25 }, maxConsecutive: 2 },
  },

  /** Tiny fish that attack in many small hits. */
  schooling: {
    moves: [
      { id: 'swarm', name: 'Swarm', effects: [{ type: 'dealDamage', amount: 2, hits: 3 }] },
      { id: 'scatter', name: 'Scatter', effects: [{ type: 'gainBlock', amount: 5 }] },
      { id: 'regroup', name: 'Regroup', effects: [{ type: 'applyStatus', status: 'strength', amount: 1, target: 'self' }] },
    ],
    pattern: { type: 'sequence', moves: ['swarm', 'scatter', 'swarm', 'regroup'] },
  },

  /** Hunters: big bites, and they get hungrier. */
  predator: {
    moves: [
      { id: 'bite', name: 'Bite', effects: [{ type: 'dealDamage', amount: 11 }] },
      {
        id: 'lunge',
        name: 'Lunge',
        effects: [
          { type: 'dealDamage', amount: 7 },
          { type: 'applyStatus', status: 'vulnerable', amount: 1 },
        ],
      },
      {
        id: 'circle',
        name: 'Circle',
        effects: [
          { type: 'applyStatus', status: 'strength', amount: 2, target: 'self' },
          { type: 'gainBlock', amount: 4 },
        ],
      },
    ],
    pattern: { type: 'weighted', firstMove: 'lunge', weights: { bite: 40, lunge: 35, circle: 25 }, maxConsecutive: 1 },
  },

  /** Spines and venom: weakens you. */
  venomous: {
    moves: [
      {
        id: 'sting',
        name: 'Sting',
        effects: [
          { type: 'dealDamage', amount: 5 },
          { type: 'applyStatus', status: 'weak', amount: 2 },
        ],
      },
      { id: 'raiseSpines', name: 'Raise Spines', effects: [{ type: 'gainBlock', amount: 9 }] },
      {
        id: 'venomStrike',
        name: 'Venom Strike',
        effects: [
          { type: 'dealDamage', amount: 9 },
          { type: 'applyStatus', status: 'vulnerable', amount: 1 },
        ],
      },
    ],
    pattern: { type: 'sequence', moves: ['sting', 'raiseSpines', 'venomStrike'] },
  },

  /** Inflates for defence, then pokes. */
  puffer: {
    moves: [
      {
        id: 'puffUp',
        name: 'Puff Up',
        effects: [
          { type: 'gainBlock', amount: 10 },
          { type: 'applyStatus', status: 'strength', amount: 1, target: 'self' },
        ],
      },
      { id: 'spikeJab', name: 'Spike Jab', effects: [{ type: 'dealDamage', amount: 7 }] },
      {
        id: 'bump',
        name: 'Bump',
        effects: [
          { type: 'dealDamage', amount: 4 },
          { type: 'applyStatus', status: 'weak', amount: 1 },
        ],
      },
    ],
    pattern: { type: 'sequence', moves: ['puffUp', 'spikeJab', 'bump'] },
  },

  /** Hides, then strikes hard. Hit it while it's hiding! */
  ambusher: {
    moves: [
      {
        id: 'lurk',
        name: 'Lurk',
        effects: [
          { type: 'gainBlock', amount: 8 },
          { type: 'applyStatus', status: 'strength', amount: 2, target: 'self' },
        ],
      },
      { id: 'ambush', name: 'Ambush', effects: [{ type: 'dealDamage', amount: 14 }] },
    ],
    pattern: { type: 'sequence', moves: ['lurk', 'ambush'] },
  },

  /** Game fish that put up a fight on the line. */
  fighter: {
    moves: [
      { id: 'tailSlap', name: 'Tail Slap', effects: [{ type: 'dealDamage', amount: 8 }] },
      {
        id: 'leap',
        name: 'Leap',
        effects: [
          { type: 'gainBlock', amount: 8 },
          { type: 'applyStatus', status: 'strength', amount: 1, target: 'self' },
        ],
      },
      { id: 'thrash', name: 'Thrash', effects: [{ type: 'dealDamage', amount: 4, hits: 2 }] },
    ],
    pattern: { type: 'weighted', weights: { tailSlap: 40, leap: 30, thrash: 30 }, maxConsecutive: 1 },
  },

  /** Huge and slow: dives, then hits like a truck. */
  giant: {
    moves: [
      { id: 'dive', name: 'Dive', effects: [{ type: 'gainBlock', amount: 14 }] },
      { id: 'ram', name: 'Ram', effects: [{ type: 'dealDamage', amount: 15 }] },
      {
        id: 'bodySlam',
        name: 'Body Slam',
        effects: [
          { type: 'dealDamage', amount: 10 },
          { type: 'applyStatus', status: 'weak', amount: 1 },
        ],
      },
    ],
    pattern: { type: 'sequence', moves: ['dive', 'ram', 'bodySlam'] },
  },

  /** Coils up and bites twice. */
  eel: {
    moves: [
      { id: 'doubleBite', name: 'Double Bite', effects: [{ type: 'dealDamage', amount: 4, hits: 2 }] },
      {
        id: 'coil',
        name: 'Coil',
        effects: [
          { type: 'gainBlock', amount: 6 },
          { type: 'applyStatus', status: 'strength', amount: 1, target: 'self' },
        ],
      },
    ],
    pattern: { type: 'weighted', weights: { doubleBite: 55, coil: 45 }, maxConsecutive: 2 },
  },

  /** Shells: very hard to crack, weak attacks. */
  armored: {
    moves: [
      { id: 'clampShut', name: 'Clamp Shut', effects: [{ type: 'gainBlock', amount: 12 }] },
      { id: 'snap', name: 'Snap', effects: [{ type: 'dealDamage', amount: 6 }] },
      {
        id: 'spit',
        name: 'Spit',
        effects: [
          { type: 'applyStatus', status: 'weak', amount: 1 },
          { type: 'gainBlock', amount: 4 },
        ],
      },
    ],
    pattern: { type: 'sequence', moves: ['clampShut', 'snap', 'spit', 'snap'] },
  },

  /** Drifting stingers that leave you exposed. */
  jellyfish: {
    moves: [
      {
        id: 'sting',
        name: 'Sting',
        effects: [
          { type: 'dealDamage', amount: 4 },
          { type: 'applyStatus', status: 'vulnerable', amount: 1 },
        ],
      },
      { id: 'drift', name: 'Drift', effects: [{ type: 'gainBlock', amount: 5 }] },
      { id: 'tangle', name: 'Tangle', effects: [{ type: 'applyStatus', status: 'weak', amount: 2 }] },
    ],
    pattern: { type: 'weighted', firstMove: 'sting', weights: { sting: 50, drift: 25, tangle: 25 }, maxConsecutive: 1 },
  },

  /** Octopus and squid: ink, then many tentacles. */
  cephalopod: {
    moves: [
      {
        id: 'inkCloud',
        name: 'Ink Cloud',
        effects: [
          { type: 'applyStatus', status: 'weak', amount: 2 },
          { type: 'gainBlock', amount: 5 },
        ],
      },
      { id: 'tentacles', name: 'Tentacles', effects: [{ type: 'dealDamage', amount: 3, hits: 3 }] },
      { id: 'squeeze', name: 'Squeeze', effects: [{ type: 'dealDamage', amount: 9 }] },
    ],
    pattern: { type: 'sequence', moves: ['inkCloud', 'tentacles', 'squeeze', 'tentacles'] },
  },

  /** Crabs and lobsters: claws up, then pinch. */
  crustacean: {
    moves: [
      { id: 'raiseClaws', name: 'Raise Claws', effects: [{ type: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
      { id: 'pinch', name: 'Pinch', effects: [{ type: 'dealDamage', amount: 7 }] },
      { id: 'shellUp', name: 'Shell Up', effects: [{ type: 'gainBlock', amount: 9 }] },
    ],
    pattern: { type: 'weighted', firstMove: 'raiseClaws', weights: { pinch: 45, shellUp: 30, raiseClaws: 25 }, maxConsecutive: 1 },
  },

  /** Slugs, stars, worms and other things on the sea floor. */
  bottomDweller: {
    moves: [
      {
        id: 'ooze',
        name: 'Ooze',
        effects: [
          { type: 'applyStatus', status: 'weak', amount: 1 },
          { type: 'gainBlock', amount: 3 },
        ],
      },
      { id: 'prickle', name: 'Prickle', effects: [{ type: 'dealDamage', amount: 5 }] },
      { id: 'harden', name: 'Harden', effects: [{ type: 'gainBlock', amount: 7 }] },
    ],
    pattern: { type: 'weighted', weights: { prickle: 40, harden: 30, ooze: 30 }, maxConsecutive: 1 },
  },
} satisfies Record<string, Behavior>;

export type BehaviorId = keyof typeof behaviors;
