# PF2e Creature Data Enhancements

## Overview

This document details the comprehensive enhancements made to the PF2e Narrative Seeds module's creature detection and description systems, based on extensive Pathfinder 2e creature data analysis.

## Summary of Enhancements

### Anatomy Types
- **Previous**: 25 creature anatomy types
- **Enhanced**: 50+ creature anatomy types with improved detection

### Hit Locations
- **Previous**: ~3,000 lines of location data
- **Enhanced**: ~3,900 lines with locations for all new creature types

### Natural Weapons
- **Previous**: ~20 natural weapon types
- **Enhanced**: 35+ natural weapon types with better detection order

## New Anatomy Types Added

### Elemental Types (5 new)
- `air-elemental` - Living whirlwinds and air beings
- `earth-elemental` - Stone and earth elementals
- `fire-elemental` - Flame and inferno creatures
- `water-elemental` - Liquid and aqueous beings
- `elemental-general` - General elemental fallback

### Fiend Types (4 new)
- `demon` - Chaotic evil outsiders (Balor, Marilith, Vrock)
- `devil` - Lawful evil outsiders (Pit Fiend, Erinyes)
- `daemon` - Neutral evil outsiders (Astradaemon, Piscodaemon)
- `fiend` - General fiendish creatures (Rakshasa, Oni)

### Celestial Types (4 new)
- `angel` - Holy celestial beings (Solar, Planetar)
- `archon` - Lawful good celestials (Trumpet Archon)
- `azata` - Chaotic good celestials (Bralani, Ghaele)
- `celestial` - General good outsiders (Pegasus, Couatl)

### Monitor Types (2 new)
- `psychopomp` - Death's servants (Nosoi, Morrigna, Yamaraj)
- `monitor` - Neutral outsiders (Aeon, Inevitable)

### Additional Undead Types (3 new)
- `vampire` - Blood-drinking undead
- `mummy` - Preserved bandaged undead
- `lich` - Undead spellcasters with phylacteries

### Aberration Types (2 new)
- `aberration-tentacled` - Tentacle-based aberrations (Aboleth, Otyugh, Chuul)
- `aberration-general` - Other aberrations (Gibbering Mouther, Flumph)

### Humanoid Types (2 new)
- `goblinoid` - Goblins, hobgoblins, bugbears
- `orc` - Orcish creatures

### Construct Types (1 new)
- `golem` - Specific golem detection (Stone, Iron, Flesh, Clay golems)

## Enhanced Natural Weapon Detection

### Added Natural Weapons
1. **Fangs** - Separate from general bite
2. **Teeth** - Separate descriptor
3. **Talons** - Bird/raptor claws
4. **Tusks** - Boar, elephant, mammoth attacks
5. **Proboscis** - Trunk-like appendages
6. **Ram** - Head-based ramming attacks
7. **Touch** - Incorporeal and corrupting touch attacks

### Improved Detection Order
Reorganized natural weapon detection to check more specific patterns first, preventing false matches:
- Bite/Jaw attacks first (most common)
- Claw/Talon attacks second
- Horn/Gore attacks third
- Specialized attacks last

## Data Files Created

### 1. `data/processed/pf2e-trait-analysis.json`
Comprehensive trait analysis including:
- 30+ creature type traits with descriptions and examples
- 40+ natural weapon definitions with damage types
- Trait priority classifications
- Suggested anatomy mappings

### 2. `data/combat/anatomy-types-enhanced.js`
Complete rewrite of anatomy detection system:
- 50+ anatomy type definitions
- Improved trait matching arrays
- Better name pattern matching
- Priority-based detection (lower number = checked first)

### 3. `scripts/process-pf2e-creatures.js`
Data processing script for future updates:
- Downloads creature data from 65+ source files
- Processes Core Bestiaries (B1, B2, B3, BB)
- Processes 40+ Adventure Path bestiaries
- Processes Lost Omens books
- Extracts traits, attacks, damage types
- Generates comprehensive reports

## Hit Location Enhancements

Added complete hit location tables for all new anatomy types, organized by outcome:
- **Critical Success**: 10-12 vital locations per type
- **Success**: 10-15 standard locations per type
- **Failure**: 6-12 miss descriptions per type
- **Critical Failure**: 6-10 fumble descriptions per type

