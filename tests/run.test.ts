import { describe, expect, it } from 'vitest';
import {
  addCardToDeck,
  availableDestinations,
  createRun,
  finishCombat,
  isMapComplete,
  rollCardRewards,
  travelTo,
  type RunState,
} from '../src/engine';
import { testData } from './fixtures';

describe('run', () => {
  it('starts with the starter deck at full HP, on the map start', () => {
    const run = createRun(5, testData);
    expect(run.deck).toEqual(['strike', 'defend']);
    expect(run.hp).toBe(run.maxHp);
    expect(run.position).toBe('0-0');
    expect(run.visited).toEqual(['0-0']);
  });

  it('offers 3 distinct non-starter cards, deterministically', () => {
    const run = createRun(5, testData);
    const { choices } = rollCardRewards(run, testData);
    expect(choices).toHaveLength(3);
    expect(new Set(choices).size).toBe(3);
    for (const id of choices) expect(testData.cards[id].rarity).not.toBe('starter');
    expect(rollCardRewards(run, testData).choices).toEqual(choices);
  });

  it('carries HP out of combat and adds the chosen card', () => {
    const start = createRun(5, testData);
    const { run, combat } = travelTo(start, availableDestinations(start)[0].id, testData);
    const hurt = { ...combat, phase: 'won' as const, player: { ...combat.player, hp: 50 } };
    const after = finishCombat(run, hurt);
    expect(after).toMatchObject({ hp: 50, floor: 2 });
    expect(addCardToDeck(after, 'twin', testData).deck).toEqual(['strike', 'defend', 'twin']);
  });
});

describe('travelling the map', () => {
  it('moves to the chosen node and starts its encounter', () => {
    const start = createRun(5, testData);
    const target = availableDestinations(start).at(-1)!;
    const { run, combat } = travelTo(start, target.id, testData);
    expect(run.position).toBe(target.id);
    expect(run.visited).toEqual(['0-0', target.id]);
    expect(combat.enemies.map((e) => e.defId)).toEqual(
      testData.encounters.find((e) => e.id === target.encounterId)!.enemies,
    );
    expect(start.position).toBe('0-0'); // input untouched
  });

  it('refuses nodes that are not adjacent to the current position', () => {
    const start = createRun(5, testData);
    expect(() => travelTo(start, '2-0', testData)).toThrow();
    expect(() => travelTo(start, '0-0', testData)).toThrow();
  });

  it('can walk any path to the end of the map', () => {
    let run: RunState = createRun(11, testData);
    let steps = 0;
    while (!isMapComplete(run)) {
      run = travelTo(run, availableDestinations(run)[0].id, testData).run;
      steps++;
    }
    expect(steps).toBe(run.map.columns.length - 1);
    expect(run.position.startsWith(`${run.map.columns.length - 1}-`)).toBe(true);
  });
});
