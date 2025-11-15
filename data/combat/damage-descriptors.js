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
      "lacerates deeply into",
      "shears catastrophically through",
      "bisects horrifically",
      "sunders completely",
      "rips savagely through",
      "tears brutally across",
      "splits devastatingly",
      "opens gruesomely",
      "parts flesh and bone in",
      "cuts deep to the bone in",
      "slices through muscle and sinew in",
      "hews mercilessly through",
      "dismembers partially",
      "flays open",
      "peels back layers of",
      "gouges a massive wound in",
      "carves a canyon through",
      "rends asunder",
      "cleaves deep into",
      "cuts a crimson path across",
      "slashes a gaping wound in",
      "opens a terrible gash in",
      "scores a vicious line across",
      "rakes savagely across",
      "shreds through",
      "ribbons the flesh of",
      "slices to the quick",
      "cuts straight through",
      "hacks a brutal wound into",
      "gashes wide open",
      "tears open",
      "splits wide",
      "parts brutally",
      "sunders flesh in",
      "cleaves through defenses to",
      "cuts past armor into",
      "finds a gap and ravages"
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
      "scores deeply across",
      "slices cleanly across",
      "cuts a line through",
      "draws blood from",
      "opens a wound in",
      "parts the flesh of",
      "bites deep into",
      "finds purchase in",
      "cuts through to",
      "slashes open",
      "carves into",
      "rends into",
      "gashes open",
      "scores across",
      "rakes across",
      "slices through",
      "cuts deep into",
      "hews into",
      "chops into",
      "hacks across",
      "cleaves into",
      "splits open",
      "shears through",
      "sunders",
      "rips across",
      "tears into",
      "flays",
      "gouges",
      "incises",
      "dissects",
      "bisects",
      "severs into",
      "divides",
      "separates flesh in",
      "penetrates and cuts",
      "slashes downward across",
      "sweeps across",
      "arcs through"
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
      "transfixes completely through",
      "runs completely through",
      "penetrates straight through",
      "pierces clean through",
      "punches a hole through",
      "drives all the way through",
      "goes in and out of",
      "perforates completely",
      "spears straight through",
      "gores savagely through",
      "stakes through",
      "pins brutally through",
      "punctures deep into",
      "bores a tunnel through",
      "drills through",
      "cores through",
      "spikes through",
      "lances deep into",
      "thrusts catastrophically through",
      "jabs straight through",
      "stabs to the hilt in",
      "embeds itself deep in",
      "sinks to the guard in",
      "plunges full depth into",
      "penetrates to vital organs in",
      "finds the heart of",
      "drives through ribs into",
      "pierces through bone in",
      "runs straight to the core of",
      "splits armor and flesh in",
      "finds a fatal gap in",
      "punctures vitals in",
      "pierces the center of",
      "impales cruelly through",
      "spits completely",
      "sticks through and through",
      "goes in one side and out the other of"
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
      "penetrates",
      "enters",
      "sinks into",
      "plunges into",
      "slides into",
      "pushes through",
      "breaks through to",
      "bores into",
      "drills into",
      "punches into",
      "perforates",
      "pricks",
      "stings",
      "needles into",
      "darts into",
      "strikes through to",
      "finds a way into",
      "slips between armor into",
      "threads through defenses to",
      "skewers into",
      "lances into",
      "gores",
      "stabs deep into",
      "pierces through to",
      "punctures into",
      "jabs through to",
      "thrusts deep into",
      "drives through to",
      "penetrates into",
      "spikes into",
      "pins into",
      "sticks into",
      "embeds in",
      "lodges in",
      "sinks deep into",
      "plunges deep into",
      "pierces deeply into"
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
      "demolishes",
      "caves in",
      "collapses",
      "fractures completely",
      "splinters bone in",
      "crushes flat",
      "smashes to pieces",
      "pulverizes bone in",
      "reduces to pulp",
      "flattens",
      "crumples",
      "craters",
      "dents catastrophically",
      "bashes in",
      "batters down",
      "hammers flat",
      "pounds to a pulp",
      "crushes like an eggshell",
      "shatters completely",
      "breaks apart",
      "smashes through",
      "hammers through bone in",
      "caves in ribs in",
      "crushes the chest of",
      "breaks the back of",
      "shatters the skull of",
      "crushes the windpipe of",
      "collapses the sternum of",
      "fractures the spine of",
      "cracks the skull of",
      "crushes vertebrae in",
      "splinters ribs in",
      "breaks multiple bones in",
      "pulverizes vital organs in",
      "crushes with tremendous force",
      "impacts with bone-shattering force on",
      "delivers a devastating blow to"
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
      "impacts heavily",
      "thuds into",
      "crashes into",
      "bangs against",
      "wallops",
      "belts",
      "bashes",
      "clobbers",
      "clouts",
      "whacks",
      "thwacks",
      "thumps",
      "bonks",
      "knocks",
      "raps",
      "claps against",
      "strikes with force",
      "hits hard",
      "connects solidly with",
      "batters into",
      "pounds against",
      "hammers against",
      "smashes against",
      "crashes heavily into",
      "slams against",
      "beats",
      "pummels",
      "pummels into",
      "thrashes",
      "flails into",
      "cudgels",
      "bruises",
      "contuses",
      "impacts",
      "collides with",
      "smacks into",
      "strikes a blow against",
      "lands heavily on"
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
      "reduce to cinders",
      "engulf in flames",
      "set ablaze",
      "burn to a crisp",
      "roast alive",
      "carbonize",
      "cremate",
      "torch completely",
      "turn to ash",
      "consume in inferno",
      "reduce to embers",
      "scorch to the bone",
      "burn away flesh from",
      "sear through to the core of",
      "ignite catastrophically",
      "set fire to",
      "kindle an inferno on",
      "flash-burn",
      "superheat",
      "vaporize with heat",
      "melt through",
      "flash-fry",
      "sear to blackness",
      "char to carbon",
      "burn completely through",
      "ignite like a torch",
      "set alight",
      "combust",
      "deflagrate",
      "conflagrate",
      "consume with flame",
      "reduce to charcoal",
      "cook thoroughly",
      "blacken with fire",
      "burn away"
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
      "scald",
      "sear lightly",
      "burn painfully",
      "scorch the surface of",
      "singe the edges of",
      "char partially",
      "ignite briefly",
      "kindle across",
      "flame across",
      "burn across",
      "heat intensely",
      "roast",
      "bake",
      "toast",
      "singe badly",
      "scald badly",
      "burn the skin of",
      "blacken with heat",
      "redden with fire",
      "blister with flame",
      "crisp",
      "brown with heat",
      "sizzle across",
      "crackle across",
      "warm dangerously",
      "heat severely",
      "set smoldering",
      "spark across",
      "flash across",
      "flare across",
      "glow across",
      "radiate heat onto",
      "cook lightly",
      "warm painfully",
      "heat to burning",
      "scorch badly"
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
      "turn to ice",
      "freeze completely through",
      "encase entirely in ice",
      "chill to absolute zero",
      "crystallize completely",
      "flash-freeze",
      "freeze and shatter",
      "encase in permafrost",
      "freeze to the core of",
      "chill to death",
      "turn to a frozen statue",
      "coat in thick ice",
      "freeze bone-deep in",
      "turn blood to ice in",
      "crystallize the flesh of",
      "freeze internal organs in",
      "coat in rime and ice",
      "glaciate completely",
      "encase in arctic frost",
      "freeze into stillness",
      "lock in ice",
      "petrify with arctic cold",
      "chill fatally",
      "supercool",
      "cryogenically freeze",
      "encase in glacier",
      "coat in hoarfrost",
      "freeze solid as stone",
      "chill to stasis",
      "freeze every cell of",
      "turn to frozen flesh",
      "encase in crystal ice",
      "freeze from within",
      "chill to the marrow of",
      "coat in freezing rime"
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
      "rime with ice",
      "chill painfully",
      "freeze the surface of",
      "frost lightly",
      "numb badly",
      "ice the edges of",
      "crystallize partially",
      "coat with rime",
      "freeze superficially",
      "cool dangerously",
      "chill deeply",
      "frost heavily",
      "numb severely",
      "ice considerably",
      "chill to shivering",
      "freeze uncomfortably",
      "coat in cold",
      "chill badly",
      "freeze painfully",
      "ice painfully",
      "frost painfully",
      "numb completely",
      "chill through",
      "freeze through",
      "coat in ice crystals",
      "chill severely",
      "numb with frost",
      "freeze with rime",
      "chill with ice",
      "frost with cold",
      "cool with frost",
      "ice with cold",
      "numb with chill",
      "freeze with frost",
      "chill with freeze"
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
      "fry completely",
      "electrocute fatally",
      "arc through completely",
      "surge lethally through",
      "burn with electric fire",
      "shock to death",
      "course like lightning through",
      "blast with voltage",
      "strike with thunder and lightning",
      "overload catastrophically",
      "fry to a crisp",
      "electrify completely",
      "arc with deadly voltage through",
      "surge with lethal current through",
      "burn electrically through",
      "shock with full voltage",
      "zap with maximum power",
      "bolt through like lightning",
      "strike as thunder and lightning",
      "flash through with electricity",
      "crackle devastatingly through",
      "spark violently through",
      "jolt with killing voltage",
      "charge lethally",
      "ionize completely",
      "discharge catastrophically into",
      "electrify fatally",
      "strike with a lightning bolt",
      "channel deadly current through",
      "conduct lethal voltage through",
      "arc with blue lightning through",
      "surge with deadly amperage through",
      "shock with lethal current",
      "electrocute thoroughly",
      "blast with thunderbolt"
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
      "tingle across",
      "shock painfully",
      "jolt severely",
      "zap badly",
      "arc across",
      "crackle through",
      "surge painfully through",
      "spark through",
      "electrify painfully",
      "course painfully through",
      "tingle painfully across",
      "shock with voltage",
      "jolt with current",
      "zap with electricity",
      "arc with power through",
      "crackle with energy across",
      "surge with current through",
      "spark with electricity across",
      "electrify with voltage",
      "conduct through",
      "charge",
      "ionize",
      "discharge into",
      "flash across",
      "bolt across",
      "strike with lightning",
      "channel current through",
      "conduct electricity through",
      "buzz across",
      "hum through",
      "crackle energetically across",
      "snap across",
      "pop across",
      "sizzle electrically across",
      "jitter through"
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
      "The wound bleeds profusely!",
      "Crimson arterial spray erupts!",
      "The gash bleeds torrentially!",
      "Blood fountains from the severed vessels!",
      "They reel as blood pours from the wound!",
      "A scarlet cascade flows from the gaping cut!",
      "The wound opens like a screaming mouth!",
      "Bone gleams white through the parted flesh!",
      "Muscle and sinew are laid bare!",
      "They clutch desperately at the hemorrhaging wound!",
      "Blood flows in pulsing waves!",
      "The deep laceration bleeds catastrophically!",
      "They stagger backward, trailing blood!",
      "A fountain of crimson erupts from the strike!",
      "The grievous wound gushes freely!",
      "Blood spatters in all directions!",
      "They scream as the wound yawns open!",
      "The terrible cut reveals inner anatomy!",
      "A torrent of blood marks the lethal blow!",
      "They gasp, staring at the horrific wound!",
      "Blood soaks through clothing instantly!",
      "The gaping slash bleeds without cease!",
      "Crimson rivulets run down in streams!",
      "They stumble, hand pressed to the gushing cut!",
      "Blood pools rapidly at their feet!",
      "The devastating wound threatens to fell them!",
      "They blanch as blood flows like a river!",
      "A spray of red mist fills the air!",
      "The mortal wound bleeds frighteningly!",
      "They cry out, blood streaming between fingers!",
      "The savage cut opens them to the bone!",
      "Blood spurts with each desperate heartbeat!",
      "They sway, weakening from blood loss!",
      "The terrible gash threatens their life!",
      "Crimson stains spread rapidly!",
      "They stagger, vision blurring from the blood loss!"
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
      "A red line marks the strike.",
      "Crimson beads along the cut.",
      "Blood seeps from the wound.",
      "They hiss in pain as it bleeds.",
      "The wound weeps blood.",
      "A red stain spreads.",
      "They flinch as blood flows.",
      "The cut opens and bleeds.",
      "Blood drips steadily.",
      "They grunt, blood running.",
      "A scarlet line appears.",
      "The wound parts, revealing red.",
      "Blood traces down from the cut.",
      "They wince, touching the bloody wound.",
      "Crimson wells up from the slash.",
      "The blade leaves a bleeding mark.",
      "Blood flows down their skin.",
      "They grimace at the stinging cut.",
      "The wound bleeds freely.",
      "A red trail marks the strike.",
      "Blood escapes the parted flesh.",
      "They curse as it starts bleeding.",
      "The cut bleeds visibly.",
      "Crimson drips from the wound.",
      "They grit their teeth as blood flows.",
      "The slash draws considerable blood.",
      "Blood runs from the open wound.",
      "They stagger slightly, bleeding.",
      "The cut bleeds more than expected.",
      "Crimson stains their clothing.",
      "They press a hand to the bleeding cut.",
      "Blood streams from the laceration.",
      "The wound opens, bleeding steadily.",
      "They wince, blood soaking through.",
      "A red stain blooms and spreads.",
      "Blood drips to the ground.",
      "They stumble, clutching the bleeding wound."
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
      "They stumble, desperately clutching the wound!",
      "The point exits through their back!",
      "They're run completely through!",
      "Blood gushes from both entry and exit wounds!",
      "They cough blood as vital organs are pierced!",
      "The deep puncture reaches internal organs!",
      "They look down at the weapon protruding from them!",
      "Blood bubbles from the terrible puncture!",
      "They're pinned by the impaling strike!",
      "The wound bleeds from front and back!",
      "They gasp, eyes wide with shock!",
      "Blood spurts rhythmically from the deep hole!",
      "The penetrating wound is catastrophic!",
      "They slump forward on the impaling weapon!",
      "Blood pours from the through-and-through wound!",
      "The transfixing blow leaves them gasping!",
      "They're skewered completely!",
      "Blood streams down the weapon's length!",
      "The mortal puncture bleeds internally!",
      "They choke as blood fills vital cavities!",
      "The deep wound penetrates to the core!",
      "They stagger, struggling to breathe!",
      "Blood froths from the punctured lung!",
      "The devastating wound runs them through!",
      "They're impaled to the hilt!",
      "Blood wells up around the embedded weapon!",
      "The piercing strike finds their heart!",
      "They gasp, blood trickling from their mouth!",
      "The terrible wound bleeds internally and externally!",
      "They clutch at the protruding weapon!",
      "Blood flows freely from the gaping puncture!",
      "The hole is frighteningly deep!",
      "They're stuck fast by the impalement!",
      "Blood spurts with alarming force!",
      "The wound bleeds catastrophically!",
      "They sway, weakening rapidly from blood loss!"
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
      "The wound weeps blood.",
      "Crimson wells from the puncture.",
      "They hiss as the point drives in.",
      "Blood oozes from the entry wound.",
      "The hole bleeds visibly.",
      "They flinch at the stabbing pain.",
      "A red stain blooms around the puncture.",
      "Blood flows from the pierced flesh.",
      "They grimace as it penetrates.",
      "The wound bleeds more than expected.",
      "Crimson seeps steadily.",
      "They grunt, pressing a hand to it.",
      "Blood trickles down from the hole.",
      "The puncture is deeper than it looks.",
      "They gasp at the sharp intrusion.",
      "Blood drips from the penetration.",
      "The wound throbs and bleeds.",
      "They wince, blood staining cloth.",
      "Crimson spreads from the entry point.",
      "The puncture bleeds freely.",
      "They stagger slightly from the blow.",
      "Blood runs from the pierced area.",
      "The wound pulses with each heartbeat.",
      "They curse as blood flows.",
      "Crimson marks the strike.",
      "The puncture weeps steadily.",
      "They grip the bleeding wound.",
      "Blood escapes the narrow hole.",
      "The wound is clean but deep.",
      "They stumble, blood flowing.",
      "Crimson drips to the ground.",
      "The penetration bleeds considerably.",
      "They pale as blood seeps out.",
      "The wound bleeds with each movement.",
      "Blood stains spreading.",
      "They press hard against the bleeding puncture."
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
      "They gasp, the wind knocked from them!",
      "Multiple bones shatter!",
      "The blow caves in their defense!",
      "They crumple like paper!",
      "A grotesque dent appears!",
      "They vomit from the gut blow!",
      "Ribs splinter audibly!",
      "The concussive force drops them!",
      "They go limp from the impact!",
      "The crushing blow breaks something vital!",
      "They wheeze, unable to breathe!",
      "The devastating impact fells them!",
      "They collapse in a heap!",
      "The bone-shattering strike staggers them!",
      "They cough blood from internal injury!",
      "The tremendous force knocks them sprawling!",
      "They're driven to the ground!",
      "The pulverizing blow breaks them!",
      "They slump, consciousness flickering!",
      "The impact ruptures internal organs!",
      "They reel drunkenly from the concussion!",
      "Teeth fly from the facial blow!",
      "The skull-cracking strike stuns them!",
      "They go cross-eyed from the impact!",
      "The brutal blow buckles them!",
      "They're flattened by the force!",
      "The crushing impact drives air from lungs!",
      "They stagger, vision blurred!",
      "The catastrophic blow devastates them!",
      "They cry out, bones breaking!",
      "The massive trauma drops them!",
      "They fall, clutching the crushed area!",
      "The shattering impact leaves them broken!",
      "They reel, balance gone!",
      "The tremendous blow sends them reeling!",
      "They drop, legs buckling!"
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
      "They stumble from the force.",
      "The hit makes them gasp.",
      "They absorb the heavy blow.",
      "The impact jars them.",
      "They reel from the strike.",
      "A nasty bruise forms.",
      "They grunt in pain.",
      "The force drives them back.",
      "They stagger from the hit.",
      "The blow knocks the wind from them.",
      "They wheeze from the impact.",
      "The strike leaves them aching.",
      "They rock back on their heels.",
      "The heavy blow staggers them.",
      "They wince at the brutal impact.",
      "The force rattles their teeth.",
      "They grimace, feeling the impact.",
      "The blow lands with crushing force.",
      "They flinch from the pain.",
      "The impact drives them aside.",
      "They gasp at the heavy strike.",
      "The force sends them reeling.",
      "They grunt, absorbing the blow.",
      "The impact leaves them dazed.",
      "They stagger, head ringing.",
      "The blow makes their ears ring.",
      "They stumble backward.",
      "The strike leaves them stunned.",
      "They wince, pain radiating.",
      "The heavy impact bruises badly.",
      "They reel from the force.",
      "The blow lands with a crunch.",
      "They grunt, pain spreading.",
      "The impact drives them to one knee.",
      "They gasp, ribs aching.",
      "The force nearly bowls them over."
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
      "Fire clings to them tenaciously!",
      "Flames engulf them completely!",
      "Their skin bubbles and chars!",
      "They're consumed by fire!",
      "Smoke pours from the burning wound!",
      "They thrash as flames spread!",
      "The stench of burnt flesh is overwhelming!",
      "Their clothing ignites like tinder!",
      "Flames dance across their body!",
      "They collapse, burning!",
      "Charred flesh falls away!",
      "The inferno consumes them!",
      "They're set ablaze!",
      "Flames roar across them!",
      "Burning fat sizzles and pops!",
      "They're wreathed in fire!",
      "The conflagration spreads rapidly!",
      "Third-degree burns cover them!",
      "They glow red with heat!",
      "Embers fall from the burned area!",
      "The fire spreads like wildfire!",
      "They're turned to a living torch!",
      "Flames lick hungrily across them!",
      "The burning is catastrophic!",
      "They scream in agony from the fire!",
      "Their flesh is blackened and crisp!",
      "The heat is absolutely devastating!",
      "They're cooked alive!",
      "Fire spreads across their entire form!",
      "The flames show no mercy!",
      "They're reduced to charcoal!",
      "The burning penetrates to the bone!",
      "They drop and roll desperately!",
      "The fire refuses to be extinguished!",
      "They're immolated before your eyes!",
      "Ash and cinders fly!"
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
      "Heat radiates from the burn.",
      "Their skin blisters painfully.",
      "Smoke curls from the burned spot.",
      "They hiss from the burning pain.",
      "The heat is intense.",
      "Redness spreads across the burn.",
      "They flinch from the flames.",
      "A scorch mark forms.",
      "The skin blackens slightly.",
      "They gasp at the searing heat.",
      "The burn smolders.",
      "Heat waves shimmer above it.",
      "They wince at the fiery pain.",
      "The smell of burning drifts by.",
      "Blisters bubble up.",
      "They curse from the heat.",
      "The burn throbs with heat.",
      "Singed hair smells acrid.",
      "They recoil from the fire.",
      "The area glows red-hot.",
      "They groan from the burning.",
      "Char marks appear.",
      "The flames sting badly.",
      "They shake off the embers.",
      "Heat permeates the area.",
      "A red welt forms.",
      "They grimace from burning pain.",
      "The fire leaves its mark.",
      "Smoke wisps from their clothes.",
      "They frantically pat out flames.",
      "The heat is agonizing.",
      "Their skin reddens badly.",
      "They yelp from the fire.",
      "The burn looks severe.",
      "Flames lick across briefly.",
      "They stumble from the heat."
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
      "They shake uncontrollably!",
      "They're encased in ice!",
      "Frost spreads rapidly across them!",
      "They freeze in place!",
      "Their blood chills to ice!",
      "Icicles form on their body!",
      "They're frozen solid!",
      "The cold penetrates to the bone!",
      "They become a frozen statue!",
      "Hoarfrost blankets them!",
      "They're locked in ice!",
      "The freezing is catastrophic!",
      "They crystallize before your eyes!",
      "Ice cracks across their skin!",
      "They're chilled to absolute zero!",
      "Frozen vapor clouds around them!",
      "Their movements slow to nothing!",
      "They're flash-frozen!",
      "Ice creeps across every inch!",
      "They gasp frozen breath!",
      "The cold shatters them!",
      "They're turned to ice!",
      "Frost consumes them entirely!",
      "They collapse, frozen!",
      "Ice encrusts every surface!",
      "The cold is killing!",
      "They're preserved in ice!",
      "Frozen crystals coat them!",
      "They're chilled to death!",
      "Ice spreads like infection!",
      "They're locked in permafrost!",
      "The freezing is total!",
      "They're glaciated completely!",
      "Cold vapor billows from them!",
      "They're frozen through!",
      "Ice locks their joints!"
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
      "They shudder involuntarily.",
      "Their skin pales from cold.",
      "Frost nips at them.",
      "They tremble from the chill.",
      "Ice forms on the surface.",
      "They wince from the cold.",
      "Their teeth chatter.",
      "Numbness spreads.",
      "They shake off the frost.",
      "The cold bites deep.",
      "They groan from the chill.",
      "Rime appears briefly.",
      "They flinch from the cold.",
      "The chill penetrates.",
      "They shiver violently.",
      "Frost clings to them.",
      "They curse the cold.",
      "The freezing aches.",
      "They huddle from chill.",
      "Ice crystals tinkle.",
      "They gasp at the freeze.",
      "The cold numbs them.",
      "They shake uncontrollably.",
      "Frost spreads across them.",
      "They grimace from cold.",
      "The chill is painful.",
      "They recoil sharply.",
      "Ice forms and melts.",
      "They wince badly.",
      "The cold stings.",
      "They groan in discomfort.",
      "Frost coats lightly.",
      "They shudder deeply.",
      "The freezing hurts.",
      "They yelp from cold.",
      "Ice glimmers briefly."
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
      "Lightning arcs between limbs!",
      "They're electrocuted catastrophically!",
      "Current flows uncontrollably through them!",
      "They spasm and convulse violently!",
      "Electrical burns appear instantly!",
      "They're lit up like a lightning rod!",
      "Voltage surges through every nerve!",
      "They're shocked into unconsciousness!",
      "Electricity arcs across their frame!",
      "They're thrown by the electrical force!",
      "Current finds every nerve ending!",
      "They're paralyzed by the shock!",
      "Lightning dances across their skin!",
      "They collapse in convulsions!",
      "Electricity courses lethally through them!",
      "They're struck as by lightning!",
      "Current locks their muscles!",
      "They're electrified completely!",
      "Voltage overloads their system!",
      "They're jolted into submission!",
      "Electrical energy devastates them!",
      "They're shocked to the core!",
      "Current runs rampant through them!",
      "They're electrocuted thoroughly!",
      "Lightning strikes them directly!",
      "They're hit with full voltage!",
      "Electricity fries their nerves!",
      "They're shocked catastrophically!",
      "Current flows through unabated!",
      "They're struck by thunderbolt!",
      "Voltage courses destructively!",
      "They're electrified fatally!",
      "Electricity ravages their body!",
      "They're shocked into paralysis!",
      "Current surges devastatingly!",
      "They're hit by lightning!"
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
      "Nerves fire randomly.",
      "They wince from the current.",
      "Muscles spasm briefly.",
      "They recoil from the shock.",
      "Static electricity snaps.",
      "They shudder from voltage.",
      "The jolt startles them.",
      "They grimace from current.",
      "Electricity makes them jump.",
      "They curse the shock.",
      "Nerves tingle painfully.",
      "They flinch badly.",
      "The current stings.",
      "They shake involuntarily.",
      "Static makes hair rise.",
      "They yelp from the jolt.",
      "Electricity courses briefly.",
      "They groan from the shock.",
      "Muscles clench tight.",
      "They recoil sharply.",
      "The jolt is painful.",
      "They gasp in surprise.",
      "Current flows through.",
      "They stumble awkwardly.",
      "The shock catches them.",
      "They wince in pain.",
      "Electricity zaps them.",
      "They shake it off.",
      "The current hurts.",
      "They jerk reflexively.",
      "Voltage stings badly.",
      "They hiss from shock.",
      "The electricity bites.",
      "They twitch noticeably.",
      "Current makes them jump.",
      "They groan uncomfortably."
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

