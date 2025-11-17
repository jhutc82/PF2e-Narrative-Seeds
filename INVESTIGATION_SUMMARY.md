# PF2e Skill Action Detection - Investigation Summary

**Investigation Date**: January 2025
**Status**: ⚠️ **READY FOR TESTING** - All research complete, awaiting 30-minute test
**Key Question**: Can PF2e distinguish "Demoralize action" from "generic Intimidation check"?

---

## TL;DR

### What We Found

1. ✅ **PF2e system DOES use action identifiers**
   - Source code shows `"action:demoralize"`, `"action:tumble-through"`, etc.
   - Found in system source: `pf2e/src/module/system/action-macros/`

2. ✅ **Roll options ARE stored in messages**
   - PF2e documentation confirms roll options are in flags
   - Can be inspected via "Inspect Roll" feature

3. ❓ **UNKNOWN: Where exactly they appear**
   - Possibly: `message.flags.pf2e.context.action`
   - Possibly: `message.flags.pf2e.context.options[]`
   - Need to test to confirm exact location

### What This Means

**If action identifiers ARE preserved in chat messages:**
- ✅ Phase 3 is VIABLE
- ✅ Can generate action-specific narratives
- ✅ Can distinguish Demoralize from Coerce
- ✅ Worth 2-3 weeks of development

**If action identifiers are NOT preserved:**
- ❌ Phase 3 has same fatal flaw as save-based spells
- ❌ Cannot distinguish actions from generic checks
- ❌ Should cancel Phase 3
- ✅ Saves 2-3 weeks of development time

---

## How to Get the Answer (Choose One Method)

### Method 1: Quick Test (2 minutes) ⭐ RECOMMENDED

1. Open Foundry VTT with PF2e
2. Use Demoralize action on an enemy
3. Right-click the chat message
4. Select "Inspect Roll"
5. Look for `"action:demoralize"` in the list

**Result**:
- See it → Phase 3 viable
- Don't see it → Phase 3 not viable

### Method 2: Console Test (5 minutes)

```javascript
// After using Demoralize:
const msg = game.messages.contents[game.messages.contents.length - 1];
console.log(JSON.stringify(msg.flags.pf2e, null, 2));

// Look for:
// - context.action: "demoralize"
// - context.options: ["action:demoralize", ...]
```

### Method 3: Use Test Script (10 minutes)

1. Copy `/test-skill-messages.js` into console
2. Run: `testActionSkillCheck()`
3. Perform Demoralize
4. Read automated analysis

---

## Current Detection Pattern (Phase 1 - Strikes)

```javascript
// From combat-hooks.js - THIS WORKS
static isStrikeMessage(message) {
  const context = message.flags?.pf2e?.context;

  if (context.type === "attack-roll") return true;
  if (context.action === "strike") return true;  // ← Key line

  return false;
}
```

**Why it works**: PF2e sets `context.action = "strike"` for all Strike actions.

**Question**: Does PF2e also set `context.action = "demoralize"` for skill actions?

---

## Potential Detection Pattern (Phase 3 - Skills)

### If action is in context.action (Best Case)

```javascript
static isSkillActionMessage(message) {
  const context = message.flags?.pf2e?.context;

  if (context.type === "skill-check") {
    return !!context.action;  // "demoralize", "tumble-through", etc.
  }

  return false;
}
```

### If action is in context.options array (Also Good)

```javascript
static isSkillActionMessage(message) {
  const context = message.flags?.pf2e?.context;

  if (context.type === "skill-check" && context.options) {
    return context.options.some(opt => opt.startsWith("action:"));
  }

  return false;
}
```

### If action is NOT preserved (Fatal Flaw)

```javascript
// Can only detect skill name, not action
static isSkillCheck(message) {
  const context = message.flags?.pf2e?.context;
  return context.type === "skill-check";  // But which action?
}

// Cannot distinguish:
// - Demoralize vs. Coerce (both Intimidation)
// - Tumble Through vs. Balance (both Acrobatics)
```

---

## Decision Matrix

| Data Available | Viability | Development Time | User Value | Recommendation |
|----------------|-----------|------------------|------------|----------------|
| ✅ Action name + skill + outcome | **FULL** | 2-3 weeks | ⭐⭐⭐⭐⭐ High | ✅ **PROCEED** |
| ⚠️ Skill + outcome only | **PARTIAL** | 1 week | ⭐⭐ Low | ⚠️ **DISCUSS** |
| ❌ Unreliable/missing | **NONE** | - | ⭐ None | ❌ **CANCEL** |

