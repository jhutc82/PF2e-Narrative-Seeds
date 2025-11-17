# Phase 3: Skill Action Detection - Investigation Report

**Date**: Investigation conducted January 2025
**Status**: ⚠️ **READY FOR TESTING** - Critical questions identified, test protocol prepared
**Next Action**: Execute 30-minute testing protocol in Foundry VTT

---

## Executive Summary

### The Critical Question

**Can PF2e distinguish "Demoralize action" from "generic Intimidation check" in chat messages?**

- ✅ **If YES** → Phase 3 is viable, proceed with 2-3 week implementation
- ❌ **If NO** → Phase 3 has same fatal flaw as save-based spells, cancel project

### What We Know

1. ✅ **PF2e System Uses Action Identifiers**
   - Source code shows actions pass `"action:demoralize"` as roll options
   - Found in: `pf2e/src/module/system/action-macros/intimidation/demoralize.ts`

2. ✅ **Roll Options Are Stored Somewhere**
   - PF2e stores roll options in message flags
   - Location: TBD (multiple possibilities)

3. ✅ **Inspection Tool Exists**
   - Right-click any roll → "Inspect Roll" shows all roll options
   - This will definitively answer our question

### What We Don't Know (YET)

1. ❓ **Where exactly do roll options appear in message flags?**
   - `message.flags.pf2e.context.options` (array)?
   - `message.flags.pf2e.context.action` (string)?
   - `message.flags.pf2e["roll-options"]` (object)?

2. ❓ **Do ALL skill actions include their identifier?**
   - Does Demoralize include `"action:demoralize"`? ← TEST THIS
   - Does Tumble Through include `"action:tumble-through"`? ← TEST THIS
   - Does Grapple include `"action:grapple"`? ← TEST THIS

3. ❓ **Can we distinguish actions from generic skill checks?**
   - Demoralize vs. Coerce (both Intimidation)
   - Tumble Through vs. Balance (both Acrobatics)

---

## Comparison to Phase 1 (Combat/Strikes)

### How Strike Detection Works (KNOWN - WORKING)

```javascript
// From combat-hooks.js line 145
static isStrikeMessage(message) {
  const context = message.flags?.pf2e?.context;
  if (!context) return false;

  // Strike is detected via context.action field
  if (context.type === "attack-roll") return true;
  if (context.action === "strike") return true;  // ← KEY LINE

  return false;
}
```

**Why it works**: PF2e explicitly sets `context.action = "strike"` for all Strike actions.

### How Skill Action Detection MIGHT Work (UNKNOWN - NEEDS TESTING)

**Scenario 1: Direct Action Field** (Best case)
```javascript
message.flags.pf2e.context = {
  type: "skill-check",
  action: "demoralize",  // ← Does this exist?
  skill: "intimidation",
  outcome: "success"
}

// Detection would be simple:
if (context.action === "demoralize") return true;
```

**Scenario 2: Roll Options Array** (Also good)
```javascript
message.flags.pf2e.context = {
  type: "skill-check",
  skill: "intimidation",
  outcome: "success",
  options: [
    "action:demoralize",  // ← Does this exist?
    "skill:intimidation",
    "target:actor:goblin"
  ]
}

// Detection would be:
const action = context.options.find(opt => opt.startsWith("action:"));
if (action === "action:demoralize") return true;
```

**Scenario 3: No Action Data** (Fatal flaw)
```javascript
message.flags.pf2e.context = {
  type: "skill-check",
  skill: "intimidation",
  outcome: "success"
  // No action identifier anywhere!
}

// Cannot detect what the action was
// Same problem as save-based spells
// Phase 3 NOT viable
```

---

## Research Findings

### 1. PF2e Source Code Analysis

**File**: `pf2e/src/module/system/action-macros/intimidation/demoralize.ts`

Key finding: Demoralize action passes roll options including `"action:demoralize"`:

```typescript
// Simplified from actual source
ActionMacroHelpers.simpleRollActionCheck({
  // ... other params
  rollOptions: ["action:demoralize"],
  slug: "intimidation"
})
```

**Implication**: The action identifier EXISTS during roll creation. Question is whether it's preserved in the chat message.

### 2. PF2e Roll Options Documentation

From PF2e Wiki:
> "The quickest way to see what kinds of roll options you can predicate on is to make an attack roll, save, or skill check then right click the roll in chat and choose 'Inspect Roll', which will list all of the roll options."

