/**
 * NPC Influence Integration
 * Bridges PF2e Influence system with dynamic NPC systems
 */

class NPCInfluenceIntegration {
    constructor(dynamicSystems) {
        this.dynamicSystems = dynamicSystems;

        // PF2e level-based DC table (GM Core pg. 52)
        this.levelDCs = {
            0: 14, 1: 15, 2: 16, 3: 18, 4: 19, 5: 20,
            6: 22, 7: 23, 8: 24, 9: 26, 10: 27, 11: 28,
            12: 30, 13: 31, 14: 32, 15: 34, 16: 35, 17: 36,
            18: 38, 19: 39, 20: 40, 21: 42, 22: 44, 23: 46,
            24: 48, 25: 50
        };

        // PF2e DC adjustments (GM Core pg. 52)
        this.adjustments = {
            'incredibly-easy': -10,
            'very-easy': -5,
            'easy': -2,
            'normal': 0,
            'hard': 2,
            'very-hard': 5,
            'incredibly-hard': 10
        };
    }

    /**
     * Calculate dynamic Influence DC for an NPC
     * Integrates mood, needs, thoughts, and relationships into PF2e Influence DCs
     *
     * @param {Object} npc - The NPC object
     * @param {string} skill - Skill being used to Influence
     * @param {Object} initiator - PC attempting to influence (optional)
     * @param {number} baseDC - Base DC from influence stat block
     * @returns {Object} - Modified DC and modifiers breakdown
     */
    calculateInfluenceDC(npc, skill, initiator = null, baseDC = null) {
        if (!this.dynamicSystems || !this.dynamicSystems.initialized) {
            return { finalDC: baseDC || 15, modifiers: [], adjustments: [] };
        }

        // Use level-based DC if no baseDC provided (PF2e GM Core pg. 52)
        if (baseDC === null) {
            const npcLevel = npc.abilities?.level || 0;
            baseDC = this.getLevelBasedDC(npcLevel);
        }

        const modifiers = [];
        const adjustments = []; // Track PF2e-style adjustments
        let totalAdjustment = 0;

        // 1. Attitude (from mood) affects base DC using PF2e rules
        // PF2e: Social skills use easy DC for friendly, very easy for helpful,
        // hard for unfriendly, very hard for hostile (GM Core pg. 55)
        const moodData = this.dynamicSystems.moodCalculator.calculateMood(npc, {}, Date.now());
        const attitude = moodData.mood.attitude;
        const attitudeAdj = this.getMoodInfluenceAdjustment(moodData.score, attitude);

        adjustments.push({
            type: 'attitude',
            label: attitudeAdj.label,
            value: attitudeAdj.adjustment,
            description: `${attitudeAdj.description} (${moodData.mood.name}, score: ${moodData.score})`
        });
        totalAdjustment += attitudeAdj.adjustment;

        // 2. Critical needs create hard or very hard adjustments
        if (npc.needs) {
            const criticalNeeds = this.dynamicSystems.needsSystem.getCriticalNeeds(npc, 'critical');

            if (criticalNeeds.length >= 2) {
                adjustments.push({
                    type: 'critical-needs',
                    label: 'very-hard',
                    value: this.adjustments['very-hard'], // +5
                    description: `Multiple critical needs (${criticalNeeds.map(n => n.needId).join(', ')})`
                });
                totalAdjustment += this.adjustments['very-hard'];
            } else if (criticalNeeds.length === 1) {
                adjustments.push({
                    type: 'critical-need',
                    label: 'hard',
                    value: this.adjustments['hard'], // +2
                    description: `Critical need: ${criticalNeeds[0].needId}`
                });
                totalAdjustment += this.adjustments['hard'];
            }
        }

        // 3. Traumatic thoughts create hard adjustment
        if (npc.thoughts) {
            const negativeThoughts = this.dynamicSystems.thoughtsSystem.getThoughtsByCategory(npc, 'traumatic');
            if (negativeThoughts.length > 0) {
                adjustments.push({
                    type: 'trauma',
                    label: 'hard',
                    value: this.adjustments['hard'], // +2
                    description: `Recent trauma (${negativeThoughts.length} traumatic thought${negativeThoughts.length > 1 ? 's' : ''})`
                });
                totalAdjustment += this.adjustments['hard'];
            }
        }

        // 4. Existing relationship provides easy/hard adjustments
        if (initiator && npc.relationshipsDynamic && npc.relationshipsDynamic[initiator.id]) {
            const relationship = npc.relationshipsDynamic[initiator.id];
            const opinion = relationship.opinion;

            // Map opinion to PF2e adjustments
            let opinionAdj = null;
            if (opinion >= 80) {
                opinionAdj = { label: 'very-easy', value: this.adjustments['very-easy'], desc: 'excellent relationship' };
            } else if (opinion >= 50) {
                opinionAdj = { label: 'easy', value: this.adjustments['easy'], desc: 'good relationship' };
            } else if (opinion <= -50) {
                opinionAdj = { label: 'very-hard', value: this.adjustments['very-hard'], desc: 'hostile relationship' };
            } else if (opinion <= -20) {
                opinionAdj = { label: 'hard', value: this.adjustments['hard'], desc: 'poor relationship' };
            }

            if (opinionAdj) {
                adjustments.push({
                    type: 'relationship',
                    label: opinionAdj.label,
                    value: opinionAdj.value,
                    description: `${relationship.relationshipType} (opinion: ${opinion}) - ${opinionAdj.desc}`
                });
                totalAdjustment += opinionAdj.value;
            }
        }

        // 5. Personality-based easy/hard adjustments (resistances/weaknesses)
        const personalityAdj = this.getPersonalityInfluenceAdjustments(npc, skill);
        if (personalityAdj) {
            adjustments.push(personalityAdj);
            totalAdjustment += personalityAdj.value;
        }

        const finalDC = Math.max(5, baseDC + totalAdjustment);

        return {
            finalDC: finalDC,
            baseDC: baseDC,
            totalAdjustment: totalAdjustment,
            adjustments: adjustments,
            npcLevel: npc.abilities?.level || 0,
            attitude: attitude,
            moodScore: moodData.score
        };
    }

