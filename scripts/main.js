/**
 * PF2e Narrative Seeds - Main Entry Point
 * Comprehensive narrative generation system for Pathfinder 2e
 *
 * @module pf2e-narrative-seeds
 * @author Justin Hutchinson
 * @version 1.3.10
 */

import { NarrativeSeedsSettings } from './settings.js';
import { PF2eUtils, RandomUtils } from './utils.js';
import { CombatHooks } from './combat/combat-hooks.js';
import { SkillHooks } from './skill/skill-hooks.js';
import { SocialHooks } from './social/social-hooks.js';
import { NPCGenerator } from './social/npc-generator.js';
import { NameGenerator } from './social/name-generator.js';
import { NPCManagerApp } from './social/npc-manager-app.js';
import { NPCManagerStorage } from './social/npc-manager-storage.js';
import { AnatomyDetector } from './combat/anatomy-detector.js';
import { DamageDetector } from './combat/damage-detector.js';
import { ActionDetector } from './skill/action-detector.js';
import { FeatDetector } from './skill/feat-detector.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { DataLoader } from './data-loader.js';
import { ComplicationManager } from './combat/complication-manager.js';
import { DismembermentManager } from './combat/dismemberment-manager.js';

/**
 * Main module class
 */
class PF2eNarrativeSeeds {

  static MODULE_ID = "pf2e-narrative-seeds";
  static MODULE_TITLE = "PF2e Narrative Seeds";
  // Version should match module.json - update both when releasing
  static VERSION = "1.3.7";

  static generators = new Map();
  static initialized = false;

  /**
   * Initialize the module
   */
  static initialize() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          PF2e Narrative Seeds v${this.VERSION}                  ║
║          Automated narrative inspiration for every roll   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    // Check if PF2e system
    if (!PF2eUtils.isPF2e()) {
      console.warn("PF2e Narrative Seeds | This module requires the PF2e game system!");
      if (typeof ui !== 'undefined' && ui.notifications) {
        ui.notifications.warn("PF2e Narrative Seeds requires the Pathfinder 2e game system.");
      }
      return;
    }

    // Check if module is enabled
    if (!NarrativeSeedsSettings.isEnabled()) {
      console.log("PF2e Narrative Seeds | Module is disabled in settings");
      return;
    }

    // Initialize active generators
    this.initializeGenerators();

    // Mark as initialized
    this.initialized = true;

    console.log(`PF2e Narrative Seeds | Initialization complete`);
    console.log(`PF2e Narrative Seeds | Active generators: ${this.generators.size}`);

    // Show notification to GM
    if (game.user.isGM && typeof ui !== 'undefined' && ui.notifications && NarrativeSeedsSettings.shouldShowNotifications()) {
      ui.notifications.info("PF2e Narrative Seeds loaded successfully!");
    }
  }

  /**
   * Initialize active generators based on settings
   */
  static initializeGenerators() {
    console.log("PF2e Narrative Seeds | Initializing generators...");

    // Phase 1: Combat
    if (NarrativeSeedsSettings.isCombatEnabled()) {
      console.log("PF2e Narrative Seeds | Initializing combat narration...");
      CombatHooks.initialize();
      this.generators.set("combat", CombatHooks);
    }

    // Phase 2: Skill Actions
    if (NarrativeSeedsSettings.isSkillEnabled()) {
      console.log("PF2e Narrative Seeds | Initializing skill action narration...");
      SkillHooks.initialize();
      this.generators.set("skills", SkillHooks);
    }

    // Phase 4: Social Encounters / NPC Generator
    if (NarrativeSeedsSettings.isSocialEnabled()) {
      console.log("PF2e Narrative Seeds | Initializing NPC generator...");
      SocialHooks.initialize();
      this.generators.set("social", SocialHooks);
    }

    // Future phases: Spells, Exploration (coming soon)
  }

  /**
   * Shutdown the module
   */
  static shutdown() {
    console.log("PF2e Narrative Seeds | Shutting down...");

    // Shutdown all generators
    for (const [name, generator] of this.generators) {
      if (generator.shutdown) {
        generator.shutdown();
      }
    }

    this.generators.clear();
    this.initialized = false;

    console.log("PF2e Narrative Seeds | Shutdown complete");
  }

  /**
   * Get module setting
   * @param {string} key
   * @returns {*}
   */
  static getSetting(key) {
    return NarrativeSeedsSettings.get(key);
  }

  /**
   * Check if a generator is active
   * @param {string} name
   * @returns {boolean}
   */
  static isGeneratorActive(name) {
    return this.generators.has(name);
  }

  /**
   * Get module version
   * @returns {string}
   */
  static getVersion() {
    return this.VERSION;
  }

  /**
   * Log module info
   */
  static logInfo() {
    console.log("=".repeat(60));
    console.log(`PF2e Narrative Seeds v${this.VERSION}`);
    console.log("=".repeat(60));
    console.log(`Initialized: ${this.initialized}`);
    console.log(`Active Generators: ${this.generators.size}`);
    if (this.generators.size > 0) {
      console.log("Generators:");
      for (const name of this.generators.keys()) {
        console.log(`  - ${name}`);
      }
    }
    console.log("Settings:");
    console.log(`  - Module Enabled: ${NarrativeSeedsSettings.isEnabled()}`);
    console.log(`  - Combat Enabled: ${NarrativeSeedsSettings.isCombatEnabled()}`);
    console.log(`  - Visibility Mode: ${NarrativeSeedsSettings.get("visibilityMode")}`);
    console.log(`  - Content Tone: ${NarrativeSeedsSettings.get("contentTone")}`);
    console.log(`  - Variety Mode: ${NarrativeSeedsSettings.get("varietyMode")}`);
    console.log(`  - Combat Detail: ${NarrativeSeedsSettings.get("combatDetailLevel")}`);
    console.log("=".repeat(60));
  }
}

