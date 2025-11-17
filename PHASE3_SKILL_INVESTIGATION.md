# Phase 3 (Skills) Feasibility Investigation

## Purpose
Determine whether PF2e skill check messages contain sufficient data to generate contextual narrative descriptions, similar to how Phase 1 handles combat strikes.

---

## Critical Questions

### 1. What Data is Available in Skill Check Messages?

#### Known: Strike Messages (Phase 1 - WORKING)
From `combat-hooks.js`, we know strike messages contain:
```javascript
message.flags.pf2e = {
  context: {
    type: "attack-roll",      // Identifies this as an attack
    action: "strike",          // Identifies the specific action
    outcome: "success",        // Critical success, success, failure, critical failure
    target: {                  // Target information
      actor: "actorId",
      token: "tokenId"
    },
    options: []                // Additional context (nonlethal, etc.)
  },
  origin: {
    type: "weapon",            // Item type (weapon, melee, spell)
    uuid: "Actor.xxx.Item.yyy", // Full UUID to the item
    item: "itemId"
  }
}
```

**Key Success Factor**: The `context.action = "strike"` field lets us identify WHAT the action is, not just that "a roll happened."

#### Unknown: Skill Check Messages
**CRITICAL RESEARCH NEEDED**: Do skill check messages contain similar identifying data?

**Test Cases Needed**:
1. **Generic Skill Check** (no action)
   - Player clicks "Acrobatics" and rolls
   - Does message contain: `context.type = "skill-check"`?
   - Does message contain: `context.skill = "acrobatics"`?
   - Can we tell it's Acrobatics vs. Athletics?

2. **Action-Based Skill Check** (Demoralize)
   - Player uses "Demoralize" action (Intimidation check)
   - Does message contain: `context.action = "demoralize"`?
   - Or is it just a generic Intimidation roll?
   - Can we distinguish Demoralize from Coerce (both Intimidation)?

3. **Action-Based Skill Check** (Tumble Through)
   - Player uses "Tumble Through" action (Acrobatics check)
   - Does message contain: `context.action = "tumble-through"`?
   - Or is it just a generic Acrobatics roll?
   - Can we distinguish this from Balance or Maneuver in Flight?

---

## Comparison: Phase 1 (Combat) vs. Phase 3 (Skills)

### Phase 1: Combat Strikes ✅
**Detection Method**:
- Look for `context.type = "attack-roll"` or `context.action = "strike"`
- Look for `origin.type = "weapon"` or `"melee"`

**Why It Works**:
- PF2e system explicitly marks Strike actions
- Origin item (weapon/spell) is always included
- Target is always in context
- Outcome is always clear

### Phase 3: Skills ❓
**Detection Method (UNKNOWN)**:
- Is there a `context.type = "skill-check"` field?
- Is there a `context.skill = "acrobatics"` field?
- Is there a `context.action = "tumble-through"` field?

**Critical Flaw Possibility**:
If PF2e only provides:
- `message.flavor = "Acrobatics"`
- `message.flags.pf2e = { /* generic roll data */ }`

Then we can only detect "Acrobatics was rolled" but NOT:
- Was it Tumble Through? Balance? Maneuver in Flight?
- Was it Demoralize? Coerce? Make an Impression?
- Was it Recall Knowledge? Identify Magic? Decipher Writing?

**This would be the same fatal flaw as save-based spells.**

---

## PF2e Actions with Skill Checks

### Athletics
- **Climb** - Generic check
- **Force Open** - Action (could have unique context)
- **Grapple** - Action (likely has action data)
- **High Jump / Long Jump** - Generic checks
- **Shove** - Action (likely has action data)
- **Swim** - Generic check
- **Trip** - Action (likely has action data)
- **Disarm** - Action (likely has action data)

### Acrobatics
- **Balance** - Generic check
- **Tumble Through** - Action (needs unique detection)
- **Maneuver in Flight** - Generic check
- **Squeeze** - Generic check

### Intimidation
- **Coerce** - Action
- **Demoralize** - Action (MOST COMMON)
- Both are Intimidation checks - can we tell them apart?

### Diplomacy
- **Gather Information** - Generic check
- **Make an Impression** - Action
- **Request** - Action