    /**
     * Get mood-based DC adjustment using PF2e rules
     * Uses PF2e attitude system: helpful (-5), friendly (-2), indifferent (0), unfriendly (+2), hostile (+5)
     * @param {number} moodScore - Mood score (0-100)
     * @param {string} attitude - PF2e attitude
     * @returns {Object} - DC adjustment with label
     */
    getMoodInfluenceAdjustment(moodScore, attitude) {
        // Map mood/attitude to PF2e DC adjustments (GM Core pg. 55)
        // Attitude affects social skill DCs: easy for friendly, very easy for helpful,
        // hard for unfriendly, very hard for hostile

        let adjustment = 0;
        let label = 'normal';

        // Use PF2e attitude-based adjustments
        switch (attitude) {
            case 'helpful':
                adjustment = this.adjustments['very-easy']; // -5
                label = 'very-easy';
                break;
            case 'friendly':
                adjustment = this.adjustments['easy']; // -2
                label = 'easy';
                break;
            case 'indifferent':
                adjustment = this.adjustments['normal']; // 0
                label = 'normal';
                break;
            case 'unfriendly':
                adjustment = this.adjustments['hard']; // +2
                label = 'hard';
                break;
            case 'hostile':
                adjustment = this.adjustments['very-hard']; // +5
                label = 'very-hard';
                break;
            default:
                adjustment = 0;
                label = 'normal';
        }

        return {
            adjustment: adjustment,
            label: label,
            description: `Attitude: ${attitude}`
        };
    }

