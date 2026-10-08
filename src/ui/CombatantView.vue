<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Combatant, IntentPreview, SpriteRef } from '../engine';
import AnimatedSprite from './AnimatedSprite.vue';
import HealthBar from './HealthBar.vue';
import IntentBadge from './IntentBadge.vue';
import SpriteView from './SpriteView.vue';
import StatusList from './StatusList.vue';
import { animatedSheetFor, type AnimationName } from './sprites';

const props = withDefaults(
  defineProps<{
    combatant: Combatant;
    portrait: string;
    sprite?: SpriteRef;
    intent?: IntentPreview | null;
    targetable?: boolean;
    /** Animation to play; bump `animationKey` to replay the same one. */
    animation?: AnimationName;
    animationKey?: number;
  }>(),
  { sprite: undefined, intent: null, animation: 'idle', animationKey: 0 },
);
defineEmits<{ select: [] }>();

const animatedUrl = computed(() => (props.sprite ? animatedSheetFor(props.sprite) : undefined));

// One-shot attacks fall back to idle; capture and flee hold their last frame.
const current = ref<AnimationName>(props.animation);
watch(
  () => [props.animation, props.animationKey],
  () => (current.value = props.animation),
);
function onDone(name: AnimationName) {
  if (name === 'attack') current.value = 'idle';
}
</script>

<template>
  <div
    class="combatant"
    :class="{ dead: combatant.hp <= 0, animated: !!animatedUrl, targetable }"
    @click="$emit('select')"
  >
    <div class="intent-slot">
      <IntentBadge v-if="intent && combatant.hp > 0" :intent="intent" />
    </div>
    <div class="portrait">
      <AnimatedSprite
        v-if="animatedUrl"
        :url="animatedUrl"
        :animation="current"
        :play-key="animationKey"
        :size="168"
        :aria-label="combatant.name"
        @done="onDone"
      />
      <SpriteView v-else-if="sprite" :sprite="sprite" :size="128" :aria-label="combatant.name" />
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
/* Animated creatures show their capture animation instead of fading out. */
.dead.animated { opacity: 1; filter: none; }
.dead.animated > :not(.portrait) { opacity: 0.35; }
.targetable { cursor: crosshair; border-color: var(--highlight); background: rgb(255 255 255 / 0.04); }
.targetable:hover { background: rgb(255 255 255 / 0.09); }
</style>
