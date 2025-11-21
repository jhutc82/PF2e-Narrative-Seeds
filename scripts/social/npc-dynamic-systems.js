/**
 * NPC Dynamic Systems - Main Integration Module
 * Provides easy initialization and access to all dynamic NPC systems
 * (Needs, Thoughts, Mood, Relationships, Behavior)
 */

// Import all systems (will be loaded via HTML script tags in practice)
// These are just class definitions, actual initialization happens in initialize()

class NPCDynamicSystems {
    constructor() {
        this.needsSystem = null;
        this.thoughtsSystem = null;
        this.moodCalculator = null;
        this.relationshipDynamics = null;
        this.behaviorEngine = null;
        this.timeManager = null;
        this.influenceIntegration = null;
        this.initialized = false;
    }

    /**
     * Initialize all systems
     * @returns {Promise<boolean>} - Success status
     */
    async initialize() {
        if (this.initialized) {
            console.log('NPC Dynamic Systems already initialized');
            return true;
        }

        try {
            console.log('Initializing NPC Dynamic Systems...');

            // Create system instances
            this.needsSystem = new NPCNeedsSystem();
            this.thoughtsSystem = new NPCThoughtsSystem();
            this.moodCalculator = new NPCMoodCalculator(this.needsSystem, this.thoughtsSystem);
            this.relationshipDynamics = new NPCRelationshipDynamics(this.thoughtsSystem);
            this.behaviorEngine = new NPCBehaviorEngine(this.needsSystem);
            this.timeManager = new NPCTimeManager(
                this.needsSystem,
                this.thoughtsSystem,
                this.moodCalculator,
                this.relationshipDynamics,
                this.behaviorEngine
            );
            this.influenceIntegration = new NPCInfluenceIntegration(this);

            // Initialize all systems in parallel
            await Promise.all([
                this.needsSystem.initialize(),
                this.thoughtsSystem.initialize(),
                this.moodCalculator.initialize(),
                this.relationshipDynamics.initialize(),
                this.behaviorEngine.initialize()
            ]);

            this.initialized = true;
            console.log('✓ NPC Dynamic Systems initialized successfully');

            return true;
        } catch (error) {
            console.error('Failed to initialize NPC Dynamic Systems:', error);
            return false;
        }
    }

    /**
     * Initialize an NPC with dynamic systems
     * @param {Object} npc - The NPC object
     * @returns {Object} - NPC with initialized systems
     */
    initializeNPC(npc) {
        if (!this.initialized) {
            console.error('Systems not initialized');
            return npc;
        }

        // Initialize needs if not already present
        if (!npc.needs) {
            npc.needs = this.needsSystem.initializeNeeds(npc);
        }

        // Initialize thoughts array if not present
        if (!npc.thoughts) {
            npc.thoughts = [];
        }

        // Initialize dynamic relationships if not present
        if (!npc.relationshipsDynamic) {
            npc.relationshipsDynamic = {};
        }

        // Initialize mood history if not present
        if (!npc.moodHistory) {
            npc.moodHistory = [];
        }

        // Set last update timestamp
        npc.lastDynamicUpdate = Date.now();

        return npc;
    }

    /**
     * Get comprehensive NPC status
     * @param {Object} npc - The NPC object
     * @param {Object} context - Additional context
     * @returns {Object} - Complete status object
     */
    getStatus(npc, context = {}) {
        if (!this.initialized) return null;

        // Ensure NPC is initialized
        this.initializeNPC(npc);

        const currentTime = this.timeManager.getGameTime();

        return {
            // Basic info
            name: npc.name,
            ancestry: npc.ancestry,

            // Needs
            needs: this.needsSystem.getNeedsSummary(npc),

            // Mood
            mood: this.moodCalculator.getMoodSummary(npc, context, currentTime),

            // Thoughts
            thoughts: this.thoughtsSystem.getThoughtsSummary(npc, currentTime),

            // Relationships
            relationships: this.relationshipDynamics.getRelationshipsSummary(npc, currentTime),

            // Behavior
            behavior: this.behaviorEngine.getBehaviorSummary(npc, {
                timeOfDay: this.timeManager.getTimeOfDay(),
                dayType: this.timeManager.getDayType()
            }),

            // Time
            gameTime: this.timeManager.getFormattedGameTime(),
            lastUpdate: npc.lastDynamicUpdate
        };
    }

