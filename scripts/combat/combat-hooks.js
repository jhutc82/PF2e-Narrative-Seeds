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

    // Hook into chat message rendering to attach event listeners
    Hooks.on("renderChatMessage", (message, html, data) => {
      this.onRenderChatMessage(message, html, data);
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
        console.log("PF2e Narrative Seeds | Could not extract attack data from message:", message.id);
        return;
      }

      // Validate required data
      if (!attackData.target) {
        console.warn("PF2e Narrative Seeds | Attack data missing target");
        return;
      }

      // Generate narrative
      const seed = await this.generator.generate(attackData);
      if (!seed) {
        console.log("PF2e Narrative Seeds | Could not generate narrative");
        return;
      }

      // Format narrative HTML
      const narrativeHTML = CombatFormatter.generateHTML(seed);

      // Store attack data for potential regeneration
      const narrativeFlags = {
        "pf2e-narrative-seeds": {
          hasNarrative: true,
          attackData: {
            actorId: attackData.actor?.id,
            targetId: attackData.target?.id,
            itemId: attackData.item?.id,
            itemUuid: attackData.origin?.uuid,
            outcome: attackData.context?.outcome
          },
          seed: seed
        }
      };

      // Append narrative to existing attack roll message
      await message.update({
        content: message.content + narrativeHTML,
        flags: {
          ...message.flags,
          ...narrativeFlags
        }
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
          const firstTarget = targets.first();
          if (firstTarget) target = firstTarget.actor;
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
   * Handle chat message rendering
   * @param {ChatMessage} message
   * @param {jQuery} html
   * @param {Object} data
   */
  static onRenderChatMessage(message, html, data) {
    // Check if this message has our narrative
    const hasNarrative = message.flags?.["pf2e-narrative-seeds"]?.hasNarrative;
    if (!hasNarrative) return;

    // Find and attach event listeners to buttons
    const regenerateButton = html.find('.regenerate-button');
    if (regenerateButton.length > 0) {
      regenerateButton.on('click', async (event) => {
        event.preventDefault();
        await this.regenerateNarrative(message);
      });
    }

    // Also attach listeners to other buttons if present
    const narrateButton = html.find('.narrate-button');
    if (narrateButton.length > 0) {
      narrateButton.on('click', async (event) => {
        event.preventDefault();
        const seed = message.flags["pf2e-narrative-seeds"]?.seed;
        if (seed?.description) {
          await CombatFormatter.narrateToChat(seed.description);
        }
      });
    }

    const copyButton = html.find('.copy-button');
    if (copyButton.length > 0) {
      copyButton.on('click', (event) => {
        event.preventDefault();
        const seed = message.flags["pf2e-narrative-seeds"]?.seed;
        if (seed?.description) {
          CombatFormatter.copyToClipboard(seed.description);
        }
      });
    }
  }

  /**
   * Regenerate narrative for an existing message
   * @param {ChatMessage} message
   */
  static async regenerateNarrative(message) {
    try {
      // Get stored attack data
      const storedData = message.flags?.["pf2e-narrative-seeds"]?.attackData;
      if (!storedData) {
        ui.notifications.warn("Cannot regenerate: attack data not found");
        return;
      }

      // Reconstruct attack data
      const attackData = {
        message: message,
        actor: storedData.actorId ? game.actors.get(storedData.actorId) : null,
        target: storedData.targetId ? game.actors.get(storedData.targetId) : null,
        item: null,
        context: message.flags?.pf2e?.context,
        origin: message.flags?.pf2e?.origin
      };

      // Try to get item
      if (storedData.itemUuid) {
        try {
          attackData.item = await fromUuid(storedData.itemUuid);
        } catch (e) {
          console.warn("PF2e Narrative Seeds | Could not resolve item UUID:", storedData.itemUuid);
        }
      }

      if (!attackData.item && storedData.itemId && attackData.actor) {
        attackData.item = attackData.actor.items.get(storedData.itemId);
      }

      // Generate new narrative
      const seed = await this.generator.generate(attackData);
      if (!seed) {
        ui.notifications.warn("Could not generate new narrative");
        return;
      }

      // Format new narrative HTML
      const narrativeHTML = CombatFormatter.generateHTML(seed);

      // Get original PF2e content (everything before our narrative)
      const originalContent = message.content.split('<div class="pf2e-narrative-seed')[0];

      // Update message with new narrative
      await message.update({
        content: originalContent + narrativeHTML,
        flags: {
          ...message.flags,
          "pf2e-narrative-seeds": {
            ...message.flags["pf2e-narrative-seeds"],
            seed: seed
          }
        }
      });

      ui.notifications.info("Narrative regenerated successfully");
    } catch (error) {
      console.error("PF2e Narrative Seeds | Error regenerating narrative:", error);
      ui.notifications.error("Failed to regenerate narrative");
    }
  }

  /**
   * Shutdown hooks (for cleanup)
   */
  static shutdown() {
    console.log("PF2e Narrative Seeds | Shutting down combat hooks");
    // Hooks are automatically managed by Foundry
  }
}
