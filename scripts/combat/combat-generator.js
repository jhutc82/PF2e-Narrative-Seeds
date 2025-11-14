/**
 * PF2e Narrative Seeds - Combat Generator
 * Generates combat narrative descriptions
 */

import { NarrativeSeedGenerator, RandomUtils, StringUtils, ToneFilter } from '../utils.js';
import { NarrativeSeedsSettings } from '../settings.js';
import { AnatomyDetector } from './anatomy-detector.js';
import { DamageDetector } from './damage-detector.js';
import { getLocation } from '../../data/combat/locations.js';
import { getDamageVerb, getDamageEffect, getWeaponType } from '../../data/combat/damage-descriptors.js';

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

    return {
      anatomy,
      damageType,
      outcome,
      target,
      attacker: params.actor,
      item
    };
  }

  /**
   * Construct narrative seed from context
   * @param {Object} context
   * @returns {Object}
   */
  constructSeed(context) {
    const { anatomy, damageType, outcome, target, attacker, item } = context;

    // Get settings
    const detailLevel = NarrativeSeedsSettings.get("combatDetailLevel");
    const tone = NarrativeSeedsSettings.get("contentTone");
    const varietyMode = NarrativeSeedsSettings.get("varietyMode");
    const showAnatomy = NarrativeSeedsSettings.get("showAnatomyType");

    // Generate description based on detail level
    let description = "";

    switch(detailLevel) {
      case "minimal":
        description = this.generateMinimal(anatomy, outcome, damageType, varietyMode);
        break;
      case "standard":
        description = this.generateStandard(anatomy, outcome, damageType, varietyMode);
        break;
      case "detailed":
        description = this.generateDetailed(anatomy, outcome, damageType, target, varietyMode);
        break;
      case "cinematic":
        description = this.generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode);
        break;
      default:
        description = this.generateStandard(anatomy, outcome, damageType, varietyMode);
    }

    // Apply tone filter
    description = ToneFilter.apply(description, tone);

    return {
      description,
      anatomy,
      anatomyDisplay: showAnatomy ? AnatomyDetector.getDisplayName(anatomy) : null,
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
  generateStandard(anatomy, outcome, damageType, varietyMode) {
    // Get components
    const location = getLocation(anatomy, outcome, varietyMode);
    const verb = getDamageVerb(damageType, outcome, varietyMode);
    const effect = getDamageEffect(damageType, outcome, varietyMode);
    const weaponType = getWeaponType(damageType);

    if (!location) return "Your attack connects!";

    // Construct based on outcome
    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          return `${weaponType} strikes true, ${verb} their ${location}! ${effect}`;
        } else {
          return `${weaponType} strikes their ${location} with devastating force!`;
        }

      case "success":
        if (verb && effect) {
          return `${weaponType} lands solidly, ${verb} their ${location}. ${effect}`;
        } else {
          return `${weaponType} hits their ${location}.`;
        }

      case "failure":
        return `${weaponType} swings ${location}.`;

      case "criticalFailure":
        return `${weaponType} goes ${location}!`;

      default:
        return `${weaponType} targets their ${location}.`;
    }
  }

  /**
   * Generate detailed description
   * @returns {string}
   */
  generateDetailed(anatomy, outcome, damageType, target, varietyMode) {
    const location = getLocation(anatomy, outcome, varietyMode);
    const verb = getDamageVerb(damageType, outcome, varietyMode);
    const effect = getDamageEffect(damageType, outcome, varietyMode);
    const weaponType = getWeaponType(damageType);
    const targetName = target.name;

    if (!location) return `Your attack finds ${targetName}!`;

    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          return `${weaponType} strikes true against ${targetName}, ${verb} their ${location} with crushing force! ${effect} The strike is devastating!`;
        } else {
          return `${weaponType} connects perfectly with ${targetName}'s ${location}! A critical hit!`;
        }

      case "success":
        if (verb && effect) {
          return `${weaponType} lands solidly against ${targetName}, ${verb} their ${location}. ${effect}`;
        } else {
          return `${weaponType} strikes ${targetName}'s ${location} cleanly.`;
        }

      case "failure":
        return `${weaponType} swings toward ${targetName} but goes ${location}, missing narrowly.`;

      case "criticalFailure":
        return `${weaponType} swings wildly at ${targetName}, going ${location}! A complete miss!`;

      default:
        return `${weaponType} moves toward ${targetName}'s ${location}.`;
    }
  }

  /**
   * Generate cinematic description
   * @returns {string}
   */
  generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode) {
    const location = getLocation(anatomy, outcome, varietyMode);
    const verb = getDamageVerb(damageType, outcome, varietyMode);
    const effect = getDamageEffect(damageType, outcome, varietyMode);
    const weaponType = getWeaponType(damageType);
    const targetName = target.name;
    const attackerName = attacker ? attacker.name : "The attacker";

    if (!location) return `${attackerName}'s attack finds its mark on ${targetName}!`;

    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          return `Time seems to slow as ${attackerName}'s attack arcs through the air. ${weaponType} ${verb} ${targetName}'s ${location} with crushing force! ${effect} ${targetName} staggers backward, the impact overwhelming!`;
        } else {
          return `${attackerName} seizes the perfect opening! ${weaponType} crashes into ${targetName}'s ${location} with devastating precision! A perfect, critical strike!`;
        }

      case "success":
        if (verb && effect) {
          return `${attackerName} presses the attack! ${weaponType} lands solidly, ${verb} ${targetName}'s ${location}. ${effect}`;
        } else {
          return `${attackerName} strikes true! ${weaponType} connects with ${targetName}'s ${location}, a solid hit!`;
        }

      case "failure":
        return `${attackerName} swings hard, but ${targetName} shifts at the last moment! ${weaponType} swings ${location}, the attack missing by mere inches!`;

      case "criticalFailure":
        return `${attackerName} commits to the strike, but ${targetName} easily evades! ${weaponType} goes ${location}, completely missing the mark in an embarrassing fumble!`;

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
