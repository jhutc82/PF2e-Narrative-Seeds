/**
 * PF2e Narrative Seeds - Name Generator
 * Procedural name generation for all Pathfinder 2e ancestries
 */

import { RandomUtils } from '../utils.js';
import { DataLoader } from '../data-loader.js';

/**
 * Procedural name generator for NPCs
 * Generates culturally appropriate names for Golarion ancestries
 *
 * Enhanced with:
 * - Uniqueness tracking to prevent duplicate names
 * - Infinite generation capability through variations
 * - Similarity detection to ensure distinct names
 * - Phoneme-based fallback generation
 */
export class NameGenerator {

  /**
   * Cache for loaded name patterns
   */
  static namePatterns = new Map();

  /**
   * Registry of all generated names for uniqueness checking
   * Structure: Map<ancestry, Set<name>>
   */
  static nameRegistry = new Map();

  /**
   * Configuration for name generation behavior
   */
  static config = {
    ensureUnique: true,              // Prevent duplicate names
    maxRetries: 50,                  // Max attempts to find unique name
    trackByAncestry: true,           // Separate tracking per ancestry
    minSimilarityDistance: 2,        // Minimum Levenshtein distance
    enableVariations: true,          // Use spelling variations if needed
    enablePhonemeGeneration: true    // Use phoneme-based generation as fallback
  };

  /**
   * Generate a name for a specific ancestry
   * @param {string} ancestry - Ancestry slug (e.g., "human", "elf", "dwarf")
   * @param {string} gender - Optional gender ("male", "female", "nonbinary", or null for random)
   * @param {Object} options - Additional options
   * @param {boolean} options.ensureUnique - Override global uniqueness setting
   * @param {number} options.maxRetries - Override max retry attempts
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

      // Determine uniqueness requirement
      const ensureUnique = options.ensureUnique !== undefined
        ? options.ensureUnique
        : this.config.ensureUnique;

      const maxRetries = options.maxRetries || this.config.maxRetries;

      // Generate unique name if required
      if (ensureUnique) {
        return this.generateUniqueName(ancestry, patterns, gender, options, maxRetries);
      }

      // Generate name without uniqueness check
      return this.generateFromPattern(patterns, gender, options);

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error generating name:", error);
      return this.generateGenericName();
    }
  }

  /**
   * Generate a unique name with collision detection and fallback strategies
   * @param {string} ancestry - Normalized ancestry slug
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender for generation
   * @param {Object} options - Generation options
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {string} Unique generated name
   */
  static generateUniqueName(ancestry, patterns, gender, options, maxRetries) {
    const registryKey = this.config.trackByAncestry ? ancestry : 'global';

    // Initialize registry for this ancestry if needed
    if (!this.nameRegistry.has(registryKey)) {
      this.nameRegistry.set(registryKey, new Set());
    }

    const usedNames = this.nameRegistry.get(registryKey);
    let attempts = 0;

    // Strategy 1: Standard generation with retries
    while (attempts < maxRetries) {
      const name = this.generateFromPattern(patterns, gender, options);

      if (!usedNames.has(name.toLowerCase()) &&
          this.isSufficientlyDifferent(name, usedNames)) {
        usedNames.add(name.toLowerCase());
        return name;
      }

      attempts++;
    }

    // Strategy 2: Generate with forced variations
    if (this.config.enableVariations) {
      for (let i = 0; i < maxRetries; i++) {
        const baseName = this.generateFromPattern(patterns, gender, options);
        const variedName = this.applyVariation(baseName, i);

        if (!usedNames.has(variedName.toLowerCase()) &&
            this.isSufficientlyDifferent(variedName, usedNames)) {
          usedNames.add(variedName.toLowerCase());
          return variedName;
        }
      }
    }

    // Strategy 3: Phoneme-based generation (infinite possibilities)
    if (this.config.enablePhonemeGeneration) {
      for (let i = 0; i < maxRetries; i++) {
        const phonemeName = this.generatePhonemeBasedName(patterns, gender);

        if (!usedNames.has(phonemeName.toLowerCase()) &&
            this.isSufficientlyDifferent(phonemeName, usedNames)) {
          usedNames.add(phonemeName.toLowerCase());
          return phonemeName;
        }
      }
    }

    // Final fallback: Add numeric suffix (guaranteed unique)
    const baseName = this.generateFromPattern(patterns, gender, options);
    let suffix = 1;
    let uniqueName = baseName;

    while (usedNames.has(uniqueName.toLowerCase())) {
      suffix++;
      // Use Roman numerals for elegance: Thorin II, Thorin III, etc.
      uniqueName = `${baseName} ${this.toRomanNumeral(suffix)}`;
    }

    usedNames.add(uniqueName.toLowerCase());
    return uniqueName;
  }