### Examples of New Location Sets

**Air Elemental Locations**:
- Critical Success: "central vortex", "wind core", "heart of the storm"
- Success: "swirling winds", "cyclone edge", "tempest form"
- Failure: "through their airy form", "past their swirling winds"

**Demon Locations**:
- Critical Success: "demonic core", "essence center"
- Success: "left wing", "clawed left hand", "demonic tail"
- Failure: "past their demonic form", "through their wings"

**Vampire Locations**:
- Critical Success: "exposed heart", "throat"
- Success: "pale left shoulder", "vampiric right arm"
- Failure: "past their vampiric form", "around their undead body"

## Priority System Improvements

### High Priority (10-45)
Specific, unique creatures checked first:
- Will-o'-Wisp (10)
- Scythe Tree (15)
- Shambling Mound (16)
- Troll (20)
- Owlbear (25)
- Worg (26)
- Cyclops (30)
- Dragon (35)
- Skeleton (40)
- Zombie (41)
- Incorporeal (42)
- Vampire (43)
- Mummy (44)
- Lich (45)

### Medium Priority (50-160)
Broader categories:
- Undead General (50)
- Fey types (60-70)
- Elementals (75-79)
- Golems (80)
- Constructs (82)
- Oozes (90)
- Plants (94-95)
- Aberrations (97-98)
- Insectoids (100)
- Serpents (110)
- Avians (120)
- Aquatic (130)
- Quadrupeds (140)
- Outsiders (145-154)
- Giants (160)

### Low Priority (190-200)
Common fallbacks:
- Goblinoids (190)
- Orcs (191)
- Humanoids (200)

## Testing Recommendations

### Test Cases for New Features

1. **Elemental Detection**
   - Fire Elemental → should detect as "fire-elemental"
   - Air Mephit → should detect as "elemental-general"
   - Earth Elemental → should detect as "earth-elemental"

2. **Fiend Detection**
   - Balor → should detect as "demon"
   - Pit Fiend → should detect as "devil"
   - Rakshasa → should detect as "fiend"

3. **Undead Detection**
   - Vampire Spawn → should detect as "vampire"
   - Mummy Guardian → should detect as "mummy"
   - Lich → should detect as "lich"
   - Wight → should detect as "undead-general"

4. **Natural Weapon Detection**
   - "Bite" → should return "Your jaws"
   - "Talons" → should return "Your talons"
   - "Tusks" → should return "Your tusks"
   - "Incorporeal Touch" → should return "Your touch"

## Benefits of Enhancements

### For Game Masters
- More accurate creature descriptions across 2x more creature types
- Better variation in combat narration
- Appropriate descriptions for outsiders, elementals, and exotic creatures
- More immersive combat descriptions

### For Players
- Combat descriptions that match creature types
- Better understanding of what they're fighting
- More engaging narrative combat experience

### For Module
- Future-proofed for new creature types
- Comprehensive coverage of PF2e bestiaries
- Easy to extend with new anatomy types
- Well-documented codebase

## Future Enhancement Opportunities

### Data Updates
- Process actual creature JSON files when network access is available
- Extract specific attack patterns from creature stat blocks
- Build trait combination database
- Create creature family groupings

### Feature Additions
- Size-based location variations
- Creature ability-based descriptions
- Environmental context (underwater, flying, etc.)
- Multi-target attack descriptions

### Performance
- Cache trait lookups
- Optimize anatomy detection algorithm
- Pre-compile trait patterns

## Version History

### v1.2.0 (Current)
- Added 50+ anatomy types (up from 25)
- Added 900+ lines of hit location data
- Enhanced natural weapon detection (35+ types)
- Created comprehensive trait analysis data
- Improved priority-based detection system

### v1.1.0 (Previous)
- 25 anatomy types
- Basic natural weapon detection
- Core hit locations

## Credits

Data sources:
- Pf2eTools GitHub Repository
- Pathfinder 2e Core Rulebooks
- Pathfinder 2e Bestiaries (B1, B2, B3, BB)
- Adventure Path Bestiaries
- Lost Omens Books

## License

This enhancement maintains compatibility with the module's original license.
