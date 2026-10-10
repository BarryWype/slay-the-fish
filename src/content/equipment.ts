import type { EquipmentDef } from '../engine';

/**
 * Objects found along the way, carried for the whole run. Each build starts
 * with one (`startingEquipment` in builds.ts). `description` is the rules text
 * the player sees; `effects` is what the engine actually applies.
 */
export const equipment: EquipmentDef[] = [
  {
    id: 'reliableReel',
    name: 'Reliable Reel',
    icon: '🎣',
    description: 'Creatures’ Panic rises 20% slower (at least 1, rounded up).',
    effects: [{ type: 'slowEscape', percent: 20 }],
  },
  {
    id: 'sharpSpear',
    name: 'Sharp Spear',
    icon: '🔱',
    description: 'Captured creatures are sold on the spot for 20% more, instead of going into your bucket.',
    effects: [{ type: 'sellOnCapture', bonusPercent: 20 }],
  },
  {
    id: 'rubberDuck',
    name: 'Rubber Duck',
    icon: '🦆',
    description: 'Enthusiastic passersby give 50% more coins per fish.',
    effects: [{ type: 'passerbyBonus', bonusPercent: 50 }],
  },
];
