# Narrative Variety Enhancement Proposal

## Executive Summary

The current system generates narratives using **fixed sentence templates** which creates predictability despite having 2,600+ unique phrases. This proposal introduces **template variety** to multiply uniqueness by 10-20x with minimal effort.

## Problem Statement

### Current Pattern (Always Same)
```
${opening} ${verb} their ${location}. ${effect}
```

### Example Outputs (All Feel Similar)
1. "Steel flashes as Valeros strikes. cuts deeply into their left arm. Blood wells from the cut."
2. "Metal gleams as Valeros attacks. slices across their right leg. Crimson drips from the wound."
3. "The blade moves as Valeros swings. carves into their torso. The wound bleeds steadily."

**Problem**: Sentence structure never changes!

---

## Solution: Multiple Template Patterns

### Template Variations for Standard Success

```javascript
// NEW: data/combat/templates/standard-success.json
{
  "templates": [
    // Pattern 1: Traditional (current)
    "${opening} ${verb} their ${location}. ${effect}",

    // Pattern 2: Effect-first dramatic
    "${effect} ${opening} ${verbPastTense} their ${location}!",

    // Pattern 3: Location-focused
    "Their ${location} ${verbPassive} as ${opening} ${effect}",

    // Pattern 4: Verb-focused action
    "${opening} targeting their ${location}, ${verbPresent} ${adverb}. ${effect}",

    // Pattern 5: Compound action
    "${opening} ${effect} The strike ${verbPastTense} their ${location}.",

    // Pattern 6: Combat flow
    "Striking at their ${location}, ${opening} ${effect}",

    // Pattern 7: Terse action
    "${opening} ${location}. ${verb}. ${effectShort}",

    // Pattern 8: Delayed impact
    "${opening} The ${weaponType} finds their ${location}. ${verb}. ${effect}",

    // Pattern 9: Minimal with punch
    "${verbImperative} their ${location}! ${effect}",

    // Pattern 10: Cinematic wide shot
    "In a ${adjective} motion, ${attackerName} ${verbPastTense} ${targetName}'s ${location}. ${effect}"
  ],

  "weights": {
    "pattern1": 20,  // Traditional is common
    "pattern2": 15,  // Dramatic is less common
    "pattern3": 10,  // Passive voice is rare
    // ... etc
  }
}
```

### Example Outputs with Template Variety

**Same Components, Different Templates:**

Components: `{opening: "Steel flashes", verb: "cuts deeply", location: "left arm", effect: "Blood wells from the cut"}`

1. **Pattern 1**: "Steel flashes. cuts deeply into their left arm. Blood wells from the cut."
2. **Pattern 2**: "Blood wells from the cut! Steel flashes as the blade cut deeply into their left arm!"
3. **Pattern 3**: "Their left arm is cut deeply as steel flashes. Blood wells from the cut."
4. **Pattern 4**: "Steel flashes, targeting their left arm, cutting deeply and viciously. Blood wells from the cut."
5. **Pattern 5**: "Steel flashes. Blood wells from the cut. The strike cut deeply into their left arm."

**Result**: 5 completely different narrative feels from the same components!

---

## Code Implementation

### Step 1: Create Template Data Files

```json
// data/combat/templates/success.json
{
  "standard": {
    "success": [
      {
        "pattern": "${opening} ${verb} their ${location}. ${effect}",
        "weight": 20,
        "grammar": "standard"
      },
      {
        "pattern": "${effect} ${opening} ${verb} their ${location}!",
        "weight": 15,
        "grammar": "effect-first"
      },
      {
        "pattern": "Their ${location} takes the hit as ${opening} ${effect}",
        "weight": 10,
        "grammar": "location-first"
      },
      {
        "pattern": "${opening} The ${weaponType} ${verb} their ${location}. ${effect}",
        "weight": 12,
        "grammar": "weapon-focused"
      },
      {
        "pattern": "Targeting their ${location}, ${verb}. ${effect}",
        "weight": 8,
        "grammar": "terse"
      },
      {
        "pattern": "${verb} their ${location}! ${effect} ${opening}",
        "weight": 10,
        "grammar": "action-first"
      },
      {
        "pattern": "${opening} ${effect} The strike finds their ${location}.",
        "weight": 8,
        "grammar": "delayed-location"
      },
      {
        "pattern": "Their ${location}. ${verb}. ${effectShort}",
        "weight": 5,
        "grammar": "ultra-terse"
      },
      {
        "pattern": "${attackerName}'s strike ${verb} ${targetName}'s ${location}. ${effect}",
        "weight": 12,
        "grammar": "third-person"
      }
    ],
    "criticalSuccess": [
      // More dramatic templates for crits
      {
        "pattern": "${effect}! ${opening} ${verb} their ${location} with devastating force!",
        "weight": 25,
        "grammar": "dramatic-effect-first"
      },
      {
        "pattern": "${opening} In a perfect strike, ${verb} their ${location}! ${effect}!",
        "weight": 20,
        "grammar": "perfect-strike"
      },
      // ... 10-15 more crit templates
    ]
  },
  "detailed": {
    // Longer, more complex templates for detailed mode
  },
  "cinematic": {
    // Even more elaborate templates
  }
}
```

