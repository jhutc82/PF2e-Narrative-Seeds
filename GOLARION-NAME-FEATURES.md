# 🌟 Golarion-Specific Name Generation Features

This document showcases the powerful Golarion-specific enhancements to the name generation system.

## Overview

The advanced name generator now provides:
- **Regional Variations** - Culturally appropriate names for different Golarion regions
- **Titles & Honorifics** - Context-aware noble, religious, military titles
- **Epithets & Descriptors** - Legendary surnames based on deeds, origins, and characteristics
- **Name Etymology** - Meaningful names with translations and lore
- **Context-Aware Generation** - Names that reflect class, deity, background, and level
- **Heritage Blending** - Mixed ancestry naming conventions

---

## 1. Regional Human Names

Humans across Golarion have distinct naming conventions based on their homeland.

### Available Regions

| Region | Cultural Inspiration | Examples |
|--------|---------------------|----------|
| **Chelaxian** | Imperial Roman + Infernal | Lucius Thrune, Abrogail Vex |
| **Taldan** | Classical Roman/Greek | Maxim Stavian, Eutropia Lebeda |
| **Osirian** | Ancient Egyptian | Hakotep Muminofrah, Nefertiti Djet |
| **Varisian** | Romani/Traveler | Radovan Moonwhisper, Zeldana Harrow |
| **Ulfen** | Norse/Viking | Bjorn Stormborn, Freya Shieldmaiden |
| **Tian** | East Asian | Wei Chang, Sakura Hwan |
| **Garundi** | African | Jabari M'Nket, Amara Zin |
| **Kellid** | Tribal/Proto-Germanic | Amiri Bloodaxe, Thrag Ironskull |

### Usage Example

```javascript
import { AdvancedNameGenerator } from './scripts/social/advanced-name-generator.js';

// Generate a Chelaxian noble
const chelaxianName = await AdvancedNameGenerator.generateAdvanced('human', 'male', {
  region: 'chelaxian',
  background: 'noble',
  level: 10
});
// Result: "Lord Cassius Thrune the Just"

// Generate an Osirian scholar
const osirianName = await AdvancedNameGenerator.generateAdvanced('human', 'female', {
  region: 'osirian',
  class: 'wizard',
  level: 15
});
// Result: "Nefertiti Hakotep the Arcane"

// Generate a Varisian wanderer
const varisianName = await AdvancedNameGenerator.generateAdvanced('human', 'female', {
  region: 'varisian',
  background: 'entertainer',
  deity: 'Desna'
});
// Result: "Zeldana Moonwhisper Starborn"
```

---

## 2. Titles & Honorifics

Titles are automatically added based on character level, class, background, and context.

### Title Categories

**Noble Titles** (30% weight)
- Lord, Lady, Baron, Baroness, Count, Countess, Duke, Duchess, Prince, Princess

**Religious Titles** (25% weight)
- Father, Mother, High Priest, High Priestess, Brother, Sister, Blessed

**Military Titles** (20% weight)
- Captain, Commander, General, Marshal, Knight, Champion, Paladin

**Arcane Titles** (15% weight)
- Archmage, Magister, Sage, Master Wizard

**Common Titles** (10% weight)
- Elder, Merchant, Trader

### Level-Based Probability

| Level | No Title | Simple Title | Complex Title |
|-------|----------|--------------|---------------|
| 1-3   | 70%      | 25%          | 5%            |
| 4-7   | 40%      | 45%          | 15%           |
| 8-12  | 20%      | 50%          | 30%           |
| 13-16 | 10%      | 40%          | 50%           |
| 17-20 | 5%       | 25%          | 70%           |

---

## 3. Epithets & Descriptors

Legendary descriptors that make names memorable and meaningful.

### Epithet Categories

#### **Descriptive** (30% weight)
**Physical:** "the Tall", "the Red", "Ironhand", "Silvertongue"
**Personality:** "the Wise", "the Bold", "the Cunning", "the Swift"
**Reputation:** "the Legendary", "the Feared", "the Beloved"

#### **Heroic** (25% weight)
**Deeds:** "Dragonslayer", "Demonbane", "Lightbringer", "Stormcaller"
**Victories:** "Undefeated", "Victorious", "Unconquered"
**Monsters:** "Wyrmslayer", "Giantslayer", "Lichbane"

#### **Origin** (20% weight)
**Places:** "of Absalom", "of Cheliax", "of Varisia"
**Landmarks:** "of the High Tower", "of Dragonfall", "of Shadowkeep"
**Families:** "of House Thrune", "Firstborn", "Oathbound"

