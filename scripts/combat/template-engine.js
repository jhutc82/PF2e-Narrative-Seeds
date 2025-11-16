/**
 * PF2e Narrative Seeds - Template Engine
 * Handles template selection and grammar-aware string interpolation
 * Provides 10-20x narrative variety using multiple sentence patterns
 */

import { RandomUtils } from '../utils.js';

export class TemplateEngine {

  /**
   * Select a template based on weights
   * @param {Array} templates - Array of template objects with pattern and weight
   * @param {string} varietyMode - Variety mode (low, medium, high)
   * @param {string} category - Category for tracking (e.g., "template-standard-success")
   * @returns {Object} Selected template object
   */
  static selectTemplate(templates, varietyMode, category) {
    if (!templates || templates.length === 0) {
      return { pattern: "${opening} ${verb} their ${location}. ${effect}", weight: 10, grammar: "standard" };
    }

    // Use weighted random selection
    const totalWeight = templates.reduce((sum, t) => sum + (t.weight || 10), 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      random -= (template.weight || 10);
      if (random <= 0) {
        // Track this template to avoid recent repeats (if high variety mode)
        if (varietyMode === 'high') {
          RandomUtils.recordMessage(`template-${category}-${i}`, varietyMode);
        }
        return template;
      }
    }

    // Fallback to first template
    return templates[0];
  }

  /**
   * Fill template with components, applying grammar transformations
   * @param {Object} templateObj - Template object with pattern and grammar type
   * @param {Object} components - Components to fill (opening, verb, effect, location, etc.)
   * @returns {string} Filled template string
   */
  static fillTemplate(templateObj, components) {
    if (!templateObj || !templateObj.pattern) {
      return this.defaultTemplate(components);
    }

    let pattern = templateObj.pattern;
    const grammar = templateObj.grammar || 'standard';

    // Apply grammar transformations based on template type
    const grammarComponents = this.applyGrammar(components, grammar);

    // Standard interpolation
    return this.interpolate(pattern, grammarComponents);
  }

  /**
   * Apply grammar transformations to components based on grammar type
   * @param {Object} components - Original components
   * @param {string} grammarType - Grammar transformation type
   * @returns {Object} Transformed components
   */
  static applyGrammar(components, grammarType) {
    const result = { ...components };

    switch (grammarType) {
      case 'standard':
        // No transformation needed
        break;

      case 'dramatic-effect-first':
      case 'effect-first':
        // Capitalize effect for sentence start
        if (result.effect) {
          result.effect = this.capitalizeFirst(result.effect);
        }
        // Lowercase opening if it starts with capital
        if (result.opening) {
          result.opening = this.lowercaseFirst(result.opening);
        }
        break;

      case 'location-first':
      case 'location-dramatic':
      case 'location-focused':
        // Capitalize location references
        if (result.location) {
          // "their arm" -> "Their arm"
          result.location = this.capitalizeFirst(result.location);
        }
        break;

      case 'action-first':
      case 'direct-action':
        // Capitalize verb for sentence start
        if (result.verb) {
          result.verb = this.capitalizeFirst(result.verb);
        }
        break;

      case 'terse':
      case 'ultra-terse':
        // Use shorter effect version if available
        if (result.effect) {
          result.effectShort = this.shortenEffect(result.effect);
        }
        break;

      case 'perfect-strike':
      case 'masterful':
      case 'epic-moment':
        // No special transformation - these are structural patterns
        break;

      case 'dramatic':
      case 'triumphant':
      case 'emphatic':
        // Emphasize by ensuring punctuation
        if (result.effect && !result.effect.endsWith('!')) {
          result.effect = result.effect.replace(/\.$/, '!');
        }
        break;

      default:
        // Unknown grammar type - use as-is
        break;
    }

    return result;
  }

  /**
   * Interpolate template string with components
   * @param {string} template - Template string with ${variable} placeholders
   * @param {Object} components - Components to interpolate
   * @returns {string} Interpolated string
   */
  static interpolate(template, components) {
    if (!template) return "";
    if (!components || typeof components !== 'object') return template;

    return template.replace(/\$\{(\w+)\}/g, (match, key) => {
      return components[key] !== undefined && components[key] !== null ? components[key] : '';
    });
  }

  /**
   * Default template fallback
   * @param {Object} components - Components
   * @returns {string} Default narrative
   */
  static defaultTemplate(components) {
    const { opening = "", verb = "", location = "", effect = "" } = components;
    if (opening && verb && location && effect) {
      return `${opening} ${verb} their ${location}. ${effect}`;
    }
    if (opening && location) {
      return `${opening} Hits their ${location}!`;
    }
    if (opening) {
      return `${opening} The attack connects!`;
    }
    return "The attack hits!";
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalizeFirst(str) {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Lowercase first letter of string
   * @param {string} str - String to lowercase
   * @returns {string} Lowercased string
   */
  static lowercaseFirst(str) {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Shorten effect for terse templates
   * @param {string} effect - Full effect string
   * @returns {string} Shortened effect
   */
  static shortenEffect(effect) {
    if (!effect) return "Hit!";

    const lower = effect.toLowerCase();

    // Common patterns
    if (lower.includes('blood')) return "Bleeding!";
    if (lower.includes('wound')) return "Wounded!";
    if (lower.includes('stagger')) return "Staggered!";
    if (lower.includes('pain')) return "Painful!";
    if (lower.includes('damage')) return "Damaged!";
    if (lower.includes('crack')) return "Cracked!";
    if (lower.includes('shatter')) return "Shattered!";

    // First sentence only
    const firstSentence = effect.split('.')[0];
    if (firstSentence.length < effect.length) {
      return firstSentence + '!';
    }

    // If still long, just add exclamation
    return effect.replace(/\.$/, '!');
  }

  /**
   * Clean up extra spaces and punctuation in final output
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  static cleanOutput(text) {
    if (!text) return "";

    return text
      // Remove double spaces
      .replace(/\s+/g, ' ')
      // Fix space before punctuation
      .replace(/\s+([.,!?])/g, '$1')
      // Fix double punctuation
      .replace(/([.!?])\1+/g, '$1')
      // Remove space at start/end
      .trim();
  }
}
