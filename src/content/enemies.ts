import type { EnemyDef } from '../engine';
import { behaviors } from './behaviors';
import { creatures, type CreatureDef } from './creatures';

/** Turns a creature entry into an engine enemy. Edit creatures.ts / behaviors.ts, not this. */
function toEnemy(creature: CreatureDef): EnemyDef {
  const behavior = typeof creature.behavior === 'string' ? behaviors[creature.behavior] : creature.behavior;
  return {
    id: creature.id,
    name: creature.name,
    hp: creature.hp,
    moves: behavior.moves,
    pattern: behavior.pattern,
    startingStatuses: { ...creature.statuses, ...(creature.strength ? { strength: creature.strength } : {}) },
    sprite: { sheet: 'fishes', index: creature.no },
  };
}

export const enemies: EnemyDef[] = creatures.map(toEnemy);
