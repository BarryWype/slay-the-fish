<script setup lang="ts">
import { ref } from 'vue';
import type { Discovery, GameData } from '../engine';
import Aquarium from './Aquarium.vue';
import CreatureBook from './CreatureBook.vue';

defineProps<{
  canResume: boolean;
  homeAquarium: string[];
  creatureBook: Readonly<Record<string, Discovery>>;
  data: GameData;
}>();
const emit = defineEmits<{ resume: []; newRun: []; reset: [] }>();

/** Exit only exists in the desktop app; a browser tab can't quit itself. */
const desktop = window.desktop;
/** Menu hidden so the whole aquarium can be seen. */
const viewing = ref(false);
/** Confirmation before wiping all progression. */
const confirmReset = ref<HTMLDialogElement>();

function reset() {
  confirmReset.value?.close();
  emit('reset');
}
</script>

<template>
  <section class="menu" :class="{ viewing }">
    <Aquarium class="backdrop" :creatures="homeAquarium" :data="data" :interactive="false" title="Home aquarium" icon="🏠" />

    <div v-if="!viewing" class="panel">
      <h2>Slay the Fish</h2>
      <nav class="buttons">
        <button :disabled="!canResume" :title="canResume ? undefined : 'No saved run yet'" @click="emit('resume')">Resume</button>
        <button @click="emit('newRun')">New run</button>
        <button class="ghost" @click="viewing = true">See aquarium</button>
        <button v-if="desktop" class="ghost" @click="desktop.quit()">Exit</button>
      </nav>
    </div>
    <button v-else class="show-menu" @click="viewing = false">☰ Menu</button>
    <button v-if="!viewing" class="ghost reset" @click="confirmReset?.showModal()">Reset progression</button>

    <dialog ref="confirmReset" class="confirm" @click="$event.target === confirmReset && confirmReset?.close()">
      <h3>Reset progression?</h3>
      <p>This deletes your saved run and every creature in your home aquarium. It can't be undone.</p>
      <footer>
        <button class="ghost" autofocus @click="confirmReset?.close()">Cancel</button>
        <button class="danger" @click="reset">Reset everything</button>
      </footer>
    </dialog>
    <CreatureBook :data="data" :home-aquarium="homeAquarium" :discovered="creatureBook" />
  </section>
</template>

<style scoped>
/* The aquarium fills the window; the menu floats over it. */
.menu { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; background: var(--bg); }
.backdrop { position: absolute; inset: 0; z-index: 0; min-height: 0; }
.backdrop :deep(.tank) { border-width: 0; border-radius: 0; }
/* Its "Aquarium · N caught" header only shows when looking at the aquarium. */
.menu:not(.viewing) .backdrop :deep(.label) { display: none; }
/* Room on the right for the Menu button. */
.viewing .backdrop :deep(.label) { padding: 10px 120px 10px 16px; line-height: 2; }

.panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 36px 48px;
  border-radius: 20px;
  background: rgb(15 18 25 / 0.72);
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.45);
  backdrop-filter: blur(3px);
}
.panel h2 { margin: 0; font-size: 3rem; letter-spacing: 0.02em; }
.buttons { display: flex; flex-direction: column; gap: 12px; width: 240px; }
.buttons button { padding: 14px; font-size: 1.1rem; }
.buttons .ghost { background: rgb(15 18 25 / 0.6); color: var(--text); }

.reset {
  position: absolute;
  right: 16px;
  bottom: 14px;
  z-index: 1;
  padding: 6px 12px;
  font-size: 0.8rem;
  background: rgb(15 18 25 / 0.6);
  color: var(--muted);
}
.reset:hover { color: var(--text); }

.confirm {
  width: min(420px, calc(100vw - 32px));
  padding: 20px 24px;
  border: 2px solid #4a2a2a;
  border-radius: 16px;
  background: var(--panel);
  color: var(--text);
}
.confirm::backdrop { background: rgb(5 8 12 / 0.65); }
.confirm h3 { margin: 0 0 8px; }
.confirm p { margin: 0; color: var(--muted); }
.confirm footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
.danger { background: #c94a4a; color: #fff; }

.show-menu { position: absolute; top: 12px; right: 16px; z-index: 1; padding: 8px 14px; }
</style>
