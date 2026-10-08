import type { Habitat, Statuses } from '../engine';
import type { Behavior, BehaviorId } from './behaviors';

/**
 * Every creature you can meet, one line each. They become enemies (and
 * single-creature encounters) automatically.
 *
 * - `no`: number in assets/fish_names.pdf = position in assets/fishes.png
 *   (left to right, top to bottom, 12 per row).
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
  { no: 1, id: 'progenetica', name: 'Progenetica', scientific: 'Paedocypris progenetica', tier: 1, hp: [12, 15], behavior: 'schooling' },
  { no: 2, id: 'clownfish', name: 'Clownfish', scientific: 'Amphiprion ocellaris', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 3, id: 'blueTang', name: 'Blue tang', scientific: 'Paracanthurus hepatus', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 4, id: 'yellowTang', name: 'Yellow tang', scientific: 'Zebrasoma flavescens', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 5, id: 'gemTang', name: 'Gem tang', scientific: 'Zebrasoma gemmatum', tier: 1, hp: [20, 24], behavior: 'reefFish' },
  { no: 6, id: 'sailfinTang', name: 'Sailfin tang', scientific: 'Zebrasoma velifer', tier: 1, hp: [20, 24], behavior: 'reefFish' },
  { no: 7, id: 'angelfish', name: 'Angelfish', scientific: 'Pterophyllum scalare', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 8, id: 'queenAngelfish', name: 'Queen angelfish', scientific: 'Holacanthus ciliaris', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 9, id: 'frenchAngelfish', name: 'French angelfish', scientific: 'Pomacanthus paru', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 10, id: 'goldfish', name: 'Goldfish', scientific: 'Carassius auratus', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 11, id: 'fightingFish', name: 'Fighting fish', scientific: 'Betta splendens', tier: 1, hp: [18, 22], behavior: 'predator' },
  { no: 12, id: 'catfish', name: 'Catfish', scientific: 'Silurus glanis', tier: 2, hp: [40, 46], behavior: 'ambusher' },
  { no: 13, id: 'porcupinefish', name: 'Porcupinefish', scientific: 'Diodon holocanthus', tier: 2, hp: [32, 38], behavior: 'puffer' },
  { no: 14, id: 'spottedPufferfish', name: 'Spotted pufferfish', scientific: 'Dichotomyctere nigroviridis', tier: 1, hp: [24, 28], behavior: 'puffer' },
  { no: 15, id: 'oceanSunfish', name: 'Ocean sunfish', scientific: 'Mola mola', tier: 3, hp: [70, 80], behavior: 'giant' },
  { no: 16, id: 'mahiMahi', name: 'Mahi mahi', scientific: 'Coryphaena hippurus', tier: 2, hp: [38, 44], behavior: 'predator' },
  { no: 17, id: 'roulesGoby', name: 'Roule’s goby', scientific: 'Gobius roulei', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  {
    no: 18, id: 'redPiranha', name: 'Red piranha', scientific: 'Pygocentrus nattereri', tier: 2, hp: [28, 32],
    behavior: {
      moves: [
        { id: 'frenzy', name: 'Frenzy', effects: [{ type: 'dealDamage', amount: 3, hits: 3 }] },
        { id: 'smellBlood', name: 'Smell Blood', effects: [{ type: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
      ],
      pattern: { type: 'sequence', moves: ['frenzy', 'frenzy', 'smellBlood'] },
    },
  },
  { no: 19, id: 'lionfish', name: 'Lionfish', scientific: 'Pterois volitans', tier: 2, hp: [34, 40], behavior: 'venomous' },
  { no: 20, id: 'redScorpionfish', name: 'Red scorpionfish', scientific: 'Scorpaena scrofa', tier: 2, hp: [36, 42], behavior: 'venomous' },
  { no: 21, id: 'stonefish', name: 'Stonefish', scientific: 'Synanceia horrida', tier: 3, hp: [52, 58], behavior: 'venomous', strength: 1 },
  { no: 22, id: 'flyingFish', name: 'Flying fish', scientific: 'Exocoetus volitans', tier: 1, hp: [16, 20], behavior: 'schooling' },
  { no: 23, id: 'guppy', name: 'Guppy', scientific: 'Poecilia reticula', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 24, id: 'sailfinMolly', name: 'Sailfin molly', scientific: 'Poecilia velifera', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 25, id: 'greaterWeever', name: 'Greater weever', scientific: 'Trachinus draco', tier: 1, hp: [24, 28], behavior: 'venomous' },
  { no: 26, id: 'sockeyeSalmon', name: 'Sockeye salmon', scientific: 'Oncorhynchus nerka', tier: 2, hp: [38, 44], behavior: 'fighter' },
  { no: 27, id: 'taimen', name: 'Taimen', scientific: 'Hucho taimen', tier: 3, hp: [58, 64], behavior: 'predator' },
  { no: 28, id: 'atlanticSalmon', name: 'Atlantic salmon', scientific: 'Salmo salar', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 29, id: 'masu', name: 'Masu', scientific: 'Oncorhynchus masou', tier: 2, hp: [34, 40], behavior: 'fighter' },
  { no: 30, id: 'europeanAngler', name: 'European angler', scientific: 'Lophius piscatorius', tier: 3, hp: [56, 62], behavior: 'ambusher' },
  { no: 31, id: 'humpbackAnglerfish', name: 'Humpback anglerfish', scientific: 'Melanocetus johnsonii', tier: 3, hp: [52, 58], behavior: 'ambusher' },
  { no: 32, id: 'hairyFrogfish', name: 'Hairy frogfish', scientific: 'Antennarius striatus', tier: 2, hp: [32, 38], behavior: 'ambusher' },
  { no: 33, id: 'commonCarp', name: 'Common carp', scientific: 'Cyprinus carpio', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 34, id: 'tench', name: 'Tench', scientific: 'Tinca tinca', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 35, id: 'koiCarp', name: 'Koi carp', scientific: 'Cyprinus carpio', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 36, id: 'barracuda', name: 'Barracuda', scientific: 'Sphyraena', tier: 3, hp: [54, 60], behavior: 'predator', strength: 1 },
  { no: 37, id: 'cardinalTetra', name: 'Cardinal tetra', scientific: 'Paracheirodon axelrodi', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 38, id: 'emperorTetra', name: 'Emperor tetra', scientific: 'Nematobrycon palmeri', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 39, id: 'zebrafish', name: 'Zebrafish', scientific: 'Danio rerio', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 40, id: 'petticoatTetra', name: 'Petticoat tetra', scientific: 'Gymnocorymbus ternetzi', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 41, id: 'perch', name: 'Perch', scientific: 'Perca fluviatilis', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 42, id: 'starrySturgeon', name: 'Starry sturgeon', scientific: 'Acipenser stellatus', tier: 3, hp: [64, 72], behavior: 'giant' },
  { no: 43, id: 'lakeSturgeon', name: 'Lake sturgeon', scientific: 'Acipenser fulvescens', tier: 3, hp: [68, 76], behavior: 'giant' },
  { no: 44, id: 'stripedMarlin', name: 'Striped marlin', scientific: 'Kajikia audax', tier: 3, hp: [62, 70], behavior: 'predator', strength: 1 },
  { no: 45, id: 'swordfish', name: 'Swordfish', scientific: 'Xiphias gladius', tier: 3, hp: [64, 72], behavior: 'predator', strength: 2 },
  { no: 46, id: 'garfish', name: 'Garfish', scientific: 'Belone belone', tier: 1, hp: [20, 24], behavior: 'predator' },
  { no: 47, id: 'europeanPilchard', name: 'European pilchard', scientific: 'Sardina pilchardus', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 48, id: 'atlanticHerring', name: 'Atlantic herring', scientific: 'Clupea harengus', tier: 1, hp: [14, 18], behavior: 'schooling' },
  { no: 49, id: 'blackspotSeabream', name: 'Blackspot seabream', scientific: 'Pagellus bogaraveo', tier: 1, hp: [24, 28], behavior: 'fighter' },
  { no: 50, id: 'silverSeabream', name: 'Silver seabream', scientific: 'Sparus aurata', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 51, id: 'atlanticCod', name: 'Atlantic cod', scientific: 'Gadus morhua', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 52, id: 'hake', name: 'Hake', scientific: 'Merluccius', tier: 2, hp: [34, 40], behavior: 'predator' },
  { no: 53, id: 'bluefinTuna', name: 'Bluefin tuna', scientific: 'Thunnus thynnus', tier: 3, hp: [72, 80], behavior: 'giant', strength: 1 },
  {
    no: 54, id: 'pike', name: 'Pike', scientific: 'Esox lucius', tier: 2, hp: [40, 44],
    behavior: {
      moves: [
        { id: 'snap', name: 'Snap', effects: [{ type: 'dealDamage', amount: 11 }] },
        { id: 'thrash', name: 'Thrash', effects: [{ type: 'dealDamage', amount: 7 }, { type: 'gainBlock', amount: 5 }] },
        { id: 'lurk', name: 'Lurk in the Reeds', effects: [{ type: 'applyStatus', status: 'strength', amount: 3, target: 'self' }, { type: 'gainBlock', amount: 6 }] },
      ],
      pattern: { type: 'weighted', firstMove: 'snap', weights: { snap: 25, thrash: 30, lurk: 45 }, maxConsecutive: 1 },
    },
  },
  { no: 55, id: 'commonBarbel', name: 'Common barbel', scientific: 'Barbus barbus', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 56, id: 'tigerBarb', name: 'Tiger barb', scientific: 'Puntigus tetrazona', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 57, id: 'cherryBarb', name: 'Cherry barb', scientific: 'Puntius titteya', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 58, id: 'opah', name: 'Opah', scientific: 'Lampris guttatus', tier: 3, hp: [60, 68], behavior: 'giant' },
  { no: 59, id: 'blueDiscus', name: 'Blue discus', scientific: 'Symphysodon aequifasciatus', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 60, id: 'rainbowTrout', name: 'Rainbow trout', scientific: 'Oncorhynchus mykiss', tier: 2, hp: [34, 40], behavior: 'fighter' },
  { no: 61, id: 'ribbonEel', name: 'Ribbon eel', scientific: 'Rhinomuraena quaesita', tier: 1, hp: [22, 26], behavior: 'eel' },
  { no: 62, id: 'giantMorayEel', name: 'Giant moray eel', scientific: 'Gymnothorax javanicus', tier: 3, hp: [56, 62], behavior: 'eel', strength: 1 },
  { no: 63, id: 'europeanConger', name: 'European conger', scientific: 'Conger conger', tier: 2, hp: [40, 46], behavior: 'eel' },
  { no: 64, id: 'harlequinSnakeEel', name: 'Harlequin snake eel', scientific: 'Myrichthys colubrinus', tier: 2, hp: [30, 36], behavior: 'eel' },
  { no: 65, id: 'oarfish', name: 'Oarfish', scientific: 'Regalecus glesne', tier: 3, hp: [76, 86], behavior: 'giant' },
  { no: 66, id: 'africanCoelacanth', name: 'African coelacanth', scientific: 'Latimeria chalumnae', tier: 3, hp: [66, 74], behavior: 'giant' },
  { no: 67, id: 'longnoseGar', name: 'Longnose gar', scientific: 'Lepisosteus osseus', tier: 2, hp: [38, 44], behavior: 'predator' },
  { no: 68, id: 'saddledBichir', name: 'Saddled bichir', scientific: 'Polypterus endlicheri', tier: 2, hp: [30, 36], behavior: 'predator' },
  { no: 69, id: 'senegalBichir', name: 'Senegal bichir', scientific: 'Polypterus senegalus', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 70, id: 'turbot', name: 'Turbot', scientific: 'Scophthalmus maximus', tier: 2, hp: [36, 42], behavior: 'ambusher' },
  { no: 71, id: 'europeanSeabass', name: 'European seabass', scientific: 'Dicentrarchus labrax', tier: 2, hp: [36, 42], behavior: 'predator' },
  { no: 72, id: 'europeanAnchovy', name: 'European anchovy', scientific: 'Engraulis encrasicolus', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 73, id: 'humpheadWrasse', name: 'Humphead wrasse', scientific: 'Cheilinus undulatus', tier: 3, hp: [60, 68], behavior: 'giant' },
  { no: 74, id: 'commonStingray', name: 'Common stingray', scientific: 'Dasyatis pastinaca', tier: 3, hp: [52, 58], behavior: 'venomous' },
  { no: 75, id: 'shortfinMakoShark', name: 'Shortfin mako shark', scientific: 'Isurus oxyrinchus', tier: 3, hp: [70, 78], behavior: 'predator', strength: 2 },
  { no: 76, id: 'riverLamprey', name: 'River lamprey', scientific: 'Lampetra fluviatilis', tier: 1, hp: [20, 24], behavior: 'eel' },
  { no: 77, id: 'racoonButterfish', name: 'Racoon butterfish', scientific: 'Chaetodon lunula', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 78, id: 'atlanticTrumpetfish', name: 'Atlantic trumpetfish', scientific: 'Aulostomus strigosus', tier: 1, hp: [20, 24], behavior: 'predator' },
  { no: 79, id: 'bartlettsAnthias', name: 'Bartlett’s anthias', scientific: 'Pseudanthias bartlettorum', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 80, id: 'fireGoby', name: 'Fire goby', scientific: 'Nemateleotris magnifica', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 81, id: 'atlanticSpadefish', name: 'Atlantic spadefish', scientific: 'Chaetodipterus faber', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 82, id: 'blueAcara', name: 'Blue acara', scientific: 'Andinoacara pulcher', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 83, id: 'oscar', name: 'Oscar', scientific: 'Astronotus ocellatus', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 84, id: 'dwarfGourami', name: 'Dwarf gourami', scientific: 'Trichogaster lalius', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 85, id: 'clownLoach', name: 'Clown loach', scientific: 'Chromobotia macracanthus', tier: 1, hp: [16, 20], behavior: 'bottomDweller' },
  { no: 86, id: 'arapaima', name: 'Arapaima', scientific: 'Arapaima gigas', tier: 3, hp: [74, 82], behavior: 'giant' },
  { no: 87, id: 'asianArowana', name: 'Asian arowana', scientific: 'Scleropages formosus', tier: 2, hp: [36, 42], behavior: 'predator' },
  { no: 88, id: 'moorishIdol', name: 'Moorish idol', scientific: 'Zanclus cornutus', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 89, id: 'banggaiCardinalfish', name: 'Banggai cardinalfish', scientific: 'Pterapogon kauderni', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 90, id: 'longhornCowfish', name: 'Longhorn cowfish', scientific: 'Lactoria cornuta', tier: 1, hp: [20, 24], behavior: 'puffer' },
  { no: 91, id: 'hogfish', name: 'Hogfish', scientific: 'Lachnolaimus maximus', tier: 1, hp: [24, 28], behavior: 'fighter' },
  { no: 92, id: 'blueheadWrasse', name: 'Bluehead wrasse', scientific: 'Thalassoma bifasciatum', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 93, id: 'lumpfish', name: 'Lumpfish', scientific: 'Cyclopterus lumpus', tier: 2, hp: [30, 36], behavior: 'puffer' },
  { no: 94, id: 'boesemansRainbowfish', name: 'Boeseman’s rainbowfish', scientific: 'Melanotaenia boesemani', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 95, id: 'hillstreamLoach', name: 'Hillstream loach', scientific: 'Beaufortia kweichowensis', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 96, id: 'seahorse', name: 'Seahorse', scientific: 'Hippocampus hippocampus', tier: 1, hp: [12, 16], behavior: 'reefFish' },

  // --- Shellfish, jellyfish, cephalopods, crustaceans & co. (rows 9–12) ------
  { no: 97, id: 'pacificOyster', name: 'Pacific oyster', scientific: 'Crassostrea gigas', tier: 1, hp: [20, 24], behavior: 'armored' },
  { no: 98, id: 'pearlOyster', name: 'Pearl oyster', scientific: 'Pinctada margaritifera', tier: 2, hp: [30, 36], behavior: 'armored' },
  { no: 99, id: 'hardClam', name: 'Hard clam', scientific: 'Mercenaria mercenaria', tier: 1, hp: [20, 24], behavior: 'armored' },
  { no: 100, id: 'giantClam', name: 'Giant clam', scientific: 'Tridacna gigas', tier: 3, hp: [60, 70], behavior: 'armored', strength: 2 },
  { no: 101, id: 'mediterraneanMussel', name: 'Mediterranean mussel', scientific: 'Mytilus galloprovincialis', tier: 1, hp: [16, 20], behavior: 'armored' },
  { no: 102, id: 'greatScallop', name: 'Great scallop', scientific: 'Pecten maximus', tier: 1, hp: [18, 22], behavior: 'armored' },
  { no: 103, id: 'spinyCockle', name: 'Spiny cockle', scientific: 'Acanthocardia aculeata', tier: 1, hp: [18, 22], behavior: 'armored' },
  { no: 104, id: 'mediterraneanJelly', name: 'Mediterranean jelly', scientific: 'Cotylorhiza tuberculata', tier: 1, hp: [18, 22], behavior: 'jellyfish' },
  { no: 105, id: 'nomadJellyfish', name: 'Nomad jellyfish', scientific: 'Rhopilema nomadica', tier: 2, hp: [28, 34], behavior: 'jellyfish' },
  { no: 106, id: 'portugueseManOWar', name: 'Portuguese man o’ war', scientific: 'Physalia physalis', tier: 3, hp: [48, 54], behavior: 'jellyfish', strength: 1 },
  { no: 107, id: 'commonJellyfish', name: 'Common jellyfish', scientific: 'Aurelia aurita', tier: 1, hp: [16, 20], behavior: 'jellyfish' },
  { no: 108, id: 'flameJellyfish', name: 'Flame jellyfish', scientific: 'Rhopilema esculentum', tier: 2, hp: [30, 36], behavior: 'jellyfish' },
  { no: 109, id: 'commonOctopus', name: 'Common octopus', scientific: 'Octopus vulgaris', tier: 2, hp: [38, 44], behavior: 'cephalopod' },
  { no: 110, id: 'flapjackOctopus', name: 'Flapjack octopus', scientific: 'Opisthoteuthis californiana', tier: 1, hp: [20, 24], behavior: 'cephalopod' },
  { no: 111, id: 'atlanticGiantSquid', name: 'Atlantic giant squid', scientific: 'Architeuthis dux', tier: 3, hp: [70, 80], behavior: 'cephalopod', strength: 2 },
  { no: 112, id: 'commonSquid', name: 'Common squid', scientific: 'Loligo vulgaris', tier: 2, hp: [30, 36], behavior: 'cephalopod' },
  { no: 113, id: 'cushionStar', name: 'Cushion star', scientific: 'Culcita novaeguineae', tier: 1, hp: [20, 24], behavior: 'bottomDweller' },
  { no: 114, id: 'commonStarfish', name: 'Common starfish', scientific: 'Asterias rubens', tier: 1, hp: [18, 22], behavior: 'bottomDweller' },
  { no: 115, id: 'seaSponge', name: 'Sea sponge', scientific: 'Spongia officinalis', tier: 1, hp: [22, 26], behavior: 'bottomDweller' },
  { no: 116, id: 'seaUrchin', name: 'Sea urchin', scientific: 'Paracentrotus lividus', tier: 1, hp: [18, 22], behavior: 'venomous' },
  { no: 117, id: 'redKingCrab', name: 'Red king crab', scientific: 'Paralithodes camtschaticus', tier: 3, hp: [56, 64], behavior: 'crustacean', strength: 1 },
  { no: 118, id: 'commonHermitCrab', name: 'Common hermit crab', scientific: 'Pagurus bernhardus', tier: 1, hp: [20, 24], behavior: 'crustacean' },
  { no: 119, id: 'blueCrab', name: 'Blue crab', scientific: 'Callinectes sapidus', tier: 2, hp: [32, 38], behavior: 'crustacean' },
  { no: 120, id: 'yetiCrab', name: 'Yeti crab', scientific: 'Kiwa hirsuta', tier: 2, hp: [30, 36], behavior: 'crustacean' },
  { no: 121, id: 'atlanticHorseshoeCrab', name: 'Atlantic horseshoe crab', scientific: 'Limulus polyphemus', tier: 2, hp: [36, 42], behavior: 'crustacean' },
  { no: 122, id: 'atlanticCrayfish', name: 'Atlantic crayfish', scientific: 'Austropotamobius pallipes', tier: 1, hp: [20, 24], behavior: 'crustacean' },
  { no: 123, id: 'commonLobster', name: 'Common lobster', scientific: 'Homarus gammarus', tier: 2, hp: [42, 48], behavior: 'crustacean' },
  { no: 124, id: 'spinyLobster', name: 'Spiny lobster', scientific: 'Palinurus elephas', tier: 2, hp: [40, 46], behavior: 'crustacean' },
  { no: 125, id: 'shrimp', name: 'Shrimp', scientific: 'Parapenaeus longirostris', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 126, id: 'greenSeaTurtle', name: 'Green sea turtle', scientific: 'Chelonia mydas', tier: 2, hp: [44, 50], behavior: 'armored' },
  { no: 127, id: 'axolotl', name: 'Axolotl', scientific: 'Ambystoma mexicanum', tier: 1, hp: [18, 22], behavior: 'bottomDweller' },
  { no: 128, id: 'chamberedNautilus', name: 'Chambered nautilus', scientific: 'Nautilus pompilius', tier: 2, hp: [32, 38], behavior: 'cephalopod' },
  { no: 129, id: 'gooseBarnacle', name: 'Goose barnacle', scientific: 'Pollicipes pollicipes', tier: 1, hp: [16, 20], behavior: 'armored' },
  { no: 130, id: 'blueSeaDragon', name: 'Blue sea dragon', scientific: 'Glaucus atlanticus', tier: 1, hp: [14, 18], behavior: 'venomous' },
  { no: 131, id: 'seaButterfly', name: 'Sea butterfly', scientific: 'Thecosomata', tier: 1, hp: [10, 14], behavior: 'jellyfish' },
  { no: 132, id: 'giantCuttlefish', name: 'Giant cuttlefish', scientific: 'Sepia apama', tier: 2, hp: [38, 44], behavior: 'cephalopod' },
  { no: 133, id: 'seaCucumber', name: 'Sea cucumber', scientific: 'Holothuria tubulosa', tier: 1, hp: [20, 24], behavior: 'bottomDweller' },
  { no: 134, id: 'commonSeaSlug', name: 'Common sea slug', scientific: 'Aeolidia papillosa', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 135, id: 'emeraldSeaSlug', name: 'Emerald sea slug', scientific: 'Elysia chlorotica', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 136, id: 'leafSlug', name: 'Leaf slug', scientific: 'Costasiella kuroshimae', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 137, id: 'seaBunny', name: 'Sea bunny', scientific: 'Jorunna parva', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 138, id: 'giantIsopod', name: 'Giant isopod', scientific: 'Bathynomus giganteus', tier: 2, hp: [34, 40], behavior: 'crustacean' },
  { no: 139, id: 'queenConch', name: 'Queen conch', scientific: 'Aliger gigas', tier: 2, hp: [30, 36], behavior: 'armored' },
  { no: 140, id: 'purpleConeSnail', name: 'Purple cone snail', scientific: 'Conus purpurascens', tier: 2, hp: [28, 32], behavior: 'venomous' },
  { no: 141, id: 'fireworm', name: 'Fireworm', scientific: 'Hermodice carunculata', tier: 1, hp: [16, 20], behavior: 'venomous' },
  { no: 142, id: 'spoonWorm', name: 'Spoon worm', scientific: 'Bonellia viridis', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 143, id: 'planaria', name: 'Planaria', scientific: 'Planaria torva', tier: 1, hp: [10, 14], behavior: 'bottomDweller' },
  { no: 144, id: 'medicinalLeech', name: 'Medicinal leech', scientific: 'Hirudo medicinalis', tier: 1, hp: [14, 18], behavior: 'eel' },
];
