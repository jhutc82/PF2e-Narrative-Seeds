/**
 * PF2e Narrative Seeds - Skill Memory
 * Tracks skill action usage for variety and context
 *
 * @module skill/skill-memory
 * @author Justin Hutchinson
 */

/**
 * Skill action memory tracker
 * Tracks which actions actors have used recently
 */
export class SkillMemory {

  constructor() {
    this.actionHistory = new Map(); // actorId -> action history
    this.MAX_HISTORY = 20; // Track last 20 actions per actor
  }

  /**
   * Record an action usage
   * @param {Actor} actor - Actor who performed action
   * @param {string} action - Action slug
   * @param {string} outcome - Outcome (criticalSuccess/success/failure/criticalFailure)
   */
  recordAction(actor, action, outcome) {
    if (!actor) return;

    const actorId = actor.id;

    // Get or create history for this actor
    if (!this.actionHistory.has(actorId)) {
      this.actionHistory.set(actorId, []);
    }

    const history = this.actionHistory.get(actorId);

    // Add new record
    history.push({
      action: action,
      outcome: outcome,
      timestamp: Date.now()
    });

    // Trim to max history
    if (history.length > this.MAX_HISTORY) {
      history.shift(); // Remove oldest
    }
  }

  /**
   * Get action history for actor
   * @param {Actor} actor - Actor to check
   * @param {number} limit - Max number of records to return
   * @returns {Array<Object>} Action history
   */
  getHistory(actor, limit = 10) {
    if (!actor) return [];

    const history = this.actionHistory.get(actor.id) || [];
    return history.slice(-limit); // Return most recent N
  }

  /**
   * Get usage count for specific action
   * @param {Actor} actor - Actor to check
   * @param {string} action - Action slug
   * @returns {number} Usage count
   */
  getActionCount(actor, action) {
    const history = this.getHistory(actor, this.MAX_HISTORY);
    return history.filter(record => record.action === action).length;
  }

  /**
   * Get most recent action
   * @param {Actor} actor - Actor to check
   * @returns {Object|null} Most recent action record
   */
  getLastAction(actor) {
    const history = this.getHistory(actor, 1);
    return history[0] || null;
  }

  /**
   * Check if actor recently used same action
   * @param {Actor} actor - Actor to check
   * @param {string} action - Action to check
   * @param {number} withinLast - Check within last N actions
   * @returns {boolean} True if action was used recently
   */
  wasRecentlyUsed(actor, action, withinLast = 3) {
    const history = this.getHistory(actor, withinLast);
    return history.some(record => record.action === action);
  }

  /**
   * Get action statistics
   * @param {Actor} actor - Actor to check
   * @param {string} action - Action slug
   * @returns {Object} Statistics
   */
  getActionStats(actor, action) {
    const history = this.getHistory(actor, this.MAX_HISTORY);
    const actionRecords = history.filter(record => record.action === action);

    if (actionRecords.length === 0) {
      return {
        totalUses: 0,
        criticalSuccesses: 0,
        successes: 0,
        failures: 0,
        criticalFailures: 0,
        lastUsed: null
      };
    }

    return {
      totalUses: actionRecords.length,
      criticalSuccesses: actionRecords.filter(r => r.outcome === 'criticalSuccess').length,
      successes: actionRecords.filter(r => r.outcome === 'success').length,
      failures: actionRecords.filter(r => r.outcome === 'failure').length,
      criticalFailures: actionRecords.filter(r => r.outcome === 'criticalFailure').length,
      lastUsed: actionRecords[actionRecords.length - 1].timestamp
    };
  }

  /**
   * Clear memory for actor or all actors
   * @param {Actor|null} actor - Actor to clear, or null for all
   */
  clear(actor = null) {
    if (actor) {
      this.actionHistory.delete(actor.id);
    } else {
      this.actionHistory.clear();
    }
  }

  /**
   * Get memory statistics
   * @returns {Object} Memory stats
   */
  getStats() {
    const totalRecords = Array.from(this.actionHistory.values())
      .reduce((sum, history) => sum + history.length, 0);

    return {
      actorsTracked: this.actionHistory.size,
      totalRecords: totalRecords,
      maxHistoryPerActor: this.MAX_HISTORY
    };
  }
}
