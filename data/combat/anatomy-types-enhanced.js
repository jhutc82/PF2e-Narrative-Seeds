/**
 * PF2e Narrative Seeds - Layered Anatomy Type Definitions
 * Comprehensive creature anatomy types with base anatomy + modifiers system
 *
 * ARCHITECTURE:
 * - Base Anatomies: Physical form (dragon, humanoid, quadruped, etc.)
 * - Modifiers: Conditions/states that alter the base (undead, skeletal, incorporeal, etc.)
 * - Detection returns: { base: "dragon", modifiers: ["zombie"] }
 * - This allows proper handling of creatures like "Zombie Dragon" or "Skeletal Giant"
 */

/**
 * MODIFIER DEFINITIONS
 * Modifiers are conditions or states that alter the base anatomy
 * Priority: lower = higher importance when multiple modifiers match
 */
export const ANATOMY_MODIFIERS = {
  "incorporeal": {
    name: "Incorporeal",
    description: "Ghostly, non-physical entity",
    traitMatches: ["incorporeal", "ghost", "wraith", "specter", "shadow"],
    nameMatches: ["ghost", "wraith", "specter", "shadow", "phantom", "spirit"],
    priority: 1,
    examples: ["Ghost", "Wraith", "Shadow", "Specter"],
    descriptorPrefix: "ghostly",
    descriptorAdjective: "ethereal"
  },

  "skeletal": {
    name: "Skeletal",
    description: "Animated bones with no flesh",
    traitMatches: ["skeleton"],
    nameMatches: ["skeleton", "skeletal"],
    priority: 2,
    examples: ["Skeletal Champion", "Skeletal Dragon"],
    descriptorPrefix: "skeletal",
    descriptorAdjective: "bony"
  },

  "zombie": {
    name: "Zombie",
    description: "Reanimated corpse with rotting flesh",
    traitMatches: ["zombie"],
    nameMatches: ["zombie"],
    priority: 3,
    examples: ["Zombie Shambler", "Zombie Dragon"],
    descriptorPrefix: "rotting",
    descriptorAdjective: "decaying"
  },

  "vampire": {
    name: "Vampiric",
    description: "Blood-drinking undead",
    traitMatches: ["vampire"],
    nameMatches: ["vampire"],
    priority: 4,
    examples: ["Vampire Spawn", "Vampire Count"],
    descriptorPrefix: "vampiric",
    descriptorAdjective: "blood-drained"
  },

  "mummy": {
    name: "Mummified",
    description: "Preserved and wrapped in bandages",
    traitMatches: ["mummy"],
    nameMatches: ["mummy"],
    priority: 5,
    examples: ["Mummy Guardian", "Mummy Pharaoh"],
    descriptorPrefix: "mummified",
    descriptorAdjective: "bandage-wrapped"
  },

  "lich": {
    name: "Lich",
    description: "Powerful undead spellcaster",
    traitMatches: ["lich"],
    nameMatches: ["lich", "demi-lich", "demilich"],
    priority: 6,
    examples: ["Lich", "Demilich"],
    descriptorPrefix: "desiccated",
    descriptorAdjective: "withered"
  },

  "undead": {
    name: "Undead",
    description: "General undead state",
    traitMatches: ["undead"],
    nameMatches: [],
    priority: 10,  // Lower priority - catches general undead
    examples: ["Wight", "Mohrg"],
    descriptorPrefix: "undead",
    descriptorAdjective: "unliving"
  }
};

