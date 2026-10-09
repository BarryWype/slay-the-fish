import { describe, expect, it } from 'vitest';
import {
  addCardToDeck,
  applyEventChoice,
  buyShopItem,
  CHOKE_COLUMNS,
  eventChoiceBlocked,
  escapeRateReduction,
  availableDestinations,
  createRun,
  finishCombat,
  isMapComplete,
  rollCardRewards,
  sellCreature,
  shopItemBlocked,
  travelTo,
  visitEvent,
  type RunState,
} from '../src/engine';
import { testData } from './fixtures';

describe('run', () => {
  it('starts with the starter deck at full HP, on the map start', () => {
    const run = createRun(5, testData, 'basic');
    expect(run.deck).toEqual(['strike', 'defend']);
    expect(run.hp).toBe(run.maxHp);
    expect(run.position).toBe('0-0');
    expect(run.visited).toEqual(['0-0']);
  });

  it('offers 3 distinct non-starter cards, deterministically', () => {
    const run = createRun(5, testData, 'basic');
    const { choices } = rollCardRewards(run, testData);
    expect(choices).toHaveLength(3);
    expect(new Set(choices).size).toBe(3);
    for (const id of choices) expect(testData.cards[id].rarity).not.toBe('starter');
    expect(rollCardRewards(run, testData).choices).toEqual(choices);
  });

  it('build cards are only offered to their build', () => {
    const offered = (build: string) =>
      new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((seed) => rollCardRewards(createRun(seed, testData, build), testData, 99).choices));
    expect(offered('angler').has('lure')).toBe(true);
    expect(offered('basic').has('lure')).toBe(false);
  });

  it('carries HP out of combat and adds the chosen card', () => {
    const start = createRun(5, testData, 'basic');
    const { run, combat } = travelTo(start, availableDestinations(start)[0].id, testData);
    const hurt = { ...combat, phase: 'won' as const, player: { ...combat.player, hp: 50 } };
    const after = finishCombat(run, hurt, testData);
    expect(after).toMatchObject({ hp: 50, floor: 2, captured: ['dummy'] });
    expect(run.captured).toEqual([]); // input untouched
    expect(addCardToDeck(after, 'twin', testData).deck).toEqual(['strike', 'defend', 'twin']);
  });
});

describe('starting builds', () => {
  it('the build sets the starter deck; the map depends only on the seed', () => {
    const basic = createRun(5, testData, 'basic');
    const angler = createRun(5, testData, 'angler');
    expect(angler.build).toBe('angler');
    expect(angler.deck).toEqual(['hook', 'defend']);
    expect(angler.map).toEqual(basic.map);
  });

  it('rejects an unknown build', () => {
    expect(() => createRun(5, testData, 'nope')).toThrow();
  });
});

describe('capture record', () => {
  it('starts empty and only records creatures from won fights, in order', () => {
    let run = createRun(5, testData, 'basic');
    expect(run.captured).toEqual([]);
    const fight = travelTo(run, availableDestinations(run)[0].id, testData);
    run = finishCombat(fight.run, { ...fight.combat, phase: 'lost' }, testData);
    expect(run.captured).toEqual([]);
    run = finishCombat(run, { ...fight.combat, phase: 'won' }, testData);
    run = finishCombat(run, { ...fight.combat, phase: 'won' }, testData);
    expect(run.captured).toEqual(['dummy', 'dummy']);
  });

  it('a creature that got away is not captured', () => {
    const run = createRun(5, testData, 'basic');
    const fight = travelTo(run, availableDestinations(run)[0].id, testData);
    expect(finishCombat(fight.run, { ...fight.combat, phase: 'fled' }, testData)).toMatchObject({ captured: [], floor: 1 });
  });

  it('selling a creature removes it and adds its sell value to the coins', () => {
    let run = createRun(5, testData, 'basic');
    expect(run.coins).toBe(0);
    const fight = travelTo(run, availableDestinations(run)[0].id, testData);
    run = finishCombat(fight.run, { ...fight.combat, phase: 'won' }, testData);
    const sold = sellCreature(run, 0, testData);
    expect(sold).toMatchObject({ captured: [], coins: 5 });
    expect(run.captured).toEqual(['dummy']); // input untouched
    expect(() => sellCreature(sold, 0, testData)).toThrow();
  });
});

