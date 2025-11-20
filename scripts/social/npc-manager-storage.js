/**
 * NPC Manager Storage System
 * Handles persistent storage and retrieval of generated NPCs
 *
 * @module npc-manager-storage
 */

export class NPCManagerStorage {

  static STORAGE_KEY = "npcManagerData";
  static VERSION = "1.0.0";

  /**
   * Initialize storage system
   */
  static initialize() {
    console.log("NPCManagerStorage | Initializing storage system");

    // Register game setting for NPC storage
    try {
      game.settings.register("pf2e-narrative-seeds", this.STORAGE_KEY, {
        name: "NPC Manager Data",
        scope: "world",
        config: false,
        type: Object,
        default: {
          version: this.VERSION,
          npcs: {},
          families: {},
          factions: {},
          relationships: [],
          nextId: 1
        }
      });
    } catch (error) {
      console.error("NPCManagerStorage | Failed to register storage setting:", error);
    }
  }

  /**
   * Get all stored data
   * @returns {Object}
   */
  static getData() {
    try {
      return game.settings.get("pf2e-narrative-seeds", this.STORAGE_KEY);
    } catch (error) {
      console.error("NPCManagerStorage | Failed to get data:", error);
      return {
        version: this.VERSION,
        npcs: {},
        families: {},
        factions: {},
        relationships: [],
        nextId: 1
      };
    }
  }

  /**
   * Save all data
   * @param {Object} data
   */
  static async saveData(data) {
    try {
      await game.settings.set("pf2e-narrative-seeds", this.STORAGE_KEY, data);
      return true;
    } catch (error) {
      console.error("NPCManagerStorage | Failed to save data:", error);
      return false;
    }
  }

  /**
   * Generate unique ID
   * @returns {Promise<string>}
   */
  static async generateId() {
    const data = this.getData();
    const id = `npc-${data.nextId}`;
    data.nextId++;
    await this.saveData(data);
    return id;
  }

  // ============================================================================
  // NPC OPERATIONS
  // ============================================================================

  /**
   * Save an NPC
   * @param {Object} npc - NPC data
   * @returns {Promise<string>} NPC ID
   */
  static async saveNPC(npc) {
    const data = this.getData();

    // Generate ID if not present
    if (!npc.id) {
      npc.id = await this.generateId();
    }

    // Add metadata
    npc.savedAt = Date.now();
    npc.version = this.VERSION;

    // Store NPC
    data.npcs[npc.id] = npc;

    await this.saveData(data);
    console.log(`NPCManagerStorage | Saved NPC: ${npc.name} (${npc.id})`);

    return npc.id;
  }

  /**
   * Get an NPC by ID
   * @param {string} id
   * @returns {Object|null}
   */
  static getNPC(id) {
    const data = this.getData();
    return data.npcs[id] || null;
  }

  /**
   * Get all NPCs
   * @returns {Array<Object>}
   */
  static getAllNPCs() {
    const data = this.getData();
    return Object.values(data.npcs);
  }

  /**
   * Update an NPC
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<boolean>}
   */
  static async updateNPC(id, updates) {
    const data = this.getData();

    if (!data.npcs[id]) {
      console.warn(`NPCManagerStorage | NPC not found: ${id}`);
      return false;
    }

    // Merge updates
    data.npcs[id] = {
      ...data.npcs[id],
      ...updates,
      updatedAt: Date.now()
    };

    await this.saveData(data);
    console.log(`NPCManagerStorage | Updated NPC: ${id}`);

    return true;
  }

  /**
   * Delete an NPC
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async deleteNPC(id) {
    const data = this.getData();

    if (!data.npcs[id]) {
      console.warn(`NPCManagerStorage | NPC not found: ${id}`);
      return false;
    }

    delete data.npcs[id];

    // Remove related relationships
    data.relationships = data.relationships.filter(
      rel => rel.npc1 !== id && rel.npc2 !== id
    );

    await this.saveData(data);
    console.log(`NPCManagerStorage | Deleted NPC: ${id}`);

    return true;
  }

  /**
   * Search NPCs
   * @param {Object} criteria
   * @returns {Array<Object>}
   */
  static searchNPCs(criteria = {}) {
    const npcs = this.getAllNPCs();

    return npcs.filter(npc => {
      // Filter by name
      if (criteria.name) {
        const searchName = criteria.name.toLowerCase();
        if (!npc.name.toLowerCase().includes(searchName)) {
          return false;
        }
      }

      // Filter by ancestry
      if (criteria.ancestry) {
        if (npc.ancestry !== criteria.ancestry) {
          return false;
        }
      }

      // Filter by tags
      if (criteria.tags && criteria.tags.length > 0) {
        if (!npc.tags || !criteria.tags.some(tag => npc.tags.includes(tag))) {
          return false;
        }
      }

      // Filter by occupation
      if (criteria.occupation) {
        if (!npc.occupation || !npc.occupation.profession) {
          return false;
        }
        const searchOccupation = criteria.occupation.toLowerCase();
        const npcOccupation = npc.occupation.profession.name.toLowerCase();
        if (!npcOccupation.includes(searchOccupation)) {
          return false;
        }
      }

      return true;
    });
  }

  // ============================================================================
  // FAMILY OPERATIONS
  // ============================================================================

