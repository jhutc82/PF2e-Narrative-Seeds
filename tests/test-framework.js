/**
 * PF2e Narrative Seeds - Test Framework
 * Simple test runner for module testing
 * No external dependencies - pure JavaScript
 */

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
    this.currentSuite = null;
  }

  /**
   * Define a test suite
   * @param {string} suiteName - Name of the test suite
   * @param {Function} fn - Suite function
   */
  describe(suiteName, fn) {
    this.currentSuite = suiteName;
    console.log(`\n📦 ${suiteName}`);
    fn();
    this.currentSuite = null;
  }

  /**
   * Define a test case
   * @param {string} testName - Name of the test
   * @param {Function} fn - Test function (async supported)
   */
  it(testName, fn) {
    this.tests.push({
      suite: this.currentSuite || 'General',
      name: testName,
      fn
    });
  }

  /**
   * Assert that a condition is true
   * @param {boolean} condition - Condition to test
   * @param {string} message - Error message if false
   */
  assert(condition, message = 'Assertion failed') {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Assert equality
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Optional message
   */
  assertEqual(actual, expected, message) {
    const msg = message || `Expected ${expected}, got ${actual}`;
    this.assert(actual === expected, msg);
  }

  /**
   * Assert deep equality for objects
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Optional message
   */
  assertDeepEqual(actual, expected, message) {
    const msg = message || `Objects not equal:\nExpected: ${JSON.stringify(expected)}\nGot: ${JSON.stringify(actual)}`;
    this.assert(JSON.stringify(actual) === JSON.stringify(expected), msg);
  }

  /**
   * Assert that value is truthy
   * @param {*} value - Value to check
   * @param {string} message - Optional message
   */
  assertTruthy(value, message) {
    this.assert(!!value, message || `Expected truthy value, got ${value}`);
  }

  /**
   * Assert that value is falsy
   * @param {*} value - Value to check
   * @param {string} message - Optional message
   */
  assertFalsy(value, message) {
    this.assert(!value, message || `Expected falsy value, got ${value}`);
  }

  /**
   * Assert that array includes value
   * @param {Array} array - Array to check
   * @param {*} value - Value to find
   * @param {string} message - Optional message
   */
  assertIncludes(array, value, message) {
    this.assert(
      Array.isArray(array) && array.includes(value),
      message || `Expected array to include ${value}`
    );
  }

  /**
   * Assert that function throws
   * @param {Function} fn - Function to test
   * @param {string} message - Optional message
   */
  assertThrows(fn, message) {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
    }
    this.assert(threw, message || 'Expected function to throw');
  }

  /**
   * Assert that value matches regex
   * @param {string} value - String to test
   * @param {RegExp} regex - Regex pattern
   * @param {string} message - Optional message
   */
  assertMatch(value, regex, message) {
    this.assert(
      regex.test(value),
      message || `Expected "${value}" to match ${regex}`
    );
  }

  /**
   * Run all registered tests
   * @returns {Promise<Object>} Test results
   */
  async runAll() {
    console.log('\n🧪 Running PF2e Narrative Seeds Tests...\n');
    console.log('='.repeat(60));

    for (const test of this.tests) {
      this.results.total++;

      try {
        await test.fn.call(this);
        this.results.passed++;
        console.log(`  ✓ ${test.name}`);
      } catch (error) {
        this.results.failed++;
        console.log(`  ✗ ${test.name}`);
        console.log(`    Error: ${error.message}`);
        if (error.stack) {
          console.log(`    ${error.stack.split('\n').slice(1, 3).join('\n    ')}`);
        }
      }
    }

    this.printSummary();
    return this.results;
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Test Summary:\n');
    console.log(`  Total:   ${this.results.total}`);
    console.log(`  ✓ Passed: ${this.results.passed}`);
    console.log(`  ✗ Failed: ${this.results.failed}`);

    const passRate = this.results.total > 0
      ? ((this.results.passed / this.results.total) * 100).toFixed(1)
      : 0;
    console.log(`\n  Pass Rate: ${passRate}%`);

    if (this.results.failed === 0) {
      console.log('\n  🎉 All tests passed!\n');
    } else {
      console.log(`\n  ⚠️  ${this.results.failed} test(s) failed\n`);
    }
  }
}

// Export singleton instance
export const test = new TestRunner();
export const { describe, it, assert, assertEqual, assertDeepEqual, assertTruthy, assertFalsy, assertIncludes, assertThrows, assertMatch } = {
  describe: (name, fn) => test.describe(name, fn),
  it: (name, fn) => test.it(name, fn),
  assert: (condition, message) => test.assert(condition, message),
  assertEqual: (actual, expected, message) => test.assertEqual(actual, expected, message),
  assertDeepEqual: (actual, expected, message) => test.assertDeepEqual(actual, expected, message),
  assertTruthy: (value, message) => test.assertTruthy(value, message),
  assertFalsy: (value, message) => test.assertFalsy(value, message),
  assertIncludes: (array, value, message) => test.assertIncludes(array, value, message),
  assertThrows: (fn, message) => test.assertThrows(fn, message),
  assertMatch: (value, regex, message) => test.assertMatch(value, regex, message)
};
