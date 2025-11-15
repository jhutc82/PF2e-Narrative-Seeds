/**
 * Defense Detector
 *
 * Analyzes a target's defensive capabilities to determine realistic miss reasons.
 * Considers armor, shields, dexterity, and natural armor.
 */

export class DefenseDetector {
  /**
   * Analyzes a target's defenses and determines what likely caused a miss
   * @param {Actor} target - The target actor
   * @returns {Object} Defense analysis with miss reason weights
   */
  static detect(target) {
    if (!target) {
      return this.getDefaultDefense();
    }

    const analysis = {
      hasArmor: false,
      armorType: null,
      armorName: null,
      hasShield: false,
      shieldRaised: false,
      shieldName: null,
      hasNaturalArmor: false,
      dexModifier: 0,
      missReason: 'miss', // Default to plain miss
      weights: {
        dodge: 0,
        armor: 0,
        shield: 0,
        naturalArmor: 0,
        miss: 30 // Base chance of attacker error
      }
    };

    // Get dexterity modifier
    try {
      analysis.dexModifier = target.system?.abilities?.dex?.mod || 0;
    } catch (e) {
      console.warn('PF2e Narrative Seeds: Could not read dex modifier', e);
    }

    // Check for equipped armor
    const equippedArmor = target.items?.find(item =>
      item.type === 'armor' &&
      item.system?.equipped === true
    );

    if (equippedArmor) {
      analysis.hasArmor = true;
      analysis.armorType = equippedArmor.system?.armorType?.value || 'medium';
      analysis.armorName = equippedArmor.name;

      // Weight based on armor type
      const armorWeights = {
        unarmored: 5,
        light: 15,
        medium: 25,
        heavy: 35
      };
      analysis.weights.armor = armorWeights[analysis.armorType] || 20;
    }

    // Check for equipped and raised shield
    const equippedShield = target.items?.find(item =>
      item.type === 'shield' &&
      item.system?.equipped === true
    );

    if (equippedShield) {
      analysis.hasShield = true;
      analysis.shieldName = equippedShield.name;

      // Check if shield is raised (PF2e tracks this in actor effects or conditions)
      analysis.shieldRaised = this.isShieldRaised(target);

      // Only give shield weight if it's actually raised
      if (analysis.shieldRaised) {
        analysis.weights.shield = 25;
      }
    }

    // Check for natural armor (certain creature traits indicate this)
    const traits = target.system?.traits?.value ||
                   target.system?.traits?.traits?.value ||
                   [];

    const naturalArmorTraits = [
      'dragon', 'construct', 'aberration', 'elemental',
      'giant', 'beast', 'animal', 'ooze', 'plant'
    ];

    analysis.hasNaturalArmor = traits.some(trait =>
      naturalArmorTraits.includes(trait.toLowerCase())
    );

    // Also check creature type for natural armor
    const creatureType = target.system?.details?.creatureType?.toLowerCase() || '';
    if (naturalArmorTraits.some(type => creatureType.includes(type))) {
      analysis.hasNaturalArmor = true;
    }

    if (analysis.hasNaturalArmor && !analysis.hasArmor) {
      // Natural armor gets weight if no worn armor
      analysis.weights.naturalArmor = 25;
    }

    // Calculate dodge weight based on dex modifier
    // Higher dex = much higher chance of dodge being the reason
    if (analysis.dexModifier >= 5) {
      analysis.weights.dodge = 40;
    } else if (analysis.dexModifier >= 4) {
      analysis.weights.dodge = 35;
    } else if (analysis.dexModifier >= 3) {
      analysis.weights.dodge = 30;
    } else if (analysis.dexModifier >= 2) {
      analysis.weights.dodge = 25;
    } else if (analysis.dexModifier >= 1) {
      analysis.weights.dodge = 20;
    } else if (analysis.dexModifier >= 0) {
      analysis.weights.dodge = 15;
    } else {
      // Negative dex = low dodge chance
      analysis.weights.dodge = 5;
    }

    // Select the miss reason based on weighted probabilities
    analysis.missReason = this.selectMissReason(analysis.weights);

    return analysis;
  }

  /**
   * Checks if a shield is currently raised
   * @param {Actor} target - The target actor
   * @returns {boolean} True if shield is raised
   */
  static isShieldRaised(target) {
    // Check for "Raise a Shield" effect/condition
    const effects = target.appliedEffects || target.effects || [];

    for (const effect of effects) {
      const name = effect.name?.toLowerCase() || effect.label?.toLowerCase() || '';
      if (name.includes('raise') && name.includes('shield')) {
        return true;
      }
    }

    // Alternative: check for shield AC bonus in breakdown
    try {
      const acBreakdown = target.system?.attributes?.ac?.breakdown || '';
      if (acBreakdown.toLowerCase().includes('shield')) {
        return true;
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return false;
  }

  /**
   * Selects a miss reason based on weighted probabilities
   * @param {Object} weights - Object with weights for each miss reason
   * @returns {string} The selected miss reason
   */
  static selectMissReason(weights) {
    const options = [];

    // Build weighted array
    for (const [reason, weight] of Object.entries(weights)) {
      if (weight > 0) {
        for (let i = 0; i < weight; i++) {
          options.push(reason);
        }
      }
    }

    // Random selection
    if (options.length === 0) {
      return 'miss';
    }

    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  /**
   * Returns default defense analysis when target is unavailable
   * @returns {Object} Default defense analysis
   */
  static getDefaultDefense() {
    return {
      hasArmor: false,
      armorType: null,
      armorName: null,
      hasShield: false,
      shieldRaised: false,
      shieldName: null,
      hasNaturalArmor: false,
      dexModifier: 0,
      missReason: 'miss',
      weights: {
        dodge: 0,
        armor: 0,
        shield: 0,
        naturalArmor: 0,
        miss: 100
      }
    };
  }
}
