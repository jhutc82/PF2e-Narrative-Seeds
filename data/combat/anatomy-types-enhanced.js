/**
 * PF2e Narrative Seeds - Enhanced Anatomy Type Definitions
 * Comprehensive creature anatomy types with improved detection based on PF2e creature data
 */

/**
 * Enhanced Anatomy type definitions
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
    traitMatches: ["air"],
    nameMatches: ["will-o-wisp", "wisp", "will o wisp"],
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
    examples: ["Troll", "Cave Troll", "Moss Troll", "Frost Troll"]
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
    traitMatches: ["giant"],
    nameMatches: ["cyclops"],
    priority: 30,
    examples: ["Cyclops", "Great Cyclops"]
  },

  "dragon": {
    name: "Dragon",
    description: "Mighty draconic creature",
    traitMatches: ["dragon"],
    nameMatches: ["dragon", "drake", "wyrm", "wyvern"],
    priority: 35,
    examples: ["Red Dragon", "Blue Dragon", "Zombie Dragon", "Skeletal Dragon", "Drake", "Wyvern"]
  },

  // ========================================
  // UNDEAD TYPES
  // ========================================

  "skeleton": {
    name: "Skeleton",
    description: "Animated bones with no flesh",
    traitMatches: ["skeleton"],
    nameMatches: ["skeleton", "skeletal"],
    priority: 40,
    examples: ["Skeleton Guard", "Skeletal Champion", "Skeletal Giant", "Skeletal Dragon"]
  },

  "zombie": {
    name: "Zombie",
    description: "Reanimated corpse with rotting flesh",
    traitMatches: ["zombie"],
    nameMatches: ["zombie"],
    priority: 41,
    examples: ["Zombie Shambler", "Plague Zombie", "Husk Zombie"]
  },

  "incorporeal": {
    name: "Incorporeal",
    description: "Ghostly, non-physical entity",
    traitMatches: ["incorporeal", "ghost", "wraith", "specter", "shadow"],
    nameMatches: ["ghost", "wraith", "specter", "shadow", "phantom", "spirit"],
    priority: 42,
    examples: ["Ghost", "Wraith", "Shadow", "Specter", "Phantom"]
  },

  "vampire": {
    name: "Vampire",
    description: "Blood-drinking undead",
    traitMatches: ["vampire"],
    nameMatches: ["vampire"],
    priority: 43,
    examples: ["Vampire Spawn", "Vampire Count", "Nosferatu"]
  },

  "mummy": {
    name: "Mummy",
    description: "Preserved undead wrapped in bandages",
    traitMatches: ["mummy"],
    nameMatches: ["mummy"],
    priority: 44,
    examples: ["Mummy Guardian", "Mummy Pharaoh"]
  },

  "lich": {
    name: "Lich",
    description: "Powerful undead spellcaster",
    traitMatches: ["lich"],
    nameMatches: ["lich", "demi-lich", "demilich"],
    priority: 45,
    examples: ["Lich", "Demilich"]
  },

  "undead-general": {
    name: "Undead",
    description: "General undead creature",
    traitMatches: ["undead"],
    nameMatches: [],
    priority: 50,
    examples: ["Wight", "Mohrg", "Bodak"]
  },

  // ========================================
  // FEY TYPES
  // ========================================

  "fey-tiny": {
    name: "Tiny Fey",
    description: "Tiny fey creatures",
    traitMatches: ["fey"],
    nameMatches: ["sprite", "grig", "pixie", "atomie", "faerie"],
    priority: 60,
    examples: ["Sprite", "Grig", "Pixie", "Atomie"]
  },

  "fey-small": {
    name: "Small Fey",
    description: "Small hostile fey",
    traitMatches: ["fey"],
    nameMatches: ["redcap", "quickling", "gremlin", "pugwampi", "jinkin"],
    priority: 61,
    examples: ["Redcap", "Quickling", "Gremlin", "Pugwampi"]
  },

  "fey-humanoid": {
    name: "Fey Humanoid",
    description: "Humanoid fey creatures",
    traitMatches: ["fey"],
    nameMatches: ["nymph", "dryad", "satyr", "naiad"],
    priority: 62,
    examples: ["Nymph", "Dryad", "Satyr", "Naiad"]
  },

  "fey-general": {
    name: "Fey",
    description: "General fey creature",
    traitMatches: ["fey"],
    nameMatches: [],
    priority: 70,
    examples: ["Unicorn", "Treant", "Green Man"]
  },

  // ========================================
  // ELEMENTAL TYPES
  // ========================================

  "air-elemental": {
    name: "Air Elemental",
    description: "Living whirlwind",
    traitMatches: ["air", "elemental"],
    nameMatches: ["air elemental"],
    priority: 75,
    examples: ["Air Elemental", "Invisible Stalker"]
  },

  "earth-elemental": {
    name: "Earth Elemental",
    description: "Living stone and earth",
    traitMatches: ["earth", "elemental"],
    nameMatches: ["earth elemental"],
    priority: 76,
    examples: ["Earth Elemental", "Xorn"]
  },

  "fire-elemental": {
    name: "Fire Elemental",
    description: "Living flame",
    traitMatches: ["fire", "elemental"],
    nameMatches: ["fire elemental"],
    priority: 77,
    examples: ["Fire Elemental", "Magma Elemental"]
  },

  "water-elemental": {
    name: "Water Elemental",
    description: "Living water",
    traitMatches: ["water", "elemental"],
    nameMatches: ["water elemental"],
    priority: 78,
    examples: ["Water Elemental", "Ice Elemental"]
  },

  "elemental-general": {
    name: "Elemental",
    description: "General elemental creature",
    traitMatches: ["elemental"],
    nameMatches: [],
    priority: 79,
    examples: ["Mephit", "Genie"]
  },

  // ========================================
  // CONSTRUCT TYPES
  // ========================================

  "golem": {
    name: "Golem",
    description: "Magically animated construct",
    traitMatches: ["golem"],
    nameMatches: ["golem"],
    priority: 80,
    examples: ["Stone Golem", "Iron Golem", "Flesh Golem", "Clay Golem"]
  },

  "construct": {
    name: "Construct",
    description: "Animated objects and constructs",
    traitMatches: ["construct"],
    nameMatches: ["animated", "clockwork"],
    priority: 82,
    examples: ["Animated Armor", "Animated Statue", "Clockwork Soldier"]
  },

  // ========================================
  // OOZE TYPES
  // ========================================

  "amorphous": {
    name: "Amorphous",
    description: "Shapeless oozes and slimes",
    traitMatches: ["ooze", "amorphous"],
    nameMatches: ["ooze", "slime", "jelly", "pudding"],
    priority: 90,
    examples: ["Gelatinous Cube", "Black Pudding", "Gray Ooze", "Ochre Jelly"]
  },

  // ========================================
  // PLANT TYPES
  // ========================================

  "vine": {
    name: "Vine",
    description: "Vine-like plant creatures",
    traitMatches: ["plant"],
    nameMatches: ["vine", "tendril", "assassin vine"],
    priority: 94,
    examples: ["Assassin Vine"]
  },

  "plant": {
    name: "Plant",
    description: "Plant-based creatures",
    traitMatches: ["plant", "fungus"],
    nameMatches: ["leshy", "treant"],
    priority: 95,
    examples: ["Leshy", "Treant", "Mandragora", "Fungus Leshy"]
  },

  // ========================================
  // ABERRATION TYPES
  // ========================================

  "aberration-tentacled": {
    name: "Tentacled Aberration",
    description: "Aberration with tentacles",
    traitMatches: ["aberration"],
    nameMatches: ["aboleth", "otyugh", "chuul", "octopus", "squid"],
    priority: 97,
    examples: ["Aboleth", "Otyugh", "Chuul"]
  },

  "aberration-general": {
    name: "Aberration",
    description: "Strange creature from beyond reality",
    traitMatches: ["aberration"],
    nameMatches: ["gibbering", "flumph"],
    priority: 98,
    examples: ["Gibbering Mouther", "Flumph", "Neh-Thalggu"]
  },

  // ========================================
  // ANIMAL/BEAST TYPES
  // ========================================

  "insectoid": {
    name: "Insectoid",
    description: "Insect or arthropod creatures",
    traitMatches: ["insect", "arthropod", "vermin"],
    nameMatches: ["spider", "scorpion", "beetle", "centipede", "ant", "mantis", "wasp"],
    priority: 100,
    examples: ["Giant Spider", "Giant Scorpion", "Ankheg", "Giant Mantis"]
  },

  "serpent": {
    name: "Serpent",
    description: "Snake-like creatures",
    traitMatches: ["snake"],
    nameMatches: ["snake", "serpent", "naga", "viper", "cobra", "anaconda", "python"],
    priority: 110,
    examples: ["Giant Snake", "Viper", "Naga", "Sea Serpent"]
  },

  "avian": {
    name: "Avian",
    description: "Bird-like creatures",
    traitMatches: ["bird"],
    nameMatches: ["bird", "roc", "eagle", "hawk", "raven", "vulture", "owl"],
    priority: 120,
    examples: ["Giant Eagle", "Roc", "Griffon", "Giant Owl"]
  },

  "aquatic": {
    name: "Aquatic",
    description: "Fish and sea creatures",
    traitMatches: ["aquatic", "water"],
    nameMatches: ["fish", "shark", "eel", "ray", "dolphin", "whale"],
    priority: 130,
    examples: ["Shark", "Giant Eel", "Electric Eel", "Orca"]
  },

  "quadruped": {
    name: "Quadruped",
    description: "Four-legged beasts",
    traitMatches: ["animal", "beast"],
    nameMatches: ["wolf", "bear", "lion", "tiger", "cat", "dog", "horse", "boar", "bull", "panther", "leopard"],
    priority: 140,
    examples: ["Wolf", "Bear", "Lion", "Tiger", "Horse", "Dire Wolf", "Winter Wolf"]
  },

  // ========================================
  // OUTSIDER TYPES
  // ========================================

  "demon": {
    name: "Demon",
    description: "Chaotic evil fiend",
    traitMatches: ["demon", "fiend"],
    nameMatches: ["demon", "balor", "marilith", "vrock", "glabrezu"],
    priority: 145,
    examples: ["Balor", "Marilith", "Vrock", "Glabrezu"]
  },

  "devil": {
    name: "Devil",
    description: "Lawful evil fiend",
    traitMatches: ["devil", "fiend"],
    nameMatches: ["devil", "pit fiend", "bone devil", "erinyes"],
    priority: 146,
    examples: ["Pit Fiend", "Bone Devil", "Erinyes", "Imp"]
  },

  "daemon": {
    name: "Daemon",
    description: "Neutral evil fiend",
    traitMatches: ["daemon", "fiend"],
    nameMatches: ["daemon"],
    priority: 147,
    examples: ["Astradaemon", "Piscodaemon"]
  },

  "fiend": {
    name: "Fiend",
    description: "Evil outsider",
    traitMatches: ["fiend"],
    nameMatches: [],
    priority: 148,
    examples: ["Rakshasa", "Oni"]
  },

  "angel": {
    name: "Angel",
    description: "Celestial being",
    traitMatches: ["angel", "celestial"],
    nameMatches: ["angel", "solar", "planetar"],
    priority: 149,
    examples: ["Solar", "Planetar", "Astral Deva"]
  },

  "archon": {
    name: "Archon",
    description: "Lawful good celestial",
    traitMatches: ["archon", "celestial"],
    nameMatches: ["archon"],
    priority: 150,
    examples: ["Trumpet Archon", "Hound Archon"]
  },

  "azata": {
    name: "Azata",
    description: "Chaotic good celestial",
    traitMatches: ["azata", "celestial"],
    nameMatches: ["azata", "bralani", "ghaele"],
    priority: 151,
    examples: ["Bralani", "Ghaele"]
  },

  "celestial": {
    name: "Celestial",
    description: "Good outsider",
    traitMatches: ["celestial"],
    nameMatches: [],
    priority: 152,
    examples: ["Pegasus", "Couatl"]
  },

  "psychopomp": {
    name: "Psychopomp",
    description: "Death's servants",
    traitMatches: ["psychopomp", "monitor"],
    nameMatches: ["psychopomp", "nosoi", "morrigna"],
    priority: 153,
    examples: ["Nosoi", "Morrigna", "Yamaraj"]
  },

  "monitor": {
    name: "Monitor",
    description: "Neutral outsider",
    traitMatches: ["monitor"],
    nameMatches: ["aeon", "inevitable"],
    priority: 154,
    examples: ["Aeon", "Inevitable"]
  },

  // ========================================
  // GIANT TYPES
  // ========================================

  "giant": {
    name: "Giant",
    description: "Large humanoid giants",
    traitMatches: ["giant"],
    nameMatches: ["giant", "ogre", "ettin"],
    priority: 160,
    examples: ["Hill Giant", "Stone Giant", "Cloud Giant", "Ogre", "Ettin"]
  },

  // ========================================
  // HUMANOID TYPES (lowest priority)
  // ========================================

  "goblinoid": {
    name: "Goblinoid",
    description: "Goblin-type humanoids",
    traitMatches: ["goblin", "hobgoblin", "bugbear"],
    nameMatches: ["goblin", "hobgoblin", "bugbear"],
    priority: 190,
    examples: ["Goblin", "Hobgoblin", "Bugbear"]
  },

  "orc": {
    name: "Orc",
    description: "Orc humanoid",
    traitMatches: ["orc"],
    nameMatches: ["orc"],
    priority: 191,
    examples: ["Orc", "Orc Brute"]
  },

  "humanoid": {
    name: "Humanoid",
    description: "Bipedal humanoid creatures",
    traitMatches: ["humanoid", "human", "elf", "dwarf", "halfling", "gnome"],
    nameMatches: [],
    priority: 200,  // Default fallback
    examples: ["Human", "Elf", "Dwarf", "Halfling", "Gnome"]
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