---

## Example Narratives (If Viable)

### Demoralize - Critical Success
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💀 You unleash a terrifying roar that echoes across
the battlefield! The bandit staggers backward, face
pale with terror, completely shaken by your fearsome
presence!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Tumble Through - Success
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 You nimbly tumble past the guard, slipping through
their reach with practiced ease! They spin around,
caught off-guard by your acrobatic maneuver!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Grapple - Critical Success
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💪 With explosive power, you grab the orc and wrench
them into a devastating lock! They struggle helplessly
against your iron grip, completely immobilized!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Supported Actions (If Viable)

### High Priority (Very Common)
- ✅ **Demoralize** (Intimidation) - Used every combat
- ✅ **Tumble Through** (Acrobatics) - Common tactical move
- ✅ **Recall Knowledge** (Various) - Used constantly
- ✅ **Feint** (Deception) - Rogue staple

### Medium Priority (Common)
- ✅ **Grapple** (Athletics) - Has Attack trait
- ✅ **Trip** (Athletics) - Has Attack trait
- ✅ **Shove** (Athletics) - Has Attack trait
- ✅ **Create a Diversion** (Deception)
- ✅ **Hide** (Stealth)

### Expected Coverage
- Start with 5-7 most common actions
- Expand to 15-20 over time
- Covers 80%+ of skill action usage

---

## Risk Assessment

### High Risk: Action Identifiers May Not Exist
**Impact**: Phase 3 completely not viable
**Probability**: 30-40%
**Mitigation**: Test FIRST before any development

### Medium Risk: Inconsistent Implementation
**Impact**: Only some actions detectable
**Probability**: 20-30%
**Mitigation**: Create whitelist of working actions

### Low Risk: Generic Narratives Only
**Impact**: Limited user value
**Probability**: 30-40%
**Mitigation**: Discuss with team if worth effort

---

## Success Criteria

Phase 3 succeeds if:

1. ✅ Action names reliably detected in message flags
2. ✅ Works for 5+ different actions consistently
3. ✅ Can distinguish actions from generic skill checks
4. ✅ Can distinguish similar actions (Demoralize vs. Coerce)
5. ✅ Performance impact negligible
6. ✅ No false positives/negatives
7. ✅ Users report positive feedback

---

## Files Created During Investigation

### Quick Reference
- **`PHASE3_QUICK_TEST_GUIDE.md`** ⭐ START HERE
  - 5-minute test protocol
  - Fastest path to answer
  - Decision tree

### Comprehensive Analysis
- **`PHASE3_FINAL_INVESTIGATION_REPORT.md`**
  - Full research findings
  - Complete testing protocol
  - Implementation plan
  - Risk assessment

### Technical Details
- **`PHASE3_DETECTION_CODE_EXAMPLES.md`**
  - Example detection code
  - Multiple scenarios
  - Integration patterns
  - Action reference list

### Existing Files
- **`test-skill-messages.js`**
  - Automated testing script
  - Message analysis functions
  - Already created, ready to use

- **`PHASE3_SKILL_INVESTIGATION.md`**
  - Original research notes
  - Test case definitions

---

## Next Steps

### Immediate (This Week)
1. **Execute Testing** (30 minutes)
   - Use "Inspect Roll" feature
   - Console inspection
   - Test script
   - Document findings

2. **Make Decision** (15 minutes)
   - Full viability → Proceed
   - Partial viability → Discuss
   - Not viable → Cancel

3. **Update Documentation** (15 minutes)
   - Record test results
   - Update roadmap
   - Inform stakeholders

### If Proceeding (Weeks 1-3)
1. **Week 1**: Core detection system
2. **Week 2**: Narrative generation
3. **Week 3**: Polish and testing

### If Cancelling
1. Document findings
2. Archive research
3. Move to next priority
4. Time saved: 120+ hours

---

## Comparison to Similar Systems

### Phase 1 (Combat/Strikes) - Current System ✅

**What we detect**:
```javascript
{
  action: "strike",
  weapon: "longsword",
  target: "Goblin Warrior",
  outcome: "criticalSuccess",
  damage: 18
}
```

