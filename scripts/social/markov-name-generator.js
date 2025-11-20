/**
 * PF2e Narrative Seeds - Markov Chain Name Generator
 * Advanced pattern learning for ultra-realistic name generation
 */

import { RandomUtils } from '../utils.js';

/**
 * Markov Chain-based name generator
 * Learns patterns from existing names to generate new, realistic ones
 */
export class MarkovNameGenerator {
  /**
   * Cache for trained Markov chains
   * Structure: Map<ancestry-gender, MarkovChain>
   */
  static chainCache = new Map();

  /**
   * Configuration for Markov generation
   */
  static config = {
    order: 2,                    // N-gram order (2 = bigrams, 3 = trigrams)
    minLength: 3,                // Minimum generated name length
    maxLength: 12,               // Maximum generated name length
    maxAttempts: 100,            // Max generation attempts
    smoothing: 0.01              // Laplace smoothing factor
  };

  /**
   * Train a Markov chain on a corpus of names
   * @param {Array<string>} names - Training corpus
   * @param {number} order - N-gram order
   * @returns {Object} Trained Markov chain
   */
  static trainChain(names, order = null) {
    if (!order) order = this.config.order;

    const chain = {
      transitions: new Map(),
      starts: [],
      order: order
    };

    for (const name of names) {
      if (!name || name.length < 2) continue;

      const processed = `${'#'.repeat(order)}${name.toLowerCase()}#`;

      // Record start patterns
      const start = processed.substring(0, order);
      chain.starts.push(start);

      // Build transition probabilities
      for (let i = 0; i < processed.length - order; i++) {
        const context = processed.substring(i, i + order);
        const next = processed[i + order];

        if (!chain.transitions.has(context)) {
          chain.transitions.set(context, {});
        }

        const transitions = chain.transitions.get(context);
        transitions[next] = (transitions[next] || 0) + 1;
      }
    }

    // Convert counts to probabilities with smoothing
    for (const [context, transitions] of chain.transitions.entries()) {
      const total = Object.values(transitions).reduce((sum, count) => sum + count, 0);
      const smoothingTotal = total + (this.config.smoothing * 26); // 26 letters

      for (const char in transitions) {
        transitions[char] = (transitions[char] + this.config.smoothing) / smoothingTotal;
      }
    }

    return chain;
  }

  /**
   * Generate a name using a trained Markov chain
   * @param {Object} chain - Trained Markov chain
   * @param {number} minLength - Minimum name length
   * @param {number} maxLength - Maximum name length
   * @returns {string|null} Generated name
   */
  static generateFromChain(chain, minLength = null, maxLength = null) {
    if (!minLength) minLength = this.config.minLength;
    if (!maxLength) maxLength = this.config.maxLength;

    for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
      let name = '';
      let context = RandomUtils.selectFrom(chain.starts);

      // Generate characters
      while (name.length < maxLength) {
        const transitions = chain.transitions.get(context);

        if (!transitions) {
          // Dead end, restart
          break;
        }

        // Select next character based on probabilities
        const next = this.selectByProbability(transitions);

        if (next === '#') {
          // End marker reached
          if (name.length >= minLength) {
            return this.capitalize(name);
          }
          break; // Too short, retry
        }

        name += next;
        context = (context + next).substring(1); // Slide window
      }

      // If we generated something valid, return it
      if (name.length >= minLength && name.length <= maxLength) {
        return this.capitalize(name);
      }
    }

