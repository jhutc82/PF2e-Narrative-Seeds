#!/usr/bin/env node
/**
 * PF2e Narrative Seeds - Test Runner
 * Runs all tests and reports results
 */

import { test } from './test-framework.js';

// Import all test files
import './unit/weapon-name-extractor.test.js';
import './unit/context-filters.test.js';
import './unit/combat-memory.test.js';

// Run all tests
async function main() {
  const results = await test.runAll();

  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
