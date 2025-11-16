/**
 * PF2e Narrative Seeds - Combat Memory & Escalation
 * Tracks combat state and provides escalation cues for more dynamic narratives
 * Features:
 * - Hit/miss streak tracking
 * - Combat intensity escalation
 * - Dramatic moments (breaking streaks, critical hits)
 * - Session-based memory with automatic cleanup
 */

export class CombatMemory {
  // Combat session tracking
  static sessions = new Map(); // combatId -> session data
  static currentCombat = null;
  static SESSION_TIMEOUT = 300000; // 5 minutes

  /**
   * Get or create combat session
   * @param {string} combatId - Combat encounter ID
   * @returns {Object} Session data
   */
  static getSession(combatId) {
    if (!combatId) combatId = 'default';

    if (!this.sessions.has(combatId)) {
      this.sessions.set(combatId, this.createNewSession());
    }

    const session = this.sessions.get(combatId);
    session.lastActivity = Date.now();
    this.currentCombat = combatId;

    return session;
  }

  /**
   * Create a new combat session
   * @private
   * @returns {Object} New session data
   */
  static createNewSession() {
    return {
      startTime: Date.now(),
      lastActivity: Date.now(),
      roundNumber: 0,
      totalHits: 0,
      totalMisses: 0,
      totalCrits: 0,
      totalCritFails: 0,
      // Streak tracking (per combatant)
      streaks: new Map(), // actorId -> {hits: 0, misses: 0, lastOutcome: ''}
      // Escalation level (0-10, increases with combat intensity)
      escalationLevel: 0,
      // Recent attacks for variety checking
      recentAttacks: []
    };
  }

  /**
   * Record an attack outcome
   * @param {string} combatId - Combat ID
   * @param {string} attackerId - Attacker actor ID
   * @param {string} targetId - Target actor ID
   * @param {string} outcome - Attack outcome (criticalSuccess, success, failure, criticalFailure)
   * @returns {Object} Memory context for narrative generation
   */
  static recordAttack(combatId, attackerId, targetId, outcome) {
    const session = this.getSession(combatId);

    // Update session totals
    if (outcome === 'criticalSuccess') {
      session.totalHits++;
      session.totalCrits++;
    } else if (outcome === 'success') {
      session.totalHits++;
    } else if (outcome === 'criticalFailure') {
      session.totalMisses++;
      session.totalCritFails++;
    } else {
      session.totalMisses++;
    }

    // Update streaks for this attacker
    const streakData = this.updateStreak(session, attackerId, outcome);

    // Calculate escalation level
    this.updateEscalation(session);

    // Record this attack
    session.recentAttacks.push({
      timestamp: Date.now(),
      attackerId,
      targetId,
      outcome
    });

    // Limit recent attacks to last 20
    if (session.recentAttacks.length > 20) {
      session.recentAttacks.shift();
    }

    // Clean up old sessions
    this.cleanupOldSessions();

    // Return memory context for narrative generation
    return {
      streak: streakData,
      escalation: session.escalationLevel,
      combatDuration: Date.now() - session.startTime,
      totalAttacks: session.totalHits + session.totalMisses,
      hitRate: this.getHitRate(session),
      isDramatic: this.isDramaticMoment(streakData, outcome)
    };
  }

  /**
   * Update attacker's streak data
   * @private
   * @param {Object} session - Combat session
   * @param {string} attackerId - Attacker ID
   * @param {string} outcome - Attack outcome
   * @returns {Object} Streak data
   */
  static updateStreak(session, attackerId, outcome) {
    if (!session.streaks.has(attackerId)) {
      session.streaks.set(attackerId, {
        consecutiveHits: 0,
        consecutiveMisses: 0,
        lastOutcome: null,
        totalHits: 0,
        totalMisses: 0
      });
    }

    const streak = session.streaks.get(attackerId);
    const isHit = outcome === 'criticalSuccess' || outcome === 'success';
    const isCrit = outcome === 'criticalSuccess' || outcome === 'criticalFailure';

    // Update totals
    if (isHit) {
      streak.totalHits++;
    } else {
      streak.totalMisses++;
    }

    // Update streaks
    if (isHit) {
      streak.consecutiveHits++;
      streak.consecutiveMisses = 0;
    } else {
      streak.consecutiveMisses++;
      streak.consecutiveHits = 0;
    }

    streak.lastOutcome = outcome;
    streak.isCritical = isCrit;

    return {
      consecutiveHits: streak.consecutiveHits,
      consecutiveMisses: streak.consecutiveMisses,
      totalHits: streak.totalHits,
      totalMisses: streak.totalMisses,
      lastOutcome: streak.lastOutcome,
      isCritical: isCrit,
      streakBroken: (isHit && streak.consecutiveHits === 1 && streak.totalMisses > 0) ||
                    (!isHit && streak.consecutiveMisses === 1 && streak.totalHits > 0)
    };
  }

