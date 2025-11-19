/**
 * PF2e Narrative Seeds - Name Generator
 * Procedural name generation for all Pathfinder 2e ancestries
 */

import { RandomUtils } from '../utils.js';
import { DataLoader } from '../data-loader.js';

/**
 * Procedural name generator for NPCs
 * Generates culturally appropriate names for Golarion ancestries
 */
export class NameGenerator {

  /**
   * Cache for loaded name patterns
   */
  static namePatterns = new Map();

  /**
   * Generate a name for a specific ancestry
   * @param {string} ancestry - Ancestry slug (e.g., "human", "elf", "dwarf")
   * @param {string} gender - Optional gender ("male", "female", "nonbinary", or null for random)
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Generated name
   */
  static async generate(ancestry, gender = null, options = {}) {
    try {
      // Normalize ancestry
      ancestry = this.normalizeAncestry(ancestry);

      // Load name patterns for this ancestry
      const patterns = await this.loadPatterns(ancestry);

      if (!patterns) {
        console.warn(`PF2e Narrative Seeds | No name patterns found for ancestry: ${ancestry}`);
        return this.generateGenericName();
      }

      // Determine gender if not specified
      if (!gender) {
        gender = RandomUtils.selectFrom(["male", "female", "nonbinary"]);
      }

      // Generate name based on pattern structure
      return this.generateFromPattern(patterns, gender, options);

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error generating name:", error);
      return this.generateGenericName();
    }
  }

  /**
   * Normalize ancestry name to match our data files
   * @param {string} ancestry - Raw ancestry string
   * @returns {string} Normalized ancestry slug
   */
  static normalizeAncestry(ancestry) {
    if (!ancestry) return "human";

    // Convert to lowercase and remove spaces
    const normalized = ancestry.toLowerCase().replace(/\s+/g, "-");

    // Handle alternative names from Remaster
    const aliases = {
      "gnoll": "kholo",
      "grippli": "tripkee",
      "gillman": "azarketi",
      "kayal": "fetchling",
      "lizardfolk": "iruxi",
      "ratfolk": "ysoki"
    };

    return aliases[normalized] || normalized;
  }

  /**
   * Load name patterns for an ancestry
   * @param {string} ancestry - Normalized ancestry slug
   * @returns {Promise<Object>} Name patterns
   */
  static async loadPatterns(ancestry) {
    // Check cache first
    if (this.namePatterns.has(ancestry)) {
      return this.namePatterns.get(ancestry);
    }

    // Try to load from file
    const filePath = `data/social/names/${ancestry}.json`;

    try {
      const patterns = await DataLoader.loadJSON(filePath);

      if (patterns) {
        this.namePatterns.set(ancestry, patterns);
        return patterns;
      }
    } catch (error) {
      // File doesn't exist, try fallback
      console.log(`PF2e Narrative Seeds | Name pattern not found: ${filePath}, using fallback`);
    }

    // Fallback to human if ancestry not found
    if (ancestry !== "human") {
      return this.loadPatterns("human");
    }

    return null;
  }

  /**
   * Generate a name from patterns
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender for name generation
   * @param {Object} options - Additional options
   * @returns {string} Generated name
   */
  static generateFromPattern(patterns, gender, options = {}) {
    const { structure = null, includeLastName = null } = options;

    // Determine name structure
    const selectedStructure = structure || this.selectStructure(patterns);

    // Generate based on structure type
    switch (selectedStructure) {
      case "single":
        return this.generateSingleName(patterns, gender);

      case "first-last":
        return this.generateFirstLast(patterns, gender);

      case "clan-name":
        return this.generateClanName(patterns, gender);

      case "compound":
        return this.generateCompoundName(patterns, gender);

      case "syllabic":
      default:
        return this.generateSyllabicName(patterns, gender, includeLastName);
    }
  }

  /**
   * Select a name structure based on pattern weights
   * @param {Object} patterns - Name pattern data
   * @returns {string} Selected structure type
   */
  static selectStructure(patterns) {
    if (!patterns.structures || patterns.structures.length === 0) {
      return "syllabic";
    }

    return RandomUtils.selectWeighted(patterns.structures, "weight");
  }

  /**
   * Generate a single-part name
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender
   * @returns {string} Generated name
   */
  static generateSingleName(patterns, gender) {
    const genderPatterns = patterns[gender] || patterns["nonbinary"] || patterns;

    if (genderPatterns.names && genderPatterns.names.length > 0) {
      return RandomUtils.selectFrom(genderPatterns.names);
    }

    // Fallback to syllabic generation
    return this.generateSyllabicName(patterns, gender, false);
  }

  /**
   * Generate a first + last name
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender
   * @returns {string} Generated name
   */
  static generateFirstLast(patterns, gender) {
    const firstName = this.generateSyllabicName(patterns, gender, false);
    const lastName = this.generateLastName(patterns);

    return `${firstName} ${lastName}`;
  }

  /**
   * Generate a clan + personal name
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender
   * @returns {string} Generated name
   */
  static generateClanName(patterns, gender) {
    const personalName = this.generateSyllabicName(patterns, gender, false);
    const clanName = this.generateClanNamePart(patterns);

    // Format depends on ancestry convention
    if (patterns.clanFirst) {
      return `${clanName} ${personalName}`;
    } else {
      return `${personalName} ${clanName}`;
    }
  }

  /**
   * Generate a compound name (like "Strongarm" or "Swift-foot")
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender
   * @returns {string} Generated name
   */
  static generateCompoundName(patterns, gender) {
    const parts = patterns.compoundParts || { prefixes: [], suffixes: [] };

    const prefix = RandomUtils.selectFrom(parts.prefixes);
    const suffix = RandomUtils.selectFrom(parts.suffixes);

    const separator = patterns.compoundSeparator || "";

    return `${prefix}${separator}${suffix}`;
  }