    /**
     * Get level-based DC for NPC
     * @param {number} level - NPC level
     * @returns {number} - Base DC
     */
    getLevelBasedDC(level) {
        level = Math.max(0, Math.min(25, level)); // Clamp to valid range
        return this.levelDCs[level] || 14;
    }

    /**
     * Get personality-based influence adjustment using PF2e categories
     * Returns strongest single adjustment (weakness or resistance)
     * @param {Object} npc - The NPC object
     * @param {string} skill - Skill being used
     * @returns {Object|null} - Adjustment object or null
     */
    getPersonalityInfluenceAdjustments(npc, skill) {
        if (!npc.personalities) return null;

        const personalities = npc.personalities.map(p => typeof p === 'string' ? p : p.id);
        const skillLower = skill.toLowerCase();

        // Resistances (use PF2e hard or very hard adjustments)
        const resistances = {
            'skeptical': {
                skills: ['deception'],
                adjustment: 'very-hard', // +5
                reason: 'Naturally suspicious of lies'
            },
            'pompous': {
                skills: ['intimidation'],
                adjustment: 'hard', // +2
                reason: 'Too proud to be intimidated easily'
            },
            'scholarly': {
                skills: ['performance', 'intimidation'],
                adjustment: 'hard', // +2
                reason: 'Prefers logic over emotion'
            },
            'stubborn': {
                skills: ['diplomacy', 'intimidation'],
                adjustment: 'hard', // +2
                reason: 'Resistant to persuasion'
            },
            'cynical': {
                skills: ['diplomacy'],
                adjustment: 'hard', // +2
                reason: 'Distrustful of appeals'
            }
        };

        // Weaknesses (use PF2e easy or very easy adjustments)
        const weaknesses = {
            'vain': {
                skills: ['performance'],
                adjustment: 'easy', // -2
                reason: 'Susceptible to flattery'
            },
            'greedy': {
                skills: ['society', 'mercantile-lore', 'accounting-lore'],
                adjustment: 'easy', // -2
                reason: 'Motivated by profit'
            },
            'curious': {
                skills: ['arcana', 'nature', 'occultism', 'religion'],
                adjustment: 'easy', // -2
                reason: 'Eager to learn new things'
            },
            'ambitious': {
                skills: ['society', 'diplomacy'],
                adjustment: 'easy', // -2
                reason: 'Seeking advancement'
            },
            'romantic': {
                skills: ['performance', 'society'],
                adjustment: 'easy', // -2
                reason: 'Appreciates beauty and romance'
            },
            'scholarly': {
                skills: ['arcana', 'religion', 'occultism'],
                adjustment: 'easy', // -2
                reason: 'Loves intellectual discussion'
            }
        };

        // Check for strongest resistance first
        for (const personality of personalities) {
            if (resistances[personality]) {
                const resist = resistances[personality];
                if (resist.skills.some(s => skillLower.includes(s.toLowerCase()))) {
                    return {
                        type: 'personality-resistance',
                        label: resist.adjustment,
                        value: this.adjustments[resist.adjustment],
                        description: `${personality}: ${resist.reason}`
                    };
                }
            }
        }

        // Then check for weakness
        for (const personality of personalities) {
            if (weaknesses[personality]) {
                const weak = weaknesses[personality];
                if (weak.skills.some(s => skillLower.includes(s.toLowerCase()))) {
                    return {
                        type: 'personality-weakness',
                        label: weak.adjustment,
                        value: this.adjustments[weak.adjustment],
                        description: `${personality}: ${weak.reason}`
                    };
                }
            }
        }

        return null; // No personality adjustment for this skill
    }

