/**
 * PF2e Narrative Seeds - Skill Narrative Generator
 * Generates contextual narratives for skill actions
 *
 * @module skill/skill-generator
 * @author Justin Hutchinson
 */

import { ActionDetector } from './action-detector.js';
import { FeatDetector } from './feat-detector.js';
import { TemplateEngine } from '../combat/template-engine.js';
import { DataLoader } from '../data-loader.js';
import { RandomUtils } from '../utils.js';
import { PerformanceMonitor } from '../performance-monitor.js';
import { SkillMemory } from './skill-memory.js';
import { NarrativeSeedsSettings } from '../settings.js';

/**
 * Skill narrative generator
 * Core logic for generating skill action narratives
 */
export class SkillNarrativeGenerator {

  constructor() {
    this.templateEngine = new TemplateEngine();
    this.memory = new SkillMemory();
  }

  /**
   * Generate narrative for skill action
   * @param {Object} skillData - {message, action, skill, outcome, actor, target}
   * @returns {Promise<Object|null>} Generated narrative data
   */
  async generate(skillData) {
    const timer = PerformanceMonitor.start('skill-narrative-generation');

    try {
      // Extract data
      const { message, action, skill, outcome, actor, target } = skillData;

      if (!action || !outcome) {
        console.warn("Skill narrative generation: missing action or outcome");
        return null;
      }

      // Detect feats
      const feats = FeatDetector.detectFeats(message, action);

      // Load action data
      const actionData = await this.loadActionData(action);
      if (!actionData) {
        console.warn(`No data found for action: ${action}`);
        return null;
      }

      // Determine which variant to use based on feats AND conditions
      const variant = this.selectVariant(actionData, feats, skillData);

      // Get detail level from settings
      const detailLevel = this.getDetailLevel();

      // Get narratives for this outcome
      const narratives = variant.narratives?.[detailLevel]?.[outcome];
      if (!narratives || narratives.length === 0) {
        console.warn(`No narratives for ${action} at ${detailLevel}/${outcome}`);

        // Try to fall back to standard detail level
        if (detailLevel !== 'standard') {
          const fallbackNarratives = variant.narratives?.['standard']?.[outcome];
          if (fallbackNarratives && fallbackNarratives.length > 0) {
            return this.generateFromNarratives(
              fallbackNarratives,
              skillData,
              variant,
              feats,
              'standard'
            );
          }
        }

        return null;
      }

      return this.generateFromNarratives(
        narratives,
        skillData,
        variant,
        feats,
        detailLevel
      );

    } catch (error) {
      console.error("Skill narrative generation failed:", error);
      PerformanceMonitor.end(timer);
      return null;
    }
  }

  /**
   * Generate narrative from narratives array
   * @param {Array<string>} narratives - Available narratives
   * @param {Object} skillData - Skill data
   * @param {Object} variant - Selected variant
   * @param {Array<string>} feats - Detected feats
   * @param {string} detailLevel - Detail level
   * @returns {Object} Generated narrative
   */
  generateFromNarratives(narratives, skillData, variant, feats, detailLevel) {
    const { action, skill, outcome, actor, target } = skillData;

    // Select narrative with variety tracking
    const template = this.selectNarrativeWithVariety(
      narratives,
      action,
      outcome
    );

    // Build interpolation context
    const context = this.buildContext(skillData, variant, feats);

    // Interpolate template
    const text = this.templateEngine.interpolate(template, context);

    // Track usage in memory
    if (actor) {
      this.memory.recordAction(actor, action, outcome);
    }

    // Performance monitoring handled by generate() method

    return {
      text: text,
      action: action,
      actionName: variant.displayName || action,
      skill: skill,
      outcome: outcome,
      variant: variant.displayName,
      feats: feats,
      detailLevel: detailLevel
    };
  }

  /**
   * Load action data from file
   * @param {string} actionSlug - Action slug
   * @returns {Promise<Object|null>} Action data
   */
  async loadActionData(actionSlug) {
    try {
      const data = await DataLoader.load(`skill/actions/${actionSlug}.json`);
      return data;
    } catch (error) {
      console.error(`Failed to load action data for ${actionSlug}:`, error);
      return null;
    }
  }

  /**
   * Select variant based on detected feats AND their conditions
   * @param {Object} actionData - Full action data
   * @param {Array<string>} feats - Detected feats
   * @param {Object} skillData - Skill data including actor, target, etc.
   * @returns {Object} Selected variant
   */
  selectVariant(actionData, feats, skillData) {
    // Check for feat-specific variants
    if (feats.length > 0 && actionData.variants) {
      // Priority order: use first detected feat that has a variant AND meets conditions
      for (const feat of feats) {
        const variant = actionData.variants[feat];
        if (variant) {
          // Check if feat conditions are met
          if (this.checkFeatConditions(feat, skillData, actionData)) {
            console.log(`Using ${feat} variant for ${actionData.action} (conditions met)`);
            return variant;
          } else {
            console.log(`Feat ${feat} present but conditions not met, skipping variant`);
          }
        }
      }
    }

    // Fall back to default variant
    return actionData.variants?.default || actionData.variants;
  }

  /**
   * Check if feat-specific conditions are met
   * @param {string} feat - Feat slug
   * @param {Object} skillData - Skill data {actor, target, action, etc.}
   * @param {Object} actionData - Action data
   * @returns {boolean} True if conditions are met
   */
  checkFeatConditions(feat, skillData, actionData) {
    const { actor, target, action } = skillData;

    switch (feat) {
      case 'titan-wrestler':
        return this.checkTitanWrestlerConditions(actor, target);

      case 'battle-cry':
        return this.checkBattleCryConditions(skillData);

      case 'intimidating-glare':
        // Intimidating Glare can be used anytime for Demoralize
        // No special conditions needed
        return true;

      case 'intimidating-prowess':
        // Intimidating Prowess can be used anytime for Demoralize
        // No special conditions needed
        return true;

      // Add more feat conditions as needed
      default:
        // If no specific conditions defined, allow the feat variant
        return true;
    }
  }