### Deception
- **Create a Diversion** - Action
- **Feint** - Action
- **Lie** - Generic check
- **Impersonate** - Generic check

### Recall Knowledge (ALL SKILLS)
- **Arcana** - Recall Knowledge
- **Nature** - Recall Knowledge
- **Occultism** - Recall Knowledge
- **Religion** - Recall Knowledge
- **Society** - Recall Knowledge
- Can we tell Recall Knowledge from a generic skill check?

---

## Testing Protocol

### Step 1: Create Test Character
1. Create a test character in a PF2e game
2. Ensure character has various skills trained

### Step 2: Execute Test Rolls
For each test, examine `game.messages.contents[game.messages.contents.length - 1]`:

#### Test A: Generic Skill Check
```javascript
// Action: Click "Acrobatics" in character sheet and roll
// Console: let msg = game.messages.contents[game.messages.contents.length - 1]
// Console: console.log(JSON.stringify(msg.flags?.pf2e, null, 2))
// Console: console.log("Flavor:", msg.flavor)
// Console: console.log("Type:", msg.flags?.pf2e?.context?.type)
// Console: console.log("Action:", msg.flags?.pf2e?.context?.action)
// Console: console.log("Skill:", msg.flags?.pf2e?.context?.skill)
```

**Expected Good Outcome** (Phase 3 viable):
```json
{
  "context": {
    "type": "skill-check",
    "skill": "acrobatics",
    "action": null,
    "outcome": "success"
  }
}
```

**Expected Bad Outcome** (Phase 3 NOT viable):
```json
{
  // No context object, or context is empty/minimal
}
```

#### Test B: Action-Based Skill Check (Demoralize)
```javascript
// Action: Use "Demoralize" action from action list
// Console: Same as above
```

**Expected Good Outcome** (Phase 3 viable):
```json
{
  "context": {
    "type": "skill-check",
    "skill": "intimidation",
    "action": "demoralize",
    "outcome": "success",
    "target": {
      "actor": "actorId",
      "token": "tokenId"
    }
  }
}
```

**Expected Bad Outcome** (Phase 3 NOT viable):
```json
{
  "context": {
    "type": "skill-check",
    "skill": "intimidation"
    // No "action" field - can't tell Demoralize from Coerce!
  }
}
```

#### Test C: Action-Based Skill Check (Tumble Through)
```javascript
// Action: Use "Tumble Through" action
// Console: Same as above
```

**Expected Good Outcome**:
```json
{
  "context": {
    "type": "skill-check",
    "skill": "acrobatics",
    "action": "tumble-through",
    "outcome": "success"
  }
}
```

**Expected Bad Outcome**:
```json
{
  "context": {
    "type": "skill-check",
    "skill": "acrobatics"
    // No "action" field - can't tell Tumble Through from Balance!
  }
}
```

#### Test D: Recall Knowledge
```javascript
// Action: Use "Recall Knowledge" action with Arcana
// Console: Same as above
```

**Expected Good Outcome**:
```json
{
  "context": {
    "type": "skill-check",
    "skill": "arcana",
    "action": "recall-knowledge",
    "outcome": "success"
  }
}
```

#### Test E: Grapple
```javascript
// Action: Use "Grapple" action (Athletics check)
// Console: Same as above
```

**Expected Good Outcome**:
```json
{
  "context": {
    "type": "skill-check",
    "skill": "athletics",
    "action": "grapple",
    "target": {
      "actor": "actorId",
      "token": "tokenId"
    },
    "outcome": "success"
  }
}
```

---

## Viable Scope Analysis

### Scenario 1: Full Action Data Available ✅
**If**: PF2e preserves action names in `context.action`

**Then**: Phase 3 is FULLY viable
- Generate narratives for specific actions
- "You demoralize the bandit with a fierce growl!"
- "You tumble gracefully past the guard!"
- "You grapple the orc, wrestling them to the ground!"

**Scope**: ~50+ action-specific narratives
- All skill actions from CRB
- Context-aware descriptions
- Target-aware for competitive checks

### Scenario 2: Skill Data Only ⚠️
**If**: PF2e only provides skill name (no action)

**Then**: Phase 3 is PARTIALLY viable
- Generate generic skill success/failure narratives
- "Your acrobatic training serves you well!" (success)
- "Your athletics check fails!" (failure)
- Cannot distinguish between different uses of same skill

