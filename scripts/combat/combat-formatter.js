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
    return `
      <div class="pf2e-narrative-seed minimal-inline">
        <span class="narrative-icon">⚔️</span>
        <span class="narrative-text">${escapedDescription}</span>
        <button class="regenerate-icon" data-action="regenerate" title="Generate new narrative">🔄</button>
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
      anatomyDisplay,
      targetName,
      attackerName,
      complication,
      dismemberment,
      outcome
    } = seed;

    const escapedDescription = StringUtils.escapeHTML(description);
    const escapedAnatomyDisplay = StringUtils.escapeHTML(anatomyDisplay);
    const escapedTargetName = StringUtils.escapeHTML(targetName);
    const escapedAttackerName = StringUtils.escapeHTML(attackerName);
    const complicationHTML = complication ? this.generateComplicationHTML(complication, outcome) : '';
    const dismembermentHTML = dismemberment ? this.generateDismembermentHTML(dismemberment) : '';

    // Compact collapsible design
    return `
      <div class="pf2e-narrative-seed compact-card">
        <div class="narrative-summary">
          <span class="narrative-icon">⚔️</span>
          <span class="narrative-brief">${escapedDescription}</span>
          <button class="regenerate-icon" data-action="regenerate" title="Generate new narrative">🔄</button>
          ${complicationHTML || dismembermentHTML ? '<button class="toggle-details" data-action="toggle-details" title="Show details">▼</button>' : ''}
        </div>
        ${complicationHTML || dismembermentHTML ? `
        <div class="narrative-details" style="display: none;">
          ${complicationHTML}
          ${dismembermentHTML}
        </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate cinematic HTML
   * @param {Object} seed
   * @param {string} outcomeFormatted
   * @param {string} outcomeClass
   * @returns {string}
   */
  static generateCinematicHTML(seed, outcomeFormatted, outcomeClass) {
    const {
      description,
      anatomyDisplay,
      damageType,
      targetName,
      attackerName,
      complication,
      dismemberment,
      outcome
    } = seed;

    const damageTypeDisplay = StringUtils.capitalizeFirst(damageType);
    const escapedDescription = StringUtils.escapeHTML(description);
    const escapedAnatomyDisplay = StringUtils.escapeHTML(anatomyDisplay);
    const escapedTargetName = StringUtils.escapeHTML(targetName);
    const escapedAttackerName = StringUtils.escapeHTML(attackerName);
    const escapedDamageTypeDisplay = StringUtils.escapeHTML(damageTypeDisplay);
    const complicationHTML = this.generateComplicationHTML(complication, outcome);
    const dismembermentHTML = this.generateDismembermentHTML(dismemberment);

    return `
      <div class="pf2e-narrative-seed combat-seed cinematic">
        <header class="seed-header cinematic">
          <h3>⚔️ Combat Narrative Seed 🎬</h3>
          ${anatomyDisplay ? `<span class="anatomy-tag">[${escapedAnatomyDisplay}]</span>` : ''}
        </header>
        <div class="seed-content">
          <div class="seed-metadata cinematic">
            <div class="metadata-row">
              <span class="attacker"><strong>Attacker:</strong> ${escapedAttackerName}</span>
              <span class="target"><strong>Target:</strong> ${escapedTargetName}</span>
            </div>
            <div class="metadata-row">
              <span class="damage-type"><strong>Damage:</strong> ${escapedDamageTypeDisplay}</span>
              <span class="outcome ${outcomeClass}"><strong>Outcome:</strong> ${outcomeFormatted}</span>
            </div>
          </div>
          <hr>
          <div class="seed-description cinematic">
            <p>${escapedDescription}</p>
          </div>
          ${complicationHTML}
          ${dismembermentHTML}
          <div class="seed-actions">
            <button class="seed-button regenerate-button" data-action="regenerate" title="Generate a new narrative description">
              🔄 Regenerate
            </button>
            <button class="seed-button narrate-button" data-action="narrate" title="Send description as in-character message">
              💡 Narrate Now
            </button>
            <button class="seed-button copy-button" data-action="copy" title="Copy description to clipboard">
              📋 Copy
            </button>
          </div>
        </div>
      </div>
    `;
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
   * Generate HTML for complication display
   * @param {Object} complication - Complication data
   * @param {string} outcome - Outcome type to determine target
   * @returns {string} HTML for complication or empty string
   */
  static generateComplicationHTML(complication, outcome) {
    if (!complication) return '';

    const escapedName = StringUtils.escapeHTML(complication.name);
    const escapedDescription = StringUtils.escapeHTML(complication.description);
    const targetDesc = ComplicationManager.getTargetDescription(outcome);
    const durationText = complication.duration
      ? `${complication.duration} round${complication.duration > 1 ? 's' : ''}`
      : 'until recovered';

    // Complication data is stored in message flags, no need to encode in HTML
    return `
      <div class="seed-complication">
        <strong>⚠️ ${escapedName}</strong> (${durationText}): ${escapedDescription}
        <button class="apply-effect-btn" data-action="apply-complication" title="Apply this effect">✨</button>
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

    // Dismemberment data is stored in message flags, no need to encode in HTML
    return `
      <div class="seed-dismemberment">
        <strong>💀 PERMANENT: ${escapedName}</strong> - ${escapedDescription}
        <button class="apply-effect-btn danger" data-action="apply-dismemberment" title="Apply permanent injury">💀</button>
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
