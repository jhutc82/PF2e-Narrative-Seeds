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

      // Load data - including new data files
      const [
        moodsData,
        personalitiesData,
        mannerismsData,
        motivationsData,
        quirksData,
        appearanceData,
        abilitiesData,
        occupationsData,
        possessionsData,
        relationshipsData,
        plotHooksData
      ] = await Promise.all([
        DataLoader.loadJSON("data/social/npc/moods.json"),
        DataLoader.loadJSON("data/social/npc/personalities.json"),
        DataLoader.loadJSON("data/social/npc/mannerisms.json"),
        DataLoader.loadJSON("data/social/npc/motivations.json"),
        DataLoader.loadJSON("data/social/npc/quirks.json"),
        DataLoader.loadJSON("data/social/npc/appearance.json"),
        DataLoader.loadJSON("data/social/npc/abilities.json"),
        DataLoader.loadJSON("data/social/npc/occupations.json"),
        DataLoader.loadJSON("data/social/npc/possessions.json"),
        DataLoader.loadJSON("data/social/npc/relationships.json"),
        DataLoader.loadJSON("data/social/npc/plot-hooks.json")
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

      // Generate physical appearance
      const appearance = this.generateAppearance(appearanceData, ancestry, detailLevel);

      // Generate occupation and social class
      const occupation = this.generateOccupation(occupationsData, detailLevel);

      // Generate abilities based on level and occupation
      const abilities = this.generateAbilities(abilitiesData, occupation, detailLevel);

      // Generate possessions based on occupation and social class
      const possessions = this.generatePossessions(possessionsData, occupation, abilities.level, detailLevel);

      // Generate relationships
      const relationships = this.generateRelationships(relationshipsData, occupation, detailLevel);

      // Generate plot hooks
      const plotHooks = this.generatePlotHooks(plotHooksData, occupation, relationships, detailLevel);

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
   * @param {Object} appearanceData - Appearance data
   * @param {string} ancestry - NPC ancestry
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated appearance
   */
  static generateAppearance(appearanceData, ancestry, detailLevel) {
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

    // Add distinguishing features based on detail level
    const numFeatures = this.getNumDistinguishingFeatures(detailLevel);
    if (numFeatures > 0) {
      appearance.distinguishingFeatures = this.selectUniqueItems(
        appearanceData.distinguishingFeatures,
        numFeatures
      );
    }

    return appearance;
  }

  /**
   * Generate occupation and social class
   * @param {Object} occupationsData - Occupations data
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated occupation
   */
  static generateOccupation(occupationsData, detailLevel) {
    if (!occupationsData) return null;

    const profession = RandomUtils.selectWeighted(occupationsData.professions, "likelihood");

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
   * @param {Object} relationshipsData - Relationships data
   * @param {Object} occupation - NPC occupation
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated relationships
   */
  static generateRelationships(relationshipsData, occupation, detailLevel) {
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

    // Generate organization affiliations
    const professionId = occupation?.profession?.id || "laborer";
    const relevantOrgs = relationshipsData.organizations.filter(org =>
      org.professions.includes(professionId)
    );

    if (detailLevel !== "minimal" && Math.random() < 0.4) {
      const orgPool = relevantOrgs.length > 0 ? relevantOrgs : relationshipsData.organizations;
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
   * @param {Object} plotHooksData - Plot hooks data
   * @param {Object} occupation - NPC occupation
   * @param {Object} relationships - NPC relationships
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated plot hooks
   */
  static generatePlotHooks(plotHooksData, occupation, relationships, detailLevel) {
    if (!plotHooksData) return null;

    const hooks = {};

    // Add secret based on detail level
    if (detailLevel !== "minimal" && Math.random() < 0.4) {
      hooks.secret = RandomUtils.selectWeighted(plotHooksData.secrets, "likelihood");
    }

    // Add goal (more likely in detailed modes)
    const goalChance = detailLevel === "minimal" ? 0.3 : detailLevel === "standard" ? 0.6 : 0.8;
    if (Math.random() < goalChance) {
      hooks.goal = RandomUtils.selectWeighted(plotHooksData.goals, "likelihood");
    }

    // Add conflict
    const conflictChance = detailLevel === "minimal" ? 0.2 : detailLevel === "standard" ? 0.5 : 0.7;
    if (Math.random() < conflictChance) {
      hooks.conflict = RandomUtils.selectWeighted(plotHooksData.conflicts, "likelihood");
    }

    // Add quest hook (only in detailed/cinematic, and only sometimes)
    if ((detailLevel === "detailed" || detailLevel === "cinematic") && Math.random() < 0.3) {
      hooks.questHook = RandomUtils.selectWeighted(plotHooksData.questHooks, "likelihood");
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
}
