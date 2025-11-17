# Phase 3: Skill Action Detection Code Examples

## Investigation Summary

Based on research of the PF2e system source code, we know that:

1. **PF2e Actions Use Roll Options**: Actions like Demoralize pass `"action:demoralize"` as a roll option
2. **Roll Options Are Stored**: These appear in message flags (exact location TBD)
3. **Inspection Tool Exists**: Right-click any roll → "Inspect Roll" to see all roll options

## Critical Unknown: Where Do Roll Options Appear?

### Possibility 1: `context.options` Array
```javascript
message.flags.pf2e.context.options = [
  "action:demoralize",
  "skill:intimidation",
  "target:actor:goblin",
  // ... other options
]
```

### Possibility 2: `context.action` String
```javascript
message.flags.pf2e.context = {
  type: "skill-check",
  action: "demoralize",  // Extracted from roll options?
  skill: "intimidation",
  outcome: "success"
}
```

### Possibility 3: Separate Flag Location
```javascript
message.flags.pf2e["roll-options"] = {
  // ... roll options here
}
```

---

## Detection Code Example 1: Using `context.options` Array

If roll options appear in the `context.options` array:

```javascript
/**
 * Check if message is a skill action
 * @param {ChatMessage} message
 * @returns {boolean}
 */
static isSkillActionMessage(message) {
  const flags = message.flags?.pf2e;
  if (!flags) return false;

  const context = flags.context;
  if (!context) return false;

  // Check if this is a skill check
  if (context.type !== "skill-check") return false;

  // Check if it has roll options
  const options = context.options;
  if (!options || !Array.isArray(options)) return false;

  // Look for action: prefix in roll options
  return options.some(opt => opt.startsWith("action:"));
}

/**
 * Extract action name from roll options
 * @param {ChatMessage} message
 * @returns {string|null} Action slug (e.g., "demoralize", "tumble-through")
 */
static getActionName(message) {
  const context = message.flags?.pf2e?.context;
  if (!context?.options) return null;

  // Find the action: roll option
  const actionOption = context.options.find(opt => opt.startsWith("action:"));
  if (!actionOption) return null;

  // Extract action slug: "action:demoralize" -> "demoralize"
  return actionOption.replace("action:", "");
}

/**
 * Extract skill name from message
 * @param {ChatMessage} message
 * @returns {string|null}
 */
static getSkillName(message) {
  const context = message.flags?.pf2e?.context;
  if (!context) return null;

  // Try context.skill first
  if (context.skill) return context.skill;

  // Try context.statistic
  if (context.statistic) return context.statistic;

  // Try roll options
  if (context.options) {
    const skillOption = context.options.find(opt => opt.startsWith("skill:"));
    if (skillOption) {
      return skillOption.replace("skill:", "");
    }
  }

  return null;
}

/**
 * Full skill action detection
 * @param {ChatMessage} message
 * @returns {Object|null}
 */
static detectSkillAction(message) {
  if (!this.isSkillActionMessage(message)) {
    return null;
  }

  const context = message.flags.pf2e.context;

  return {
    type: "skill-action",
    action: this.getActionName(message),     // "demoralize", "tumble-through", etc.
    skill: this.getSkillName(message),       // "intimidation", "acrobatics", etc.
    outcome: context.outcome,                 // "success", "criticalSuccess", etc.
    target: context.target,                   // Target data if available
    dc: context.dc,                           // DC information
    options: context.options                  // All roll options
  };
}
```

---

## Detection Code Example 2: Using `context.action` String

If PF2e extracts action into a dedicated field:

```javascript
/**
 * Check if message is a skill action (simpler version)
 * @param {ChatMessage} message
 * @returns {boolean}
 */
static isSkillActionMessage(message) {
  const context = message.flags?.pf2e?.context;
  if (!context) return false;

  // Check if it has an action field
  // Similar to how Strike uses context.action === "strike"
  return !!context.action && context.type === "skill-check";
}

/**
 * Extract skill action data (simpler version)
 * @param {ChatMessage} message
 * @returns {Object|null}
 */
static detectSkillAction(message) {
  const context = message.flags?.pf2e?.context;
  if (!context?.action) return null;

  return {
    type: "skill-action",
    action: context.action,      // "demoralize", "tumble-through", etc.
    skill: context.skill,         // "intimidation", "acrobatics", etc.
    outcome: context.outcome,
    target: context.target
  };
}
```

---

## Common Skill Actions to Detect

Based on PF2e system source code:

### High Priority (Very Common)
```javascript
const HIGH_PRIORITY_ACTIONS = [
  "demoralize",           // Intimidation - used every combat
  "tumble-through",       // Acrobatics - common tactical move
  "recall-knowledge",     // Various - used constantly
  "feint",                // Deception - Rogue staple
];
```

