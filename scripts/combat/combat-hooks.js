/**
 * PF2e Narrative Seeds - Combat Hooks
 * Hooks into PF2e combat system to detect attacks
 */

import { NarrativeSeedsSettings } from '../settings.js';
import { PF2eUtils } from '../utils.js';
import { CombatNarrativeGenerator } from './combat-generator.js';
import { CombatFormatter } from './combat-formatter.js';

/**
 * Combat hooks manager
 */
export class CombatHooks {

  static generator = null;

  /**
   * Initialize combat hooks
   */
  static initialize() {
    console.log("PF2e Narrative Seeds | Initializing combat hooks...");

    // Create generator instance
    this.generator = new CombatNarrativeGenerator();

    // Register hooks
    this.registerHooks();

    console.log("PF2e Narrative Seeds | Combat hooks initialized");
  }

  /**
   * Register Foundry hooks
   */
  static registerHooks() {
    // Hook into chat message creation
    Hooks.on("createChatMessage", async (message, options, userId) => {
      await this.onChatMessage(message, options, userId);
    });
  }

  /**
   * Handle chat message creation
   * @param {ChatMessage} message
   * @param {Object} options
   * @param {string} userId
   */
  static async onChatMessage(message, options, userId) {
    try {
      // Only process for GMs or if user is the message creator
      if (!game.user.isGM && game.user.id !== userId) {
        return;
      }

      // Check if combat narration is enabled
      if (!NarrativeSeedsSettings.isCombatEnabled()) {
        return;
      }

      // Check if this is a PF2e strike
      if (!this.isStrikeMessage(message)) {
        return;
      }

      // Extract attack data
      const attackData = await this.extractAttackData(message);
      if (!attackData) {
        console.log("PF2e Narrative Seeds | Could not extract attack data");
        return;
      }

      // Generate narrative
      const seed = await this.generator.generate(attackData);
      if (!seed) {
        console.log("PF2e Narrative Seeds | Could not generate narrative");
        return;
      }

      // Format and send chat card
      await CombatFormatter.createChatCard(seed, {
        actorId: attackData.actor?.id
      });

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error processing combat message:", error);
    }
  }

  /**
   * Check if message is a PF2e strike
   * @param {ChatMessage} message
   * @returns {boolean}
   */
  static isStrikeMessage(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return false;

    // Check for attack roll context
    const context = flags.context;
    if (!context) return false;

    // IMPORTANT: Only process attack rolls, not damage rolls
    // This prevents duplicate narratives from appearing on both hit and damage
    if (context.type === "damage-roll") return false;

    // Check if it's an attack roll
    if (context.type === "attack-roll") return true;
    if (context.action === "strike") return true;

    // Check for strike-related flags
    if (flags.origin?.type === "weapon") return true;
    if (flags.origin?.type === "melee") return true;

    // Check message flavor (but make sure it's not a damage roll)
    const flavor = message.flavor?.toLowerCase() || "";
    if (flavor.includes("damage")) return false;
    if (flavor.includes("strike") || flavor.includes("attack")) return true;

    return false;
  }

  /**
   * Extract attack data from message
   * @param {ChatMessage} message
   * @returns {Promise<Object>}
   */
  static async extractAttackData(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return null;

    // Get origin data
    const origin = flags.origin;
    const context = flags.context;

    // Get actor (attacker)
    let actor = null;
    if (message.speaker?.actor) {
      actor = game.actors.get(message.speaker.actor);
    }
    if (!actor && message.speaker?.token) {
      const token = canvas.tokens?.get(message.speaker.token);
      if (token) actor = token.actor;
    }

    // Get target
    let target = null;
    if (context?.target) {
      if (context.target.actor) {
        target = game.actors.get(context.target.actor);
      } else if (context.target.token) {
        const token = canvas.tokens?.get(context.target.token);
        if (token) target = token.actor;
      }
    }

    // Try to get target from current targets if not in context
    if (!target && game.user.targets.size > 0) {
      const targetToken = game.user.targets.first();
      if (targetToken) target = targetToken.actor;
    }

    // If still no target, try to get from combat
    if (!target && game.combat) {
      const combatant = game.combat.combatant;
      if (combatant && combatant.token) {
        // Get targets of current combatant
        const targets = game.user.targets;
        if (targets.size > 0) {
          target = targets.first().actor;
        }
      }
    }

    if (!target) {
      console.warn("PF2e Narrative Seeds | No target found for attack");
      return null;
    }

    // Get item (weapon/spell)
    let item = null;
    if (origin?.uuid) {
      try {
        item = await fromUuid(origin.uuid);
      } catch (e) {
        console.warn("PF2e Narrative Seeds | Could not resolve item UUID:", origin.uuid);
      }
    }

    // Try to get item from actor
    if (!item && actor && origin?.item) {
      item = actor.items.get(origin.item);
    }

    return {
      message,
      actor,
      target,
      item,
      context,
      origin
    };
  }

  /**
   * Shutdown hooks (for cleanup)
   */
  static shutdown() {
    console.log("PF2e Narrative Seeds | Shutting down combat hooks");
    // Hooks are automatically managed by Foundry
  }
}
