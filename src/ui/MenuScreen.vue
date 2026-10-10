<script setup lang="ts">
import { ref } from 'vue';
import type { GameData } from '../engine';
import Aquarium from './Aquarium.vue';
import CreatureBook from './CreatureBook.vue';

defineProps<{ canResume: boolean; homeAquarium: string[]; data: GameData }>();
const emit = defineEmits<{ resume: []; newRun: [] }>();

/** Exit only exists in the desktop app; a browser tab can't quit itself. */
const desktop = window.desktop;
/** Menu hidden so the whole aquarium can be seen. */
const viewing = ref(false);
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
    <CreatureBook :data="data" :home-aquarium="homeAquarium" />
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

.show-menu { position: absolute; top: 12px; right: 16px; z-index: 1; padding: 8px 14px; }
</style>
