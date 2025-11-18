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
   * Pending attack tracker for attack-damage linking
   * Key: `${actorId}-${itemUuid}`
   * Value: {attackMessageId, attackData, attackDataFlags, seed, timestamp, visibilityMode, speaker}
   */
  static pendingAttacks = new Map();

  /**
   * Maximum age for pending attacks (30 seconds)
   */
  static PENDING_ATTACK_MAX_AGE = 30000;

  /**
   * Initialize combat hooks
   */
  static initialize() {
    console.log("PF2e Narrative Seeds | Initializing combat hooks...");

    // Create generator instance
    this.generator = new CombatNarrativeGenerator();

    // Register hooks
    this.registerHooks();

    // Start cleanup interval for pending attacks
    this.startPendingAttackCleanup();

    console.log("PF2e Narrative Seeds | Combat hooks initialized");
  }

  /**
   * Start periodic cleanup of old pending attacks
   */
  static startPendingAttackCleanup() {
    setInterval(() => {
      this.cleanupOldPendingAttacks();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Remove pending attacks older than PENDING_ATTACK_MAX_AGE
   */
  static cleanupOldPendingAttacks() {
    const now = Date.now();
    for (const [key, value] of this.pendingAttacks.entries()) {
      if (now - value.timestamp > this.PENDING_ATTACK_MAX_AGE) {
        this.pendingAttacks.delete(key);
      }
    }
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

      // Check if this is a damage roll FIRST (before strike check)
      if (this.isDamageRollMessage(message)) {
        await this.onDamageRoll(message, options, userId);
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

      // Check if this attack will have a damage roll (hits and critical hits)
      const outcome = attackData.context?.outcome;
      const willHaveDamageRoll = outcome === 'success' || outcome === 'criticalSuccess';

      if (willHaveDamageRoll) {
        // Store pending attack for damage roll linking (don't post chat card yet)
        const attackKey = `${attackData.actor?.id}-${attackData.origin?.uuid}`;
        this.pendingAttacks.set(attackKey, {
          attackMessageId: message.id,
          attackData: attackData,
          attackDataFlags: attackDataFlags,
          seed: seed,
          timestamp: Date.now(),
          visibilityMode: visibilityMode,
          speaker: message.speaker
        });
      } else {
        // Miss or critical miss - post narrative immediately (no damage roll coming)
        const narrativeHTML = CombatFormatter.generateHTML(seed);
        const whisperTargets = this.getWhisperTargets(visibilityMode, attackData.actor?.id);

        await ChatMessage.create({
          content: narrativeHTML,
          whisper: whisperTargets,
          style: CONST.CHAT_MESSAGE_STYLES.OTHER,
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
   * Check if message is a PF2e damage roll
   * @param {ChatMessage} message
   * @returns {boolean}
   */
  static isDamageRollMessage(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return false;

    const context = flags.context;
    if (!context) return false;

    return context.type === "damage-roll";
  }

  /**
   * Handle damage roll message
   * @param {ChatMessage} message
   * @param {Object} options
   * @param {string} userId
   */
  static async onDamageRoll(message, options, userId) {
    try {
      console.log("PF2e Narrative Seeds | Processing damage roll:", message.id);

      // Extract basic info from damage message
      const flags = message.flags?.pf2e;
      const origin = flags?.origin;
      const context = flags?.context;

      // Get actor (attacker)
      let actorId = message.speaker?.actor;
      let itemUuid = origin?.uuid;

      if (!actorId || !itemUuid) {
        console.log("PF2e Narrative Seeds | Damage roll missing actor or item UUID");
        return;
      }

      // Find matching pending attack
      const attackKey = `${actorId}-${itemUuid}`;
      const pendingAttack = this.pendingAttacks.get(attackKey);

      if (!pendingAttack) {
        // No matching attack - this might be a damage-only spell like Force Barrage
        await this.handleDamageOnlySpell(message, actorId, itemUuid);
        return;
      }

      // Extract damage amount from the message
      const damageAmount = this.extractDamageAmount(message);
      console.log(`PF2e Narrative Seeds | Damage amount: ${damageAmount}`);

      // Re-generate narrative with damage included
      const attackData = pendingAttack.attackData;
      attackData.damageAmount = damageAmount;
      attackData.damageMessage = message;

      const seed = await this.generator.generate(attackData);
      if (!seed) {
        console.log("PF2e Narrative Seeds | Could not regenerate narrative with damage");
        return;
      }

      // Create combined attack+damage narrative message
      const visibilityMode = pendingAttack.visibilityMode;
      const narrativeHTML = CombatFormatter.generateHTML(seed);
      const whisperTargets = this.getWhisperTargets(visibilityMode, attackData.actor?.id);

      const attackDataFlags = {
        ...pendingAttack.attackDataFlags,
        damageAmount: damageAmount
      };

      await ChatMessage.create({
        content: narrativeHTML,
        whisper: whisperTargets, // Empty array for "everyone" mode
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        speaker: pendingAttack.speaker,
        flags: {
          "pf2e-narrative-seeds": {
            hasNarrative: true,
            attackData: attackDataFlags,
            seed: seed,
            visibilityMode: visibilityMode,
            originalMessageId: pendingAttack.attackMessageId,
            damageMessageId: message.id
          }
        }
      });

      // Remove from pending attacks
      this.pendingAttacks.delete(attackKey);
      console.log("PF2e Narrative Seeds | Created attack+damage narrative");

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error processing damage roll:", error);
    }
  }

  /**
   * Extract total damage amount from damage roll message
   * @param {ChatMessage} message - Damage roll message
   * @returns {number} Total damage amount
   */
  static extractDamageAmount(message) {
    try {
      // Method 1: Check roll total
      if (message.rolls && message.rolls.length > 0) {
        const total = message.rolls.reduce((sum, roll) => sum + (roll.total || 0), 0);
        if (total > 0) return total;
      }

      // Method 2: Check flags
      if (message.flags?.pf2e?.context?.damage) {
        return message.flags.pf2e.context.damage;
      }

      // Method 3: Parse from content
      const content = message.content || "";
      const match = content.match(/total[^0-9]*(\d+)/i);
      if (match) {
        return parseInt(match[1], 10);
      }

      return 0;
    } catch (error) {
      console.error("PF2e Narrative Seeds | Error extracting damage amount:", error);
      return 0;
    }
  }

  /**
   * Handle damage-only spells (like Force Barrage) that have no attack roll
   * @param {ChatMessage} message - Damage roll message
   * @param {string} actorId - Actor ID
   * @param {string} itemUuid - Item UUID
   */
  static async handleDamageOnlySpell(message, actorId, itemUuid) {
    try {
      console.log("PF2e Narrative Seeds | Handling damage-only spell");

      // Get the item to check if it's Force Barrage or similar
      let item = null;
      try {
        item = await fromUuid(itemUuid);
      } catch (e) {
        console.warn("PF2e Narrative Seeds | Could not resolve item UUID for damage-only spell:", itemUuid);
        return;
      }

      if (!item) {
        console.log("PF2e Narrative Seeds | No item found for damage-only spell");
        return;
      }

      // Check if this is Force Barrage or another damage-only spell
      const itemName = item.name?.toLowerCase() || "";
      const isForcBarrage = itemName.includes("force barrage") || itemName.includes("magic missile");

      if (!isForcBarrage) {
        // Not a damage-only spell we handle, skip
        console.log(`PF2e Narrative Seeds | Skipping non-force-barrage damage spell: ${item.name}`);
        return;
      }

      console.log(`PF2e Narrative Seeds | Processing Force Barrage: ${item.name}`);

      // Get actor
      const actor = game.actors.get(actorId);
      if (!actor) {
        console.warn("PF2e Narrative Seeds | No actor found for Force Barrage");
        return;
      }

      // Get target (from context or current targets)
      let target = null;
      const context = message.flags?.pf2e?.context;
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

      if (!target) {
        console.warn("PF2e Narrative Seeds | No target found for Force Barrage");
        return;
      }

      // Extract damage
      const damageAmount = this.extractDamageAmount(message);

      // Create attack data for Force Barrage (always succeeds)
      const attackData = {
        message,
        actor,
        target,
        item,
        context: {
          type: "spell-damage",
          outcome: "success", // Force Barrage always hits
          target: {
            actor: target.id
          }
        },
        origin: {
          uuid: itemUuid,
          type: "spell"
        },
        damageAmount: damageAmount,
        damageMessage: message
      };

      // Generate narrative with force damage type
      const seed = await this.generator.generate(attackData);
      if (!seed) {
        console.log("PF2e Narrative Seeds | Could not generate Force Barrage narrative");
        return;
      }

      // Get visibility mode
      const visibilityMode = NarrativeSeedsSettings.get("visibilityMode");

      // Create narrative message
      const narrativeHTML = CombatFormatter.generateHTML(seed);

      const attackDataFlags = {
        actorId: actor.id,
        targetId: target.id,
        itemId: item.id,
        itemUuid: itemUuid,
        outcome: "success",
        damageAmount: damageAmount
      };

      const whisperTargets = this.getWhisperTargets(visibilityMode, actor.id);

      await ChatMessage.create({
        content: narrativeHTML,
        whisper: whisperTargets, // Empty array for "everyone" mode
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        speaker: message.speaker,
        flags: {
          "pf2e-narrative-seeds": {
            hasNarrative: true,
            attackData: attackDataFlags,
            seed: seed,
            visibilityMode: visibilityMode,
            damageMessageId: message.id,
            isForcBarrage: true
          }
        }
      });

      console.log("PF2e Narrative Seeds | Created Force Barrage narrative");

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error handling damage-only spell:", error);
    }
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

    // Attach event listeners to any narrative elements in this message
    // (Narratives are now always separate messages, not embedded)
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
