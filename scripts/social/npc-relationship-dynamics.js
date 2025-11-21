/**
 * NPC Relationship Dynamics System
 * Manages opinion-based relationship system (Rimworld-style)
 */

class NPCRelationshipDynamics {
    constructor(thoughtsSystem) {
        this.thoughtsSystem = thoughtsSystem;
        this.interactionsConfig = null;
        this.progressionConfig = null;
        this.initialized = false;
    }

    /**
     * Initialize the relationship dynamics system
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const [interactionsResponse, progressionResponse] = await Promise.all([
                fetch('data/social/npc/social-interactions.json'),
                fetch('data/social/npc/relationship-progression.json')
            ]);

            this.interactionsConfig = await interactionsResponse.json();
            this.progressionConfig = await progressionResponse.json();
            this.initialized = true;
            console.log('NPC Relationship Dynamics System initialized');
        } catch (error) {
            console.error('Failed to initialize NPC Relationship Dynamics:', error);
        }
    }

    /**
     * Initialize dynamic relationships for an NPC
     * @param {Object} npc - The NPC object
     * @returns {Object} - Initialized relationships object
     */
    initializeRelationships(npc) {
        return {};
    }

    /**
     * Get or create relationship between two NPCs
     * @param {Object} npc - The source NPC
     * @param {string} targetNpcId - Target NPC ID
     * @param {Object} targetNpc - Target NPC object (for compatibility calculation)
     * @returns {Object} - Relationship object
     */
    getRelationship(npc, targetNpcId, targetNpc = null) {
        if (!npc.relationshipsDynamic) {
            npc.relationshipsDynamic = {};
        }

        if (!npc.relationshipsDynamic[targetNpcId]) {
            // Create new relationship
            const baseCompatibility = targetNpc ? this.calculateCompatibility(npc, targetNpc) : 0;

            npc.relationshipsDynamic[targetNpcId] = {
                npcId: targetNpcId,
                npcName: targetNpc ? targetNpc.name : 'Unknown',
                opinion: baseCompatibility,
                romanceOpinion: 0,
                opinionModifiers: [],
                interactionHistory: [],
                lastInteraction: null,
                interactionCount: 0,
                totalTimeSpent: 0,
                baseCompatibility: baseCompatibility,
                knownSecrets: [],
                trustLevel: 'stranger',
                relationshipType: 'stranger',
                decayRate: -0.5, // Opinion decays without interaction
                created: Date.now()
            };
        }

        return npc.relationshipsDynamic[targetNpcId];
    }

    /**
     * Calculate base compatibility between two NPCs based on personalities
     * @param {Object} npc1 - First NPC
     * @param {Object} npc2 - Second NPC
     * @returns {number} - Compatibility score (-20 to +20)
     */
    calculateCompatibility(npc1, npc2) {
        if (!npc1.personalities || !npc2.personalities) return 0;

        let compatibility = 0;

        const personalities1 = npc1.personalities.map(p => typeof p === 'string' ? p : p.id);
        const personalities2 = npc2.personalities.map(p => typeof p === 'string' ? p : p.id);

        // Compatible personality pairs
        const compatiblePairs = {
            'cheerful': ['cheerful', 'optimistic', 'friendly'],
            'scholarly': ['scholarly', 'curious', 'studious'],
            'generous': ['generous', 'kind', 'helpful'],
            'brave': ['brave', 'courageous', 'bold'],
            'humble': ['humble', 'modest'],
            'honest': ['honest', 'truthful']
        };

        // Incompatible personality pairs
        const incompatiblePairs = {
            'aggressive': ['timid', 'peaceful', 'gentle'],
            'deceitful': ['honest', 'truthful'],
            'pompous': ['humble', 'modest'],
            'greedy': ['generous', 'charitable'],
            'pessimistic': ['cheerful', 'optimistic'],
            'lazy': ['energetic', 'diligent']
        };

        // Check compatible pairs
        for (const p1 of personalities1) {
            if (compatiblePairs[p1]) {
                for (const p2 of personalities2) {
                    if (compatiblePairs[p1].includes(p2)) {
                        compatibility += 5;
                    }
                }
            }
        }

        // Check incompatible pairs
        for (const p1 of personalities1) {
            if (incompatiblePairs[p1]) {
                for (const p2 of personalities2) {
                    if (incompatiblePairs[p1].includes(p2)) {
                        compatibility -= 5;
                    }
                }
            }
        }

        return Math.max(-20, Math.min(20, compatibility));
    }