  /**
   * Check Titan Wrestler conditions
   * Requires: target is larger than actor, but not more than 2 size categories larger
   * @param {Actor} actor - Acting character
   * @param {Actor} target - Target character
   * @returns {boolean} True if conditions met
   */
  checkTitanWrestlerConditions(actor, target) {
    if (!actor || !target) {
      return false;
    }

    // Get size values from PF2e system
    const actorSize = actor.system?.traits?.size?.value;
    const targetSize = target.system?.traits?.size?.value;

    if (!actorSize || !targetSize) {
      return false;
    }

    // PF2e size order: tiny (0), small (1), medium (2), large (3), huge (4), gargantuan (5)
    const sizeOrder = ['tiny', 'sm', 'med', 'lg', 'huge', 'grg'];
    const actorSizeIndex = sizeOrder.indexOf(actorSize);
    const targetSizeIndex = sizeOrder.indexOf(targetSize);

    if (actorSizeIndex === -1 || targetSizeIndex === -1) {
      return false;
    }

    // Target must be larger
    if (targetSizeIndex <= actorSizeIndex) {
      return false;
    }

    // Size difference must be 1 or 2 categories (not more)
    const sizeDifference = targetSizeIndex - actorSizeIndex;
    return sizeDifference >= 1 && sizeDifference <= 2;
  }

  /**
   * Check Battle Cry conditions
   * Requires: first action of combat OR first Demoralize of encounter
   *
   * LIMITATION: Proper "first action" detection is not currently implemented
   * because chat messages don't contain sufficient timing information.
   *
   * Current implementation uses a simple heuristic:
   * - Always shows Battle Cry variant in round 1 of combat
   * - Otherwise allows it (prefers showing the feat over hiding it)
   *
   * This may show Battle Cry when technically not valid, but ensures
   * players with the feat see their narrative variant.
   *
   * @param {Object} skillData - Skill data
   * @returns {boolean} True if conditions met (or likely met)
   */
  checkBattleCryConditions(skillData) {
    const { actor, message } = skillData;

    // Simple heuristic: check if combat just started (round 1)
    if (game?.combat?.round === 1) {
      return true;
    }

    // If no combat active or we can't determine timing, allow it
    // (prefer showing the feat variant over hiding it)
    return true;
  }

  /**
   * Get detail level from settings
   * @returns {string} Detail level (minimal/standard/detailed/cinematic)
   */
  getDetailLevel() {
    return NarrativeSeedsSettings.get("skillDetailLevel") || "standard";
  }

  /**
   * Select narrative with variety tracking
   * Prevents repetition by tracking recent usage
   * @param {Array<string>} narratives - Available narratives
   * @param {string} action - Action slug
   * @param {string} outcome - Outcome (criticalSuccess/success/failure/criticalFailure)
   * @returns {string} Selected narrative template
   */
  selectNarrativeWithVariety(narratives, action, outcome) {
    const cacheKey = `skill-${action}-${outcome}`;
    const varietyMode = NarrativeSeedsSettings.get("varietyMode") || "high";
    return RandomUtils.selectRandom(narratives, varietyMode, cacheKey);
  }

  /**
   * Build interpolation context for template
   * @param {Object} skillData - Skill data
   * @param {Object} variant - Selected variant
   * @param {Array<string>} feats - Detected feats
   * @returns {Object} Interpolation context
   */
  buildContext(skillData, variant, feats) {
    const { actor, target, action, skill } = skillData;

    const context = {
      // Actor/target names
      actorName: actor?.name || "Someone",
      targetName: target?.name || "the target",

      // Action/skill info
      actionName: variant.displayName || action,
      skillName: skill || "skill",

      // Feat info
      feats: feats.join(', '),
      hasFeat: feats.length > 0,

      // Actor pronouns (if available)
      actorPronoun: this.getPronoun(actor, 'subject'),
      actorPossessive: this.getPronoun(actor, 'possessive'),

      // Target pronouns (if available)
      targetPronoun: this.getPronoun(target, 'subject'),
      targetPossessive: this.getPronoun(target, 'possessive')
    };

    return context;
  }

  /**
   * Get pronoun for actor/target
   * @param {Actor|null} actor - Actor object
   * @param {string} type - Pronoun type (subject/object/possessive)
   * @returns {string} Pronoun
   */
  getPronoun(actor, type = 'subject') {
    if (!actor) {
      return type === 'subject' ? 'they' :
             type === 'object' ? 'them' :
             'their';
    }

    // Try to get from actor data (PF2e may store this)
    const pronounData = actor.system?.details?.gender?.pronouns;

    // Default to they/them if not specified
    const pronouns = {
      subject: pronounData?.subject || 'they',
      object: pronounData?.object || 'them',
      possessive: pronounData?.possessive || 'their'
    };

    return pronouns[type] || 'they';
  }

  /**
   * Get action usage statistics from memory
   * @param {Actor} actor - Actor to check
   * @param {string} action - Action slug
   * @returns {Object} Usage stats
   */
  getActionStats(actor, action) {
    return this.memory.getActionStats(actor, action);
  }

  /**
   * Clear generation memory
   */
  clearMemory() {
    this.memory.clear();
  }
}
