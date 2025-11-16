# Context-Aware Narrative System Proposal

## Problem: Semantic Nonsense

### Current System Generates Impossible Descriptions

**Example 1 - Skeleton Critical Hit:**
```
Component Selection:
- Opening: "Steel sings as you strike"
- Verb: "cleaves brutally through"
- Location: "left shoulder"
- Effect: "Blood sprays in a crimson arc!"

Result: "Steel sings as you strike. cleaves brutally through their left shoulder! Blood sprays in a crimson arc!"
```

**Problem**: **Skeletons don't bleed!** 💀

**Example 2 - Fire Damage:**
```
Components:
- Damage Type: fire
- Verb: "cuts deeply" (from wrong damage type!)
- Effect: "Blood wells from the cut"

Result: "Your flames cuts deeply into their arm! Blood wells from the cut."
```

**Problem**: Fire doesn't "cut" and doesn't cause bleeding!

**Example 3 - Incorporeal Target:**
```
Components:
- Anatomy: incorporeal (ghost/wraith)
- Verb: "cleaves through"
- Location: "left shoulder blade"
- Effect: "Bone gleams white through the parted flesh!"

Result: "cleaves through their left shoulder blade! Bone gleams white through the parted flesh!"
```

**Problem**: Ghosts have no flesh, bones, or blood!

---

## Solution: Multi-Layer Context Filtering

### Architecture

```javascript
// NEW: scripts/combat/context-filters.js

export class ContextFilters {

  /**
   * Filter effects based on anatomy and damage type
   */
  static filterEffects(effects, context) {
    const { anatomy, damageType, location } = context;

    return effects.filter(effect => {
      const lower = effect.toLowerCase();

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
   */
  static isEffectValidForAnatomy(effect, anatomy) {
    const lower = effect.toLowerCase();
    const anatomyBase = typeof anatomy === 'string' ? anatomy : anatomy.base;

    // Blood effects - only for living creatures
    if (lower.includes('blood') || lower.includes('crimson') || lower.includes('bleed')) {
      const noBloodTypes = [
        'skeleton', 'zombie', 'incorporeal', 'construct', 'golem',
        'air-elemental', 'fire-elemental', 'earth-elemental', 'water-elemental',
        'ooze', 'plant', 'will-o-wisp'
      ];
      if (noBloodTypes.some(type => anatomyBase.includes(type))) {
        return false;
      }
    }

    // Bone/flesh effects - not for incorporeal/elemental
    if (lower.includes('bone') || lower.includes('flesh') || lower.includes('muscle')) {
      const noPhysicalBodyTypes = [
        'incorporeal', 'air-elemental', 'fire-elemental',
        'ooze', 'amorphous', 'will-o-wisp'
      ];
      if (noPhysicalBodyTypes.some(type => anatomyBase.includes(type))) {
        return false;
      }
    }

    // Pain/screaming - not for constructs/undead
    if (lower.includes('scream') || lower.includes('cry out') || lower.includes('gasp')) {
      const noPainTypes = ['construct', 'golem', 'skeleton', 'incorporeal'];
      if (noPainTypes.some(type => anatomyBase.includes(type))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if effect matches damage type
   */
  static isEffectValidForDamageType(effect, damageType) {
    const lower = effect.toLowerCase();

    // Bleeding effects - only for physical damage
    if (lower.includes('blood') || lower.includes('bleed')) {
      const physicalDamage = ['slashing', 'piercing', 'bludgeoning'];
      if (!physicalDamage.includes(damageType)) {
        return false;
      }
    }

    // Burning effects - fire damage only
    if (lower.includes('burn') || lower.includes('smolder') || lower.includes('scorch')) {
      if (damageType !== 'fire') {
        return false;
      }
    }

    // Freezing effects - cold damage only
    if (lower.includes('freeze') || lower.includes('frost') || lower.includes('ice')) {
      if (damageType !== 'cold') {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if effect makes sense for location
   */
  static isEffectValidForLocation(effect, location) {
    const lower = effect.toLowerCase();
    const locationLower = location?.toLowerCase() || '';

    // Eye-specific: no "gaping wound" for eyes
    if (locationLower.includes('eye')) {
      if (lower.includes('gaping') || lower.includes('yawns open')) {
        return false;
      }
    }

    // Bone locations: emphasize bone effects
    if (locationLower.includes('skull') || locationLower.includes('bone')) {
      // Prefer bone-related effects, but don't filter others out
      // Just a hint for future weighted selection
    }

    return true;
  }

  /**
   * Filter verbs based on damage type
   */
  static filterVerbs(verbs, damageType) {
    return verbs.filter(verb => {
      const lower = verb.toLowerCase();

      // Slashing verbs
      const slashingVerbs = ['cuts', 'slashes', 'cleaves', 'slices', 'carves', 'hacks'];
      if (slashingVerbs.some(v => lower.includes(v)) && damageType !== 'slashing') {
        return false;
      }

      // Piercing verbs
      const piercingVerbs = ['pierces', 'punctures', 'impales', 'stabs', 'thrusts'];
      if (piercingVerbs.some(v => lower.includes(v)) && damageType !== 'piercing') {
        return false;
      }

      // Bludgeoning verbs
      const bludgeoningVerbs = ['crushes', 'smashes', 'pounds', 'batters', 'hammers'];
      if (bludgeoningVerbs.some(v => lower.includes(v)) && damageType !== 'bludgeoning') {
        return false;
      }

      return true;
    });
  }

  /**
   * Filter verbs based on location anatomy
   */
  static filterVerbsByLocation(verbs, location) {
    const locationLower = location?.toLowerCase() || '';

    return verbs.filter(verb => {
      const lower = verb.toLowerCase();

      // Eyes: can't be cleaved/hacked/chopped
      if (locationLower.includes('eye')) {
        const invalidVerbs = ['cleaves', 'hacks', 'chops', 'splits', 'bisects'];
        if (invalidVerbs.some(v => lower.includes(v))) {
          return false;
        }
      }

      // Arteries/vessels: piercing is most effective
      if (locationLower.includes('artery') || locationLower.includes('vein')) {
        // Don't filter, but this could boost piercing verbs in weighted selection
      }

      // Joints: cutting/slashing less effective than bludgeoning
      if (locationLower.includes('joint') || locationLower.includes('knee') || locationLower.includes('elbow')) {
        // Could prefer crushing/shattering verbs
      }

      return true;
    });
  }

  /**
   * Get contextually appropriate verbs and effects
   */
  static async getContextualComponents(context) {
    const { anatomy, damageType, outcome, varietyMode, location } = context;

    // Load raw components
    const [rawVerbs, rawEffects] = await Promise.all([
      getDamageVerb(damageType, outcome, varietyMode),
      getDamageEffect(damageType, outcome, varietyMode)
    ]);

    // Apply context filters
    const filteredVerbs = this.filterVerbs(rawVerbs, damageType);
    const filteredVerbsByLocation = this.filterVerbsByLocation(filteredVerbs, location);
    const filteredEffects = this.filterEffects(rawEffects, context);

    // Select from filtered lists
    const verb = RandomUtils.selectRandom(
      filteredVerbsByLocation.length > 0 ? filteredVerbsByLocation : filteredVerbs,
      varietyMode,
      `contextual-verb:${damageType}:${outcome}`
    );

    const effect = RandomUtils.selectRandom(
      filteredEffects.length > 0 ? filteredEffects : rawEffects, // Fallback to unfiltered
      varietyMode,
      `contextual-effect:${damageType}:${outcome}`
    );

    return { verb, effect };
  }
}
```

