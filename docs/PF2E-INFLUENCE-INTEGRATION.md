# PF2e Influence System Integration

This document explains how the dynamic NPC systems integrate with PF2e's Influence subsystem.

## Overview

The PF2e Influence subsystem is designed for structured social encounters where PCs accumulate Influence Points to sway NPCs. Our dynamic systems **enhance** this by:

1. **Dynamic DCs**: Mood, needs, and thoughts modify Influence DCs in real-time
2. **Enhanced Discovery**: Discover dynamic state (current mood, critical needs, active thoughts)
3. **Relationship Integration**: Influence success/failure affects opinion-based relationships
4. **Living NPCs**: NPCs react differently based on their current state

## Core Concepts

### PF2e Influence Basics

In PF2e, social encounters use:
- **Influence Action**: Attempt to gain Influence Points (2 on crit success, 1 on success, 0 on failure, -1 on crit fail)
- **Discovery Action**: Learn NPC's preferences, resistances, weaknesses
- **Influence Thresholds**: Meet thresholds (e.g., 4, 6, 8 points) to achieve goals
- **Resistances**: Things that increase DC (+2 or +5)
- **Weaknesses**: Things that decrease DC (-2 or -5)

### Dynamic Integration

Our systems add:
- **Current Mood**: Affects all Influence DCs
- **Critical Needs**: Create temporary resistances
- **Active Thoughts**: Discoverable through Discovery action
- **Relationship Opinion**: Modifies DCs and grows with successful Influence

## How It Works

### 1. Dynamic Influence DCs

Base DCs from influence stat blocks are modified by NPC's current state:

```javascript
// Calculate DC with dynamic modifiers
const dcData = npcDynamicSystems.calculateInfluenceDC(
    npc,
    'Diplomacy',
    playerCharacter,
    15 // base DC
);

console.log(dcData);
// {
//     finalDC: 18,
//     baseDC: 15,
//     totalModifier: +3,
//     modifiers: [
//         {
//             source: 'mood',
//             label: 'Current mood: Dissatisfied',
//             modifier: +2,
//             description: 'NPC is in a bad mood, harder to influence'
//         },
//         {
//             source: 'hunger',
//             label: 'Hungry and distracted',
//             modifier: +2,
//             description: 'Too hungry to focus on other matters'
//         },
//         {
//             source: 'relationship',
//             label: 'Relationship: acquaintance (15)',
//             modifier: -1,
//             description: 'Good relationship makes influence easier'
//         }
//     ]
// }
```

### 2. Mood-Based Modifiers

| Mood Score | Mood | DC Modifier | Effect |
|------------|------|-------------|--------|
| 80-100 | Very Happy | -3 | Much easier to influence |
| 65-79 | Happy | -1 | Slightly easier |
| 45-64 | Neutral | 0 | No modifier |
| 30-44 | Unhappy | +2 | Harder to influence |
| 0-29 | Miserable | +5 | Much harder to influence |

### 3. Need-Based Modifiers

Critical needs create resistances:

- **Starving (sustenance < 10)**: +5 to all DCs except food-related skills
- **Hungry (sustenance < 30)**: +2 to all DCs except food-related skills
- **Exhausted (rest < 20)**: +2 to complex skills (Arcana, Society, Lore)
- **Multiple critical needs**: +2 per critical need (max +5)

### 4. Thought-Based Modifiers

Active traumatic thoughts create resistances:

- **Each traumatic thought**: +2 to all DCs (max +5)
- Examples: "Saw loved one die", "Witnessed atrocity", "Betrayed"

### 5. Relationship-Based Modifiers

Existing relationship opinion affects DCs:

```
DC Modifier = -opinion / 20
```

| Opinion | Relationship | DC Modifier |
|---------|--------------|-------------|
| -100 | Bitter Enemy | +5 |
| -60 | Enemy | +3 |
| -20 | Rival | +1 |
| 0 | Neutral | 0 |
| +20 | Acquaintance | -1 |
| +60 | Friend | -3 |
| +100 | Close Friend | -5 |

### 6. Personality-Based Modifiers

Personalities create resistances and weaknesses:

