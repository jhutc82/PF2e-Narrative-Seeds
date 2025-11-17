# Phase 3 (Skills) - Technical Assessment & Recommendation

## Executive Summary

**Status**: ⚠️ **TESTING REQUIRED** before proceeding

**Risk**: High probability of same fatal flaw as save-based spells

**Recommendation**: Complete testing protocol before any development work

---

## The Core Problem

### What We Know Works (Phase 1: Combat)

PF2e Strike messages provide rich, unambiguous data:

```javascript
message.flags.pf2e = {
  context: {
    type: "attack-roll",      // ✅ Explicit type
    action: "strike",          // ✅ Action name
    outcome: "success",        // ✅ Clear outcome
    target: { ... }            // ✅ Target data
  },
  origin: {
    type: "weapon",            // ✅ Item type
    uuid: "Actor.xxx.Item.yyy" // ✅ Item reference
  }
}
```

**Detection confidence**: ~100%
- We can always identify strikes
- We always know what weapon was used
- We always know who was targeted
- We always know the outcome

### What We Don't Know (Phase 3: Skills)

**Critical Unknown**: Do skill action messages provide similar data?

Specifically, when a player uses "Demoralize" (an Intimidation check), does PF2e preserve:
- ✅ That it's a skill check?
- ✅ That it's Intimidation?
- ❓ **That it's specifically Demoralize (vs. Coerce)?**

**This is the make-or-break question for Phase 3.**

---

## The Fatal Flaw Scenario

### Analogy: Save-Based Spells

In our previous investigation, we discovered that save-based spells have a critical limitation:
- PF2e provides the save type (Fortitude, Reflex, Will)
- PF2e provides the outcome (success, failure)
- **PF2e does NOT provide the spell name in the save message**

Result: We can detect "Fortitude save failed" but NOT whether it was:
- Blindness
- Cloudkill
- Horrid Wilting
- Phantasmal Killer
- Or any of 100+ other spells

**This makes save-based spell narratives impossible** because generic messages like "Your Fortitude save fails" add no value over what PF2e already shows.

### Potential Parallel: Skill Actions

**If** skill actions have the same limitation:
- PF2e provides the skill type (Acrobatics, Intimidation, etc.)
- PF2e provides the outcome (success, failure)
- **PF2e does NOT provide the action name**

Result: We can detect "Intimidation check succeeded" but NOT whether it was:
- Demoralize (common)
- Coerce (rare)
- Make an Impression (different skill, but similar issue)

**This would make action-specific skill narratives impossible.**

---

## Comparison: Three Scenarios

### Scenario 1: Full Action Data (Best Case) ✅

**If PF2e provides**:
```javascript
{
  context: {
    type: "skill-check",
    skill: "intimidation",
    action: "demoralize",    // ← KEY!
    outcome: "success",
    target: { actor: "xyz" }
  }
}
```

**Then we can generate**:
```
"You bellow a fearsome war cry, and the bandit's eyes widen in
terror as they stumble backward, shaken by your fierce presence!"
```

**Value**: ⭐⭐⭐⭐⭐ High
- Action-specific narratives
- Target-aware descriptions
- Rich contextual flavor
- **Worth 2-3 weeks of development**

---

### Scenario 2: Skill Data Only (Partial) ⚠️

**If PF2e provides**:
```javascript
{
  context: {
    type: "skill-check",
    skill: "intimidation",
    // No "action" field!
    outcome: "success"
  }
}
```

**Then we can only generate**:
```
"Your intimidating presence has the desired effect!"
```

**Value**: ⭐⭐ Low
- Generic skill narratives
- No action-specific flavor
- Minimal improvement over PF2e default
- **Questionable if worth 1 week of development**

**Problems**:
- Can't distinguish Demoralize from Coerce (both Intimidation)
- Can't distinguish Tumble Through from Balance (both Acrobatics)
- Can't distinguish Recall Knowledge from generic skill checks
- Generic messages feel bland and unhelpful

---

### Scenario 3: No Reliable Data (Worst Case) ❌

**If PF2e provides**:
```javascript
{
  // No context.type = "skill-check"
  // No context.skill
  // Only message.flavor = "Intimidation" (unreliable)
}
```

**Then we cannot generate anything useful.**

**Value**: ⭐ None
- Cannot reliably detect skill checks
- Same fatal flaw as save-based spells
- **Phase 3 should be cancelled**

---

## Testing Protocol

### Required Tests (30 minutes)

1. **Load test script** in Foundry console:
   ```javascript
   // Copy contents of test-skill-messages.js
   ```

2. **Test A: Generic Skill Check**
   - Click "Acrobatics" in character sheet
   - Run: `analyzeLastMessage()`
   - Record: Does `context.skill` or `context.statistic` exist?

