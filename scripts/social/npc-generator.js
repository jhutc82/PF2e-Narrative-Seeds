/**
 * PF2e Narrative Seeds - NPC Generator
 * Generates NPC personalities for social encounters
 */

import { RandomUtils } from '../utils.js';
import { NarrativeSeedsSettings } from '../settings.js';
import { DataLoader } from '../data-loader.js';

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

      // Load data
      const [moodsData, personalitiesData, mannerismsData, motivationsData, quirksData] = await Promise.all([
        DataLoader.loadJSON("data/social/npc/moods.json"),
        DataLoader.loadJSON("data/social/npc/personalities.json"),
        DataLoader.loadJSON("data/social/npc/mannerisms.json"),
        DataLoader.loadJSON("data/social/npc/motivations.json"),
        DataLoader.loadJSON("data/social/npc/quirks.json")
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

      // Build NPC seed
      const seed = {
        mood,
        personalities,
        mannerisms,
        motivation,
        quirks,
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
}
