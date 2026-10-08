<script setup lang="ts">
import Aquarium from './Aquarium.vue';
import CombatView from './CombatView.vue';
import MapView from './MapView.vue';
import RewardScreen from './RewardScreen.vue';
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
const { data, run, combat, screen, rewardChoices } = game;

function newRun() {
  game.newRun(randomSeed());
}
</script>

<template>
  <header class="topbar">
    <h1>Spire Slice</h1>
    <div class="run-info">
      <span>Floor {{ run.floor }}</span>
      <span>❤️ {{ combat?.player.hp ?? run.hp }}/{{ run.maxHp }}</span>
      <span>🂠 Deck {{ run.deck.length }}</span>
      <span class="seed" title="Open with ?seed=N in the URL to replay this run">Seed {{ run.seed }}</span>
      <button class="ghost" @click="newRun">New run</button>
    </div>
  </header>

  <main>
    <div v-if="screen === 'map'" class="map-layout">
      <MapView :run="run" :data="data" @travel="game.travel" />
      <Aquarium class="aquarium" :captured="run.captured" :data="data" />
    </div>
    <CombatView
      v-else-if="screen === 'combat' && combat"
      :state="combat"
      :data="data"
      @action="game.dispatch"
      @claim-victory="game.claimVictory"
      @restart="newRun"
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
