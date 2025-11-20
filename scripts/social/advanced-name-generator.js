/**
 * PF2e Narrative Seeds - Advanced Name Generator
 * Golarion-specific enhancements for name generation
 */

import { NameGenerator } from './name-generator.js';
import { HeritageNameGenerator } from './heritage-name-generator.js';
import { RandomUtils } from '../utils.js';
import { DataLoader } from '../data-loader.js';

/**
 * Advanced name generator with Golarion-specific features
 * Adds: Regional variants, titles, epithets, etymologies, context-awareness
 */
export class AdvancedNameGenerator extends NameGenerator {

  /**
   * Cache for advanced pattern data
   */
  static regionalPatterns = new Map();
  static titlesData = null;
  static etymologyData = null;

  /**
   * Generate an advanced name with context
   * @param {string} ancestry - Ancestry slug (or versatile heritage)
   * @param {string} gender - Gender
   * @param {Object} context - Generation context
   * @param {string} context.region - Regional variant (e.g., "chelaxian", "taldan")
   * @param {string} context.class - Character class
   * @param {string} context.deity - Patron deity
   * @param {string} context.background - Character background
   * @param {number} context.level - Character level (affects title probability)
   * @param {boolean} context.includeTitle - Force title generation
   * @param {boolean} context.includeEpithet - Force epithet generation
   * @param {boolean} context.includeMeaning - Include name etymology
   * @param {string} context.heritage - Versatile heritage (if applicable)
   * @param {string} context.primaryAncestry - Primary ancestry for heritage blending
   * @param {string} context.blendStrategy - Specific blending strategy
   * @param {number} context.blendRatio - Heritage blending ratio (0-1)
   * @param {string} context.lineage - For nephilim: 'celestial', 'fiendish', 'protean', 'inevitable'
   * @returns {Promise<Object>} Generated name with metadata
   */
  static async generateAdvanced(ancestry, gender = null, context = {}) {
    const {
      region = null,
      class: charClass = null,
      deity = null,
      background = null,
      level = 1,
      includeTitle = null,
      includeEpithet = null,
      includeMeaning = false,
      heritage = null,
      primaryAncestry = null,
      blendStrategy = null,
      blendRatio = 0.5,
      lineage = null
    } = context;

    // List of versatile heritages (includes both remaster and legacy names)
    const versatileHeritages = [
      'half-elf', 'half-orc',
      'nephilim',  // Remaster heritage with lineages
      'tiefling', 'aasimar', 'ganzi', 'aphorite',  // Legacy names (map to nephilim lineages)
      'dhampir', 'changeling', 'duskwalker'
    ];

    // Generate base name
    let baseName;

    // Check if this is a versatile heritage
    if (heritage && versatileHeritages.includes(heritage)) {
      baseName = await HeritageNameGenerator.generateHeritageName(
        heritage,
        gender,
        {
          primaryAncestry: primaryAncestry || ancestry,
          region,
          strategy: blendStrategy,
          blendRatio,
          lineage
        }
      );
    } else if (versatileHeritages.includes(ancestry)) {
      // Ancestry IS a versatile heritage
      baseName = await HeritageNameGenerator.generateHeritageName(
        ancestry,
        gender,
        {
          primaryAncestry,
          region,
          strategy: blendStrategy,
          blendRatio,
          lineage
        }
      );
    } else if (region && ancestry === 'human') {
      // Regional human variant
      baseName = await this.generateRegionalName(region, gender);
    } else {
      // Standard ancestry
      baseName = await this.generate(ancestry, gender);
    }

    // Determine if we should add titles/epithets
    const titleDecision = this.shouldAddTitle(level, includeTitle);
    const epithetDecision = this.shouldAddEpithet(level, includeEpithet);

    // Build full name
    let fullName = baseName;
    let title = null;
    let epithet = null;
    let meaning = null;

    // Add title if appropriate
    if (titleDecision.add) {
      title = await this.generateTitle(context, titleDecision.complexity);
      if (title) {
        fullName = title.position === 'prefix'
          ? `${title.text} ${fullName}`
          : `${fullName} ${title.text}`;
      }
    }

    // Add epithet if appropriate
    if (epithetDecision.add) {
      epithet = await this.generateEpithet(ancestry, context, epithetDecision.complexity);
      if (epithet) {
        fullName = `${fullName} ${epithet.text}`;
      }
    }

    // Generate meaning if requested
    if (includeMeaning) {
      meaning = await this.generateNameMeaning(baseName, ancestry, region);
    }

    return {
      fullName,
      baseName,
      title: title?.text || null,
      epithet: epithet?.text || null,
      meaning,
      metadata: {
        ancestry,
        heritage: heritage || (versatileHeritages.includes(ancestry) ? ancestry : null),
        lineage,
        gender,
        region,
        primaryAncestry,
        class: charClass,
        deity,
        background,
        level,
        blendStrategy,
        blendRatio
      }
    };
  }

