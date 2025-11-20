/**
 * PF2e Narrative Seeds - Family Generator
 * Generates complete family structures with relationships
 */

import { RandomUtils } from '../utils.js';
import { DataLoader } from '../data-loader.js';

/**
 * Family generator - creates family networks
 */
export class FamilyGenerator {

  /**
   * Generate a complete family structure
   * @param {Object} params - Generation parameters
   * @param {string} params.type - Force specific family type
   * @param {string} params.surname - Family surname
   * @param {string} params.ancestry - Family ancestry
   * @returns {Promise<Object>} Generated family structure
   */
  static async generate(params = {}) {
    try {
      // Load family data
      const familyData = await DataLoader.loadJSON("data/social/families/family-structures.json");

      if (!familyData) {
        console.error("PF2e Narrative Seeds | Failed to load family data");
        return null;
      }

      // Select family type
      const familyType = params.type
        ? familyData.familyTypes.find(f => f.id === params.type)
        : RandomUtils.selectWeighted(familyData.familyTypes, "likelihood");

      // Generate family surname
      const surname = params.surname || this.generateSurname(params.ancestry);

      // Select family dynamic
      const dynamic = RandomUtils.selectWeighted(familyData.familyDynamics, "likelihood");

      // Select family secret (60% chance)
      const hasSecret = Math.random() < 0.6;
      const secret = hasSecret ? RandomUtils.selectWeighted(familyData.familySecrets, "likelihood") : null;

      // Select shared traits (2-4)
      const numTraits = Math.floor(Math.random() * 3) + 2;
      const sharedTraits = [];
      const availableTraits = [...familyData.sharedTraits];
      for (let i = 0; i < numTraits && availableTraits.length > 0; i++) {
        const trait = RandomUtils.selectWeighted(availableTraits, "likelihood");
        sharedTraits.push(trait);
        availableTraits.splice(availableTraits.indexOf(trait), 1);
      }

      // Select family traditions (1-2)
      const numTraditions = Math.random() < 0.6 ? 1 : 2;
      const traditions = [];
      for (let i = 0; i < numTraditions; i++) {
        traditions.push(RandomUtils.selectWeighted(familyData.familyTraditions, "likelihood"));
      }

      // Select family conflicts (0-2)
      const numConflicts = Math.floor(Math.random() * 3);
      const conflicts = [];
      for (let i = 0; i < numConflicts; i++) {
        conflicts.push(RandomUtils.selectWeighted(familyData.familyConflicts, "likelihood"));
      }

      // Determine family wealth level
      const wealthLevel = this.determineFamilyWealth();

      // Determine family reputation
      const reputation = this.generateFamilyReputation();

      return {
        id: `family-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        surname,
        ancestry: params.ancestry || "human",
        type: familyType,
        dynamic,
        secret,
        sharedTraits,
        traditions,
        conflicts,
        wealthLevel,
        reputation,
        members: [], // To be populated with NPC references
        relationships: [], // Relationships between family members
        timestamp: Date.now()
      };

    } catch (error) {
      console.error("PF2e Narrative Seeds | Error generating family:", error);
      return null;
    }
  }

  /**
   * Generate surname based on ancestry
   */
  static generateSurname(ancestry = "human") {
    const surnamePrefixes = {
      dwarf: ["Iron", "Stone", "Gold", "Hammer", "Forge", "Steel", "Mountain", "Deep"],
      elf: ["Moon", "Star", "Silver", "Dawn", "Wood", "Leaf", "Song", "Wind"],
      gnome: ["Bright", "Sparkle", "Tinker", "Gem", "Quick", "Clever", "Nimble"],
      halfling: ["Hill", "Green", "Bramble", "Burrow", "Meadow", "Brook", "Garden"],
      human: ["Black", "Gray", "White", "Red", "Green", "Brown", "Swift", "Strong"],
      goblin: ["Sharp", "Quick", "Clever", "Sneaky", "Night", "Shadow", "Skull"],
      orc: ["Blood", "War", "Iron", "Grim", "Bone", "Scar", "Rage"]
    };

    const surnameSuffixes = {
      dwarf: ["beard", "hammer", "axe", "forge", "helm", "fist", "anvil", "shield"],
      elf: ["song", "wind", "leaf", "bow", "star", "dawn", "shadow", "light"],
      gnome: ["finger", "spinner", "maker", "thinker", "finder", "keeper"],
      halfling: ["foot", "burrow", "field", "barrel", "pipe", "kettle"],
      human: ["smith", "stone", "wood", "river", "hill", "ford", "field", "worth"],
      goblin: ["tooth", "nail", "skull", "blade", "claw", "eye", "fang"],
      orc: ["breaker", "crusher", "slayer", "smasher", "ripper", "render"]
    };

    const ancestryKey = ancestry.toLowerCase();
    const prefixes = surnamePrefixes[ancestryKey] || surnamePrefixes.human;
    const suffixes = surnameSuffixes[ancestryKey] || surnameSuffixes.human;

    const prefix = RandomUtils.selectFrom(prefixes);
    const suffix = RandomUtils.selectFrom(suffixes);

    return `${prefix}${suffix}`;
  }

  /**
   * Determine family wealth level
   */
  static determineFamilyWealth() {
    const roll = Math.random();

    if (roll < 0.05) return "destitute";
    if (roll < 0.15) return "poor";
    if (roll < 0.30) return "struggling";
    if (roll < 0.60) return "modest";
    if (roll < 0.80) return "comfortable";
    if (roll < 0.92) return "prosperous";
    if (roll < 0.98) return "wealthy";
    return "opulent";
  }

  /**
   * Generate family reputation
   */
  static generateFamilyReputation() {
    const reputations = [
      "honest and hardworking",
      "shrewd in business",
      "generous to community",
      "proud and arrogant",
      "secretive and mysterious",
      "criminal connections",
      "religious and pious",
      "scholarly and educated",
      "military tradition",
      "artistic and creative",
      "scandalous and controversial",
      "fallen from grace",
      "rising in status",
      "connected to nobility",
      "simple folk",
      "troublemakers",
      "healers and helpers",
      "merchants and traders",
      "strange and eccentric",
      "cursed or unlucky"
    ];

    return RandomUtils.selectFrom(reputations);
  }

  /**
   * Generate relationship between two family members
   * @param {string} member1Id - First member ID
   * @param {string} member2Id - Second member ID
   * @param {string} relationType - Type of relationship (parent, sibling, spouse, etc.)
   * @returns {Object} Relationship data
   */
  static async generateRelationship(member1Id, member2Id, relationType) {
    const familyData = await DataLoader.loadJSON("data/social/families/family-structures.json");

    let relationshipQuality;

    if (relationType === "sibling") {
      relationshipQuality = RandomUtils.selectWeighted(familyData.siblingRelationships, "likelihood");
    } else if (relationType === "parent-child") {
      relationshipQuality = RandomUtils.selectWeighted(familyData.parentChildRelationships, "likelihood");
    } else if (relationType === "spouse") {
      const spouseRelationships = [
        { id: "loving", relationship: "Loving Partnership", likelihood: 7 },
        { id: "functional", relationship: "Functional Marriage", likelihood: 8 },
        { id: "strained", relationship: "Strained Marriage", likelihood: 6 },
        { id: "loveless", relationship: "Loveless Arrangement", likelihood: 5 },
        { id: "passionate", relationship: "Passionate Romance", likelihood: 6 }
      ];
      relationshipQuality = RandomUtils.selectWeighted(spouseRelationships, "likelihood");
    } else {
      // Extended family (cousins, aunts, uncles, etc.)
      const extendedRelationships = [
        { id: "close", relationship: "Close", likelihood: 6 },
        { id: "friendly", relationship: "Friendly", likelihood: 8 },
        { id: "distant", relationship: "Distant", likelihood: 8 },
        { id: "estranged", relationship: "Estranged", likelihood: 4 }
      ];
      relationshipQuality = RandomUtils.selectWeighted(extendedRelationships, "likelihood");
    }

    return {
      member1Id,
      member2Id,
      type: relationType,
      quality: relationshipQuality,
      sharedHistory: this.generateSharedHistory(relationType)
    };
  }

  /**
   * Generate shared history between family members
   */
  static generateSharedHistory(relationType) {
    const histories = {
      sibling: [
        "Grew up competing for parent's attention",
        "Shared childhood adventure that bonded them",
        "One saved the other's life",
        "Fought over inheritance",
        "Separated for years, recently reunited",
        "Kept each other's secrets",
        "One always protected the other",
        "Rivalry since childhood"
      ],
      "parent-child": [
        "Child always tried to please parent",
        "Parent had high expectations",
        "Child rebelled against parent's wishes",
        "Parent sacrificed much for child",
        "Child disappointed parent deeply",
        "Parent was absent during childhood",
        "Close bond through shared interest",
        "Parent favored this child"
      ],
      spouse: [
        "Arranged marriage that grew to love",
        "Passionate romance from the start",
        "Married for practical reasons",
        "Childhood sweethearts",
        "Married to unite families",
        "Second marriage for both",
        "Scandalous affair became marriage",
        "Married against family wishes"
      ]
    };

    const options = histories[relationType] || ["Typical family relationship"];
    return RandomUtils.selectFrom(options);
  }

  /**
   * Generate family member based on existing family structure
   * @param {Object} family - Existing family object
   * @param {string} role - Role in family (parent, child, sibling, etc.)
   * @param {Object} baseNPC - Optional: existing NPC to add to family
   * @returns {Promise<Object>} Family member reference
   */
  static async generateFamilyMember(family, role, baseNPC = null) {
    const member = {
      id: baseNPC?.id || `npc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      surname: family.surname,
      ancestry: family.ancestry,
      inheritsTraits: [], // Which shared traits this member has
      familyRole: null // Golden child, black sheep, etc.
    };

    // 70% chance to inherit each shared trait
    member.inheritsTraits = family.sharedTraits.filter(() => Math.random() < 0.7);

    // 40% chance to have a specific family role
    if (Math.random() < 0.4) {
      const familyData = await DataLoader.loadJSON('data/social/families/family-structures.json');
      if (familyData && familyData.familyRoles) {
        member.familyRole = RandomUtils.selectWeighted(familyData.familyRoles, "likelihood");
      }
    }

    return member;
  }
}