  /**
   * Check if a name is sufficiently different from existing names
   * Uses Levenshtein distance to prevent similar-sounding names
   * @param {string} name - Name to check
   * @param {Set} usedNames - Set of existing names
   * @returns {boolean} True if name is sufficiently different
   */
  static isSufficientlyDifferent(name, usedNames) {
    if (this.config.minSimilarityDistance <= 0) {
      return true; // Similarity check disabled
    }

    const nameLower = name.toLowerCase();
    const threshold = this.config.minSimilarityDistance;

    // Check against recent names (last 100 for performance)
    const recentNames = Array.from(usedNames).slice(-100);

    for (const existingName of recentNames) {
      const distance = this.levenshteinDistance(nameLower, existingName);
      if (distance < threshold) {
        return false; // Too similar
      }
    }

    return true;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {number} Edit distance
   */
  static levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Apply a variation to a name to create a distinct but related name
   * @param {string} name - Base name
   * @param {number} variationIndex - Which variation to apply
   * @returns {string} Varied name
   */
  static applyVariation(name, variationIndex) {
    const variations = [
      // Double a consonant
      (n) => {
        const consonants = 'bcdfghjklmnpqrstvwxz';
        for (let i = 1; i < n.length - 1; i++) {
          if (consonants.includes(n[i].toLowerCase())) {
            return n.slice(0, i + 1) + n[i] + n.slice(i + 1);
          }
        }
        return n;
      },
      // Add 'h' after initial consonant
      (n) => n.length > 1 ? n[0] + 'h' + n.slice(1) : n,
      // Change ending vowel
      (n) => {
        const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
        const endings = ['a', 'en', 'on', 'yn', 'an', 'in'];
        if (vowels.includes(n[n.length - 1].toLowerCase())) {
          return n.slice(0, -1) + endings[variationIndex % endings.length];
        }
        return n;
      },
      // Add suffix variation
      (n) => n + ['n', 'r', 's', 'th', 'x'][variationIndex % 5],
      // Swap internal vowels
      (n) => {
        const vowelMap = { 'a': 'e', 'e': 'i', 'i': 'o', 'o': 'u', 'u': 'a' };
        for (let i = 1; i < n.length - 1; i++) {
          if (vowelMap[n[i].toLowerCase()]) {
            return n.slice(0, i) + vowelMap[n[i].toLowerCase()] + n.slice(i + 1);
          }
        }
        return n;
      }
    ];

    const variation = variations[variationIndex % variations.length];
    return this.capitalize(variation(name));
  }

  /**
   * Generate a phoneme-based name using linguistic patterns
   * Analyzes existing syllables to create new, valid-sounding combinations
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender for generation
   * @returns {string} Generated name
   */
  static generatePhonemeBasedName(patterns, gender) {
    const genderPatterns = patterns[gender] || patterns["nonbinary"] || patterns;

    // Get all existing syllables to analyze phoneme patterns
    const prefixes = genderPatterns.prefixes || patterns.prefixes || [];
    const middles = genderPatterns.middles || patterns.middles || [];
    const suffixes = genderPatterns.suffixes || patterns.suffixes || [];

    // Analyze phoneme patterns from existing syllables
    const onsets = this.extractPhonemePattern(prefixes, 'onset');
    const nuclei = this.extractPhonemePattern([...prefixes, ...middles, ...suffixes], 'nucleus');
    const codas = this.extractPhonemePattern(suffixes, 'coda');

    // Generate new syllables using learned patterns
    const length = this.getNameLength(patterns);
    let name = '';

    for (let i = 0; i < length; i++) {
      const onset = RandomUtils.selectFrom(onsets);
      const nucleus = RandomUtils.selectFrom(nuclei);
      const coda = (i === length - 1) ? RandomUtils.selectFrom(codas) : '';

      name += onset + nucleus + coda;
    }

    return this.capitalize(name);
  }

  /**
   * Extract phoneme patterns from existing syllables
   * @param {Array} syllables - Array of syllable strings
   * @param {string} type - 'onset', 'nucleus', or 'coda'
   * @returns {Array} Array of phoneme patterns
   */
  static extractPhonemePattern(syllables, type) {
    const patterns = new Set();
    const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

    for (const syllable of syllables) {
      const lower = syllable.toLowerCase();

      if (type === 'onset') {
        // Extract initial consonant cluster
        let onset = '';
        for (let i = 0; i < lower.length; i++) {
          if (!vowels.has(lower[i])) {
            onset += lower[i];
          } else {
            break;
          }
        }
        patterns.add(onset);
      } else if (type === 'nucleus') {
        // Extract vowel sound(s)
        let nucleus = '';
        let foundVowel = false;
        for (let i = 0; i < lower.length; i++) {
          if (vowels.has(lower[i])) {
            nucleus += lower[i];
            foundVowel = true;
          } else if (foundVowel) {
            break;
          }
        }
        if (nucleus) patterns.add(nucleus);
      } else if (type === 'coda') {
        // Extract final consonant cluster
        let coda = '';
        let foundVowel = false;
        for (let i = 0; i < lower.length; i++) {
          if (vowels.has(lower[i])) {
            foundVowel = true;
            coda = '';
          } else if (foundVowel) {
            coda += lower[i];
          }
        }
        patterns.add(coda);
      }
    }

    return Array.from(patterns).filter(p => p.length > 0 || type === 'coda');
  }

  /**
   * Convert number to Roman numeral
   * @param {number} num - Number to convert
   * @returns {string} Roman numeral
   */
  static toRomanNumeral(num) {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

    let result = '';
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += numerals[i];
        num -= values[i];
      }
    }
    return result;
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
          return parseInt(length, 10);
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