  /**
   * Generate a regional name variant
   * @param {string} region - Region slug
   * @param {string} gender - Gender
   * @returns {Promise<string>} Generated regional name
   */
  static async generateRegionalName(region, gender = null) {
    // Load regional patterns
    if (!this.regionalPatterns.has('human-regions')) {
      const data = await DataLoader.loadJSON('data/social/names/human-regions.json');
      this.regionalPatterns.set('human-regions', data);
    }

    const regionalData = this.regionalPatterns.get('human-regions');
    const regionData = regionalData.regions[region];

    if (!regionData) {
      console.warn(`PF2e Narrative Seeds | Unknown region: ${region}, using standard human names`);
      return await this.generate('human', gender);
    }

    // Determine gender
    if (!gender) {
      gender = RandomUtils.selectFrom(['male', 'female']);
    }

    const genderData = regionData[gender];
    if (!genderData) {
      return await this.generate('human', gender);
    }

    // Generate first name
    const prefix = RandomUtils.selectFrom(genderData.prefixes);
    const suffix = Math.random() < 0.5 && genderData.suffixes
      ? RandomUtils.selectFrom(genderData.suffixes)
      : '';

    const firstName = this.capitalize(prefix + suffix);

    // Generate last name if available
    if (regionData.lastNamePrefixes && Math.random() < 0.7) {
      const lastPrefix = RandomUtils.selectFrom(regionData.lastNamePrefixes);
      const lastSuffix = regionData.lastNameSuffixes
        ? RandomUtils.selectFrom(regionData.lastNameSuffixes)
        : '';

      const lastName = this.capitalize(lastPrefix + lastSuffix);
      return `${firstName} ${lastName}`;
    }

    return firstName;
  }

  /**
   * Determine if a title should be added
   * @param {number} level - Character level
   * @param {boolean} force - Force inclusion
   * @returns {Object} Decision object
   */
  static shouldAddTitle(level, force) {
    if (force !== null) {
      return { add: force, complexity: level >= 10 ? 'complex' : 'simple' };
    }

    // Probability based on level
    const levelRanges = [
      { max: 3, prob: 0.25, complexity: 'simple' },
      { max: 7, prob: 0.55, complexity: 'simple' },
      { max: 12, prob: 0.70, complexity: 'complex' },
      { max: 16, prob: 0.85, complexity: 'complex' },
      { max: 20, prob: 0.95, complexity: 'complex' }
    ];

    const range = levelRanges.find(r => level <= r.max) || levelRanges[levelRanges.length - 1];
    return {
      add: Math.random() < range.prob,
      complexity: range.complexity
    };
  }

  /**
   * Determine if an epithet should be added
   * @param {number} level - Character level
   * @param {boolean} force - Force inclusion
   * @returns {Object} Decision object
   */
  static shouldAddEpithet(level, force) {
    if (force !== null) {
      return { add: force, complexity: level >= 10 ? 'legendary' : 'simple' };
    }

    // Higher levels = more epithets
    const probability = Math.min(0.05 + (level * 0.04), 0.85);
    return {
      add: Math.random() < probability,
      complexity: level >= 13 ? 'legendary' : level >= 7 ? 'heroic' : 'simple'
    };
  }

