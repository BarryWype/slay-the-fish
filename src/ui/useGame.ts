import { ref, shallowRef, watch } from 'vue';
import { gameData } from '../content';
import {
  addCardToDeck,
  applyEventChoice,
  buyShopItem,
  findNode,
  applyAction,
  bringCatchHome,
  createRun,
  finishCombat,
  isMapComplete,
  visitLeave,
  rollCardRewards,
  sellCreature,
  travelTo,
  visitEvent,
  visitShop,
  type CombatAction,
  type CombatState,
  type RunState,
  type ShopVisit,
} from '../engine';
import {
  clearSavedGame,
  loadProfile,
  loadSavedGame,
  PROFILE_VERSION,
  SAVE_VERSION,
  writeProfile,
  writeSavedGame,
  type SavedGame,
} from './saveStore';

export type Screen = 'menu' | 'build' | 'map' | 'combat' | 'event' | 'shop' | 'leave' | 'reward' | 'complete';

/**
 * Thin glue between Vue and the engine: holds the current immutable states in
 * refs and swaps them for whatever the engine returns. No game rules here.
 */
export function useGame(initialSeed: number) {
  const seed = ref(initialSeed);
  /** null until a starting build is chosen. */
  const run = shallowRef<RunState | null>(null);
  const combat = shallowRef<CombatState | null>(null);
  const screen = ref<Screen>('menu');
  const rewardChoices = ref<string[]>([]);
  /** The event being played, on the event screen. */
  const eventId = ref<string | null>(null);
  /** Purchases during the current shop visit, on the shop screen. */
  const shopVisit = ref<ShopVisit>({ bought: {} });
  /** The run that Resume would pick up, if any. */
  const savedGame = shallowRef<SavedGame | null>(null);
  loadSavedGame().then((save) => (savedGame.value = save));
  /** Creatures brought home from won runs; shown on the menu and build screens. */
  const homeAquarium = ref<string[]>([]);
  loadProfile().then((profile) => (homeAquarium.value = profile.homeAquarium));
  /** The finish node the player clicked, waiting for them to confirm on the leave screen. */
  const leaveNodeId = ref<string | null>(null);
  /** On the end screen, how the run ended. Only `fled` leaves the bucket behind. */
  const runEnd = ref<'won' | 'left' | 'fled'>('won');

  /** End the run successfully: the bucket joins the home aquarium. */
  function bringHome(finished: RunState, how: 'won' | 'left') {
    run.value = finished;
    homeAquarium.value = bringCatchHome(homeAquarium.value, finished);
    writeProfile({ version: PROFILE_VERSION, homeAquarium: homeAquarium.value });
    runEnd.value = how;
    screen.value = 'complete';
  }

  // Autosave after every change; a lost or finished run deletes the save.
  watch([run, combat, screen, rewardChoices, eventId, shopVisit], () => {
    if (!run.value || screen.value === 'menu' || screen.value === 'build') return;
    if (screen.value === 'complete' || combat.value?.phase === 'lost') {
      savedGame.value = null;
      clearSavedGame();
      return;
    }
    savedGame.value = {
      version: SAVE_VERSION,
      seed: seed.value,
      // The finish-the-session prompt is only a confirmation; resuming goes back to the map.
      screen: screen.value === 'leave' ? 'map' : screen.value,
      run: run.value,
      combat: combat.value,
      rewardChoices: rewardChoices.value,
      eventId: eventId.value,
      shopVisit: shopVisit.value,
    };
    writeSavedGame(savedGame.value);
  });

  /** Pick the saved run up exactly where it was left. */
  function resume() {
    const save = savedGame.value;
    if (!save) return;
    seed.value = save.seed;
    run.value = save.run;
    combat.value = save.combat;
    rewardChoices.value = save.rewardChoices;
    eventId.value = save.eventId;
    shopVisit.value = save.shopVisit;
    screen.value = save.screen;
  }

  /** Back to the landing menu; the run stays saved. */
  function toMenu() {
    screen.value = 'menu';
  }

  function newRun(newSeed: number) {
    seed.value = newSeed;
    run.value = null;
    combat.value = null;
    screen.value = 'build';
  }

  function chooseBuild(buildId: string) {
    run.value = createRun(seed.value, gameData, buildId);
    screen.value = 'map';
  }

  function travel(nodeId: string) {
    if (!run.value) return;
    const kind = findNode(run.value.map, nodeId)?.kind;
    if (kind === 'leave') {
      leaveNodeId.value = nodeId;
      screen.value = 'leave';
      return;
    }
    if (kind === 'shop') {
      run.value = visitShop(run.value, nodeId);
      shopVisit.value = { bought: {} };
      screen.value = 'shop';
      return;
    }
    if (kind === 'event') {
      const visit = visitEvent(run.value, nodeId, gameData);
      run.value = visit.run;
      if (visit.combat) {
        combat.value = visit.combat;
        screen.value = 'combat';
      } else {
        eventId.value = visit.eventId;
        screen.value = 'event';
      }
      return;
    }
    const result = travelTo(run.value, nodeId, gameData);
    run.value = result.run;
    combat.value = result.combat;
    screen.value = 'combat';
  }

  function dispatch(action: CombatAction) {
    if (combat.value) combat.value = applyAction(combat.value, action, gameData);
  }

  function claimVictory() {
    if (!run.value || !combat.value || combat.value.phase !== 'won') return;
    const finished = finishCombat(run.value, combat.value, gameData);
    combat.value = null;
    if (isMapComplete(finished)) {
      bringHome(finished, 'won');
      return;
    }
    const rewards = rollCardRewards(finished, gameData);
    run.value = rewards.run;
    rewardChoices.value = rewards.choices;
    screen.value = 'reward';
  }

  function sell(slot: number) {
    if (run.value) run.value = sellCreature(run.value, slot, gameData);
  }

  /** After a creature got away: carry HP over, no reward. */
  function leaveFight() {
    if (!run.value || !combat.value || combat.value.phase !== 'fled') return;
    run.value = finishCombat(run.value, combat.value, gameData);
    combat.value = null;
    // The boss getting away ends the run without a win: the bucket stays behind.
    runEnd.value = 'fled';
    screen.value = isMapComplete(run.value) ? 'complete' : 'map';
  }

  function chooseEvent(choiceIndex: number) {
    if (!run.value || !eventId.value) return;
    const result = applyEventChoice(run.value, eventId.value, choiceIndex, gameData);
    eventId.value = null;
    if (result.cardReward) {
      const rewards = rollCardRewards(result.run, gameData);
      run.value = rewards.run;
      rewardChoices.value = rewards.choices;
      screen.value = 'reward';
    } else {
      run.value = result.run;
      screen.value = 'map';
    }
  }

  function buy(itemId: string, cardIndex?: number) {
    if (!run.value) return;
    const result = buyShopItem(run.value, shopVisit.value, itemId, gameData, cardIndex);
    run.value = result.run;
    shopVisit.value = result.visit;
  }

  function leaveShop() {
    screen.value = 'map';
  }

  /** Confirmed: move onto the finish node, which ends the run and brings the bucket home. */
  function finishSession() {
    if (!run.value || !leaveNodeId.value) return;
    bringHome(visitLeave(run.value, leaveNodeId.value), 'left');
    leaveNodeId.value = null;
  }

  /** Not yet: back to the map without moving. */
  function cancelLeave() {
    leaveNodeId.value = null;
    screen.value = 'map';
  }

  function chooseReward(cardId: string | null) {
    if (run.value && cardId) run.value = addCardToDeck(run.value, cardId, gameData);
    screen.value = 'map';
  }

  return {
    data: gameData,
    seed,
    run,
    combat,
    screen,
    rewardChoices,
    eventId,
    shopVisit,
    dispatch,
    chooseBuild,
    travel,
    claimVictory,
    leaveFight,
    chooseReward,
    chooseEvent,
    buy,
    leaveShop,
    finishSession,
    cancelLeave,
    sell,
    newRun,
    savedGame,
    homeAquarium,
    runEnd,
    resume,
    toMenu,
  };
}
