/**
 * PF2e Narrative Seeds - Combat Data Helpers
 * Helper functions for accessing combat data via DataLoader
 * Replaces old static imports with lazy-loaded data
 */

import { DataLoader } from '../data-loader.js';
import { RandomUtils } from '../utils.js';
import { WeaponNameExtractor } from './weapon-name-extractor.js';
import { ContextFilters } from './context-filters.js';

/**
 * Get a random location for an anatomy type and outcome
 * @param {string|Object} anatomy - Anatomy type or anatomy object {base, modifiers}
 * @param {string} outcome - Outcome type
 * @param {string} varietyMode - Variety setting
 * @returns {Promise<string>} Location string
 */
export async function getLocation(anatomy, outcome, varietyMode = 'high') {
  const locations = await DataLoader.loadLocations(anatomy, outcome);
  if (!locations || !Array.isArray(locations) || locations.length === 0) {
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
  if (!verbs || !Array.isArray(verbs) || verbs.length === 0) {
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
  if (!effects || !Array.isArray(effects) || effects.length === 0) {
    return null;
  }

  const category = `damage-effect:${damageType}:${outcome}`;
  return RandomUtils.selectRandom(effects, varietyMode, category);
}

/**
 * Get context-aware damage verb with filtering applied
 * Filters out semantically inappropriate verbs based on damage type and location
 * @param {string} damageType - Damage type
 * @param {string} outcome - Outcome type
 * @param {string} varietyMode - Variety setting
 * @param {Object} context - Context (anatomy, location)
 * @returns {Promise<string>} Contextually appropriate damage verb
 */
export async function getContextualDamageVerb(damageType, outcome, varietyMode = 'high', context = {}) {
  const verbs = await DataLoader.loadDamageDescriptors(damageType, 'verbs', outcome);
  if (!verbs || !Array.isArray(verbs) || verbs.length === 0) {
    return null;
  }

  // Apply context filtering
  const filtered = ContextFilters.applyContextFilters(verbs, [], context);
  const filteredVerbs = filtered.verbs;

  const category = `contextual-verb:${damageType}:${outcome}`;
  return RandomUtils.selectRandom(filteredVerbs, varietyMode, category);
}

/**
 * Get context-aware damage effect with filtering and anatomy overrides applied
 * Returns anatomy-specific effects for special creatures, or filtered standard effects
 * @param {string} damageType - Damage type
 * @param {string} outcome - Outcome type
 * @param {string} varietyMode - Variety setting
 * @param {Object} context - Context (anatomy, location)
 * @returns {Promise<string>} Contextually appropriate damage effect
 */
export async function getContextualDamageEffect(damageType, outcome, varietyMode = 'high', context = {}) {
  const { anatomy } = context;
  const anatomyBase = typeof anatomy === 'string' ? anatomy : anatomy?.base || 'humanoid';

  // Check for anatomy-specific overrides first
  const overrides = await DataLoader.loadAnatomyOverrides(anatomyBase, outcome);
  if (overrides && Array.isArray(overrides) && overrides.length > 0) {
    const category = `anatomy-override:${anatomyBase}:${outcome}`;
    return RandomUtils.selectRandom(overrides, varietyMode, category);
  }

  // Fall back to standard effects with filtering
  const effects = await DataLoader.loadDamageDescriptors(damageType, 'effects', outcome);
  if (!effects || !Array.isArray(effects) || effects.length === 0) {
    return null;
  }

  // Apply context filtering
  const filtered = ContextFilters.applyContextFilters([], effects, context);
  const filteredEffects = filtered.effects;

  const category = `contextual-effect:${damageType}:${outcome}`;
  return RandomUtils.selectRandom(filteredEffects, varietyMode, category);
}

/**
 * Get weapon type descriptor - NOW USES ACTUAL WEAPON NAME
 * @param {string} damageType - Damage type (for fallback)
 * @param {Object} item - PF2e item (NOW ACTUALLY USED!)
 * @param {string} pov - Point of view (first, second, third)
 * @param {Object} message - Optional message for context
 * @returns {string} Weapon display name
 */
export function getWeaponType(damageType, item = null, pov = "second", message = null) {
  // Use the smart extractor to get the best weapon name
  return WeaponNameExtractor.getWeaponDisplayName(item, damageType, pov);
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
  if (!openings || !Array.isArray(openings) || openings.length === 0) {
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

  if (!openings || !Array.isArray(openings) || openings.length === 0) {
    // Fallback to standard openings
    return await getOpeningSentence(detailLevel, outcome, context);
  }

  const selectionCategory = `ranged-opening:${weaponCategory}:${detailLevel}:${outcome}`;
  const template = RandomUtils.selectRandom(openings, 'high', selectionCategory);

  return interpolateTemplate(template, context);
}

/**
 * Get melee opening sentence
 * @param {string} weaponCategory - Weapon category (sword, axe, hammer, etc.)
 * @param {string} detailLevel - Detail level
 * @param {string} outcome - Outcome type
 * @param {Object} context - Context variables
 * @returns {Promise<string>} Melee opening sentence
 */
export async function getMeleeOpeningSentence(weaponCategory, detailLevel, outcome, context = {}) {
  const category = `melee-${weaponCategory}`;
  const openings = await DataLoader.loadOpenings(detailLevel, outcome, category);

  if (!openings || !Array.isArray(openings) || openings.length === 0) {
    // Fallback to standard openings
    return await getOpeningSentence(detailLevel, outcome, context);
  }

  const selectionCategory = `melee-opening:${weaponCategory}:${detailLevel}:${outcome}`;
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

  return (openings && Array.isArray(openings)) ? openings : [];
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
  const traits = Array.isArray(item.system?.traits?.value) ? item.system.traits.value : [];

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
 * Get melee weapon category from item
 * @param {Object} item - PF2e item
 * @param {Object} message - Optional chat message
 * @returns {string|null} Weapon category (sword, axe, hammer, spear, dagger, unarmed)
 */
export function getMeleeWeaponCategory(item, message = null) {
  if (!item) return null;

  const itemType = item.type?.toLowerCase();
  const itemName = item.name?.toLowerCase() || '';
  const traits = Array.isArray(item.system?.traits?.value) ? item.system.traits.value : [];
  const group = item.system?.group?.value;

  // Check for unarmed attacks
  if (itemType === 'melee' && (traits.includes('unarmed') || group === 'brawling')) {
    return 'unarmed';
  }

  // Natural attacks (claws, bites, etc.)
  if (itemName.includes('fist') || itemName.includes('claw') || itemName.includes('bite') ||
      itemName.includes('horn') || itemName.includes('tail') || itemName.includes('wing') ||
      itemName.includes('tentacle') || itemName.includes('jaws')) {
    return 'unarmed';
  }

  // Daggers and small blades
  if (group === 'knife' || itemName.includes('dagger') || itemName.includes('dirk') ||
      itemName.includes('stiletto') || itemName.includes('kukri') || itemName.includes('kris') ||
      itemName.includes('tanto') || itemName.includes('sai') || itemName.includes('katar') ||
      itemName.includes('karambit') || itemName.includes('main gauche')) {
    return 'dagger';
  }

  // Spears and polearms
  if (group === 'spear' || group === 'polearm' || itemName.includes('spear') ||
      itemName.includes('pike') || itemName.includes('lance') || itemName.includes('javelin') ||
      itemName.includes('trident') || itemName.includes('partisan') || itemName.includes('glaive') ||
      itemName.includes('halberd') || itemName.includes('naginata') || itemName.includes('ranseur') ||
      itemName.includes('fauchard')) {
    return 'spear';
  }

  // Axes
  if (group === 'axe' || itemName.includes('axe') || itemName.includes('hatchet') ||
      itemName.includes('tomahawk') || itemName.includes('bardiche') || itemName.includes('poleaxe')) {
    return 'axe';
  }

  // Hammers, maces, clubs, flails
  if (group === 'club' || group === 'hammer' || group === 'flail' ||
      itemName.includes('hammer') || itemName.includes('mace') || itemName.includes('maul') ||
      itemName.includes('club') || itemName.includes('cudgel') || itemName.includes('morningstar') ||
      itemName.includes('flail') || itemName.includes('quarterstaff') || itemName.includes('staff') ||
      itemName.includes('baton') || itemName.includes('shillelagh')) {
    return 'hammer';
  }

  // Swords (check last as it's the most common/default)
  if (group === 'sword' || itemName.includes('sword') || itemName.includes('blade') ||
      itemName.includes('rapier') || itemName.includes('scimitar') || itemName.includes('katana') ||
      itemName.includes('falchion') || itemName.includes('saber') || itemName.includes('cutlass') ||
      itemName.includes('longsword') || itemName.includes('shortsword') || itemName.includes('greatsword') ||
      itemName.includes('broadsword') || itemName.includes('claymore')) {
    return 'sword';
  }

  return null;
}

/**
 * Get size of an actor
 * @param {Object} actor - PF2e actor
 * @returns {string} Size (tiny, small, medium, large, huge, gargantuan)
 */
export function getActorSize(actor) {
  if (!actor) return 'medium';

  const size = actor.system?.traits?.size?.value || actor.system?.traits?.size;

  if (typeof size === 'string') {
    return size.toLowerCase();
  }

  return 'medium';
}

/**
 * Get size difference category between attacker and target
 * @param {Object} attacker - Attacker actor
 * @param {Object} target - Target actor
 * @returns {string} Size difference (same, larger, smaller, much-larger, much-smaller)
 */
export function getSizeDifference(attacker, target) {
  if (!attacker || !target) return 'same';

  const sizeOrder = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];
  const attackerSize = getActorSize(attacker);
  const targetSize = getActorSize(target);

  const attackerIndex = sizeOrder.indexOf(attackerSize);
  const targetIndex = sizeOrder.indexOf(targetSize);

  if (attackerIndex === -1 || targetIndex === -1) return 'same';

  const difference = attackerIndex - targetIndex;

  if (difference === 0) return 'same';
  if (difference >= 2) return 'much-larger';
  if (difference === 1) return 'larger';
  if (difference <= -2) return 'much-smaller';
  if (difference === -1) return 'smaller';

  return 'same';
}

/**
 * Check if an attack is non-lethal
 * @param {Object} item - PF2e item
 * @param {Object} message - Optional chat message
 * @returns {boolean} True if non-lethal
 */
export function isNonLethalAttack(item, message = null) {
  if (!item) return false;

  const traits = Array.isArray(item.system?.traits?.value) ? item.system.traits.value : [];
  const itemName = item.name?.toLowerCase() || '';

  // Check for nonlethal trait
  if (traits.includes('nonlethal')) {
    return true;
  }

  // Check item name for non-lethal indicators
  if (itemName.includes('nonlethal') || itemName.includes('non-lethal')) {
    return true;
  }

  // Check if it's a fist/unarmed attack (typically non-lethal by default)
  if (itemName.includes('fist') && !itemName.includes('spiked')) {
    return true;
  }

  // Check message flags for non-lethal context
  if (message?.flags?.pf2e?.context?.options?.includes('nonlethal')) {
    return true;
  }

  return false;
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
 * Get size modifier phrase for a size difference
 * @param {string} sizeDifference - Size difference category (much-larger, larger, much-smaller, smaller, same)
 * @param {string} varietyMode - Variety setting
 * @returns {Promise<string|null>} Size modifier phrase or null if same size
 */
export async function getSizeModifier(sizeDifference, varietyMode = 'high') {
  if (sizeDifference === 'same' || !sizeDifference) {
    return null;
  }

  const modifiers = await DataLoader.loadSizeModifiers(sizeDifference);
  if (!modifiers || !Array.isArray(modifiers) || modifiers.length === 0) {
    return null;
  }

  const category = `size-modifier:${sizeDifference}`;
  return RandomUtils.selectRandom(modifiers, varietyMode, category);
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
