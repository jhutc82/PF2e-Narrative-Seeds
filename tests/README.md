# PF2e Narrative Seeds - Test Suite

Comprehensive test suite for the PF2e Narrative Seeds module.

## Running Tests

```bash
npm test
```

## Test Framework

Custom lightweight test framework (`test-framework.js`) with no external dependencies:
- Simple `describe()` and `it()` syntax
- Async test support
- Multiple assertion methods
- Clean output with pass/fail statistics

## Test Coverage

### Unit Tests

**WeaponNameExtractor** (10 tests)
- Weapon name extraction from PF2e items
- Spell attack detection and descriptors
- Natural attack identification
- Unarmed attack handling
- Rune stripping and name cleaning
- Fallback behavior for missing items

**ContextFilters** (18 tests)
- Anatomy-based effect filtering (blood for skeletons, etc.)
- Damage type compatibility (burning only for fire, etc.)
- Verb filtering by damage type
- Location-specific filtering
- Fallback protection (never filter out everything)

**CombatMemory** (14 tests)
- Combat session creation and management
- Hit/miss streak tracking
- Dramatic moment detection
- Escalation level calculation
- Hit rate statistics
- Multi-combatant tracking
- Session cleanup

## Test Structure

```
tests/
├── test-framework.js        # Custom test runner
├── mocks.js                  # Mock Foundry/PF2e objects
├── run-tests.js             # Test runner script
└── unit/
    ├── weapon-name-extractor.test.js
    ├── context-filters.test.js
    └── combat-memory.test.js
```

## Mock Utilities

The `mocks.js` file provides:
- `createMockActor()` - Mock PF2e actors with traits/size
- `createMockItem()` - Mock weapons, spells, natural attacks
- `createMockMessage()` - Mock chat messages with PF2e flags
- Pre-made helpers: `createHumanoidActor()`, `createDragonActor()`, etc.
- `MockFetch` class for testing data loading

## Writing Tests

```javascript
import { describe, it, assertEqual } from '../test-framework.js';
import { MyClass } from '../../scripts/my-class.js';

describe('MyClass', () => {

  it('should do something', () => {
    const result = MyClass.doSomething();
    assertEqual(result, 'expected', 'Should return expected value');
  });

});
```

## Assertion Methods

- `assert(condition, message)` - Assert truthy
- `assertEqual(actual, expected, message)` - Strict equality
- `assertDeepEqual(actual, expected, message)` - Deep object equality
- `assertTruthy(value, message)` - Assert truthy
- `assertFalsy(value, message)` - Assert falsy
- `assertIncludes(array, value, message)` - Array includes
- `assertThrows(fn, message)` - Function throws error
- `assertMatch(value, regex, message)` - Regex match

## Test Results

Current test status: **42/42 tests passing (100%)**

```
📦 WeaponNameExtractor        ✓ 10 tests
📦 ContextFilters             ✓ 18 tests
📦 CombatMemory               ✓ 14 tests
```

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```bash
# Run tests and exit with error code if any fail
npm test

# Exit code 0 = all pass, 1 = failures
```

## Adding New Tests

1. Create test file in `tests/unit/`
2. Import test framework: `import { describe, it, ... } from '../test-framework.js'`
3. Import module to test: `import { MyClass } from '../../scripts/my-class.js'`
4. Write tests using `describe()` and `it()`
5. Import test file in `run-tests.js`

## Future Enhancements

Potential additions:
- Integration tests for full narrative generation pipeline
- Performance benchmarks
- Code coverage reporting
- Parameterized tests
- Test fixtures
- Before/after hooks

## Bug Fixes Found Through Testing

Tests identified and fixed:
- **CombatMemory dramatic moment detection**: Fixed logic to use `totalMisses` instead of `consecutiveMisses` after streak breaks
