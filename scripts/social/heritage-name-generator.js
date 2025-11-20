/**
 * PF2e Narrative Seeds - Heritage Name Generator
 * Specialized name generation for versatile heritages with blending capabilities
 */

import { NameGenerator } from './name-generator.js';
import { MarkovNameGenerator } from './markov-name-generator.js';
import { RandomUtils } from '../utils.js';
import { DataLoader } from '../data-loader.js';

/**
 * Heritage-specific name generator with advanced blending
 * Handles: Half-Elf, Half-Orc, Tiefling, Aasimar, Dhampir, Changeling, Ganzi, Aphorite, Duskwalker
 */
export class HeritageNameGenerator extends NameGenerator {

  /**
   * Cache for heritage data
   */
  static heritageData = null;
  static ancestryPatterns = new Map();

  /**
   * Generate a name for a versatile heritage
   * @param {string} heritage - Heritage type (e.g., 'tiefling', 'half-elf', 'nephilim')
   * @param {string} gender - Gender ('male', 'female', 'neutral', or null for random)
   * @param {Object} options - Additional options
   * @param {string} options.primaryAncestry - For blended heritages (e.g., 'human' for half-elf)
   * @param {string} options.region - Regional variant for humans
   * @param {string} options.strategy - Specific blending strategy to use
   * @param {number} options.blendRatio - Ratio for blending (0-1)
   * @param {string} options.lineage - For nephilim: 'celestial', 'fiendish', 'protean', 'inevitable'
   * @returns {Promise<string>} Generated name
   */
  static async generateHeritageName(heritage, gender = null, options = {}) {
    // Load heritage data if not cached
    if (!this.heritageData) {
      this.heritageData = await DataLoader.loadJSON('data/social/names/versatile-heritages.json');
    }

    // If data failed to load, return null
    if (!this.heritageData) {
      console.error("PF2e Narrative Seeds | Failed to load heritage data");
      return null;
    }

    // Handle Nephilim with lineages (Remaster)
    if (heritage === 'nephilim') {
      const lineage = options.lineage || 'fiendish'; // Default to fiendish if not specified
      const nephilimInfo = this.heritageData.heritages?.nephilim;

      if (nephilimInfo && nephilimInfo.lineages[lineage]) {
        // Route to the legacy heritage name
        const legacyHeritage = nephilimInfo.lineages[lineage].legacyName;
        console.log(`PF2e Narrative Seeds | Routing Nephilim (${lineage}) to ${legacyHeritage}`);
        heritage = legacyHeritage;
      }
    }

    // Legacy name support - map old names to nephilim lineages for consistency
    const legacyToLineage = {
      'aasimar': 'celestial',
      'tiefling': 'fiendish',
      'ganzi': 'protean',
      'aphorite': 'inevitable'
    };

    // If a lineage wasn't specified but we have a legacy heritage, note the lineage for metadata
    if (!options.lineage && legacyToLineage[heritage]) {
      options.lineage = legacyToLineage[heritage];
    }

    const heritageInfo = this.heritageData.heritages[heritage];
    if (!heritageInfo) {
      console.warn(`PF2e Narrative Seeds | Unknown heritage: ${heritage}, using default generation`);
      return await this.generate(options.primaryAncestry || 'human', gender);
    }

    // Determine gender if not specified
    if (!gender) {
      gender = RandomUtils.selectFrom(['male', 'female', 'neutral']);
    }

    // Route to specialized handler
    switch (heritage) {
      case 'half-elf':
        return await this.generateHalfElfName(heritageInfo, gender, options);
      case 'half-orc':
        return await this.generateHalfOrcName(heritageInfo, gender, options);
      case 'tiefling':
        return await this.generateTieflingName(heritageInfo, gender, options);
      case 'aasimar':
        return await this.generateAasimarName(heritageInfo, gender, options);
      case 'dhampir':
        return await this.generateDhampirName(heritageInfo, gender, options);
      case 'changeling':
        return await this.generateChangelingName(heritageInfo, gender, options);
      case 'ganzi':
        return await this.generateGanziName(heritageInfo, gender, options);
      case 'aphorite':
        return await this.generateAphoriteName(heritageInfo, gender, options);
      case 'duskwalker':
        return await this.generateDuskwalkerName(heritageInfo, gender, options);
      default:
        return await this.generateBlendedName(heritageInfo, gender, options);
    }
  }

