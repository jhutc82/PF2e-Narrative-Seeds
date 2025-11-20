/**
 * PF2e Narrative Seeds - NPC Generator
 * Generates NPC personalities for social encounters
 */

import { RandomUtils } from '../utils.js';
import { NarrativeSeedsSettings } from '../settings.js';
import { DataLoader } from '../data-loader.js';
import { NameGenerator } from './name-generator.js';

/**
 * NPC personality generator
 */
export class NPCGenerator {

  /**
   * Memory system to prevent repetition
   */
  static recentNPCs = [];
  static MAX_MEMORY_SIZE = 20;

  /**
   * Generate a complete NPC personality
   * @param {Object} params - Generation parameters
   * @param {Actor} params.actor - Optional: Target actor to base NPC on
   * @param {string} params.forcedMood - Optional: Force a specific mood
   * @param {string} params.detailLevel - Optional: Detail level override
   * @returns {Promise<Object|null>} Generated NPC personality seed
   */
  static async generate(params = {}) {
    try {
      // Get detail level
      const detailLevel = params.detailLevel || NarrativeSeedsSettings.get("npcDetailLevel", "standard");

      // Load data - including new expanded data files
      const [
        moodsData,
        personalitiesData,
        mannerismsData,
        motivationsData,
        quirksData,
        appearanceData,
        appearanceAncestryData,
        abilitiesData,
        occupationsData,
        occupationsAncestryData,
        possessionsData,
        relationshipsData,
        relationshipsExpandedData,
        plotHooksData,
        plotHooksExpandedData,
        influenceData,
        psychologicalDepthData,
        physicalDetailsData,
        lifeHistoryData,
        dailyLifeData,
        speechPatternsData,
        characterComplexityData,
        currentSituationData,
        emotionalTriggersData,
        secretsInformationData,
        economicRealityData,
        sensorySignatureData,
        healthConditionsData,
        relationshipDynamicsData,
        professionalExpertiseData,
        factionAffiliationsData,
        romanticPreferencesData,
        religiousBeliefsData,
        hobbiesData,
        educationData,
        combatStyleData,
        magicalTraditionsData,
        familyGenerationData,
        groupDynamicsData,
        characterDevelopmentData,
        questChainsData,
        relationshipProgressionData
      ] = await Promise.all([
        DataLoader.loadJSON("data/social/npc/moods.json"),
        DataLoader.loadJSON("data/social/npc/personalities.json"),
        DataLoader.loadJSON("data/social/npc/mannerisms.json"),
        DataLoader.loadJSON("data/social/npc/motivations.json"),
        DataLoader.loadJSON("data/social/npc/quirks.json"),
        DataLoader.loadJSON("data/social/npc/appearance.json"),
        DataLoader.loadJSON("data/social/npc/appearance-ancestry-specific.json"),
        DataLoader.loadJSON("data/social/npc/abilities.json"),
        DataLoader.loadJSON("data/social/npc/occupations.json"),
        DataLoader.loadJSON("data/social/npc/occupations-ancestry-specific.json"),
        DataLoader.loadJSON("data/social/npc/possessions.json"),
        DataLoader.loadJSON("data/social/npc/relationships.json"),
        DataLoader.loadJSON("data/social/npc/relationships-expanded.json"),
        DataLoader.loadJSON("data/social/npc/plot-hooks.json"),
        DataLoader.loadJSON("data/social/npc/plot-hooks-expanded.json"),
        DataLoader.loadJSON("data/social/npc/influence.json"),
        DataLoader.loadJSON("data/social/npc/psychological-depth.json"),
        DataLoader.loadJSON("data/social/npc/physical-details.json"),
        DataLoader.loadJSON("data/social/npc/life-history.json"),
        DataLoader.loadJSON("data/social/npc/daily-life.json"),
        DataLoader.loadJSON("data/social/npc/speech-patterns.json"),
        DataLoader.loadJSON("data/social/npc/character-complexity.json"),
        DataLoader.loadJSON("data/social/npc/current-situation.json"),
        DataLoader.loadJSON("data/social/npc/emotional-triggers.json"),
        DataLoader.loadJSON("data/social/npc/secrets-information.json"),
        DataLoader.loadJSON("data/social/npc/economic-reality.json"),
        DataLoader.loadJSON("data/social/npc/sensory-signature.json"),
        DataLoader.loadJSON("data/social/npc/health-conditions.json"),
        DataLoader.loadJSON("data/social/npc/relationship-dynamics.json"),
        DataLoader.loadJSON("data/social/npc/professional-expertise.json"),
        DataLoader.loadJSON("data/social/npc/faction-affiliations.json"),
        DataLoader.loadJSON("data/social/npc/romantic-preferences.json"),
        DataLoader.loadJSON("data/social/npc/religious-beliefs.json"),
        DataLoader.loadJSON("data/social/npc/hobbies.json"),
        DataLoader.loadJSON("data/social/npc/education.json"),
        DataLoader.loadJSON("data/social/npc/combat-style.json"),
        DataLoader.loadJSON("data/social/npc/magical-traditions.json"),
        DataLoader.loadJSON("data/social/npc/family-generation.json"),
        DataLoader.loadJSON("data/social/npc/group-dynamics.json"),
        DataLoader.loadJSON("data/social/npc/character-development.json"),
        DataLoader.loadJSON("data/social/npc/quest-chains.json"),
        DataLoader.loadJSON("data/social/npc/relationship-progression.json")
      ]);

      if (!moodsData || !personalitiesData || !mannerismsData || !motivationsData || !quirksData) {
        console.error("PF2e Narrative Seeds | Failed to load NPC data");
        return null;
      }

      // Select mood (can be forced or random)
      let mood;
      if (params.forcedMood) {
        mood = moodsData.moods.find(m => m.id === params.forcedMood);
      } else {
        mood = this.selectWeightedMood(moodsData.moods, params.actor);
      }

      if (!mood) {
        console.error("PF2e Narrative Seeds | Failed to select mood");
        return null;
      }

      // Generate name based on ancestry (calculate ancestry first for filtering)
      const ancestry = params.ancestry || (params.actor ? NameGenerator.detectAncestry(params.actor) : "human");

      // Select personality traits (1-2 based on detail level) - filtered by ancestry
      const numPersonalities = this.getNumPersonalities(detailLevel);
      const filteredPersonalities = this.filterByAncestry(personalitiesData.personalities, ancestry);
      const personalities = this.selectUniqueItems(filteredPersonalities, numPersonalities);

      // Select mannerisms (1-3 based on detail level) - filtered by ancestry
      const numMannerisms = this.getNumMannerisms(detailLevel);
      const filteredMannerisms = this.filterByAncestry(mannerismsData.mannerisms, ancestry);
      const mannerisms = this.selectUniqueItems(filteredMannerisms, numMannerisms);

      // Select motivation (always 1) - filtered by ancestry
      const filteredMotivations = this.filterByAncestry(motivationsData.motivations, ancestry);
      const motivation = RandomUtils.selectFrom(filteredMotivations);

      // Select quirks (0-2 based on detail level and random chance) - filtered by ancestry
      const numQuirks = this.getNumQuirks(detailLevel);
      const filteredQuirks = this.filterByAncestry(quirksData.quirks, ancestry);
      const quirks = numQuirks > 0 ? this.selectUniqueItems(filteredQuirks, numQuirks) : [];
      const gender = params.gender || null; // null = random
      const name = await NameGenerator.generate(ancestry, gender);

      // Generate physical appearance with ancestry-specific features
      const appearance = this.generateAppearance(appearanceData, appearanceAncestryData, ancestry, detailLevel);

      // Generate occupation and social class with ancestry-specific options
      const occupation = this.generateOccupation(occupationsData, occupationsAncestryData, ancestry, detailLevel);

      // Create influence map from selected traits
      const influenceSources = [...personalities];
      if (occupation) influenceSources.push(occupation);
      const influenceMap = this.createInfluenceMap(influenceSources);

      // Get age category for context-aware generation
      const ageCategory = this.getAgeCategory(appearance);

      // Get social class from occupation
      const socialClass = occupation?.socialClass?.value || 'commoner';

      // Create context object for contextual modifiers
      const context = {
        influenceMap,
        ageCategory,
        socialClass,
        ancestry
      };

      // Generate abilities based on level and occupation
      const abilities = this.generateAbilities(abilitiesData, occupation, detailLevel);

      // Generate possessions based on occupation and social class
      const possessions = this.generatePossessions(possessionsData, occupation, abilities.level, detailLevel);

      // Generate relationships with expanded options
      const relationships = this.generateRelationships(relationshipsData, relationshipsExpandedData, occupation, ancestry, detailLevel);

      // Generate plot hooks with expanded variety
      const plotHooks = this.generatePlotHooks(plotHooksData, plotHooksExpandedData, occupation, relationships, ancestry, detailLevel);

      // Generate Influence stat block
      const influence = this.generateInfluence(influenceData, occupation, abilities, mood, personalities, plotHooks);

      // Generate psychological depth
      const psychology = this.generatePsychology(psychologicalDepthData, personalities, occupation, plotHooks, ancestry, detailLevel);

      // Generate physical details with ancestry and occupation influences
      const physicalDetails = this.generatePhysicalDetails(physicalDetailsData, ancestry, occupation, psychology, context, detailLevel);

      // Generate life history shaped by ancestry and occupation
      const lifeHistory = this.generateLifeHistory(lifeHistoryData, ancestry, occupation, psychology, detailLevel);

      // Generate daily life patterns
      const dailyLife = this.generateDailyLife(dailyLifeData, occupation, psychology, lifeHistory, detailLevel);

      // Generate speech patterns influenced by background
      const speechPatterns = this.generateSpeechPatterns(speechPatternsData, occupation, lifeHistory, personalities, ancestry, context, detailLevel);

      // Generate character complexity (contradictions, conflicts, hidden depths)
      const complexity = this.generateComplexity(characterComplexityData, personalities, psychology, plotHooks, detailLevel);

      // Generate current situation they're dealing with
      const currentSituation = this.generateCurrentSituation(currentSituationData, occupation, plotHooks, psychology, detailLevel);

      // Generate emotional triggers (what sets them off, wins them over)
      const emotionalTriggers = this.generateEmotionalTriggers(emotionalTriggersData, psychology, personalities, detailLevel);

      // Generate secrets and information layers (progressive disclosure)
      const secrets = this.generateSecrets(secretsInformationData, occupation, plotHooks, psychology, detailLevel);

      // Generate economic reality (wealth, debts, financial pressures)
      const economics = this.generateEconomics(economicRealityData, occupation, currentSituation, detailLevel);

      // Generate sensory signature (how they smell, sound, feel)
      const sensory = this.generateSensory(sensorySignatureData, occupation, physicalDetails, ancestry, detailLevel);

      // Generate health status (conditions, fitness, mental health)
      const age = appearance?.age?.age || 30; // Extract age from appearance or default to 30
      const health = this.generateHealth(healthConditionsData, age, occupation, lifeHistory, ancestry, context, detailLevel);

      // Generate relationship dynamics (how they treat different groups)
      const relationshipDynamics = this.generateRelationshipDynamics(relationshipDynamicsData, psychology, lifeHistory, detailLevel);

      // Generate professional expertise (occupation-specific knowledge)
      const professionalExpertise = this.generateProfessionalExpertise(professionalExpertiseData, occupation, detailLevel);

      // Generate sample dialogue (3-5 example lines in their voice)
      const dialogueSamples = this.generateDialogueSamples(speechPatterns, personalities, mood, currentSituation, emotionalTriggers, detailLevel);

      // Generate voice template (complete voice guide for GMs)
      const voiceTemplate = this.generateVoiceTemplate(speechPatterns, personalities, psychology, relationshipDynamics, detailLevel);

      // Generate story hooks (quests they can offer)
      const storyHooks = this.generateStoryHooks(plotHooks, currentSituation, occupation, relationships, economics, secrets, detailLevel);

      // Generate faction affiliations and political leanings
      const factionInfo = this.generateFactionAffiliations(factionAffiliationsData, occupation, psychology, lifeHistory, detailLevel);

      // Generate romantic preferences and relationship history
      const romanticInfo = this.generateRomanticPreferences(romanticPreferencesData, age, psychology, lifeHistory, detailLevel);

      // Generate religious beliefs and practices
      const religiousInfo = this.generateReligiousBeliefs(religiousBeliefsData, ancestry, occupation, psychology, detailLevel);

      // Generate hobbies and recreational activities
      const hobbies = this.generateHobbies(hobbiesData, occupation, psychology, economics, detailLevel);

      // Generate education and learning background
      const education = this.generateEducation(educationData, occupation, socialClass, ancestry, detailLevel);

      // Generate combat style and fighting philosophy
      const combatStyle = this.generateCombatStyle(combatStyleData, occupation, psychology, lifeHistory, detailLevel);

      // Generate magical traditions and supernatural connections
      const magicalInfo = this.generateMagicalTraditions(magicalTraditionsData, occupation, ancestry, psychology, detailLevel);

      // Generate family information
      const family = this.generateFamily(familyGenerationData, age, occupation, lifeHistory, ancestry, detailLevel);

      // Generate potential group role (if part of organization)
      const groupRole = this.generateGroupRole(groupDynamicsData, occupation, personalities, detailLevel);

      // Initialize character development tracking
      const developmentTracking = this.initializeDevelopmentTracking(characterDevelopmentData, psychology, plotHooks, detailLevel);

      // Generate potential quest they can offer
      const questInfo = this.generateQuestInfo(questChainsData, occupation, plotHooks, currentSituation, detailLevel);

      // Initialize relationship progression system
      const relationshipTracking = this.initializeRelationshipTracking(relationshipProgressionData, personalities, emotionalTriggers);

      // Build NPC seed
      const seed = {
        name,
        ancestry,
        mood,
        personalities,
        mannerisms,
        motivation,
        quirks,
        appearance,
        occupation,
        abilities,
        possessions,
        relationships,
        plotHooks,
        influence,
        psychology,
        physicalDetails,
        lifeHistory,
        dailyLife,
        speechPatterns,
        complexity,
        currentSituation,
        emotionalTriggers,
        secrets,
        economics,
        sensory,
        health,
        relationshipDynamics,
        professionalExpertise,
        dialogueSamples,
        voiceTemplate,
        storyHooks,
        factionInfo,
        romanticInfo,
        religiousInfo,
        hobbies,
        education,
        combatStyle,
        magicalInfo,
        family,
        groupRole,
        developmentTracking,
        questInfo,
        relationshipTracking,
        sessionTracking: this.initializeSessionTracking(),
        detailLevel,
        actor: params.actor,
        timestamp: Date.now()
      };

      // Add to memory
      this.addToMemory(seed);

      return seed;

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error generating NPC:", error);
      return null;
    }
  }

  /**
   * Select a mood with weighted randomness
   * Can consider actor's existing attitude if provided
   * @param {Array} moods - Available moods
   * @param {Actor} actor - Optional target actor
   * @returns {Object} Selected mood
   */
  static selectWeightedMood(moods, actor = null) {
    // If actor exists and has a PF2e attitude, bias toward matching moods
    if (actor && actor.system?.attributes?.attitude?.value) {
      const attitude = actor.system.attributes.attitude.value;
      const matchingMoods = moods.filter(m => m.attitudes.includes(attitude));

      if (matchingMoods.length > 0 && Math.random() < 0.7) {
        // 70% chance to use a mood matching the actor's attitude
        return RandomUtils.selectWeighted(matchingMoods, "likelihood");
      }
    }

    // Default: weighted random selection
    return RandomUtils.selectWeighted(moods, "likelihood");
  }

  /**
   * Filter options by ancestry
   * @param {Array} options - Options array with "ancestries" field
   * @param {string} ancestry - Target ancestry (e.g., "human", "elf", "leshy")
   * @returns {Array} Filtered options appropriate for the ancestry
   */
  static filterByAncestry(options, ancestry) {
    if (!options || !Array.isArray(options)) return options;
    if (!ancestry) return options;

    // Normalize ancestry name to lowercase for comparison
    const normalizedAncestry = ancestry.toLowerCase();

    return options.filter(option => {
      // If no ancestries field, assume universal (for backward compatibility)
      if (!option.ancestries) return true;

      // If "all" is in the list, it's universal
      if (option.ancestries.includes("all")) return true;

      // Check if the specific ancestry is in the list
      return option.ancestries.some(a => a.toLowerCase() === normalizedAncestry);
    });
  }