    /**
     * Process Influence action with dynamic integration
     * @param {Object} npc - The NPC object
     * @param {Object} initiator - PC attempting to influence
     * @param {string} skill - Skill being used
     * @param {number} rollResult - Total of skill check
     * @param {number} baseDC - Base DC from influence stat block
     * @returns {Object} - Influence result
     */
    processInfluence(npc, initiator, skill, rollResult, baseDC = 15) {
        // Calculate dynamic DC
        const dcData = this.calculateInfluenceDC(npc, skill, initiator, baseDC);
        const finalDC = dcData.finalDC;

        // Determine degree of success
        const margin = rollResult - finalDC;
        let degree;
        if (margin >= 10) degree = 'critical-success';
        else if (margin >= 0) degree = 'success';
        else if (margin >= -10) degree = 'failure';
        else degree = 'critical-failure';

        // Calculate Influence Points gained
        let influencePoints = 0;
        let opinionChange = 0;

        switch (degree) {
            case 'critical-success':
                influencePoints = 2;
                opinionChange = 10;
                break;
            case 'success':
                influencePoints = 1;
                opinionChange = 5;
                break;
            case 'failure':
                influencePoints = 0;
                opinionChange = 0;
                break;
            case 'critical-failure':
                influencePoints = -1;
                opinionChange = -5;
                break;
        }

        // Update relationship opinion
        if (this.dynamicSystems && opinionChange !== 0) {
            const relationship = this.dynamicSystems.relationshipDynamics.getRelationship(
                npc,
                initiator.id,
                initiator
            );

            this.dynamicSystems.relationshipDynamics.addOpinionModifier(
                relationship,
                {
                    id: `influence-${skill}-${Date.now()}`,
                    reason: degree === 'critical-success' ?
                        `Impressed by ${initiator.name}'s ${skill}` :
                        degree === 'success' ?
                        `Appreciated ${initiator.name}'s ${skill}` :
                        degree === 'critical-failure' ?
                        `Annoyed by ${initiator.name}'s clumsy ${skill} attempt` :
                        '',
                    value: opinionChange,
                    duration: 480 // 20 days
                },
                Date.now()
            );
        }

        return {
            success: degree === 'success' || degree === 'critical-success',
            degree: degree,
            influencePoints: influencePoints,
            rollResult: rollResult,
            dc: finalDC,
            dcBreakdown: dcData,
            opinionChange: opinionChange,
            message: this.getInfluenceMessage(degree, skill, npc.name)
        };
    }

