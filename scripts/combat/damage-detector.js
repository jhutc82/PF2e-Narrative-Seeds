/**
 * PF2e Narrative Seeds - Damage Type Detector
 * Detects damage types from PF2e items and attacks
 */

/**
 * Damage type detection system
 */
export class DamageDetector {

  /**
   * All supported damage types
   */
  static DAMAGE_TYPES = [
    // Physical
    "slashing",
    "piercing",
    "bludgeoning",
    // Energy
    "fire",
    "cold",
    "electricity",
    "sonic",
    "acid",
    // Spiritual/Essential (Remastered)
    "spirit",
    "vitality",
    "void",
    // Other
    "mental",
    "poison",
    "force",
    "bleed"
  ];

  /**
   * Weapon group to default damage type mapping
   */
  static WEAPON_GROUP_DEFAULTS = {
    "sword": "slashing",
    "axe": "slashing",
    "knife": "slashing",
    "polearm": "slashing",
    "spear": "piercing",
    "bow": "piercing",
    "crossbow": "piercing",
    "dart": "piercing",
    "sling": "bludgeoning",
    "club": "bludgeoning",
    "hammer": "bludgeoning",
    "flail": "bludgeoning",
    "shield": "bludgeoning",
    "brawling": "bludgeoning",
    "firearm": "piercing"
  };

  /**
   * Detect damage type from an item
   * @param {Item} item - PF2e item (weapon, spell, etc.)
   * @param {ChatMessage} message - Chat message for additional context
   * @returns {string} Damage type
   */
  static detect(item, message = null) {
    if (!item) {
      console.warn("PF2e Narrative Seeds | No item provided to damage detector");
      return "bludgeoning";  // Default
    }

    // Method 1: Check item damage property
    const damageFromItem = this.getDamageFromItem(item);
    if (damageFromItem) {
      console.log(`PF2e Narrative Seeds | Damage type detected: ${damageFromItem} (from item)`);
      return damageFromItem;
    }

    // Method 2: Check item traits
    const damageFromTraits = this.getDamageFromTraits(item);
    if (damageFromTraits) {
      console.log(`PF2e Narrative Seeds | Damage type detected: ${damageFromTraits} (from traits)`);
      return damageFromTraits;
    }

    // Method 3: Check weapon group
    const damageFromGroup = this.getDamageFromWeaponGroup(item);
    if (damageFromGroup) {
      console.log(`PF2e Narrative Seeds | Damage type detected: ${damageFromGroup} (from weapon group)`);
      return damageFromGroup;
    }

    // Method 4: Check message context
    if (message) {
      const damageFromMessage = this.getDamageFromMessage(message);
      if (damageFromMessage) {
        console.log(`PF2e Narrative Seeds | Damage type detected: ${damageFromMessage} (from message)`);
        return damageFromMessage;
      }
    }

    // Default fallback
    console.log("PF2e Narrative Seeds | Damage type detected: bludgeoning (default fallback)");
    return "bludgeoning";
  }

  /**
   * Get damage type from item system data
   * @param {Item} item
   * @returns {string|null}
   */
  static getDamageFromItem(item) {
    // Check for active versatile trait first (takes precedence)
    const versatileDamage = this.getVersatileDamage(item);
    if (versatileDamage) {
      return this.normalizeDamageType(versatileDamage);
    }

    // Check damage property
    if (item.system?.damage?.damageType) {
      return this.normalizeDamageType(item.system.damage.damageType);
    }

    // Check damage dice (might have type)
    if (item.system?.damage?.dice) {
      const dice = item.system.damage.dice;
      if (Array.isArray(dice) && dice.length > 0) {
        const firstDice = dice[0];
        if (firstDice.damageType) {
          return this.normalizeDamageType(firstDice.damageType);
        }
      }
    }

    // Check damage instances (PF2e new format)
    if (item.system?.damageRolls) {
      const rolls = Object.values(item.system.damageRolls);
      if (rolls.length > 0 && rolls[0].damageType) {
        return this.normalizeDamageType(rolls[0].damageType);
      }
    }

    return null;
  }

