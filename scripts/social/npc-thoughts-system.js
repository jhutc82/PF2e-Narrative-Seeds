/**
 * NPC Thoughts System
 * Manages NPC thoughts/moodlets (Rimworld/Sims-style)
 */

class NPCThoughtsSystem {
    constructor() {
        this.thoughtsConfig = null;
        this.initialized = false;
    }

    /**
     * Initialize the thoughts system by loading configuration
     */
    async initialize() {
        if (this.initialized) return;

        try {
            const response = await fetch('modules/pf2e-narrative-seeds/data/social/npc/thoughts.json');
            this.thoughtsConfig = await response.json();
            this.initialized = true;
            console.log('NPC Thoughts System initialized');
        } catch (error) {
            console.error('Failed to initialize NPC Thoughts System:', error);
        }
    }

    /**
     * Initialize thoughts array for a new NPC
     * @param {Object} npc - The NPC object
     * @returns {Array} - Initialized thoughts array
     */
    initializeThoughts(npc) {
        return [];
    }

    /**
     * Add a thought to an NPC
     * @param {Object} npc - The NPC object
     * @param {string} thoughtId - Thought ID
     * @param {Object} context - Context data (e.g., {name: "Elena"})
     * @param {number} currentTime - Current game time in hours
     * @returns {Object} - Result object
     */
    addThought(npc, thoughtId, context = {}, currentTime = Date.now()) {
        if (!this.initialized) {
            console.error('Thoughts system not initialized');
            return { success: false, message: 'System not initialized' };
        }

        // Initialize thoughts array if it doesn't exist
        if (!npc.thoughts) {
            npc.thoughts = [];
        }

        // Find thought configuration
        const thoughtConfig = this.getThoughtConfig(thoughtId);
        if (!thoughtConfig) {
            console.error(`Thought config not found: ${thoughtId}`);
            return { success: false, message: 'Thought not found' };
        }

        // Check if thought is stackable
        if (!thoughtConfig.stackable) {
            // Remove existing thought of same type
            npc.thoughts = npc.thoughts.filter(t => t.id !== thoughtId);
        } else {
            // Check max stacks
            const existingStacks = npc.thoughts.filter(t => t.id === thoughtId).length;
            if (thoughtConfig.maxStacks && existingStacks >= thoughtConfig.maxStacks) {
                return {
                    success: false,
                    message: 'Max stacks reached',
                    existingStacks: existingStacks
                };
            }
        }

        // Apply personality modifiers to mood effect
        let moodEffect = thoughtConfig.moodEffect;
        if (thoughtConfig.personalityModifiers && npc.personalities) {
            for (const personality of npc.personalities) {
                const personalityId = typeof personality === 'string' ? personality : personality.id;
                if (thoughtConfig.personalityModifiers[personalityId] !== undefined) {
                    moodEffect = thoughtConfig.personalityModifiers[personalityId];
                }
            }
        }

        // Calculate duration in milliseconds
        let durationMs;
        if (thoughtConfig.duration === 'while-true') {
            durationMs = Infinity;
        } else if (thoughtConfig.duration === 'permanent') {
            durationMs = Infinity;
        } else {
            durationMs = thoughtConfig.duration * 3600000; // Convert hours to milliseconds
        }

        // Replace context placeholders in description
        let description = thoughtConfig.description;
        for (const [key, value] of Object.entries(context)) {
            description = description.replace(`{${key}}`, value);
        }

        // Create thought instance
        const thought = {
            id: thoughtId,
            name: thoughtConfig.name,
            description: description,
            category: thoughtConfig.category,
            moodEffect: moodEffect,
            icon: thoughtConfig.icon,
            timestamp: currentTime,
            duration: durationMs,
            expiresAt: durationMs === Infinity ? Infinity : currentTime + durationMs,
            decayType: thoughtConfig.decayType || 'none',
            persistent: thoughtConfig.persistent || false,
            context: context
        };

        npc.thoughts.push(thought);

        return {
            success: true,
            thought: thought,
            moodEffect: moodEffect
        };
    }

    /**
     * Remove a thought from an NPC
     * @param {Object} npc - The NPC object
     * @param {string} thoughtId - Thought ID
     * @param {boolean} removeAll - Remove all instances (for stackable thoughts)
     * @returns {Object} - Result object
     */
    removeThought(npc, thoughtId, removeAll = false) {
        if (!npc.thoughts) return { success: false, removed: 0 };

        const initialLength = npc.thoughts.length;

        if (removeAll) {
            npc.thoughts = npc.thoughts.filter(t => t.id !== thoughtId);
        } else {
            const index = npc.thoughts.findIndex(t => t.id === thoughtId);
            if (index !== -1) {
                npc.thoughts.splice(index, 1);
            }
        }

        const removed = initialLength - npc.thoughts.length;

        return {
            success: removed > 0,
            removed: removed
        };
    }

    /**
     * Update thoughts based on time elapsed
     * @param {Object} npc - The NPC object
     * @param {number} currentTime - Current game time
     * @returns {Object} - Update result
     */
    updateThoughts(npc, currentTime = Date.now()) {
        if (!npc.thoughts) {
            npc.thoughts = [];
            return { expired: [], remaining: 0 };
        }

        const expired = [];
        const remaining = [];

        for (const thought of npc.thoughts) {
            // Check if thought has expired
            if (thought.expiresAt !== Infinity && currentTime >= thought.expiresAt) {
                expired.push(thought);
            } else {
                remaining.push(thought);
            }
        }

        npc.thoughts = remaining;

        return {
            expired: expired,
            remaining: remaining.length,
            expiredCount: expired.length
        };
    }

