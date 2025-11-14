/**
 * PF2e Narrative Seeds - Damage Descriptors
 * Verbs and effects for each damage type
 */

import { RandomUtils } from '../../scripts/utils.js';

/**
 * Damage verbs for each damage type and outcome
 * Structure: { damageType: { outcome: [verbs], weaponType: "descriptor" } }
 */
export const DAMAGE_VERBS = {
  // ========================================
  // SLASHING
  // ========================================
  slashing: {
    weaponType: "Your blade",
    criticalSuccess: [
      "cleaves brutally through",
      "slashes savagely across",
      "carves viciously into",
      "rends deeply through",
      "slices clean through",
      "cuts devastatingly across",
      "hacks mercilessly into",
      "severs partially through",
      "gashes violently across",
      "lacerates deeply into"
    ],
    success: [
      "cuts across",
      "slashes through",
      "slices into",
      "carves across",
      "hacks into",
      "cleaves through",
      "rends through",
      "gashes across",
      "lacerates",
      "scores deeply across"
    ]
  },

  // ========================================
  // PIERCING
  // ========================================
  piercing: {
    weaponType: "Your weapon",
    criticalSuccess: [
      "punches completely through",
      "impales brutally through",
      "pierces devastatingly into",
      "drives deep into",
      "stabs viciously through",
      "skewers savagely through",
      "punctures catastrophically through",
      "bores deep into",
      "lances brutally through",
      "transfixes completely through"
    ],
    success: [
      "pierces into",
      "stabs through",
      "punctures",
      "drives into",
      "impales",
      "jabs into",
      "thrusts through",
      "pokes through",
      "spears into",
      "penetrates"
    ]
  },

  // ========================================
  // BLUDGEONING
  // ========================================
  bludgeoning: {
    weaponType: "Your weapon",
    criticalSuccess: [
      "crushes brutally into",
      "smashes devastatingly against",
      "pulverizes savagely",
      "shatters bone in",
      "cracks viciously into",
      "batters mercilessly",
      "hammers catastrophically into",
      "pounds ruthlessly into",
      "breaks brutally",
      "demolishes"
    ],
    success: [
      "strikes solidly",
      "smashes into",
      "crashes against",
      "batters",
      "pounds into",
      "hammers into",
      "clubs",
      "crushes",
      "slams into",
      "impacts heavily"
    ]
  },

  // ========================================
  // FIRE
  // ========================================
  fire: {
    weaponType: "Your flames",
    criticalSuccess: [
      "immolate",
      "consume in searing fire",
      "burn catastrophically through",
      "incinerate",
      "scorch devastatingly",
      "char brutally",
      "ignite violently",
      "sear completely through",
      "blaze through",
      "reduce to cinders"
    ],
    success: [
      "burn",
      "scorch",
      "sear",
      "singe",
      "char",
      "ignite",
      "kindle flames across",
      "blaze across",
      "lick flames across",
      "scald"
    ]
  },

  // ========================================
  // COLD
  // ========================================
  cold: {
    weaponType: "Your frost",
    criticalSuccess: [
      "freeze solid",
      "encase in ice",
      "chill to the bone",
      "crystallize with frost",
      "shatter with cold",
      "entomb in ice",
      "petrify with frost",
      "freeze devastatingly",
      "glaciate",
      "turn to ice"
    ],
    success: [
      "chill",
      "freeze",
      "frost over",
      "numb with cold",
      "ice over",
      "crystallize",
      "coat in frost",
      "freeze partially",
      "cool rapidly",
      "rime with ice"
    ]
  },

  // ========================================
  // ELECTRICITY
  // ========================================
  electricity: {
    weaponType: "Your lightning",
    criticalSuccess: [
      "electrocute catastrophically",
      "arc violently through",
      "surge devastatingly through",
      "burn with lightning",
      "shock brutally",
      "course lethally through",
      "blast with electricity",
      "strike like a thunderbolt",
      "overload with voltage",
      "fry completely"
    ],
    success: [
      "shock",
      "jolt",
      "zap",
      "arc through",
      "crackle across",
      "surge through",
      "spark across",
      "electrify",
      "course through",
      "tingle across"
    ]
  },

  // ========================================
  // SONIC
  // ========================================
  sonic: {
    weaponType: "Your sonic blast",
    criticalSuccess: [
      "shatter completely",
      "rupture catastrophically",
      "blast apart",
      "explode with sound",
      "burst violently",
      "rend with sonic force",
      "pulverize with vibration",
      "disintegrate with sound",
      "tear apart with resonance",
      "rupture devastatingly"
    ],
    success: [
      "blast",
      "rupture",
      "shake violently",
      "vibrate",
      "resonate through",
      "buffet",
      "shatter",
      "thunder against",
      "reverberate through",
      "pulse through"
    ]
  },

  // ========================================
  // ACID
  // ========================================
  acid: {
    weaponType: "Your acid",
    criticalSuccess: [
      "dissolve completely",
      "melt catastrophically through",
      "corrode devastatingly",
      "eat through",
      "liquefy",
      "burn through with acid",
      "erode brutally",
      "consume with caustic",
      "disintegrate with acid",
      "dissolve to nothing"
    ],
    success: [
      "burn with acid",
      "corrode",
      "dissolve",
      "eat away at",
      "melt",
      "erode",
      "sizzle across",
      "bubble across",
      "liquefy",
      "sear with acid"
    ]
  },

  // ========================================
  // POISON
  // ========================================
  poison: {
    weaponType: "Your toxin",
    criticalSuccess: [
      "course lethally through",
      "poison catastrophically",
      "infect devastatingly",
      "corrupt completely",
      "envenom lethally",
      "toxify brutally",
      "contaminate fatally",
      "sicken devastatingly",
      "taint lethally",
      "intoxicate completely"
    ],
    success: [
      "poison",
      "envenom",
      "infect",
      "taint",
      "toxify",
      "sicken",
      "contaminate",
      "corrupt",
      "afflict",
      "course through"
    ]
  },

  // ========================================
  // FORCE
  // ========================================
  force: {
    weaponType: "Your force",
    criticalSuccess: [
      "blast apart with magic",
      "shatter with arcane force",
      "rupture with pure energy",
      "tear through with magic",
      "explode through",
      "rend with magical force",
      "devastate with energy",
      "obliterate with force",
      "demolish magically",
      "annihilate with power"
    ],
    success: [
      "strike with force",
      "blast with energy",
      "impact with magic",
      "slam with force",
      "buffet with power",
      "strike with energy",
      "crash with magic",
      "pound with force",
      "hammer with energy",
      "strike magically"
    ]
  },

  // ========================================
  // MENTAL
  // ========================================
  mental: {
    weaponType: "Your psychic assault",
    criticalSuccess: [
      "shatter their mind",
      "overwhelm their psyche",
      "devastate their consciousness",
      "crush their will",
      "obliterate their thoughts",
      "annihilate their sanity",
      "rupture their mind",
      "break their spirit",
      "destroy their composure",
      "ravage their psyche"
    ],
    success: [
      "assault their mind",
      "strike their psyche",
      "batter their will",
      "pierce their thoughts",
      "shock their consciousness",
      "jar their mind",
      "disrupt their focus",
      "wound their psyche",
      "shake their sanity",
      "disturb their thoughts"
    ]
  },

  // ========================================
  // POSITIVE
  // ========================================
  positive: {
    weaponType: "Your radiant energy",
    criticalSuccess: [
      "burn away with light",
      "purge with radiance",
      "scourge with holy fire",
      "sear with divine light",
      "blast with life energy",
      "illuminate catastrophically",
      "burn with radiance",
      "overwhelm with light",
      "incinerate with purity",
      "destroy with radiance"
    ],
    success: [
      "sear with light",
      "burn with radiance",
      "scorch with energy",
      "illuminate painfully",
      "flash across",
      "shine devastatingly on",
      "glow brilliantly across",
      "radiate across",
      "brighten painfully",
      "gleam across"
    ]
  },

  // ========================================
  // NEGATIVE
  // ========================================
  negative: {
    weaponType: "Your necrotic energy",
    criticalSuccess: [
      "drain life from",
      "wither completely",
      "decay catastrophically",
      "rot devastatingly",
      "consume life from",
      "dessicate utterly",
      "necrotize",
      "corrupt with death",
      "drain vitality from",
      "siphon life from"
    ],
    success: [
      "drain",
      "wither",
      "decay",
      "rot",
      "corrupt",
      "dessicate",
      "sap life from",
      "enfeeble",
      "weaken",
      "consume vitality from"
    ]
  }
};

