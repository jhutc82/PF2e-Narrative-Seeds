/**
 * PF2e Narrative Seeds - Combat Data Helpers
 * Helper functions for accessing combat data via DataLoader
 * Replaces old static imports with lazy-loaded data
 */

import { DataLoader } from '../data-loader.js';
import { RandomUtils } from '../utils.js';

/**
 * Get a random location for an anatomy type and outcome
 * @param {string|Object} anatomy - Anatomy type or anatomy object {base, modifiers}
 * @param {string} outcome - Outcome type
 * @param {string} varietyMode - Variety setting
 * @returns {Promise<string>} Location string
 */
export async function getLocation(anatomy, outcome, varietyMode = 'high') {
  const locations = await DataLoader.loadLocations(anatomy, outcome);
  if (!locations || locations.length === 0) {
    return null;
  }

  const anatomyKey = typeof anatomy === 'string' ? anatomy : anatomy.base || 'humanoid';
  const category = `location:${anatomyKey}:${outcome}`;
  return RandomUtils.selectRandom(locations, varietyMode, category);
}

/**
 * Get damage verb for a damage type and outcome
 * @param {string} damageType - Damage type
 * @param {string} outcome - Outcome type
 * @param {string} varietyMode - Variety setting
 * @param {string} locationAnatomy - Optional location anatomy for context
 * @returns {Promise<string>} Damage verb
 */
export async function getDamageVerb(damageType, outcome, varietyMode = 'high', locationAnatomy = null) {
  const verbs = await DataLoader.loadDamageDescriptors(damageType, 'verbs', outcome);
  if (!verbs || verbs.length === 0) {
    return null;
  }

  const category = `damage-verb:${damageType}:${outcome}`;
  return RandomUtils.selectRandom(verbs, varietyMode, category);
}

/**
 * Get damage effect for a damage type and outcome
 * @param {string} damageType - Damage type
 * @param {string} outcome - Outcome type
 * @param {string} varietyMode - Variety setting
 * @param {string} locationAnatomy - Optional location anatomy for context
 * @returns {Promise<string>} Damage effect
 */
export async function getDamageEffect(damageType, outcome, varietyMode = 'high', locationAnatomy = null) {
  const effects = await DataLoader.loadDamageDescriptors(damageType, 'effects', outcome);
  if (!effects || effects.length === 0) {
    return null;
  }

  const category = `damage-effect:${damageType}:${outcome}`;
  return RandomUtils.selectRandom(effects, varietyMode, category);
}

/**
 * Get weapon type descriptor for a damage type
 * @param {string} damageType - Damage type
 * @param {Object} item - Optional item for specific weapon info
 * @param {string} pov - Point of view (first, second, third)
 * @param {Object} message - Optional message for context
 * @returns {Promise<string>} Weapon type descriptor
 */
export async function getWeaponType(damageType, item = null, pov = "second", message = null) {
  const weaponType = await DataLoader.loadWeaponType(damageType);

  // Adjust POV
  switch(pov) {
    case "first":
      return weaponType.replace(/Your/g, 'My').replace(/your/g, 'my');
    case "third":
      return weaponType.replace(/Your/g, 'The').replace(/your/g, 'the');
    case "second":
    default:
      return weaponType;
  }
}

/**
 * Get opening sentence for a detail level and outcome
 * @param {string} detailLevel - Detail level (minimal, standard, detailed, cinematic)
 * @param {string} outcome - Outcome type
 * @param {Object} context - Context variables for interpolation
 * @returns {Promise<string>} Opening sentence
 */
export async function getOpeningSentence(detailLevel, outcome, context = {}) {
  const openings = await DataLoader.loadOpenings(detailLevel, outcome);
  if (!openings || openings.length === 0) {
    return "";
  }

  const category = `opening:${detailLevel}:${outcome}`;
  const template = RandomUtils.selectRandom(openings, 'high', category);

  // Interpolate template variables
  return interpolateTemplate(template, context);
}

/**
 * Get ranged opening sentence
 * @param {string} weaponCategory - Weapon category (bow, crossbow, thrown, etc.)
 * @param {string} detailLevel - Detail level
 * @param {string} outcome - Outcome type
 * @param {Object} context - Context variables
 * @returns {Promise<string>} Ranged opening sentence
 */
