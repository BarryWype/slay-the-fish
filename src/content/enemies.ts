import type { EnemyDef, Habitat } from '../engine';
import { behaviors, type BehaviorId } from './behaviors';
import { creatures, type CreatureDef } from './creatures';

/** Default aquarium movement per behavior (anything not listed swims). */
const HABITAT_BY_BEHAVIOR: Partial<Record<BehaviorId, Habitat>> = {
  jellyfish: 'drift',
  armored: 'bottom',
  crustacean: 'bottom',
  bottomDweller: 'bottom',
};

/** Turns a creature entry into an engine enemy. Edit creatures.ts / behaviors.ts, not this. */
function toEnemy(creature: CreatureDef): EnemyDef {
  const behaviorId = typeof creature.behavior === 'string' ? creature.behavior : undefined;
  const behavior = behaviorId ? behaviors[behaviorId] : (creature.behavior as Exclude<CreatureDef['behavior'], string>);
  return {
    id: creature.id,
    name: creature.name,
    hp: creature.hp,
    moves: behavior.moves,
    pattern: behavior.pattern,
    startingStatuses: { ...creature.statuses, ...(creature.strength ? { strength: creature.strength } : {}) },
    sprite: { sheet: 'fishes', index: creature.no },
    habitat: creature.habitat ?? (behaviorId && HABITAT_BY_BEHAVIOR[behaviorId]) ?? 'swim',
  };
}

export const enemies: EnemyDef[] = creatures.map(toEnemy);
