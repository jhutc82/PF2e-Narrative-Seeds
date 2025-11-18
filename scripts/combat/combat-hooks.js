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

      // Get visibility mode to determine how to display the narrative
      const visibilityMode = NarrativeSeedsSettings.get("visibilityMode");

      // Store attack data in flags for potential regeneration
      const attackDataFlags = {
        actorId: attackData.actor?.id,
        targetId: attackData.target?.id,
        itemId: attackData.item?.id,
        itemUuid: attackData.origin?.uuid,
        outcome: attackData.context?.outcome
      };

      if (visibilityMode === "everyone") {
        // For public visibility, inject into the PF2e message via flags
        // This will be rendered by onRenderChatMessage for all users
        await message.update({
          flags: {
            ...message.flags,
            "pf2e-narrative-seeds": {
              hasNarrative: true,
              attackData: attackDataFlags,
              seed: seed,
              visibilityMode: visibilityMode
            }
          }
        });
      } else {
        // For GM-only or GM-plus-actor, create a SEPARATE whispered message
        // This ensures server-side visibility control via Foundry's whisper system
        const whisperTargets = this.getWhisperTargets(visibilityMode, attackData.actor?.id);

        // Generate HTML for the narrative
        const narrativeHTML = CombatFormatter.generateHTML(seed);

        // Create a separate whispered chat message
        await ChatMessage.create({
          content: narrativeHTML,
          whisper: whisperTargets,
          type: CONST.CHAT_MESSAGE_TYPES.OTHER,
          speaker: message.speaker,
          flags: {
            "pf2e-narrative-seeds": {
              hasNarrative: true,
              attackData: attackDataFlags,
              seed: seed,
              visibilityMode: visibilityMode,
              originalMessageId: message.id
            }
          }
        });

        // Store minimal reference in original message for regeneration
        await message.update({
          flags: {
            ...message.flags,
            "pf2e-narrative-seeds": {
              hasNarrativeMessage: true,
              attackData: attackDataFlags
            }
          }
        });
      }

      // Auto-apply complication if setting is enabled
      if (game.settings.get("pf2e-narrative-seeds", "autoApplyComplications")) {
        await this.autoApplyComplication(attackData, seed);
      }

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error processing combat message:", error);
    }
  }

  /**
   * Get whisper targets based on visibility mode
   * @param {string} visibilityMode
   * @param {string} actorId - ID of the acting character
   * @returns {Array} Array of user IDs to whisper to
   */
  static getWhisperTargets(visibilityMode, actorId = null) {
    switch (visibilityMode) {
      case "gm-only":
        return game.users.filter(u => u.isGM).map(u => u.id);

      case "everyone":
        return [];  // Empty array means public message

      case "gm-plus-actor":
        const targets = game.users.filter(u => u.isGM).map(u => u.id);
        if (actorId) {
          const actor = game.actors.get(actorId);
          if (actor?.hasPlayerOwner) {
            const owners = game.users.filter(u => actor.testUserPermission(u, "OWNER"));
            targets.push(...owners.map(u => u.id));
          }
        }
        return [...new Set(targets)];  // Remove duplicates

      default:
        return game.users.filter(u => u.isGM).map(u => u.id);
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
    const flags = message.flags?.["pf2e-narrative-seeds"];
    if (!flags) return;

    // Check if this message has an embedded narrative (for "everyone" mode)
    const hasEmbeddedNarrative = flags.hasNarrative;

    if (hasEmbeddedNarrative) {
      // This is for "everyone" mode - inject the narrative into the PF2e message
      const seed = flags.seed;
      if (!seed) return;

      const narrativeHTML = CombatFormatter.generateHTML(seed);

      // Inject narrative HTML into the rendered message
      const messageContent = html.find('.message-content');
      if (messageContent.length > 0) {
        messageContent.append(narrativeHTML);
      } else {
        html.append(narrativeHTML);
      }
    }

    // Attach event listeners to any narrative elements in this message
    this.attachNarrativeEventListeners(message, html);
  }

  /**
   * Attach event listeners to narrative elements
   * @param {ChatMessage} message
   * @param {jQuery} html
   */
  static attachNarrativeEventListeners(message, html) {
    // Regenerate button
    const regenerateButton = html.find('.regenerate-btn');
    if (regenerateButton.length > 0) {
      regenerateButton.on('click', async (event) => {
        event.preventDefault();
        await this.regenerateNarrative(message);
      });
    }

    // Narrate button
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

    // Copy button
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
   * Regenerate narrative for an existing message
   * @param {ChatMessage} message - Either the original PF2e message or the whispered narrative message
   */
  static async regenerateNarrative(message) {
    try {
      // Determine if this is an embedded narrative or a separate whispered message
      const flags = message.flags?.["pf2e-narrative-seeds"];
      const isWhisperedMessage = flags?.originalMessageId != null;
      const storedData = flags?.attackData;

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
        context: isWhisperedMessage
          ? game.messages.get(flags.originalMessageId)?.flags?.pf2e?.context
          : message.flags?.pf2e?.context,
        origin: isWhisperedMessage
          ? game.messages.get(flags.originalMessageId)?.flags?.pf2e?.origin
          : message.flags?.pf2e?.origin
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

      // Update the message with new seed
      const narrativeHTML = CombatFormatter.generateHTML(seed);

      if (isWhisperedMessage) {
        // Update the whispered message content
        await message.update({
          content: narrativeHTML,
          flags: {
            ...message.flags,
            "pf2e-narrative-seeds": {
              ...flags,
              seed: seed
            }
          }
        });
      } else {
        // Update embedded narrative in original PF2e message
        await message.update({
          flags: {
            ...message.flags,
            "pf2e-narrative-seeds": {
              ...flags,
              seed: seed
            }
          }
        });
      }

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
   * @param {Object} attackData - The attack data containing actor and target
   * @param {Object} seed - The narrative seed containing complication data
   */
  static async autoApplyComplication(attackData, seed) {
    try {
      // Check if there's a complication to apply
      if (!seed || !seed.complication) {
        return; // No complication, silently return
      }

      const complication = seed.complication;
      const outcome = seed.outcome;

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