    /**
     * Process Discovery action with dynamic integration
     * Allows discovering dynamic state information
     * @param {Object} npc - The NPC object
     * @param {Object} initiator - PC attempting discovery
     * @param {number} rollResult - Perception or skill check result
     * @param {number} baseDC - Base DC from influence stat block
     * @returns {Object} - Discovery result
     */
    processDiscovery(npc, initiator, rollResult, baseDC = 13) {
        // Apply mood penalty to discovery if NPC is upset
        const moodData = this.dynamicSystems?.moodCalculator?.calculateMood(npc, {}, Date.now());
        let finalDC = baseDC;

        if (moodData && moodData.score < 40) {
            finalDC += 2; // Unhappy NPCs are harder to read
        }

        const margin = rollResult - finalDC;
        let degree;
        if (margin >= 10) degree = 'critical-success';
        else if (margin >= 0) degree = 'success';
        else if (margin >= -10) degree = 'failure';
        else degree = 'critical-failure';

        const discoveries = [];
        let choicesAllowed = 0;

        switch (degree) {
            case 'critical-success':
                choicesAllowed = 2;
                break;
            case 'success':
                choicesAllowed = 1;
                break;
            case 'failure':
                choicesAllowed = 0;
                break;
            case 'critical-failure':
                choicesAllowed = 1; // But information is incorrect
                break;
        }

        if (choicesAllowed > 0) {
            // Build list of discoverable information

            // Standard influence info
            discoveries.push({
                type: 'best-skill',
                info: 'Best skill to influence (from influence stat block)',
                category: 'standard'
            });

            discoveries.push({
                type: 'resistance',
                info: 'One personality-based resistance',
                category: 'standard'
            });

            discoveries.push({
                type: 'weakness',
                info: 'One personality-based weakness',
                category: 'standard'
            });

            // Dynamic state information (NEW!)
            if (this.dynamicSystems && this.dynamicSystems.initialized) {
                // Current mood
                if (moodData) {
                    discoveries.push({
                        type: 'current-mood',
                        info: `Current mood: ${moodData.mood.name} (affects DC by ${this.getMoodInfluenceModifier(moodData.score)})`,
                        category: 'dynamic',
                        revealed: {
                            mood: moodData.mood.name,
                            moodScore: moodData.score,
                            dcModifier: this.getMoodInfluenceModifier(moodData.score)
                        }
                    });
                }

                // Critical needs
                const criticalNeeds = this.dynamicSystems.needsSystem.getCriticalNeeds(npc);
                if (criticalNeeds.length > 0) {
                    discoveries.push({
                        type: 'critical-need',
                        info: `Critical need: ${criticalNeeds[0].needId} (${criticalNeeds[0].need.current}/${criticalNeeds[0].need.max})`,
                        category: 'dynamic',
                        revealed: {
                            needId: criticalNeeds[0].needId,
                            needName: criticalNeeds[0].need.name,
                            current: criticalNeeds[0].need.current,
                            max: criticalNeeds[0].need.max,
                            suggestion: `Addressing this need could make influence easier`
                        }
                    });
                }

                // Dominant thoughts
                const thoughtsSummary = this.dynamicSystems.thoughtsSystem.getThoughtsSummary(npc);
                if (thoughtsSummary.positive.length > 0) {
                    const topThought = thoughtsSummary.positive[0];
                    discoveries.push({
                        type: 'positive-thought',
                        info: `Current positive thought: ${topThought.name} (+${topThought.currentMoodEffect} mood)`,
                        category: 'dynamic',
                        revealed: topThought
                    });
                }
                if (thoughtsSummary.negative.length > 0) {
                    const topThought = thoughtsSummary.negative[0];
                    discoveries.push({
                        type: 'negative-thought',
                        info: `Current negative thought: ${topThought.name} (${topThought.currentMoodEffect} mood)`,
                        category: 'dynamic',
                        revealed: topThought
                    });
                }

                // Existing relationship
                if (npc.relationshipsDynamic && npc.relationshipsDynamic[initiator.id]) {
                    const rel = npc.relationshipsDynamic[initiator.id];
                    discoveries.push({
                        type: 'relationship-opinion',
                        info: `Their opinion of you: ${rel.opinion} (${rel.relationshipType})`,
                        category: 'dynamic',
                        revealed: {
                            opinion: rel.opinion,
                            type: rel.relationshipType,
                            trust: rel.trustLevel
                        }
                    });
                }
            }
        }

        return {
            success: degree !== 'failure' && degree !== 'critical-failure',
            degree: degree,
            choicesAllowed: choicesAllowed,
            availableDiscoveries: discoveries,
            incorrect: degree === 'critical-failure',
            rollResult: rollResult,
            dc: finalDC
        };
    }