  /**
   * Generate a syllabic name (main generation method)
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender
   * @param {boolean} includeLastName - Whether to include a last name
   * @returns {string} Generated name
   */
  static generateSyllabicName(patterns, gender, includeLastName = null) {
    const genderPatterns = patterns[gender] || patterns["nonbinary"] || patterns;

    // Determine if we should include last name
    if (includeLastName === null) {
      includeLastName = patterns.hasLastNames && Math.random() < 0.7; // 70% chance
    }

    // Get syllable components
    const prefixes = genderPatterns.prefixes || patterns.prefixes || [];
    const middles = genderPatterns.middles || patterns.middles || [];
    const suffixes = genderPatterns.suffixes || patterns.suffixes || [];

    // Determine name length (2-3 syllables typically)
    const length = this.getNameLength(patterns);

    // Build first name
    let firstName = "";

    if (length === 1) {
      // Single syllable name
      firstName = RandomUtils.selectFrom([...prefixes, ...middles, ...suffixes]);
    } else if (length === 2) {
      // Two syllable name: prefix + suffix OR prefix + middle
      const useMiddle = middles.length > 0 && Math.random() < 0.5;
      const prefix = RandomUtils.selectFrom(prefixes);
      const ending = useMiddle
        ? RandomUtils.selectFrom(middles)
        : RandomUtils.selectFrom(suffixes);
      firstName = prefix + ending;
    } else {
      // Three syllable name: prefix + middle + suffix
      const prefix = RandomUtils.selectFrom(prefixes);
      const middle = middles.length > 0
        ? RandomUtils.selectFrom(middles)
        : RandomUtils.selectFrom(prefixes);
      const suffix = RandomUtils.selectFrom(suffixes);
      firstName = prefix + middle + suffix;
    }

    // Capitalize first letter
    firstName = this.capitalize(firstName);

    // Add last name if applicable
    if (includeLastName && patterns.hasLastNames) {
      const lastName = this.generateLastName(patterns);
      return `${firstName} ${lastName}`;
    }

    return firstName;
  }

  /**
   * Generate a last name
   * @param {Object} patterns - Name pattern data
   * @returns {string} Generated last name
   */
  static generateLastName(patterns) {
    if (patterns.lastNames && patterns.lastNames.length > 0) {
      return RandomUtils.selectFrom(patterns.lastNames);
    }

    // Generate from last name syllables if available
    if (patterns.lastNamePrefixes && patterns.lastNameSuffixes) {
      const prefix = RandomUtils.selectFrom(patterns.lastNamePrefixes);
      const suffix = RandomUtils.selectFrom(patterns.lastNameSuffixes);
      return this.capitalize(prefix + suffix);
    }

    // Fallback: generate like a first name but with different patterns
    return this.generateSyllabicName(patterns, "nonbinary", false);
  }

  /**
   * Generate a clan name part
   * @param {Object} patterns - Name pattern data
   * @returns {string} Generated clan name
   */
  static generateClanNamePart(patterns) {
    if (patterns.clanNames && patterns.clanNames.length > 0) {
      return RandomUtils.selectFrom(patterns.clanNames);
    }

    if (patterns.clanPrefixes && patterns.clanSuffixes) {
      const prefix = RandomUtils.selectFrom(patterns.clanPrefixes);
      const suffix = RandomUtils.selectFrom(patterns.clanSuffixes);
      return this.capitalize(prefix + suffix);
    }

    return this.generateLastName(patterns);
  }

  /**
   * Determine name length based on patterns
   * @param {Object} patterns - Name pattern data
   * @returns {number} Number of syllables (1-3)
   */
  static getNameLength(patterns) {
    if (patterns.lengthWeights) {
      const roll = Math.random() * 100;
      let cumulative = 0;

      for (const [length, weight] of Object.entries(patterns.lengthWeights)) {
        cumulative += weight;
        if (roll < cumulative) {
          return parseInt(length);
        }
      }
    }

    // Default: 2-3 syllables, weighted toward 2
    return Math.random() < 0.7 ? 2 : 3;
  }

  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    if (!str || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate a generic fallback name
   * @returns {string} Generic name
   */
  static generateGenericName() {
    const prefixes = ["Kor", "Mal", "Tor", "Ven", "Zar", "Ash", "El", "Gar"];
    const suffixes = ["an", "en", "or", "us", "is", "on", "ak", "eth"];

    const prefix = RandomUtils.selectFrom(prefixes);
    const suffix = RandomUtils.selectFrom(suffixes);

    return prefix + suffix;
  }

  /**
   * Clear pattern cache
   */
  static clearCache() {
    this.namePatterns.clear();
  }

  /**
   * Get cache stats (for debugging)
   * @returns {Object} Cache statistics
   */
  static getCacheStats() {
    return {
      size: this.namePatterns.size,
      ancestries: Array.from(this.namePatterns.keys())
    };
  }

  /**
   * Detect ancestry from an actor
   * @param {Actor} actor - Actor to detect ancestry from
   * @returns {string} Detected ancestry or "human" as fallback
   */
  static detectAncestry(actor) {
    if (!actor) return "human";

    // Try to get ancestry from actor system data
    const ancestry = actor.system?.details?.ancestry?.name
      || actor.system?.details?.ancestry?.value
      || actor.system?.traits?.ancestry?.value
      || null;

    if (ancestry) {
      return this.normalizeAncestry(ancestry);
    }

    // Fallback to human
    return "human";
  }
}
