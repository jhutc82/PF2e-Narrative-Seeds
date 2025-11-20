# NPC Manager Documentation

## Overview

The NPC Manager is a comprehensive tool for managing procedurally generated NPCs in Foundry VTT. It provides a clean interface for generating, storing, editing, and organizing NPCs with full support for families, factions, and complex relationships.

## Features

- **Generate New NPCs**: Create NPCs with 60+ ancestries and customizable options
- **Persistent Storage**: All NPCs are saved in your world data
- **Full Editability**: Edit any property of any NPC on the fly
- **Related NPCs**: Manage families, factions, and relationships
- **Smart Generation**: Generate related NPCs with preset information
- **Search & Filter**: Quickly find NPCs by name, ancestry, or tags
- **Import/Export**: Backup and share your NPC database

## Opening the NPC Manager

There are three ways to open the NPC Manager:

1. **Chat Command**: Type `/npc-manager` or `/npcs` in the chat
2. **Scene Controls**: Click the NPC Manager button in the Notes controls (left sidebar)
3. **Console**: Run `window.PF2eNarrativeSeeds.manager.open()`

> **Note**: Only GMs can access the NPC Manager

## User Interface

The NPC Manager has three main views:

### 1. NPC List View

The default view showing all your stored NPCs.

**Features:**
- **Search Bar**: Filter NPCs by name or occupation
- **Ancestry Filter**: Show only NPCs of specific ancestries
- **Sort Options**: Sort by name, ancestry, or date added
- **Quick Actions**: Export, import, or clear all data

**NPC Cards:**
- Click any NPC card to view/edit details
- Click the trash icon to delete an NPC
- Tags are displayed for easy categorization

### 2. Generate New NPC View

Interface for creating new NPCs.

**Options:**
- **Ancestry**: Choose from 60+ ancestries or select "Random"
- **Gender**: male, female, nonbinary, or random
- **Detail Level**:
  - **Minimal**: Basic personality (1 trait, 1 mannerism)
  - **Standard**: Balanced detail (1 personality, 2 mannerisms, 50% quirk)
  - **Detailed**: Rich detail (2 personalities, 2 mannerisms, 70% quirk)
  - **Cinematic**: Maximum detail (2 personalities, 3 mannerisms, 1-2 quirks)

**What Gets Generated:**
- Name & Physical Appearance
- Personality & Mannerisms
- Occupation & Background
- Relationships & Family
- Motivations & Plot Hooks
- Psychology & Secrets
- And 30+ more subsystems!

### 3. NPC Detail View

View and edit a specific NPC.

**Sections:**
- **Basic Info**: Name, ancestry, occupation, level (all editable)
- **Tags**: Add custom tags for organization
- **Appearance**: Physical description (regenerate with ♻️ button)
- **Personality**: Personality traits (regenerate with ♻️ button)
- **Mannerisms**: Behavioral quirks (regenerate with ♻️ button)
- **Motivation**: Core drives and GM guidance
- **Related NPCs**: Family, allies, enemies (see below)
- **Families**: Family groups this NPC belongs to
- **Factions**: Organizations this NPC is part of
- **Raw Data**: Full JSON data (collapsible)

**Actions:**
- **Save**: Save all changes
- **Export**: Export NPC as JSON file
- **Create Actor**: Create a Foundry actor from this NPC

## Related NPCs (Families, Factions, etc.)

One of the most powerful features of the NPC Manager is the Related NPCs system.

### How It Works

When an NPC is generated, they may have relationships like:
- Family members (parents, siblings, children)
- Allies (friends, mentors)
- Enemies (rivals, antagonists)

These related NPCs start as **"stubs"** - they have basic information like:
- Name
- Ancestry
- Relationship to the main NPC
- Basic description

### Generating Related NPCs

**To fully generate a related NPC:**

1. In the NPC Detail View, scroll to "Related NPCs"
2. Click on a related NPC stub
3. Click "Generate Full NPC" button
4. The system will:
   - Generate a complete NPC using the stub's information
   - Preserve the name, ancestry, and other preset details
   - Create a relationship link between the NPCs
   - Save the new NPC to your database

**Smart Generation:**
The system respects the stub's information:
- If the stub says "Father, Human, Age 60" → generates a 60-year-old human male
- If the stub says "Sister, Elf" → generates a female elf with family traits
- Preset information is preserved, unknowns are procedurally generated

### Families

**Creating a Family:**
1. In NPC Detail View, click "Add to Family"
2. Either:
   - Select an existing family
   - Choose "Create New Family" and enter a surname
3. The family is generated with:
   - Family type (nuclear, extended, clan, etc.)
   - Family dynamics
   - Shared traits
   - Traditions and conflicts

**Family Benefits:**
- Group related NPCs together
- Track family relationships
- Generate consistent family members

### Factions

**Creating a Faction:**
1. In NPC Detail View, click "Add to Faction"
2. Either:
   - Select an existing faction
   - Choose "Create New Faction" and enter a name
3. The faction is generated with:
   - Organization type
   - Goals and resources
   - Leadership structure
   - Public perception

**Faction Benefits:**
- Organize NPCs by allegiance
- Track political connections
- Generate consistent faction members

## Tags System

Tags help you organize and find NPCs.

**Adding Tags:**
1. In NPC Detail View, click "+ Add Tag"
2. Enter a tag name (e.g., "merchant", "quest-giver", "villain")
3. Click OK

**Removing Tags:**
- Click the × button next to any tag

**Using Tags:**
- Tags appear on NPC cards in the list view
- Use the search bar to find NPCs by tag

**Tag Examples:**
- Campaign markers: "act-1", "main-plot"
- Roles: "shopkeeper", "quest-giver", "contact"
- Status: "dead", "captured", "friendly"
- Location: "waterdeep", "tavern", "guild"

