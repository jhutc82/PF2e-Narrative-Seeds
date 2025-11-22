/**
 * PF2e Narrative Seeds - Social Hooks
 * Handles manual NPC generation triggers and social encounters
 */

import { NarrativeSeedsSettings } from '../settings.js';
import { NPCGenerator } from './npc-generator.js';
import { SocialFormatter } from './social-formatter.js';
import { NPCManagerApp } from './npc-manager-app.js';
import { NPCManagerStorage } from './npc-manager-storage.js';

/**
 * Social hooks manager
 */
export class SocialHooks {

  /**
   * Hook registrations for cleanup (stores {name, id} objects)
   */
  static hookIds = [];

  /**
   * NPC Manager instance
   */
  static npcManager = null;

  /**
   * Initialize social hooks
   */
  static initialize() {
    console.log("PF2e Narrative Seeds | Initializing social hooks...");

    // Initialize NPC Manager storage
    NPCManagerStorage.initialize();

    // Register hooks
    this.registerHooks();

    // Add chat command for manual generation
    this.registerChatCommands();

    // Add UI controls
    this.addUIControls();

    console.log("PF2e Narrative Seeds | Social hooks initialized");
  }

  /**
   * Register Foundry hooks
   */
  static registerHooks() {
    // Hook into chat message rendering to attach event listeners
    const renderHookId = Hooks.on("renderChatMessage", (message, html, data) => {
      try {
        this.onRenderChatMessage(message, html, data);
      } catch (error) {
        console.error("PF2e Narrative Seeds | Error in social renderChatMessage hook:", error);
      }
    });
    this.hookIds.push({ name: "renderChatMessage", id: renderHookId });

    // Note: renderActorSheet hook removed to avoid modifying character sheets
    // NPC management is accessible via the left sidebar button added in addUIControls()
  }

  /**
   * Register chat commands for manual generation
   */
  static registerChatCommands() {
    // Allow GMs to type "/npc" or "/generate-npc" in chat to generate an NPC
    Hooks.on("chatMessage", (chatLog, message, chatData) => {
      const command = message.trim().toLowerCase();

      if (command === "/npc" || command === "/generate-npc") {
        this.generateNPC();
        return false; // Prevent the message from being sent to chat
      }

      // Open NPC Manager
      if (command === "/npc-manager" || command === "/npcs") {
        this.openNPCManager();
        return false;
      }

      return true;
    });
  }

  /**
   * Add UI controls for NPC Manager
   */
  static addUIControls() {
    // Add button to scene controls for GMs
    Hooks.on("getSceneControlButtons", (controls) => {
      if (!game.user.isGM) return;

      // Find the notes control group (or create a new one)
      let notesControl = controls.find(c => c.name === "notes");

      if (notesControl) {
        notesControl.tools.push({
          name: "npc-manager",
          title: "NPC Manager",
          icon: "fas fa-users",
          button: true,
          onClick: () => this.openNPCManager()
        });
      }
    });
  }

  /**
   * Open NPC Manager
   */
  static openNPCManager() {
    if (!game.user.isGM) {
      ui.notifications.warn("Only GMs can access the NPC Manager");
      return;
    }

    // Create or show existing instance
    if (!this.npcManager) {
      this.npcManager = new NPCManagerApp();
    }

    this.npcManager.render(true, { focus: true });
  }

  /**
   * Handle chat message rendering
   * Attaches event listeners for regenerate buttons
   * @param {ChatMessage} message
   * @param {jQuery} html
   * @param {Object} data
   */
  static onRenderChatMessage(message, html, data) {
    // Find regenerate button for NPC cards
    const regenerateBtn = html.find(".regenerate-btn, .regenerate-icon");

    if (regenerateBtn.length > 0) {
      regenerateBtn.off("click").on("click", async (event) => {
        event.preventDefault();

        // Check if this is an NPC card
        const flags = message.flags?.["pf2e-narrative-seeds"];
        if (flags?.type === "npc") {
          await this.regenerateNPC(message, flags.seed);
        }
      });
    }
  }