---

## Alternative Effects by Anatomy Type

### Create Anatomy-Specific Effect Variants

```json
// NEW: data/combat/effects/anatomy-overrides.json
{
  "skeleton": {
    "criticalSuccess": [
      "Bone fragments scatter from the devastating impact!",
      "The skeleton's structure fractures catastrophically!",
      "Bones splinter and crack apart!",
      "The skeletal frame buckles and shatters!",
      "Ribs crack and separate from the spine!",
      "The ancient bones crumble under the force!"
    ],
    "success": [
      "Bone chips fly from the impact.",
      "A dry crack echoes from the skeleton.",
      "The strike damages the skeletal structure.",
      "Bones rattle from the forceful blow."
    ]
  },

  "incorporeal": {
    "criticalSuccess": [
      "The spiritual form wavers and fragments!",
      "Ectoplasmic energy dissipates in wisps!",
      "The ghostly essence shudders and dims!",
      "Spectral matter scatters like mist!",
      "The incorporeal being flickers violently!"
    ],
    "success": [
      "The ghostly form ripples from the impact.",
      "Ethereal substance dissipates briefly.",
      "The spirit wavers and reforms.",
      "Ectoplasm disperses in tendrils."
    ]
  },

  "construct": {
    "criticalSuccess": [
      "Metallic components crunch and deform!",
      "Gears shatter and springs fly loose!",
      "The construct's plating buckles inward!",
      "Mechanical parts scatter from the impact!",
      "Stone chips and dust explode from the blow!"
    ],
    "success": [
      "The construct's surface shows new damage.",
      "Mechanical components groan under stress.",
      "Plating dents from the forceful strike.",
      "Structural integrity weakens visibly."
    ]
  },

  "ooze": {
    "criticalSuccess": [
      "Gelatinous mass splatters in all directions!",
      "The ooze's form destabilizes catastrophically!",
      "Viscous fluid sprays from the ruptured membrane!",
      "The amorphous body splits and reforms chaotically!",
      "Acidic goo erupts from the massive wound!"
    ],
    "success": [
      "The ooze ripples from the impact.",
      "Gelatinous matter displaced visibly.",
      "The amorphous form quivers.",
      "Viscous fluid oozes from the breach."
    ]
  },

  "elemental-fire": {
    "criticalSuccess": [
      "Flames explode outward in a furious burst!",
      "The elemental's fire dims dangerously!",
      "Blazing energy scatters in all directions!",
      "The living flames sputter and rage!",
      "Heat erupts in a scorching wave!"
    ],
    "success": [
      "Flames flicker from the disruption.",
      "The fire elemental's form wavers.",
      "Heat pulses irregularly from the impact.",
      "Burning essence disperses briefly."
    ]
  },

  "plant": {
    "criticalSuccess": [
      "Bark splinters and sap sprays!",
      "Woody fibers shred catastrophically!",
      "The plant matter ruptures, leaking green ichor!",
      "Leaves and vines tear away violently!",
      "Chlorophyll-rich sap gushes from the wound!"
    ],
    "success": [
      "Sap oozes from the cut in the bark.",
      "Plant fibers fray and split.",
      "Green fluid weeps from the wound.",
      "The plant matter tears and bruises."
    ]
  }
}
```

