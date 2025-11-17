# Phase 3 Skills Investigation - Executive Summary

## What You Asked For

You asked me to investigate what data is available in PF2e skill check messages to determine if Phase 3 (Skill Check Narratives) is feasible.

## What I Found

**Status**: ⚠️ **UNKNOWN - TESTING REQUIRED**

The feasibility of Phase 3 **cannot be determined without live testing** in a running PF2e game.

---

## The Critical Unknown

### The Make-or-Break Question

**Can we detect WHAT a skill check is for, or only THAT a skill was rolled?**

### Why This Matters

#### Example: Demoralize Action (Intimidation check)

**Scenario A: Action Data Available** ✅
```javascript
message.flags.pf2e = {
  context: {
    action: "demoralize"  // ← We can detect the specific action!
  }
}
```
**Result**: "You bellow a fearsome war cry! The bandit stumbles backward in terror!"

---

**Scenario B: Only Skill Data Available** ❌
```javascript
message.flags.pf2e = {
  context: {
    skill: "intimidation"  // ← Only the skill, not the action
    // No way to tell Demoralize from Coerce!
  }
}
```
**Result**: "Your Intimidation check succeeds." (boring, unhelpful)

---

## My Frank Assessment

### The Problem: Same as Save-Based Spells?

We already discovered that **save-based spells have a fatal flaw**:
- PF2e provides "Fortitude save failed"
- PF2e does NOT provide which spell caused it
- Result: Can't generate spell-specific narratives

**Skill actions might have the exact same problem**:
- PF2e might provide "Intimidation check succeeded"
- PF2e might NOT provide whether it was Demoralize vs. Coerce
- Result: Can't generate action-specific narratives

### My Prediction (60% confidence)

Based on PF2e's architecture, I predict:
- ✅ PF2e provides skill names ("acrobatics", "intimidation")
- ❌ PF2e does NOT provide action names ("demoralize", "tumble-through")
- Result: Only generic skill narratives possible (low value)

**Evidence for pessimism**:
1. Save-based spells don't preserve context
2. No existing modules do skill narratives (suggests data limitations)
3. Skills are versatile (same skill, many uses)

**Evidence for optimism**:
1. PF2e preserves action context for Strikes
2. Skill actions are first-class citizens in PF2e
3. Competitive checks need target tracking

### Bottom Line

**I recommend NOT starting Phase 3 development until testing proves:**
1. Action names are preserved in messages
2. We can distinguish Demoralize from Coerce
3. We can distinguish Tumble Through from Balance

**If testing shows limited data, skip Phase 3 entirely.**

---

## What I Created for You

### Investigation Documents

1. **PHASE3_INVESTIGATION_INDEX.md**
   - Start here - navigation guide
   - Reading order
   - Quick summary

2. **PHASE3_QUICK_REFERENCE.md**
   - TL;DR version (10 minutes)
   - Decision matrix
   - Critical test cases

3. **PHASE3_TECHNICAL_ASSESSMENT.md**
   - Deep technical analysis (20 minutes)
   - Risk assessment
   - Personal recommendations

4. **PHASE3_SKILL_INVESTIGATION.md**
   - Comprehensive research (40 minutes)
   - Full testing protocol
   - All test cases documented

### Testing Tools

5. **test-skill-messages.js**
   - Browser console script
   - Ready to use in Foundry VTT
   - Automated message analysis
   - Interactive testing workflow

---

## How to Use These Documents

### Quick Path (30 minutes total)

1. **Read**: `PHASE3_QUICK_REFERENCE.md` (10 min)
2. **Test**: Run `test-skill-messages.js` in Foundry (30 min)
3. **Decide**: Based on test results

### Thorough Path (1 hour total)

1. **Read**: `PHASE3_INVESTIGATION_INDEX.md` (5 min)
2. **Read**: `PHASE3_QUICK_REFERENCE.md` (10 min)
3. **Test**: Run `test-skill-messages.js` in Foundry (30 min)
4. **Read**: `PHASE3_TECHNICAL_ASSESSMENT.md` (15 min)
5. **Decide**: Based on comprehensive analysis

---

## Testing Instructions (Quick Version)

### Option 1: Fastest Test (5 minutes)
1. Open Foundry VTT with PF2e
2. Open browser console (F12)
3. Use "Demoralize" action in game
4. Run in console:
   ```javascript
   console.log(JSON.stringify(
     game.messages.contents[game.messages.contents.length-1].flags?.pf2e,
     null, 2
   ))
   ```
