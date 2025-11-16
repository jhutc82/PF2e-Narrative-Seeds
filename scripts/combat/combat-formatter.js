/**
 * PF2e Narrative Seeds - Combat Formatter
 * Formats combat narratives into chat messages
 */

import { ChatUtils, StringUtils } from '../utils.js';
import { NarrativeSeedsSettings } from '../settings.js';
import { ComplicationManager } from './complication-manager.js';

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
   * Generate minimal HTML
   * @param {string} description
   * @returns {string}
   */
  static generateMinimalHTML(description) {
    const escapedDescription = StringUtils.escapeHTML(description);
    return `
      <div class="pf2e-narrative-seed combat-seed minimal">
        <div class="seed-description">
          <p>${escapedDescription}</p>
        </div>
        <div class="seed-actions minimal">
          <button class="seed-button regenerate-button" data-action="regenerate" title="Generate a new narrative description">
            🔄 Regenerate
          </button>
        </div>
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
      outcome
    } = seed;

    const escapedDescription = StringUtils.escapeHTML(description);
    const escapedAnatomyDisplay = StringUtils.escapeHTML(anatomyDisplay);
    const escapedTargetName = StringUtils.escapeHTML(targetName);
    const escapedAttackerName = StringUtils.escapeHTML(attackerName);
    const complicationHTML = this.generateComplicationHTML(complication, outcome);

    return `
      <div class="pf2e-narrative-seed combat-seed">
        <header class="seed-header">
          <h3>⚔️ Combat Narrative Seed</h3>
          ${anatomyDisplay ? `<span class="anatomy-tag">[${escapedAnatomyDisplay}]</span>` : ''}
        </header>
        <div class="seed-content">
          <div class="seed-metadata">
            <span class="attacker"><strong>Attacker:</strong> ${escapedAttackerName}</span>
            <span class="target"><strong>Target:</strong> ${escapedTargetName}</span>
            <span class="outcome ${outcomeClass}"><strong>Outcome:</strong> ${outcomeFormatted}</span>
          </div>
          <hr>
          <div class="seed-description">
            <p>${escapedDescription}</p>
          </div>
          ${complicationHTML}
          <div class="seed-actions">
            <button class="seed-button regenerate-button" data-action="regenerate" title="Generate a new narrative description">
              🔄 Regenerate
            </button>
          </div>
        </div>
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
      outcome
    } = seed;

    const damageTypeDisplay = StringUtils.capitalizeFirst(damageType);
    const escapedDescription = StringUtils.escapeHTML(description);
    const escapedAnatomyDisplay = StringUtils.escapeHTML(anatomyDisplay);
    const escapedTargetName = StringUtils.escapeHTML(targetName);
    const escapedAttackerName = StringUtils.escapeHTML(attackerName);
    const escapedDamageTypeDisplay = StringUtils.escapeHTML(damageTypeDisplay);
    const complicationHTML = this.generateComplicationHTML(complication, outcome);

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

    // Encode complication data for the button
    const complicationData = JSON.stringify(complication);
    const escapedData = StringUtils.escapeHTML(complicationData);

    return `
      <div class="seed-complication">
        <div class="complication-header">
          <span class="complication-icon">⚠️</span>
          <span class="complication-name">${escapedName}</span>
          <span class="complication-duration">(${durationText})</span>
        </div>
        <div class="complication-description">
          ${escapedDescription}
        </div>
        <div class="complication-actions">
          <button
            class="seed-button apply-complication-button"
            data-action="apply-complication"
            data-complication='${escapedData}'
            data-outcome="${outcome}"
            title="Apply this effect to the ${targetDesc}">
            ✨ Apply to ${StringUtils.capitalizeFirst(targetDesc)}
          </button>
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
