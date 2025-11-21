/**
 * NPC Needs System
 * Manages NPC needs tracking, decay, and satisfaction (Sims/Rimworld-style)
 */

class NPCNeedsSystem {
    constructor() {
        this.needsConfig = null;
        this.initialized = false;
    }

    /**
     * Initialize the needs system by loading configuration
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const response = await fetch('data/social/npc/needs-config.json');
            this.needsConfig = await response.json();
            this.initialized = true;
            console.log('NPC Needs System initialized');
        } catch (error) {
            console.error('Failed to initialize NPC Needs System:', error);
        }
    }

    /**
     * Initialize needs for a new NPC
     * @param {Object} npc - The NPC object
     * @returns {Object} - Initialized needs object
     */
    initializeNeeds(npc) {
        if (!this.initialized) {
            console.error('Needs system not initialized');
            return {};
        }

        const needs = {};

        for (const [needId, needConfig] of Object.entries(this.needsConfig.needs)) {
            const personalityModifier = this.getPersonalityModifier(needConfig, npc.personalities || []);

            // Calculate initial values
            let initialValue = needConfig.baseMax * 0.75; // Start at 75%

            // Special handling for needs with base values
            if (needConfig.baseComfortValue !== undefined) {
                initialValue = personalityModifier.baseValue || needConfig.baseComfortValue;
            } else if (personalityModifier.baseValue !== undefined) {
                initialValue = personalityModifier.baseValue;
            }

            // Calculate decay rate with personality modifiers
            let decayRate = needConfig.baseDecayRate;
            if (personalityModifier.decayRateMultiplier) {
                decayRate *= personalityModifier.decayRateMultiplier;
            }

            needs[needId] = {
                id: needId,
                name: needConfig.name,
                current: Math.round(initialValue),
                max: needConfig.baseMax,
                decayRate: decayRate,
                category: needConfig.category,
                icon: needConfig.icon,
                thresholds: needConfig.thresholds,
                decayToBase: needConfig.decayToBase || false,
                baseValue: needConfig.baseComfortValue || 50,
                lastUpdated: Date.now()
            };
        }

        return needs;
    }

    /**
     * Get personality modifiers for a need
     * @param {Object} needConfig - Need configuration
     * @param {Array} personalities - NPC personalities
     * @returns {Object} - Modifier object
     */
    getPersonalityModifier(needConfig, personalities) {
        const modifier = {
            decayRateMultiplier: 1.0,
            thresholdShift: 0,
            baseValue: undefined
        };

        if (!needConfig.personalityModifiers) return modifier;

        for (const personality of personalities) {
            const personalityId = typeof personality === 'string' ? personality : personality.id;

            if (needConfig.personalityModifiers[personalityId]) {
                const mod = needConfig.personalityModifiers[personalityId];

                if (mod.decayRateMultiplier) {
                    modifier.decayRateMultiplier *= mod.decayRateMultiplier;
                }
                if (mod.thresholdShift) {
                    modifier.thresholdShift += mod.thresholdShift;
                }
                if (mod.baseValue !== undefined) {
                    modifier.baseValue = mod.baseValue;
                }
            }
        }

        return modifier;
    }

    /**
     * Update needs based on time elapsed
     * @param {Object} npc - The NPC object
     * @param {number} hoursElapsed - Hours of game time elapsed
     * @returns {Object} - Updated NPC object
     */
    updateNeeds(npc, hoursElapsed) {
        if (!npc.needs) {
            npc.needs = this.initializeNeeds(npc);
        }

        const updates = [];

        for (const [needId, need] of Object.entries(npc.needs)) {
            const oldValue = need.current;

            if (need.decayToBase) {
                // Decay towards base value instead of 0
                const difference = need.current - need.baseValue;
                const decay = difference * 0.1 * hoursElapsed; // 10% per hour towards base
                need.current = Math.max(0, Math.min(need.max, need.current - decay));
            } else {
                // Normal decay
                const decay = need.decayRate * hoursElapsed;
                need.current = Math.max(0, Math.min(need.max, need.current - decay));
            }

            need.current = Math.round(need.current);
            need.lastUpdated = Date.now();

            // Track significant changes
            if (Math.abs(oldValue - need.current) >= 10) {
                updates.push({
                    needId: needId,
                    oldValue: oldValue,
                    newValue: need.current,
                    oldThreshold: this.getCurrentThreshold(need, oldValue),
                    newThreshold: this.getCurrentThreshold(need, need.current)
                });
            }
        }

        return { npc, updates };
    }

    /**
     * Get current threshold for a need value
     * @param {Object} need - Need object
     * @param {number} value - Current value
     * @returns {Object} - Threshold object
     */
    getCurrentThreshold(need, value) {
        if (!need.thresholds) return null;

        const thresholds = Object.values(need.thresholds).sort((a, b) => a.value - b.value);

        for (let i = thresholds.length - 1; i >= 0; i--) {
            if (value >= thresholds[i].value) {
                return thresholds[i];
            }
        }

        return thresholds[0];
    }

