/**
 * PF2e Skill Check Message Testing Script
 *
 * PURPOSE: Investigate what data is available in PF2e skill check messages
 * to determine if Phase 3 (Skills) is feasible.
 *
 * USAGE:
 * 1. Open Foundry VTT with PF2e system
 * 2. Open browser console (F12)
 * 3. Copy-paste this entire file into console
 * 4. Use the test functions below to examine messages
 *
 * WORKFLOW:
 * 1. Perform a skill check in the game (click skill in character sheet)
 * 2. Run: analyzeLastMessage()
 * 3. Perform a skill action (like Demoralize)
 * 4. Run: analyzeLastMessage()
 * 5. Compare the outputs
 */

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Analyze the most recent chat message
 * This is your primary testing tool
 */
function analyzeLastMessage() {
  const messages = game.messages.contents;
  if (messages.length === 0) {
    console.log("❌ No messages in chat");
    return null;
  }

  const msg = messages[messages.length - 1];
  return analyzeMessage(msg);
}

/**
 * Analyze a specific message by index
 * @param {number} index - Index from end (0 = last, 1 = second-to-last, etc.)
 */
function analyzeMessageByIndex(index = 0) {
  const messages = game.messages.contents;
  const msg = messages[messages.length - 1 - index];

  if (!msg) {
    console.log(`❌ No message at index -${index}`);
    return null;
  }

  return analyzeMessage(msg);
}

/**
 * Analyze a specific message
 * @param {ChatMessage} msg - Message to analyze
 */
