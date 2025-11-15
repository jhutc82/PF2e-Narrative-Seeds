/**
 * PF2e Narrative Seeds - Combat Generator
 * Generates combat narrative descriptions
 */

import { NarrativeSeedGenerator, RandomUtils, StringUtils, ToneFilter } from '../utils.js';
import { NarrativeSeedsSettings } from '../settings.js';
import { AnatomyDetector } from './anatomy-detector.js';
import { DamageDetector } from './damage-detector.js';
import { DefenseDetector } from './defense-detector.js';
import { getLocation } from '../../data/combat/locations.js';
import { getDamageVerb, getDamageEffect, getWeaponType, getLocationAnatomy } from '../../data/combat/damage-descriptors.js';
import { getOpeningSentence } from '../../data/combat/opening-sentences.js';
import { getDefenseOpenings } from '../../data/combat/defense-opening-sentences.js';

/**
 * Combat narrative generator
 */
export class CombatNarrativeGenerator extends NarrativeSeedGenerator {

  constructor() {
    super("Combat");
  }

  /**
   * Detect context from attack parameters
   * @param {Object} params - { message, item, actor, target }
   * @returns {Promise<Object>}
   */
  async detectContext(params) {
    const { message, item, target } = params;

    if (!target) {
      console.warn("PF2e Narrative Seeds | No target provided for combat narration");
      return null;
    }

    // Detect anatomy type
    const anatomy = AnatomyDetector.detect(target);

    // Detect damage type
    const damageType = DamageDetector.detect(item, message);

    // Get outcome from message
    const outcome = this.getOutcome(message);

    if (!outcome) {
      console.warn("PF2e Narrative Seeds | Could not determine outcome");
      return null;
    }

    // Detect defensive capabilities (for failures/critical failures)
    let defense = null;
    if (outcome === 'failure' || outcome === 'criticalFailure') {
      defense = DefenseDetector.detect(target);
    }

    return {
      anatomy,
      damageType,
      outcome,
      target,
      attacker: params.actor,
      item,
      defense
    };
  }

