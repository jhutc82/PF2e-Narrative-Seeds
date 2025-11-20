/**
 * NPC Manager Application
 * Comprehensive UI for managing generated NPCs
 *
 * @module npc-manager-app
 */

import { NPCManagerStorage } from './npc-manager-storage.js';
import { NPCGenerator } from './npc-generator.js';
import { FamilyGenerator } from './family-generator.js';
import { FactionGenerator } from './faction-generator.js';

export class NPCManagerApp extends Application {

  constructor(options = {}) {
    super(options);

    this.currentView = "list"; // list, generate, detail
    this.currentNPC = null;
    this.searchQuery = "";
    this.filterAncestry = "all";
    this.filterTags = [];
    this.sortBy = "name"; // name, ancestry, date
    this.sortOrder = "asc"; // asc, desc
  }

  /**
   * Default options for this application
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "npc-manager",
      title: "NPC Manager",
      template: "modules/pf2e-narrative-seeds/templates/npc-manager.html",
      classes: ["pf2e-narrative-seeds", "npc-manager"],
      width: 900,
      height: 700,
      resizable: true,
      tabs: [{
        navSelector: ".tabs",
        contentSelector: ".content",
        initial: "list"
      }]
    });
  }

  /**
   * Get data for rendering
   */
  getData() {
    const data = super.getData();

    // Get all NPCs
    const allNPCs = NPCManagerStorage.getAllNPCs();

    // Apply filters
    let filteredNPCs = this.filterNPCs(allNPCs);

    // Apply sorting
    filteredNPCs = this.sortNPCs(filteredNPCs);

    // Get statistics
    const stats = NPCManagerStorage.getStats();

    // Get all ancestries for filter dropdown
    const ancestries = this.getUniqueAncestries(allNPCs);

    // Get generation options
    const generationOptions = this.getGenerationOptions();

    // Current NPC data (if viewing detail)
    let currentNPCData = null;
    if (this.currentNPC) {
      currentNPCData = this.prepareNPCDetailData(this.currentNPC);
    }

    return {
      ...data,
      currentView: this.currentView,
      npcs: filteredNPCs,
      currentNPC: currentNPCData,
      stats,
      ancestries,
      generationOptions,
      searchQuery: this.searchQuery,
      filterAncestry: this.filterAncestry,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
  }

  /**
   * Activate event listeners
   */
  activateListeners(html) {
    super.activateListeners(html);

    // View switching
    html.find('[data-view]').click(this._onViewChange.bind(this));

    // List view actions
    html.find('.npc-item').click(this._onNPCSelect.bind(this));
    html.find('.delete-npc').click(this._onNPCDelete.bind(this));
    html.find('.search-input').on('input', this._onSearchInput.bind(this));
    html.find('.filter-ancestry').change(this._onAncestryFilter.bind(this));
    html.find('.sort-by').change(this._onSortChange.bind(this));
    html.find('.export-all').click(this._onExportAll.bind(this));
    html.find('.import-data').click(this._onImportData.bind(this));
    html.find('.clear-all').click(this._onClearAll.bind(this));

    // Generation view actions
    html.find('.generate-npc-btn').click(this._onGenerateNPC.bind(this));
    html.find('.random-ancestry').click(this._onRandomAncestry.bind(this));
    html.find('.ancestry-select').change(this._onAncestrySelectChange.bind(this));

    // Detail view actions
    html.find('.edit-field').on('input', this._onFieldEdit.bind(this));
    html.find('.save-npc').click(this._onSaveNPC.bind(this));
    html.find('.back-to-list').click(this._onBackToList.bind(this));
    html.find('.regenerate-trait').click(this._onRegenerateTrait.bind(this));
    html.find('.add-tag').click(this._onAddTag.bind(this));
    html.find('.remove-tag').click(this._onRemoveTag.bind(this));
    html.find('.export-npc').click(this._onExportNPC.bind(this));
    html.find('.create-actor').click(this._onCreateActor.bind(this));

    // Related NPCs
    html.find('.related-npc-stub').click(this._onRelatedNPCClick.bind(this));
    html.find('.generate-related').click(this._onGenerateRelated.bind(this));

    // Family/Faction management
    html.find('.add-to-family').click(this._onAddToFamily.bind(this));
    html.find('.add-to-faction').click(this._onAddToFaction.bind(this));
    html.find('.create-family').click(this._onCreateFamily.bind(this));
    html.find('.create-faction').click(this._onCreateFaction.bind(this));
  }

  // ============================================================================
  // VIEW MANAGEMENT
  // ============================================================================

  /**
   * Handle view change
   */
  async _onViewChange(event) {
    event.preventDefault();
    const view = event.currentTarget.dataset.view;

    this.currentView = view;

    if (view === "list") {
      this.currentNPC = null;
    }

    this.render();
  }

  /**
   * Switch to detail view
   */
  async viewNPCDetail(npcId) {
    const npc = NPCManagerStorage.getNPC(npcId);
    if (!npc) {
      ui.notifications.error("NPC not found!");
      return;
    }

    this.currentNPC = npc;
    this.currentView = "detail";
    this.render();
  }

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  /**
   * Filter NPCs
   */
  filterNPCs(npcs) {
    return npcs.filter(npc => {
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const name = (npc.name || "").toLowerCase();
        const occupation = (npc.occupation?.profession?.name || "").toLowerCase();

        if (!name.includes(query) && !occupation.includes(query)) {
          return false;
        }
      }

      // Ancestry filter
      if (this.filterAncestry !== "all") {
        if (npc.ancestry !== this.filterAncestry) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort NPCs
   */
  sortNPCs(npcs) {
    return npcs.sort((a, b) => {
      let aVal, bVal;

      switch (this.sortBy) {
        case "name":
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
          break;
        case "ancestry":
          aVal = (a.ancestry || "").toLowerCase();
          bVal = (b.ancestry || "").toLowerCase();
          break;
        case "date":
          aVal = a.savedAt || 0;
          bVal = b.savedAt || 0;
          break;
        default:
          return 0;
      }

      if (this.sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  /**
   * Get unique ancestries from NPCs
   */
  getUniqueAncestries(npcs) {
    const ancestrySet = new Set(npcs.map(npc => npc.ancestry).filter(Boolean));
    return ["all", ...Array.from(ancestrySet).sort()];
  }

  // ============================================================================
  // EVENT HANDLERS - LIST VIEW
  // ============================================================================

  /**
   * Handle NPC selection
   */
  async _onNPCSelect(event) {
    event.preventDefault();
    const npcId = event.currentTarget.dataset.npcId;
    await this.viewNPCDetail(npcId);
  }

  /**
   * Handle NPC deletion
   */
  async _onNPCDelete(event) {
    event.preventDefault();
    event.stopPropagation();

    const npcId = event.currentTarget.dataset.npcId;
    const npc = NPCManagerStorage.getNPC(npcId);

    if (!npc) {
      ui.notifications.error("NPC not found!");
      return;
    }

    const confirmed = await Dialog.confirm({
      title: "Delete NPC",
      content: `<p>Are you sure you want to delete <strong>${npc.name}</strong>?</p><p>This action cannot be undone.</p>`,
      yes: () => true,
      no: () => false
    });

    if (confirmed) {
      await NPCManagerStorage.deleteNPC(npcId);
      ui.notifications.info(`${npc.name} has been deleted.`);
      this.render();
    }
  }

  /**
   * Handle search input
   */
  _onSearchInput(event) {
    this.searchQuery = event.target.value;
    this.render();
  }

  /**
   * Handle ancestry filter
   */
  _onAncestryFilter(event) {
    this.filterAncestry = event.target.value;
    this.render();
  }

  /**
   * Handle sort change
   */
  _onSortChange(event) {
    const value = event.target.value;
    const [sortBy, sortOrder] = value.split("-");
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.render();
  }

  /**
   * Handle export all
   */
  async _onExportAll(event) {
    event.preventDefault();

    const data = NPCManagerStorage.exportData();
    const filename = `npc-manager-export-${Date.now()}.json`;

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    ui.notifications.info("Data exported successfully!");
  }

  /**
   * Handle import data
   */
  async _onImportData(event) {
    event.preventDefault();

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const jsonString = event.target.result;
        const success = await NPCManagerStorage.importData(jsonString);

        if (success) {
          ui.notifications.info("Data imported successfully!");
          this.render();
        } else {
          ui.notifications.error("Failed to import data. Check console for details.");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  /**
   * Handle clear all
   */
  async _onClearAll(event) {
    event.preventDefault();

    const confirmed = await Dialog.confirm({
      title: "Clear All Data",
      content: "<p>Are you sure you want to delete ALL NPCs, families, and factions?</p><p><strong>This action cannot be undone!</strong></p>",
      yes: () => true,
      no: () => false
    });

    if (confirmed) {
      await NPCManagerStorage.clearAll();
      ui.notifications.warning("All data has been cleared.");
      this.render();
    }
  }

  // ============================================================================
  // EVENT HANDLERS - GENERATION VIEW
  // ============================================================================

  /**
   * Get generation options
   */
  getGenerationOptions() {
    return {
      ancestries: [
        "human", "elf", "dwarf", "gnome", "halfling", "goblin", "orc", "half-elf", "half-orc",
        "leshy", "catfolk", "lizardfolk", "tengu", "kobold", "ratfolk", "grippli", "hobgoblin",
        "anadi", "android", "aphorite", "automaton", "azarketi", "beastkin", "changeling",
        "conrasu", "dhampir", "duskwalker", "fetchling", "fleshwarp", "ganzi", "geniekin",
        "ghoran", "gnoll", "goloma", "ifrit", "kitsune", "nagaji", "oread", "poppet",
        "reflection", "shisk", "shoony", "skeleton", "sprite", "strix", "suli", "sylph",
        "tiefling", "undine", "vanara", "vishkanya"
      ].sort(),
      genders: ["male", "female", "nonbinary", "random"],
      detailLevels: [
        { value: "minimal", label: "Minimal" },
        { value: "standard", label: "Standard" },
        { value: "detailed", label: "Detailed" },
        { value: "cinematic", label: "Cinematic" }
      ]
    };
  }

  /**
   * Handle NPC generation
   */
  async _onGenerateNPC(event) {
    event.preventDefault();

    const form = event.target.closest("form");
    const formData = new FormData(form);

    // Build generation parameters
    const params = {};

    const ancestry = formData.get("ancestry");
    if (ancestry && ancestry !== "random") {
      params.ancestry = ancestry;
    }

    const gender = formData.get("gender");
    if (gender && gender !== "random") {
      params.gender = gender;
    }

    const detailLevel = formData.get("detailLevel");
    if (detailLevel) {
      params.detailLevel = detailLevel;
    }

    // Show loading notification
    ui.notifications.info("Generating NPC...");

    try {
      // Generate NPC
      const npc = await NPCGenerator.generate(params);

      // Save to storage
      const npcId = await NPCManagerStorage.saveNPC(npc);

      ui.notifications.info(`Generated ${npc.name}!`);

      // Switch to detail view
      await this.viewNPCDetail(npcId);

    } catch (error) {
      console.error("Failed to generate NPC:", error);
      ui.notifications.error("Failed to generate NPC. Check console for details.");
    }
  }

  /**
   * Handle random ancestry selection
   */
  _onRandomAncestry(event) {
    event.preventDefault();

    const ancestrySelect = event.target.closest("form").querySelector('[name="ancestry"]');
    const options = this.getGenerationOptions().ancestries;
    const randomAncestry = options[Math.floor(Math.random() * options.length)];

    ancestrySelect.value = randomAncestry;
  }

  /**
   * Handle ancestry select change
   */
  _onAncestrySelectChange(event) {
    // Optional: Could add preview or additional options based on ancestry
  }

  // ============================================================================
  // EVENT HANDLERS - DETAIL VIEW
  // ============================================================================

  /**
   * Prepare NPC data for detail view
   */
  prepareNPCDetailData(npc) {
    return {
      ...npc,
      // Get related NPCs
      relatedNPCs: this.getRelatedNPCs(npc),
      // Get families
      families: NPCManagerStorage.getFamiliesForNPC(npc.id),
      // Get factions
      factions: NPCManagerStorage.getFactionsForNPC(npc.id),
      // Get relationships
      relationships: NPCManagerStorage.getRelationships(npc.id)
    };
  }

  /**
   * Get related NPCs (from relationships data in NPC)
   */
  getRelatedNPCs(npc) {
    const related = [];

    // Family members
    if (npc.relationships?.family) {
      for (const member of npc.relationships.family) {
        related.push({
          type: "family",
          relationship: member.relationship,
          name: member.name,
          ancestry: member.ancestry || npc.ancestry,
          age: member.age,
          isGenerated: false,
          stub: member
        });
      }
    }

    // Allies
    if (npc.relationships?.allies) {
      for (const ally of npc.relationships.allies) {
        related.push({
          type: "ally",
          relationship: ally.relationship,
          name: ally.name,
          ancestry: ally.ancestry,
          isGenerated: false,
          stub: ally
        });
      }
    }

    // Enemies
    if (npc.relationships?.enemies) {
      for (const enemy of npc.relationships.enemies) {
        related.push({
          type: "enemy",
          relationship: enemy.relationship,
          name: enemy.name,
          ancestry: enemy.ancestry,
          isGenerated: false,
          stub: enemy
        });
      }
    }

    return related;
  }

  /**
   * Handle field edit
   */
  _onFieldEdit(event) {
    const field = event.target.dataset.field;
    const value = event.target.value;

    if (!this.currentNPC) return;

    // Update current NPC data (in memory)
    foundry.utils.setProperty(this.currentNPC, field, value);
  }

  /**
   * Handle save NPC
   */
  async _onSaveNPC(event) {
    event.preventDefault();

    if (!this.currentNPC) return;

    await NPCManagerStorage.updateNPC(this.currentNPC.id, this.currentNPC);
    ui.notifications.info(`${this.currentNPC.name} saved!`);
  }

  /**
   * Handle back to list
   */
  _onBackToList(event) {
    event.preventDefault();
    this.currentNPC = null;
    this.currentView = "list";
    this.render();
  }

  /**
   * Handle regenerate trait
   */
  async _onRegenerateTrait(event) {
    event.preventDefault();

    const trait = event.target.dataset.trait;

    ui.notifications.info("Regenerating trait...");

    try {
      // Generate new NPC with same basic parameters
      const params = {
        ancestry: this.currentNPC.ancestry,
        gender: this.currentNPC.gender,
        detailLevel: this.currentNPC.detailLevel
      };

      const newNPC = await NPCGenerator.generate(params);

      // Copy the specific trait
      if (foundry.utils.hasProperty(newNPC, trait)) {
        const newValue = foundry.utils.getProperty(newNPC, trait);
        foundry.utils.setProperty(this.currentNPC, trait, newValue);

        await NPCManagerStorage.updateNPC(this.currentNPC.id, this.currentNPC);
        ui.notifications.info("Trait regenerated!");
        this.render();
      }

    } catch (error) {
      console.error("Failed to regenerate trait:", error);
      ui.notifications.error("Failed to regenerate trait.");
    }
  }

  /**
   * Handle add tag
   */
  async _onAddTag(event) {
    event.preventDefault();

    const tag = await this._promptForText("Add Tag", "Enter a tag:");
    if (!tag) return;

    if (!this.currentNPC.tags) {
      this.currentNPC.tags = [];
    }

    if (!this.currentNPC.tags.includes(tag)) {
      this.currentNPC.tags.push(tag);
      await NPCManagerStorage.updateNPC(this.currentNPC.id, this.currentNPC);
      this.render();
    }
  }

  /**
   * Handle remove tag
   */
  async _onRemoveTag(event) {
    event.preventDefault();

    const tag = event.target.dataset.tag;

    if (this.currentNPC.tags) {
      this.currentNPC.tags = this.currentNPC.tags.filter(t => t !== tag);
      await NPCManagerStorage.updateNPC(this.currentNPC.id, this.currentNPC);
      this.render();
    }
  }

  /**
   * Handle export NPC
   */
  _onExportNPC(event) {
    event.preventDefault();

    if (!this.currentNPC) return;

    const data = JSON.stringify(this.currentNPC, null, 2);
    const filename = `npc-${this.currentNPC.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    ui.notifications.info("NPC exported!");
  }

  /**
   * Handle create actor
   */
  async _onCreateActor(event) {
    event.preventDefault();

    if (!this.currentNPC) return;

    try {
      const actorData = {
        name: this.currentNPC.name,
        type: "npc",
        system: {
          details: {
            level: { value: this.currentNPC.abilities?.level || 1 },
            ancestry: { value: this.currentNPC.ancestry },
            background: { value: this.currentNPC.occupation?.profession?.name || "" }
          }
        }
      };

      const actor = await Actor.create(actorData);
      ui.notifications.info(`Actor created: ${actor.name}`);

      // Open actor sheet
      actor.sheet.render(true);

    } catch (error) {
      console.error("Failed to create actor:", error);
      ui.notifications.error("Failed to create actor.");
    }
  }

  // ============================================================================
  // EVENT HANDLERS - RELATED NPCs
  // ============================================================================

  /**
   * Handle related NPC click (view stub info)
   */
  _onRelatedNPCClick(event) {
    event.preventDefault();

    const stubData = event.target.dataset.stub;
    if (!stubData) return;

    const stub = JSON.parse(stubData);

    // Show stub information in a dialog
    new Dialog({
      title: stub.name,
      content: `
        <div class="related-npc-info">
          <p><strong>Relationship:</strong> ${stub.relationship}</p>
          <p><strong>Ancestry:</strong> ${stub.ancestry || "Unknown"}</p>
          ${stub.age ? `<p><strong>Age:</strong> ${stub.age}</p>` : ""}
          ${stub.description ? `<p><strong>Description:</strong> ${stub.description}</p>` : ""}
        </div>
      `,
      buttons: {
        generate: {
          icon: '<i class="fas fa-magic"></i>',
          label: "Generate Full NPC",
          callback: () => this._generateRelatedNPC(stub)
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: "Close"
        }
      }
    }).render(true);
  }

  /**
   * Handle generate related NPC
   */
  async _onGenerateRelated(event) {
    event.preventDefault();

    const stubData = event.target.dataset.stub;
    if (!stubData) return;

    const stub = JSON.parse(stubData);
    await this._generateRelatedNPC(stub);
  }

  /**
   * Generate related NPC from stub
   */
  async _generateRelatedNPC(stub) {
    ui.notifications.info(`Generating ${stub.name}...`);

    try {
      // Build generation parameters from stub
      const params = {
        detailLevel: this.currentNPC.detailLevel || "standard"
      };

      // Use stub data as constraints
      if (stub.ancestry) {
        params.ancestry = stub.ancestry;
      }

      if (stub.gender) {
        params.gender = stub.gender;
      }

      // Generate NPC
      const npc = await NPCGenerator.generate(params);

      // Override name if provided in stub
      if (stub.name) {
        npc.name = stub.name;
      }

      // Override age if provided
      if (stub.age) {
        npc.appearance.age = stub.age;
      }

      // Save NPC
      const npcId = await NPCManagerStorage.saveNPC(npc);

      // Create relationship between NPCs
      await NPCManagerStorage.addRelationship(
        this.currentNPC.id,
        npcId,
        stub.relationship,
        { type: stub.type }
      );

      ui.notifications.info(`Generated ${npc.name}!`);

      // Refresh view
      this.render();

    } catch (error) {
      console.error("Failed to generate related NPC:", error);
      ui.notifications.error("Failed to generate related NPC.");
    }
  }

  // ============================================================================
  // EVENT HANDLERS - FAMILIES & FACTIONS
  // ============================================================================

  /**
   * Handle add to family
   */
  async _onAddToFamily(event) {
    event.preventDefault();

    // Show dialog to select or create family
    const families = NPCManagerStorage.getAllFamilies();

    const familyOptions = families.map(f =>
      `<option value="${f.id}">${f.surname} (${f.type?.name || "Unknown"})</option>`
    ).join("");

    const content = `
      <form>
        <div class="form-group">
          <label>Family</label>
          <select name="familyId">
            <option value="">-- Create New Family --</option>
            ${familyOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Role in Family</label>
          <input type="text" name="role" placeholder="e.g., Parent, Child, Sibling"/>
        </div>
      </form>
    `;

    new Dialog({
      title: "Add to Family",
      content,
      buttons: {
        add: {
          icon: '<i class="fas fa-plus"></i>',
          label: "Add",
          callback: async (html) => {
            const familyId = html.find('[name="familyId"]').val();
            const role = html.find('[name="role"]').val();

            if (!familyId) {
              // Create new family
              await this._onCreateFamily(event);
            } else {
              // Add to existing family
              const family = NPCManagerStorage.getFamily(familyId);
              if (!family.members) family.members = [];
              family.members.push({
                npcId: this.currentNPC.id,
                role
              });
              await NPCManagerStorage.saveFamily(family);
              ui.notifications.info(`Added to ${family.surname} family`);
              this.render();
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "add"
    }).render(true);
  }

  /**
   * Handle create family
   */
  async _onCreateFamily(event) {
    event.preventDefault();

    const surname = await this._promptForText(
      "Create Family",
      "Enter family surname:",
      this.currentNPC.name.split(" ").pop()
    );

    if (!surname) return;

    try {
      const family = await FamilyGenerator.generate({
        surname,
        ancestry: this.currentNPC.ancestry
      });

      // Add current NPC as member
      family.members = [{ npcId: this.currentNPC.id, role: "Member" }];

      await NPCManagerStorage.saveFamily(family);
      ui.notifications.info(`Created ${surname} family!`);
      this.render();

    } catch (error) {
      console.error("Failed to create family:", error);
      ui.notifications.error("Failed to create family.");
    }
  }

  /**
   * Handle add to faction
   */
  async _onAddToFaction(event) {
    event.preventDefault();

    const factions = NPCManagerStorage.getAllFactions();

    const factionOptions = factions.map(f =>
      `<option value="${f.id}">${f.name} (${f.type?.name || "Unknown"})</option>`
    ).join("");

    const content = `
      <form>
        <div class="form-group">
          <label>Faction</label>
          <select name="factionId">
            <option value="">-- Create New Faction --</option>
            ${factionOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Rank/Role</label>
          <input type="text" name="rank" placeholder="e.g., Member, Leader, Officer"/>
        </div>
      </form>
    `;

    new Dialog({
      title: "Add to Faction",
      content,
      buttons: {
        add: {
          icon: '<i class="fas fa-plus"></i>',
          label: "Add",
          callback: async (html) => {
            const factionId = html.find('[name="factionId"]').val();
            const rank = html.find('[name="rank"]').val();

            if (!factionId) {
              // Create new faction
              await this._onCreateFaction(event);
            } else {
              // Add to existing faction
              const faction = NPCManagerStorage.getFaction(factionId);
              if (!faction.members) faction.members = [];
              faction.members.push({
                npcId: this.currentNPC.id,
                rank
              });
              await NPCManagerStorage.saveFaction(faction);
              ui.notifications.info(`Added to ${faction.name}`);
              this.render();
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "add"
    }).render(true);
  }

  /**
   * Handle create faction
   */
  async _onCreateFaction(event) {
    event.preventDefault();

    const name = await this._promptForText("Create Faction", "Enter faction name:");
    if (!name) return;

    try {
      const faction = await FactionGenerator.generate({ name });

      // Add current NPC as member
      faction.members = [{ npcId: this.currentNPC.id, rank: "Member" }];

      await NPCManagerStorage.saveFaction(faction);
      ui.notifications.info(`Created ${name}!`);
      this.render();

    } catch (error) {
      console.error("Failed to create faction:", error);
      ui.notifications.error("Failed to create faction.");
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Prompt for text input
   */
  async _promptForText(title, label, defaultValue = "") {
    return new Promise((resolve) => {
      new Dialog({
        title,
        content: `
          <form>
            <div class="form-group">
              <label>${label}</label>
              <input type="text" name="input" value="${defaultValue}" autofocus/>
            </div>
          </form>
        `,
        buttons: {
          ok: {
            icon: '<i class="fas fa-check"></i>',
            label: "OK",
            callback: (html) => {
              const value = html.find('[name="input"]').val();
              resolve(value);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => resolve(null)
          }
        },
        default: "ok",
        close: () => resolve(null)
      }).render(true);
    });
  }
}
