/**
 * PF2e Narrative Seeds - Social Formatter
 * Formats NPC personalities into chat messages
 */

import { StringUtils } from '../utils.js';
import { NarrativeSeedsSettings } from '../settings.js';

/**
 * Social encounter formatter
 */
export class SocialFormatter {

  /**
   * Generate HTML for NPC personality card
   * @param {Object} seed - NPC seed data
   * @returns {string} HTML string
   */
  static generateHTML(seed) {
    const { detailLevel } = seed;

    // Build HTML based on detail level
    if (detailLevel === "minimal") {
      return this.generateMinimalHTML(seed);
    } else if (detailLevel === "cinematic") {
      return this.generateCinematicHTML(seed);
    } else {
      return this.generateStandardHTML(seed);
    }
  }

  /**
   * Generate minimal HTML - compact display
   * @param {Object} seed
   * @returns {string}
   */
  static generateMinimalHTML(seed) {
    const { mood, personalities, actor } = seed;

    const actorName = actor?.name || "NPC";
    const personalityText = personalities.map(p => p.name).join(", ");

    return `
      <div class="pf2e-narrative-seed npc-minimal">
        <span class="narrative-icon">🎭</span>
        <strong>${StringUtils.escapeHTML(actorName)}:</strong>
        <span class="npc-mood">${mood.name}</span>
        ${personalities.length > 0 ? `• ${StringUtils.escapeHTML(personalityText)}` : ''}
        <button class="regenerate-icon" data-action="regenerate-npc" title="Generate new personality">🔄</button>
      </div>
    `;
  }

  /**
   * Generate standard HTML
   * @param {Object} seed
   * @returns {string}
   */
  static generateStandardHTML(seed) {
    const { mood, personalities, mannerisms, motivation, quirks, actor } = seed;

    const actorName = actor?.name || "NPC";
    const moodClass = this.getMoodClass(mood.id);

    // Build personality traits section
    const personalitiesHTML = personalities.length > 0
      ? `<div class="npc-section">
           <strong>Personality:</strong> ${personalities.map(p => `<span class="trait">${p.name}</span>`).join(', ')}
         </div>`
      : '';

    // Build mannerisms section
    const mannerismsHTML = mannerisms.length > 0
      ? `<div class="npc-section">
           <strong>Mannerisms:</strong> ${mannerisms.map(m => StringUtils.escapeHTML(m.description)).join('; ')}
         </div>`
      : '';

    // Build motivation section
    const motivationHTML = `
      <div class="npc-section npc-motivation">
        <strong>Motivation:</strong> ${StringUtils.escapeHTML(motivation.name)}
        <div class="gm-guidance">
          <em>GM:</em> ${StringUtils.escapeHTML(motivation.gmGuidance)}
        </div>
      </div>
    `;

    // Build quirks section (if any)
    const quirksHTML = quirks.length > 0
      ? `<div class="npc-section">
           <strong>Quirk:</strong> ${quirks.map(q => StringUtils.escapeHTML(q.description)).join('; ')}
         </div>`
      : '';

    // Social DC modifier
    const dcModifier = mood.socialDC;
    const dcHTML = dcModifier !== 0
      ? `<div class="npc-dc-modifier ${dcModifier > 0 ? 'dc-harder' : 'dc-easier'}">
           Social DC: ${dcModifier > 0 ? '+' : ''}${dcModifier}
         </div>`
      : '';

    return `
      <div class="pf2e-narrative-seed npc-card">
        <div class="npc-header">
          <span class="npc-icon">🎭</span>
          <span class="npc-name">${StringUtils.escapeHTML(actorName)}</span>
          <span class="npc-mood ${moodClass}">${mood.name}</span>
          <button class="regenerate-btn" title="Regenerate personality">♻️</button>
        </div>
        ${dcHTML}
        ${personalitiesHTML}
        ${mannerismsHTML}
        ${motivationHTML}
        ${quirksHTML}
      </div>
    `;
  }