  /**
   * Create influence map from selected traits (personalities, occupation, etc.)
   * @param {Array} selectedTraits - Selected personalities, occupation, etc.
   * @returns {Object} Map of trait IDs to cumulative influence multipliers
   */
  static createInfluenceMap(selectedTraits) {
    const influenceMap = {
      increases: {},
      decreases: {}
    };

    if (!selectedTraits || !Array.isArray(selectedTraits)) return influenceMap;

    selectedTraits.forEach(trait => {
      if (!trait || !trait.influences) return;

      // Accumulate increases
      if (trait.influences.increases) {
        trait.influences.increases.forEach(inf => {
          const key = `${inf.category}:${inf.id}`;
          if (!influenceMap.increases[key]) {
            influenceMap.increases[key] = [];
          }
          influenceMap.increases[key].push(inf.multiplier);
        });
      }

      // Accumulate decreases
      if (trait.influences.decreases) {
        trait.influences.decreases.forEach(inf => {
          const key = `${inf.category}:${inf.id}`;
          if (!influenceMap.decreases[key]) {
            influenceMap.decreases[key] = [];
          }
          influenceMap.decreases[key].push(inf.multiplier);
        });
      }
    });

    return influenceMap;
  }

  /**
   * Apply influences to modify option likelihoods
   * @param {Array} options - Options to modify
   * @param {Object} influenceMap - Influence map from createInfluenceMap
   * @param {string} category - Category name for influence matching
   * @returns {Array} Options with modified likelihoods
   */
  static applyInfluences(options, influenceMap, category) {
    if (!options || !Array.isArray(options)) return options;
    if (!influenceMap) return options;

    return options.map(option => {
      const key = `${category}:${option.id}`;
      let likelihood = option.likelihood || 1;

      // Apply increases (multiply)
      if (influenceMap.increases[key]) {
        influenceMap.increases[key].forEach(multiplier => {
          likelihood *= multiplier;
        });
      }

      // Apply decreases (multiply)
      if (influenceMap.decreases[key]) {
        influenceMap.decreases[key].forEach(multiplier => {
          likelihood *= multiplier;
        });
      }

      return { ...option, likelihood };
    });
  }

  /**
   * Apply age multipliers to options
   * @param {Array} options - Options with ageMultiplier field
   * @param {string} ageCategory - Age category (young, adult, mature, elderly)
   * @returns {Array} Options with age-adjusted likelihoods
   */
  static applyAgeMultipliers(options, ageCategory) {
    if (!options || !Array.isArray(options)) return options;
    if (!ageCategory) return options;

    return options.map(option => {
      let likelihood = option.likelihood || 1;

      if (option.ageMultiplier && option.ageMultiplier[ageCategory]) {
        likelihood *= option.ageMultiplier[ageCategory];
      }

      return { ...option, likelihood };
    });
  }

  /**
   * Apply social class multipliers to options
   * @param {Array} options - Options with classMultiplier field
   * @param {string} socialClass - Social class (destitute, peasant, commoner, merchant, gentry, noble, royalty)
   * @returns {Array} Options with class-adjusted likelihoods
   */
  static applyClassMultipliers(options, socialClass) {
    if (!options || !Array.isArray(options)) return options;
    if (!socialClass) return options;

    return options.map(option => {
      let likelihood = option.likelihood || 1;

      if (option.classMultiplier && option.classMultiplier[socialClass]) {
        likelihood *= option.classMultiplier[socialClass];
      }

      return { ...option, likelihood };
    });
  }

  /**
   * Apply all contextual modifiers (influences, age, class, ancestry)
   * @param {Array} options - Options to modify
   * @param {Object} context - Context object with influences, ageCategory, socialClass, ancestry, category
   * @returns {Array} Fully modified options ready for weighted selection
   */
  static applyContextualModifiers(options, context = {}) {
    if (!options || !Array.isArray(options)) return options;

    let modifiedOptions = options;

    // 1. Filter by ancestry first
    if (context.ancestry && context.category !== 'skipAncestry') {
      modifiedOptions = this.filterByAncestry(modifiedOptions, context.ancestry);
    }

    // 2. Apply influences from personalities/occupation
    if (context.influenceMap && context.category) {
      modifiedOptions = this.applyInfluences(modifiedOptions, context.influenceMap, context.category);
    }

    // 3. Apply age multipliers
    if (context.ageCategory) {
      modifiedOptions = this.applyAgeMultipliers(modifiedOptions, context.ageCategory);
    }

    // 4. Apply social class multipliers
    if (context.socialClass) {
      modifiedOptions = this.applyClassMultipliers(modifiedOptions, context.socialClass);
    }

    return modifiedOptions;
  }

  /**
   * Get age category from appearance age description
   * @param {Object} appearance - Appearance object with age
   * @returns {string} Age category (young, adult, mature, elderly)
   */
  static getAgeCategory(appearance) {
    if (!appearance || !appearance.age) return 'adult';

    const ageValue = appearance.age.value || appearance.age;
    const ageLower = (typeof ageValue === 'string' ? ageValue : '').toLowerCase();

    if (ageLower.includes('young') || ageLower.includes('youth') || ageLower.includes('teen')) {
      return 'young';
    } else if (ageLower.includes('elder') || ageLower.includes('old') || ageLower.includes('ancient')) {
      return 'elderly';
    } else if (ageLower.includes('mature') || ageLower.includes('middle')) {
      return 'mature';
    } else {
      return 'adult';
    }
  }

  /**
   * Select multiple unique items from an array
   * @param {Array} items - Items to select from
   * @param {number} count - Number to select
   * @returns {Array} Selected items
   */
  static selectUniqueItems(items, count) {
    if (count <= 0) return [];
    if (count >= items.length) return [...items];

    const selected = [];
    const available = [...items];

    for (let i = 0; i < count; i++) {
      if (available.length === 0) break;

      const index = Math.floor(Math.random() * available.length);
      selected.push(available[index]);
      available.splice(index, 1);
    }

    return selected;
  }

  /**
   * Get number of personalities based on detail level
   * @param {string} detailLevel
   * @returns {number}
   */
  static getNumPersonalities(detailLevel) {
    switch (detailLevel) {
      case "minimal": return 1;
      case "standard": return 1;
      case "detailed": return 2;
      case "cinematic": return 2;
      default: return 1;
    }
  }

  /**
   * Get number of mannerisms based on detail level
   * @param {string} detailLevel
   * @returns {number}
   */
  static getNumMannerisms(detailLevel) {
    switch (detailLevel) {
      case "minimal": return 1;
      case "standard": return 2;
      case "detailed": return 2;
      case "cinematic": return 3;
      default: return 2;
    }
  }

  /**
   * Get number of quirks based on detail level
   * @param {string} detailLevel
   * @returns {number}
   */
  static getNumQuirks(detailLevel) {
    switch (detailLevel) {
      case "minimal": return 0;
      case "standard": return Math.random() < 0.5 ? 1 : 0; // 50% chance
      case "detailed": return Math.random() < 0.7 ? 1 : 0; // 70% chance
      case "cinematic": return Math.random() < 0.4 ? 2 : 1; // Always at least 1, 40% chance for 2
      default: return 0;
    }
  }

  /**
   * Add NPC to memory to prevent repetition
   * @param {Object} seed - NPC seed to remember
   */
  static addToMemory(seed) {
    this.recentNPCs.push({
      mood: seed.mood.id,
      personalities: seed.personalities.map(p => p.id),
      mannerisms: seed.mannerisms.map(m => m.id),
      motivation: seed.motivation.id,
      quirks: seed.quirks.map(q => q.id),
      timestamp: seed.timestamp
    });

    // Trim memory if too large
    if (this.recentNPCs.length > this.MAX_MEMORY_SIZE) {
      this.recentNPCs.shift();
    }
  }

