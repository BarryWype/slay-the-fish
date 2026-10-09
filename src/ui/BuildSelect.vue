<script setup lang="ts">
import { computed } from 'vue';
import { creatureTypeNames, describeCard, type BuildDef, type GameData } from '../engine';
import CardView from './CardView.vue';
import SpriteView from './SpriteView.vue';

const props = defineProps<{ data: GameData }>();
const emit = defineEmits<{ choose: [buildId: string] }>();

const tagNames = computed(() => creatureTypeNames(props.data));

/** The starter deck as distinct cards with counts, in deck order. */
function deckSummary(build: BuildDef) {
  const counts = new Map<string, number>();
  for (const id of build.starterDeck) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts].map(([id, count]) => ({ card: props.data.cards[id], count }));
}
</script>

<template>
  <section class="build-select">
    <h2>Choose how you'll fish</h2>
    <p class="intro">
      Your journey starts at your grandparents' house on the waterfront. Each style starts with its own gear and
      is stronger against certain creatures.
    </p>

    <div class="builds">
      <article v-for="build in data.builds" :key="build.id" class="build">
        <SpriteView v-if="build.sprite" :sprite="build.sprite" :size="96" class="icon" />
        <h3>{{ build.name }}</h3>
        <p class="description">{{ build.description }}</p>

        <div class="strong">
          <span class="label">Strong against</span>
          <span v-for="tag in build.strongAgainst" :key="tag" class="chip">{{ tagNames[tag] ?? tag }}</span>
        </div>

        <div class="deck">
          <div v-for="{ card, count } in deckSummary(build)" :key="card.id" class="deck-card">
            <CardView :card="card" :description="describeCard(card, { tagNames })" />
            <span class="count">×{{ count }}</span>
          </div>
        </div>

        <ul v-if="build.startingEquipment?.length" class="equipment">
          <li v-for="id in build.startingEquipment" :key="id">
            <span class="equipment-icon">{{ data.equipment[id]?.icon ?? '🎒' }}</span>
            <span><b>{{ data.equipment[id]?.name }}</b>: {{ data.equipment[id]?.description }}</span>
          </li>
        </ul>

        <button @click="emit('choose', build.id)">Start with {{ build.name }}</button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.equipment { list-style: none; margin: 4px 0 8px; padding: 0; font-size: 0.82rem; color: var(--muted); text-align: left; }
.equipment li { display: flex; gap: 6px; align-items: flex-start; }
.equipment b { color: var(--text); }
.equipment-icon { font-size: 1.1rem; line-height: 1.1; }
.build-select { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px 0 24px; }
.build-select h2 { margin: 0; }
.intro { margin: 0 0 12px; max-width: 640px; text-align: center; color: var(--muted); }

.builds { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; width: 100%; }
.build {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  border: 2px solid #2c3a4a;
  background: linear-gradient(180deg, #1f3448, #17283a);
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.build:hover { border-color: var(--highlight); transform: translateY(-2px); }
.build h3 { margin: 0; font-size: 1.25rem; }
.icon { filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.5)); }
.description { margin: 0; text-align: center; color: var(--muted); min-height: 2.6em; }

.strong { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; }
.label { font-size: 0.8rem; color: var(--muted); }
.chip { padding: 2px 10px; border-radius: 10px; background: #2f5a3a; font-size: 0.8rem; font-weight: 600; }

.deck { display: flex; gap: 6px; justify-content: center; margin: 6px 0; }
.deck-card { position: relative; width: 98px; height: 140px; }
/* Cards are shown at 70% size. */
.deck-card :deep(.card) { transform: scale(0.7); transform-origin: top left; cursor: default; }
.deck-card :deep(.card:hover) { transform: scale(0.7); }
.count {
  position: absolute;
  top: -8px;
  right: -6px;
  padding: 0 6px;
  border-radius: 8px;
  background: var(--panel);
  font-weight: 800;
}
</style>
