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
    const { name, ancestry, mood, personalities, occupation, actor } = seed;

    const displayName = name || actor?.name || "NPC";
    const personalityText = personalities.map(p => p.name).join(", ");
    const occupationText = occupation ? ` • ${occupation.profession.name}` : '';

    return `
      <div class="pf2e-narrative-seed npc-minimal">
        <span class="narrative-icon">🎭</span>
        <strong>${StringUtils.escapeHTML(displayName)}:</strong>
        <span class="npc-mood">${mood.name}</span>
        ${personalities.length > 0 ? `• ${StringUtils.escapeHTML(personalityText)}` : ''}${occupationText}
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
    const { name, ancestry, mood, personalities, mannerisms, motivation, quirks, appearance, occupation, abilities, possessions, relationships, plotHooks, influence, actor } = seed;

    const displayName = name || actor?.name || "NPC";
    const moodClass = this.getMoodClass(mood.id);
    const ancestryDisplay = ancestry ? ` (${StringUtils.capitalize(ancestry)})` : '';

    // Build appearance section
    const appearanceHTML = appearance ? this.formatAppearance(appearance, "standard") : '';

    // Build occupation section
    const occupationHTML = occupation ? this.formatOccupation(occupation, abilities, "standard") : '';

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

    // Build possessions section
    const possessionsHTML = possessions ? this.formatPossessions(possessions, "standard") : '';

    // Build relationships section
    const relationshipsHTML = relationships ? this.formatRelationships(relationships, "standard") : '';

    // Build plot hooks section
    const plotHooksHTML = plotHooks ? this.formatPlotHooks(plotHooks, "standard") : '';

    // Build influence section
    const influenceHTML = influence ? this.formatInfluence(influence, "standard") : '';

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
          <span class="npc-name">${StringUtils.escapeHTML(displayName)}${ancestryDisplay}</span>
          <span class="npc-mood ${moodClass}">${mood.name}</span>
          <button class="regenerate-btn" title="Regenerate personality">♻️</button>
        </div>
        ${dcHTML}
        ${appearanceHTML}
        ${occupationHTML}
        ${personalitiesHTML}
        ${mannerismsHTML}
        ${motivationHTML}
        ${quirksHTML}
        ${possessionsHTML}
        ${relationshipsHTML}
        ${plotHooksHTML}
        ${influenceHTML}
      </div>
    `;
  }

  /**
   * Generate cinematic HTML - expanded detail
   * @param {Object} seed
   * @returns {string}
   */
  static generateCinematicHTML(seed) {
    const { name, ancestry, mood, personalities, mannerisms, motivation, quirks, appearance, occupation, abilities, possessions, relationships, plotHooks, influence, actor } = seed;

    const displayName = name || actor?.name || "NPC";
    const moodClass = this.getMoodClass(mood.id);
    const ancestryDisplay = ancestry ? ` (${StringUtils.capitalize(ancestry)})` : '';

    // Build appearance section
    const appearanceHTML = appearance ? this.formatAppearance(appearance, "cinematic") : '';

    // Build occupation section
    const occupationHTML = occupation ? this.formatOccupation(occupation, abilities, "cinematic") : '';

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

    // Build possessions section
    const possessionsHTML = possessions ? this.formatPossessions(possessions, "cinematic") : '';

    // Build relationships section
    const relationshipsHTML = relationships ? this.formatRelationships(relationships, "cinematic") : '';

    // Build plot hooks section
    const plotHooksHTML = plotHooks ? this.formatPlotHooks(plotHooks, "cinematic") : '';

    // Build influence section
    const influenceHTML = influence ? this.formatInfluence(influence, "cinematic") : '';

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
          <span class="npc-name">${StringUtils.escapeHTML(displayName)}${ancestryDisplay}</span>
          <span class="npc-mood ${moodClass}">${mood.name}</span>
          <button class="regenerate-btn" title="Regenerate personality">♻️</button>
        </div>
        <div class="npc-mood-description">${mood.description}</div>
        ${dcHTML}
        ${attitudesHTML}
        ${appearanceHTML}
        ${occupationHTML}
        ${personalitiesHTML}
        ${mannerismsHTML}
        ${motivationHTML}
        ${quirksHTML}
        ${possessionsHTML}
        ${relationshipsHTML}
        ${plotHooksHTML}
        ${influenceHTML}
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

  /**
   * Format appearance section
   * @param {Object} appearance - Appearance data
   * @param {string} detailLevel - Detail level
   * @returns {string} HTML string
   */
  static formatAppearance(appearance, detailLevel) {
    if (!appearance) return '';

    const parts = [];

    // Basic description
    parts.push(`${appearance.age.name}, ${appearance.height.name}, ${appearance.build.name}`);

    // Coloring
    const colorParts = [];
    if (appearance.hairColor) colorParts.push(`${appearance.hairColor.name} hair`);
    if (appearance.eyeColor) colorParts.push(`${appearance.eyeColor.name} eyes`);
    if (appearance.skinTone) colorParts.push(`${appearance.skinTone.name} skin`);

    if (colorParts.length > 0) {
      parts.push(colorParts.join(', '));
    }

    // Distinguishing features
    if (appearance.distinguishingFeatures && appearance.distinguishingFeatures.length > 0) {
      const features = appearance.distinguishingFeatures
        .map(f => f.description.toLowerCase())
        .join(', ');
      parts.push(features);
    }

    if (detailLevel === "cinematic") {
      return `
        <div class="npc-section npc-appearance">
          <strong>Appearance:</strong> ${StringUtils.escapeHTML(parts.join('; '))}
        </div>
      `;
    } else {
      return `
        <div class="npc-section">
          <strong>Appearance:</strong> ${StringUtils.escapeHTML(parts.join('; '))}
        </div>
      `;
    }
  }

  /**
   * Format occupation section
   * @param {Object} occupation - Occupation data
   * @param {Object} abilities - Abilities data
   * @param {string} detailLevel - Detail level
   * @returns {string} HTML string
   */
  static formatOccupation(occupation, abilities, detailLevel) {
    if (!occupation) return '';

    const profession = occupation.profession;
    const socialClass = occupation.socialClass;
    const level = abilities?.level || 0;

    if (detailLevel === "cinematic") {
      const skillsList = abilities?.skills?.length > 0
        ? `<div class="npc-skills">
             <strong>Notable Skills:</strong> ${abilities.skills.map(s => s.name).join(', ')}
           </div>`
        : '';

      return `
        <div class="npc-section npc-occupation">
          <strong>Occupation:</strong> ${StringUtils.escapeHTML(profession.name)} (${StringUtils.escapeHTML(socialClass.name)})
          <div class="occupation-description">${StringUtils.escapeHTML(profession.description)}</div>
          <div class="npc-level"><strong>Level:</strong> ${level} (${abilities?.levelRange?.name || 'Unknown'})</div>
          <div class="npc-abilities"><strong>Abilities:</strong> ${StringUtils.escapeHTML(abilities?.abilityProfile?.name || 'Average')}</div>
          ${skillsList}
        </div>
      `;
    } else {
      const skillsText = abilities?.skills?.length > 0
        ? ` | Skills: ${abilities.skills.map(s => s.name).join(', ')}`
        : '';
      return `
        <div class="npc-section">
          <strong>Occupation:</strong> ${StringUtils.escapeHTML(profession.name)} (Level ${level})${skillsText}
        </div>
      `;
    }
  }

  /**
   * Format possessions section
   * @param {Object} possessions - Possessions data
   * @param {string} detailLevel - Detail level
   * @returns {string} HTML string
   */
  static formatPossessions(possessions, detailLevel) {
    if (!possessions) return '';

    const wealthText = `${possessions.wealthLevel.name} (${possessions.wealthLevel.coinRange})`;
    const items = possessions.carriedItems.map(i => i.name).join(', ');

    if (detailLevel === "cinematic") {
      const specialItemsHTML = possessions.specialItems?.length > 0
        ? `<div class="special-items">
             <strong>Special:</strong> ${possessions.specialItems.map(i =>
               `${i.name} - ${StringUtils.escapeHTML(i.description)}`
             ).join('; ')}
           </div>`
        : '';

      return `
        <div class="npc-section npc-possessions">
          <strong>Possessions:</strong>
          <div class="wealth-level"><strong>Wealth:</strong> ${StringUtils.escapeHTML(wealthText)}</div>
          <div class="carried-items"><strong>Carrying:</strong> ${StringUtils.escapeHTML(items)}</div>
          ${specialItemsHTML}
        </div>
      `;
    } else {
      return `
        <div class="npc-section">
          <strong>Possessions:</strong> ${StringUtils.escapeHTML(wealthText)} | ${StringUtils.escapeHTML(items)}
        </div>
      `;
    }
  }

  /**
   * Format relationships section
   * @param {Object} relationships - Relationships data
   * @param {string} detailLevel - Detail level
   * @returns {string} HTML string
   */
  static formatRelationships(relationships, detailLevel) {
    if (!relationships) return '';

    const parts = [];

    // Family status
    parts.push(`<strong>Family:</strong> ${relationships.familyStatus.name}`);

    // Family members
    if (relationships.family && relationships.family.length > 0) {
      const familyList = relationships.family.map(f => f.name).join(', ');
      parts.push(`<strong>Relations:</strong> ${familyList}`);
    }

    // Allies
    if (relationships.allies && relationships.allies.length > 0) {
      const alliesList = relationships.allies.map(a => a.name).join(', ');
      parts.push(`<strong>Allies:</strong> ${alliesList}`);
    }

    // Enemies
    if (relationships.enemies && relationships.enemies.length > 0) {
      const enemiesList = relationships.enemies.map(e => e.name).join(', ');
      parts.push(`<strong>Enemies:</strong> ${enemiesList}`);
    }

    // Organization
    if (relationships.organization) {
      parts.push(`<strong>Organization:</strong> ${relationships.organization.name} (${relationships.organization.status})`);
    }

    if (parts.length === 0) return '';

    if (detailLevel === "cinematic") {
      return `
        <div class="npc-section npc-relationships">
          <strong>Relationships:</strong>
          <div class="relationships-list">
            ${parts.map(p => `<div>${p}</div>`).join('')}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="npc-section">
          ${parts.join(' | ')}
        </div>
      `;
    }
  }

  /**
   * Format influence stat block
   * @param {Object} influence - Influence data
   * @param {string} detailLevel - Detail level
   * @returns {string} HTML string
   */
  static formatInfluence(influence, detailLevel) {
    if (!influence || detailLevel === "minimal") return '';

    // Basic influence info for standard
    if (detailLevel === "standard") {
      const bestSkill = influence.influenceSkills[0];
      const weaknessText = influence.weaknesses.length > 0 ? influence.weaknesses[0].name : "None evident";

      return `
        <div class="npc-section npc-influence">
          <strong>Influence:</strong> Best approach: ${bestSkill.name} (DC ${bestSkill.dc}) | Weakness: ${weaknessText}
        </div>
      `;
    }

    // Full influence stat block for cinematic
    const skillsList = influence.influenceSkills
      .map(s => `${s.name} (DC ${s.dc})`)
      .join(', ');

    const weaknessesList = influence.weaknesses
      .map(w => `<li><strong>${w.name}:</strong> ${StringUtils.escapeHTML(w.description)} (DC ${w.dcModifier < 0 ? w.dcModifier : '-' + Math.abs(w.dcModifier)})</li>`)
      .join('');

    const resistancesList = influence.resistances.length > 0
      ? `<div class="influence-resistances">
           <strong>Resistances:</strong>
           <ul class="trait-list">
             ${influence.resistances.map(r => `<li><strong>${r.name}:</strong> ${StringUtils.escapeHTML(r.description)} (DC +${r.dcModifier})</li>`).join('')}
           </ul>
         </div>`
      : '';

    const biasesList = influence.biases.length > 0
      ? `<div class="influence-biases">
           <strong>Biases:</strong>
           <ul class="trait-list">
             ${influence.biases.map(b => `<li><strong>${b.name}:</strong> ${StringUtils.escapeHTML(b.description)}</li>`).join('')}
           </ul>
         </div>`
      : '';

    const thresholdsList = influence.thresholds
      .map(t => `<li><strong>${t.points} Points (${StringUtils.capitalize(t.level)}):</strong> ${StringUtils.escapeHTML(t.description)}</li>`)
      .join('');

    const penaltyHTML = influence.penalty
      ? `<div class="influence-penalty">
           <strong>Penalty for ${StringUtils.escapeHTML(influence.penalty.name)}:</strong> ${StringUtils.escapeHTML(influence.penalty.effect)}
         </div>`
      : '';

    return `
      <div class="npc-section npc-influence-block">
        <strong>⚡ Influence Subsystem</strong>
        <div class="influence-stats">
          <div><strong>Perception:</strong> +${influence.perception} | <strong>Will:</strong> +${influence.will}</div>
          <div><strong>Discovery DC:</strong> ${influence.discovery.dc} (${influence.discovery.skills.map(s => s.name).join(', ')})</div>
          <div><strong>Rounds Available:</strong> ${influence.rounds}</div>
        </div>
        <div class="influence-skills">
          <strong>Influence Skills:</strong> ${skillsList}
        </div>
        <div class="influence-weaknesses">
          <strong>Weaknesses:</strong>
          <ul class="trait-list">
            ${weaknessesList}
          </ul>
        </div>
        ${resistancesList}
        ${biasesList}
        <div class="influence-thresholds">
          <strong>Influence Thresholds:</strong>
          <ul class="trait-list">
            ${thresholdsList}
          </ul>
        </div>
        ${penaltyHTML}
      </div>
    `;
  }

  /**
   * Format plot hooks section
   * @param {Object} plotHooks - Plot hooks data
   * @param {string} detailLevel - Detail level
   * @returns {string} HTML string
   */
  static formatPlotHooks(plotHooks, detailLevel) {
    if (!plotHooks || Object.keys(plotHooks).length === 0) return '';

    const hooks = [];

    if (plotHooks.secret) {
      hooks.push(`<strong>Secret:</strong> ${StringUtils.escapeHTML(plotHooks.secret.name)}`);
    }

    if (plotHooks.goal) {
      hooks.push(`<strong>Goal:</strong> ${StringUtils.escapeHTML(plotHooks.goal.name)}`);
    }

    if (plotHooks.conflict) {
      hooks.push(`<strong>Conflict:</strong> ${StringUtils.escapeHTML(plotHooks.conflict.name)}`);
    }

    if (plotHooks.questHook) {
      hooks.push(`<strong>Quest Hook:</strong> ${StringUtils.escapeHTML(plotHooks.questHook.name)}`);
    }

    if (hooks.length === 0) return '';

    if (detailLevel === "cinematic") {
      const detailedHooks = [];

      if (plotHooks.secret) {
        detailedHooks.push(`
          <div class="plot-hook-item">
            <strong>Secret:</strong> ${StringUtils.escapeHTML(plotHooks.secret.name)}
            <div class="hook-description">${StringUtils.escapeHTML(plotHooks.secret.description)}</div>
          </div>
        `);
      }

      if (plotHooks.goal) {
        detailedHooks.push(`
          <div class="plot-hook-item">
            <strong>Goal:</strong> ${StringUtils.escapeHTML(plotHooks.goal.name)}
            <div class="hook-description">${StringUtils.escapeHTML(plotHooks.goal.description)}</div>
          </div>
        `);
      }

      if (plotHooks.conflict) {
        detailedHooks.push(`
          <div class="plot-hook-item">
            <strong>Conflict:</strong> ${StringUtils.escapeHTML(plotHooks.conflict.name)}
            <div class="hook-description">${StringUtils.escapeHTML(plotHooks.conflict.description)}</div>
          </div>
        `);
      }

      if (plotHooks.questHook) {
        detailedHooks.push(`
          <div class="plot-hook-item">
            <strong>Quest Hook:</strong> ${StringUtils.escapeHTML(plotHooks.questHook.name)}
            <div class="hook-description">${StringUtils.escapeHTML(plotHooks.questHook.description)}</div>
          </div>
        `);
      }

      return `
        <div class="npc-section npc-plot-hooks">
          <strong>Plot Hooks:</strong>
          <div class="plot-hooks-list">
            ${detailedHooks.join('')}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="npc-section npc-plot-hooks">
          <strong>Plot Hooks:</strong> ${hooks.join(' | ')}
        </div>
      `;
    }
  }
}