**Resistances** (increase DC):
- **Pompous**: Intimidation +2
- **Skeptical**: Deception +5
- **Scholarly**: Performance +2, Intimidation +2
- **Stubborn**: Diplomacy +3, Intimidation +3
- **Cynical**: Diplomacy +2

**Weaknesses** (decrease DC):
- **Greedy**: Society -2, Mercantile Lore -2, Accounting Lore -2
- **Vain**: Performance -3
- **Curious**: Arcana -2, Nature -2, Occultism -2, Religion -2
- **Ambitious**: Society -2, Diplomacy -2
- **Romantic**: Performance -2, Society -2
- **Scholarly**: Arcana -3, Religion -3, Occultism -3

## Processing Influence Actions

### Example Influence Attempt

```javascript
// NPC: Hungry merchant (sustenance: 25/100, mood: dissatisfied)
// PC: Attempting to Influence with Diplomacy
// Base DC: 15

const result = npcDynamicSystems.processInfluence(
    npc,
    playerCharacter,
    'Diplomacy',
    22, // roll result
    15  // base DC
);

console.log(result);
// {
//     success: true,
//     degree: 'success',
//     influencePoints: 1,
//     rollResult: 22,
//     dc: 18, // Modified by hunger +2, mood +2, relationship -1
//     dcBreakdown: { /* detailed modifiers */ },
//     opinionChange: +5,
//     message: 'Thorin appreciates your Diplomacy.'
// }
```

### Influence Points by Degree

| Degree | Influence Points | Opinion Change |
|--------|-----------------|----------------|
| Critical Success | +2 | +10 |
| Success | +1 | +5 |
| Failure | 0 | 0 |
| Critical Failure | -1 | -5 |

**Important**: Opinion changes persist and affect future attempts!

## Enhanced Discovery

The Discovery action can now reveal dynamic state:

```javascript
const discovery = npcDynamicSystems.processDiscovery(
    npc,
    playerCharacter,
    18, // Perception check result
    13  // base DC
);

console.log(discovery);
// {
//     success: true,
//     degree: 'success',
//     choicesAllowed: 1,
//     availableDiscoveries: [
//         // Standard PF2e options
//         {
//             type: 'best-skill',
//             info: 'Best skill to influence (from influence stat block)',
//             category: 'standard'
//         },
//         {
//             type: 'resistance',
//             info: 'One personality-based resistance',
//             category: 'standard'
//         },
//         {
//             type: 'weakness',
//             info: 'One personality-based weakness',
//             category: 'standard'
//         },
//
//         // NEW: Dynamic state options
//         {
//             type: 'current-mood',
//             info: 'Current mood: Dissatisfied (affects DC by +2)',
//             category: 'dynamic',
//             revealed: {
//                 mood: 'Dissatisfied',
//                 moodScore: 42,
//                 dcModifier: 2
//             }
//         },
//         {
//             type: 'critical-need',
//             info: 'Critical need: sustenance (25/100)',
//             category: 'dynamic',
//             revealed: {
//                 needId: 'sustenance',
//                 needName: 'Sustenance',
//                 current: 25,
//                 max: 100,
//                 suggestion: 'Addressing this need could make influence easier'
//             }
//         },
//         {
//             type: 'negative-thought',
//             info: 'Current negative thought: Saw corpse (-8 mood)',
//             category: 'dynamic',
//             revealed: { /* thought details */ }
//         }
//     ]
// }
```

### Discovery Options

**Standard PF2e**:
- Best skill to use
- Personality resistances
- Personality weaknesses

**Dynamic State** (NEW):
- Current mood and its DC effect
- Critical needs affecting the NPC
- Active positive thoughts
- Active negative thoughts
- Existing relationship opinion

## Complete Influence Stat Block

Create a full stat block with dynamic modifiers:

