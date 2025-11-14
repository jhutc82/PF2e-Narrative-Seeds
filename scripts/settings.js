/**
 * PF2e Narrative Seeds - Settings Registration
 * Handles all module settings configuration
 */

export class NarrativeSeedsSettings {

  /**
   * Register all module settings
   */
  static registerSettings() {
    console.log("PF2e Narrative Seeds | Registering settings...");

    // ========================================
    // GLOBAL SETTINGS
    // ========================================

    // Master enable/disable
    game.settings.register("pf2e-narrative-seeds", "enableModule", {
      name: "Enable Narrative Seeds",
      hint: "Master switch for all narrative generation features",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        ui.notifications.info("PF2e Narrative Seeds | Module " + (value ? "enabled" : "disabled") + ". Reload required.");
      }
    });

    // Visibility settings
    game.settings.register("pf2e-narrative-seeds", "visibilityMode", {
      name: "Narrative Visibility",
      hint: "Who sees the generated narrative seeds?",
      scope: "world",
      config: true,
      type: String,
      choices: {
        "gm-only": "GM Only (Whispered)",
        "everyone": "All Players",
        "gm-plus-actor": "GM + Acting Player"
      },
      default: "gm-only"
    });

    // Content tone
    game.settings.register("pf2e-narrative-seeds", "contentTone", {
      name: "Content Tone",
      hint: "How graphic/intense should descriptions be?",
      scope: "world",
      config: true,
      type: String,
      choices: {
        "family-friendly": "Family Friendly (PG)",
        "standard": "Standard (PG-13)",
        "gritty": "Gritty & Realistic (R)",
        "dark": "Dark Fantasy (R+)"
      },
      default: "standard"
    });

    // Variety mode
    game.settings.register("pf2e-narrative-seeds", "varietyMode", {
      name: "Variety Level",
      hint: "How much variation in descriptions?",
      scope: "world",
      config: true,
      type: String,
      choices: {
        "low": "Low (Familiar, less varied)",
        "medium": "Medium (Balanced)",
        "high": "High (Maximum variety)",
        "extreme": "Extreme (Never repeat)"
      },
      default: "high"
    });

    // ========================================
    // PHASE 1: COMBAT SETTINGS
    // ========================================

    // Enable combat narration
    game.settings.register("pf2e-narrative-seeds", "enableCombat", {
      name: "Enable Combat Narration",
      hint: "Generate descriptions for attack rolls",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        ui.notifications.info("Combat narration " + (value ? "enabled" : "disabled") + ". Reload required.");
      }
    });

    // Combat detail level
    game.settings.register("pf2e-narrative-seeds", "combatDetailLevel", {
      name: "Combat Detail Level",
      hint: "How much information to include",
      scope: "world",
      config: true,
      type: String,
      choices: {
        "minimal": "Minimal (Location only)",
        "standard": "Standard (Location + effect)",
        "detailed": "Detailed (Full description)",
        "cinematic": "Cinematic (Maximum drama)"
      },
      default: "standard"
    });

    // Show anatomy type in output
    game.settings.register("pf2e-narrative-seeds", "showAnatomyType", {
      name: "Show Detected Anatomy",
      hint: "Display detected creature anatomy type in output",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    // ========================================
    // FUTURE PHASE SETTINGS (Placeholders)
    // ========================================

    // Phase 2: Spells
    game.settings.register("pf2e-narrative-seeds", "enableSpells", {
      name: "Enable Spell Narration (Coming Soon)",
      hint: "Generate descriptions for spell effects - Phase 2 feature",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    // Phase 3: Skills
    game.settings.register("pf2e-narrative-seeds", "enableSkills", {
      name: "Enable Skill Check Narration (Coming Soon)",
      hint: "Generate descriptions for skill checks - Phase 3 feature",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    // Phase 4: Exploration
    game.settings.register("pf2e-narrative-seeds", "enableExploration", {
      name: "Enable Exploration Narration (Coming Soon)",
      hint: "Generate descriptions for exploration activities - Phase 4 feature",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    console.log("PF2e Narrative Seeds | Settings registered successfully");
  }

  /**
   * Get a setting value
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  static get(key) {
    return game.settings.get("pf2e-narrative-seeds", key);
  }

  /**
   * Check if module is enabled
   * @returns {boolean}
   */
  static isEnabled() {
    return this.get("enableModule");
  }

  /**
   * Check if combat narration is enabled
   * @returns {boolean}
   */
  static isCombatEnabled() {
    return this.isEnabled() && this.get("enableCombat");
  }
}