  /**
   * Generate a title based on context
   * @param {Object} context - Generation context
   * @param {string} complexity - 'simple' or 'complex'
   * @returns {Promise<Object>} Title object
   */
  static async generateTitle(context, complexity) {
    if (!this.titlesData) {
      this.titlesData = await DataLoader.loadJSON('data/social/titles-epithets.json');
    }

    const { class: charClass, background, deity } = context;
    const honorifics = this.titlesData.honorifics;

    // Determine which honorific category to use
    let category;
    if (charClass && ['cleric', 'oracle', 'champion'].includes(charClass.toLowerCase())) {
      category = 'religious';
    } else if (background && background.toLowerCase().includes('noble')) {
      category = 'noble';
    } else if (charClass && ['fighter', 'ranger', 'champion', 'paladin'].includes(charClass.toLowerCase())) {
      category = 'military';
    } else if (charClass && ['wizard', 'sorcerer', 'magus'].includes(charClass.toLowerCase())) {
      category = 'arcane';
    } else {
      category = RandomUtils.selectWeighted(
        Object.entries(honorifics).map(([key, val]) => ({ id: key, weight: val.weight })),
        'weight'
      );
    }

    const selectedCategory = honorifics[category];
    if (!selectedCategory || !selectedCategory.prefix) {
      return null;
    }

    return {
      text: RandomUtils.selectFrom(selectedCategory.prefix),
      position: 'prefix',
      category
    };
  }

  /**
   * Generate an epithet based on context
   * @param {string} ancestry - Character ancestry
   * @param {Object} context - Generation context
   * @param {string} complexity - 'simple', 'heroic', or 'legendary'
   * @returns {Promise<Object>} Epithet object
   */
  static async generateEpithet(ancestry, context, complexity) {
    if (!this.titlesData) {
      this.titlesData = await DataLoader.loadJSON('data/social/titles-epithets.json');
    }

    const { class: charClass, deity, background } = context;

    // Try ancestry-specific epithets first
    const ancestryEpithets = this.titlesData.ancestrySpecificEpithets[ancestry];
    if (ancestryEpithets && Math.random() < 0.4) {
      const categories = Object.keys(ancestryEpithets);
      const category = RandomUtils.selectFrom(categories);
      const epithet = RandomUtils.selectFrom(ancestryEpithets[category]);
      return { text: epithet, type: `ancestry-${category}` };
    }

    // Try contextual titles
    const contextual = this.titlesData.contextualTitles;

    // Class-based
    if (charClass && contextual.byClass[charClass.toLowerCase()] && Math.random() < 0.5) {
      const epithet = RandomUtils.selectFrom(contextual.byClass[charClass.toLowerCase()]);
      return { text: epithet, type: 'class' };
    }

    // Deity-based
    if (deity && contextual.byDeity[deity] && Math.random() < 0.3) {
      const epithet = Array.isArray(contextual.byDeity[deity])
        ? RandomUtils.selectFrom(contextual.byDeity[deity])
        : contextual.byDeity[deity];
      return { text: epithet, type: 'deity' };
    }

    // Background-based
    if (background && contextual.byBackground[background.toLowerCase()] && Math.random() < 0.3) {
      const epithet = RandomUtils.selectFrom(contextual.byBackground[background.toLowerCase()]);
      return { text: epithet, type: 'background' };
    }

    // General epithets
    const generalEpithets = this.titlesData.epithets;
    const categories = complexity === 'legendary'
      ? ['heroic', 'mystical', 'descriptive']
      : complexity === 'heroic'
      ? ['heroic', 'descriptive', 'profession']
      : ['descriptive', 'profession', 'origin'];

    const category = RandomUtils.selectFrom(categories);
    const categoryData = generalEpithets[category];

    if (!categoryData) return null;

    // Get epithets from subcategories
    const subcategories = Object.keys(categoryData).filter(k => k !== 'weight');
    if (subcategories.length === 0) return null;

    const subcategory = RandomUtils.selectFrom(subcategories);
    const epithets = categoryData[subcategory];

    if (!Array.isArray(epithets) || epithets.length === 0) return null;

    const epithet = RandomUtils.selectFrom(epithets);
    return { text: epithet, type: `${category}-${subcategory}` };
  }