```javascript
const statBlock = npcDynamicSystems.createInfluenceStatBlock(
    npc,
    npc.influence, // Base influence data from NPC generation
    playerCharacter
);

console.log(statBlock);
// {
//     name: 'Thorin Stonefist',
//     description: 'Dwarven Merchant',
//     perception: 12,
//     will: 14,
//
//     discovery: {
//         baseDC: 13,
//         skills: ['Mercantile Lore', 'Perception', 'Society']
//     },
//
//     influenceSkills: [
//         {
//             skill: 'Accounting Lore',
//             baseDC: 12,
//             finalDC: 10, // Modified by greedy personality -2
//             modifiers: [
//                 {
//                     source: 'personality-weakness',
//                     label: 'greedy: Motivated by profit',
//                     modifier: -2
//                 }
//             ],
//             dynamicallyAdjusted: true
//         },
//         {
//             skill: 'Diplomacy',
//             baseDC: 15,
//             finalDC: 18, // Modified by mood +2, hunger +2, relationship -1
//             modifiers: [ /* ... */ ],
//             dynamicallyAdjusted: true
//         }
//     ],
//
//     influenceThresholds: [
//         { points: 4, effect: 'Agrees to reduce prices by 10%' },
//         { points: 6, effect: 'Offers bulk discount and future deals' },
//         { points: 8, effect: 'Becomes loyal business partner' }
//     ],
//
//     resistances: [
//         {
//             source: 'mood',
//             description: 'Thorin is dissatisfied, making all influence attempts harder',
//             dcIncrease: 2
//         },
//         {
//             source: 'critical-needs',
//             description: 'Thorin has critical needs (sustenance) and is distracted',
//             dcIncrease: 2
//         },
//         {
//             source: 'personality',
//             description: 'Thorin is stubborn - resistant to persuasion',
//             dcIncrease: 3,
//             skills: ['Diplomacy', 'Intimidation']
//         }
//     ],
//
//     weaknesses: [
//         {
//             source: 'hunger',
//             description: 'Thorin is hungry - offering food reduces DC significantly',
//             dcDecrease: -5,
//             triggerCondition: 'Offer food or discuss food-related topics'
//         },
//         {
//             source: 'personality',
//             description: 'Thorin is greedy - appeals to profit are very effective',
//             dcDecrease: -2,
//             skills: ['Society', 'Mercantile Lore', 'Accounting Lore']
//         }
//     ]
// }
```

## Practical Examples

### Example 1: Influencing a Hungry Merchant

**Situation**: Party needs Thorin's help convincing the town council to fund defenses.

**Thorin's State**:
- Sustenance: 25/100 (Hungry)
- Mood: Dissatisfied (score: 42)
- Occupation: Merchant
- Personalities: Greedy, Pompous, Stubborn
- Opinion of party: 15 (slight acquaintance)

**Attempt 1: Diplomacy** (Base DC 15)
```javascript
const dcData = npcDynamicSystems.calculateInfluenceDC(npc, 'Diplomacy', pc, 15);
// Final DC: 22
// - Base: 15
// - Mood (dissatisfied): +2
// - Hunger: +2
// - Stubborn personality: +3
// - Opinion (15): -1
```

PC rolls 18 → Failure (no Influence Points)

**Attempt 2: Offer Food First**
```javascript
npcDynamicSystems.satisfyNeed(npc, 'sustenance', 70, 'eat-good-meal');
npcDynamicSystems.addThought(npc, 'ate-good-meal');

// NEW State:
// - Sustenance: 95/100 (Well-fed, +5 mood)
// - Thought: "Ate good meal" (+7 mood)
// - Mood: Content (score: 64, DC modifier now 0)
```

**Attempt 3: Accounting Lore** (appeals to greed)
```javascript
const dcData = npcDynamicSystems.calculateInfluenceDC(npc, 'Accounting Lore', pc, 12);
// Final DC: 9
// - Base: 12
// - Greedy weakness: -2
// - Opinion (20, increased from food): -1
// - Mood (content): 0
```

PC rolls 15 → Critical Success! (+2 Influence Points, +10 opinion)

**Result**: Fed NPC, appealed to greed, gained 2 Influence Points and improved relationship significantly.

### Example 2: Discovering Hidden Information

**PC uses Discovery action** (Perception roll: 20, DC 13)

Critical Success! Choose 2 pieces of information:

1. **Current mood**: "Dissatisfied due to hunger - offering food would help"
2. **Critical need**: "Sustenance is critically low (25/100)"

**Strategy Revealed**: Feed the NPC before attempting Influence!

### Example 3: Long-term Influence Encounter

**Gala (6 rounds, 3 hours)**