export async function getRangedOpeningSentence(weaponCategory, detailLevel, outcome, context = {}) {
  const category = `ranged-${weaponCategory}`;
  const openings = await DataLoader.loadOpenings(detailLevel, outcome, category);

  if (!openings || openings.length === 0) {
    // Fallback to standard openings
    return await getOpeningSentence(detailLevel, outcome, context);
  }

  const selectionCategory = `ranged-opening:${weaponCategory}:${detailLevel}:${outcome}`;
  const template = RandomUtils.selectRandom(openings, 'high', selectionCategory);

  return interpolateTemplate(template, context);
}

/**
 * Get defense openings for failures
 * @param {string} outcome - Outcome type (failure or criticalFailure)
 * @param {string} defenseType - Defense type (armor, shield, dodge, miss)
 * @param {string} detailLevel - Detail level
 * @returns {Promise<Array<string>>} Array of defense opening templates
 */
export async function getDefenseOpenings(outcome, defenseType, detailLevel) {
  const category = `defense-${defenseType}`;
  const openings = await DataLoader.loadOpenings(detailLevel, outcome, category);

  return openings || [];
}

/**
 * Get ranged weapon category from item
 * @param {Object} item - PF2e item
 * @param {Object} message - Optional chat message
 * @returns {string|null} Weapon category (bow, crossbow, thrown, firearm, bomb, spell)
 */
export function getRangedWeaponCategory(item, message = null) {
  if (!item) return null;

  // Check item type
  const itemType = item.type?.toLowerCase();
  const itemName = item.name?.toLowerCase() || '';
  const traits = item.system?.traits?.value || [];

  // Check for spell
  if (itemType === 'spell' || traits.includes('spell')) {
    return 'spell';
  }

  // Check for bomb
  if (traits.includes('bomb') || itemName.includes('bomb') || itemName.includes('alchemical')) {
    return 'bomb';
  }

  // Check for firearm
  if (traits.includes('firearm') || itemName.includes('firearm') || itemName.includes('gun') ||
      itemName.includes('pistol') || itemName.includes('musket')) {
    return 'firearm';
  }

  // Check for thrown weapon
  if (traits.includes('thrown') || itemName.includes('javelin') || itemName.includes('dart') ||
      itemName.includes('throwing') || itemName.includes('shuriken')) {
    return 'thrown';
  }

  // Check for crossbow
  if (traits.includes('crossbow') || itemName.includes('crossbow')) {
    return 'crossbow';
  }

  // Check for bow
  if (traits.includes('bow') || itemName.includes('bow') || itemName.includes('longbow') ||
      itemName.includes('shortbow')) {
    return 'bow';
  }

  // Check weapon group
  const group = item.system?.group?.value;
  if (group === 'bow') return 'bow';
  if (group === 'crossbow') return 'crossbow';
  if (group === 'dart') return 'thrown';

  return null;
}

/**
 * Get location anatomy type (generic helper)
 * @param {string} location - Location string
 * @returns {string} Anatomy classification
 */
export function getLocationAnatomy(location) {
  if (!location) return 'generic';

  const locationLower = location.toLowerCase();

  // Vital organs
  if (locationLower.includes('heart') || locationLower.includes('brain') ||
      locationLower.includes('lung') || locationLower.includes('liver') ||
      locationLower.includes('kidney') || locationLower.includes('spleen')) {
    return 'organ';
  }

  // Major arteries/veins
  if (locationLower.includes('artery') || locationLower.includes('vein') ||
      locationLower.includes('jugular') || locationLower.includes('carotid')) {
    return 'vessel';
  }

  // Bones
  if (locationLower.includes('skull') || locationLower.includes('bone') ||
      locationLower.includes('rib') || locationLower.includes('spine') ||
      locationLower.includes('vertebra')) {
    return 'bone';
  }

  // Joints
  if (locationLower.includes('joint') || locationLower.includes('knee') ||
      locationLower.includes('elbow') || locationLower.includes('shoulder')) {
    return 'joint';
  }

  // Eyes
  if (locationLower.includes('eye') || locationLower.includes('orbital')) {
    return 'eye';
  }

  // Default
  return 'flesh';
}

/**
 * Interpolate template string with context variables
 * @private
 * @param {string} template - Template string
 * @param {Object} context - Context variables
 * @returns {string} Interpolated string
 */
function interpolateTemplate(template, context) {
  if (!template) return "";
  if (!context || typeof context !== 'object') return template;

  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}
