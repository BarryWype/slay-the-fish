<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { creatureTypeNames, type Discovery, type GameData } from '../engine';
import SpriteView from './SpriteView.vue';

/**
 * A 📖 tab on the right edge that opens a full-height drawer listing every creature in the game.
 * Creatures never encountered show as a question mark.
 */
const props = defineProps<{
  data: GameData;
  homeAquarium: string[];
  discovered: Readonly<Record<string, Discovery>>;
}>();

const open = ref(false);
const closeButton = ref<HTMLButtonElement>();
const tagNames = computed(() => creatureTypeNames(props.data));

/** Every creature, in sprite-sheet order, with how far the player got with it and how many are at home. */
const creatures = computed(() => {
  const owned = new Map<string, number>();
  for (const id of props.homeAquarium) owned.set(id, (owned.get(id) ?? 0) + 1);
  return Object.values(props.data.enemies)
    .filter((e) => e.sprite)
    .sort((a, b) => a.sprite!.index - b.sprite!.index)
    .map((e) => ({
      id: e.id,
      name: e.name,
      sprite: e.sprite!,
      type: e.tags?.map((t) => tagNames.value[t] ?? t).join(', ') ?? '',
      owned: owned.get(e.id) ?? 0,
      status: props.discovered[e.id],
    }));
});
const discoveredCount = computed(() => creatures.value.filter((c) => c.status).length);

async function show() {
  open.value = true;
  await nextTick();
  closeButton.value?.focus();
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false;
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <button class="book-tab" aria-label="Open the creature book" title="Creature book" @click="show">📖</button>

  <div class="scrim" :class="{ open }" @click="open = false" />
  <aside class="drawer" :class="{ open }" role="dialog" aria-modal="true" aria-label="Creature book" :inert="!open">
    <header>
      <h2>📖 Creature book</h2>
      <span class="total">{{ discoveredCount }} / {{ creatures.length }} discovered</span>
      <button ref="closeButton" class="ghost close" aria-label="Close the creature book" @click="open = false">✕</button>
    </header>
    <ul class="grid">
      <li
        v-for="c in creatures"
        :key="c.id"
        class="creature"
        :class="c.status"
        :title="c.status ? `${c.name} (${c.type})` : undefined"
      >
        <template v-if="c.status">
          <SpriteView :sprite="c.sprite" :size="64" />
          <span class="status">{{ c.status === 'captured' ? 'Captured' : 'Seen' }}</span>
          <span v-if="c.owned" class="owned" :title="`${c.owned} in your home aquarium`">×{{ c.owned }}</span>
        </template>
        <template v-else>
          <span class="unknown" aria-label="Not encountered yet">?</span>
          <span class="status">Unknown</span>
        </template>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.book-tab {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 2;
  transform: translateY(-50%);
  padding: 12px 10px;
  border-radius: 12px 0 0 12px;
  font-size: 1.6rem;
  line-height: 1;
}

.scrim {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: rgb(5 8 12 / 0.55);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.scrim.open { opacity: 1; pointer-events: auto; }

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  width: min(620px, 92vw);
  background: var(--panel);
  box-shadow: -8px 0 24px rgb(0 0 0 / 0.45);
  transform: translateX(100%);
  transition: transform 0.25s ease;
}
.drawer.open { transform: translateX(0); }

.drawer header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #2c3a4a; }
.drawer h2 { margin: 0; font-size: 1.2rem; }
.total { color: var(--muted); font-size: 0.85rem; }
.close { margin-left: auto; padding: 4px 10px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 16px;
  list-style: none;
  overflow-y: auto;
}
.creature {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 6px;
  border-radius: 10px;
  background: rgb(255 255 255 / 0.04);
  text-align: center;
}
.unknown {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--muted);
  opacity: 0.5;
}
.status { font-size: 0.7rem; font-weight: 600; color: var(--muted); }
.captured .status { color: #7fd18f; }
.owned {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 0 5px;
  border-radius: 8px;
  background: #2f5a3a;
  font-size: 0.7rem;
  font-weight: 700;
}

@media (prefers-reduced-motion: reduce) {
  .drawer, .scrim { transition: none; }
}
</style>