describe('travelling the map', () => {
  it('moves to the chosen node and starts its encounter', () => {
    const start = createRun(5, testData, 'basic');
    const target = availableDestinations(start).at(-1)!;
    const { run, combat } = travelTo(start, target.id, testData);
    expect(run.position).toBe(target.id);
    expect(run.visited).toEqual(['0-0', target.id]);
    expect(combat.enemies.map((e) => e.defId)).toEqual(['dummy']);
    expect(start.position).toBe('0-0'); // input untouched
  });

  it('the creature is drawn on arrival from encounters of the node\'s type and tier', () => {
    const data = {
      ...testData,
      encounters: [
        { id: 'a', name: 'A', enemies: ['dummy'] },
        { id: 'b', name: 'B', enemies: ['dummy', 'dummy'] },
        { id: 'shell', name: 'Shell', enemies: ['cycler'] },
        { id: 'deep', name: 'Deep', tier: 2, enemies: ['dummy', 'dummy', 'dummy'] },
      ],
    };
    const fights = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const start = createRun(seed, data, 'basic');
      for (const target of availableDestinations(start)) {
        const { combat } = travelTo(start, target.id, data);
        expect(combat.enemies.every((e) => data.enemies[e.defId].tags?.[0] === target.creatureType)).toBe(true);
        if (target.creatureType === 'fish') fights.add(combat.enemies.map((e) => e.defId).join());
      }
    }
    // Both tier-1 fish encounters come up, never the tier-2 one.
    expect([...fights].sort()).toEqual(['dummy', 'dummy,dummy']);
  });

  it('refuses nodes that are not adjacent to the current position', () => {
    const start = createRun(5, testData, 'basic');
    expect(() => travelTo(start, '2-0', testData)).toThrow();
    expect(() => travelTo(start, '0-0', testData)).toThrow();
  });

  it('can walk any path to the end of the map', () => {
    let run: RunState = createRun(11, testData, 'basic');
    let steps = 0;
    while (!isMapComplete(run)) {
      run = travelTo(run, availableDestinations(run)[0].id, testData).run;
      steps++;
    }
    expect(steps).toBe(run.map.columns.length - 1);
    expect(run.position.startsWith(`${run.map.columns.length - 1}-`)).toBe(true);
  });
});

describe('equipment', () => {
  it('the build sets the starting equipment', () => {
    expect(createRun(5, testData, 'angler').equipment).toEqual(['reel']);
    expect(createRun(5, testData, 'basic').equipment).toEqual([]);
  });

  it('a slowEscape cuts the escape rate by its share, at least 1, rounded up', () => {
    expect([10, 6, 2, 1, 0].map((rate) => escapeRateReduction(rate, 20))).toEqual([2, 2, 1, 1, 0]);
    const run = createRun(5, testData, 'angler');
    const { combat } = travelTo(run, availableDestinations(run)[0].id, testData);
    expect(combat.enemies[0].escapeRate).toBe(0);
  });

  it('sellOnCapture sells captures on the spot for more, instead of the aquarium', () => {
    const run = { ...createRun(5, testData, 'basic'), equipment: ['spear'] };
    const fight = travelTo(run, availableDestinations(run)[0].id, testData);
    expect(finishCombat(fight.run, { ...fight.combat, phase: 'won' }, testData)).toMatchObject({ captured: [], coins: 6 });
    expect(finishCombat(fight.run, { ...fight.combat, phase: 'fled' }, testData)).toMatchObject({ captured: [], coins: 0 });
  });
});