  /**
   * Get active versatile damage type from item
   * Checks if weapon has versatile trait and if a specific type is selected
   * @param {Item} item
   * @returns {string|null}
   */
  static getVersatileDamage(item) {
    if (!item?.system?.traits?.value) return null;

    const traits = item.system.traits.value;

    // Check for versatile traits (versatile-p, versatile-s, versatile-b)
    for (const trait of traits) {
      if (typeof trait === 'string' && trait.startsWith('versatile-')) {
        const damageType = trait.split('-')[1];
        // Map trait suffix to damage type
        const typeMap = {
          'p': 'piercing',
          's': 'slashing',
          'b': 'bludgeoning'
        };

        if (typeMap[damageType]) {
          // Check if this versatile option is actively selected
          // PF2e may store the active selection in various ways
          // For now, we'll check if it's in the damage type or trait toggles
          const selectedType = item.system?.selectedVersatile ||
                              item.system?.damage?.versatile ||
                              item.system?.traits?.toggles?.versatile?.selected;

          if (selectedType === trait || selectedType === typeMap[damageType]) {
            return typeMap[damageType];
          }
        }
      }
    }

    return null;
  }

  /**
   * Get damage type from item traits
   * @param {Item} item
   * @returns {string|null}
   */
  static getDamageFromTraits(item) {
    const traits = [];

    if (item.system?.traits?.value) {
      traits.push(...item.system.traits.value);
    }

    // Check if any trait is a damage type
    for (const trait of traits) {
      const normalized = this.normalizeDamageType(trait);
      if (this.DAMAGE_TYPES.includes(normalized)) {
        return normalized;
      }
    }

    return null;
  }

  /**
   * Get damage type from weapon group
   * @param {Item} item
   * @returns {string|null}
   */
  static getDamageFromWeaponGroup(item) {
    const group = item.system?.group?.value || item.system?.weaponType?.value;

    if (group && this.WEAPON_GROUP_DEFAULTS[group]) {
      return this.WEAPON_GROUP_DEFAULTS[group];
    }

    return null;
  }

  /**
   * Get damage type from chat message
   * @param {ChatMessage} message
   * @returns {string|null}
   */
  static getDamageFromMessage(message) {
    // Check flags
    if (message.flags?.pf2e?.damageRoll) {
      const damageRoll = message.flags.pf2e.damageRoll;
      if (damageRoll.damageType) {
        return this.normalizeDamageType(damageRoll.damageType);
      }
    }

    // Parse message content for damage types
    const content = message.content?.toLowerCase() || "";
    for (const damageType of this.DAMAGE_TYPES) {
      if (content.includes(damageType)) {
        return damageType;
      }
    }

    return null;
  }

  /**
   * Normalize damage type string
   * @param {string} damageType
   * @returns {string|null}
   */
  static normalizeDamageType(damageType) {
    if (!damageType || damageType === '') return null;

    const normalized = String(damageType).toLowerCase().trim();

    // Check again after normalization in case it became empty
    if (normalized === '') return null;

    // Handle alternative names and backward compatibility
    const aliases = {
      "electric": "electricity",
      "lightning": "electricity",
      "thunder": "sonic",
      "psychic": "mental",
      // Backward compatibility for pre-Remaster terms
      "positive": "vitality",
      "negative": "void",
      "necrotic": "void",
      "radiant": "vitality",
      "healing": "vitality",
      // Common alternatives
      "good": "spirit",
      "evil": "spirit",
      "lawful": "spirit",
      "chaotic": "spirit",
      "alignment": "spirit",
      "blood": "bleed",
      "persistent": "bleed"
    };

    return aliases[normalized] || normalized;
  }