    /**
     * Add opinion modifier to a relationship
     * @param {Object} relationship - Relationship object
     * @param {Object} modifierData - Modifier data
     * @param {number} currentTime - Current game time
     * @returns {Object} - Updated relationship
     */
    addOpinionModifier(relationship, modifierData, currentTime = Date.now()) {
        const modifier = {
            id: modifierData.id || `mod-${Date.now()}`,
            reason: modifierData.reason,
            value: modifierData.value,
            timestamp: currentTime,
            duration: modifierData.duration || 'permanent',
            decayType: modifierData.decayType || 'linear'
        };

        // Check if a similar modifier exists
        const existingIndex = relationship.opinionModifiers.findIndex(m => m.id === modifier.id);
        if (existingIndex !== -1) {
            // Replace existing modifier
            relationship.opinionModifiers[existingIndex] = modifier;
        } else {
            relationship.opinionModifiers.push(modifier);
        }

        // Recalculate total opinion
        this.updateRelationshipOpinion(relationship, currentTime);

        return relationship;
    }

    /**
     * Update relationship opinion from all modifiers
     * @param {Object} relationship - Relationship object
     * @param {number} currentTime - Current game time
     * @returns {number} - New opinion value
     */
    updateRelationshipOpinion(relationship, currentTime = Date.now()) {
        let totalOpinion = relationship.baseCompatibility;

        // Filter out expired modifiers
        relationship.opinionModifiers = relationship.opinionModifiers.filter(modifier => {
            if (modifier.duration === 'permanent') return true;

            const age = currentTime - modifier.timestamp;
            const durationMs = modifier.duration * 3600000; // Convert hours to ms

            return age < durationMs;
        });

        // Add up all active modifiers with decay
        for (const modifier of relationship.opinionModifiers) {
            const modifierValue = this.getModifierValue(modifier, currentTime);
            totalOpinion += modifierValue;
        }

        // Clamp to -100 to +100
        relationship.opinion = Math.max(-100, Math.min(100, totalOpinion));
        relationship.opinion = Math.round(relationship.opinion);

        // Update relationship type based on opinion
        relationship.relationshipType = this.getRelationshipType(relationship.opinion, relationship.romanceOpinion);

        // Update trust level
        relationship.trustLevel = this.getTrustLevel(relationship.opinion, relationship.interactionCount);

        return relationship.opinion;
    }

    /**
     * Get modifier value with decay applied
     * @param {Object} modifier - Modifier object
     * @param {number} currentTime - Current game time
     * @returns {number} - Current modifier value
     */
    getModifierValue(modifier, currentTime = Date.now()) {
        if (modifier.duration === 'permanent') {
            return modifier.value;
        }

        const age = currentTime - modifier.timestamp;
        const durationMs = modifier.duration * 3600000;

        if (age >= durationMs) return 0;

        const progress = age / durationMs;

        switch (modifier.decayType) {
            case 'linear':
                return modifier.value * (1 - progress);

            case 'exponential':
                return modifier.value * Math.exp(-3 * progress);

            case 'none':
                return modifier.value;

            default:
                return modifier.value * (1 - progress);
        }
    }

    /**
     * Get relationship type based on opinion
     * @param {number} opinion - Opinion value
     * @param {number} romanceOpinion - Romance opinion value
     * @returns {string} - Relationship type
     */
    getRelationshipType(opinion, romanceOpinion = 0) {
        if (romanceOpinion > 60) return 'lover';
        if (romanceOpinion > 30) return 'romantic-interest';
        if (opinion > 70) return 'close-friend';
        if (opinion > 40) return 'friend';
        if (opinion > 10) return 'acquaintance';
        if (opinion > -20) return 'neutral';
        if (opinion > -50) return 'rival';
        return 'enemy';
    }

    /**
     * Get trust level based on opinion and interactions
     * @param {number} opinion - Opinion value
     * @param {number} interactionCount - Number of interactions
     * @returns {string} - Trust level
     */
    getTrustLevel(opinion, interactionCount) {
        if (opinion > 70 && interactionCount > 10) return 'confidant';
        if (opinion > 50 && interactionCount > 5) return 'trusted';
        if (opinion > 20 && interactionCount > 2) return 'acquaintance';
        return 'stranger';
    }

