# Phase 3: Feat Detection Investigation

## The Challenge

Many feats modify skill actions in ways that change their narrative flavor:

- **Intimidating Glare**: Demoralize is visual, not auditory
- **Battle Cry**: Demoralize happens at combat start (different context)
- **Intimidating Prowess**: Uses physical strength, not charisma (different tone)
- **Quick Jump**: Athletic jumps are faster/more graceful
- **Titan Wrestler**: Can grapple much larger foes (size implication)

**Without feat detection**, narratives could be inaccurate:
> ❌ "You bellow a fearsome war cry!" (wrong - Intimidating Glare is silent)

**With feat detection**, narratives adapt:
> ✅ "Your withering glare freezes the enemy in their tracks!"

---

## Technical Question

**Can we detect which feats a character has when they use a skill action?**

### Expected Pattern

If PF2e uses `"action:demoralize"` in roll options, feats likely follow similar patterns:

```javascript
// Possible roll option patterns
"feat:intimidating-glare"
"self:feat:intimidating-glare"  // More specific
"feature:intimidating-glare"    // Alternative naming
```

### Test Protocol

1. Create character with **Intimidating Glare** feat
2. Use **Demoralize** action
3. Right-click message → "Inspect Roll"
4. Look for feat-related roll options

---

## Implementation Levels

### Level 0: Ignore Feats (MVP)
**Description**: Generic narratives that work for all variants.

**Demoralize (any variant)**:
```
"You unleash an intimidating display that shakes your foe!"
```

**Pros**: Simple, always accurate, fast to implement
**Cons**: Less immersive, misses flavor opportunities

---

### Level 1: Detect Critical Feats (Recommended)
**Description**: Detect feats that fundamentally change action flavor.

**Priority Feats (5-10 total)**:

#### Intimidation
- **Intimidating Glare**: Visual vs. auditory
- **Battle Cry**: Context (combat start)
- **Intimidating Prowess**: Physical vs. social

#### Deception
- **Lengthy Diversion**: Extended duration (different outcome emphasis)
- **Confabulator**: Reduced crit fail impact

#### Athletics
- **Titan Wrestler**: Size implications for Grapple/Shove/Trip
- **Combat Climber**: Combat-specific climbing context
- **Quick Swim**: Speed/grace in water

#### Acrobatics
- **Quick Jump**: Speed/grace in jumping
- **Kip Up**: Standing with style

**Example Detection Code**:
```javascript
static hasIntimidatingGlare(message) {
  const options = message.flags?.pf2e?.context?.options || [];
  return options.some(opt =>
    opt.includes("intimidating-glare") ||
    opt.includes("feat:intimidating-glare")
  );
}

static generateDemoralize(actionData) {
  const { outcome, hasIntimidatingGlare, isBattleCry } = actionData;

  if (hasIntimidatingGlare) {
    // Visual narratives only
    return this.selectPhrase([
      "Your withering glare freezes the enemy in their tracks!",
      "You lock eyes with your foe, radiating menace!",
      "Your piercing stare conveys unmistakable threat!"
    ]);
  }

  if (isBattleCry) {
    // Combat start context
    return this.selectPhrase([
      "Your battle cry echoes as combat begins!",
      "You unleash a war shout that shakes your enemies!",
      "Your fearsome roar announces your presence!"
    ]);
  }

  // Default auditory narratives
  return this.selectPhrase([
    "You bellow a fearsome threat!",
    "You shout intimidating words!",
    "Your voice carries unmistakable menace!"
  ]);
}
```

**Pros**:
- ✅ Accurate flavor for common modifications
- ✅ Enhances immersion for feat users
- ✅ Manageable scope

**Cons**:
- ❌ More complex detection
- ❌ Requires testing each feat
- ❌ Adds ~1 week to development

---

### Level 2: Full Feat Integration (Future)
**Description**: Detect all 30+ relevant feats.

**Additional Feats**:
- Assurance (any skill): "With practiced certainty..."
- Terrified Retreat: Enhanced crit success
- Pickpocket: Stealthy theft narrative
- Swift Sneak: Full-speed stealth
- Cloud Jump: Guaranteed success emphasis

**Pros**: Maximum immersion, rewards feat investment
**Cons**: High maintenance, diminishing returns, scope creep

---

## Recommended Approach

### Phase 3A: Launch Without Feat Detection
1. Implement generic narratives (Level 0)
2. Focus on getting action detection working
3. Launch with 20-30 skill actions
4. **Estimated effort**: 2-3 weeks

### Phase 3B: Add Feat Support (Enhancement)
1. After Phase 3A is stable
2. Implement Level 1 feat detection (5-10 critical feats)
3. Refine narratives for feat variants
4. **Estimated effort**: +1 week

---

## Testing Requirements