    /**
     * Get influence message based on outcome
     * @param {string} degree - Degree of success
     * @param {string} skill - Skill used
     * @param {string} npcName - NPC name
     * @returns {string} - Message
     */
    getInfluenceMessage(degree, skill, npcName) {
        const messages = {
            'critical-success': [
                `${npcName} is thoroughly impressed by your ${skill}!`,
                `Your ${skill} has made a strong positive impression on ${npcName}.`,
                `${npcName} seems genuinely moved by your approach.`
            ],
            'success': [
                `${npcName} appreciates your ${skill}.`,
                `Your ${skill} has a positive effect on ${npcName}.`,
                `${npcName} seems receptive to your approach.`
            ],
            'failure': [
                `Your ${skill} attempt doesn't seem to land with ${npcName}.`,
                `${npcName} remains unmoved by your ${skill}.`,
                `Your approach doesn't resonate with ${npcName}.`
            ],
            'critical-failure': [
                `Your clumsy ${skill} attempt annoys ${npcName}.`,
                `${npcName} is put off by your inappropriate use of ${skill}.`,
                `You've made things worse with ${npcName}.`
            ]
        };

        const options = messages[degree] || messages['failure'];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Create PF2e influence stat block with dynamic modifiers
     * @param {Object} npc - The NPC object
     * @param {Object} influenceData - Base influence data from NPC generation
     * @param {Object} initiator - PC for relationship-based modifiers (optional)
     * @returns {Object} - Complete influence stat block
     */
    createInfluenceStatBlock(npc, influenceData, initiator = null) {
        if (!influenceData) return null;

        const statBlock = {
            name: npc.name,
            description: influenceData.description || `${npc.occupation?.name || 'NPC'}`,
            perception: influenceData.perception || 10,
            will: influenceData.will || 10,
            discovery: {
                baseDC: influenceData.discoveryDC || 13,
                skills: influenceData.discoverySkills || []
            },
            influenceSkills: [],
            influenceThresholds: influenceData.thresholds || [],
            resistances: [],
            weaknesses: []
        };

        // Add dynamic modifiers to each skill
        if (influenceData.skills) {
            for (const skillData of influenceData.skills) {
                const dcCalc = this.calculateInfluenceDC(
                    npc,
                    skillData.skill,
                    initiator,
                    skillData.baseDC
                );

                statBlock.influenceSkills.push({
                    skill: skillData.skill,
                    baseDC: skillData.baseDC,
                    finalDC: dcCalc.finalDC,
                    modifiers: dcCalc.modifiers,
                    dynamicallyAdjusted: dcCalc.totalModifier !== 0
                });
            }

            // Sort by final DC
            statBlock.influenceSkills.sort((a, b) => a.finalDC - b.finalDC);
        }

        // Add resistances from dynamic state
        if (this.dynamicSystems && this.dynamicSystems.initialized) {
            const moodData = this.dynamicSystems.moodCalculator.calculateMood(npc, {}, Date.now());

            if (moodData.score < 40) {
                statBlock.resistances.push({
                    source: 'mood',
                    description: `${npc.name} is ${moodData.mood.name.toLowerCase()}, making all influence attempts harder`,
                    dcIncrease: this.getMoodInfluenceModifier(moodData.score)
                });
            }

            const criticalNeeds = this.dynamicSystems.needsSystem.getCriticalNeeds(npc);
            if (criticalNeeds.length > 0) {
                statBlock.resistances.push({
                    source: 'critical-needs',
                    description: `${npc.name} has critical needs (${criticalNeeds.map(n => n.needId).join(', ')}) and is distracted`,
                    dcIncrease: Math.min(5, criticalNeeds.length * 2)
                });
            }
        }

        // Add weaknesses from dynamic state
        if (npc.needs) {
            const hunger = npc.needs.sustenance;
            if (hunger && hunger.current < 30) {
                statBlock.weaknesses.push({
                    source: 'hunger',
                    description: `${npc.name} is hungry - offering food reduces DC significantly`,
                    dcDecrease: -5,
                    triggerCondition: 'Offer food or discuss food-related topics'
                });
            }
        }

        // Add personality-based resistances and weaknesses
        const personalities = npc.personalities || [];
        for (const personality of personalities) {
            const pid = typeof personality === 'string' ? personality : personality.id;

            // Add to stat block for reference
            if (pid === 'greedy') {
                statBlock.weaknesses.push({
                    source: 'personality',
                    description: `${npc.name} is greedy - appeals to profit are very effective`,
                    dcDecrease: -2,
                    skills: ['Society', 'Mercantile Lore', 'Accounting Lore']
                });
            }
            if (pid === 'stubborn') {
                statBlock.resistances.push({
                    source: 'personality',
                    description: `${npc.name} is stubborn - resistant to persuasion`,
                    dcIncrease: 3,
                    skills: ['Diplomacy', 'Intimidation']
                });
            }
        }

        return statBlock;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCInfluenceIntegration;
}