describe('events', () => {
  const data = {
    ...testData,
    events: {
      spot: {
        id: 'spot', name: 'Spot', description: '',
        choices: [
          { label: 'Rest', effects: [{ type: 'heal' as const, percent: 25 }] },
          { label: 'Tip', effects: [{ type: 'coinsPerCreature' as const, amount: 2 }] },
          { label: 'Dig', effects: [{ type: 'loseHp' as const, amount: 5 }, { type: 'gainCoins' as const, amount: 7 }, { type: 'cardReward' as const }] },
        ],
      },
    },
    equipment: { ...testData.equipment, duck: { id: 'duck', name: 'Duck', description: '', effects: [{ type: 'passerbyBonus' as const, bonusPercent: 50 }] } },
  };
  const eventNode = (run: ReturnType<typeof createRun>) => {
    const node = { ...run.map.columns[1][0], kind: 'event' as const, creatureType: null };
    return { ...run, map: { columns: [run.map.columns[0], [node, ...run.map.columns[1].slice(1)], ...run.map.columns.slice(2)] } };
  };

  it('visiting an event moves there and draws one; fights refuse event nodes and vice versa', () => {
    const run = eventNode(createRun(5, data, 'basic'));
    const target = run.map.columns[1][0];
    const visit = visitEvent(run, target.id, data);
    expect(visit).toMatchObject({ eventId: 'spot', run: { position: target.id } });
    expect(() => travelTo(run, target.id, data)).toThrow();
    const fight = run.map.columns[1].find((n) => n.kind === 'fight');
    if (fight) expect(() => visitEvent(run, fight.id, data)).toThrow();
  });

  it('applies the choice: heal (capped), coins per creature (+ passerby bonus), lose HP + coins + card', () => {
    const run = { ...createRun(5, data, 'basic'), hp: 70, captured: ['dummy', 'dummy'] };
    expect(applyEventChoice(run, 'spot', 0, data).run.hp).toBe(80);
    expect(applyEventChoice(run, 'spot', 1, data)).toMatchObject({ run: { coins: 4, captured: ['dummy', 'dummy'] }, cardReward: false });
    expect(applyEventChoice({ ...run, equipment: ['duck'] }, 'spot', 1, data).run.coins).toBe(6);
    expect(applyEventChoice({ ...run, captured: [] }, 'spot', 1, data).run.coins).toBe(0);
    expect(applyEventChoice(run, 'spot', 2, data)).toMatchObject({ run: { hp: 65, coins: 7 }, cardReward: true });
  });

  it('only draws events allowed at the node\'s column', () => {
    const late = { ...data.events.spot, id: 'late', minColumn: 5 };
    const run = eventNode(createRun(5, data, 'basic'));
    const target = run.map.columns[1][0];
    for (let seed = 1; seed <= 20; seed++) {
      const withLate = { ...data, events: { spot: data.events.spot, late } };
      expect(visitEvent({ ...run, rng: seed }, target.id, withLate).eventId).toBe('spot');
    }
    expect(() => visitEvent(run, target.id, { ...data, events: { late } })).toThrow();
  });

  it('blocks choices that cannot be paid for', () => {
    const run = { ...createRun(5, data, 'basic'), hp: 5 };
    expect(eventChoiceBlocked(data.events.spot.choices[2], run)).toBe('Not enough HP.');
    expect(() => applyEventChoice(run, 'spot', 2, data)).toThrow();
  });
});

describe('shop', () => {
  const data = {
    ...testData,
    shop: [
      { id: 'heart', name: 'Heart', price: 10, effect: { type: 'heal' as const, amount: 30 } },
      { id: 'cut', name: 'Cut', price: 20, effect: { type: 'removeCard' as const }, limit: 1 },
    ],
  };
  const [heart, cut] = data.shop;

  it('the choke column is a shop when there is something to sell', () => {
    const run = createRun(5, data, 'basic');
    expect(run.map.columns[CHOKE_COLUMNS[0]].map((n) => n.kind)).toEqual(['shop']);
    expect(createRun(5, testData, 'basic').map.columns[CHOKE_COLUMNS[0]][0].kind).toBe('fight');
  });

  it('a heart costs coins and heals up to max HP, as often as you can pay', () => {
    const run = { ...createRun(5, data, 'basic'), hp: 40, coins: 25 };
    let { run: after, visit } = buyShopItem(run, { bought: {} }, 'heart', data);
    expect(after).toMatchObject({ hp: 70, coins: 15 });
    ({ run: after, visit } = buyShopItem(after, visit, 'heart', data));
    expect(after).toMatchObject({ hp: 80, coins: 5 });
    expect(shopItemBlocked(heart, after, visit)).toBe('Already at full HP.');
    expect(shopItemBlocked(heart, { ...after, hp: 50 }, visit)).toBe('Not enough coins.');
  });

  it('removing a card takes the chosen one, once per visit', () => {
    const run = { ...createRun(5, data, 'basic'), coins: 50 };
    const { run: after, visit } = buyShopItem(run, { bought: {} }, 'cut', data, 0);
    expect(after).toMatchObject({ deck: ['defend'], coins: 30 });
    expect(shopItemBlocked(cut, { ...after, deck: ['a', 'b'] }, visit)).toBe('Sold out.');
    expect(() => buyShopItem(run, { bought: {} }, 'cut', data)).toThrow();
  });
});
