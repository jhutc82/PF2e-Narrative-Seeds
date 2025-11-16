/**
 * PF2e Narrative Seeds - Data Loader
 * Lazy loading and caching for combat data
 */

import { PerformanceMonitor } from './performance-monitor.js';

/**
 * Data loader with caching and lazy loading
 */
export class DataLoader {
  static cache = new Map();
  static loading = new Map(); // Track in-flight requests
  static MAX_CACHE_SIZE = 50; // Maximum cached data entries
  static MAX_CACHE_AGE = 600000; // 10 minutes
  static cacheTimestamps = new Map();

  /**
   * Load locations for a specific anatomy type
   * @param {string|Object} anatomy - Anatomy type (string) or anatomy object {base, modifiers}
   * @param {string} outcome - Outcome type (criticalSuccess, success, failure, criticalFailure)
   * @returns {Promise<Array<string>>} Array of location strings
   */
  static async loadLocations(anatomy, outcome) {
    // Handle both string anatomy and object anatomy {base, modifiers}
    const anatomyKey = typeof anatomy === 'string' ? anatomy : anatomy.base || anatomy.anatomyKey || 'humanoid';
    const cacheKey = `locations:${anatomyKey}:${outcome}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      PerformanceMonitor.recordCacheHit();
      return this.cache.get(cacheKey);
    }

    PerformanceMonitor.recordCacheMiss();

    // Check if already loading
    if (this.loading.has(cacheKey)) {
      return await this.loading.get(cacheKey);
    }

    // Load data
    const loadPromise = this.loadLocationData(anatomyKey, outcome);
    this.loading.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.setCacheData(cacheKey, data);
      return data;
    } finally {
      this.loading.delete(cacheKey);
    }
  }

  /**
   * Load location data from JSON file
   * @private
   */
  static async loadLocationData(anatomyKey, outcome) {
    return await PerformanceMonitor.measureAsync('data-load-locations', async () => {
      try {
        const response = await fetch(`modules/pf2e-narrative-seeds/data/combat/locations/${anatomyKey}.json`);
        if (!response.ok) {
          console.warn(`PF2e Narrative Seeds | Could not load locations for ${anatomyKey}, using fallback`);
          return await this.loadLocationData('humanoid', outcome);
        }
        const data = await response.json();
        return data[outcome] || [];
      } catch (error) {
        console.error(`PF2e Narrative Seeds | Error loading locations for ${anatomyKey}:`, error);
        // Fallback to humanoid if not humanoid
        if (anatomyKey !== 'humanoid') {
          return await this.loadLocationData('humanoid', outcome);
        }
        return [];
      }
    });
  }

  /**
   * Load damage descriptors for a specific damage type
   * @param {string} damageType - Damage type
   * @param {string} descriptorType - 'verbs' or 'effects'
   * @param {string} outcome - Outcome type
   * @returns {Promise<Array<string>>} Array of descriptor strings
   */
  static async loadDamageDescriptors(damageType, descriptorType, outcome) {
    const cacheKey = `damage:${damageType}:${descriptorType}:${outcome}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      PerformanceMonitor.recordCacheHit();
      return this.cache.get(cacheKey);
    }

    PerformanceMonitor.recordCacheMiss();

    // Check if already loading
    if (this.loading.has(cacheKey)) {
      return await this.loading.get(cacheKey);
    }