// ============================================================================
// FOUNDRY HOOKS
// ============================================================================

/**
 * Initialize settings on init
 */
Hooks.once("init", () => {
  console.log("PF2e Narrative Seeds | Init hook fired");

  // Register settings
  NarrativeSeedsSettings.registerSettings();

  // Initialize ComplicationManager (load complication data)
  ComplicationManager.initialize();

  // Initialize DismembermentManager (load dismemberment data)
  DismembermentManager.initialize();

  // Expose API
  const module = game.modules.get(PF2eNarrativeSeeds.MODULE_ID);
  if (module) {
    module.api = {
      version: PF2eNarrativeSeeds.VERSION,
      isInitialized: () => PF2eNarrativeSeeds.initialized,
      getSetting: (key) => PF2eNarrativeSeeds.getSetting(key),
      logInfo: () => PF2eNarrativeSeeds.logInfo()
    };
  } else {
    console.error("PF2e Narrative Seeds | Failed to get module from game.modules");
  }
});

/**
 * Initialize module on ready
 */
Hooks.once("ready", () => {
  console.log("PF2e Narrative Seeds | Ready hook fired");

  // Initialize the module
  PF2eNarrativeSeeds.initialize();

  // Expose console API for debugging
  window.PF2eNarrativeSeeds = {
    version: PF2eNarrativeSeeds.VERSION,
    module: PF2eNarrativeSeeds,
    settings: NarrativeSeedsSettings,
    utils: PF2eUtils,
    info: () => PF2eNarrativeSeeds.logInfo(),

    // Helper function to test anatomy detection
    testAnatomy: (actor) => {
      AnatomyDetector.debugDetection(actor);
    },

    // Helper function to test damage detection
    testDamage: (item) => {
      DamageDetector.debugDetection(item);
    },

    // Helper function to test skill action detection
    testSkillAction: (message) => {
      ActionDetector.debugDetection(message);
    },

    // Helper function to test feat detection
    testFeats: (actor, actionSlug) => {
      FeatDetector.debugDetection(actor, actionSlug);
    },

    // Helper function to generate NPC
    generateNPC: (actor) => {
      SocialHooks.generateNPC({ actor });
    },

    // NPC Generator utilities
    npc: {
      generate: (params) => NPCGenerator.generate(params),
      clearMemory: () => NPCGenerator.clearMemory(),
      stats: () => NPCGenerator.getMemoryStats(),
      generateName: (ancestry, gender) => NameGenerator.generate(ancestry, gender),
      detectAncestry: (actor) => NameGenerator.detectAncestry(actor)
    },

    // NPC Manager utilities
    manager: {
      open: () => SocialHooks.openNPCManager(),
      storage: NPCManagerStorage,
      getAllNPCs: () => NPCManagerStorage.getAllNPCs(),
      getNPC: (id) => NPCManagerStorage.getNPC(id),
      saveNPC: (npc) => NPCManagerStorage.saveNPC(npc),
      deleteNPC: (id) => NPCManagerStorage.deleteNPC(id),
      searchNPCs: (criteria) => NPCManagerStorage.searchNPCs(criteria),
      exportData: () => NPCManagerStorage.exportData(),
      importData: (jsonString) => NPCManagerStorage.importData(jsonString),
      clearAll: () => NPCManagerStorage.clearAll(),
      getStats: () => NPCManagerStorage.getStats()
    },

    // Performance monitoring
    performance: {
      enable: () => PerformanceMonitor.enable(),
      disable: () => PerformanceMonitor.disable(),
      report: () => PerformanceMonitor.printReport(),
      getReport: () => PerformanceMonitor.getReport(),
      reset: () => PerformanceMonitor.reset()
    },

    // Data loader utilities
    data: {
      clearCache: () => DataLoader.clearCache(),
      warmCache: () => DataLoader.warmCache(),
      stats: () => DataLoader.getCacheStats()
    },

    // Random utils for debugging
    random: {
      clearHistory: (key) => RandomUtils.clearHistory(key),
      stats: () => RandomUtils.getCacheStats()
    }
  };

  console.log("PF2e Narrative Seeds | Console API available as window.PF2eNarrativeSeeds");
  console.log("PF2e Narrative Seeds | NPC Manager: window.PF2eNarrativeSeeds.manager.open() or type /npc-manager");
  console.log("PF2e Narrative Seeds | Performance monitoring: window.PF2eNarrativeSeeds.performance.enable()");
  console.log("PF2e Narrative Seeds | Cache warming: window.PF2eNarrativeSeeds.data.warmCache()");
});

/**
 * Handle hot reload (development)
 */
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    try {
      console.log("PF2e Narrative Seeds | Hot reload detected");
      PF2eNarrativeSeeds.shutdown();
      PF2eNarrativeSeeds.initialize();
    } catch (error) {
      console.error("PF2e Narrative Seeds | Hot reload failed:", error);
    }
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PF2eNarrativeSeeds;