  /**
   * Generate a half-elf name (blend human and elf)
   */
  static async generateHalfElfName(heritageInfo, gender, options = {}) {
    const { strategy, blendRatio = 0.5 } = options;
    const rules = heritageInfo.blendingRules;

    // Select blending strategy
    const selectedStrategy = strategy || RandomUtils.selectFrom(rules.strategies);

    switch (selectedStrategy) {
      case 'blend_syllables':
        return await this.blendSyllables('human', 'elf', gender, blendRatio);

      case 'human_first_elf_last':
        return await this.combineParts('human', 'elf', gender, 'first', 'last');

      case 'elf_first_human_last':
        return await this.combineParts('elf', 'human', gender, 'first', 'last');

      case 'hybrid_construction':
        return await this.hybridConstruction('human', 'elf', gender, blendRatio);

      default:
        return await this.blendSyllables('human', 'elf', gender, blendRatio);
    }
  }

  /**
   * Generate a half-orc name (blend human and orc)
   */
  static async generateHalfOrcName(heritageInfo, gender, options = {}) {
    const { strategy, blendRatio = 0.6 } = options; // Slightly more orcish
    const rules = heritageInfo.blendingRules;

    const selectedStrategy = strategy || RandomUtils.selectFrom(rules.strategies);

    switch (selectedStrategy) {
      case 'harsh_human':
        // Human name with harsher phonetics
        return await this.applyPhoneticShift('human', gender, 'harshen');

      case 'softened_orc':
        // Orc name with softened consonants
        return await this.applyPhoneticShift('orc', gender, 'soften');

      case 'compound':
        // Compound of both
        const humanPart = await this.getNamePart('human', gender, 'prefix');
        const orcPart = await this.getNamePart('orc', gender, 'suffix');
        return this.capitalize(humanPart + orcPart);

      default:
        return await this.blendSyllables('human', 'orc', gender, blendRatio);
    }
  }

  /**
   * Generate a tiefling name (infernal, virtue, or human)
   */
  static async generateTieflingName(heritageInfo, gender, options = {}) {
    // Weight-based selection of naming pattern
    const patterns = heritageInfo.namingPatterns;
    const totalWeight = Object.values(patterns).reduce((sum, p) => sum + p.weight, 0);
    const roll = Math.random() * totalWeight;

    let cumulative = 0;
    let selectedPattern = 'infernal';

    for (const [pattern, data] of Object.entries(patterns)) {
      cumulative += data.weight;
      if (roll <= cumulative) {
        selectedPattern = pattern;
        break;
      }
    }

    switch (selectedPattern) {
      case 'infernal':
        // Use infernal names or construct from prefixes/suffixes
        if (gender === 'male' && heritageInfo.infernalNames.male) {
          return Math.random() < 0.5
            ? RandomUtils.selectFrom(heritageInfo.infernalNames.male)
            : this.constructInfernalName(heritageInfo, 'male');
        } else if (gender === 'female' && heritageInfo.infernalNames.female) {
          return Math.random() < 0.5
            ? RandomUtils.selectFrom(heritageInfo.infernalNames.female)
            : this.constructInfernalName(heritageInfo, 'female');
        } else {
          return this.constructInfernalName(heritageInfo, gender);
        }

      case 'virtue':
        // Select from virtue names
        const virtueCategories = Object.keys(heritageInfo.virtueNames);
        const category = RandomUtils.selectFrom(virtueCategories);
        return RandomUtils.selectFrom(heritageInfo.virtueNames[category]);

      case 'human':
        // Use human name (potentially region-specific)
        return await this.generate('human', gender);

      default:
        return this.constructInfernalName(heritageInfo, gender);
    }
  }

