/**
 * PF2e Narrative Seeds - Weapon Name Extractor
 * Smart extraction of weapon display names from PF2e item data
 * Handles runes, custom names, natural attacks, spells, and improvised weapons
 */

export class WeaponNameExtractor {

  /**
   * Get the best display name for a weapon
   * @param {Object} item - PF2e item
   * @param {string} damageType - Damage type for fallback
   * @param {string} pov - Point of view (second, third, first)
   * @returns {string} Weapon display name
   */
  static getWeaponDisplayName(item, damageType, pov = "second") {
    if (!item) {
      return this.getFallbackName(damageType, pov);
    }

    // Priority 1: Check for spell attacks
    if (this.isSpellAttack(item)) {
      return this.getSpellDescriptor(item, pov);
    }

    // Priority 2: Check for natural attacks
    if (this.isNaturalAttack(item)) {
      return this.getNaturalAttackName(item, pov);
    }

    // Priority 3: Check for improvised weapons
    if (this.isImprovisedWeapon(item)) {
      return this.getImprovisedName(pov);
    }

    // Priority 4: Check for ammunition (if weapon uses ammo, return ammo name)
    const ammoName = this.getAmmoName(item, pov);
    if (ammoName) {
      return ammoName;
    }

    // Priority 5: Get base weapon name (clean it)
    const baseName = this.extractBaseWeaponName(item);
    if (baseName) {
      return this.formatWeaponName(baseName, pov);
    }

    // Priority 6: Fallback to damage-type generic
    return this.getFallbackName(damageType, pov);
  }

  /**
   * Check if this is a spell attack
   */
  static isSpellAttack(item) {
    return item.type === 'spell' ||
           item.system?.traits?.value?.includes('spell') ||
           item.flags?.pf2e?.isSpell;
  }

  /**
   * Get spell descriptor
   */
  static getSpellDescriptor(item, pov) {
    const spellName = item.name?.toLowerCase() || '';

    // Common spell attack patterns
    if (spellName.includes('ray')) return this.formatName('ray', pov);
    if (spellName.includes('bolt')) return this.formatName('bolt', pov);
    if (spellName.includes('blast')) return this.formatName('blast', pov);
    if (spellName.includes('missile')) return this.formatName('missiles', pov);

    // Generic fallback
    return this.formatName('spell', pov);
  }

  /**
   * Check if this is a natural attack
   */
  static isNaturalAttack(item) {
    const traits = item.system?.traits?.value || [];
    const name = item.name?.toLowerCase() || '';

    return traits.includes('unarmed') ||
           name.includes('fist') ||
           name.includes('claw') ||
           name.includes('bite') ||
           name.includes('jaws') ||
           name.includes('horn') ||
           name.includes('tail') ||
           name.includes('tentacle') ||
           name.includes('wing');
  }

  /**
   * Get natural attack name
   */
  static getNaturalAttackName(item, pov) {
    const name = item.name?.toLowerCase() || '';

    // Simple natural attacks - use as-is
    const simpleAttacks = {
      'fist': 'fist',
      'jaws': 'jaws',
      'bite': 'bite',
      'claw': 'claws',
      'claws': 'claws',
      'horn': 'horn',
      'horns': 'horns',
      'tail': 'tail',
      'wing': 'wing',
      'wings': 'wings',
      'tentacle': 'tentacle',
      'tentacles': 'tentacles',
      'beak': 'beak',
      'stinger': 'stinger',
      'mandibles': 'mandibles'
    };

    for (const [key, value] of Object.entries(simpleAttacks)) {
      if (name.includes(key)) {
        return this.formatName(value, pov);
      }
    }

    // Fallback for complex unarmed attacks
    if (name.includes('flurry')) return this.formatName('strikes', pov);
    if (name.includes('kick')) return this.formatName('kick', pov);
    if (name.includes('headbutt')) return this.formatName('headbutt', pov);
    if (name.includes('punch')) return this.formatName('punch', pov);

    // Generic unarmed
    return this.formatName('strike', pov);
  }

  /**
   * Check if improvised weapon
   */
  static isImprovisedWeapon(item) {
    const traits = item.system?.traits?.value || [];
    return traits.includes('improvised');
  }

  /**
   * Get improvised weapon name
   */
  static getImprovisedName(pov) {
    return this.formatName('improvised weapon', pov);
  }

