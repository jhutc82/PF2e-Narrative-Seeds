/**
 * PF2e Narrative Seeds - Custom Settings Application
 * Provides an improved, tabbed settings interface
 */

import { NarrativeSeedsSettings } from './settings.js';

export class NarrativeSeedsSettingsApp extends FormApplication {

  constructor(object = {}, options = {}) {
    super(object, options);
    this.activeTab = "global";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "pf2e-narrative-seeds-settings",
      title: "PF2e Narrative Seeds - Configuration",
      template: "modules/pf2e-narrative-seeds/templates/settings-app.html",
      width: 600,
      height: "auto",
      closeOnSubmit: false,
      submitOnChange: false,
      resizable: true,
      classes: ["pf2e-narrative-seeds", "settings-app"],
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".tab-content",
          initial: "global"
        }
      ]
    });
  }

  getData(options = {}) {
    const data = super.getData(options);

    // Get all current setting values
    data.settings = {
      // Global Settings
      enableModule: game.settings.get("pf2e-narrative-seeds", "enableModule"),
      visibilityMode: game.settings.get("pf2e-narrative-seeds", "visibilityMode"),
      contentTone: game.settings.get("pf2e-narrative-seeds", "contentTone"),
      varietyMode: game.settings.get("pf2e-narrative-seeds", "varietyMode"),
      enableNotifications: game.settings.get("pf2e-narrative-seeds", "enableNotifications"),

      // Combat Settings
      enableCombat: game.settings.get("pf2e-narrative-seeds", "enableCombat"),
      combatDetailLevel: game.settings.get("pf2e-narrative-seeds", "combatDetailLevel"),
      showAnatomyType: game.settings.get("pf2e-narrative-seeds", "showAnatomyType"),

      // Complications
      enableComplications: game.settings.get("pf2e-narrative-seeds", "enableComplications"),
      complicationChance: game.settings.get("pf2e-narrative-seeds", "complicationChance"),
      autoApplyComplications: game.settings.get("pf2e-narrative-seeds", "autoApplyComplications"),

      // Dismemberment
      enableDismemberment: game.settings.get("pf2e-narrative-seeds", "enableDismemberment"),
      dismembermentBaseChance: game.settings.get("pf2e-narrative-seeds", "dismembermentBaseChance"),
      dismembermentLevelScaling: game.settings.get("pf2e-narrative-seeds", "dismembermentLevelScaling"),
      dismembermentMaxChance: game.settings.get("pf2e-narrative-seeds", "dismembermentMaxChance"),

      // Skill Settings
      enableSkills: game.settings.get("pf2e-narrative-seeds", "enableSkills"),
      skillDetailLevel: game.settings.get("pf2e-narrative-seeds", "skillDetailLevel"),
      showDetectedFeats: game.settings.get("pf2e-narrative-seeds", "showDetectedFeats")
    };

    // Choices for dropdowns - convert to array format for selectOptions helper
    const rawChoices = {
      visibilityMode: {
        "gm-only": "GM Only (Whispered)",
        "everyone": "All Players",
        "gm-plus-actor": "GM + Acting Player"
      },
      contentTone: {
        "family-friendly": "Family Friendly (PG)",
        "standard": "Standard (PG-13)",
        "gritty": "Gritty & Realistic (R)",
        "dark": "Dark Fantasy (R+)"
      },
      varietyMode: {
        "low": "Low (Familiar)",
        "medium": "Medium (Balanced)",
        "high": "High (Maximum variety)",
        "extreme": "Extreme (Never repeat)"
      },
      detailLevel: {
        "minimal": "Minimal",
        "standard": "Standard",
        "detailed": "Detailed",
        "cinematic": "Cinematic"
      }
    };

    // Convert to array format for Foundry v12+ selectOptions helper
    data.choices = {};
    for (const [key, options] of Object.entries(rawChoices)) {
      data.choices[key] = Object.entries(options).map(([value, label]) => ({
        value,
        label
      }));
    }

    data.activeTab = this.activeTab;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Tab switching
    html.find('.tabs .tab').on('click', this._onTabClick.bind(this));

    // Toggle enable/disable states
    html.find('input[name="enableCombat"]').on('change', this._onEnableToggle.bind(this, html, 'combat'));
    html.find('input[name="enableComplications"]').on('change', this._onEnableToggle.bind(this, html, 'complications'));
    html.find('input[name="enableDismemberment"]').on('change', this._onEnableToggle.bind(this, html, 'dismemberment'));
    html.find('input[name="enableSkills"]').on('change', this._onEnableToggle.bind(this, html, 'skills'));

    // Reset to defaults button
    html.find('.reset-defaults').on('click', this._onResetDefaults.bind(this));

    // Initialize toggle states
    this._updateToggleStates(html);
  }

  _onTabClick(event) {
    event.preventDefault();
    const tab = $(event.currentTarget).data('tab');
    this.activeTab = tab;
  }

  _onEnableToggle(html, section, event) {
    this._updateToggleStates(html);
  }

  _updateToggleStates(html) {
    // Disable/enable combat settings based on enableCombat
    const combatEnabled = html.find('input[name="enableCombat"]').is(':checked');
    html.find('.combat-dependent').prop('disabled', !combatEnabled).toggleClass('disabled', !combatEnabled);

    // Disable/enable complication settings based on enableComplications
    const complicationsEnabled = html.find('input[name="enableComplications"]').is(':checked');
    html.find('.complications-dependent').prop('disabled', !complicationsEnabled).toggleClass('disabled', !complicationsEnabled);

    // Disable/enable dismemberment settings based on enableDismemberment
    const dismembermentEnabled = html.find('input[name="enableDismemberment"]').is(':checked');
    html.find('.dismemberment-dependent').prop('disabled', !dismembermentEnabled).toggleClass('disabled', !dismembermentEnabled);

    // Disable/enable skill settings based on enableSkills
    const skillsEnabled = html.find('input[name="enableSkills"]').is(':checked');
    html.find('.skills-dependent').prop('disabled', !skillsEnabled).toggleClass('disabled', !skillsEnabled);
  }

  async _onResetDefaults(event) {
    event.preventDefault();

    const confirmed = await Dialog.confirm({
      title: "Reset to Defaults",
      content: "<p>Are you sure you want to reset all settings to their default values?</p>",
      yes: () => true,
      no: () => false
    });

    if (!confirmed) return;

    // Reset all settings to defaults
    await game.settings.set("pf2e-narrative-seeds", "enableModule", true);
    await game.settings.set("pf2e-narrative-seeds", "visibilityMode", "gm-only");
    await game.settings.set("pf2e-narrative-seeds", "contentTone", "standard");
    await game.settings.set("pf2e-narrative-seeds", "varietyMode", "high");
    await game.settings.set("pf2e-narrative-seeds", "enableNotifications", true);
    await game.settings.set("pf2e-narrative-seeds", "enableCombat", true);
    await game.settings.set("pf2e-narrative-seeds", "combatDetailLevel", "standard");
    await game.settings.set("pf2e-narrative-seeds", "showAnatomyType", true);
    await game.settings.set("pf2e-narrative-seeds", "enableComplications", true);
    await game.settings.set("pf2e-narrative-seeds", "complicationChance", 60);
    await game.settings.set("pf2e-narrative-seeds", "autoApplyComplications", false);
    await game.settings.set("pf2e-narrative-seeds", "enableDismemberment", false);
    await game.settings.set("pf2e-narrative-seeds", "dismembermentBaseChance", 5);
    await game.settings.set("pf2e-narrative-seeds", "dismembermentLevelScaling", 0.5);
    await game.settings.set("pf2e-narrative-seeds", "dismembermentMaxChance", 30);
    await game.settings.set("pf2e-narrative-seeds", "enableSkills", true);
    await game.settings.set("pf2e-narrative-seeds", "skillDetailLevel", "standard");
    await game.settings.set("pf2e-narrative-seeds", "showDetectedFeats", false);

    if (NarrativeSeedsSettings.shouldShowNotifications()) {
      ui.notifications.info("All settings reset to defaults");
    }
    this.render();
  }

  async _updateObject(event, formData) {
    // Update all settings
    for (const [key, value] of Object.entries(formData)) {
      await game.settings.set("pf2e-narrative-seeds", key, value);
    }

    if (NarrativeSeedsSettings.shouldShowNotifications()) {
      ui.notifications.info("PF2e Narrative Seeds settings saved");
    }
  }
}
