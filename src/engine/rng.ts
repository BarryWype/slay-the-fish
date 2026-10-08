/**
 * Seeded RNG (mulberry32). The generator's whole state is a single 32-bit
 * integer stored on the game state itself, so a state snapshot fully
 * determines every future random roll.
 *
 * These helpers advance `holder.rng` in place; the engine only calls them on
 * its own private working copy of the state, never on a caller's object.
 */
export interface RngHolder {
  rng: number;
}

export function nextFloat(holder: RngHolder): number {
  holder.rng = (holder.rng + 0x6d2b79f5) | 0;
  let t = holder.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [min, max], inclusive. */
export function nextInt(holder: RngHolder, min: number, max: number): number {
  return min + Math.floor(nextFloat(holder) * (max - min + 1));
}

/** Fisher–Yates shuffle, in place. */
export function shuffleInPlace<T>(holder: RngHolder, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = nextInt(holder, 0, i);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function pickWeighted<T>(holder: RngHolder, entries: Array<[T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = nextFloat(holder) * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return entries[entries.length - 1][0];
}