### Medium Priority (Common)
```javascript
const MEDIUM_PRIORITY_ACTIONS = [
  "grapple",              // Athletics - with Attack trait
  "trip",                 // Athletics - with Attack trait
  "shove",                // Athletics - with Attack trait
  "disarm",               // Athletics - with Attack trait
  "create-a-diversion",   // Deception
  "hide",                 // Stealth
  "sneak",                // Stealth
];
```

### Action Slugs Reference
```javascript
// Athletics
"action:grapple"
"action:trip"
"action:shove"
"action:disarm"
"action:force-open"

// Acrobatics
"action:tumble-through"

// Intimidation
"action:demoralize"
"action:coerce"

// Deception
"action:feint"
"action:create-a-diversion"

// Stealth
"action:hide"
"action:sneak"

// Recall Knowledge
"action:recall-knowledge"
```

---

## Usage in Combat Hooks

Modify `combat-hooks.js` to detect skill actions:

```javascript
static async onChatMessage(message, options, userId) {
  try {
    // ... existing GM/user checks ...

    // Check if combat narration is enabled
    if (!NarrativeSeedsSettings.isCombatEnabled()) {
      return;
    }

    // Check if this is a PF2e strike
    if (this.isStrikeMessage(message)) {
      // ... existing strike handling ...
      return;
    }

    // NEW: Check if this is a skill action
    const skillActionData = this.detectSkillAction(message);
    if (skillActionData) {
      await this.handleSkillAction(message, skillActionData);
      return;
    }

  } catch (error) {
    console.error("PF2e Narrative Seeds | Error processing message:", error);
  }
}

/**
 * Handle skill action messages
 * @param {ChatMessage} message
 * @param {Object} actionData
 */
static async handleSkillAction(message, actionData) {
  // Validate action is one we support
  const SUPPORTED_ACTIONS = [
    "demoralize", "tumble-through", "grapple", "trip",
    "shove", "feint", "recall-knowledge"
  ];

  if (!SUPPORTED_ACTIONS.includes(actionData.action)) {
    console.log(`PF2e Narrative Seeds | Unsupported skill action: ${actionData.action}`);
    return;
  }

  // Generate narrative for skill action
  const seed = await this.generator.generateSkillNarrative(actionData);
  if (!seed) {
    console.log("PF2e Narrative Seeds | Could not generate skill narrative");
    return;
  }

  // Append narrative to message
  const narrativeHTML = CombatFormatter.generateHTML(seed);
  await message.update({
    content: message.content + narrativeHTML,
    flags: {
      ...message.flags,
      "pf2e-narrative-seeds": {
        hasNarrative: true,
        actionData: {
          type: "skill-action",
          action: actionData.action,
          skill: actionData.skill,
          outcome: actionData.outcome
        },
        seed: seed
      }
    }
  });
}
```

---

## Testing Protocol

### Step 1: Manual Console Test (5 minutes)

```javascript
// In Foundry console after performing Demoralize action:
const msg = game.messages.contents[game.messages.contents.length - 1];

// Check what's available:
console.log("Full flags:", JSON.stringify(msg.flags.pf2e, null, 2));
console.log("Context type:", msg.flags.pf2e?.context?.type);
console.log("Context action:", msg.flags.pf2e?.context?.action);
console.log("Context options:", msg.flags.pf2e?.context?.options);
console.log("Context skill:", msg.flags.pf2e?.context?.skill);
```

### Step 2: Use "Inspect Roll" Feature

1. Perform a Demoralize action in game
2. Right-click the chat message
3. Select "Inspect Roll"
4. Look for roll options containing `"action:demoralize"`

### Step 3: Use Test Script

```javascript
// Copy test-skill-messages.js into console
// Then run:
testActionSkillCheck()

// Perform Demoralize action
// Script will automatically analyze the message
```

---

## Decision Criteria

### ✅ PROCEED with Phase 3 if:
- `context.action` exists and contains action slug ("demoralize", etc.)
- OR `context.options` array contains action roll options ("action:demoralize")
- AND we can reliably extract the action name
- AND multiple different actions work (not just Demoralize)

### ⚠️ PARTIAL IMPLEMENTATION if:
- Skill name available but NOT action name
- Can only generate generic skill narratives
- Limited value, discuss if worth effort

### ❌ CANCEL Phase 3 if:
- No reliable way to detect skill actions
- Cannot distinguish Demoralize from Coerce
- Same fatal flaw as save-based spells

---

## Next Steps

1. **Test in Foundry** (30 minutes)
   - Use Demoralize action
   - Check message flags
   - Use "Inspect Roll" feature
   - Run test script

2. **Document Findings**
   - Record exact flag structure
   - Identify where action name appears
   - Test 3-5 different actions

3. **Make Decision**
   - Full viability → Proceed with Phase 3
   - Partial viability → Discuss with team
   - Not viable → Skip Phase 3

4. **If Viable, Implement**
   - Update `combat-hooks.js`
   - Create `skill-action-detector.js`
   - Create narrative templates
   - Test thoroughly
