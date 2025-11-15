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

    if (!message) {
      console.warn("PF2e Narrative Seeds | No message provided for combat narration");
      return null;
    }

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
      defense,
      message
    };
  }

  /**
   * Construct narrative seed from context
   * @param {Object} context
   * @returns {Object}
   */
  constructSeed(context) {
    const { anatomy, damageType, outcome, target, attacker, item, defense, message } = context;

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
          description = this.generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message);
          break;
        case "detailed":
          description = this.generateDetailed(anatomy, outcome, damageType, target, varietyMode, item, attacker, defense, message);
          break;
        case "cinematic":
          description = this.generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message);
          break;
        default:
          description = this.generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message);
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
  generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message = null) {
    // Get components
    const location = getLocation(anatomy, outcome, varietyMode);
    const locationAnatomy = getLocationAnatomy(location);
    const verb = getDamageVerb(damageType, outcome, varietyMode, locationAnatomy);
    const effect = getDamageEffect(damageType, outcome, varietyMode, locationAnatomy);
    const weaponType = getWeaponType(damageType, item, "second", message);

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
        opening = RandomUtils.selectRandom(defenseOpenings, varietyMode, `defense-opening-${outcome}-${defense.missReason}`);
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
          return `${opening} ${verb} their ${location}! ${effect} A critical hit!`;
        } else if (verb) {
          return `${opening} ${verb} their ${location} with brutal force! A devastating critical strike!`;
        } else if (effect) {
          return `${opening} striking their ${location} with crushing power! ${effect}`;
        } else {
          return `${opening} striking their ${location} with devastating force! A perfect critical hit!`;
        }

      case "success":
        if (verb && effect) {
          return `${opening} ${verb} their ${location}. ${effect}`;
        } else if (verb) {
          return `${opening} ${verb} their ${location}, connecting solidly!`;
        } else if (effect) {
          return `${opening} hitting their ${location}. ${effect}`;
        } else {
          return `${opening} hitting their ${location} cleanly!`;
        }

      case "failure":
        // Provide more descriptive failure text
        const targetName = target ? target.name : "the target";
        return `${opening} ${location}. ${targetName} manages to avoid the worst of it, the attack missing narrowly as they react at the last moment.`;

      case "criticalFailure":
        // Provide more descriptive critical failure text
        const targetNameCrit = target ? target.name : "the target";
        return `${opening} ${location}! ${targetNameCrit} easily avoids the poorly executed attack, leaving the attacker exposed and off-balance!`;

      default:
        return `${weaponType} targets their ${location}.`;
    }
  }

  /**
   * Generate detailed description
   * @returns {string}
   */
  generateDetailed(anatomy, outcome, damageType, target, varietyMode, item, attacker, defense, message = null) {
    const location = getLocation(anatomy, outcome, varietyMode);
    const locationAnatomy = getLocationAnatomy(location);
    const verb = getDamageVerb(damageType, outcome, varietyMode, locationAnatomy);
    const effect = getDamageEffect(damageType, outcome, varietyMode, locationAnatomy);
    const weaponType = getWeaponType(damageType, item, "second", message);
    const targetName = target.name;

    if (!location) return `Your attack finds ${targetName}!`;

    // Get random opening sentence
    let opening;

    // For failures/critical failures, use defense-aware openings if available
    if ((outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (defenseOpenings && defenseOpenings.length > 0) {
        const attackerName = attacker ? attacker.name : "The attacker";
        opening = RandomUtils.selectRandom(defenseOpenings, varietyMode, `defense-opening-${outcome}-${defense.missReason}`);
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
          return `${opening} ${verb} their ${location} with crushing force! ${effect} The devastating strike leaves them reeling!`;
        } else if (verb) {
          return `${opening} ${verb} their ${location} with brutal precision! A devastating critical hit that connects perfectly!`;
        } else if (effect) {
          return `${opening} slamming into their ${location} with overwhelming power! ${effect} A critical strike!`;
        } else {
          return `${opening} crashing into their ${location} with devastating force! The perfect critical hit leaves them staggered!`;
        }

      case "success":
        if (verb && effect) {
          return `${opening} ${verb} their ${location}. ${effect} A solid, effective blow!`;
        } else if (verb) {
          return `${opening} ${verb} their ${location}, the attack connecting cleanly and dealing significant damage!`;
        } else if (effect) {
          return `${opening} landing on their ${location} with force. ${effect}`;
        } else {
          return `${opening} striking their ${location} cleanly, the attack finding its mark and dealing damage!`;
        }

      case "failure":
        // Provide more descriptive failure text with target name and explanation
        if (defense && defense.missReason) {
          const reason = defense.missReason === 'armor' ? `${targetName}'s armor deflects the blow` :
                        defense.missReason === 'shield' ? `${targetName} blocks with their shield` :
                        defense.missReason === 'dodge' ? `${targetName} dodges with practiced precision` :
                        `${targetName} reacts in time`;
          return `${opening} ${location}, but ${reason}. The attack fails to find its mark, leaving ${targetName} unscathed.`;
        }
        return `${opening} ${location}, but ${targetName} sees it coming and shifts at the last second. The attack whistles harmlessly past, missing by mere inches.`;

      case "criticalFailure":
        // Provide more descriptive critical failure text
        if (defense && defense.missReason) {
          const reason = defense.missReason === 'armor' ? `${targetName}'s armor easily turns aside the clumsy strike` :
                        defense.missReason === 'shield' ? `${targetName} contemptuously blocks with their shield` :
                        defense.missReason === 'dodge' ? `${targetName} effortlessly sidesteps the telegraphed attack` :
                        `${targetName} barely needs to react`;
          return `${opening} ${location}! ${reason}. The attacker stumbles, completely off-balance from the failed strike!`;
        }
        return `${opening} ${location}! ${targetName} doesn't even need to try hard to avoid the poorly executed attack. The attacker is left stumbling and exposed, having wasted their opportunity!`;

      default:
        return `${weaponType} moves toward ${targetName}'s ${location}.`;
    }
  }

  /**
   * Generate cinematic description
   * @returns {string}
   */
  generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message = null) {
    const location = getLocation(anatomy, outcome, varietyMode);
    const locationAnatomy = getLocationAnatomy(location);
    const verb = getDamageVerb(damageType, outcome, varietyMode, locationAnatomy);
    const effect = getDamageEffect(damageType, outcome, varietyMode, locationAnatomy);
    const weaponType = getWeaponType(damageType, item, "third", message);
    const targetName = target.name;
    const attackerName = attacker ? attacker.name : "The attacker";

    if (!location) return `${attackerName}'s attack finds its mark on ${targetName}!`;

    // Get random opening sentence
    let opening;

    // For failures/critical failures, use defense-aware openings if available
    if ((outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (defenseOpenings && defenseOpenings.length > 0) {
        opening = RandomUtils.selectRandom(defenseOpenings, varietyMode, `defense-opening-${outcome}-${defense.missReason}`);
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
        } else if (verb) {
          return `${opening} ${weaponType} ${verb} ${targetName}'s ${location} with devastating precision! The critical strike leaves ${targetName} reeling from the perfect hit!`;
        } else if (effect) {
          return `${opening} ${weaponType} crashes into ${targetName}'s ${location} with overwhelming force! ${effect} A devastating critical strike!`;
        } else {
          return `${opening} ${weaponType} crashes into ${targetName}'s ${location} with devastating precision! The perfect strike finds its mark with catastrophic effect, leaving ${targetName} staggering from the blow!`;
        }

      case "success":
        if (verb && effect) {
          return `${opening} ${weaponType} lands solidly, ${verb} ${targetName}'s ${location}. ${effect}`;
        } else if (verb) {
          return `${opening} ${weaponType} ${verb} ${targetName}'s ${location}. The attack finds its mark, dealing solid damage!`;
        } else if (effect) {
          return `${opening} ${weaponType} connects firmly with ${targetName}'s ${location}. ${effect}`;
        } else {
          return `${opening} ${weaponType} connects with ${targetName}'s ${location}, delivering a solid, effective hit that leaves its mark!`;
        }

      case "failure":
        // More dramatic, descriptive failure for cinematic mode
        if (defense && defense.missReason) {
          const defenseDesc = defense.missReason === 'armor' ? `${targetName}'s armor deflects the strike with a resounding clang` :
                             defense.missReason === 'shield' ? `${targetName} interposes their shield at the perfect moment` :
                             defense.missReason === 'dodge' ? `${targetName} flows like water around the incoming attack` :
                             `${targetName} reacts with battle-honed instincts`;
          return `${opening} ${weaponType} arcs toward ${location}, but ${defenseDesc}! The attack fails to connect, ${targetName} emerging unscathed from the exchange!`;
        }
        return `${opening} ${weaponType} arcs toward ${location}, but ${targetName} reads the attack perfectly! With a fluid motion, they evade at the last possible moment, the weapon missing by mere inches. ${targetName} capitalizes on the opening!`;

      case "criticalFailure":
        // Even more dramatic critical failure for cinematic mode
        if (defense && defense.missReason) {
          const defenseDesc = defense.missReason === 'armor' ? `${targetName}'s armor turns it aside like it was nothing` :
                             defense.missReason === 'shield' ? `${targetName} casually deflects it with their shield` :
                             defense.missReason === 'dodge' ? `${targetName} sidesteps with contemptuous ease` :
                             `${targetName} barely needs to acknowledge the threat`;
          return `${opening} ${weaponType} flails wildly ${location}, but ${defenseDesc}! The completely botched attack leaves the wielder stumbling and exposed, having achieved nothing but embarrassment!`;
        }
        return `${opening} ${weaponType} swings in a wild, uncontrolled arc ${location}, but ${targetName} doesn't even break stride! The catastrophically poor attack misses by a mile, leaving the attacker off-balance and vulnerable. Combat instructors everywhere weep at such incompetence!`;

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