  /**
   * Generate cinematic HTML - expanded detail
   * @param {Object} seed
   * @returns {string}
   */
  static generateCinematicHTML(seed) {
    const { mood, personalities, mannerisms, motivation, quirks, actor } = seed;

    const actorName = actor?.name || "NPC";
    const moodClass = this.getMoodClass(mood.id);

    // Build personality traits section with descriptions
    const personalitiesHTML = personalities.length > 0
      ? `<div class="npc-section npc-personalities">
           <strong>Personality:</strong>
           <ul class="trait-list">
             ${personalities.map(p => `<li><strong>${p.name}:</strong> ${StringUtils.escapeHTML(p.description)}</li>`).join('')}
           </ul>
         </div>`
      : '';

    // Build mannerisms section categorized
    const mannerismsHTML = mannerisms.length > 0
      ? `<div class="npc-section npc-mannerisms">
           <strong>Mannerisms:</strong>
           <ul class="trait-list">
             ${mannerisms.map(m => `<li>${StringUtils.escapeHTML(m.description)}</li>`).join('')}
           </ul>
         </div>`
      : '';

    // Build motivation section with full guidance
    const motivationHTML = `
      <div class="npc-section npc-motivation">
        <strong>Motivation:</strong> ${StringUtils.escapeHTML(motivation.name)}
        <p class="motivation-description">${StringUtils.escapeHTML(motivation.description)}</p>
        <div class="gm-guidance">
          <strong>GM Guidance:</strong> ${StringUtils.escapeHTML(motivation.gmGuidance)}
        </div>
      </div>
    `;

    // Build quirks section with categories
    const quirksHTML = quirks.length > 0
      ? `<div class="npc-section npc-quirks">
           <strong>Quirk${quirks.length > 1 ? 's' : ''}:</strong>
           <ul class="trait-list">
             ${quirks.map(q => `<li>${StringUtils.escapeHTML(q.description)} <span class="quirk-category">(${q.category})</span></li>`).join('')}
           </ul>
         </div>`
      : '';

    // Social DC modifier with expanded explanation
    const dcModifier = mood.socialDC;
    const dcHTML = dcModifier !== 0
      ? `<div class="npc-dc-modifier ${dcModifier > 0 ? 'dc-harder' : 'dc-easier'}">
           <strong>Social DC Modifier:</strong> ${dcModifier > 0 ? '+' : ''}${dcModifier}
           <span class="dc-explanation">(${mood.description})</span>
         </div>`
      : `<div class="npc-dc-modifier dc-neutral">
           <strong>Social DC:</strong> Normal (${mood.description})
         </div>`;

    // Suggested attitudes
    const attitudesHTML = mood.attitudes.length > 0
      ? `<div class="npc-attitudes">
           <strong>Likely Attitudes:</strong> ${mood.attitudes.map(a => StringUtils.capitalize(a)).join(', ')}
         </div>`
      : '';

    return `
      <div class="pf2e-narrative-seed npc-card cinematic">
        <div class="npc-header">
          <span class="npc-icon">🎭</span>
          <span class="npc-name">${StringUtils.escapeHTML(actorName)}</span>
          <span class="npc-mood ${moodClass}">${mood.name}</span>
          <button class="regenerate-btn" title="Regenerate personality">♻️</button>
        </div>
        <div class="npc-mood-description">${mood.description}</div>
        ${dcHTML}
        ${attitudesHTML}
        ${personalitiesHTML}
        ${mannerismsHTML}
        ${motivationHTML}
        ${quirksHTML}
      </div>
    `;
  }

  /**
   * Get CSS class for mood
   * @param {string} moodId
   * @returns {string}
   */
  static getMoodClass(moodId) {
    const moodMap = {
      'hostile': 'mood-hostile',
      'suspicious': 'mood-suspicious',
      'guarded': 'mood-guarded',
      'fearful': 'mood-fearful',
      'irritated': 'mood-irritated',
      'nervous': 'mood-nervous',
      'indifferent': 'mood-indifferent',
      'neutral': 'mood-neutral',
      'distracted': 'mood-neutral',
      'calculating': 'mood-neutral',
      'bored': 'mood-neutral',
      'curious': 'mood-curious',
      'friendly': 'mood-friendly',
      'eager': 'mood-friendly',
      'jovial': 'mood-friendly',
      'melancholic': 'mood-melancholic'
    };

    return moodMap[moodId] || 'mood-neutral';
  }

  /**
   * Create a chat message with NPC personality
   * @param {Object} seed - NPC seed
   * @param {Object} options - Chat message options
   * @returns {Promise<ChatMessage>}
   */
  static async createChatCard(seed, options = {}) {
    const html = this.generateHTML(seed);

    const messageData = {
      content: html,
      speaker: options.speaker || ChatMessage.getSpeaker({ alias: "NPC Generator" }),
      whisper: options.whisper || [],
      flags: {
        "pf2e-narrative-seeds": {
          type: "npc",
          seed: seed
        }
      }
    };

    return ChatMessage.create(messageData);
  }
}