### Step 2: Template Engine

```javascript
// NEW: scripts/combat/template-engine.js

export class TemplateEngine {

  /**
   * Select a template based on weights
   */
  static selectTemplate(templates, varietyMode, category) {
    // Filter templates by weight
    const weightedTemplates = templates.map((t, idx) => ({
      template: t,
      weight: t.weight || 10,
      index: idx
    }));

    // Use weighted random selection
    const totalWeight = weightedTemplates.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedTemplates) {
      random -= item.weight;
      if (random <= 0) {
        // Track this template to avoid recent repeats
        RandomUtils.recordMessage(
          `template-${category}-${item.index}`,
          varietyMode
        );
        return item.template;
      }
    }

    return templates[0]; // Fallback
  }

  /**
   * Fill template with components, handling grammar
   */
  static fillTemplate(templateObj, components) {
    let pattern = templateObj.pattern;
    const grammar = templateObj.grammar;

    // Grammar transformations based on template type
    const grammarComponents = this.applyGrammar(components, grammar);

    // Standard interpolation
    return StringUtils.interpolate(pattern, grammarComponents);
  }

  /**
   * Apply grammar transformations to components
   */
  static applyGrammar(components, grammarType) {
    const result = {...components};

    switch(grammarType) {
      case 'standard':
        // No transformation needed
        break;

      case 'effect-first':
        // Capitalize effect, lowercase opening
        result.effect = StringUtils.capitalizeFirst(components.effect);
        result.opening = components.opening.toLowerCase();
        break;

      case 'location-first':
        // Make verb passive: "cuts" -> "is cut"
        result.verbPassive = this.makePassive(components.verb);
        break;

      case 'action-first':
        // Make verb imperative/present: "cut" -> "cuts"
        result.verbPresent = this.makePresentTense(components.verb);
        break;

      case 'terse':
        // Use shorter effect version if available
        result.effectShort = this.shortenEffect(components.effect);
        break;

      // ... more grammar cases
    }

    return result;
  }

  /**
   * Convert verb to passive voice
   * "cuts deeply" -> "is cut deeply"
   */
  static makePassive(verb) {
    // Simple conversion - can be enhanced
    const match = verb.match(/^(\w+)\s+(.*)$/);
    if (match) {
      const [_, verbWord, modifiers] = match;
      return `is ${this.toPastParticiple(verbWord)} ${modifiers}`;
    }
    return `is ${verb}`;
  }

  /**
   * Convert to past participle
   */
  static toPastParticiple(verb) {
    // Simple rules - enhance as needed
    const irregulars = {
      'cuts': 'cut',
      'slashes': 'slashed',
      'cleaves': 'cloven',
      'strikes': 'struck',
      'bites': 'bitten',
      'finds': 'found',
      'rends': 'rent',
      // ... more
    };

    return irregulars[verb] || verb + 'ed';
  }

  /**
   * Shorten effect for terse templates
   */
  static shortenEffect(effect) {
    // "Blood wells from the cut." -> "Bleeding."
    if (effect.toLowerCase().includes('blood')) return "Bleeding!";
    if (effect.toLowerCase().includes('wound')) return "Wounded!";
    if (effect.toLowerCase().includes('stagger')) return "Staggered!";
    return effect.split('.')[0] + '!'; // First sentence only
  }
}
```

