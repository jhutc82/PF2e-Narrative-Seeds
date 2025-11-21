/**
 * NPC Behavior Engine
 * Determines autonomous NPC behaviors based on needs, personality, motivation, and schedule
 */

class NPCBehaviorEngine {
    constructor(needsSystem) {
        this.needsSystem = needsSystem;
        this.behaviorsConfig = null;
        this.schedulesConfig = null;
        this.initialized = false;
    }

    /**
     * Initialize the behavior engine
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const [behaviorsResponse, schedulesResponse] = await Promise.all([
                fetch('data/social/npc/autonomous-behaviors.json'),
                fetch('data/social/npc/time-schedules.json')
            ]);

            this.behaviorsConfig = await behaviorsResponse.json();
            this.schedulesConfig = await schedulesResponse.json();
            this.initialized = true;
            console.log('NPC Behavior Engine initialized');
        } catch (error) {
            console.error('Failed to initialize NPC Behavior Engine:', error);
        }
    }

    /**
     * Get the current desired behavior for an NPC
     * @param {Object} npc - The NPC object
     * @param {Object} context - Context (time of day, location, etc.)
     * @returns {Object|null} - Desired behavior
     */
    getCurrentDesire(npc, context = {}) {
        if (!this.initialized) return null;

        const desires = [];

        // 1. Check need-driven behaviors
        const needDriven = this.getNeedDrivenBehaviors(npc);
        desires.push(...needDriven);

        // 2. Check scheduled behaviors
        if (context.timeOfDay) {
            const scheduled = this.getScheduledBehaviors(npc, context.timeOfDay, context.dayType);
            desires.push(...scheduled);
        }

        // 3. Check personality-driven behaviors
        const personalityDriven = this.getPersonalityDrivenBehaviors(npc);
        desires.push(...personalityDriven);

        // 4. Check motivation-driven behaviors
        const motivationDriven = this.getMotivationDrivenBehaviors(npc);
        desires.push(...motivationDriven);

        // Sort by priority and return highest
        desires.sort((a, b) => b.priority - a.priority);

        return desires[0] || null;
    }

    /**
     * Get need-driven behaviors
     * @param {Object} npc - The NPC object
     * @returns {Array} - Array of potential behaviors
     */
    getNeedDrivenBehaviors(npc) {
        if (!npc.needs || !this.behaviorsConfig) return [];

        const behaviors = [];
        const needBehaviors = this.behaviorsConfig.behaviors['need-driven'];

        for (const [behaviorId, behavior] of Object.entries(needBehaviors)) {
            if (behavior.trigger.type !== 'need') continue;

            const need = npc.needs[behavior.trigger.need];
            if (!need) continue;

            // Check if need is below threshold
            const threshold = need.thresholds[behavior.trigger.threshold];
            if (!threshold) continue;

            if (need.current <= threshold.value) {
                // Calculate priority
                const priority = this.calculateBehaviorPriority(behavior, npc, { needValue: need.current });

                behaviors.push({
                    behaviorId: behaviorId,
                    behavior: behavior,
                    priority: priority,
                    trigger: 'need',
                    needId: behavior.trigger.need,
                    needValue: need.current
                });
            }
        }

        return behaviors;
    }

    /**
     * Get scheduled behaviors
     * @param {Object} npc - The NPC object
     * @param {string} timeOfDay - Time of day block
     * @param {string} dayType - weekday or weekend
     * @returns {Array} - Array of scheduled behaviors
     */
    getScheduledBehaviors(npc, timeOfDay, dayType = 'weekday') {
        if (!this.behaviorsConfig || !this.schedulesConfig) return [];

        const behaviors = [];
        const scheduledBehaviors = this.behaviorsConfig.behaviors['scheduled'];

        for (const [behaviorId, behavior] of Object.entries(scheduledBehaviors)) {
            if (behavior.trigger.type !== 'schedule') continue;

            // Check if current time matches behavior schedule
            if (behavior.trigger.timeOfDay && behavior.trigger.timeOfDay.includes(timeOfDay)) {
                const priority = this.calculateBehaviorPriority(behavior, npc, {});

                behaviors.push({
                    behaviorId: behaviorId,
                    behavior: behavior,
                    priority: priority,
                    trigger: 'schedule',
                    timeOfDay: timeOfDay
                });
            }
        }

        return behaviors;
    }