/**
 * BASE ANATOMY DEFINITIONS
 * These represent the physical form of the creature
 * Priority: used for disambiguation when multiple bases could match
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
    examples: ["Will-o'-Wisp"],
    bodyType: "wisp"
  },

  "scythe-tree": {
    name: "Scythe Tree",
    description: "Animated tree with scythe-like branches",
    traitMatches: ["plant"],
    nameMatches: ["scythe tree", "scythe-tree"],
    priority: 15,
    examples: ["Scythe Tree"],
    bodyType: "plant"
  },

  "shambling-mound": {
    name: "Shambling Mound",
    description: "Ambulatory mound of vegetation",
    traitMatches: ["plant"],
    nameMatches: ["shambling mound", "shambling-mound"],
    priority: 16,
    examples: ["Shambling Mound"],
    bodyType: "plant"
  },

  "troll": {
    name: "Troll",
    description: "Large regenerating humanoid",
    traitMatches: ["troll", "giant"],
    nameMatches: ["troll"],
    priority: 20,
    examples: ["Troll", "Cave Troll", "Moss Troll", "Frost Troll"],
    bodyType: "humanoid"
  },

  "owlbear": {
    name: "Owlbear",
    description: "Owl-bear hybrid creature",
    traitMatches: ["beast"],
    nameMatches: ["owlbear"],
    priority: 25,
    examples: ["Owlbear"],
    bodyType: "quadruped"
  },

  "worg": {
    name: "Worg",
    description: "Intelligent evil wolf",
    traitMatches: ["beast"],
    nameMatches: ["worg"],
    priority: 26,
    examples: ["Worg"],
    bodyType: "quadruped"
  },

  "giant-cyclops": {
    name: "Cyclops",
    description: "One-eyed giant",
    traitMatches: ["giant"],
    nameMatches: ["cyclops"],
    priority: 30,
    examples: ["Cyclops", "Great Cyclops"],
    bodyType: "humanoid"
  },

  "dragon": {
    name: "Dragon",
    description: "Mighty draconic creature",
    traitMatches: ["dragon"],
    nameMatches: ["dragon", "drake", "wyrm", "wyvern"],
    priority: 35,
    examples: ["Red Dragon", "Blue Dragon", "Drake", "Wyvern"],
    bodyType: "draconic"
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
    examples: ["Sprite", "Grig", "Pixie", "Atomie"],
    bodyType: "humanoid"
  },

  "fey-small": {
    name: "Small Fey",
    description: "Small hostile fey",
    traitMatches: ["fey"],
    nameMatches: ["redcap", "quickling", "gremlin", "pugwampi", "jinkin"],
    priority: 61,
    examples: ["Redcap", "Quickling", "Gremlin", "Pugwampi"],
    bodyType: "humanoid"
  },

  "fey-humanoid": {
    name: "Fey Humanoid",
    description: "Humanoid fey creatures",
    traitMatches: ["fey"],
    nameMatches: ["nymph", "dryad", "satyr", "naiad"],
    priority: 62,
    examples: ["Nymph", "Dryad", "Satyr", "Naiad"],
    bodyType: "humanoid"
  },

  "fey-general": {
    name: "Fey",
    description: "General fey creature",
    traitMatches: ["fey"],
    nameMatches: [],
    priority: 70,
    examples: ["Unicorn", "Treant", "Green Man"],
    bodyType: "quadruped"
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
    examples: ["Air Elemental", "Invisible Stalker"],
    bodyType: "elemental"
  },

  "earth-elemental": {
    name: "Earth Elemental",
    description: "Living stone and earth",
    traitMatches: ["earth", "elemental"],
    nameMatches: ["earth elemental"],
    priority: 76,
    examples: ["Earth Elemental", "Xorn"],
    bodyType: "elemental"
  },

  "fire-elemental": {
    name: "Fire Elemental",
    description: "Living flame",
    traitMatches: ["fire", "elemental"],
    nameMatches: ["fire elemental"],
    priority: 77,
    examples: ["Fire Elemental", "Magma Elemental"],
    bodyType: "elemental"
  },

  "water-elemental": {
    name: "Water Elemental",
    description: "Living water",
    traitMatches: ["water", "elemental"],
    nameMatches: ["water elemental"],
    priority: 78,
    examples: ["Water Elemental", "Ice Elemental"],
    bodyType: "elemental"
  },

  "elemental-general": {
    name: "Elemental",
    description: "General elemental creature",
    traitMatches: ["elemental"],
    nameMatches: [],
    priority: 79,
    examples: ["Mephit", "Genie"],
    bodyType: "elemental"
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
    examples: ["Stone Golem", "Iron Golem", "Flesh Golem", "Clay Golem"],
    bodyType: "construct"
  },

  "construct": {
    name: "Construct",
    description: "Animated objects and constructs",
    traitMatches: ["construct"],
    nameMatches: ["animated", "clockwork"],
    priority: 82,
    examples: ["Animated Armor", "Animated Statue", "Clockwork Soldier"],
    bodyType: "construct"
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
    examples: ["Gelatinous Cube", "Black Pudding", "Gray Ooze", "Ochre Jelly"],
    bodyType: "amorphous"
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
    examples: ["Assassin Vine"],
    bodyType: "plant"
  },

  "plant": {
    name: "Plant",
    description: "Plant-based creatures",
    traitMatches: ["plant", "fungus"],
    nameMatches: ["leshy", "treant"],
    priority: 95,
    examples: ["Leshy", "Treant", "Mandragora", "Fungus Leshy"],
    bodyType: "plant"
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
    examples: ["Aboleth", "Otyugh", "Chuul"],
    bodyType: "aberration"
  },

  "aberration-general": {
    name: "Aberration",
    description: "Strange creature from beyond reality",
    traitMatches: ["aberration"],
    nameMatches: ["gibbering", "flumph"],
    priority: 98,
    examples: ["Gibbering Mouther", "Flumph", "Neh-Thalggu"],
    bodyType: "aberration"
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
    examples: ["Giant Spider", "Giant Scorpion", "Ankheg", "Giant Mantis"],
    bodyType: "insectoid"
  },

  "serpent": {
    name: "Serpent",
    description: "Snake-like creatures",
    traitMatches: ["snake"],
    nameMatches: ["snake", "serpent", "naga", "viper", "cobra", "anaconda", "python"],
    priority: 110,
    examples: ["Giant Snake", "Viper", "Naga", "Sea Serpent"],
    bodyType: "serpent"
  },

  "avian": {
    name: "Avian",
    description: "Bird-like creatures",
    traitMatches: ["bird"],
    nameMatches: ["bird", "roc", "eagle", "hawk", "raven", "vulture", "owl"],
    priority: 120,
    examples: ["Giant Eagle", "Roc", "Griffon", "Giant Owl"],
    bodyType: "avian"
  },

  "aquatic": {
    name: "Aquatic",
    description: "Fish and sea creatures",
    traitMatches: ["aquatic", "water"],
    nameMatches: ["fish", "shark", "eel", "ray", "dolphin", "whale"],
    priority: 130,
    examples: ["Shark", "Giant Eel", "Electric Eel", "Orca"],
    bodyType: "aquatic"
  },

  "quadruped": {
    name: "Quadruped",
    description: "Four-legged beasts",
    traitMatches: ["animal", "beast"],
    nameMatches: ["wolf", "bear", "lion", "tiger", "cat", "dog", "horse", "boar", "bull", "panther", "leopard"],
    priority: 140,
    examples: ["Wolf", "Bear", "Lion", "Tiger", "Horse", "Dire Wolf", "Winter Wolf"],
    bodyType: "quadruped"
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
    examples: ["Balor", "Marilith", "Vrock", "Glabrezu"],
    bodyType: "humanoid"
  },

  "devil": {
    name: "Devil",
    description: "Lawful evil fiend",
    traitMatches: ["devil", "fiend"],
    nameMatches: ["devil", "pit fiend", "bone devil", "erinyes"],
    priority: 146,
    examples: ["Pit Fiend", "Bone Devil", "Erinyes", "Imp"],
    bodyType: "humanoid"
  },

  "daemon": {
    name: "Daemon",
    description: "Neutral evil fiend",
    traitMatches: ["daemon", "fiend"],
    nameMatches: ["daemon"],
    priority: 147,
    examples: ["Astradaemon", "Piscodaemon"],
    bodyType: "humanoid"
  },

  "fiend": {
    name: "Fiend",
    description: "Evil outsider",
    traitMatches: ["fiend"],
    nameMatches: [],
    priority: 148,
    examples: ["Rakshasa", "Oni"],
    bodyType: "humanoid"
  },

  "angel": {
    name: "Angel",
    description: "Celestial being",
    traitMatches: ["angel", "celestial"],
    nameMatches: ["angel", "solar", "planetar"],
    priority: 149,
    examples: ["Solar", "Planetar", "Astral Deva"],
    bodyType: "humanoid"
  },

  "archon": {
    name: "Archon",
    description: "Lawful good celestial",
    traitMatches: ["archon", "celestial"],
    nameMatches: ["archon"],
    priority: 150,
    examples: ["Trumpet Archon", "Hound Archon"],
    bodyType: "humanoid"
  },

  "azata": {
    name: "Azata",
    description: "Chaotic good celestial",
    traitMatches: ["azata", "celestial"],
    nameMatches: ["azata", "bralani", "ghaele"],
    priority: 151,
    examples: ["Bralani", "Ghaele"],
    bodyType: "humanoid"
  },

  "celestial": {
    name: "Celestial",
    description: "Good outsider",
    traitMatches: ["celestial"],
    nameMatches: [],
    priority: 152,
    examples: ["Pegasus", "Couatl"],
    bodyType: "quadruped"
  },

  "psychopomp": {
    name: "Psychopomp",
    description: "Death's servants",
    traitMatches: ["psychopomp", "monitor"],
    nameMatches: ["psychopomp", "nosoi", "morrigna"],
    priority: 153,
    examples: ["Nosoi", "Morrigna", "Yamaraj"],
    bodyType: "humanoid"
  },

  "monitor": {
    name: "Monitor",
    description: "Neutral outsider",
    traitMatches: ["monitor"],
    nameMatches: ["aeon", "inevitable"],
    priority: 154,
    examples: ["Aeon", "Inevitable"],
    bodyType: "humanoid"
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
    examples: ["Hill Giant", "Stone Giant", "Cloud Giant", "Ogre", "Ettin"],
    bodyType: "humanoid"
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
    examples: ["Goblin", "Hobgoblin", "Bugbear"],
    bodyType: "humanoid"
  },

  "orc": {
    name: "Orc",
    description: "Orc humanoid",
    traitMatches: ["orc"],
    nameMatches: ["orc"],
    priority: 191,
    examples: ["Orc", "Orc Brute"],
    bodyType: "humanoid"
  },

  "humanoid": {
    name: "Humanoid",
    description: "Bipedal humanoid creatures",
    traitMatches: ["humanoid", "human", "elf", "dwarf", "halfling", "gnome"],
    nameMatches: [],
    priority: 200,  // Default fallback
    examples: ["Human", "Elf", "Dwarf", "Halfling", "Gnome"],
    bodyType: "humanoid"
  }
};

/**
 * Get all base anatomy types sorted by priority
 * @returns {Array} Array of [key, definition] tuples sorted by priority
 */
export function getSortedAnatomyTypes() {
  return Object.entries(ANATOMY_DEFINITIONS)
    .sort((a, b) => a[1].priority - b[1].priority);
}

/**
 * Get all modifier types sorted by priority
 * @returns {Array} Array of [key, definition] tuples sorted by priority
 */
export function getSortedModifiers() {
  return Object.entries(ANATOMY_MODIFIERS)
    .sort((a, b) => a[1].priority - b[1].priority);
}

/**
 * Get base anatomy definition by key
 * @param {string} key - Anatomy type key
 * @returns {Object|null}
 */
export function getAnatomyDefinition(key) {
  return ANATOMY_DEFINITIONS[key] || null;
}

/**
 * Get modifier definition by key
 * @param {string} key - Modifier key
 * @returns {Object|null}
 */
export function getModifierDefinition(key) {
  return ANATOMY_MODIFIERS[key] || null;
}
