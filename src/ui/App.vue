<script setup lang="ts">
import Aquarium from './Aquarium.vue';
import BuildSelect from './BuildSelect.vue';
import CombatView from './CombatView.vue';
import EventScreen from './EventScreen.vue';
import MapView from './MapView.vue';
import MenuScreen from './MenuScreen.vue';
import RewardScreen from './RewardScreen.vue';
import ShopScreen from './ShopScreen.vue';
import { useGame } from './useGame';

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000);
}

/** `?seed=123` in the URL replays the same run. */
function initialSeed() {
  const param = new URLSearchParams(location.search).get('seed');
  const seed = param === null ? NaN : Number(param);
  return Number.isInteger(seed) ? seed : randomSeed();
}

const game = useGame(initialSeed());
const { data, seed, run, combat, screen, rewardChoices, eventId, shopVisit, savedGame } = game;

function newRun() {
  game.newRun(randomSeed());
}

/** The first run from the menu honours `?seed=`; later ones are random. */
let firstRun = true;
function newRunFromMenu() {
  game.newRun(firstRun ? initialSeed() : randomSeed());
  firstRun = false;
}
</script>

<template>
  <header class="topbar">
    <h1>Spire Slice</h1>
    <div v-if="screen !== 'menu'" class="run-info">
      <template v-if="run && screen !== 'build'">
        <span>{{ data.builds[run.build]?.name }}</span>
        <span>Floor {{ run.floor }}</span>
        <span>❤️ {{ combat?.player.hp ?? run.hp }}/{{ run.maxHp }}</span>
        <span title="Coins">🪙 {{ run.coins }}</span>
        <span>🂠 Deck {{ run.deck.length }}</span>
      </template>
      <span class="seed" title="Open with ?seed=N in the URL to replay this run">Seed {{ seed }}</span>
      <button class="ghost" @click="game.toMenu">Menu</button>
      <button class="ghost" @click="newRun">New run</button>
    </div>
  </header>

  <main>
    <MenuScreen v-if="screen === 'menu'" :can-resume="!!savedGame" @resume="game.resume" @new-run="newRunFromMenu" />
    <BuildSelect v-else-if="screen === 'build' || !run" :data="data" @choose="game.chooseBuild" />
    <div v-else-if="screen === 'map'" class="map-layout">
      <MapView :run="run" :data="data" @travel="game.travel" />
      <Aquarium class="aquarium" :captured="run.captured" :data="data" @sell="game.sell" />
    </div>
    <CombatView
      v-else-if="screen === 'combat' && combat"
      :state="combat"
      :data="data"
      :equipment="run.equipment"
      @action="game.dispatch"
      @claim-victory="game.claimVictory"
      @leave="game.leaveFight"
      @restart="newRun"
    />
    <EventScreen v-else-if="screen === 'event' && eventId" :event-id="eventId" :run="run" :data="data" @choose="game.chooseEvent" />
    <ShopScreen
      v-else-if="screen === 'shop'"
      :run="run"
      :data="data"
      :visit="shopVisit"
      @buy="game.buy"
      @leave="game.leaveShop"
    />
    <RewardScreen v-else-if="screen === 'reward'" :choices="rewardChoices" :data="data" @choose="game.chooseReward" />
    <section v-else-if="screen === 'complete'" class="complete">
      <h2>Run complete!</h2>
      <p>You cleared every fight on the map with {{ run.hp }} HP left.</p>
      <button @click="newRun">Start a new run</button>
    </section>
  </main>
</template>

<style scoped>

/* Map on top, aquarium fills whatever height is left. */
.map-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - 64px);
  padding-bottom: 12px;
}
.map-layout .aquarium { flex: 1; }

.complete { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-top: 15vh; }
.complete h2 { margin: 0; font-size: 2rem; }
</style>