**Scope**: ~18 skill-based generic narratives
- One set per skill (Acrobatics, Athletics, etc.)
- Outcome-based (success, failure, crit success, crit failure)
- No action-specific flavor

### Scenario 3: No Skill Data ❌
**If**: PF2e doesn't provide skill identification

**Then**: Phase 3 is NOT viable
- Cannot detect what skill was used
- Cannot generate any contextual narrative
- Same fatal flaw as save-based spells

**Scope**: Phase 3 should be cancelled

---

## Comparison to Existing Systems

### What We Know Works: Combat Strikes ✅
```javascript
static isStrikeMessage(message) {
  const flags = message.flags?.pf2e;
  if (!flags) return false;

  const context = flags.context;
  if (!context) return false;

  if (context.type === "attack-roll") return true;  // Clear identifier
  if (context.action === "strike") return true;      // Action name available

  return false;
}
```

**Success Factors**:
1. Clear `context.type` field
2. Action name in `context.action`
3. Origin item always available
4. Target always in context

### What We Need for Skills: Unknown ❓
```javascript
static isSkillCheckMessage(message) {
  const flags = message.flags?.pf2e;
  if (!flags) return false;

  const context = flags.context;
  if (!context) return false;

  // Does this exist?
  if (context.type === "skill-check") {
    // Can we get the skill name?
    const skill = context.skill; // Does this exist?

    // Can we get the action name?
    const action = context.action; // Does this exist?

    return true;
  }

  return false;
}
```

**Questions**:
1. Does `context.type = "skill-check"` exist?
2. Does `context.skill` exist?
3. Does `context.action` exist for action-based checks?
4. Is target available for competitive checks?

---

## Existing Code Patterns to Reference

### Detection Pattern (from combat-hooks.js)
```javascript
// Line 131-157
static isStrikeMessage(message) {
  const flags = message.flags?.pf2e;
  if (!flags) return false;

  const context = flags.context;
  if (!context) return false;

  if (context.type === "damage-roll") return false;
  if (context.type === "attack-roll") return true;
  if (context.action === "strike") return true;

  if (flags.origin?.type === "weapon") return true;
  if (flags.origin?.type === "melee") return true;

  return false;
}
```

### Data Extraction Pattern (from combat-hooks.js)
```javascript
// Line 164-240
static async extractAttackData(message) {
  const flags = message.flags?.pf2e;
  if (!flags) return null;

  const origin = flags.origin;
  const context = flags.context;

  // Get actor (attacker)
  let actor = null;
  if (message.speaker?.actor) {
    actor = game.actors.get(message.speaker.actor);
  }

  // Get target
  let target = null;
  if (context?.target) {
    if (context.target.actor) {
      target = game.actors.get(context.target.actor);
    }
  }

  // Get item (weapon/spell)
  let item = null;
  if (origin?.uuid) {
    item = await fromUuid(origin.uuid);
  }

  return { message, actor, target, item, context, origin };
}
```

**Skill Equivalent Needed**:
```javascript
static async extractSkillData(message) {
  const flags = message.flags?.pf2e;
  if (!flags) return null;

  const context = flags.context;

  // Can we get these?
  const skill = context?.skill;     // "acrobatics", "athletics", etc.
  const action = context?.action;   // "tumble-through", "demoralize", etc.
  const outcome = context?.outcome; // "success", "failure", etc.

  // Get actor (skill user)
  let actor = null;
  if (message.speaker?.actor) {
    actor = game.actors.get(message.speaker.actor);
  }

  // Get target (for competitive checks like Demoralize)
  let target = null;
  if (context?.target) {
    // Does this exist for skill checks?
    target = game.actors.get(context.target.actor);
  }

  return { message, actor, target, skill, action, outcome, context };
}
```

---

## Realistic Assessment Framework

### Best Case Scenario (100% Viable) ✅
**Requirements**:
1. ✅ PF2e provides `context.type = "skill-check"`
2. ✅ PF2e provides `context.skill = "skillName"`
3. ✅ PF2e provides `context.action = "actionName"` for actions
4. ✅ PF2e provides `context.target` for competitive checks
5. ✅ PF2e provides `context.outcome`