// ========================================
// ANATOMY METADATA SYSTEM
// ========================================

/**
 * Maps location keywords to anatomy types present in those locations
 * Used to filter anatomically-specific damage verbs
 */
const LOCATION_ANATOMY_MAP = {
  // Skeletal structures
  skull: ['bone', 'skull'],
  head: ['bone', 'skull', 'flesh'],
  brain: ['bone', 'skull', 'organ'],
  cranium: ['bone', 'skull'],

  // Torso and chest
  chest: ['bone', 'ribs', 'chest', 'flesh', 'organ'],
  ribcage: ['bone', 'ribs', 'chest'],
  ribs: ['bone', 'ribs'],
  sternum: ['bone', 'chest'],
  torso: ['bone', 'ribs', 'chest', 'flesh', 'organ'],

  // Spine and back
  spine: ['bone', 'spine'],
  back: ['bone', 'spine', 'flesh'],
  vertebrae: ['bone', 'spine'],

  // Neck and throat
  neck: ['bone', 'spine', 'flesh', 'windpipe'],
  throat: ['flesh', 'windpipe'],
  windpipe: ['windpipe'],

  // Limbs
  arm: ['bone', 'flesh', 'muscle'],
  leg: ['bone', 'flesh', 'muscle'],
  wing: ['bone', 'flesh', 'muscle'],
  tail: ['bone', 'flesh', 'muscle'],
  tentacle: ['flesh', 'muscle'],

  // Organs
  heart: ['organ'],
  liver: ['organ'],
  lung: ['organ'],
  kidney: ['organ'],
  stomach: ['organ'],
  intestine: ['organ'],
  organ: ['organ'],

  // Mouth and face
  jaw: ['bone', 'skull'],
  mouth: ['flesh'],
  face: ['bone', 'skull', 'flesh'],
  eye: ['flesh'],
  ear: ['flesh'],

  // Generic anatomy
  bone: ['bone'],
  flesh: ['flesh'],
  muscle: ['muscle'],
  sinew: ['muscle'],
  skin: ['flesh'],
  hide: ['flesh'],
  scales: ['flesh']
};

