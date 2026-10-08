// ---------------------------------------------------------------------------
// Content definitions: the shapes designers fill in under /src/content.
// ---------------------------------------------------------------------------

export type StatusId = 'strength' | 'vulnerable' | 'weak';
export type Statuses = Partial<Record<StatusId, number>>;

/**
 * Who an effect lands on, from the point of view of whoever is acting.
 * - `target`: the chosen enemy (for the player) or the player (for an enemy)
 * - `self`: the acting combatant
 * - `allEnemies`: every living opponent of the actor
 * - `randomEnemy`: one random living opponent, re-rolled per hit
 */
export type EffectTarget = 'target' | 'self' | 'allEnemies' | 'randomEnemy';

/** The reusable building blocks that every card and enemy move is made of. */
export type Effect =
  | { type: 'dealDamage'; amount: number; hits?: number; target?: EffectTarget }
  | { type: 'gainBlock'; amount: number }
  | { type: 'applyStatus'; status: StatusId; amount: number; target?: EffectTarget }
  | { type: 'drawCards'; amount: number }
  | { type: 'gainEnergy'; amount: number };

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
  moves: EnemyMove[];
  pattern: IntentPattern;
  /** Statuses the enemy starts every fight with, e.g. `{ strength: 2 }`. */
  startingStatuses?: Statuses;
  /** Placeholder art (emoji), used when there is no sprite. Display-only. */
  portrait?: string;
  sprite?: SpriteRef;
}

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
  starterDeck: string[];
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
  /** The move this enemy will perform on its next turn (shown to the player). */
  intent: string | null;
  moveHistory: string[];
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

export type CombatPhase = 'playerTurn' | 'won' | 'lost';

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