  /**
   * Clear the name registry (reset uniqueness tracking)
   * @param {string} ancestry - Optional ancestry to clear (clears all if not specified)
   */
  static clearNameRegistry(ancestry = null) {
    if (ancestry) {
      const normalized = this.normalizeAncestry(ancestry);
      this.nameRegistry.delete(normalized);
    } else {
      this.nameRegistry.clear();
    }
  }

  /**
   * Get statistics about name generation
   * @param {string} ancestry - Optional ancestry to get stats for
   * @returns {Object} Statistics object
   */
  static getNameStats(ancestry = null) {
    if (ancestry) {
      const normalized = this.normalizeAncestry(ancestry);
      const registryKey = this.config.trackByAncestry ? normalized : 'global';
      const usedNames = this.nameRegistry.get(registryKey);

      return {
        ancestry: normalized,
        uniqueNamesGenerated: usedNames ? usedNames.size : 0,
        sampleNames: usedNames ? Array.from(usedNames).slice(0, 10) : []
      };
    }

    // Global stats
    const stats = {
      totalUniqueNames: 0,
      ancestries: {},
      config: { ...this.config }
    };

    for (const [key, nameSet] of this.nameRegistry.entries()) {
      stats.totalUniqueNames += nameSet.size;
      stats.ancestries[key] = {
        count: nameSet.size,
        sampleNames: Array.from(nameSet).slice(0, 5)
      };
    }

    return stats;
  }