5. Look for `context.action` field
   - **If exists**: ✅ Phase 3 viable
   - **If missing**: ❌ Phase 3 not viable

### Option 2: Full Testing (30 minutes)
1. Open Foundry VTT with PF2e
2. Copy contents of `test-skill-messages.js` into console
3. Run: `testActionSkillCheck()`
4. Use "Demoralize" action in game
5. Review automated analysis
6. Repeat for "Tumble Through" and other actions

---

## Decision Matrix

| Test Result | Viability | Recommendation | Effort | Value |
|-------------|-----------|----------------|--------|-------|
| ✅ Action names exist | **FULL** | Proceed with Phase 3 | 2-3 weeks | ⭐⭐⭐⭐⭐ |
| ⚠️ Skill names only | **PARTIAL** | Probably skip | 1 week | ⭐⭐ |
| ❌ No reliable data | **NONE** | Cancel Phase 3 | 0 weeks | N/A |

### My Recommendations

**IF tests show full action data** ✅:
- Build full Phase 3
- Focus on high-value actions (Demoralize, Tumble Through, Recall Knowledge)
- 50+ action-specific narratives
- Worth 2-3 weeks of development

**IF tests show skill data only** ⚠️:
- Skip Phase 3
- Generic narratives add minimal value
- Users won't miss what they never had
- Better to maintain quality standards

**IF tests show no reliable data** ❌:
- Cancel Phase 3
- Move to Phase 4 (Exploration) or Phase 6 (Conditions)
- Save 2-3 weeks of development time

---

## Alternative Phases (If Phase 3 Not Viable)

### Phase 4: Exploration Activities
- Weather effects
- Travel montages
- Hexploration encounters
- Probably has better data availability
- **Value**: ⭐⭐⭐⭐ High

### Phase 6: Condition Applications
- Condition manifestations (Frightened, Sickened, etc.)
- PF2e conditions are explicit in system
- Likely has excellent data availability
- **Value**: ⭐⭐⭐⭐ High

**Both are strong alternatives if Phase 3 fails.**

---

## Key Findings from Code Analysis

### What Works (Phase 1: Combat)

From `combat-hooks.js`, I found that Strike detection works perfectly:

```javascript
// Line 131-157: isStrikeMessage()
static isStrikeMessage(message) {
  const flags = message.flags?.pf2e;
  const context = flags.context;

  if (context.type === "attack-roll") return true;  // ✅ Explicit type
  if (context.action === "strike") return true;      // ✅ Action name
  if (flags.origin?.type === "weapon") return true;  // ✅ Item type

  return false;
}
```

**Success factors**:
1. Clear `context.type` field identifies roll type
2. `context.action` identifies specific action
3. `origin` provides item data
4. `context.target` provides target data

### What We Need (Phase 3: Skills)

```javascript
// UNKNOWN: Does this work?
static isSkillCheckMessage(message) {
  const flags = message.flags?.pf2e;
  const context = flags.context;

  if (context?.type === "skill-check") {    // ❓ Does this exist?
    const skill = context.skill;             // ❓ Does this exist?
    const action = context.action;           // ❓ CRITICAL: Does this exist?
    return true;
  }

  return false;
}
```

**Only testing can answer these questions.**

---

## PF2e Actions That Need Detection

### High Priority (Very common)
- **Demoralize** - Intimidation (every combat)
- **Tumble Through** - Acrobatics (common tactical move)
- **Recall Knowledge** - Various skills (every combat)
- **Feint** - Deception (Rogue staple)

### Medium Priority (Common)
- **Grapple, Shove, Trip, Disarm** - Athletics
- **Create a Diversion** - Deception
- **Force Open** - Athletics

### The Test Cases

**Critical Tests**:
1. **Demoralize vs. Coerce** (both Intimidation)
   - Can we tell them apart?
   - This is the litmus test

2. **Tumble Through vs. Balance** (both Acrobatics)
   - Can we tell them apart?
   - Another critical test

3. **Recall Knowledge** (any skill)
   - Can we detect the action?
   - Or just "Arcana check"?

---

## Comparison to Existing Code

### From utils.js (lines 466-476)

```javascript
static isStrikeMessage(message) {
  const flags = message.flags?.pf2e;
  if (!flags) return false;

  const context = flags.context;
  if (!context) return false;

  return context.type === "attack-roll" ||
         context.action === "strike" ||
         message.flags.pf2e.modifierName === "Attack Roll";
}
```

