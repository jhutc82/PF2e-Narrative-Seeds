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
    const autoApply = NarrativeSeedsSettings.get("autoApplyComplications", false);
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

    const autoApply = NarrativeSeedsSettings.get("autoApplyComplications", false);
    const escapedDescription = StringUtils.escapeHTML(description);
    const complicationHTML = complication ? this.generateComplicationHTML(complication, outcome) : '';
    const dismembermentHTML = dismemberment ? this.generateDismembermentHTML(dismemberment) : '';
    const regenerateButton = autoApply ? '' : '<button class="regenerate-btn" title="Regenerate narrative">♻️</button>';

    // Debug logging
    console.log("PF2e Narrative Seeds | Generating HTML with:", {
      hasComplication: !!complication,
      hasDismemberment: !!dismemberment,
      complicationHTML: complicationHTML.substring(0, 100),
      dismembermentHTML: dismembermentHTML.substring(0, 100)
    });

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

    const autoApply = NarrativeSeedsSettings.get("autoApplyComplications", false);
    const escapedName = StringUtils.escapeHTML(complication.name);
    const escapedDescription = StringUtils.escapeHTML(complication.description || '');
    const durationText = complication.duration
      ? `${complication.duration} round${complication.duration > 1 ? 's' : ''}`
      : 'Permanent';

    // Get mechanical effect details
    let mechanics = '';
    let effectTitle = escapedName;

    if (complication.effect) {
      const effect = complication.effect;

      switch (effect.type) {
        case 'condition':
          const condName = StringUtils.capitalizeFirst(effect.condition);
          effectTitle = effect.value ? `${condName} ${effect.value}` : condName;
          mechanics = this.getConditionMechanics(effect.condition, effect.value || '');
          break;

        case 'persistent-damage':
          effectTitle = `${effect.value} ${effect.damageType} Persistent`;
          mechanics = `Take ${effect.value} ${effect.damageType} damage at the end of your turn (DC ${effect.dc} flat check to end)`;
          break;

        case 'penalty':
          effectTitle = `${effect.value} ${effect.stat}`;
          mechanics = `${effect.value} circumstance penalty to ${effect.stat}`;
          break;

        case 'speed-penalty':
          effectTitle = `${effect.value}ft Speed Penalty`;
          mechanics = `${effect.value}-foot penalty to ${effect.movementType || 'all movement speeds'}`;
          break;
      }
    }

    // If auto-apply is enabled, show effect was applied automatically
    const applyButton = autoApply
      ? '<span class="auto-applied" title="Automatically applied">✓ Applied</span>'
      : `<button class="apply-btn" data-action="apply-complication" title="Apply ${escapedName}">Apply Effect</button>`;

    // Effect box with clear mechanical details
    return `
      <div class="effect-box complication">
        <div class="effect-header">
          <strong>${effectTitle}</strong> <span class="effect-duration">(${durationText})</span>
        </div>
        ${mechanics ? `<div class="effect-mechanics">${mechanics}</div>` : ''}
        ${escapedDescription ? `<div class="effect-description">${escapedDescription}</div>` : ''}
        <div class="effect-actions">
          ${applyButton}
        </div>
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

    // Build mechanical effects list
    const effects = [];

    if (dismemberment.effect?.condition) {
      const condition = dismemberment.effect.condition;
      const value = dismemberment.effect.value || '';
      const conditionName = StringUtils.capitalizeFirst(condition);
      const mechanics = this.getConditionMechanics(condition, value);
      effects.push({
        name: value ? `${conditionName} ${value}` : conditionName,
        mechanics: mechanics
      });
    } else if (dismemberment.conditionSlug) {
      const mechanics = this.getConditionMechanics(dismemberment.conditionSlug, '');
      effects.push({
        name: StringUtils.capitalizeFirst(dismemberment.conditionSlug),
        mechanics: mechanics
      });
    }

    if (dismemberment.penalties && dismemberment.penalties.length > 0) {
      dismemberment.penalties.forEach(penalty => {
        effects.push({
          name: `${penalty.value} ${penalty.stat}`,
          mechanics: `Permanent penalty to ${penalty.stat}`
        });
      });
    }

    // Build effects HTML
    const effectsHTML = effects.map(effect =>
      `<div class="dismemberment-effect">
        <strong>${effect.name}:</strong> ${effect.mechanics}
      </div>`
    ).join('');

    // Dismemberment box with clear warning and mechanics
    return `
      <div class="effect-box dismemberment permanent">
        <div class="effect-header permanent-warning">
          <strong>⚠️ PERMANENT INJURY: ${escapedName}</strong>
        </div>
        <div class="effect-description">${escapedDescription}</div>
        <div class="effect-mechanics-list">
          <div class="mechanics-title">Permanent Mechanical Effects:</div>
          ${effectsHTML}
          <div class="permanence-notice">These effects are PERMANENT and cannot be removed without special healing (Regenerate spell, etc.)</div>
        </div>
        <div class="effect-actions">
          <button class="apply-btn danger" data-action="apply-dismemberment" title="Apply ${escapedName} (PERMANENT)">⚠️ Apply Permanent Injury</button>
        </div>
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
      style: CONST.CHAT_MESSAGE_STYLES.IC
    });
  }

  /**
   * Copy text to clipboard
   * @param {string} text
   */
  static copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof ui !== 'undefined' && ui.notifications) {
          ui.notifications.info("Copied to clipboard!");
        }
      }).catch(err => {
        console.error("Failed to copy:", err);
        if (typeof ui !== 'undefined' && ui.notifications) {
          ui.notifications.error("Failed to copy to clipboard");
        }
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';

      try {
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        if (typeof ui !== 'undefined' && ui.notifications) {
          ui.notifications.info("Copied to clipboard!");
        }
      } catch (err) {
        console.error("Failed to copy:", err);
        if (typeof ui !== 'undefined' && ui.notifications) {
          ui.notifications.error("Failed to copy to clipboard");
        }
      } finally {
        // Safely remove textArea even if appendChild failed
        if (textArea.parentNode) {
          document.body.removeChild(textArea);
        }
      }
    }
  }
}