  /**
   * Generate etymology/meaning for a name
   * @param {string} name - The name to analyze
   * @param {string} ancestry - Character ancestry
   * @param {string} region - Regional variant
   * @returns {Promise<Object>} Meaning object
   */
  static async generateNameMeaning(name, ancestry, region = null) {
    if (!this.etymologyData) {
      this.etymologyData = await DataLoader.loadJSON('data/social/name-meanings.json');
    }

    // Try to find syllable meanings
    const ancestryMeanings = this.etymologyData.syllableMeanings[ancestry];
    if (!ancestryMeanings) {
      return {
        meaning: "A name from ancient tradition",
        confidence: "low"
      };
    }

    // Try to parse the name into meaningful parts
    const nameLower = name.toLowerCase();
    let prefixMeaning = null;
    let suffixMeaning = null;

    // Check if any prefix matches
    for (const [prefix, meaning] of Object.entries(ancestryMeanings.prefixes || {})) {
      if (nameLower.startsWith(prefix.toLowerCase())) {
        prefixMeaning = meaning;
        break;
      }
    }

    // Check if any suffix matches
    for (const [suffix, meaning] of Object.entries(ancestryMeanings.suffixes || {})) {
      if (nameLower.endsWith(suffix.toLowerCase())) {
        suffixMeaning = meaning;
        break;
      }
    }

    // Generate meaning based on what we found
    if (prefixMeaning && suffixMeaning) {
      const template = RandomUtils.selectFrom(Object.values(this.etymologyData.meaningTemplates));
      const meaning = template
        .replace('{prefix_meaning}', prefixMeaning)
        .replace('{suffix_meaning}', suffixMeaning);

      return {
        meaning,
        components: { prefix: prefixMeaning, suffix: suffixMeaning },
        confidence: "high"
      };
    } else if (prefixMeaning) {
      return {
        meaning: `One connected to ${prefixMeaning}`,
        components: { prefix: prefixMeaning },
        confidence: "medium"
      };
    } else if (suffixMeaning) {
      return {
        meaning: `Marked as ${suffixMeaning}`,
        components: { suffix: suffixMeaning },
        confidence: "medium"
      };
    }

    // Regional meaning if applicable
    if (region && this.etymologyData.regionalMeanings[region]) {
      const regional = this.etymologyData.regionalMeanings[region];
      const theme = RandomUtils.selectFrom(regional.themes);
      return {
        meaning: `A ${region} name associated with ${theme}`,
        confidence: "low",
        regional: true
      };
    }

    return {
      meaning: `A traditional ${ancestry} name`,
      confidence: "low"
    };
  }

  /**
   * Generate a complete NPC name card with all metadata
   * @param {string} ancestry - Ancestry
   * @param {Object} context - Full context
   * @returns {Promise<string>} Formatted name card
   */
  static async generateNameCard(ancestry, context = {}) {
    const result = await this.generateAdvanced(ancestry, null, { ...context, includeMeaning: true });

    let card = `╔═══════════════════════════════════════╗\n`;
    card += `║ ${result.fullName.padEnd(37)} ║\n`;
    card += `╠═══════════════════════════════════════╣\n`;

    if (result.metadata.ancestry) {
      card += `║ Ancestry: ${result.metadata.ancestry.padEnd(27)} ║\n`;
    }

    if (result.metadata.region) {
      card += `║ Region: ${result.metadata.region.padEnd(29)} ║\n`;
    }

    if (result.metadata.class) {
      card += `║ Class: ${result.metadata.class.padEnd(30)} ║\n`;
    }

    if (result.meaning) {
      card += `╠═══════════════════════════════════════╣\n`;
      // Word wrap the meaning
      const words = result.meaning.meaning.split(' ');
      let line = '║ ';
      for (const word of words) {
        if (line.length + word.length + 1 > 38) {
          card += `${line.padEnd(39)}║\n`;
          line = '║ ' + word + ' ';
        } else {
          line += word + ' ';
        }
      }
      if (line.trim().length > 1) {
        card += `${line.padEnd(39)}║\n`;
      }
    }

    card += `╚═══════════════════════════════════════╝`;

    return card;
  }
}
