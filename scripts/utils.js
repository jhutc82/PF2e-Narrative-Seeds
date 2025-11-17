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
 * Randomization utilities with bounded memory usage
 */
export class RandomUtils {
  static MAX_CACHE_SIZE = 100;  // Maximum number of categories to track
  static MAX_CACHE_AGE = 300000;  // 5 minutes in milliseconds
  static usageHistory = new Map();
  static cacheTimestamps = new Map();
  static messageHistory = [];

  // History size limits for variety modes
  // These control how many recent selections to avoid repeating
  static HISTORY_LIMITS = {
    LOW: {
      ABSOLUTE: 3,      // Minimum history for low variety (small pools)
      DEFAULT: 3,       // Default history when no array length
      PERCENTAGE: 0.2   // Use 20% of array length
    },
    MEDIUM: {
      ABSOLUTE: 8,      // Minimum history for medium variety
      DEFAULT: 10,      // Default history when no array length
      PERCENTAGE: 0.4   // Use 40% of array length
    },
    HIGH: {
      ABSOLUTE: 15,     // Minimum history for high variety
      DEFAULT: 20,      // Default history when no array length
      PERCENTAGE: 0.6   // Use 60% of array length
    },
    EXTREME: {
      ABSOLUTE: 50,     // Cap at 50 to prevent excessive memory
      DEFAULT: 50,      // Default history when no array length
      PERCENTAGE: 1.0   // Use nearly all of array (arrayLength - 1)
    }
  };

  /**
   * Get history size based on variety mode
   * @param {string} varietyMode - Variety setting (low, medium, high, extreme)
   * @param {number} arrayLength - Length of array (for calculating percentage-based limits)
   * @returns {number} History size
   */
  static getHistorySize(varietyMode, arrayLength = null) {
    const mode = varietyMode?.toUpperCase() || 'HIGH';
    const limits = this.HISTORY_LIMITS[mode] || this.HISTORY_LIMITS.HIGH;

    if (arrayLength) {
      const percentageBased = Math.floor(arrayLength * limits.PERCENTAGE);
      // For extreme mode, use arrayLength - 1 to avoid filtering out all options
      if (mode === 'EXTREME') {
        return Math.min(limits.ABSOLUTE, arrayLength - 1);
      }
      return Math.min(limits.ABSOLUTE, percentageBased);
    }

    return limits.DEFAULT;
  }