  /**
   * Update combat escalation level (0-10)
   * @private
   * @param {Object} session - Combat session
   */
  static updateEscalation(session) {
    const totalAttacks = session.totalHits + session.totalMisses;
    const duration = Date.now() - session.startTime;
    const durationMinutes = duration / 60000;

    // Base escalation on combat duration and attack count
    let escalation = 0;

    // Factor 1: Combat rounds (assumes ~6 seconds per round)
    const estimatedRounds = Math.floor(duration / 6000);
    escalation += Math.min(3, estimatedRounds / 5); // +1 per 5 rounds, max +3

    // Factor 2: Total attacks
    escalation += Math.min(3, totalAttacks / 10); // +1 per 10 attacks, max +3

    // Factor 3: Critical hits/fails
    const critRate = (session.totalCrits + session.totalCritFails) / Math.max(1, totalAttacks);
    escalation += critRate * 2; // Up to +2 for high crit rate

    // Factor 4: Combat intensity (attacks per minute)
    const attacksPerMinute = totalAttacks / Math.max(0.1, durationMinutes);
    if (attacksPerMinute > 10) escalation += 2; // High intensity combat

    // Cap at 10
    session.escalationLevel = Math.min(10, Math.floor(escalation));
  }

  /**
   * Check if this is a dramatic moment (streak broken, critical on losing streak, etc.)
   * @private
   * @param {Object} streakData - Streak data
   * @param {string} outcome - Current outcome
   * @returns {boolean} True if dramatic
   */
  static isDramaticMoment(streakData, outcome) {
    // Critical success after breaking a missing streak (3+ misses before)
    if (outcome === 'criticalSuccess' && streakData.streakBroken && streakData.totalMisses >= 3) {
      return true;
    }

    // Breaking a long winning streak
    if (streakData.consecutiveHits > 4 && streakData.consecutiveMisses === 1) {
      return true;
    }

    // Breaking a long losing streak
    if (streakData.consecutiveMisses > 4 && streakData.consecutiveHits === 1) {
      return true;
    }

    return false;
  }

  /**
   * Get overall hit rate for session
   * @private
   * @param {Object} session - Combat session
   * @returns {number} Hit rate (0.0 to 1.0)
   */
  static getHitRate(session) {
    const total = session.totalHits + session.totalMisses;
    if (total === 0) return 0.5; // Neutral
    return session.totalHits / total;
  }

  /**
   * Get escalation modifier for narrative intensity
   * @param {string} combatId - Combat ID
   * @returns {string} Escalation level (low, medium, high)
   */
  static getEscalationLevel(combatId) {
    const session = this.sessions.get(combatId || 'default');
    if (!session) return 'low';

    const level = session.escalationLevel;
    if (level >= 7) return 'high';
    if (level >= 4) return 'medium';
    return 'low';
  }

  /**
   * End a combat session
   * @param {string} combatId - Combat ID
   */
  static endCombat(combatId) {
    if (this.sessions.has(combatId)) {
      console.log(`PF2e Narrative Seeds | Combat ${combatId} ended. Stats:`, this.getCombatStats(combatId));
      this.sessions.delete(combatId);
    }

    if (this.currentCombat === combatId) {
      this.currentCombat = null;
    }
  }

  /**
   * Get combat statistics
   * @param {string} combatId - Combat ID
   * @returns {Object} Combat stats
   */
  static getCombatStats(combatId) {
    const session = this.sessions.get(combatId || 'default');
    if (!session) return null;

    return {
      duration: Date.now() - session.startTime,
      totalHits: session.totalHits,
      totalMisses: session.totalMisses,
      totalCrits: session.totalCrits,
      totalCritFails: session.totalCritFails,
      hitRate: this.getHitRate(session),
      escalationLevel: session.escalationLevel,
      uniqueCombatants: session.streaks.size
    };
  }

  /**
   * Clean up old combat sessions
   * @private
   */
  static cleanupOldSessions() {
    const now = Date.now();
    for (const [combatId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        console.log(`PF2e Narrative Seeds | Cleaning up old combat session: ${combatId}`);
        this.sessions.delete(combatId);
      }
    }
  }

  /**
   * Reset all combat memory (for testing or manual reset)
   */
  static reset() {
    this.sessions.clear();
    this.currentCombat = null;
  }

  /**
   * Get memory statistics
   * @returns {Object} Memory stats
   */
  static getStats() {
    return {
      activeSessions: this.sessions.size,
      currentCombat: this.currentCombat,
      sessions: Array.from(this.sessions.keys())
    };
  }
}
