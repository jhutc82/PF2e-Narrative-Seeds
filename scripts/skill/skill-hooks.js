/**
 * PF2e Narrative Seeds - Skill Hooks
 * Hooks into PF2e skill system to detect skill actions
 *
 * @module skill/skill-hooks
 * @author Justin Hutchinson
 */

import { NarrativeSeedsSettings } from '../settings.js';
import { PF2eUtils } from '../utils.js';
import { SkillNarrativeGenerator } from './skill-generator.js';
import { SkillFormatter } from './skill-formatter.js';
import { ActionDetector } from './action-detector.js';

/**
 * Skill hooks manager
 * Intercepts skill check messages and generates narratives
 */
export class SkillHooks {

  static generator = null;

  /**
   * Initialize skill hooks
   */
  static initialize() {
    console.log("PF2e Narrative Seeds | Initializing skill hooks...");

    // Create generator instance
    this.generator = new SkillNarrativeGenerator();

    // Register hooks
    this.registerHooks();

    console.log("PF2e Narrative Seeds | Skill hooks initialized");
  }

  /**
   * Register Foundry hooks
   */
  static registerHooks() {
    // Hook into chat message creation
    Hooks.on("createChatMessage", async (message, options, userId) => {
      try {
        await this.onChatMessage(message, options, userId);
      } catch (error) {
        console.error("PF2e Narrative Seeds | Error in skill createChatMessage hook:", error);
      }
    });

    // Hook into chat message rendering to attach event listeners
    Hooks.on("renderChatMessage", (message, html, data) => {
      try {
        this.onRenderChatMessage(message, html, data);
      } catch (error) {
        console.error("PF2e Narrative Seeds | Error in skill renderChatMessage hook:", error);
      }
    });
  }

  /**
   * Handle chat message creation
   * @param {ChatMessage} message - PF2e chat message
   * @param {Object} options - Creation options
   * @param {string} userId - User who created message
   */
  static async onChatMessage(message, options, userId) {
    try {
      // Only process for GMs or if user is the message creator
      if (!game.user.isGM && game.user.id !== userId) {
        return;
      }

      // Check if skill narration is enabled
      if (!NarrativeSeedsSettings.isSkillEnabled()) {
        return;
      }

      // Check if this is a skill action we support
      if (!this.isSkillActionMessage(message)) {
        return;
      }

      // Extract skill data
      const skillData = await this.extractSkillData(message);
      if (!skillData) {
        console.log("PF2e Narrative Seeds | Could not extract skill data from message:", message.id);
        return;
      }

      // Generate narrative
      const seed = await this.generator.generate(skillData);
      if (!seed) {
        console.log("PF2e Narrative Seeds | Could not generate skill narrative");
        return;
      }

      // Format narrative HTML
      const narrativeHTML = SkillFormatter.generateHTML(seed);

      // Store skill data for potential regeneration
      const narrativeFlags = {
        "pf2e-narrative-seeds": {
          hasNarrative: true,
          type: "skill",
          skillData: {
            actorId: skillData.actor?.id,
            targetId: skillData.target?.id,
            action: skillData.action,
            skill: skillData.skill,
            outcome: skillData.outcome
          },
          seed: seed
        }
      };

      // Append narrative to existing skill check message
      await message.update({
        content: message.content + narrativeHTML,
        flags: {
          ...message.flags,
          ...narrativeFlags
        }
      });

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error processing skill message:", error);
    }
  }

  /**
   * Handle chat message rendering
   * Attaches event listeners for regenerate buttons
   * @param {ChatMessage} message - Chat message
   * @param {jQuery} html - Message HTML
   * @param {Object} data - Message data
   */
  static onRenderChatMessage(message, html, data) {
    // Find regenerate button
    const regenerateBtn = html.find(".narrative-regenerate");

    if (regenerateBtn.length > 0) {
      regenerateBtn.on("click", async (event) => {
        event.preventDefault();
        await this.regenerateNarrative(message);
      });
    }
  }

