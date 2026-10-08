import { ref, shallowRef } from 'vue';
import { gameData } from '../content';
import {
  addCardToDeck,
  applyAction,
  createRun,
  finishCombat,
  isMapComplete,
  rollCardRewards,
  travelTo,
  type CombatAction,
  type CombatState,
  type RunState,
} from '../engine';

export type Screen = 'map' | 'combat' | 'reward' | 'complete';

/**
 * Thin glue between Vue and the engine: holds the current immutable states in
 * refs and swaps them for whatever the engine returns. No game rules here.
 */
export function useGame(initialSeed: number) {
  const run = shallowRef<RunState>(createRun(initialSeed, gameData));
  const combat = shallowRef<CombatState | null>(null);
  const screen = ref<Screen>('map');
  const rewardChoices = ref<string[]>([]);

  function newRun(seed: number) {
    run.value = createRun(seed, gameData);
    combat.value = null;
    screen.value = 'map';
  }

  function travel(nodeId: string) {
    const result = travelTo(run.value, nodeId, gameData);
    run.value = result.run;
    combat.value = result.combat;
    screen.value = 'combat';
  }

  function dispatch(action: CombatAction) {
    if (combat.value) combat.value = applyAction(combat.value, action, gameData);
  }

  function claimVictory() {
    if (!combat.value || combat.value.phase !== 'won') return;
    const finished = finishCombat(run.value, combat.value);
    combat.value = null;
    if (isMapComplete(finished)) {
      run.value = finished;
      screen.value = 'complete';
      return;
    }
    const rewards = rollCardRewards(finished, gameData);
    run.value = rewards.run;
    rewardChoices.value = rewards.choices;
    screen.value = 'reward';
  }

  function chooseReward(cardId: string | null) {
    if (cardId) run.value = addCardToDeck(run.value, cardId, gameData);
    screen.value = 'map';
  }

  return { data: gameData, run, combat, screen, rewardChoices, dispatch, travel, claimVictory, chooseReward, newRun };
}