**Implication**: We can directly inspect Demoralize messages to see if `"action:demoralize"` appears.

### 3. Known Action Slugs

From PF2e system source:

| Action | Slug | Skill | Traits |
|--------|------|-------|--------|
| Demoralize | `action:demoralize` | Intimidation | Attack, Auditory, Concentrate, Emotion, Fear, Mental |
| Tumble Through | `action:tumble-through` | Acrobatics | Move |
| Grapple | `action:grapple` | Athletics | Attack |
| Trip | `action:trip` | Athletics | Attack |
| Shove | `action:shove` | Athletics | Attack |
| Feint | `action:feint` | Deception | Attack, Mental |
| Create a Diversion | `action:create-a-diversion` | Deception | Mental |
| Recall Knowledge | `action:recall-knowledge` | Various | |

---

## Testing Protocol (30 Minutes)

### Prerequisites
- Foundry VTT with PF2e system
- Test character with skills
- Test enemy/NPC for targeting

### Test 1: Inspect Roll Feature (5 min)

**Purpose**: Quickly verify if action identifiers appear

**Steps**:
1. Use Demoralize action on enemy
2. Right-click the chat message
3. Select "Inspect Roll"
4. Look for roll options containing `"action:demoralize"`

**Expected Results**:
- ✅ **GOOD**: See `"action:demoralize"` in roll options list
- ❌ **BAD**: No action identifier present

**Decision Point**: If you see `"action:demoralize"`, proceed to Test 2. If not, Phase 3 is likely not viable.

---

### Test 2: Console Flag Inspection (10 min)

**Purpose**: Determine exact location of action data in message flags

**Steps**:
```javascript
// 1. Perform Demoralize action in game

// 2. In browser console (F12):
const msg = game.messages.contents[game.messages.contents.length - 1];

// 3. Inspect the full flags structure:
console.log("=== FULL PF2E FLAGS ===");
console.log(JSON.stringify(msg.flags.pf2e, null, 2));

// 4. Check specific fields:
console.log("\n=== SPECIFIC FIELDS ===");
console.log("Context type:", msg.flags.pf2e?.context?.type);
console.log("Context action:", msg.flags.pf2e?.context?.action);
console.log("Context skill:", msg.flags.pf2e?.context?.skill);
console.log("Context statistic:", msg.flags.pf2e?.context?.statistic);
console.log("Context options:", msg.flags.pf2e?.context?.options);
console.log("Context outcome:", msg.flags.pf2e?.context?.outcome);

// 5. Check for action in options array:
if (msg.flags.pf2e?.context?.options) {
  const actionOpt = msg.flags.pf2e.context.options.find(opt => opt.includes("action"));
  console.log("\nAction in options:", actionOpt);
}
```

**Record**:
- Exact path to action identifier
- Structure of context object
- List of all available fields

---

### Test 3: Multiple Actions Comparison (10 min)

**Purpose**: Verify multiple different actions work consistently

**Steps**:
1. Perform these actions in sequence:
   - Demoralize (Intimidation)
   - Tumble Through (Acrobatics)
   - Generic Acrobatics check (click skill, no action)
   - Grapple (Athletics)

2. For each, run:
```javascript
const msg = game.messages.contents[game.messages.contents.length - 1];
console.log("\n=== MESSAGE", msg.flavor, "===");
console.log("Action:", msg.flags.pf2e?.context?.action);
console.log("Options:", msg.flags.pf2e?.context?.options);
```

**Record**:
- Which actions have identifiers
- Which don't
- Consistency of structure

---

### Test 4: Use Test Script (5 min)

**Purpose**: Automated analysis using prepared test tool

**Steps**:
1. Copy contents of `/test-skill-messages.js` into browser console
2. Run: `showHelp()` to see instructions
3. Run: `testActionSkillCheck()`
4. Perform Demoralize action
5. Review automated analysis

---

## Decision Matrix

Based on test results, follow this decision tree:

### ✅ FULL VIABILITY - Proceed with Phase 3

**Criteria**:
- Action name is available (either `context.action` or in `context.options`)
- Works for multiple different actions (Demoralize, Tumble Through, Grapple)
- Can distinguish action-based from generic skill checks
- Target data available for competitive checks

