/**
 * PF2e Narrative Seeds - Combat Generator
 * Generates combat narrative descriptions with lazy-loaded data
 */

import { NarrativeSeedGenerator, RandomUtils, StringUtils, ToneFilter } from '../utils.js';
import { NarrativeSeedsSettings } from '../settings.js';
import { AnatomyDetector } from './anatomy-detector.js';
import { DamageDetector } from './damage-detector.js';
import { DefenseDetector } from './defense-detector.js';
import { PerformanceMonitor } from '../performance-monitor.js';
import {
  getLocation,
  getDamageVerb,
  getDamageEffect,
  getWeaponType,
  getLocationAnatomy,
  getRangedWeaponCategory,
  getMeleeWeaponCategory,
  getOpeningSentence,
  getDefenseOpenings,
  getRangedOpeningSentence,
  getMeleeOpeningSentence,
  getSizeDifference,
  isNonLethalAttack,
  getSizeModifier
} from './combat-data-helpers.js';

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
   * @returns {Promise<Object>} Narrative seed
   */
  async constructSeed(context) {
    return await PerformanceMonitor.measureAsync('combat-generation', async () => {
      try {
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
          try {
            switch(detailLevel) {
              case "minimal":
                description = await this.generateMinimal(anatomy, outcome, damageType, varietyMode);
                break;
              case "standard":
                description = await this.generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message);
                break;
              case "detailed":
                description = await this.generateDetailed(anatomy, outcome, damageType, target, varietyMode, item, attacker, defense, message);
                break;
              case "cinematic":
                description = await this.generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message);
                break;
              default:
                description = await this.generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message);
            }
          } catch (error) {
            console.error("PF2e Narrative Seeds | Error generating description:", error);
            // Fallback to simple description
            description = this.generateFallback(outcome, target, attacker);
            break;
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
      } catch (error) {
        console.error("PF2e Narrative Seeds | Critical error in constructSeed:", error);
        // Return basic fallback
        return this.generateFallbackSeed(context);
      }
    });
  }

  /**
   * Apply size difference modifier to description
   * @param {string} description - Base description
   * @param {string} sizeDiff - Size difference (same, larger, smaller, much-larger, much-smaller)
   * @param {string} outcome - Outcome type
   * @param {string} varietyMode - Variety setting
   * @returns {Promise<string>} Modified description
   */
  async applySizeModifier(description, sizeDiff, outcome, varietyMode = 'high') {
    if (sizeDiff === 'same' || !description) return description;

    // Don't modify failures - size doesn't matter if you miss
    if (outcome === 'failure' || outcome === 'criticalFailure') return description;

    // Load and apply size modifier from JSON
    const modifier = await getSizeModifier(sizeDiff, varietyMode);
    if (modifier) {
      return description + modifier;
    }

    return description;
  }

  /**
   * Apply non-lethal modifier to description
   * @param {string} description - Base description
   * @param {boolean} isNonLethal - Whether attack is non-lethal
   * @returns {string} Modified description
   */
  applyNonLethalModifier(description, isNonLethal) {
    if (!isNonLethal || !description) return description;

    // Replace lethal-sounding words with non-lethal equivalents
    let modified = description;

    // Critical injuries -> stunning impacts
    modified = modified.replace(/fatal/gi, 'stunning');
    modified = modified.replace(/lethal/gi, 'powerful');
    modified = modified.replace(/deadly/gi, 'forceful');
    modified = modified.replace(/kills?/gi, 'incapacitates');
    modified = modified.replace(/slays?/gi, 'subdues');
    modified = modified.replace(/mortal/gi, 'incapacitating');
    modified = modified.replace(/death/gi, 'unconsciousness');

    // Wounds -> impacts
    modified = modified.replace(/\bwound(s|ed|ing)?\b/gi, (match) => {
      if (match.toLowerCase().includes('wound')) {
        const suffix = match.slice(5);
        return 'bruise' + suffix;
      }
      return match;
    });

    // Bleeding -> bruising
    modified = modified.replace(/bleed(s|ing)?\b/gi, 'bruising');
    modified = modified.replace(/\bblood\b/gi, 'impact');

    // Cutting -> striking
    modified = modified.replace(/\bcut(s)?\b/gi, (match) => match.endsWith('s') ? 'strikes' : 'strike');
    modified = modified.replace(/\bslice(s|d)?\b/gi, (match) => {
      if (match.endsWith('d')) return 'struck';
      return match.endsWith('s') ? 'strikes' : 'strike';
    });

    return modified;
  }

  /**
   * Generate fallback description when data loading fails
   * @param {string} outcome - Outcome type
   * @param {Object} target - Target actor
   * @param {Object} attacker - Attacker actor
   * @returns {string} Simple fallback description
   */
  generateFallback(outcome, target, attacker) {
    const targetName = target?.name || "the target";
    const attackerName = attacker?.name || "The attacker";

    const fallbacks = {
      criticalSuccess: `${attackerName} critically hits ${targetName}!`,
      success: `${attackerName} hits ${targetName}.`,
      failure: `${attackerName} misses ${targetName}.`,
      criticalFailure: `${attackerName} critically misses ${targetName}!`
    };

    return fallbacks[outcome] || "Attack resolves.";
  }

  /**
   * Generate complete fallback seed object
   * @param {Object} context - Generation context
   * @returns {Object} Fallback seed
   */
  generateFallbackSeed(context) {
    const { outcome, target, attacker, anatomy, damageType } = context;

    return {
      description: this.generateFallback(outcome, target, attacker),
      anatomy: anatomy || "humanoid",
      anatomyDisplay: null,
      damageType: damageType || "bludgeoning",
      outcome: outcome || "success",
      targetName: target?.name || "Unknown",
      attackerName: attacker?.name || "Unknown",
      detailLevel: "minimal",
      tone: "standard"
    };
  }

  /**
   * Generate minimal description
   * @returns {Promise<string>}
   */
  async generateMinimal(anatomy, outcome, damageType, varietyMode) {
    const location = await getLocation(anatomy, outcome, varietyMode);
    if (!location) return "Strike!";

    return StringUtils.capitalizeFirst(location);
  }

  /**
   * Generate standard description
   * @returns {Promise<string>}
   */
  async generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message = null) {
    // Get components in parallel for 80% speed improvement
    const [location, verb, effect] = await Promise.all([
      getLocation(anatomy, outcome, varietyMode),
      getDamageVerb(damageType, outcome, varietyMode),
      getDamageEffect(damageType, outcome, varietyMode)
    ]);
    const locationAnatomy = getLocationAnatomy(location);
    const weaponType = getWeaponType(damageType, item, "second", message);

    if (!location) return "Your attack connects!";

    // Check if this is a ranged weapon
    const rangedCategory = getRangedWeaponCategory(item, message);
    const meleeCategory = !rangedCategory ? getMeleeWeaponCategory(item, message) : null;

    // Get random opening sentence
    let opening;

    // For ranged weapons, use specialized ranged opening sentences
    if (rangedCategory) {
      const targetName = target ? target.name : "the target";
      const attackerName = attacker ? attacker.name : "The attacker";
      opening = await getRangedOpeningSentence(rangedCategory, 'standard', outcome, { attackerName, targetName, weaponType });

      // If we got a ranged opening, check if it's a complete sentence
      if (opening) {
        // Ranged openings are often complete sentences, so return early for failures
        if (outcome === 'failure' || outcome === 'criticalFailure') {
          return opening;
        }
        // For successes, continue to add location/damage details
      }
    } else if (meleeCategory) {
      // For melee weapons, use specialized melee opening sentences
      const targetName = target ? target.name : "the target";
      const attackerName = attacker ? attacker.name : "The attacker";
      opening = await getMeleeOpeningSentence(meleeCategory, 'standard', outcome, { attackerName, targetName, weaponType });

      // If we got a melee opening for failures, return early
      if (opening && (outcome === 'failure' || outcome === 'criticalFailure')) {
        return opening;
      }
    }

    // For failures/critical failures, use defense-aware openings if available (and if no weapon-specific opening was used)
    if (!opening && (outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = await getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (defenseOpenings && defenseOpenings.length > 0) {
        // Select random opening from defense-aware sentences
        const targetName = target ? target.name : "the target";
        const attackerName = attacker ? attacker.name : "The attacker";
        opening = RandomUtils.selectRandom(defenseOpenings, varietyMode, `defense-opening-${outcome}-${defense.missReason}`);
        // Replace template variables with StringUtils.interpolate
        opening = StringUtils.interpolate(opening, { attackerName, targetName, weaponType });
        return opening; // Defense-aware openings are complete sentences
      }
    }

    // Fall back to standard opening sentences if no weapon-specific opening was found
    if (!opening) {
      opening = await getOpeningSentence('standard', outcome, { weaponType });
    }

    // Construct based on outcome
    let description;
    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          description = `${opening} ${verb} their ${location}! ${effect} A critical hit!`;
        } else if (verb) {
          description = `${opening} ${verb} their ${location} with brutal force! A devastating critical strike!`;
        } else if (effect) {
          description = `${opening} striking their ${location} with crushing power! ${effect}`;
        } else {
          description = `${opening} striking their ${location} with devastating force! A perfect critical hit!`;
        }
        break;

      case "success":
        if (verb && effect) {
          description = `${opening} ${verb} their ${location}. ${effect}`;
        } else if (verb) {
          description = `${opening} ${verb} their ${location}, connecting solidly!`;
        } else if (effect) {
          description = `${opening} hitting their ${location}. ${effect}`;
        } else {
          description = `${opening} hitting their ${location} cleanly!`;
        }
        break;

      case "failure":
        // Provide more descriptive failure text
        const targetName = target ? target.name : "the target";
        description = `${opening} ${location}. ${targetName} manages to avoid the worst of it, the attack missing narrowly as they react at the last moment.`;
        break;

      case "criticalFailure":
        // Provide more descriptive critical failure text
        const targetNameCrit = target ? target.name : "the target";
        description = `${opening} ${location}! ${targetNameCrit} easily avoids the poorly executed attack, leaving the attacker exposed and off-balance!`;
        break;

      default:
        description = `${weaponType} targets their ${location}.`;
    }

    // Apply modifiers
    const sizeDiff = getSizeDifference(attacker, target);
    const nonLethal = isNonLethalAttack(item, message);

    description = await this.applySizeModifier(description, sizeDiff, outcome, varietyMode);
    description = this.applyNonLethalModifier(description, nonLethal);

    return description;
  }

  /**
   * Generate detailed description
   * @returns {Promise<string>}
   */
  async generateDetailed(anatomy, outcome, damageType, target, varietyMode, item, attacker, defense, message = null) {
    // Get components in parallel for 80% speed improvement
    const [location, verb, effect] = await Promise.all([
      getLocation(anatomy, outcome, varietyMode),
      getDamageVerb(damageType, outcome, varietyMode),
      getDamageEffect(damageType, outcome, varietyMode)
    ]);
    const locationAnatomy = getLocationAnatomy(location);
    const weaponType = getWeaponType(damageType, item, "second", message);
    const targetName = target.name;

    if (!location) return `Your attack finds ${targetName}!`;

    // Check if this is a ranged weapon
    const rangedCategory = getRangedWeaponCategory(item, message);
    const meleeCategory = !rangedCategory ? getMeleeWeaponCategory(item, message) : null;

    // Get random opening sentence
    let opening;

    // For ranged weapons, use specialized ranged opening sentences
    if (rangedCategory) {
      const attackerName = attacker ? attacker.name : "The attacker";
      opening = await getRangedOpeningSentence(rangedCategory, 'detailed', outcome, { attackerName, targetName, weaponType });

      // If we got a ranged opening, check if it's a complete sentence
      if (opening) {
        // Ranged openings are often complete sentences, so return early for failures
        if (outcome === 'failure' || outcome === 'criticalFailure') {
          return opening;
        }
        // For successes, continue to add location/damage details
      }
    } else if (meleeCategory) {
      // For melee weapons, use specialized melee opening sentences
      const attackerName = attacker ? attacker.name : "The attacker";
      opening = await getMeleeOpeningSentence(meleeCategory, 'detailed', outcome, { attackerName, targetName, weaponType });

      // If we got a melee opening for failures, return early
      if (opening && (outcome === 'failure' || outcome === 'criticalFailure')) {
        return opening;
      }
    }

    // For failures/critical failures, use defense-aware openings if available (and if no weapon-specific opening was used)
    if (!opening && (outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = await getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (defenseOpenings && defenseOpenings.length > 0) {
        const attackerName = attacker ? attacker.name : "The attacker";
        opening = RandomUtils.selectRandom(defenseOpenings, varietyMode, `defense-opening-${outcome}-${defense.missReason}`);
        // Replace template variables with StringUtils.interpolate
        opening = StringUtils.interpolate(opening, { attackerName, targetName, weaponType });
        return opening; // Defense-aware openings are complete sentences
      }
    }

    // Fall back to standard opening sentences if no weapon-specific opening was found
    if (!opening) {
      opening = await getOpeningSentence('detailed', outcome, { weaponType, targetName });
    }

    let description;
    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          description = `${opening} ${verb} their ${location} with crushing force! ${effect} The devastating strike leaves them reeling!`;
        } else if (verb) {
          description = `${opening} ${verb} their ${location} with brutal precision! A devastating critical hit that connects perfectly!`;
        } else if (effect) {
          description = `${opening} slamming into their ${location} with overwhelming power! ${effect} A critical strike!`;
        } else {
          description = `${opening} crashing into their ${location} with devastating force! The perfect critical hit leaves them staggered!`;
        }
        break;

      case "success":
        if (verb && effect) {
          description = `${opening} ${verb} their ${location}. ${effect} A solid, effective blow!`;
        } else if (verb) {
          description = `${opening} ${verb} their ${location}, the attack connecting cleanly and dealing significant damage!`;
        } else if (effect) {
          description = `${opening} landing on their ${location} with force. ${effect}`;
        } else {
          description = `${opening} striking their ${location} cleanly, the attack finding its mark and dealing damage!`;
        }
        break;

      case "failure":
        // Provide more descriptive failure text with target name and explanation
        if (defense && defense.missReason) {
          const reason = defense.missReason === 'armor' ? `${targetName}'s armor deflects the blow` :
                        defense.missReason === 'shield' ? `${targetName} blocks with their shield` :
                        defense.missReason === 'dodge' ? `${targetName} dodges with practiced precision` :
                        `${targetName} reacts in time`;
          description = `${opening} ${location}, but ${reason}. The attack fails to find its mark, leaving ${targetName} unscathed.`;
        } else {
          description = `${opening} ${location}, but ${targetName} sees it coming and shifts at the last second. The attack whistles harmlessly past, missing by mere inches.`;
        }
        break;

      case "criticalFailure":
        // Provide more descriptive critical failure text
        if (defense && defense.missReason) {
          const reason = defense.missReason === 'armor' ? `${targetName}'s armor easily turns aside the clumsy strike` :
                        defense.missReason === 'shield' ? `${targetName} contemptuously blocks with their shield` :
                        defense.missReason === 'dodge' ? `${targetName} effortlessly sidesteps the telegraphed attack` :
                        `${targetName} barely needs to react`;
          description = `${opening} ${location}! ${reason}. The attacker stumbles, completely off-balance from the failed strike!`;
        } else {
          description = `${opening} ${location}! ${targetName} doesn't even need to try hard to avoid the poorly executed attack. The attacker is left stumbling and exposed, having wasted their opportunity!`;
        }
        break;

      default:
        description = `${weaponType} moves toward ${targetName}'s ${location}.`;
    }

    // Apply modifiers
    const sizeDiff = getSizeDifference(attacker, target);
    const nonLethal = isNonLethalAttack(item, message);

    description = await this.applySizeModifier(description, sizeDiff, outcome, varietyMode);
    description = this.applyNonLethalModifier(description, nonLethal);

    return description;
  }

  /**
   * Generate cinematic description
   * @returns {Promise<string>}
   */
  async generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message = null) {
    // Get components in parallel for 80% speed improvement
    const [location, verb, effect] = await Promise.all([
      getLocation(anatomy, outcome, varietyMode),
      getDamageVerb(damageType, outcome, varietyMode),
      getDamageEffect(damageType, outcome, varietyMode)
    ]);
    const locationAnatomy = getLocationAnatomy(location);
    const weaponType = getWeaponType(damageType, item, "third", message);
    const targetName = target.name;
    const attackerName = attacker ? attacker.name : "The attacker";

    if (!location) return `${attackerName}'s attack finds its mark on ${targetName}!`;

    // Check if this is a ranged weapon
    const rangedCategory = getRangedWeaponCategory(item, message);
    const meleeCategory = !rangedCategory ? getMeleeWeaponCategory(item, message) : null;

    // Get random opening sentence
    let opening;

    // For ranged weapons, use specialized ranged opening sentences
    if (rangedCategory) {
      opening = await getRangedOpeningSentence(rangedCategory, 'cinematic', outcome, { attackerName, targetName, weaponType });

      // If we got a ranged opening, check if it's a complete sentence
      if (opening) {
        // Ranged openings are often complete sentences, so return early for failures
        if (outcome === 'failure' || outcome === 'criticalFailure') {
          return opening;
        }
        // For successes, continue to add location/damage details
      }
    } else if (meleeCategory) {
      // For melee weapons, use specialized melee opening sentences
      opening = await getMeleeOpeningSentence(meleeCategory, 'cinematic', outcome, { attackerName, targetName, weaponType });

      // If we got a melee opening for failures, return early
      if (opening && (outcome === 'failure' || outcome === 'criticalFailure')) {
        return opening;
      }
    }

    // For failures/critical failures, use defense-aware openings if available (and if no weapon-specific opening was used)
    if (!opening && (outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = await getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (defenseOpenings && defenseOpenings.length > 0) {
        opening = RandomUtils.selectRandom(defenseOpenings, varietyMode, `defense-opening-${outcome}-${defense.missReason}`);
        // Replace template variables with StringUtils.interpolate
        opening = StringUtils.interpolate(opening, { attackerName, targetName, weaponType });
        return opening; // Defense-aware openings are complete sentences
      }
    }

    // Fall back to standard opening sentences if no weapon-specific opening was found
    if (!opening) {
      opening = await getOpeningSentence('cinematic', outcome, { attackerName, targetName, weaponType });
    }

    let description;
    switch(outcome) {
      case "criticalSuccess":
        if (verb && effect) {
          description = `${opening} ${weaponType} ${verb} ${targetName}'s ${location} with crushing force! ${effect} ${targetName} staggers backward, the impact overwhelming!`;
        } else if (verb) {
          description = `${opening} ${weaponType} ${verb} ${targetName}'s ${location} with devastating precision! The critical strike leaves ${targetName} reeling from the perfect hit!`;
        } else if (effect) {
          description = `${opening} ${weaponType} crashes into ${targetName}'s ${location} with overwhelming force! ${effect} A devastating critical strike!`;
        } else {
          description = `${opening} ${weaponType} crashes into ${targetName}'s ${location} with devastating precision! The perfect strike finds its mark with catastrophic effect, leaving ${targetName} staggering from the blow!`;
        }
        break;

      case "success":
        if (verb && effect) {
          description = `${opening} ${weaponType} lands solidly, ${verb} ${targetName}'s ${location}. ${effect}`;
        } else if (verb) {
          description = `${opening} ${weaponType} ${verb} ${targetName}'s ${location}. The attack finds its mark, dealing solid damage!`;
        } else if (effect) {
          description = `${opening} ${weaponType} connects firmly with ${targetName}'s ${location}. ${effect}`;
        } else {
          description = `${opening} ${weaponType} connects with ${targetName}'s ${location}, delivering a solid, effective hit that leaves its mark!`;
        }
        break;

      case "failure":
        // More dramatic, descriptive failure for cinematic mode
        if (defense && defense.missReason) {
          const defenseDesc = defense.missReason === 'armor' ? `${targetName}'s armor deflects the strike with a resounding clang` :
                             defense.missReason === 'shield' ? `${targetName} interposes their shield at the perfect moment` :
                             defense.missReason === 'dodge' ? `${targetName} flows like water around the incoming attack` :
                             `${targetName} reacts with battle-honed instincts`;
          description = `${opening} ${weaponType} arcs toward ${location}, but ${defenseDesc}! The attack fails to connect, ${targetName} emerging unscathed from the exchange!`;
        } else {
          description = `${opening} ${weaponType} arcs toward ${location}, but ${targetName} reads the attack perfectly! With a fluid motion, they evade at the last possible moment, the weapon missing by mere inches. ${targetName} capitalizes on the opening!`;
        }
        break;

      case "criticalFailure":
        // Even more dramatic critical failure for cinematic mode
        if (defense && defense.missReason) {
          const defenseDesc = defense.missReason === 'armor' ? `${targetName}'s armor turns it aside like it was nothing` :
                             defense.missReason === 'shield' ? `${targetName} casually deflects it with their shield` :
                             defense.missReason === 'dodge' ? `${targetName} sidesteps with contemptuous ease` :
                             `${targetName} barely needs to acknowledge the threat`;
          description = `${opening} ${weaponType} flails wildly ${location}, but ${defenseDesc}! The completely botched attack leaves the wielder stumbling and exposed, having achieved nothing but embarrassment!`;
        } else {
          description = `${opening} ${weaponType} swings in a wild, uncontrolled arc ${location}, but ${targetName} doesn't even break stride! The catastrophically poor attack misses by a mile, leaving the attacker off-balance and vulnerable. Combat instructors everywhere weep at such incompetence!`;
        }
        break;

      default:
        description = `${attackerName} moves to strike ${targetName}...`;
    }

    // Apply modifiers
    const sizeDiff = getSizeDifference(attacker, target);
    const nonLethal = isNonLethalAttack(item, message);

    description = await this.applySizeModifier(description, sizeDiff, outcome, varietyMode);
    description = this.applyNonLethalModifier(description, nonLethal);

    return description;
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