  /**
   * Generate an aasimar name (celestial, virtue, or human)
   */
  static async generateAasimarName(heritageInfo, gender, options = {}) {
    const patterns = heritageInfo.namingPatterns;
    const totalWeight = Object.values(patterns).reduce((sum, p) => sum + p.weight, 0);
    const roll = Math.random() * totalWeight;

    let cumulative = 0;
    let selectedPattern = 'celestial';

    for (const [pattern, data] of Object.entries(patterns)) {
      cumulative += data.weight;
      if (roll <= cumulative) {
        selectedPattern = pattern;
        break;
      }
    }

    switch (selectedPattern) {
      case 'celestial':
        if (gender === 'male' && heritageInfo.celestialNames.male) {
          return Math.random() < 0.5
            ? RandomUtils.selectFrom(heritageInfo.celestialNames.male)
            : this.constructCelestialName(heritageInfo, 'male');
        } else if (gender === 'female' && heritageInfo.celestialNames.female) {
          return Math.random() < 0.5
            ? RandomUtils.selectFrom(heritageInfo.celestialNames.female)
            : this.constructCelestialName(heritageInfo, 'female');
        } else {
          return this.constructCelestialName(heritageInfo, gender);
        }

      case 'virtue':
        const virtueCategories = Object.keys(heritageInfo.virtueNames);
        const category = RandomUtils.selectFrom(virtueCategories);
        return RandomUtils.selectFrom(heritageInfo.virtueNames[category]);

      case 'human':
        return await this.generate('human', gender);

      default:
        return this.constructCelestialName(heritageInfo, gender);
    }
  }

  /**
   * Generate a dhampir name (gothic or human)
   */
  static async generateDhampirName(heritageInfo, gender, options = {}) {
    const patterns = heritageInfo.namingPatterns;
    const selectedPattern = Math.random() < (patterns.gothic.weight / 100)
      ? 'gothic'
      : 'human';

    if (selectedPattern === 'gothic') {
      // Use gothic names or construct
      const nameList = heritageInfo.names[gender] || heritageInfo.names.male;
      if (nameList && Math.random() < 0.5) {
        return RandomUtils.selectFrom(nameList);
      } else {
        return this.constructGothicName(heritageInfo, gender);
      }
    } else {
      return await this.generate('human', gender);
    }
  }

  /**
   * Generate a changeling name (fey, nature, or human)
   */
  static async generateChangelingName(heritageInfo, gender, options = {}) {
    const patterns = heritageInfo.namingPatterns;
    const totalWeight = Object.values(patterns).reduce((sum, p) => sum + p.weight, 0);
    const roll = Math.random() * totalWeight;

    let cumulative = 0;
    let selectedPattern = 'fey';

    for (const [pattern, data] of Object.entries(patterns)) {
      cumulative += data.weight;
      if (roll <= cumulative) {
        selectedPattern = pattern;
        break;
      }
    }

    if (selectedPattern === 'fey' || selectedPattern === 'nature') {
      // Use neutral names (changelings often use gender-neutral names)
      const nameList = heritageInfo.names.neutral;
      if (nameList && Math.random() < 0.5) {
        return RandomUtils.selectFrom(nameList);
      } else {
        return this.constructFeyName(heritageInfo);
      }
    } else {
      return await this.generate('human', gender);
    }
  }

  /**
   * Generate a ganzi name (chaotic patterns)
   */
  static async generateGanziName(heritageInfo, gender, options = {}) {
    const nameList = heritageInfo.names.neutral;
    if (nameList && Math.random() < 0.5) {
      return RandomUtils.selectFrom(nameList);
    } else {
      return this.constructChaoticName(heritageInfo);
    }
  }

  /**
   * Generate an aphorite name (ordered patterns)
   */
  static async generateAphoriteName(heritageInfo, gender, options = {}) {
    const nameList = heritageInfo.names.neutral;
    if (nameList && Math.random() < 0.5) {
      return RandomUtils.selectFrom(nameList);
    } else {
      return this.constructOrderedName(heritageInfo);
    }
  }

  /**
   * Generate a duskwalker name (memorial patterns)
   */
  static async generateDuskwalkerName(heritageInfo, gender, options = {}) {
    const nameList = heritageInfo.names.neutral;
    if (nameList && Math.random() < 0.5) {
      return RandomUtils.selectFrom(nameList);
    } else {
      return this.constructMemorialName(heritageInfo);
    }
  }

  /**
   * Blend syllables from two ancestries using Markov chains
   */
  static async blendSyllables(ancestry1, ancestry2, gender, ratio = 0.5) {
    // Get patterns for both ancestries
    const patterns1 = await this.getAncestryPatterns(ancestry1);
    const patterns2 = await this.getAncestryPatterns(ancestry2);

    // Use Markov chain blending
    return await MarkovNameGenerator.generateBlended(
      patterns1,
      patterns2,
      gender,
      ratio
    );
  }

