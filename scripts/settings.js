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
    // PHASE 3: SKILL ACTION SETTINGS
    // ========================================

    // Enable skill narration
    game.settings.register("pf2e-narrative-seeds", "enableSkills", {
      name: "Enable Skill Action Narration",
      hint: "Generate descriptions for skill actions in encounter mode",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        ui.notifications.info("Skill action narration " + (value ? "enabled" : "disabled") + ". Reload required.");
      }
    });

    // Skill detail level
    game.settings.register("pf2e-narrative-seeds", "skillDetailLevel", {
      name: "Skill Detail Level",
      hint: "How much information to include in skill narratives",
      scope: "world",
      config: true,
      type: String,
      choices: {
        "minimal": "Minimal (Quick description)",
        "standard": "Standard (Balanced)",
        "detailed": "Detailed (Full description)",
        "cinematic": "Cinematic (Maximum drama)"
      },
      default: "standard"
    });

    // Show detected feats
    game.settings.register("pf2e-narrative-seeds", "showDetectedFeats", {
      name: "Show Detected Feats",
      hint: "Display which feats were detected in skill narrative output",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    // ========================================
    // COMPLICATIONS SYSTEM
    // ========================================

    // Enable complications
    game.settings.register("pf2e-narrative-seeds", "enableComplications", {
      name: "Enable Combat Complications",
      hint: "Generate mechanical complications for critical successes and failures",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        ui.notifications.info("Combat complications " + (value ? "enabled" : "disabled"));
      }
    });

    // Complication frequency
    game.settings.register("pf2e-narrative-seeds", "complicationChance", {
      name: "Complication Frequency",
      hint: "Percentage chance for a complication to occur on critical outcomes (0-100)",
      scope: "world",
      config: true,
      type: Number,
      range: {
        min: 0,
        max: 100,
        step: 5
      },
      default: 60,
      onChange: value => {
        // Validate and clamp value to valid range
        if (value < 0 || value > 100) {
          const clamped = Math.max(0, Math.min(100, value));
          console.warn(`PF2e Narrative Seeds | Complication chance must be 0-100. Clamping ${value} to ${clamped}`);
          game.settings.set("pf2e-narrative-seeds", "complicationChance", clamped);
        }
      }
    });

    // Auto-apply complications
    game.settings.register("pf2e-narrative-seeds", "autoApplyComplications", {
      name: "Auto-Apply Complications",
      hint: "Automatically apply complications without requiring the GM to click the apply button. Effects will be applied immediately when a complication is triggered.",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      onChange: value => {
        ui.notifications.info("Auto-apply complications " + (value ? "enabled" : "disabled"));
      }
    });

    // ========================================
    // DISMEMBERMENT SYSTEM
    // ========================================

    // Enable dismemberment
    game.settings.register("pf2e-narrative-seeds", "enableDismemberment", {
      name: "Enable Dismemberment System",
      hint: "PERMANENT INJURIES: Generate dismemberment effects for devastating critical hits (dealing >50% of max HP or against unconscious targets)",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      onChange: value => {
        ui.notifications.warn("Dismemberment system" + (value ? " ENABLED - Permanent injuries are now possible!" : " disabled"));
      }
    });

    // Dismemberment base chance
    game.settings.register("pf2e-narrative-seeds", "dismembermentBaseChance", {
      name: "Dismemberment Base Chance",
      hint: "Base percentage chance for dismemberment when conditions are met (before level scaling)",
      scope: "world",
      config: true,
      type: Number,
      range: {
        min: 0,
        max: 50,
        step: 1
      },
      default: 5
    });

    // Dismemberment level scaling
    game.settings.register("pf2e-narrative-seeds", "dismembermentLevelScaling", {
      name: "Dismemberment Level Scaling",
      hint: "Additional percentage chance per target level (e.g., 0.5 = +0.5% per level)",
      scope: "world",
      config: true,
      type: Number,
      range: {
        min: 0,
        max: 2,
        step: 0.1
      },
      default: 0.5
    });

    // Dismemberment max chance
    game.settings.register("pf2e-narrative-seeds", "dismembermentMaxChance", {
      name: "Dismemberment Maximum Chance",
      hint: "Maximum percentage chance for dismemberment (caps total chance including level scaling)",
      scope: "world",
      config: true,
      type: Number,
      range: {
        min: 5,
        max: 100,
        step: 5
      },
      default: 30
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

  /**
   * Check if skill action narration is enabled
   * @returns {boolean}
   */
  static isSkillEnabled() {
    return this.isEnabled() && this.get("enableSkills");
  }
}
