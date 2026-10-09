<script setup lang="ts">
import { computed, ref } from 'vue';
import type { GameData, Habitat } from '../engine';
import AnimatedSprite from './AnimatedSprite.vue';
import SpriteView from './SpriteView.vue';
import { animatedSheetFor, creatureClip } from './sprites';

const props = defineProps<{ captured: string[]; data: GameData }>();
const emit = defineEmits<{ sell: [slot: number] }>();

const SIZE = 96;

/** Stable pseudo-random number in [0, 1) per (creature slot, channel), so fish keep their lanes. */
function rand(slot: number, channel: number) {
  const x = Math.sin(slot * 127.1 + channel * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Stable number per string, so a fish keeps its lane when others are sold. */
function hash(text: string) {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) % 10007;
  return h;
}

function placement(habitat: Habitat, slot: number) {
  const duration =
    habitat === 'bottom' ? 30 + rand(slot, 1) * 25 : habitat === 'drift' ? 22 + rand(slot, 1) * 14 : 12 + rand(slot, 1) * 12;
  const vertical =
    habitat === 'bottom'
      ? { bottom: `${2 + rand(slot, 2) * 4}%` }
      : { top: `${(habitat === 'drift' ? 6 : 10) + rand(slot, 2) * (habitat === 'drift' ? 30 : 48)}%` };
  return {
    ...vertical,
    '--duration': `${duration.toFixed(1)}s`,
    // A negative delay starts each creature mid-swim, at a different spot.
    '--delay': `-${(rand(slot, 3) * duration * 2).toFixed(1)}s`,
    '--bob': `${(3 + rand(slot, 4) * 3).toFixed(1)}s`,
    '--rest': `${(rand(slot, 5) * 85).toFixed(1)}%`,
    zIndex: habitat === 'bottom' ? 3 : 2,
  };
}

const residents = computed(() => {
  const copies = new Map<string, number>();
  return props.captured.map((id, slot) => {
    const def = props.data.enemies[id];
    const habitat = def?.habitat ?? 'swim';
    const copy = copies.get(id) ?? 0;
    copies.set(id, copy + 1);
    const key = `${id}#${copy}`;
    return {
      key,
      slot,
      name: def?.name ?? id,
      sellValue: def?.sellValue ?? 0,
      habitat,
      url: def?.sprite ? animatedSheetFor(def.sprite) : undefined,
      sprite: def?.sprite,
      portrait: def?.portrait ?? '🐟',
      style: placement(habitat, hash(key)),
    };
  });
});

const selectedKey = ref<string | null>(null);
const selected = computed(() => residents.value.find((r) => r.key === selectedKey.value));

function sell() {
  if (!selected.value) return;
  emit('sell', selected.value.slot);
  selectedKey.value = null;
}

// Decoration: seaweed from objects.png (1 green algae, 2 red algae, 3 seaweed) and rising bubbles.
const plants = [
  { index: 3, left: '4%', size: 96, delay: '0s' },
  { index: 1, left: '15%', size: 72, delay: '-1.2s' },
  { index: 2, left: '47%', size: 80, delay: '-2.1s' },
  { index: 3, left: '78%', size: 88, delay: '-0.6s' },
  { index: 1, left: '90%', size: 64, delay: '-1.7s' },
];
const bubbles = Array.from({ length: 14 }, (_, i) => ({
  left: `${(rand(i, 7) * 96 + 2).toFixed(1)}%`,
  size: `${(4 + rand(i, 8) * 8).toFixed(0)}px`,
  duration: `${(5 + rand(i, 9) * 6).toFixed(1)}s`,
  delay: `-${(rand(i, 10) * 10).toFixed(1)}s`,
}));
</script>

<template>
  <section class="aquarium" aria-label="Aquarium">
    <header class="label">
      <span>🐠 Aquarium</span>
      <span class="count">{{ captured.length }} caught</span>
    </header>

    <div class="tank">
      <div class="surface" />
      <div class="rays" />
      <span
        v-for="(b, i) in bubbles"
        :key="`b${i}`"
        class="bubble"
        :style="{ left: b.left, width: b.size, height: b.size, animationDuration: b.duration, animationDelay: b.delay }"
      />

      <div class="sand" />
      <div
        v-for="(p, i) in plants"
        :key="`p${i}`"
        class="plant"
        :style="{ left: p.left, animationDelay: p.delay }"
      >
        <SpriteView :sprite="{ sheet: 'objects', index: p.index }" :size="p.size" />
      </div>

      <div
        v-for="r in residents"
        :key="r.key"
        class="resident"
        :class="[r.habitat, { selected: r.key === selectedKey }]"
        :style="r.style"
        :title="`${r.name} (🪙 ${r.sellValue})`"
        role="button"
        tabindex="0"
        @click="selectedKey = r.key"
        @keydown.enter="selectedKey = r.key"
      >
        <div class="facing">
          <div class="bob">
            <AnimatedSprite v-if="r.url" :clip="creatureClip(r.url, 'idle')" :size="SIZE" />
            <SpriteView v-else-if="r.sprite" :sprite="r.sprite" :size="SIZE * (2 / 3)" />
            <span v-else class="emoji">{{ r.portrait }}</span>
          </div>
        </div>
      </div>

      <div v-if="selected" class="sell-panel" @keydown.esc="selectedKey = null">
        <strong>{{ selected.name }}</strong>
        <span class="sell-value">🪙 {{ selected.sellValue }}</span>
        <div class="actions">
          <button @click="sell">Sell</button>
          <button class="ghost" @click="selectedKey = null">Keep</button>
        </div>
      </div>

      <p v-if="!captured.length" class="empty">Your aquarium is empty. Catch something!</p>
      <div class="glare" />
    </div>
  </section>
</template>

<style scoped>
.aquarium { display: flex; flex-direction: column; gap: 6px; min-height: 220px; }
.label { display: flex; justify-content: space-between; font-weight: 700; padding: 0 4px; }
.count { color: var(--muted); font-weight: 500; }

.tank {
  --size: 96px;
  position: relative;
  flex: 1;
  overflow: hidden;
  border: 6px solid #5c6b78;
  border-top-width: 10px;
  border-radius: 10px 10px 14px 14px;
  background: linear-gradient(180deg, #4fa6c7 0%, #2b7fa8 30%, #1d5f86 70%, #164a6b 100%);
  box-shadow: inset 0 0 40px rgb(0 0 0 / 0.35), 0 8px 18px rgb(0 0 0 / 0.4);
}

/* Water line just under the rim. */
.surface {
  position: absolute;
  inset: 0 0 auto;
  height: 10px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.35), transparent);
}
.rays {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(105deg, rgb(255 255 255 / 0.06) 0 40px, transparent 40px 110px);
  animation: rays 12s ease-in-out infinite alternate;
}
.glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(120deg, rgb(255 255 255 / 0.12) 0%, transparent 25%, transparent 75%, rgb(255 255 255 / 0.05) 100%);
  z-index: 5;
}
.sand {
  position: absolute;
  inset: auto 0 0;
  height: 14%;
  min-height: 26px;
  background:
    radial-gradient(ellipse 60% 60% at 30% 0%, #e2c98f 0 40%, transparent 41%),
    radial-gradient(ellipse 50% 70% at 80% 10%, #d8bd80 0 40%, transparent 41%),
    linear-gradient(180deg, #d4b679, #b8975a);
  z-index: 1;
}

.plant {
  position: absolute;
  bottom: 4%;
  transform-origin: 50% 100%;
  animation: sway 4s ease-in-out infinite alternate;
  z-index: 1;
}

.bubble {
  position: absolute;
  bottom: -12px;
  border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 0.6);
  background: rgb(255 255 255 / 0.15);
  animation: rise linear infinite;
}

/* Residents: the outer element travels left/right, `.facing` flips the sprite
   (sprites face left) in sync, `.bob` adds a little vertical life. */
.resident {
  position: absolute;
  left: 0;
  width: var(--size);
  animation: travel var(--duration) ease-in-out var(--delay) infinite alternate;
}
.facing { animation: face calc(var(--duration) * 2) linear var(--delay) infinite; }
.bob { animation: bob var(--bob) ease-in-out infinite alternate; }
.drift .bob { animation-name: drift; animation-duration: calc(var(--bob) * 2); }
.bottom .bob { animation: none; }
.emoji { font-size: 3rem; }

.resident { cursor: pointer; }
.resident:focus { outline: none; }
.resident:hover .bob,
.resident:focus-visible .bob { filter: drop-shadow(0 0 4px rgb(255 255 255 / 0.7)); }
.resident.selected .bob { filter: drop-shadow(0 0 6px var(--highlight)); }

.sell-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgb(20 24 32 / 0.9);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.4);
}
.sell-panel .sell-value { color: var(--energy); font-weight: 700; }
.sell-panel .actions { display: flex; gap: 6px; margin-top: 4px; }

.empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  color: rgb(255 255 255 / 0.7);
  font-style: italic;
  z-index: 4;
}

@keyframes travel {
  from { left: 0%; }
  to { left: calc(100% - var(--size)); }
}
@keyframes face {
  0%, 49.99% { transform: scaleX(-1); }
  50%, 100% { transform: scaleX(1); }
}
@keyframes bob {
  from { transform: translateY(-4px); }
  to { transform: translateY(4px); }
}
@keyframes drift {
  from { transform: translateY(-28px); }
  to { transform: translateY(28px); }
}
@keyframes sway {
  from { transform: rotate(-4deg); }
  to { transform: rotate(4deg); }
}
@keyframes rise {
  from { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  to { transform: translateY(-110vh); opacity: 0.6; }
}
@keyframes rays {
  from { transform: translateX(-30px); }
  to { transform: translateX(30px); }
}

@media (prefers-reduced-motion: reduce) {
  .resident, .facing, .bob, .plant, .bubble, .rays { animation: none; }
  .resident { left: var(--rest); }
}
</style>