    /**
     * Update an NPC over time
     * @param {Object} npc - The NPC object
     * @param {number} hoursElapsed - Hours elapsed
     * @param {Object} context - Additional context
     * @returns {Object} - Update result
     */
    updateNPC(npc, hoursElapsed, context = {}) {
        if (!this.initialized) return null;

        this.initializeNPC(npc);

        return this.timeManager.updateNPC(npc, hoursElapsed, context);
    }

    /**
     * Update all NPCs
     * @param {Array} npcs - Array of NPCs
     * @param {number} hoursElapsed - Hours elapsed
     * @param {Object} context - Additional context
     * @returns {Object} - Update results
     */
    updateAllNPCs(npcs, hoursElapsed, context = {}) {
        if (!this.initialized) return null;

        return this.timeManager.updateNPCs(npcs, hoursElapsed, context);
    }

    /**
     * Process social interaction between party member and NPC
     * @param {Object} initiator - Initiating character
     * @param {Object} targetNpc - Target NPC
     * @param {string} interactionId - Interaction type
     * @param {Object} skillCheck - Skill check result {skill, dc, passed}
     * @returns {Object} - Interaction result
     */
    processSocialInteraction(initiator, targetNpc, interactionId, skillCheck = {}) {
        if (!this.initialized) return null;

        this.initializeNPC(targetNpc);

        const currentTime = this.timeManager.getGameTime();

        // Get target's current mood for context
        const targetMood = this.moodCalculator.calculateMood(targetNpc, {}, currentTime);

        // Process the interaction
        const result = this.relationshipDynamics.processSocialInteraction(
            initiator,
            targetNpc,
            interactionId,
            {
                targetMood: targetMood.mood,
                skillCheckPassed: skillCheck.passed || false
            },
            currentTime
        );

        // Satisfy needs if interaction provides satisfaction
        if (result.needsSatisfied) {
            for (const [needId, amount] of Object.entries(result.needsSatisfied)) {
                this.needsSystem.satisfyNeed(targetNpc, needId, amount);
            }
        }

        return result;
    }

    /**
     * Add a thought to an NPC
     * @param {Object} npc - The NPC object
     * @param {string} thoughtId - Thought ID
     * @param {Object} context - Context data
     * @returns {Object} - Result
     */
    addThought(npc, thoughtId, context = {}) {
        if (!this.initialized) return null;

        this.initializeNPC(npc);

        return this.thoughtsSystem.addThought(
            npc,
            thoughtId,
            context,
            this.timeManager.getGameTime()
        );
    }

    /**
     * Satisfy an NPC's need
     * @param {Object} npc - The NPC object
     * @param {string} needId - Need ID
     * @param {number} amount - Amount to satisfy
     * @param {string} methodId - Method ID (optional)
     * @returns {Object} - Result
     */
    satisfyNeed(npc, needId, amount, methodId = null) {
        if (!this.initialized) return null;

        this.initializeNPC(npc);

        const result = this.needsSystem.satisfyNeed(npc, needId, amount, methodId);

        // Add thoughts from satisfaction method
        if (result.thoughts && result.thoughts.length > 0) {
            for (const thoughtId of result.thoughts) {
                this.addThought(npc, thoughtId, {});
            }
        }

        return result;
    }

    /**
     * Get what an NPC currently desires to do
     * @param {Object} npc - The NPC object
     * @returns {Object} - Current desire
     */
    getCurrentDesire(npc) {
        if (!this.initialized) return null;

        this.initializeNPC(npc);

        return this.behaviorEngine.getCurrentDesire(npc, {
            timeOfDay: this.timeManager.getTimeOfDay(),
            dayType: this.timeManager.getDayType()
        });
    }

    /**
     * Get social interaction DC for an NPC
     * @param {Object} npc - The NPC object
     * @param {Object} context - Additional context
     * @returns {number} - Social DC
     */
    getSocialDC(npc, context = {}) {
        if (!this.initialized) return 15;

        this.initializeNPC(npc);

        return this.moodCalculator.getSocialDC(npc, context, this.timeManager.getGameTime());
    }

    /**
     * Get PF2e attitude for an NPC
     * @param {Object} npc - The NPC object
     * @param {Object} context - Additional context
     * @returns {string} - Attitude (hostile, unfriendly, indifferent, friendly, helpful)
     */
    getAttitude(npc, context = {}) {
        if (!this.initialized) return 'indifferent';

        this.initializeNPC(npc);

        return this.moodCalculator.getAttitude(npc, context, this.timeManager.getGameTime());
    }

