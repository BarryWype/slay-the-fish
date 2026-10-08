/**
 * Fishing gear the player will earn during a run.
 *
 * What gear *does* isn't designed yet: this is the catalogue, ready for
 * effects to be added. When we decide (passive bonuses like Slay the Spire's
 * relics, unlocking cards, etc.), the new field goes on `GearDef` and every
 * entry here gets filled in.
 *
 * - `no`: number in assets/gear_names.pdf = position in assets/fishing_gear.png
 *   (left to right, top to bottom, 6 per row).
 */
export type GearCategory = 'rod' | 'tackle' | 'bait' | 'float' | 'tool' | 'trap' | 'spear' | 'storage';

export interface GearDef {
  no: number;
  id: string;
  name: string;
  /** Spanish name. */
  es: string;
  category: GearCategory;
  /** Free text for now: what you'd like this item to do. */
  description: string;
}

export const gear: GearDef[] = [
  // Row 1: rods (and line)
  { no: 1, id: 'woodenRod', name: 'Wooden fishing rod', es: 'Caña de pescar de madera', category: 'rod', description: '' },
  { no: 2, id: 'bambooRod', name: 'Bamboo fishing rod', es: 'Caña de pescar de bambú', category: 'rod', description: '' },
  { no: 3, id: 'steelRod', name: 'Steel fishing rod', es: 'Caña de pescar de acero', category: 'rod', description: '' },
  { no: 4, id: 'glassFiberRod', name: 'Glass fiber fishing rod', es: 'Caña de pescar de fibra de vidrio', category: 'rod', description: '' },
  { no: 5, id: 'carbonFiberRod', name: 'Carbon fiber fishing rod', es: 'Caña de pescar de fibra de carbono', category: 'rod', description: '' },
  { no: 6, id: 'fishingLine', name: 'Fishing line', es: 'Sedal', category: 'tackle', description: '' },
  // Row 2: hooks and lures
  { no: 7, id: 'fishingHook', name: 'Fishing hook', es: 'Anzuelo', category: 'tackle', description: '' },
  { no: 8, id: 'jigLure', name: 'Jig lure', es: 'Señuelo jig', category: 'tackle', description: '' },
  { no: 9, id: 'flyLure', name: 'Fly lure', es: 'Señuelo de mosca', category: 'tackle', description: '' },
  { no: 10, id: 'crankbait', name: 'Crankbait', es: 'Crankbait', category: 'tackle', description: '' },
  { no: 11, id: 'spinnerLure', name: 'Spinner lure', es: 'Señuelo giratorio', category: 'tackle', description: '' },
  { no: 12, id: 'fishingMagnet', name: 'Fishing magnet', es: 'Imán de pesca', category: 'tackle', description: '' },
  // Row 3: sinker and bait
  { no: 13, id: 'sinker', name: 'Fishing lead / Sinker', es: 'Plomo de pesca', category: 'tackle', description: '' },
  { no: 14, id: 'meatBait', name: 'Meat bait', es: 'Cebo de carne', category: 'bait', description: '' },
  { no: 15, id: 'wormBait', name: 'Worm bait', es: 'Cebo de gusano', category: 'bait', description: '' },
  { no: 16, id: 'fruitBait', name: 'Fruit bait', es: 'Cebo de fruta', category: 'bait', description: '' },
  { no: 17, id: 'garlicBait', name: 'Garlic bait', es: 'Cebo de ajo', category: 'bait', description: '' },
  { no: 18, id: 'seafoodBait', name: 'Seafood bait', es: 'Cebo de marisco', category: 'bait', description: '' },
  // Row 4: floats, thrower, scale, net and traps
  { no: 19, id: 'baitCatapult', name: 'Bait catapult', es: 'Lanzador de cebo', category: 'tool', description: '' },
  { no: 20, id: 'corkBobber', name: 'Cork bobber', es: 'Corcho para pesca', category: 'float', description: '' },
  { no: 21, id: 'plasticBobber', name: 'Plastic bobber', es: 'Corcho de plástico para pesca', category: 'float', description: '' },
  { no: 22, id: 'fishScale', name: 'Fish weight machine', es: 'Báscula para peces', category: 'tool', description: '' },
  { no: 23, id: 'fishingNet', name: 'Fishing net', es: 'Red de pesca', category: 'trap', description: '' },
  { no: 24, id: 'fishTrap', name: 'Fish trap', es: 'Trampa para peces', category: 'trap', description: '' },
  // Row 5: crab trap and spears
  { no: 25, id: 'crabTrap', name: 'Crab trap', es: 'Trampa para cangrejos', category: 'trap', description: '' },
  { no: 26, id: 'spearGun', name: 'Harpoon gun / Spear gun', es: 'Fusil de pesca', category: 'spear', description: '' },
  { no: 27, id: 'harpoon', name: 'Harpoon', es: 'Arpón', category: 'spear', description: '' },
  { no: 28, id: 'forkHarpoon', name: 'Fork harpoon', es: 'Arpón tridente', category: 'spear', description: '' },
  { no: 29, id: 'fishingSpear', name: 'Fishing spear', es: 'Lanza de pesca', category: 'spear', description: '' },
  { no: 30, id: 'trident', name: 'Trident', es: 'Tridente', category: 'spear', description: '' },
  // Row 6: bags, coolers and electronics
  { no: 31, id: 'bucket', name: 'Bucket', es: 'Cubo', category: 'storage', description: '' },
  { no: 32, id: 'fishingBag', name: 'Fishing bag', es: 'Bolsa de pesca', category: 'storage', description: '' },
  { no: 33, id: 'portableFridge', name: 'Portable fridge', es: 'Nevera portátil', category: 'storage', description: '' },
  { no: 34, id: 'tackleBox', name: 'Tackle box', es: 'Caja de aparejos', category: 'storage', description: '' },
  { no: 35, id: 'fishingMarker', name: 'Fishing marker', es: 'Marcador de pesca', category: 'tool', description: '' },
  { no: 36, id: 'fishingSonar', name: 'Fishing sonar', es: 'Sonar de pesca', category: 'tool', description: '' },
];
