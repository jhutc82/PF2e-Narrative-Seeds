/**
 * PF2e Narrative Seeds - Combat Formatter
 * Formats combat narratives into chat messages
 */

import { ChatUtils, StringUtils } from '../utils.js';
import { NarrativeSeedsSettings } from '../settings.js';
import { ComplicationManager } from './complication-manager.js';
import { DismembermentManager } from './dismemberment-manager.js';

/**
 * Combat narrative formatter
 */
export class CombatFormatter {

  /**
   * Create and send a combat narrative chat card
   * @param {Object} seed - Narrative seed data
   * @param {Object} options - Additional options
   * @returns {Promise<ChatMessage>}
   */
  static async createChatCard(seed, options = {}) {
    const html = this.generateHTML(seed);

    const messageOptions = {
      whisper: options.whisper,
      actorId: options.actorId,
      flags: {
        type: "combat",
        anatomy: seed.anatomy,
        damageType: seed.damageType,
        outcome: seed.outcome
      }
    };

    return ChatUtils.sendMessage(html, messageOptions);
  }

  /**
   * Generate HTML for combat narrative card
   * @param {Object} seed
   * @returns {string}
   */
  static generateHTML(seed) {
    const {
      description,
      anatomy,
      anatomyDisplay,
      damageType,
      outcome,
      targetName,
      attackerName,
      detailLevel
    } = seed;

    const outcomeFormatted = StringUtils.formatOutcome(outcome);
    const outcomeClass = this.getOutcomeClass(outcome);

    // Build HTML based on detail level
    if (detailLevel === "minimal") {
      return this.generateMinimalHTML(description);
    } else if (detailLevel === "cinematic") {
      return this.generateCinematicHTML(seed, outcomeFormatted, outcomeClass);
    } else {
      return this.generateStandardHTML(seed, outcomeFormatted, outcomeClass);
    }
  }

  /**
   * Generate minimal HTML - compact inline display
   * @param {string} description
   * @returns {string}
   */
  static generateMinimalHTML(description) {
    const escapedDescription = StringUtils.escapeHTML(description);
    const autoApply = game.settings.get("pf2e-narrative-seeds", "autoApplyComplications");
    const regenerateButton = autoApply ? '' : '<button class="regenerate-icon" data-action="regenerate" title="Generate new narrative">🔄</button>';

    return `
      <div class="pf2e-narrative-seed minimal-inline">
        <span class="narrative-icon">⚔️</span>
        <span class="narrative-text">${escapedDescription}</span>
        ${regenerateButton}
      </div>
    `;
  }

  /**
   * Generate standard HTML
   * @param {Object} seed
   * @param {string} outcomeFormatted
   * @param {string} outcomeClass
   * @returns {string}
   */
  static generateStandardHTML(seed, outcomeFormatted, outcomeClass) {
    const {
      description,
      complication,
      dismemberment,
      outcome
    } = seed;

    const autoApply = game.settings.get("pf2e-narrative-seeds", "autoApplyComplications");
    const escapedDescription = StringUtils.escapeHTML(description);
    const complicationHTML = complication ? this.generateComplicationHTML(complication, outcome) : '';
    const dismembermentHTML = dismemberment ? this.generateDismembermentHTML(dismemberment) : '';
    const regenerateButton = autoApply ? '' : '<button class="regenerate-btn" title="Regenerate narrative">♻️</button>';

    // Simple box design - narrative text with regenerate button
    return `
      <div class="pf2e-narrative-seed simple-box">
        <div class="narrative-box">
          <span class="narrative-text">${escapedDescription}</span>
          ${regenerateButton}
        </div>
        ${complicationHTML}
        ${dismembermentHTML}
      </div>
    `;
  }

  /**
   * Generate cinematic HTML - now simplified to match standard
   * @param {Object} seed
   * @param {string} outcomeFormatted
   * @param {string} outcomeClass
   * @returns {string}
   */
  static generateCinematicHTML(seed, outcomeFormatted, outcomeClass) {
    // Use the same simple output for all detail levels
    return this.generateStandardHTML(seed, outcomeFormatted, outcomeClass);
  }

  /**
   * Get CSS class for outcome
   * @param {string} outcome
   * @returns {string}
   */
  static getOutcomeClass(outcome) {
    switch(outcome) {
      case "criticalSuccess":
        return "outcome-critical-success";
      case "success":
        return "outcome-success";
      case "failure":
        return "outcome-failure";
      case "criticalFailure":
        return "outcome-critical-failure";
      default:
        return "outcome-unknown";
    }
  }

