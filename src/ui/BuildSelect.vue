<script setup lang="ts">
import { computed, ref } from 'vue';
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

/** The build shown in the details dialog. */
const detail = ref<BuildDef | null>(null);
const dialog = ref<HTMLDialogElement>();

function openDetails(build: BuildDef) {
  detail.value = build;
  dialog.value?.showModal();
}

/** Clicks on the dimmed backdrop land on the <dialog> itself; clicks inside land on its content. */
function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) dialog.value?.close();
}
</script>

<template>
  <section class="build-select">
    <h2>Choose how you'll fish</h2>

    <div class="builds">
      <article v-for="build in data.builds" :key="build.id" class="build">
        <button class="image" :aria-label="`${build.name}: see details`" @click="openDetails(build)">
          <SpriteView v-if="build.sprite" :sprite="build.sprite" :size="96" class="icon" />
          <span class="hint">Details</span>
        </button>
        <h3>{{ build.name }}</h3>
        <button class="select" @click="emit('choose', build.id)">Select</button>
      </article>
    </div>

    <dialog ref="dialog" class="details" @click="onDialogClick" @close="detail = null">
      <template v-if="detail">
        <header>
          <SpriteView v-if="detail.sprite" :sprite="detail.sprite" :size="72" class="icon" />
          <div>
            <h3>{{ detail.name }}</h3>
            <p class="description">{{ detail.description }}</p>
          </div>
        </header>

        <div class="strong">
          <span class="label">Strong against</span>
          <span v-for="tag in detail.strongAgainst" :key="tag" class="chip">{{ tagNames[tag] ?? tag }}</span>
        </div>

        <h4>Starter deck</h4>
        <div class="deck">
          <div v-for="{ card, count } in deckSummary(detail)" :key="card.id" class="deck-card">
            <CardView :card="card" :description="describeCard(card, { tagNames })" />
            <span class="count">×{{ count }}</span>
          </div>
        </div>

        <template v-if="detail.startingEquipment?.length">
          <h4>Starting equipment</h4>
          <ul class="equipment">
            <li v-for="id in detail.startingEquipment" :key="id">
              <span class="equipment-icon">{{ data.equipment[id]?.icon ?? '🎒' }}</span>
              <span><b>{{ data.equipment[id]?.name }}</b>: {{ data.equipment[id]?.description }}</span>
            </li>
          </ul>
        </template>

        <footer>
          <button class="ghost" @click="dialog?.close()">Close</button>
          <button @click="emit('choose', detail.id)">Select {{ detail.name }}</button>
        </footer>
      </template>
    </dialog>
  </section>
</template>

<style scoped>
.build-select { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 8px 0 12px; }
.build-select h2 { margin: 0; }

.builds { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
.build { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 180px; }
.build h3 { margin: 0; font-size: 1.1rem; }
.image {
  position: relative;
  display: grid;
  place-items: center;
  width: 140px;
  height: 140px;
  padding: 0;
  border-radius: 16px;
  border: 2px solid #2c3a4a;
  background: linear-gradient(180deg, #1f3448, #17283a);
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.image:hover,
.image:focus-visible { border-color: var(--highlight); transform: translateY(-2px); }
.hint {
  position: absolute;
  bottom: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--muted);
}
.select { width: 140px; }
.icon { filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.5)); }

/* Details dialog */
.details {
  width: min(560px, calc(100vw - 32px));
  padding: 20px 24px;
  border: 2px solid #2c3a4a;
  border-radius: 16px;
  background: linear-gradient(180deg, #1f3448, #17283a);
  color: var(--text);
}
.details::backdrop { background: rgb(5 8 12 / 0.65); }
.details header { display: flex; gap: 14px; align-items: center; }
.details h3 { margin: 0; font-size: 1.4rem; }
.details h4 { margin: 14px 0 6px; font-size: 0.85rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
.description { margin: 4px 0 0; color: var(--muted); }
.details footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }

.strong { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 12px; }
.label { font-size: 0.8rem; color: var(--muted); }
.chip { padding: 2px 10px; border-radius: 10px; background: #2f5a3a; font-size: 0.8rem; font-weight: 600; }

.deck { display: flex; gap: 10px; flex-wrap: wrap; }
.deck-card { position: relative; }
.deck-card :deep(.card) { cursor: default; }
.deck-card :deep(.card:hover) { transform: none; }
.count {
  position: absolute;
  top: -8px;
  right: -6px;
  padding: 0 6px;
  border-radius: 8px;
  background: var(--panel);
  font-weight: 800;
}

.equipment { list-style: none; margin: 0; padding: 0; font-size: 0.85rem; color: var(--muted); }
.equipment li { display: flex; gap: 6px; align-items: flex-start; }
.equipment b { color: var(--text); }
.equipment-icon { font-size: 1.1rem; line-height: 1.1; }
</style>
