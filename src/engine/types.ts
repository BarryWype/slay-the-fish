// ---------------------------------------------------------------------------
// Content definitions: the shapes designers fill in under /src/content.
// ---------------------------------------------------------------------------

export type StatusId = 'strength' | 'vulnerable' | 'weak' | 'snared';
export type Statuses = Partial<Record<StatusId, number>>;

/**
 * Who an effect lands on, from the point of view of whoever is acting.
 * - `target`: the chosen enemy (for the player) or the player (for an enemy)
 * - `self`: the acting combatant
 * - `allEnemies`: every living opponent of the actor
 * - `randomEnemy`: one random living opponent, re-rolled per hit
 */
export type EffectTarget = 'target' | 'self' | 'allEnemies' | 'randomEnemy';

/** Extra damage per hit against enemies carrying any of the `against` tags (creature types). */
export interface DamageBonus {
  against: string[];
  amount: number;
}

/** The reusable building blocks that every card and enemy move is made of. */
export type Effect =
  | { type: 'dealDamage'; amount: number; hits?: number; target?: EffectTarget; bonus?: DamageBonus }
  | { type: 'gainBlock'; amount: number }
  | { type: 'applyStatus'; status: StatusId; amount: number; target?: EffectTarget }
  | { type: 'drawCards'; amount: number }
  | { type: 'gainEnergy'; amount: number }
  /** Move a creature's escape bar: negative calms it toward capture (0), positive panics it toward fleeing. */
  | { type: 'changeEscape'; amount: number; target?: EffectTarget }
  /** Permanently change how fast a creature's escape bar rises each turn (never below 0). */
  | { type: 'changeEscapeRate'; amount: number; target?: EffectTarget };

export type CardType = 'attack' | 'skill' | 'power';
export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare';

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  /** `enemy` = the player must pick an enemy to play it on. */
  target: 'enemy' | 'none';
  effects: Effect[];
  /** Removed from the fight after being played. Powers always exhaust. */
  exhaust?: boolean;
  /** Only offered as a reward to this build. Offered to every build if omitted. */
  build?: string;
  /** Optional text override. Normally generated from `effects`. */
  description?: string;
  /** Placeholder art (emoji). Display-only; ignored by the engine. */
  art?: string;
}

/** The player character and where their journey starts. */
export interface CharacterDef {
  name: string;
  maxHp: number;
  /** Placeholder art (emoji). Display-only. */
  portrait?: string;
  /** The map's starting point. Display-only. */
  home: { name: string; icon?: string };
}

/** A starting build: chosen before the first fight, it sets the starter deck. */
export interface BuildDef {
  id: string;
  name: string;
  description: string;
  /** Card ids the run starts with. */
  starterDeck: string[];
  /** Tags (creature types) this build's cards are strong against. Display-only. */
  strongAgainst: string[];
  /** Display-only art. */
  sprite?: SpriteRef;
  /** Equipment ids the run starts with. */
  startingEquipment?: string[];
}

/** What a piece of equipment does. Percentages are whole numbers (20 = 20%). */
export type EquipmentEffect =
  /** Every creature's escape rate drops by this share (at least 1, rounded up) at the start of each fight. */
  | { type: 'slowEscape'; percent: number }
  /** Captured creatures are sold on the spot, for this much more, instead of going into the bucket. */
  | { type: 'sellOnCapture'; bonusPercent: number }
  /** Enthusiastic passersby pay this much more per fish. Passerby encounters aren't in the game yet. */
  | { type: 'passerbyBonus'; bonusPercent: number };

/** An object carried for the whole run, with passive effects. */
export interface EquipmentDef {
  id: string;
  name: string;
  /** Player-facing rules text. */
  description: string;
  /** Placeholder art (emoji). Display-only. */
  icon?: string;
  effects: EquipmentEffect[];
}

/** What a map event's choice does. Percentages are whole numbers (30 = 30%). */
export type EventEffect =
  | { type: 'heal'; percent: number }
  | { type: 'loseHp'; amount: number }
  | { type: 'gainCoins'; amount: number }
  /** Coins for each creature in the bucket (raised by passerby equipment bonuses). The creatures stay. */
  | { type: 'coinsPerCreature'; amount: number }
  /** Offer the usual pick-1-of-3 card reward afterwards. */
  | { type: 'cardReward' };

export interface EventChoice {
  label: string;
  effects: EventEffect[];
}

/** Something that happens on a map event instead of a fight. */
export interface EventDef {
  id: string;
  name: string;
  description: string;
  /** Placeholder art (emoji). Display-only. */
  icon?: string;
  /** Only drawn on map columns from this one on. Anywhere events can be if omitted. */
  minColumn?: number;
  choices: EventChoice[];
}

