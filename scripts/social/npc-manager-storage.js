/**
 * NPC Manager Storage System
 * Handles persistent storage and retrieval of generated NPCs
 *
 * @module npc-manager-storage
 */

export class NPCManagerStorage {

  static STORAGE_KEY = "npcManagerData";
  static VERSION = "2.0.0";
  static MAX_UNDO_HISTORY = 50;
  static MAX_BACKUPS = 5;
  static MAX_ERROR_LOG = 100;
  static SAVE_RETRY_ATTEMPTS = 3;
  static SAVE_RETRY_DELAY = 1000; // ms
  static ENABLE_COMPRESSION = true;
  static SEARCH_INDEX_CACHE = null;
  static SEARCH_INDEX_DIRTY = true;

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
          templates: {},
          savedSearches: {},
          encounters: {},
          sessionNotes: {},
          undoHistory: [],
          backups: [],
          errorLog: [],
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
      const data = game.settings.get("pf2e-narrative-seeds", this.STORAGE_KEY);
      // Migrate old data format if needed
      if (data.version !== this.VERSION) {
        return this.migrateData(data);
      }
      return data;
    } catch (error) {
      console.error("NPCManagerStorage | Failed to get data:", error);
      // Log the error
      this.logError('getData', error);
      return {
        version: this.VERSION,
        npcs: {},
        families: {},
        factions: {},
        relationships: [],
        templates: {},
        savedSearches: {},
        encounters: {},
        sessionNotes: {},
        undoHistory: [],
        backups: [],
        errorLog: [],
        nextId: 1
      };
    }
  }

  /**
   * Migrate data from old version
   * @param {Object} oldData
   * @returns {Object}
   */
  static migrateData(oldData) {
    console.log(`NPCManagerStorage | Migrating data from version ${oldData.version} to ${this.VERSION}`);

    // Create backup before migration
    this.createBackup(oldData, 'pre-migration');

    const migratedData = {
      ...oldData,
      version: this.VERSION,
      templates: oldData.templates || {},
      savedSearches: oldData.savedSearches || {},
      encounters: oldData.encounters || {},
      sessionNotes: oldData.sessionNotes || {},
      undoHistory: oldData.undoHistory || [],
      backups: oldData.backups || [],
      errorLog: oldData.errorLog || []
    };

    // Add new tracking fields to existing NPCs
    for (const npcId in migratedData.npcs) {
      const npc = migratedData.npcs[npcId];
      if (!npc.viewCount) npc.viewCount = 0;
      if (!npc.lastViewed) npc.lastViewed = null;
      if (!npc.archived) npc.archived = false;
      if (!npc.pinned) npc.pinned = false;
      if (!npc.color) npc.color = null;
      if (!npc.actorId) npc.actorId = null;
      if (!npc.journalId) npc.journalId = null;
    }

    return migratedData;
  }

  /**
   * Save all data with retry logic and validation
   * @param {Object} data
   * @param {number} attempt - Current retry attempt (internal use)
   * @returns {Promise<boolean>}
   */
  static async saveData(data, attempt = 1) {
    try {
      // Validate data before saving
      if (!this.validateData(data)) {
        throw new Error('Data validation failed');
      }

      await game.settings.set("pf2e-narrative-seeds", this.STORAGE_KEY, data);
      return true;
    } catch (error) {
      console.error(`NPCManagerStorage | Failed to save data (attempt ${attempt}):`, error);
      this.logError('saveData', error, { attempt });

      // Retry with exponential backoff
      if (attempt < this.SAVE_RETRY_ATTEMPTS) {
        const delay = this.SAVE_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`NPCManagerStorage | Retrying save in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.saveData(data, attempt + 1);
      }

      // All retries failed
      ui.notifications?.error('Failed to save NPC data. Please try again.');
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
   * @param {boolean} addToUndo - Whether to add to undo history
   * @returns {Promise<string>} NPC ID
   */
  static async saveNPC(npc, addToUndo = false) {
    const data = this.getData();

    // Generate ID if not present
    const isNew = !npc.id;
    if (!npc.id) {
      npc.id = await this.generateId();
    }

    // Add undo entry if this is an update
    if (addToUndo && !isNew && data.npcs[npc.id]) {
      this.addToUndoHistory({
        type: 'update',
        entityType: 'npc',
        entityId: npc.id,
        previousState: JSON.parse(JSON.stringify(data.npcs[npc.id]))
      });
    } else if (addToUndo && isNew) {
      this.addToUndoHistory({
        type: 'create',
        entityType: 'npc',
        entityId: npc.id
      });
    }

    // Add metadata
    npc.savedAt = npc.savedAt || Date.now();
    npc.updatedAt = Date.now();
    npc.version = this.VERSION;

    // Initialize tracking fields if not present
    if (!npc.viewCount) npc.viewCount = 0;
    if (!npc.lastViewed) npc.lastViewed = null;
    if (npc.archived === undefined) npc.archived = false;
    if (npc.pinned === undefined) npc.pinned = false;
    if (!npc.color) npc.color = null;
    if (!npc.actorId) npc.actorId = null;
    if (!npc.journalId) npc.journalId = null;

    // Store NPC
    data.npcs[npc.id] = npc;

    await this.saveData(data);
    this.onDataChanged(); // Invalidate caches
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
    this.onDataChanged(); // Invalidate caches
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
      totalTemplates: Object.keys(data.templates || {}).length,
      totalEncounters: Object.keys(data.encounters || {}).length,
      archivedNPCs: Object.values(data.npcs).filter(npc => npc.archived).length,
      pinnedNPCs: Object.values(data.npcs).filter(npc => npc.pinned).length,
      version: data.version
    };
  }

  // ============================================================================
  // VIEW TRACKING
  // ============================================================================

  /**
   * Record NPC view
   * @param {string} npcId
   * @returns {Promise<boolean>}
   */
  static async recordView(npcId) {
    const data = this.getData();

    if (!data.npcs[npcId]) {
      return false;
    }

    data.npcs[npcId].viewCount = (data.npcs[npcId].viewCount || 0) + 1;
    data.npcs[npcId].lastViewed = Date.now();

    await this.saveData(data);
    return true;
  }

  // ============================================================================
  // UNDO/REDO OPERATIONS
  // ============================================================================

  /**
   * Add action to undo history
   * @param {Object} action
   */
  static addToUndoHistory(action) {
    const data = this.getData();

    if (!data.undoHistory) {
      data.undoHistory = [];
    }

    data.undoHistory.push({
      ...action,
      timestamp: Date.now()
    });

    // Keep only last N actions
    if (data.undoHistory.length > this.MAX_UNDO_HISTORY) {
      data.undoHistory.shift();
    }
  }

  /**
   * Undo last action
   * @returns {Promise<boolean>}
   */
  static async undo() {
    const data = this.getData();

    if (!data.undoHistory || data.undoHistory.length === 0) {
      return false;
    }

    const action = data.undoHistory.pop();

    switch (action.type) {
      case 'create':
        // Remove the created entity
        if (action.entityType === 'npc') {
          delete data.npcs[action.entityId];
        }
        break;

      case 'update':
        // Restore previous state
        if (action.entityType === 'npc') {
          data.npcs[action.entityId] = action.previousState;
        }
        break;

      case 'delete':
        // Restore deleted entity
        if (action.entityType === 'npc') {
          data.npcs[action.entityId] = action.previousState;
        }
        break;
    }

    await this.saveData(data);
    return true;
  }

  /**
   * Clear undo history
   * @returns {Promise<boolean>}
   */
  static async clearUndoHistory() {
    const data = this.getData();
    data.undoHistory = [];
    await this.saveData(data);
    return true;
  }

  // ============================================================================
  // TEMPLATE OPERATIONS
  // ============================================================================

  /**
   * Save a template
   * @param {Object} template
   * @returns {Promise<string>}
   */
  static async saveTemplate(template) {
    const data = this.getData();

    if (!data.templates) {
      data.templates = {};
    }

    if (!template.id) {
      template.id = `template-${data.nextId}`;
      data.nextId++;
    }

    template.savedAt = Date.now();
    data.templates[template.id] = template;

    await this.saveData(data);
    console.log(`NPCManagerStorage | Saved template: ${template.name} (${template.id})`);

    return template.id;
  }

  /**
   * Get all templates
   * @returns {Array<Object>}
   */
  static getAllTemplates() {
    const data = this.getData();
    return Object.values(data.templates || {});
  }

  /**
   * Get template by ID
   * @param {string} id
   * @returns {Object|null}
   */
  static getTemplate(id) {
    const data = this.getData();
    return data.templates?.[id] || null;
  }

  /**
   * Delete template
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async deleteTemplate(id) {
    const data = this.getData();

    if (!data.templates?.[id]) {
      return false;
    }

    delete data.templates[id];
    await this.saveData(data);

    return true;
  }

  // ============================================================================
  // SAVED SEARCHES
  // ============================================================================

  /**
   * Save a search
   * @param {Object} search
   * @returns {Promise<string>}
   */
  static async saveSearch(search) {
    const data = this.getData();

    if (!data.savedSearches) {
      data.savedSearches = {};
    }

    if (!search.id) {
      search.id = `search-${data.nextId}`;
      data.nextId++;
    }

    search.savedAt = Date.now();
    data.savedSearches[search.id] = search;

    await this.saveData(data);
    return search.id;
  }

  /**
   * Get all saved searches
   * @returns {Array<Object>}
   */
  static getAllSavedSearches() {
    const data = this.getData();
    return Object.values(data.savedSearches || {});
  }

  /**
   * Delete saved search
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async deleteSavedSearch(id) {
    const data = this.getData();

    if (!data.savedSearches?.[id]) {
      return false;
    }

    delete data.savedSearches[id];
    await this.saveData(data);

    return true;
  }

  // ============================================================================
  // ENCOUNTER OPERATIONS
  // ============================================================================

  /**
   * Save an encounter
   * @param {Object} encounter
   * @returns {Promise<string>}
   */
  static async saveEncounter(encounter) {
    const data = this.getData();

    if (!data.encounters) {
      data.encounters = {};
    }

    if (!encounter.id) {
      encounter.id = `encounter-${data.nextId}`;
      data.nextId++;
    }

    encounter.savedAt = encounter.savedAt || Date.now();
    encounter.updatedAt = Date.now();
    data.encounters[encounter.id] = encounter;

    await this.saveData(data);
    return encounter.id;
  }

  /**
   * Get all encounters
   * @returns {Array<Object>}
   */
  static getAllEncounters() {
    const data = this.getData();
    return Object.values(data.encounters || {});
  }

  /**
   * Get encounters for NPC
   * @param {string} npcId
   * @returns {Array<Object>}
   */
  static getEncountersForNPC(npcId) {
    const encounters = this.getAllEncounters();
    return encounters.filter(enc =>
      enc.npcIds && enc.npcIds.includes(npcId)
    );
  }

  /**
   * Delete encounter
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async deleteEncounter(id) {
    const data = this.getData();

    if (!data.encounters?.[id]) {
      return false;
    }

    delete data.encounters[id];
    await this.saveData(data);

    return true;
  }

  // ============================================================================
  // SESSION NOTES
  // ============================================================================

  /**
   * Add session note for NPC
   * @param {string} npcId
   * @param {string} note
   * @param {string} sessionName
   * @returns {Promise<string>}
   */
  static async addSessionNote(npcId, note, sessionName) {
    const data = this.getData();

    if (!data.sessionNotes) {
      data.sessionNotes = {};
    }

    if (!data.sessionNotes[npcId]) {
      data.sessionNotes[npcId] = [];
    }

    const noteId = `note-${data.nextId}`;
    data.nextId++;

    data.sessionNotes[npcId].push({
      id: noteId,
      note,
      sessionName,
      timestamp: Date.now()
    });

    await this.saveData(data);
    return noteId;
  }

  /**
   * Get session notes for NPC
   * @param {string} npcId
   * @returns {Array<Object>}
   */
  static getSessionNotes(npcId) {
    const data = this.getData();
    return data.sessionNotes?.[npcId] || [];
  }

  /**
   * Delete session note
   * @param {string} npcId
   * @param {string} noteId
   * @returns {Promise<boolean>}
   */
  static async deleteSessionNote(npcId, noteId) {
    const data = this.getData();

    if (!data.sessionNotes?.[npcId]) {
      return false;
    }

    data.sessionNotes[npcId] = data.sessionNotes[npcId].filter(
      note => note.id !== noteId
    );

    await this.saveData(data);
    return true;
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk delete NPCs
   * @param {Array<string>} npcIds
   * @returns {Promise<number>}
   */
  static async bulkDeleteNPCs(npcIds) {
    const data = this.getData();

    // Create backup before bulk delete
    await this.createBackup(data, 'pre-bulk-delete');

    let deletedCount = 0;

    for (const id of npcIds) {
      if (data.npcs[id]) {
        delete data.npcs[id];
        deletedCount++;

        // Remove related relationships
        data.relationships = data.relationships.filter(
          rel => rel.npc1 !== id && rel.npc2 !== id
        );
      }
    }

    await this.saveData(data);
    this.onDataChanged(); // Invalidate caches
    console.log(`NPCManagerStorage | Bulk deleted ${deletedCount} NPCs`);

    return deletedCount;
  }

  /**
   * Bulk add tags to NPCs
   * @param {Array<string>} npcIds
   * @param {Array<string>} tags
   * @returns {Promise<number>}
   */
  static async bulkAddTags(npcIds, tags) {
    const data = this.getData();
    let updatedCount = 0;

    for (const id of npcIds) {
      if (data.npcs[id]) {
        if (!data.npcs[id].tags) {
          data.npcs[id].tags = [];
        }

        for (const tag of tags) {
          if (!data.npcs[id].tags.includes(tag)) {
            data.npcs[id].tags.push(tag);
          }
        }

        updatedCount++;
      }
    }

    await this.saveData(data);
    console.log(`NPCManagerStorage | Bulk added tags to ${updatedCount} NPCs`);

    return updatedCount;
  }

  /**
   * Bulk remove tags from NPCs
   * @param {Array<string>} npcIds
   * @param {Array<string>} tags
   * @returns {Promise<number>}
   */
  static async bulkRemoveTags(npcIds, tags) {
    const data = this.getData();
    let updatedCount = 0;

    for (const id of npcIds) {
      if (data.npcs[id] && data.npcs[id].tags) {
        data.npcs[id].tags = data.npcs[id].tags.filter(
          tag => !tags.includes(tag)
        );
        updatedCount++;
      }
    }

    await this.saveData(data);
    console.log(`NPCManagerStorage | Bulk removed tags from ${updatedCount} NPCs`);

    return updatedCount;
  }

  /**
   * Bulk archive NPCs
   * @param {Array<string>} npcIds
   * @param {boolean} archived
   * @returns {Promise<number>}
   */
  static async bulkArchive(npcIds, archived = true) {
    const data = this.getData();
    let updatedCount = 0;

    for (const id of npcIds) {
      if (data.npcs[id]) {
        data.npcs[id].archived = archived;
        updatedCount++;
      }
    }

    await this.saveData(data);
    console.log(`NPCManagerStorage | Bulk ${archived ? 'archived' : 'unarchived'} ${updatedCount} NPCs`);

    return updatedCount;
  }

  /**
   * Bulk export selected NPCs
   * @param {Array<string>} npcIds
   * @returns {string}
   */
  static bulkExportNPCs(npcIds) {
    const data = this.getData();
    const npcs = npcIds.map(id => data.npcs[id]).filter(Boolean);

    return JSON.stringify({
      version: this.VERSION,
      exportDate: Date.now(),
      npcs,
      relationships: data.relationships.filter(rel =>
        npcIds.includes(rel.npc1) && npcIds.includes(rel.npc2)
      )
    }, null, 2);
  }

  // ============================================================================
  // ADVANCED SEARCH
  // ============================================================================

  /**
   * Advanced search with multiple criteria
   * @param {Object} criteria
   * @returns {Array<Object>}
   */
  static advancedSearch(criteria) {
    const npcs = this.getAllNPCs();

    return npcs.filter(npc => {
      // Name search
      if (criteria.name) {
        const searchName = criteria.name.toLowerCase();
        if (!npc.name.toLowerCase().includes(searchName)) {
          return false;
        }
      }

      // Ancestry filter
      if (criteria.ancestries && criteria.ancestries.length > 0) {
        if (!criteria.ancestries.includes(npc.ancestry)) {
          return false;
        }
      }

      // Occupation filter
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

      // Tag filter (include)
      if (criteria.tags && criteria.tags.length > 0) {
        if (!npc.tags || !criteria.tags.some(tag => npc.tags.includes(tag))) {
          return false;
        }
      }

      // Exclude tags
      if (criteria.excludeTags && criteria.excludeTags.length > 0) {
        if (npc.tags && criteria.excludeTags.some(tag => npc.tags.includes(tag))) {
          return false;
        }
      }

      // Faction filter
      if (criteria.factionIds && criteria.factionIds.length > 0) {
        const npcFactions = this.getFactionsForNPC(npc.id);
        if (!npcFactions.some(f => criteria.factionIds.includes(f.id))) {
          return false;
        }
      }

      // Family filter
      if (criteria.familyIds && criteria.familyIds.length > 0) {
        const npcFamilies = this.getFamiliesForNPC(npc.id);
        if (!npcFamilies.some(f => criteria.familyIds.includes(f.id))) {
          return false;
        }
      }

      // Archived filter
      if (criteria.archived !== undefined) {
        if (npc.archived !== criteria.archived) {
          return false;
        }
      }

      // Pinned filter
      if (criteria.pinned !== undefined) {
        if (npc.pinned !== criteria.pinned) {
          return false;
        }
      }

      // Level range
      if (criteria.minLevel !== undefined || criteria.maxLevel !== undefined) {
        const level = npc.abilities?.level || 0;
        if (criteria.minLevel !== undefined && level < criteria.minLevel) {
          return false;
        }
        if (criteria.maxLevel !== undefined && level > criteria.maxLevel) {
          return false;
        }
      }

      // Search in personality/motivations
      if (criteria.traitSearch) {
        const searchTerm = criteria.traitSearch.toLowerCase();
        let found = false;

        // Search in personalities
        if (npc.personalities) {
          found = npc.personalities.some(p =>
            p.name?.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm)
          );
        }

        // Search in motivation
        if (!found && npc.motivation) {
          found = npc.motivation.name?.toLowerCase().includes(searchTerm) ||
                  npc.motivation.description?.toLowerCase().includes(searchTerm);
        }

        // Search in secrets
        if (!found && npc.secrets) {
          found = npc.secrets.some(s =>
            s.description?.toLowerCase().includes(searchTerm)
          );
        }

        if (!found) {
          return false;
        }
      }

      return true;
    });
  }

  // ============================================================================
  // UTILITY OPERATIONS - EXTENSIONS
  // ============================================================================

  /**
   * Duplicate an NPC
   * @param {string} npcId
   * @param {string} newName
   * @returns {Promise<string|null>}
   */
  static async duplicateNPC(npcId, newName) {
    const npc = this.getNPC(npcId);
    if (!npc) {
      return null;
    }

    const duplicate = JSON.parse(JSON.stringify(npc));
    delete duplicate.id;
    duplicate.name = newName || `${npc.name} (Copy)`;
    duplicate.savedAt = Date.now();
    duplicate.viewCount = 0;
    duplicate.lastViewed = null;

    return await this.saveNPC(duplicate);
  }

  /**
   * Find potential duplicates
   * @param {string} name
   * @returns {Array<Object>}
   */
  static findDuplicates(name) {
    const npcs = this.getAllNPCs();
    const searchName = name.toLowerCase().trim();

    return npcs.filter(npc =>
      npc.name.toLowerCase().trim() === searchName
    );
  }

  /**
   * Pin/Unpin NPC
   * @param {string} npcId
   * @param {boolean} pinned
   * @returns {Promise<boolean>}
   */
  static async setPinned(npcId, pinned) {
    const data = this.getData();

    if (!data.npcs[npcId]) {
      return false;
    }

    data.npcs[npcId].pinned = pinned;
    await this.saveData(data);

    return true;
  }

  /**
   * Set NPC color
   * @param {string} npcId
   * @param {string} color
   * @returns {Promise<boolean>}
   */
  static async setColor(npcId, color) {
    const data = this.getData();

    if (!data.npcs[npcId]) {
      return false;
    }

    data.npcs[npcId].color = color;
    await this.saveData(data);

    return true;
  }

  /**
   * Link NPC to actor
   * @param {string} npcId
   * @param {string} actorId
   * @returns {Promise<boolean>}
   */
  static async linkActor(npcId, actorId) {
    const data = this.getData();

    if (!data.npcs[npcId]) {
      return false;
    }

    data.npcs[npcId].actorId = actorId;
    await this.saveData(data);

    return true;
  }

  /**
   * Link NPC to journal
   * @param {string} npcId
   * @param {string} journalId
   * @returns {Promise<boolean>}
   */
  static async linkJournal(npcId, journalId) {
    const data = this.getData();

    if (!data.npcs[npcId]) {
      return false;
    }

    data.npcs[npcId].journalId = journalId;
    await this.saveData(data);

    return true;
  }

  /**
   * Export to CSV
   * @returns {string}
   */
  static exportToCSV() {
    const npcs = this.getAllNPCs();

    const headers = [
      'Name', 'Ancestry', 'Gender', 'Occupation', 'Level', 'Age',
      'Tags', 'Pinned', 'Archived', 'View Count', 'Last Viewed', 'Created'
    ];

    const rows = npcs.map(npc => [
      npc.name || '',
      npc.ancestry || '',
      npc.gender || '',
      npc.occupation?.profession?.name || '',
      npc.abilities?.level || '',
      npc.appearance?.age?.age || '',
      (npc.tags || []).join(';'),
      npc.pinned ? 'Yes' : 'No',
      npc.archived ? 'Yes' : 'No',
      npc.viewCount || 0,
      npc.lastViewed ? new Date(npc.lastViewed).toISOString() : '',
      npc.savedAt ? new Date(npc.savedAt).toISOString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Export NPC to markdown
   * @param {string} npcId
   * @returns {string|null}
   */
  static exportToMarkdown(npcId) {
    const npc = this.getNPC(npcId);
    if (!npc) {
      return null;
    }

    let markdown = `# ${npc.name}\n\n`;

    // Basic info
    markdown += `**Ancestry:** ${npc.ancestry}\n`;
    if (npc.gender) markdown += `**Gender:** ${npc.gender}\n`;
    if (npc.occupation?.profession?.name) {
      markdown += `**Occupation:** ${npc.occupation.profession.name}\n`;
    }
    if (npc.abilities?.level) {
      markdown += `**Level:** ${npc.abilities.level}\n`;
    }
    markdown += '\n';

    // Appearance
    if (npc.appearance) {
      markdown += '## Appearance\n\n';
      if (npc.appearance.age) {
        markdown += `**Age:** ${npc.appearance.age.age} (${npc.appearance.age.category})\n`;
      }
      if (npc.appearance.build) {
        markdown += `**Build:** ${npc.appearance.build.name}\n`;
      }
      if (npc.appearance.height) {
        markdown += `**Height:** ${npc.appearance.height.name}\n`;
      }
      if (npc.appearance.distinguishingFeatures) {
        markdown += `**Features:**\n`;
        npc.appearance.distinguishingFeatures.forEach(f => {
          markdown += `- ${f.description}\n`;
        });
      }
      markdown += '\n';
    }

    // Personality
    if (npc.personalities && npc.personalities.length > 0) {
      markdown += '## Personality\n\n';
      npc.personalities.forEach(p => {
        markdown += `**${p.name}:** ${p.description}\n`;
      });
      markdown += '\n';
    }

    // Motivation
    if (npc.motivation) {
      markdown += '## Motivation\n\n';
      markdown += `${npc.motivation.name}\n`;
      if (npc.motivation.description) {
        markdown += `${npc.motivation.description}\n`;
      }
      markdown += '\n';
    }

    // Tags
    if (npc.tags && npc.tags.length > 0) {
      markdown += `**Tags:** ${npc.tags.join(', ')}\n\n`;
    }

    return markdown;
  }

  // ============================================================================
  // ERROR HANDLING & RESILIENCE
  // ============================================================================

  /**
   * Log an error to the error log
   * @param {string} operation - Operation that failed
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  static logError(operation, error, context = {}) {
    try {
      const data = this.getData();
      if (!data.errorLog) data.errorLog = [];

      const errorEntry = {
        timestamp: Date.now(),
        operation,
        message: error.message,
        stack: error.stack,
        context,
        userAgent: navigator.userAgent,
        foundryVersion: game.version
      };

      data.errorLog.push(errorEntry);

      // Keep only recent errors
      if (data.errorLog.length > this.MAX_ERROR_LOG) {
        data.errorLog = data.errorLog.slice(-this.MAX_ERROR_LOG);
      }

      // Save without triggering validation to avoid recursion
      game.settings.set("pf2e-narrative-seeds", this.STORAGE_KEY, data).catch(e => {
        console.error('Failed to log error:', e);
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  /**
   * Get error log
   * @param {number} limit - Number of recent errors to return
   * @returns {Array}
   */
  static getErrorLog(limit = 50) {
    const data = this.getData();
    const errors = data.errorLog || [];
    return errors.slice(-limit);
  }

  /**
   * Clear error log
   */
  static async clearErrorLog() {
    const data = this.getData();
    data.errorLog = [];
    await this.saveData(data);
  }

  /**
   * Validate data structure
   * @param {Object} data
   * @returns {boolean}
   */
  static validateData(data) {
    try {
      // Check required top-level properties
      if (!data || typeof data !== 'object') {
        console.error('NPCManagerStorage | Data is not an object');
        return false;
      }

      if (!data.version) {
        console.error('NPCManagerStorage | Data missing version');
        return false;
      }

      if (!data.npcs || typeof data.npcs !== 'object') {
        console.error('NPCManagerStorage | Data missing or invalid npcs object');
        return false;
      }

      // Validate NPCs structure
      for (const [id, npc] of Object.entries(data.npcs)) {
        if (!npc.id || !npc.name) {
          console.error(`NPCManagerStorage | Invalid NPC ${id}: missing id or name`);
          return false;
        }
      }

      // Validate relationships array
      if (data.relationships && !Array.isArray(data.relationships)) {
        console.error('NPCManagerStorage | Relationships is not an array');
        return false;
      }

      return true;
    } catch (error) {
      console.error('NPCManagerStorage | Validation error:', error);
      return false;
    }
  }

  /**
   * Create automatic backup before major operations
   * @param {Object} dataToBackup - Data to backup (optional, uses current data if not provided)
   * @param {string} reason - Reason for backup
   * @returns {Promise<boolean>}
   */
  static async createBackup(dataToBackup = null, reason = 'manual') {
    try {
      const data = dataToBackup || this.getData();

      // Don't backup if no data yet
      if (!data.npcs || Object.keys(data.npcs).length === 0) {
        return false;
      }

      const backup = {
        timestamp: Date.now(),
        reason,
        version: data.version,
        npcCount: Object.keys(data.npcs || {}).length,
        data: JSON.parse(JSON.stringify(data)) // Deep clone
      };

      // Add to backups array
      if (!data.backups) data.backups = [];
      data.backups.push(backup);

      // Keep only recent backups
      if (data.backups.length > this.MAX_BACKUPS) {
        data.backups = data.backups.slice(-this.MAX_BACKUPS);
      }

      // Save without creating another backup (prevent recursion)
      await game.settings.set("pf2e-narrative-seeds", this.STORAGE_KEY, data);

      console.log(`NPCManagerStorage | Backup created: ${reason}`);
      return true;
    } catch (error) {
      console.error('NPCManagerStorage | Failed to create backup:', error);
      this.logError('createBackup', error, { reason });
      return false;
    }
  }

  /**
   * Restore from backup
   * @param {number} backupIndex - Index of backup to restore (0 = most recent)
   * @returns {Promise<boolean>}
   */
  static async restoreFromBackup(backupIndex = 0) {
    try {
      const data = this.getData();
      if (!data.backups || data.backups.length === 0) {
        ui.notifications?.warn('No backups available');
        return false;
      }

      const backups = data.backups.slice().reverse(); // Most recent first
      const backup = backups[backupIndex];

      if (!backup) {
        ui.notifications?.error('Backup not found');
        return false;
      }

      // Create a backup before restoring (in case restore goes wrong)
      await this.createBackup(data, 'pre-restore');

      // Restore the backup data
      const restoredData = backup.data;
      await this.saveData(restoredData);

      ui.notifications?.info(`Restored backup from ${new Date(backup.timestamp).toLocaleString()}`);
      console.log('NPCManagerStorage | Restored from backup:', backup.timestamp);
      return true;
    } catch (error) {
      console.error('NPCManagerStorage | Failed to restore backup:', error);
      this.logError('restoreFromBackup', error, { backupIndex });
      ui.notifications?.error('Failed to restore backup');
      return false;
    }
  }

  /**
   * Get list of available backups
   * @returns {Array}
   */
  static getBackups() {
    const data = this.getData();
    return (data.backups || []).map(backup => ({
      timestamp: backup.timestamp,
      reason: backup.reason,
      version: backup.version,
      npcCount: backup.npcCount,
      date: new Date(backup.timestamp).toLocaleString()
    }));
  }

  /**
   * Export data with validation
   * @returns {string} - JSON string of data
   */
  static exportDataSafe() {
    try {
      const data = this.getData();

      if (!this.validateData(data)) {
        throw new Error('Data validation failed before export');
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('NPCManagerStorage | Failed to export data:', error);
      this.logError('exportDataSafe', error);
      throw error;
    }
  }

  /**
   * Import data with validation
   * @param {string} jsonData - JSON string to import
   * @param {boolean} merge - Whether to merge with existing data or replace
   * @returns {Promise<boolean>}
   */
  static async importDataSafe(jsonData, merge = false) {
    try {
      // Parse JSON
      let importedData;
      try {
        importedData = JSON.parse(jsonData);
      } catch (error) {
        ui.notifications?.error('Invalid JSON data');
        return false;
      }

      // Validate imported data
      if (!this.validateData(importedData)) {
        ui.notifications?.error('Imported data failed validation');
        return false;
      }

      // Create backup before import
      await this.createBackup(this.getData(), 'pre-import');

      if (merge) {
        // Merge with existing data
        const currentData = this.getData();
        const mergedData = {
          ...currentData,
          npcs: { ...currentData.npcs, ...importedData.npcs },
          families: { ...currentData.families, ...importedData.families },
          factions: { ...currentData.factions, ...importedData.factions },
          relationships: [
            ...currentData.relationships,
            ...importedData.relationships.filter(r =>
              !currentData.relationships.some(cr =>
                cr.npc1 === r.npc1 && cr.npc2 === r.npc2 && cr.type === r.type
              )
            )
          ]
        };
        await this.saveData(mergedData);
      } else {
        // Replace all data
        await this.saveData(importedData);
      }

      ui.notifications?.info('Data imported successfully');
      console.log('NPCManagerStorage | Data imported');
      return true;
    } catch (error) {
      console.error('NPCManagerStorage | Failed to import data:', error);
      this.logError('importDataSafe', error);
      ui.notifications?.error('Failed to import data');
      return false;
    }
  }

  /**
   * Perform data integrity check
   * @returns {Object} - Report of integrity issues
   */
  static checkDataIntegrity() {
    const data = this.getData();
    const report = {
      healthy: true,
      issues: [],
      warnings: []
    };

    try {
      // Check for orphaned relationships
      const npcIds = new Set(Object.keys(data.npcs || {}));
      (data.relationships || []).forEach((rel, index) => {
        if (!npcIds.has(rel.npc1) || !npcIds.has(rel.npc2)) {
          report.issues.push(`Orphaned relationship at index ${index}: ${rel.npc1} <-> ${rel.npc2}`);
          report.healthy = false;
        }
      });

      // Check for duplicate NPC IDs
      const ids = Object.keys(data.npcs || {});
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicates.length > 0) {
        report.issues.push(`Duplicate NPC IDs: ${duplicates.join(', ')}`);
        report.healthy = false;
      }

      // Check for NPCs missing required fields
      Object.entries(data.npcs || {}).forEach(([id, npc]) => {
        if (!npc.name) {
          report.warnings.push(`NPC ${id} missing name`);
        }
        if (!npc.id) {
          report.warnings.push(`NPC ${id} missing id field`);
        }
      });

      // Check data size
      const dataSize = JSON.stringify(data).length;
      if (dataSize > 5000000) { // 5MB warning
        report.warnings.push(`Large data size: ${(dataSize / 1000000).toFixed(2)}MB`);
      }

    } catch (error) {
      report.healthy = false;
      report.issues.push(`Integrity check error: ${error.message}`);
      this.logError('checkDataIntegrity', error);
    }

    console.log('NPCManagerStorage | Integrity check:', report);
    return report;
  }

  /**
   * Repair data integrity issues
   * @returns {Promise<boolean>}
   */
  static async repairDataIntegrity() {
    try {
      const data = this.getData();

      // Create backup before repairs
      await this.createBackup(data, 'pre-repair');

      let repaired = false;

      // Remove orphaned relationships
      const npcIds = new Set(Object.keys(data.npcs || {}));
      const validRelationships = (data.relationships || []).filter(rel =>
        npcIds.has(rel.npc1) && npcIds.has(rel.npc2)
      );

      if (validRelationships.length !== (data.relationships || []).length) {
        data.relationships = validRelationships;
        repaired = true;
        console.log('NPCManagerStorage | Removed orphaned relationships');
      }

      // Fix NPCs missing IDs
      Object.entries(data.npcs || {}).forEach(([id, npc]) => {
        if (!npc.id) {
          npc.id = id;
          repaired = true;
        }
      });

      if (repaired) {
        await this.saveData(data);
        ui.notifications?.info('Data integrity issues repaired');
        console.log('NPCManagerStorage | Data repaired');
        return true;
      } else {
        ui.notifications?.info('No integrity issues found');
        return false;
      }
    } catch (error) {
      console.error('NPCManagerStorage | Failed to repair data:', error);
      this.logError('repairDataIntegrity', error);
      ui.notifications?.error('Failed to repair data');
      return false;
    }
  }

  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================

  /**
   * Build search index for fast lookups
   * @returns {Object} - Search index
   */
  static buildSearchIndex() {
    if (!this.SEARCH_INDEX_DIRTY && this.SEARCH_INDEX_CACHE) {
      return this.SEARCH_INDEX_CACHE;
    }

    const data = this.getData();
    const index = {
      byName: {},
      byAncestry: {},
      byOccupation: {},
      byTag: {},
      byFamily: {},
      byFaction: {},
      fullText: {}
    };

    // Index NPCs
    for (const [id, npc] of Object.entries(data.npcs || {})) {
      // Name index
      const nameLower = (npc.name || '').toLowerCase();
      if (!index.byName[nameLower]) index.byName[nameLower] = [];
      index.byName[nameLower].push(id);

      // Ancestry index
      const ancestry = (npc.ancestry || '').toLowerCase();
      if (!index.byAncestry[ancestry]) index.byAncestry[ancestry] = [];
      index.byAncestry[ancestry].push(id);

      // Occupation index
      const occupation = (npc.occupation?.profession?.name || '').toLowerCase();
      if (occupation) {
        if (!index.byOccupation[occupation]) index.byOccupation[occupation] = [];
        index.byOccupation[occupation].push(id);
      }

      // Tag index
      (npc.tags || []).forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (!index.byTag[tagLower]) index.byTag[tagLower] = [];
        index.byTag[tagLower].push(id);
      });

      // Build full-text search string
      const fullText = [
        npc.name,
        npc.ancestry,
        npc.gender,
        npc.occupation?.profession?.name,
        ...(npc.tags || []),
        npc.motivation?.name,
        ...(npc.personalities || []).map(p => p.name)
      ].filter(Boolean).join(' ').toLowerCase();

      index.fullText[id] = fullText;
    }

    this.SEARCH_INDEX_CACHE = index;
    this.SEARCH_INDEX_DIRTY = false;

    console.log('NPCManagerStorage | Search index built');
    return index;
  }

  /**
   * Mark search index as dirty (needs rebuilding)
   */
  static invalidateSearchIndex() {
    this.SEARCH_INDEX_DIRTY = true;
  }

  /**
   * Fuzzy search NPCs
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} - Matching NPC IDs with scores
   */
  static fuzzySearch(query, options = {}) {
    const {
      maxResults = 50,
      threshold = 0.3,
      searchFields = ['name', 'ancestry', 'occupation', 'tags']
    } = options;

    if (!query || query.length < 2) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const index = this.buildSearchIndex();
    const data = this.getData();
    const scores = {};

    // Search full text
    for (const [id, fullText] of Object.entries(index.fullText)) {
      const score = this.calculateFuzzyScore(queryLower, fullText);
      if (score >= threshold) {
        scores[id] = score;
      }
    }

    // Sort by score and limit results
    const results = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([id, score]) => ({
        id,
        score,
        npc: data.npcs[id]
      }));

    console.log(`NPCManagerStorage | Fuzzy search for "${query}" found ${results.length} results`);
    return results;
  }

  /**
   * Calculate fuzzy match score between query and text
   * @param {string} query
   * @param {string} text
   * @returns {number} - Score between 0 and 1
   */
  static calculateFuzzyScore(query, text) {
    // Simple scoring: check if query is substring, with bonuses for:
    // - Exact match at start
    // - Word boundary match
    // - Multiple word matches

    if (text.includes(query)) {
      if (text.startsWith(query)) {
        return 1.0; // Perfect match at start
      }
      if (text.includes(` ${query}`)) {
        return 0.9; // Word boundary match
      }
      return 0.7; // Substring match
    }

    // Check for partial word matches
    const queryWords = query.split(' ');
    const textWords = text.split(' ');
    let matchCount = 0;

    for (const qWord of queryWords) {
      for (const tWord of textWords) {
        if (tWord.includes(qWord) || qWord.includes(tWord)) {
          matchCount++;
          break;
        }
      }
    }

    if (matchCount > 0) {
      return Math.min(0.6, (matchCount / queryWords.length) * 0.6);
    }

    // Levenshtein distance for very fuzzy matching
    const distance = this.levenshteinDistance(query, text.substring(0, query.length * 2));
    const maxLength = Math.max(query.length, text.length);
    const similarity = 1 - (distance / maxLength);

    return similarity > 0.5 ? similarity * 0.4 : 0;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1
   * @param {string} str2
   * @returns {number}
   */
  static levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get NPCs in batches for virtual scrolling
   * @param {number} offset - Start index
   * @param {number} limit - Number of items
   * @param {Object} filters - Filter criteria
   * @returns {Array} - Batch of NPCs
   */
  static getNPCBatch(offset = 0, limit = 50, filters = {}) {
    let npcs = this.getAllNPCs();

    // Apply filters
    if (filters.search) {
      const searchResults = this.fuzzySearch(filters.search);
      const searchIds = new Set(searchResults.map(r => r.id));
      npcs = npcs.filter(npc => searchIds.has(npc.id));
    }

    if (filters.ancestry && filters.ancestry !== 'all') {
      npcs = npcs.filter(npc => npc.ancestry === filters.ancestry);
    }

    if (filters.tags && filters.tags.length > 0) {
      npcs = npcs.filter(npc =>
        filters.tags.some(tag => (npc.tags || []).includes(tag))
      );
    }

    if (filters.archived !== undefined) {
      npcs = npcs.filter(npc => npc.archived === filters.archived);
    }

    if (filters.pinned !== undefined) {
      npcs = npcs.filter(npc => npc.pinned === filters.pinned);
    }

    // Sort
    if (filters.sortBy) {
      npcs = this.sortNPCs(npcs, filters.sortBy, filters.sortOrder || 'asc');
    }

    // Return batch
    return {
      items: npcs.slice(offset, offset + limit),
      total: npcs.length,
      offset,
      limit
    };
  }

  /**
   * Sort NPCs array
   * @param {Array} npcs
   * @param {string} sortBy
   * @param {string} sortOrder
   * @returns {Array}
   */
  static sortNPCs(npcs, sortBy, sortOrder = 'asc') {
    const sorted = [...npcs].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'ancestry':
          aVal = (a.ancestry || '').toLowerCase();
          bVal = (b.ancestry || '').toLowerCase();
          break;
        case 'date':
          aVal = a.savedAt || 0;
          bVal = b.savedAt || 0;
          break;
        case 'viewCount':
          aVal = a.viewCount || 0;
          bVal = b.viewCount || 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Performance monitoring
   * @param {string} operation - Operation name
   * @param {Function} fn - Function to measure
   * @returns {Promise<any>} - Result of function
   */
  static async measurePerformance(operation, fn) {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      console.log(`NPCManagerStorage | ${operation} took ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`NPCManagerStorage | ${operation} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} - Performance stats
   */
  static getPerformanceMetrics() {
    const data = this.getData();
    const dataSize = JSON.stringify(data).length;

    return {
      npcCount: Object.keys(data.npcs || {}).length,
      familyCount: Object.keys(data.families || {}).length,
      factionCount: Object.keys(data.factions || {}).length,
      relationshipCount: (data.relationships || []).length,
      dataSize: dataSize,
      dataSizeMB: (dataSize / 1000000).toFixed(2),
      backupCount: (data.backups || []).length,
      errorCount: (data.errorLog || []).length,
      searchIndexCached: !this.SEARCH_INDEX_DIRTY,
      avgNPCSize: Object.keys(data.npcs || {}).length > 0
        ? (dataSize / Object.keys(data.npcs).length).toFixed(0)
        : 0
    };
  }

  /**
   * Invalidate caches when data changes
   */
  static onDataChanged() {
    this.invalidateSearchIndex();
  }
}
