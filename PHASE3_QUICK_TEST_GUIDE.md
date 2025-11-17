# Phase 3: Quick Test Guide (5 Minutes)

## The One Question That Matters

**Does PF2e preserve action names (like "demoralize") in skill check messages?**

---

## Fastest Test (2 Minutes)

### Method 1: Inspect Roll Feature

1. Open Foundry VTT with PF2e game
2. Use **Demoralize** action on an enemy
3. **Right-click** the chat message
4. Select **"Inspect Roll"**
5. Look for `"action:demoralize"` in the roll options list

**Result**:
- ✅ See `"action:demoralize"` → **Phase 3 is VIABLE**
- ❌ Don't see it → **Phase 3 has same problem as save-based spells**

---

## Slightly Longer Test (5 Minutes)

### Method 2: Console Inspection

```javascript
// 1. Perform Demoralize action in Foundry

// 2. Open browser console (F12)

// 3. Run this:
const msg = game.messages.contents[game.messages.contents.length - 1];
console.log(JSON.stringify(msg.flags.pf2e, null, 2));

// 4. Look for one of these:
//    - context.action: "demoralize"
//    - context.options: ["action:demoralize", ...]
```

**What to look for**:
```json
{
  "context": {
    "type": "skill-check",
    "action": "demoralize",  // ← THIS! (or...)
    "options": [
      "action:demoralize",   // ← ...OR THIS!
      "skill:intimidation"
    ]
  }
}
```

---

## What Each Result Means

### ✅ Found `action:demoralize` or `context.action`

**Meaning**: Phase 3 is VIABLE

**Next Steps**:
1. Test 2-3 more actions (Tumble Through, Grapple)
2. Verify consistency
3. Proceed with Phase 3 implementation
4. Estimated timeline: 2-3 weeks
5. High user value

**You can generate**:
- "You bellow a fierce war cry! The bandit stumbles backward in terror!"
- "You tumble gracefully past the guard's outstretched arms!"
- "You seize the orc in an iron grip, completely restraining them!"

---

### ⚠️ Found skill name but NOT action name

**Meaning**: Phase 3 has PARTIAL viability

**What you have**:
```json
{
  "context": {
    "type": "skill-check",
    "skill": "intimidation",
    // No action field!
  }
}
```

**Limitation**: Can only generate generic narratives
- ❌ Can't distinguish Demoralize from Coerce (both Intimidation)
- ❌ Can't distinguish Tumble Through from Balance (both Acrobatics)

**You can only generate**:
- "Your intimidating presence has the desired effect!"
- "Your acrobatic maneuver succeeds!"

**Next Steps**:
1. Discuss with team if generic narratives worth effort
2. Consider: Is this better than nothing?
3. Estimate: 1 week development
4. User value: Low-Medium

---

### ❌ Found nothing / unreliable data

**Meaning**: Phase 3 is NOT viable

**Next Steps**:
1. Cancel Phase 3
2. Document findings
3. Save 2-3 weeks of development time
4. Move to other priorities

---

## Testing Multiple Actions

Once you've confirmed Demoralize works, test these:

```javascript
// Run this before EACH action:
function testAction(actionName) {
  console.log(`\n=== ${actionName.toUpperCase()} ===`);
  const msg = game.messages.contents[game.messages.contents.length - 1];
  const ctx = msg.flags?.pf2e?.context;
  console.log("Action:", ctx?.action);
  console.log("Options:", ctx?.options);
}

// Then perform each action and run testAction():
```

**Test these actions**:
1. Demoralize (Intimidation)
2. Tumble Through (Acrobatics)
3. Grapple (Athletics)
4. Generic Acrobatics check (click skill, no action)

**Success criteria**:
- Actions 1-3 should have action identifiers
- Action 4 (generic) should NOT have action identifier
- This proves we can distinguish actions from generic checks

---

## Decision Tree

```
Can you find action identifier?
│
├─ YES → Test 2 more actions
│   │
│   ├─ ALL work → ✅ PROCEED with Phase 3
│   │
│   └─ SOME work → ⚠️ Whitelist approach
│                   (Only support detected actions)
│
└─ NO → Found skill name?
    │
    ├─ YES → ⚠️ PARTIAL (generic only)
    │         Discuss with team
    │
    └─ NO → ❌ CANCEL Phase 3
```

---

## Expected Time Investment

### If Testing Only
- Quick test: **2 minutes**
- Full test: **30 minutes**
- Documentation: **15 minutes**
- **Total: 45 minutes**

### If Implementing (Viable)
- Testing: 45 minutes
- Week 1: Core detection - 40 hours
- Week 2: Narrative generation - 40 hours
- Week 3: Polish & testing - 40 hours
- **Total: ~120 hours (3 weeks)**

### If Implementing (Partial)
- Testing: 45 minutes
- Implementation: ~40 hours (1 week)
- **Total: ~40 hours**

### If Cancelling (Not Viable)
- Testing: 45 minutes
- Documentation: 15 minutes
- **Total: 1 hour (saves 120 hours!)**

---

## Files to Reference

- **This file**: Quick 5-minute test
- `/PHASE3_FINAL_INVESTIGATION_REPORT.md`: Comprehensive analysis
- `/PHASE3_DETECTION_CODE_EXAMPLES.md`: Implementation examples
- `/test-skill-messages.js`: Automated test script
- `/PHASE3_SKILL_INVESTIGATION.md`: Original research notes

---

## After Testing: Update This Section

### Test Results (Fill in after testing)

**Date tested**: ___________

**PF2e system version**: ___________

**Foundry version**: ___________

**Action identifier found?**: [ ] YES  [ ] NO  [ ] PARTIAL

**Location of identifier**: ___________

**Actions tested**:
- [ ] Demoralize
- [ ] Tumble Through
- [ ] Grapple
- [ ] Generic skill check

**Decision**: [ ] PROCEED  [ ] PARTIAL  [ ] CANCEL

**Notes**:
```
(Add your findings here)
```

---

## Contact

If you've completed testing, please update:
1. This section above
2. Project roadmap with decision
3. Team/stakeholders with findings

**Key question answered**: Can we detect "player used Demoralize action" vs. just "player rolled Intimidation check"?

**Answer**: ___________ (YES/NO/PARTIAL)
