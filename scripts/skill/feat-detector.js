/**
 * PF2e Narrative Seeds - Feat Detector
 * Detects character feats that modify skill actions
 *
 * @module skill/feat-detector
 * @author Justin Hutchinson
 */

/**
 * Feat detector
 * Identifies character feats that modify skill action narratives
 */
export class FeatDetector {

  // Cache of actor feats for performance
  static featCache = new Map();
  static CACHE_TIMEOUT = 60000; // 1 minute

  /**
   * Feat mappings: which feats affect which actions
   */
  static FEAT_ACTION_MAP = {
    // Intimidation feats
    'intimidating-glare': ['demoralize'],
    'battle-cry': ['demoralize'],
    'intimidating-prowess': ['demoralize'],
    'terrified-retreat': ['demoralize'],
    'scare-to-death': ['demoralize'],

    // Athletics feats
    'titan-wrestler': ['grapple', 'shove', 'trip', 'disarm'],
    'combat-climber': ['climb'],
    'quick-swim': ['swim'],
    'quick-jump': ['high-jump', 'long-jump'],
    'powerful-leap': ['high-jump', 'long-jump'],
    'cloud-jump': ['high-jump', 'long-jump'],

    // Acrobatics feats
    'steady-balance': ['balance'],
    'kip-up': ['stand'], // Not a skill action but related
    'nimble-crawl': ['crawl'],

    // Deception feats
    'confabulator': ['feint', 'create-diversion'],
    'lengthy-diversion': ['create-diversion'],

    // Stealth feats
    'terrain-stalker': ['hide', 'sneak'],
    'swift-sneak': ['sneak'],

    // Thievery feats
    'pickpocket': ['steal', 'palm-object'],
    'subtle-theft': ['steal', 'palm-object'],

    // Assurance feats (apply to all actions using that skill)
    'assurance-athletics': ['grapple', 'shove', 'trip', 'disarm', 'climb', 'swim', 'high-jump', 'long-jump', 'force-open', 'escape'],
    'assurance-acrobatics': ['tumble-through', 'balance', 'escape'],
    'assurance-intimidation': ['demoralize'],
    'assurance-deception': ['feint', 'create-diversion'],
    'assurance-stealth': ['hide', 'sneak'],
    'assurance-thievery': ['steal', 'palm-object', 'pick-lock', 'disable-device'],
    'assurance-diplomacy': ['request'],
    'assurance-performance': ['perform']
  };

  /**
   * Detect feats from message
   * @param {ChatMessage} message - PF2e chat message
   * @param {string} actionSlug - Action being performed
   * @returns {Array<string>} Array of feat slugs that apply
   */
  static detectFeats(message, actionSlug) {
    const actor = this.getActorFromMessage(message);
    if (!actor) return [];

    // Get relevant feats for this action
    const relevantFeats = this.getRelevantFeats(actionSlug);
    if (relevantFeats.length === 0) return [];

    // Get actor's feats
    const actorFeats = this.getActorFeats(actor);

    // Return intersection
    return relevantFeats.filter(feat => actorFeats.has(feat));
  }

  /**
   * Get actor from message
   * @param {ChatMessage} message - PF2e chat message
   * @returns {Actor|null} Actor object
   */
  static getActorFromMessage(message) {
    const actorId = message.speaker?.actor;
    if (!actorId || !game?.actors) return null;

    return game.actors.get(actorId);
  }

  /**
   * Get actor's feats (cached for performance)
   * @param {Actor} actor - PF2e actor
   * @returns {Set<string>} Set of feat slugs
   */
  static getActorFeats(actor) {
    const cacheKey = actor.id;
    const cached = this.featCache.get(cacheKey);

    // Check cache
    if (cached && Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
      return cached.feats;
    }

    // Build feat set
    const feats = new Set();

    // Validate actor.items is iterable
    if (!actor.items || typeof actor.items[Symbol.iterator] !== 'function') {
      console.warn('PF2e Narrative Seeds | actor.items is not iterable');
      return feats;
    }

    for (const item of actor.items) {
      if (item.type === 'feat') {
        const slug = this.normalizeFeatSlug(item.slug || item.name);
        feats.add(slug);

        // Also check for Assurance feats by name pattern
        if (item.name.toLowerCase().startsWith('assurance')) {
          const assuranceSlug = this.parseAssuranceFeat(item.name);
          if (assuranceSlug) {
            feats.add(assuranceSlug);
          }
        }
      }
    }

    // Cache it
    this.featCache.set(cacheKey, {
      feats: feats,
      timestamp: Date.now()
    });

    return feats;
  }