  /**
   * Prune cache to prevent unbounded growth
   * @private
   */
  static pruneCache() {
    const now = Date.now();

    // Remove old entries based on age
    for (const [key, timestamp] of this.cacheTimestamps) {
      if (now - timestamp > this.MAX_CACHE_AGE) {
        this.usageHistory.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }

    // Limit size (LRU eviction) - remove oldest entries if over limit
    if (this.usageHistory.size > this.MAX_CACHE_SIZE) {
      const toDelete = this.usageHistory.size - this.MAX_CACHE_SIZE;
      // Get oldest entries based on timestamp
      const sortedEntries = Array.from(this.cacheTimestamps.entries())
        .sort((a, b) => a[1] - b[1])
        .slice(0, toDelete);

      sortedEntries.forEach(([key]) => {
        this.usageHistory.delete(key);
        this.cacheTimestamps.delete(key);
      });
    }
  }

  /**
   * Select a random element from an array with variety tracking
   * @param {Array} array - Array to select from
   * @param {string} varietyMode - Variety setting (low, medium, high, extreme)
   * @param {string} category - Category key for tracking (e.g., "location:humanoid:success")
   * @returns {*} Random element
   */
  static selectRandom(array, varietyMode = 'high', category = null) {
    if (!array || array.length === 0) return null;

    // Determine history size based on variety mode
    const historySize = this.getHistorySize(varietyMode, array.length);

    // If no category or history size is 0, use simple random
    if (!category || historySize === 0) {
      return array[Math.floor(Math.random() * array.length)];
    }

    // Prune cache periodically
    if (this.usageHistory.size > this.MAX_CACHE_SIZE * 0.9) {
      this.pruneCache();
    }

    // Get or create history for this category
    let history = this.usageHistory.get(category) || [];

    // Trim history to appropriate size
    if (history.length > historySize) {
      history = history.slice(-historySize);
    }

    // Find indices not in recent history
    const availableIndices = [];
    for (let i = 0; i < array.length; i++) {
      if (!history.includes(i)) {
        availableIndices.push(i);
      }
    }

    // If all items are in history (shouldn't happen with proper sizing), reset
    if (availableIndices.length === 0) {
      history = [];
      const selectedIndex = Math.floor(Math.random() * array.length);
      history.push(selectedIndex);
      this.usageHistory.set(category, history);
      this.cacheTimestamps.set(category, Date.now());
      return array[selectedIndex];
    }

    // Select from available indices
    const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

    // Update history
    history.push(selectedIndex);
    this.usageHistory.set(category, history);
    this.cacheTimestamps.set(category, Date.now());

    return array[selectedIndex];
  }

  /**
   * Clear all usage history (useful for testing or resetting)
   */
  static clearHistory() {
    this.usageHistory.clear();
    this.cacheTimestamps.clear();
    this.messageHistory = [];
    console.log("PF2e Narrative Seeds | Random usage history cleared");
  }

  /**
   * Check if a complete message was recently used
   * @param {string} message - The complete message to check
   * @param {string} varietyMode - Variety setting
   * @returns {boolean} True if message was recently used
   */
  static isMessageRecentlyUsed(message, varietyMode = 'high') {
    // Check if message is in recent history
    return this.messageHistory.includes(message);
  }

  /**
   * Record a message as used
   * @param {string} message - The complete message to record
   * @param {string} varietyMode - Variety setting
   */
  static recordMessage(message, varietyMode = 'high') {
    // Determine message history size based on variety mode
    const historySize = this.getHistorySize(varietyMode);

    // Add message to history
    this.messageHistory.push(message);

    // Trim history to size to prevent unbounded growth
    if (this.messageHistory.length > historySize) {
      this.messageHistory = this.messageHistory.slice(-historySize);
    }
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

  /**
   * Get cache statistics (for debugging)
   * @returns {Object} Cache stats
   */
  static getCacheStats() {
    return {
      categories: this.usageHistory.size,
      maxCategories: this.MAX_CACHE_SIZE,
      messageHistory: this.messageHistory.length,
      oldestEntry: this.cacheTimestamps.size > 0
        ? Date.now() - Math.min(...this.cacheTimestamps.values())
        : 0
    };
  }
}

/**
 * String utilities
 */
export class StringUtils {
  /**
   * Check if a name appears to be a proper name vs creature type
   * @param {string} name
   * @param {Object} actor - Optional actor object for type checking
   * @returns {boolean} True if proper name, false if creature type
   */
  static isProperName(name, actor = null) {
    if (!name) return false;

    // If we have actor data, use it
    if (actor) {
      // PCs (characters) always have proper names
      if (actor.type === 'character') return true;

      // Check if actor has a specific identifier that suggests it's a unique NPC
      // Unique NPCs often have isUnique flag or specific traits
      if (actor.system?.traits?.rarity === 'unique') return true;
    }

    // Heuristics for name-only detection:
    // Check if name contains multiple words with mixed case (likely a name)
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      // Multi-word names like "Bandit Leader" or "Orc Warrior" are creature types
      // But "John Smith" or "Valeros the Brave" are proper names
      // Check if all words are capitalized title-case (creature type pattern)
      const allTitleCase = words.every(word =>
        word.length > 0 && word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()
      );
      // If it has numbers or parentheses, it's likely a proper name "Valeros (Beginner Box)"
      if (name.match(/\d|\(|\)/)) return true;
      // If all words are simple title case with no special chars, likely creature type
      if (allTitleCase && !name.match(/[^a-zA-Z\s]/)) return false;
    }

    // Single capitalized words are ambiguous, default to creature type for safety
    // This covers cases like "Bandit", "Owlbear", "Dragon"
    // But proper names like "Valeros" will need actor type to distinguish
    return false;
  }

  /**
   * Format actor name for display, adding "the" before creature types
   * @param {string} name
   * @param {Object} actor - Optional actor object for type checking
   * @returns {string}
   */
  static formatActorName(name, actor = null) {
    if (!name) return "Unknown";
    const trimmed = name.trim();

    // Check if this is a proper name or creature type
    if (this.isProperName(trimmed, actor)) {
      return trimmed;
    } else {
      // It's a creature type, add "the" and lowercase first letter
      const lower = trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
      return `the ${lower}`;
    }
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

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} str
   * @returns {string}
   */
  static escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Interpolate template variables in a single pass
   * Optimized replacement for multiple regex operations
   * @param {string} template - String with ${var} placeholders
   * @param {Object} vars - Variable substitutions
   * @returns {string} Interpolated string
   * @example
   * interpolate("${name} hits ${target}", {name: "Bob", target: "Alice"})
   * // Returns: "Bob hits Alice"
   */
  static interpolate(template, vars) {
    if (!template) return "";
    if (!vars || typeof vars !== 'object') return template;

    // Single pass replacement - much faster than multiple regex calls
    return template.replace(/\$\{(\w+)\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : match;
    });
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
    // Add dramatic and ominous flair
    // Handle specific adverb combinations first to avoid grammar issues
    return description
      .replace(/\blands?\s+solidly\b/gi, "crashes down")
      .replace(/\blands?\s+cleanly\b/gi, "slams down")
      .replace(/\blands?\s+perfectly\b/gi, "strikes down with brutal precision")
      .replace(/\blands?\s+heavily\b/gi, "hammers down")
      .replace(/\blands?\s+squarely\b/gi, "impacts with crushing force")
      .replace(/\bconnects?\s+solidly\b/gi, "impacts brutally")
      .replace(/\bconnects?\s+cleanly\b/gi, "tears through")
      .replace(/\bconnects?\s+perfectly\b/gi, "finds its mark with devastating precision")
      .replace(/\bstrikes?\s+solidly\b/gi, "rends savagely")
      .replace(/\bstrikes?\s+cleanly\b/gi, "cleaves through")
      .replace(/\bhits?\s+solidly\b/gi, "tears deep into")
      .replace(/\bhits?\s+cleanly\b/gi, "rips through")
      // Then handle single word replacements
      .replace(/\bhits?\b/gi, "tears into")
      .replace(/\bstrikes?\b/gi, "rends")
      .replace(/\blands?\b/gi, "crashes down upon")
      .replace(/\bconnects?\b/gi, "brutally impacts")
      .replace(/\bmisses?\b/gi, "fails to find purchase")
      .replace(/\bwounds?\b/gi, "grievous wounds")
      .replace(/\binjur(y|ies)\b/gi, "traumatic $1")
      .replace(/\bforcefully\b/gi, "with merciless force")
      .replace(/\bflows?\b/gi, "pours freely");
  }
}
