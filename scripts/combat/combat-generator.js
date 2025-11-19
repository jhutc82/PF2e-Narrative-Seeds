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
import { DataLoader } from '../data-loader.js';
import { TemplateEngine } from './template-engine.js';
import { ErrorNotifications } from '../error-notifications.js';
import { CombatMemory } from './combat-memory.js';
import { ComplicationManager } from './complication-manager.js';
import { DismembermentManager } from './dismemberment-manager.js';
import {
  getLocation,
  getDamageVerb,
  getDamageEffect,
  getContextualDamageVerb,
  getContextualDamageEffect,
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

        // Record attack in combat memory and get memory context
        // Use a unique identifier that combines ID and UUID to prevent name collisions
        const combatId = message?.combat?.id || 'default';
        const attackerId = attacker?.id || attacker?.uuid || `name-${attacker?.name || 'unknown'}`;
        const targetId = target?.id || target?.uuid || `name-${target?.name || 'unknown'}`;
        const memoryContext = CombatMemory.recordAttack(combatId, attackerId, targetId, outcome);

        // Generate description with repetition prevention
        let description = "";
        let attempts = 0;
        const maxAttempts = 5;

        do {
          // Generate description based on detail level
          try {
            switch(detailLevel) {
              case "minimal":
                description = await this.generateMinimal(anatomy, outcome, damageType, varietyMode, memoryContext);
                break;
              case "standard":
                description = await this.generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message, memoryContext);
                break;
              case "detailed":
                description = await this.generateDetailed(anatomy, outcome, damageType, target, varietyMode, item, attacker, defense, message, memoryContext);
                break;
              case "cinematic":
                description = await this.generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message, memoryContext);
                break;
              default:
                description = await this.generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message, memoryContext);
            }
          } catch (error) {
            ErrorNotifications.showError('generation', `Narrative generation failed (${detailLevel} mode). Using fallback.`, error);
            // Fallback to simple description
            description = this.generateFallback(outcome, target, attacker);
            break;
          }

          // Apply tone filter
          description = ToneFilter.apply(description, tone);

          // Capitalize all sentences and ensure proper punctuation
          description = StringUtils.capitalizeSentences(description);

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
            if (Array.isArray(anatomy.modifiers) && anatomy.modifiers.length > 0) {
              const modifierNames = anatomy.modifiers.map(m => AnatomyDetector.getDisplayName(m)).join(' ');
              anatomyDisplay = `${modifierNames} ${baseName}`;
            } else {
              anatomyDisplay = baseName;
            }
          }
        }

        // Generate complication if applicable
        // Pass full anatomy object to preserve modifiers (skeleton, zombie, etc.)
        const anatomyForFiltering = typeof anatomy === 'string' ? { base: anatomy, modifiers: [] } : anatomy;
        const complication = ComplicationManager.selectComplication({
          outcome,
          damageType,
          anatomy: anatomyForFiltering,
          attackerLevel: attacker?.level || attacker?.system?.details?.level?.value || 1
        });

        // Check for dismemberment (more severe than complications)
        const dismemberment = DismembermentManager.selectDismemberment(
          { message, target, actor: attacker, item },
          {
            outcome,
            damageType,
            anatomy: anatomyForFiltering
          }
        );

        // Debug logging for complications and dismemberment
        if (complication) {
          console.log("PF2e Narrative Seeds | Generated complication:", complication);
        }
        if (dismemberment) {
          console.log("PF2e Narrative Seeds | Generated dismemberment:", dismemberment);
        }

        return {
          description,
          anatomy,
          anatomyDisplay,
          damageType,
          outcome,
          targetName: StringUtils.formatActorName(target.name, target),
          attackerName: attacker ? StringUtils.formatActorName(attacker.name, attacker) : "Unknown",
          detailLevel,
          tone,
          complication,
          dismemberment
        };
      } catch (error) {
        ErrorNotifications.handleCriticalError('combat narrative generation', error);
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
    const targetName = target ? StringUtils.formatActorName(target.name, target) : "the target";
    const attackerName = attacker ? StringUtils.formatActorName(attacker.name, attacker) : "the attacker";

    const fallbacks = {
      criticalSuccess: `${attackerName} critically hits ${targetName}!`,
      success: `${attackerName} hits ${targetName}.`,
      failure: `${attackerName} misses ${targetName}.`,
      criticalFailure: `${attackerName} critically misses ${targetName}!`
    };

    const result = fallbacks[outcome] || "Attack resolves.";
    return StringUtils.capitalizeSentences(result);
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
      targetName: target ? StringUtils.formatActorName(target.name, target) : "Unknown",
      attackerName: attacker ? StringUtils.formatActorName(attacker.name, attacker) : "Unknown",
      detailLevel: "minimal",
      tone: "standard"
    };
  }

  /**
   * Generate minimal description
   * @returns {Promise<string>}
   */
  async generateMinimal(anatomy, outcome, damageType, varietyMode, memoryContext = null) {
    const location = await getLocation(anatomy, outcome, varietyMode);
    if (!location) return "Strike!";

    // Add dramatic flair for dramatic moments
    if (memoryContext?.isDramatic) {
      return StringUtils.capitalizeFirst(location) + "!";
    }

    return StringUtils.capitalizeFirst(location);
  }

  /**
   * Generate narrative description (shared implementation for all detail levels)
   * @private
   * @param {string} detailLevel - Detail level (standard, detailed, cinematic)
   * @param {Object} anatomy - Anatomy info
   * @param {string} outcome - Outcome type
   * @param {string} damageType - Damage type
   * @param {Object} target - Target actor
   * @param {Object} attacker - Attacker actor
   * @param {string} varietyMode - Variety setting
   * @param {Object} item - Attack item
   * @param {Object} defense - Defense info (for failures)
   * @param {Object} message - Chat message
   * @param {Object} memoryContext - Combat memory context for escalation
   * @returns {Promise<string>} Generated description
   */
  async generateNarrative(detailLevel, anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message = null, memoryContext = null) {
    // Get location and templates first
    const [location, templates] = await Promise.all([
      getLocation(anatomy, outcome, varietyMode),
      DataLoader.loadTemplates(detailLevel, outcome)
    ]);

    // Determine POV - use second person for all narratives
    const pov = 'second';
    const weaponType = getWeaponType(damageType, item, pov, message);
    const targetName = target ? StringUtils.formatActorName(target.name, target) : "the target";
    const attackerName = attacker ? StringUtils.formatActorName(attacker.name, attacker) : "the attacker";

    // Get contextual verb and effect with filtering applied
    const context = { anatomy, damageType, location };
    const [verb, effect] = await Promise.all([
      getContextualDamageVerb(damageType, outcome, varietyMode, context),
      getContextualDamageEffect(damageType, outcome, varietyMode, context)
    ]);

    // Early return if no location with detail-level specific fallback
    if (!location) {
      const fallbacks = {
        standard: "Your attack connects!",
        detailed: `Your attack finds ${targetName}!`,
        cinematic: `${attackerName}'s attack finds its mark on ${targetName}!`
      };
      return fallbacks[detailLevel] || "Your attack connects!";
    }

    // Check weapon categories
    const rangedCategory = getRangedWeaponCategory(item, message);
    const meleeCategory = !rangedCategory ? getMeleeWeaponCategory(item, message) : null;

    // Get opening sentence (ranged/melee-specific or standard)
    let opening;
    if (rangedCategory) {
      opening = await getRangedOpeningSentence(rangedCategory, detailLevel, outcome, { attackerName, targetName, weaponType });
      // For failures, ranged openings are often complete - return early
      if (opening && (outcome === 'failure' || outcome === 'criticalFailure')) {
        return opening;
      }
    } else if (meleeCategory) {
      opening = await getMeleeOpeningSentence(meleeCategory, detailLevel, outcome, { attackerName, targetName, weaponType });
      // For failures, melee openings may be complete - return early
      if (opening && (outcome === 'failure' || outcome === 'criticalFailure')) {
        return opening;
      }
    }

    // Defense-aware openings for failures (if no weapon-specific opening)
    if (!opening && (outcome === 'failure' || outcome === 'criticalFailure') && defense) {
      const defenseOpenings = await getDefenseOpenings(outcome, defense.missReason, 'cinematic');
      if (Array.isArray(defenseOpenings) && defenseOpenings.length > 0) {
        opening = RandomUtils.selectRandom(defenseOpenings, varietyMode, `defense-opening-${outcome}-${defense.missReason}`);
        opening = StringUtils.interpolate(opening, { attackerName, targetName, weaponType });
        return opening; // Defense-aware openings are complete
      }
    }

    // Fallback to standard opening
    if (!opening) {
      const openingContext = detailLevel === 'standard' ? { weaponType } :
                             detailLevel === 'detailed' ? { weaponType, targetName } :
                             { attackerName, targetName, weaponType };
      opening = await getOpeningSentence(detailLevel, outcome, openingContext);
    }

    // Select template and fill with components
    // Use memory context to influence template selection for dramatic moments
    let effectiveVarietyMode = varietyMode;
    if (memoryContext?.isDramatic && varietyMode === 'low') {
      effectiveVarietyMode = 'medium'; // Boost variety for dramatic moments
    }

    const templateObj = TemplateEngine.selectTemplate(templates, effectiveVarietyMode, `${detailLevel}-${outcome}`);

    // Handle case where no template is found
    if (!templateObj) {
      console.warn("PF2e Narrative Seeds | No template found, using simple description");
      return `${opening || "Strike"} ${location || ""}`.trim();
    }

    // Apply escalation modifiers to effect text
    let escalatedEffect = effect || "";
    if (memoryContext?.escalation >= 7 && escalatedEffect) {
      // High escalation: intensify effect with exclamation
      if (!escalatedEffect.endsWith('!')) {
        escalatedEffect = escalatedEffect.replace(/\.$/, '!');
      }
    }

    const components = {
      opening: opening || "",
      verb: verb || "strikes",
      effect: escalatedEffect,
      location: location || "body",
      weaponType,
      targetName,
      attackerName,
      damageType
    };

    let description = TemplateEngine.fillTemplate(templateObj, components);
    description = TemplateEngine.cleanOutput(description);

    // Add streak-based modifiers for dramatic moments
    if (memoryContext?.isDramatic && outcome === 'criticalSuccess') {
      // Breaking a losing streak with a crit deserves extra flair
      if (memoryContext.streak && memoryContext.streak.streakBroken && memoryContext.streak.consecutiveHits === 1) {
        description = description + " Finally!";
      }
    }

    // Apply modifiers
    const sizeDiff = getSizeDifference(attacker, target);
    const nonLethal = isNonLethalAttack(item, message);

    description = await this.applySizeModifier(description, sizeDiff, outcome, varietyMode);
    description = this.applyNonLethalModifier(description, nonLethal);

    return description;
  }

  /**
   * Generate standard description (convenience wrapper)
   * @returns {Promise<string>}
   * @see generateNarrative
   */
  async generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message = null, memoryContext = null) {
    return this.generateNarrative('standard', anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message, memoryContext);
  }

  /**
   * Generate detailed description (convenience wrapper)
   * @returns {Promise<string>}
   * @see generateNarrative
   */
  async generateDetailed(anatomy, outcome, damageType, target, varietyMode, item, attacker, defense, message = null, memoryContext = null) {
    return this.generateNarrative('detailed', anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message, memoryContext);
  }

  /**
   * Generate cinematic description (convenience wrapper)
   * @returns {Promise<string>}
   * @see generateNarrative
   */
  async generateCinematic(anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message = null, memoryContext = null) {
    return this.generateNarrative('cinematic', anatomy, outcome, damageType, target, attacker, varietyMode, item, defense, message, memoryContext);
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
        if (Array.isArray(message.rolls) && message.rolls.length > 0) {
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