    return null; // Failed to generate
  }

  /**
   * Select a character based on probability distribution
   * @param {Object} probabilities - Character probabilities
   * @returns {string} Selected character
   */
  static selectByProbability(probabilities) {
    const rand = Math.random();
    let cumulative = 0;

    for (const [char, prob] of Object.entries(probabilities)) {
      cumulative += prob;
      if (rand < cumulative) {
        return char;
      }
    }

    // Fallback to last character (shouldn't happen with proper probabilities)
    return Object.keys(probabilities)[Object.keys(probabilities).length - 1];
  }

  /**
   * Train and cache a Markov chain for an ancestry/gender combination
   * @param {string} cacheKey - Cache identifier
   * @param {Array<string>} names - Training names
   * @returns {Object} Trained chain
   */
  static getOrTrainChain(cacheKey, names) {
    if (this.chainCache.has(cacheKey)) {
      return this.chainCache.get(cacheKey);
    }

    const chain = this.trainChain(names);
    this.chainCache.set(cacheKey, chain);
    return chain;
  }

  /**
   * Generate names using Markov chain from pattern data
   * @param {Object} patterns - Name pattern data
   * @param {string} gender - Gender
   * @param {string} ancestry - Ancestry for caching
   * @returns {string} Generated name
   */
  static generateFromPatterns(patterns, gender, ancestry) {
    const genderPatterns = patterns[gender] || patterns["nonbinary"] || patterns;

    // Collect all syllables for training
    const trainingData = [
      ...(genderPatterns.prefixes || patterns.prefixes || []),
      ...(genderPatterns.middles || patterns.middles || []),
      ...(genderPatterns.suffixes || patterns.suffixes || []),
      ...(genderPatterns.names || [])
    ];

    if (trainingData.length < 10) {
      // Not enough data for Markov chain
      return null;
    }

    const cacheKey = `${ancestry}-${gender}`;
    const chain = this.getOrTrainChain(cacheKey, trainingData);

    return this.generateFromChain(chain);
  }

  /**
   * Generate a blended name from two pattern sets (for heritage blending)
   * @param {Object} patterns1 - First pattern set
   * @param {Object} patterns2 - Second pattern set
   * @param {string} gender - Gender
   * @param {number} blendRatio - Ratio of first to second (0-1)
   * @returns {string} Blended name
   */
  static generateBlended(patterns1, patterns2, gender, blendRatio = 0.5) {
    const genderPatterns1 = patterns1[gender] || patterns1["nonbinary"] || patterns1;
    const genderPatterns2 = patterns2[gender] || patterns2["nonbinary"] || patterns2;

    // Collect training data from both sources
    const data1 = [
      ...(genderPatterns1.prefixes || patterns1.prefixes || []),
      ...(genderPatterns1.middles || patterns1.middles || []),
      ...(genderPatterns1.suffixes || patterns1.suffixes || []),
      ...(genderPatterns1.names || [])
    ];

    const data2 = [
      ...(genderPatterns2.prefixes || patterns2.prefixes || []),
      ...(genderPatterns2.middles || patterns2.middles || []),
      ...(genderPatterns2.suffixes || patterns2.suffixes || []),
      ...(genderPatterns2.names || [])
    ];

    if (data1.length < 5 || data2.length < 5) {
      return null;
    }

    // Blend the training data based on ratio
    const count1 = Math.floor(data1.length * blendRatio);
    const count2 = Math.floor(data2.length * (1 - blendRatio));

    const blendedData = [
      ...RandomUtils.selectMultiple(data1, count1),
      ...RandomUtils.selectMultiple(data2, count2)
    ];

    const chain = this.trainChain(blendedData);
    return this.generateFromChain(chain);
  }

  /**
   * Analyze a name corpus for statistical patterns
   * @param {Array<string>} names - Name corpus
   * @returns {Object} Statistical analysis
   */
  static analyzeCorpus(names) {
    const stats = {
      count: names.length,
      avgLength: 0,
      minLength: Infinity,
      maxLength: 0,
      letterFrequency: {},
      startLetters: {},
      endLetters: {},
      commonBigrams: {},
      commonTrigrams: {}
    };

    let totalLength = 0;

    for (const name of names) {
      if (!name) continue;

      const lower = name.toLowerCase();
      totalLength += lower.length;
      stats.minLength = Math.min(stats.minLength, lower.length);
      stats.maxLength = Math.max(stats.maxLength, lower.length);

      // Start and end letters
      if (lower.length > 0) {
        const start = lower[0];
        const end = lower[lower.length - 1];
        stats.startLetters[start] = (stats.startLetters[start] || 0) + 1;
        stats.endLetters[end] = (stats.endLetters[end] || 0) + 1;
      }

      // Letter frequency
      for (const char of lower) {
        stats.letterFrequency[char] = (stats.letterFrequency[char] || 0) + 1;
      }

      // Bigrams
      for (let i = 0; i < lower.length - 1; i++) {
        const bigram = lower.substring(i, i + 2);
        stats.commonBigrams[bigram] = (stats.commonBigrams[bigram] || 0) + 1;
      }

      // Trigrams
      for (let i = 0; i < lower.length - 2; i++) {
        const trigram = lower.substring(i, i + 3);
        stats.commonTrigrams[trigram] = (stats.commonTrigrams[trigram] || 0) + 1;
      }
    }

    stats.avgLength = totalLength / names.length;

    // Sort bigrams and trigrams by frequency
    stats.commonBigrams = Object.fromEntries(
      Object.entries(stats.commonBigrams)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
    );

    stats.commonTrigrams = Object.fromEntries(
      Object.entries(stats.commonTrigrams)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
    );

    return stats;
  }

  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    if (!str || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Clear the chain cache
   */
  static clearCache() {
    this.chainCache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  static getCacheStats() {
    return {
      size: this.chainCache.size,
      chains: Array.from(this.chainCache.keys())
    };
  }

  /**
   * Configure Markov generation
   * @param {Object} options - Configuration options
   */
  static configure(options = {}) {
    this.config = { ...this.config, ...options };
  }
}

// Utility for multiple selection (if not in RandomUtils)
if (!RandomUtils.selectMultiple) {
  RandomUtils.selectMultiple = function(array, count) {
    const selected = [];
    const copy = [...array];

    for (let i = 0; i < Math.min(count, copy.length); i++) {
      const index = Math.floor(Math.random() * copy.length);
      selected.push(copy.splice(index, 1)[0]);
    }

    return selected;
  };
}