  /**
   * Check if NPC combination was recently used
   * @param {Object} npc - NPC to check
   * @returns {boolean} True if recently used
   */
  static wasRecentlyUsed(npc) {
    const recentCount = Math.min(this.recentNPCs.length, 5); // Check last 5 NPCs
    const recentNPCs = this.recentNPCs.slice(-recentCount);

    for (const recent of recentNPCs) {
      // Check if mood AND any personality matches
      if (recent.mood === npc.mood.id &&
          npc.personalities.some(p => recent.personalities.includes(p.id))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clear memory (useful for testing)
   */
  static clearMemory() {
    this.recentNPCs = [];
  }

  /**
   * Get memory stats (for debugging)
   * @returns {Object}
   */
  static getMemoryStats() {
    return {
      size: this.recentNPCs.length,
      maxSize: this.MAX_MEMORY_SIZE,
      npcs: this.recentNPCs
    };
  }

  /**
   * Generate physical appearance
   * @param {Object} appearanceData - Base appearance data
   * @param {Object} appearanceAncestryData - Ancestry-specific appearance data
   * @param {string} ancestry - NPC ancestry
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated appearance
   */
  static generateAppearance(appearanceData, appearanceAncestryData, ancestry, detailLevel) {
    if (!appearanceData) return null;

    const appearance = {
      age: RandomUtils.selectWeighted(appearanceData.ageCategories, "likelihood"),
      build: RandomUtils.selectWeighted(appearanceData.builds, "likelihood"),
      height: RandomUtils.selectWeighted(appearanceData.heights, "likelihood")
    };

    // Select hair color (check for exotic options based on ancestry)
    const exoticHairOptions = appearanceData.exoticHairColors?.filter(h =>
      h.ancestries.includes(ancestry)
    ) || [];

    if (exoticHairOptions.length > 0 && Math.random() < 0.3) {
      appearance.hairColor = RandomUtils.selectWeighted(exoticHairOptions, "likelihood");
    } else {
      appearance.hairColor = RandomUtils.selectWeighted(appearanceData.hairColors, "likelihood");
    }

    // Select eye color (check for exotic options based on ancestry)
    const exoticEyeOptions = appearanceData.exoticEyeColors?.filter(e =>
      e.ancestries.includes(ancestry)
    ) || [];

    if (exoticEyeOptions.length > 0 && Math.random() < 0.3) {
      appearance.eyeColor = RandomUtils.selectWeighted(exoticEyeOptions, "likelihood");
    } else {
      appearance.eyeColor = RandomUtils.selectWeighted(appearanceData.eyeColors, "likelihood");
    }

    // Select skin tone (check for exotic options based on ancestry)
    const exoticSkinOptions = appearanceData.exoticSkinTones?.filter(s =>
      s.ancestries.includes(ancestry)
    ) || [];

    if (exoticSkinOptions.length > 0 && Math.random() < 0.3) {
      appearance.skinTone = RandomUtils.selectWeighted(exoticSkinOptions, "likelihood");
    } else {
      appearance.skinTone = RandomUtils.selectWeighted(appearanceData.skinTones, "likelihood");
    }

    // Combine base distinguishing features with ancestry-specific ones and additional features
    const allFeatures = [...appearanceData.distinguishingFeatures];

    // Add ancestry-specific features
    if (appearanceAncestryData?.ancestrySpecificFeatures?.[ancestry]) {
      allFeatures.push(...appearanceAncestryData.ancestrySpecificFeatures[ancestry]);
    }

    // Add additional distinguishing features
    if (appearanceAncestryData?.additionalDistinguishingFeatures) {
      allFeatures.push(...appearanceAncestryData.additionalDistinguishingFeatures);
    }

    // Add cultural adornments
    const culturalAdornments = appearanceAncestryData?.culturalAdornments?.filter(a =>
      a.ancestries.includes("all") || a.ancestries.includes(ancestry)
    ) || [];

    if (culturalAdornments.length > 0) {
      allFeatures.push(...culturalAdornments);
    }

    // Select distinguishing features based on detail level
    const numFeatures = this.getNumDistinguishingFeatures(detailLevel);
    if (numFeatures > 0 && allFeatures.length > 0) {
      appearance.distinguishingFeatures = this.selectUniqueItems(allFeatures, numFeatures);
    }

    return appearance;
  }

  /**
   * Generate occupation and social class
   * @param {Object} occupationsData - Base occupations data
   * @param {Object} occupationsAncestryData - Ancestry-specific occupations
   * @param {string} ancestry - NPC ancestry
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated occupation
   */
  static generateOccupation(occupationsData, occupationsAncestryData, ancestry, detailLevel) {
    if (!occupationsData) return null;

    // Combine base professions with ancestry-specific ones
    const allProfessions = [...occupationsData.professions];

    // Add ancestry-specific professions if available (30% chance to use ancestry-specific)
    if (occupationsAncestryData?.ancestrySpecificProfessions?.[ancestry] && Math.random() < 0.3) {
      const ancestryProfs = occupationsAncestryData.ancestrySpecificProfessions[ancestry];
      // Prefer ancestry-specific professions
      const profession = RandomUtils.selectWeighted(ancestryProfs, "likelihood");

      // Select compatible social class
      const compatibleClasses = occupationsData.socialClasses.filter(sc =>
        profession.socialClass.includes(sc.id)
      );

      const socialClass = compatibleClasses.length > 0
        ? RandomUtils.selectWeighted(compatibleClasses, "likelihood")
        : RandomUtils.selectWeighted(occupationsData.socialClasses, "likelihood");

      return { profession, socialClass };
    }

    // Use base professions
    const profession = RandomUtils.selectWeighted(allProfessions, "likelihood");

    // Select social class compatible with profession
    const compatibleClasses = occupationsData.socialClasses.filter(sc =>
      profession.socialClass.includes(sc.id)
    );

    const socialClass = compatibleClasses.length > 0
      ? RandomUtils.selectWeighted(compatibleClasses, "likelihood")
      : RandomUtils.selectWeighted(occupationsData.socialClasses, "likelihood");

    return {
      profession,
      socialClass
    };
  }

  /**
   * Generate abilities
   * @param {Object} abilitiesData - Abilities data
   * @param {Object} occupation - NPC occupation
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated abilities
   */
  static generateAbilities(abilitiesData, occupation, detailLevel) {
    if (!abilitiesData) return null;

    // Select level range
    const levelRange = RandomUtils.selectWeighted(abilitiesData.levelRanges, "likelihood");
    const level = RandomUtils.selectFrom(levelRange.levels);

    // Select ability score profile
    const abilityProfile = RandomUtils.selectWeighted(abilitiesData.abilityScoreProfiles, "likelihood");

    // Select notable skills based on profession
    const professionSkills = occupation?.profession?.skills || [];
    const relevantSkills = abilitiesData.notableSkills.filter(skill =>
      professionSkills.includes(skill.id)
    );

    // Add some random skills for variety
    const numSkills = detailLevel === "minimal" ? 1 : detailLevel === "standard" ? 2 : 3;
    const allSkills = [...relevantSkills];

    // Add random skills if we don't have enough profession-relevant ones
    while (allSkills.length < numSkills && abilitiesData.notableSkills.length > 0) {
      const randomSkill = RandomUtils.selectFrom(abilitiesData.notableSkills);
      if (!allSkills.find(s => s.id === randomSkill.id)) {
        allSkills.push(randomSkill);
      }
    }

    const skills = this.selectUniqueItems(allSkills, Math.min(numSkills, allSkills.length));

    return {
      level,
      levelRange,
      abilityProfile,
      skills
    };
  }

  /**
   * Generate possessions
   * @param {Object} possessionsData - Possessions data
   * @param {Object} occupation - NPC occupation
   * @param {number} level - NPC level
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated possessions
   */
  static generatePossessions(possessionsData, occupation, level, detailLevel) {
    if (!possessionsData) return null;

    // Select wealth level based on social class
    const socialClassId = occupation?.socialClass?.id || "lower-class";
    const wealthWeights = {
      "destitute": [80, 15, 5, 0, 0, 0],
      "lower-class": [20, 50, 25, 5, 0, 0],
      "middle-class": [5, 25, 45, 20, 5, 0],
      "upper-class": [0, 5, 20, 40, 25, 10],
      "nobility": [0, 0, 5, 20, 40, 35]
    };

    const weights = wealthWeights[socialClassId] || wealthWeights["lower-class"];
    const wealthLevel = this.selectByWeightArray(possessionsData.wealthLevels, weights);

    // Select carried items
    const professionId = occupation?.profession?.id || "laborer";
    const numItems = detailLevel === "minimal" ? 2 : detailLevel === "standard" ? 3 : 5;

    // Prioritize items common for this profession
    const relevantItems = possessionsData.carriedItems.filter(item =>
      item.commonFor.includes(professionId) || item.commonFor.includes("all")
    );

    const items = this.selectUniqueItems(
      relevantItems.length > 0 ? relevantItems : possessionsData.carriedItems,
      numItems
    );

    // Add special items based on detail level and level
    const specialItems = [];
    if (detailLevel !== "minimal" && Math.random() < 0.3) {
      const eligibleSpecial = possessionsData.specialItems.filter(item =>
        !item.minLevel || level >= item.minLevel
      );
      if (eligibleSpecial.length > 0) {
        specialItems.push(RandomUtils.selectWeighted(eligibleSpecial, "likelihood"));
      }
    }

    return {
      wealthLevel,
      carriedItems: items,
      specialItems
    };
  }

  /**
   * Generate relationships
   * @param {Object} relationshipsData - Base relationships data
   * @param {Object} relationshipsExpandedData - Expanded relationships data
   * @param {Object} occupation - NPC occupation
   * @param {string} ancestry - NPC ancestry
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated relationships
   */
  static generateRelationships(relationshipsData, relationshipsExpandedData, occupation, ancestry, detailLevel) {
    if (!relationshipsData) return null;

    const relationships = {
      familyStatus: RandomUtils.selectWeighted(relationshipsData.familyStatus, "likelihood")
    };

    // Generate family members based on detail level
    const numFamily = detailLevel === "minimal" ? 0 : detailLevel === "standard" ? 1 : 2;
    if (numFamily > 0 && Math.random() < 0.6) {
      relationships.family = this.selectUniqueItems(relationshipsData.familyMembers,
        Math.floor(Math.random() * numFamily) + 1);
    }

    // Generate allies
    const numAllies = detailLevel === "minimal" ? 0 : detailLevel === "standard" ? 1 : 2;
    if (numAllies > 0 && Math.random() < 0.7) {
      relationships.allies = this.selectUniqueItems(relationshipsData.allies,
        Math.floor(Math.random() * numAllies) + 1);
    }

    // Generate enemies
    const numEnemies = detailLevel === "minimal" ? 0 : detailLevel === "standard" ? 1 : 2;
    if (numEnemies > 0 && Math.random() < 0.5) {
      relationships.enemies = this.selectUniqueItems(relationshipsData.enemies,
        Math.floor(Math.random() * numEnemies) + 1);
    }

    // Generate organization affiliations - prefer ancestry-specific organizations
    const professionId = occupation?.profession?.id || "laborer";

    // Combine base organizations with expanded ones
    let allOrgs = [...relationshipsData.organizations];
    if (relationshipsExpandedData?.additionalOrganizations) {
      allOrgs.push(...relationshipsExpandedData.additionalOrganizations);
    }

    // Check for ancestry-specific organizations
    if (relationshipsExpandedData?.ancestrySpecificOrganizations?.[ancestry]) {
      const ancestryOrgs = relationshipsExpandedData.ancestrySpecificOrganizations[ancestry];
      // 40% chance to use ancestry-specific organization
      if (Math.random() < 0.4) {
        const relevantAncestryOrgs = ancestryOrgs.filter(org =>
          org.professions.includes(professionId)
        );
        if (relevantAncestryOrgs.length > 0 && detailLevel !== "minimal" && Math.random() < 0.5) {
          const org = RandomUtils.selectWeighted(relevantAncestryOrgs, "likelihood");
          relationships.organization = {
            ...org,
            status: RandomUtils.selectFrom(org.status)
          };
          return relationships;
        }
      }
    }

    // Use general organizations
    const relevantOrgs = allOrgs.filter(org =>
      org.professions.includes(professionId)
    );

    if (detailLevel !== "minimal" && Math.random() < 0.4) {
      const orgPool = relevantOrgs.length > 0 ? relevantOrgs : allOrgs;
      const org = RandomUtils.selectWeighted(orgPool, "likelihood");
      relationships.organization = {
        ...org,
        status: RandomUtils.selectFrom(org.status)
      };
    }

    return relationships;
  }

  /**
   * Generate plot hooks
   * @param {Object} plotHooksData - Base plot hooks data
   * @param {Object} plotHooksExpandedData - Expanded plot hooks data
   * @param {Object} occupation - NPC occupation
   * @param {Object} relationships - NPC relationships
   * @param {string} ancestry - NPC ancestry
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated plot hooks
   */
  static generatePlotHooks(plotHooksData, plotHooksExpandedData, occupation, relationships, ancestry, detailLevel) {
    if (!plotHooksData) return null;

    const hooks = {};

    // Combine base and expanded secrets
    const allSecrets = [...plotHooksData.secrets];
    if (plotHooksExpandedData?.additionalSecrets) {
      allSecrets.push(...plotHooksExpandedData.additionalSecrets);
    }

    // Add secret based on detail level - filtered by ancestry
    if (detailLevel !== "minimal" && Math.random() < 0.4) {
      const filteredSecrets = this.filterByAncestry(allSecrets, ancestry);
      hooks.secret = RandomUtils.selectWeighted(filteredSecrets, "likelihood");
    }

    // Combine base and expanded goals
    const allGoals = [...plotHooksData.goals];
    if (plotHooksExpandedData?.additionalGoals) {
      allGoals.push(...plotHooksExpandedData.additionalGoals);
    }

    // Add goal (more likely in detailed modes) - filtered by ancestry
    const goalChance = detailLevel === "minimal" ? 0.3 : detailLevel === "standard" ? 0.6 : 0.8;
    if (Math.random() < goalChance) {
      const filteredGoals = this.filterByAncestry(allGoals, ancestry);
      hooks.goal = RandomUtils.selectWeighted(filteredGoals, "likelihood");
    }

    // Combine base and expanded conflicts
    const allConflicts = [...plotHooksData.conflicts];
    if (plotHooksExpandedData?.additionalConflicts) {
      allConflicts.push(...plotHooksExpandedData.additionalConflicts);
    }

    // Add conflict - filtered by ancestry
    const conflictChance = detailLevel === "minimal" ? 0.2 : detailLevel === "standard" ? 0.5 : 0.7;
    if (Math.random() < conflictChance) {
      const filteredConflicts = this.filterByAncestry(allConflicts, ancestry);
      hooks.conflict = RandomUtils.selectWeighted(filteredConflicts, "likelihood");
    }

    // Combine base and expanded quest hooks
    const allQuestHooks = [...plotHooksData.questHooks];
    if (plotHooksExpandedData?.additionalQuestHooks) {
      allQuestHooks.push(...plotHooksExpandedData.additionalQuestHooks);
    }

    // Add quest hook (only in detailed/cinematic, and only sometimes) - filtered by ancestry
    if ((detailLevel === "detailed" || detailLevel === "cinematic") && Math.random() < 0.3) {
      const filteredQuestHooks = this.filterByAncestry(allQuestHooks, ancestry);
      hooks.questHook = RandomUtils.selectWeighted(filteredQuestHooks, "likelihood");
    }

    return Object.keys(hooks).length > 0 ? hooks : null;
  }

  /**
   * Get number of distinguishing features based on detail level
   * @param {string} detailLevel
   * @returns {number}
   */
  static getNumDistinguishingFeatures(detailLevel) {
    switch (detailLevel) {
      case "minimal": return 0;
      case "standard": return Math.random() < 0.5 ? 1 : 0;
      case "detailed": return 1;
      case "cinematic": return Math.random() < 0.5 ? 2 : 1;
      default: return 0;
    }
  }

  /**
   * Select item by weight array
   * @param {Array} items - Items to select from
   * @param {Array} weights - Weight for each item
   * @returns {Object} Selected item
   */
  static selectByWeightArray(items, weights) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  /**
   * Generate PF2e Influence stat block
   * @param {Object} influenceData - Influence system data
   * @param {Object} occupation - NPC occupation
   * @param {Object} abilities - NPC abilities
   * @param {Object} mood - NPC mood
   * @param {Array} personalities - NPC personality traits
   * @param {Object} plotHooks - NPC plot hooks
   * @returns {Object} Influence stat block
   */
  static generateInfluence(influenceData, occupation, abilities, mood, personalities, plotHooks) {
    if (!influenceData) return null;

    const level = abilities?.level || 0;
    const professionId = occupation?.profession?.id || "laborer";

    // Base DCs based on level (PF2e rules)
    const baseDC = 14 + level;  // Standard DC for level
    const hardDC = baseDC + 2;
    const veryHardDC = baseDC + 5;
    const easyDC = baseDC - 2;
    const veryEasyDC = baseDC - 5;

    // Will modifier (typically level + 2-4)
    const willMod = level + Math.floor(Math.random() * 3) + 2;

    // Perception modifier (typically level + 2-4)
    const perceptionMod = level + Math.floor(Math.random() * 3) + 2;

    // Discovery DC (usually a bit easier than influence)
    const discoveryDC = baseDC - 1;

    // Select discovery skills
    const numDiscoverySkills = Math.floor(Math.random() * 2) + 1; // 1-2 skills
    const discoverySkills = this.selectUniqueItems(influenceData.discoverySkills, numDiscoverySkills);

    // Select influence skills based on profession
    const professionRelevantSkills = influenceData.influenceSkills.filter(skill =>
      skill.professions.includes("all") || skill.professions.includes(professionId)
    );

    // Always include Diplomacy, but it shouldn't be the best skill
    const diplomacySkill = influenceData.influenceSkills.find(s => s.id === "diplomacy");

    // Select 3-5 influence skills
    const numInfluenceSkills = Math.floor(Math.random() * 3) + 3; // 3-5 skills
    const selectedSkills = [];

    // Add profession-relevant skills first
    if (professionRelevantSkills.length > 0) {
      const relevant = this.selectUniqueItems(professionRelevantSkills, Math.min(2, professionRelevantSkills.length));
      selectedSkills.push(...relevant);
    }

    // Add Diplomacy if not already included
    if (!selectedSkills.find(s => s.id === "diplomacy") && diplomacySkill) {
      selectedSkills.push(diplomacySkill);
    }

    // Fill remaining slots with random skills
    while (selectedSkills.length < numInfluenceSkills) {
      const randomSkill = RandomUtils.selectFrom(influenceData.influenceSkills);
      if (!selectedSkills.find(s => s.id === randomSkill.id)) {
        selectedSkills.push(randomSkill);
      }
    }

    // Assign DCs to skills (best skill gets easy DC, worst gets hard DC)
    const influenceSkills = selectedSkills.map((skill, index) => {
      let dc;
      if (index === 0) {
        dc = easyDC; // Best skill
      } else if (index === 1) {
        dc = baseDC; // Second best
      } else if (index === selectedSkills.length - 1) {
        dc = hardDC; // Worst skill
      } else {
        dc = baseDC; // Middle skills
      }

      return {
        ...skill,
        dc
      };
    });

    // Select resistances (0-2 based on personality)
    const numResistances = Math.floor(Math.random() * 3); // 0-2
    const resistances = numResistances > 0 ? this.selectUniqueItems(influenceData.resistances, numResistances) : [];

    // Select weaknesses (1-3, most NPCs have at least one)
    const numWeaknesses = Math.floor(Math.random() * 3) + 1; // 1-3
    const weaknesses = this.selectUniqueItems(influenceData.weaknesses, numWeaknesses);

    // Select biases (0-2)
    const numBiases = Math.floor(Math.random() * 3); // 0-2
    const biases = numBiases > 0 ? this.selectUniqueItems(influenceData.biases, numBiases) : [];

    // Determine influence thresholds based on level
    // Lower level NPCs need fewer points
    const thresholdMultiplier = level < 3 ? 1 : level < 7 ? 1.5 : 2;
    const thresholds = influenceData.influenceThresholds.map(t => ({
      ...t,
      points: Math.ceil(t.points * thresholdMultiplier)
    }));

    // Select potential penalty if antagonized
    const penalty = Math.random() < 0.6 ? RandomUtils.selectFrom(influenceData.penaltyEvents) : null;

    // Determine number of rounds (time available)
    const rounds = Math.floor(Math.random() * 3) + 3; // 3-5 rounds typical

    return {
      perception: perceptionMod,
      will: willMod,
      discovery: {
        dc: discoveryDC,
        skills: discoverySkills
      },
      influenceSkills,
      thresholds,
      resistances,
      weaknesses,
      biases,
      penalty,
      rounds
    };
  }

  /**
   * Generate psychological depth (fears, desires, regrets, vices, virtues)
   * @param {Object} data - Psychological depth data
   * @param {Array} personalities - Selected personality traits
   * @param {Object} occupation - Occupation data
   * @param {Object} plotHooks - Plot hooks (for consistency)
   * @param {string} ancestry - NPC ancestry
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Psychology data
   */
  static generatePsychology(data, personalities, occupation, plotHooks, ancestry, detailLevel) {
    if (!data) return null;

    const numItems = detailLevel === "cinematic" ? 2 : 1;

    // Select fears (1-2) - filtered by ancestry
    const filteredFears = this.filterByAncestry(data.fears, ancestry);
    const fears = RandomUtils.selectWeightedMultiple(filteredFears, "likelihood", numItems);

    // Select desires (1-2) - filtered by ancestry
    const filteredDesires = this.filterByAncestry(data.desires, ancestry);
    const desires = RandomUtils.selectWeightedMultiple(filteredDesires, "likelihood", numItems);

    // Select regrets (0-1, not everyone has notable regrets) - filtered by ancestry
    const filteredRegrets = this.filterByAncestry(data.regrets, ancestry);
    const regrets = Math.random() < 0.7 ? [RandomUtils.selectWeighted(filteredRegrets, "likelihood")] : [];

    // Select vices (1-2) - filtered by ancestry
    const filteredVices = this.filterByAncestry(data.vices, ancestry);
    const vices = RandomUtils.selectWeightedMultiple(filteredVices, "likelihood", numItems);

    // Select virtues (1-3, most people have some virtues) - filtered by ancestry
    const numVirtues = detailLevel === "cinematic" ? 3 : 2;
    const filteredVirtues = this.filterByAncestry(data.virtues, ancestry);
    const virtues = RandomUtils.selectWeightedMultiple(filteredVirtues, "likelihood", numVirtues);

    return {
      fears,
      desires,
      regrets,
      vices,
      virtues
    };
  }

  /**
   * Generate physical details (voice, scars, tattoos, clothing, quirks)
   * @param {Object} data - Physical details data
   * @param {string} ancestry - Character ancestry
   * @param {Object} occupation - Occupation data
   * @param {Object} psychology - Psychology data (for consistency)
   * @param {Object} context - Context object with influenceMap, ageCategory, socialClass
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Physical details
   */
  static generatePhysicalDetails(data, ancestry, occupation, psychology, context, detailLevel) {
    if (!data) return null;

    // Voice quality - with contextual modifiers
    const contextualVoiceQualities = this.applyContextualModifiers(
      data.voiceQualities,
      { ...context, category: 'voice' }
    );
    const voice = RandomUtils.selectWeighted(contextualVoiceQualities, "likelihood");

    // Scars/markings (40% chance, higher for certain occupations) - with contextual modifiers
    const hasScars = Math.random() < (occupation.socialClass?.includes("lower-class") ? 0.6 : 0.4);
    const contextualScarsAndMarkings = this.applyContextualModifiers(
      data.scarsAndMarkings,
      { ...context, category: 'physical' }
    );
    const scars = hasScars ? [RandomUtils.selectWeighted(contextualScarsAndMarkings, "likelihood")] : [];

    // Tattoos (30% chance, varies by culture) - with contextual modifiers
    const hasTattoos = Math.random() < 0.3;
    const contextualTattoos = this.applyContextualModifiers(
      data.tattoos,
      { ...context, category: 'physical' }
    );
    const tattoos = hasTattoos ? [RandomUtils.selectWeighted(contextualTattoos, "likelihood")] : [];

    // Clothing style (always have one) - with contextual modifiers
    const contextualClothingStyles = this.applyContextualModifiers(
      data.clothingStyles,
      { ...context, category: 'appearance' }
    );
    const clothing = RandomUtils.selectWeighted(contextualClothingStyles, "likelihood");

    // Jewelry (50% chance) - with contextual modifiers
    const hasJewelry = Math.random() < 0.5;
    const contextualJewelry = this.applyContextualModifiers(
      data.jewelry,
      { ...context, category: 'appearance' }
    );
    const jewelry = hasJewelry ? [RandomUtils.selectWeighted(contextualJewelry, "likelihood")] : [];

    // Physical quirks (1-2 for detailed/cinematic) - with contextual modifiers
    const numQuirks = detailLevel === "minimal" || detailLevel === "standard" ? 1 : 2;
    const contextualPhysicalQuirks = this.applyContextualModifiers(
      data.physicalQuirks,
      { ...context, category: 'physical' }
    );
    const physicalQuirks = this.selectUniqueItems(contextualPhysicalQuirks, numQuirks);

    // Posture - with contextual modifiers
    const contextualPosture = this.applyContextualModifiers(
      data.posture,
      { ...context, category: 'physical' }
    );
    const posture = RandomUtils.selectWeighted(contextualPosture, "likelihood");

    // Hygiene - with contextual modifiers
    const contextualHygiene = this.applyContextualModifiers(
      data.hygiene,
      { ...context, category: 'appearance' }
    );
    const hygiene = RandomUtils.selectWeighted(contextualHygiene, "likelihood");

    return {
      voice,
      scars,
      tattoos,
      clothing,
      jewelry,
      physicalQuirks,
      posture,
      hygiene
    };
  }

  /**
   * Generate life history
   * @param {Object} data - Life history data
   * @param {string} ancestry - Character ancestry
   * @param {Object} occupation - Occupation data
   * @param {Object} psychology - Psychology data (for consistency)
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Life history
   */
  static generateLifeHistory(data, ancestry, occupation, psychology, detailLevel) {
    if (!data) return null;

    // Childhood event (70% chance of notable event)
    const childhoodEvents = Math.random() < 0.7 ? [RandomUtils.selectWeighted(data.childhoodEvents, "likelihood")] : [];

    // Formative experience (always at least one)
    const numFormative = detailLevel === "cinematic" ? 2 : 1;
    const formativeExperiences = this.selectUniqueItems(data.formativeExperiences, numFormative);

    // Major life events (0-2)
    const numMajor = detailLevel === "cinematic" ? 2 : (Math.random() < 0.6 ? 1 : 0);
    const majorLifeEvents = numMajor > 0 ? this.selectUniqueItems(data.majorLifeEvents, numMajor) : [];

    // Education
    const education = RandomUtils.selectWeighted(data.education, "likelihood");

    // Travel history
    const travelHistory = RandomUtils.selectWeighted(data.travelHistory, "likelihood");

    return {
      childhoodEvents,
      formativeExperiences,
      majorLifeEvents,
      education,
      travelHistory
    };
  }

  /**
   * Generate daily life patterns
   * @param {Object} data - Daily life data
   * @param {Object} occupation - Occupation data
   * @param {Object} psychology - Psychology data
   * @param {Object} lifeHistory - Life history (for consistency)
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Daily life details
   */
  static generateDailyLife(data, occupation, psychology, lifeHistory, detailLevel) {
    if (!data) return null;

    // Habits (1-2)
    const numHabits = detailLevel === "cinematic" ? 2 : 1;
    const habits = this.selectUniqueItems(data.habits, numHabits);

    // Hobbies (0-2)
    const numHobbies = detailLevel === "minimal" ? 0 : (detailLevel === "cinematic" ? 2 : 1);
    const hobbies = numHobbies > 0 ? this.selectUniqueItems(data.hobbies, numHobbies) : [];

    // Favorite things (1-2 for detailed/cinematic)
    const numFavorites = detailLevel === "detailed" || detailLevel === "cinematic" ? 2 : 1;
    const favoriteThings = this.selectUniqueItems(data.favoritethings, numFavorites);

    // Pet peeves (1-2)
    const numPeeves = detailLevel === "cinematic" ? 2 : 1;
    const petPeeves = this.selectUniqueItems(data.petPeeves, numPeeves);

    // Morning routine
    const morningRoutine = RandomUtils.selectWeighted(data.morningRoutines, "likelihood");

    // Evening routine
    const eveningRoutine = RandomUtils.selectWeighted(data.eveningRoutines, "likelihood");

    // Social patterns
    const socialPatterns = RandomUtils.selectWeighted(data.socialPatterns, "likelihood");

    return {
      habits,
      hobbies,
      favoriteThings,
      petPeeves,
      morningRoutine,
      eveningRoutine,
      socialPatterns
    };
  }

  /**
   * Generate speech patterns
   * @param {Object} data - Speech patterns data
   * @param {Object} occupation - Occupation data
   * @param {Object} lifeHistory - Life history (for consistency)
   * @param {Array} personalities - Personality traits
   * @param {string} ancestry - NPC ancestry
   * @param {Object} context - Context object with influenceMap, ageCategory, socialClass
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Speech patterns
   */
  static generateSpeechPatterns(data, occupation, lifeHistory, personalities, ancestry, context, detailLevel) {
    if (!data) return null;

    // Catchphrases (1-2) - with contextual modifiers
    const numCatchphrases = detailLevel === "cinematic" ? 2 : 1;
    const contextualCatchphrases = this.applyContextualModifiers(
      data.catchphrases,
      { ...context, category: 'speech' }
    );
    const catchphrases = this.selectUniqueItems(contextualCatchphrases, numCatchphrases);

    // Verbal tics (0-2, not everyone has them) - with contextual modifiers
    const hasVerbals = Math.random() < 0.6;
    const numVerbalTics = hasVerbals ? (detailLevel === "cinematic" ? 2 : 1) : 0;
    const contextualVerbalTics = this.applyContextualModifiers(
      data.verbalTics,
      { ...context, category: 'speech' }
    );
    const verbalTics = numVerbalTics > 0 ? this.selectUniqueItems(contextualVerbalTics, numVerbalTics) : [];

    // Conversation style - with contextual modifiers
    const contextualConversationStyles = this.applyContextualModifiers(
      data.conversationStyles,
      { ...context, category: 'speech' }
    );
    const conversationStyle = RandomUtils.selectWeighted(contextualConversationStyles, "likelihood");

    // Accent (based on background) - with contextual modifiers
    const contextualAccents = this.applyContextualModifiers(
      data.accents,
      { ...context, category: 'speech' }
    );
    const accent = RandomUtils.selectWeighted(contextualAccents, "likelihood");

    // Speaking speed - with contextual modifiers
    const contextualSpeakingSpeed = this.applyContextualModifiers(
      data.speakingSpeed,
      { ...context, category: 'speech' }
    );
    const speakingSpeed = RandomUtils.selectWeighted(contextualSpeakingSpeed, "likelihood");

    // Laugh type - with contextual modifiers
    const contextualLaughTypes = this.applyContextualModifiers(
      data.laughTypes,
      { ...context, category: 'speech' }
    );
    const laugh = RandomUtils.selectWeighted(contextualLaughTypes, "likelihood");

    // Emotional tells (1-2) - with contextual modifiers
    const numTells = detailLevel === "cinematic" ? 2 : 1;
    const contextualEmotionalTells = this.applyContextualModifiers(
      data.emotionalTells,
      { ...context, category: 'speech' }
    );
    const emotionalTells = this.selectUniqueItems(contextualEmotionalTells, numTells);

    return {
      catchphrases,
      verbalTics,
      conversationStyle,
      accent,
      speakingSpeed,
      laugh,
      emotionalTells
    };
  }

  /**
   * Generate character complexity (contradictions, conflicts, hidden depths)
   * @param {Object} data - Character complexity data
   * @param {Array} personalities - Personality traits
   * @param {Object} psychology - Psychology data
   * @param {Object} plotHooks - Plot hooks (for consistency)
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Character complexity
   */
  static generateComplexity(data, personalities, psychology, plotHooks, detailLevel) {
    if (!data) return null;

    // Contradictions (0-1, makes characters more real)
    const hasContradiction = Math.random() < 0.6;
    const contradictions = hasContradiction ? [RandomUtils.selectWeighted(data.contradictions, "likelihood")] : [];

    // Internal conflicts (0-1)
    const hasConflict = Math.random() < 0.7;
    const internalConflicts = hasConflict ? [RandomUtils.selectWeighted(data.internalConflicts, "likelihood")] : [];

    // Hidden depths (0-1, 50% of people have secrets)
    const hasHiddenDepth = Math.random() < 0.5;
    const hiddenDepths = hasHiddenDepth ? [RandomUtils.selectWeighted(data.hiddenDepths, "likelihood")] : [];

    // Character arc (80% are working through something)
    const hasArc = Math.random() < 0.8;
    const characterArcs = hasArc ? [RandomUtils.selectWeighted(data.characterArcs, "likelihood")] : [];

    // Moral complexity (always have one)
    const moralComplexity = RandomUtils.selectWeighted(data.moralComplexity, "likelihood");

    return {
      contradictions,
      internalConflicts,
      hiddenDepths,
      characterArcs,
      moralComplexity
    };
  }

  /**
   * Generate current situation (what they're dealing with right now)
   * @param {Object} data - Current situation data
   * @param {Object} occupation - Occupation data
   * @param {Object} plotHooks - Plot hooks (for consistency)
   * @param {Object} psychology - Psychology data
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Current situation
   */
  static generateCurrentSituation(data, occupation, plotHooks, psychology, detailLevel) {
    if (!data) return null;

    // Immediate problems (0-1, not everyone has pressing issues)
    const hasProblem = Math.random() < 0.6;
    const immediateProblems = hasProblem ? [RandomUtils.selectWeighted(data.immediateProblems, "likelihood")] : [];

    // Short-term goals (always at least one)
    const numGoals = detailLevel === "cinematic" ? 2 : 1;
    const shortTermGoals = this.selectUniqueItems(data.shortTermGoals, numGoals);

    // Recent events (0-1, 70% have something recent)
    const hasRecentEvent = Math.random() < 0.7;
    const recentEvents = hasRecentEvent ? [RandomUtils.selectWeighted(data.recentEvents, "likelihood")] : [];

    // Current mood (always)
    const currentMood = RandomUtils.selectWeighted(data.currentMood, "likelihood");

    // Stakes (what's at risk for them)
    const stakes = Math.random() < 0.8 ? RandomUtils.selectWeighted(data.stakes, "likelihood") : null;

    // Time constraints (if they have problems or goals)
    const hasTimeConstraint = immediateProblems.length > 0 || shortTermGoals.length > 0;
    const timeConstraints = hasTimeConstraint ? RandomUtils.selectWeighted(data.timeConstraints, "likelihood") : null;

    return {
      immediateProblems,
      shortTermGoals,
      recentEvents,
      currentMood,
      stakes,
      timeConstraints
    };
  }

  /**
   * Generate emotional triggers (what sets them off, wins them over)
   * @param {Object} data - Emotional triggers data
   * @param {Object} psychology - Psychology data (for consistency)
   * @param {Array} personalities - Personality traits (for consistency)
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Emotional triggers
   */
  static generateEmotionalTriggers(data, psychology, personalities, detailLevel) {
    if (!data) return null;

    // Emotional triggers (1-2)
    const numTriggers = detailLevel === "cinematic" ? 2 : 1;
    const emotionalTriggers = this.selectUniqueItems(data.emotionalTriggers, numTriggers);

    // Hot buttons (things that anger them, 1-2)
    const numHotButtons = detailLevel === "cinematic" ? 2 : 1;
    const hotButtons = this.selectUniqueItems(data.hotButtons, numHotButtons);

    // Soft spots (things that touch them emotionally, 1)
    const softSpots = [RandomUtils.selectWeighted(data.softSpots, "likelihood")];

    // Trust builders (how to earn trust, 1-2)
    const numTrustBuilders = detailLevel === "cinematic" ? 2 : 1;
    const trustBuilders = this.selectUniqueItems(data.trustBuilders, numTrustBuilders);

    // Dealbreakers (things they can't tolerate, 0-1)
    const hasDealbreaker = Math.random() < 0.7;
    const dealbreakers = hasDealbreaker ? [RandomUtils.selectWeighted(data.dealbreakers, "likelihood")] : [];

    // Loyalty conditions (what keeps them loyal, 1)
    const loyaltyConditions = [RandomUtils.selectWeighted(data.loyaltyConditions, "likelihood")];

    // Persuasion vulnerabilities (how to convince them, 1-2)
    const numPersuasion = detailLevel === "cinematic" ? 2 : 1;
    const persuasionVulnerabilities = this.selectUniqueItems(data.persuasionVulnerabilities, numPersuasion);

    return {
      emotionalTriggers,
      hotButtons,
      softSpots,
      trustBuilders,
      dealbreakers,
      loyaltyConditions,
      persuasionVulnerabilities
    };
  }

  /**
   * Generate secrets and information layers (progressive disclosure)
   * @param {Object} data - Secrets and information data
   * @param {Object} occupation - Occupation data (for consistency)
   * @param {Object} plotHooks - Plot hooks (for consistency)
   * @param {Object} psychology - Psychology data (for consistency)
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Secrets and information
   */
  static generateSecrets(data, occupation, plotHooks, psychology, detailLevel) {
    if (!data) return null;

    // Surface information (what they'll tell strangers, 2-3)
    const numSurface = detailLevel === "cinematic" ? 3 : 2;
    const surfaceInformation = this.selectUniqueItems(data.surfaceInformation, numSurface);

    // Personal information (what they'll tell acquaintances, 2-3)
    const numPersonal = detailLevel === "cinematic" ? 3 : 2;
    const personalInformation = this.selectUniqueItems(data.personalInformation, numPersonal);

    // Intimate information (what they'll tell friends, 1-2)
    const numIntimate = detailLevel === "cinematic" ? 2 : 1;
    const intimateInformation = this.selectUniqueItems(data.intimateInformation, numIntimate);

    // Deep secrets (what they hide from everyone, 0-1)
    const hasDeepSecret = Math.random() < 0.6;
    const deepSecrets = hasDeepSecret ? [RandomUtils.selectWeighted(data.deepSecrets, "likelihood")] : [];

    // Knowledge areas (what they know about, 2-3)
    const numKnowledge = detailLevel === "cinematic" ? 3 : 2;
    const knowledgeAreas = this.selectUniqueItems(data.knowledgeAreas, numKnowledge);

    // Hidden agendas (0-1, 40% have one)
    const hasAgenda = Math.random() < 0.4;
    const hiddenAgendas = hasAgenda ? [RandomUtils.selectWeighted(data.hiddenAgendas, "likelihood")] : [];

    return {
      surfaceInformation,
      personalInformation,
      intimateInformation,
      deepSecrets,
      knowledgeAreas,
      hiddenAgendas
    };
  }

  /**
   * Generate economic reality (wealth, debts, financial pressures)
   * @param {Object} data - Economic reality data
   * @param {Object} occupation - Occupation data (for consistency)
   * @param {Object} currentSituation - Current situation (for consistency)
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Economic reality
   */
  static generateEconomics(data, occupation, currentSituation, detailLevel) {
    if (!data) return null;

    // Wealth level (always)
    const wealthLevel = RandomUtils.selectWeighted(data.wealthLevels, "likelihood");

    // Income source (1-2)
    const numIncome = detailLevel === "cinematic" ? 2 : 1;
    const incomeSources = this.selectUniqueItems(data.incomeSourceTypes, numIncome);

    // Debt situation (0-1, 50% have debt)
    const hasDebt = Math.random() < 0.5;
    const debtSituation = hasDebt ? RandomUtils.selectWeighted(data.debtSituations, "likelihood") : null;

    // Creditor (only if has debt)
    const creditor = hasDebt ? RandomUtils.selectWeighted(data.creditorTypes, "likelihood") : null;

    // Financial pressures (0-2, 60% have at least one)
    const hasPressures = Math.random() < 0.6;
    const numPressures = hasPressures ? (detailLevel === "cinematic" ? 2 : 1) : 0;
    const financialPressures = numPressures > 0 ? this.selectUniqueItems(data.financialPressures, numPressures) : [];

    // Financial goals (1)
    const financialGoals = [RandomUtils.selectWeighted(data.financialGoals, "likelihood")];

    // Attitude toward money (always)
    const attitudeTowardMoney = RandomUtils.selectWeighted(data.attitudeTowardMoney, "likelihood");

    // Hidden assets (0-1, 20% have something hidden)
    const hasHiddenAssets = Math.random() < 0.2;
    const hiddenAssets = hasHiddenAssets ? [RandomUtils.selectWeighted(data.hiddenAssets, "likelihood")] : [];

    return {
      wealthLevel,
      incomeSources,
      debtSituation,
      creditor,
      financialPressures,
      financialGoals,
      attitudeTowardMoney,
      hiddenAssets
    };
  }

  /**
   * Generate sensory signature (how they smell, sound, feel)
   * @param {Object} data - Sensory signature data
   * @param {Object} occupation - Occupation data (for consistency)
   * @param {Object} physicalDetails - Physical details (for consistency)
   * @param {string} ancestry - NPC ancestry
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Sensory signature
   */
  static generateSensory(data, occupation, physicalDetails, ancestry, detailLevel) {
    if (!data) return null;

    // Scent (always) - filtered by ancestry
    const filteredScents = this.filterByAncestry(data.scents, ancestry);
    const scent = RandomUtils.selectWeighted(filteredScents, "likelihood");

    // Sounds (1-2) - filtered by ancestry
    const numSounds = detailLevel === "cinematic" ? 2 : 1;
    const filteredSounds = this.filterByAncestry(data.sounds, ancestry);
    const sounds = this.selectUniqueItems(filteredSounds, numSounds);

    // Texture (always) - filtered by ancestry
    const filteredTextures = this.filterByAncestry(data.textures, ancestry);
    const texture = RandomUtils.selectWeighted(filteredTextures, "likelihood");

    // Temperature (always) - filtered by ancestry
    const filteredTemperatures = this.filterByAncestry(data.temperatures, ancestry);
    const temperature = RandomUtils.selectWeighted(filteredTemperatures, "likelihood");

    // Aura (always) - filtered by ancestry
    const filteredAuras = this.filterByAncestry(data.auras, ancestry);
    const aura = RandomUtils.selectWeighted(filteredAuras, "likelihood");

    // Visual signature (1-2) - filtered by ancestry
    const numVisual = detailLevel === "cinematic" ? 2 : 1;
    const filteredVisualSignature = this.filterByAncestry(data.visualSignature, ancestry);
    const visualSignature = this.selectUniqueItems(filteredVisualSignature, numVisual);

    return {
      scent,
      sounds,
      texture,
      temperature,
      aura,
      visualSignature
    };
  }

  /**
   * Generate health status (conditions, fitness, mental health)
   * @param {Object} data - Health conditions data
   * @param {number} age - Age of NPC
   * @param {Object} occupation - Occupation data (for consistency)
   * @param {Object} lifeHistory - Life history (for consistency)
   * @param {string} ancestry - NPC ancestry
   * @param {Object} context - Context object with influenceMap, ageCategory, socialClass
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Health status
   */
  static generateHealth(data, age, occupation, lifeHistory, ancestry, context, detailLevel) {
    if (!data) return null;

    // Chronic conditions (0-1, increases with age) - with contextual modifiers
    const chronicChance = age < 30 ? 0.2 : age < 50 ? 0.4 : 0.6;
    const hasChronic = Math.random() < chronicChance;
    const contextualChronicConditions = this.applyContextualModifiers(
      data.chronicConditions,
      { ...context, category: 'health' }
    );
    const chronicConditions = hasChronic ? [RandomUtils.selectWeighted(contextualChronicConditions, "likelihood")] : [];

    // Disabilities (0-1, rare but possible) - with contextual modifiers
    const hasDisability = Math.random() < 0.15;
    const contextualDisabilities = this.applyContextualModifiers(
      data.disabilities,
      { ...context, category: 'health' }
    );
    const disabilities = hasDisability ? [RandomUtils.selectWeighted(contextualDisabilities, "likelihood")] : [];

    // Fitness level (always) - with contextual modifiers
    const contextualFitnessLevels = this.applyContextualModifiers(
      data.fitnessLevels,
      { ...context, category: 'health' }
    );
    const fitnessLevel = RandomUtils.selectWeighted(contextualFitnessLevels, "likelihood");

    // Allergies and sensitivities (0-2, 40% have at least one) - with contextual modifiers
    const hasAllergies = Math.random() < 0.4;
    const numAllergies = hasAllergies ? (detailLevel === "cinematic" ? 2 : 1) : 0;
    const contextualAllergiesAndSensitivities = this.applyContextualModifiers(
      data.allergiesAndSensitivities,
      { ...context, category: 'health' }
    );
    const allergiesAndSensitivities = numAllergies > 0 ? this.selectUniqueItems(contextualAllergiesAndSensitivities, numAllergies) : [];

    // Mental health (0-1, 50% have something) - with contextual modifiers
    const hasMentalHealth = Math.random() < 0.5;
    const contextualMentalHealthConditions = this.applyContextualModifiers(
      data.mentalHealthConditions,
      { ...context, category: 'health' }
    );
    const mentalHealthConditions = hasMentalHealth ? [RandomUtils.selectWeighted(contextualMentalHealthConditions, "likelihood")] : [];

    // Addictions (0-1, 30% have one) - with contextual modifiers
    const hasAddiction = Math.random() < 0.3;
    const contextualAddictions = this.applyContextualModifiers(
      data.addictions,
      { ...context, category: 'health' }
    );
    const addictions = hasAddiction ? [RandomUtils.selectWeighted(contextualAddictions, "likelihood")] : [];

    // Current health status (always) - with contextual modifiers
    const contextualCurrentHealthStatus = this.applyContextualModifiers(
      data.currentHealthStatus,
      { ...context, category: 'health' }
    );
    const currentHealthStatus = RandomUtils.selectWeighted(contextualCurrentHealthStatus, "likelihood");

    // Scars and injury history (always at least one type) - with contextual modifiers
    const contextualScarsAndInjuryHistory = this.applyContextualModifiers(
      data.scarsAndInjuryHistory,
      { ...context, category: 'health' }
    );
    const scarsAndInjuryHistory = RandomUtils.selectWeighted(contextualScarsAndInjuryHistory, "likelihood");

    return {
      chronicConditions,
      disabilities,
      fitnessLevel,
      allergiesAndSensitivities,
      mentalHealthConditions,
      addictions,
      currentHealthStatus,
      scarsAndInjuryHistory
    };
  }

  /**
   * Generate relationship dynamics (how they treat different groups)
   * @param {Object} data - Relationship dynamics data
   * @param {Object} psychology - Psychology data (for consistency)
   * @param {Object} lifeHistory - Life history (for consistency)
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Relationship dynamics
   */
  static generateRelationshipDynamics(data, psychology, lifeHistory, detailLevel) {
    if (!data) return null;

    // Treatment of different groups (always)
    const treatmentOfNobles = RandomUtils.selectWeighted(data.treatmentOfNobles, "likelihood");
    const treatmentOfCommoners = RandomUtils.selectWeighted(data.treatmentOfCommoners, "likelihood");
    const treatmentOfChildren = RandomUtils.selectWeighted(data.treatmentOfChildren, "likelihood");
    const treatmentOfElderly = RandomUtils.selectWeighted(data.treatmentOfElderly, "likelihood");
    const treatmentOfForeigners = RandomUtils.selectWeighted(data.treatmentOfForeigners, "likelihood");
    const treatmentOfAuthority = RandomUtils.selectWeighted(data.treatmentOfAuthority, "likelihood");
    const treatmentOfCriminals = RandomUtils.selectWeighted(data.treatmentOfCriminals, "likelihood");
    const treatmentOfReligious = RandomUtils.selectWeighted(data.treatmentOfReligious, "likelihood");
    const treatmentOfWealthy = RandomUtils.selectWeighted(data.treatmentOfWealthy, "likelihood");
    const treatmentOfPoor = RandomUtils.selectWeighted(data.treatmentOfPoor, "likelihood");

    // Social masks (always)
    const socialMask = RandomUtils.selectWeighted(data.socialMasks, "likelihood");

    // Genuine with (always)
    const genuineWith = RandomUtils.selectWeighted(data.genuineWith, "likelihood");

    // Conflict style (always)
    const conflictStyle = RandomUtils.selectWeighted(data.conflictStyle, "likelihood");

    // Boundaries with strangers (always)
    const boundariesWithStrangers = RandomUtils.selectWeighted(data.boundariesWithStrangers, "likelihood");

    return {
      treatmentOfNobles,
      treatmentOfCommoners,
      treatmentOfChildren,
      treatmentOfElderly,
      treatmentOfForeigners,
      treatmentOfAuthority,
      treatmentOfCriminals,
      treatmentOfReligious,
      treatmentOfWealthy,
      treatmentOfPoor,
      socialMask,
      genuineWith,
      conflictStyle,
      boundariesWithStrangers
    };
  }

  /**
   * Generate professional expertise (occupation-specific knowledge)
   * @param {Object} data - Professional expertise data
   * @param {Object} occupation - Occupation data (for consistency)
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Professional expertise
   */
  static generateProfessionalExpertise(data, occupation, detailLevel) {
    if (!data) return null;

    // Get occupation-specific expertise
    const occupationKey = occupation.name.toLowerCase().replace(/\s+/g, "-");
    const expertise = data.expertiseByOccupation[occupationKey] || data.expertiseByOccupation["merchant"];

    // Knowledge areas (2-4 from their occupation)
    const numKnowledge = detailLevel === "cinematic" ? 4 : 2;
    const knowledge = this.selectUniqueItems(expertise.knowledge, Math.min(numKnowledge, expertise.knowledge.length));

    // Skills (2-3 from their occupation)
    const numSkills = detailLevel === "cinematic" ? 3 : 2;
    const skills = this.selectUniqueItems(expertise.skills, Math.min(numSkills, expertise.skills.length));

    // Contacts (1-3 from their occupation)
    const numContacts = detailLevel === "cinematic" ? 3 : 1;
    const contacts = this.selectUniqueItems(expertise.contacts, Math.min(numContacts, expertise.contacts.length));

    // Secrets (0-1 from their occupation, 50% chance)
    const hasSecret = Math.random() < 0.5;
    const secrets = hasSecret && expertise.secrets ? [expertise.secrets[Math.floor(Math.random() * expertise.secrets.length)]] : [];

    // Teachable skills (1-2)
    const numTeachable = detailLevel === "cinematic" ? 2 : 1;
    const teachableSkills = this.selectUniqueItems(data.teachableSkills, numTeachable);

    // Professional opinions (1-2)
    const numOpinions = detailLevel === "cinematic" ? 2 : 1;
    const professionalOpinions = this.selectUniqueItems(data.professionalOpinions, numOpinions);

    // Insider knowledge (0-1, 60% have something)
    const hasInsider = Math.random() < 0.6;
    const insiderKnowledge = hasInsider ? [RandomUtils.selectWeighted(data.insiderKnowledge, "likelihood")] : [];

    return {
      knowledge,
      skills,
      contacts,
      secrets,
      teachableSkills,
      professionalOpinions,
      insiderKnowledge
    };
  }

  /**
   * Generate sample dialogue (3-5 example lines in their voice)
   * @param {Object} speechPatterns - Speech patterns data
   * @param {Array} personalities - Personality traits
   * @param {Object} mood - Current mood
   * @param {Object} currentSituation - Current situation
   * @param {Object} emotionalTriggers - Emotional triggers
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Dialogue samples
   */
  static generateDialogueSamples(speechPatterns, personalities, mood, currentSituation, emotionalTriggers, detailLevel) {
    if (!speechPatterns || !personalities) return null;

    const numSamples = detailLevel === "cinematic" ? 5 : 3;
    const samples = [];

    // Sample contexts for dialogue
    const contexts = [
      { context: "greeting", description: "Meeting someone for the first time" },
      { context: "angry", description: "When one of their hot buttons is pressed" },
      { context: "pleased", description: "When in a good mood or complimented" },
      { context: "bargaining", description: "Negotiating or making a deal" },
      { context: "threatening", description: "When they feel threatened or defensive" },
      { context: "friendly", description: "Talking with someone they trust" },
      { context: "dismissive", description: "Brushing someone off" },
      { context: "curious", description: "Asking questions or investigating" }
    ];

    // Select unique contexts
    const selectedContexts = this.selectUniqueItems(contexts, numSamples);

    selectedContexts.forEach(ctx => {
      samples.push({
        context: ctx.description,
        line: this.generateDialogueLine(speechPatterns, personalities, mood, ctx.context)
      });
    });

    return {
      samples,
      notes: "These are examples of how this NPC speaks. Combine their speech patterns, personality, and mood to improvise similar dialogue."
    };
  }

  /**
   * Generate a single line of dialogue
   * @param {Object} speechPatterns - Speech patterns
   * @param {Array} personalities - Personality traits
   * @param {Object} mood - Current mood
   * @param {string} context - Context for the line
   * @returns {string} Generated dialogue line
   */
  static generateDialogueLine(speechPatterns, personalities, mood, context) {
    // This creates template-based dialogue that reflects their speech patterns
    const speed = speechPatterns.speakingSpeed?.speed || "moderate";
    const style = speechPatterns.conversationStyle?.style || "direct";
    const accent = speechPatterns.accent?.accent || "neutral";

    // Include verbal tic if they have one
    const tic = speechPatterns.verbalTics && speechPatterns.verbalTics.length > 0
      ? speechPatterns.verbalTics[0].tic
      : "";

    // Include catchphrase occasionally
    const useCatchphrase = speechPatterns.catchphrases &&
                          speechPatterns.catchphrases.length > 0 &&
                          Math.random() < 0.3;
    const catchphrase = useCatchphrase ? speechPatterns.catchphrases[0].phrase : "";

    // Build dialogue based on context
    let line = "";

    switch(context) {
      case "greeting":
        line = style === "verbose"
          ? `Ah, greetings and salutations! ${tic} What brings you to my door?`
          : style === "curt"
          ? `Yeah? ${tic} What?`
          : `Hello there. ${tic} Can I help you?`;
        break;
      case "angry":
        line = speed === "rapid"
          ? `Listen here ${tic} I've had enough of this nonsense, you understand me?`
          : `I will not ${tic} tolerate this kind of disrespect.`;
        break;
      case "pleased":
        line = style === "verbose"
          ? `My dear friend, ${tic} you have truly made my day! ${catchphrase}`
          : `Good. ${tic} I appreciate that. ${catchphrase}`;
        break;
      case "bargaining":
        line = style === "manipulative"
          ? `Now, ${tic} I'm sure we can come to an... arrangement that benefits us both.`
          : `Here's what I can offer: ${tic} Fair price, no tricks.`;
        break;
      case "threatening":
        line = style === "curt"
          ? `${tic} Back off. Now.`
          : `I would strongly advise ${tic} that you reconsider your current course of action.`;
        break;
      case "friendly":
        line = `You know what? ${tic} I like you. ${catchphrase}`;
        break;
      case "dismissive":
        line = style === "curt"
          ? `Not interested. ${tic} Move along.`
          : `I'm afraid I simply don't have time for this ${tic} at the moment.`;
        break;
      case "curious":
        line = speed === "rapid"
          ? `Wait wait wait ${tic} tell me more about that!`
          : `Interesting. ${tic} Go on...`;
        break;
      default:
        line = `${tic} Well, that's how it is. ${catchphrase}`;
    }

    return line.replace(/\s+/g, ' ').trim();
  }

  /**
   * Generate voice template (complete voice guide for GMs)
   * @param {Object} speechPatterns - Speech patterns
   * @param {Array} personalities - Personality traits
   * @param {Object} psychology - Psychology data
   * @param {Object} relationshipDynamics - Relationship dynamics
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Voice template
   */
  static generateVoiceTemplate(speechPatterns, personalities, psychology, relationshipDynamics, detailLevel) {
    if (!speechPatterns || !personalities) return null;

    // Build comprehensive voice guide
    const template = {
      overview: this.buildVoiceOverview(speechPatterns, personalities),
      sentenceStructure: this.buildSentenceStructure(speechPatterns),
      vocabularyGuidelines: this.buildVocabularyGuidelines(personalities, psychology),
      topicsToSeek: this.buildTopicsToSeek(personalities, psychology),
      topicsToAvoid: this.buildTopicsToAvoid(psychology, relationshipDynamics),
      emotionalExpression: this.buildEmotionalExpression(speechPatterns, personalities),
      bodyLanguage: this.buildBodyLanguage(personalities, relationshipDynamics)
    };

    return template;
  }

  static buildVoiceOverview(speechPatterns, personalities) {
    const speed = speechPatterns.speakingSpeed?.speed || "moderate";
    const style = speechPatterns.conversationStyle?.style || "direct";
    const personality = personalities[0]?.trait || "practical";

    return `This NPC speaks ${speed}ly with a ${style} conversational style. Their ${personality} personality comes through in every interaction.`;
  }

  static buildSentenceStructure(speechPatterns) {
    const style = speechPatterns.conversationStyle?.style || "direct";

    const structures = {
      "verbose": "Uses long, elaborate sentences with multiple clauses. Rarely uses simple statements.",
      "curt": "Speaks in short, clipped sentences. Often just a few words. Gets to the point.",
      "rambling": "Sentences tend to wander. Starts one thought, shifts to another. Uses lots of 'and' and 'but'.",
      "formal": "Uses complete, grammatically correct sentences. Avoids contractions. Proper structure.",
      "poetic": "Speaks in metaphors and flowing phrases. May use unusual word order for effect.",
      "direct": "Clear, straightforward sentences. No unnecessary words. Gets message across efficiently.",
      "storytelling": "Often frames things as narratives. 'It was like...' or 'Reminds me of the time...'",
      "questioning": "Frequently asks questions. Even statements may end with 'you know?' or 'right?'",
      "sarcastic": "Uses irony and reverse meaning. Tone is key to understanding their actual intent.",
      "manipulative": "Carefully chosen words. Implies rather than states. Leaves room for deniability."
    };

    return structures[style] || structures["direct"];
  }

  static buildVocabularyGuidelines(personalities, psychology) {
    const guidelines = [];

    if (personalities.some(p => p.trait === "educated" || p.trait === "scholarly")) {
      guidelines.push("Uses educated vocabulary, technical terms, and precise language");
    }
    if (personalities.some(p => p.trait === "crude" || p.trait === "rough")) {
      guidelines.push("Uses rough language, slang, and colorful expressions");
    }
    if (psychology?.fears?.some(f => f.fear?.includes("appear ignorant"))) {
      guidelines.push("Avoids admitting not knowing something, may use big words incorrectly");
    }
    if (personalities.some(p => p.trait === "humble" || p.trait === "modest")) {
      guidelines.push("Downplays their own achievements, uses self-deprecating language");
    }

    if (guidelines.length === 0) {
      guidelines.push("Uses everyday vocabulary appropriate to their occupation and background");
    }

    return guidelines;
  }

  static buildTopicsToSeek(personalities, psychology) {
    const topics = [];

    if (psychology?.interests && psychology.interests.length > 0) {
      topics.push(`Loves talking about: ${psychology.interests.map(i => i.interest).join(", ")}`);
    }
    if (psychology?.passions && psychology.passions.length > 0) {
      topics.push(`Passionate about: ${psychology.passions.map(p => p.passion).join(", ")}`);
    }
    if (personalities.some(p => p.trait === "gossipy" || p.trait === "curious")) {
      topics.push("Always wants to hear the latest news and gossip");
    }

    return topics.length > 0 ? topics : ["Will discuss most topics relevant to their work"];
  }

  static buildTopicsToAvoid(psychology, relationshipDynamics) {
    const topics = [];

    if (psychology?.shameSources && psychology.shameSources.length > 0) {
      topics.push(`Shameful topics: ${psychology.shameSources.map(s => s.source).join(", ")}`);
    }
    if (psychology?.fears && psychology.fears.length > 0) {
      topics.push(`Fearful topics: ${psychology.fears.map(f => f.fear).join(", ")}`);
    }
    if (relationshipDynamics?.boundariesWithStrangers?.boundaries?.includes("Closed")) {
      topics.push("Personal matters, family, feelings");
    }

    return topics.length > 0 ? topics : ["No particular topics to avoid"];
  }

  static buildEmotionalExpression(speechPatterns, personalities) {
    const tells = speechPatterns.emotionalTells || [];
    const laugh = speechPatterns.laugh?.laugh || "normal laugh";

    return {
      whenHappy: `${laugh}, may speak faster or more animatedly`,
      whenAngry: tells.find(t => t.emotion === "Anger")?.tell || "Voice becomes sharper, more clipped",
      whenSad: tells.find(t => t.emotion === "Sadness")?.tell || "Speaks more quietly, pauses more",
      whenLying: tells.find(t => t.emotion === "Lying")?.tell || "May avoid eye contact, fidget"
    };
  }

  static buildBodyLanguage(personalities, relationshipDynamics) {
    const language = [];

    if (personalities.some(p => p.trait === "confident" || p.trait === "bold")) {
      language.push("Stands tall, makes strong eye contact, uses expansive gestures");
    } else if (personalities.some(p => p.trait === "shy" || p.trait === "timid")) {
      language.push("Avoids eye contact, closed posture, small gestures");
    }

    if (relationshipDynamics?.conflictStyle?.style === "Aggressive") {
      language.push("When angry: leans forward, invades personal space, points");
    } else if (relationshipDynamics?.conflictStyle?.style === "Avoidant") {
      language.push("When uncomfortable: backs away, looks for exits, fidgets");
    }

    return language.length > 0 ? language : ["Body language matches their mood and personality"];
  }

  /**
   * Generate story hooks (quests they can offer)
   * @param {Object} plotHooks - Plot hooks
   * @param {Object} currentSituation - Current situation
   * @param {Object} occupation - Occupation
   * @param {Object} relationships - Relationships
   * @param {Object} economics - Economic situation
   * @param {Object} secrets - Secrets
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Story hooks
   */
  static generateStoryHooks(plotHooks, currentSituation, occupation, relationships, economics, secrets, detailLevel) {
    if (!plotHooks) return null;

    const numHooks = detailLevel === "cinematic" ? 3 : 2;
    const hooks = [];

    // Generate hooks based on their current problems
    if (currentSituation?.immediateProblems && currentSituation.immediateProblems.length > 0) {
      const problem = currentSituation.immediateProblems[0];
      hooks.push({
        type: "Help Needed",
        hook: `${problem.problem}`,
        reward: this.generateQuestReward(economics, occupation),
        consequence: "May become grateful ally if helped, or desperate enemy if refused",
        urgency: currentSituation.timeConstraints?.constraint || "No immediate deadline"
      });
    }

    // Generate hooks based on their goals
    if (currentSituation?.shortTermGoals && currentSituation.shortTermGoals.length > 0) {
      const goal = currentSituation.shortTermGoals[0];
      hooks.push({
        type: "Mutual Benefit",
        hook: `Wants to ${goal.goal.toLowerCase()} and could use assistance`,
        reward: this.generateQuestReward(economics, occupation),
        consequence: "Success could lead to ongoing partnership",
        urgency: "Willing to wait for right opportunity"
      });
    }

    // Generate hooks based on their secrets
    if (secrets?.deepSecrets && secrets.deepSecrets.length > 0 && Math.random() < 0.5) {
      hooks.push({
        type: "Hidden Agenda",
        hook: "Has a secret need they won't immediately reveal",
        reward: "Will offer significant reward if trust is earned",
        consequence: "Getting involved may draw unwanted attention",
        urgency: "Very patient, playing the long game"
      });
    }

    // Generate hooks based on relationships
    if (relationships?.relationshipTypes && relationships.relationshipTypes.length > 0 && hooks.length < numHooks) {
      const rel = relationships.relationshipTypes[0];
      hooks.push({
        type: "Relationship Drama",
        hook: `Issues with their ${rel.type}: ${rel.description}`,
        reward: "Gratitude and social connections",
        consequence: "May create enemies among their associates",
        urgency: "Situation is ongoing"
      });
    }

    // Pad with plot hooks if needed
    while (hooks.length < numHooks && plotHooks) {
      const plotHook = plotHooks[0];
      hooks.push({
        type: "Adventure Hook",
        hook: plotHook.hook || "Has information about a local situation",
        reward: this.generateQuestReward(economics, occupation),
        consequence: "Standard adventure consequences",
        urgency: "Flexible timing"
      });
    }

    return {
      availableQuests: hooks.slice(0, numHooks),
      notes: "These are potential quests this NPC could offer. Availability depends on relationship with PCs and current circumstances."
    };
  }

  static generateQuestReward(economics, occupation) {
    if (!economics?.wealthLevel) {
      return "Appropriate reward for the task";
    }

    const wealth = economics.wealthLevel.name || "Moderate wealth";
    const rewards = {
      "Destitute": "Heartfelt gratitude, perhaps a small keepsake",
      "Poor": "A few copper coins, whatever they can spare",
      "Struggling": "A silver or two, possibly a useful item",
      "Modest": "Fair payment in silver, or a favor",
      "Comfortable": "Generous payment in gold",
      "Wealthy": "Substantial gold reward",
      "Very Wealthy": "Gold and valuable items",
      "Extremely Wealthy": "Large sum of gold plus rare items or influence"
    };

    return rewards[wealth] || "Appropriate reward for the task";
  }

  /**
   * Generate a variant of an existing NPC (family member, younger/older version, etc.)
   * @param {Object} baseNPC - The base NPC to create a variant from
   * @param {string} variantType - Type of variant: "family", "younger", "older", "corrupted", "redeemed"
   * @param {Object} params - Additional parameters
   * @returns {Object} Variant NPC seed
   */
  static async generateVariant(baseNPC, variantType = "family", params = {}) {
    if (!baseNPC) return null;

    const detailLevel = params.detailLevel || baseNPC.detailLevel || "standard";

    switch(variantType) {
      case "family":
        return await this.generateFamilyMember(baseNPC, params);
      case "younger":
        return await this.generateYoungerVersion(baseNPC, params);
      case "older":
        return await this.generateOlderVersion(baseNPC, params);
      case "corrupted":
        return await this.generateCorruptedVersion(baseNPC, params);
      case "redeemed":
        return await this.generateRedeemedVersion(baseNPC, params);
      default:
        return await this.generateFamilyMember(baseNPC, params);
    }
  }

  /**
   * Generate a family member variant
   */
  static async generateFamilyMember(baseNPC, params = {}) {
    const relationship = params.relationship || this.selectRandom(["sibling", "parent", "child", "cousin"]);

    // Generate new NPC with some inherited traits
    const newNPC = await this.generate({
      ...params,
      ancestry: baseNPC.ancestry, // Same ancestry
      detailLevel: baseNPC.detailLevel
    });

    if (!newNPC) return null;

    // Add family resemblance notes
    newNPC.familyConnection = {
      relativeTo: baseNPC.name,
      relationship: relationship,
      sharedTraits: this.identifySharedTraits(baseNPC, newNPC),
      familyDynamic: this.generateFamilyDynamic(relationship)
    };

    return newNPC;
  }

  /**
   * Generate younger version (10-20 years ago)
   */
  static async generateYoungerVersion(baseNPC, params = {}) {
    const newNPC = await this.generate({
      ...params,
      ancestry: baseNPC.ancestry,
      detailLevel: baseNPC.detailLevel
    });

    if (!newNPC) return null;

    newNPC.variantNote = {
      type: "younger",
      description: `This is ${baseNPC.name} from 10-20 years ago`,
      differences: [
        "More idealistic and naive",
        "Less scarred and weathered",
        "Different occupation (earlier in career)",
        "Fewer regrets and burdens"
      ]
    };

    return newNPC;
  }

  /**
   * Generate older version (10-20 years in future)
   */
  static async generateOlderVersion(baseNPC, params = {}) {
    const newNPC = await this.generate({
      ...params,
      ancestry: baseNPC.ancestry,
      detailLevel: baseNPC.detailLevel
    });

    if (!newNPC) return null;

    newNPC.variantNote = {
      type: "older",
      description: `This is ${baseNPC.name} 10-20 years in the future`,
      differences: [
        "More cynical or wise",
        "More scars and health issues",
        "Advanced in career or retired",
        "Consequences of past choices visible"
      ]
    };

    return newNPC;
  }

  /**
   * Generate corrupted version (fell to darkness)
   */
  static async generateCorruptedVersion(baseNPC, params = {}) {
    const newNPC = await this.generate({
      ...params,
      ancestry: baseNPC.ancestry,
      detailLevel: baseNPC.detailLevel
    });

    if (!newNPC) return null;

    newNPC.variantNote = {
      type: "corrupted",
      description: `This is ${baseNPC.name} after falling to darkness`,
      corruption: "Their original virtues twisted into vices",
      differences: [
        "Original personality traits inverted",
        "Former allies now enemies",
        "Motivated by revenge or power",
        "Willing to cross moral lines they once respected"
      ]
    };

    return newNPC;
  }

  /**
   * Generate redeemed version (seeking redemption)
   */
  static async generateRedeemedVersion(baseNPC, params = {}) {
    const newNPC = await this.generate({
      ...params,
      ancestry: baseNPC.ancestry,
      detailLevel: baseNPC.detailLevel
    });

    if (!newNPC) return null;

    newNPC.variantNote = {
      type: "redeemed",
      description: `This is ${baseNPC.name} seeking redemption`,
      redemption: "Trying to make amends for past wrongs",
      differences: [
        "Haunted by past actions",
        "Genuinely trying to change",
        "May not be fully trusted yet",
        "Willing to sacrifice for others"
      ]
    };

    return newNPC;
  }

  static identifySharedTraits(npc1, npc2) {
    const shared = [];

    if (npc1.ancestry?.name === npc2.ancestry?.name) {
      shared.push(`Both ${npc1.ancestry.name}`);
    }

    // Check for personality overlaps
    const personalities1 = npc1.personalities?.map(p => p.trait) || [];
    const personalities2 = npc2.personalities?.map(p => p.trait) || [];
    const sharedPersonalities = personalities1.filter(p => personalities2.includes(p));

    if (sharedPersonalities.length > 0) {
      shared.push(`Shared personality: ${sharedPersonalities.join(", ")}`);
    }

    return shared.length > 0 ? shared : ["Family resemblance in appearance"];
  }

  static generateFamilyDynamic(relationship) {
    const dynamics = {
      "sibling": ["Competitive", "Supportive", "Estranged", "Close friends", "Rival", "Protective"],
      "parent": ["Loving", "Strict", "Distant", "Proud", "Disappointed", "Controlling"],
      "child": ["Rebellious", "Dutiful", "Independent", "Struggling", "Successful", "Disappointed"],
      "cousin": ["Friendly", "Barely know each other", "Like siblings", "Competitive", "Business partners"]
    };

    const options = dynamics[relationship] || ["Complex relationship"];
    return this.selectRandom(options);
  }

  /**
   * Generate a rival NPC (opposing goals, similar capabilities)
   * @param {Object} baseNPC - The NPC to create a rival for
   * @param {Object} params - Additional parameters
   * @returns {Object} Rival NPC seed
   */
  static async generateRival(baseNPC, params = {}) {
    if (!baseNPC) return null;

    const rivalNPC = await this.generate({
      ...params,
      detailLevel: baseNPC.detailLevel
    });

    if (!rivalNPC) return null;

    rivalNPC.relationshipToBase = {
      type: "Rival",
      target: baseNPC.name,
      nature: this.selectRandom([
        "Professional competition",
        "Romantic rivalry",
        "Ideological opposition",
        "Resource competition",
        "Personal grudge",
        "Political opposition"
      ]),
      history: this.selectRandom([
        "Long-standing rivalry",
        "Recent conflict",
        "Betrayal in the past",
        "Competing for same goal",
        "Philosophical differences"
      ]),
      currentStatus: this.selectRandom([
        "Active competition",
        "Cold war",
        "Occasional clashes",
        "Intensifying conflict",
        "Stalemate"
      ]),
      strength: "Roughly equal in capabilities to create interesting conflict"
    };

    return rivalNPC;
  }

  /**
   * Generate an ally NPC (compatible goals, complementary skills)
   * @param {Object} baseNPC - The NPC to create an ally for
   * @param {Object} params - Additional parameters
   * @returns {Object} Ally NPC seed
   */
  static async generateAlly(baseNPC, params = {}) {
    if (!baseNPC) return null;

    const allyNPC = await this.generate({
      ...params,
      detailLevel: baseNPC.detailLevel
    });

    if (!allyNPC) return null;

    allyNPC.relationshipToBase = {
      type: "Ally",
      target: baseNPC.name,
      nature: this.selectRandom([
        "Longtime friends",
        "Business partners",
        "Shared cause",
        "Mutual benefit arrangement",
        "Former enemies turned allies",
        "Saved each other's lives"
      ]),
      strengths: this.selectRandom([
        "Complements base NPC's skills",
        "Provides resources base NPC lacks",
        "Has connections base NPC needs",
        "Offers different perspective",
        "Covers base NPC's weaknesses"
      ]),
      trustLevel: this.selectRandom([
        "Absolute trust",
        "High trust with some boundaries",
        "Professional trust",
        "Conditional trust",
        "Growing trust"
      ]),
      reliability: this.selectRandom([
        "Always reliable",
        "Reliable in crisis",
        "Usually reliable",
        "Reliable but has own priorities",
        "Reliable unless conflicted"
      ])
    };

    return allyNPC;
  }

  /**
   * Generate an enemy NPC (active opposition, history of conflict)
   * @param {Object} baseNPC - The NPC to create an enemy for
   * @param {Object} params - Additional parameters
   * @returns {Object} Enemy NPC seed
   */
  static async generateEnemy(baseNPC, params = {}) {
    if (!baseNPC) return null;

    const enemyNPC = await this.generate({
      ...params,
      detailLevel: baseNPC.detailLevel
    });

    if (!enemyNPC) return null;

    enemyNPC.relationshipToBase = {
      type: "Enemy",
      target: baseNPC.name,
      origin: this.selectRandom([
        "Base NPC wronged them",
        "They wronged base NPC",
        "Mutual betrayal",
        "Ideological hatred",
        "Competing for something important",
        "Collateral damage escalated",
        "Family feud",
        "Professional destruction"
      ]),
      intensity: this.selectRandom([
        "Burning hatred",
        "Cold professional enmity",
        "Obsessive vendetta",
        "Bitter resentment",
        "Calculated opposition"
      ]),
      activelyHostile: this.selectRandom([
        "Actively seeking to destroy base NPC",
        "Will sabotage when opportunity arises",
        "Waiting for the right moment",
        "Using proxies and indirect methods",
        "Open warfare"
      ]),
      dangerLevel: this.selectRandom([
        "Dangerous - has means and motive",
        "Very dangerous - well-positioned to strike",
        "Extremely dangerous - obsessed and capable",
        "Moderate threat - limited resources",
        "Unpredictable threat"
      ])
    };

    return enemyNPC;
  }

  /**
   * Helper method to select random item from array
   */
  static selectRandom(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Initialize session tracking fields for GM use
   * @returns {Object} Session tracking object
   */
  static initializeSessionTracking() {
    return {
      gmNotes: "",
      pcRelationships: {
        // Will be populated with PC names as keys
        // Each PC gets: { attitude: 0, trust: 0, notes: "" }
        // attitude: -10 (hostile) to +10 (friendly), default 0 (neutral)
        // trust: 0 (no trust) to 10 (complete trust)
      },
      promisesMade: [],
      // { promise: "description", to: "PC name", date: timestamp, kept: false }
      threatsMade: [],
      // { threat: "description", to: "PC name", date: timestamp, carried_out: false }
      informationRevealed: [],
      // { info: "description", to: "PC name", date: timestamp, tier: "surface/personal/intimate/deep" }
      questsGiven: [],
      // { quest: "description", to: "PC name", date: timestamp, status: "active/completed/failed/abandoned" }
      sessionHistory: [],
      // { session: number, date: timestamp, summary: "what happened", attitude_change: 0 }
      lastSeen: null,
      // timestamp of last interaction
      currentDisposition: "neutral",
      // current overall disposition: hostile/unfriendly/neutral/friendly/helpful
      importantEvents: []
      // { event: "description", date: timestamp, impact: "positive/negative/neutral" }
    };
  }

  /**
   * Update NPC attitude towards a PC
   * @param {Object} npc - NPC seed object
   * @param {string} pcName - Name of the PC
   * @param {number} attitudeChange - Change in attitude (-10 to +10)
   * @param {string} reason - Reason for the change
   */
  static updateAttitude(npc, pcName, attitudeChange, reason = "") {
    if (!npc?.sessionTracking) return;

    if (!npc.sessionTracking.pcRelationships[pcName]) {
      npc.sessionTracking.pcRelationships[pcName] = {
        attitude: 0,
        trust: 0,
        notes: ""
      };
    }

    const rel = npc.sessionTracking.pcRelationships[pcName];
    rel.attitude = Math.max(-10, Math.min(10, rel.attitude + attitudeChange));

    if (reason) {
      rel.notes += `\n[${new Date().toISOString().split('T')[0]}] ${reason} (${attitudeChange > 0 ? '+' : ''}${attitudeChange})`;
    }

    // Update overall disposition based on average attitude
    this.updateOverallDisposition(npc);
  }

  /**
   * Update overall disposition based on PC relationships
   */
  static updateOverallDisposition(npc) {
    if (!npc?.sessionTracking?.pcRelationships) return;

    const relationships = Object.values(npc.sessionTracking.pcRelationships);
    if (relationships.length === 0) {
      npc.sessionTracking.currentDisposition = "neutral";
      return;
    }

    const avgAttitude = relationships.reduce((sum, rel) => sum + rel.attitude, 0) / relationships.length;

    if (avgAttitude <= -6) npc.sessionTracking.currentDisposition = "hostile";
    else if (avgAttitude <= -2) npc.sessionTracking.currentDisposition = "unfriendly";
    else if (avgAttitude <= 2) npc.sessionTracking.currentDisposition = "neutral";
    else if (avgAttitude <= 6) npc.sessionTracking.currentDisposition = "friendly";
    else npc.sessionTracking.currentDisposition = "helpful";
  }

  /**
   * Record a promise made by the NPC
   */
  static recordPromise(npc, promise, to, kept = false) {
    if (!npc?.sessionTracking) return;

    npc.sessionTracking.promisesMade.push({
      promise,
      to,
      date: Date.now(),
      kept
    });
  }

  /**
   * Record a threat made by the NPC
   */
  static recordThreat(npc, threat, to, carriedOut = false) {
    if (!npc?.sessionTracking) return;

    npc.sessionTracking.threatsMade.push({
      threat,
      to,
      date: Date.now(),
      carried_out: carriedOut
    });
  }

  /**
   * Record information revealed to a PC
   */
  static recordInformation(npc, info, to, tier = "surface") {
    if (!npc?.sessionTracking) return;

    npc.sessionTracking.informationRevealed.push({
      info,
      to,
      date: Date.now(),
      tier
    });
  }

  /**
   * Record a quest given
   */
  static recordQuest(npc, quest, to, status = "active") {
    if (!npc?.sessionTracking) return;

    npc.sessionTracking.questsGiven.push({
      quest,
      to,
      date: Date.now(),
      status
    });
  }

  /**
   * Record session interaction
   */
  static recordSession(npc, sessionNumber, summary, attitudeChange = 0) {
    if (!npc?.sessionTracking) return;

    npc.sessionTracking.sessionHistory.push({
      session: sessionNumber,
      date: Date.now(),
      summary,
      attitude_change: attitudeChange
    });

    npc.sessionTracking.lastSeen = Date.now();
  }

  /**
   * Record an important event
   */
  static recordEvent(npc, event, impact = "neutral") {
    if (!npc?.sessionTracking) return;

    npc.sessionTracking.importantEvents.push({
      event,
      date: Date.now(),
      impact
    });
  }

  /**
   * Export NPC to Foundry VTT actor
   * @param {Object} npc - NPC seed object
   * @param {Object} options - Export options
   * @returns {Promise<Actor>} Created Foundry actor
   */
  static async exportToFoundry(npc, options = {}) {
    if (!npc) return null;

    const actorData = {
      name: npc.name,
      type: "npc",
      system: {
        details: {
          level: { value: options.level || 1 },
          ancestry: npc.ancestry?.name || "Unknown",
          background: npc.occupation?.name || "Commoner",
          biography: {
            value: this.buildFoundryBiography(npc),
            public: options.publicBio || ""
          }
        },
        attributes: this.buildFoundryAttributes(npc),
        traits: {
          size: { value: npc.physicalDetails?.build?.size || "med" },
          languages: this.buildFoundryLanguages(npc)
        }
      },
      items: this.buildFoundryItems(npc),
      flags: {
        "pf2e-narrative-seeds": {
          fullNPCSeed: options.includeFullSeed ? npc : null,
          npcId: npc.timestamp,
          detailLevel: npc.detailLevel,
          generatedDate: new Date(npc.timestamp).toISOString()
        }
      }
    };

    // Create the actor
    try {
      const actor = await Actor.create(actorData, { renderSheet: options.openSheet !== false });
      console.log("PF2e Narrative Seeds | Created Foundry actor:", actor.name);
      return actor;
    } catch (error) {
      console.error("PF2e Narrative Seeds | Error creating Foundry actor:", error);
      return null;
    }
  }

  /**
   * Build Foundry biography from NPC data
   */
  static buildFoundryBiography(npc) {
    let bio = `<h2>${npc.name}</h2>\n`;
    bio += `<p><strong>${npc.ancestry?.name} ${npc.occupation?.name}</strong></p>\n`;

    if (npc.appearance) {
      bio += `<h3>Appearance</h3>\n<p>${npc.appearance.description}</p>\n`;
    }

    if (npc.personalities && npc.personalities.length > 0) {
      bio += `<h3>Personality</h3>\n<p>${npc.personalities.map(p => p.trait).join(", ")}</p>\n`;
    }

    if (npc.motivation) {
      bio += `<h3>Motivation</h3>\n<p>${npc.motivation.motivation}</p>\n`;
    }

    if (npc.occupation?.description) {
      bio += `<h3>Occupation</h3>\n<p>${npc.occupation.description}</p>\n`;
    }

    if (npc.plotHooks && npc.plotHooks.length > 0) {
      bio += `<h3>Plot Hooks</h3>\n<ul>\n`;
      npc.plotHooks.forEach(hook => {
        bio += `<li>${hook.hook}</li>\n`;
      });
      bio += `</ul>\n`;
    }

    if (npc.currentSituation?.immediateProblems && npc.currentSituation.immediateProblems.length > 0) {
      bio += `<h3>Current Situation</h3>\n`;
      npc.currentSituation.immediateProblems.forEach(problem => {
        bio += `<p>${problem.problem}</p>\n`;
      });
    }

    return bio;
  }

  /**
   * Build Foundry attributes from NPC abilities
   */
  static buildFoundryAttributes(npc) {
    if (!npc.abilities) {
      return {
        perception: { value: 0 },
        hp: { max: 20, value: 20 }
      };
    }

    // Convert text abilities to rough modifiers
    const getModifier = (abilityText) => {
      if (!abilityText) return 0;
      const lower = abilityText.toLowerCase();
      if (lower.includes("very high") || lower.includes("exceptional")) return 4;
      if (lower.includes("high") || lower.includes("above average")) return 2;
      if (lower.includes("average") || lower.includes("moderate")) return 0;
      if (lower.includes("low") || lower.includes("below average")) return -2;
      if (lower.includes("very low") || lower.includes("poor")) return -4;
      return 0;
    };

    return {
      perception: {
        value: getModifier(npc.abilities.wisdom)
      },
      hp: {
        max: 20,
        value: 20
      }
    };
  }

  /**
   * Build Foundry languages from NPC data
   */
  static buildFoundryLanguages(npc) {
    const languages = [];

    // Add common by default
    languages.push({ value: "common" });

    // Add ancestry language
    if (npc.ancestry?.name) {
      const ancestryLangs = {
        "Human": ["common"],
        "Elf": ["elven"],
        "Dwarf": ["dwarven"],
        "Gnome": ["gnomish"],
        "Halfling": ["halfling"],
        "Goblin": ["goblin"],
        "Leshy": ["sylvan"],
        "Orc": ["orcish"]
      };

      const lang = ancestryLangs[npc.ancestry.name];
      if (lang && !languages.find(l => l.value === lang[0])) {
        languages.push({ value: lang[0] });
      }
    }

    return languages;
  }

  /**
   * Build Foundry items (possessions, equipment)
   */
  static buildFoundryItems(npc) {
    const items = [];

    if (npc.possessions?.notable && npc.possessions.notable.length > 0) {
      npc.possessions.notable.forEach(item => {
        items.push({
          name: item.possession || "Item",
          type: "equipment",
          system: {
            description: {
              value: item.possession
            },
            quantity: 1,
            equipped: true
          }
        });
      });
    }

    return items;
  }

  /**
   * Create a quick Foundry actor with minimal data
   * @param {Object} npc - NPC seed object
   * @returns {Promise<Actor>} Created actor
   */
  static async quickExportToFoundry(npc) {
    return this.exportToFoundry(npc, {
      level: 1,
      openSheet: true,
      includeFullSeed: false,
      publicBio: ""
    });
  }

  /**
   * Generate faction affiliations and political leanings
   * @param {Object} data - Faction affiliations data
   * @param {Object} occupation - Character occupation
   * @param {Object} psychology - Character psychology
   * @param {Object} lifeHistory - Character life history
   * @param {string} detailLevel - Detail level
   * @returns {Object} Faction affiliations and political leanings
   */
  static generateFactionAffiliations(data, occupation, psychology, lifeHistory, detailLevel) {
    if (!data) return null;

    // 70% chance of having a faction affiliation
    const hasFaction = Math.random() < 0.7;
    const faction = hasFaction ? RandomUtils.selectWeighted(data.factions, "likelihood") : null;

    // Everyone has some political leaning, even if apolitical
    const politicalLeaning = RandomUtils.selectWeighted(data.politicalLeanings, "likelihood");

    // Determine loyalty level if affiliated with faction
    let loyaltyLevel = null;
    if (hasFaction) {
      const loyaltyLevels = ["devoted", "loyal", "committed", "casual", "wavering", "conflicted"];
      loyaltyLevel = RandomUtils.selectFrom(loyaltyLevels);
    }

    return {
      faction,
      politicalLeaning,
      loyaltyLevel,
      hasHiddenAffiliation: hasFaction && Math.random() < 0.15 // 15% chance of secret membership
    };
  }

  /**
   * Generate romantic preferences and relationship history
   * @param {Object} data - Romantic preferences data
   * @param {number} age - Character age
   * @param {Object} psychology - Character psychology
   * @param {Object} lifeHistory - Character life history
   * @param {string} detailLevel - Detail level
   * @returns {Object} Romantic preferences and history
   */
  static generateRomanticPreferences(data, age, psychology, lifeHistory, detailLevel) {
    if (!data) return null;

    const orientation = RandomUtils.selectWeighted(data.romanticOrientation, "likelihood");
    const relationshipHistory = RandomUtils.selectWeighted(data.relationshipHistory, "likelihood");

    // Select attraction types based on detail level
    const numAttractionTypes = detailLevel === "cinematic" ? 2 : 1;
    const attractionTypes = RandomUtils.selectWeightedMultiple(data.attractionTypes, "likelihood", numAttractionTypes);

    // 40% chance of having a past heartbreak that still affects them
    const pastHeartbreak = Math.random() < 0.4 ? RandomUtils.selectWeighted(data.pastHeartbreak, "likelihood") : null;

    // Current relationship status
    let currentStatus = "single";
    if (relationshipHistory.id === "married" || relationshipHistory.id === "widowed" ||
        relationshipHistory.id === "complicated" || relationshipHistory.id === "polyamorous") {
      currentStatus = relationshipHistory.id;
    } else if (Math.random() < 0.3) {
      currentStatus = RandomUtils.selectFrom(["single", "dating", "courting", "engaged"]);
    }

    return {
      orientation,
      relationshipHistory,
      attractionTypes: Array.isArray(attractionTypes) ? attractionTypes : [attractionTypes],
      pastHeartbreak,
      currentStatus,
      openToRomance: Math.random() < 0.6 // 60% are open to romantic interactions
    };
  }

  /**
   * Generate religious beliefs and practices
   * @param {Object} data - Religious beliefs data
   * @param {string} ancestry - Character ancestry
   * @param {Object} occupation - Character occupation
   * @param {Object} psychology - Character psychology
   * @param {string} detailLevel - Detail level
   * @returns {Object} Religious beliefs and practices
   */
  static generateReligiousBeliefs(data, ancestry, occupation, psychology, detailLevel) {
    if (!data) return null;

    // 85% chance of having some religious belief
    const hasReligion = Math.random() < 0.85;

    let deity = null;
    let devotionLevel = null;
    let religiousAttitude = null;
    let practices = [];

    if (hasReligion) {
      // Filter deities by ancestry if they have ancestry preferences
      const filteredDeities = data.deities.filter(d =>
        d.ancestries.includes("all") || d.ancestries.includes(ancestry)
      );
      deity = RandomUtils.selectWeighted(filteredDeities, "likelihood");
      devotionLevel = RandomUtils.selectWeighted(data.devotionLevel, "likelihood");
      religiousAttitude = RandomUtils.selectWeighted(data.religiousAttitudes, "likelihood");

      // Select practices based on devotion level
      let numPractices = 1;
      if (devotionLevel.id === "fanatical" || devotionLevel.id === "devout") {
        numPractices = detailLevel === "cinematic" ? 3 : 2;
      } else if (devotionLevel.id === "observant") {
        numPractices = 2;
      }
      practices = RandomUtils.selectWeightedMultiple(data.religiousPractices, "likelihood", numPractices);
    } else {
      // Non-believer
      const nonBeliever = RandomUtils.selectWeighted(data.nonBelievers, "likelihood");
      deity = null;
      devotionLevel = nonBeliever;
      religiousAttitude = null;
      practices = [];
    }

    return {
      deity,
      devotionLevel,
      religiousAttitude,
      practices,
      hasReligion
    };
  }

  /**
   * Generate hobbies and recreational activities
   * @param {Object} data - Hobbies data
   * @param {Object} occupation - Character occupation
   * @param {Object} psychology - Character psychology
   * @param {Object} economics - Character economic status
   * @param {string} detailLevel - Detail level
   * @returns {Object} Hobbies and recreational activities
   */
  static generateHobbies(data, occupation, psychology, economics, detailLevel) {
    if (!data) return null;

    // Number of hobbies based on detail level and social class
    let numHobbies = detailLevel === "cinematic" ? 3 : 2;

    // Poor people might have fewer hobbies due to time/money constraints
    if (economics?.wealthLevel?.id === "destitute" || economics?.wealthLevel?.id === "poor") {
      numHobbies = Math.max(1, numHobbies - 1);
    }

    const hobbies = RandomUtils.selectWeightedMultiple(data.hobbies, "likelihood", numHobbies);

    return {
      hobbies: hobbies,
      primaryHobby: hobbies[0], // The one they're most passionate about
      hasTimeForHobbies: economics?.wealthLevel?.id !== "destitute"
    };
  }

  /**
   * Generate education and learning background
   * @param {Object} data - Education data
   * @param {Object} occupation - Character occupation
   * @param {Object} socialClass - Character social class
   * @param {string} ancestry - Character ancestry
   * @param {string} detailLevel - Detail level
   * @returns {Object} Education and learning background
   */
  static generateEducation(data, occupation, socialClass, ancestry, detailLevel) {
    if (!data) return null;

    // Education level somewhat influenced by social class
    let educationLevel = RandomUtils.selectWeighted(data.educationLevel, "likelihood");

    // Select areas of knowledge based on occupation and education
    const numKnowledgeAreas = detailLevel === "cinematic" ? 3 : 2;
    const knowledgeAreas = RandomUtils.selectWeightedMultiple(data.areasOfKnowledge, "likelihood", numKnowledgeAreas);

    const learningStyle = RandomUtils.selectWeighted(data.learningStyles, "likelihood");
    const teachingAbility = RandomUtils.selectWeighted(data.teachingAbility, "likelihood");
    const curiosity = RandomUtils.selectWeighted(data.intellectualCuriosity, "likelihood");

    return {
      educationLevel,
      knowledgeAreas: knowledgeAreas,
      learningStyle,
      teachingAbility,
      curiosity,
      isScholar: educationLevel.id === "university-scholar" || educationLevel.id === "specialized-expert"
    };
  }

  /**
   * Generate combat style and fighting philosophy
   * @param {Object} data - Combat style data
   * @param {Object} occupation - Character occupation
   * @param {Object} psychology - Character psychology
   * @param {Object} lifeHistory - Character life history
   * @param {string} detailLevel - Detail level
   * @returns {Object} Combat style and fighting philosophy
   */
  static generateCombatStyle(data, occupation, psychology, lifeHistory, detailLevel) {
    if (!data) return null;

    const combatTraining = RandomUtils.selectWeighted(data.combatTraining, "likelihood");

    // Only generate detailed combat info if they have some training
    let fightingStyle = null;
    let weaponPreference = null;
    let combatPhilosophy = null;
    let combatMentality = null;
    let combatExperience = null;

    if (combatTraining.id !== "untrained" && combatTraining.id !== "basic-survival") {
      fightingStyle = RandomUtils.selectWeighted(data.fightingStyles, "likelihood");
      weaponPreference = RandomUtils.selectWeighted(data.weaponPreferences, "likelihood");
      combatPhilosophy = RandomUtils.selectWeighted(data.combatPhilosophy, "likelihood");
      combatMentality = RandomUtils.selectWeighted(data.combatMentality, "likelihood");
      combatExperience = RandomUtils.selectWeighted(data.combatExperience, "likelihood");
    }

    return {
      combatTraining,
      fightingStyle,
      weaponPreference,
      combatPhilosophy,
      combatMentality,
      combatExperience,
      isCombatant: combatTraining.id !== "untrained"
    };
  }

  /**
   * Generate magical traditions and supernatural connections
   * @param {Object} data - Magical traditions data
   * @param {Object} occupation - Character occupation
   * @param {string} ancestry - Character ancestry
   * @param {Object} psychology - Character psychology
   * @param {string} detailLevel - Detail level
   * @returns {Object} Magical traditions and supernatural connections
   */
  static generateMagicalTraditions(data, occupation, ancestry, psychology, detailLevel) {
    if (!data) return null;

    const magicalAbility = RandomUtils.selectWeighted(data.magicalAbility, "likelihood");

    let tradition = null;
    let source = null;
    let education = null;
    let specialization = null;
    let supernaturalConnection = null;

    // Only generate detailed magical info if they have magical ability
    if (magicalAbility.id !== "none") {
      tradition = RandomUtils.selectWeighted(data.magicalTradition, "likelihood");
      source = RandomUtils.selectWeighted(data.magicSource, "likelihood");

      if (magicalAbility.id !== "latent" && magicalAbility.id !== "wild-talent") {
        education = RandomUtils.selectWeighted(data.magicalEducation, "likelihood");
        specialization = RandomUtils.selectWeighted(data.magicalSpecialization, "likelihood");
      }
    }

    // 20% chance of having some supernatural connection regardless of magical ability
    if (Math.random() < 0.2) {
      supernaturalConnection = RandomUtils.selectWeighted(data.supernaturalConnections, "likelihood");
    }

    const attitudeTowardMagic = RandomUtils.selectWeighted(data.attitudeTowardMagic, "likelihood");

    return {
      magicalAbility,
      tradition,
      source,
      education,
      specialization,
      supernaturalConnection,
      attitudeTowardMagic,
      isCaster: magicalAbility.id !== "none" && magicalAbility.id !== "latent"
    };
  }

  /**
   * Generate family information
   * @param {Object} data - Family generation data
   * @param {number} age - Character age
   * @param {Object} occupation - Character occupation
   * @param {Object} lifeHistory - Character life history
   * @param {string} ancestry - Character ancestry
   * @param {string} detailLevel - Detail level
   * @returns {Object} Family information
   */
  static generateFamily(data, age, occupation, lifeHistory, ancestry, detailLevel) {
    if (!data) return null;

    const familyStatus = RandomUtils.selectWeighted(data.familyStatus, "likelihood");
    const siblings = RandomUtils.selectWeighted(data.siblings, "likelihood");
    const siblingRelationship = siblings.id !== "only-child" ?
      RandomUtils.selectWeighted(data.siblingRelationships, "likelihood") : null;

    // Parent relationships
    const parentalRelationship = RandomUtils.selectWeighted(data.parentalRelationships, "likelihood");

    // Children (age dependent)
    let childrenStatus = null;
    if (age >= 20) {
      childrenStatus = RandomUtils.selectWeighted(data.childrenStatus, "likelihood");
    } else {
      childrenStatus = { id: "no-children", name: "No Children" };
    }

    // Parenting style if they have children
    let parentingStyle = null;
    if (childrenStatus.id !== "no-children" && childrenStatus.id !== "expecting") {
      parentingStyle = RandomUtils.selectWeighted(data.parentingStyles, "likelihood");
    }

    // 30% chance of having a family secret
    const familySecret = Math.random() < 0.3 ?
      RandomUtils.selectWeighted(data.familySecrets, "likelihood") : null;

    const familyTradition = RandomUtils.selectWeighted(data.familyTraditions, "likelihood");
    const familyReputation = RandomUtils.selectWeighted(data.familyReputation, "likelihood");

    return {
      familyStatus,
      siblings,
      siblingRelationship,
      parentalRelationship,
      childrenStatus,
      parentingStyle,
      familySecret,
      familyTradition,
      familyReputation,
      hasLivingFamily: familyStatus.id !== "orphan" && familyStatus.id !== "lone-survivor"
    };
  }

  /**
   * Generate group role (if part of an organization)
   * @param {Object} data - Group dynamics data
   * @param {Object} occupation - Character occupation
   * @param {Array} personalities - Character personalities
   * @param {string} detailLevel - Detail level
   * @returns {Object} Group role information
   */
  static generateGroupRole(data, occupation, personalities, detailLevel) {
    if (!data) return null;

    // 60% chance of being part of some group
    const isPartOfGroup = Math.random() < 0.6;

    if (!isPartOfGroup) {
      return {
        isPartOfGroup: false,
        role: null,
        cohesion: null,
        conflict: null,
        bond: null
      };
    }

    const role = RandomUtils.selectWeighted(data.groupRoles, "likelihood");
    const cohesion = RandomUtils.selectWeighted(data.groupCohesion, "likelihood");

    // 50% chance of having inter-group conflict
    const conflict = Math.random() < 0.5 ?
      RandomUtils.selectWeighted(data.interGroupConflicts, "likelihood") : null;

    const bond = RandomUtils.selectWeighted(data.groupBonds, "likelihood");
    const purpose = RandomUtils.selectWeighted(data.groupPurposes, "likelihood");

    // Leadership style if they're a leader
    let leadershipStyle = null;
    if (role.id === "leader" || role.id === "commander" || role.id === "coordinator") {
      leadershipStyle = RandomUtils.selectWeighted(data.leadershipStyles, "likelihood");
    }

    // 25% chance of the group having a secret
    const groupSecret = Math.random() < 0.25 ?
      RandomUtils.selectWeighted(data.groupSecrets, "likelihood") : null;

    return {
      isPartOfGroup: true,
      role,
      cohesion,
      conflict,
      bond,
      purpose,
      leadershipStyle,
      groupSecret
    };
  }

  /**
   * Initialize character development tracking
   * @param {Object} data - Character development data
   * @param {Object} psychology - Character psychology
   * @param {Array} plotHooks - Character plot hooks
   * @param {string} detailLevel - Detail level
   * @returns {Object} Development tracking information
   */
  static initializeDevelopmentTracking(data, psychology, plotHooks, detailLevel) {
    if (!data) return null;

    // Select a potential development arc for this character
    const potentialArc = RandomUtils.selectWeighted(data.developmentArcs, "likelihood");

    // Select relationship progression type
    const relationshipProgression = RandomUtils.selectWeighted(data.relationshipProgressions, "likelihood");

    // 40% chance of being open to belief change
    const beliefChange = Math.random() < 0.4 ?
      RandomUtils.selectWeighted(data.beliefChanges, "likelihood") : null;

    // Skill progression
    const skillProgression = RandomUtils.selectWeighted(data.skillProgression, "likelihood");

    // 30% chance of active reputation change
    const reputationChange = Math.random() < 0.3 ?
      RandomUtils.selectWeighted(data.reputationChanges, "likelihood") : null;

    const personalGrowth = RandomUtils.selectWeighted(data.personalGrowthAreas, "likelihood");

    return {
      potentialArc,
      currentStage: potentialArc.stages ? potentialArc.stages[0] : "beginning",
      relationshipProgression,
      beliefChange,
      skillProgression,
      reputationChange,
      personalGrowth,
      milestoneReached: [],
      arcProgress: 0 // 0-100 scale
    };
  }

  /**
   * Generate quest information
   * @param {Object} data - Quest chains data
   * @param {Object} occupation - Character occupation
   * @param {Array} plotHooks - Character plot hooks
   * @param {Object} currentSituation - Character's current situation
   * @param {string} detailLevel - Detail level
   * @returns {Object} Quest information
   */
  static generateQuestInfo(data, occupation, plotHooks, currentSituation, detailLevel) {
    if (!data) return null;

    // 70% chance of being able to offer a quest
    const canOfferQuest = Math.random() < 0.7;

    if (!canOfferQuest) {
      return {
        canOfferQuest: false,
        questType: null,
        motivation: null
      };
    }

    const questType = RandomUtils.selectWeighted(data.questTypes, "likelihood");
    const chainStructure = RandomUtils.selectWeighted(data.questChainStructures, "likelihood");
    const rewardType = RandomUtils.selectWeighted(data.questRewards, "likelihood");

    // 40% chance of quest having complications
    const complication = Math.random() < 0.4 ?
      RandomUtils.selectWeighted(data.questComplications, "likelihood") : null;

    const motivation = RandomUtils.selectWeighted(data.questGiverMotivations, "likelihood");

    // Determine current quest status if they've already given out a quest
    const hasOngoingQuest = Math.random() < 0.3; // 30% chance
    const ongoingStatus = hasOngoingQuest ?
      RandomUtils.selectWeighted(data.ongoingQuestStatus, "likelihood") : null;

    return {
      canOfferQuest: true,
      questType,
      chainStructure,
      rewardType,
      complication,
      motivation,
      hasOngoingQuest,
      ongoingStatus,
      questsCompleted: hasOngoingQuest ? Math.floor(Math.random() * 3) : 0
    };
  }

  /**
   * Initialize relationship progression tracking
   * @param {Object} data - Relationship progression data
   * @param {Array} personalities - Character personalities
   * @param {Object} emotionalTriggers - Character emotional triggers
   * @returns {Object} Relationship tracking information
   */
  static initializeRelationshipTracking(data, personalities, emotionalTriggers) {
    if (!data) return null;

    // Start at indifferent by default
    const initialAttitude = data.attitudeLevels.find(a => a.id === "indifferent");

    // Select trust level (starts cautious or neutral)
    const trustOptions = data.trustLevels.filter(t =>
      t.id === "cautious" || t.id === "neutral-trust"
    );
    const initialTrust = RandomUtils.selectFrom(trustOptions);

    // Determine what might trigger loyalty
    const loyaltyTrigger = RandomUtils.selectWeighted(data.loyaltyTriggers, "likelihood");

    // Determine what might trigger betrayal
    const betrayalTrigger = RandomUtils.selectWeighted(data.betrayalTriggers, "likelihood");

    // How easy are they to reconcile with if wronged?
    const reconciliationPath = RandomUtils.selectWeighted(data.reconciliationPaths, "likelihood");

    return {
      currentAttitude: initialAttitude,
      currentTrust: initialTrust,
      relationshipPoints: 0, // Starts at 0
      loyaltyTrigger,
      betrayalTrigger,
      reconciliationPath,
      milestones: [], // Track which milestones have been hit
      attitudeHistory: [
        {
          attitude: initialAttitude.id,
          timestamp: Date.now(),
          reason: "Initial meeting"
        }
      ]
    };
  }
}