  /**
   * Combine parts from two ancestries (e.g., human first name + elf last name)
   */
  static async combineParts(ancestry1, ancestry2, gender, part1Type, part2Type) {
    const part1 = await this.getNamePart(ancestry1, gender, part1Type);
    const part2 = await this.getNamePart(ancestry2, gender, part2Type);

    return part1Type === 'first' && part2Type === 'last'
      ? `${this.capitalize(part1)} ${this.capitalize(part2)}`
      : this.capitalize(part1 + part2);
  }

  /**
   * Hybrid construction using weighted syllable selection
   */
  static async hybridConstruction(ancestry1, ancestry2, gender, ratio = 0.5) {
    const patterns1 = await this.getAncestryPatterns(ancestry1);
    const patterns2 = await this.getAncestryPatterns(ancestry2);

    // Determine syllable count (2-3)
    const syllableCount = Math.random() < 0.7 ? 2 : 3;
    let name = '';

    for (let i = 0; i < syllableCount; i++) {
      // Randomly select from ancestry1 or ancestry2 based on ratio
      const useFirst = Math.random() < ratio;
      const patterns = useFirst ? patterns1 : patterns2;

      const genderData = patterns[gender] || patterns.male;
      if (!genderData) continue;

      if (i === 0 && genderData.prefixes) {
        name += RandomUtils.selectFrom(genderData.prefixes);
      } else if (genderData.suffixes) {
        name += RandomUtils.selectFrom(genderData.suffixes);
      } else if (genderData.prefixes) {
        name += RandomUtils.selectFrom(genderData.prefixes);
      }
    }

    return this.capitalize(name);
  }

  /**
   * Apply phonetic shifts to make names sound harsher or softer
   */
  static async applyPhoneticShift(ancestry, gender, direction) {
    const baseName = await this.generate(ancestry, gender);

    if (direction === 'harshen') {
      // Make consonants harsher: t→k, s→sh, l→r, etc.
      return baseName
        .replace(/t/g, 'k')
        .replace(/s/g, 'sh')
        .replace(/l/g, 'r')
        .replace(/v/g, 'g');
    } else if (direction === 'soften') {
      // Make consonants softer: k→t, g→d, r→l, etc.
      return baseName
        .replace(/k/g, 't')
        .replace(/g/g, 'd')
        .replace(/r/g, 'l')
        .replace(/sh/g, 's');
    }

    return baseName;
  }

  /**
   * Get a specific part of a name (prefix/suffix/first/last)
   */
  static async getNamePart(ancestry, gender, partType) {
    const patterns = await this.getAncestryPatterns(ancestry);
    const genderData = patterns[gender] || patterns.male;

    if (!genderData) {
      return 'Unnamed';
    }

    if (partType === 'prefix' && genderData.prefixes) {
      return RandomUtils.selectFrom(genderData.prefixes);
    } else if (partType === 'suffix' && genderData.suffixes) {
      return RandomUtils.selectFrom(genderData.suffixes);
    } else if (partType === 'first' && genderData.prefixes) {
      return RandomUtils.selectFrom(genderData.prefixes);
    } else if (partType === 'last') {
      // Try to get a last name
      if (patterns.lastNames) {
        return RandomUtils.selectFrom(patterns.lastNames);
      } else if (genderData.suffixes) {
        return RandomUtils.selectFrom(genderData.suffixes);
      }
    }

    return genderData.prefixes ? RandomUtils.selectFrom(genderData.prefixes) : '';
  }

  /**
   * Construct an infernal name from prefixes and suffixes
   */
  static constructInfernalName(heritageInfo, gender) {
    const prefix = RandomUtils.selectFrom(heritageInfo.infernalPrefixes);
    const suffix = RandomUtils.selectFrom(heritageInfo.infernalSuffixes);

    // Female names often end in 'a' or 'ia'
    if (gender === 'female') {
      return this.capitalize(prefix.toLowerCase() + suffix.replace(/us$/, 'a').replace(/el$/, 'ia'));
    }

    return this.capitalize(prefix.toLowerCase() + suffix);
  }

