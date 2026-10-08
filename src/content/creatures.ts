import type { Habitat, Statuses } from '../engine';
import type { Behavior, BehaviorId } from './behaviors';
import type { CreatureType } from './creatureTypes';

/**
 * Every creature you can meet, one line each. They become enemies (and
 * single-creature encounters) automatically.
 *
 * - `no`: number in assets/fish_names.pdf = position in assets/fishes.png
 *   (left to right, top to bottom, 12 per row).
 * - `type`: small fish, sport fish, crustacean… (creatureTypes.ts).
 * - `tier`: 1 = shallow water near the start of the map, 3 = the deep end.
 * - `hp`: [min, max], rolled each fight.
 * - `behavior`: a shared move set from behaviors.ts, OR this creature's own
 *   `{ moves, pattern }` (see Pike and Red piranha below).
 * - `strength` (optional): Strength it starts every fight with.
 * - `habitat` (optional): 'swim' | 'drift' | 'bottom', how it moves in the aquarium.
 */
export interface CreatureDef {
  no: number;
  id: string;
  name: string;
  scientific: string;
  /** Creature type (creatureTypes.ts). Build cards deal bonus damage to some types. */
  type: CreatureType;
  tier: 1 | 2 | 3;
  hp: [number, number];
  behavior: BehaviorId | Behavior;
  strength?: number;
  /** Any other statuses it starts with, e.g. { vulnerable: 2 }. */
  statuses?: Statuses;
  /** How it moves in the aquarium. Defaults from its behavior (see enemies.ts). */
  habitat?: Habitat;
}

