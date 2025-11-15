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
      hasShieldBlock: false,
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
    let equippedArmor = target.items?.find(item =>
      item.type === 'armor' &&
      item.system?.equipped === true
    );

    // For NPCs, also check inventory for armor (they might have it but not marked as equipped)
    if (!equippedArmor && target.type === 'npc') {
      const inventoryArmor = target.items?.find(item =>
        item.type === 'armor'
      );

      if (inventoryArmor) {
        equippedArmor = inventoryArmor;
        console.log('PF2e Narrative Seeds: Found armor in NPC inventory (not equipped)', inventoryArmor.name);
      }
    }

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

      // Check if they can use Shield Block
      analysis.hasShieldBlock = this.hasShieldBlock(target);

      // Only give shield weight if it's actually raised
      if (analysis.shieldRaised) {
        // Increase weight if they have Shield Block (more likely to actively use shield)
        analysis.weights.shield = analysis.hasShieldBlock ? 30 : 25;
      }
    }

    // Check for natural armor (certain creature traits indicate this)
    const traits = target.system?.traits?.value ||
                   target.system?.traits?.traits?.value ||
                   [];

    const naturalArmorTraits = [
      'dragon', 'construct', 'aberration', 'elemental',
      'giant', 'beast', 'animal', 'ooze', 'plant', 'fungus'
    ];

    analysis.hasNaturalArmor = traits.some(trait =>
      naturalArmorTraits.includes(trait.toLowerCase())
    );

    // Also check creature type for natural armor
    const creatureType = target.system?.details?.creatureType?.toLowerCase() || '';
    if (naturalArmorTraits.some(type => creatureType.includes(type))) {
      analysis.hasNaturalArmor = true;
    }

    // Check for damage resistances/immunities (strong indicator of natural armor)
    const hasPhysicalResistance = this.hasPhysicalDefenses(target);
    if (hasPhysicalResistance && !analysis.hasArmor) {
      analysis.hasNaturalArmor = true;
    }

    // If creature has inventory armor but it's not equipped, they likely have natural armor
    if (!analysis.hasArmor && target.type === 'npc') {
      const hasUnequippedArmor = target.items?.some(item =>
        item.type === 'armor' && item.system?.equipped === false
      );
      if (hasUnequippedArmor) {
        analysis.hasNaturalArmor = true;
        console.log('PF2e Narrative Seeds: NPC has unequipped armor, assuming natural armor');
      }
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
   * Checks if an actor has physical damage resistances or immunities
   * @param {Actor} target - The target actor
   * @returns {boolean} True if has physical resistances/immunities
   */
  static hasPhysicalDefenses(target) {
    try {
      // Check for resistances
      const resistances = target.system?.attributes?.resistances || [];
      const immunities = target.system?.attributes?.immunities || [];

      const physicalTypes = ['physical', 'slashing', 'piercing', 'bludgeoning', 'all'];

      // Check resistances array
      if (Array.isArray(resistances)) {
        for (const resist of resistances) {
          const type = resist.type?.toLowerCase() || '';
          if (physicalTypes.some(pt => type.includes(pt))) {
            return true;
          }
        }
      }

      // Check immunities array
      if (Array.isArray(immunities)) {
        for (const immunity of immunities) {
          const type = immunity.type?.toLowerCase() || '';
          if (physicalTypes.some(pt => type.includes(pt))) {
            return true;
          }
        }
      }

      // Check traits for resistance/immunity indicators
      const traits = target.system?.traits?.value || [];
      const drTraits = traits.filter(t => {
        const tLower = t.toLowerCase();
        return tLower.includes('resistance') || tLower.includes('immunity') ||
               tLower.includes('dr') || tLower.includes('hardness');
      });

      if (drTraits.length > 0) {
        return true;
      }

    } catch (e) {
      console.warn('PF2e Narrative Seeds: Error checking physical defenses', e);
    }

    return false;
  }

  /**
   * Checks if an actor has the Shield Block reaction available
   * @param {Actor} target - The target actor
   * @returns {boolean} True if has Shield Block
   */
  static hasShieldBlock(target) {
    try {
      // Check for Shield Block feat
      const hasShieldBlockFeat = target.items?.some(item =>
        item.type === 'feat' &&
        item.name?.toLowerCase().includes('shield block')
      );

      if (hasShieldBlockFeat) {
        return true;
      }

      // Check for classes that get Shield Block automatically
      const classItems = target.items?.filter(item => item.type === 'class') || [];

      for (const classItem of classItems) {
        const className = classItem.name?.toLowerCase() || '';

        // Fighter and Champion get Shield Block
        if (className.includes('fighter') || className.includes('champion')) {
          return true;
        }

        // Warpriest doctrine for Cleric
        if (className.includes('cleric')) {
          const doctrine = classItem.system?.doctrine?.value || '';
          if (doctrine.toLowerCase().includes('warpriest')) {
            return true;
          }
        }
      }

    } catch (e) {
      console.warn('PF2e Narrative Seeds: Error checking Shield Block', e);
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
      hasShieldBlock: false,
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