#### **Mystical** (15% weight)
**Divine:** "Godsblessed", "Touched by Fate", "Marked"
**Arcane:** "Spellwoven", "Runebound", "Shadowweaver"
**Nature:** "Stormborn", "Earthborn", "Beastfriend"

#### **Profession** (10% weight)
**Craft:** "the Smith", "the Merchant", "the Healer"
**Combat:** "the Blade", "the Shield", "the Archer"

### Ancestry-Specific Epithets

**Dwarf:**
- Craft: "Forgemaster", "Stonebreaker", "Runescribe", "Deepdelver"
- War: "Shieldwall", "Grudgebearer", "Trollslayer"
- Honor: "Trueheart", "Ironoath", "Steadfast"

**Elf:**
- Magic: "Starweaver", "Moonwhisper", "Spellsinger", "Dreamwalker"
- Nature: "Greenspeaker", "Thornkeeper", "Wildrunner"
- Time: "Ageless", "Ancient One", "Firstborn"

**Halfling:**
- Luck: "Lucky", "Fortunate", "Blessed", "Fateweaver"
- Journey: "Farstrider", "Pathfinder", "Wanderer"
- Hearth: "Goodfellow", "Merrymaker", "Storyteller"

---

## 4. Name Etymology & Meanings

Names are more than sounds—they carry meaning and history.

### Syllable Meanings

**Dwarf Examples:**
- "Thar" = stone, "din" = warrior → **Thardin** = "Stone Warrior"
- "Brok" = forge, "gar" = protector → **Brokgar** = "Forge Protector"
- "Thor" = thunder, "grim" = iron → **Thorgrim** = "Iron Thunder"

**Elf Examples:**
- "Ael" = star, "riel" = daughter/son of stars → **Aelriel** = "Child of Stars"
- "Cal" = light, "andra" = moon → **Calandra** = "Moonlight"
- "Sil" = silver, "wen" = maiden → **Silwen** = "Silver Maiden"

### Meaning Templates

1. **Compound**: "{prefix_meaning} {suffix_meaning}"
   - Brokgar → "Forge Protector"

2. **Possessive**: "{suffix_meaning} of the {prefix_meaning}"
   - Thardin → "Warrior of the Stone"

3. **Descriptive**: "One who is {prefix_meaning} and {suffix_meaning}"
   - Aelriel → "One who is of stars and celestial heritage"

4. **Birthright**: "Born of {prefix_meaning}, keeper of {suffix_meaning}"
   - Thorgrim → "Born of thunder, keeper of iron"

5. **Destiny**: "Destined to be {suffix_meaning} like the {prefix_meaning}"
   - Calandra → "Destined to shine like the moon"

---

## 5. Context-Aware Generation

Names reflect character identity comprehensively.

### Class-Based Epithets

| Class | Typical Epithets |
|-------|------------------|
| Wizard | "the Arcane", "Spellweaver", "the Scholar" |
| Fighter | "the Blade", "the Shield", "the Veteran" |
| Cleric | "the Blessed", "the Holy", "the Faithful" |
| Rogue | "the Shadow", "the Silent", "the Sly" |
| Barbarian | "the Wild", "the Raging", "the Fierce" |
| Paladin | "the Just", "the Righteous", "Oathbound" |
| Ranger | "the Tracker", "the Hunter", "the Wanderer" |

### Deity-Based Epithets

| Deity | Typical Epithets |
|-------|------------------|
| Abadar | "the Just", "Goldkeeper", "the Lawful" |
| Sarenrae | "the Merciful", "Lightbringer", "the Redeemed" |
| Desna | "Starborn", "Dreamwalker", "the Wanderer" |
| Gorum | "the Warrior", "Battleborn", "Warforged" |
| Iomedae | "the Righteous", "the Valiant", "Oathbound" |
| Nethys | "the All-Seeing", "Magicborn", "the Balanced" |

### Background-Based Epithets

| Background | Typical Epithets |
|------------|------------------|
| Noble | "of High Birth", "the Aristocrat", "Highborn" |
| Criminal | "the Wanted", "the Outlaw", "the Shady" |
| Scholar | "the Learned", "the Wise", "the Bookish" |
| Street Urchin | "Streetwise", "the Survivor", "the Scrappy" |

---

## 6. Advanced Usage Examples

### Complete NPC Generation

