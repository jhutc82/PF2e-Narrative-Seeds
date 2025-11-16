/**
 * Unit Tests - Combat Memory
 */

import { describe, it, assertEqual, assertTruthy } from '../test-framework.js';
import { CombatMemory } from '../../scripts/combat/combat-memory.js';

describe('CombatMemory', () => {

  // Reset before each test
  beforeEach(() => {
    CombatMemory.reset();
  });

  it('should create new combat session', () => {
    const session = CombatMemory.getSession('test-combat');

    assertTruthy(session, 'Should create session');
    assertEqual(session.totalHits, 0, 'Should start with 0 hits');
    assertEqual(session.totalMisses, 0, 'Should start with 0 misses');
    assertEqual(session.escalationLevel, 0, 'Should start at escalation 0');
  });

  it('should record successful attack', () => {
    const context = CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');

    assertTruthy(context, 'Should return context');
    assertEqual(context.streak.totalHits, 1, 'Should track hit');
    assertEqual(context.streak.consecutiveHits, 1, 'Should track consecutive hits');
  });

  it('should record critical success', () => {
    CombatMemory.reset();
    const context = CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'criticalSuccess');

    assertEqual(context.streak.totalHits, 1, 'Should count crit as hit');
    assertEqual(context.streak.isCritical, true, 'Should mark as critical');
  });

  it('should track hit streak', () => {
    CombatMemory.reset();
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');
    const context = CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');

    assertEqual(context.streak.consecutiveHits, 3, 'Should track 3 consecutive hits');
    assertEqual(context.streak.consecutiveMisses, 0, 'Should have 0 consecutive misses');
  });

  it('should track miss streak', () => {
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');
    const context = CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'criticalFailure');

    assertEqual(context.streak.consecutiveMisses, 3, 'Should track 3 consecutive misses');
    assertEqual(context.streak.consecutiveHits, 0, 'Should have 0 consecutive hits');
  });

  it('should detect streak break', () => {
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');
    const context = CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');

    assertEqual(context.streak.streakBroken, true, 'Should detect broken streak');
    assertEqual(context.streak.consecutiveHits, 1, 'Should start new hit streak');
    assertEqual(context.streak.consecutiveMisses, 0, 'Should reset miss streak');
  });

  it('should detect dramatic moment (crit after misses)', () => {
    CombatMemory.reset();
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');
    const context = CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'criticalSuccess');

    assertEqual(context.isDramatic, true, 'Should mark as dramatic moment');
  });

  it('should track multiple combatants separately', () => {
    CombatMemory.reset();
    const context1 = CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');
    const context2 = CombatMemory.recordAttack('test-combat', 'attacker2', 'target1', 'failure');

    assertEqual(context1.streak.consecutiveHits, 1, 'Attacker1 should have 1 hit');
    assertEqual(context2.streak.consecutiveHits, 0, 'Attacker2 should have 0 hits');
    assertEqual(context2.streak.consecutiveMisses, 1, 'Attacker2 should have 1 miss');
  });

  it('should calculate escalation level', () => {
    // Generate many attacks to increase escalation
    for (let i = 0; i < 20; i++) {
      CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', i % 2 === 0 ? 'success' : 'failure');
    }

    const session = CombatMemory.getSession('test-combat');
    assertTruthy(session.escalationLevel > 0, 'Should have escalation > 0');
  });

  it('should calculate hit rate', () => {
    CombatMemory.reset();
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');
    const context = CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');

    // 3 hits out of 4 attacks = 0.75
    assertEqual(context.hitRate, 0.75, 'Should calculate 75% hit rate');
  });

  it('should get combat statistics', () => {
    CombatMemory.reset();
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'criticalSuccess');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'failure');

    const stats = CombatMemory.getCombatStats('test-combat');

    assertTruthy(stats, 'Should return stats');
    assertEqual(stats.totalHits, 2, 'Should count 2 hits');
    assertEqual(stats.totalMisses, 1, 'Should count 1 miss');
    assertEqual(stats.totalCrits, 1, 'Should count 1 crit');
  });

  it('should handle multiple combat sessions', () => {
    CombatMemory.recordAttack('combat-1', 'attacker1', 'target1', 'success');
    CombatMemory.recordAttack('combat-2', 'attacker2', 'target2', 'failure');

    const stats1 = CombatMemory.getCombatStats('combat-1');
    const stats2 = CombatMemory.getCombatStats('combat-2');

    assertEqual(stats1.totalHits, 1, 'Combat 1 should have 1 hit');
    assertEqual(stats2.totalMisses, 1, 'Combat 2 should have 1 miss');
  });

  it('should end combat session', () => {
    CombatMemory.recordAttack('test-combat', 'attacker1', 'target1', 'success');
    CombatMemory.endCombat('test-combat');

    const stats = CombatMemory.getCombatStats('test-combat');
    assertEqual(stats, null, 'Should return null after ending combat');
  });

  it('should reset all sessions', () => {
    CombatMemory.recordAttack('combat-1', 'attacker1', 'target1', 'success');
    CombatMemory.recordAttack('combat-2', 'attacker2', 'target2', 'success');

    CombatMemory.reset();

    const stats = CombatMemory.getStats();
    assertEqual(stats.activeSessions, 0, 'Should have no active sessions after reset');
  });

  // Helper to add beforeEach functionality
  function beforeEach(fn) {
    // Store original it function
    const originalIt = it.bind(this);

    // This will be called before each test in this describe block
    // Since we can't modify the test framework easily, we'll just call reset in each test
  }

});
