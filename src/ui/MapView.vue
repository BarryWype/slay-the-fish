<script setup lang="ts">
import { computed } from 'vue';
import { availableDestinations, type GameData, type MapNode, type RunState } from '../engine';
import { cellOf, SHEETS } from './sprites';

const props = defineProps<{ run: RunState; data: GameData }>();
const emit = defineEmits<{ travel: [nodeId: string] }>();

// SVG layout (viewBox units; the SVG scales to the available width).
const COLUMN_GAP = 110;
const PADDING = 40;
const HEIGHT = 340;
const RADIUS = 24;
const SPRITE = 40;

const columns = computed(() => props.run.map.columns);
const width = computed(() => PADDING * 2 + (columns.value.length - 1) * COLUMN_GAP);
const destinations = computed(() => new Set(availableDestinations(props.run).map((n) => n.id)));
const visited = computed(() => new Set(props.run.visited));
const currentColumn = computed(() => Number(props.run.position.split('-')[0]));

function x(node: MapNode) {
  return PADDING + node.column * COLUMN_GAP;
}
function y(node: MapNode) {
  return (HEIGHT * (node.row + 0.5)) / columns.value[node.column].length;
}
function nodeById(id: string) {
  return columns.value.flat().find((n) => n.id === id)!;
}

const edges = computed(() =>
  columns.value.flat().flatMap((from) =>
    from.next.map((id) => {
      const to = nodeById(id);
      const travelled = visited.value.has(from.id) && visited.value.has(to.id);
      const open = from.id === props.run.position && destinations.value.has(to.id);
      return { key: `${from.id}>${to.id}`, x1: x(from), y1: y(from), x2: x(to), y2: y(to), travelled, open };
    }),
  ),
);

function nodeState(node: MapNode) {
  if (node.id === props.run.position) return 'current';
  if (destinations.value.has(node.id)) return 'available';
  if (visited.value.has(node.id)) return 'visited';
  return node.column < currentColumn.value ? 'skipped' : 'locked';
}

function firstEnemy(node: MapNode) {
  const encounter = props.data.encounters.find((e) => e.id === node.encounterId);
  return encounter && props.data.enemies[encounter.enemies[0]];
}

function label(node: MapNode) {
  if (node.id === props.run.position) return 'A';
  if (node.encounterId === null) return props.data.character.home.icon ?? '🏠';
  if (visited.value.has(node.id)) return '✓';
  return firstEnemy(node)?.portrait ?? '⚔️';
}

/** The sprite to draw inside a node (as an SVG viewport onto the sheet), if any. */
function nodeSprite(node: MapNode) {
  if (node.id === props.run.position || visited.value.has(node.id)) return null;
  const sprite = firstEnemy(node)?.sprite;
  const sheet = sprite && SHEETS[sprite.sheet];
  if (!sprite || !sheet) return null;
  const { column, row } = cellOf(sheet, sprite.index);
  return {
    url: sheet.url,
    viewBox: `${column * sheet.cell} ${row * sheet.cell} ${sheet.cell} ${sheet.cell}`,
    width: sheet.columns * sheet.cell,
    height: sheet.rows * sheet.cell,
  };
}

function title(node: MapNode) {
  if (node.encounterId === null) return props.data.character.home.name;
  return props.data.encounters.find((e) => e.id === node.encounterId)?.name ?? 'Fight';
}

function choose(node: MapNode) {
  if (destinations.value.has(node.id)) emit('travel', node.id);
}
</script>

<template>
  <section class="map-screen">
    <h2>Choose your next destination</h2>
    <p class="progress">Step {{ currentColumn }} of {{ columns.length - 1 }}</p>

    <svg class="map" :viewBox="`0 0 ${width} ${HEIGHT}`" role="group" aria-label="Map">
      <line
        v-for="e in edges"
        :key="e.key"
        :x1="e.x1"
        :y1="e.y1"
        :x2="e.x2"
        :y2="e.y2"
        class="edge"
        :class="{ travelled: e.travelled, open: e.open }"
      />
      <g
        v-for="node in columns.flat()"
        :key="node.id"
        class="node"
        :class="nodeState(node)"
        :transform="`translate(${x(node)} ${y(node)})`"
        :role="destinations.has(node.id) ? 'button' : undefined"
        :tabindex="destinations.has(node.id) ? 0 : undefined"
        @click="choose(node)"
        @keydown.enter="choose(node)"
      >
        <title>{{ title(node) }}</title>
        <circle :r="RADIUS" />
        <svg
          v-if="nodeSprite(node)"
          :x="-SPRITE / 2"
          :y="-SPRITE / 2"
          :width="SPRITE"
          :height="SPRITE"
          :viewBox="nodeSprite(node)!.viewBox"
        >
          <image
            :href="nodeSprite(node)!.url"
            :width="nodeSprite(node)!.width"
            :height="nodeSprite(node)!.height"
            class="pixelated"
          />
        </svg>
        <text v-else dominant-baseline="central" text-anchor="middle">{{ label(node) }}</text>
      </g>
    </svg>
  </section>
</template>

<style scoped>
.map-screen { display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 4vh; }
.map-screen h2 { margin: 0; }
.progress { margin: 0 0 16px; color: var(--muted); }

.map {
  width: 100%;
  max-height: 70vh;
  padding: 16px;
  border-radius: 16px;
  /* Shore on the left, deepening water to the right. */
  background: linear-gradient(90deg, #4a3f2c 0%, #3a4a3f 6%, #1f4a5e 14%, #17324a 60%, #0f2236 100%);
}

.edge { stroke: #5d7891; stroke-width: 3; stroke-dasharray: 6 6; opacity: 0.6; }
.edge.travelled { stroke: #c9d6e2; stroke-dasharray: none; opacity: 1; }
.edge.open { opacity: 1; }
.edge.open { stroke: var(--highlight); stroke-dasharray: none; }

.node circle { fill: #23262f; stroke: #4a4f5c; stroke-width: 3; }
.node text { font-size: 20px; fill: var(--text); user-select: none; }
.pixelated { image-rendering: pixelated; }

.node.current circle { fill: var(--energy); stroke: #fff; }
.node.current text { fill: #1b1d24; font-weight: 800; font-size: 22px; }
.node.visited circle { fill: #3a3e4a; }
.node.visited text { fill: var(--muted); }
.node.skipped, .node.locked { opacity: 0.45; }
.node.skipped { opacity: 0.2; }

.node.available { cursor: pointer; }
.node.available circle { stroke: var(--highlight); animation: pulse 1.4s ease-in-out infinite; }
.node.available:hover circle,
.node.available:focus circle { fill: #3b3622; }
.node.available:focus { outline: none; }

@keyframes pulse {
  50% { stroke-width: 6; }
}
</style>
