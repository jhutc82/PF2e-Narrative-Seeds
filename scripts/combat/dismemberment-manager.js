/**
 * Manages the selection and application of dismemberment effects
 * for devastating critical hits.
 */
export class DismembermentManager {
    static dismemberments = [];
    static initialized = false;

    /**
     * Initialize the dismemberment manager by loading dismemberment data
     */
    static async initialize() {
        if (this.initialized) return;

        try {
            // Load dismemberment data
            const response = await fetch('modules/pf2e-narrative-seeds/data/combat/dismemberment/dismemberments.json');
            const data = await response.json();
            this.dismemberments = data.dismemberments;

            this.initialized = true;
            console.log('PF2e Narrative Seeds | Dismemberment Manager initialized');
        } catch (error) {
            console.error('PF2e Narrative Seeds | Failed to initialize Dismemberment Manager:', error);
        }
    }

    /**
     * Check if dismemberment conditions are met
     * @param {Object} attackData - Attack data including damage, target, etc.
     * @param {string} outcome - Attack outcome
     * @returns {boolean} Whether dismemberment check should occur
     */
    static shouldCheckDismemberment(attackData, outcome) {
        // Only on critical success
        if (outcome !== 'criticalSuccess') {
            return false;
        }

        // Check if dismemberment is enabled
        const enabled = game.settings.get('pf2e-narrative-seeds', 'enableDismemberment');
        if (!enabled) {
            return false;
        }

        const target = attackData.target;
        if (!target) {
            return false;
        }

        // Get target HP info
        const currentHP = target.system?.attributes?.hp?.value || 0;
        const maxHP = target.system?.attributes?.hp?.max || 0;

        // Check if target is unconscious (dying or unconscious condition)
        const isUnconscious = target.hasCondition?.('unconscious') ||
                             target.hasCondition?.('dying') ||
                             currentHP <= 0;

        // NEW LOGIC: Check damage amount if available
        // Dismemberment triggers on critical hit IF:
        // 1. Target is unconscious/dying, OR
        // 2. Damage dealt is >= 50% of target's max HP
        const damageAmount = attackData.damageAmount || 0;
        const damageThreshold = maxHP * 0.5;
        const isHighDamage = damageAmount >= damageThreshold && maxHP > 0;

        console.log(`PF2e Narrative Seeds | Dismemberment check: unconscious=${isUnconscious}, damage=${damageAmount}/${damageThreshold} (${maxHP} max HP), highDamage=${isHighDamage}`);

        // Trigger dismemberment check if either condition is met
        return isUnconscious || isHighDamage;
    }

    /**
     * Extract damage dealt from message
     * @param {ChatMessage} message - The chat message
     * @returns {number} Damage dealt
     */
    static extractDamage(message) {
        try {
            // Try to get damage from PF2e flags
            const damage = message.flags?.pf2e?.context?.damage;
            if (damage && typeof damage === 'number') {
                return damage;
            }

            // Try to extract from rolls
            if (message.rolls && message.rolls.length > 0) {
                // Look for damage roll (usually has damage in formula)
                for (const roll of message.rolls) {
                    if (roll.total && roll.formula?.includes('d')) {
                        return roll.total;
                    }
                }
            }

            return 0;
        } catch (error) {
            console.warn('Could not extract damage from message:', error);
            return 0;
        }
    }

    /**
     * Calculate dismemberment chance based on level
     * @param {Actor} target - The target actor
     * @returns {number} Percentage chance (0-100)
     */
    static calculateDismembermentChance(target) {
        const baseChance = game.settings.get('pf2e-narrative-seeds', 'dismembermentBaseChance');
        const levelScaling = game.settings.get('pf2e-narrative-seeds', 'dismembermentLevelScaling');
        const maxChance = game.settings.get('pf2e-narrative-seeds', 'dismembermentMaxChance');

        const targetLevel = target.system?.details?.level?.value || 0;

        // Calculate: base + (level * scaling)
        let chance = baseChance + (targetLevel * levelScaling);

        // Cap at max
        chance = Math.min(chance, maxChance);

        return chance;
    }