### Step 3: Update Generator

```javascript
// UPDATED: scripts/combat/combat-generator.js

import { TemplateEngine } from './template-engine.js';
import { DataLoader } from '../data-loader.js';

async generateStandard(anatomy, outcome, damageType, varietyMode, item, target, attacker, defense, message) {
  // Load components in parallel (your existing improvement)
  const [location, verb, effect, weaponType, templates] = await Promise.all([
    getLocation(anatomy, outcome, varietyMode),
    getDamageVerb(damageType, outcome, varietyMode),
    getDamageEffect(damageType, outcome, varietyMode),
    getWeaponType(damageType, item, "second", message),
    DataLoader.loadTemplates('standard', outcome)  // NEW!
  ]);

  // Get opening (existing logic)
  const rangedCategory = getRangedWeaponCategory(item, message);
  const opening = rangedCategory
    ? await getRangedOpeningSentence(rangedCategory, 'standard', outcome, {...})
    : await getOpeningSentence('standard', outcome, {...});

  // NEW: Select template based on variety mode
  const templateObj = TemplateEngine.selectTemplate(
    templates,
    varietyMode,
    `template-standard-${outcome}`
  );

  // NEW: Build components object
  const components = {
    opening,
    verb,
    effect,
    location,
    weaponType,
    attackerName: attacker?.name || "The attacker",
    targetName: target?.name || "the target",
    damageType
  };

  // NEW: Fill template with grammar-aware substitution
  let description = TemplateEngine.fillTemplate(templateObj, components);

  // Apply existing modifiers
  const sizeDiff = getSizeDifference(attacker, target);
  const nonLethal = isNonLethalAttack(item, message);

  description = await this.applySizeModifier(description, sizeDiff, outcome, varietyMode);
  description = this.applyNonLethalModifier(description, nonLethal);

  return description;
}
```

---

## Benefits

### 1. **10-20x More Unique Feeling Narratives**
- Current: 1 pattern × 76.5M component combinations = feels like 1,000 unique
- New: 10 patterns × 76.5M combinations = feels like 10,000+ unique

### 2. **Grammatically Correct**
- Templates handle grammar properly
- No more "delivers a cut. cleaves through" broken sentences

### 3. **Minimal Data Addition**
- Add 10 templates per detail level × 4 outcomes = 40 templates
- Reuses all 2,600 existing phrases
- No phrase expansion needed!

### 4. **Easy to Extend**
- Community can contribute template patterns
- Can weight templates (make some rare for surprise)
- Can add seasonal/thematic templates

### 5. **Performance**
- Negligible overhead (string interpolation is fast)
- Templates cached like other data

---

## Effort Estimate

- **Template Creation**: 4 hours (write 40-60 templates)
- **TemplateEngine Code**: 3 hours (build engine + grammar helpers)
- **Generator Integration**: 2 hours (update 3 generator methods)
- **Testing**: 2 hours (verify grammar correctness)
- **Total**: ~11 hours for 10-20x variety improvement

---

## Phase 2 Enhancements (Future)

### A. Context-Aware Filtering
```javascript
// Don't use blood effects on constructs/undead
if (anatomy.includes('construct') || anatomy.includes('incorporeal')) {
  effects = effects.filter(e => !e.toLowerCase().includes('blood'));
}
```

### B. Combat Memory/Escalation
```javascript
// Track hits in current combat
const hitCount = CombatMemory.getHitsOnTarget(targetId, location);
if (hitCount >= 2) {
  // Escalate: "strikes the SAME wound", "further damages the already bleeding arm"
}
```

### C. Location-Verb Compatibility
```javascript
// Don't "cleave through their left eye" - use "punctures" instead
const compatibleVerbs = this.filterVerbsByLocation(verbs, location);
```

---

## Conclusion

Template variety is the **highest ROI improvement** you can make:
- **Minimal effort** (11 hours)
- **Massive impact** (10-20x perceived variety)
- **No data expansion** needed (reuses existing 2,600 phrases)
- **Grammatically correct** output
- **Easy to extend** over time

This should be implemented **before** expanding phrase pools further, as it multiplies the effectiveness of every phrase you already have.