  /**
   * Get mechanical description for a PF2e condition
   * @param {string} condition - Condition slug
   * @param {number} value - Condition value
   * @returns {string} Mechanical description
   */
  static getConditionMechanics(condition, value) {
    const val = value || '';
    const conditions = {
      'sickened': `${val} penalty to all checks and DCs`,
      'clumsy': `${val} penalty to AC, Reflex, and Dex-based checks`,
      'enfeebled': `${val} penalty to Str-based checks and DCs`,
      'stupefied': `${val} penalty to Int/Wis/Cha checks and DCs`,
      'drained': `${val} penalty to Constitution-based checks; max HP reduced`,
      'off-guard': `-2 circumstance penalty to AC`,
      'flat-footed': `-2 circumstance penalty to AC`,
      'frightened': `${val} penalty to all checks and DCs`,
      'stunned': `Lose ${val} action${val > 1 ? 's' : ''}`,
      'slowed': `Lose ${val} action${val > 1 ? 's' : ''} each turn`,
      'blinded': `All targets are hidden; -4 to Perception`,
      'deafened': `-2 to Perception; can't use auditory abilities`,
      'confused': `Attack random target or babble`,
      'fascinated': `-2 to Perception and can't use reactions`,
      'prone': `-2 to attack; melee attacks get +2; ranged get -2`,
      'grabbed': `Immobilized and flat-footed`,
      'immobilized': `Cannot move; flat-footed (-2 AC)`,
      'paralyzed': `Helpless and flat-footed`,
      'restrained': `Immobilized and flat-footed; -2 to attacks`,
      'persistent-damage': `Take ${val} damage at end of turn`
    };
    return conditions[condition] || condition;
  }

  /**
   * Generate HTML for complication display
   * @param {Object} complication - Complication data
   * @param {string} outcome - Outcome type to determine target
   * @returns {string} HTML for complication or empty string
   */
  static generateComplicationHTML(complication, outcome) {
    if (!complication) return '';

    const autoApply = game.settings.get("pf2e-narrative-seeds", "autoApplyComplications");
    const escapedName = StringUtils.escapeHTML(complication.name);
    const durationText = complication.duration
      ? `${complication.duration}r`
      : '';

    // Get mechanical effect from effect object
    let mechanicalEffect = '';
    if (complication.effect?.condition) {
      const condition = complication.effect.condition;
      const value = complication.effect.value || '';
      const mechanics = this.getConditionMechanics(condition, value);
      mechanicalEffect = `${StringUtils.capitalizeFirst(condition)} ${value}`.trim();
      if (durationText) mechanicalEffect += ` (${durationText})`;
      mechanicalEffect += `: ${mechanics}`;
    } else if (complication.conditionSlug) {
      // Fallback to old format
      const value = complication.conditionValue || '';
      const mechanics = this.getConditionMechanics(complication.conditionSlug, value);
      mechanicalEffect = `${StringUtils.capitalizeFirst(complication.conditionSlug)} ${value}`.trim();
      if (durationText) mechanicalEffect += ` (${durationText})`;
      mechanicalEffect += `: ${mechanics}`;
    } else {
      mechanicalEffect = escapedName;
    }

    // If auto-apply is enabled, show effect was applied automatically
    const applyButton = autoApply
      ? '<span class="auto-applied" title="Automatically applied">✓ Applied</span>'
      : `<button class="apply-btn" data-action="apply-complication" title="Apply ${escapedName}">✓</button>`;

    // Simple effect box with icon-only apply button
    return `
      <div class="effect-box">
        <div class="effect-info">
          <span class="effect-text">${mechanicalEffect}</span>
        </div>
        ${applyButton}
      </div>
    `;
  }

  /**
   * Generate HTML for dismemberment display
   * @param {Object} dismemberment - Dismemberment data
   * @returns {string} HTML for dismemberment or empty string
   */
  static generateDismembermentHTML(dismemberment) {
    if (!dismemberment) return '';

    const escapedName = StringUtils.escapeHTML(dismemberment.name);
    const escapedDescription = StringUtils.escapeHTML(dismemberment.description);

    // Build mechanical effect description
    let mechanicalEffect = 'PERMANENT: ';
    const effects = [];

    if (dismemberment.effect?.condition) {
      const condition = dismemberment.effect.condition;
      const value = dismemberment.effect.value || '';
      effects.push(`${StringUtils.capitalizeFirst(condition)} ${value}`.trim());
    } else if (dismemberment.conditionSlug) {
      effects.push(`${dismemberment.conditionSlug}`);
    }

    if (dismemberment.penalties && dismemberment.penalties.length > 0) {
      dismemberment.penalties.forEach(penalty => {
        effects.push(`${penalty.value} ${penalty.stat}`);
      });
    }

    if (effects.length > 0) {
      mechanicalEffect += effects.join(', ');
    } else {
      mechanicalEffect += escapedDescription;
    }

    // Simple effect box with icon-only apply button (red theme for permanent)
    return `
      <div class="effect-box permanent">
        <div class="effect-info">
          <span class="effect-text">${mechanicalEffect}</span>
        </div>
        <button class="apply-btn danger" data-action="apply-dismemberment" title="Apply ${escapedName} (PERMANENT)">💀</button>
      </div>
    `;
  }

  /**
   * Narrate description to chat
   * @param {string} description
   */
  static async narrateToChat(description) {
    await ChatMessage.create({
      content: description,
      type: CONST.CHAT_MESSAGE_TYPES.IC
    });
  }

  /**
   * Copy text to clipboard
   * @param {string} text
   */
  static copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        ui.notifications.info("Copied to clipboard!");
      }).catch(err => {
        console.error("Failed to copy:", err);
        ui.notifications.error("Failed to copy to clipboard");
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        ui.notifications.info("Copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
        ui.notifications.error("Failed to copy to clipboard");
      }
      document.body.removeChild(textArea);
    }
  }
}
