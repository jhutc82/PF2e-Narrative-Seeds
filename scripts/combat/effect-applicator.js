/**
 * Handles the application of mechanical effects from complications
 * to PF2e actors.
 */
export class EffectApplicator {
    /**
     * Apply a complication effect to an actor
     * @param {Actor} actor - The target actor
     * @param {Object} complication - The complication data
     * @returns {Promise<boolean>} Success status
     */
    static async applyComplication(actor, complication) {
        if (!actor) {
            ui.notifications.warn('No valid target for complication effect');
            return false;
        }

        const { effect, name, description, duration } = complication;

        try {
            switch (effect.type) {
                case 'condition':
                    return await this.applyCondition(actor, effect, name, description, duration);
                case 'persistent-damage':
                    return await this.applyPersistentDamage(actor, effect, name, description);
                case 'penalty':
                    return await this.applyPenalty(actor, effect, name, description, duration);
                case 'speed-penalty':
                    return await this.applySpeedPenalty(actor, effect, name, description, duration);
                default:
                    console.warn(`Unknown complication effect type: ${effect.type}`);
                    return false;
            }
        } catch (error) {
            console.error('PF2e Narrative Seeds | Failed to apply complication:', error);
            ui.notifications.error(`Failed to apply complication: ${name}`);
            return false;
        }
    }

    /**
     * Apply a PF2e condition to an actor
     * @param {Actor} actor - The target actor
     * @param {Object} effect - The effect data
     * @param {string} name - The complication name
     * @param {string} description - The complication description
     * @param {number} duration - Duration in rounds
     * @returns {Promise<boolean>} Success status
     */
    static async applyCondition(actor, effect, name, description, duration) {
        const condition = effect.condition;
        const value = effect.value || null;

        // Use PF2e's condition system
        try {
            // For conditions with values (like clumsy 1, stupefied 1)
            if (value !== null) {
                await game.pf2e.ConditionManager.addConditionToActor(condition, actor, { value });
            } else {
                await game.pf2e.ConditionManager.addConditionToActor(condition, actor);
            }

            // If duration is specified, we need to add expiry
            if (duration) {
                await this.addDurationToLastCondition(actor, condition, duration);
            }

            ui.notifications.info(`Applied ${name} to ${actor.name}`);
            return true;
        } catch (error) {
            console.error('Failed to apply condition:', error);
            // Fallback: create a custom effect item
            return await this.createCustomEffect(actor, name, description, duration, [
                {
                    key: 'PF2E.ConditionManager',
                    mode: 'add',
                    condition: condition,
                    value: value
                }
            ]);
        }
    }

    /**
     * Apply persistent damage to an actor
     * @param {Actor} actor - The target actor
     * @param {Object} effect - The effect data
     * @param {string} name - The complication name
     * @param {string} description - The complication description
     * @returns {Promise<boolean>} Success status
     */
    static async applyPersistentDamage(actor, effect, name, description) {
        const { damageType, value, dc } = effect;

        try {
            // Use PF2e's persistent damage condition
            const condition = await game.pf2e.ConditionManager.addConditionToActor('persistent-damage', actor);

            if (condition) {
                // Update with specific damage values
                // Note: PF2e handles persistent damage through its condition system
                ui.notifications.info(`Applied ${name} to ${actor.name}`);
                return true;
            }
        } catch (error) {
            console.error('Failed to apply persistent damage:', error);
        }

        // Fallback: create custom effect
        return await this.createCustomEffect(actor, name, description, null, [
            {
                key: 'system.attributes.persistentDamage',
                mode: 'add',
                value: {
                    formula: value,
                    damageType: damageType,
                    dc: dc
                }
            }
        ]);
    }

    /**
     * Apply a penalty to a stat
     * @param {Actor} actor - The target actor
     * @param {Object} effect - The effect data
     * @param {string} name - The complication name
     * @param {string} description - The complication description
     * @param {number} duration - Duration in rounds
     * @returns {Promise<boolean>} Success status
     */
    static async applyPenalty(actor, effect, name, description, duration) {
        const { stat, value } = effect;

        // Map stat names to PF2e paths
        const statPaths = {
            'ac': 'system.attributes.ac.modifier',
            'attack': 'system.attributes.attack.modifier'
        };

        const path = statPaths[stat];
        if (!path) {
            console.warn(`Unknown stat type: ${stat}`);
            return false;
        }

        return await this.createCustomEffect(actor, name, description, duration, [
            {
                key: path,
                mode: 'add',
                value: value
            }
        ]);
    }

    /**
     * Apply a speed penalty
     * @param {Actor} actor - The target actor
     * @param {Object} effect - The effect data
     * @param {string} name - The complication name
     * @param {string} description - The complication description
     * @param {number} duration - Duration in rounds
     * @returns {Promise<boolean>} Success status
     */
    static async applySpeedPenalty(actor, effect, name, description, duration) {
        const { value } = effect;

        return await this.createCustomEffect(actor, name, description, duration, [
            {
                key: 'system.attributes.speed.total',
                mode: 'add',
                value: value
            }
        ]);
    }

    /**
     * Create a custom effect item and add it to an actor
     * @param {Actor} actor - The target actor
     * @param {string} name - Effect name
     * @param {string} description - Effect description
     * @param {number|null} duration - Duration in rounds (null for persistent)
     * @param {Array} rules - Array of rule elements
     * @returns {Promise<boolean>} Success status
     */
    static async createCustomEffect(actor, name, description, duration, rules) {
        const effectData = {
            type: 'effect',
            name: `Complication: ${name}`,
            img: 'icons/svg/hazard.svg',
            system: {
                description: {
                    value: description
                },
                duration: duration ? {
                    value: duration,
                    unit: 'rounds',
                    sustained: false,
                    expiry: 'turn-end'
                } : {
                    value: -1,
                    unit: 'unlimited'
                },
                tokenIcon: {
                    show: true
                },
                rules: rules,
                slug: `complication-${name.toLowerCase().replace(/\s+/g, '-')}`,
                traits: {
                    value: ['complication']
                }
            }
        };

        try {
            await actor.createEmbeddedDocuments('Item', [effectData]);
            ui.notifications.info(`Applied ${name} to ${actor.name}`);
            return true;
        } catch (error) {
            console.error('Failed to create custom effect:', error);
            ui.notifications.error(`Failed to apply ${name}`);
            return false;
        }
    }

    /**
     * Add duration tracking to the most recently added condition
     * @param {Actor} actor - The target actor
     * @param {string} conditionSlug - The condition slug
     * @param {number} duration - Duration in rounds
     * @returns {Promise<void>}
     */
    static async addDurationToLastCondition(actor, conditionSlug, duration) {
        // Find the most recently added condition of this type
        const conditions = actor.itemTypes.condition.filter(c => c.slug === conditionSlug);
        if (conditions.length === 0) return;

        const lastCondition = conditions[conditions.length - 1];

        // Update with duration
        try {
            await lastCondition.update({
                'system.duration': {
                    value: duration,
                    unit: 'rounds',
                    expiry: 'turn-end'
                }
            });
        } catch (error) {
            console.warn('Could not set condition duration:', error);
        }
    }
}
