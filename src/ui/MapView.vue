<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { availableDestinations, MAP_LANES, type GameData, type MapNode, type RunState } from '../engine';

const props = defineProps<{ run: RunState; data: GameData }>();
const emit = defineEmits<{ travel: [nodeId: string] }>();

// SVG layout in pixels. Columns are spaced so 5–6 fit in the visible area; the rest scroll horizontally.
const PADDING = 40;
const HEIGHT = 390;
const RADIUS = 24;

const scroller = ref<HTMLElement>();
const viewportWidth = ref(800);
const resizeObserver = new ResizeObserver(([entry]) => (viewportWidth.value = entry.contentRect.width));
onMounted(() => resizeObserver.observe(scroller.value!));
onBeforeUnmount(() => resizeObserver.disconnect());

const columnGap = computed(() => (viewportWidth.value - PADDING * 2) / (viewportWidth.value >= 900 ? 5.5 : 4.5));
const columns = computed(() => props.run.map.columns);
const width = computed(() => PADDING * 2 + (columns.value.length - 1) * columnGap.value);
const destinations = computed(() => new Set(availableDestinations(props.run).map((n) => n.id)));
const visited = computed(() => new Set(props.run.visited));
const equipment = computed(() => props.run.equipment.map((id) => props.data.equipment[id]).filter(Boolean));
const currentColumn = computed(() => Number(props.run.position.split('-')[0]));

/** Keep the current position near the left edge, with the next choices in view. */
watch(
  [currentColumn, columnGap],
  async () => {
    await nextTick();
    scroller.value?.scrollTo({ left: (currentColumn.value - 0.5) * columnGap.value, behavior: 'smooth' });
  },
  { immediate: true },
);