    /**
     * Process a social interaction between NPCs
     * @param {Object} initiatorNpc - Initiating NPC
     * @param {Object} targetNpc - Target NPC
     * @param {string} interactionId - Interaction type ID
     * @param {Object} context - Additional context
     * @param {number} currentTime - Current game time
     * @returns {Object} - Interaction result
     */
    processSocialInteraction(initiatorNpc, targetNpc, interactionId, context = {}, currentTime = Date.now()) {
        if (!this.interactionsConfig) {
            return { success: false, message: 'Interactions not loaded' };
        }

        // Get interaction configuration
        const interaction = this.getInteractionConfig(interactionId);
        if (!interaction) {
            return { success: false, message: 'Interaction not found' };
        }

        // Get or create relationship
        const relationship = this.getRelationship(targetNpc, initiatorNpc.id, initiatorNpc);

        // Calculate success chance
        let successChance = interaction.baseSuccessChance;

        // Factor 1: Current mood affects receptiveness
        if (context.targetMood) {
            const moodModifier = interaction.moodModifiers?.[context.targetMood.id] || 0;
            successChance += moodModifier;
        }

        // Factor 2: Existing relationship
        successChance += (relationship.opinion / 200); // -0.5 to +0.5

        // Factor 3: Personality compatibility
        const personalityMod = this.getInteractionPersonalityModifier(interaction, targetNpc);
        successChance += personalityMod.successBonus || 0;

        // Factor 4: Needs state
        if (targetNpc.needs && this.interactionsConfig.globalModifiers?.needsEffects) {
            const needsMod = this.getInteractionNeedsModifier(interaction, targetNpc);
            successChance += needsMod;
        }

        // Factor 5: PF2e skill check (if applicable)
        if (interaction.requiredSkill && context.skillCheckPassed) {
            successChance += 0.3;
        }

        // Clamp success chance
        successChance = Math.max(0, Math.min(1, successChance));

        // Roll for success
        const roll = Math.random();
        const success = roll < successChance;

        const result = {
            success: success,
            interactionId: interactionId,
            interactionName: interaction.name,
            roll: roll,
            successChance: successChance,
            timestamp: currentTime
        };

        // Apply success/failure effects
        const effects = success ? interaction.onSuccess : interaction.onFailure;

        // Update relationship opinion
        const opinionChange = effects.opinionChange || 0;
        const modifiedOpinionChange = opinionChange + (personalityMod.opinionBonus || 0);

        if (modifiedOpinionChange !== 0) {
            this.addOpinionModifier(relationship, {
                id: `${interactionId}-${Date.now()}`,
                reason: success ? effects.message.replace('{npc}', targetNpc.name) : effects.message.replace('{npc}', targetNpc.name),
                value: modifiedOpinionChange,
                duration: 240 // 10 days default
            }, currentTime);
        }

        // Update romance opinion if applicable
        if (effects.romanceOpinionChange) {
            relationship.romanceOpinion = Math.max(-100, Math.min(100,
                relationship.romanceOpinion + effects.romanceOpinionChange
            ));
        }

        // Add thoughts to target NPC
        if (effects.thoughts && this.thoughtsSystem) {
            for (const thoughtId of effects.thoughts) {
                this.thoughtsSystem.addThought(
                    targetNpc,
                    thoughtId,
                    { name: initiatorNpc.name },
                    currentTime
                );
            }
        }

        // Satisfy needs
        if (interaction.needsSatisfied) {
            result.needsSatisfied = interaction.needsSatisfied;
        }

        // Update interaction history
        relationship.interactionHistory.push({
            interactionId: interactionId,
            success: success,
            timestamp: currentTime
        });

        // Keep only last 20 interactions
        if (relationship.interactionHistory.length > 20) {
            relationship.interactionHistory = relationship.interactionHistory.slice(-20);
        }

        relationship.lastInteraction = currentTime;
        relationship.interactionCount++;
        relationship.totalTimeSpent += (interaction.duration || 0);

        result.relationship = {
            opinion: relationship.opinion,
            opinionChange: modifiedOpinionChange,
            relationshipType: relationship.relationshipType,
            trustLevel: relationship.trustLevel
        };

        result.message = effects.message.replace('{npc}', targetNpc.name);
        result.moodBonus = effects.moodBonus || 0;

        return result;
    }

    /**
     * Get interaction configuration
     * @param {string} interactionId - Interaction ID
     * @returns {Object|null} - Interaction config
     */
    getInteractionConfig(interactionId) {
        if (!this.interactionsConfig) return null;

        for (const category of Object.values(this.interactionsConfig.interactions)) {
            if (category[interactionId]) {
                return category[interactionId];
            }
        }

        return null;
    }

