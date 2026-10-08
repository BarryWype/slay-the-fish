<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import {
  describeCard,
  isCardPlayable,
  previewIntent,
  type CardInstance,
  type CombatAction,
  type CombatState,
  type EnemyState,
  type GameData,
} from '../engine';
import CardView from './CardView.vue';
import CombatantView from './CombatantView.vue';
import type { AnimationName } from './sprites';

const props = defineProps<{ state: CombatState; data: GameData }>();
const emit = defineEmits<{ action: [CombatAction]; claimVictory: []; restart: [] }>();

/** A card waiting for the player to click an enemy. */
const selectedUid = ref<string | null>(null);

const isPlayerTurn = computed(() => props.state.phase === 'playerTurn');
const livingEnemies = computed(() => props.state.enemies.filter((e) => e.hp > 0));
const recentLog = computed(() => props.state.log.slice(-8).reverse());

/** The end-of-fight overlay waits a moment so the capture / flee animation can play. */
const OVERLAY_DELAY_MS = 900;
const overlayVisible = ref(false);
let overlayTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  () => props.state.phase,
  (phase) => {
    clearTimeout(overlayTimer);
    overlayVisible.value = false;
    if (phase !== 'playerTurn') overlayTimer = setTimeout(() => (overlayVisible.value = true), OVERLAY_DELAY_MS);
  },
  { immediate: true },
);
onBeforeUnmount(() => clearTimeout(overlayTimer));

/** Per-enemy animation, derived by comparing each new state with the previous one. */
const animations = reactive<Record<string, { name: AnimationName; key: number }>>({});
function animate(enemyId: string, name: AnimationName) {
  animations[enemyId] = { name, key: (animations[enemyId]?.key ?? 0) + 1 };
}

watch(
  () => props.state,
  (state, previous) => {
    if (selectedUid.value && !isCardPlayable(state, selectedUid.value, props.data)) selectedUid.value = null;
    if (!previous) return;
    for (const enemy of state.enemies) {
      const before = previous.enemies.find((e) => e.id === enemy.id);
      if (!before) continue;
      if (enemy.hp <= 0 && before.hp > 0) {
        animate(enemy.id, 'capture');
      } else if (state.phase === 'lost' && previous.phase !== 'lost' && enemy.hp > 0) {
        animate(enemy.id, 'flee');
      } else if (enemy.moveHistory.length > before.moveHistory.length) {
        const moveId = enemy.moveHistory[enemy.moveHistory.length - 1];
        const move = props.data.enemies[enemy.defId].moves.find((m) => m.id === moveId);
        if (move?.effects.some((e) => e.type === 'dealDamage')) animate(enemy.id, 'attack');
      }
    }
  },
);

function cardText(card: CardInstance) {
  // With a single enemy we can show exact numbers (its Vulnerable included).
  const defender = livingEnemies.value.length === 1 ? livingEnemies.value[0].statuses : undefined;
  return describeCard(props.data.cards[card.defId], { attacker: props.state.player.statuses, defender });
}

function play(cardUid: string, targetId?: string) {
  selectedUid.value = null;
  emit('action', { type: 'playCard', cardUid, targetId });
}

function onCardClick(card: CardInstance) {
  if (!isCardPlayable(props.state, card.uid, props.data)) return;
  const def = props.data.cards[card.defId];
  if (def.target === 'none') play(card.uid);
  else if (livingEnemies.value.length === 1) play(card.uid, livingEnemies.value[0].id);
  else selectedUid.value = selectedUid.value === card.uid ? null : card.uid;
}

function onEnemyClick(enemy: EnemyState) {
  if (selectedUid.value && enemy.hp > 0) play(selectedUid.value, enemy.id);
}

function endTurn() {
  selectedUid.value = null;
  emit('action', { type: 'endTurn' });
}
</script>

<template>
  <div class="combat">
    <section class="battlefield">
      <CombatantView :combatant="state.player" :portrait="data.character.portrait ?? '🧑'" />
      <div class="enemies">
        <CombatantView
          v-for="enemy in state.enemies"
          :key="enemy.id"
          :combatant="enemy"
          :portrait="data.enemies[enemy.defId].portrait ?? '👹'"
          :sprite="data.enemies[enemy.defId].sprite"
          :animation="animations[enemy.id]?.name"
          :animation-key="animations[enemy.id]?.key"
          :intent="previewIntent(state, enemy, data)"
          :targetable="!!selectedUid && enemy.hp > 0"
          @select="onEnemyClick(enemy)"
        />
      </div>
      <ol class="log">
        <li v-for="(line, i) in recentLog" :key="state.log.length - i">{{ line }}</li>
      </ol>
    </section>

    <section class="controls">
      <div class="side">
        <div class="energy" title="Energy">{{ state.player.energy }}/{{ state.player.maxEnergy }}</div>
        <div class="pile" title="Draw pile">🂠 Draw {{ state.piles.draw.length }}</div>
      </div>

      <div class="hand">
        <CardView
          v-for="card in state.piles.hand"
          :key="card.uid"
          :card="data.cards[card.defId]"
          :description="cardText(card)"
          :playable="isCardPlayable(state, card.uid, data)"
          :selected="selectedUid === card.uid"
          @click="onCardClick(card)"
        />
        <p v-if="selectedUid" class="hint">Choose a target…</p>
      </div>

      <div class="side">
        <button class="end-turn" :disabled="!isPlayerTurn" @click="endTurn">End Turn</button>
        <div class="pile" title="Discard pile">♻️ Discard {{ state.piles.discard.length }}</div>
        <div class="pile" title="Exhausted cards">🔥 Exhaust {{ state.piles.exhaust.length }}</div>
      </div>
    </section>

    <div v-if="state.phase !== 'playerTurn' && overlayVisible" class="overlay">
      <div class="panel">
        <template v-if="state.phase === 'won'">
          <h2>Victory!</h2>
          <p>You won in {{ state.turn }} turn{{ state.turn === 1 ? '' : 's' }} with {{ state.player.hp }} HP left.</p>
          <button @click="emit('claimVictory')">Choose a reward</button>
        </template>
        <template v-else>
          <h2>Defeat</h2>
          <p>You fell on turn {{ state.turn }}.</p>
          <button @click="emit('restart')">Start a new run</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.combat { position: relative; display: flex; flex-direction: column; gap: 16px; min-height: calc(100vh - 80px); }

.battlefield {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(180deg, #1d2c3f 0%, #17324a 55%, #12283b 100%);
}
.enemies { display: flex; gap: 24px; }

.log {
  position: absolute;
  top: 10px;
  left: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.72rem;
  color: var(--muted);
  max-width: 260px;
}
.log li:first-child { color: var(--text); }

.controls { display: flex; align-items: flex-end; gap: 16px; padding: 0 8px 12px; }
.side { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 120px; }
.hand {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 24px;
  min-height: 230px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.hint { position: absolute; top: -6px; margin: 0; color: var(--highlight); font-weight: 600; }

.energy {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffe08a, var(--energy) 60%, #a5741b);
  color: #1b1d24;
  font-size: 1.4rem;
  font-weight: 800;
  box-shadow: 0 0 16px rgb(242 182 66 / 0.45);
}
.pile { font-size: 0.85rem; color: var(--muted); }
.end-turn { padding: 12px 18px; font-size: 1rem; }

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(10 11 15 / 0.7);
  border-radius: 16px;
}
.panel { padding: 28px 40px; border-radius: 16px; background: var(--panel); text-align: center; }
.panel h2 { margin: 0 0 8px; font-size: 2rem; }
</style>