/**
 * Maps damage verbs to required anatomy types
 * Empty array means the verb is generic and works with any anatomy
 */
const VERB_ANATOMY_REQUIREMENTS = {
  // Bone-specific verbs
  "splinters bone in": ['bone'],
  "pulverizes bone in": ['bone'],
  "hammers through bone in": ['bone'],
  "pierces through bone in": ['bone'],
  "shatters bone in": ['bone'],
  "breaks multiple bones in": ['bone'],
  "parts flesh and bone in": ['bone'],
  "cuts deep to the bone in": ['bone'],
  "scorch to the bone": ['bone'],
  "chill to the bone": ['bone'],

  // Rib-specific verbs
  "caves in ribs in": ['ribs'],
  "splinters ribs in": ['ribs'],
  "drives through ribs into": ['ribs'],

  // Skull-specific verbs
  "shatters the skull of": ['skull'],
  "cracks the skull of": ['skull'],

  // Spine/back-specific verbs
  "fractures the spine of": ['spine'],
  "crushes vertebrae in": ['spine'],
  "breaks the back of": ['spine'],

  // Chest-specific verbs
  "crushes the chest of": ['chest'],
  "collapses the sternum of": ['chest'],

  // Windpipe-specific verbs
  "crushes the windpipe of": ['windpipe'],

  // Organ-specific verbs
  "pulverizes vital organs in": ['organ'],
  "penetrates to vital organs in": ['organ'],

  // Muscle-specific verbs
  "slices through muscle and sinew in": ['muscle']

  // All other verbs are generic (no entry = no requirements)
};