    /**
     * Advance game time
     * @param {number} hours - Hours to advance
     * @param {Array} npcs - NPCs to update
     * @param {Object} context - Additional context
     * @returns {Object} - Update results
     */
    advanceTime(hours, npcs, context = {}) {
        if (!this.initialized) return null;

        return this.timeManager.advanceTime(hours, npcs, context);
    }

    /**
     * Start automatic time progression
     * @param {Array} npcs - NPCs to update
     * @param {Object} context - Context
     * @param {number} updateInterval - Update interval in ms
     */
    startAutomaticUpdates(npcs, context = {}, updateInterval = 60000) {
        if (!this.initialized) return;

        this.timeManager.startAutomaticUpdates(npcs, context, updateInterval);
    }

    /**
     * Stop automatic time progression
     */
    stopAutomaticUpdates() {
        if (!this.initialized) return;

        this.timeManager.stopAutomaticUpdates();
    }

    /**
     * Set time scale
     * @param {number} scale - Time scale multiplier
     */
    setTimeScale(scale) {
        if (!this.initialized) return;

        this.timeManager.setTimeScale(scale);
    }

    /**
     * Get update summary for all NPCs
     * @param {Array} npcs - Array of NPCs
     * @param {Object} context - Context
     * @returns {Object} - Summary
     */
    getUpdateSummary(npcs, context = {}) {
        if (!this.initialized) return null;

        return this.timeManager.getUpdateSummary(npcs, context);
    }

    // ===== PF2e INFLUENCE SYSTEM INTEGRATION =====

    /**
     * Calculate dynamic Influence DC for PF2e Influence subsystem
     * Integrates mood, needs, thoughts, and relationships
     * @param {Object} npc - The NPC object
     * @param {string} skill - Skill being used to Influence
     * @param {Object} initiator - PC attempting to influence
     * @param {number} baseDC - Base DC from influence stat block
     * @returns {Object} - Modified DC with breakdown
     */
    calculateInfluenceDC(npc, skill, initiator = null, baseDC = 15) {
        if (!this.initialized || !this.influenceIntegration) {
            return { finalDC: baseDC, modifiers: [] };
        }

        this.initializeNPC(npc);
        return this.influenceIntegration.calculateInfluenceDC(npc, skill, initiator, baseDC);
    }

    /**
     * Process PF2e Influence action
     * @param {Object} npc - The NPC object
     * @param {Object} initiator - PC attempting to influence
     * @param {string} skill - Skill being used
     * @param {number} rollResult - Total of skill check
     * @param {number} baseDC - Base DC from influence stat block
     * @returns {Object} - Influence result with Influence Points
     */
    processInfluence(npc, initiator, skill, rollResult, baseDC = 15) {
        if (!this.initialized || !this.influenceIntegration) return null;

        this.initializeNPC(npc);
        return this.influenceIntegration.processInfluence(npc, initiator, skill, rollResult, baseDC);
    }

    /**
     * Process PF2e Discovery action
     * Allows discovering dynamic state information about NPC
     * @param {Object} npc - The NPC object
     * @param {Object} initiator - PC attempting discovery
     * @param {number} rollResult - Perception or skill check result
     * @param {number} baseDC - Base DC from influence stat block
     * @returns {Object} - Discovery result with available information
     */
    processDiscovery(npc, initiator, rollResult, baseDC = 13) {
        if (!this.initialized || !this.influenceIntegration) return null;

        this.initializeNPC(npc);
        return this.influenceIntegration.processDiscovery(npc, initiator, rollResult, baseDC);
    }

    /**
     * Create complete PF2e influence stat block with dynamic modifiers
     * @param {Object} npc - The NPC object
     * @param {Object} influenceData - Base influence data from NPC generation
     * @param {Object} initiator - PC for relationship-based modifiers (optional)
     * @returns {Object} - Complete influence stat block
     */
    createInfluenceStatBlock(npc, influenceData, initiator = null) {
        if (!this.initialized || !this.influenceIntegration) return influenceData;

        this.initializeNPC(npc);
        return this.influenceIntegration.createInfluenceStatBlock(npc, influenceData, initiator);
    }
}

// Create global instance
const npcDynamicSystems = new NPCDynamicSystems();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NPCDynamicSystems, npcDynamicSystems };
}