    /**
     * Determine if a dismemberment should occur
     * @param {Object} attackData - Attack data
     * @param {Object} seed - Narrative seed with anatomy info
     * @returns {Object|null} The dismemberment to apply, or null
     */
    static selectDismemberment(attackData, seed) {
        if (!this.initialized) {
            console.warn('PF2e Narrative Seeds | Dismemberment Manager not initialized');
            return null;
        }

        const { target } = attackData;
        const { outcome } = seed;

        console.log('PF2e Narrative Seeds | Dismemberment check:', {
            outcome,
            targetName: target?.name,
            targetLevel: target?.system?.details?.level?.value
        });

        // Check if conditions are met
        if (!this.shouldCheckDismemberment(attackData, outcome)) {
            console.log('PF2e Narrative Seeds | Dismemberment conditions not met');
            return null;
        }

        // Calculate chance
        const chance = this.calculateDismembermentChance(target);

        // Roll for dismemberment
        const roll = Math.random() * 100;
        console.log('PF2e Narrative Seeds | Dismemberment roll:', {
            roll: roll.toFixed(2),
            chance: chance.toFixed(2),
            success: roll < chance
        });

        if (roll >= chance) {
            return null; // No dismemberment
        }

        // Select appropriate dismemberment based on anatomy
        const { damageType, anatomy } = seed;
        const anatomyString = typeof anatomy === 'string' ? anatomy : anatomy?.base || 'torso';

        console.log('PF2e Narrative Seeds | Looking for dismemberments for:', {
            damageType,
            anatomy: anatomyString,
            totalDismemberments: this.dismemberments.length
        });

        // Filter dismemberments by context
        const applicableDismemberments = this.dismemberments.filter(dismemberment => {
            return this.isApplicable(dismemberment, damageType, anatomyString);
        });

        console.log('PF2e Narrative Seeds | Found applicable dismemberments:', applicableDismemberments.length);

        if (applicableDismemberments.length === 0) {
            // No applicable dismemberments for this location/damage type
            console.warn('PF2e Narrative Seeds | No applicable dismemberments found!');
            return null;
        }

        // Prefer higher severity for more devastating hits
        // But still allow lower severity options
        const severityWeights = {
            'moderate': 40,
            'severe': 30,
            'critical': 20,
            'catastrophic': 10
        };

        // Calculate weighted selection
        const weightedDismemberments = applicableDismemberments.map(d => ({
            ...d,
            weight: severityWeights[d.severity] || 25
        }));

        return this.weightedRandom(weightedDismemberments);
    }

    /**
     * Check if a dismemberment is applicable to the current context
     * @param {Object} dismemberment - The dismemberment to check
     * @param {string} damageType - The damage type of the attack
     * @param {string} anatomy - The anatomy location hit
     * @returns {boolean} Whether the dismemberment applies
     */
    static isApplicable(dismemberment, damageType, anatomy) {
        const { applicableContexts } = dismemberment;

        if (!applicableContexts) {
            return true; // No restrictions
        }

        // Check damage type
        if (applicableContexts.damageTypes &&
            !applicableContexts.damageTypes.includes('any') &&
            !applicableContexts.damageTypes.includes(damageType)) {
            return false;
        }

        // Check anatomy - need to match the anatomy location
        // The anatomy from the seed might be 'arms', 'legs', 'head', etc.
        // The dismemberment location might be 'hand', 'arm', 'foot', 'leg', 'eye', etc.
        if (applicableContexts.anatomyTypes) {
            // Check if the seed anatomy matches any of the applicable anatomies
            const matches = applicableContexts.anatomyTypes.some(applicableAnatomy => {
                // Direct match
                if (anatomy === applicableAnatomy) return true;

                // Normalize for plural/singular comparison (e.g., 'arms' vs 'arm')
                const normalizedAnatomy = anatomy.replace(/s$/, '');
                const normalizedApplicable = applicableAnatomy.replace(/s$/, '');

                if (normalizedAnatomy === normalizedApplicable) return true;

                // Word boundary match to prevent false positives (e.g., 'harms' vs 'arm')
                const anatomyWords = anatomy.split(/\s+/);
                const applicableWords = applicableAnatomy.split(/\s+/);

                return anatomyWords.some(word => applicableWords.includes(word)) ||
                       applicableWords.some(word => anatomyWords.includes(word));
            });

            if (!matches) {
                return false;
            }
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
        let random = Math.random() * totalWeight;

        for (const item of items) {
            random -= (item.weight || 1);
            if (random <= 0) {
                return item;
            }
        }

        return items[0]; // Fallback
    }

    /**
     * Get user-friendly warning text for dismemberment
     * @param {Object} dismemberment - The dismemberment
     * @returns {string} Warning text
     */
    static getWarningText(dismemberment) {
        const severityText = {
            'moderate': 'PERMANENT INJURY',
            'severe': 'SEVERE PERMANENT INJURY',
            'critical': 'CRITICAL PERMANENT INJURY',
            'catastrophic': 'CATASTROPHIC PERMANENT INJURY'
        };

        return severityText[dismemberment.severity] || 'PERMANENT INJURY';
    }

    /**
     * Get the target for dismemberment (always the target of the attack)
     * @param {Object} attackData - The attack data
     * @returns {Actor|null} The target actor
     */
    static getDismembermentTarget(attackData) {
        return attackData.target;
    }
}
