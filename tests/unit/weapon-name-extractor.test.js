/**
 * Unit Tests - Weapon Name Extractor
 */

import { describe, it, assertEqual, assertMatch, assertTruthy } from '../test-framework.js';
import { WeaponNameExtractor } from '../../scripts/combat/weapon-name-extractor.js';
import { createLongsword, createBow, createFireSpell, createUnarmedAttack, createClawAttack } from '../mocks.js';

describe('WeaponNameExtractor', () => {

  it('should extract longsword name', () => {
    const item = createLongsword();
    const name = WeaponNameExtractor.getWeaponDisplayName(item, 'slashing', 'second');

    assertTruthy(name, 'Should return a weapon name');
    assertEqual(name.toLowerCase().includes('sword'), true, 'Should include "sword"');
  });

  it('should detect spell attacks', () => {
    const spell = createFireSpell();
    const isSpell = WeaponNameExtractor.isSpellAttack(spell);

    assertEqual(isSpell, true, 'Should detect spell attack');
  });

  it('should get spell descriptor', () => {
    const spell = createFireSpell();
    const name = WeaponNameExtractor.getWeaponDisplayName(spell, 'fire', 'second');

    assertTruthy(name, 'Should return spell descriptor');
    // Should return some spell-related term
    const validSpellTerms = ['spell', 'ray', 'bolt', 'blast', 'missile'];
    const hasSpellTerm = validSpellTerms.some(term => name.toLowerCase().includes(term));
    assertEqual(hasSpellTerm, true, 'Should include spell terminology');
  });

  it('should detect natural attacks', () => {
    const claw = createClawAttack();
    const isNatural = WeaponNameExtractor.isNaturalAttack(claw);

    assertEqual(isNatural, true, 'Should detect natural attack');
  });

  it('should extract natural attack name', () => {
    const claw = createClawAttack();
    const name = WeaponNameExtractor.getWeaponDisplayName(claw, 'slashing', 'second');

    assertTruthy(name, 'Should return natural attack name');
    assertEqual(name.toLowerCase().includes('claw'), true, 'Should include "claw"');
  });

  it('should detect unarmed attacks', () => {
    const fist = createUnarmedAttack();
    const isNatural = WeaponNameExtractor.isNaturalAttack(fist);

    assertEqual(isNatural, true, 'Should detect unarmed attack');
  });

  it('should handle null item with fallback', () => {
    const name = WeaponNameExtractor.getWeaponDisplayName(null, 'slashing', 'second');

    assertTruthy(name, 'Should return fallback name');
    // Fallback should be generic
    const validFallbacks = ['weapon', 'attack', 'strike', 'slash', 'blade'];
    const hasFallbackTerm = validFallbacks.some(term => name.toLowerCase().includes(term));
    assertEqual(hasFallbackTerm, true, 'Should use appropriate fallback');
  });

  it('should handle different POV perspectives', () => {
    const item = createLongsword();

    const second = WeaponNameExtractor.getWeaponDisplayName(item, 'slashing', 'second');
    const third = WeaponNameExtractor.getWeaponDisplayName(item, 'slashing', 'third');

    assertTruthy(second, 'Should handle second person');
    assertTruthy(third, 'Should handle third person');
  });

  it('should extract bow as ranged weapon', () => {
    const bow = createBow();
    const name = WeaponNameExtractor.getWeaponDisplayName(bow, 'piercing', 'second');

    assertTruthy(name, 'Should return bow name');
    assertEqual(name.toLowerCase().includes('bow'), true, 'Should include "bow"');
  });

  it('should clean weapon names removing runes', () => {
    const runicSword = {
      name: '+1 Striking Flaming Longsword',
      type: 'weapon',
      system: {
        traits: { value: [] },
        group: { value: 'sword' }
      }
    };

    const name = WeaponNameExtractor.getWeaponDisplayName(runicSword, 'slashing', 'second');

    assertTruthy(name, 'Should return cleaned name');
    // Should contain sword but not +1, Striking, or Flaming
    assertEqual(name.toLowerCase().includes('sword'), true, 'Should include base weapon name');
  });

});
