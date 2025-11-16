/**
 * PF2e Narrative Seeds - Test Mocks
 * Mock objects for Foundry VTT and PF2e system
 */

/**
 * Mock PF2e actor
 */
export function createMockActor(options = {}) {
  const {
    name = 'Test Actor',
    size = 'medium',
    traits = [],
    actorType = 'character',
    id = 'actor-' + Math.random().toString(36).substr(2, 9)
  } = options;

  return {
    id,
    name,
    type: actorType,
    system: {
      traits: {
        size: {
          value: size
        },
        value: traits
      }
    }
  };
}

/**
 * Mock PF2e item (weapon, spell, etc.)
 */
export function createMockItem(options = {}) {
  const {
    name = 'Test Weapon',
    itemType = 'weapon',
    traits = [],
    group = 'sword',
    damageType = 'slashing'
  } = options;

  return {
    name,
    type: itemType,
    system: {
      traits: {
        value: traits
      },
      group: {
        value: group
      },
      damage: {
        damageType
      }
    }
  };
}

/**
 * Mock chat message with PF2e flags
 */
export function createMockMessage(options = {}) {
  const {
    outcome = 'success',
    degreeOfSuccess = 2,
    combatId = 'combat-1'
  } = options;

  return {
    flags: {
      pf2e: {
        context: {
          outcome,
          degreeOfSuccess
        }
      }
    },
    combat: {
      id: combatId
    },
    rolls: []
  };
}

/**
 * Create mock humanoid actor
 */
export function createHumanoidActor(name = 'Humanoid') {
  return createMockActor({
    name,
    size: 'medium',
    traits: ['humanoid'],
    actorType: 'npc'
  });
}

/**
 * Create mock dragon actor
 */
export function createDragonActor(name = 'Dragon') {
  return createMockActor({
    name,
    size: 'huge',
    traits: ['dragon'],
    actorType: 'npc'
  });
}

/**
 * Create mock skeleton actor
 */
export function createSkeletonActor(name = 'Skeleton') {
  return createMockActor({
    name,
    size: 'medium',
    traits: ['undead', 'skeleton'],
    actorType: 'npc'
  });
}

/**
 * Create mock incorporeal actor
 */
export function createIncorporealActor(name = 'Ghost') {
  return createMockActor({
    name,
    size: 'medium',
    traits: ['undead', 'incorporeal'],
    actorType: 'npc'
  });
}

/**
 * Create mock longsword
 */
export function createLongsword() {
  return createMockItem({
    name: 'Longsword',
    itemType: 'weapon',
    traits: ['versatile-p'],
    group: 'sword',
    damageType: 'slashing'
  });
}

/**
 * Create mock bow
 */
export function createBow() {
  return createMockItem({
    name: 'Longbow',
    itemType: 'weapon',
    traits: ['bow', 'deadly-d10', 'propulsive', 'volley-30-ft'],
    group: 'bow',
    damageType: 'piercing'
  });
}

/**
 * Create mock fire spell
 */
export function createFireSpell() {
  return createMockItem({
    name: 'Fireball',
    itemType: 'spell',
    traits: ['spell', 'evocation', 'fire'],
    damageType: 'fire'
  });
}

/**
 * Create mock unarmed attack
 */
export function createUnarmedAttack() {
  return createMockItem({
    name: 'Fist',
    itemType: 'melee',
    traits: ['unarmed', 'nonlethal', 'finesse', 'agile'],
    group: 'brawling',
    damageType: 'bludgeoning'
  });
}

/**
 * Create mock claw attack (natural)
 */
export function createClawAttack() {
  return createMockItem({
    name: 'Claw',
    itemType: 'melee',
    traits: ['unarmed', 'agile'],
    group: 'brawling',
    damageType: 'slashing'
  });
}

/**
 * Mock fetch for testing data loading
 */
export class MockFetch {
  constructor() {
    this.responses = new Map();
  }

  /**
   * Register a mock response
   * @param {string} url - URL pattern to match
   * @param {Object} data - Data to return
   */
  register(url, data) {
    this.responses.set(url, {
      ok: true,
      json: async () => data
    });
  }

  /**
   * Register a 404 response
   * @param {string} url - URL pattern to match
   */
  register404(url) {
    this.responses.set(url, {
      ok: false,
      status: 404
    });
  }

  /**
   * Mock fetch function
   * @param {string} url - URL to fetch
   * @returns {Promise<Object>} Mock response
   */
  fetch(url) {
    if (this.responses.has(url)) {
      return Promise.resolve(this.responses.get(url));
    }

    // Default 404
    return Promise.resolve({
      ok: false,
      status: 404
    });
  }
}

/**
 * Create mock combat context
 */
export function createCombatContext(options = {}) {
  const {
    attacker = createHumanoidActor('Attacker'),
    target = createHumanoidActor('Target'),
    item = createLongsword(),
    outcome = 'success',
    message = createMockMessage({ outcome })
  } = options;

  return {
    attacker,
    target,
    item,
    outcome,
    message
  };
}