```javascript
// Legendary Dwarf Paladin of Torag
const dwarfHero = await AdvancedNameGenerator.generateAdvanced('dwarf', 'male', {
  class: 'paladin',
  deity: 'Torag',
  level: 18,
  includeMeaning: true
});

console.log(dwarfHero);
// {
//   fullName: "Lord Thorin Ironhelm the Forgemaster",
//   baseName: "Thorin Ironhelm",
//   title: "Lord",
//   epithet: "the Forgemaster",
//   meaning: {
//     meaning: "Born of thunder, guardian of iron",
//     components: { prefix: "thunder", suffix: "guardian" },
//     confidence: "high"
//   },
//   metadata: { ancestry: 'dwarf', class: 'paladin', deity: 'Torag', level: 18 }
// }
```

### Regional Human Wizard

```javascript
// Chelaxian Archmage
const wizard = await AdvancedNameGenerator.generateAdvanced('human', 'female', {
  region: 'chelaxian',
  class: 'wizard',
  background: 'noble',
  level: 16,
  includeMeaning: true
});

console.log(wizard);
// {
//   fullName: "Archmage Cornelia Thrune the All-Seeing",
//   baseName: "Cornelia Thrune",
//   title: "Archmage",
//   epithet: "the All-Seeing",
//   meaning: {
//     meaning: "A chelaxian name associated with law",
//     confidence: "low",
//     regional: true
//   }
// }
```

### Name Card Generation

```javascript
// Generate a beautifully formatted name card
const card = await AdvancedNameGenerator.generateNameCard('elf', {
  class: 'ranger',
  deity: 'Desna',
  level: 12,
  background: 'wanderer'
});

console.log(card);
// ╔═══════════════════════════════════════╗
// ║ Aelriel Starwhisper the Wanderer      ║
// ╠═══════════════════════════════════════╣
// ║ Ancestry: elf                         ║
// ║ Class: ranger                         ║
// ╠═══════════════════════════════════════╣
// ║ One who is of stars and walks under   ║
// ║ celestial guidance                    ║
// ╚═══════════════════════════════════════╝
```

---

## 7. Future Enhancements

### Planned Features

1. **Heritage Blending**
   - Half-elf names blend elven and human conventions
   - Tiefling names include infernal elements
   - Aasimar names have celestial overtones

2. **Markov Chain Generation**
   - More sophisticated phoneme patterns
   - Better cultural consistency
   - Learns from expanded name databases

3. **Historical Era Names**
   - Ancient vs. modern naming trends
   - Pre-Earthfall elven names
   - Age of Legend human names

4. **Relationship-Based Naming**
   - Family connections (son of X, daughter of Y)
   - Clan histories reflected in names
   - Mentor/apprentice naming patterns

5. **Dynamic Descriptors**
   - Epithets that evolve with achievements
   - Campaign-specific titles
   - Story-driven name evolution

---

## 8. Configuration

### Enable Advanced Features

```javascript
import { AdvancedNameGenerator } from './scripts/social/advanced-name-generator.js';

// Configure base uniqueness
AdvancedNameGenerator.configure({
  ensureUnique: true,
  minSimilarityDistance: 2,
  enablePhonemeGeneration: true
});

// Generate with full context
const npc = await AdvancedNameGenerator.generateAdvanced('human', 'male', {
  region: 'taldan',
  class: 'fighter',
  background: 'soldier',
  level: 10,
  includeTitle: true,
  includeEpithet: true,
  includeMeaning: true
});
```

### Disable Specific Features

```javascript
// Just the base name, no extras
const simpleName = await AdvancedNameGenerator.generateAdvanced('dwarf', 'female', {
  includeTitle: false,
  includeEpithet: false
});
// Result: "Thora Ironhelm"
```

---

## Conclusion

The Golarion-specific name generator transforms simple procedural names into rich, meaningful identities that:

✅ **Reflect regional culture** - Chelaxian nobles sound different from Varisian wanderers
✅ **Honor the lore** - Deity worship and class choice influence naming
✅ **Scale with power** - Low-level NPCs are "Goodman Tom", high-level are "Archmage Cornelius the All-Seeing"
✅ **Tell stories** - "Thorin Ironhelm Dragonslayer" immediately conveys character
✅ **Remain unique** - Never repeat, never too similar
✅ **Carry meaning** - Every name can be translated and explained

This system creates **legendary names for legendary heroes** while maintaining the efficiency and uniqueness guarantees of the base system.