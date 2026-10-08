<script setup lang="ts">
import { computed } from 'vue';
import type { SpriteRef } from '../engine';
import { cellOf, SHEETS } from './sprites';

/** One cell of a sprite sheet, scaled with crisp pixels. `size` is in CSS px. */
const props = withDefaults(defineProps<{ sprite: SpriteRef; size?: number }>(), { size: 96 });

const style = computed(() => {
  const sheet = SHEETS[props.sprite.sheet];
  if (!sheet) return {};
  const { column, row } = cellOf(sheet, props.sprite.index);
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    backgroundImage: `url(${sheet.url})`,
    backgroundSize: `${sheet.columns * props.size}px ${sheet.rows * props.size}px`,
    backgroundPosition: `-${column * props.size}px -${row * props.size}px`,
  };
});
</script>

<template>
  <div class="sprite" :style="style" role="img" />
</template>

<style scoped>
.sprite { image-rendering: pixelated; background-repeat: no-repeat; flex-shrink: 0; }
</style>