    // Load data
    const loadPromise = this.loadDamageData(damageType, descriptorType, outcome);
    this.loading.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.setCacheData(cacheKey, data);
      return data;
    } finally {
      this.loading.delete(cacheKey);
    }
  }

  /**
   * Load damage descriptor data from JSON file
   * @private
   */
  static async loadDamageData(damageType, descriptorType, outcome) {
    return await PerformanceMonitor.measureAsync('data-load-damage', async () => {
      try {
        const response = await fetch(`modules/pf2e-narrative-seeds/data/combat/damage/${damageType}.json`);
        if (!response.ok) {
          console.warn(`PF2e Narrative Seeds | Could not load damage data for ${damageType}`);
          return [];
        }
        const data = await response.json();
        return data[descriptorType]?.[outcome] || [];
      } catch (error) {
        console.error(`PF2e Narrative Seeds | Error loading damage data for ${damageType}:`, error);
        return [];
      }
    });
  }

  /**
   * Load opening sentences
   * @param {string} detailLevel - Detail level (minimal, standard, detailed, cinematic)
   * @param {string} outcome - Outcome type
   * @param {string} category - Optional category (e.g., 'ranged-bow', 'defense-armor')
   * @returns {Promise<Array<string>>} Array of opening sentences
   */
  static async loadOpenings(detailLevel, outcome, category = 'default') {
    const cacheKey = `openings:${category}:${detailLevel}:${outcome}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      PerformanceMonitor.recordCacheHit();
      return this.cache.get(cacheKey);
    }

    PerformanceMonitor.recordCacheMiss();

    // Check if already loading
    if (this.loading.has(cacheKey)) {
      return await this.loading.get(cacheKey);
    }

    // Load data
    const loadPromise = this.loadOpeningData(detailLevel, outcome, category);
    this.loading.set(cacheKey, loadPromise);

    try {
      const data = await loadPromise;
      this.setCacheData(cacheKey, data);
      return data;
    } finally {
      this.loading.delete(cacheKey);
    }
  }

  /**
   * Load opening sentence data from JSON file
   * @private
   */
  static async loadOpeningData(detailLevel, outcome, category) {
    return await PerformanceMonitor.measureAsync('data-load-openings', async () => {
      try {
        let response;

        // Determine which file to load based on category
        if (category.startsWith('ranged-')) {
          const weaponType = category.replace('ranged-', '');
          response = await fetch(`modules/pf2e-narrative-seeds/data/combat/openings/ranged/${weaponType}.json`);
        } else if (category.startsWith('defense-')) {
          const defenseType = category.replace('defense-', '');
          response = await fetch(`modules/pf2e-narrative-seeds/data/combat/openings/defense/${defenseType}.json`);
        } else {
          response = await fetch(`modules/pf2e-narrative-seeds/data/combat/openings/${detailLevel}.json`);
        }

        if (!response.ok) {
          console.warn(`PF2e Narrative Seeds | Could not load openings for ${category}/${detailLevel}`);
          return [];
        }

        const data = await response.json();
        return data[outcome] || [];
      } catch (error) {
        console.error(`PF2e Narrative Seeds | Error loading openings:`, error);
        return [];
      }
    });
  }

  /**
   * Load weapon type data
   * @param {string} damageType - Damage type
   * @returns {Promise<string>} Weapon type descriptor
   */
  static async loadWeaponType(damageType) {
    const cacheKey = `weapon-type:${damageType}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      PerformanceMonitor.recordCacheHit();
      return this.cache.get(cacheKey);
    }

    PerformanceMonitor.recordCacheMiss();

    return await PerformanceMonitor.measureAsync('data-load-weapon-type', async () => {
      try {
        const response = await fetch(`modules/pf2e-narrative-seeds/data/combat/damage/${damageType}.json`);
        if (!response.ok) {
          return "Your weapon";
        }
        const data = await response.json();
        const weaponType = data.weaponType || "Your weapon";
        this.setCacheData(cacheKey, weaponType);
        return weaponType;
      } catch (error) {
        console.error(`PF2e Narrative Seeds | Error loading weapon type:`, error);
        return "Your weapon";
      }
    });
  }

  /**
   * Set cache data with timestamp
   * @private
   */
  static setCacheData(key, data) {
    // Prune cache if needed
    this.pruneCache();

    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Prune cache based on size and age
   * @private
   */
  static pruneCache() {
    const now = Date.now();

    // Remove old entries
    for (const [key, timestamp] of this.cacheTimestamps) {
      if (now - timestamp > this.MAX_CACHE_AGE) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }

    // Limit size (LRU eviction)
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const toDelete = this.cache.size - this.MAX_CACHE_SIZE;
      const keys = Array.from(this.cache.keys()).slice(0, toDelete);
      keys.forEach(key => {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      });
    }
  }

  /**
   * Warm cache for common anatomy types
   * Pre-loads frequently used data
   */
  static async warmCache() {
    console.log("PF2e Narrative Seeds | Warming cache...");

    const commonAnatomies = ['humanoid', 'quadruped', 'giant'];
    const outcomes = ['criticalSuccess', 'success', 'failure', 'criticalFailure'];
    const commonDamageTypes = ['slashing', 'piercing', 'bludgeoning'];

    const promises = [];

    // Pre-load common locations
    for (const anatomy of commonAnatomies) {
      for (const outcome of outcomes) {
        promises.push(this.loadLocations(anatomy, outcome));
      }
    }

    // Pre-load common damage descriptors
    for (const damageType of commonDamageTypes) {
      for (const outcome of outcomes) {
        promises.push(this.loadDamageDescriptors(damageType, 'verbs', outcome));
        promises.push(this.loadDamageDescriptors(damageType, 'effects', outcome));
      }
    }

    // Pre-load standard openings
    for (const outcome of outcomes) {
      promises.push(this.loadOpenings('standard', outcome));
      promises.push(this.loadOpenings('detailed', outcome));
    }

    await Promise.all(promises);
    console.log("PF2e Narrative Seeds | Cache warmed with common data");
  }

  /**
   * Clear all cached data
   */
  static clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.loading.clear();
    console.log("PF2e Narrative Seeds | Cache cleared");
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      utilizationPercent: ((this.cache.size / this.MAX_CACHE_SIZE) * 100).toFixed(1),
      inFlight: this.loading.size
    };
  }
}
