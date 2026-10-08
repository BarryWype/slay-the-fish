import type { CardDef, CharacterDef, EncounterDef, EnemyDef, Effect, GameData } from './types';

/** Content as authored: plain arrays, easy to edit by hand. */
export interface ContentSource {
  character: CharacterDef;
  cards: CardDef[];
  enemies: EnemyDef[];
  encounters: EncounterDef[];
  starterDeck: string[];
}

/** Index content by id, throwing a readable error if anything is inconsistent. */
export function buildGameData(source: ContentSource): GameData {
  const errors = validateContent(source);
  if (errors.length) throw new Error(`Invalid game content:\n- ${errors.join('\n- ')}`);
  return {
    character: source.character,
    cards: Object.fromEntries(source.cards.map((c) => [c.id, c])),
    enemies: Object.fromEntries(source.enemies.map((e) => [e.id, e])),
    encounters: source.encounters,
    starterDeck: source.starterDeck,
  };
}

/** Returns a list of human-readable problems; empty means the content is valid. */
export function validateContent(source: ContentSource): string[] {
  const errors: string[] = [];
  if (!(Number.isInteger(source.character.maxHp) && source.character.maxHp > 0)) {
    errors.push('Character: maxHp must be a whole number > 0.');
  }
  const cardIds = new Set<string>();
  const enemyIds = new Set<string>();

  const checkDuplicate = (seen: Set<string>, id: string, kind: string) => {
    if (seen.has(id)) errors.push(`Duplicate ${kind} id "${id}".`);
    seen.add(id);
  };
  const checkEffects = (where: string, effects: Effect[]) => {
    for (const e of effects) {
      if ('amount' in e && !Number.isFinite(e.amount)) errors.push(`${where}: effect "${e.type}" has a non-numeric amount.`);
      if (e.type === 'dealDamage' && e.hits !== undefined && (!Number.isInteger(e.hits) || e.hits < 1)) {
        errors.push(`${where}: "hits" must be a whole number ≥ 1.`);
      }
    }
  };

  for (const card of source.cards) {
    checkDuplicate(cardIds, card.id, 'card');
    const where = `Card "${card.id}"`;
    if (!Number.isInteger(card.cost) || card.cost < 0) errors.push(`${where}: cost must be a whole number ≥ 0.`);
    checkEffects(where, card.effects);
    const needsTarget = card.effects.some(
      (e) => (e.type === 'dealDamage' || e.type === 'applyStatus') && (e.target ?? 'target') === 'target',
    );
    if (needsTarget && card.target !== 'enemy') {
      errors.push(`${where}: an effect hits the chosen target, so the card needs target: 'enemy'.`);
    }
  }

  for (const enemy of source.enemies) {
    checkDuplicate(enemyIds, enemy.id, 'enemy');
    const where = `Enemy "${enemy.id}"`;
    const [min, max] = enemy.hp;
    if (!(min > 0 && max >= min)) errors.push(`${where}: hp must be [min, max] with 0 < min ≤ max.`);
    if (enemy.sprite && !(Number.isInteger(enemy.sprite.index) && enemy.sprite.index >= 1)) {
      errors.push(`${where}: sprite index must be a whole number ≥ 1.`);
    }
    const moveIds = new Set<string>();
    for (const move of enemy.moves) {
      if (moveIds.has(move.id)) errors.push(`${where}: duplicate move id "${move.id}".`);
      moveIds.add(move.id);
      checkEffects(`${where} move "${move.id}"`, move.effects);
    }
    const p = enemy.pattern;
    const referenced = p.type === 'sequence' ? p.moves : [...Object.keys(p.weights), ...(p.firstMove ? [p.firstMove] : [])];
    for (const id of referenced) {
      if (!moveIds.has(id)) errors.push(`${where}: pattern references unknown move "${id}".`);
    }
    if (p.type === 'sequence') {
      if (p.moves.length === 0) errors.push(`${where}: sequence pattern has no moves.`);
      const loopFrom = p.loopFrom ?? 0;
      if (loopFrom < 0 || loopFrom >= p.moves.length) errors.push(`${where}: loopFrom is out of range.`);
    } else if (!Object.values(p.weights).some((w) => w > 0)) {
      errors.push(`${where}: weighted pattern needs at least one positive weight.`);
    }
  }

  const encounterIds = new Set<string>();
  for (const encounter of source.encounters) {
    checkDuplicate(encounterIds, encounter.id, 'encounter');
    if (encounter.enemies.length === 0) errors.push(`Encounter "${encounter.id}" has no enemies.`);
    if (encounter.tier !== undefined && !(Number.isInteger(encounter.tier) && encounter.tier >= 1)) {
      errors.push(`Encounter "${encounter.id}": tier must be a whole number ≥ 1.`);
    }
    for (const id of encounter.enemies) {
      if (!enemyIds.has(id)) errors.push(`Encounter "${encounter.id}" references unknown enemy "${id}".`);
    }
  }
  if (source.encounters.length === 0) errors.push('There must be at least one encounter.');

  for (const id of source.starterDeck) {
    if (!cardIds.has(id)) errors.push(`Starter deck references unknown card "${id}".`);
  }

  return errors;
}
