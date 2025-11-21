/**
 * NPC Time Manager
 * Coordinates time-based updates for needs, thoughts, relationships, and moods
 */

class NPCTimeManager {
    constructor(needsSystem, thoughtsSystem, moodCalculator, relationshipDynamics, behaviorEngine) {
        this.needsSystem = needsSystem;
        this.thoughtsSystem = thoughtsSystem;
        this.moodCalculator = moodCalculator;
        this.relationshipDynamics = relationshipDynamics;
        this.behaviorEngine = behaviorEngine;
        this.gameTime = Date.now();
        this.lastUpdate = Date.now();
        this.timeScale = 1; // 1 = real-time, 60 = 1 real minute = 1 game hour
    }

    /**
     * Update all NPCs based on time elapsed
     * @param {Array} npcs - Array of NPC objects
     * @param {number} hoursElapsed - Game hours elapsed
     * @param {Object} context - Additional context
     * @returns {Object} - Update results
     */
    updateNPCs(npcs, hoursElapsed, context = {}) {
        const results = {
            updated: 0,
            criticalNeeds: [],
            moodChanges: [],
            thoughtsExpired: 0,
            relationshipsDecayed: 0,
            timestamp: this.gameTime
        };

        for (const npc of npcs) {
            const updateResult = this.updateNPC(npc, hoursElapsed, context);

            results.updated++;

            if (updateResult.criticalNeeds.length > 0) {
                results.criticalNeeds.push({
                    npcId: npc.id,
                    npcName: npc.name,
                    needs: updateResult.criticalNeeds
                });
            }

            if (updateResult.moodChanged) {
                results.moodChanges.push({
                    npcId: npc.id,
                    npcName: npc.name,
                    oldMood: updateResult.oldMood,
                    newMood: updateResult.newMood
                });
            }

            results.thoughtsExpired += updateResult.thoughtsExpired;
            results.relationshipsDecayed += updateResult.relationshipsDecayed;
        }

        this.gameTime += hoursElapsed * 3600000; // Convert hours to milliseconds
        this.lastUpdate = Date.now();

        return results;
    }

    /**
     * Update a single NPC
     * @param {Object} npc - The NPC object
     * @param {number} hoursElapsed - Game hours elapsed
     * @param {Object} context - Additional context
     * @returns {Object} - Update result
     */
    updateNPC(npc, hoursElapsed, context = {}) {
        const result = {
            criticalNeeds: [],
            moodChanged: false,
            oldMood: null,
            newMood: null,
            thoughtsExpired: 0,
            relationshipsDecayed: 0
        };

        // Get old mood
        if (this.moodCalculator) {
            const oldMoodData = this.moodCalculator.calculateMood(npc, context, this.gameTime);
            result.oldMood = oldMoodData.mood.id;
        }

        // 1. Update needs
        if (this.needsSystem && npc.needs) {
            const needsUpdate = this.needsSystem.updateNeeds(npc, hoursElapsed);
            npc = needsUpdate.npc;

            // Check for critical needs
            const critical = this.needsSystem.getCriticalNeeds(npc, 'critical');
            if (critical.length > 0) {
                result.criticalNeeds = critical.map(c => c.needId);

                // Add thoughts for critical needs
                if (this.thoughtsSystem) {
                    for (const criticalNeed of critical) {
                        const thoughtId = `critical-${criticalNeed.needId}`;
                        // Only add if not already present
                        if (!this.thoughtsSystem.hasThought(npc, thoughtId)) {
                            this.thoughtsSystem.addThought(npc, thoughtId, {}, this.gameTime);
                        }
                    }
                }
            }
        }

        // 2. Update thoughts (remove expired)
        if (this.thoughtsSystem && npc.thoughts) {
            const thoughtsUpdate = this.thoughtsSystem.updateThoughts(npc, this.gameTime);
            result.thoughtsExpired = thoughtsUpdate.expiredCount;
        }

        // 3. Update relationships (decay)
        if (this.relationshipDynamics && npc.relationshipsDynamic) {
            const relationshipsUpdate = this.relationshipDynamics.decayRelationships(npc, this.gameTime);
            result.relationshipsDecayed = relationshipsUpdate.decayed;
        }

        // 4. Calculate new mood
        if (this.moodCalculator) {
            const newMoodData = this.moodCalculator.calculateMood(npc, context, this.gameTime);
            result.newMood = newMoodData.mood.id;

            // Check if mood changed significantly
            if (result.oldMood !== result.newMood) {
                result.moodChanged = true;
            }

            // Record mood history
            this.moodCalculator.recordMoodHistory(npc, newMoodData);
        }

        // 5. Update current behavior/activity
        if (this.behaviorEngine) {
            const timeOfDay = this.getTimeOfDay(this.gameTime);
            const behaviorSummary = this.behaviorEngine.getBehaviorSummary(npc, {
                timeOfDay: timeOfDay,
                dayType: this.getDayType(this.gameTime)
            });

            npc.currentActivity = behaviorSummary.currentBehavior;
            npc.currentActivityDescription = behaviorSummary.description;
        }

        // Update last update timestamp
        npc.lastDynamicUpdate = this.gameTime;

        return result;
    }

