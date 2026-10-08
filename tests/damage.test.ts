import { describe, expect, it } from 'vitest';
import { applyDamage, calculateDamage, type Combatant } from '../src/engine';

function combatant(hp: number, block = 0): Combatant {
  return { id: 'x', name: 'X', hp, maxHp: hp, block, statuses: {} };
}

describe('calculateDamage', () => {
  it('returns base damage with no modifiers', () => {
    expect(calculateDamage(6)).toBe(6);
    expect(calculateDamage(6, {}, {})).toBe(6);
  });

  it('adds Strength (and subtracts negative Strength)', () => {
    expect(calculateDamage(6, { strength: 3 })).toBe(9);
    expect(calculateDamage(6, { strength: -2 })).toBe(4);
  });

  it('never goes below zero', () => {
    expect(calculateDamage(3, { strength: -10 })).toBe(0);
  });

  it('Weak attacker deals 25% less, rounded down', () => {
    expect(calculateDamage(10, { weak: 1 })).toBe(7); // 7.5
    expect(calculateDamage(8, { weak: 3 })).toBe(6);
  });

  it('Vulnerable defender takes 50% more, rounded down', () => {
    expect(calculateDamage(6, {}, { vulnerable: 1 })).toBe(9);
    expect(calculateDamage(5, {}, { vulnerable: 2 })).toBe(7); // 7.5
  });

  it('applies Strength before multipliers and rounds once at the end', () => {
    // (6 + 2) * 0.75 * 1.5 = 9
    expect(calculateDamage(6, { strength: 2, weak: 1 }, { vulnerable: 1 })).toBe(9);
    // (5 + 0) * 0.75 * 1.5 = 5.625 -> 5
    expect(calculateDamage(5, { weak: 1 }, { vulnerable: 1 })).toBe(5);
  });
});

describe('applyDamage', () => {
  it('reduces HP when there is no block', () => {
    const c = combatant(20);
    expect(applyDamage(c, 6)).toEqual({ blocked: 0, hpLost: 6 });
    expect(c.hp).toBe(14);
  });

  it('block absorbs damage first', () => {
    const c = combatant(20, 5);
    expect(applyDamage(c, 8)).toEqual({ blocked: 5, hpLost: 3 });
    expect(c).toMatchObject({ hp: 17, block: 0 });
  });

  it('leftover block remains when damage is fully blocked', () => {
    const c = combatant(20, 10);
    expect(applyDamage(c, 4)).toEqual({ blocked: 4, hpLost: 0 });
    expect(c).toMatchObject({ hp: 20, block: 6 });
  });

  it('HP does not go below zero', () => {
    const c = combatant(3);
    expect(applyDamage(c, 10).hpLost).toBe(3);
    expect(c.hp).toBe(0);
  });
});