3. **Test B: Demoralize Action**
   - Use "Demoralize" action from action list
   - Run: `analyzeLastMessage()`
   - **CRITICAL**: Does `context.action = "demoralize"` exist?

4. **Test C: Tumble Through Action**
   - Use "Tumble Through" action
   - Run: `analyzeLastMessage()`
   - **CRITICAL**: Does `context.action = "tumble-through"` exist?

5. **Test D: Grapple Action**
   - Use "Grapple" action (Athletics check)
   - Run: `analyzeLastMessage()`
   - Check: Action name and target data

6. **Compare Results**
   - Run: `compareRecentMessages(4)`
   - Analyze differences between tests

### Decision Tree

```
Does context.action exist for Demoralize?
│
├─ YES → Does it work for other actions (Tumble Through, Grapple)?
│   │
│   ├─ YES → ✅ PROCEED WITH FULL PHASE 3
│   │         - Build action-specific system
│   │         - 2-3 week effort
│   │         - High user value
│   │
│   └─ NO → ⚠️ LIMITED VIABILITY
│             - Only some actions detectable
│             - Decide if worth partial implementation
│
└─ NO → Does context.skill exist reliably?
    │
    ├─ YES → ⚠️ PARTIAL VIABILITY
    │         - Only generic skill narratives possible
    │         - Discuss if worth 1 week effort
    │         - Low user value
    │
    └─ NO → ❌ CANCEL PHASE 3
              - No reliable detection method
              - Same problem as save-based spells
              - Save development time
```

---

## Expected Test Results

### My Prediction (Educated Guess)

Based on PF2e's architecture and how it handles strikes, I predict:

**Likelihood: 60%** - Scenario 2 (Skill Data Only)
- PF2e probably provides skill name
- PF2e probably does NOT provide action name
- Generic skill narratives only

**Likelihood: 30%** - Scenario 1 (Full Action Data)
- PF2e might preserve action names
- Would require consistent architecture
- This would be ideal

**Likelihood: 10%** - Scenario 3 (No Data)
- PF2e probably at least identifies skill checks
- Unlikely to have zero data

### Why I'm Pessimistic

**Evidence suggesting limited data**:

1. **Save-based spells don't preserve spell names**
   - PF2e separates "casting" from "saves"
   - Suggests action context isn't always preserved

2. **Skills are versatile**
   - Same skill used for multiple purposes
   - Acrobatics: Balance, Tumble Through, Maneuver in Flight
   - System might not track specific action

3. **No existing modules do this**
   - If the data was available, someone would have built this
   - Lack of skill narrative modules suggests data limitations

**Evidence suggesting full data**:

1. **PF2e is well-architected**
   - Strikes preserve full context
   - Might apply same pattern to skills

2. **Actions are first-class in PF2e**
   - Demoralize, Grapple, etc. are formal actions
   - System might track them explicitly

3. **Competitive checks need target data**
   - Demoralize, Grapple, etc. target creatures
   - System must track targets somehow

---

## Recommended Actions

### Immediate (Before ANY Development)

1. ✅ **Run Testing Protocol** (30 minutes)
   - Use `test-skill-messages.js`
   - Test all scenarios (A-D)
   - Document full message structures

2. ✅ **Make Go/No-Go Decision** (15 minutes)
   - Review test results
   - Assess viability level
   - Determine if worth development time

3. ✅ **Document Decision** (15 minutes)
   - Update `PHASE3_SKILL_INVESTIGATION.md` with findings
   - Update README roadmap
   - Create GitHub issue if proceeding

**Total Time: 1 hour**

### If Tests Show Scenario 1 (Full Data) ✅

**Proceed with Full Phase 3**:
- Create `scripts/skills/` directory structure
- Implement `skill-hooks.js` (similar to `combat-hooks.js`)
- Create action-specific narrative templates
- Focus on high-value actions:
  - Demoralize (very common)
  - Tumble Through (common tactical)
  - Recall Knowledge (every combat)
  - Grapple, Trip, Shove (combat maneuvers)
  - Feint, Create a Diversion (rogue tactics)

**Estimated Effort**: 2-3 weeks
**User Value**: ⭐⭐⭐⭐⭐ Very High

### If Tests Show Scenario 2 (Skill Only) ⚠️

**Discuss Reduced Scope**:

Option A: Generic skill narratives
- "Your acrobatic prowess serves you well!" (success)
- "Your intimidating presence has the desired effect!" (success)
- **Effort**: 1 week
- **Value**: ⭐⭐ Low

Option B: Skip Phase 3
- Save development time
- Move to Phase 4 or Phase 6
- **Value**: Better ROI

**Recommendation**: Probably skip Phase 3
- Generic narratives add minimal value
- Development time better spent elsewhere
- Users won't miss what they never had