  /**
   * Get ammunition name if weapon uses ammo
   * @param {Object} item - PF2e weapon item
   * @param {string} pov - Point of view
   * @returns {string|null} Ammunition name or null if no ammo
   */
  static getAmmoName(item, pov) {
    if (!item) return null;

    // Check if weapon uses ammunition
    if (!this.usesAmmunition(item)) {
      return null;
    }

    // Try to get selected ammunition from various PF2e system locations
    let ammo = null;

    // Method 1: Check for selectedAmmoId in system
    if (item.system?.selectedAmmoId) {
      const actor = item.actor || item.parent;
      if (actor) {
        ammo = actor.items.get(item.system.selectedAmmoId);
      }
    }

    // Method 2: Check for ammunition property
    if (!ammo && item.system?.ammunition) {
      ammo = item.system.ammunition;
    }

    // Method 3: Check for ammo in system data
    if (!ammo && item.system?.ammo?.value) {
      const actor = item.actor || item.parent;
      if (actor) {
        ammo = actor.items.get(item.system.ammo.value);
      }
    }

    // If we found ammo, extract and return its name
    if (ammo) {
      const ammoName = this.extractAmmoName(ammo);
      if (ammoName) {
        return this.formatName(ammoName, pov);
      }
    }

    return null;
  }

  /**
   * Check if weapon uses ammunition
   * @param {Object} item - PF2e weapon item
   * @returns {boolean}
   */
  static usesAmmunition(item) {
    if (!item) return false;

    const traits = item.system?.traits?.value || [];
    const name = item.name?.toLowerCase() || '';

    // Check for reload trait (indicates ammo usage)
    if (traits.some(trait => trait.includes('reload'))) {
      return true;
    }

    // Check weapon category - bows and crossbows use ammo
    const weaponCategory = item.system?.category;
    if (weaponCategory && ['bow', 'crossbow'].includes(weaponCategory)) {
      return true;
    }

    // Check weapon group
    const weaponGroup = item.system?.group;
    if (weaponGroup && ['bow', 'crossbow'].includes(weaponGroup)) {
      return true;
    }

    // Check by name patterns
    if (name.includes('bow') || name.includes('crossbow') || name.includes('sling')) {
      return true;
    }

    return false;
  }

  /**
   * Extract clean ammunition name
   * @param {Object} ammo - Ammunition item
   * @returns {string|null}
   */
  static extractAmmoName(ammo) {
    if (!ammo) return null;

    let name = ammo.name || '';
    if (!name) return null;

    name = name.toLowerCase();

    // Remove quantity indicators like "(10)", "(20)"
    name = name.replace(/\s*\(\d+\)\s*/g, '').trim();

    // Remove "ammunition" word if present
    name = name.replace(/\s*ammunition\s*/gi, '').trim();

    // Common ammunition types
    const ammoTypes = {
      'arrow': 'arrow',
      'arrows': 'arrow',
      'bolt': 'bolt',
      'bolts': 'bolt',
      'bullet': 'bullet',
      'bullets': 'bullet',
      'sling bullet': 'sling bullet',
      'sling bullets': 'sling bullet',
      'stone': 'stone',
      'stones': 'stone',
      'blowgun dart': 'dart',
      'dart': 'dart',
      'darts': 'dart',
      'fire arrow': 'fire arrow',
      'cold iron arrow': 'cold iron arrow',
      'silver arrow': 'silver arrow',
      'adamantine arrow': 'adamantine arrow'
    };

    // Check for recognized ammo types
    for (const [key, value] of Object.entries(ammoTypes)) {
      if (name.includes(key)) {
        return value;
      }
    }

    // If name is reasonable length, return as-is
    if (name.length > 0 && name.length <= 20) {
      // Singularize if plural
      if (name.endsWith('s') && name.length > 2) {
        return name.slice(0, -1);
      }
      return name;
    }

    return null;
  }

  /**
   * Extract base weapon name, removing runes and properties
   */
  static extractBaseWeaponName(item) {
    let name = item.name || item.system?.baseItem || '';

    if (!name) return null;

    name = name.toLowerCase();

    // Remove common rune patterns
    name = this.removeRunes(name);

    // Remove +X patterns
    name = name.replace(/\+\d+/g, '').trim();

    // Remove "of [quality]" patterns
    name = name.replace(/\s+of\s+\w+/gi, '').trim();

    // Check if we have a recognized base weapon
    const baseWeapon = this.getRecognizedWeapon(name);
    if (baseWeapon) return baseWeapon;

    // If name is too long or weird, try to use base item property
    if (item.system?.baseItem) {
      return item.system.baseItem.toLowerCase();
    }

    // Return cleaned name if reasonable length
    if (name.length > 0 && name.length <= 20) {
      return name;
    }

    return null;
  }

