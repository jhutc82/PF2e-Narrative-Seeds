/**
 * PF2e Narrative Seeds - Combat Hooks
 * Hooks into PF2e combat system to detect attacks
 */

import { NarrativeSeedsSettings } from '../settings.js';
import { PF2eUtils, StringUtils } from '../utils.js';
import { CombatNarrativeGenerator } from './combat-generator.js';
import { CombatFormatter } from './combat-formatter.js';
import { EffectApplicator } from './effect-applicator.js';
import { ComplicationManager } from './complication-manager.js';
import { DismembermentManager } from './dismemberment-manager.js';

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

      // Store seed and attack data in flags ONLY
      // DO NOT update message.content - that breaks PF2e's damage/critical buttons
      // The narrative will be injected during rendering via onRenderChatMessage
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

      // Only update flags, never touch message.content
      await message.update({
        flags: {
          ...message.flags,
          ...narrativeFlags
        }
      });

      // Auto-apply complication if setting is enabled
      if (game.settings.get("pf2e-narrative-seeds", "autoApplyComplications")) {
        await this.autoApplyComplication(message, seed);
      }

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

    // Check if current user should see the narrative based on visibility settings
    const visibilityMode = NarrativeSeedsSettings.get("visibilityMode");
    const shouldShowNarrative = this.shouldShowNarrative(message, visibilityMode);

    if (!shouldShowNarrative) {
      return;
    }

    // Get seed from flags and generate HTML
    const seed = message.flags?.["pf2e-narrative-seeds"]?.seed;
    if (!seed) return;

    const narrativeHTML = CombatFormatter.generateHTML(seed);

    // Inject narrative HTML into the rendered message
    // Find the message content area and append our narrative
    const messageContent = html.find('.message-content');
    if (messageContent.length > 0) {
      messageContent.append(narrativeHTML);
    } else {
      // Fallback: append to the entire message
      html.append(narrativeHTML);
    }

    // Find the narrative element (now that we've added it)
    const narrativeElement = html.find('.pf2e-narrative-seed');

    // User can see narrative, so attach event listeners to buttons
    const regenerateButton = html.find('.regenerate-btn');
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

    // Handle button clicks with data-action attribute
    html.find('[data-action]').on('click', async (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const action = button.dataset.action;

      switch (action) {
        case 'apply-complication':
          await this.applyComplication(message, button);
          break;
        case 'apply-dismemberment':
          await this.applyDismemberment(message, button);
          break;
        case 'toggle-details':
          const details = button.closest('.pf2e-narrative-seed').querySelector('.narrative-details');
          if (details) {
            const isHidden = details.style.display === 'none';
            details.style.display = isHidden ? 'block' : 'none';
            button.textContent = isHidden ? '▲' : '▼';
          }
          break;
      }
    });
  }

  /**
   * Check if current user should see the narrative based on visibility settings
   * @param {ChatMessage} message
   * @param {string} visibilityMode
   * @returns {boolean}
   */
  static shouldShowNarrative(message, visibilityMode) {
    const currentUser = game.user;

    switch (visibilityMode) {
      case "gm-only":
        // Only GMs can see the narrative
        return currentUser.isGM;

      case "everyone":
        // Everyone can see the narrative
        return true;

      case "gm-plus-actor":
        // GMs and the owner of the acting character can see it
        if (currentUser.isGM) return true;

        // Get the actor from stored attack data
        const actorId = message.flags?.["pf2e-narrative-seeds"]?.attackData?.actorId;
        if (!actorId) return false;

        const actor = game.actors.get(actorId);
        if (!actor) return false;

        // Check if current user owns this actor
        return actor.testUserPermission(currentUser, "OWNER");

      default:
        // Default to GM-only for safety
        return currentUser.isGM;
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

      // Update only the seed in flags, not message.content
      // The renderChatMessage hook will display the new narrative
      await message.update({
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
   * Apply a complication effect to the appropriate actor
   * @param {ChatMessage} message - The chat message containing attack data
   * @param {HTMLElement} button - The clicked button element
   */
  static async applyComplication(message, button) {
    try {
      // Get complication data from message flags (no encoding needed)
      const seed = message.flags?.["pf2e-narrative-seeds"]?.seed;
      if (!seed || !seed.complication) {
        ui.notifications.warn("No complication data found in message");
        return;
      }

      const complication = seed.complication;
      const outcome = seed.outcome;

      // Get stored attack data to determine target
      const storedData = message.flags?.["pf2e-narrative-seeds"]?.attackData;
      if (!storedData) {
        ui.notifications.warn("Cannot apply complication: attack data not found");
        return;
      }

      // Reconstruct attack data
      const attackData = {
        actor: storedData.actorId ? game.actors.get(storedData.actorId) : null,
        target: storedData.targetId ? game.actors.get(storedData.targetId) : null
      };

      // Determine which actor to apply the complication to
      const targetActor = ComplicationManager.getComplicationTarget(attackData, outcome);

      if (!targetActor) {
        ui.notifications.warn("Could not determine target for complication");
        return;
      }

      // Check if user has permission to modify the target actor
      if (!targetActor.testUserPermission(game.user, "OWNER") && !game.user.isGM) {
        ui.notifications.warn(`You do not have permission to modify ${targetActor.name}`);
        return;
      }

      // Apply the complication effect
      const success = await EffectApplicator.applyComplication(targetActor, complication);

      if (success && button) {
        // Disable the button to prevent double-application
        button.disabled = true;
        button.textContent = "✓ Applied";
        button.classList.add('applied');
      }

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error applying complication:", error);
      ui.notifications.error("Failed to apply complication");
    }
  }

  /**
   * Automatically apply a complication without user interaction
   * @param {ChatMessage} message - The chat message containing attack data
   * @param {Object} seed - The narrative seed containing complication data
   */
  static async autoApplyComplication(message, seed) {
    try {
      // Check if there's a complication to apply
      if (!seed || !seed.complication) {
        return; // No complication, silently return
      }

      const complication = seed.complication;
      const outcome = seed.outcome;

      // Get stored attack data to determine target
      const storedData = message.flags?.["pf2e-narrative-seeds"]?.attackData;
      if (!storedData) {
        console.warn("PF2e Narrative Seeds | Cannot auto-apply complication: attack data not found");
        return;
      }

      // Reconstruct attack data
      const attackData = {
        actor: storedData.actorId ? game.actors.get(storedData.actorId) : null,
        target: storedData.targetId ? game.actors.get(storedData.targetId) : null
      };

      // Determine which actor to apply the complication to
      const targetActor = ComplicationManager.getComplicationTarget(attackData, outcome);

      if (!targetActor) {
        console.warn("PF2e Narrative Seeds | Could not determine target for auto-apply complication");
        return;
      }

      // Apply the complication effect automatically
      const success = await EffectApplicator.applyComplication(targetActor, complication);

      if (success) {
        console.log(`PF2e Narrative Seeds | Auto-applied complication "${complication.name}" to ${targetActor.name}`);
      }

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error auto-applying complication:", error);
    }
  }

  /**
   * Apply a dismemberment effect to the appropriate actor
   * @param {ChatMessage} message - The chat message containing attack data
   * @param {HTMLElement} button - The clicked button element
   */
  static async applyDismemberment(message, button) {
    try {
      // Get dismemberment data from message flags
      const seed = message.flags?.["pf2e-narrative-seeds"]?.seed;
      if (!seed || !seed.dismemberment) {
        ui.notifications.warn("No dismemberment data found in message");
        return;
      }

      const dismemberment = seed.dismemberment;

      // Get stored attack data to determine target
      const storedData = message.flags?.["pf2e-narrative-seeds"]?.attackData;
      if (!storedData) {
        ui.notifications.warn("Cannot apply dismemberment: attack data not found");
        return;
      }

      // Get the target actor (dismemberment always applies to target)
      const targetActor = storedData.targetId ? game.actors.get(storedData.targetId) : null;

      if (!targetActor) {
        ui.notifications.warn("Could not find target for dismemberment");
        return;
      }

      // CRITICAL WARNING: Dismemberment is permanent!
      // Escape all dynamic content to prevent XSS
      const escapedName = StringUtils.escapeHTML(dismemberment.name);
      const escapedTarget = StringUtils.escapeHTML(targetActor.name);
      const escapedDescription = StringUtils.escapeHTML(dismemberment.description);

      const confirmed = await Dialog.confirm({
        title: "💀 PERMANENT INJURY WARNING 💀",
        content: `<div style="background: #8b0000; border: 2px solid #ff0000; padding: 15px; border-radius: 5px; color: #fff;">
          <h2 style="color: #ff0000; margin-top: 0;">⚠️ PERMANENT INJURY ⚠️</h2>
          <p><strong>You are about to apply:</strong></p>
          <p style="font-size: 1.2em; color: #ffd700;">${escapedName}</p>
          <p><strong>To:</strong> ${escapedTarget}</p>
          <hr style="border-color: #ff0000;">
          <p>${escapedDescription}</p>
          <hr style="border-color: #ff0000;">
          <p style="color: #ff6666;"><strong>THIS IS A PERMANENT EFFECT!</strong></p>
          <p>This effect cannot be easily removed and will have lasting consequences.</p>
          <p>Are you absolutely sure you want to proceed?</p>
        </div>`,
        yes: () => true,
        no: () => false,
        defaultYes: false
      });

      if (!confirmed) {
        ui.notifications.info("Dismemberment application cancelled");
        return;
      }

      // Check if user has permission to modify the target actor
      if (!targetActor.testUserPermission(game.user, "OWNER") && !game.user.isGM) {
        ui.notifications.warn(`You do not have permission to modify ${targetActor.name}`);
        return;
      }

      // Apply the dismemberment effect
      const success = await EffectApplicator.applyDismemberment(targetActor, dismemberment);

      if (success) {
        // Disable the button to prevent double-application
        button.disabled = true;
        button.textContent = "💀 Applied";
        button.classList.add('applied');
      }

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error applying dismemberment:", error);
      ui.notifications.error("Failed to apply dismemberment");
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