/** Something for sale in a shop. */
export interface ShopItemDef {
  id: string;
  name: string;
  /** Placeholder art (emoji). Display-only. */
  icon?: string;
  price: number;
  effect: { type: 'heal'; amount: number } | { type: 'removeCard' };
  /** How many times it can be bought per shop visit. Unlimited if omitted. */
  limit?: number;
}

/** A creature type, used as an enemy tag (e.g. 'crustacean'). */
export interface CreatureTypeDef {
  id: string;
  name: string;
  /** Placeholder art (emoji) for map events of this type. Display-only. */
  icon?: string;
  /** Terrain patch drawn under map fights of this type. Display-only. */
  terrain?: SpriteRef;
}

export interface EnemyMove {
  id: string;
  name: string;
  effects: Effect[];
}

/** A cell in a sprite sheet. `index` is 1-based, counted left to right, top to bottom. Display-only. */
export interface SpriteRef {
  sheet: string;
  index: number;
}

export type IntentPattern =
  /** Play `moves` in order; after the last one, loop back to index `loopFrom` (default 0). */
  | { type: 'sequence'; moves: string[]; loopFrom?: number }
  /** Pick by weight. `maxConsecutive` caps how often the same move can repeat in a row. */
  | { type: 'weighted'; weights: Record<string, number>; firstMove?: string; maxConsecutive?: number };

export interface EnemyDef {
  id: string;
  name: string;
  /** Inclusive [min, max] HP range, rolled with the combat seed. */
  hp: [number, number];
  /** Coins it sells for once captured. Defaults to 0. */
  sellValue?: number;
  /** The tug of war: the escape bar flees at `escapeAt`, captures at 0. */
  escapeAt: number;
  /** Escape bar value at the start of combat. */
  escapeStart: number;
  /** How much the escape bar rises each enemy turn. */
  escapeRate: number;
  moves: EnemyMove[];
  pattern: IntentPattern;
  /** Statuses the enemy starts every fight with, e.g. `{ strength: 2 }`. */
  startingStatuses?: Statuses;
  /** Creature type ids, matched by card damage bonuses. */
  tags?: string[];
  /** Placeholder art (emoji), used when there is no sprite. Display-only. */
  portrait?: string;
  sprite?: SpriteRef;
  /** How it moves around in the aquarium. Display-only. */
  habitat?: Habitat;
}

/** `swim` back and forth, `drift` slowly up and down, or crawl along the `bottom`. */
export type Habitat = 'swim' | 'drift' | 'bottom';

export interface EncounterDef {
  id: string;
  name: string;
  enemies: string[];
  /** Map depth band (1 = near the start). Defaults to 1. */
  tier?: number;
}

/** All content, indexed by id. Built from the content arrays by `buildGameData`. */
export interface GameData {
  character: CharacterDef;
  cards: Record<string, CardDef>;
  enemies: Record<string, EnemyDef>;
  encounters: EncounterDef[];
  builds: Record<string, BuildDef>;
  creatureTypes: Record<string, CreatureTypeDef>;
  equipment: Record<string, EquipmentDef>;
  events: Record<string, EventDef>;
  shop: ShopItemDef[];
}

// ---------------------------------------------------------------------------
// Runtime state. Plain, JSON-serialisable data only.
// ---------------------------------------------------------------------------

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  statuses: Statuses;
}

export interface PlayerState extends Combatant {
  energy: number;
  maxEnergy: number;
}

export interface EnemyState extends Combatant {
  defId: string;
  tags: string[];
  /** The move this enemy will perform on its next turn (shown to the player). */
  intent: string | null;
  moveHistory: string[];
  /** The escape bar, 0..escapeAt: it flees at `escapeAt` and is captured at 0. */
  escape: number;
  escapeAt: number;
  escapeRate: number;
}

export interface CardInstance {
  uid: string;
  defId: string;
}

export interface Piles {
  /** The top of the draw pile is the END of the array. */
  draw: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  exhaust: CardInstance[];
}

/** `fled`: a creature escaped, ending the fight with no reward. */
export type CombatPhase = 'playerTurn' | 'won' | 'lost' | 'fled';

export interface CombatState {
  seed: number;
  /** Current RNG cursor. Advancing it is the only source of randomness. */
  rng: number;
  turn: number;
  phase: CombatPhase;
  player: PlayerState;
  enemies: EnemyState[];
  piles: Piles;
  log: string[];
}

export type CombatAction =
  | { type: 'playCard'; cardUid: string; targetId?: string }
  | { type: 'endTurn' };