  /**
   * Remove rune names from weapon string
   */
  static removeRunes(name) {
    // Ensure name is a string
    if (typeof name !== 'string') {
      name = String(name);
    }

    const runes = [
      'striking', 'greater striking', 'major striking',
      'flaming', 'frost', 'shock', 'thundering', 'corrosive',
      'holy', 'unholy', 'anarchic', 'axiomatic',
      'keen', 'ghost touch', 'returning', 'disrupting',
      'vorpal', 'speed', 'wounding', 'dancing',
      'brilliant energy', 'defending', 'vicious', 'merciful'
    ];

    for (const rune of runes) {
      name = name.replace(new RegExp(`\\b${rune}\\b`, 'gi'), '').trim();
    }

    return name;
  }

  /**
   * Check against list of recognized PF2e weapons
   */
  static getRecognizedWeapon(name) {
    // Common PF2e weapons
    const weapons = {
      // Swords
      'longsword': 'longsword',
      'shortsword': 'shortsword',
      'greatsword': 'greatsword',
      'bastard sword': 'bastard sword',
      'scimitar': 'scimitar',
      'rapier': 'rapier',
      'falchion': 'falchion',
      'katana': 'katana',
      'cutlass': 'cutlass',
      'sabre': 'sabre',
      'saber': 'saber',

      // Axes
      'battleaxe': 'battleaxe',
      'battle axe': 'battleaxe',
      'greataxe': 'greataxe',
      'great axe': 'greataxe',
      'handaxe': 'handaxe',
      'hand axe': 'handaxe',
      'hatchet': 'hatchet',

      // Hammers/Maces
      'warhammer': 'warhammer',
      'war hammer': 'warhammer',
      'maul': 'maul',
      'mace': 'mace',
      'light hammer': 'light hammer',
      'morningstar': 'morningstar',
      'morning star': 'morningstar',
      'flail': 'flail',

      // Spears/Polearms
      'spear': 'spear',
      'longspear': 'longspear',
      'long spear': 'longspear',
      'lance': 'lance',
      'trident': 'trident',
      'glaive': 'glaive',
      'halberd': 'halberd',
      'pike': 'pike',
      'naginata': 'naginata',
      'ranseur': 'ranseur',

      // Daggers
      'dagger': 'dagger',
      'stiletto': 'stiletto',
      'kukri': 'kukri',
      'dirk': 'dirk',
      'kris': 'kris',

      // Bows
      'longbow': 'longbow',
      'long bow': 'longbow',
      'shortbow': 'shortbow',
      'short bow': 'shortbow',
      'composite longbow': 'composite longbow',
      'composite shortbow': 'composite shortbow',

      // Crossbows
      'crossbow': 'crossbow',
      'heavy crossbow': 'heavy crossbow',
      'light crossbow': 'light crossbow',
      'hand crossbow': 'hand crossbow',

      // Firearms
      'pistol': 'pistol',
      'musket': 'musket',
      'rifle': 'rifle',

      // Other
      'staff': 'staff',
      'quarterstaff': 'quarterstaff',
      'club': 'club',
      'sling': 'sling',
      'whip': 'whip',
      'javelin': 'javelin',
      'sickle': 'sickle',
      'scythe': 'scythe'
    };

    // Check if name contains a recognized weapon
    for (const [key, value] of Object.entries(weapons)) {
      if (name.includes(key)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Format weapon name with proper POV
   */
  static formatWeaponName(weaponName, pov) {
    return this.formatName(weaponName, pov);
  }

  /**
   * Format any name with POV
   */
  static formatName(name, pov) {
    switch(pov) {
      case "first":
        return `my ${name}`;
      case "third":
        // For third person, return bare weapon name (templates handle possessive context)
        return name;
      case "second":
      default:
        return `your ${name}`;
    }
  }

  /**
   * Get fallback name based on damage type
   */
  static getFallbackName(damageType, pov) {
    const fallbacks = {
      'slashing': 'blade',
      'piercing': 'weapon',
      'bludgeoning': 'weapon',
      'fire': 'flames',
      'cold': 'frost',
      'electricity': 'lightning',
      'acid': 'acid',
      'sonic': 'sonic blast',
      'mental': 'mental attack',
      'spirit': 'spiritual attack',
      'vitality': 'radiant attack',
      'void': 'necrotic attack',
      'poison': 'poison',
      'force': 'force',
      'bleed': 'attack'
    };

    const name = fallbacks[damageType] || 'attack';
    return this.formatName(name, pov);
  }
}