  /**
   * Regenerate narrative for message
   * @param {ChatMessage} message - Message to regenerate
   */
  static async regenerateNarrative(message) {
    try {
      const flags = message.flags?.["pf2e-narrative-seeds"];
      if (!flags || !flags.skillData) {
        if (typeof ui !== 'undefined' && ui.notifications) {
          ui.notifications.warn("Cannot regenerate narrative - skill data missing");
        }
        return;
      }

      // Extract skill data from flags
      const skillData = await this.extractSkillData(message);
      if (!skillData) {
        if (typeof ui !== 'undefined' && ui.notifications) {
          ui.notifications.warn("Cannot regenerate narrative - invalid skill data");
        }
        return;
      }

      // Force variety reset for this action/outcome combination
      const cacheKey = `skill-${skillData.action}-${skillData.outcome}`;
      game.modules.get("pf2e-narrative-seeds").api?.random?.clearHistory(cacheKey);

      // Generate new narrative
      const seed = await this.generator.generate(skillData);
      if (!seed) {
        if (typeof ui !== 'undefined' && ui.notifications) {
          ui.notifications.warn("Could not generate new narrative");
        }
        return;
      }

      // Format HTML
      const narrativeHTML = SkillFormatter.generateHTML(seed);

      // Update message
      const content = message.content.replace(
        /<div class="pf2e-narrative-seeds skill-narrative">.*?<\/div>/s,
        narrativeHTML
      );

      await message.update({
        content: content,
        flags: {
          ...message.flags,
          "pf2e-narrative-seeds": {
            ...flags,
            seed: seed
          }
        }
      });

      if (typeof ui !== 'undefined' && ui.notifications) {
        ui.notifications.info("Narrative regenerated!");
      }

    } catch (error) {
      console.error("Failed to regenerate narrative:", error);
      if (typeof ui !== 'undefined' && ui.notifications) {
        ui.notifications.error("Failed to regenerate narrative");
      }
    }
  }

  /**
   * Check if message is a skill action we support
   * @param {ChatMessage} message - PF2e chat message
   * @returns {boolean} True if this is a supported skill action
   */
  static isSkillActionMessage(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return false;

    const context = flags.context;
    if (!context) return false;

    // Check if it's a skill check (not damage, attack, etc.)
    if (context.type !== "skill-check") return false;

    // Use ActionDetector to see if we support this action
    const action = ActionDetector.detectAction(message);
    return action !== null;
  }

  /**
   * Extract skill data from message
   * @param {ChatMessage} message - PF2e chat message
   * @returns {Promise<Object|null>} Skill data object
   */
  static async extractSkillData(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return null;

    const context = flags.context;
    if (!context) return null;

    // Detect action and skill
    const action = ActionDetector.detectAction(message);
    if (!action) return null;

    const skill = ActionDetector.getSkill(message);

    // Get actor (person performing action)
    let actor = null;
    if (message.speaker?.actor) {
      actor = game.actors.get(message.speaker.actor);
    }
    if (!actor && message.speaker?.token) {
      const token = canvas.tokens?.get(message.speaker.token);
      if (token) actor = token.actor;
    }

    // Get target (if applicable)
    let target = null;
    if (context.target) {
      if (context.target.actor) {
        target = game.actors.get(context.target.actor);
      } else if (context.target.token) {
        const token = canvas.tokens?.get(context.target.token);
        if (token) target = token.actor;
      }
    }

    // Try to get target from current targets if not in context
    if (!target && game.user?.targets?.size > 0) {
      const targetToken = game.user.targets.first();
      if (targetToken) target = targetToken.actor;
    }

    // Get outcome (degree of success)
    const outcome = this.extractOutcome(context);
    if (!outcome) {
      console.warn("Could not determine skill check outcome");
      return null;
    }

    return {
      message: message,
      action: action,
      skill: skill,
      outcome: outcome,
      actor: actor,
      target: target, // May be null for non-targeted actions
      context: context,
      origin: flags.origin
    };
  }

  /**
   * Extract outcome from context
   * @param {Object} context - PF2e context
   * @returns {string|null} Outcome (criticalSuccess/success/failure/criticalFailure)
   */
  static extractOutcome(context) {
    if (!context) return null;

    // Direct outcome field
    if (context.outcome) {
      return this.normalizeOutcome(context.outcome);
    }

    // Check success field
    if (context.success !== undefined) {
      if (context.success === "criticalSuccess") return "criticalSuccess";
      if (context.success === "success") return "success";
      if (context.success === "failure") return "failure";
      if (context.success === "criticalFailure") return "criticalFailure";
    }

    // Check degree of success field
    if (context.degreeOfSuccess !== undefined) {
      return this.normalizeOutcome(context.degreeOfSuccess);
    }

    return null;
  }

  /**
   * Normalize outcome string
   * @param {string|number} outcome - Raw outcome
   * @returns {string} Normalized outcome
   */
  static normalizeOutcome(outcome) {
    // Handle string outcomes
    if (typeof outcome === 'string') {
      const lower = outcome.toLowerCase();
      if (lower.includes('critical') && lower.includes('success')) return 'criticalSuccess';
      if (lower.includes('critical') && lower.includes('fail')) return 'criticalFailure';
      if (lower.includes('success')) return 'success';
      if (lower.includes('fail')) return 'failure';
    }

    // Handle numeric degrees (PF2e sometimes uses numbers)
    if (typeof outcome === 'number') {
      if (outcome >= 2) return 'criticalSuccess';
      if (outcome === 1) return 'success';
      if (outcome === 0) return 'failure';
      if (outcome <= -1) return 'criticalFailure';
    }

    return null;
  }

  /**
   * Shutdown skill hooks
   */
  static shutdown() {
    console.log("PF2e Narrative Seeds | Shutting down skill hooks...");
    this.generator = null;
  }
}
