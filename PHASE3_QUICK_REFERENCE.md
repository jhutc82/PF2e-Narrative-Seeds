# Phase 3 (Skills) Quick Reference Guide

## TL;DR: The Critical Question

**Can we detect WHAT a skill check is for, or only THAT a skill was rolled?**

- ✅ **Good**: "Demoralize" action → `context.action = "demoralize"` → "You demoralize the orc!"
- ❌ **Bad**: "Demoralize" action → `context = { /* generic */ }` → "You rolled Intimidation!"

---

## Quick Testing (5 Minutes)

### Option 1: Manual Console Test
1. Open Foundry VTT with PF2e
2. Open browser console (F12)
3. Perform a skill action (Demoralize, Tumble Through, etc.)
4. Run: `console.log(JSON.stringify(game.messages.contents[game.messages.contents.length-1].flags?.pf2e, null, 2))`
5. Look for `context.action` field

### Option 2: Use Test Script
1. Copy `/test-skill-messages.js` into browser console
2. Run: `testActionSkillCheck()`
3. Use a skill action in game
4. Read the automatic analysis

---

## What We're Looking For

### Example: Demoralize Action (Intimidation Check)

**GOOD (Phase 3 Viable)**:
```json
{
  "context": {
    "type": "skill-check",
    "skill": "intimidation",
    "action": "demoralize",          // ← THIS IS THE KEY!
    "outcome": "success",
    "target": {
      "actor": "abc123",
      "token": "def456"
    }
  }
}
```

**BAD (Phase 3 Not Viable)**:
```json
{
  "context": {
    "type": "skill-check",
    "skill": "intimidation",
    // No "action" field!
    // Can't tell Demoralize from Coerce!
  }
}
```

---

## Critical Test Cases

### 1. Demoralize vs. Coerce
- Both use **Intimidation** skill
- **IF** we can distinguish them → Phase 3 viable
- **IF** we can't → Phase 3 limited

### 2. Tumble Through vs. Balance
- Both use **Acrobatics** skill
- **IF** we can distinguish them → Phase 3 viable
- **IF** we can't → Phase 3 limited

### 3. Recall Knowledge
- Uses **any** knowledge skill
- **IF** we can detect "Recall Knowledge" action → Great!
- **IF** we can't → Generic skill narratives only

---

## Decision Matrix

| Data Available | Viability | What We Can Do | Should We Build It? |
|----------------|-----------|----------------|---------------------|
| ✅ Action name + skill + outcome + target | **FULL** | Action-specific narratives:<br>"You demoralize the orc!"<br>"You tumble past the guard!" | ✅ **YES - Full Phase 3** |
| ⚠️ Skill + outcome only | **PARTIAL** | Generic skill narratives:<br>"Your Intimidation succeeds!"<br>"Your Acrobatics check fails!" | ⚠️ **MAYBE - Discuss value** |
| ❌ Unreliable/missing data | **NONE** | Nothing useful | ❌ **NO - Skip Phase 3** |

---

## Example Narratives (if viable)

### Action-Specific (Requires action data)
```
Demoralize (Critical Success):
"Your fierce snarl sends the bandit stumbling backward in terror!"

Tumble Through (Success):
"You gracefully roll past the guard's outstretched arms!"

Grapple (Critical Failure):
"You lunge for the orc but grasp only air as they sidestep!"

Recall Knowledge (Success):
"Your knowledge of ancient lore reveals a weakness!"
```

### Generic Skill (Fallback if no action data)
```
Acrobatics (Success):
"Your acrobatic training serves you well!"

Athletics (Critical Success):
"Your athletic prowess shines through!"

Intimidation (Failure):
"Your attempt to intimidate falls flat."
```

---

## PF2e Actions That Would Benefit

### High Value (Very common)
- **Demoralize** - Intimidation (used constantly in combat)
- **Tumble Through** - Acrobatics (common tactical move)
- **Recall Knowledge** - Various skills (every combat)
- **Feint** - Deception (Rogue staple)

### Medium Value (Common)
- **Create a Diversion** - Deception
- **Grapple** - Athletics
- **Shove** - Athletics
- **Trip** - Athletics
- **Disarm** - Athletics
- **Force Open** - Athletics

### Lower Value (Less common)
- **Coerce** - Intimidation
- **Make an Impression** - Diplomacy
- **Request** - Diplomacy
- **Gather Information** - Diplomacy

---

## Comparison to Phase 1 (Combat)

### Phase 1: Strikes (WORKING) ✅
```javascript
// PF2e provides clear identifiers
if (context.type === "attack-roll") return true;
if (context.action === "strike") return true;
if (origin.type === "weapon") return true;

// We ALWAYS know:
// - It's a strike
// - What weapon was used
// - Who was attacked
// - What the outcome was
```

### Phase 3: Skills (UNKNOWN) ❓
```javascript
// Does PF2e provide similar identifiers?
if (context.type === "skill-check") return true; // Maybe?
if (context.action === "demoralize") return true; // Maybe?
if (context.skill === "intimidation") return true; // Maybe?

// Can we RELIABLY know:
// - It's a skill check? (probably)
// - Which skill? (probably)
// - Which action? (CRITICAL UNKNOWN)
// - Who was targeted? (unknown)
// - What the outcome was? (probably)
```

---

## Why This Matters

### Scenario: Demoralize Action

**WITH action data** ✅:
```
"Valeros bellows a fearsome war cry, and the bandit's eyes widen
in fear as they stumble backward!"
```
- Contextual and specific
- Adds flavor and immersion
- Worth implementing

**WITHOUT action data** ❌:
```
"Valeros makes an Intimidation check. It succeeds."
```
- Generic and unhelpful
- Adds no value over default PF2e message
- Not worth implementing

---

## Recommendations

### Before Any Development
1. ✅ Run tests in `test-skill-messages.js`
2. ✅ Document findings in `PHASE3_SKILL_INVESTIGATION.md`
3. ✅ Make go/no-go decision
4. ✅ Update README with decision

### If Tests Show FULL Viability
- ✅ Implement Phase 3 with action-specific narratives
- ✅ Focus on high-value actions (Demoralize, Tumble Through, Recall Knowledge)
- ✅ Estimated effort: 2-3 weeks
- ✅ High user value

### If Tests Show PARTIAL Viability
- ⚠️ Discuss whether generic skill narratives are worthwhile
- ⚠️ Consider reduced scope (just outcome flavoring)
- ⚠️ Estimated effort: 1 week
- ⚠️ Low-to-medium user value

### If Tests Show NO Viability
- ❌ Skip Phase 3 entirely
- ❌ Document why it's not feasible
- ❌ Move to Phase 4 (Exploration) or Phase 6 (Conditions)
- ✅ Save 2-3 weeks of development time

---

## Next Actions

1. **Run Tests** (30 minutes)
   - Use `test-skill-messages.js`
   - Test Demoralize, Tumble Through, generic checks
   - Document message structures

2. **Make Decision** (15 minutes)
   - Review test results
   - Determine viability level
   - Decide go/no-go

3. **Update Documentation** (15 minutes)
   - Add findings to investigation doc
   - Update README roadmap if needed
   - Create issue/PR if proceeding

**Total Time Investment**: ~1 hour to make an informed decision

---

## The Bottom Line

**Do not start Phase 3 development until testing confirms:**
1. ✅ Action names are preserved in messages
2. ✅ Skill names are reliably detectable
3. ✅ Outcomes are clear
4. ✅ System is worth the development time

**If the data isn't there, skip Phase 3. It's better to have no feature than a bad feature.**

---

*Last Updated: 2025-01-17*
