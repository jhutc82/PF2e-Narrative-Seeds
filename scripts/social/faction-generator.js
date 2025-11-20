/**
 * PF2e Narrative Seeds - Faction Generator
 * Generates complete faction organizations
 */

import { RandomUtils } from '../utils.js';
import { DataLoader } from '../data-loader.js';

/**
 * Faction generator - creates organizations NPCs can belong to
 */
export class FactionGenerator {

  /**
   * Generate a complete faction
   * @param {Object} params - Generation parameters
   * @param {string} params.type - Force specific faction type
   * @param {string} params.name - Custom faction name
   * @returns {Promise<Object>} Generated faction
   */
  static async generate(params = {}) {
    try {
      // Load faction data
      const factionData = await DataLoader.loadJSON("data/social/factions/faction-types.json");

      if (!factionData) {
        console.error("PF2e Narrative Seeds | Failed to load faction data");
        return null;
      }

      // Select faction type
      const factionType = params.type
        ? factionData.factionTypes.find(f => f.id === params.type)
        : RandomUtils.selectWeighted(factionData.factionTypes, "likelihood");

      // Generate faction name if not provided
      const factionName = params.name || this.generateFactionName(factionType);

      // Select goals (1-2)
      const numGoals = Math.random() < 0.7 ? 1 : 2;
      const goals = [];
      for (let i = 0; i < numGoals; i++) {
        goals.push(RandomUtils.selectWeighted(factionData.factionGoals, "likelihood"));
      }

      // Select resources (2-4)
      const numResources = Math.floor(Math.random() * 3) + 2;
      const resources = [];
      const availableResources = [...factionData.factionResources];
      for (let i = 0; i < numResources && availableResources.length > 0; i++) {
        const resource = RandomUtils.selectWeighted(availableResources, "likelihood");
        resources.push(resource);
        availableResources.splice(availableResources.indexOf(resource), 1);
      }

      // Select weaknesses (1-3)
      const numWeaknesses = Math.floor(Math.random() * 3) + 1;
      const weaknesses = [];
      const availableWeaknesses = [...factionData.factionWeaknesses];
      for (let i = 0; i < numWeaknesses && availableWeaknesses.length > 0; i++) {
        const weakness = RandomUtils.selectWeighted(availableWeaknesses, "likelihood");
        weaknesses.push(weakness);
        availableWeaknesses.splice(availableWeaknesses.indexOf(weakness), 1);
      }

      // Select leadership style
      const leadershipStyle = RandomUtils.selectWeighted(factionData.leadershipStyles, "likelihood");

      // Select recruitment method
      const recruitmentMethod = RandomUtils.selectWeighted(factionData.recruitmentMethods, "likelihood");

      // Select public perception
      const publicPerception = RandomUtils.selectWeighted(factionData.publicPerception, "likelihood");

      // Determine size (influenced by faction type)
      const size = this.determineFactionSize(factionType);

      // Determine influence level
      const influenceLevel = this.determineInfluenceLevel(resources.length, weaknesses.length);

      return {
        id: `faction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: factionName,
        type: factionType,
        goals,
        resources,
        weaknesses,
        leadershipStyle,
        recruitmentMethod,
        publicPerception,
        size,
        influenceLevel,
        members: [], // To be populated with NPC IDs
        rivals: [], // Other faction IDs
        allies: [], // Other faction IDs
        timestamp: Date.now()
      };

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error generating faction:", error);
      return null;
    }
  }

  /**
   * Generate faction name based on type
   */
  static generateFactionName(factionType) {
    const prefixes = {
      "merchant-guild": ["Honorable", "Prosperous", "Golden", "Silver", "Grand"],
      "craft-guild": ["Master", "Ancient", "Skilled", "Proud", "United"],
      "noble-house": ["House", "Dynasty of", "Clan", "Family"],
      "thieves-guild": ["Shadow", "Silent", "Black", "Velvet", "Crimson"],
      "religious-order": ["Order of", "Brotherhood of", "Sisterhood of", "Church of", "Temple of"],
      "military-order": ["Knights of", "Order of", "Legion of", "Company of"],
      "secret-society": ["Circle of", "Brotherhood of", "Society of", "Order of"],
      "political-party": ["Party of", "Coalition for", "Movement for", "Alliance of"],
      "scholarly-society": ["Academy of", "College of", "Society of", "Institute of"],
      "mercenary-company": ["Band", "Company", "Free Company of", "Blades of"],
      "cult": ["Cult of", "Followers of", "Children of", "Disciples of"],
      "revolutionary-movement": ["Liberation", "Freedom", "People's", "Revolutionary"]
    };

    const suffixes = {
      "merchant-guild": ["Merchants", "Traders", "Commerce", "Trade"],
      "craft-guild": ["Craftsmen", "Artisans", "Smiths", "Builders"],
      "noble-house": ["", "", "", ""], // Houses don't need suffixes
      "thieves-guild": ["Hand", "Dagger", "Coin", "Mask"],
      "religious-order": ["the Sacred", "Light", "the Divine", "Faith"],
      "military-order": ["the Sword", "Honor", "Battle", "Victory"],
      "secret-society": ["the Veil", "Secrets", "the Shadow", "Mystery"],
      "political-party": ["Progress", "Reform", "Change", "Unity"],
      "scholarly-society": ["Learning", "Wisdom", "Knowledge", "Discovery"],
      "mercenary-company": ["", "Swords", "Steel", "War"],
      "cult": ["the End", "Rebirth", "the Void", "Eternity"],
      "revolutionary-movement": ["Front", "Movement", "Army", "Resistance"]
    };

    const typeId = factionType.id;
    const prefix = RandomUtils.selectFrom(prefixes[typeId] || ["The"]);
    const suffix = RandomUtils.selectFrom(suffixes[typeId] || [""]);

    // Add a random element for uniqueness
    const elements = ["Iron", "Gold", "Silver", "Crimson", "Azure", "Obsidian", "Dawn", "Dusk",
                      "Storm", "Flame", "Frost", "Stone", "Star", "Moon", "Sun"];
    const element = RandomUtils.selectFrom(elements);

    if (typeId === "noble-house") {
      return `${prefix} ${element}`;
    } else if (suffix) {
      return `${prefix} ${element} ${suffix}`;
    } else {
      return `${prefix} ${element}`;
    }
  }

  /**
   * Determine faction size
   */
  static determineFactionSize(factionType) {
    // Parse typical size from faction type
    const sizeStr = factionType.typicalSize;
    const numbers = sizeStr.match(/\d+/g);

    if (numbers && numbers.length >= 2) {
      const min = parseInt(numbers[0]);
      const max = parseInt(numbers[1]);
      const size = Math.floor(Math.random() * (max - min + 1)) + min;

      if (size < 20) return "tiny";
      if (size < 50) return "small";
      if (size < 100) return "medium";
      if (size < 200) return "large";
      return "massive";
    }

    return "medium";
  }

  /**
   * Determine influence level based on resources and weaknesses
   */
  static determineInfluenceLevel(resourceCount, weaknessCount) {
    const score = resourceCount - (weaknessCount * 0.5);

    if (score >= 3.5) return "dominant";
    if (score >= 2.5) return "major";
    if (score >= 1.5) return "moderate";
    if (score >= 0.5) return "minor";
    return "negligible";
  }

  /**
   * Generate rivalry between two factions
   */
  static generateRivalry(faction1, faction2) {
    const reasons = [
      "competing for same resources",
      "ideological opposition",
      "historical conflict",
      "territorial dispute",
      "trade competition",
      "political rivalry",
      "religious schism",
      "past betrayal",
      "conflicting goals",
      "personal vendetta between leaders"
    ];

    return {
      faction1Id: faction1.id,
      faction2Id: faction2.id,
      reason: RandomUtils.selectFrom(reasons),
      intensity: RandomUtils.selectFrom(["minor", "moderate", "major", "blood-feud"]),
      publicKnowledge: Math.random() < 0.7
    };
  }

  /**
   * Generate alliance between two factions
   */
  static generateAlliance(faction1, faction2) {
    const reasons = [
      "mutual benefit",
      "common enemy",
      "trade agreement",
      "marriage alliance",
      "shared ideology",
      "military pact",
      "economic partnership",
      "historical friendship",
      "strategic necessity",
      "religious unity"
    ];

    return {
      faction1Id: faction1.id,
      faction2Id: faction2.id,
      reason: RandomUtils.selectFrom(reasons),
      strength: RandomUtils.selectFrom(["weak", "moderate", "strong", "unbreakable"]),
      publicKnowledge: Math.random() < 0.8
    };
  }
}