/** Stable offset in [-1, 1) per node and run, so the lanes don't look like a spreadsheet. */
function jitter(node: MapNode, channel: number) {
  if (columns.value[node.column].length === 1) return 0;
  const v = Math.sin(props.run.seed * 0.001 + node.column * 127.1 + node.lane * 311.7 + channel * 74.7) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
}
function x(node: MapNode) {
  return PADDING + (node.column + jitter(node, 1) * 0.12) * columnGap.value;
}
function y(node: MapNode) {
  return (HEIGHT * (node.lane + 0.5 + jitter(node, 2) * 0.15)) / MAP_LANES;
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

const strongAgainst = computed(() => new Set(props.data.builds[props.run.build]?.strongAgainst ?? []));

/** The run's build is strong against this event's creature type. */
function isStrong(node: MapNode) {
  return node.creatureType !== null && strongAgainst.value.has(node.creatureType);
}

function label(node: MapNode) {
  if (node.id === props.run.position) return 'A';
  if (node.kind === 'start') return props.data.character.home.icon ?? '🏠';
  if (visited.value.has(node.id)) return '✓';
  if (node.kind === 'shop') return '🛒';
  if (node.kind === 'event' || node.creatureType === null) return '❓';
  return props.data.creatureTypes[node.creatureType]?.icon ?? '⚔️';
}

/** Hover text: what the node is, plus a hint when the build is strong against its creatures. */
function tooltipFor(node: MapNode): { name: string; hint?: string } {
  if (node.kind === 'start') return { name: props.data.character.home.name };
  if (node.kind === 'shop') return { name: 'Shop' };
  if (node.kind === 'event' || node.creatureType === null) return { name: 'Event' };
  const name = props.data.creatureTypes[node.creatureType]?.name ?? node.creatureType;
  return { name, hint: isStrong(node) ? 'Your gear is strong against these' : undefined };
}

/** The node under the pointer (or keyboard focus), and the map's scroll offset to place its tooltip. */
const hovered = ref<MapNode | null>(null);
const scrollLeft = ref(0);
const tooltip = computed(() => {
  if (!hovered.value) return null;
  // Below the node when there's no room above it.
  const below = y(hovered.value) < 70;
  const top = y(hovered.value) + (below ? RADIUS + 8 : -RADIUS - 8);
  return { ...tooltipFor(hovered.value), left: x(hovered.value) - scrollLeft.value, top, below };
});

function choose(node: MapNode) {
  if (destinations.value.has(node.id)) emit('travel', node.id);
}
</script>

<template>
  <section class="map-screen">
    <ul v-if="run.equipment.length" class="equipment" aria-label="Equipment">
      <li v-for="item in equipment" :key="item.id" class="item" tabindex="0" :aria-label="`${item.name}: ${item.description}`">
        <span class="icon">{{ item.icon ?? '🎒' }}</span>
        <div class="tooltip" role="tooltip">
          <strong>{{ item.name }}</strong>
          <p>{{ item.description }}</p>
        </div>
      </li>
    </ul>

    <div ref="scroller" class="map-scroll" @scroll="scrollLeft = scroller?.scrollLeft ?? 0">
      <svg class="map" :width="width" :height="HEIGHT" :viewBox="`0 0 ${width} ${HEIGHT}`" role="group" aria-label="Map">
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
          :class="[nodeState(node), { strong: isStrong(node), event: node.kind === 'event', shop: node.kind === 'shop' }]"
          :transform="`translate(${x(node)} ${y(node)})`"
          :role="destinations.has(node.id) ? 'button' : undefined"
          :tabindex="destinations.has(node.id) ? 0 : undefined"
          :aria-label="tooltipFor(node).name"
          @click="choose(node)"
          @keydown.enter="choose(node)"
          @mouseenter="hovered = node"
          @mouseleave="hovered = null"
          @focus="hovered = node"
          @blur="hovered = null"
        >
          <circle :r="RADIUS" />
          <text dominant-baseline="central" text-anchor="middle">{{ label(node) }}</text>
        </g>
      </svg>
    </div>

    <div v-if="tooltip" class="node-tooltip" :class="{ below: tooltip.below }" role="tooltip" :style="{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }">
      <strong>{{ tooltip.name }}</strong>
      <span v-if="tooltip.hint">{{ tooltip.hint }}</span>
    </div>
  </section>
</template>

<style scoped>
.map-screen { position: relative; display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }

/* Node hover text, placed above the node and kept outside the scrolling map so it isn't clipped. */
.node-tooltip {
  position: absolute;
  z-index: 3;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgb(20 24 32 / 0.95);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.45);
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
}
.node-tooltip.below { transform: translate(-50%, 0); }
.node-tooltip span { font-size: 0.72rem; color: #7ee08a; }

/* Equipment sits over the map's top-left corner and doesn't scroll with it. */
.equipment { position: absolute; top: 10px; left: 10px; z-index: 2; display: flex; gap: 6px; margin: 0; padding: 0; list-style: none; }
.item { position: relative; }
.item .icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #4a4f5c;
  background: rgb(20 24 32 / 0.85);
  font-size: 1.3rem;
  cursor: help;
}
.item:hover .icon,
.item:focus-visible .icon { border-color: var(--highlight); }
.item:focus { outline: none; }
.tooltip {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 240px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgb(20 24 32 / 0.95);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.45);
  font-size: 0.8rem;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.12s ease;
}
.tooltip p { margin: 4px 0 0; color: var(--muted); }
.item:hover .tooltip,
.item:focus-visible .tooltip { visibility: visible; opacity: 1; }

.map-scroll {
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
}

.map {
  display: block;
  /* Shore on the left, deepening water to the right. */
  background: linear-gradient(90deg, #4a3f2c 0, #3a4a3f 50px, #1f4a5e 120px, #17324a 60%, #0f2236 100%);
}

.edge { stroke: #5d7891; stroke-width: 3; stroke-dasharray: 6 6; opacity: 0.6; }
.edge.travelled { stroke: #c9d6e2; stroke-dasharray: none; opacity: 1; }
.edge.open { opacity: 1; }
.edge.open { stroke: var(--highlight); stroke-dasharray: none; }

.node circle { fill: #23262f; stroke: #4a4f5c; stroke-width: 3; }
.node text { font-size: 20px; fill: var(--text); user-select: none; }
/* Creature types the run's build is strong against get a green tint. */
.node.strong circle { fill: #1f3a2a; }
.node.event circle { fill: #2e2a3d; }
.node.shop circle { fill: #3d3422; }

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