  /**
   * Parse Assurance feat name to get skill
   * @param {string} featName - Feat name (e.g., "Assurance (Athletics)")
   * @returns {string|null} Assurance feat slug (e.g., "assurance-athletics")
   */
  static parseAssuranceFeat(featName) {
    const match = featName.match(/Assurance\s*\(([^)]+)\)/i);
    if (match) {
      const skill = match[1].toLowerCase().trim();
      return `assurance-${skill}`;
    }
    return null;
  }

  /**
   * Get feats relevant to an action
   * @param {string} actionSlug - Action slug
   * @returns {Array<string>} Array of feat slugs that could affect this action
   */
  static getRelevantFeats(actionSlug) {
    const relevantFeats = [];

    for (const [featSlug, actions] of Object.entries(this.FEAT_ACTION_MAP)) {
      if (actions.includes(actionSlug)) {
        relevantFeats.push(featSlug);
      }
    }

    return relevantFeats;
  }

  /**
   * Normalize feat slug to consistent format
   * @param {string} slug - Raw feat slug/name
   * @returns {string} Normalized slug
   */
  static normalizeFeatSlug(slug) {
    if (!slug) return '';

    return slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/[()]/g, '');
  }

  /**
   * Check if actor has specific feat
   * @param {Actor} actor - PF2e actor
   * @param {string} featSlug - Feat slug to check
   * @returns {boolean} True if actor has feat
   */
  static hasFeat(actor, featSlug) {
    const feats = this.getActorFeats(actor);
    return feats.has(this.normalizeFeatSlug(featSlug));
  }

  /**
   * Get feat display name
   * @param {string} featSlug - Feat slug
   * @returns {string} Human-readable feat name
   */
  static getFeatDisplayName(featSlug) {
    const displayNames = {
      'intimidating-glare': 'Intimidating Glare',
      'battle-cry': 'Battle Cry',
      'intimidating-prowess': 'Intimidating Prowess',
      'terrified-retreat': 'Terrified Retreat',
      'scare-to-death': 'Scare to Death',
      'titan-wrestler': 'Titan Wrestler',
      'combat-climber': 'Combat Climber',
      'quick-swim': 'Quick Swim',
      'quick-jump': 'Quick Jump',
      'powerful-leap': 'Powerful Leap',
      'cloud-jump': 'Cloud Jump',
      'steady-balance': 'Steady Balance',
      'kip-up': 'Kip Up',
      'nimble-crawl': 'Nimble Crawl',
      'confabulator': 'Confabulator',
      'lengthy-diversion': 'Lengthy Diversion',
      'terrain-stalker': 'Terrain Stalker',
      'swift-sneak': 'Swift Sneak',
      'pickpocket': 'Pickpocket',
      'subtle-theft': 'Subtle Theft',
      'assurance-athletics': 'Assurance (Athletics)',
      'assurance-acrobatics': 'Assurance (Acrobatics)',
      'assurance-intimidation': 'Assurance (Intimidation)',
      'assurance-deception': 'Assurance (Deception)',
      'assurance-stealth': 'Assurance (Stealth)',
      'assurance-thievery': 'Assurance (Thievery)',
      'assurance-diplomacy': 'Assurance (Diplomacy)',
      'assurance-performance': 'Assurance (Performance)'
    };

    return displayNames[featSlug] || featSlug;
  }

  /**
   * Check if feat changes action traits
   * E.g., Intimidating Glare removes auditory, adds visual
   * @param {string} featSlug - Feat slug
   * @returns {Object} {add: [], remove: []}
   */
  static getFeatTraitModifications(featSlug) {
    const modifications = {
      'intimidating-glare': {
        remove: ['auditory'],
        add: ['visual']
      },
      'battle-cry': {
        add: ['free-action'] // Special case: can be used as free action
      }
      // Add more as needed
    };

    return modifications[featSlug] || { add: [], remove: [] };
  }

  /**
   * Clear feat cache for actor or all actors
   * @param {Actor|null} actor - Actor to clear cache for, or null for all
   */
  static clearCache(actor = null) {
    if (actor) {
      this.featCache.delete(actor.id);
    } else {
      this.featCache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  static getCacheStats() {
    return {
      size: this.featCache.size,
      timeout: this.CACHE_TIMEOUT,
      entries: Array.from(this.featCache.keys())
    };
  }

  /**
   * Debug feat detection
   * @param {Actor} actor - PF2e actor
   * @param {string} actionSlug - Action being performed
   */
  static debugDetection(actor, actionSlug) {
    console.group("🎖️ Feat Detection Debug");

    console.log("Actor:", actor.name);
    console.log("Action:", actionSlug);

    const allFeats = this.getActorFeats(actor);
    console.log("All actor feats:", Array.from(allFeats));

    const relevantFeats = this.getRelevantFeats(actionSlug);
    console.log("Relevant feats for action:", relevantFeats);

    const detectedFeats = relevantFeats.filter(feat => allFeats.has(feat));
    console.log("Detected feats:", detectedFeats);

    if (detectedFeats.length > 0) {
      console.log("Feat modifications:");
      detectedFeats.forEach(feat => {
        const mods = this.getFeatTraitModifications(feat);
        console.log(`  ${feat}:`, mods);
      });
    }

    console.groupEnd();
  }
}
