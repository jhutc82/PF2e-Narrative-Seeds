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

      // Determine which variant to use based on feats
      const variant = this.selectVariant(actionData, feats);

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

    PerformanceMonitor.end(PerformanceMonitor.start('skill-narrative-generation'));

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
   * Select variant based on detected feats
   * @param {Object} actionData - Full action data
   * @param {Array<string>} feats - Detected feats
   * @returns {Object} Selected variant
   */
  selectVariant(actionData, feats) {
    // Check for feat-specific variants
    if (feats.length > 0 && actionData.variants?.feats) {
      // Priority order: use first detected feat that has a variant
      for (const feat of feats) {
        if (actionData.variants.feats[feat]) {
          return actionData.variants.feats[feat];
        }
      }
    }

    // Fall back to default variant
    return actionData.variants?.default || actionData.variants;
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
    return RandomUtils.selectWithVariety(narratives, cacheKey);
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
