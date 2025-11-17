/**
 * PF2e Narrative Seeds - Skill Action Detector
 * Detects which skill action was used from PF2e message flags
 *
 * @module skill/action-detector
 * @author Justin Hutchinson
 */

/**
 * Skill action detector
 * Identifies which encounter mode skill action was performed
 */
export class ActionDetector {

  /**
   * Supported skill actions
   * Maps to data files in data/skill/actions/
   */
  static SUPPORTED_ACTIONS = [
    'demoralize',
    'tumble-through',
    'grapple',
    'trip',
    'shove',
    'disarm',
    'feint',
    'create-diversion',
    'hide',
    'sneak',
    'escape',
    'climb',
    'swim',
    'high-jump',
    'long-jump',
    'balance',
    'force-open',
    'recall-knowledge',
    'steal',
    'palm-object',
    'pick-lock',
    'disable-device',
    'request',
    'command-animal',
    'perform'
  ];

  /**
   * Detect action from message
   * @param {ChatMessage} message - PF2e chat message
   * @returns {string|null} Action slug (e.g., "demoralize", "tumble-through")
   */
  static detectAction(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return null;

    const context = flags.context;
    if (!context) return null;

    // Method 1: Check context.action directly
    if (context.action) {
      const normalized = this.normalizeActionSlug(context.action);
      if (this.SUPPORTED_ACTIONS.includes(normalized)) {
        return normalized;
      }
    }

    // Method 2: Check context.options array for action: prefix
    if (context.options && Array.isArray(context.options)) {
      const actionOption = context.options.find(opt =>
        typeof opt === 'string' && opt.startsWith("action:")
      );

      if (actionOption) {
        const normalized = this.normalizeActionSlug(
          actionOption.replace("action:", "")
        );
        if (this.SUPPORTED_ACTIONS.includes(normalized)) {
          return normalized;
        }
      }
    }

    // Method 3: Check item slug/name
    const origin = flags.origin;
    if (origin?.uuid) {
      const item = this.getItemFromUuid(origin.uuid);
      if (item) {
        const normalized = this.normalizeActionSlug(item.slug || item.name);
        if (this.SUPPORTED_ACTIONS.includes(normalized)) {
          return normalized;
        }
      }
    }

    return null;
  }

  /**
   * Normalize action slug to consistent format
   * Handles spaces, underscores, capitalization
   * @param {string} slug - Raw action name/slug
   * @returns {string} Normalized slug
   */
  static normalizeActionSlug(slug) {
    if (!slug) return '';

    return slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')      // Spaces to hyphens
      .replace(/_/g, '-')        // Underscores to hyphens
      .replace(/[()]/g, '');     // Remove parentheses
  }

  /**
   * Check if message is a skill action we support
   * @param {ChatMessage} message - PF2e chat message
   * @returns {boolean} True if this is a supported skill action
   */
  static isSkillAction(message) {
    const action = this.detectAction(message);
    return action !== null;
  }

  /**
   * Get skill used for action
   * @param {ChatMessage} message - PF2e chat message
   * @returns {string|null} Skill name (e.g., "intimidation", "athletics")
   */
  static getSkill(message) {
    const context = message.flags?.pf2e?.context;
    if (!context) return null;

    // Try multiple possible locations
    return context.skill ||
           context.statistic ||
           context.skillName ||
           this.inferSkillFromAction(this.detectAction(message));
  }

  /**
   * Infer skill from action if not explicitly provided
   * @param {string} actionSlug - Action slug
   * @returns {string|null} Inferred skill name
   */
  static inferSkillFromAction(actionSlug) {
    const skillMap = {
      'demoralize': 'intimidation',
      'tumble-through': 'acrobatics',
      'grapple': 'athletics',
      'trip': 'athletics',
      'shove': 'athletics',
      'disarm': 'athletics',
      'climb': 'athletics',
      'swim': 'athletics',
      'high-jump': 'athletics',
      'long-jump': 'athletics',
      'force-open': 'athletics',
      'escape': 'athletics', // Can also be acrobatics
      'feint': 'deception',
      'create-diversion': 'deception',
      'hide': 'stealth',
      'sneak': 'stealth',
      'balance': 'acrobatics',
      'steal': 'thievery',
      'palm-object': 'thievery',
      'pick-lock': 'thievery',
      'disable-device': 'thievery',
      'request': 'diplomacy',
      'command-animal': 'nature',
      'perform': 'performance',
      'recall-knowledge': null // Can be many skills
    };

    return skillMap[actionSlug] || null;
  }

  /**
   * Get action traits
   * @param {string} actionSlug - Action slug
   * @returns {Array<string>} Action traits
   */
  static getActionTraits(actionSlug) {
    const traitMap = {
      'demoralize': ['auditory', 'concentrate', 'emotion', 'mental'],
      'tumble-through': ['move'],
      'grapple': ['attack'],
      'trip': ['attack'],
      'shove': ['attack'],
      'disarm': ['attack'],
      'feint': ['mental'],
      'create-diversion': ['mental'],
      'hide': ['secret'],
      'sneak': ['move', 'secret'],
      'escape': ['attack'],
      'climb': ['move'],
      'swim': ['move'],
      'high-jump': ['move'],
      'long-jump': ['move'],
      'balance': ['move'],
      'force-open': ['attack'],
      'steal': ['manipulate'],
      'palm-object': ['manipulate'],
      'pick-lock': ['manipulate'],
      'disable-device': ['manipulate'],
      'request': ['auditory', 'concentrate', 'linguistic', 'mental'],
      'command-animal': ['auditory', 'concentrate'],
      'perform': ['concentrate'],
      'recall-knowledge': ['concentrate', 'secret']
    };

    return traitMap[actionSlug] || [];
  }

  /**
   * Get item from UUID
   * @param {string} uuid - Item UUID
   * @returns {Object|null} Item data
   */
  static getItemFromUuid(uuid) {
    try {
      // Use Foundry's fromUuidSync if available
      if (typeof fromUuidSync !== 'undefined') {
        return fromUuidSync(uuid);
      }

      // Fallback: parse UUID manually
      const parts = uuid.split('.');
      if (parts.length >= 4) {
        const actorId = parts[1];
        const itemId = parts[3];
        const actor = game.actors.get(actorId);
        return actor?.items.get(itemId);
      }
    } catch (error) {
      console.warn("Failed to get item from UUID:", uuid, error);
    }

    return null;
  }

  /**
   * Debug action detection
   * Logs detailed information about action detection
   * @param {ChatMessage} message - PF2e chat message
   */
  static debugDetection(message) {
    console.group("🎯 Skill Action Detection Debug");

    const action = this.detectAction(message);
    console.log("Action detected:", action || "NONE");

    const skill = this.getSkill(message);
    console.log("Skill used:", skill || "UNKNOWN");

    const traits = action ? this.getActionTraits(action) : [];
    console.log("Action traits:", traits);

    const flags = message.flags?.pf2e;
    console.log("PF2e context:", flags?.context);
    console.log("PF2e origin:", flags?.origin);

    if (flags?.context?.options) {
      console.log("Roll options:", flags.context.options);
    }

    console.groupEnd();
  }
}
