import { ESCAPE_BAR_NAME, PLAYER_ID } from './constants';
import { applyDamage, bonusAgainst, calculateDamage, tagsOf } from './damage';
import { drawCards } from './piles';
import { nextInt } from './rng';
import { addStatus, STATUS_META } from './statuses';
import type { Combatant, CombatState, Effect, EffectTarget, EnemyState } from './types';
import { addLog } from './util';

export interface EffectContext {
  sourceId: string;
  /** The chosen target (an enemy for player cards, the player for enemy moves). */
  targetId?: string;
}

export function getCombatant(state: CombatState, id: string): Combatant | undefined {
  return id === PLAYER_ID ? state.player : state.enemies.find((e) => e.id === id);
}

/** Still in the fight: not beaten down and, for a creature, its escape bar not pushed to 0. */
export function isAlive(combatant: Combatant): boolean {
  return combatant.hp > 0 && (!('escape' in combatant) || (combatant as EnemyState).escape > 0);
}

export function livingOpponents(state: CombatState, id: string): Combatant[] {
  return (id === PLAYER_ID ? state.enemies : [state.player]).filter(isAlive);
}

function resolveTargets(
  state: CombatState,
  target: EffectTarget,
  ctx: EffectContext,
  source: Combatant,
): Combatant[] {
  switch (target) {
    case 'self':
      return [source];
    case 'target': {
      const t = ctx.targetId === undefined ? undefined : getCombatant(state, ctx.targetId);
      return t && isAlive(t) ? [t] : [];
    }
    case 'allEnemies':
      return livingOpponents(state, source.id);
    case 'randomEnemy': {
      const options = livingOpponents(state, source.id);
      return options.length ? [options[nextInt(state, 0, options.length - 1)]] : [];
    }
  }
}

/** Apply one effect primitive. Mutates `state` (the engine's private working copy). */
export function resolveEffect(state: CombatState, effect: Effect, ctx: EffectContext): void {
  const source = getCombatant(state, ctx.sourceId);
  if (!source || !isAlive(source)) return;

  switch (effect.type) {
    case 'dealDamage': {
      const hits = effect.hits ?? 1;
      for (let i = 0; i < hits; i++) {
        for (const t of resolveTargets(state, effect.target ?? 'target', ctx, source)) {
          const base = effect.amount + bonusAgainst(effect.bonus, tagsOf(t));
          const amount = calculateDamage(base, source.statuses, t.statuses);
          const { blocked, hpLost } = applyDamage(t, amount);
          addLog(state, `${source.name} hit ${t.name} for ${hpLost}${blocked ? ` (${blocked} blocked)` : ''}.`);
        }
      }
      return;
    }
    case 'gainBlock':
      source.block += effect.amount;
      addLog(state, `${source.name} gained ${effect.amount} Block.`);
      return;
    case 'applyStatus':
      for (const t of resolveTargets(state, effect.target ?? 'target', ctx, source)) {
        addStatus(t, effect.status, effect.amount);
        const verb = effect.amount >= 0 ? 'gained' : 'lost';
        addLog(state, `${t.name} ${verb} ${Math.abs(effect.amount)} ${STATUS_META[effect.status].name}.`);
      }
      return;
    case 'drawCards':
      if (source.id === PLAYER_ID) drawCards(state, effect.amount);
      return;
    case 'gainEnergy':
      if (source.id === PLAYER_ID) state.player.energy += effect.amount;
      return;
    case 'changeEscape':
      for (const t of resolveTargets(state, effect.target ?? 'target', ctx, source)) {
        if (!('escape' in t)) continue;
        const enemy = t as EnemyState;
        enemy.escape = Math.max(0, Math.min(enemy.escapeAt, enemy.escape + effect.amount));
        addLog(state, `${enemy.name} ${effect.amount >= 0 ? 'panics' : 'calms down'} (${ESCAPE_BAR_NAME} ${enemy.escape}/${enemy.escapeAt}).`);
      }
      return;
    case 'changeEscapeRate':
      for (const t of resolveTargets(state, effect.target ?? 'target', ctx, source)) {
        if (!('escape' in t)) continue;
        const enemy = t as EnemyState;
        enemy.escapeRate = Math.max(0, enemy.escapeRate + effect.amount);
        addLog(state, `${enemy.name}'s ${ESCAPE_BAR_NAME} now rises by ${enemy.escapeRate} a turn.`);
      }
      return;
  }
}