**Key insight**: PF2e provides multiple ways to detect strikes
- `context.type`
- `context.action`
- `modifierName`

**Question for skills**: Does PF2e provide similar redundancy?

---

## Risk Assessment

### Development Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Action data doesn't exist | 60% | High | Test before development |
| Skill data unreliable | 20% | Medium | Thorough testing protocol |
| User expects more than we can deliver | 40% | High | Don't build if limited data |

### User Experience Risk

**Scenario: We build generic skill narratives**

❌ **High risk of disappointment**:
- Phase 1 set high expectations
- "Your Intimidation succeeds" is boring
- Users expect "You demoralize the orc!"
- Better to skip than disappoint

✅ **Low risk if we skip Phase 3**:
- Users won't miss what was never promised
- Can focus on higher-value features
- Maintain quality standards

---

## My Personal Recommendation

As someone who has analyzed this project deeply:

### 1. Run the Tests (1 hour investment)
- Use `test-skill-messages.js`
- Test Demoralize, Tumble Through, generic checks
- Document exact message structures

### 2. Be Honest About Results
- If action data exists → ✅ Great! Proceed with full Phase 3
- If skill data only → ⚠️ Discuss, but probably skip
- If no reliable data → ❌ Cancel immediately

### 3. Maintain Quality Standards
- Phase 1 (Combat) is excellent
- Don't dilute quality with weak Phase 3
- Users prefer quality over quantity

### 4. Consider Alternatives
- Phase 4 (Exploration) might have better hooks
- Phase 6 (Conditions) likely has good data
- Both provide high user value

### 5. Don't Force It
- If the data isn't there, skip Phase 3
- Save 2-3 weeks of development time
- Focus on features that will actually work well

---

## Success Criteria

Phase 3 should ONLY proceed if ALL of these are true:

1. ✅ `context.action` exists for Demoralize
2. ✅ `context.action` exists for Tumble Through
3. ✅ `context.action` exists for Grapple
4. ✅ We can distinguish different actions using same skill
5. ✅ Detection is reliable (>95% accuracy)
6. ✅ User value justifies 2-3 weeks of development

**If ANY of these fail, skip Phase 3.**

---

## Next Steps

### Immediate Actions
1. ✅ Review investigation documents
2. ✅ Understand the critical questions
3. ✅ Run testing protocol
4. ✅ Make go/no-go decision

### If Proceeding
1. Design skill-hooks.js architecture
2. Create action-specific narrative templates
3. Implement detection system
4. Test thoroughly

### If Skipping
1. Document decision rationale
2. Update README roadmap
3. Begin Phase 4 or Phase 6 planning
4. Move forward confidently

---

## Files Created

All investigation files are in your project root:

```
/home/user/PF2e-Narrative-Seeds/
├── PHASE3_INVESTIGATION_INDEX.md      ← Start here
├── PHASE3_QUICK_REFERENCE.md          ← Quick guide
├── PHASE3_TECHNICAL_ASSESSMENT.md     ← Deep analysis
├── PHASE3_SKILL_INVESTIGATION.md      ← Full research
├── PHASE3_SUMMARY.md                  ← This file
└── test-skill-messages.js             ← Testing script
```

---

## The Bottom Line

**You asked**: "What data is available in PF2e skill check messages?"

**My answer**: "I don't know - and neither does anyone else until you test it."

**The good news**: I've given you everything you need to find out:
- ✅ Comprehensive investigation
- ✅ Testing tools ready to use
- ✅ Clear decision criteria
- ✅ Alternative plans if Phase 3 fails

**The bad news**: You need to spend 30 minutes testing in a live game to get the answer.

**My prediction**: 60% chance Phase 3 isn't viable, 30% chance it's fully viable, 10% chance of partial viability.

**My recommendation**: Test it. If the data isn't there, skip it. If it is there, build it well.

---

## Questions?

- **Quick answers**: Read `PHASE3_QUICK_REFERENCE.md`
- **Technical details**: Read `PHASE3_TECHNICAL_ASSESSMENT.md`
- **Testing help**: Use `test-skill-messages.js`
- **Full research**: Read `PHASE3_SKILL_INVESTIGATION.md`

---

**Next action**: Run the tests. Then decide.

**Remember**: Quality over quantity. An hour of testing saves weeks of wasted effort.

---

*Investigation completed by: Claude*
*Date: 2025-01-17*
*Time invested: ~2 hours of analysis*
*Time to decision: ~1 hour of testing*
*Potential time saved: 2-3 weeks if Phase 3 not viable*
