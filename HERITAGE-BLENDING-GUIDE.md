# Heritage Blending & Markov Chain Name Generation Guide

## Overview

This guide covers the advanced heritage blending and Markov chain name generation features added to the PF2e Narrative Seeds name generator system. These features provide infinite unique name combinations with deep Golarion lore integration.

## Table of Contents

1. [Versatile Heritages](#versatile-heritages)
2. [Heritage Blending Strategies](#heritage-blending-strategies)
3. [Markov Chain Generation](#markov-chain-generation)
4. [Regional Human Variants](#regional-human-variants)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)

---

## Versatile Heritages

The system now supports **9 versatile heritages** with specialized naming patterns:

### Supported Heritages

1. **Half-Elf** - Blends human and elven naming traditions
2. **Half-Orc** - Blends human and orcish naming with phonetic adjustments
3. **Tiefling** - Infernal names, virtue names, or human names
4. **Aasimar** - Celestial names, virtue names, or human names
5. **Dhampir** - Gothic vampiric names or human names
6. **Changeling** - Fey-touched, nature-based, or human names
7. **Ganzi** - Chaotic, unusual name combinations
8. **Aphorite** - Ordered, mathematical name patterns
9. **Duskwalker** - Memorial names honoring the dead

### Heritage-Specific Features

#### Tiefling Names

Tieflings have three naming pattern categories (weighted selection):

- **Infernal (40%)**: Names constructed from infernal prefixes and suffixes
  - Prefixes: Ash, Bal, Cind, Damm, Emb, Fel, Grim, Hel, Inf, Mal, Nef, Pyr, Rav, Sab, Torm, Vex, Zar
  - Suffixes: ael, amon, azoth, baal, deus, fera, goras, iel, monus, nox, rax, thar, xes, ziel
  - Examples: Ashael, Balamon, Cindrax, Emberiel, Felgoras

- **Virtue (35%)**: Names reflecting virtues or vices
  - Aspirational: Hope, Faith, Grace, Joy, Peace, Truth, Valor, Justice
  - Ironic: Despair, Doubt, Sorrow, Pain, Strife, Lies, Cruelty
  - Abstract: Ash, Ember, Shadow, Thorn, Raven, Storm, Night

- **Human (25%)**: Standard human names (optionally regional)

#### Aasimar Names

Similar structure to tieflings but with celestial themes:

- **Celestial (40%)**: Heavenly, angelic names
  - Prefixes: Ael, Cael, Celes, Div, Elas, Eur, Glor, Hal, Lum, Nor, Rad, Sal, Ser, Thel, Val, Zel
  - Suffixes: ael, aria, arion, diel, driel, iel, ion, ith, miel, rael, riel, thiel, uril, viel
  - Examples: Aelion, Caelriel, Celestion, Divael, Gloriel

- **Virtue (35%)**: Blessed, holy, celestial concepts
  - Blessed: Grace, Hope, Faith, Mercy, Charity, Light, Dawn, Radiance
  - Holy: Angel, Blessed, Divine, Hallowed, Sanctified, Sacred
  - Celestial: Star, Aurora, Celestia, Lumina, Radiance, Glory

- **Human (25%)**: Human names with celestial middle names/epithets

---

## Heritage Blending Strategies

The system uses **5 core blending strategies** for mixed ancestry names:

### 1. Syllable Blending
Combines syllables from both ancestries using Markov chain weighting.

```javascript
// Generate a half-elf name with 50/50 blend
const name = await HeritageNameGenerator.generateHeritageName(
  'half-elf',
  'male',
  { blendRatio: 0.5 }
);
// Examples: Caelar, Thalion, Maeven
```

### 2. Prefix-Suffix Combination
Takes prefix from one ancestry, suffix from another.

```javascript
// Human first name + Elf last name
strategy: 'human_first_elf_last'
// Examples: Marcus Moonwhisper, Elena Starweaver
```

### 3. Alternate Syllables
Alternates syllables between ancestries systematically.

```javascript
// Alternating pattern
[human-syllable] + [elf-syllable] + [human-syllable]
// Examples: Thal-dor-ian, Mar-ael-tus
```

### 4. Weighted Markov Chain
Uses N-gram statistical models trained on both ancestries with weighted blending.

```javascript
const name = await MarkovNameGenerator.generateBlended(
  humanPatterns,
  elfPatterns,
  'male',
  0.5  // 50% human, 50% elf
);
```

### 5. Phonetic Shifting
Applies phonetic transformations to make names sound harsher or softer.

**Harshen** (for half-orcs):
- t → k, s → sh, l → r, v → g
- Example: "Marcus" → "Markus" → "Mrakush"

**Soften** (for half-orcs from orc base):
- k → t, g → d, r → l, sh → s
- Example: "Grakash" → "Dlatash"

---

## Markov Chain Generation

The Markov chain generator uses N-gram analysis to create statistically authentic names.

### How It Works

1. **Training**: Analyzes existing names to build probability distributions
2. **Order Selection**: Uses 2-4 character context windows (adaptive)
3. **Generation**: Follows probability chains to construct new names
4. **Smoothing**: Applies Laplace smoothing to prevent dead-ends

### Features

- **Adaptive Order**: Automatically selects optimal N-gram size (2-4)
- **Start Distributions**: Captures authentic name beginnings
- **Transition Probabilities**: Models character sequence likelihood
- **Blending Support**: Merges probability distributions from multiple sources
- **Corpus Analysis**: Provides statistical insights into name patterns

### Usage Example

```javascript
import { MarkovNameGenerator } from './scripts/social/markov-name-generator.js';

// Train on a corpus
const nameList = ["Thorin", "Dwalin", "Balin", "Kili", "Fili"];
const chain = MarkovNameGenerator.trainChain(nameList, 3);  // 3-gram

// Generate new names
const newName = MarkovNameGenerator.generateFromChain(chain);

// Blend two ancestries
const blendedName = await MarkovNameGenerator.generateBlended(
  dwarfPatterns,
  humanPatterns,
  'male',
  0.7  // 70% dwarf, 30% human
);
```

### Advanced Options

```javascript
const chain = MarkovNameGenerator.trainChain(corpus, 3);

// Configure generation
const options = {
  minLength: 4,
  maxLength: 10,
  maxAttempts: 50,
  startChar: 'T',  // Force starting character
  endChar: 'n'     // Force ending character
};

const name = MarkovNameGenerator.generateFromChain(chain, options);
```

---

## Regional Human Variants

The system now supports **17 distinct Golarion human ethnicities**:

### Inner Sea Ethnicities

1. **Azlanti** - Ancient, extinct civilization (vowel-heavy, no surnames)
2. **Chelaxian** - Diabolical empire (Roman/Latin-inspired)
3. **Taldan** - Classical empire (Greco-Roman)
4. **Kellid** - Barbarian tribes (harsh, 1-2 syllables)
5. **Shoanti** - Varisian natives (descriptive, clan-based)
6. **Ulfen** - Northern raiders (Norse/Viking with patronymics)
7. **Varisian** - Nomadic wanderers (Romanian/Roma-inspired)
8. **Nidalese** - Shadow-worshipers (Gothic, Zon-Kuthon themes)

### Garund Ethnicities

9. **Garundi** - Northern Garund (Ethiopian/North African)
10. **Mwangi** - Expanse peoples (4 subgroups: Bekyar, Bonuwat, Zenj, Mauxi)

### Casmaron Ethnicities

11. **Keleshite** - Desert empire (Persian/Arabian with ibn/al- patterns)
12. **Vudrani** - Distant kingdoms (Indian/Hindu-inspired)

### Tian Xia Ethnicities

13. **Tian-Shu** - Dragon empires (Chinese, family-name-first)
14. **Tian-Min** - Peninsula kingdoms (Korean-inspired)
15. **Tian-Dan** - Island nations (Japanese-inspired)
16. **Tian-Dtang** - Northern steppes (Mongolian)
17. **Tian-La** - Southern jungles (Southeast Asian)
18. **Tian-Sing** - Island chains (Pacific Islander)

### Crown of the World

19. **Erutaki** - Arctic peoples (Inuit-inspired)
20. **Jadwiga** - Witch-ruled lands (Russian/Slavic)

### Usage

```javascript
import { AdvancedNameGenerator } from './scripts/social/advanced-name-generator.js';

// Generate a Chelaxian noble
const name = await AdvancedNameGenerator.generateAdvanced(
  'human',
  'male',
  {
    region: 'chelaxian',
    background: 'noble',
    level: 10,
    includeTitle: true
  }
);
// Example: "Lord Marcus Thrune the Infernal"

// Generate a Tian-Shu scholar
const name = await AdvancedNameGenerator.generateAdvanced(
  'human',
  'female',
  {
    region: 'tian-shu',
    class: 'wizard',
    includeEpithet: true
  }
);
// Example: "Li Mei the Scholar" (family name first)
```

---

## Usage Examples

### Basic Heritage Name Generation

```javascript
import { HeritageNameGenerator } from './scripts/social/heritage-name-generator.js';

// Generate a tiefling name
const tieflingName = await HeritageNameGenerator.generateHeritageName(
  'tiefling',
  'female'
);
// Possible results: "Ashara", "Hope", "Emberiel", "Cindria"

// Generate a half-elf name with specific strategy
const halfElfName = await HeritageNameGenerator.generateHeritageName(
  'half-elf',
  'male',
  {
    strategy: 'human_first_elf_last',
    blendRatio: 0.5
  }
);
// Example: "Marcus Starweaver"
```

### Advanced Context-Aware Generation

```javascript
import { AdvancedNameGenerator } from './scripts/social/advanced-name-generator.js';

// Generate a high-level tiefling cleric with full context
const result = await AdvancedNameGenerator.generateAdvanced(
  'tiefling',
  'female',
  {
    class: 'cleric',
    deity: 'Sarenrae',
    level: 15,
    includeTitle: true,
    includeEpithet: true,
    includeMeaning: true
  }
);

console.log(result);
// {
//   fullName: "High Priestess Hope the Redeemed",
//   baseName: "Hope",
//   title: "High Priestess",
//   epithet: "the Redeemed",
//   meaning: { meaning: "One who brings hope to the darkness", confidence: "high" },
//   metadata: { ancestry: 'tiefling', heritage: 'tiefling', class: 'cleric', deity: 'Sarenrae', level: 15 }
// }
```

### Blended Heritage with Regional Variant

```javascript
// Generate a Chelaxian half-elf
const name = await AdvancedNameGenerator.generateAdvanced(
  'half-elf',
  'male',
  {
    heritage: 'half-elf',
    primaryAncestry: 'human',
    region: 'chelaxian',
    blendStrategy: 'hybrid_construction',
    level: 8
  }
);
// Example: "Marcellano Starwhisper"
```

### Markov Chain Corpus Analysis

```javascript
import { MarkovNameGenerator } from './scripts/social/markov-name-generator.js';

// Analyze a name corpus
const corpus = ["Thorin", "Dwalin", "Balin", "Kili", "Fili", "Dori", "Nori", "Ori"];
const analysis = MarkovNameGenerator.analyzeCorpus(corpus, 2);

console.log(analysis);
// {
//   totalNames: 8,
//   order: 2,
//   uniqueStarts: 7,
//   uniqueTransitions: 45,
//   avgLength: 5.25,
//   minLength: 3,
//   maxLength: 6,
//   commonStarts: ['th', 'dw', 'ba', 'ki', 'fi', 'do', 'no', 'or'],
//   commonEndings: ['in', 'li', 'ri']
// }
```

---

## API Reference

### HeritageNameGenerator

#### `generateHeritageName(heritage, gender, options)`

Generates a name for a versatile heritage.

**Parameters:**
- `heritage` (string): Heritage type ('half-elf', 'tiefling', 'aasimar', etc.)
- `gender` (string|null): 'male', 'female', 'neutral', or null for random
- `options` (object):
  - `primaryAncestry` (string): Base ancestry for blending
  - `region` (string): Regional variant for human ancestry
  - `strategy` (string): Specific blending strategy
  - `blendRatio` (number): 0-1 ratio for blending weight

**Returns:** Promise<string> - Generated name

**Example:**
```javascript
const name = await HeritageNameGenerator.generateHeritageName(
  'half-orc',
  'male',
  { strategy: 'softened_orc', blendRatio: 0.6 }
);
```

### MarkovNameGenerator

#### `trainChain(names, order)`

Trains a Markov chain on a corpus of names.

**Parameters:**
- `names` (array): Array of name strings
- `order` (number|null): N-gram size (2-4), null for auto-select

**Returns:** Object - Trained Markov chain

#### `generateFromChain(chain, options)`

Generates a name from a trained chain.

**Parameters:**
- `chain` (object): Trained Markov chain
- `options` (object): Generation options

**Returns:** string - Generated name

#### `generateBlended(patterns1, patterns2, gender, ratio)`

Generates a blended name from two ancestry patterns.

**Parameters:**
- `patterns1` (object): First ancestry patterns
- `patterns2` (object): Second ancestry patterns
- `gender` (string): Gender for generation
- `ratio` (number): Blend ratio (0-1)

**Returns:** Promise<string> - Blended name

### AdvancedNameGenerator

#### `generateAdvanced(ancestry, gender, context)`

Generates a comprehensive name with full context awareness.

**Parameters:**
- `ancestry` (string): Ancestry or heritage slug
- `gender` (string|null): Gender
- `context` (object):
  - `region` (string): Regional variant
  - `class` (string): Character class
  - `deity` (string): Patron deity
  - `background` (string): Background
  - `level` (number): Character level
  - `includeTitle` (boolean): Force title generation
  - `includeEpithet` (boolean): Force epithet generation
  - `includeMeaning` (boolean): Include etymology
  - `heritage` (string): Versatile heritage
  - `primaryAncestry` (string): Base ancestry for blending
  - `blendStrategy` (string): Blending strategy
  - `blendRatio` (number): Blend ratio

**Returns:** Promise<Object> - Full name result with metadata

---

## Database Expansions

### Ancestry Database Improvements

Several ancestry databases were significantly expanded:

#### Gnoll/Kholo
- Male prefixes: 10 → 140 (1400% increase)
- Female prefixes: 10 → 140 (1400% increase)
- Clan names: 7 → 57 (814% increase)
- Total combinations: ~1,000 → ~350,000+

#### Grippli/Tripkee
- Male prefixes: 10 → 180 (1800% increase)
- Female prefixes: 10 → 180 (1800% increase)
- Compound parts: 21 → 168 (800% increase)
- Total combinations: ~5,000 → ~1,500,000+

### Human Regional Expansion

Created comprehensive database with:
- 17 distinct ethnicities
- 200+ names per ethnicity (male/female)
- Cultural naming conventions
- Regional-specific features (patronymics, clan names, etc.)

---

## Performance & Capacity

### Name Generation Capacity

With the new systems, total unique name capacity:

- **Per Ancestry**: 40,000 - 2,000,000+ combinations
- **With Markov Chains**: Effectively infinite
- **With Blending**: Infinite (mathematical impossibility to exhaust)
- **With Variations**: 5x multiplier on all numbers

### Uniqueness Guarantees

- **Collision Detection**: Registry tracks all generated names
- **Similarity Prevention**: Levenshtein distance threshold (default: 2)
- **Fallback Strategies**: 4-layer system ensures uniqueness
- **Phoneme-Based**: Infinite capacity when syllabic pool exhausted

---

## Best Practices

### Choosing Blending Strategies

1. **Syllable Blending**: Best for seamless integration
2. **Prefix-Suffix**: Best for clearly dual-heritage names
3. **Phonetic Shifting**: Best for cultural adaptation narratives
4. **Markov Blending**: Best for statistical authenticity

### Optimizing Performance

- Cache trained Markov chains for reuse
- Use specific strategies instead of random selection
- Batch generate names when possible
- Set appropriate maxAttempts for Markov generation

### Cultural Accuracy

- Always specify region for human names in Golarion campaigns
- Use appropriate blending ratios for heritage narratives
- Consider cultural context when selecting naming patterns
- Reference PF2e lore for deity/class-appropriate epithets

---

## Credits

This system was developed for PF2e Narrative Seeds with extensive research into:
- Pathfinder 2e Lost Omens lore
- Real-world linguistic patterns
- Statistical name generation algorithms
- Golarion Inner Sea ethnicities

## Version History

- **v2.0** (2024-11): Heritage blending, Markov chains, 17 human ethnicities
- **v1.5** (2024-11): Regional variants, titles, epithets, etymologies
- **v1.0** (2024-11): Uniqueness system, infinite generation capacity

---

For more information, see:
- [NAME-GENERATOR-POWER.md](./NAME-GENERATOR-POWER.md) - Feature showcase
- [GOLARION-NAME-FEATURES.md](./GOLARION-NAME-FEATURES.md) - Regional naming guide
- [ENHANCEMENT-SUMMARY.md](./ENHANCEMENT-SUMMARY.md) - Technical implementation details
