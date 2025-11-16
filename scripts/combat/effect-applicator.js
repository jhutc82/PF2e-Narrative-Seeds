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

    /**
     * Apply a permanent dismemberment effect to an actor
     * @param {Actor} actor - The target actor
     * @param {Object} dismemberment - The dismemberment data
     * @returns {Promise<boolean>} Success status
     */
    static async applyDismemberment(actor, dismemberment) {
        if (!actor) {
            ui.notifications.warn('No valid target for dismemberment effect');
            return false;
        }

        const { name, description, effects } = dismemberment;

        try {
            // Create a permanent effect item for the dismemberment
            const rules = [];

            // Process all effects
            for (const effect of effects) {
                // Add permanent conditions
                if (effect.conditions) {
                    for (const condition of effect.conditions) {
                        // Apply PF2e condition if it's a standard one
                        if (['blinded', 'deafened'].includes(condition)) {
                            try {
                                await game.pf2e.ConditionManager.addConditionToActor(condition, actor);
                            } catch (error) {
                                console.warn(`Could not apply condition ${condition}:`, error);
                            }
                        }
                    }
                }

                // Add penalties as rule elements
                if (effect.penalties) {
                    for (const penalty of effect.penalties) {
                        const rule = {
                            key: 'FlatModifier',
                            selector: this.mapStatToSelector(penalty.stat),
                            value: penalty.value,
                            type: penalty.type || 'circumstance',
                            label: penalty.condition || name
                        };
                        rules.push(rule);
                    }
                }

                // Add speed modifiers
                if (effect.modifiers) {
                    for (const modifier of effect.modifiers) {
                        if (modifier.type === 'speed-reduction') {
                            rules.push({
                                key: 'FlatModifier',
                                selector: 'speed',
                                value: -modifier.value,
                                type: 'untyped'
                            });
                        } else if (modifier.type === 'speed-override') {
                            rules.push({
                                key: 'BaseSpeed',
                                selector: 'land-speed',
                                value: modifier.value
                            });
                        } else if (modifier.type === 'fly-speed-reduction') {
                            rules.push({
                                key: 'FlatModifier',
                                selector: 'fly-speed',
                                value: -Math.floor(actor.system?.attributes?.speed?.fly || 0) * (modifier.value / 100),
                                type: 'untyped'
                            });
                        } else if (modifier.type === 'fly-speed-override') {
                            rules.push({
                                key: 'BaseSpeed',
                                selector: 'fly',
                                value: modifier.value
                            });
                        }
                    }
                }
            }

            // Create the permanent effect
            const effectData = {
                type: 'effect',
                name: `Dismemberment: ${name}`,
                img: 'icons/svg/blood.svg',
                system: {
                    description: {
                        value: `<p><strong>PERMANENT INJURY</strong></p><p>${description}</p>${effects.map(e => `<p>${e.description}</p>`).join('')}`
                    },
                    duration: {
                        value: -1,
                        unit: 'unlimited',
                        sustained: false,
                        expiry: null
                    },
                    tokenIcon: {
                        show: true
                    },
                    rules: rules,
                    slug: `dismemberment-${name.toLowerCase().replace(/\s+/g, '-')}`,
                    traits: {
                        value: ['dismemberment', 'permanent']
                    },
                    badge: {
                        type: 'counter',
                        value: null
                    }
                }
            };

            await actor.createEmbeddedDocuments('Item', [effectData]);

            ui.notifications.warn(`${actor.name} has suffered a permanent injury: ${name}`);

            // Also send a chat message to highlight this major event
            await ChatMessage.create({
                content: `<div style="background: #8b0000; border: 2px solid #ff0000; padding: 10px; border-radius: 5px; color: #fff;">
                    <h3 style="margin: 0 0 5px 0; color: #ff0000;">💀 PERMANENT INJURY 💀</h3>
                    <p style="margin: 0;"><strong>${actor.name}</strong> has suffered: <strong>${name}</strong></p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">${description}</p>
                </div>`,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                whisper: game.users.filter(u => u.isGM).map(u => u.id)
            });

            return true;
        } catch (error) {
            console.error('PF2e Narrative Seeds | Failed to apply dismemberment:', error);
            ui.notifications.error(`Failed to apply dismemberment: ${name}`);
            return false;
        }
    }

    /**
     * Map stat names to PF2e selectors
     * @param {string} stat - Stat name
     * @returns {string} PF2e selector
     */
    static mapStatToSelector(stat) {
        const selectorMap = {
            'ac': 'ac',
            'attack': 'attack-roll',
            'perception': 'perception',
            'athletics': 'athletics',
            'acrobatics': 'acrobatics',
            'thievery': 'thievery',
            'speed': 'speed'
        };

        return selectorMap[stat] || stat;
    }
}
