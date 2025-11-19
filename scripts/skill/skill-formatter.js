/**
 * PF2e Narrative Seeds - Skill Formatter
 * Formats skill action narratives for chat display
 *
 * @module skill/skill-formatter
 * @author Justin Hutchinson
 */

import { NarrativeSeedsSettings } from '../settings.js';

/**
 * Skill narrative formatter
 * Formats generated narratives for chat cards
 */
export class SkillFormatter {

  /**
   * Generate HTML for skill narrative
   * @param {Object} seed - Generated narrative seed
   * @returns {string} HTML for chat card
   */
  static generateHTML(seed) {
    if (!seed || !seed.text) return '';

    const showDetectedFeats = NarrativeSeedsSettings.get("showDetectedFeats");
    const detailLevel = seed.detailLevel || 'standard';

    let html = '<div class="pf2e-narrative-seeds skill-narrative">';

    // Header with icon
    html += '<div class="narrative-header">';
    html += '<span class="narrative-icon">🎯</span>';
    html += '<span class="narrative-title">Skill Action</span>';
    html += '</div>';

    // Main narrative text
    html += '<div class="narrative-text">';
    html += seed.text;
    html += '</div>';

    // Metadata footer
    html += '<div class="narrative-footer">';
    html += `<span class="narrative-action">${seed.actionName || seed.action}</span>`;

    if (seed.outcome) {
      html += ` • <span class="narrative-outcome ${seed.outcome}">${this.formatOutcome(seed.outcome)}</span>`;
    }

    if (seed.feats && seed.feats.length > 0 && showDetectedFeats) {
      html += ` • <span class="narrative-feats">${seed.feats.join(', ')}</span>`;
    }

    html += '</div>';

    // Regenerate button
    html += '<div class="narrative-controls">';
    html += '<button class="narrative-regenerate">↻ Regenerate</button>';
    html += '</div>';

    html += '</div>';

    return html;
  }

  /**
   * Format outcome for display
   * @param {string} outcome - Outcome slug
   * @returns {string} Formatted outcome
   */
  static formatOutcome(outcome) {
    const outcomeMap = {
      'criticalSuccess': 'Critical Success',
      'success': 'Success',
      'failure': 'Failure',
      'criticalFailure': 'Critical Failure'
    };

    return outcomeMap[outcome] || outcome;
  }

  /**
   * Get CSS classes for narrative
   * @param {Object} seed - Generated narrative seed
   * @returns {string} CSS classes
   */
  static getCSSClasses(seed) {
    const classes = ['pf2e-narrative-seeds', 'skill-narrative'];

    if (seed.outcome) {
      classes.push(`outcome-${seed.outcome}`);
    }

    if (seed.detailLevel) {
      classes.push(`detail-${seed.detailLevel}`);
    }

    if (seed.feats && seed.feats.length > 0) {
      classes.push('has-feats');
    }

    return classes.join(' ');
  }

  /**
   * Format feat list for display
   * @param {Array<string>} feats - Feat slugs
   * @returns {string} Formatted feat list
   */
  static formatFeats(feats) {
    if (!feats || feats.length === 0) return '';

    const formatted = feats.map(feat => {
      // Capitalize and format
      return feat.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });

    return formatted.join(', ');
  }
}
