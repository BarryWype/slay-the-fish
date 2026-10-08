<script setup lang="ts">
import type { Combatant, IntentPreview, SpriteRef } from '../engine';
import HealthBar from './HealthBar.vue';
import IntentBadge from './IntentBadge.vue';
import SpriteView from './SpriteView.vue';
import StatusList from './StatusList.vue';

defineProps<{
  combatant: Combatant;
  portrait: string;
  sprite?: SpriteRef;
  intent?: IntentPreview | null;
  targetable?: boolean;
}>();
defineEmits<{ select: [] }>();
</script>

<template>
  <div class="combatant" :class="{ dead: combatant.hp <= 0, targetable }" @click="$emit('select')">
    <div class="intent-slot">
      <IntentBadge v-if="intent && combatant.hp > 0" :intent="intent" />
    </div>
    <div class="portrait">
      <SpriteView v-if="sprite" :sprite="sprite" :size="128" :aria-label="combatant.name" />
      <span v-else>{{ portrait }}</span>
    </div>
    <div class="name">{{ combatant.name }}</div>
    <HealthBar :hp="combatant.hp" :max-hp="combatant.maxHp" :block="combatant.block" />
    <StatusList :statuses="combatant.statuses" />
  </div>
</template>

<style scoped>
.combatant {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 2px solid transparent;
  transition: border-color 0.12s ease, background 0.12s ease;
}
.intent-slot { min-height: 44px; display: flex; align-items: flex-end; }
.portrait {
  display: grid;
  place-items: center;
  min-height: 128px;
  font-size: 4.5rem;
  line-height: 1;
  filter: drop-shadow(0 6px 6px rgb(0 0 0 / 0.5));
}
.name { font-weight: 700; }
.dead { opacity: 0.35; filter: grayscale(1); }
.targetable { cursor: crosshair; border-color: var(--highlight); background: rgb(255 255 255 / 0.04); }
.targetable:hover { background: rgb(255 255 255 / 0.09); }
</style>