function analyzeMessage(msg) {
  console.log("\n" + "=".repeat(80));
  console.log("📊 PF2E MESSAGE ANALYSIS");
  console.log("=".repeat(80));

  // Basic Info
  console.log("\n📝 BASIC INFO:");
  console.log("  Message ID:", msg.id);
  console.log("  Flavor:", msg.flavor || "(none)");
  console.log("  Speaker:", msg.speaker?.alias || msg.speaker?.actor || "(unknown)");
  console.log("  Roll Type:", msg.rolls?.[0]?.constructor?.name || "(no roll)");

  // PF2e Flags
  console.log("\n🏴 PF2E FLAGS:");
  const pf2eFlags = msg.flags?.pf2e;

  if (!pf2eFlags) {
    console.log("  ❌ NO PF2E FLAGS FOUND");
    console.log("  This might not be a PF2e roll");
    return null;
  }

  console.log("  ✅ PF2e flags exist");
  console.log("\n  Full flags structure:");
  console.log(JSON.stringify(pf2eFlags, null, 2));

  // Context Analysis
  console.log("\n🎯 CONTEXT ANALYSIS:");
  const context = pf2eFlags.context;

  if (!context) {
    console.log("  ❌ NO CONTEXT OBJECT");
  } else {
    console.log("  ✅ Context exists");
    console.log("  Type:", context.type || "(not specified)");
    console.log("  Action:", context.action || "(not specified)");
    console.log("  Skill:", context.skill || "(not specified)");
    console.log("  Statistic:", context.statistic || "(not specified)");
    console.log("  Outcome:", context.outcome || "(not specified)");
    console.log("  Options:", context.options?.join(", ") || "(none)");

    if (context.target) {
      console.log("  Target:");
      console.log("    Actor:", context.target.actor || "(none)");
      console.log("    Token:", context.target.token || "(none)");
    } else {
      console.log("  Target: (none)");
    }

    console.log("\n  Full context:");
    console.log(JSON.stringify(context, null, 2));
  }

  // Origin Analysis
  console.log("\n🎬 ORIGIN ANALYSIS:");
  const origin = pf2eFlags.origin;

  if (!origin) {
    console.log("  ❌ NO ORIGIN OBJECT");
  } else {
    console.log("  ✅ Origin exists");
    console.log("  Type:", origin.type || "(not specified)");
    console.log("  UUID:", origin.uuid || "(not specified)");
    console.log("  Item:", origin.item || "(not specified)");

    console.log("\n  Full origin:");
    console.log(JSON.stringify(origin, null, 2));
  }

  // Modifiers Analysis
  console.log("\n🎲 MODIFIERS:");
  const modifiers = pf2eFlags.modifiers;

  if (!modifiers || modifiers.length === 0) {
    console.log("  (none)");
  } else {
    modifiers.forEach(mod => {
      console.log(`  ${mod.label}: ${mod.modifier > 0 ? '+' : ''}${mod.modifier}`);
    });
  }

  // Assessment
  console.log("\n📋 PHASE 3 VIABILITY ASSESSMENT:");

  const hasType = !!context?.type;
  const hasSkill = !!(context?.skill || context?.statistic);
  const hasAction = !!context?.action;
  const hasTarget = !!context?.target;
  const hasOutcome = !!context?.outcome;

  console.log("  Context Type Available:", hasType ? "✅ YES" : "❌ NO");
  console.log("  Skill Name Available:", hasSkill ? "✅ YES" : "❌ NO");
  console.log("  Action Name Available:", hasAction ? "✅ YES" : "❌ NO");
  console.log("  Target Available:", hasTarget ? "✅ YES" : "❌ NO");
  console.log("  Outcome Available:", hasOutcome ? "✅ YES" : "❌ NO");

  console.log("\n🎯 VIABILITY VERDICT:");

  if (hasAction && hasSkill && hasOutcome) {
    console.log("  ✅ FULL VIABILITY");
    console.log("  Phase 3 can generate action-specific narratives!");
    console.log("  Example: 'You demoralize the orc with a fierce growl!'");
  } else if (hasSkill && hasOutcome) {
    console.log("  ⚠️ PARTIAL VIABILITY");
    console.log("  Phase 3 can only generate generic skill narratives.");
    console.log("  Example: 'Your acrobatics check succeeds!'");
    console.log("  Cannot distinguish Tumble Through from Balance.");
  } else {
    console.log("  ❌ NOT VIABLE");
    console.log("  Insufficient data for Phase 3 implementation.");
    console.log("  Cannot reliably detect skill checks or outcomes.");
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // Return analysis object for programmatic use
  return {
    messageId: msg.id,
    flavor: msg.flavor,
    hasContext: !!context,
    contextType: context?.type,
    skill: context?.skill || context?.statistic,
    action: context?.action,
    outcome: context?.outcome,
    target: context?.target,
    hasTarget: hasTarget,
    origin: origin,
    viability: hasAction && hasSkill ? "full" : (hasSkill ? "partial" : "none"),
    rawFlags: pf2eFlags
  };
}

// ============================================================================
// TESTING WORKFLOW FUNCTIONS
// ============================================================================

/**
 * Test a generic skill check
 *
 * INSTRUCTIONS:
 * 1. Run this function: testGenericSkillCheck()
 * 2. Click a skill in your character sheet (e.g., Acrobatics)
 * 3. The function will automatically analyze the result
 */
async function testGenericSkillCheck() {
  console.log("\n🧪 TEST: Generic Skill Check");
  console.log("📝 INSTRUCTIONS:");
  console.log("  1. Click a skill in your character sheet");
  console.log("  2. Waiting for next message...\n");

  const startCount = game.messages.contents.length;

  // Poll for new message
  const interval = setInterval(() => {
    const currentCount = game.messages.contents.length;
    if (currentCount > startCount) {
      clearInterval(interval);
      console.log("\n✅ New message detected! Analyzing...\n");
      analyzeLastMessage();
    }
  }, 100);

  // Timeout after 30 seconds
  setTimeout(() => {
    clearInterval(interval);
    console.log("\n⏱️ Test timeout - no new message detected");
  }, 30000);
}

/**
 * Test an action-based skill check
 *
 * INSTRUCTIONS:
 * 1. Run this function: testActionSkillCheck()
 * 2. Use a skill action (e.g., Demoralize, Tumble Through, Grapple)
 * 3. The function will automatically analyze the result
 */
async function testActionSkillCheck() {
  console.log("\n🧪 TEST: Action-Based Skill Check");
  console.log("📝 INSTRUCTIONS:");
  console.log("  1. Use a skill action (Demoralize, Tumble Through, etc.)");
  console.log("  2. Waiting for next message...\n");

  const startCount = game.messages.contents.length;

  const interval = setInterval(() => {
    const currentCount = game.messages.contents.length;
    if (currentCount > startCount) {
      clearInterval(interval);
      console.log("\n✅ New message detected! Analyzing...\n");
      analyzeLastMessage();
    }
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    console.log("\n⏱️ Test timeout - no new message detected");
  }, 30000);
}

/**
 * Compare the last N messages
 * Useful for comparing generic check vs. action check
 *
 * @param {number} count - Number of recent messages to compare
 */
function compareRecentMessages(count = 2) {
  console.log("\n" + "=".repeat(80));
  console.log(`📊 COMPARING LAST ${count} MESSAGES`);
  console.log("=".repeat(80));

  const messages = game.messages.contents;
  const results = [];

  for (let i = 0; i < count; i++) {
    const msg = messages[messages.length - 1 - i];
    if (!msg) continue;

    console.log(`\n--- MESSAGE ${i + 1} (${msg.flavor || "no flavor"}) ---`);
    const analysis = analyzeMessage(msg);
    results.push(analysis);
  }

  // Comparison summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 COMPARISON SUMMARY");
  console.log("=".repeat(80));

  results.forEach((result, i) => {
    console.log(`\nMessage ${i + 1}:`);
    console.log(`  Flavor: ${result?.flavor || "(none)"}`);
    console.log(`  Type: ${result?.contextType || "(none)"}`);
    console.log(`  Skill: ${result?.skill || "(none)"}`);
    console.log(`  Action: ${result?.action || "(none)"}`);
    console.log(`  Outcome: ${result?.outcome || "(none)"}`);
    console.log(`  Has Target: ${result?.hasTarget ? "YES" : "NO"}`);
    console.log(`  Viability: ${result?.viability?.toUpperCase() || "UNKNOWN"}`);
  });

  console.log("\n" + "=".repeat(80) + "\n");

  return results;
}

// ============================================================================
// BATCH TESTING
// ============================================================================

/**
 * Run all tests in sequence
 * This will wait for you to perform each action
 */
async function runAllTests() {
  console.log("\n" + "=".repeat(80));
  console.log("🧪 PHASE 3 SKILL CHECK TEST SUITE");
  console.log("=".repeat(80));
  console.log("\nThis will run a series of tests to determine Phase 3 viability.");
  console.log("Follow the instructions for each test.\n");

  const tests = [
    {
      name: "Generic Skill Check",
      instructions: "Click 'Acrobatics' in your character sheet",
      fn: testGenericSkillCheck
    },
    {
      name: "Demoralize Action",
      instructions: "Use the 'Demoralize' action",
      fn: testActionSkillCheck
    },
    {
      name: "Tumble Through Action",
      instructions: "Use the 'Tumble Through' action",
      fn: testActionSkillCheck
    }
  ];

  for (const test of tests) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`TEST: ${test.name}`);
    console.log(`${"=".repeat(80)}`);
    console.log(`Instructions: ${test.instructions}\n`);

    await new Promise(resolve => {
      console.log("Press Enter in console when ready...");
      // In practice, user will just call the next test manually
      resolve();
    });
  }
}

