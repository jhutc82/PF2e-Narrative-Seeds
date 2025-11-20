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
        professionalExpertiseData
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
        DataLoader.loadJSON("data/social/npc/professional-expertise.json")
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

      // Select personality traits (1-2 based on detail level)
      const numPersonalities = this.getNumPersonalities(detailLevel);
      const personalities = this.selectUniqueItems(personalitiesData.personalities, numPersonalities);

      // Select mannerisms (1-3 based on detail level)
      const numMannerisms = this.getNumMannerisms(detailLevel);
      const mannerisms = this.selectUniqueItems(mannerismsData.mannerisms, numMannerisms);

      // Select motivation (always 1)
      const motivation = RandomUtils.selectFrom(motivationsData.motivations);

      // Select quirks (0-2 based on detail level and random chance)
      const numQuirks = this.getNumQuirks(detailLevel);
      const quirks = numQuirks > 0 ? this.selectUniqueItems(quirksData.quirks, numQuirks) : [];

      // Generate name based on ancestry
      const ancestry = params.ancestry || (params.actor ? NameGenerator.detectAncestry(params.actor) : "human");
      const gender = params.gender || null; // null = random
      const name = await NameGenerator.generate(ancestry, gender);

      // Generate physical appearance with ancestry-specific features
      const appearance = this.generateAppearance(appearanceData, appearanceAncestryData, ancestry, detailLevel);

      // Generate occupation and social class with ancestry-specific options
      const occupation = this.generateOccupation(occupationsData, occupationsAncestryData, ancestry, detailLevel);

      // Generate abilities based on level and occupation
      const abilities = this.generateAbilities(abilitiesData, occupation, detailLevel);

      // Generate possessions based on occupation and social class
      const possessions = this.generatePossessions(possessionsData, occupation, abilities.level, detailLevel);

      // Generate relationships with expanded options
      const relationships = this.generateRelationships(relationshipsData, relationshipsExpandedData, occupation, ancestry, detailLevel);

      // Generate plot hooks with expanded variety
      const plotHooks = this.generatePlotHooks(plotHooksData, plotHooksExpandedData, occupation, relationships, detailLevel);

      // Generate Influence stat block
      const influence = this.generateInfluence(influenceData, occupation, abilities, mood, personalities, plotHooks);

      // Generate psychological depth
      const psychology = this.generatePsychology(psychologicalDepthData, personalities, occupation, plotHooks, detailLevel);

      // Generate physical details with ancestry and occupation influences
      const physicalDetails = this.generatePhysicalDetails(physicalDetailsData, ancestry, occupation, psychology, detailLevel);

      // Generate life history shaped by ancestry and occupation
      const lifeHistory = this.generateLifeHistory(lifeHistoryData, ancestry, occupation, psychology, detailLevel);

      // Generate daily life patterns
      const dailyLife = this.generateDailyLife(dailyLifeData, occupation, psychology, lifeHistory, detailLevel);

      // Generate speech patterns influenced by background
      const speechPatterns = this.generateSpeechPatterns(speechPatternsData, occupation, lifeHistory, personalities, detailLevel);

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
      const sensory = this.generateSensory(sensorySignatureData, occupation, physicalDetails, detailLevel);

      // Generate health status (conditions, fitness, mental health)
      const health = this.generateHealth(healthConditionsData, age, occupation, lifeHistory, detailLevel);

      // Generate relationship dynamics (how they treat different groups)
      const relationshipDynamics = this.generateRelationshipDynamics(relationshipDynamicsData, psychology, lifeHistory, detailLevel);

      // Generate professional expertise (occupation-specific knowledge)
      const professionalExpertise = this.generateProfessionalExpertise(professionalExpertiseData, occupation, detailLevel);

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
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated plot hooks
   */
  static generatePlotHooks(plotHooksData, plotHooksExpandedData, occupation, relationships, detailLevel) {
    if (!plotHooksData) return null;

    const hooks = {};

    // Combine base and expanded secrets
    const allSecrets = [...plotHooksData.secrets];
    if (plotHooksExpandedData?.additionalSecrets) {
      allSecrets.push(...plotHooksExpandedData.additionalSecrets);
    }

    // Add secret based on detail level
    if (detailLevel !== "minimal" && Math.random() < 0.4) {
      hooks.secret = RandomUtils.selectWeighted(allSecrets, "likelihood");
    }

    // Combine base and expanded goals
    const allGoals = [...plotHooksData.goals];
    if (plotHooksExpandedData?.additionalGoals) {
      allGoals.push(...plotHooksExpandedData.additionalGoals);
    }

    // Add goal (more likely in detailed modes)
    const goalChance = detailLevel === "minimal" ? 0.3 : detailLevel === "standard" ? 0.6 : 0.8;
    if (Math.random() < goalChance) {
      hooks.goal = RandomUtils.selectWeighted(allGoals, "likelihood");
    }

    // Combine base and expanded conflicts
    const allConflicts = [...plotHooksData.conflicts];
    if (plotHooksExpandedData?.additionalConflicts) {
      allConflicts.push(...plotHooksExpandedData.additionalConflicts);
    }

    // Add conflict
    const conflictChance = detailLevel === "minimal" ? 0.2 : detailLevel === "standard" ? 0.5 : 0.7;
    if (Math.random() < conflictChance) {
      hooks.conflict = RandomUtils.selectWeighted(allConflicts, "likelihood");
    }

    // Combine base and expanded quest hooks
    const allQuestHooks = [...plotHooksData.questHooks];
    if (plotHooksExpandedData?.additionalQuestHooks) {
      allQuestHooks.push(...plotHooksExpandedData.additionalQuestHooks);
    }

    // Add quest hook (only in detailed/cinematic, and only sometimes)
    if ((detailLevel === "detailed" || detailLevel === "cinematic") && Math.random() < 0.3) {
      hooks.questHook = RandomUtils.selectWeighted(allQuestHooks, "likelihood");
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
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Psychology data
   */
  static generatePsychology(data, personalities, occupation, plotHooks, detailLevel) {
    if (!data) return null;

    const numItems = detailLevel === "cinematic" ? 2 : 1;

    // Select fears (1-2)
    const fears = this.selectUniqueItems(RandomUtils.selectWeighted(data.fears, "likelihood", numItems));

    // Select desires (1-2)
    const desires = this.selectUniqueItems(RandomUtils.selectWeighted(data.desires, "likelihood", numItems));

    // Select regrets (0-1, not everyone has notable regrets)
    const regrets = Math.random() < 0.7 ? [RandomUtils.selectWeighted(data.regrets, "likelihood")] : [];

    // Select vices (1-2)
    const vices = this.selectUniqueItems(RandomUtils.selectWeighted(data.vices, "likelihood", numItems));

    // Select virtues (1-3, most people have some virtues)
    const numVirtues = detailLevel === "cinematic" ? 3 : 2;
    const virtues = this.selectUniqueItems(RandomUtils.selectWeighted(data.virtues, "likelihood", numVirtues));

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
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Physical details
   */
  static generatePhysicalDetails(data, ancestry, occupation, psychology, detailLevel) {
    if (!data) return null;

    // Voice quality
    const voice = RandomUtils.selectWeighted(data.voiceQualities, "likelihood");

    // Scars/markings (40% chance, higher for certain occupations)
    const hasScars = Math.random() < (occupation.socialClass?.includes("lower-class") ? 0.6 : 0.4);
    const scars = hasScars ? [RandomUtils.selectWeighted(data.scarsAndMarkings, "likelihood")] : [];

    // Tattoos (30% chance, varies by culture)
    const hasTattoos = Math.random() < 0.3;
    const tattoos = hasTattoos ? [RandomUtils.selectWeighted(data.tattoos, "likelihood")] : [];

    // Clothing style (always have one)
    const clothing = RandomUtils.selectWeighted(data.clothingStyles, "likelihood");

    // Jewelry (50% chance)
    const hasJewelry = Math.random() < 0.5;
    const jewelry = hasJewelry ? [RandomUtils.selectWeighted(data.jewelry, "likelihood")] : [];

    // Physical quirks (1-2 for detailed/cinematic)
    const numQuirks = detailLevel === "minimal" || detailLevel === "standard" ? 1 : 2;
    const physicalQuirks = this.selectUniqueItems(data.physicalQuirks, numQuirks);

    // Posture
    const posture = RandomUtils.selectWeighted(data.posture, "likelihood");

    // Hygiene
    const hygiene = RandomUtils.selectWeighted(data.hygiene, "likelihood");

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
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Speech patterns
   */
  static generateSpeechPatterns(data, occupation, lifeHistory, personalities, detailLevel) {
    if (!data) return null;

    // Catchphrases (1-2)
    const numCatchphrases = detailLevel === "cinematic" ? 2 : 1;
    const catchphrases = this.selectUniqueItems(data.catchphrases, numCatchphrases);

    // Verbal tics (0-2, not everyone has them)
    const hasVerbals = Math.random() < 0.6;
    const numVerbalTics = hasVerbals ? (detailLevel === "cinematic" ? 2 : 1) : 0;
    const verbalTics = numVerbalTics > 0 ? this.selectUniqueItems(data.verbalTics, numVerbalTics) : [];

    // Conversation style
    const conversationStyle = RandomUtils.selectWeighted(data.conversationStyles, "likelihood");

    // Accent (based on background)
    const accent = RandomUtils.selectWeighted(data.accents, "likelihood");

    // Speaking speed
    const speakingSpeed = RandomUtils.selectWeighted(data.speakingSpeed, "likelihood");

    // Laugh type
    const laugh = RandomUtils.selectWeighted(data.laughTypes, "likelihood");

    // Emotional tells (1-2)
    const numTells = detailLevel === "cinematic" ? 2 : 1;
    const emotionalTells = this.selectUniqueItems(data.emotionalTells, numTells);

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
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Sensory signature
   */
  static generateSensory(data, occupation, physicalDetails, detailLevel) {
    if (!data) return null;

    // Scent (always)
    const scent = RandomUtils.selectWeighted(data.scents, "likelihood");

    // Sounds (1-2)
    const numSounds = detailLevel === "cinematic" ? 2 : 1;
    const sounds = this.selectUniqueItems(data.sounds, numSounds);

    // Texture (always)
    const texture = RandomUtils.selectWeighted(data.textures, "likelihood");

    // Temperature (always)
    const temperature = RandomUtils.selectWeighted(data.temperatures, "likelihood");

    // Aura (always)
    const aura = RandomUtils.selectWeighted(data.auras, "likelihood");

    // Visual signature (1-2)
    const numVisual = detailLevel === "cinematic" ? 2 : 1;
    const visualSignature = this.selectUniqueItems(data.visualSignature, numVisual);

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
   * @param {string} detailLevel - Level of detail
   * @returns {Object} Health status
   */
  static generateHealth(data, age, occupation, lifeHistory, detailLevel) {
    if (!data) return null;

    // Chronic conditions (0-1, increases with age)
    const chronicChance = age < 30 ? 0.2 : age < 50 ? 0.4 : 0.6;
    const hasChronic = Math.random() < chronicChance;
    const chronicConditions = hasChronic ? [RandomUtils.selectWeighted(data.chronicConditions, "likelihood")] : [];

    // Disabilities (0-1, rare but possible)
    const hasDisability = Math.random() < 0.15;
    const disabilities = hasDisability ? [RandomUtils.selectWeighted(data.disabilities, "likelihood")] : [];

    // Fitness level (always)
    const fitnessLevel = RandomUtils.selectWeighted(data.fitnessLevels, "likelihood");

    // Allergies and sensitivities (0-2, 40% have at least one)
    const hasAllergies = Math.random() < 0.4;
    const numAllergies = hasAllergies ? (detailLevel === "cinematic" ? 2 : 1) : 0;
    const allergiesAndSensitivities = numAllergies > 0 ? this.selectUniqueItems(data.allergiesAndSensitivities, numAllergies) : [];

    // Mental health (0-1, 50% have something)
    const hasMentalHealth = Math.random() < 0.5;
    const mentalHealthConditions = hasMentalHealth ? [RandomUtils.selectWeighted(data.mentalHealthConditions, "likelihood")] : [];

    // Addictions (0-1, 30% have one)
    const hasAddiction = Math.random() < 0.3;
    const addictions = hasAddiction ? [RandomUtils.selectWeighted(data.addictions, "likelihood")] : [];

    // Current health status (always)
    const currentHealthStatus = RandomUtils.selectWeighted(data.currentHealthStatus, "likelihood");

    // Scars and injury history (always at least one type)
    const scarsAndInjuryHistory = RandomUtils.selectWeighted(data.scarsAndInjuryHistory, "likelihood");

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
}