**Round 1**: Discovery reveals NPC is lonely (social need: 20/100)
- Strategy: Engage in conversation to satisfy social need

**Round 2**: Small talk (satisfies social need +35)
- Social: 20 → 55 (Content)
- Mood improves: Dissatisfied → Neutral
- Opinion: 0 → +5

**Round 3**: Now that NPC is in better mood, attempt Diplomacy
- DC reduced from 22 to 17 (mood improvement + relationship improvement)
- Success! +1 Influence Point, +5 opinion

**Round 4-6**: Continue building relationship
- Each success improves opinion
- Better opinion reduces future DCs
- Snowball effect!

## GM Guidelines

### Setting Up Influence Encounters

1. **Generate NPC** with influence data (NPC generator does this automatically)
2. **Check current state** before encounter begins:
   ```javascript
   const status = npcDynamicSystems.getStatus(npc);
   ```
3. **Create stat block** with dynamic modifiers:
   ```javascript
   const statBlock = npcDynamicSystems.createInfluenceStatBlock(npc, npc.influence);
   ```
4. **Adjust encounter** based on state (e.g., if NPC has critical needs, add opportunities to address them)

### During the Encounter

1. **Process Discovery**:
   ```javascript
   const discovery = npcDynamicSystems.processDiscovery(npc, pc, rollResult, 13);
   ```
   - Allow players to learn about dynamic state
   - Encourage creative solutions (bringing food, etc.)

2. **Calculate DCs dynamically**:
   ```javascript
   const dcData = npcDynamicSystems.calculateInfluenceDC(npc, skill, pc, baseDC);
   ```
   - Show players the final DC
   - Optionally reveal some modifiers as flavor

3. **Process Influence attempts**:
   ```javascript
   const result = npcDynamicSystems.processInfluence(npc, pc, skill, rollResult, baseDC);
   ```
   - Track Influence Points normally
   - Relationship opinion changes automatically

4. **Update state as time passes**:
   ```javascript
   npcDynamicSystems.advanceTime(1, [npc]); // 1 hour passed per round
   ```
   - Needs decay during long encounters
   - Thoughts may expire

### After the Encounter

- **Relationship persists**: Opinion changes remain
- **Future interactions easier/harder** based on how influence went
- **NPCs remember** through opinion modifiers

## Advanced Tactics for Players

### Information Gathering

1. **Use Discovery** to learn about current state before attempting Influence
2. **Identify critical needs** and address them first
3. **Learn personality weaknesses** and tailor approach

### State Manipulation

1. **Satisfy critical needs** before Influencing (food, rest, etc.)
2. **Create positive thoughts** through helpful actions
3. **Build opinion** through multiple successful interactions

### Skill Selection

1. **Check for personality weaknesses** (-2 to -3 DC)
2. **Avoid personality resistances** (+2 to +5 DC)
3. **Use Lore skills** that match NPC's interests
4. **Consider current state**:
   - Hungry? Food-related skills
   - Tired? Avoid complex intellectual skills
   - Traumatized? Empathy and support

### Timing

1. **Better state = easier influence**
2. **Address needs first**, influence second
3. **Build relationship over time** for cumulative benefits
4. **Use Discovery** early to inform strategy

## Integration with Existing Rules

### Compatible With

- ✅ All PF2e Influence rules (GM Core pg. 187-189)
- ✅ Influence Points and thresholds
- ✅ Standard resistances and weaknesses
- ✅ Discovery action
- ✅ Round-based social encounters

### Enhancements

- **Dynamic DCs** replace static DCs
- **Enhanced Discovery** reveals more information
- **Relationship tracking** persists beyond encounter
- **State matters** - NPCs react to their circumstances

### Backward Compatible

- If dynamic systems not initialized, falls back to base DCs
- Works with existing NPC influence data
- No changes required to PF2e core rules

## Summary

The integration enhances PF2e's Influence system by:

1. **Making DCs dynamic** based on NPC's current state
2. **Revealing meaningful information** through Discovery
3. **Creating persistent relationships** through opinion tracking
4. **Rewarding creative solutions** (addressing needs, building rapport)
5. **Adding realism** - NPCs feel alive and reactive

**Result**: More engaging social encounters where player choices matter and NPCs feel like real people, not just skill check targets.
