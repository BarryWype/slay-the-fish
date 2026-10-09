<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import {
  creatureTypeNames,
  describeCard,
  isCardEffectiveAgainst,
  instantSaleValue,
  isAlive,
  isCardPlayable,
  PLAYER_ID,
  previewIntent,
  escapeRise,
  type CardInstance,
  type CombatAction,
  type CombatState,
  type EnemyState,
  type GameData,
} from '../engine';
import CardView from './CardView.vue';
import CombatantView from './CombatantView.vue';
import {
  animatedSheetFor,
  creatureClip,
  PLAYER_CLIPS,
  type AnimationClip,
  type AnimationName,
  type PlayerAnimation,
} from './sprites';

const props = defineProps<{ state: CombatState; data: GameData; equipment: string[] }>();
const emit = defineEmits<{ action: [CombatAction]; claimVictory: []; leave: []; restart: [] }>();

/** A card waiting for the player to click an enemy. */
const selectedUid = ref<string | null>(null);

/** Coins from creatures sold on the spot by equipment (null when they go to the aquarium). */
const instantSale = computed(() => {
  const sales = props.state.enemies.map((e) => instantSaleValue(e.defId, props.equipment, props.data));
  return sales.some((s) => s === null) ? null : sales.reduce<number>((sum, s) => sum + (s ?? 0), 0);
});

const isPlayerTurn = computed(() => props.state.phase === 'playerTurn');
const livingEnemies = computed(() => props.state.enemies.filter(isAlive));
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

/**
 * Per-combatant animation (keyed by combatant id, the player included), derived
 * by comparing each new state with the previous one.
 */
const animations = reactive<Record<string, { name: AnimationName | PlayerAnimation; key: number }>>({});
function animate(id: string, name: AnimationName | PlayerAnimation) {
  animations[id] = { name, key: (animations[id]?.key ?? 0) + 1 };
}

/** Let the creature's lunge land before the fisherman flinches. */
const HURT_DELAY_MS = 300;
let hurtTimer: ReturnType<typeof setTimeout> | undefined;
onBeforeUnmount(() => clearTimeout(hurtTimer));

function playerClip(): AnimationClip {
  const name = animations[PLAYER_ID]?.name;
  return PLAYER_CLIPS[name === 'win' || name === 'hurt' ? name : 'idle'];
}
function enemyClip(enemy: EnemyState): AnimationClip | undefined {
  const sprite = props.data.enemies[enemy.defId].sprite;
  const url = sprite && animatedSheetFor(sprite);
  const name = animations[enemy.id]?.name;
  const creatureName: AnimationName = name === 'attack' || name === 'capture' || name === 'flee' ? name : 'idle';
  return url ? creatureClip(url, creatureName) : undefined;
}
/** One-shot reactions (attack, hurt) return to idle; end-of-fight ones hold their last frame. */
function onAnimationDone(id: string) {
  const name = animations[id]?.name;
  if (props.state.phase === 'playerTurn' && (name === 'attack' || name === 'hurt')) animate(id, 'idle');
}

watch(
  () => props.state,
  (state, previous) => {
    if (selectedUid.value && !isCardPlayable(state, selectedUid.value, props.data)) selectedUid.value = null;
    if (!previous) return;

    const caughtOrEscaped = state.phase === 'won' || state.phase === 'fled';
    if (caughtOrEscaped && previous.phase === 'playerTurn') {
      clearTimeout(hurtTimer); // a late flinch must not replace the catch
      animate(PLAYER_ID, 'win');
    } else if (state.player.hp < previous.player.hp) {
      clearTimeout(hurtTimer);
      hurtTimer = setTimeout(() => {
        if (props.state.phase !== 'won' && props.state.phase !== 'fled') animate(PLAYER_ID, 'hurt');
      }, HURT_DELAY_MS);
    }

    for (const enemy of state.enemies) {
      const before = previous.enemies.find((e) => e.id === enemy.id);
      if (!before) continue;
      if (!isAlive(enemy) && isAlive(before)) {
        animate(enemy.id, 'capture');
      } else if (state.phase === 'fled' && previous.phase !== 'fled' && enemy.escape >= enemy.escapeAt) {
        animate(enemy.id, 'flee');
      } else if (state.phase === 'lost' && previous.phase !== 'lost' && isAlive(enemy)) {
        animate(enemy.id, 'flee');
      } else if (enemy.moveHistory.length > before.moveHistory.length) {
        const moveId = enemy.moveHistory[enemy.moveHistory.length - 1];
        const move = props.data.enemies[enemy.defId].moves.find((m) => m.id === moveId);
        if (move?.effects.some((e) => e.type === 'dealDamage')) animate(enemy.id, 'attack');
      }
    }
  },
);

const tagNames = computed(() => creatureTypeNames(props.data));

function cardText(card: CardInstance) {
  // With a single enemy we can show exact numbers (its Vulnerable and type bonus included).
  const only = livingEnemies.value.length === 1 ? livingEnemies.value[0] : undefined;
  return describeCard(props.data.cards[card.defId], {
    attacker: props.state.player.statuses,
    defender: only?.statuses,
    defenderTags: only?.tags,
    tagNames: tagNames.value,
  });
}

/** Glow when the card's type bonus applies to at least one living enemy. */
function isEffective(card: CardInstance) {
  const def = props.data.cards[card.defId];
  return livingEnemies.value.some((e) => isCardEffectiveAgainst(def, e.tags));
}

function typeLabel(enemy: EnemyState) {
  return enemy.tags.map((t) => tagNames.value[t] ?? t).join(' · ');
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
  if (selectedUid.value && isAlive(enemy)) play(selectedUid.value, enemy.id);
}

function endTurn() {
  selectedUid.value = null;
  emit('action', { type: 'endTurn' });
}
</script>

<template>
  <div class="combat">
    <section class="battlefield">
      <CombatantView
        :combatant="state.player"
        :portrait="data.character.portrait ?? '🧑'"
        :clip="playerClip()"
        :animation-key="animations[PLAYER_ID]?.key"
        @animation-done="onAnimationDone(PLAYER_ID)"
      />
      <div class="enemies">
        <CombatantView
          v-for="enemy in state.enemies"
          :key="enemy.id"
          :combatant="enemy"
          :portrait="data.enemies[enemy.defId].portrait ?? '👹'"
          :sprite="data.enemies[enemy.defId].sprite"
          :subtitle="typeLabel(enemy)"
          :clip="enemyClip(enemy)"
          :animation-key="animations[enemy.id]?.key"
          :intent="previewIntent(state, enemy, data)"
          :escape-bar="{ escape: enemy.escape, escapeAt: enemy.escapeAt, escapeRate: escapeRise(enemy) }"
          :targetable="!!selectedUid && isAlive(enemy)"
          @select="onEnemyClick(enemy)"
          @animation-done="onAnimationDone(enemy.id)"
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
          :effective="isEffective(card)"
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
          <p v-if="instantSale !== null">Sold on the spot for 🪙 {{ instantSale }}.</p>
          <button @click="emit('claimVictory')">Choose a reward</button>
        </template>
        <template v-else-if="state.phase === 'fled'">
          <h2>It got away!</h2>
          <p>{{ state.enemies.find((e) => e.escape >= e.escapeAt)?.name }} broke free on turn {{ state.turn }}. No catch this time.</p>
          <button @click="emit('leave')">Back to the map</button>
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
