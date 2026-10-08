<script setup lang="ts">
import { computed } from 'vue';
import { describeCard, type CardDef } from '../engine';

const props = withDefaults(
  defineProps<{ card: CardDef; description?: string; playable?: boolean; selected?: boolean }>(),
  { description: undefined, playable: true, selected: false },
);

const TYPE_ICON: Record<CardDef['type'], string> = { attack: '⚔️', skill: '🛡️', power: '✨' };
const text = computed(() => props.description ?? describeCard(props.card));
</script>

<template>
  <button
    type="button"
    class="card"
    :class="[card.type, `rarity-${card.rarity}`, { unplayable: !playable, selected }]"
    :aria-disabled="!playable"
  >
    <span class="cost">{{ card.cost }}</span>
    <span class="name">{{ card.name }}</span>
    <span class="art">{{ card.art ?? TYPE_ICON[card.type] }}</span>
    <span class="type">{{ card.type }}</span>
    <span class="desc">{{ text }}</span>
  </button>
</template>

<style scoped>
.card {
  --frame: var(--attack);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 140px;
  height: 196px;
  padding: 8px;
  border: 3px solid var(--frame);
  border-radius: 12px;
  background: linear-gradient(180deg, #2c303b, #1f222a);
  color: var(--text);
  font: inherit;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgb(0 0 0 / 0.4);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
.card.skill { --frame: var(--skill); }
.card.power { --frame: var(--power); }
.card:hover:not(.unplayable) { transform: translateY(-12px); box-shadow: 0 10px 18px rgb(0 0 0 / 0.5); }
.card.selected { transform: translateY(-20px); box-shadow: 0 0 0 3px var(--highlight), 0 12px 20px rgb(0 0 0 / 0.5); }
.card.unplayable { opacity: 0.5; cursor: not-allowed; }

.cost {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #fff6;
  background: var(--energy);
  color: #1b1d24;
  font-weight: 800;
  line-height: 26px;
}
.name { font-weight: 700; font-size: 0.95rem; margin: 2px 0 6px 12px; }
.rarity-uncommon .name { color: #8ecbff; }
.rarity-rare .name { color: #ffd76a; }
.art {
  display: grid;
  place-items: center;
  height: 56px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--frame) 25%, #14161c);
  font-size: 1.8rem;
}
.type {
  align-self: center;
  margin: -8px 0 6px;
  padding: 0 8px;
  border-radius: 8px;
  background: #14161c;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.desc { flex: 1; display: grid; place-items: center; font-size: 0.8rem; line-height: 1.3; }
</style>