### If Tests Show Scenario 3 (No Data) ❌

**Cancel Phase 3**:
- Document why it's not feasible
- Update README to remove Phase 3
- Move to next viable phase:
  - Phase 4: Exploration (might have better hooks)
  - Phase 6: Conditions (conditions are explicit in PF2e)

**Time Saved**: 2-3 weeks

---

## Risk Assessment

### Development Risk

| Scenario | Risk Level | Mitigation |
|----------|-----------|------------|
| **Scenario 1** (Full Data) | ✅ Low | Standard development practices |
| **Scenario 2** (Skill Only) | ⚠️ Medium | User expectations management |
| **Scenario 3** (No Data) | ❌ High | Don't build it |

### User Experience Risk

**If we build Scenario 2 (generic narratives)**:

❌ **High Risk of User Disappointment**:
- Users expect action-specific flavor (like Phase 1)
- Generic messages feel lazy and unhelpful
- "Your Intimidation succeeds" adds no value
- Better to have no feature than a bad feature

✅ **Low Risk if we skip it**:
- Users won't miss what was never promised
- Can focus on higher-value features
- Phase 1 (combat) already provides excellent value

---

## Comparison to Other Phases

### Phase 1: Combat ✅ (Implemented)
- **Data Availability**: Excellent
- **User Value**: Very High
- **Complexity**: Medium
- **Status**: SUCCESS

### Phase 2: Spell Effects (In Development)
- **Data Availability**: Good for spell casting, poor for saves
- **User Value**: High (for attack spells)
- **Complexity**: High
- **Status**: Partial implementation viable

### Phase 3: Skills ❓ (Under Investigation)
- **Data Availability**: UNKNOWN
- **User Value**: Unknown (depends on data)
- **Complexity**: Medium-High
- **Status**: Testing required

### Phase 4: Exploration (Planned)
- **Data Availability**: Unknown
- **User Value**: Medium-High
- **Complexity**: Low-Medium
- **Status**: Could be next if Phase 3 fails

### Phase 6: Conditions (Planned)
- **Data Availability**: Probably Good (conditions are explicit)
- **User Value**: High
- **Complexity**: Low-Medium
- **Status**: Strong alternative to Phase 3

---

## Frank Technical Assessment

### The Bottom Line

**Phase 3 viability is entirely dependent on whether PF2e preserves action names in skill check messages.**

If the data isn't there:
- ❌ Don't build it anyway
- ❌ Don't settle for generic narratives
- ✅ Move to a more viable phase
- ✅ Save 2-3 weeks of development time

### Personal Recommendation

As the technical lead on this project, my recommendation is:

1. **Run the tests** (1 hour investment)
2. **Only proceed if Scenario 1** (full action data)
3. **Skip Phase 3 if Scenario 2 or 3**
4. **Move to Phase 4 or Phase 6** if data is insufficient

**Reasoning**:
- Phase 1 set a high bar for quality
- Generic narratives would feel like a downgrade
- Better to maintain quality standards
- Users value quality over quantity

### Questions to Answer

Before starting ANY Phase 3 development, answer:

1. ✅ Does `context.action` exist for Demoralize?
   - **If NO → Stop here, cancel Phase 3**

2. ✅ Does `context.action` exist for Tumble Through?
   - **If NO → Stop here, cancel Phase 3**

3. ✅ Does `context.target` exist for competitive checks?
   - **If NO → Reduce scope, but might still be viable**

4. ✅ Can we reliably distinguish all action types?
   - **If NO → Determine viable subset**

5. ✅ Is the ROI worth 2-3 weeks of development?
   - **If NO → Skip Phase 3**

---

## Next Steps

### Week 1: Testing & Decision (CURRENT)
- [ ] Run testing protocol
- [ ] Document findings
- [ ] Make go/no-go decision
- [ ] Update documentation

### If Proceeding (Week 2-4):
- [ ] Design skill-hooks.js architecture
- [ ] Create narrative templates
- [ ] Implement detection system
- [ ] Test with common actions
- [ ] User acceptance testing

### If Skipping (Week 2):
- [ ] Document decision rationale
- [ ] Update README roadmap
- [ ] Begin Phase 4 or Phase 6 planning
- [ ] Move forward with higher-value features

---

## Conclusion

**Phase 3 is at a critical decision point.**

Do not proceed with development until testing confirms:
1. Action names are preserved in messages
2. Detection is reliable and comprehensive
3. User value justifies development effort

**If the data isn't there, have the courage to skip this phase.**

Quality over quantity. Value over features. User experience over feature count.

---

*Technical Assessment by: Development Team*
*Date: 2025-01-17*
*Status: Awaiting Test Results*
*Decision: PENDING*
