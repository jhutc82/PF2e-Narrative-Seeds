# Weapon Naming System Analysis

## Current System Problems

### The Issue
The current code **ignores** the actual weapon item and uses generic damage-type-based descriptors:

```javascript
// combat-data-helpers.js line 72-85
export async function getWeaponType(damageType, item = null, pov = "second", message = null) {
  const weaponType = await DataLoader.loadWeaponType(damageType);  // ← IGNORES item!
  // Just returns "Your blade" for slashing damage
}
```

**Result**: Generic, repetitive descriptors
- Slashing → "Your blade"
- Piercing → "Your weapon"
- Bludgeoning → "Your weapon"

**What players see:**
```
"Your blade cuts deeply..." (longsword)
"Your blade cuts deeply..." (scimitar)
"Your blade cuts deeply..." (greatsword)
"Your blade cuts deeply..." (dagger)  ← Same for everything!
```

---

## User's Proposed Solution: Use Actual Weapon Names

### Benefits
1. **Specificity**: "Your longsword" vs "Your blade"
2. **Immersion**: Players see their weapon in action
3. **Variety**: Each weapon type feels different
4. **Still damage-aware**: Damage type determines verbs/effects

### Example Outputs
```
"Your longsword cuts deeply into their arm"
"Your greataxe cleaves through their shoulder"
"Your composite longbow strikes true"
"Your fist slams into their jaw"
```

---

## PF2e Weapon Name Challenges

### Challenge 1: Runes and Properties
PF2e weapon names often include magical properties:

```
✗ "Longsword +1 Striking Flaming"  ← Too verbose
✗ "Holy Avenger +2 Greater Striking" ← Magical properties
✓ "longsword" ← What we want
```

**Solution**: Extract base weapon name, ignore runes/properties

---

### Challenge 2: Custom Names
Players can rename weapons:

```
✗ "Seelah's Holy Blade of Justice" ← Custom name
✗ "Ol' Bessy" ← Nickname
✗ "The Widowmaker" ← Named weapon
✓ "longsword" ← Fallback to base weapon
```

**Solution**: Check for custom names, fallback to base weapon type

---

### Challenge 3: Natural Attacks
Creatures have natural attacks with varied naming:

```
✓ "Jaws" → "Your jaws"
✓ "Claw" → "Your claws"
✓ "Fist" → "Your fist"
✗ "Unarmed Attack" → "Your unarmed attack" (verbose)
✗ "Flurry of Blows" → "Your flurry of blows" (special ability name)
```

**Solution**: Detect natural attacks, use sensible defaults

---

### Challenge 4: Spell Attacks
Spell attacks aren't weapons:

```
✗ "Produce Flame" → "Your produce flame" (weird)
✗ "Ray of Frost" → "Your ray of frost" (awkward)
✓ "Your spell" or "Your magical attack" (generic is better)
```

**Solution**: Detect spell attacks, use generic magical descriptor

---

### Challenge 5: Improvised Weapons
Players can attack with random objects:

```
✗ "Chair" → "Your chair" (funny but immersion-breaking)
✗ "Rock" → "Your rock"
✗ "Broken Bottle" → "Your broken bottle"
✓ "Your improvised weapon" (better)
```

**Solution**: Detect improvised weapons, use generic term

---

## Proposed Implementation

### Smart Weapon Name Extractor

```javascript
// NEW: scripts/combat/weapon-name-extractor.js

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

    // Priority 4: Get base weapon name (clean it)
    const baseName = this.extractBaseWeaponName(item);
    if (baseName) {
      return this.formatWeaponName(baseName, pov);
    }

    // Priority 5: Fallback to damage-type generic
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
      'tentacles': 'tentacles'
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
    if (name.length <= 20) {
      return name;
    }

    return null;
  }

  /**
   * Remove rune names from weapon string
   */
  static removeRunes(name) {
    const runes = [
      'striking', 'greater striking', 'major striking',
      'flaming', 'frost', 'shock', 'thundering', 'corrosive',
      'holy', 'unholy', 'anarchic', 'axiomatic',
      'keen', 'ghost touch', 'returning', 'disrupting',
      'vorpal', 'speed', 'wounding', 'dancing',
      'brilliant energy', 'defending'
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
    // Common PF2e weapons (partial list)
    const weapons = {
      // Swords
      'longsword': 'longsword',
      'shortsword': 'shortsword',
      'greatsword': 'greatsword',
      'bastard sword': 'bastard sword',
      'scimitar': 'scimitar',
      'rapier': 'rapier',
      'falchion': 'falchion',

      // Axes
      'battleaxe': 'battleaxe',
      'battle axe': 'battleaxe',
      'greataxe': 'greataxe',
      'great axe': 'greataxe',
      'handaxe': 'handaxe',
      'hand axe': 'handaxe',

      // Hammers/Maces
      'warhammer': 'warhammer',
      'war hammer': 'warhammer',
      'maul': 'maul',
      'mace': 'mace',
      'light hammer': 'light hammer',

      // Spears/Polearms
      'spear': 'spear',
      'longspear': 'longspear',
      'lance': 'lance',
      'trident': 'trident',
      'glaive': 'glaive',
      'halberd': 'halberd',

      // Daggers
      'dagger': 'dagger',
      'stiletto': 'stiletto',
      'kukri': 'kukri',

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

      // Other
      'staff': 'staff',
      'quarterstaff': 'quarterstaff',
      'club': 'club',
      'sling': 'sling',
      'whip': 'whip'
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
        return `the ${name}`;
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
```