**Result**: Full Phase 3 implementation possible
- Action-specific narratives
- Skill-specific fallbacks
- Target-aware descriptions
- Outcome-based variety

### Acceptable Scenario (70% Viable) ⚠️
**Requirements**:
1. ✅ PF2e provides `context.skill = "skillName"`
2. ✅ PF2e provides `context.outcome`
3. ❌ No `context.action` (can't distinguish actions)
4. ⚠️ Maybe `context.target` (unclear)

**Result**: Reduced Phase 3 implementation
- Generic skill narratives only
- Cannot distinguish Demoralize vs. Coerce
- Cannot distinguish Tumble Through vs. Balance
- Less interesting than Phase 1

### Worst Case Scenario (0% Viable) ❌
**Requirements**:
1. ❌ No `context.skill`
2. ❌ No `context.action`
3. ❌ Only `message.flavor` with skill name (unreliable)

**Result**: Phase 3 cancelled
- Same fatal flaw as save-based spells
- Cannot reliably detect skill checks
- Cannot generate contextual narratives

---

## Next Steps

### 1. Execute Testing Protocol
Run all Test A-E cases above in a live PF2e game.

### 2. Document Findings
For each test, record:
- Full `message.flags.pf2e` structure
- What fields exist
- What fields are missing
- Example JSON output

### 3. Make Go/No-Go Decision

**IF** action data is available (Best Case):
- ✅ Proceed with full Phase 3 implementation
- Create skill-hooks.js (similar to combat-hooks.js)
- Create skill narratives for ~50+ actions
- Estimated effort: 2-3 weeks

**IF** only skill data is available (Acceptable Case):
- ⚠️ Decide if generic skill narratives are worthwhile
- Reduced scope: ~18 skills × 4 outcomes = 72 templates
- Less exciting than action-specific narratives
- Estimated effort: 1 week

**IF** no reliable data is available (Worst Case):
- ❌ Cancel Phase 3
- Document why it's not feasible
- Move to Phase 4 (Exploration) or Phase 6 (Conditions)
- Save development time for viable features

---

## Frank Technical Assessment

### The Critical Unknown
**Everything hinges on whether PF2e preserves action names in skill check messages.**

If it doesn't, Phase 3 suffers the same problem as save-based spells:
- We can detect "something happened"
- We cannot detect "what specifically happened"
- Generic narratives are boring and add little value

### Questions for Testing
1. **Does `context.action` exist for Demoralize?**
   - If YES → Phase 3 is viable
   - If NO → Phase 3 is questionable

2. **Can we distinguish Tumble Through from Balance?**
   - If YES → Phase 3 adds real value
   - If NO → Phase 3 is just "you rolled Acrobatics"

3. **Are targets available for competitive checks?**
   - If YES → "You demoralize the orc!"
   - If NO → "You demoralize someone!" (lame)

### Recommendation
**DO NOT START PHASE 3 DEVELOPMENT** until testing confirms:
1. Action names are available in messages
2. Skill names are reliably detectable
3. Outcomes are clear
4. Targets are available (for relevant actions)

If testing reveals limited data, **consider skipping Phase 3** and moving to:
- **Phase 4: Exploration** (might have better hooks)
- **Phase 6: Conditions** (conditions are explicit in PF2e)

---

## Testing Checklist

- [ ] Test A: Generic skill check (Acrobatics)
- [ ] Test B: Demoralize action
- [ ] Test C: Tumble Through action
- [ ] Test D: Recall Knowledge action
- [ ] Test E: Grapple action
- [ ] Test F: Feint action
- [ ] Test G: Create a Diversion action
- [ ] Test H: Generic Athletics check
- [ ] Document all message structures
- [ ] Analyze feasibility
- [ ] Make go/no-go decision
- [ ] Document decision in README

---

## Conclusion

**Phase 3 feasibility is currently UNKNOWN.**

The same data availability issues that plague save-based spells may affect skill checks. We need empirical testing to determine if PF2e provides enough context to generate meaningful narratives.

**Do not commit development resources until testing confirms viability.**

If testing reveals insufficient data, it's better to skip Phase 3 than to build a system that generates generic, unhelpful narratives like "You rolled Acrobatics successfully."

---

*Investigation created: 2025-01-17*
*Status: Testing Required*
*Decision: Pending Test Results*