  /**
   * Calculate the theoretical maximum unique names for an ancestry
   * @param {string} ancestry - Ancestry to analyze
   * @returns {Promise<Object>} Capacity analysis
   */
  static async getNameCapacity(ancestry) {
    const normalized = this.normalizeAncestry(ancestry);
    const patterns = await this.loadPatterns(normalized);

    if (!patterns) {
      return { error: `No patterns found for ancestry: ${ancestry}` };
    }

    const genders = ['male', 'female', 'nonbinary'];
    const analysis = {
      ancestry: normalized,
      byGender: {},
      total: 0
    };

    for (const gender of genders) {
      const genderPatterns = patterns[gender] || patterns['nonbinary'] || patterns;
      const prefixes = (genderPatterns.prefixes || patterns.prefixes || []).length;
      const middles = (genderPatterns.middles || patterns.middles || []).length;
      const suffixes = (genderPatterns.suffixes || patterns.suffixes || []).length;

      // Calculate combinations for different syllable lengths
      const twoSyllable = prefixes * Math.max(middles, suffixes);
      const threeSyllable = middles > 0 ? prefixes * middles * suffixes : 0;

      let baseCombinations = twoSyllable + threeSyllable;

      // Factor in clan names if applicable
      if (patterns.clanNames && patterns.structures) {
        const clanWeight = patterns.structures.find(s => s.type === 'clan-name')?.weight || 0;
        if (clanWeight > 0) {
          baseCombinations *= (patterns.clanNames.length + 1);
        }
      }

      // Factor in last names if applicable
      if (patterns.hasLastNames) {
        const lastNames = (patterns.lastNames || []).length;
        const lastNameCombinations = patterns.lastNamePrefixes && patterns.lastNameSuffixes
          ? patterns.lastNamePrefixes.length * patterns.lastNameSuffixes.length
          : lastNames;

        baseCombinations *= (lastNameCombinations + 1);
      }

      // Phoneme-based generation adds essentially infinite capacity
      const effectiveCapacity = this.config.enablePhonemeGeneration
        ? "Infinite (phoneme-based)"
        : baseCombinations.toLocaleString();

      analysis.byGender[gender] = {
        prefixes,
        middles,
        suffixes,
        baseCombinations: baseCombinations.toLocaleString(),
        effectiveCapacity
      };

      if (typeof baseCombinations === 'number') {
        analysis.total += baseCombinations;
      }
    }

    analysis.totalBaseCombinations = analysis.total.toLocaleString();
    analysis.effectiveCapacity = this.config.enablePhonemeGeneration
      ? "Infinite (phoneme-based generation enabled)"
      : analysis.totalBaseCombinations;

    return analysis;
  }

  /**
   * Test uniqueness by generating multiple names
   * @param {string} ancestry - Ancestry to test
   * @param {number} count - Number of names to generate
   * @param {string} gender - Optional gender
   * @returns {Promise<Object>} Test results
   */
  static async testUniqueness(ancestry, count = 100, gender = null) {
    const startTime = Date.now();
    const names = new Set();
    const duplicates = [];
    const similarities = [];

    // Temporarily save current config
    const originalConfig = { ...this.config };

    // Enable strict uniqueness for testing
    this.config.ensureUnique = true;
    this.config.minSimilarityDistance = 2;

    // Clear registry for this test
    this.clearNameRegistry(ancestry);

    for (let i = 0; i < count; i++) {
      const name = await this.generate(ancestry, gender, { ensureUnique: true });

      if (names.has(name.toLowerCase())) {
        duplicates.push(name);
      }

      names.add(name.toLowerCase());
    }

    // Check for similar names
    const nameArray = Array.from(names);
    for (let i = 0; i < nameArray.length; i++) {
      for (let j = i + 1; j < nameArray.length; j++) {
        const distance = this.levenshteinDistance(nameArray[i], nameArray[j]);
        if (distance <= 2) {
          similarities.push({
            name1: nameArray[i],
            name2: nameArray[j],
            distance
          });
        }
      }
    }

    const endTime = Date.now();

    // Restore original config
    this.config = originalConfig;

    return {
      ancestry,
      gender: gender || 'random',
      attempted: count,
      unique: names.size,
      duplicates: duplicates.length,
      duplicateNames: duplicates,
      similarPairs: similarities.length,
      similarityExamples: similarities.slice(0, 5),
      timeMs: endTime - startTime,
      avgTimePerName: ((endTime - startTime) / count).toFixed(2),
      sampleNames: Array.from(names).slice(0, 20)
    };
  }

  /**
   * Configure name generation behavior
   * @param {Object} options - Configuration options
   */
  static configure(options = {}) {
    this.config = { ...this.config, ...options };
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  static getConfig() {
    return { ...this.config };
  }
}
