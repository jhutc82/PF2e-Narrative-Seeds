# PF2e Narrative Seeds

> **Automated narrative inspiration for every roll in Pathfinder 2e**

Transform your Pathfinder 2e games with automatically generated, contextual narrative descriptions that bring combat to life. Never struggle for combat descriptions again!

[![Foundry Version](https://img.shields.io/badge/Foundry-v12+-blue)](https://foundryvtt.com)
[![PF2e System](https://img.shields.io/badge/System-PF2e-green)](https://foundryvtt.com/packages/pf2e)
[![License](https://img.shields.io/badge/License-MIT-orange)](LICENSE)

---

## ✨ What is This?

**PF2e Narrative Seeds** is a comprehensive narrative generation system that provides GMs with instant, contextual description seeds for all aspects of PF2e gameplay. It automatically detects attack rolls, analyzes creature types and damage types, then generates varied, vivid descriptions whispered to the GM.

### Seeds, Not Scripts

This module provides **inspiration**, not rigid text. Use descriptions verbatim or adapt them to your style. They're designed to reduce cognitive load during sessions while maintaining your unique narrative voice.

---

## 🎯 Current Features (Phase 1: Combat)

### ✅ **Automatic Combat Narration**
- **25+ creature anatomy types** - From humanoids to oozes, each with unique hit locations
- **13 damage type variations** - Fire, cold, acid, slashing, and more
- **1.6 million+ unique combinations** - Virtually endless variety
- **Smart detection** - Automatically identifies creature types and damage types
- **4 outcome types** - Critical success, success, failure, critical failure

### ✅ **Intelligent Context Detection**
- Recognizes PF2e Strike actions automatically
- Detects creature anatomy from traits and names
- Extracts damage types from weapons and spells
- Adapts descriptions to attack outcomes

### ✅ **Highly Configurable**
- **4 detail levels**: Minimal, Standard, Detailed, Cinematic
- **4 tone settings**: Family-friendly, Standard, Gritty, Dark Fantasy
- **3 visibility modes**: GM only, Everyone, GM + Acting Player
- **4 variety levels**: Low, Medium, High, Extreme (never repeat)
- **Show/hide anatomy types** in output

### ✅ **GM-Friendly Design**
- Zero setup required - works immediately after enabling
- Whispered to GM by default (configurable)
- Never interrupts player flow
- Styled, easy-to-read chat cards
- Optional cinematic mode with action buttons

---

## 📋 Examples

### Standard Detail (Default)
```
⚔️ Combat Narrative Seed [Humanoid]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Attacker: Valeros | Target: Bandit | Outcome: Success
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your blade lands solidly, cutting across their left shoulder.
Blood wells from the cut.
```

### Cinematic Detail
```
⚔️ Combat Narrative Seed [Troll] 🎬
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Attacker: Seelah | Target: Cave Troll
Damage: Slashing | Outcome: CRITICAL SUCCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time seems to slow as Seelah's longsword arcs through
the air. The blade cleaves brutally through the Cave
Troll's exposed throat with crushing force! Blood sprays
in a crimson arc as the troll's eyes go wide. It staggers
backward, clutching desperately at the mortal wound!

[💡 Narrate Now] [🎲 Reroll Description] [📋 Copy]
```

### Minimal Detail
```
⚔️ Combat Narrative Seed
━━━━━━━━━━━━━━━━━━━━━
Left shoulder
```

---

## 🎭 Supported Anatomy Types

The module intelligently detects **25+ creature anatomy types**, each with custom hit locations:

### Standard Fantasy
- **Humanoid** - Humans, elves, orcs, goblins
- **Giant** - Hill giants, stone giants, ogres
- **Quadruped** - Wolves, bears, lions, horses
- **Serpent** - Snakes, nagas
- **Avian** - Eagles, rocs, bird-like creatures
- **Aquatic** - Sharks, eels, fish
- **Insectoid** - Giant spiders, scorpions, beetles

### Undead
- **Skeleton** - Animated bones
- **Zombie** - Rotting corpses
- **Incorporeal** - Ghosts, wraiths, shadows
- **Undead (General)** - Vampires, wights, mummies

### Special Creatures
- **Construct** - Golems, animated armor
- **Amorphous** - Oozes, slimes, gelatinous cubes
- **Plant** - Assassin vines, mandragora
- **Troll** - Regenerating trolls
- **Owlbear** - Owl-bear hybrids

### Kingmaker-Specific
- **Worg** - Intelligent wolves
- **Scythe Tree** - Animated trees
- **Shambling Mound** - Swamp creatures
- **Will-o'-Wisp** - Floating lights
- **Cyclops** - One-eyed giants

### Fey
- **Fey Humanoid** - Nymphs, dryads, satyrs
- **Tiny Fey** - Sprites, grigs, pixies
- **Small Fey** - Redcaps, quicklings
- **Fey (General)** - Other fey creatures

**And more!** Easily extensible for other Adventure Paths.

---

## 🔥 Damage Types

All **13 PF2e damage types** fully supported:

### Physical
- **Slashing** - Swords, axes, claws
- **Piercing** - Spears, arrows, fangs
- **Bludgeoning** - Clubs, fists, hammers

### Energy
- **Fire** - Flames, heat, burning
- **Cold** - Ice, frost, freezing
- **Electricity** - Lightning, shock
- **Sonic** - Thunder, sound waves
- **Acid** - Corrosive liquid

### Special
- **Poison** - Toxins, venom
- **Force** - Magical energy
- **Mental** - Psychic damage
- **Vitality** - Life energy
- **Void** - Death energy

Each damage type has **10+ unique verbs and effects** for each outcome level!

---

## 📥 Installation

### Method 1: Manifest URL (Recommended)
1. In Foundry VTT, go to **Add-on Modules**
2. Click **Install Module**
3. Paste this manifest URL:
   ```
   https://github.com/jhutc82/PF2e-Narrative-Seeds/releases/latest/download/module.json
   ```
4. Click **Install**

### Method 2: Manual Installation
1. Download the latest release ZIP
2. Extract to `FoundryVTT/Data/modules/pf2e-narrative-seeds`
3. Restart Foundry VTT
4. Enable in **Add-on Modules**

---

## ⚙️ Configuration

Once installed and activated, configure the module in **Game Settings > Module Settings > PF2e Narrative Seeds**.

### Core Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Enable Module** | ✅ Yes | Master switch for all features |
| **Narrative Visibility** | GM Only | Who sees the descriptions |
| **Content Tone** | Standard (PG-13) | How graphic descriptions are |
| **Variety Level** | High | How much variation in descriptions |

### Combat Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Enable Combat Narration** | ✅ Yes | Generate attack descriptions |
| **Combat Detail Level** | Standard | Amount of information included |
| **Show Anatomy Type** | ✅ Yes | Display detected creature type |

### Visibility Modes
- **GM Only (Whispered)** - Default, only GMs see descriptions
- **Everyone** - Public messages visible to all
- **GM + Acting Player** - GM and the attacking player see it

### Detail Levels
- **Minimal** - Just the location (e.g., "Left shoulder")
- **Standard** - Location + effect (e.g., "Your blade cuts their shoulder. Blood wells.")
- **Detailed** - Full description with target name
- **Cinematic** - Maximum drama with action buttons

### Tone Settings
- **Family Friendly (PG)** - Softens violent language
- **Standard (PG-13)** - Balanced descriptions *(default)*
- **Gritty & Realistic (R)** - More visceral details
- **Dark Fantasy (R+)** - Maximum intensity

---

## 🎮 Usage

### Automatic Operation
Once enabled, the module works **automatically**:

1. ✅ **Enable module** in Add-on Modules
2. ✅ **Configure settings** (optional)
3. ✅ **Play as normal** - descriptions appear automatically!

When a player makes a Strike action:
1. Module detects the attack roll
2. Identifies target creature anatomy
3. Extracts weapon damage type
4. Generates contextual description
5. Whispers result to GM (or configured recipients)

### No Manual Intervention Needed
- No buttons to click
- No macros to run
- No commands to remember
- Just play naturally!

---

## 🔮 Planned Features

### Phase 2: Spell Effects 🔮
*Coming Soon*
- Narrative descriptions for spell casting
- School-based effects (evocation, illusion, etc.)
- Visual manifestations of somatic components
- Target reaction descriptions
- Area effect descriptions

### Phase 3: Skill Check Outcomes 🎲
*Planned*
- Success/failure narratives for all skills
- Athletics, Stealth, Diplomacy, and more
- Context-aware descriptions
- Critical success/failure special descriptions

### Phase 4: Exploration Activities 🗺️
*Planned*
- Hexploration encounter descriptions
- Weather effect narration
- Travel montage seeds
- Camp activity outcomes

### Phase 5: Critical Fumbles/Successes 💫
*Planned*
- Special narrative consequences
- Critical fumble tables with effects
- Critical success dramatic moments
- Environmental interactions

### Phase 6: Condition Applications 🩹
*Planned*
- Descriptions when conditions applied
- How creatures show fear (Frightened)
- Physical manifestations (Sickened)
- All PF2e conditions covered

---

## 🛠️ Technical Details

### Architecture
- **Modular design** - Easy to extend with new phases
- **ES6 modules** - Modern JavaScript
- **Separation of concerns** - Data separate from logic
- **Performance optimized** - <50ms generation time
- **Extensible** - Plugin architecture for future phases

### File Structure
```
pf2e-narrative-seeds/
├── scripts/
│   ├── main.js                 # Entry point
│   ├── settings.js             # Settings registration
│   ├── utils.js                # Shared utilities
│   └── combat/                 # Phase 1: Combat
│       ├── combat-hooks.js     # Attack detection
│       ├── anatomy-detector.js # Creature identification
│       ├── damage-detector.js  # Damage type extraction
│       ├── combat-generator.js # Description assembly
│       └── combat-formatter.js # Chat card creation
├── data/
│   └── combat/
│       ├── anatomy-types.js    # 25+ anatomy definitions
│       ├── locations.js        # ~2,080 hit locations
│       └── damage-descriptors.js # ~260 verbs & effects
├── styles/
│   └── main.css                # Chat card styling
└── lang/
    └── en.json                 # Localization
```

### Data Volume
- **~2,600 unique text entries**
- **1.6 million+ possible combinations**
- **25+ anatomy types with full location tables**
- **13 damage types with full descriptor tables**

### Requirements
- **Foundry VTT**: V12+ (V13 compatible)
- **Game System**: Pathfinder 2e (PF2e) **ONLY**
- **Dependencies**: None

---

## 🤝 Compatibility

### Tested With
- ✅ Foundry VTT V12
- ✅ Foundry VTT V13
- ✅ PF2e System 5.0+
- ✅ PF2e System 6.0+

### Known Compatible Modules
- ✅ PF2e Workbench
- ✅ PF2e Keybinds
- ✅ Monk's modules
- ✅ Dice So Nice
- ✅ Most automation modules

### Performance
- **<50ms** per description generation
- **<5MB** additional memory usage
- **No FPS impact** during combat
- Async processing where possible

---

## 🐛 Troubleshooting

### Descriptions Not Appearing
1. Check module is enabled in **Add-on Modules**
2. Verify **Enable Combat Narration** is ON in settings
3. Ensure you're using the **PF2e system**
4. Check you're making **Strike actions** (not spell attacks)

### Wrong Anatomy Detected
- Some creatures may need manual trait assignment
- Report issues with specific creatures on GitHub
- Module uses PF2e traits + name matching

### Performance Issues
- Try reducing **Variety Level** to Medium or Low
- Switch to **Minimal** detail level
- Disable future phases when released

### Need Help?
- 📖 Check the [Wiki](https://github.com/jhutc82/PF2e-Narrative-Seeds/wiki)
- 🐛 Report bugs on [GitHub Issues](https://github.com/jhutc82/PF2e-Narrative-Seeds/issues)
- 💬 Ask questions in the Foundry Discord

---

## 📝 License

This module is licensed under the [MIT License](LICENSE).

You are free to:
- ✅ Use in personal and commercial games
- ✅ Modify for your own needs
- ✅ Distribute and share
- ✅ Create derivative works

---

## 🙏 Credits

### Created By
**Justin Hutchinson** - *Module Development*

### Special Thanks
- Pathfinder 2e Remastered by Paizo
- Foundry VTT community
- PF2e system developers
- All playtesters and contributors

### Inspiration
Created to solve the common GM problem: "I need a combat description... uh... you hit their... shoulder?"

Now you'll never be at a loss for words again!

---

## 🚀 Roadmap

- [x] **Phase 1: Combat Narration** - *Released v1.0.0*
- [ ] **Phase 2: Spell Effects** - *In Development*
- [ ] **Phase 3: Skill Checks** - *Planned*
- [ ] **Phase 4: Exploration** - *Planned*
- [ ] **Phase 5: Critical Events** - *Planned*
- [ ] **Phase 6: Conditions** - *Planned*

---

## ❤️ Support Development

If you enjoy this module:
- ⭐ Star the [GitHub repository](https://github.com/jhutc82/PF2e-Narrative-Seeds)
- 🐛 Report bugs and request features
- 📖 Contribute to documentation
- 🔧 Submit pull requests

---

## 📊 Statistics

- **25+** unique anatomy types
- **13** damage types fully supported
- **~2,600** unique text entries
- **1.6 million+** possible combinations
- **<50ms** generation time
- **0** setup required

---

**Transform your Pathfinder 2e combat narration today! Never struggle for descriptions again!**

*"Seeds, not scripts. Inspiration, not obligation."*

---

## 📚 Quick Start Guide

1. **Install** the module
2. **Enable** in Add-on Modules
3. **Configure** settings (optional)
4. **Play** normally - descriptions appear automatically!
5. **Adapt** descriptions to your narrative style

That's it! Enjoy vivid, varied combat descriptions for every attack!

---

**Made with ❤️ for the Foundry VTT and Pathfinder 2e communities**
