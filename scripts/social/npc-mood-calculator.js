/**
 * NPC Mood Calculator
 * Dynamically calculates NPC mood from needs, thoughts, personality, and relationships
 */

class NPCMoodCalculator {
    constructor(needsSystem, thoughtsSystem) {
        this.needsSystem = needsSystem;
        this.thoughtsSystem = thoughtsSystem;
        this.moodsConfig = null;
        this.initialized = false;
    }

    /**
     * Initialize the mood calculator
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const response = await fetch('modules/pf2e-narrative-seeds/data/social/npc/moods.json');
            this.moodsConfig = await response.json();
            this.initialized = true;
            console.log('NPC Mood Calculator initialized');
        } catch (error) {
            console.error('Failed to initialize NPC Mood Calculator:', error);
        }
    }

    /**
     * Calculate current mood for an NPC
     * @param {Object} npc - The NPC object
     * @param {Object} context - Additional context (nearbyNPCs, environment, etc.)
     * @param {number} currentTime - Current game time
     * @returns {Object} - Calculated mood object
     */
    calculateMood(npc, context = {}, currentTime = Date.now()) {
        let moodScore = 50; // Base neutral score (0-100 scale)
        const factors = [];

        // Factor 1: Needs contribution
        if (npc.needs && this.needsSystem) {
            const needsEffect = this.needsSystem.getTotalNeedsMoodEffect(npc);
            moodScore += needsEffect;
            factors.push({
                source: 'needs',
                effect: needsEffect,
                description: `Needs (${needsEffect >= 0 ? '+' : ''}${needsEffect})`
            });
        }

        // Factor 2: Thoughts contribution
        if (npc.thoughts && this.thoughtsSystem) {
            const thoughtsEffect = this.thoughtsSystem.getTotalThoughtsMoodEffect(npc, currentTime);
            moodScore += thoughtsEffect;
            factors.push({
                source: 'thoughts',
                effect: thoughtsEffect,
                description: `Thoughts (${thoughtsEffect >= 0 ? '+' : ''}${thoughtsEffect})`
            });
        }

        // Factor 3: Personality baseline modifiers
        const personalityEffect = this.getPersonalityMoodModifier(npc);
        moodScore += personalityEffect;
        if (personalityEffect !== 0) {
            factors.push({
                source: 'personality',
                effect: personalityEffect,
                description: `Personality (${personalityEffect >= 0 ? '+' : ''}${personalityEffect})`
            });
        }

        // Factor 4: Relationship effects (if nearbyNPCs provided)
        if (context.nearbyNPCs && npc.relationshipsDynamic) {
            const relationshipEffect = this.getRelationshipMoodModifier(npc, context.nearbyNPCs);
            moodScore += relationshipEffect;
            if (relationshipEffect !== 0) {
                factors.push({
                    source: 'relationships',
                    effect: relationshipEffect,
                    description: `Nearby people (${relationshipEffect >= 0 ? '+' : ''}${relationshipEffect})`
                });
            }
        }

        // Factor 5: Health effects
        if (npc.health) {
            const healthEffect = this.getHealthMoodModifier(npc);
            moodScore += healthEffect;
            if (healthEffect !== 0) {
                factors.push({
                    source: 'health',
                    effect: healthEffect,
                    description: `Health (${healthEffect >= 0 ? '+' : ''}${healthEffect})`
                });
            }
        }

        // Clamp mood score to 0-100
        moodScore = Math.max(0, Math.min(100, moodScore));

        // Convert score to mood category and PF2e attitude
        const mood = this.scoreToMood(moodScore);

        return {
            score: Math.round(moodScore),
            mood: mood,
            factors: factors,
            timestamp: currentTime
        };
    }

