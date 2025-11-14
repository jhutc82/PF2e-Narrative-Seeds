/**
 * PF2e Narrative Seeds - Utility Functions
 * Shared utilities and base classes
 */

import { NarrativeSeedsSettings } from './settings.js';

/**
 * Base class for narrative seed generators
 * Provides common functionality for all narrative generation systems
 */
export class NarrativeSeedGenerator {
  /**
   * @param {string} type - Generator type (combat, spells, skills, etc.)
   */
  constructor(type) {
    this.type = type;
    this.enabled = this.checkEnabled();
  }

  /**
   * Check if this generator is enabled
   * @returns {boolean}
   */
  checkEnabled() {
    const settingKey = `enable${this.capitalize(this.type)}`;
    return NarrativeSeedsSettings.get(settingKey);
  }

  /**
   * Generate a narrative seed
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object|null>} Generated seed or null
   */
  async generate(params) {
    if (!this.enabled) return null;

    try {
      const context = await this.detectContext(params);
      if (!context) return null;

      const seed = this.constructSeed(context);
      return seed;
    } catch (error) {
      console.error(`PF2e Narrative Seeds | Error in ${this.type} generator:`, error);
      return null;
    }
  }

  /**
   * Detect context from parameters
   * @abstract
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async detectContext(params) {
    throw new Error("Must implement detectContext in subclass");
  }

  /**
   * Construct the narrative seed
   * @abstract
   * @param {Object} context
   * @returns {Object}
   */
  constructSeed(context) {
    throw new Error("Must implement constructSeed in subclass");
  }

  /**
   * Capitalize first letter of string
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Randomization utilities
 */
export class RandomUtils {
  /**
   * Select a random element from an array
   * @param {Array} array - Array to select from
   * @param {string} varietyMode - Variety setting (low, medium, high, extreme)
   * @returns {*} Random element
   */
  static selectRandom(array, varietyMode = 'high') {
    if (!array || array.length === 0) return null;

    // For extreme mode, track recently used items
    if (varietyMode === 'extreme') {
      return this.selectRandomExtreme(array);
    }

    // Standard random selection
    const index = Math.floor(Math.random() * array.length);
    return array[index];
  }

  /**
   * Select random with history tracking to avoid repetition
   * @param {Array} array
   * @returns {*}
   */
  static selectRandomExtreme(array) {
    if (!this.usageHistory) {
      this.usageHistory = new Map();
    }

    const key = JSON.stringify(array);
    let history = this.usageHistory.get(key) || [];

    // Reset if we've used all items
    if (history.length >= array.length) {
      history = [];
    }

    // Find unused items
    const unused = array.filter((item, index) => !history.includes(index));
    const selected = unused[Math.floor(Math.random() * unused.length)];
    const selectedIndex = array.indexOf(selected);

    // Update history
    history.push(selectedIndex);
    this.usageHistory.set(key, history);

    return selected;
  }

  /**
   * Roll a dice (1dX)
   * @param {number} sides - Number of sides
   * @returns {number} Result (1 to sides)
   */
  static rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  /**
   * Check percentage chance
   * @param {number} chance - Percentage (0-100)
   * @returns {boolean}
   */
  static checkChance(chance) {
    return Math.random() * 100 < chance;
  }
}

/**
 * String utilities
 */
export class StringUtils {
  /**
   * Format actor name for display
   * @param {string} name
   * @returns {string}
   */
  static formatActorName(name) {
    if (!name) return "Unknown";
    return name.trim();
  }

  /**
   * Capitalize first letter of sentence
   * @param {string} str
   * @returns {string}
   */
  static capitalizeFirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Format outcome for display
   * @param {string} outcome
   * @returns {string}
   */
  static formatOutcome(outcome) {
    const outcomeMap = {
      "criticalSuccess": "Critical Success",
      "success": "Success",
      "failure": "Failure",
      "criticalFailure": "Critical Failure"
    };
    return outcomeMap[outcome] || outcome;
  }