    /**
     * Advance time by a specific amount
     * @param {number} hours - Hours to advance
     * @param {Array} npcs - NPCs to update
     * @param {Object} context - Additional context
     * @returns {Object} - Update results
     */
    advanceTime(hours, npcs, context = {}) {
        return this.updateNPCs(npcs, hours, context);
    }

    /**
     * Get current time of day
     * @param {number} timestamp - Current timestamp
     * @returns {string} - Time of day block
     */
    getTimeOfDay(timestamp = this.gameTime) {
        const date = new Date(timestamp);
        const hour = date.getHours();

        if (hour >= 5 && hour < 7) return 'early-morning';
        if (hour >= 7 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        if (hour >= 21 && hour < 24) return 'night';
        return 'late-night';
    }

    /**
     * Get day type (weekday or weekend)
     * @param {number} timestamp - Current timestamp
     * @returns {string} - Day type
     */
    getDayType(timestamp = this.gameTime) {
        const date = new Date(timestamp);
        const day = date.getDay();
        return (day === 0 || day === 6) ? 'weekend' : 'weekday';
    }

    /**
     * Set game time
     * @param {number} timestamp - New game time
     */
    setGameTime(timestamp) {
        this.gameTime = timestamp;
    }

    /**
     * Get current game time
     * @returns {number} - Current game time
     */
    getGameTime() {
        return this.gameTime;
    }

    /**
     * Set time scale (how fast time passes)
     * @param {number} scale - Time scale multiplier
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, scale);
    }

    /**
     * Get formatted game time
     * @returns {string} - Formatted time string
     */
    getFormattedGameTime() {
        const date = new Date(this.gameTime);
        return date.toLocaleString();
    }

    /**
     * Start automatic time progression
     * @param {Array} npcs - NPCs to update
     * @param {Object} context - Update context
     * @param {number} updateInterval - Update interval in milliseconds (default: 60000 = 1 minute)
     */
    startAutomaticUpdates(npcs, context = {}, updateInterval = 60000) {
        if (this.updateInterval) {
            this.stopAutomaticUpdates();
        }

        this.updateInterval = setInterval(() => {
            // Calculate game hours elapsed based on time scale
            const realSecondsElapsed = updateInterval / 1000;
            const gameHoursElapsed = (realSecondsElapsed / 3600) * this.timeScale;

            this.updateNPCs(npcs, gameHoursElapsed, context);
        }, updateInterval);

        console.log('Automatic NPC updates started');
    }

    /**
     * Stop automatic time progression
     */
    stopAutomaticUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('Automatic NPC updates stopped');
        }
    }

    /**
     * Get update summary for all NPCs
     * @param {Array} npcs - Array of NPCs
     * @param {Object} context - Context
     * @returns {Object} - Summary object
     */
    getUpdateSummary(npcs, context = {}) {
        const summary = {
            totalNPCs: npcs.length,
            criticalNeedCount: 0,
            unhappyNPCs: 0,
            happyNPCs: 0,
            timeOfDay: this.getTimeOfDay(),
            gameTime: this.getFormattedGameTime(),
            npcs: []
        };

        for (const npc of npcs) {
            const moodData = this.moodCalculator ?
                this.moodCalculator.calculateMood(npc, context, this.gameTime) : null;

            const criticalNeeds = this.needsSystem ?
                this.needsSystem.getCriticalNeeds(npc, 'critical') : [];

            summary.npcs.push({
                id: npc.id,
                name: npc.name,
                mood: moodData?.mood.id || 'unknown',
                moodScore: moodData?.score || 50,
                criticalNeeds: criticalNeeds.length,
                currentActivity: npc.currentActivity || 'idle'
            });

            if (criticalNeeds.length > 0) {
                summary.criticalNeedCount++;
            }

            if (moodData) {
                if (moodData.score >= 65) {
                    summary.happyNPCs++;
                } else if (moodData.score < 40) {
                    summary.unhappyNPCs++;
                }
            }
        }

        return summary;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCTimeManager;
}