    /**
     * Get personality-based mood modifier
     * @param {Object} npc - The NPC object
     * @returns {number} - Mood modifier
     */
    getPersonalityMoodModifier(npc) {
        if (!npc.personalities) return 0;

        let modifier = 0;

        const personalityEffects = {
            'cheerful': 10,
            'optimistic': 8,
            'content': 5,
            'melancholy': -10,
            'pessimistic': -8,
            'bitter': -12,
            'anxious': -6,
            'paranoid': -8,
            'carefree': 6,
            'stoic': 0,
            'temperamental': -3
        };

        for (const personality of npc.personalities) {
            const personalityId = typeof personality === 'string' ? personality : personality.id;

            if (personalityEffects[personalityId] !== undefined) {
                modifier += personalityEffects[personalityId];
            }
        }

        return modifier;
    }

    /**
     * Get relationship-based mood modifier from nearby NPCs
     * @param {Object} npc - The NPC object
     * @param {Array} nearbyNPCs - Array of nearby NPC IDs
     * @returns {number} - Mood modifier
     */
    getRelationshipMoodModifier(npc, nearbyNPCs) {
        if (!npc.relationshipsDynamic || !nearbyNPCs || nearbyNPCs.length === 0) {
            return 0;
        }

        let modifier = 0;

        for (const nearbyNpcId of nearbyNPCs) {
            const relationship = npc.relationshipsDynamic[nearbyNpcId];
            if (relationship) {
                const opinion = relationship.opinion || 0;

                // Loved ones (+5 to +15)
                if (opinion > 70) {
                    modifier += Math.min(15, (opinion - 70) / 2);
                }
                // Friends (+2 to +5)
                else if (opinion > 30) {
                    modifier += Math.min(5, (opinion - 30) / 10);
                }
                // Enemies (-5 to -20)
                else if (opinion < -20) {
                    modifier += Math.max(-20, opinion / 5);
                }
                // Disliked (-2 to -5)
                else if (opinion < 0) {
                    modifier += Math.max(-5, opinion / 4);
                }
            }
        }

        return Math.round(modifier);
    }

    /**
     * Get health-based mood modifier
     * @param {Object} npc - The NPC object
     * @returns {number} - Mood modifier
     */
    getHealthMoodModifier(npc) {
        if (!npc.health) return 0;

        let modifier = 0;

        // Physical health
        if (npc.health.conditions) {
            const painConditions = ['wounded', 'injured', 'dying'];
            const sickConditions = ['sickened', 'diseased'];

            for (const condition of npc.health.conditions) {
                const conditionId = typeof condition === 'string' ? condition : condition.id;

                if (painConditions.includes(conditionId)) {
                    modifier -= 12;
                } else if (sickConditions.includes(conditionId)) {
                    modifier -= 10;
                }
            }
        }

        // HP-based modifier
        if (npc.health.currentHP !== undefined && npc.health.maxHP !== undefined) {
            const hpPercentage = (npc.health.currentHP / npc.health.maxHP) * 100;

            if (hpPercentage < 25) {
                modifier -= 15; // Severely wounded
            } else if (hpPercentage < 50) {
                modifier -= 8; // Wounded
            } else if (hpPercentage === 100) {
                modifier += 3; // Full health
            }
        }

        return modifier;
    }

    /**
     * Convert mood score to mood object
     * @param {number} score - Mood score (0-100)
     * @returns {Object} - Mood object with category, attitude, and DC
     */
    scoreToMood(score) {
        // Mood categories based on score ranges
        if (score >= 90) {
            return {
                id: 'ecstatic',
                name: 'Ecstatic',
                description: 'Overjoyed and elated',
                attitude: 'helpful',
                socialDC: 5,
                color: '#00FF00'
            };
        } else if (score >= 75) {
            return {
                id: 'happy',
                name: 'Happy',
                description: 'Feeling good',
                attitude: 'friendly',
                socialDC: 10,
                color: '#7FFF00'
            };
        } else if (score >= 60) {
            return {
                id: 'content',
                name: 'Content',
                description: 'Satisfied',
                attitude: 'friendly',
                socialDC: 12,
                color: '#90EE90'
            };
        } else if (score >= 45) {
            return {
                id: 'neutral',
                name: 'Neutral',
                description: 'Neither happy nor sad',
                attitude: 'indifferent',
                socialDC: 15,
                color: '#FFFF00'
            };
        } else if (score >= 30) {
            return {
                id: 'dissatisfied',
                name: 'Dissatisfied',
                description: 'Not feeling great',
                attitude: 'indifferent',
                socialDC: 18,
                color: '#FFA500'
            };
        } else if (score >= 15) {
            return {
                id: 'unhappy',
                name: 'Unhappy',
                description: 'Feeling down',
                attitude: 'unfriendly',
                socialDC: 22,
                color: '#FF6347'
            };
        } else {
            return {
                id: 'miserable',
                name: 'Miserable',
                description: 'Utterly despondent',
                attitude: 'hostile',
                socialDC: 28,
                color: '#8B0000'
            };
        }
    }

