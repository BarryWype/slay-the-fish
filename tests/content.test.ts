import { describe, expect, it } from 'vitest';
import { contentSource, gameData } from '../src/content';
import { creatures } from '../src/content/creatures';
import { gear } from '../src/content/gear';
import { describeCard, validateContent, type ContentSource } from '../src/engine';

describe('game content', () => {
  it('passes validation', () => {
    expect(validateContent(contentSource)).toEqual([]);
  });

  it('starter deck is 5 Stick, 4 Bucket, 1 Small Net', () => {
    const counts: Record<string, number> = {};
    for (const id of gameData.starterDeck) counts[id] = (counts[id] ?? 0) + 1;
    expect(counts).toEqual({ stick: 5, bucket: 4, smallNet: 1 });
  });

  it('every card has rules text', () => {
    for (const card of Object.values(gameData.cards)) expect(describeCard(card)).not.toBe('');
  });

  it('generates readable rules text', () => {
    expect(describeCard(gameData.cards.smallNet)).toBe('Deal 8 damage. Apply 2 Vulnerable.');
    expect(describeCard(gameData.cards.doubleCast)).toBe('Deal 5 damage 2 times.');
    expect(describeCard(gameData.cards.grandmasSandwich)).toBe('Gain 2 Energy. Exhaust.');
    expect(describeCard(gameData.cards.stick, { attacker: { strength: 2 }, defender: { vulnerable: 1 } })).toBe(
      'Deal 12 damage.',
    );
  });
});

describe('creatures', () => {
  it('has one entry per sprite (1–144), with unique ids', () => {
    expect(creatures.map((c) => c.no)).toEqual(Array.from({ length: 144 }, (_, i) => i + 1));
    expect(new Set(creatures.map((c) => c.id)).size).toBe(creatures.length);
  });

  it('every creature is an enemy with its sprite, and a solo encounter at its tier', () => {
    for (const c of creatures) {
      expect(gameData.enemies[c.id].sprite).toEqual({ sheet: 'fishes', index: c.no });
      expect(gameData.encounters.find((e) => e.id === c.id)).toMatchObject({ tier: c.tier, enemies: [c.id] });
    }
  });

  it('every tier has creatures', () => {
    for (const tier of [1, 2, 3]) expect(creatures.some((c) => c.tier === tier)).toBe(true);
  });

  it('starting strength is applied', () => {
    expect(gameData.enemies.swordfish.startingStatuses).toEqual({ strength: 2 });
    expect(gameData.enemies.clownfish.startingStatuses).toEqual({});
  });
});

describe('gear', () => {
  it('has one entry per sprite (1–36), with unique ids', () => {
    expect(gear.map((g) => g.no)).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
    expect(new Set(gear.map((g) => g.id)).size).toBe(gear.length);
  });
});

describe('content validation', () => {
  const base: ContentSource = {
    character: { name: 'C', maxHp: 10, home: { name: 'Home' } },
    cards: [{ id: 'a', name: 'A', type: 'attack', rarity: 'common', cost: 1, target: 'enemy', effects: [{ type: 'dealDamage', amount: 1 }] }],
    enemies: [{ id: 'e', name: 'E', hp: [5, 5], moves: [{ id: 'm', name: 'M', effects: [] }], pattern: { type: 'sequence', moves: ['m'] } }],
    encounters: [{ id: 'x', name: 'X', enemies: ['e'] }],
    starterDeck: ['a'],
  };

  it('accepts valid content', () => {
    expect(validateContent(base)).toEqual([]);
  });

  it('catches untargeted cards with targeted effects', () => {
    const bad = { ...base, cards: [{ ...base.cards[0], target: 'none' as const }] };
    expect(validateContent(bad)).toHaveLength(1);
  });

  it('catches unknown references', () => {
    const bad: ContentSource = {
      ...base,
      starterDeck: ['missing'],
      encounters: [{ id: 'x', name: 'X', enemies: ['ghost'] }],
      enemies: [{ ...base.enemies[0], pattern: { type: 'sequence', moves: ['nope'] } }],
    };
    expect(validateContent(bad)).toHaveLength(3);
  });

  it('catches an invalid character', () => {
    expect(validateContent({ ...base, character: { ...base.character, maxHp: 0 } })).toHaveLength(1);
  });
});