// ============================================================================
// DOCUMENTATION & HELP
// ============================================================================

/**
 * Show help and usage instructions
 */
function showHelp() {
  console.log("\n" + "=".repeat(80));
  console.log("📚 PF2E SKILL CHECK TESTING TOOLS - HELP");
  console.log("=".repeat(80));
  console.log("\n🎯 QUICK START:");
  console.log("  1. Perform a skill check in the game");
  console.log("  2. Run: analyzeLastMessage()");
  console.log("  3. Review the analysis output\n");

  console.log("🔧 AVAILABLE FUNCTIONS:\n");

  console.log("  analyzeLastMessage()");
  console.log("    → Analyze the most recent chat message\n");

  console.log("  analyzeMessageByIndex(n)");
  console.log("    → Analyze the nth message from the end (0 = last)\n");

  console.log("  testGenericSkillCheck()");
  console.log("    → Start test, then click a skill in character sheet\n");

  console.log("  testActionSkillCheck()");
  console.log("    → Start test, then use a skill action (Demoralize, etc.)\n");

  console.log("  compareRecentMessages(n)");
  console.log("    → Compare the last n messages side-by-side\n");

  console.log("  showHelp()");
  console.log("    → Show this help message\n");

  console.log("📋 TESTING WORKFLOW:\n");
  console.log("  Step 1: Test a generic skill check");
  console.log("    - Click 'Acrobatics' in character sheet");
  console.log("    - Run: analyzeLastMessage()");
  console.log("    - Note if 'skill' or 'statistic' field exists\n");

  console.log("  Step 2: Test an action-based skill check");
  console.log("    - Use 'Demoralize' action");
  console.log("    - Run: analyzeLastMessage()");
  console.log("    - Note if 'action' field exists\n");

  console.log("  Step 3: Compare the two");
  console.log("    - Run: compareRecentMessages(2)");
  console.log("    - Check if action name is preserved\n");

  console.log("🎯 WHAT TO LOOK FOR:\n");
  console.log("  ✅ context.type = 'skill-check' (or similar)");
  console.log("  ✅ context.skill = 'acrobatics' (or context.statistic)");
  console.log("  ✅ context.action = 'demoralize' (for actions)");
  console.log("  ✅ context.outcome = 'success', 'failure', etc.");
  console.log("  ✅ context.target (for competitive checks)\n");

  console.log("📊 VIABILITY CRITERIA:\n");
  console.log("  FULL VIABILITY:");
  console.log("    - Action name is preserved for skill actions");
  console.log("    - Can distinguish Demoralize from Coerce");
  console.log("    - Can distinguish Tumble Through from Balance\n");

  console.log("  PARTIAL VIABILITY:");
  console.log("    - Skill name is available");
  console.log("    - Action name is NOT preserved");
  console.log("    - Can only generate generic skill narratives\n");

  console.log("  NOT VIABLE:");
  console.log("    - No reliable skill identification");
  console.log("    - Same problem as save-based spells");
  console.log("    - Phase 3 should be cancelled\n");

  console.log("=".repeat(80) + "\n");
}

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log("\n✅ PF2e Skill Check Testing Tools Loaded!");
console.log("📚 Run showHelp() for usage instructions");
console.log("🎯 Run analyzeLastMessage() to analyze the most recent roll\n");

// Export to global scope for easy access
window.analyzeLastMessage = analyzeLastMessage;
window.analyzeMessageByIndex = analyzeMessageByIndex;
window.testGenericSkillCheck = testGenericSkillCheck;
window.testActionSkillCheck = testActionSkillCheck;
window.compareRecentMessages = compareRecentMessages;
window.showHelp = showHelp;