  /**
   * Generate a new NPC personality
   * @param {Object} params - Generation parameters
   * @param {Actor} params.actor - Optional target actor
   * @param {string} params.forcedMood - Optional forced mood
   * @returns {Promise<void>}
   */
  static async generateNPC(params = {}) {
    try {
      // Check if enabled
      if (!NarrativeSeedsSettings.get("enableSocial", false)) {
        ui.notifications.warn("NPC Generator is disabled in settings");
        return;
      }

      // Generate NPC personality
      const seed = await NPCGenerator.generate(params);

      if (!seed) {
        ui.notifications.error("Failed to generate NPC personality");
        return;
      }

      // Determine visibility
      const visibilityMode = NarrativeSeedsSettings.get("visibilityMode", "gm-only");
      const whisper = this.getWhisperTargets(visibilityMode, params.actor);

      // Create chat card
      await SocialFormatter.createChatCard(seed, {
        whisper,
        speaker: ChatMessage.getSpeaker({ alias: "NPC Generator" })
      });

      if (NarrativeSeedsSettings.shouldShowNotifications()) {
        ui.notifications.info("NPC personality generated!");
      }

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error generating NPC:", error);
      ui.notifications.error("Error generating NPC personality");
    }
  }

  /**
   * Regenerate an existing NPC personality
   * @param {ChatMessage} message - Original message
   * @param {Object} oldSeed - Previous seed
   * @returns {Promise<void>}
   */
  static async regenerateNPC(message, oldSeed) {
    try {
      // Generate new NPC with same actor if available
      let params = {};
      if (oldSeed.actor) {
        const actor = game.actors.get(oldSeed.actor.id);
        if (actor) {
          params.actor = actor;
        }
      }
      const newSeed = await NPCGenerator.generate(params);

      if (!newSeed) {
        ui.notifications.error("Failed to regenerate NPC personality");
        return;
      }

      // Update the existing message
      const newHTML = SocialFormatter.generateHTML(newSeed);

      await message.update({
        content: newHTML,
        flags: {
          "pf2e-narrative-seeds": {
            type: "npc",
            seed: newSeed
          }
        }
      });

      if (NarrativeSeedsSettings.shouldShowNotifications()) {
        ui.notifications.info("NPC personality regenerated!");
      }

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error regenerating NPC:", error);
      ui.notifications.error("Error regenerating NPC personality");
    }
  }

  /**
   * Get whisper targets based on visibility mode
   * @param {string} visibilityMode
   * @param {Actor} actor - Optional actor
   * @returns {Array<string>} User IDs to whisper to
   */
  static getWhisperTargets(visibilityMode, actor = null) {
    if (visibilityMode === "everyone") {
      return [];
    }

    const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);

    if (visibilityMode === "gm-only") {
      return gmUsers;
    }

    if (visibilityMode === "gm-plus-actor" && actor?.hasPlayerOwner) {
      const actorOwners = game.users.filter(u =>
        actor.testUserPermission(u, "OWNER") && !u.isGM
      ).map(u => u.id);
      return [...gmUsers, ...actorOwners];
    }

    return gmUsers;
  }

  /**
   * Shutdown social hooks
   */
  static shutdown() {
    console.log("PF2e Narrative Seeds | Shutting down social hooks...");

    // Close NPC Manager if open
    if (this.npcManager) {
      this.npcManager.close();
      this.npcManager = null;
    }

    // Remove all hooks
    for (const hook of this.hookIds) {
      Hooks.off(hook.name, hook.id);
    }

    this.hookIds = [];

    console.log("PF2e Narrative Seeds | Social hooks shutdown complete");
  }

  /**
   * Generate NPC for a specific actor (API method)
   * @param {Actor} actor - Target actor
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated seed
   */
  static async generateForActor(actor, options = {}) {
    return NPCGenerator.generate({ actor, ...options });
  }
}