  /**
   * Remove excessive whitespace
   * @param {string} str
   * @returns {string}
   */
  static cleanWhitespace(str) {
    return str.replace(/\s+/g, ' ').trim();
  }
}

/**
 * Chat message utilities
 */
export class ChatUtils {
  /**
   * Get whisper targets based on visibility mode
   * @param {string} visibilityMode
   * @param {string} actorId - ID of the acting character
   * @returns {Array} Array of user IDs to whisper to
   */
  static getWhisperTargets(visibilityMode, actorId = null) {
    switch (visibilityMode) {
      case "gm-only":
        return game.users.filter(u => u.isGM).map(u => u.id);

      case "everyone":
        return [];  // Empty array means public message

      case "gm-plus-actor":
        const targets = game.users.filter(u => u.isGM).map(u => u.id);
        if (actorId) {
          const actor = game.actors.get(actorId);
          if (actor?.hasPlayerOwner) {
            const owners = game.users.filter(u => actor.testUserPermission(u, "OWNER"));
            targets.push(...owners.map(u => u.id));
          }
        }
        return [...new Set(targets)];  // Remove duplicates

      default:
        return game.users.filter(u => u.isGM).map(u => u.id);
    }
  }

  /**
   * Send a chat message
   * @param {string} content - HTML content
   * @param {Object} options - Additional options
   * @returns {Promise<ChatMessage>}
   */
  static async sendMessage(content, options = {}) {
    const visibilityMode = NarrativeSeedsSettings.get("visibilityMode");
    const whisper = options.whisper || this.getWhisperTargets(visibilityMode, options.actorId);

    return ChatMessage.create({
      content: content,
      whisper: whisper,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      speaker: options.speaker || {},
      flags: {
        "pf2e-narrative-seeds": options.flags || {}
      }
    });
  }
}

/**
 * PF2e system utilities
 */
export class PF2eUtils {
  /**
   * Check if current game system is PF2e
   * @returns {boolean}
   */
  static isPF2e() {
    return game.system.id === "pf2e";
  }

  /**
   * Get actor from token or actor ID
   * @param {string} tokenOrActorId
   * @returns {Actor|null}
   */
  static getActor(tokenOrActorId) {
    const token = canvas.tokens?.get(tokenOrActorId);
    if (token) return token.actor;

    return game.actors.get(tokenOrActorId);
  }

  /**
   * Check if message is a PF2e strike
   * @param {ChatMessage} message
   * @returns {boolean}
   */
  static isStrikeMessage(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return false;

    // Check for strike action
    const context = flags.context;
    if (!context) return false;

    return context.type === "attack-roll" ||
           context.action === "strike" ||
           message.flags.pf2e.modifierName === "Attack Roll";
  }

  /**
   * Extract outcome from message
   * @param {ChatMessage} message
   * @returns {string|null} criticalSuccess, success, failure, criticalFailure
   */
  static getOutcome(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return null;

    const context = flags.context;
    if (!context) return null;

    // PF2e uses degree of success: 3=crit success, 2=success, 1=failure, 0=crit failure
    const degreeOfSuccess = context.outcome || flags.degreeOfSuccess;

    switch(degreeOfSuccess) {
      case "criticalSuccess":
      case 3:
        return "criticalSuccess";
      case "success":
      case 2:
        return "success";
      case "failure":
      case 1:
        return "failure";
      case "criticalFailure":
      case 0:
        return "criticalFailure";
      default:
        return null;
    }
  }
}

/**
 * Tone filtering utilities
 */
export class ToneFilter {
  /**
   * Apply tone filtering to description
   * @param {string} description
   * @param {string} tone - family-friendly, standard, gritty, dark
   * @returns {string}
   */
  static apply(description, tone) {
    if (!description) return description;

    switch(tone) {
      case "family-friendly":
        return this.applyFamilyFriendly(description);
      case "standard":
        return description;  // No changes
      case "gritty":
        return this.applyGritty(description);
      case "dark":
        return this.applyDark(description);
      default:
        return description;
    }
  }

  /**
   * Make description family-friendly
   * @param {string} description
   * @returns {string}
   */
  static applyFamilyFriendly(description) {
    return description
      .replace(/blood/gi, "wound")
      .replace(/gore/gi, "injury")
      .replace(/brutally|savagely|viciously/gi, "forcefully")
      .replace(/sprays?/gi, "flows")
      .replace(/severs?|cleaves?/gi, "strikes");
  }

  /**
   * Make description grittier
   * @param {string} description
   * @returns {string}
   */
  static applyGritty(description) {
    // Add more visceral details
    return description
      .replace(/hits?/gi, "crashes into")
      .replace(/strikes?/gi, "slams into");
  }

  /**
   * Make description darker
   * @param {string} description
   * @returns {string}
   */
  static applyDark(description) {
    // Add dramatic flair
    return description;  // Already at maximum darkness in base descriptions
  }
}