    /**
     * Get personality-driven behaviors
     * @param {Object} npc - The NPC object
     * @returns {Array} - Array of potential behaviors
     */
    getPersonalityDrivenBehaviors(npc) {
        if (!npc.personalities || !this.behaviorsConfig) return [];

        const behaviors = [];
        const personalityBehaviors = this.behaviorsConfig.behaviors['personality-driven'];

        for (const [behaviorId, behavior] of Object.entries(personalityBehaviors)) {
            if (behavior.trigger.type !== 'personality') continue;

            // Check if NPC has required personality traits
            const hasRequiredTrait = behavior.trigger.requiredTraits.some(trait => {
                return npc.personalities.some(p => {
                    const pid = typeof p === 'string' ? p : p.id;
                    return pid === trait;
                });
            });

            if (hasRequiredTrait) {
                // Roll for random chance
                const randomChance = behavior.trigger.randomChance || 0.1;
                if (Math.random() < randomChance) {
                    const priority = this.calculateBehaviorPriority(behavior, npc, {});

                    behaviors.push({
                        behaviorId: behaviorId,
                        behavior: behavior,
                        priority: priority,
                        trigger: 'personality'
                    });
                }
            }
        }

        return behaviors;
    }

    /**
     * Get motivation-driven behaviors
     * @param {Object} npc - The NPC object
     * @returns {Array} - Array of potential behaviors
     */
    getMotivationDrivenBehaviors(npc) {
        if (!npc.motivation || !this.behaviorsConfig) return [];

        const behaviors = [];
        const motivationBehaviors = this.behaviorsConfig.behaviors['motivation-driven'];

        for (const [behaviorId, behavior] of Object.entries(motivationBehaviors)) {
            if (behavior.trigger.type !== 'motivation') continue;

            // Check if NPC's motivation matches
            const motivationId = typeof npc.motivation === 'string' ? npc.motivation : npc.motivation.id;
            const hasRequiredMotivation = behavior.trigger.requiredMotivations.includes(motivationId);

            if (hasRequiredMotivation) {
                const randomChance = behavior.trigger.randomChance || 0.1;
                if (Math.random() < randomChance) {
                    const priority = this.calculateBehaviorPriority(behavior, npc, {});

                    behaviors.push({
                        behaviorId: behaviorId,
                        behavior: behavior,
                        priority: priority,
                        trigger: 'motivation'
                    });
                }
            }
        }

        return behaviors;
    }

    /**
     * Calculate behavior priority
     * @param {Object} behavior - Behavior config
     * @param {Object} npc - The NPC object
     * @param {Object} context - Additional context
     * @returns {number} - Priority value
     */
    calculateBehaviorPriority(behavior, npc, context = {}) {
        let priority = 0;

        if (behavior.priorityCalculation) {
            // Dynamic priority calculation
            if (behavior.priorityCalculation.includes('sustenanceValue')) {
                priority = 100 - (npc.needs?.sustenance?.current || 50);
            } else if (behavior.priorityCalculation.includes('restValue')) {
                priority = 100 - (npc.needs?.rest?.current || 50);
            } else if (behavior.priorityCalculation.includes('socialValue')) {
                priority = 80 - (npc.needs?.social?.current || 50);
            } else if (behavior.priorityCalculation.includes('recreationValue')) {
                priority = 70 - (npc.needs?.recreation?.current || 50);
            } else if (behavior.priorityCalculation.includes('safetyValue')) {
                priority = 120 - (npc.needs?.safety?.current || 70);
            } else {
                // Use static priority
                priority = parseInt(behavior.priorityCalculation) || behavior.priority || 50;
            }
        } else {
            // Use priority field or default
            const priorityMap = { critical: 100, high: 80, medium: 50, low: 30 };
            priority = priorityMap[behavior.priority] || 50;
        }

        // Apply personality modifiers
        if (behavior.personalityModifiers && npc.personalities) {
            for (const personality of npc.personalities) {
                const personalityId = typeof personality === 'string' ? personality : personality.id;
                const modifier = behavior.personalityModifiers[personalityId];

                if (modifier && modifier.priorityBonus) {
                    priority += modifier.priorityBonus;
                }
            }
        }

        return Math.max(0, priority);
    }

    /**
     * Get behavior summary for display
     * @param {Object} npc - The NPC object
     * @param {Object} context - Context
     * @returns {Object} - Behavior summary
     */
    getBehaviorSummary(npc, context = {}) {
        const currentDesire = this.getCurrentDesire(npc, context);

        if (!currentDesire) {
            return {
                currentBehavior: 'idle',
                description: 'No specific desire',
                priority: 0
            };
        }

        return {
            currentBehavior: currentDesire.behaviorId,
            description: currentDesire.behavior.description,
            priority: currentDesire.priority,
            trigger: currentDesire.trigger,
            behavior: currentDesire.behavior
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCBehaviorEngine;
}