---

## Updated Generator with Context Awareness

```javascript
// UPDATED: combat-generator.js

async generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message) {
  // Load location
  const location = await getLocation(anatomy, outcome, varietyMode);

  // Build context for filtering
  const context = {
    anatomy,
    damageType,
    outcome,
    location,
    varietyMode
  };

  // Get contextually appropriate components
  const { verb, effect } = await ContextFilters.getContextualComponents(context);

  // Check for anatomy-specific effect overrides
  const anatomyBase = typeof anatomy === 'string' ? anatomy : anatomy.base;
  const overrideEffect = await this.getAnatomySpecificEffect(anatomyBase, outcome, varietyMode);

  const finalEffect = overrideEffect || effect;

  // Rest of generation...
  // (template selection, etc.)
}

/**
 * Get anatomy-specific effect override if available
 */
async getAnatomySpecificEffect(anatomyType, outcome, varietyMode) {
  try {
    const overrides = await DataLoader.loadAnatomyEffects(anatomyType);
    if (overrides && overrides[outcome]) {
      return RandomUtils.selectRandom(
        overrides[outcome],
        varietyMode,
        `anatomy-effect:${anatomyType}:${outcome}`
      );
    }
  } catch (e) {
    // No override available, use default
  }
  return null;
}
```

---

## Benefits

### 1. **Semantic Correctness**
- Skeletons no longer bleed
- Fire damage doesn't "cut"
- Ghosts don't have flesh wounds
- Constructs show mechanical damage

### 2. **Immersion**
- Descriptions match the reality of the creature
- No "blood" on bloodless enemies
- No "screaming" from mindless constructs

### 3. **Variety Through Specificity**
- Each creature type gets unique flavor
- 6 skeleton-specific effects feel more unique than 100 generic ones
- Players remember "the ooze that splattered everywhere" vs. "generic hit #47"

### 4. **Gradual Enhancement**
- Start with basic filtering (remove blood from constructs)
- Add anatomy-specific effects over time (v1.3, v1.4, etc.)
- Community can contribute creature-specific effects

---

## Implementation Phases

### Phase 1: Basic Filtering (2-3 hours)
```javascript
// Just filter out nonsense
- No blood effects on constructs/incorporeal/undead
- Match verb to damage type (no "cuts" for fire damage)
```

### Phase 2: Anatomy Overrides (4-5 hours)
```javascript
// Add 6-10 effects each for common types
- Skeleton (6 effects)
- Incorporeal (6 effects)
- Construct (6 effects)
- Ooze (6 effects)
- Elemental (6 effects each for fire/water/air/earth)
```

### Phase 3: Location-Based Filtering (2-3 hours)
```javascript
// Don't "cleave through their eye"
// Don't "blood sprays" from incorporeal shoulder
```

---

## Combined with Template Variety

**Example: Skeleton Critical Hit with Both Systems**

Before (current):
```
"Steel flashes as you strike. cleaves brutally through their left shoulder! Blood sprays in a crimson arc!"
```

After (templates + context):
```
Template 1: "Bone fragments scatter from the devastating impact! Your blade shatters their left shoulder completely. The skeleton's structure fractures catastrophically!"

Template 2: "Shattering their left shoulder! Your blade reduces bone to splinters. The skeleton's structure fractures catastrophically!"

Template 3: "Your blade strikes their left shoulder. Ancient bones crumble under the force! The skeletal frame buckles and shatters!"
```

**Result**:
- ✅ Grammatically correct
- ✅ Semantically accurate (no blood on skeletons)
- ✅ Variety through templates
- ✅ Immersive and appropriate

---

## Effort Summary

| Feature | Effort | Impact |
|---------|--------|--------|
| Basic filtering | 2-3h | High (prevents nonsense) |
| Anatomy overrides | 4-5h | Medium (adds flavor) |
| Location filtering | 2-3h | Low (edge cases) |
| **Total** | **8-11h** | **High overall** |

Combined with Template Variety (11h), total effort is **19-22 hours** for:
- 10-20x more unique-feeling narratives
- Perfect grammar
- Semantic correctness
- Immersive, context-appropriate descriptions

---

## Conclusion

Context awareness should be implemented **alongside** template variety for maximum effect. Together they create:

1. **Structural Variety** (templates) → sentences feel different
2. **Semantic Correctness** (context) → descriptions make sense
3. **Creature Personality** (anatomy effects) → each enemy type is memorable

This transforms the module from "randomly combined phrases" to "intelligent narrative generation."