    /**
     * Get current mood effect from a thought based on decay
     * @param {Object} thought - Thought object
     * @param {number} currentTime - Current game time
     * @returns {number} - Current mood effect
     */
    getThoughtMoodEffect(thought, currentTime = Date.now()) {
        if (!thought || thought.moodEffect === undefined) return 0;

        // No decay
        if (thought.decayType === 'none' || thought.duration === Infinity) {
            return thought.moodEffect;
        }

        const age = currentTime - thought.timestamp;
        const duration = thought.duration;

        if (age >= duration) return 0;

        const progress = age / duration;

        switch (thought.decayType) {
            case 'linear':
                // Linear decay: Effect decreases linearly over time
                return thought.moodEffect * (1 - progress);

            case 'exponential':
                // Exponential decay: Effect decreases rapidly at first, then slower
                return thought.moodEffect * Math.exp(-3 * progress);

            default:
                return thought.moodEffect;
        }
    }

    /**
     * Get total mood effect from all thoughts
     * @param {Object} npc - The NPC object
     * @param {number} currentTime - Current game time
     * @returns {number} - Total mood effect
     */
    getTotalThoughtsMoodEffect(npc, currentTime = Date.now()) {
        if (!npc.thoughts || npc.thoughts.length === 0) return 0;

        let total = 0;

        for (const thought of npc.thoughts) {
            total += this.getThoughtMoodEffect(thought, currentTime);
        }

        return Math.round(total);
    }

    /**
     * Get thoughts summary for display
     * @param {Object} npc - The NPC object
     * @param {number} currentTime - Current game time
     * @returns {Object} - Thoughts summary
     */
    getThoughtsSummary(npc, currentTime = Date.now()) {
        if (!npc.thoughts) return null;

        const summary = {
            total: npc.thoughts.length,
            moodEffect: 0,
            positive: [],
            negative: [],
            neutral: [],
            byCategory: {}
        };

        for (const thought of npc.thoughts) {
            const moodEffect = this.getThoughtMoodEffect(thought, currentTime);
            summary.moodEffect += moodEffect;

            const timeRemaining = thought.expiresAt === Infinity
                ? 'Permanent'
                : Math.max(0, Math.round((thought.expiresAt - currentTime) / 3600000)); // Hours

            const thoughtSummary = {
                ...thought,
                currentMoodEffect: Math.round(moodEffect),
                timeRemaining: timeRemaining
            };

            // Categorize by effect
            if (moodEffect > 0) {
                summary.positive.push(thoughtSummary);
            } else if (moodEffect < 0) {
                summary.negative.push(thoughtSummary);
            } else {
                summary.neutral.push(thoughtSummary);
            }

            // Group by category
            if (!summary.byCategory[thought.category]) {
                summary.byCategory[thought.category] = [];
            }
            summary.byCategory[thought.category].push(thoughtSummary);
        }

        // Sort by mood effect magnitude
        summary.positive.sort((a, b) => b.currentMoodEffect - a.currentMoodEffect);
        summary.negative.sort((a, b) => a.currentMoodEffect - b.currentMoodEffect);

        summary.moodEffect = Math.round(summary.moodEffect);

        return summary;
    }

    /**
     * Get thought configuration by ID
     * @param {string} thoughtId - Thought ID
     * @returns {Object|null} - Thought configuration
     */
    getThoughtConfig(thoughtId) {
        if (!this.thoughtsConfig) return null;

        for (const category of Object.values(this.thoughtsConfig.thoughts)) {
            if (category[thoughtId]) {
                return category[thoughtId];
            }
        }

        return null;
    }

    /**
     * Check if NPC has a specific thought
     * @param {Object} npc - The NPC object
     * @param {string} thoughtId - Thought ID
     * @returns {boolean} - True if NPC has the thought
     */
    hasThought(npc, thoughtId) {
        if (!npc.thoughts) return false;
        return npc.thoughts.some(t => t.id === thoughtId);
    }

    /**
     * Get all thoughts of a specific category
     * @param {Object} npc - The NPC object
     * @param {string} category - Category name
     * @returns {Array} - Array of thoughts in category
     */
    getThoughtsByCategory(npc, category) {
        if (!npc.thoughts) return [];
        return npc.thoughts.filter(t => t.category === category);
    }

    /**
     * Get the most impactful thoughts (positive and negative)
     * @param {Object} npc - The NPC object
     * @param {number} count - Number of thoughts to return
     * @param {number} currentTime - Current game time
     * @returns {Object} - Most impactful thoughts
     */
    getMostImpactfulThoughts(npc, count = 3, currentTime = Date.now()) {
        if (!npc.thoughts || npc.thoughts.length === 0) {
            return { positive: [], negative: [] };
        }

        const thoughtsWithEffect = npc.thoughts.map(thought => ({
            ...thought,
            currentEffect: this.getThoughtMoodEffect(thought, currentTime)
        }));

        const positive = thoughtsWithEffect
            .filter(t => t.currentEffect > 0)
            .sort((a, b) => b.currentEffect - a.currentEffect)
            .slice(0, count);

        const negative = thoughtsWithEffect
            .filter(t => t.currentEffect < 0)
            .sort((a, b) => a.currentEffect - b.currentEffect)
            .slice(0, count);

        return { positive, negative };
    }

    /**
     * Clear all thoughts from an NPC
     * @param {Object} npc - The NPC object
     * @param {boolean} persistentOnly - Only clear non-persistent thoughts
     * @returns {number} - Number of thoughts cleared
     */
    clearThoughts(npc, persistentOnly = false) {
        if (!npc.thoughts) return 0;

        const initialLength = npc.thoughts.length;

        if (persistentOnly) {
            npc.thoughts = npc.thoughts.filter(t => t.persistent);
        } else {
            npc.thoughts = [];
        }

        return initialLength - npc.thoughts.length;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCThoughtsSystem;
}