  /**
   * Construct a celestial name from prefixes and suffixes
   */
  static constructCelestialName(heritageInfo, gender) {
    const prefix = RandomUtils.selectFrom(heritageInfo.celestialPrefixes);
    const suffix = RandomUtils.selectFrom(heritageInfo.celestialSuffixes);

    // Female names often have 'aria' or 'ia' suffixes
    if (gender === 'female') {
      const femaleSuffixes = ['aria', 'iel', 'ia', 'riel', 'viel'];
      const femSuffix = Math.random() < 0.5 ? RandomUtils.selectFrom(femaleSuffixes) : suffix;
      return this.capitalize(prefix.toLowerCase() + femSuffix);
    }

    return this.capitalize(prefix.toLowerCase() + suffix);
  }

  /**
   * Construct a gothic name from prefixes and suffixes
   */
  static constructGothicName(heritageInfo, gender) {
    const prefix = RandomUtils.selectFrom(heritageInfo.gothicPrefixes);
    const suffix = RandomUtils.selectFrom(heritageInfo.gothicSuffixes);

    return this.capitalize(prefix.toLowerCase() + suffix);
  }

  /**
   * Construct a fey name from prefixes and suffixes
   */
  static constructFeyName(heritageInfo) {
    const prefix = RandomUtils.selectFrom(heritageInfo.feyPrefixes);
    const suffix = RandomUtils.selectFrom(heritageInfo.feySuffixes);

    return this.capitalize(prefix.toLowerCase() + suffix);
  }

  /**
   * Construct a chaotic name (ganzi)
   */
  static constructChaoticName(heritageInfo) {
    const prefix = RandomUtils.selectFrom(heritageInfo.chaoticPrefixes);
    const suffix = RandomUtils.selectFrom(heritageInfo.chaoticSuffixes);

    // Ganzi names are intentionally unusual
    return this.capitalize(prefix + suffix);
  }

  /**
   * Construct an ordered name (aphorite)
   */
  static constructOrderedName(heritageInfo) {
    const prefix = RandomUtils.selectFrom(heritageInfo.orderedPrefixes);
    const suffix = RandomUtils.selectFrom(heritageInfo.orderedSuffixes);

    return this.capitalize(prefix.toLowerCase() + suffix);
  }

  /**
   * Construct a memorial name (duskwalker)
   */
  static constructMemorialName(heritageInfo) {
    const prefix = RandomUtils.selectFrom(heritageInfo.memorialPrefixes);
    const suffix = RandomUtils.selectFrom(heritageInfo.memorialSuffixes);

    return this.capitalize(prefix + suffix);
  }

  /**
   * Get ancestry patterns (cached)
   */
  static async getAncestryPatterns(ancestry) {
    if (!this.ancestryPatterns.has(ancestry)) {
      try {
        const data = await DataLoader.loadJSON(`data/social/names/${ancestry}.json`);
        this.ancestryPatterns.set(ancestry, data);
      } catch (error) {
        console.warn(`PF2e Narrative Seeds | Could not load patterns for ${ancestry}:`, error);
        // Return minimal patterns
        return {
          male: { prefixes: ['Un'], suffixes: ['known'] },
          female: { prefixes: ['Un'], suffixes: ['known'] }
        };
      }
    }
    return this.ancestryPatterns.get(ancestry);
  }

  /**
   * Generic blended name generation
   */
  static async generateBlendedName(heritageInfo, gender, options = {}) {
    const { blendRatio = 0.5 } = options;

    // If we have blending rules, use them
    if (heritageInfo.blendingRules) {
      const strategies = heritageInfo.blendingRules.strategies;
      const strategy = RandomUtils.selectFrom(strategies);

      // Try to infer ancestries from strategy name
      if (strategy.includes('human')) {
        return await this.blendSyllables('human', 'elf', gender, blendRatio);
      }
    }

    // Fallback to basic construction if we have prefixes/suffixes
    if (heritageInfo.prefixes && heritageInfo.suffixes) {
      const prefix = RandomUtils.selectFrom(heritageInfo.prefixes);
      const suffix = RandomUtils.selectFrom(heritageInfo.suffixes);
      return this.capitalize(prefix.toLowerCase() + suffix);
    }

    // Last resort: use base generator
    return await this.generate(options.primaryAncestry || 'human', gender);
  }
}
