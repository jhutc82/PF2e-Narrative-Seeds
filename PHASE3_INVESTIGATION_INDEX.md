# Phase 3 (Skills) Investigation - Index

## Overview

This directory contains a comprehensive investigation into the feasibility of Phase 3 (Skill Check Narratives) for the PF2e Narrative Seeds module.

**Status**: 🔬 Investigation Complete - Testing Required

---

## Investigation Documents

### 📋 Start Here

1. **[PHASE3_QUICK_REFERENCE.md](./PHASE3_QUICK_REFERENCE.md)**
   - **Read this first** - TL;DR version
   - 5-minute quick start guide
   - Critical questions and decision matrix
   - **Best for**: Quick understanding of the issue

2. **[PHASE3_TECHNICAL_ASSESSMENT.md](./PHASE3_TECHNICAL_ASSESSMENT.md)**
   - **Read this second** - Technical deep-dive
   - Detailed risk assessment
   - Comparison to existing phases
   - Personal recommendations
   - **Best for**: Making the go/no-go decision

3. **[PHASE3_SKILL_INVESTIGATION.md](./PHASE3_SKILL_INVESTIGATION.md)**
   - **Reference document** - Comprehensive research
   - Full testing protocol
   - All test cases documented
   - Detailed message structure analysis
   - **Best for**: Running the actual tests

### 🧪 Testing Tools

4. **[test-skill-messages.js](./test-skill-messages.js)**
   - **Browser console script** - Ready to use
   - Automated message analysis
   - Interactive testing workflow
   - Copy-paste into Foundry console
   - **Best for**: Actually performing the tests

---

## Quick Start: 3 Steps to Decision

### Step 1: Understand the Problem (10 minutes)
Read: `PHASE3_QUICK_REFERENCE.md`

**Key Question**: Can we detect WHAT a skill check is for, or only THAT a skill was rolled?

### Step 2: Run the Tests (30 minutes)
1. Open Foundry VTT with PF2e
2. Copy `test-skill-messages.js` into browser console
3. Run: `testActionSkillCheck()`
4. Use "Demoralize" action in game
5. Review analysis output

**Key Finding**: Look for `context.action = "demoralize"` in the output

### Step 3: Make Decision (15 minutes)
Read: `PHASE3_TECHNICAL_ASSESSMENT.md`

**If action data exists**: ✅ Proceed with full Phase 3
**If skill data only**: ⚠️ Discuss reduced scope (probably skip)
**If no reliable data**: ❌ Cancel Phase 3, move to Phase 4/6

---

## The Critical Question

**Everything depends on one thing:**

Does PF2e preserve action names (like "demoralize", "tumble-through") in skill check messages, or does it only provide the skill name (like "intimidation", "acrobatics")?

### Why This Matters

**WITH action names** ✅:
```javascript
// We can generate:
"You bellow a fearsome war cry! The bandit stumbles backward in terror!"
```

**WITHOUT action names** ❌:
```javascript
// We can only generate:
"Your Intimidation check succeeds."
// (boring, unhelpful, adds no value)
```

---

## Test Results Template

After running tests, document your findings here:

### Test A: Generic Skill Check (Acrobatics)
- Message ID: ___________
- `context.type`: ___________
- `context.skill`: ___________
- `context.statistic`: ___________
- Viability: ___________

### Test B: Demoralize Action
- Message ID: ___________
- `context.type`: ___________
- `context.skill`: ___________
- `context.action`: ___________ ⬅ **CRITICAL!**
- `context.target`: ___________
- Viability: ___________

### Test C: Tumble Through Action
- Message ID: ___________
- `context.action`: ___________ ⬅ **CRITICAL!**
- Viability: ___________

### Decision
- [ ] ✅ Full viability - Proceed with Phase 3
- [ ] ⚠️ Partial viability - Discuss reduced scope
- [ ] ❌ Not viable - Cancel Phase 3

---

## Comparison: What We Know Works

### Phase 1: Combat Strikes ✅

**Detection**:
```javascript
// PF2e provides clear identifiers
context.type === "attack-roll"  // ✅ Works
context.action === "strike"     // ✅ Works
origin.type === "weapon"        // ✅ Works
```

**Result**: 100% reliable detection
- Always know it's a strike
- Always know what weapon
- Always know the target
- Always know the outcome

**User Experience**: ⭐⭐⭐⭐⭐ Excellent
```
"Your longsword cleaves through the troll's exposed throat with
crushing force! Blood sprays in a crimson arc."
```

### Phase 3: Skill Checks ❓

**Detection**: UNKNOWN
```javascript
// Does PF2e provide similar identifiers?
context.type === "skill-check"  // ❓ Unknown
context.skill === "intimidation" // ❓ Unknown
context.action === "demoralize"  // ❓ CRITICAL UNKNOWN!
```

