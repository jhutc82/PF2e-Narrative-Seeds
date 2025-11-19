/**
 * Manages the selection and application of combat complications
 * for critical successes and critical failures.
 */
import { NarrativeSeedsSettings } from '../settings.js';

export class ComplicationManager {
    static complications = {
        criticalSuccess: [],
        criticalFailure: []
    };

    static initialized = false;
    static initializationFailed = false;

    /**
     * Initialize the complication manager by loading complication data
     */
    static async initialize() {
        if (this.initialized || this.initializationFailed) return;

        try {
            // Load critical success complications
            const critSuccessResponse = await fetch('modules/pf2e-narrative-seeds/data/combat/complications/critical-success.json');
            if (!critSuccessResponse.ok) {
                throw new Error(`Failed to load critical success complications: HTTP ${critSuccessResponse.status}`);
            }
            const critSuccessData = await critSuccessResponse.json();
            this.complications.criticalSuccess = critSuccessData.complications || [];

            // Load critical failure complications
            const critFailResponse = await fetch('modules/pf2e-narrative-seeds/data/combat/complications/critical-failure.json');
            if (!critFailResponse.ok) {
                throw new Error(`Failed to load critical failure complications: HTTP ${critFailResponse.status}`);
            }
            const critFailData = await critFailResponse.json();
            this.complications.criticalFailure = critFailData.complications || [];

            this.initialized = true;
            console.log('PF2e Narrative Seeds | Complication Manager initialized');
        } catch (error) {
            console.error('PF2e Narrative Seeds | Failed to initialize Complication Manager:', error);
            this.initializationFailed = true;
            // Ensure arrays are empty rather than null/undefined
            this.complications.criticalSuccess = [];
            this.complications.criticalFailure = [];
        }
    }

    /**
     * Determine if a complication should be generated for this attack
     * @param {Object} seed - The narrative seed
     * @returns {boolean} Whether to generate a complication
     */
    static shouldGenerateComplication(seed) {
        const { outcome } = seed;

        // Only generate complications for critical outcomes
        if (outcome !== 'criticalSuccess' && outcome !== 'criticalFailure') {
            return false;
        }

        // Check if complications are enabled in settings
        const enabled = NarrativeSeedsSettings.get('enableComplications', false);
        if (!enabled) {
            return false;
        }

        // Use complication chance from settings (0-100%)
        const chance = NarrativeSeedsSettings.get('complicationChance', 30);

        return Math.random() * 100 < chance;
    }

    /**
     * Select an appropriate complication based on the narrative seed context
     * @param {Object} seed - The narrative seed containing context
     * @returns {Object|null} The selected complication or null
     */
    static selectComplication(seed) {
        if (!this.initialized) {
            console.warn('PF2e Narrative Seeds | Complication Manager not initialized');
            return null;
        }

        if (!this.shouldGenerateComplication(seed)) {
            return null;
        }

        const { outcome, damageType, anatomy, creatureType } = seed;
        const availableComplications = this.complications[outcome];

        // Validate that complications array exists and has items
        if (!Array.isArray(availableComplications) || availableComplications.length === 0) {
            console.warn(`PF2e Narrative Seeds | No complications available for outcome: ${outcome}`);
            return null;
        }

        // Filter complications based on context
        const applicableComplications = availableComplications.filter(comp => {
            return this.isApplicable(comp, damageType, anatomy, creatureType);
        });

        if (applicableComplications.length === 0) {
            // Fall back to any complication if none match the context
            return this.weightedRandom(availableComplications);
        }

        // Select a complication using weighted randomization
        return this.weightedRandom(applicableComplications);
    }

    /**
     * Check if a complication is applicable to the current context
     * @param {Object} complication - The complication to check
     * @param {string} damageType - The damage type of the attack
     * @param {string|Object} anatomy - Anatomy object {base, modifiers} or string for backwards compat
     * @param {string} creatureType - DEPRECATED: Use anatomy object instead
     * @returns {boolean} Whether the complication applies
     */
    static isApplicable(complication, damageType, anatomy, creatureType = null) {
        const { applicableContexts } = complication;

        if (!applicableContexts) {
            return true; // No restrictions
        }

        // Check damage type
        if (applicableContexts.damageTypes &&
            !applicableContexts.damageTypes.includes('any') &&
            !applicableContexts.damageTypes.includes(damageType)) {
            return false;
        }

        // Extract base and modifiers from anatomy
        const anatomyBase = typeof anatomy === 'string' ? anatomy : anatomy?.base || 'humanoid';
        const anatomyModifiers = typeof anatomy === 'object' && Array.isArray(anatomy?.modifiers) ? anatomy.modifiers : [];

        // Check creature type (check both base anatomy AND modifiers)
        if (applicableContexts.creatureTypes) {
            if (!applicableContexts.creatureTypes.includes('any')) {
                // Map skeletal modifier to skeleton for matching
                const modifiersForMatching = anatomyModifiers.map(m => m === 'skeletal' ? 'skeleton' : m);

                const matchesBase = applicableContexts.creatureTypes.includes(anatomyBase);
                const matchesModifier = modifiersForMatching.some(m => applicableContexts.creatureTypes.includes(m));

                if (!matchesBase && !matchesModifier) {
                    return false;
                }
            }
        }

        // Check anatomy (hit location or creature type for backwards compatibility)
        if (applicableContexts.anatomyTypes &&
            !applicableContexts.anatomyTypes.includes('any') &&
            !applicableContexts.anatomyTypes.includes(anatomyBase)) {
            return false;
        }

        return true;
    }

    /**
     * Select a random item from an array using weights
     * @param {Array} items - Array of items with weight property
     * @returns {Object|null} The selected item or null
     */
    static weightedRandom(items) {
        if (!items || items.length === 0) {
            return null;
        }

        const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);

        // Edge case: all items have weight 0
        if (totalWeight === 0) {
            console.warn('PF2e Narrative Seeds | All items have weight 0, selecting random item');
            return items[Math.floor(Math.random() * items.length)];
        }

        let random = Math.random() * totalWeight;

        for (const item of items) {
            random -= (item.weight || 1);
            if (random <= 0) {
                return item;
            }
        }

        // Fallback for floating point precision issues
        return items[0];
    }

    /**
     * Get the target actor for a complication (target for crit success, attacker for crit fail)
     * @param {Object} attackData - The attack data
     * @param {string} outcome - The outcome type
     * @returns {Actor|null} The target actor for the complication
     */
    static getComplicationTarget(attackData, outcome) {
        if (outcome === 'criticalSuccess') {
            // Apply to the target of the attack
            return attackData.target;
        } else if (outcome === 'criticalFailure') {
            // Apply to the attacker
            return attackData.actor;
        }
        return null;
    }

    /**
     * Get a user-friendly description of the complication target
     * @param {string} outcome - The outcome type
     * @returns {string} Description of who the complication affects
     */
    static getTargetDescription(outcome) {
        if (outcome === 'criticalSuccess') {
            return 'target';
        } else if (outcome === 'criticalFailure') {
            return 'attacker';
        }
        return 'character';
    }
}