export const creatures: CreatureDef[] = [
  // --- Fish (rows 1–8) -------------------------------------------------------
  { no: 1, id: 'progenetica', name: 'Progenetica', scientific: 'Paedocypris progenetica', type: 'smallFish', tier: 1, hp: [12, 15], behavior: 'schooling' },
  { no: 2, id: 'clownfish', name: 'Clownfish', scientific: 'Amphiprion ocellaris', type: 'smallFish', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 3, id: 'blueTang', name: 'Blue tang', scientific: 'Paracanthurus hepatus', type: 'smallFish', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 4, id: 'yellowTang', name: 'Yellow tang', scientific: 'Zebrasoma flavescens', type: 'smallFish', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 5, id: 'gemTang', name: 'Gem tang', scientific: 'Zebrasoma gemmatum', type: 'smallFish', tier: 1, hp: [20, 24], behavior: 'reefFish' },
  { no: 6, id: 'sailfinTang', name: 'Sailfin tang', scientific: 'Zebrasoma velifer', type: 'smallFish', tier: 1, hp: [20, 24], behavior: 'reefFish' },
  { no: 7, id: 'angelfish', name: 'Angelfish', scientific: 'Pterophyllum scalare', type: 'smallFish', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 8, id: 'queenAngelfish', name: 'Queen angelfish', scientific: 'Holacanthus ciliaris', type: 'smallFish', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 9, id: 'frenchAngelfish', name: 'French angelfish', scientific: 'Pomacanthus paru', type: 'smallFish', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 10, id: 'goldfish', name: 'Goldfish', scientific: 'Carassius auratus', type: 'smallFish', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 11, id: 'fightingFish', name: 'Fighting fish', scientific: 'Betta splendens', type: 'smallFish', tier: 1, hp: [18, 22], behavior: 'predator' },
  { no: 12, id: 'catfish', name: 'Catfish', scientific: 'Silurus glanis', type: 'sportFish', tier: 2, hp: [40, 46], behavior: 'ambusher' },
  { no: 13, id: 'porcupinefish', name: 'Porcupinefish', scientific: 'Diodon holocanthus', type: 'rockFish', tier: 2, hp: [32, 38], behavior: 'puffer' },
  { no: 14, id: 'spottedPufferfish', name: 'Spotted pufferfish', scientific: 'Dichotomyctere nigroviridis', type: 'smallFish', tier: 1, hp: [24, 28], behavior: 'puffer' },
  { no: 15, id: 'oceanSunfish', name: 'Ocean sunfish', scientific: 'Mola mola', type: 'bigFish', tier: 3, hp: [70, 80], behavior: 'giant' },
  { no: 16, id: 'mahiMahi', name: 'Mahi mahi', scientific: 'Coryphaena hippurus', type: 'sportFish', tier: 2, hp: [38, 44], behavior: 'predator' },
  { no: 17, id: 'roulesGoby', name: 'Roule’s goby', scientific: 'Gobius roulei', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  {
    no: 18, id: 'redPiranha', name: 'Red piranha', scientific: 'Pygocentrus nattereri', type: 'sportFish', tier: 2, hp: [28, 32],
    behavior: {
      moves: [
        { id: 'frenzy', name: 'Frenzy', effects: [{ type: 'dealDamage', amount: 3, hits: 3 }] },
        { id: 'smellBlood', name: 'Smell Blood', effects: [{ type: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
      ],
      pattern: { type: 'sequence', moves: ['frenzy', 'frenzy', 'smellBlood'] },
    },
  },
  { no: 19, id: 'lionfish', name: 'Lionfish', scientific: 'Pterois volitans', type: 'rockFish', tier: 2, hp: [34, 40], behavior: 'venomous' },
  { no: 20, id: 'redScorpionfish', name: 'Red scorpionfish', scientific: 'Scorpaena scrofa', type: 'rockFish', tier: 2, hp: [36, 42], behavior: 'venomous' },
  { no: 21, id: 'stonefish', name: 'Stonefish', scientific: 'Synanceia horrida', type: 'rockFish', tier: 3, hp: [52, 58], behavior: 'venomous', strength: 1 },
  { no: 22, id: 'flyingFish', name: 'Flying fish', scientific: 'Exocoetus volitans', type: 'smallFish', tier: 1, hp: [16, 20], behavior: 'schooling' },
  { no: 23, id: 'guppy', name: 'Guppy', scientific: 'Poecilia reticula', type: 'smallFish', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 24, id: 'sailfinMolly', name: 'Sailfin molly', scientific: 'Poecilia velifera', type: 'smallFish', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 25, id: 'greaterWeever', name: 'Greater weever', scientific: 'Trachinus draco', type: 'rockFish', tier: 1, hp: [24, 28], behavior: 'venomous' },
  { no: 26, id: 'sockeyeSalmon', name: 'Sockeye salmon', scientific: 'Oncorhynchus nerka', type: 'sportFish', tier: 2, hp: [38, 44], behavior: 'fighter' },
  { no: 27, id: 'taimen', name: 'Taimen', scientific: 'Hucho taimen', type: 'sportFish', tier: 3, hp: [58, 64], behavior: 'predator' },
  { no: 28, id: 'atlanticSalmon', name: 'Atlantic salmon', scientific: 'Salmo salar', type: 'sportFish', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 29, id: 'masu', name: 'Masu', scientific: 'Oncorhynchus masou', type: 'sportFish', tier: 2, hp: [34, 40], behavior: 'fighter' },
  { no: 30, id: 'europeanAngler', name: 'European angler', scientific: 'Lophius piscatorius', type: 'deepSea', tier: 3, hp: [56, 62], behavior: 'ambusher' },
  { no: 31, id: 'humpbackAnglerfish', name: 'Humpback anglerfish', scientific: 'Melanocetus johnsonii', type: 'deepSea', tier: 3, hp: [52, 58], behavior: 'ambusher' },
  { no: 32, id: 'hairyFrogfish', name: 'Hairy frogfish', scientific: 'Antennarius striatus', type: 'rockFish', tier: 2, hp: [32, 38], behavior: 'ambusher' },
  { no: 33, id: 'commonCarp', name: 'Common carp', scientific: 'Cyprinus carpio', type: 'sportFish', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 34, id: 'tench', name: 'Tench', scientific: 'Tinca tinca', type: 'sportFish', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 35, id: 'koiCarp', name: 'Koi carp', scientific: 'Cyprinus carpio', type: 'sportFish', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 36, id: 'barracuda', name: 'Barracuda', scientific: 'Sphyraena', type: 'sportFish', tier: 3, hp: [54, 60], behavior: 'predator', strength: 1 },
  { no: 37, id: 'cardinalTetra', name: 'Cardinal tetra', scientific: 'Paracheirodon axelrodi', type: 'smallFish', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 38, id: 'emperorTetra', name: 'Emperor tetra', scientific: 'Nematobrycon palmeri', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 39, id: 'zebrafish', name: 'Zebrafish', scientific: 'Danio rerio', type: 'smallFish', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 40, id: 'petticoatTetra', name: 'Petticoat tetra', scientific: 'Gymnocorymbus ternetzi', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 41, id: 'perch', name: 'Perch', scientific: 'Perca fluviatilis', type: 'sportFish', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 42, id: 'starrySturgeon', name: 'Starry sturgeon', scientific: 'Acipenser stellatus', type: 'bigFish', tier: 3, hp: [64, 72], behavior: 'giant' },
  { no: 43, id: 'lakeSturgeon', name: 'Lake sturgeon', scientific: 'Acipenser fulvescens', type: 'bigFish', tier: 3, hp: [68, 76], behavior: 'giant' },
  { no: 44, id: 'stripedMarlin', name: 'Striped marlin', scientific: 'Kajikia audax', type: 'sportFish', tier: 3, hp: [62, 70], behavior: 'predator', strength: 1 },
  { no: 45, id: 'swordfish', name: 'Swordfish', scientific: 'Xiphias gladius', type: 'sportFish', tier: 3, hp: [64, 72], behavior: 'predator', strength: 2 },
  { no: 46, id: 'garfish', name: 'Garfish', scientific: 'Belone belone', type: 'sportFish', tier: 1, hp: [20, 24], behavior: 'predator' },
  { no: 47, id: 'europeanPilchard', name: 'European pilchard', scientific: 'Sardina pilchardus', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 48, id: 'atlanticHerring', name: 'Atlantic herring', scientific: 'Clupea harengus', type: 'smallFish', tier: 1, hp: [14, 18], behavior: 'schooling' },
  { no: 49, id: 'blackspotSeabream', name: 'Blackspot seabream', scientific: 'Pagellus bogaraveo', type: 'sportFish', tier: 1, hp: [24, 28], behavior: 'fighter' },
  { no: 50, id: 'silverSeabream', name: 'Silver seabream', scientific: 'Sparus aurata', type: 'sportFish', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 51, id: 'atlanticCod', name: 'Atlantic cod', scientific: 'Gadus morhua', type: 'sportFish', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 52, id: 'hake', name: 'Hake', scientific: 'Merluccius', type: 'sportFish', tier: 2, hp: [34, 40], behavior: 'predator' },
  { no: 53, id: 'bluefinTuna', name: 'Bluefin tuna', scientific: 'Thunnus thynnus', type: 'bigFish', tier: 3, hp: [72, 80], behavior: 'giant', strength: 1 },
  {
    no: 54, id: 'pike', name: 'Pike', scientific: 'Esox lucius', type: 'sportFish', tier: 2, hp: [40, 44],
    behavior: {
      moves: [
        { id: 'snap', name: 'Snap', effects: [{ type: 'dealDamage', amount: 11 }] },
        { id: 'thrash', name: 'Thrash', effects: [{ type: 'dealDamage', amount: 7 }, { type: 'gainBlock', amount: 5 }] },
        { id: 'lurk', name: 'Lurk in the Reeds', effects: [{ type: 'applyStatus', status: 'strength', amount: 3, target: 'self' }, { type: 'gainBlock', amount: 6 }] },
      ],
      pattern: { type: 'weighted', firstMove: 'snap', weights: { snap: 25, thrash: 30, lurk: 45 }, maxConsecutive: 1 },
    },
  },
  { no: 55, id: 'commonBarbel', name: 'Common barbel', scientific: 'Barbus barbus', type: 'sportFish', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 56, id: 'tigerBarb', name: 'Tiger barb', scientific: 'Puntigus tetrazona', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 57, id: 'cherryBarb', name: 'Cherry barb', scientific: 'Puntius titteya', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 58, id: 'opah', name: 'Opah', scientific: 'Lampris guttatus', type: 'deepSea', tier: 3, hp: [60, 68], behavior: 'giant' },
  { no: 59, id: 'blueDiscus', name: 'Blue discus', scientific: 'Symphysodon aequifasciatus', type: 'smallFish', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 60, id: 'rainbowTrout', name: 'Rainbow trout', scientific: 'Oncorhynchus mykiss', type: 'sportFish', tier: 2, hp: [34, 40], behavior: 'fighter' },
  { no: 61, id: 'ribbonEel', name: 'Ribbon eel', scientific: 'Rhinomuraena quaesita', type: 'rockFish', tier: 1, hp: [22, 26], behavior: 'eel' },
  { no: 62, id: 'giantMorayEel', name: 'Giant moray eel', scientific: 'Gymnothorax javanicus', type: 'rockFish', tier: 3, hp: [56, 62], behavior: 'eel', strength: 1 },
  { no: 63, id: 'europeanConger', name: 'European conger', scientific: 'Conger conger', type: 'rockFish', tier: 2, hp: [40, 46], behavior: 'eel' },
  { no: 64, id: 'harlequinSnakeEel', name: 'Harlequin snake eel', scientific: 'Myrichthys colubrinus', type: 'rockFish', tier: 2, hp: [30, 36], behavior: 'eel' },
  { no: 65, id: 'oarfish', name: 'Oarfish', scientific: 'Regalecus glesne', type: 'deepSea', tier: 3, hp: [76, 86], behavior: 'giant' },
  { no: 66, id: 'africanCoelacanth', name: 'African coelacanth', scientific: 'Latimeria chalumnae', type: 'deepSea', tier: 3, hp: [66, 74], behavior: 'giant' },
  { no: 67, id: 'longnoseGar', name: 'Longnose gar', scientific: 'Lepisosteus osseus', type: 'sportFish', tier: 2, hp: [38, 44], behavior: 'predator' },
  { no: 68, id: 'saddledBichir', name: 'Saddled bichir', scientific: 'Polypterus endlicheri', type: 'sportFish', tier: 2, hp: [30, 36], behavior: 'predator' },
  { no: 69, id: 'senegalBichir', name: 'Senegal bichir', scientific: 'Polypterus senegalus', type: 'sportFish', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 70, id: 'turbot', name: 'Turbot', scientific: 'Scophthalmus maximus', type: 'rockFish', tier: 2, hp: [36, 42], behavior: 'ambusher' },
  { no: 71, id: 'europeanSeabass', name: 'European seabass', scientific: 'Dicentrarchus labrax', type: 'sportFish', tier: 2, hp: [36, 42], behavior: 'predator' },
  { no: 72, id: 'europeanAnchovy', name: 'European anchovy', scientific: 'Engraulis encrasicolus', type: 'smallFish', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 73, id: 'humpheadWrasse', name: 'Humphead wrasse', scientific: 'Cheilinus undulatus', type: 'bigFish', tier: 3, hp: [60, 68], behavior: 'giant' },
  { no: 74, id: 'commonStingray', name: 'Common stingray', scientific: 'Dasyatis pastinaca', type: 'bigFish', tier: 3, hp: [52, 58], behavior: 'venomous' },
  { no: 75, id: 'shortfinMakoShark', name: 'Shortfin mako shark', scientific: 'Isurus oxyrinchus', type: 'bigFish', tier: 3, hp: [70, 78], behavior: 'predator', strength: 2 },
  { no: 76, id: 'riverLamprey', name: 'River lamprey', scientific: 'Lampetra fluviatilis', type: 'rockFish', tier: 1, hp: [20, 24], behavior: 'eel' },
  { no: 77, id: 'racoonButterfish', name: 'Racoon butterfish', scientific: 'Chaetodon lunula', type: 'smallFish', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 78, id: 'atlanticTrumpetfish', name: 'Atlantic trumpetfish', scientific: 'Aulostomus strigosus', type: 'rockFish', tier: 1, hp: [20, 24], behavior: 'predator' },
  { no: 79, id: 'bartlettsAnthias', name: 'Bartlett’s anthias', scientific: 'Pseudanthias bartlettorum', type: 'smallFish', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 80, id: 'fireGoby', name: 'Fire goby', scientific: 'Nemateleotris magnifica', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 81, id: 'atlanticSpadefish', name: 'Atlantic spadefish', scientific: 'Chaetodipterus faber', type: 'smallFish', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 82, id: 'blueAcara', name: 'Blue acara', scientific: 'Andinoacara pulcher', type: 'smallFish', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 83, id: 'oscar', name: 'Oscar', scientific: 'Astronotus ocellatus', type: 'smallFish', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 84, id: 'dwarfGourami', name: 'Dwarf gourami', scientific: 'Trichogaster lalius', type: 'smallFish', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 85, id: 'clownLoach', name: 'Clown loach', scientific: 'Chromobotia macracanthus', type: 'smallFish', tier: 1, hp: [16, 20], behavior: 'bottomDweller' },
  { no: 86, id: 'arapaima', name: 'Arapaima', scientific: 'Arapaima gigas', type: 'bigFish', tier: 3, hp: [74, 82], behavior: 'giant' },
  { no: 87, id: 'asianArowana', name: 'Asian arowana', scientific: 'Scleropages formosus', type: 'sportFish', tier: 2, hp: [36, 42], behavior: 'predator' },
  { no: 88, id: 'moorishIdol', name: 'Moorish idol', scientific: 'Zanclus cornutus', type: 'smallFish', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 89, id: 'banggaiCardinalfish', name: 'Banggai cardinalfish', scientific: 'Pterapogon kauderni', type: 'smallFish', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 90, id: 'longhornCowfish', name: 'Longhorn cowfish', scientific: 'Lactoria cornuta', type: 'smallFish', tier: 1, hp: [20, 24], behavior: 'puffer' },
  { no: 91, id: 'hogfish', name: 'Hogfish', scientific: 'Lachnolaimus maximus', type: 'sportFish', tier: 1, hp: [24, 28], behavior: 'fighter' },
  { no: 92, id: 'blueheadWrasse', name: 'Bluehead wrasse', scientific: 'Thalassoma bifasciatum', type: 'smallFish', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 93, id: 'lumpfish', name: 'Lumpfish', scientific: 'Cyclopterus lumpus', type: 'rockFish', tier: 2, hp: [30, 36], behavior: 'puffer' },
  { no: 94, id: 'boesemansRainbowfish', name: 'Boeseman’s rainbowfish', scientific: 'Melanotaenia boesemani', type: 'smallFish', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 95, id: 'hillstreamLoach', name: 'Hillstream loach', scientific: 'Beaufortia kweichowensis', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 96, id: 'seahorse', name: 'Seahorse', scientific: 'Hippocampus hippocampus', type: 'smallFish', tier: 1, hp: [12, 16], behavior: 'reefFish' },

  // --- Shellfish, jellyfish, cephalopods, crustaceans & co. (rows 9–12) ------
  { no: 97, id: 'pacificOyster', name: 'Pacific oyster', scientific: 'Crassostrea gigas', type: 'shellfish', tier: 1, hp: [20, 24], behavior: 'armored' },
  { no: 98, id: 'pearlOyster', name: 'Pearl oyster', scientific: 'Pinctada margaritifera', type: 'shellfish', tier: 2, hp: [30, 36], behavior: 'armored' },
  { no: 99, id: 'hardClam', name: 'Hard clam', scientific: 'Mercenaria mercenaria', type: 'shellfish', tier: 1, hp: [20, 24], behavior: 'armored' },
  { no: 100, id: 'giantClam', name: 'Giant clam', scientific: 'Tridacna gigas', type: 'shellfish', tier: 3, hp: [60, 70], behavior: 'armored', strength: 2 },
  { no: 101, id: 'mediterraneanMussel', name: 'Mediterranean mussel', scientific: 'Mytilus galloprovincialis', type: 'shellfish', tier: 1, hp: [16, 20], behavior: 'armored' },
  { no: 102, id: 'greatScallop', name: 'Great scallop', scientific: 'Pecten maximus', type: 'shellfish', tier: 1, hp: [18, 22], behavior: 'armored' },
  { no: 103, id: 'spinyCockle', name: 'Spiny cockle', scientific: 'Acanthocardia aculeata', type: 'shellfish', tier: 1, hp: [18, 22], behavior: 'armored' },
  { no: 104, id: 'mediterraneanJelly', name: 'Mediterranean jelly', scientific: 'Cotylorhiza tuberculata', type: 'tentacled', tier: 1, hp: [18, 22], behavior: 'jellyfish' },
  { no: 105, id: 'nomadJellyfish', name: 'Nomad jellyfish', scientific: 'Rhopilema nomadica', type: 'tentacled', tier: 2, hp: [28, 34], behavior: 'jellyfish' },
  { no: 106, id: 'portugueseManOWar', name: 'Portuguese man o’ war', scientific: 'Physalia physalis', type: 'tentacled', tier: 3, hp: [48, 54], behavior: 'jellyfish', strength: 1 },
  { no: 107, id: 'commonJellyfish', name: 'Common jellyfish', scientific: 'Aurelia aurita', type: 'tentacled', tier: 1, hp: [16, 20], behavior: 'jellyfish' },
  { no: 108, id: 'flameJellyfish', name: 'Flame jellyfish', scientific: 'Rhopilema esculentum', type: 'tentacled', tier: 2, hp: [30, 36], behavior: 'jellyfish' },
  { no: 109, id: 'commonOctopus', name: 'Common octopus', scientific: 'Octopus vulgaris', type: 'tentacled', tier: 2, hp: [38, 44], behavior: 'cephalopod' },
  { no: 110, id: 'flapjackOctopus', name: 'Flapjack octopus', scientific: 'Opisthoteuthis californiana', type: 'tentacled', tier: 1, hp: [20, 24], behavior: 'cephalopod' },
  { no: 111, id: 'atlanticGiantSquid', name: 'Atlantic giant squid', scientific: 'Architeuthis dux', type: 'tentacled', tier: 3, hp: [70, 80], behavior: 'cephalopod', strength: 2 },
  { no: 112, id: 'commonSquid', name: 'Common squid', scientific: 'Loligo vulgaris', type: 'tentacled', tier: 2, hp: [30, 36], behavior: 'cephalopod' },
  { no: 113, id: 'cushionStar', name: 'Cushion star', scientific: 'Culcita novaeguineae', type: 'critter', tier: 1, hp: [20, 24], behavior: 'bottomDweller' },
  { no: 114, id: 'commonStarfish', name: 'Common starfish', scientific: 'Asterias rubens', type: 'critter', tier: 1, hp: [18, 22], behavior: 'bottomDweller' },
  { no: 115, id: 'seaSponge', name: 'Sea sponge', scientific: 'Spongia officinalis', type: 'critter', tier: 1, hp: [22, 26], behavior: 'bottomDweller' },
  { no: 116, id: 'seaUrchin', name: 'Sea urchin', scientific: 'Paracentrotus lividus', type: 'critter', tier: 1, hp: [18, 22], behavior: 'venomous' },
  { no: 117, id: 'redKingCrab', name: 'Red king crab', scientific: 'Paralithodes camtschaticus', type: 'crustacean', tier: 3, hp: [56, 64], behavior: 'crustacean', strength: 1 },
  { no: 118, id: 'commonHermitCrab', name: 'Common hermit crab', scientific: 'Pagurus bernhardus', type: 'crustacean', tier: 1, hp: [20, 24], behavior: 'crustacean' },
  { no: 119, id: 'blueCrab', name: 'Blue crab', scientific: 'Callinectes sapidus', type: 'crustacean', tier: 2, hp: [32, 38], behavior: 'crustacean' },
  { no: 120, id: 'yetiCrab', name: 'Yeti crab', scientific: 'Kiwa hirsuta', type: 'crustacean', tier: 2, hp: [30, 36], behavior: 'crustacean' },
  { no: 121, id: 'atlanticHorseshoeCrab', name: 'Atlantic horseshoe crab', scientific: 'Limulus polyphemus', type: 'crustacean', tier: 2, hp: [36, 42], behavior: 'crustacean' },
  { no: 122, id: 'atlanticCrayfish', name: 'Atlantic crayfish', scientific: 'Austropotamobius pallipes', type: 'crustacean', tier: 1, hp: [20, 24], behavior: 'crustacean' },
  { no: 123, id: 'commonLobster', name: 'Common lobster', scientific: 'Homarus gammarus', type: 'crustacean', tier: 2, hp: [42, 48], behavior: 'crustacean' },
  { no: 124, id: 'spinyLobster', name: 'Spiny lobster', scientific: 'Palinurus elephas', type: 'crustacean', tier: 2, hp: [40, 46], behavior: 'crustacean' },
  { no: 125, id: 'shrimp', name: 'Shrimp', scientific: 'Parapenaeus longirostris', type: 'crustacean', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 126, id: 'greenSeaTurtle', name: 'Green sea turtle', scientific: 'Chelonia mydas', type: 'critter', tier: 2, hp: [44, 50], behavior: 'armored' },
  { no: 127, id: 'axolotl', name: 'Axolotl', scientific: 'Ambystoma mexicanum', type: 'critter', tier: 1, hp: [18, 22], behavior: 'bottomDweller' },
  { no: 128, id: 'chamberedNautilus', name: 'Chambered nautilus', scientific: 'Nautilus pompilius', type: 'tentacled', tier: 2, hp: [32, 38], behavior: 'cephalopod' },
  { no: 129, id: 'gooseBarnacle', name: 'Goose barnacle', scientific: 'Pollicipes pollicipes', type: 'crustacean', tier: 1, hp: [16, 20], behavior: 'armored' },
  { no: 130, id: 'blueSeaDragon', name: 'Blue sea dragon', scientific: 'Glaucus atlanticus', type: 'critter', tier: 1, hp: [14, 18], behavior: 'venomous' },
  { no: 131, id: 'seaButterfly', name: 'Sea butterfly', scientific: 'Thecosomata', type: 'tentacled', tier: 1, hp: [10, 14], behavior: 'jellyfish' },
  { no: 132, id: 'giantCuttlefish', name: 'Giant cuttlefish', scientific: 'Sepia apama', type: 'tentacled', tier: 2, hp: [38, 44], behavior: 'cephalopod' },
  { no: 133, id: 'seaCucumber', name: 'Sea cucumber', scientific: 'Holothuria tubulosa', type: 'critter', tier: 1, hp: [20, 24], behavior: 'bottomDweller' },
  { no: 134, id: 'commonSeaSlug', name: 'Common sea slug', scientific: 'Aeolidia papillosa', type: 'critter', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 135, id: 'emeraldSeaSlug', name: 'Emerald sea slug', scientific: 'Elysia chlorotica', type: 'critter', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 136, id: 'leafSlug', name: 'Leaf slug', scientific: 'Costasiella kuroshimae', type: 'critter', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 137, id: 'seaBunny', name: 'Sea bunny', scientific: 'Jorunna parva', type: 'critter', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 138, id: 'giantIsopod', name: 'Giant isopod', scientific: 'Bathynomus giganteus', type: 'crustacean', tier: 2, hp: [34, 40], behavior: 'crustacean' },
  { no: 139, id: 'queenConch', name: 'Queen conch', scientific: 'Aliger gigas', type: 'shellfish', tier: 2, hp: [30, 36], behavior: 'armored' },
  { no: 140, id: 'purpleConeSnail', name: 'Purple cone snail', scientific: 'Conus purpurascens', type: 'shellfish', tier: 2, hp: [28, 32], behavior: 'venomous' },
  { no: 141, id: 'fireworm', name: 'Fireworm', scientific: 'Hermodice carunculata', type: 'critter', tier: 1, hp: [16, 20], behavior: 'venomous' },
  { no: 142, id: 'spoonWorm', name: 'Spoon worm', scientific: 'Bonellia viridis', type: 'critter', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 143, id: 'planaria', name: 'Planaria', scientific: 'Planaria torva', type: 'critter', tier: 1, hp: [10, 14], behavior: 'bottomDweller' },
  { no: 144, id: 'medicinalLeech', name: 'Medicinal leech', scientific: 'Hirudo medicinalis', type: 'critter', tier: 1, hp: [14, 18], behavior: 'eel' },
];
