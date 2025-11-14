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
    // Special
    "poison",
    "force",
    "mental",
    "positive",
    "negative"
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
    "dart": "piercing",
    "club": "bludgeoning",
    "hammer": "bludgeoning",
    "flail": "bludgeoning",
    "shield": "bludgeoning",
    "brawling": "bludgeoning"
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
   * @returns {string}
   */
  static normalizeDamageType(damageType) {
    if (!damageType) return null;

    const normalized = String(damageType).toLowerCase().trim();

    // Handle alternative names
    const aliases = {
      "electric": "electricity",
      "lightning": "electricity",
      "thunder": "sonic",
      "psychic": "mental",
      "necrotic": "negative",
      "radiant": "positive",
      "healing": "positive"
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
   * Test detection for debugging
   * @param {Item} item
   */
  static debugDetection(item) {
    console.log("=== Damage Detection Debug ===");
    console.log("Item:", item.name);
    console.log("Type:", item.type);
    console.log("System Data:", item.system);
    console.log("Detected:", this.detect(item));
    console.log("==============================");
  }
}