  /**
   * Check if a string is a valid damage type
   * @param {string} damageType
   * @returns {boolean}
   */
  static isValidDamageType(damageType) {
    return this.DAMAGE_TYPES.includes(this.normalizeDamageType(damageType));
  }

  /**
   * Get display name for damage type
   * @param {string} damageType
   * @returns {string}
   */
  static getDisplayName(damageType) {
    const normalized = this.normalizeDamageType(damageType);
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  /**
   * Detect all damage types from an item (for mixed damage)
   * @param {Item} item - PF2e item (weapon, spell, etc.)
   * @returns {Array<string>} Array of damage types
   */
  static detectAllDamageTypes(item) {
    if (!item) return [];

    const damageTypes = new Set();

    // Check damage instances (PF2e new format) - most reliable for mixed damage
    if (item.system?.damageRolls) {
      const rolls = Object.values(item.system.damageRolls);
      for (const roll of rolls) {
        if (roll.damageType) {
          const normalized = this.normalizeDamageType(roll.damageType);
          if (this.DAMAGE_TYPES.includes(normalized)) {
            damageTypes.add(normalized);
          }
        }
      }
    }

    // Check damage dice array
    if (item.system?.damage?.dice) {
      const dice = item.system.damage.dice;
      if (Array.isArray(dice)) {
        for (const die of dice) {
          if (die.damageType) {
            const normalized = this.normalizeDamageType(die.damageType);
            if (this.DAMAGE_TYPES.includes(normalized)) {
              damageTypes.add(normalized);
            }
          }
        }
      }
    }

    // Check traits for damage type traits
    const damageFromTraits = this.getDamageFromTraits(item);
    if (damageFromTraits) {
      damageTypes.add(damageFromTraits);
    }

    // If nothing found, use standard detection
    if (damageTypes.size === 0) {
      const singleType = this.detect(item);
      damageTypes.add(singleType);
    }

    return Array.from(damageTypes);
  }

  /**
   * Check if an item has mixed damage types
   * @param {Item} item
   * @returns {boolean}
   */
  static hasMixedDamage(item) {
    return this.detectAllDamageTypes(item).length > 1;
  }

  /**
   * Get primary damage type for narrative purposes (for mixed damage items)
   * Priority: highest damage die > first damage type > standard detection
   * @param {Item} item
   * @returns {string}
   */
  static getPrimaryDamageType(item) {
    if (!item) return "bludgeoning";

    // Try to find the damage type with the highest damage die
    if (item.system?.damageRolls) {
      const rolls = Object.values(item.system.damageRolls);
      if (rolls.length > 0) {
        // Sort by die size (extract number from dice notation like "1d8")
        const sorted = rolls
          .filter(r => r.damageType && r.damage)
          .map(r => ({
            type: this.normalizeDamageType(r.damageType),
            dieSize: this.extractDieSize(r.damage)
          }))
          .filter(r => this.DAMAGE_TYPES.includes(r.type))
          .sort((a, b) => b.dieSize - a.dieSize);

        if (sorted.length > 0) {
          return sorted[0].type;
        }
      }
    }

    // Fallback to standard detection
    return this.detect(item);
  }

  /**
   * Extract die size from damage notation (e.g., "1d8" -> 8)
   * @param {string} damageNotation
   * @returns {number}
   */
  static extractDieSize(damageNotation) {
    if (!damageNotation) return 0;
    const match = String(damageNotation).match(/\d*d(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Test detection for debugging
   * @param {Item} item
   */
  static debugDetection(item) {
    console.log("=== Damage Detection Debug ===");
    console.log("Item:", item.name);
    console.log("Type:", item.type);
    console.log("System Data:", item.system);
    console.log("Detected:", this.detect(item));
    console.log("All Types:", this.detectAllDamageTypes(item));
    console.log("Has Mixed:", this.hasMixedDamage(item));
    console.log("Primary:", this.getPrimaryDamageType(item));
    console.log("==============================");
  }
}