**Result**: Unknown reliability
- Can we identify skill checks? (probably)
- Can we identify which skill? (probably)
- Can we identify which action? (**THIS IS THE QUESTION**)
- Can we identify the target? (unknown)

**User Experience**: ❓ Depends on data available
- Best case: ⭐⭐⭐⭐⭐ (action-specific narratives)
- Worst case: ⭐ (generic, unhelpful messages)

---

## Risk Analysis

### Risk: Phase 3 Same as Save-Based Spells

**Save-based spells have a fatal flaw**:
- We can detect "Fortitude save failed"
- We CANNOT detect which spell caused it
- Generic narratives like "Your save fails" are useless

**Skill actions might have the same flaw**:
- We can detect "Intimidation check succeeded"
- We might NOT be able to detect if it was Demoralize vs. Coerce
- Generic narratives like "Your Intimidation succeeds" are useless

**This is why testing is critical before development.**

---

## Development Effort Estimates

### Scenario 1: Full Action Data Available
- **Effort**: 2-3 weeks
- **Scope**: 50+ action-specific narratives
- **Value**: ⭐⭐⭐⭐⭐ Very High
- **Recommendation**: ✅ Proceed

### Scenario 2: Skill Data Only
- **Effort**: 1 week
- **Scope**: 18 generic skill narratives
- **Value**: ⭐⭐ Low
- **Recommendation**: ⚠️ Probably skip

### Scenario 3: No Reliable Data
- **Effort**: 0 (cancelled)
- **Scope**: N/A
- **Value**: N/A
- **Recommendation**: ❌ Cancel, move to Phase 4/6

---

## Alternative Phases (If Phase 3 Not Viable)

### Phase 4: Exploration Activities
- Weather effects
- Travel montages
- Hexploration encounters
- Camp activities
- **Effort**: 1-2 weeks
- **Value**: ⭐⭐⭐⭐ High

### Phase 6: Condition Applications
- Condition manifestations (Frightened, Sickened, etc.)
- PF2e conditions are explicit in system
- Likely to have good data availability
- **Effort**: 1-2 weeks
- **Value**: ⭐⭐⭐⭐ High

**Both are strong alternatives if Phase 3 isn't viable.**

---

## Success Criteria

Phase 3 should ONLY proceed if:

1. ✅ Action names are preserved in messages (`context.action`)
2. ✅ Skill names are reliably detectable (`context.skill`)
3. ✅ Outcomes are clear (`context.outcome`)
4. ✅ Targets are available for competitive checks (`context.target`)
5. ✅ Detection is reliable (>95% accuracy)
6. ✅ User value justifies 2-3 weeks of development

**If any of these fail, Phase 3 should be skipped.**

---

## Recommended Reading Order

1. **First Time**: Read `PHASE3_QUICK_REFERENCE.md` (10 min)
2. **Before Testing**: Skim `test-skill-messages.js` to understand tools (5 min)
3. **Run Tests**: Use testing script in Foundry (30 min)
4. **Make Decision**: Read `PHASE3_TECHNICAL_ASSESSMENT.md` (15 min)
5. **Reference**: Consult `PHASE3_SKILL_INVESTIGATION.md` as needed

**Total Time to Decision**: ~1 hour

---

## Key Takeaways

### 1. Testing is Required
- Do NOT start development without testing
- 1 hour of testing saves 2-3 weeks of wasted effort
- Empirical data beats assumptions

### 2. Quality Over Quantity
- Better to skip Phase 3 than build a bad feature
- Generic narratives add minimal value
- Users prefer quality over feature count

### 3. Alternative Phases Exist
- Phase 4 and Phase 6 are viable alternatives
- Don't force Phase 3 if data isn't there
- Focus development time on high-value features

### 4. Learn from Save-Based Spells
- We already know data limitations exist in PF2e
- Same problem might affect skill checks
- Test before committing to development

---

## Status

- [x] Investigation complete
- [x] Testing protocol created
- [x] Documentation written
- [ ] Tests executed ⬅ **YOU ARE HERE**
- [ ] Decision made
- [ ] Development started (if viable)

---

## Questions?

Refer to:
- `PHASE3_QUICK_REFERENCE.md` for quick answers
- `PHASE3_TECHNICAL_ASSESSMENT.md` for detailed analysis
- `PHASE3_SKILL_INVESTIGATION.md` for comprehensive testing guide
- `test-skill-messages.js` for testing tools

---

**Next Action**: Run the tests (30 minutes), then make a decision.

**Remember**: An hour of testing now saves weeks of development later.

---

*Investigation completed: 2025-01-17*
*Status: Ready for testing*