/**
 * Extract anatomy types from a location string
 * @param {string} location - The location string (e.g., "rotting chest", "skull")
 * @returns {string[]} Array of anatomy types present in this location
 */
export function getLocationAnatomy(location) {
  if (!location) return ['flesh']; // Default fallback

  const anatomyTags = new Set();
  const locationLower = location.toLowerCase();

  // Check each keyword in the location anatomy map
  for (const [keyword, tags] of Object.entries(LOCATION_ANATOMY_MAP)) {
    if (locationLower.includes(keyword)) {
      tags.forEach(tag => anatomyTags.add(tag));
    }
  }

  // If no specific anatomy found, assume generic flesh/soft tissue
  if (anatomyTags.size === 0) {
    anatomyTags.add('flesh');
  }

  return Array.from(anatomyTags);
}

/**
 * Filter verbs based on location anatomy
 * @param {string[]} verbs - Array of possible verbs
 * @param {string[]} locationAnatomy - Anatomy types present in the location
 * @returns {string[]} Filtered array of anatomically-appropriate verbs
 */
function filterVerbsByAnatomy(verbs, locationAnatomy) {
  const filtered = verbs.filter(verb => {
    const requirements = VERB_ANATOMY_REQUIREMENTS[verb];

    // If no requirements specified, verb is generic and always allowed
    if (!requirements || requirements.length === 0) {
      return true;
    }

    // Check if location has all required anatomy types
    return requirements.every(req => locationAnatomy.includes(req));
  });

  // If filtering eliminated all verbs, return original list as fallback
  return filtered.length > 0 ? filtered : verbs;
}

