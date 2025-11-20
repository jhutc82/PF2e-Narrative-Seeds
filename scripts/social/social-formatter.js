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
    const { name, ancestry, mood, personalities, mannerisms, motivation, quirks, appearance, occupation, abilities, possessions, relationships, plotHooks, influence, psychology, physicalDetails, lifeHistory, dailyLife, speechPatterns, complexity, currentSituation, emotionalTriggers, secrets, economics, sensory, health, relationshipDynamics, professionalExpertise, dialogueSamples, voiceTemplate, storyHooks, sessionTracking, actor } = seed;

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

    // Build new sections for realism
    const psychologyHTML = psychology ? this.formatPsychology(psychology, "standard") : '';
    const physicalDetailsHTML = physicalDetails ? this.formatPhysicalDetails(physicalDetails, "standard") : '';
    const speechPatternsHTML = speechPatterns ? this.formatSpeechPatterns(speechPatterns, "standard") : '';
    const complexityHTML = complexity ? this.formatComplexity(complexity, "standard") : '';
    const currentSituationHTML = currentSituation ? this.formatCurrentSituation(currentSituation, "standard") : '';

    // Build interactive systems
    const emotionalTriggersHTML = emotionalTriggers ? this.formatEmotionalTriggers(emotionalTriggers, "standard") : '';
    const secretsHTML = secrets ? this.formatSecrets(secrets, "standard") : '';
    const economicsHTML = economics ? this.formatEconomics(economics, "standard") : '';
    const sensoryHTML = sensory ? this.formatSensory(sensory, "standard") : '';
    const healthHTML = health ? this.formatHealth(health, "standard") : '';
    const relationshipDynamicsHTML = relationshipDynamics ? this.formatRelationshipDynamics(relationshipDynamics, "standard") : '';
    const professionalExpertiseHTML = professionalExpertise ? this.formatProfessionalExpertise(professionalExpertise, "standard") : '';

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
        ${physicalDetailsHTML}
        ${occupationHTML}
        ${personalitiesHTML}
        ${psychologyHTML}
        ${mannerismsHTML}
        ${speechPatternsHTML}
        ${motivationHTML}
        ${quirksHTML}
        ${currentSituationHTML}
        ${complexityHTML}
        ${possessionsHTML}
        ${relationshipsHTML}
        ${plotHooksHTML}
        ${influenceHTML}
        ${emotionalTriggersHTML}
        ${secretsHTML}
        ${economicsHTML}
        ${sensoryHTML}
        ${healthHTML}
        ${relationshipDynamicsHTML}
        ${professionalExpertiseHTML}
      </div>
    `;
  }

  /**
   * Generate cinematic HTML - expanded detail
   * @param {Object} seed
   * @returns {string}
   */
  static generateCinematicHTML(seed) {
    const { name, ancestry, mood, personalities, mannerisms, motivation, quirks, appearance, occupation, abilities, possessions, relationships, plotHooks, influence, psychology, physicalDetails, lifeHistory, dailyLife, speechPatterns, complexity, currentSituation, emotionalTriggers, secrets, economics, sensory, health, relationshipDynamics, professionalExpertise, dialogueSamples, voiceTemplate, storyHooks, sessionTracking, factionInfo, romanticInfo, religiousInfo, hobbies, education, combatStyle, magicalInfo, family, groupRole, developmentTracking, questInfo, relationshipTracking, actor } = seed;

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

    // Build new sections for realism - cinematic detail
    const psychologyHTML = psychology ? this.formatPsychology(psychology, "cinematic") : '';
    const physicalDetailsHTML = physicalDetails ? this.formatPhysicalDetails(physicalDetails, "cinematic") : '';
    const lifeHistoryHTML = lifeHistory ? this.formatLifeHistory(lifeHistory, "cinematic") : '';
    const dailyLifeHTML = dailyLife ? this.formatDailyLife(dailyLife, "cinematic") : '';
    const speechPatternsHTML = speechPatterns ? this.formatSpeechPatterns(speechPatterns, "cinematic") : '';
    const complexityHTML = complexity ? this.formatComplexity(complexity, "cinematic") : '';
    const currentSituationHTML = currentSituation ? this.formatCurrentSituation(currentSituation, "cinematic") : '';

    // Build interactive systems - cinematic detail
    const emotionalTriggersHTML = emotionalTriggers ? this.formatEmotionalTriggers(emotionalTriggers, "cinematic") : '';
    const secretsHTML = secrets ? this.formatSecrets(secrets, "cinematic") : '';
    const economicsHTML = economics ? this.formatEconomics(economics, "cinematic") : '';
    const sensoryHTML = sensory ? this.formatSensory(sensory, "cinematic") : '';
    const healthHTML = health ? this.formatHealth(health, "cinematic") : '';
    const relationshipDynamicsHTML = relationshipDynamics ? this.formatRelationshipDynamics(relationshipDynamics, "cinematic") : '';
    const professionalExpertiseHTML = professionalExpertise ? this.formatProfessionalExpertise(professionalExpertise, "cinematic") : '';
    const dialogueSamplesHTML = dialogueSamples ? this.formatDialogueSamples(dialogueSamples, "cinematic") : '';
    const voiceTemplateHTML = voiceTemplate ? this.formatVoiceTemplate(voiceTemplate, "cinematic") : '';
    const storyHooksHTML = storyHooks ? this.formatStoryHooks(storyHooks, "cinematic") : '';
    const sessionTrackingHTML = sessionTracking ? this.formatSessionTracking(sessionTracking, "cinematic") : '';

    // Build new expansion systems - cinematic detail
    const factionInfoHTML = factionInfo ? this.formatFactionInfo(factionInfo, "cinematic") : '';
    const romanticInfoHTML = romanticInfo ? this.formatRomanticInfo(romanticInfo, "cinematic") : '';
    const religiousInfoHTML = religiousInfo ? this.formatReligiousInfo(religiousInfo, "cinematic") : '';
    const hobbiesHTML = hobbies ? this.formatHobbies(hobbies, "cinematic") : '';
    const educationHTML = education ? this.formatEducation(education, "cinematic") : '';
    const combatStyleHTML = combatStyle ? this.formatCombatStyle(combatStyle, "cinematic") : '';
    const magicalInfoHTML = magicalInfo ? this.formatMagicalInfo(magicalInfo, "cinematic") : '';
    const familyHTML = family ? this.formatFamily(family, "cinematic") : '';
    const groupRoleHTML = groupRole ? this.formatGroupRole(groupRole, "cinematic") : '';
    const developmentTrackingHTML = developmentTracking ? this.formatDevelopmentTracking(developmentTracking, "cinematic") : '';
    const questInfoHTML = questInfo ? this.formatQuestInfo(questInfo, "cinematic") : '';
    const relationshipTrackingHTML = relationshipTracking ? this.formatRelationshipTracking(relationshipTracking, "cinematic") : '';

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
        ${physicalDetailsHTML}
        ${occupationHTML}
        ${personalitiesHTML}
        ${psychologyHTML}
        ${mannerismsHTML}
        ${speechPatternsHTML}
        ${motivationHTML}
        ${quirksHTML}
        ${currentSituationHTML}
        ${lifeHistoryHTML}
        ${dailyLifeHTML}
        ${complexityHTML}
        ${possessionsHTML}
        ${relationshipsHTML}
        ${plotHooksHTML}
        ${influenceHTML}
        ${emotionalTriggersHTML}
        ${secretsHTML}
        ${economicsHTML}
        ${sensoryHTML}
        ${healthHTML}
        ${relationshipDynamicsHTML}
        ${professionalExpertiseHTML}
        ${dialogueSamplesHTML}
        ${voiceTemplateHTML}
        ${storyHooksHTML}
        ${factionInfoHTML}
        ${romanticInfoHTML}
        ${religiousInfoHTML}
        ${hobbiesHTML}
        ${educationHTML}
        ${combatStyleHTML}
        ${magicalInfoHTML}
        ${familyHTML}
        ${groupRoleHTML}
        ${developmentTrackingHTML}
        ${questInfoHTML}
        ${relationshipTrackingHTML}
        ${sessionTrackingHTML}
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

  /**
   * Format psychology section
   */
  static formatPsychology(psychology, detailLevel) {
    if (!psychology) return '';

    const { fears, desires, regrets, vices, virtues } = psychology;

    if (detailLevel === "standard") {
      // Compact display - just names
      const parts = [];
      if (fears.length > 0) parts.push(`Fears: ${fears.map(f => f.name).join(', ')}`);
      if (desires.length > 0) parts.push(`Desires: ${desires.map(d => d.name).join(', ')}`);
      if (vices.length > 0) parts.push(`Vices: ${vices.map(v => v.name).join(', ')}`);

      return `<div class="npc-section npc-psychology"><strong>Psychology:</strong> ${parts.join(' | ')}</div>`;
    }

    // Cinematic - full details
    return `
      <div class="npc-section npc-psychology">
        <strong>Psychological Profile:</strong>
        ${fears.length > 0 ? `<div class="psych-fears"><em>Fears:</em> ${fears.map(f => `<strong>${f.name}</strong> - ${StringUtils.escapeHTML(f.manifestation)}`).join('; ')}</div>` : ''}
        ${desires.length > 0 ? `<div class="psych-desires"><em>Desires:</em> ${desires.map(d => `<strong>${d.name}</strong> - ${StringUtils.escapeHTML(d.motivation)}`).join('; ')}</div>` : ''}
        ${regrets.length > 0 ? `<div class="psych-regrets"><em>Regrets:</em> ${regrets.map(r => `<strong>${r.name}</strong> - ${StringUtils.escapeHTML(r.impact)}`).join('; ')}</div>` : ''}
        ${vices.length > 0 ? `<div class="psych-vices"><em>Vices:</em> ${vices.map(v => v.name).join(', ')}</div>` : ''}
        ${virtues.length > 0 ? `<div class="psych-virtues"><em>Virtues:</em> ${virtues.map(v => v.name).join(', ')}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format physical details section
   */
  static formatPhysicalDetails(details, detailLevel) {
    if (!details) return '';

    const { voice, scars, tattoos, clothing, jewelry, physicalQuirks, posture, hygiene } = details;

    if (detailLevel === "standard") {
      const parts = [];
      parts.push(voice.description);
      if (scars.length > 0) parts.push(scars[0].description);
      if (clothing) parts.push(clothing.description);

      return `<div class="npc-section npc-physical"><strong>Physical Details:</strong> ${parts.join('; ')}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-physical">
        <strong>Physical Details:</strong>
        <div><em>Voice:</em> ${StringUtils.escapeHTML(voice.description)}</div>
        ${scars.length > 0 ? `<div><em>Scars:</em> ${scars.map(s => `${StringUtils.escapeHTML(s.description)} (${StringUtils.escapeHTML(s.origin)})`).join('; ')}</div>` : ''}
        ${tattoos.length > 0 ? `<div><em>Tattoos:</em> ${tattoos.map(t => `${StringUtils.escapeHTML(t.description)} on ${t.location} - ${StringUtils.escapeHTML(t.meaning)}`).join('; ')}</div>` : ''}
        <div><em>Clothing:</em> ${StringUtils.escapeHTML(clothing.description)}</div>
        ${jewelry.length > 0 ? `<div><em>Jewelry:</em> ${jewelry.map(j => `${StringUtils.escapeHTML(j.description)} (${StringUtils.escapeHTML(j.significance)})`).join('; ')}</div>` : ''}
        <div><em>Posture:</em> ${StringUtils.escapeHTML(posture.description)}</div>
        <div><em>Hygiene:</em> ${StringUtils.escapeHTML(hygiene.description)}</div>
        ${physicalQuirks.length > 0 ? `<div><em>Quirks:</em> ${physicalQuirks.map(q => q.description).join('; ')}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format life history section
   */
  static formatLifeHistory(history, detailLevel) {
    if (!history) return '';

    const { childhoodEvents, formativeExperiences, majorLifeEvents, education, travelHistory } = history;

    return `
      <div class="npc-section npc-history">
        <strong>Life History:</strong>
        ${childhoodEvents.length > 0 ? `<div><em>Childhood:</em> ${childhoodEvents.map(e => StringUtils.escapeHTML(e.description)).join('; ')}</div>` : ''}
        <div><em>Formative Experience:</em> ${formativeExperiences.map(e => StringUtils.escapeHTML(e.description)).join('; ')}</div>
        ${majorLifeEvents.length > 0 ? `<div><em>Major Events:</em> ${majorLifeEvents.map(e => StringUtils.escapeHTML(e.description)).join('; ')}</div>` : ''}
        <div><em>Education:</em> ${StringUtils.escapeHTML(education.description)}</div>
      </div>
    `;
  }

  /**
   * Format daily life section
   */
  static formatDailyLife(dailyLife, detailLevel) {
    if (!dailyLife) return '';

    const { habits, hobbies, favoriteThings, petPeeves, morningRoutine, eveningRoutine } = dailyLife;

    if (detailLevel === "standard") {
      return '';  // Skip for standard to keep it manageable
    }

    return `
      <div class="npc-section npc-daily-life">
        <strong>Daily Life:</strong>
        <div><em>Habits:</em> ${habits.map(h => StringUtils.escapeHTML(h.description)).join('; ')}</div>
        ${hobbies.length > 0 ? `<div><em>Hobbies:</em> ${hobbies.map(h => StringUtils.escapeHTML(h.description)).join(', ')}</div>` : ''}
        <div><em>Pet Peeves:</em> ${petPeeves.map(p => StringUtils.escapeHTML(p.description)).join('; ')}</div>
      </div>
    `;
  }

  /**
   * Format speech patterns section
   */
  static formatSpeechPatterns(speech, detailLevel) {
    if (!speech) return '';

    const { catchphrases, verbalTics, conversationStyle, accent, speakingSpeed, laugh } = speech;

    if (detailLevel === "standard") {
      const parts = [];
      parts.push(conversationStyle.description);
      if (catchphrases.length > 0) parts.push(`Says "${catchphrases[0].phrase}"`);

      return `<div class="npc-section npc-speech"><strong>Speech:</strong> ${parts.join('; ')}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-speech">
        <strong>Speech Patterns:</strong>
        <div><em>Style:</em> ${StringUtils.escapeHTML(conversationStyle.description)} | <em>Accent:</em> ${StringUtils.escapeHTML(accent.description)}</div>
        <div><em>Catchphrases:</em> "${catchphrases.map(c => c.phrase).join('", "')}"</div>
        ${verbalTics.length > 0 ? `<div><em>Verbal Tics:</em> ${verbalTics.map(t => t.description).join('; ')}</div>` : ''}
        <div><em>Laugh:</em> ${StringUtils.escapeHTML(laugh.description)}</div>
      </div>
    `;
  }

  /**
   * Format character complexity section
   */
  static formatComplexity(complexity, detailLevel) {
    if (!complexity) return '';

    const { contradictions, internalConflicts, hiddenDepths, characterArcs, moralComplexity } = complexity;

    if (detailLevel === "standard") {
      const parts = [];
      if (contradictions.length > 0) parts.push(`${contradictions[0].primary} but ${contradictions[0].secondary}`);
      if (internalConflicts.length > 0) parts.push(`Conflicted: ${internalConflicts[0].conflict}`);

      return parts.length > 0 ? `<div class="npc-section npc-complexity"><strong>Complexity:</strong> ${parts.join('; ')}</div>` : '';
    }

    // Cinematic
    return `
      <div class="npc-section npc-complexity">
        <strong>Character Depth:</strong>
        ${contradictions.length > 0 ? `<div><em>Contradiction:</em> ${contradictions.map(c => `${StringUtils.escapeHTML(c.primary)} yet ${StringUtils.escapeHTML(c.secondary)}`).join('; ')}</div>` : ''}
        ${internalConflicts.length > 0 ? `<div><em>Internal Conflict:</em> ${internalConflicts.map(c => StringUtils.escapeHTML(c.description)).join('; ')}</div>` : ''}
        ${hiddenDepths.length > 0 ? `<div><em>Hidden Depth:</em> ${hiddenDepths.map(h => `${StringUtils.escapeHTML(h.surface)} (Actually: ${StringUtils.escapeHTML(h.hidden)})`).join('; ')}</div>` : ''}
        ${characterArcs.length > 0 ? `<div><em>Current Arc:</em> ${characterArcs.map(a => `${StringUtils.escapeHTML(a.current)} - Goal: ${StringUtils.escapeHTML(a.goal)}`).join('; ')}</div>` : ''}
        ${moralComplexity ? `<div><em>Moral Stance:</em> ${StringUtils.escapeHTML(moralComplexity.belief)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format current situation section
   */
  static formatCurrentSituation(situation, detailLevel) {
    if (!situation) return '';

    const { immediateProblems, shortTermGoals, recentEvents, currentMood, stakes, timeConstraints } = situation;

    if (detailLevel === "standard") {
      const parts = [];
      if (immediateProblems.length > 0) parts.push(`Problem: ${immediateProblems[0].problem}`);
      if (shortTermGoals.length > 0) parts.push(`Goal: ${shortTermGoals[0].goal}`);

      return parts.length > 0 ? `<div class="npc-section npc-situation"><strong>Current Situation:</strong> ${parts.join(' | ')}</div>` : '';
    }

    // Cinematic
    return `
      <div class="npc-section npc-situation">
        <strong>Current Situation:</strong>
        <div><em>Current Mood:</em> ${StringUtils.escapeHTML(currentMood.mood)} - ${StringUtils.escapeHTML(currentMood.behavior)}</div>
        ${immediateProblems.length > 0 ? `<div class="situation-urgent"><em>Immediate Problem:</em> ${immediateProblems.map(p => `${StringUtils.escapeHTML(p.problem)} (${p.urgency})`).join('; ')}</div>` : ''}
        <div><em>Short-Term Goals:</em> ${shortTermGoals.map(g => StringUtils.escapeHTML(g.goal)).join('; ')}</div>
        ${recentEvents.length > 0 ? `<div><em>Recent Event:</em> ${recentEvents.map(e => StringUtils.escapeHTML(e.event)).join('; ')}</div>` : ''}
        ${stakes ? `<div><em>Stakes:</em> ${StringUtils.escapeHTML(stakes.stakes)} at risk</div>` : ''}
        ${timeConstraints ? `<div><em>Time Constraint:</em> ${StringUtils.escapeHTML(timeConstraints.constraint)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format emotional triggers section
   */
  static formatEmotionalTriggers(triggers, detailLevel) {
    if (!triggers) return '';

    const { emotionalTriggers, hotButtons, softSpots, trustBuilders, dealbreakers, loyaltyConditions, persuasionVulnerabilities } = triggers;

    if (detailLevel === "standard") {
      const parts = [];
      if (hotButtons.length > 0) parts.push(`Hot Button: ${hotButtons[0].trigger}`);
      if (softSpots.length > 0) parts.push(`Soft Spot: ${softSpots[0].softSpot}`);
      return parts.length > 0 ? `<div class="npc-section"><strong>Emotional Profile:</strong> ${parts.join(' | ')}</div>` : '';
    }

    // Cinematic
    return `
      <div class="npc-section npc-emotions">
        <strong>Emotional Profile:</strong>
        ${hotButtons.length > 0 ? `<div><em>Hot Buttons:</em> ${hotButtons.map(h => StringUtils.escapeHTML(h.trigger)).join('; ')}</div>` : ''}
        ${softSpots.length > 0 ? `<div><em>Soft Spots:</em> ${softSpots.map(s => StringUtils.escapeHTML(s.softSpot)).join('; ')}</div>` : ''}
        <div><em>Trust Builders:</em> ${trustBuilders.map(t => StringUtils.escapeHTML(t.action)).join('; ')}</div>
        ${dealbreakers.length > 0 ? `<div class="warning"><em>Dealbreakers:</em> ${dealbreakers.map(d => StringUtils.escapeHTML(d.dealbreaker)).join('; ')}</div>` : ''}
        <div><em>Persuasion:</em> ${persuasionVulnerabilities.map(p => StringUtils.escapeHTML(p.method)).join('; ')}</div>
      </div>
    `;
  }

  /**
   * Format secrets and information section
   */
  static formatSecrets(secrets, detailLevel) {
    if (!secrets) return '';

    const { surfaceInformation, personalInformation, intimateInformation, deepSecrets, knowledgeAreas, hiddenAgendas } = secrets;

    if (detailLevel === "standard") {
      return `<div class="npc-section"><strong>Knowledge:</strong> ${knowledgeAreas.map(k => k.area).join(', ')}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-secrets">
        <strong>Information Layers:</strong>
        <div><em>Surface Level:</em> ${surfaceInformation.map(s => StringUtils.escapeHTML(s.info)).join('; ')}</div>
        <div><em>Personal Level:</em> ${personalInformation.map(p => StringUtils.escapeHTML(p.info)).join('; ')}</div>
        <div><em>Intimate Level:</em> ${intimateInformation.map(i => StringUtils.escapeHTML(i.info)).join('; ')}</div>
        ${deepSecrets.length > 0 ? `<div class="gm-only"><em>Deep Secret (GM Only):</em> ${deepSecrets.map(d => StringUtils.escapeHTML(d.secret)).join('; ')}</div>` : ''}
        <div><em>Knows About:</em> ${knowledgeAreas.map(k => k.area).join(', ')}</div>
        ${hiddenAgendas.length > 0 ? `<div class="gm-only"><em>Hidden Agenda:</em> ${hiddenAgendas.map(a => StringUtils.escapeHTML(a.agenda)).join('; ')}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format economics section
   */
  static formatEconomics(economics, detailLevel) {
    if (!economics) return '';

    const { wealthLevel, incomeSources, debtSituation, creditor, financialPressures, financialGoals, attitudeTowardMoney, hiddenAssets } = economics;

    if (detailLevel === "standard") {
      return `<div class="npc-section"><strong>Wealth:</strong> ${wealthLevel.name} (${wealthLevel.copper} cp)</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-economics">
        <strong>Economic Reality:</strong>
        <div><em>Wealth Level:</em> ${wealthLevel.name} (${wealthLevel.copper} cp) - ${StringUtils.escapeHTML(wealthLevel.lifestyle)}</div>
        <div><em>Income:</em> ${incomeSources.map(i => i.source).join(', ')}</div>
        ${debtSituation ? `<div class="warning"><em>Debt:</em> ${StringUtils.escapeHTML(debtSituation.situation)} (Owed to: ${creditor.type})</div>` : ''}
        ${financialPressures.length > 0 ? `<div><em>Financial Pressure:</em> ${financialPressures.map(p => StringUtils.escapeHTML(p.pressure)).join('; ')}</div>` : ''}
        <div><em>Financial Goal:</em> ${financialGoals.map(g => g.goal).join('; ')}</div>
        <div><em>Attitude to Money:</em> ${StringUtils.escapeHTML(attitudeTowardMoney.attitude)}</div>
        ${hiddenAssets.length > 0 ? `<div class="gm-only"><em>Hidden Asset:</em> ${hiddenAssets.map(a => StringUtils.escapeHTML(a.asset)).join('; ')}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format sensory signature section
   */
  static formatSensory(sensory, detailLevel) {
    if (!sensory) return '';

    const { scent, sounds, texture, temperature, aura, visualSignature } = sensory;

    if (detailLevel === "standard") {
      return `<div class="npc-section"><strong>Sensory:</strong> Smells of ${scent.scent}, ${aura.aura}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-sensory">
        <strong>Sensory Signature:</strong>
        <div><em>Scent:</em> ${StringUtils.escapeHTML(scent.scent)} - ${StringUtils.escapeHTML(scent.impression)}</div>
        <div><em>Sounds:</em> ${sounds.map(s => s.sound).join('; ')}</div>
        <div><em>Texture:</em> ${StringUtils.escapeHTML(texture.texture)} - ${StringUtils.escapeHTML(texture.implication)}</div>
        <div><em>Temperature:</em> ${StringUtils.escapeHTML(temperature.temp)} - ${StringUtils.escapeHTML(temperature.feeling)}</div>
        <div><em>Aura:</em> ${StringUtils.escapeHTML(aura.aura)} - ${StringUtils.escapeHTML(aura.effect)}</div>
        <div><em>Visual:</em> ${visualSignature.map(v => v.visual).join('; ')}</div>
      </div>
    `;
  }

  /**
   * Format health and conditions section
   */
  static formatHealth(health, detailLevel) {
    if (!health) return '';

    const { chronicConditions, disabilities, fitnessLevel, allergiesAndSensitivities, mentalHealthConditions, addictions, currentHealthStatus, scarsAndInjuryHistory } = health;

    if (detailLevel === "standard") {
      const parts = [fitnessLevel.fitness];
      if (chronicConditions.length > 0) parts.push(chronicConditions[0].condition);
      return parts.length > 0 ? `<div class="npc-section"><strong>Health:</strong> ${parts.join(' | ')}</div>` : '';
    }

    // Cinematic
    return `
      <div class="npc-section npc-health">
        <strong>Health & Conditions:</strong>
        <div><em>Fitness:</em> ${StringUtils.escapeHTML(fitnessLevel.fitness)} - ${StringUtils.escapeHTML(fitnessLevel.stamina)}</div>
        <div><em>Current Status:</em> ${StringUtils.escapeHTML(currentHealthStatus.status)}</div>
        ${chronicConditions.length > 0 ? `<div><em>Chronic:</em> ${chronicConditions.map(c => c.condition).join('; ')}</div>` : ''}
        ${disabilities.length > 0 ? `<div><em>Disability:</em> ${disabilities.map(d => d.disability).join('; ')}</div>` : ''}
        ${allergiesAndSensitivities.length > 0 ? `<div><em>Allergies:</em> ${allergiesAndSensitivities.map(a => a.allergy).join('; ')}</div>` : ''}
        ${mentalHealthConditions.length > 0 ? `<div><em>Mental Health:</em> ${mentalHealthConditions.map(m => m.condition).join('; ')}</div>` : ''}
        ${addictions.length > 0 ? `<div class="warning"><em>Addiction:</em> ${addictions.map(a => a.addiction).join('; ')}</div>` : ''}
        <div><em>Scars/History:</em> ${StringUtils.escapeHTML(scarsAndInjuryHistory.history)}</div>
      </div>
    `;
  }

  /**
   * Format relationship dynamics section
   */
  static formatRelationshipDynamics(dynamics, detailLevel) {
    if (!dynamics) return '';

    if (detailLevel === "standard") {
      return `<div class="npc-section"><strong>Social Behavior:</strong> ${dynamics.conflictStyle.style} conflict style, ${dynamics.genuineWith.genuine}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-relationships">
        <strong>Relationship Dynamics:</strong>
        <div><em>With Nobles:</em> ${StringUtils.escapeHTML(dynamics.treatmentOfNobles.treatment)}</div>
        <div><em>With Commoners:</em> ${StringUtils.escapeHTML(dynamics.treatmentOfCommoners.treatment)}</div>
        <div><em>With Children:</em> ${StringUtils.escapeHTML(dynamics.treatmentOfChildren.treatment)}</div>
        <div><em>With Authority:</em> ${StringUtils.escapeHTML(dynamics.treatmentOfAuthority.treatment)}</div>
        <div><em>Social Mask:</em> ${StringUtils.escapeHTML(dynamics.socialMask.mask)} - ${StringUtils.escapeHTML(dynamics.socialMask.different)}</div>
        <div><em>Genuine With:</em> ${StringUtils.escapeHTML(dynamics.genuineWith.genuine)}</div>
        <div><em>Conflict Style:</em> ${StringUtils.escapeHTML(dynamics.conflictStyle.style)} - ${StringUtils.escapeHTML(dynamics.conflictStyle.approach)}</div>
        <div><em>Boundaries:</em> ${StringUtils.escapeHTML(dynamics.boundariesWithStrangers.boundaries)}</div>
      </div>
    `;
  }

  /**
   * Format professional expertise section
   */
  static formatProfessionalExpertise(expertise, detailLevel) {
    if (!expertise) return '';

    const { knowledge, skills, contacts, secrets, teachableSkills, professionalOpinions, insiderKnowledge } = expertise;

    if (detailLevel === "standard") {
      return `<div class="npc-section"><strong>Expertise:</strong> ${knowledge.join(', ')}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-expertise">
        <strong>Professional Expertise:</strong>
        <div><em>Knowledge:</em> ${knowledge.join(', ')}</div>
        <div><em>Skills:</em> ${skills.join(', ')}</div>
        <div><em>Contacts:</em> ${contacts.join(', ')}</div>
        ${secrets.length > 0 ? `<div class="gm-only"><em>Professional Secrets:</em> ${secrets.join('; ')}</div>` : ''}
        <div><em>Can Teach:</em> ${teachableSkills.map(t => t.skill).join(', ')}</div>
        ${insiderKnowledge.length > 0 ? `<div><em>Insider Knowledge:</em> ${insiderKnowledge.map(i => i.knowledge).join('; ')}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format dialogue samples section
   */
  static formatDialogueSamples(samples, detailLevel) {
    if (!samples || detailLevel !== "cinematic") return '';

    return `
      <div class="npc-section npc-dialogue">
        <strong>Sample Dialogue:</strong>
        ${samples.samples.map(s => `<div><em>${s.context}:</em> "${StringUtils.escapeHTML(s.line)}"</div>`).join('')}
        <div class="gm-guidance"><em>${StringUtils.escapeHTML(samples.notes)}</em></div>
      </div>
    `;
  }

  /**
   * Format voice template section
   */
  static formatVoiceTemplate(template, detailLevel) {
    if (!template || detailLevel !== "cinematic") return '';

    const { overview, sentenceStructure, vocabularyGuidelines, topicsToSeek, topicsToAvoid, emotionalExpression, bodyLanguage } = template;

    return `
      <div class="npc-section npc-voice-template">
        <strong>Voice Template (GM Guide):</strong>
        <div><em>Overview:</em> ${StringUtils.escapeHTML(overview)}</div>
        <div><em>Sentence Structure:</em> ${StringUtils.escapeHTML(sentenceStructure)}</div>
        <div><em>Vocabulary:</em> ${vocabularyGuidelines.map(v => StringUtils.escapeHTML(v)).join('; ')}</div>
        <div><em>Seeks Topics:</em> ${topicsToSeek.map(t => StringUtils.escapeHTML(t)).join('; ')}</div>
        <div><em>Avoids Topics:</em> ${topicsToAvoid.map(t => StringUtils.escapeHTML(t)).join('; ')}</div>
        <div><em>When Happy:</em> ${StringUtils.escapeHTML(emotionalExpression.whenHappy)}</div>
        <div><em>When Angry:</em> ${StringUtils.escapeHTML(emotionalExpression.whenAngry)}</div>
        <div><em>Body Language:</em> ${bodyLanguage.map(b => StringUtils.escapeHTML(b)).join('; ')}</div>
      </div>
    `;
  }

  /**
   * Format story hooks section
   */
  static formatStoryHooks(hooks, detailLevel) {
    if (!hooks || detailLevel !== "cinematic") return '';

    return `
      <div class="npc-section npc-story-hooks">
        <strong>Story Hooks (Potential Quests):</strong>
        ${hooks.availableQuests.map(q => `
          <div class="quest-hook">
            <strong>[${q.type}]</strong> ${StringUtils.escapeHTML(q.hook)}
            <div><em>Reward:</em> ${StringUtils.escapeHTML(q.reward)}</div>
            <div><em>Urgency:</em> ${StringUtils.escapeHTML(q.urgency)}</div>
          </div>
        `).join('')}
        <div class="gm-guidance"><em>${StringUtils.escapeHTML(hooks.notes)}</em></div>
      </div>
    `;
  }

  /**
   * Format session tracking section
   */
  static formatSessionTracking(tracking, detailLevel) {
    if (!tracking || detailLevel !== "cinematic") return '';

    const hasRelationships = Object.keys(tracking.pcRelationships).length > 0;
    const hasHistory = tracking.sessionHistory.length > 0;

    if (!hasRelationships && !hasHistory && !tracking.gmNotes) return '';

    return `
      <div class="npc-section npc-session-tracking gm-only">
        <strong>Session Tracking (GM Only):</strong>
        <div><em>Current Disposition:</em> ${StringUtils.escapeHTML(tracking.currentDisposition)}</div>
        ${tracking.gmNotes ? `<div><em>GM Notes:</em> ${StringUtils.escapeHTML(tracking.gmNotes)}</div>` : ''}
        ${hasRelationships ? `<div><em>PC Relationships:</em> ${Object.entries(tracking.pcRelationships).map(([pc, rel]) => `${pc}: Attitude ${rel.attitude}, Trust ${rel.trust}`).join('; ')}</div>` : ''}
        ${tracking.promisesMade.length > 0 ? `<div><em>Promises:</em> ${tracking.promisesMade.length} made</div>` : ''}
        ${tracking.questsGiven.length > 0 ? `<div><em>Quests Given:</em> ${tracking.questsGiven.length}</div>` : ''}
        ${hasHistory ? `<div><em>Last Seen:</em> ${new Date(tracking.lastSeen).toLocaleDateString()}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format faction affiliations section
   */
  static formatFactionInfo(info, detailLevel) {
    if (!info) return '';

    const { faction, politicalLeaning, loyaltyLevel, hasHiddenAffiliation } = info;

    if (detailLevel === "standard") {
      const parts = [];
      if (faction) parts.push(`Faction: ${faction.name}`);
      if (politicalLeaning) parts.push(`Politics: ${politicalLeaning.name}`);
      return parts.length > 0 ? `<div class="npc-section npc-factions"><strong>Affiliations:</strong> ${parts.join(' | ')}</div>` : '';
    }

    // Cinematic
    return `
      <div class="npc-section npc-faction-info">
        <strong>Faction Affiliations:</strong>
        ${faction ? `<div><em>Member of:</em> ${StringUtils.escapeHTML(faction.name)} ${hasHiddenAffiliation ? '(secret membership)' : ''}</div>` : '<div><em>No formal faction affiliation</em></div>'}
        ${faction ? `<div class="faction-desc">${StringUtils.escapeHTML(faction.description)}</div>` : ''}
        ${loyaltyLevel ? `<div><em>Loyalty:</em> ${StringUtils.capitalize(loyaltyLevel)}</div>` : ''}
        <div><em>Political Leaning:</em> ${StringUtils.escapeHTML(politicalLeaning.name)} - ${StringUtils.escapeHTML(politicalLeaning.description)}</div>
      </div>
    `;
  }

  /**
   * Format romantic preferences section
   */
  static formatRomanticInfo(info, detailLevel) {
    if (!info) return '';

    const { orientation, relationshipHistory, attractionTypes, pastHeartbreak, currentStatus, openToRomance } = info;

    if (detailLevel === "standard") {
      return `<div class="npc-section npc-romance"><strong>Relationship Status:</strong> ${StringUtils.capitalize(currentStatus)}${orientation ? `, ${orientation.name}` : ''}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-romantic-info">
        <strong>Romantic Profile:</strong>
        <div><em>Orientation:</em> ${StringUtils.escapeHTML(orientation.name)} - ${StringUtils.escapeHTML(orientation.description)}</div>
        <div><em>Current Status:</em> ${StringUtils.capitalize(currentStatus)}</div>
        <div><em>Relationship History:</em> ${StringUtils.escapeHTML(relationshipHistory.name)} - ${StringUtils.escapeHTML(relationshipHistory.description)}</div>
        <div><em>Attracted to:</em> ${attractionTypes.map(a => a.name).join(', ')}</div>
        ${pastHeartbreak ? `<div><em>Past Heartbreak:</em> ${StringUtils.escapeHTML(pastHeartbreak.name)} - ${StringUtils.escapeHTML(pastHeartbreak.impact)}</div>` : ''}
        <div><em>Open to Romance:</em> ${openToRomance ? 'Yes' : 'Not currently'}</div>
      </div>
    `;
  }

  /**
   * Format religious beliefs section
   */
  static formatReligiousInfo(info, detailLevel) {
    if (!info) return '';

    const { deity, devotionLevel, religiousAttitude, practices, hasReligion } = info;

    if (detailLevel === "standard") {
      if (!hasReligion) return `<div class="npc-section npc-religion"><strong>Religion:</strong> ${devotionLevel.name}</div>`;
      return `<div class="npc-section npc-religion"><strong>Religion:</strong> ${deity.name} (${devotionLevel.name})</div>`;
    }

    // Cinematic
    if (!hasReligion) {
      return `
        <div class="npc-section npc-religious-info">
          <strong>Religious Beliefs:</strong>
          <div><em>Non-believer:</em> ${StringUtils.escapeHTML(devotionLevel.name)} - ${StringUtils.escapeHTML(devotionLevel.description)}</div>
        </div>
      `;
    }

    return `
      <div class="npc-section npc-religious-info">
        <strong>Religious Beliefs:</strong>
        <div><em>Deity:</em> ${StringUtils.escapeHTML(deity.name)} (${deity.alignment}) - ${StringUtils.escapeHTML(deity.description)}</div>
        <div><em>Domains:</em> ${deity.domains.join(', ')}</div>
        <div><em>Devotion Level:</em> ${StringUtils.escapeHTML(devotionLevel.name)} - ${StringUtils.escapeHTML(devotionLevel.description)}</div>
        ${religiousAttitude ? `<div><em>Attitude:</em> ${StringUtils.escapeHTML(religiousAttitude.name)} - ${StringUtils.escapeHTML(religiousAttitude.description)}</div>` : ''}
        ${practices.length > 0 ? `<div><em>Practices:</em> ${practices.map(p => p.name).join(', ')}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format hobbies section
   */
  static formatHobbies(info, detailLevel) {
    if (!info) return '';

    const { hobbies, primaryHobby, hasTimeForHobbies } = info;

    if (detailLevel === "standard") {
      return `<div class="npc-section npc-hobbies"><strong>Hobbies:</strong> ${hobbies.map(h => h.name).join(', ')}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-hobbies-info">
        <strong>Hobbies & Recreation:</strong>
        ${hobbies.map(h => `
          <div class="hobby-item">
            <strong>${StringUtils.escapeHTML(h.name)}</strong> (${h.category}) - ${StringUtils.escapeHTML(h.description)}
            <div class="hobby-details"><em>Time commitment:</em> ${h.timeCommitment}, <em>Social:</em> ${h.socializing ? 'Yes' : 'No'}</div>
          </div>
        `).join('')}
        ${!hasTimeForHobbies ? `<div class="warning"><em>Currently has little time for hobbies due to circumstances</em></div>` : ''}
      </div>
    `;
  }

  /**
   * Format education section
   */
  static formatEducation(info, detailLevel) {
    if (!info) return '';

    const { educationLevel, knowledgeAreas, learningStyle, teachingAbility, curiosity, isScholar } = info;

    if (detailLevel === "standard") {
      return `<div class="npc-section npc-education"><strong>Education:</strong> ${educationLevel.name}, knows ${knowledgeAreas.map(k => k.name).join(', ')}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-education-info">
        <strong>Education & Learning:</strong>
        <div><em>Education Level:</em> ${StringUtils.escapeHTML(educationLevel.name)} - ${StringUtils.escapeHTML(educationLevel.description)}</div>
        ${isScholar ? '<div class="scholar-tag"><strong>Scholar</strong> - Highly educated and knowledgeable</div>' : ''}
        <div><em>Areas of Knowledge:</em> ${knowledgeAreas.map(k => `<strong>${k.name}</strong> (${k.description})`).join('; ')}</div>
        <div><em>Learning Style:</em> ${StringUtils.escapeHTML(learningStyle.name)} - ${StringUtils.escapeHTML(learningStyle.description)}</div>
        <div><em>Teaching Ability:</em> ${StringUtils.escapeHTML(teachingAbility.name)} - ${StringUtils.escapeHTML(teachingAbility.description)}</div>
        <div><em>Intellectual Curiosity:</em> ${StringUtils.escapeHTML(curiosity.name)} - ${StringUtils.escapeHTML(curiosity.description)}</div>
      </div>
    `;
  }

  /**
   * Format combat style section
   */
  static formatCombatStyle(info, detailLevel) {
    if (!info) return '';

    const { combatTraining, fightingStyle, weaponPreference, combatPhilosophy, combatMentality, combatExperience, isCombatant } = info;

    if (detailLevel === "standard") {
      if (!isCombatant) return `<div class="npc-section npc-combat"><strong>Combat:</strong> ${combatTraining.name}</div>`;
      return `<div class="npc-section npc-combat"><strong>Combat:</strong> ${combatTraining.name}, ${fightingStyle.name}</div>`;
    }

    // Cinematic
    if (!isCombatant) {
      return `
        <div class="npc-section npc-combat-style">
          <strong>Combat Capability:</strong>
          <div><em>Training:</em> ${StringUtils.escapeHTML(combatTraining.name)} - ${StringUtils.escapeHTML(combatTraining.description)}</div>
          <div class="warning"><em>Not a combatant</em></div>
        </div>
      `;
    }

    return `
      <div class="npc-section npc-combat-style">
        <strong>Combat Style & Philosophy:</strong>
        <div><em>Training:</em> ${StringUtils.escapeHTML(combatTraining.name)} - ${StringUtils.escapeHTML(combatTraining.description)}</div>
        ${fightingStyle ? `<div><em>Fighting Style:</em> ${StringUtils.escapeHTML(fightingStyle.name)} - ${StringUtils.escapeHTML(fightingStyle.description)}</div>` : ''}
        ${weaponPreference ? `<div><em>Weapon Preference:</em> ${StringUtils.escapeHTML(weaponPreference.name)} - ${StringUtils.escapeHTML(weaponPreference.description)}</div>` : ''}
        ${combatPhilosophy ? `<div><em>Combat Philosophy:</em> ${StringUtils.escapeHTML(combatPhilosophy.name)} - ${StringUtils.escapeHTML(combatPhilosophy.description)}</div>` : ''}
        ${combatMentality ? `<div><em>Combat Mentality:</em> ${StringUtils.escapeHTML(combatMentality.name)} - ${StringUtils.escapeHTML(combatMentality.description)}</div>` : ''}
        ${combatExperience ? `<div><em>Experience:</em> ${StringUtils.escapeHTML(combatExperience.name)} - ${StringUtils.escapeHTML(combatExperience.description)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format magical traditions section
   */
  static formatMagicalInfo(info, detailLevel) {
    if (!info) return '';

    const { magicalAbility, tradition, source, education, specialization, supernaturalConnection, attitudeTowardMagic, isCaster } = info;

    if (detailLevel === "standard") {
      const parts = [];
      parts.push(`Magic: ${magicalAbility.name}`);
      parts.push(`Attitude: ${attitudeTowardMagic.name}`);
      return `<div class="npc-section npc-magic"><strong>Magical Profile:</strong> ${parts.join(' | ')}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-magical-info">
        <strong>Magical Traditions & Supernatural:</strong>
        <div><em>Magical Ability:</em> ${StringUtils.escapeHTML(magicalAbility.name)} - ${StringUtils.escapeHTML(magicalAbility.description)}</div>
        ${isCaster ? '<div class="caster-tag"><strong>Spellcaster</strong></div>' : ''}
        ${tradition ? `<div><em>Tradition:</em> ${StringUtils.escapeHTML(tradition.name)} - ${StringUtils.escapeHTML(tradition.description)}</div>` : ''}
        ${source ? `<div><em>Magic Source:</em> ${StringUtils.escapeHTML(source.name)} - ${StringUtils.escapeHTML(source.description)}</div>` : ''}
        ${education ? `<div><em>Magical Education:</em> ${StringUtils.escapeHTML(education.name)} - ${StringUtils.escapeHTML(education.description)}</div>` : ''}
        ${specialization ? `<div><em>Specialization:</em> ${StringUtils.escapeHTML(specialization.name)} - ${StringUtils.escapeHTML(specialization.description)}</div>` : ''}
        ${supernaturalConnection ? `<div><em>Supernatural Connection:</em> ${StringUtils.escapeHTML(supernaturalConnection.name)} - ${StringUtils.escapeHTML(supernaturalConnection.description)}</div>` : ''}
        <div><em>Attitude Toward Magic:</em> ${StringUtils.escapeHTML(attitudeTowardMagic.name)} - ${StringUtils.escapeHTML(attitudeTowardMagic.description)}</div>
      </div>
    `;
  }

  /**
   * Format family section
   */
  static formatFamily(info, detailLevel) {
    if (!info) return '';

    const { familyStatus, siblings, siblingRelationship, parentalRelationship, childrenStatus, parentingStyle, familySecret, familyTradition, familyReputation, hasLivingFamily } = info;

    if (detailLevel === "standard") {
      const parts = [];
      parts.push(familyStatus.name);
      if (siblings.id !== "only-child") parts.push(siblings.name);
      if (childrenStatus && childrenStatus.id !== "no-children") parts.push(childrenStatus.name);
      return `<div class="npc-section npc-family"><strong>Family:</strong> ${parts.join(', ')}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-family-info">
        <strong>Family Background:</strong>
        <div><em>Family Status:</em> ${StringUtils.escapeHTML(familyStatus.name)} - ${StringUtils.escapeHTML(familyStatus.description)}</div>
        ${!hasLivingFamily ? '<div class="warning"><em>No living family</em></div>' : ''}
        <div><em>Siblings:</em> ${StringUtils.escapeHTML(siblings.name)} ${siblingRelationship ? `(${siblingRelationship.name})` : ''}</div>
        <div><em>Parental Relationship:</em> ${StringUtils.escapeHTML(parentalRelationship.name)} - ${StringUtils.escapeHTML(parentalRelationship.description)}</div>
        ${childrenStatus ? `<div><em>Children:</em> ${StringUtils.escapeHTML(childrenStatus.name)} - ${StringUtils.escapeHTML(childrenStatus.description)}</div>` : ''}
        ${parentingStyle ? `<div><em>Parenting Style:</em> ${StringUtils.escapeHTML(parentingStyle.name)} - ${StringUtils.escapeHTML(parentingStyle.description)}</div>` : ''}
        ${familySecret ? `<div class="family-secret"><em>Family Secret:</em> ${StringUtils.escapeHTML(familySecret.name)} - ${StringUtils.escapeHTML(familySecret.description)}</div>` : ''}
        <div><em>Family Tradition:</em> ${StringUtils.escapeHTML(familyTradition.name)} - ${StringUtils.escapeHTML(familyTradition.description)}</div>
        <div><em>Family Reputation:</em> ${StringUtils.escapeHTML(familyReputation.name)} - ${StringUtils.escapeHTML(familyReputation.description)}</div>
      </div>
    `;
  }

  /**
   * Format group role section
   */
  static formatGroupRole(info, detailLevel) {
    if (!info) return '';

    const { isPartOfGroup, role, cohesion, conflict, bond, purpose, leadershipStyle, groupSecret } = info;

    if (!isPartOfGroup) {
      if (detailLevel === "cinematic") {
        return `<div class="npc-section npc-group-role"><strong>Group Affiliation:</strong> <em>Not currently part of any formal group</em></div>`;
      }
      return '';
    }

    if (detailLevel === "standard") {
      return `<div class="npc-section npc-group"><strong>Group Role:</strong> ${role.name}</div>`;
    }

    // Cinematic
    return `
      <div class="npc-section npc-group-role">
        <strong>Group Dynamics:</strong>
        <div><em>Role in Group:</em> ${StringUtils.escapeHTML(role.name)} - ${StringUtils.escapeHTML(role.description)}</div>
        ${leadershipStyle ? `<div><em>Leadership Style:</em> ${StringUtils.escapeHTML(leadershipStyle.name)} - ${StringUtils.escapeHTML(leadershipStyle.description)}</div>` : ''}
        <div><em>Group Purpose:</em> ${StringUtils.escapeHTML(purpose.name)} - ${StringUtils.escapeHTML(purpose.description)}</div>
        <div><em>Group Cohesion:</em> ${StringUtils.escapeHTML(cohesion.name)} - ${StringUtils.escapeHTML(cohesion.description)}</div>
        <div><em>Bond with Group:</em> ${StringUtils.escapeHTML(bond.name)} - ${StringUtils.escapeHTML(bond.description)}</div>
        ${conflict ? `<div><em>Internal Conflict:</em> ${StringUtils.escapeHTML(conflict.name)} - ${StringUtils.escapeHTML(conflict.description)}</div>` : ''}
        ${groupSecret ? `<div class="group-secret"><em>Group Secret:</em> ${StringUtils.escapeHTML(groupSecret.name)} - ${StringUtils.escapeHTML(groupSecret.description)}</div>` : ''}
      </div>
    `;
  }

  /**
   * Format development tracking section
   */
  static formatDevelopmentTracking(info, detailLevel) {
    if (!info || detailLevel !== "cinematic") return '';

    const { potentialArc, currentStage, relationshipProgression, beliefChange, skillProgression, reputationChange, personalGrowth, arcProgress } = info;

    return `
      <div class="npc-section npc-development-tracking gm-only">
        <strong>Character Development (GM Guide):</strong>
        <div><em>Potential Arc:</em> ${StringUtils.escapeHTML(potentialArc.name)} - ${StringUtils.escapeHTML(potentialArc.description)}</div>
        <div><em>Current Stage:</em> ${StringUtils.capitalize(currentStage)} (${arcProgress}% complete)</div>
        ${potentialArc.stages ? `<div><em>Arc Stages:</em> ${potentialArc.stages.join(' → ')}</div>` : ''}
        <div><em>Relationship Progression:</em> ${StringUtils.escapeHTML(relationshipProgression.name)} - ${StringUtils.escapeHTML(relationshipProgression.description)}</div>
        ${beliefChange ? `<div><em>Belief Change Potential:</em> ${StringUtils.escapeHTML(beliefChange.name)} - ${StringUtils.escapeHTML(beliefChange.description)}</div>` : ''}
        <div><em>Skill Progression:</em> ${StringUtils.escapeHTML(skillProgression.name)}</div>
        ${reputationChange ? `<div><em>Reputation Change:</em> ${StringUtils.escapeHTML(reputationChange.name)}</div>` : ''}
        <div><em>Personal Growth Focus:</em> ${StringUtils.escapeHTML(personalGrowth.name)} - ${StringUtils.escapeHTML(personalGrowth.description)}</div>
      </div>
    `;
  }

  /**
   * Format quest info section
   */
  static formatQuestInfo(info, detailLevel) {
    if (!info || detailLevel !== "cinematic") return '';

    const { canOfferQuest, questType, chainStructure, rewardType, complication, motivation, hasOngoingQuest, ongoingStatus, questsCompleted } = info;

    if (!canOfferQuest) {
      return `<div class="npc-section npc-quest-info gm-only"><strong>Quest Potential (GM Guide):</strong> <em>This NPC is unlikely to offer quests</em></div>`;
    }

    return `
      <div class="npc-section npc-quest-info gm-only">
        <strong>Quest Potential (GM Guide):</strong>
        <div><em>Quest Type:</em> ${StringUtils.escapeHTML(questType.name)} - ${StringUtils.escapeHTML(questType.description)}</div>
        ${questType.stages ? `<div><em>Quest Stages:</em> ${questType.stages.join(' → ')}</div>` : ''}
        <div><em>Chain Structure:</em> ${StringUtils.escapeHTML(chainStructure.name)} - ${StringUtils.escapeHTML(chainStructure.description)}</div>
        <div><em>Typical Reward:</em> ${StringUtils.escapeHTML(rewardType.name)} - ${StringUtils.escapeHTML(rewardType.description)}</div>
        ${complication ? `<div><em>Potential Complication:</em> ${StringUtils.escapeHTML(complication.name)} - ${StringUtils.escapeHTML(complication.description)}</div>` : ''}
        <div><em>Quest Giver Motivation:</em> ${StringUtils.escapeHTML(motivation.name)} - ${StringUtils.escapeHTML(motivation.description)}</div>
        ${hasOngoingQuest ? `<div class="ongoing-quest"><em>Ongoing Quest Status:</em> ${StringUtils.escapeHTML(ongoingStatus.name)} (${questsCompleted} completed so far)</div>` : ''}
      </div>
    `;
  }

  /**
   * Format relationship tracking section
   */
  static formatRelationshipTracking(info, detailLevel) {
    if (!info || detailLevel !== "cinematic") return '';

    const { currentAttitude, currentTrust, relationshipPoints, loyaltyTrigger, betrayalTrigger, reconciliationPath, attitudeHistory } = info;

    return `
      <div class="npc-section npc-relationship-tracking gm-only">
        <strong>Relationship System (GM Guide):</strong>
        <div><em>Starting Attitude:</em> ${StringUtils.escapeHTML(currentAttitude.name)} (${currentAttitude.value}) - ${StringUtils.escapeHTML(currentAttitude.description)}</div>
        <div><em>Behavior:</em> ${StringUtils.escapeHTML(currentAttitude.behavior)}</div>
        <div><em>Social DC Modifier:</em> ${currentAttitude.dcModifier}</div>
        <div><em>Trust Level:</em> ${StringUtils.escapeHTML(currentTrust.name)} - ${StringUtils.escapeHTML(currentTrust.description)}</div>
        <div><em>Will Share:</em> ${StringUtils.escapeHTML(currentTrust.willingToShare)}</div>
        <div><em>Relationship Points:</em> ${relationshipPoints} (affects attitude changes)</div>
        <div><em>Loyalty Trigger:</em> ${StringUtils.escapeHTML(loyaltyTrigger.name)} - ${StringUtils.escapeHTML(loyaltyTrigger.description)}</div>
        <div><em>Effect:</em> ${StringUtils.escapeHTML(loyaltyTrigger.effect)}</div>
        <div><em>Betrayal Risk:</em> ${StringUtils.escapeHTML(betrayalTrigger.name)} - ${StringUtils.escapeHTML(betrayalTrigger.description)}</div>
        <div><em>Likelihood:</em> ${StringUtils.escapeHTML(betrayalTrigger.likelihood)}</div>
        <div><em>If Wronged:</em> ${StringUtils.escapeHTML(reconciliationPath.name)} - ${StringUtils.escapeHTML(reconciliationPath.outcome)}</div>
      </div>
    `;
  }
}