**Recommendation**:
- Implement full Phase 3
- Estimated effort: 2-3 weeks
- High user value
- Create 20-30 seed templates per common action

**Implementation approach**:
```javascript
// Detection pattern established
// Can generate action-specific narratives
"You bellow a fearsome war cry! The bandit's eyes widen in terror!"
```

---

### ⚠️ PARTIAL VIABILITY - Discuss with Team

**Criteria**:
- Skill name available but NOT action name
- Can only detect "Intimidation check" not "Demoralize action"
- Cannot distinguish Demoralize from Coerce

**Recommendation**:
- Discuss if generic skill narratives worth effort
- Estimated effort: 1 week
- Low-medium user value
- Only 5-10 generic templates per skill

**Implementation approach**:
```javascript
// Only generic narratives possible
"Your intimidating presence has the desired effect!"
"Your acrobatic maneuver succeeds!"
```

**Questions to answer**:
- Is this enough value for users?
- Would users prefer nothing over generic messages?
- Should we wait for PF2e system improvements instead?

---

### ❌ NOT VIABLE - Cancel Phase 3

**Criteria**:
- No reliable way to detect skill checks
- No action name available
- No skill name available
- Same fatal flaw as save-based spells

**Recommendation**:
- Do NOT implement Phase 3
- Document findings for future reference
- Consider alternative approaches (macros, modules)

**Save development time**: 2-3 weeks saved for other features

---

## If Viable: Implementation Plan

### Phase 3A: Core Detection (Week 1)

1. **Create skill action detector**
   - File: `scripts/combat/skill-action-detector.js`
   - Detect supported actions
   - Extract action, skill, outcome, target

2. **Update combat hooks**
   - Modify `combat-hooks.js` to call skill detector
   - Handle skill action messages
   - Maintain backward compatibility

3. **Testing**
   - Test all supported actions
   - Verify no false positives
   - Check performance impact

### Phase 3B: Narrative Generation (Week 2)

1. **Create skill narrative generator**
   - File: `scripts/combat/skill-narrative-generator.js`
   - Template system for skill actions
   - Similar to combat generator

2. **Create seed templates**
   - 20-30 seeds per common action
   - Outcome-specific (crit success, success, failure, crit failure)
   - Action-specific flavor

3. **Integration**
   - Connect to existing formatter
   - Reuse combat memory system
   - Reuse outcome formatting

### Phase 3C: Polish & Testing (Week 3)

1. **Settings & configuration**
   - Toggle for skill narration
   - Action whitelist/blacklist
   - Visibility settings

2. **Documentation**
   - User guide for skill actions
   - Update README
   - Add examples

3. **Comprehensive testing**
   - Test all supported actions
   - Multiple outcomes
   - Edge cases

---

## Expected Narrative Examples (If Viable)

### Demoralize (Intimidation)

**Critical Success**:
- "You unleash a terrifying roar that echoes across the battlefield! {target} staggers backward, face pale with terror, completely shaken by your fearsome presence!"
- "Your fierce snarl sends chills down {target}'s spine! They stumble in panic, eyes wide with primal fear!"

**Success**:
- "You bellow a menacing threat at {target}, and they hesitate, clearly unnerved by your intimidating display!"
- "Your aggressive posture and fierce glare cause {target} to falter, shaken by your threatening presence!"

**Failure**:
- "You attempt to intimidate {target}, but they stand their ground, unimpressed by your display."
- "{target} meets your threatening glare with a defiant stare, refusing to be cowed!"

**Critical Failure**:
- "Your attempt at intimidation falls completely flat! {target} actually seems amused by your effort, smirking at your bravado!"

---

### Tumble Through (Acrobatics)

**Critical Success**:
- "You execute a perfect acrobatic roll, flowing like water past {target}'s defenses! They can only watch in amazement as you gracefully slip through the gap!"
- "With breathtaking agility, you somersault through {target}'s guard, leaving them flat-footed and confused!"

**Success**:
- "You nimbly tumble past {target}, slipping through their reach with practiced ease!"
- "Your acrobatic maneuver catches {target} off-guard as you roll past their position!"

**Failure**:
- "You attempt to tumble past {target}, but they block your path, forcing you to stay put."
- "{target} anticipates your movement, cutting off your acrobatic escape!"

