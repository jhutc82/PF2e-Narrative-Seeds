/**
 * Unit Tests - Context Filters
 */

import { describe, it, assertEqual, assertTruthy, assertFalsy } from '../test-framework.js';
import { ContextFilters } from '../../scripts/combat/context-filters.js';

describe('ContextFilters', () => {

  describe('isEffectValidForAnatomy', () => {

    it('should filter blood effects for skeletons', () => {
      const bloodEffect = 'Blood sprays from the wound!';
      const valid = ContextFilters.isEffectValidForAnatomy(bloodEffect, 'skeleton');

      assertEqual(valid, false, 'Skeletons should not have blood effects');
    });

    it('should allow blood effects for humanoids', () => {
      const bloodEffect = 'Blood sprays from the wound!';
      const valid = ContextFilters.isEffectValidForAnatomy(bloodEffect, 'humanoid');

      assertEqual(valid, true, 'Humanoids should have blood effects');
    });

    it('should filter flesh effects for incorporeal', () => {
      const fleshEffect = 'The flesh tears open!';
      const valid = ContextFilters.isEffectValidForAnatomy(fleshEffect, 'incorporeal');

      assertEqual(valid, false, 'Incorporeal should not have flesh effects');
    });

    it('should filter pain effects for constructs', () => {
      const painEffect = 'They scream in agony!';
      const valid = ContextFilters.isEffectValidForAnatomy(painEffect, 'construct');

      assertEqual(valid, false, 'Constructs should not feel pain');
    });

    it('should filter breathing effects for undead', () => {
      const breathEffect = 'They gasp for breath!';
      const valid = ContextFilters.isEffectValidForAnatomy(breathEffect, 'zombie');

      assertEqual(valid, false, 'Zombies should not breathe');
    });

    it('should filter organ effects for elementals', () => {
      const organEffect = 'Vital organs are damaged!';
      const valid = ContextFilters.isEffectValidForAnatomy(organEffect, 'fire-elemental');

      assertEqual(valid, false, 'Elementals should not have organs');
    });

    it('should allow generic effects for any anatomy', () => {
      const genericEffect = 'The attack connects!';

      const validHumanoid = ContextFilters.isEffectValidForAnatomy(genericEffect, 'humanoid');
      const validSkeleton = ContextFilters.isEffectValidForAnatomy(genericEffect, 'skeleton');
      const validDragon = ContextFilters.isEffectValidForAnatomy(genericEffect, 'dragon');

      assertEqual(validHumanoid, true, 'Generic effects valid for humanoids');
      assertEqual(validSkeleton, true, 'Generic effects valid for skeletons');
      assertEqual(validDragon, true, 'Generic effects valid for dragons');
    });

  });

  describe('isEffectValidForDamageType', () => {

    it('should filter bleeding for non-physical damage', () => {
      const bleedEffect = 'Blood pours from the wound!';
      const valid = ContextFilters.isEffectValidForDamageType(bleedEffect, 'fire');

      assertEqual(valid, false, 'Fire damage should not cause bleeding');
    });

    it('should allow bleeding for slashing damage', () => {
      const bleedEffect = 'Blood pours from the wound!';
      const valid = ContextFilters.isEffectValidForDamageType(bleedEffect, 'slashing');

      assertEqual(valid, true, 'Slashing damage should cause bleeding');
    });

    it('should filter burning for non-fire damage', () => {
      const burnEffect = 'The target is scorched!';
      const valid = ContextFilters.isEffectValidForDamageType(burnEffect, 'cold');

      assertEqual(valid, false, 'Cold damage should not scorch');
    });

    it('should allow burning for fire damage', () => {
      const burnEffect = 'The target is scorched!';
      const valid = ContextFilters.isEffectValidForDamageType(burnEffect, 'fire');

      assertEqual(valid, true, 'Fire damage should scorch');
    });

    it('should filter freezing for non-cold damage', () => {
      const freezeEffect = 'Frost covers the wound!';
      const valid = ContextFilters.isEffectValidForDamageType(freezeEffect, 'fire');

      assertEqual(valid, false, 'Fire should not cause frost');
    });

    it('should filter shocking for non-electricity damage', () => {
      const shockEffect = 'Electricity arcs across the body!';
      const valid = ContextFilters.isEffectValidForDamageType(shockEffect, 'bludgeoning');

      assertEqual(valid, false, 'Bludgeoning should not cause electricity');
    });

  });

  describe('filterVerbs', () => {

    it('should filter slashing verbs for non-slashing damage', () => {
      const verbs = ['cuts', 'slashes', 'strikes'];
      const filtered = ContextFilters.filterVerbs(verbs, 'bludgeoning');

      assertEqual(filtered.includes('cuts'), false, 'Should filter "cuts"');
      assertEqual(filtered.includes('slashes'), false, 'Should filter "slashes"');
      assertEqual(filtered.includes('strikes'), true, 'Should keep "strikes"');
    });

    it('should filter piercing verbs for non-piercing damage', () => {
      const verbs = ['pierces', 'stabs', 'strikes'];
      const filtered = ContextFilters.filterVerbs(verbs, 'slashing');

      assertEqual(filtered.includes('pierces'), false, 'Should filter "pierces"');
      assertEqual(filtered.includes('stabs'), false, 'Should filter "stabs"');
      assertEqual(filtered.includes('strikes'), true, 'Should keep "strikes"');
    });

    it('should filter bludgeoning verbs for non-bludgeoning damage', () => {
      const verbs = ['crushes', 'smashes', 'strikes'];
      const filtered = ContextFilters.filterVerbs(verbs, 'piercing');

      assertEqual(filtered.includes('crushes'), false, 'Should filter "crushes"');
      assertEqual(filtered.includes('smashes'), false, 'Should filter "smashes"');
      assertEqual(filtered.includes('strikes'), true, 'Should keep "strikes"');
    });

  });

  describe('applyContextFilters', () => {

    it('should apply all filters together', () => {
      const verbs = ['cuts', 'strikes', 'pierces'];
      const effects = ['Blood sprays!', 'The target is hit!'];
      const context = {
        anatomy: 'skeleton',
        damageType: 'bludgeoning',
        location: 'chest'
      };

      const result = ContextFilters.applyContextFilters(verbs, effects, context);

      // Should filter slashing/piercing verbs for bludgeoning
      assertEqual(result.verbs.includes('cuts'), false);
      assertEqual(result.verbs.includes('pierces'), false);

      // Should filter blood effects for skeleton
      assertEqual(result.effects.includes('Blood sprays!'), false);
      assertEqual(result.effects.includes('The target is hit!'), true);
    });

    it('should not filter out everything (fallback protection)', () => {
      const verbs = ['cuts', 'slashes'];
      const effects = ['Blood!'];
      const context = {
        anatomy: 'skeleton',
        damageType: 'bludgeoning',
        location: 'chest'
      };

      const result = ContextFilters.applyContextFilters(verbs, effects, context);

      // Even though all would be filtered, should fall back to original
      assertTruthy(result.verbs.length > 0, 'Should not filter out all verbs');
      assertTruthy(result.effects.length > 0, 'Should not filter out all effects');
    });

  });

});