## Regenerating Traits

Don't like a specific trait? Regenerate it!

**To Regenerate:**
1. In NPC Detail View, find the trait section (Appearance, Personality, etc.)
2. Click the ♻️ (regenerate) button next to the section title
3. The system generates a new NPC with the same parameters
4. Only that specific trait is replaced
5. Changes are saved automatically

**Example:**
- NPC has "Cowardly" personality
- Click ♻️ on Personality section
- Might get "Ambitious" instead
- All other traits remain the same

## Import/Export

### Exporting

**Export All Data:**
1. In List View, click the Export button (📤)
2. Downloads `npc-manager-export-[timestamp].json`
3. Contains all NPCs, families, factions, and relationships

**Export Single NPC:**
1. In Detail View, click Export button
2. Downloads `npc-[name]-[timestamp].json`
3. Contains only that NPC's data

### Importing

1. In List View, click the Import button (📥)
2. Select a JSON file (from previous export)
3. Data is merged with existing database
4. Duplicate IDs are overwritten

**Use Cases:**
- Backup your NPC database
- Share NPCs with other GMs
- Move NPCs between campaigns
- Restore after data loss

## Console API

For advanced users, the NPC Manager exposes a JavaScript API:

```javascript
// Open the manager
PF2eNarrativeSeeds.manager.open()

// Get all NPCs
const npcs = PF2eNarrativeSeeds.manager.getAllNPCs()

// Get specific NPC
const npc = PF2eNarrativeSeeds.manager.getNPC("npc-1")

// Save an NPC
await PF2eNarrativeSeeds.manager.saveNPC(npc)

// Delete an NPC
await PF2eNarrativeSeeds.manager.deleteNPC("npc-1")

// Search NPCs
const elves = PF2eNarrativeSeeds.manager.searchNPCs({ ancestry: "elf" })

// Get statistics
const stats = PF2eNarrativeSeeds.manager.getStats()
// Returns: { totalNPCs, totalFamilies, totalFactions, totalRelationships }

// Export data
const json = PF2eNarrativeSeeds.manager.exportData()

// Import data
await PF2eNarrativeSeeds.manager.importData(jsonString)

// Clear all data
await PF2eNarrativeSeeds.manager.clearAll()
```

## Tips & Best Practices

### Organization

1. **Use Tags Liberally**: Tag NPCs by campaign, location, role, status
2. **Create Families**: Group related NPCs together
3. **Create Factions**: Track political and organizational connections
4. **Regular Exports**: Backup your NPC database regularly

### Generation

1. **Start Simple**: Generate with Standard detail level first
2. **Upgrade Later**: Regenerate traits to add more detail
3. **Use Stubs**: Don't generate all family members immediately
4. **Generate On Demand**: Only fully generate NPCs when needed

### Editing

1. **Edit Freely**: All fields are editable
2. **Save Often**: Click Save after making changes
3. **Use Regenerate**: Don't manually edit traits you want different
4. **Add Context**: Use tags and notes to track NPC status

### Workflow Example

1. Generate tavern keeper (Standard detail)
2. Add tags: "tavern", "quest-giver", "friendly"
3. NPC mentions their sister
4. Click sister stub → Generate full NPC
5. Add both NPCs to "Brewster Family"
6. Export before end of session (backup)

## Performance

The NPC Manager is optimized for performance:

- **Lazy Loading**: Related NPCs only generated when needed
- **Efficient Storage**: Uses Foundry's world settings
- **Search Indexing**: Fast search and filter operations
- **Memory Management**: Only loads what's displayed

**Recommended Limits:**
- Up to 500 NPCs: Excellent performance
- 500-1000 NPCs: Good performance
- 1000+ NPCs: Consider archiving old NPCs

## Troubleshooting

### Manager Won't Open

1. Check you're logged in as GM
2. Check Social system is enabled in settings
3. Check browser console for errors

### NPCs Not Saving

1. Check you clicked "Save" button
2. Check browser console for errors
3. Try exporting/importing to force save

### Related NPCs Not Generating

1. Check the stub has required information
2. Check NPC Generator is enabled
3. Try generating manually first

### Performance Issues

1. Export and archive old NPCs
2. Clear unused families/factions
3. Reduce detail level for new NPCs

## Data Storage

All NPC Manager data is stored in Foundry's world settings:

**Location:** `worlds/[your-world]/data/settings.db`

**Storage Key:** `pf2e-narrative-seeds.npcManagerData`

**Data Structure:**
```json
{
  "version": "1.0.0",
  "npcs": { "npc-1": {...}, "npc-2": {...} },
  "families": { "family-1": {...} },
  "factions": { "faction-1": {...} },
  "relationships": [...],
  "nextId": 123
}
```

**Backup Strategy:**
1. Regular exports via UI
2. Foundry world backups
3. Manual database backups

## Future Enhancements

Planned features for future releases:

- [ ] Bulk operations (delete multiple, tag multiple)
- [ ] Advanced filters (by level, by trait, by faction)
- [ ] NPC relationships graph view
- [ ] Timeline tracking (NPC changes over time)
- [ ] Integration with actors (sync changes)
- [ ] Templates (save NPC templates for quick generation)
- [ ] Compendium export (create shareable compendiums)

## Support

For issues or feature requests:

1. Check this documentation
2. Check the [GitHub Issues](https://github.com/jhutc82/PF2e-Narrative-Seeds/issues)
3. Join the community Discord
4. Report bugs with console logs

## Credits

**NPC Manager** is part of the PF2e Narrative Seeds module.

**Author:** Justin Hutchinson
**Version:** 1.0.0
**License:** See LICENSE file

---

*Happy NPC managing! May your worlds be filled with rich, memorable characters.*