**Critical Failure**:
- "Your tumbling attempt goes horribly wrong! You stumble directly into {target}'s reach, leaving yourself vulnerable!"

---

### Grapple (Athletics)

**Critical Success**:
- "You seize {target} in an iron grip, completely restraining their movement! They struggle helplessly against your superior hold!"
- "With explosive power, you grab {target} and wrench them into a devastating lock! They're completely immobilized!"

**Success**:
- "You manage to grab hold of {target}, wrestling them into a controlling grip!"
- "Your strong grasp catches {target}, restricting their movement as you grapple them!"

**Failure**:
- "You reach for {target}, but they slip out of your grasp!"
- "{target} evades your grappling attempt, staying just out of reach!"

**Critical Failure**:
- "You lunge for {target} but completely misjudge the distance, leaving yourself off-balance and vulnerable!"

---

## Comparison to Current System

### Strike Messages (Phase 1 - Current)

**System Output**:
```
Valeros strikes at Goblin Warrior with longsword
Attack: 23 vs AC 16 - Success!
Damage: 8 slashing
```

**With Narrative Seeds**:
```
Valeros strikes at Goblin Warrior with longsword
Attack: 23 vs AC 16 - Success!
Damage: 8 slashing

━━━━━━━━━━━━━━━━━━━━━━
⚔️ Your blade bites deep into the goblin's shoulder,
drawing a spray of dark blood as they cry out in pain!
━━━━━━━━━━━━━━━━━━━━━━
```

### Skill Action Messages (Phase 3 - Proposed)

**System Output**:
```
Valeros uses Demoralize on Goblin Warrior
Intimidation: 19 vs DC 15 - Success!
Goblin Warrior is Frightened 1
```

**With Narrative Seeds (If Viable)**:
```
Valeros uses Demoralize on Goblin Warrior
Intimidation: 19 vs DC 15 - Success!
Goblin Warrior is Frightened 1

━━━━━━━━━━━━━━━━━━━━━━
💀 You bellow a fierce war cry that echoes across the
battlefield! The goblin's eyes widen in terror as they
stumble backward, shaken by your fearsome presence!
━━━━━━━━━━━━━━━━━━━━━━
```

---

## Risk Assessment

### Technical Risks

1. **Action Identifier May Not Exist** (High Risk)
   - Mitigation: Test FIRST before any development
   - Fallback: Cancel Phase 3, document findings

2. **Inconsistent Implementation** (Medium Risk)
   - Some actions may have identifiers, others may not
   - Mitigation: Test multiple actions, create whitelist

3. **Performance Impact** (Low Risk)
   - Additional message processing
   - Mitigation: Efficient detection, early returns

### Design Risks

1. **User Value Unclear** (Medium Risk)
   - Generic narratives may not add enough value
   - Mitigation: Only proceed if action-specific detection works

2. **Scope Creep** (Medium Risk)
   - 20+ different skill actions to support
   - Mitigation: Start with 5-7 most common actions

---

## Success Criteria

Phase 3 is considered successful if:

1. ✅ Action names reliably detected
2. ✅ Works for 5+ different actions
3. ✅ Distinguishes actions from generic checks
4. ✅ Narratives are contextual and action-specific
5. ✅ Users report positive feedback
6. ✅ No performance degradation
7. ✅ No false positives/negatives

---

## Conclusion

**Current Status**: Ready for testing

**Blocker**: Need to verify action names are available in message flags

**Test Duration**: 30 minutes

**Decision Point**: After testing, choose Full/Partial/Cancel

**If Viable**: Phase 3 will significantly enhance user experience for skill-based encounters, providing the same narrative richness for Demoralize/Tumble/Grapple as we currently provide for Strikes.

**If Not Viable**: Save 2-3 weeks of development time, document findings, move to other priorities.

---

## Next Steps

1. **Execute Testing** (30 min)
   - Run all 4 tests
   - Document exact flag structure
   - Record findings

2. **Make Decision** (15 min)
   - Review test results against decision matrix
   - Choose: Full / Partial / Cancel

3. **Document Decision**
   - Update project roadmap
   - Inform stakeholders
   - Plan next phase

4. **If Proceeding**
   - Create Phase 3 implementation plan
   - Set up development branch
   - Begin Week 1 tasks

5. **If Cancelling**
   - Document why (for future reference)
   - Archive Phase 3 research
   - Identify alternative approaches
