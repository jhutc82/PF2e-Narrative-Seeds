/**
 * PF2e Narrative Seeds - Context Filters
 * Prevents semantic nonsense by filtering effects/verbs based on anatomy and damage type
 * Examples: No bleeding skeletons, no fire "cutting", no incorporeal flesh
 */

export class ContextFilters {

  /**
   * Filter effects based on anatomy and damage type context
   * @param {Array<string>} effects - Array of possible effects
   * @param {Object} context - Context with anatomy, damageType, location
   * @returns {Array<string>} Filtered effects
   */
  static filterEffects(effects, context) {
    if (!effects || effects.length === 0) return effects;

    const { anatomy, damageType, location } = context;

    return effects.filter(effect => {
      // Filter 1: Anatomy-based filtering
      if (!this.isEffectValidForAnatomy(effect, anatomy)) {
        return false;
      }

      // Filter 2: Damage type compatibility
      if (!this.isEffectValidForDamageType(effect, damageType)) {
        return false;
      }

      // Filter 3: Location-specific filtering
      if (!this.isEffectValidForLocation(effect, location)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if effect makes sense for anatomy type
   * @param {string} effect - Effect description
   * @param {string|Object} anatomy - Anatomy type or object
   * @returns {boolean} True if valid
   */
  static isEffectValidForAnatomy(effect, anatomy) {
    const lower = effect.toLowerCase();
    const anatomyBase = typeof anatomy === 'string' ? anatomy : anatomy?.base || 'humanoid';

    // Blood effects - only for living creatures with blood
    if (lower.includes('blood') || lower.includes('crimson') || lower.includes('bleed') ||
        lower.includes('hemorrhag') || lower.includes('arterial')) {
      const noBloodTypes = [
        'skeleton', 'zombie', 'incorporeal', 'construct', 'golem',
        'air-elemental', 'fire-elemental', 'earth-elemental', 'water-elemental',
        'ooze', 'plant', 'fungus', 'will-o-wisp', 'animated'
      ];
      if (noBloodTypes.some(type => anatomyBase.toLowerCase().includes(type))) {
        return false;
      }
    }

    // Bone/flesh/muscle effects - not for incorporeal/elemental/ooze
    if (lower.includes('bone') || lower.includes('flesh') || lower.includes('muscle') ||
        lower.includes('skin') || lower.includes('tissue')) {
      const noPhysicalBodyTypes = [
        'incorporeal', 'air-elemental', 'fire-elemental',
        'ooze', 'amorphous', 'will-o-wisp', 'gaseous'
      ];
      if (noPhysicalBodyTypes.some(type => anatomyBase.toLowerCase().includes(type))) {
        return false;
      }
    }

    // Pain/screaming/crying - not for constructs/most undead
    if (lower.includes('scream') || lower.includes('cry out') || lower.includes('gasp') ||
        lower.includes('wince') || lower.includes('agony') || lower.includes('pain')) {
      const noPainTypes = ['construct', 'golem', 'skeleton', 'incorporeal', 'animated'];
      if (noPainTypes.some(type => anatomyBase.toLowerCase().includes(type))) {
        return false;
      }
    }

    // Breathing/choking - not for undead/constructs/elementals
    if (lower.includes('breath') || lower.includes('gasp') || lower.includes('choke')) {
      const noBreathingTypes = [
        'skeleton', 'zombie', 'construct', 'golem', 'incorporeal',
        'elemental', 'animated', 'will-o-wisp'
      ];
      if (noBreathingTypes.some(type => anatomyBase.toLowerCase().includes(type))) {
        return false;
      }
    }

    // Organ-specific effects - not for constructs/undead/elementals
    if (lower.includes('organ') || lower.includes('vital') || lower.includes('intestine')) {
      const noOrgansTypes = [
        'skeleton', 'construct', 'golem', 'incorporeal', 'elemental',
        'ooze', 'plant', 'animated', 'will-o-wisp'
      ];
      if (noOrgansTypes.some(type => anatomyBase.toLowerCase().includes(type))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if effect matches damage type
   * @param {string} effect - Effect description
   * @param {string} damageType - Damage type
   * @returns {boolean} True if valid
   */
  static isEffectValidForDamageType(effect, damageType) {
    const lower = effect.toLowerCase();

    // Bleeding effects - only for physical damage types
    if (lower.includes('blood') || lower.includes('bleed') || lower.includes('hemorrhag')) {
      const physicalDamage = ['slashing', 'piercing', 'bludgeoning'];
      if (!physicalDamage.includes(damageType)) {
        return false;
      }
    }

    // Burning/scorching/smoldering - fire damage only
    if (lower.includes('burn') || lower.includes('smolder') || lower.includes('scorch') ||
        lower.includes('sear') || lower.includes('char')) {
      if (damageType !== 'fire') {
        return false;
      }
    }

    // Freezing/frost/ice - cold damage only
    if (lower.includes('freeze') || lower.includes('frost') || lower.includes('ice') ||
        lower.includes('chill')) {
      if (damageType !== 'cold') {
        return false;
      }
    }

    // Electricity/shocking - electricity damage only
    if (lower.includes('shock') || lower.includes('jolt') || lower.includes('electr') ||
        lower.includes('spark')) {
      if (damageType !== 'electricity') {
        return false;
      }
    }

    // Acid/corrosion - acid damage only
    if (lower.includes('acid') || lower.includes('corrod') || lower.includes('dissolv') ||
        lower.includes('melt')) {
      if (damageType !== 'acid') {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if effect makes sense for specific location
   * @param {string} effect - Effect description
   * @param {string} location - Hit location
   * @returns {boolean} True if valid
   */
  static isEffectValidForLocation(effect, location) {
    if (!location) return true;

    const lower = effect.toLowerCase();
    const locationLower = location.toLowerCase();

    // Eye-specific: no "gaping wound" for eyes
    if (locationLower.includes('eye')) {
      if (lower.includes('gaping') || lower.includes('yawns open') ||
          lower.includes('wide wound')) {
        return false;
      }
    }

    // Head: avoid "limb" references
    if (locationLower.includes('head') || locationLower.includes('skull')) {
      if (lower.includes('limb dangles') || lower.includes('appendage')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Filter verbs based on damage type
   * @param {Array<string>} verbs - Array of possible verbs
   * @param {string} damageType - Damage type
   * @returns {Array<string>} Filtered verbs
   */
  static filterVerbs(verbs, damageType) {
    if (!verbs || verbs.length === 0) return verbs;

    return verbs.filter(verb => {
      const lower = verb.toLowerCase();

      // Slashing-specific verbs
      const slashingVerbs = ['cuts', 'slashes', 'cleaves', 'slices', 'carves', 'hacks', 'severs'];
      if (slashingVerbs.some(v => lower.includes(v))) {
        if (damageType !== 'slashing') {
          return false;
        }
      }

      // Piercing-specific verbs
      const piercingVerbs = ['pierces', 'punctures', 'impales', 'stabs', 'thrusts', 'skewers'];
      if (piercingVerbs.some(v => lower.includes(v))) {
        if (damageType !== 'piercing') {
          return false;
        }
      }

      // Bludgeoning-specific verbs
      const bludgeoningVerbs = ['crushes', 'smashes', 'pounds', 'batters', 'hammers', 'pulverizes'];
      if (bludgeoningVerbs.some(v => lower.includes(v))) {
        if (damageType !== 'bludgeoning') {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Filter verbs based on location anatomy
   * @param {Array<string>} verbs - Array of possible verbs
   * @param {string} location - Hit location
   * @returns {Array<string>} Filtered verbs
   */
  static filterVerbsByLocation(verbs, location) {
    if (!verbs || verbs.length === 0 || !location) return verbs;

    const locationLower = location.toLowerCase();

    return verbs.filter(verb => {
      const lower = verb.toLowerCase();

      // Eyes: can't be cleaved/hacked/chopped/split
      if (locationLower.includes('eye')) {
        const invalidVerbs = ['cleaves', 'hacks', 'chops', 'splits', 'bisects', 'severs'];
        if (invalidVerbs.some(v => lower.includes(v))) {
          return false;
        }
      }

      // Fingers/toes: avoid large-scale destruction verbs
      if (locationLower.includes('finger') || locationLower.includes('toe')) {
        const invalidVerbs = ['cleaves', 'bisects', 'rends'];
        if (invalidVerbs.some(v => lower.includes(v))) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get context-appropriate components with filtering applied
   * Returns filtered lists that make semantic sense
   * @param {Array<string>} verbs - Raw verb list
   * @param {Array<string>} effects - Raw effect list
   * @param {Object} context - Context object
   * @param {string|Object} context.anatomy - Anatomy type (string) or anatomy object with {base, modifiers}
   * @param {string} context.damageType - Damage type (slashing, piercing, bludgeoning, fire, etc.)
   * @param {string} context.location - Hit location on the body
   * @returns {{verbs: Array<string>, effects: Array<string>}} Filtered verbs and effects arrays
   */
  static applyContextFilters(verbs, effects, context) {
    const { anatomy, damageType, location } = context;

    // Store original counts
    const originalVerbCount = verbs?.length || 0;
    const originalEffectCount = effects?.length || 0;

    // Apply all filters
    let filteredVerbs = verbs;
    let filteredEffects = effects;

    // Filter verbs by damage type
    filteredVerbs = this.filterVerbs(filteredVerbs, damageType);

    // Filter verbs by location
    filteredVerbs = this.filterVerbsByLocation(filteredVerbs, location);

    // Filter effects by context
    filteredEffects = this.filterEffects(filteredEffects, context);

    // Fallback to unfiltered if we filtered out everything
    if (filteredVerbs.length === 0) {
      console.warn(`PF2e Narrative Seeds | Filtered out all ${originalVerbCount} verbs for ${damageType} at ${location}, using unfiltered`);
      filteredVerbs = verbs;
    }

    if (filteredEffects.length === 0) {
      console.warn(`PF2e Narrative Seeds | Filtered out all ${originalEffectCount} effects for ${anatomy?.base || anatomy} with ${damageType}, using unfiltered`);
      filteredEffects = effects;
    }

    return {
      verbs: filteredVerbs,
      effects: filteredEffects
    };
  }
}