    /**
     * Satisfy a need
     * @param {Object} npc - The NPC object
     * @param {string} needId - Need ID
     * @param {number} amount - Amount to satisfy
     * @param {string} methodId - Satisfaction method ID (optional)
     * @returns {Object} - Result object
     */
    satisfyNeed(npc, needId, amount, methodId = null) {
        if (!npc.needs || !npc.needs[needId]) {
            return { success: false, message: 'Need not found' };
        }

        const need = npc.needs[needId];
        const oldValue = need.current;
        const oldThreshold = this.getCurrentThreshold(need, oldValue);

        need.current = Math.min(need.max, need.current + amount);
        need.current = Math.round(need.current);
        need.lastUpdated = Date.now();

        const newThreshold = this.getCurrentThreshold(need, need.current);

        const result = {
            success: true,
            needId: needId,
            oldValue: oldValue,
            newValue: need.current,
            amountSatisfied: need.current - oldValue,
            oldThreshold: oldThreshold,
            newThreshold: newThreshold,
            thresholdChanged: oldThreshold?.label !== newThreshold?.label,
            thoughts: []
        };

        // Add thoughts from satisfaction method if provided
        if (methodId && this.needsConfig.satisfactionMethods[needId]) {
            const method = this.needsConfig.satisfactionMethods[needId].find(m => m.id === methodId);
            if (method && method.thoughts) {
                result.thoughts = method.thoughts;
            }
        }

        return result;
    }

    /**
     * Get all needs below a certain threshold
     * @param {Object} npc - The NPC object
     * @param {string} thresholdLevel - Threshold level to check
     * @returns {Array} - Array of critical needs
     */
    getCriticalNeeds(npc, thresholdLevel = 'critical') {
        if (!npc.needs) return [];

        const critical = [];

        for (const [needId, need] of Object.entries(npc.needs)) {
            const threshold = this.getCurrentThreshold(need, need.current);
            if (threshold && threshold.urgency === thresholdLevel) {
                critical.push({
                    needId: needId,
                    need: need,
                    threshold: threshold,
                    priority: 100 - need.current
                });
            }
        }

        // Sort by priority (lower value = higher priority)
        return critical.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Get total mood effect from all needs
     * @param {Object} npc - The NPC object
     * @returns {number} - Total mood effect
     */
    getTotalNeedsMoodEffect(npc) {
        if (!npc.needs) return 0;

        let totalEffect = 0;

        for (const need of Object.values(npc.needs)) {
            const threshold = this.getCurrentThreshold(need, need.current);
            if (threshold && threshold.moodEffect !== undefined) {
                totalEffect += threshold.moodEffect;
            }
        }

        return totalEffect;
    }

    /**
     * Get needs summary for display
     * @param {Object} npc - The NPC object
     * @returns {Object} - Needs summary
     */
    getNeedsSummary(npc) {
        if (!npc.needs) return null;

        const summary = {
            overall: 'Good',
            overallScore: 0,
            moodEffect: 0,
            needs: [],
            criticalCount: 0,
            warnings: []
        };

        for (const [needId, need] of Object.entries(npc.needs)) {
            const threshold = this.getCurrentThreshold(need, need.current);
            const percentage = (need.current / need.max) * 100;

            summary.needs.push({
                id: needId,
                name: need.name,
                icon: need.icon,
                current: need.current,
                max: need.max,
                percentage: Math.round(percentage),
                threshold: threshold,
                category: need.category
            });

            summary.overallScore += percentage;

            if (threshold) {
                summary.moodEffect += threshold.moodEffect || 0;

                if (threshold.urgency === 'critical' || threshold.urgency === 'high') {
                    summary.criticalCount++;
                    summary.warnings.push(`${need.name} is ${threshold.label.toLowerCase()}`);
                }
            }
        }

        // Calculate overall status
        const needCount = Object.keys(npc.needs).length;
        summary.overallScore = needCount > 0 ? summary.overallScore / needCount : 0;

        if (summary.overallScore >= 70) {
            summary.overall = 'Good';
        } else if (summary.overallScore >= 50) {
            summary.overall = 'Fair';
        } else if (summary.overallScore >= 30) {
            summary.overall = 'Poor';
        } else {
            summary.overall = 'Critical';
        }

        return summary;
    }

    /**
     * Apply environmental effects to needs
     * @param {Object} npc - The NPC object
     * @param {string} environment - Environment type
     * @returns {Object} - Updated NPC
     */
    applyEnvironmentalEffects(npc, environment) {
        if (!npc.needs || !this.needsConfig.environmentalEffects) return npc;

        const effects = [];

        for (const [needId, environmentEffects] of Object.entries(this.needsConfig.environmentalEffects)) {
            if (npc.needs[needId] && environmentEffects[environment] !== undefined) {
                const effect = environmentEffects[environment];
                const oldValue = npc.needs[needId].current;

                npc.needs[needId].current = Math.max(0, Math.min(
                    npc.needs[needId].max,
                    npc.needs[needId].current + effect
                ));

                npc.needs[needId].current = Math.round(npc.needs[needId].current);

                if (oldValue !== npc.needs[needId].current) {
                    effects.push({
                        needId: needId,
                        environment: environment,
                        effect: effect,
                        oldValue: oldValue,
                        newValue: npc.needs[needId].current
                    });
                }
            }
        }

        return { npc, effects };
    }

    /**
     * Get satisfaction methods for a need
     * @param {string} needId - Need ID
     * @returns {Array} - Array of satisfaction methods
     */
    getSatisfactionMethods(needId) {
        if (!this.needsConfig.satisfactionMethods[needId]) return [];
        return this.needsConfig.satisfactionMethods[needId];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCNeedsSystem;
}
