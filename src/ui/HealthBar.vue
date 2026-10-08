<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ hp: number; maxHp: number; block: number }>();
const percent = computed(() => (props.maxHp > 0 ? (100 * props.hp) / props.maxHp : 0));
</script>

<template>
  <div class="healthbar" :class="{ blocking: block > 0 }">
    <span v-if="block > 0" class="block" :title="`${block} Block`">🛡️{{ block }}</span>
    <div class="bar">
      <div class="fill" :style="{ width: `${percent}%` }" />
      <span class="label">{{ hp }} / {{ maxHp }}</span>
    </div>
  </div>
</template>

<style scoped>
.healthbar { display: flex; align-items: center; gap: 6px; width: 170px; }
.bar {
  position: relative;
  flex: 1;
  height: 16px;
  border-radius: 8px;
  background: #3a1d22;
  overflow: hidden;
  border: 1px solid #0006;
}
.blocking .bar { outline: 2px solid var(--block); }
.fill { height: 100%; background: var(--hp); transition: width 0.25s ease; }
.blocking .fill { background: color-mix(in srgb, var(--hp) 55%, var(--block)); }
.label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  text-shadow: 0 1px 2px #000;
}
.block {
  padding: 0 6px;
  border-radius: 8px;
  background: var(--block);
  color: #0d1a26;
  font-weight: 800;
  font-size: 0.8rem;
}
</style>
