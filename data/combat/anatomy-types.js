/**
 * PF2e Narrative Seeds - Anatomy Type Definitions
 * Defines all creature anatomy types and their detection criteria
 */

/**
 * Anatomy type definitions
 * Each anatomy type has:
 * - name: Display name
 * - description: What this anatomy represents
 * - traitMatches: PF2e traits that indicate this anatomy
 * - nameMatches: Creature name keywords that indicate this anatomy
 * - priority: Check order (lower = checked first, for specific types)
 * - examples: Example creatures
 */
export const ANATOMY_DEFINITIONS = {
  // ========================================
  // SPECIFIC TYPES (checked first)
  // ========================================

  "will-o-wisp": {
    name: "Will-o'-Wisp",
    description: "Floating ball of light",
    traitMatches: ["aberration"],
    nameMatches: ["will-o-wisp", "wisp"],
    priority: 10,
    examples: ["Will-o'-Wisp"]
  },

  "scythe-tree": {
    name: "Scythe Tree",
    description: "Animated tree with scythe-like branches",
    traitMatches: ["plant"],
    nameMatches: ["scythe tree", "scythe-tree"],
    priority: 15,
    examples: ["Scythe Tree"]
  },

  "shambling-mound": {
    name: "Shambling Mound",
    description: "Ambulatory mound of vegetation",
    traitMatches: ["plant"],
    nameMatches: ["shambling mound", "shambling-mound"],
    priority: 16,
    examples: ["Shambling Mound"]
  },

  "troll": {
    name: "Troll",
    description: "Large regenerating humanoid",
    traitMatches: ["troll", "giant"],
    nameMatches: ["troll"],
    priority: 20,
    examples: ["Troll", "Cave Troll", "Moss Troll"]
  },

  "owlbear": {
    name: "Owlbear",
    description: "Owl-bear hybrid creature",
    traitMatches: ["beast"],
    nameMatches: ["owlbear"],
    priority: 25,
    examples: ["Owlbear"]
  },

  "worg": {
    name: "Worg",
    description: "Intelligent evil wolf",
    traitMatches: ["beast"],
    nameMatches: ["worg"],
    priority: 26,
    examples: ["Worg"]
  },

  "giant-cyclops": {
    name: "Cyclops",
    description: "One-eyed giant",
    traitMatches: ["giant", "humanoid"],
    nameMatches: ["cyclops"],
    priority: 30,
    examples: ["Cyclops", "Great Cyclops"]
  },

  // ========================================
  // UNDEAD TYPES
  // ========================================

  "skeleton": {
    name: "Skeleton",
    description: "Animated bones with no flesh",
    traitMatches: ["skeleton", "undead"],
    nameMatches: ["skeleton"],
    priority: 40,
    examples: ["Skeleton Guard", "Skeletal Champion"]
  },

  "zombie": {
    name: "Zombie",
    description: "Reanimated corpse with rotting flesh",
    traitMatches: ["zombie", "undead"],
    nameMatches: ["zombie"],
    priority: 41,
    examples: ["Zombie Shambler", "Plague Zombie"]
  },

  "incorporeal": {
    name: "Incorporeal",
    description: "Ghostly, non-physical entity",
    traitMatches: ["incorporeal", "ghost", "wraith", "specter", "shadow"],
    nameMatches: ["ghost", "wraith", "specter", "shadow", "phantom"],
    priority: 42,
    examples: ["Ghost", "Wraith", "Shadow", "Specter"]
  },

  "undead-general": {
    name: "Undead",
    description: "General undead creature",
    traitMatches: ["undead"],
    nameMatches: [],
    priority: 50,
    examples: ["Vampire", "Wight", "Mummy"]
  },

  // ========================================
  // FEY TYPES
  // ========================================

  "fey-tiny": {
    name: "Tiny Fey",
    description: "Tiny fey creatures",
    traitMatches: ["fey"],
    nameMatches: ["sprite", "grig", "pixie", "atomie"],
    priority: 60,
    examples: ["Sprite", "Grig", "Pixie"]
  },

  "fey-small": {
    name: "Small Fey",
    description: "Small hostile fey",
    traitMatches: ["fey"],
    nameMatches: ["redcap", "quickling", "gremlin"],
    priority: 61,
    examples: ["Redcap", "Quickling"]
  },

  "fey-humanoid": {
    name: "Fey Humanoid",
    description: "Humanoid fey creatures",
    traitMatches: ["fey"],
    nameMatches: ["nymph", "dryad", "satyr"],
    priority: 62,
    examples: ["Nymph", "Dryad", "Satyr"]
  },

  "fey-general": {
    name: "Fey",
    description: "General fey creature",
    traitMatches: ["fey"],
    nameMatches: [],
    priority: 70,
    examples: ["Unicorn", "Treant"]
  },

  // ========================================
  // STANDARD ANATOMY TYPES
  // ========================================

  "construct": {
    name: "Construct",
    description: "Animated objects and golems",
    traitMatches: ["construct", "golem"],
    nameMatches: ["golem", "animated"],
    priority: 80,
    examples: ["Stone Golem", "Animated Armor"]
  },

  "amorphous": {
    name: "Amorphous",
    description: "Shapeless oozes and slimes",
    traitMatches: ["ooze", "amorphous"],
    nameMatches: ["ooze", "slime", "jelly"],
    priority: 90,
    examples: ["Gelatinous Cube", "Black Pudding"]
  },

  "plant": {
    name: "Plant",
    description: "Plant-based creatures",
    traitMatches: ["plant"],
    nameMatches: [],
    priority: 95,
    examples: ["Assassin Vine", "Mandragora"]
  },

  "vine": {
    name: "Vine",
    description: "Vine-like plant creatures",
    traitMatches: ["plant"],
    nameMatches: ["vine", "tendril"],
    priority: 94,
    examples: ["Assassin Vine"]
  },

  "insectoid": {
    name: "Insectoid",
    description: "Insect or arthropod creatures",
    traitMatches: ["insect", "arthropod", "vermin"],
    nameMatches: ["spider", "scorpion", "beetle", "centipede", "ant"],
    priority: 100,
    examples: ["Giant Spider", "Giant Scorpion"]
  },

  "serpent": {
    name: "Serpent",
    description: "Snake-like creatures",
    traitMatches: ["serpent", "snake"],
    nameMatches: ["snake", "serpent", "naga"],
    priority: 110,
    examples: ["Giant Snake", "Viper"]
  },

  "avian": {
    name: "Avian",
    description: "Bird-like creatures",
    traitMatches: ["bird"],
    nameMatches: ["bird", "roc", "eagle", "hawk", "raven"],
    priority: 120,
    examples: ["Giant Eagle", "Roc"]
  },

  "aquatic": {
    name: "Aquatic",
    description: "Fish and sea creatures",
    traitMatches: ["aquatic", "water", "fish"],
    nameMatches: ["fish", "shark", "eel"],
    priority: 130,
    examples: ["Shark", "Giant Eel"]
  },

  "quadruped": {
    name: "Quadruped",
    description: "Four-legged beasts",
    traitMatches: ["animal", "beast"],
    nameMatches: ["wolf", "bear", "lion", "tiger", "cat", "dog", "horse"],
    priority: 140,
    examples: ["Wolf", "Bear", "Lion", "Horse"]
  },

  "giant": {
    name: "Giant",
    description: "Large humanoid giants",
    traitMatches: ["giant"],
    nameMatches: ["giant", "ogre", "ettin"],
    priority: 150,
    examples: ["Hill Giant", "Stone Giant", "Ogre"]
  },

  "humanoid": {
    name: "Humanoid",
    description: "Bipedal humanoid creatures",
    traitMatches: ["humanoid", "human", "elf", "dwarf", "goblin", "orc"],
    nameMatches: [],
    priority: 200,  // Default fallback
    examples: ["Human", "Elf", "Dwarf", "Orc", "Goblin"]
  }
};

/**
 * Get all anatomy types sorted by priority
 * @returns {Array} Array of [key, definition] tuples sorted by priority
 */
export function getSortedAnatomyTypes() {
  return Object.entries(ANATOMY_DEFINITIONS)
    .sort((a, b) => a[1].priority - b[1].priority);
}

/**
 * Get anatomy definition by key
 * @param {string} key - Anatomy type key
 * @returns {Object|null}
 */
export function getAnatomyDefinition(key) {
  return ANATOMY_DEFINITIONS[key] || null;
}
