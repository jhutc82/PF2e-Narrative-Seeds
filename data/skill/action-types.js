/**
 * PF2e Narrative Seeds - Skill Action Types
 * Reference for all supported encounter mode skill actions
 *
 * @module data/skill/action-types
 * @author Justin Hutchinson
 */

/**
 * Skill action type definitions
 * Documents all supported encounter-mode skill actions
 */
export const SKILL_ACTIONS = {

  // ========================================
  // INTIMIDATION ACTIONS
  // ========================================
  'demoralize': {
    name: 'Demoralize',
    skill: 'intimidation',
    traits: ['auditory', 'concentrate', 'emotion', 'mental'],
    actions: 1,
    description: 'Frighten a foe with threats',
    hasTarget: true,
    featsSupported: [
      'intimidating-glare',
      'battle-cry',
      'intimidating-prowess',
      'terrified-retreat',
      'scare-to-death',
      'assurance-intimidation'
    ]
  },

  // ========================================
  // ATHLETICS ACTIONS
  // ========================================
  'grapple': {
    name: 'Grapple',
    skill: 'athletics',
    traits: ['attack'],
    actions: 1,
    description: 'Grab and restrain a foe',
    hasTarget: true,
    featsSupported: [
      'titan-wrestler',
      'assurance-athletics'
    ]
  },

  'trip': {
    name: 'Trip',
    skill: 'athletics',
    traits: ['attack'],
    actions: 1,
    description: 'Knock a foe prone',
    hasTarget: true,
    featsSupported: [
      'titan-wrestler',
      'assurance-athletics'
    ]
  },

  'shove': {
    name: 'Shove',
    skill: 'athletics',
    traits: ['attack'],
    actions: 1,
    description: 'Push a foe away',
    hasTarget: true,
    featsSupported: [
      'titan-wrestler',
      'assurance-athletics'
    ]
  },

  'disarm': {
    name: 'Disarm',
    skill: 'athletics',
    traits: ['attack'],
    actions: 1,
    description: 'Remove an item from a foe',
    hasTarget: true,
    featsSupported: [
      'titan-wrestler',
      'assurance-athletics'
    ]
  },

  'climb': {
    name: 'Climb',
    skill: 'athletics',
    traits: ['move'],
    actions: 1,
    description: 'Move on a vertical surface',
    hasTarget: false,
    featsSupported: [
      'combat-climber',
      'assurance-athletics'
    ]
  },

  'swim': {
    name: 'Swim',
    skill: 'athletics',
    traits: ['move'],
    actions: 1,
    description: 'Move through water',
    hasTarget: false,
    featsSupported: [
      'quick-swim',
      'assurance-athletics'
    ]
  },

  'high-jump': {
    name: 'High Jump',
    skill: 'athletics',
    traits: ['move'],
    actions: 2,
    description: 'Leap vertically',
    hasTarget: false,
    featsSupported: [
      'quick-jump',
      'powerful-leap',
      'cloud-jump',
      'assurance-athletics'
    ]
  },

  'long-jump': {
    name: 'Long Jump',
    skill: 'athletics',
    traits: ['move'],
    actions: 2,
    description: 'Leap horizontally',
    hasTarget: false,
    featsSupported: [
      'quick-jump',
      'powerful-leap',
      'cloud-jump',
      'assurance-athletics'
    ]
  },

  'force-open': {
    name: 'Force Open',
    skill: 'athletics',
    traits: ['attack'],
    actions: 1,
    description: 'Break open a door or container',
    hasTarget: false,
    featsSupported: [
      'assurance-athletics'
    ]
  },

  // ========================================
  // ACROBATICS ACTIONS
  // ========================================
  'tumble-through': {
    name: 'Tumble Through',
    skill: 'acrobatics',
    traits: ['move'],
    actions: 1,
    description: 'Move through an enemy\'s space',
    hasTarget: true,
    featsSupported: [
      'assurance-acrobatics'
    ]
  },

  'balance': {
    name: 'Balance',
    skill: 'acrobatics',
    traits: ['move'],
    actions: 1,
    description: 'Move across narrow surfaces',
    hasTarget: false,
    featsSupported: [
      'steady-balance',
      'assurance-acrobatics'
    ]
  },

  'escape': {
    name: 'Escape',
    skill: 'athletics', // Can also be acrobatics
    traits: ['attack'],
    actions: 1,
    description: 'Get free from a grab or restraint',
    hasTarget: true,
    featsSupported: [
      'assurance-athletics',
      'assurance-acrobatics'
    ]
  },

  // ========================================
  // DECEPTION ACTIONS
  // ========================================
  'feint': {
    name: 'Feint',
    skill: 'deception',
    traits: ['mental'],
    actions: 1,
    description: 'Make a foe off-guard',
    hasTarget: true,
    featsSupported: [
      'confabulator',
      'assurance-deception'
    ]
  },

  'create-diversion': {
    name: 'Create a Diversion',
    skill: 'deception',
    traits: ['mental'],
    actions: 1,
    description: 'Become hidden from a foe',
    hasTarget: true,
    featsSupported: [
      'lengthy-diversion',
      'confabulator',
      'assurance-deception'
    ]
  },

  // ========================================
  // STEALTH ACTIONS
  // ========================================
  'hide': {
    name: 'Hide',
    skill: 'stealth',
    traits: ['secret'],
    actions: 1,
    description: 'Become hidden',
    hasTarget: false,
    featsSupported: [
      'terrain-stalker',
      'assurance-stealth'
    ]
  },

  'sneak': {
    name: 'Sneak',
    skill: 'stealth',
    traits: ['move', 'secret'],
    actions: 1,
    description: 'Move while staying hidden',
    hasTarget: false,
    featsSupported: [
      'swift-sneak',
      'terrain-stalker',
      'assurance-stealth'
    ]
  },

  // ========================================
  // THIEVERY ACTIONS
  // ========================================
  'steal': {
    name: 'Steal',
    skill: 'thievery',
    traits: ['manipulate'],
    actions: 1,
    description: 'Take an object from a creature',
    hasTarget: true,
    featsSupported: [
      'pickpocket',
      'subtle-theft',
      'assurance-thievery'
    ]
  },

  'palm-object': {
    name: 'Palm an Object',
    skill: 'thievery',
    traits: ['manipulate'],
    actions: 1,
    description: 'Conceal a small object',
    hasTarget: false,
    featsSupported: [
      'pickpocket',
      'subtle-theft',
      'assurance-thievery'
    ]
  },

  'pick-lock': {
    name: 'Pick a Lock',
    skill: 'thievery',
    traits: ['manipulate'],
    actions: 2,
    description: 'Open a lock',
    hasTarget: false,
    featsSupported: [
      'assurance-thievery'
    ]
  },

  'disable-device': {
    name: 'Disable Device',
    skill: 'thievery',
    traits: ['manipulate'],
    actions: 2,
    description: 'Disable a trap or mechanism',
    hasTarget: false,
    featsSupported: [
      'assurance-thievery'
    ]
  },

  // ========================================
  // DIPLOMACY ACTIONS
  // ========================================
  'request': {
    name: 'Request',
    skill: 'diplomacy',
    traits: ['auditory', 'concentrate', 'linguistic', 'mental'],
    actions: 1,
    description: 'Ask a favor',
    hasTarget: true,
    featsSupported: [
      'assurance-diplomacy'
    ]
  },

  // ========================================
  // NATURE ACTIONS
  // ========================================
  'command-animal': {
    name: 'Command an Animal',
    skill: 'nature',
    traits: ['auditory', 'concentrate'],
    actions: 1,
    description: 'Order an animal to perform an action',
    hasTarget: true,
    featsSupported: []
  },

  // ========================================
  // PERFORMANCE ACTIONS
  // ========================================
  'perform': {
    name: 'Perform',
    skill: 'performance',
    traits: ['concentrate'],
    actions: 1,
    description: 'Give a performance',
    hasTarget: false,
    featsSupported: [
      'assurance-performance'
    ]
  },

  // ========================================
  // KNOWLEDGE ACTIONS (ANY SKILL)
  // ========================================
  'recall-knowledge': {
    name: 'Recall Knowledge',
    skill: null, // Can be any knowledge skill
    traits: ['concentrate', 'secret'],
    actions: 1,
    description: 'Remember information',
    hasTarget: false,
    featsSupported: [
      'assurance-arcana',
      'assurance-crafting',
      'assurance-lore',
      'assurance-medicine',
      'assurance-nature',
      'assurance-occultism',
      'assurance-religion',
      'assurance-society'
    ]
  }
};

/**
 * Get action definition
 * @param {string} actionSlug - Action slug
 * @returns {Object|null} Action definition
 */
export function getActionDefinition(actionSlug) {
  return SKILL_ACTIONS[actionSlug] || null;
}

/**
 * Get all action slugs
 * @returns {Array<string>} Array of action slugs
 */
export function getAllActionSlugs() {
  return Object.keys(SKILL_ACTIONS);
}

/**
 * Get actions by skill
 * @param {string} skillName - Skill name
 * @returns {Array<Object>} Array of actions using that skill
 */
export function getActionsBySkill(skillName) {
  return Object.entries(SKILL_ACTIONS)
    .filter(([slug, action]) => action.skill === skillName)
    .map(([slug, action]) => ({ slug, ...action }));
}

/**
 * Get actions that require a target
 * @returns {Array<string>} Array of action slugs
 */
export function getTargetedActions() {
  return Object.entries(SKILL_ACTIONS)
    .filter(([slug, action]) => action.hasTarget)
    .map(([slug, action]) => slug);
}

/**
 * Get total count of supported actions
 * @returns {number} Number of actions
 */
export function getActionCount() {
  return Object.keys(SKILL_ACTIONS).length;
}
