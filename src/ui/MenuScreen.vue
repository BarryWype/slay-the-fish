<script setup lang="ts">
defineProps<{ canResume: boolean }>();
const emit = defineEmits<{ resume: []; newRun: [] }>();

/** Exit only exists in the desktop app; a browser tab can't quit itself. */
const desktop = window.desktop;
</script>

<template>
  <section class="menu">
    <h2>Slay the Fish</h2>
    <nav class="buttons">
      <button :disabled="!canResume" :title="canResume ? undefined : 'No saved run yet'" @click="emit('resume')">Resume</button>
      <button @click="emit('newRun')">New run</button>
      <button v-if="desktop" class="ghost" @click="desktop.quit()">Exit</button>
    </nav>
  </section>
</template>

<style scoped>
.menu { display: flex; flex-direction: column; align-items: center; gap: 32px; padding-top: 18vh; }
.menu h2 { margin: 0; font-size: 3rem; letter-spacing: 0.02em; }
.buttons { display: flex; flex-direction: column; gap: 12px; width: 240px; }
.buttons button { padding: 14px; font-size: 1.1rem; }
</style>
