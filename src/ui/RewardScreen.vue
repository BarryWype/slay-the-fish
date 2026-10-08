<script setup lang="ts">
import { computed } from 'vue';
import { creatureTypeNames, describeCard, type GameData } from '../engine';
import CardView from './CardView.vue';

const props = defineProps<{ choices: string[]; data: GameData }>();
const emit = defineEmits<{ choose: [cardId: string | null] }>();
const tagNames = computed(() => creatureTypeNames(props.data));
</script>

<template>
  <section class="reward">
    <h2>Choose a card to add to your deck</h2>
    <div class="choices">
      <CardView
        v-for="id in choices"
        :key="id"
        :card="data.cards[id]"
        :description="describeCard(data.cards[id], { tagNames })"
        @click="emit('choose', id)"
      />
    </div>
    <button class="ghost" @click="emit('choose', null)">Skip</button>
  </section>
</template>

<style scoped>
.reward { display: flex; flex-direction: column; align-items: center; gap: 28px; padding-top: 10vh; }
.reward h2 { margin: 0; }
.choices { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
.choices :deep(.card) { transform: scale(1.15); }
.choices :deep(.card:hover) { transform: scale(1.15) translateY(-10px); }
</style>