### Without Feat Detection
- ✅ Test each action with default character
- ✅ Verify narratives are generic enough to fit all cases
- ✅ Ensure no auditory-specific language for actions that can be silent

### With Feat Detection
- ✅ Test each action with relevant feat
- ✅ Test each action without feat (regression)
- ✅ Verify correct variant narrative appears
- ✅ Test multiple feat combinations

---

## Data Structure: Feat-Aware Narratives

```json
{
  "action": "demoralize",
  "skill": "intimidation",

  "narratives": {
    "default": {
      "criticalSuccess": [
        "You unleash a fearsome display that breaks your enemy's nerve!",
        "Your intimidating presence shakes your foe to the core!"
      ],
      "success": [
        "You successfully unnerve your opponent!",
        "Your threatening demeanor makes them hesitate!"
      ]
    },

    "feats": {
      "intimidating-glare": {
        "criticalSuccess": [
          "Your withering glare completely breaks their composure!",
          "They freeze under your piercing, menacing stare!"
        ],
        "success": [
          "Your cold stare makes them visibly nervous!",
          "They flinch under your intense gaze!"
        ]
      },

      "battle-cry": {
        "criticalSuccess": [
          "Your battle cry echoes across the battlefield, sending enemies reeling!",
          "The fury in your war shout shakes the resolve of all who hear it!"
        ],
        "success": [
          "Your war cry announces your presence with authority!",
          "Your battle roar catches the enemy's attention!"
        ]
      },

      "intimidating-prowess": {
        "criticalSuccess": [
          "You loom over them with overwhelming physical menace!",
          "The raw threat of your imposing presence breaks their will!"
        ],
        "success": [
          "Your powerful frame conveys unmistakable danger!",
          "They shrink back from your imposing stature!"
        ]
      }
    }
  }
}
```

---

## Decision Matrix

| Scenario | Action Detection | Feat Detection | Phase 3 Viability | Recommended Path |
|----------|------------------|----------------|-------------------|------------------|
| **Best Case** | ✅ Works | ✅ Works | ⭐⭐⭐⭐⭐ | Launch 3A, then 3B |
| **Good Case** | ✅ Works | ❌ Doesn't work | ⭐⭐⭐⭐ | Launch 3A only (generic) |
| **Bad Case** | ❌ Doesn't work | N/A | ❌ | Cancel Phase 3 |

---

## Key Questions for Testing

1. **Do feat identifiers appear in roll options?**
   - Look for: `"feat:intimidating-glare"` or similar
   - Where: `context.options[]` array

2. **Are they consistent across all feats?**
   - Test multiple feats
   - Verify naming pattern

3. **Are they present for all action uses?**
   - Test with feat active
   - Verify it appears every time

---

## Bottom Line

**Feat detection is a NICE TO HAVE, not a MUST HAVE.**

**Recommended approach**:
1. ✅ Test if action detection works (critical)
2. ✅ Test if feat detection works (bonus)
3. ✅ Launch Phase 3A with generic narratives (Level 0)
4. ⏸️ Add feat support later if viable (Phase 3B)

**This keeps scope manageable while leaving room for enhancement.**

---

## Testing Script Addition

Add this to `test-skill-messages.js`:

```javascript
// Test feat detection
function testFeatDetection() {
  console.log("=== FEAT DETECTION TEST ===");
  console.log("Requirements:");
  console.log("1. Create character with Intimidating Glare feat");
  console.log("2. Use Demoralize action");
  console.log("3. Check for feat identifier in roll options");
  console.log("");

  console.log("Expected patterns to look for:");
  console.log('  - "feat:intimidating-glare"');
  console.log('  - "self:feat:intimidating-glare"');
  console.log('  - "feature:intimidating-glare"');
  console.log("");

  console.log("Hook installed. Use Demoralize now...");

  Hooks.once("createChatMessage", (message) => {
    const flags = message.flags?.pf2e;
    const options = flags?.context?.options || [];

    console.log("=== FEAT DETECTION RESULTS ===");
    console.log("Roll options:", options);

    const featOptions = options.filter(opt =>
      opt.includes("feat") || opt.includes("feature")
    );

    if (featOptions.length > 0) {
      console.log("✅ FEAT IDENTIFIERS FOUND:");
      featOptions.forEach(feat => console.log(`  - ${feat}`));
    } else {
      console.log("❌ NO FEAT IDENTIFIERS FOUND");
      console.log("This means feat detection may not be viable.");
    }
  });
}
```

---

## Summary

Feat detection adds complexity but significantly improves immersion. However:

- **Not required** for Phase 3 launch
- **Can be added later** as enhancement
- **Should be tested** alongside action detection
- **Manageable scope** if limited to 5-10 critical feats

**Recommended**: Launch Phase 3 without feat support, add it in Phase 3B if testing confirms viability.