  /**
   * Save a family
   * @param {Object} family
   * @returns {Promise<string>}
   */
  static async saveFamily(family) {
    const data = this.getData();

    if (!family.id) {
      family.id = `family-${data.nextId}`;
      data.nextId++;
    }

    family.savedAt = Date.now();
    data.families[family.id] = family;

    await this.saveData(data);
    console.log(`NPCManagerStorage | Saved family: ${family.surname} (${family.id})`);

    return family.id;
  }

  /**
   * Get a family by ID
   * @param {string} id
   * @returns {Object|null}
   */
  static getFamily(id) {
    const data = this.getData();
    return data.families[id] || null;
  }

  /**
   * Get all families
   * @returns {Array<Object>}
   */
  static getAllFamilies() {
    const data = this.getData();
    return Object.values(data.families);
  }

  /**
   * Get families for an NPC
   * @param {string} npcId
   * @returns {Array<Object>}
   */
  static getFamiliesForNPC(npcId) {
    const families = this.getAllFamilies();
    return families.filter(family =>
      family.members && family.members.includes(npcId)
    );
  }

  // ============================================================================
  // FACTION OPERATIONS
  // ============================================================================

  /**
   * Save a faction
   * @param {Object} faction
   * @returns {Promise<string>}
   */
  static async saveFaction(faction) {
    const data = this.getData();

    if (!faction.id) {
      faction.id = `faction-${data.nextId}`;
      data.nextId++;
    }

    faction.savedAt = Date.now();
    data.factions[faction.id] = faction;

    await this.saveData(data);
    console.log(`NPCManagerStorage | Saved faction: ${faction.name} (${faction.id})`);

    return faction.id;
  }

  /**
   * Get a faction by ID
   * @param {string} id
   * @returns {Object|null}
   */
  static getFaction(id) {
    const data = this.getData();
    return data.factions[id] || null;
  }

  /**
   * Get all factions
   * @returns {Array<Object>}
   */
  static getAllFactions() {
    const data = this.getData();
    return Object.values(data.factions);
  }

  /**
   * Get factions for an NPC
   * @param {string} npcId
   * @returns {Array<Object>}
   */
  static getFactionsForNPC(npcId) {
    const factions = this.getAllFactions();
    return factions.filter(faction =>
      faction.members && faction.members.includes(npcId)
    );
  }

  // ============================================================================
  // RELATIONSHIP OPERATIONS
  // ============================================================================

  /**
   * Add a relationship between two NPCs
   * @param {string} npc1Id
   * @param {string} npc2Id
   * @param {string} type
   * @param {Object} metadata
   * @returns {Promise<boolean>}
   */
  static async addRelationship(npc1Id, npc2Id, type, metadata = {}) {
    const data = this.getData();

    // Check if relationship already exists
    const existing = data.relationships.find(
      rel => (rel.npc1 === npc1Id && rel.npc2 === npc2Id) ||
             (rel.npc1 === npc2Id && rel.npc2 === npc1Id)
    );

    if (existing) {
      console.warn(`NPCManagerStorage | Relationship already exists between ${npc1Id} and ${npc2Id}`);
      return false;
    }

    data.relationships.push({
      npc1: npc1Id,
      npc2: npc2Id,
      type,
      metadata,
      createdAt: Date.now()
    });

    await this.saveData(data);
    console.log(`NPCManagerStorage | Added ${type} relationship between ${npc1Id} and ${npc2Id}`);

    return true;
  }

  /**
   * Get relationships for an NPC
   * @param {string} npcId
   * @returns {Array<Object>}
   */
  static getRelationships(npcId) {
    const data = this.getData();
    return data.relationships.filter(
      rel => rel.npc1 === npcId || rel.npc2 === npcId
    );
  }

  /**
   * Remove a relationship
   * @param {string} npc1Id
   * @param {string} npc2Id
   * @returns {Promise<boolean>}
   */
  static async removeRelationship(npc1Id, npc2Id) {
    const data = this.getData();

    const index = data.relationships.findIndex(
      rel => (rel.npc1 === npc1Id && rel.npc2 === npc2Id) ||
             (rel.npc1 === npc2Id && rel.npc2 === npc1Id)
    );

    if (index === -1) {
      console.warn(`NPCManagerStorage | Relationship not found between ${npc1Id} and ${npc2Id}`);
      return false;
    }

    data.relationships.splice(index, 1);
    await this.saveData(data);

    return true;
  }

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  /**
   * Export all data as JSON
   * @returns {string}
   */
  static exportData() {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   * @param {string} jsonString
   * @returns {Promise<boolean>}
   */
  static async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Validate data structure
      if (!data.npcs || !data.families || !data.factions) {
        console.error("NPCManagerStorage | Invalid import data structure");
        return false;
      }

      await this.saveData(data);
      console.log("NPCManagerStorage | Data imported successfully");

      return true;
    } catch (error) {
      console.error("NPCManagerStorage | Failed to import data:", error);
      return false;
    }
  }

  /**
   * Clear all data
   * @returns {Promise<boolean>}
   */
  static async clearAll() {
    const data = {
      version: this.VERSION,
      npcs: {},
      families: {},
      factions: {},
      relationships: [],
      nextId: 1
    };

    await this.saveData(data);
    console.log("NPCManagerStorage | All data cleared");

    return true;
  }

  /**
   * Get statistics
   * @returns {Object}
   */
  static getStats() {
    const data = this.getData();

    return {
      totalNPCs: Object.keys(data.npcs).length,
      totalFamilies: Object.keys(data.families).length,
      totalFactions: Object.keys(data.factions).length,
      totalRelationships: data.relationships.length,
      version: data.version
    };
  }
}