    /**
     * Get mood summary with detailed breakdown
     * @param {Object} npc - The NPC object
     * @param {Object} context - Context object
     * @param {number} currentTime - Current game time
     * @returns {Object} - Mood summary
     */
    getMoodSummary(npc, context = {}, currentTime = Date.now()) {
        const moodData = this.calculateMood(npc, context, currentTime);

        return {
            current: moodData.mood,
            score: moodData.score,
            factors: moodData.factors,
            breakdown: {
                needs: this.needsSystem ? this.needsSystem.getTotalNeedsMoodEffect(npc) : 0,
                thoughts: this.thoughtsSystem ? this.thoughtsSystem.getTotalThoughtsMoodEffect(npc, currentTime) : 0,
                personality: this.getPersonalityMoodModifier(npc),
                relationships: context.nearbyNPCs ? this.getRelationshipMoodModifier(npc, context.nearbyNPCs) : 0,
                health: this.getHealthMoodModifier(npc)
            },
            timestamp: currentTime
        };
    }

    /**
     * Get mood trend (improving, declining, stable)
     * @param {Object} npc - The NPC object
     * @param {Object} context - Context object
     * @param {number} currentTime - Current game time
     * @returns {string} - Trend indicator
     */
    getMoodTrend(npc, context = {}, currentTime = Date.now()) {
        // Check if we have historical mood data
        if (!npc.moodHistory || npc.moodHistory.length < 2) {
            return 'stable';
        }

        const currentMood = this.calculateMood(npc, context, currentTime);
        const previousMood = npc.moodHistory[npc.moodHistory.length - 1];

        const difference = currentMood.score - previousMood.score;

        if (difference > 10) {
            return 'improving';
        } else if (difference < -10) {
            return 'declining';
        } else {
            return 'stable';
        }
    }

    /**
     * Record mood in history
     * @param {Object} npc - The NPC object
     * @param {Object} moodData - Calculated mood data
     * @param {number} maxHistory - Maximum history entries to keep
     */
    recordMoodHistory(npc, moodData, maxHistory = 24) {
        if (!npc.moodHistory) {
            npc.moodHistory = [];
        }

        npc.moodHistory.push({
            score: moodData.score,
            mood: moodData.mood.id,
            timestamp: moodData.timestamp
        });

        // Keep only recent history
        if (npc.moodHistory.length > maxHistory) {
            npc.moodHistory = npc.moodHistory.slice(-maxHistory);
        }
    }

    /**
     * Get social interaction DC modifier based on current mood
     * @param {Object} npc - The NPC object
     * @param {Object} context - Context object
     * @param {number} currentTime - Current game time
     * @returns {number} - DC for social interactions
     */
    getSocialDC(npc, context = {}, currentTime = Date.now()) {
        const moodData = this.calculateMood(npc, context, currentTime);
        return moodData.mood.socialDC;
    }

    /**
     * Get PF2e attitude based on current mood
     * @param {Object} npc - The NPC object
     * @param {Object} context - Context object
     * @param {number} currentTime - Current game time
     * @returns {string} - PF2e attitude (hostile, unfriendly, indifferent, friendly, helpful)
     */
    getAttitude(npc, context = {}, currentTime = Date.now()) {
        const moodData = this.calculateMood(npc, context, currentTime);
        return moodData.mood.attitude;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCMoodCalculator;
}