**What we generate**:
> "Your blade cleaves through the goblin's defenses! Blood sprays as your longsword bites deep into their chest, and they cry out in agony!"

**User feedback**: Very positive, significantly enhances combat

---

### Phase 3 (Skills) - Proposed System ❓

**What we HOPE to detect**:
```javascript
{
  action: "demoralize",      // ← KEY UNKNOWN!
  skill: "intimidation",
  target: "Goblin Warrior",
  outcome: "success"
}
```

**What we HOPE to generate**:
> "You bellow a fierce war cry that echoes across the battlefield! The goblin's eyes widen in terror as they stumble backward, shaken by your fearsome presence!"

**Expected user value**: High (if viable)

---

### Save-Based Spells - Cancelled System ❌

**What we can detect**:
```javascript
{
  saveType: "fortitude",
  outcome: "failure"
  // NO spell name available!
}
```

**What we CANNOT generate**:
> Generic: "Your Fortitude save fails!"
>
> Cannot generate spell-specific:
> - "The poison courses through your veins!" (Cloudkill)
> - "Darkness descends as your vision fails!" (Blindness)

**Reason for cancellation**: Same generic message adds no value

**Phase 3 risk**: May have exact same problem!

---

## The Critical Insight

### Why Strike Detection Works

PF2e provides **specific action identifier**:
```javascript
context.action = "strike"  // Explicit, unambiguous
```

We can confidently generate:
> "Your longsword slashes across the enemy!"

---

### Why Save-Based Spells Failed

PF2e provides only **generic save type**:
```javascript
context.saveType = "fortitude"  // Could be 100+ different spells!
```

We can only generate:
> "Your Fortitude save fails." ← Useless, PF2e already shows this

---

### Why Phase 3 Is Make-or-Break

**If PF2e provides**:
```javascript
context.action = "demoralize"  // Specific action
```

Then we can generate:
> "You bellow a fearsome war cry!" ← Adds value! ✅

**If PF2e only provides**:
```javascript
context.skill = "intimidation"  // Generic skill
```

Then we can only generate:
> "Your Intimidation check succeeds." ← Useless, PF2e already shows this ❌

---

## Conclusion

### Current Status
✅ All research complete
✅ Test protocols prepared
✅ Detection code drafted
✅ Decision criteria established
⏸️ **Waiting on 30-minute test**

### The Answer Is 30 Minutes Away

Everything hinges on one test:

```
Right-click Demoralize message → "Inspect Roll"

See "action:demoralize"?
├─ YES → Phase 3 viable, proceed with 3-week implementation
└─ NO  → Phase 3 not viable, cancel and save 120 hours
```

### Recommendation

**DO NOT start any development until testing confirms viability.**

Testing investment: 30 minutes
Development investment: 120 hours (3 weeks)

**Test first, develop second.**

---

## Questions Answered

### 1. Action Detection in PF2e
✅ **Answered**: PF2e system DOES use action identifiers in source code
❓ **Unknown**: Whether they're preserved in chat messages (needs testing)

### 2. Compare to Strike Action
✅ **Answered**: Strike uses `context.action = "strike"` pattern
❓ **Unknown**: If skills use same pattern (needs testing)

### 3. Identify Viable Actions
✅ **Answered**: Know which actions exist and their slugs
❓ **Unknown**: Which ones actually work in practice (needs testing)

### 4. Create Detection Code
✅ **Answered**: Detection code examples created for all scenarios
⏸️ **Waiting**: Need test results to know which scenario applies

### 5. Feasibility Assessment
⏸️ **Waiting**: Depends entirely on test results

**The key question**: Can we detect "player used Demoralize action" vs. just "player rolled Intimidation check"?

**Answer**: ⏸️ **CONDUCT 30-MINUTE TEST TO FIND OUT**

---

## Testing Priority

Given that Phase 3 represents a potential 120-hour investment, the 30-minute test has an ROI of:

**ROI = 120 hours saved (if not viable) / 0.5 hours testing = 240:1**

**This is the highest-value 30 minutes of the entire project.**

---

## Start Here

👉 **`/PHASE3_QUICK_TEST_GUIDE.md`** 👈

Follow the 2-minute quick test, get your answer, make your decision.

Everything else is documented and ready to go based on your results.