/**
 * Damage effects for each damage type and outcome
 * Structure: { damageType: { outcome: [effects] } }
 */
export const DAMAGE_EFFECTS = {
  slashing: {
    criticalSuccess: [
      "Blood sprays in a crimson arc!",
      "The wound gapes open horrifically!",
      "They stagger, clutching the gushing wound!",
      "Blood flows freely from the deep cut!",
      "The flesh parts wide, exposing bone!",
      "A spray of blood marks the devastating blow!",
      "They cry out as blood wells from the wound!",
      "The cut is deep and merciless!",
      "Blood streams down from the terrible gash!",
      "The wound bleeds profusely!"
    ],
    success: [
      "Blood wells from the cut.",
      "The wound bleeds steadily.",
      "They grimace as blood flows.",
      "A thin line of blood appears.",
      "The cut draws blood.",
      "They wince as the blade cuts deep.",
      "Blood trickles from the wound.",
      "The slice leaves a bloody mark.",
      "They gasp as the blade bites.",
      "A red line marks the strike."
    ]
  },

  piercing: {
    criticalSuccess: [
      "The weapon emerges from the other side!",
      "They gasp, impaled completely!",
      "Blood streams from the puncture wound!",
      "The deep wound bleeds profusely!",
      "They stagger, transfixed by the blow!",
      "The wound spurts blood with each heartbeat!",
      "They cry out, pierced through!",
      "Blood pools from the deep puncture!",
      "The hole bleeds freely!",
      "They stumble, desperately clutching the wound!"
    ],
    success: [
      "Blood seeps from the puncture.",
      "The wound begins to bleed.",
      "They grunt as the point penetrates.",
      "A dark stain spreads from the wound.",
      "Blood trickles from the hole.",
      "They wince at the piercing pain.",
      "The puncture bleeds steadily.",
      "They gasp at the sharp pain.",
      "Blood marks the entry point.",
      "The wound weeps blood."
    ]
  },

  bludgeoning: {
    criticalSuccess: [
      "Bones crack audibly!",
      "They crumple from the devastating impact!",
      "Something breaks with a sickening crunch!",
      "They stagger, possibly concussed!",
      "The impact leaves them reeling!",
      "They collapse to one knee!",
      "A sickening crack echoes!",
      "They reel from the bone-crushing blow!",
      "Internal damage is certain!",
      "They gasp, the wind knocked from them!"
    ],
    success: [
      "They grunt from the impact.",
      "The blow leaves a bruise.",
      "They stagger slightly.",
      "The hit lands with a thud.",
      "They wince from the strike.",
      "A bruise begins to form.",
      "The impact rattles them.",
      "They grimace at the pain.",
      "The blow connects solidly.",
      "They stumble from the force."
    ]
  },

  fire: {
    criticalSuccess: [
      "Their clothing catches fire!",
      "They scream as flesh blackens!",
      "Smoke rises from the charred flesh!",
      "The smell of burning fills the air!",
      "They beat frantically at the flames!",
      "Blisters form instantly!",
      "Their hair smolders!",
      "Ash flakes from the burned area!",
      "The heat is unbearable!",
      "Fire clings to them tenaciously!"
    ],
    success: [
      "Smoke rises from the burn.",
      "They cry out from the heat.",
      "The flesh reddens and blisters.",
      "They pull away from the flames.",
      "A burn mark appears.",
      "They wince from the searing heat.",
      "The smell of singed hair drifts.",
      "The fire leaves a mark.",
      "They bat at the flames.",
      "Heat radiates from the burn."
    ]
  },

  cold: {
    criticalSuccess: [
      "Ice crystals form on their skin!",
      "They shudder violently from the cold!",
      "Frostbite sets in immediately!",
      "Their breath comes in frosty gasps!",
      "They go rigid from the freezing cold!",
      "Rime covers the affected area!",
      "Their skin turns blue!",
      "They cry out as flesh freezes!",
      "Ice spreads across their body!",
      "They shake uncontrollably!"
    ],
    success: [
      "Frost forms on their skin.",
      "They shiver from the cold.",
      "Their breath mists in the air.",
      "They recoil from the chill.",
      "Goosebumps rise instantly.",
      "They gasp at the cold.",
      "Ice crystals glitter briefly.",
      "They hug themselves against the cold.",
      "A chill runs through them.",
      "They shudder involuntarily."
    ]
  },

  electricity: {
    criticalSuccess: [
      "They convulse as electricity courses through them!",
      "Their muscles spasm uncontrollably!",
      "Smoke rises from the contact point!",
      "They jerk like a puppet on strings!",
      "The smell of ozone fills the air!",
      "Their hair stands on end!",
      "They scream as current flows through them!",
      "Sparks dance across their body!",
      "They collapse, twitching!",
      "Lightning arcs between limbs!"
    ],
    success: [
      "They jolt from the shock.",
      "Muscles twitch involuntarily.",
      "They gasp at the sudden jolt.",
      "Hair stands on end briefly.",
      "They flinch from the electricity.",
      "A tingle runs through them.",
      "They shake off the shock.",
      "Static crackles audibly.",
      "They stumble from the jolt.",
      "Nerves fire randomly."
    ]
  },

  sonic: {
    criticalSuccess: [
      "Their ears bleed from the blast!",
      "They stagger, disoriented and deafened!",
      "The sonic wave ruptures vessels!",
      "They clutch their ears in agony!",
      "Blood trickles from nose and ears!",
      "They reel from the overwhelming sound!",
      "The blast leaves them stunned!",
      "They cry out but can't hear it!",
      "Their balance fails completely!",
      "The sonic assault leaves them reeling!"
    ],
    success: [
      "They wince from the loud noise.",
      "Their ears ring painfully.",
      "They shake their head, disoriented.",
      "The sound is overwhelming.",
      "They cover their ears too late.",
      "They stagger slightly.",
      "The blast disorients them.",
      "They grimace at the noise.",
      "Ears ring and throb.",
      "They stumble from the sonic wave."
    ]
  },

  acid: {
    criticalSuccess: [
      "Flesh dissolves before your eyes!",
      "They scream as acid eats through!",
      "The acid bubbles and hisses!",
      "Clothing and flesh melt away!",
      "Caustic fumes rise from the wound!",
      "They desperately try to wipe it off!",
      "The corrosive burns deep!",
      "Skin sloughs away!",
      "The acid continues to eat away!",
      "They writhe from the burning acid!"
    ],
    success: [
      "Acid sizzles on contact.",
      "They cry out as it burns.",
      "The caustic liquid eats away.",
      "They try to wipe it off.",
      "Skin reddens and blisters.",
      "The acid burns painfully.",
      "They flinch from the corrosive.",
      "Bubbling marks the contact.",
      "The burn spreads slowly.",
      "They gasp at the searing pain."
    ]
  },

  poison: {
    criticalSuccess: [
      "They turn pale as poison spreads!",
      "Veins darken visibly!",
      "They stumble, weakened by toxin!",
      "Sweat beads on their brow!",
      "They gag and retch!",
      "Their movements become sluggish!",
      "Color drains from their face!",
      "They clutch their stomach!",
      "The poison courses through them!",
      "They sway unsteadily!"
    ],
    success: [
      "They grimace as poison enters.",
      "Their face pales slightly.",
      "They feel suddenly nauseous.",
      "A sickly pallor comes over them.",
      "They look suddenly unwell.",
      "Sweat appears on their brow.",
      "They shake off the feeling.",
      "Nausea washes over them.",
      "They steady themselves.",
      "They look weakened."
    ]
  },

  force: {
    criticalSuccess: [
      "The magical force throws them backward!",
      "They fly through the air!",
      "Arcane energy tears through them!",
      "They crash down hard!",
      "The magical impact is devastating!",
      "Pure energy rips through them!",
      "They're blasted off their feet!",
      "Magical force ravages them!",
      "They tumble from the blast!",
      "The arcane strike is overwhelming!"
    ],
    success: [
      "Magical energy impacts them.",
      "They stumble from the force.",
      "The arcane blow connects.",
      "They're pushed back slightly.",
      "Magical force buffets them.",
      "They brace against the energy.",
      "The spell strikes true.",
      "Arcane power flows through them.",
      "They wince from magical pain.",
      "Force ripples across them."
    ]
  },

  mental: {
    criticalSuccess: [
      "They clutch their head and scream!",
      "Their eyes roll back!",
      "Blood trickles from their nose!",
      "They collapse to their knees!",
      "Their face contorts in agony!",
      "They stagger, completely disoriented!",
      "Psychic pain overwhelms them!",
      "They gasp in mental anguish!",
      "Their composure shatters completely!",
      "They cry out in psychological pain!"
    ],
    success: [
      "They wince from mental pain.",
      "Their concentration breaks.",
      "They shake their head.",
      "Confusion crosses their face.",
      "They grimace psychically.",
      "Their focus wavers.",
      "They blink away the assault.",
      "Pain flashes across their mind.",
      "They steady their thoughts.",
      "Mental static fills their head."
    ]
  },

  positive: {
    criticalSuccess: [
      "Radiant light sears them!",
      "They recoil from the burning brightness!",
      "Holy light scorches them!",
      "They shield their eyes too late!",
      "The radiance burns like fire!",
      "They cry out as light consumes them!",
      "Purifying energy tears through them!",
      "Brilliance burns them badly!",
      "They stagger from the holy fire!",
      "Light burns away the darkness within!"
    ],
    success: [
      "They wince from the light.",
      "Radiance washes over them.",
      "They recoil from the glow.",
      "The light is uncomfortable.",
      "They shield their eyes.",
      "Brightness causes pain.",
      "They turn away from radiance.",
      "The glow is painful.",
      "They squint in discomfort.",
      "Light sears them lightly."
    ]
  },

  negative: {
    criticalSuccess: [
      "Life energy drains visibly!",
      "They age before your eyes!",
      "Vitality flows away from them!",
      "They wither and weaken!",
      "Color drains from them completely!",
      "They sag as strength abandons them!",
      "Necrotic energy ravages them!",
      "They gasp as life is stolen!",
      "Decay spreads across them!",
      "They look suddenly haggard!"
    ],
    success: [
      "They feel suddenly weaker.",
      "A chill of death touches them.",
      "They shiver from the cold.",
      "Energy drains from them.",
      "They look paler.",
      "Vitality ebbs slightly.",
      "They feel momentarily drained.",
      "Cold seeps into them.",
      "Weakness washes over them.",
      "They shudder from the touch of death."
    ]
  }
};

/**
 * Get verb for damage type and outcome
 * @param {string} damageType
 * @param {string} outcome
 * @param {string} varietyMode - Variety setting
 * @returns {string|null}
 */
export function getDamageVerb(damageType, outcome, varietyMode = 'high') {
  const data = DAMAGE_VERBS[damageType];
  if (!data || !data[outcome]) return null;

  const verbs = data[outcome];
  const category = `verb:${damageType}:${outcome}`;
  return RandomUtils.selectRandom(verbs, varietyMode, category);
}

/**
 * Get effect for damage type and outcome
 * @param {string} damageType
 * @param {string} outcome
 * @param {string} varietyMode - Variety setting
 * @returns {string|null}
 */
export function getDamageEffect(damageType, outcome, varietyMode = 'high') {
  const data = DAMAGE_EFFECTS[damageType];
  if (!data || !data[outcome]) return null;

  const effects = data[outcome];
  const category = `effect:${damageType}:${outcome}`;
  return RandomUtils.selectRandom(effects, varietyMode, category);
}

/**
 * Get weapon type descriptor
 * @param {string} damageType
 * @returns {string}
 */
export function getWeaponType(damageType) {
  const data = DAMAGE_VERBS[damageType];
  return data ? data.weaponType : "Your weapon";
}
