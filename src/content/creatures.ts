import type { Statuses } from '../engine';
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
 */
export interface CreatureDef {
  no: number;
  id: string;
  name: string;
  /** Spanish name. */
  es: string;
  scientific: string;
  tier: 1 | 2 | 3;
  hp: [number, number];
  behavior: BehaviorId | Behavior;
  strength?: number;
  /** Any other statuses it starts with, e.g. { vulnerable: 2 }. */
  statuses?: Statuses;
}

export const creatures: CreatureDef[] = [
  // --- Fish (rows 1–8) -------------------------------------------------------
  { no: 1, id: 'progenetica', name: 'Progenetica', es: 'Progenetica', scientific: 'Paedocypris progenetica', tier: 1, hp: [12, 15], behavior: 'schooling' },
  { no: 2, id: 'clownfish', name: 'Clownfish', es: 'Pez payaso', scientific: 'Amphiprion ocellaris', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 3, id: 'blueTang', name: 'Blue tang', es: 'Pez cirujano azul', scientific: 'Paracanthurus hepatus', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 4, id: 'yellowTang', name: 'Yellow tang', es: 'Pez cirujano amarillo', scientific: 'Zebrasoma flavescens', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 5, id: 'gemTang', name: 'Gem tang', es: 'Pez cirujano moteado', scientific: 'Zebrasoma gemmatum', tier: 1, hp: [20, 24], behavior: 'reefFish' },
  { no: 6, id: 'sailfinTang', name: 'Sailfin tang', es: 'Pez cirujano vela', scientific: 'Zebrasoma velifer', tier: 1, hp: [20, 24], behavior: 'reefFish' },
  { no: 7, id: 'angelfish', name: 'Angelfish', es: 'Pez ángel', scientific: 'Pterophyllum scalare', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 8, id: 'queenAngelfish', name: 'Queen angelfish', es: 'Pez ángel reina', scientific: 'Holacanthus ciliaris', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 9, id: 'frenchAngelfish', name: 'French angelfish', es: 'Pez ángel francés', scientific: 'Pomacanthus paru', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 10, id: 'goldfish', name: 'Goldfish', es: 'Pez dorado', scientific: 'Carassius auratus', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 11, id: 'fightingFish', name: 'Fighting fish', es: 'Pez luchador', scientific: 'Betta splendens', tier: 1, hp: [18, 22], behavior: 'predator' },
  { no: 12, id: 'catfish', name: 'Catfish', es: 'Pez gato', scientific: 'Silurus glanis', tier: 2, hp: [40, 46], behavior: 'ambusher' },
  { no: 13, id: 'porcupinefish', name: 'Porcupinefish', es: 'Pez erizo', scientific: 'Diodon holocanthus', tier: 2, hp: [32, 38], behavior: 'puffer' },
  { no: 14, id: 'spottedPufferfish', name: 'Spotted pufferfish', es: 'Pez globo moteado', scientific: 'Dichotomyctere nigroviridis', tier: 1, hp: [24, 28], behavior: 'puffer' },
  { no: 15, id: 'oceanSunfish', name: 'Ocean sunfish', es: 'Pez luna', scientific: 'Mola mola', tier: 3, hp: [70, 80], behavior: 'giant' },
  { no: 16, id: 'mahiMahi', name: 'Mahi mahi', es: 'Mahi mahi', scientific: 'Coryphaena hippurus', tier: 2, hp: [38, 44], behavior: 'predator' },
  { no: 17, id: 'roulesGoby', name: 'Roule’s goby', es: 'Gobio de roulei', scientific: 'Gobius roulei', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  {
    no: 18, id: 'redPiranha', name: 'Red piranha', es: 'Piraña de vientre rojo', scientific: 'Pygocentrus nattereri', tier: 2, hp: [28, 32],
    behavior: {
      moves: [
        { id: 'frenzy', name: 'Frenzy', effects: [{ type: 'dealDamage', amount: 3, hits: 3 }] },
        { id: 'smellBlood', name: 'Smell Blood', effects: [{ type: 'applyStatus', status: 'strength', amount: 2, target: 'self' }] },
      ],
      pattern: { type: 'sequence', moves: ['frenzy', 'frenzy', 'smellBlood'] },
    },
  },
  { no: 19, id: 'lionfish', name: 'Lionfish', es: 'Pez león', scientific: 'Pterois volitans', tier: 2, hp: [34, 40], behavior: 'venomous' },
  { no: 20, id: 'redScorpionfish', name: 'Red scorpionfish', es: 'Escórpora', scientific: 'Scorpaena scrofa', tier: 2, hp: [36, 42], behavior: 'venomous' },
  { no: 21, id: 'stonefish', name: 'Stonefish', es: 'Pez piedra', scientific: 'Synanceia horrida', tier: 3, hp: [52, 58], behavior: 'venomous', strength: 1 },
  { no: 22, id: 'flyingFish', name: 'Flying fish', es: 'Pez volador', scientific: 'Exocoetus volitans', tier: 1, hp: [16, 20], behavior: 'schooling' },
  { no: 23, id: 'guppy', name: 'Guppy', es: 'Guppy', scientific: 'Poecilia reticula', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 24, id: 'sailfinMolly', name: 'Sailfin molly', es: 'Velifera', scientific: 'Poecilia velifera', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 25, id: 'greaterWeever', name: 'Greater weever', es: 'Pez araña', scientific: 'Trachinus draco', tier: 1, hp: [24, 28], behavior: 'venomous' },
  { no: 26, id: 'sockeyeSalmon', name: 'Sockeye salmon', es: 'Salmón rojo', scientific: 'Oncorhynchus nerka', tier: 2, hp: [38, 44], behavior: 'fighter' },
  { no: 27, id: 'taimen', name: 'Taimen', es: 'Taimen', scientific: 'Hucho taimen', tier: 3, hp: [58, 64], behavior: 'predator' },
  { no: 28, id: 'atlanticSalmon', name: 'Atlantic salmon', es: 'Salmón atlántico', scientific: 'Salmo salar', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 29, id: 'masu', name: 'Masu', es: 'Salmón japonés', scientific: 'Oncorhynchus masou', tier: 2, hp: [34, 40], behavior: 'fighter' },
  { no: 30, id: 'europeanAngler', name: 'European angler', es: 'Rape', scientific: 'Lophius piscatorius', tier: 3, hp: [56, 62], behavior: 'ambusher' },
  { no: 31, id: 'humpbackAnglerfish', name: 'Humpback anglerfish', es: 'Diablo negro', scientific: 'Melanocetus johnsonii', tier: 3, hp: [52, 58], behavior: 'ambusher' },
  { no: 32, id: 'hairyFrogfish', name: 'Hairy frogfish', es: 'Pez sapo peludo', scientific: 'Antennarius striatus', tier: 2, hp: [32, 38], behavior: 'ambusher' },
  { no: 33, id: 'commonCarp', name: 'Common carp', es: 'Carpa común', scientific: 'Cyprinus carpio', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 34, id: 'tench', name: 'Tench', es: 'Tenca', scientific: 'Tinca tinca', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 35, id: 'koiCarp', name: 'Koi carp', es: 'Carpa koi', scientific: 'Cyprinus carpio', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 36, id: 'barracuda', name: 'Barracuda', es: 'Barracuda', scientific: 'Sphyraena', tier: 3, hp: [54, 60], behavior: 'predator', strength: 1 },
  { no: 37, id: 'cardinalTetra', name: 'Cardinal tetra', es: 'Tetra cardenal', scientific: 'Paracheirodon axelrodi', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 38, id: 'emperorTetra', name: 'Emperor tetra', es: 'Tetra emperador', scientific: 'Nematobrycon palmeri', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 39, id: 'zebrafish', name: 'Zebrafish', es: 'Pez cebra', scientific: 'Danio rerio', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 40, id: 'petticoatTetra', name: 'Petticoat tetra', es: 'Tetra monjita', scientific: 'Gymnocorymbus ternetzi', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 41, id: 'perch', name: 'Perch', es: 'Perca', scientific: 'Perca fluviatilis', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 42, id: 'starrySturgeon', name: 'Starry sturgeon', es: 'Esturión estrellado', scientific: 'Acipenser stellatus', tier: 3, hp: [64, 72], behavior: 'giant' },
  { no: 43, id: 'lakeSturgeon', name: 'Lake sturgeon', es: 'Esturión de lago', scientific: 'Acipenser fulvescens', tier: 3, hp: [68, 76], behavior: 'giant' },
  { no: 44, id: 'stripedMarlin', name: 'Striped marlin', es: 'Marlin rayado', scientific: 'Kajikia audax', tier: 3, hp: [62, 70], behavior: 'predator', strength: 1 },
  { no: 45, id: 'swordfish', name: 'Swordfish', es: 'Pez espada', scientific: 'Xiphias gladius', tier: 3, hp: [64, 72], behavior: 'predator', strength: 2 },
  { no: 46, id: 'garfish', name: 'Garfish', es: 'Pez aguja', scientific: 'Belone belone', tier: 1, hp: [20, 24], behavior: 'predator' },
  { no: 47, id: 'europeanPilchard', name: 'European pilchard', es: 'Sardina común', scientific: 'Sardina pilchardus', tier: 1, hp: [12, 16], behavior: 'schooling' },
  { no: 48, id: 'atlanticHerring', name: 'Atlantic herring', es: 'Arenque común', scientific: 'Clupea harengus', tier: 1, hp: [14, 18], behavior: 'schooling' },
  { no: 49, id: 'blackspotSeabream', name: 'Blackspot seabream', es: 'Besugo', scientific: 'Pagellus bogaraveo', tier: 1, hp: [24, 28], behavior: 'fighter' },
  { no: 50, id: 'silverSeabream', name: 'Silver seabream', es: 'Dorada', scientific: 'Sparus aurata', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 51, id: 'atlanticCod', name: 'Atlantic cod', es: 'Bacalao común', scientific: 'Gadus morhua', tier: 2, hp: [40, 46], behavior: 'fighter' },
  { no: 52, id: 'hake', name: 'Hake', es: 'Merluza', scientific: 'Merluccius', tier: 2, hp: [34, 40], behavior: 'predator' },
  { no: 53, id: 'bluefinTuna', name: 'Bluefin tuna', es: 'Atún común', scientific: 'Thunnus thynnus', tier: 3, hp: [72, 80], behavior: 'giant', strength: 1 },
  {
    no: 54, id: 'pike', name: 'Pike', es: 'Lucio', scientific: 'Esox lucius', tier: 2, hp: [40, 44],
    behavior: {
      moves: [
        { id: 'snap', name: 'Snap', effects: [{ type: 'dealDamage', amount: 11 }] },
        { id: 'thrash', name: 'Thrash', effects: [{ type: 'dealDamage', amount: 7 }, { type: 'gainBlock', amount: 5 }] },
        { id: 'lurk', name: 'Lurk in the Reeds', effects: [{ type: 'applyStatus', status: 'strength', amount: 3, target: 'self' }, { type: 'gainBlock', amount: 6 }] },
      ],
      pattern: { type: 'weighted', firstMove: 'snap', weights: { snap: 25, thrash: 30, lurk: 45 }, maxConsecutive: 1 },
    },
  },
  { no: 55, id: 'commonBarbel', name: 'Common barbel', es: 'Barbo común', scientific: 'Barbus barbus', tier: 1, hp: [26, 30], behavior: 'fighter' },
  { no: 56, id: 'tigerBarb', name: 'Tiger barb', es: 'Barbo tigre', scientific: 'Puntigus tetrazona', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 57, id: 'cherryBarb', name: 'Cherry barb', es: 'Barbo cereza', scientific: 'Puntius titteya', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 58, id: 'opah', name: 'Opah', es: 'Opah', scientific: 'Lampris guttatus', tier: 3, hp: [60, 68], behavior: 'giant' },
  { no: 59, id: 'blueDiscus', name: 'Blue discus', es: 'Pez disco azul', scientific: 'Symphysodon aequifasciatus', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 60, id: 'rainbowTrout', name: 'Rainbow trout', es: 'Trucha arcoíris', scientific: 'Oncorhynchus mykiss', tier: 2, hp: [34, 40], behavior: 'fighter' },
  { no: 61, id: 'ribbonEel', name: 'Ribbon eel', es: 'Anguila listón azul', scientific: 'Rhinomuraena quaesita', tier: 1, hp: [22, 26], behavior: 'eel' },
  { no: 62, id: 'giantMorayEel', name: 'Giant moray eel', es: 'Morena gigante', scientific: 'Gymnothorax javanicus', tier: 3, hp: [56, 62], behavior: 'eel', strength: 1 },
  { no: 63, id: 'europeanConger', name: 'European conger', es: 'Congrio', scientific: 'Conger conger', tier: 2, hp: [40, 46], behavior: 'eel' },
  { no: 64, id: 'harlequinSnakeEel', name: 'Harlequin snake eel', es: 'Tieso arlequín', scientific: 'Myrichthys colubrinus', tier: 2, hp: [30, 36], behavior: 'eel' },
  { no: 65, id: 'oarfish', name: 'Oarfish', es: 'Pez remo', scientific: 'Regalecus glesne', tier: 3, hp: [76, 86], behavior: 'giant' },
  { no: 66, id: 'africanCoelacanth', name: 'African coelacanth', es: 'Celacanto de Comoras', scientific: 'Latimeria chalumnae', tier: 3, hp: [66, 74], behavior: 'giant' },
  { no: 67, id: 'longnoseGar', name: 'Longnose gar', es: 'Pez caimán', scientific: 'Lepisosteus osseus', tier: 2, hp: [38, 44], behavior: 'predator' },
  { no: 68, id: 'saddledBichir', name: 'Saddled bichir', es: 'Bichir ensillado', scientific: 'Polypterus endlicheri', tier: 2, hp: [30, 36], behavior: 'predator' },
  { no: 69, id: 'senegalBichir', name: 'Senegal bichir', es: 'Bichir de Senegal', scientific: 'Polypterus senegalus', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 70, id: 'turbot', name: 'Turbot', es: 'Rodaballo', scientific: 'Scophthalmus maximus', tier: 2, hp: [36, 42], behavior: 'ambusher' },
  { no: 71, id: 'europeanSeabass', name: 'European seabass', es: 'Lubina', scientific: 'Dicentrarchus labrax', tier: 2, hp: [36, 42], behavior: 'predator' },
  { no: 72, id: 'europeanAnchovy', name: 'European anchovy', es: 'Boquerón', scientific: 'Engraulis encrasicolus', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 73, id: 'humpheadWrasse', name: 'Humphead wrasse', es: 'Pez Napoleón', scientific: 'Cheilinus undulatus', tier: 3, hp: [60, 68], behavior: 'giant' },
  { no: 74, id: 'commonStingray', name: 'Common stingray', es: 'Raya látigo común', scientific: 'Dasyatis pastinaca', tier: 3, hp: [52, 58], behavior: 'venomous' },
  { no: 75, id: 'shortfinMakoShark', name: 'Shortfin mako shark', es: 'Marrajo común', scientific: 'Isurus oxyrinchus', tier: 3, hp: [70, 78], behavior: 'predator', strength: 2 },
  { no: 76, id: 'riverLamprey', name: 'River lamprey', es: 'Lamprea de río', scientific: 'Lampetra fluviatilis', tier: 1, hp: [20, 24], behavior: 'eel' },
  { no: 77, id: 'racoonButterfish', name: 'Racoon butterfish', es: 'Pez mariposa mapache', scientific: 'Chaetodon lunula', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 78, id: 'atlanticTrumpetfish', name: 'Atlantic trumpetfish', es: 'Pez trompeta atlántico', scientific: 'Aulostomus strigosus', tier: 1, hp: [20, 24], behavior: 'predator' },
  { no: 79, id: 'bartlettsAnthias', name: 'Bartlett’s anthias', es: 'Anthias cola de lira', scientific: 'Pseudanthias bartlettorum', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 80, id: 'fireGoby', name: 'Fire goby', es: 'Gobio dardo de fuego', scientific: 'Nemateleotris magnifica', tier: 1, hp: [12, 16], behavior: 'reefFish' },
  { no: 81, id: 'atlanticSpadefish', name: 'Atlantic spadefish', es: 'Paguala', scientific: 'Chaetodipterus faber', tier: 1, hp: [22, 26], behavior: 'reefFish' },
  { no: 82, id: 'blueAcara', name: 'Blue acara', es: 'Acara azul', scientific: 'Andinoacara pulcher', tier: 1, hp: [18, 22], behavior: 'reefFish' },
  { no: 83, id: 'oscar', name: 'Oscar', es: 'Óscar', scientific: 'Astronotus ocellatus', tier: 1, hp: [24, 28], behavior: 'predator' },
  { no: 84, id: 'dwarfGourami', name: 'Dwarf gourami', es: 'Colisa lalia', scientific: 'Trichogaster lalius', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 85, id: 'clownLoach', name: 'Clown loach', es: 'Locha payaso', scientific: 'Chromobotia macracanthus', tier: 1, hp: [16, 20], behavior: 'bottomDweller' },
  { no: 86, id: 'arapaima', name: 'Arapaima', es: 'Arapaima', scientific: 'Arapaima gigas', tier: 3, hp: [74, 82], behavior: 'giant' },
  { no: 87, id: 'asianArowana', name: 'Asian arowana', es: 'Arawana asiática', scientific: 'Scleropages formosus', tier: 2, hp: [36, 42], behavior: 'predator' },
  { no: 88, id: 'moorishIdol', name: 'Moorish idol', es: 'Ídolo moro', scientific: 'Zanclus cornutus', tier: 1, hp: [16, 20], behavior: 'reefFish' },
  { no: 89, id: 'banggaiCardinalfish', name: 'Banggai cardinalfish', es: 'Cardenal de Banggai', scientific: 'Pterapogon kauderni', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 90, id: 'longhornCowfish', name: 'Longhorn cowfish', es: 'Pez vaca', scientific: 'Lactoria cornuta', tier: 1, hp: [20, 24], behavior: 'puffer' },
  { no: 91, id: 'hogfish', name: 'Hogfish', es: 'Boquinete', scientific: 'Lachnolaimus maximus', tier: 1, hp: [24, 28], behavior: 'fighter' },
  { no: 92, id: 'blueheadWrasse', name: 'Bluehead wrasse', es: 'Pez lábrido azul', scientific: 'Thalassoma bifasciatum', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 93, id: 'lumpfish', name: 'Lumpfish', es: 'Lumpo', scientific: 'Cyclopterus lumpus', tier: 2, hp: [30, 36], behavior: 'puffer' },
  { no: 94, id: 'boesemansRainbowfish', name: 'Boeseman’s rainbowfish', es: 'Pez arcoíris iris', scientific: 'Melanotaenia boesemani', tier: 1, hp: [14, 18], behavior: 'reefFish' },
  { no: 95, id: 'hillstreamLoach', name: 'Hillstream loach', es: 'Locha ventosa', scientific: 'Beaufortia kweichowensis', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 96, id: 'seahorse', name: 'Seahorse', es: 'Caballito de mar', scientific: 'Hippocampus hippocampus', tier: 1, hp: [12, 16], behavior: 'reefFish' },

  // --- Shellfish, jellyfish, cephalopods, crustaceans & co. (rows 9–12) ------
  { no: 97, id: 'pacificOyster', name: 'Pacific oyster', es: 'Ostra del Pacífico', scientific: 'Crassostrea gigas', tier: 1, hp: [20, 24], behavior: 'armored' },
  { no: 98, id: 'pearlOyster', name: 'Pearl oyster', es: 'Ostra perlera', scientific: 'Pinctada margaritifera', tier: 2, hp: [30, 36], behavior: 'armored' },
  { no: 99, id: 'hardClam', name: 'Hard clam', es: 'Almeja americana', scientific: 'Mercenaria mercenaria', tier: 1, hp: [20, 24], behavior: 'armored' },
  { no: 100, id: 'giantClam', name: 'Giant clam', es: 'Almeja gigante', scientific: 'Tridacna gigas', tier: 3, hp: [60, 70], behavior: 'armored', strength: 2 },
  { no: 101, id: 'mediterraneanMussel', name: 'Mediterranean mussel', es: 'Mejillón mediterráneo', scientific: 'Mytilus galloprovincialis', tier: 1, hp: [16, 20], behavior: 'armored' },
  { no: 102, id: 'greatScallop', name: 'Great scallop', es: 'Vieira', scientific: 'Pecten maximus', tier: 1, hp: [18, 22], behavior: 'armored' },
  { no: 103, id: 'spinyCockle', name: 'Spiny cockle', es: 'Berberecho espinoso', scientific: 'Acanthocardia aculeata', tier: 1, hp: [18, 22], behavior: 'armored' },
  { no: 104, id: 'mediterraneanJelly', name: 'Mediterranean jelly', es: 'Medusa huevo frito', scientific: 'Cotylorhiza tuberculata', tier: 1, hp: [18, 22], behavior: 'jellyfish' },
  { no: 105, id: 'nomadJellyfish', name: 'Nomad jellyfish', es: 'Medusa nómada', scientific: 'Rhopilema nomadica', tier: 2, hp: [28, 34], behavior: 'jellyfish' },
  { no: 106, id: 'portugueseManOWar', name: 'Portuguese man o’ war', es: 'Carabela portuguesa', scientific: 'Physalia physalis', tier: 3, hp: [48, 54], behavior: 'jellyfish', strength: 1 },
  { no: 107, id: 'commonJellyfish', name: 'Common jellyfish', es: 'Medusa común', scientific: 'Aurelia aurita', tier: 1, hp: [16, 20], behavior: 'jellyfish' },
  { no: 108, id: 'flameJellyfish', name: 'Flame jellyfish', es: 'Medusa llama', scientific: 'Rhopilema esculentum', tier: 2, hp: [30, 36], behavior: 'jellyfish' },
  { no: 109, id: 'commonOctopus', name: 'Common octopus', es: 'Pulpo común', scientific: 'Octopus vulgaris', tier: 2, hp: [38, 44], behavior: 'cephalopod' },
  { no: 110, id: 'flapjackOctopus', name: 'Flapjack octopus', es: 'Pulpo hojuela', scientific: 'Opisthoteuthis californiana', tier: 1, hp: [20, 24], behavior: 'cephalopod' },
  { no: 111, id: 'atlanticGiantSquid', name: 'Atlantic giant squid', es: 'Calamar gigante del Atlántico', scientific: 'Architeuthis dux', tier: 3, hp: [70, 80], behavior: 'cephalopod', strength: 2 },
  { no: 112, id: 'commonSquid', name: 'Common squid', es: 'Calamar común', scientific: 'Loligo vulgaris', tier: 2, hp: [30, 36], behavior: 'cephalopod' },
  { no: 113, id: 'cushionStar', name: 'Cushion star', es: 'Estrella cojín', scientific: 'Culcita novaeguineae', tier: 1, hp: [20, 24], behavior: 'bottomDweller' },
  { no: 114, id: 'commonStarfish', name: 'Common starfish', es: 'Estrella de mar común', scientific: 'Asterias rubens', tier: 1, hp: [18, 22], behavior: 'bottomDweller' },
  { no: 115, id: 'seaSponge', name: 'Sea sponge', es: 'Esponja de mar', scientific: 'Spongia officinalis', tier: 1, hp: [22, 26], behavior: 'bottomDweller' },
  { no: 116, id: 'seaUrchin', name: 'Sea urchin', es: 'Erizo de mar', scientific: 'Paracentrotus lividus', tier: 1, hp: [18, 22], behavior: 'venomous' },
  { no: 117, id: 'redKingCrab', name: 'Red king crab', es: 'Cangrejo real', scientific: 'Paralithodes camtschaticus', tier: 3, hp: [56, 64], behavior: 'crustacean', strength: 1 },
  { no: 118, id: 'commonHermitCrab', name: 'Common hermit crab', es: 'Cangrejo ermitaño', scientific: 'Pagurus bernhardus', tier: 1, hp: [20, 24], behavior: 'crustacean' },
  { no: 119, id: 'blueCrab', name: 'Blue crab', es: 'Cangrejo azul', scientific: 'Callinectes sapidus', tier: 2, hp: [32, 38], behavior: 'crustacean' },
  { no: 120, id: 'yetiCrab', name: 'Yeti crab', es: 'Cangrejo yeti', scientific: 'Kiwa hirsuta', tier: 2, hp: [30, 36], behavior: 'crustacean' },
  { no: 121, id: 'atlanticHorseshoeCrab', name: 'Atlantic horseshoe crab', es: 'Cangrejo herradura del Atlántico', scientific: 'Limulus polyphemus', tier: 2, hp: [36, 42], behavior: 'crustacean' },
  { no: 122, id: 'atlanticCrayfish', name: 'Atlantic crayfish', es: 'Cangrejo de río', scientific: 'Austropotamobius pallipes', tier: 1, hp: [20, 24], behavior: 'crustacean' },
  { no: 123, id: 'commonLobster', name: 'Common lobster', es: 'Bogavante', scientific: 'Homarus gammarus', tier: 2, hp: [42, 48], behavior: 'crustacean' },
  { no: 124, id: 'spinyLobster', name: 'Spiny lobster', es: 'Langosta común', scientific: 'Palinurus elephas', tier: 2, hp: [40, 46], behavior: 'crustacean' },
  { no: 125, id: 'shrimp', name: 'Shrimp', es: 'Gamba blanca', scientific: 'Parapenaeus longirostris', tier: 1, hp: [10, 14], behavior: 'schooling' },
  { no: 126, id: 'greenSeaTurtle', name: 'Green sea turtle', es: 'Tortuga marina verde', scientific: 'Chelonia mydas', tier: 2, hp: [44, 50], behavior: 'armored' },
  { no: 127, id: 'axolotl', name: 'Axolotl', es: 'Ajolote', scientific: 'Ambystoma mexicanum', tier: 1, hp: [18, 22], behavior: 'bottomDweller' },
  { no: 128, id: 'chamberedNautilus', name: 'Chambered nautilus', es: 'Nautilo perlado', scientific: 'Nautilus pompilius', tier: 2, hp: [32, 38], behavior: 'cephalopod' },
  { no: 129, id: 'gooseBarnacle', name: 'Goose barnacle', es: 'Percebe', scientific: 'Pollicipes pollicipes', tier: 1, hp: [16, 20], behavior: 'armored' },
  { no: 130, id: 'blueSeaDragon', name: 'Blue sea dragon', es: 'Dragón azul', scientific: 'Glaucus atlanticus', tier: 1, hp: [14, 18], behavior: 'venomous' },
  { no: 131, id: 'seaButterfly', name: 'Sea butterfly', es: 'Mariposa marina', scientific: 'Thecosomata', tier: 1, hp: [10, 14], behavior: 'jellyfish' },
  { no: 132, id: 'giantCuttlefish', name: 'Giant cuttlefish', es: 'Sepia gigante', scientific: 'Sepia apama', tier: 2, hp: [38, 44], behavior: 'cephalopod' },
  { no: 133, id: 'seaCucumber', name: 'Sea cucumber', es: 'Pepino de mar', scientific: 'Holothuria tubulosa', tier: 1, hp: [20, 24], behavior: 'bottomDweller' },
  { no: 134, id: 'commonSeaSlug', name: 'Common sea slug', es: 'Babosa de mar común', scientific: 'Aeolidia papillosa', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 135, id: 'emeraldSeaSlug', name: 'Emerald sea slug', es: 'Babosa esmeralda', scientific: 'Elysia chlorotica', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 136, id: 'leafSlug', name: 'Leaf slug', es: 'Oveja de mar', scientific: 'Costasiella kuroshimae', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 137, id: 'seaBunny', name: 'Sea bunny', es: 'Conejo de mar', scientific: 'Jorunna parva', tier: 1, hp: [12, 16], behavior: 'bottomDweller' },
  { no: 138, id: 'giantIsopod', name: 'Giant isopod', es: 'Isópodo gigante', scientific: 'Bathynomus giganteus', tier: 2, hp: [34, 40], behavior: 'crustacean' },
  { no: 139, id: 'queenConch', name: 'Queen conch', es: 'Caracol pala', scientific: 'Aliger gigas', tier: 2, hp: [30, 36], behavior: 'armored' },
  { no: 140, id: 'purpleConeSnail', name: 'Purple cone snail', es: 'Caracol cono morado', scientific: 'Conus purpurascens', tier: 2, hp: [28, 32], behavior: 'venomous' },
  { no: 141, id: 'fireworm', name: 'Fireworm', es: 'Gusano de fuego', scientific: 'Hermodice carunculata', tier: 1, hp: [16, 20], behavior: 'venomous' },
  { no: 142, id: 'spoonWorm', name: 'Spoon worm', es: 'Bonelia', scientific: 'Bonellia viridis', tier: 1, hp: [14, 18], behavior: 'bottomDweller' },
  { no: 143, id: 'planaria', name: 'Planaria', es: 'Planaria', scientific: 'Planaria torva', tier: 1, hp: [10, 14], behavior: 'bottomDweller' },
  { no: 144, id: 'medicinalLeech', name: 'Medicinal leech', es: 'Sanguijuela medicinal', scientific: 'Hirudo medicinalis', tier: 1, hp: [14, 18], behavior: 'eel' },
];
