import { describe, expect, it } from 'vitest';
import { contentSource, gameData } from '../src/content';
import { creatures } from '../src/content/creatures';
import { gear } from '../src/content/gear';
import { creatureTypeNames, describeCard, validateContent, type ContentSource } from '../src/engine';

describe('game content', () => {
  it('passes validation', () => {
    expect(validateContent(contentSource)).toEqual([]);
  });

  it('has the three starting builds, each with a 10-card deck', () => {
    const decks = Object.fromEntries(
      Object.values(gameData.builds).map((b) => {
        const counts: Record<string, number> = {};
        for (const id of b.starterDeck) counts[id] = (counts[id] ?? 0) + 1;
        return [b.id, counts];
      }),
    );
    expect(decks).toEqual({
      rod: { cast: 5, bucket: 4, setTheHook: 1 },
      spear: { stick: 5, bucket: 4, harpoon: 1 },
      foraging: { smallNet: 5, bucket: 4, crabNet: 1 },
    });
  });

  it('every build card is strong against exactly its build’s types', () => {
    for (const build of Object.values(gameData.builds)) {
      for (const id of new Set(build.starterDeck)) {
        for (const e of gameData.cards[id].effects) {
          if (e.type === 'dealDamage' && e.bonus) expect(e.bonus.against).toEqual(build.strongAgainst);
        }
      }
    }
  });

  it('every creature type is the specialty of exactly one build', () => {
    const covered = Object.values(gameData.builds).flatMap((b) => b.strongAgainst);
    expect([...covered].sort()).toEqual(Object.keys(gameData.creatureTypes).sort());
  });

  it('every card has rules text', () => {
    for (const card of Object.values(gameData.cards)) expect(describeCard(card)).not.toBe('');
  });

  it('generates readable rules text', () => {
    const tagNames = creatureTypeNames(gameData);
    expect(describeCard(gameData.cards.doubleCast)).toBe('Deal 5 damage 2 times.');
    expect(describeCard(gameData.cards.grandmasSandwich)).toBe('Gain 2 Energy. Exhaust.');
    expect(describeCard(gameData.cards.cast, { tagNames })).toBe('Deal 5 damage (+4 vs Sport fish, Small fish, Deep sea).');
    // Against a matching creature the bonus is folded into the number.
    expect(describeCard(gameData.cards.cast, { tagNames, defenderTags: ['sportFish'], attacker: { strength: 1 } })).toBe(
      'Deal 10 damage.',
    );
    expect(describeCard(gameData.cards.cast, { tagNames, defenderTags: ['crustacean'] })).toBe(
      'Deal 5 damage (+4 vs Sport fish, Small fish, Deep sea).',
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

  it('every creature has a valid type, used as its enemy tag', () => {
    for (const c of creatures) {
      expect(gameData.creatureTypes[c.type]).toBeDefined();
      expect(gameData.enemies[c.id].tags).toEqual([c.type]);
    }
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
    builds: [{ id: 'b', name: 'B', description: '', starterDeck: ['a'], strongAgainst: [] }],
    creatureTypes: [{ id: 't', name: 'T' }],
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
      builds: [{ ...base.builds[0], starterDeck: ['missing'] }],
      encounters: [{ id: 'x', name: 'X', enemies: ['ghost'] }],
      enemies: [{ ...base.enemies[0], pattern: { type: 'sequence', moves: ['nope'] } }],
    };
    expect(validateContent(bad)).toHaveLength(3);
  });

  it('catches unknown creature types in tags, bonuses and builds', () => {
    const bad: ContentSource = {
      ...base,
      enemies: [{ ...base.enemies[0], tags: ['ghostType'] }],
      cards: [{ ...base.cards[0], effects: [{ type: 'dealDamage', amount: 1, bonus: { against: ['typo'], amount: 2 } }] }],
      builds: [{ ...base.builds[0], strongAgainst: ['nope'] }],
    };
    expect(validateContent(bad)).toHaveLength(3);
  });

  it('catches an invalid character', () => {
    expect(validateContent({ ...base, character: { ...base.character, maxHp: 0 } })).toHaveLength(1);
  });
});