    /**
     * Get personality modifier for interaction
     * @param {Object} interaction - Interaction config
     * @param {Object} npc - Target NPC
     * @returns {Object} - Modifier object
     */
    getInteractionPersonalityModifier(interaction, npc) {
        const modifier = {
            successBonus: 0,
            opinionBonus: 0
        };

        if (!interaction.personalityModifiers || !npc.personalities) {
            return modifier;
        }

        for (const personality of npc.personalities) {
            const personalityId = typeof personality === 'string' ? personality : personality.id;

            if (interaction.personalityModifiers[personalityId]) {
                const mod = interaction.personalityModifiers[personalityId];
                modifier.successBonus += mod.successBonus || 0;
                modifier.opinionBonus += mod.opinionBonus || 0;
            }
        }

        return modifier;
    }

    /**
     * Get needs modifier for interaction
     * @param {Object} interaction - Interaction config
     * @param {Object} npc - Target NPC
     * @returns {number} - Success chance modifier
     */
    getInteractionNeedsModifier(interaction, npc) {
        let modifier = 0;

        if (!npc.needs || !this.interactionsConfig.globalModifiers?.needsEffects) {
            return modifier;
        }

        // Check critical needs
        for (const [needId, need] of Object.entries(npc.needs)) {
            const needEffects = this.interactionsConfig.globalModifiers.needsEffects[needId];
            if (!needEffects) continue;

            const percentage = (need.current / need.max) * 100;

            // Apply modifiers based on thresholds
            for (const [threshold, effect] of Object.entries(needEffects)) {
                const thresholdData = need.thresholds?.[threshold];
                if (thresholdData && percentage <= thresholdData.value) {
                    modifier += effect.allInteractions || 0;
                }
            }
        }

        return modifier;
    }

    /**
     * Decay relationships over time without interaction
     * @param {Object} npc - The NPC object
     * @param {number} currentTime - Current game time
     * @returns {Object} - Decay result
     */
    decayRelationships(npc, currentTime = Date.now()) {
        if (!npc.relationshipsDynamic) return { decayed: 0 };

        const decayThreshold = 168 * 3600000; // 7 days in milliseconds
        let decayedCount = 0;

        for (const [npcId, relationship] of Object.entries(npc.relationshipsDynamic)) {
            if (!relationship.lastInteraction) continue;

            const timeSinceInteraction = currentTime - relationship.lastInteraction;

            if (timeSinceInteraction > decayThreshold) {
                const oldOpinion = relationship.opinion;

                // Apply decay
                relationship.opinion += relationship.decayRate;
                relationship.opinion = Math.max(-100, relationship.opinion);
                relationship.opinion = Math.round(relationship.opinion);

                // Update relationship type
                relationship.relationshipType = this.getRelationshipType(
                    relationship.opinion,
                    relationship.romanceOpinion
                );

                if (oldOpinion !== relationship.opinion) {
                    decayedCount++;
                }
            }
        }

        return { decayed: decayedCount };
    }

    /**
     * Get relationship summary
     * @param {Object} npc - The NPC object
     * @param {number} currentTime - Current game time
     * @returns {Object} - Relationship summary
     */
    getRelationshipsSummary(npc, currentTime = Date.now()) {
        if (!npc.relationshipsDynamic) {
            return {
                total: 0,
                friends: 0,
                enemies: 0,
                romantic: 0,
                relationships: []
            };
        }

        const summary = {
            total: Object.keys(npc.relationshipsDynamic).length,
            friends: 0,
            enemies: 0,
            romantic: 0,
            relationships: []
        };

        for (const relationship of Object.values(npc.relationshipsDynamic)) {
            // Update opinion with current modifier values
            this.updateRelationshipOpinion(relationship, currentTime);

            summary.relationships.push({
                npcId: relationship.npcId,
                npcName: relationship.npcName,
                opinion: relationship.opinion,
                relationshipType: relationship.relationshipType,
                trustLevel: relationship.trustLevel
            });

            // Count relationship types
            if (relationship.relationshipType === 'friend' || relationship.relationshipType === 'close-friend') {
                summary.friends++;
            } else if (relationship.relationshipType === 'enemy' || relationship.relationshipType === 'rival') {
                summary.enemies++;
            } else if (relationship.relationshipType === 'romantic-interest' || relationship.relationshipType === 'lover') {
                summary.romantic++;
            }
        }

        // Sort by opinion
        summary.relationships.sort((a, b) => b.opinion - a.opinion);

        return summary;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCRelationshipDynamics;
}