---

## Updated Combat Data Helper

```javascript
// UPDATED: combat-data-helpers.js

import { WeaponNameExtractor } from '../combat/weapon-name-extractor.js';

/**
 * Get weapon type descriptor - NOW USES ACTUAL WEAPON NAME
 * @param {string} damageType - Damage type (for fallback)
 * @param {Object} item - PF2e item (NOW ACTUALLY USED!)
 * @param {string} pov - Point of view (first, second, third)
 * @param {Object} message - Optional message for context
 * @returns {string} Weapon display name
 */
export function getWeaponType(damageType, item = null, pov = "second", message = null) {
  // Use the smart extractor to get the best weapon name
  return WeaponNameExtractor.getWeaponDisplayName(item, damageType, pov);
}
```

---

## Example Outputs

### Before (Current System)
```
Longsword: "Your blade cuts deeply into their arm"
Greatsword: "Your blade cuts deeply into their arm"
Scimitar: "Your blade cuts deeply into their arm"
Dagger: "Your blade cuts deeply into their arm"
```
**All identical!** 😞

### After (Proposed System)
```
Longsword: "Your longsword cuts deeply into their arm"
Greatsword: "Your greatsword cleaves through their shoulder"
Scimitar: "Your scimitar slashes across their torso"
Dagger: "Your dagger punctures their side"
Composite Longbow: "Your composite longbow strikes true"
Fist: "Your fist slams into their jaw"
Jaws (dragon): "Your jaws bite down on their leg"
Produce Flame: "Your spell scorches their chest"
```
**Each weapon feels unique!** 😊

---

## How This Works With Other Systems

### ✅ Works Perfectly With Template Variety
```javascript
// Template 1:
"Your longsword cuts deeply into their arm"

// Template 2:
"Cutting deeply into their arm! Your longsword finds flesh!"

// Template 3:
"Their arm takes the hit as your longsword cuts deeply"
```

### ✅ Works Perfectly With Damage-Based Verbs/Effects
```javascript
// Longsword (slashing damage):
Verb: "cuts deeply" (from slashing verbs)
Effect: "Blood wells from the cut" (from slashing effects)

// Warhammer (bludgeoning damage):
Verb: "crushes" (from bludgeoning verbs)
Effect: "Bone cracks under the impact" (from bludgeoning effects)
```

### ✅ Handles Special Modifiers
```javascript
// Ranged weapon:
"Your longbow strikes from range"

// Non-lethal:
"Your fist stuns them" (not "kills")

// Size difference:
"Your greatsword cleaves through the tiny creature"
```

---

## Benefits Summary

| Feature | Current System | Proposed System |
|---------|---------------|-----------------|
| **Specificity** | "Your blade" | "Your longsword" |
| **Variety** | Same for all weapons | Each weapon unique |
| **Immersion** | Generic | Specific to character |
| **Damage logic** | Damage type only | Damage type + weapon |
| **Natural attacks** | "Your weapon" | "Your claws", "Your jaws" |
| **Spell attacks** | "Your weapon" | "Your spell", "Your ray" |
| **Complexity** | Low | Medium |

---

## Implementation Effort

- **WeaponNameExtractor class**: 4-5 hours
- **Update combat-data-helpers**: 1 hour
- **Testing (verify names)**: 2 hours
- **Edge case handling**: 1-2 hours
- **Total**: ~8-10 hours

---

## Recommendation

**YES, implement this!** The user is absolutely right that using actual weapon names is:
- More immersive
- More specific
- Still damage-type-aware for verbs/effects
- A natural fit with template variety

**Priority**:
1. Fix cultural references (1-2h)
2. **Implement weapon name system** (8-10h) ← NEW
3. Implement template variety (11h)
4. Add context awareness (8-11h)

Total: ~28-34 hours for complete transformation of the narrative system.
