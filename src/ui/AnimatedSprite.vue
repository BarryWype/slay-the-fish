<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { ANIMATION_FRAME, ANIMATION_FRAMES, ANIMATIONS, type AnimationName } from './sprites';

/**
 * Plays one row of an animated sheet. Looping rows run forever; one-shot rows
 * stop on their last frame and emit `done`. Change `playKey` to restart.
 */
const props = withDefaults(defineProps<{ url: string; animation: AnimationName; playKey?: number; size?: number }>(), {
  playKey: 0,
  size: 192,
});
const emit = defineEmits<{ done: [AnimationName] }>();

const frame = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

function play() {
  clearInterval(timer);
  frame.value = 0;
  const { fps, loop } = ANIMATIONS[props.animation];
  const name = props.animation;
  timer = setInterval(() => {
    if (frame.value < ANIMATION_FRAMES - 1) frame.value++;
    else if (loop) frame.value = 0;
    else {
      clearInterval(timer);
      emit('done', name);
    }
  }, 1000 / fps);
}

watch(() => [props.animation, props.playKey, props.url], play, { immediate: true });
onBeforeUnmount(() => clearInterval(timer));

const style = computed(() => {
  const scale = props.size / ANIMATION_FRAME;
  const row = ANIMATIONS[props.animation].row;
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    backgroundImage: `url(${props.url})`,
    backgroundSize: `${ANIMATION_FRAMES * props.size}px ${4 * props.size}px`,
    backgroundPosition: `-${frame.value * props.size}px -${row * ANIMATION_FRAME * scale}px`,
  };
});
</script>

<template>
  <div class="animated-sprite" :style="style" role="img" />
</template>

<style scoped>
.animated-sprite { image-rendering: pixelated; background-repeat: no-repeat; flex-shrink: 0; }
</style>