  /**
   * Construct narrative seed from context
   * @param {Object} context
   * @returns {Object}
   */
  constructSeed(context) {
    const { anatomy, damageType, outcome, target, attacker, item, defense } = context;

    // Get settings
    const detailLevel = NarrativeSeedsSettings.get("combatDetailLevel");
    const tone = NarrativeSeedsSettings.get("contentTone");
    const varietyMode = NarrativeSeedsSettings.get("varietyMode");
    const showAnatomy = NarrativeSeedsSettings.get("showAnatomyType");

    // Generate description with repetition prevention
    let description = "";
    let attempts = 0;
    const maxAttempts = 5;

    do {
      // Generate description based on detail level
      switch(detailLevel) {
        case "minimal":
          description = this.generateMinimal(anatomy, outcome, damageType, varietyMode);
          break;
        case "standard":
          description = this.generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense);
          break;
        case "detailed":
          description = this.generateDetailed(anatomy, outcome, damageType, target, varietyMode, item, attacker, defense);
          break;
        case "cinematic":
          description = this.generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode, item, defense);
          break;
        default:
          description = this.generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense);
      }

      // Apply tone filter
      description = ToneFilter.apply(description, tone);

      attempts++;

      // Check if message was recently used
      if (!RandomUtils.isMessageRecentlyUsed(description, varietyMode)) {
        break; // Message is unique, use it
      }

      // If we've hit max attempts, use it anyway to avoid infinite loop
      if (attempts >= maxAttempts) {
        console.warn("PF2e Narrative Seeds | Could not generate unique message after", maxAttempts, "attempts");
        break;
      }
    } while (attempts < maxAttempts);

    // Record the message as used
    RandomUtils.recordMessage(description, varietyMode);

    // Get anatomy display name
    let anatomyDisplay = null;
    if (showAnatomy) {
      if (typeof anatomy === 'string') {
        anatomyDisplay = AnatomyDetector.getDisplayName(anatomy);
      } else if (anatomy && anatomy.base) {
        // Build display name with modifiers
        const baseName = AnatomyDetector.getDisplayName(anatomy.base);
        if (anatomy.modifiers && anatomy.modifiers.length > 0) {
          const modifierNames = anatomy.modifiers.map(m => AnatomyDetector.getDisplayName(m)).join(' ');
          anatomyDisplay = `${modifierNames} ${baseName}`;
        } else {
          anatomyDisplay = baseName;
        }
      }
    }

    return {
      description,
      anatomy,
      anatomyDisplay,
      damageType,
      outcome,
      targetName: target.name,
      attackerName: attacker ? attacker.name : "Unknown",
      detailLevel,
      tone
    };
  }

  /**
   * Generate minimal description
   * @returns {string}
   */
  generateMinimal(anatomy, outcome, damageType, varietyMode) {
    const location = getLocation(anatomy, outcome, varietyMode);
    if (!location) return "Strike!";

    return StringUtils.capitalizeFirst(location);
  }

  /**
   * Generate standard description
   * @returns {string}
   */
  generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense) {
    // Get components
    const location = getLocation(anatomy, outcome, varietyMode);
    const verb = getDamageVerb(damageType, outcome, varietyMode);
    const effect = getDamageEffect(damageType, outcome, varietyMode);
    const weaponType = getWeaponType(damageType, item);

    if (!location) return "Your attack connects!";

    // Get random opening sentence
    let opening;

    // For failures/critical failures, use defense-aware openings if available
    if ((outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (defenseOpenings && defenseOpenings.length > 0) {
        // Select random opening from defense-aware sentences
        const targetName = target ? target.name : "the target";
        const attackerName = attacker ? attacker.name : "The attacker";
        opening = RandomUtils.choice(defenseOpenings);
        // Replace template variables
        opening = opening.replace(/\$\{attackerName\}/g, attackerName);
        opening = opening.replace(/\$\{targetName\}/g, targetName);
        opening = opening.replace(/\$\{weaponType\}/g, weaponType);
        return opening; // Defense-aware openings are complete sentences
      }
    }

    // Fall back to standard opening sentences
    opening = getOpeningSentence('standard', outcome, { weaponType });

    // Construct based on outcome
    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          return `${opening} ${verb} their ${location}! ${effect}`;
        } else {
          return `${opening} striking their ${location} with devastating force!`;
        }

      case "success":
        if (verb && effect) {
          return `${opening} ${verb} their ${location}. ${effect}`;
        } else {
          return `${opening} hitting their ${location}.`;
        }

      case "failure":
        return `${opening} ${location}.`;

      case "criticalFailure":
        return `${opening} ${location}!`;

      default:
        return `${weaponType} targets their ${location}.`;
    }
  }

  /**
   * Generate detailed description
   * @returns {string}
   */
  generateDetailed(anatomy, outcome, damageType, target, varietyMode, item, attacker, defense) {
    const location = getLocation(anatomy, outcome, varietyMode);
    const verb = getDamageVerb(damageType, outcome, varietyMode);
    const effect = getDamageEffect(damageType, outcome, varietyMode);
    const weaponType = getWeaponType(damageType, item);
    const targetName = target.name;

    if (!location) return `Your attack finds ${targetName}!`;

    // Get random opening sentence
    let opening;

    // For failures/critical failures, use defense-aware openings if available
    if ((outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (defenseOpenings && defenseOpenings.length > 0) {
        const attackerName = attacker ? attacker.name : "The attacker";
        opening = RandomUtils.choice(defenseOpenings);
        // Replace template variables
        opening = opening.replace(/\$\{attackerName\}/g, attackerName);
        opening = opening.replace(/\$\{targetName\}/g, targetName);
        opening = opening.replace(/\$\{weaponType\}/g, weaponType);
        return opening; // Defense-aware openings are complete sentences
      }
    }

    // Fall back to standard opening sentences
    opening = getOpeningSentence('detailed', outcome, { weaponType, targetName });

    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          return `${opening} ${verb} their ${location} with crushing force! ${effect} The strike is devastating!`;
        } else {
          return `${opening} slamming into their ${location}! A critical hit!`;
        }

      case "success":
        if (verb && effect) {
          return `${opening} ${verb} their ${location}. ${effect}`;
        } else {
          return `${opening} landing on their ${location} cleanly.`;
        }

      case "failure":
        return `${opening} ${location}, missing narrowly.`;

      case "criticalFailure":
        return `${opening} ${location}! A complete miss!`;

      default:
        return `${weaponType} moves toward ${targetName}'s ${location}.`;
    }
  }

  /**
   * Generate cinematic description
   * @returns {string}
   */
  generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode, item, defense) {
    const location = getLocation(anatomy, outcome, varietyMode);
    const locationAnatomy = getLocationAnatomy(location);
    const verb = getDamageVerb(damageType, outcome, varietyMode, locationAnatomy);
    const effect = getDamageEffect(damageType, outcome, varietyMode);
    const weaponType = getWeaponType(damageType, item, "third");
    const targetName = target.name;
    const attackerName = attacker ? attacker.name : "The attacker";

    if (!location) return `${attackerName}'s attack finds its mark on ${targetName}!`;

    // Get random opening sentence
    let opening;

    // For failures/critical failures, use defense-aware openings if available
    if ((outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (defenseOpenings && defenseOpenings.length > 0) {
        opening = RandomUtils.choice(defenseOpenings);
        // Replace template variables
        opening = opening.replace(/\$\{attackerName\}/g, attackerName);
        opening = opening.replace(/\$\{targetName\}/g, targetName);
        opening = opening.replace(/\$\{weaponType\}/g, weaponType);
        return opening; // Defense-aware openings are complete sentences
      }
    }

    // Fall back to standard opening sentences
    opening = getOpeningSentence('cinematic', outcome, { attackerName, targetName, weaponType });

    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          return `${opening} ${weaponType} ${verb} ${targetName}'s ${location} with crushing force! ${effect} ${targetName} staggers backward, the impact overwhelming!`;
        } else {
          return `${opening} ${weaponType} crashes into ${targetName}'s ${location} with devastating precision! A perfect, critical strike!`;
        }

      case "success":
        if (verb && effect) {
          return `${opening} ${weaponType} lands solidly, ${verb} ${targetName}'s ${location}. ${effect}`;
        } else {
          return `${opening} ${weaponType} connects with ${targetName}'s ${location}, a solid hit!`;
        }

      case "failure":
        return `${opening} ${weaponType} swings ${location}, the attack missing by mere inches!`;

      case "criticalFailure":
        return `${opening} ${weaponType} goes ${location}, completely missing the mark in an embarrassing fumble!`;

      default:
        return `${attackerName} moves to strike ${targetName}...`;
    }
  }

  /**
   * Get outcome from message
   * @param {ChatMessage} message
   * @returns {string|null}
   */
  getOutcome(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return null;

    const context = flags.context;
    if (!context) return null;

    // PF2e uses degree of success
    const degreeOfSuccess = context.outcome || flags.degreeOfSuccess;

    switch(degreeOfSuccess) {
      case "criticalSuccess":
      case 3:
        return "criticalSuccess";
      case "success":
      case 2:
        return "success";
      case "failure":
      case 1:
        return "failure";
      case "criticalFailure":
      case 0:
        return "criticalFailure";
      default:
        // Try to parse from rolls
        if (message.rolls && message.rolls.length > 0) {
          const roll = message.rolls[0];
          if (roll.options?.degreeOfSuccess !== undefined) {
            return this.mapDegreeOfSuccess(roll.options.degreeOfSuccess);
          }
        }
        return null;
    }
  }

  /**
   * Map degree of success number to string
   * @param {number} degree
   * @returns {string}
   */
  mapDegreeOfSuccess(degree) {
    switch(degree) {
      case 3: return "criticalSuccess";
      case 2: return "success";
      case 1: return "failure";
      case 0: return "criticalFailure";
      default: return "success";
    }
  }
}