/**
 * Get verb for damage type and outcome
 * @param {string} damageType
 * @param {string} outcome
 * @param {string} varietyMode - Variety setting
 * @param {string[]} locationAnatomy - Optional anatomy types of the target location
 * @returns {string|null}
 */
export function getDamageVerb(damageType, outcome, varietyMode = 'high', locationAnatomy = null) {
  const data = DAMAGE_VERBS[damageType];
  if (!data || !data[outcome]) return null;

  let verbs = data[outcome];

  // Filter by anatomy if location anatomy is provided
  if (locationAnatomy && locationAnatomy.length > 0) {
    verbs = filterVerbsByAnatomy(verbs, locationAnatomy);
  }

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
 * Detect natural weapon from item name
 * @param {Object} item - The weapon/attack item
 * @returns {string|null} Natural weapon descriptor or null
 */
function detectNaturalWeapon(item) {
  if (!item || !item.name) return null;

  const name = item.name.toLowerCase();

  // Comprehensive natural weapon detection based on PF2e creature data
  // Ordered by specificity to avoid false matches

  // Bite/Jaw attacks (most common)
  if (name.includes('bite')) return "Your jaws";
  if (name.includes('jaw') || name.includes('jaws')) return "Your jaws";
  if (name.includes('fangs') || name.includes('fang')) return "Your fangs";
  if (name.includes('teeth')) return "Your teeth";
  if (name.includes('beak')) return "Your beak";

  // Claw/Talon attacks
  if (name.includes('talons') || name.includes('talon')) return "Your talons";
  if (name.includes('claw') || name.includes('claws')) return "Your claws";

  // Horn/Gore attacks
  if (name.includes('gore')) return "Your horns";
  if (name.includes('horn') || name.includes('horns')) return "Your horns";
  if (name.includes('antler') || name.includes('antlers')) return "Your antlers";
  if (name.includes('tusk') || name.includes('tusks')) return "Your tusks";

  // Tail attacks
  if (name.includes('tail slap')) return "Your tail";
  if (name.includes('tail sweep')) return "Your tail";
  if (name.includes('tail')) return "Your tail";

  // Tentacle/Appendage attacks
  if (name.includes('tentacle') || name.includes('tentacles')) return "Your tentacles";
  if (name.includes('pseudopod')) return "Your pseudopod";
  if (name.includes('tendril') || name.includes('tendrils')) return "Your tendrils";

  // Wing attacks
  if (name.includes('wing buffet')) return "Your wings";
  if (name.includes('wing') || name.includes('wings')) return "Your wings";

  // Stinger/Spine attacks
  if (name.includes('sting') || name.includes('stinger')) return "Your stinger";
  if (name.includes('spine') || name.includes('spines')) return "Your spines";
  if (name.includes('quill') || name.includes('quills')) return "Your quills";

  // Hoof/Foot attacks
  if (name.includes('hoof') || name.includes('hooves')) return "Your hooves";
  if (name.includes('kick')) return "Your foot";
  if (name.includes('foot') || name.includes('feet')) return "Your foot";

  // Pincer/Mandible attacks
  if (name.includes('pincer') || name.includes('pincers')) return "Your pincers";
  if (name.includes('mandible') || name.includes('mandibles')) return "Your mandibles";

  // Plant attacks
  if (name.includes('vine') || name.includes('vines')) return "Your vines";
  if (name.includes('branch') || name.includes('branches')) return "Your branches";

  // Trunk/Proboscis
  if (name.includes('trunk')) return "Your trunk";
  if (name.includes('proboscis')) return "Your proboscis";

  // Slam/Fist attacks
  if (name.includes('slam')) return "Your strike";
  if (name.includes('fist') || name.includes('fists')) return "Your fists";

  // Head attacks
  if (name.includes('head butt') || name.includes('headbutt')) return "Your head";
  if (name.includes('ram')) return "Your head";

  // Touch attacks (incorporeal/magical)
  if (name.includes('touch') && (name.includes('incorporeal') || name.includes('corrupting'))) return "Your touch";

  return null;
}

/**
 * Get weapon type descriptor
 * @param {string} damageType
 * @param {Object} item - Optional weapon/attack item for natural weapon detection
 * @param {string} pov - Point of view: "second" (Your weapon) or "third" (The weapon)
 * @returns {string}
 */
export function getWeaponType(damageType, item = null, pov = "second") {
  // Check for natural weapons first
  if (item) {
    const naturalWeapon = detectNaturalWeapon(item);
    if (naturalWeapon) {
      return pov === "third" ? naturalWeapon.replace("Your", "The") : naturalWeapon;
    }
  }

  // Fall back to damage type
  const data = DAMAGE_VERBS[damageType];
  const weaponType = data ? data.weaponType : "Your weapon";

  return pov === "third" ? weaponType.replace("Your", "The") : weaponType;
}
