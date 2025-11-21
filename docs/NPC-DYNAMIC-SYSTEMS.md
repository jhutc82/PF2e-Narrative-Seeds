# NPC Dynamic Systems Documentation

This document explains the Rimworld/Sims-inspired dynamic character systems for NPCs.

## Overview

The NPC Dynamic Systems add living, breathing simulation to NPCs with:

- **Needs System**: NPCs have needs (hunger, rest, social, etc.) that decay over time
- **Thoughts System**: Time-limited mood modifiers from events (like Rimworld thoughts or Sims moodlets)
- **Dynamic Mood**: Mood calculated dynamically from needs, thoughts, personality, and relationships
- **Relationship Dynamics**: Opinion-based relationships that change through interactions
- **Autonomous Behavior**: NPCs autonomously seek to fulfill needs and pursue goals
- **Time Progression**: All systems update as game time passes

## Quick Start

```javascript
// 1. Initialize the systems
await npcDynamicSystems.initialize();

// 2. When you generate an NPC, it will automatically have dynamic fields initialized
const npc = await NPCGenerator.generate();

// 3. Get comprehensive NPC status
const status = npcDynamicSystems.getStatus(npc);

// 4. Process a social interaction
const result = npcDynamicSystems.processSocialInteraction(
    playerCharacter,
    npc,
    'small-talk',
    { skill: 'diplomacy', dc: 15, passed: true }
);

// 5. Advance time (updates needs, thoughts, mood, relationships)
npcDynamicSystems.advanceTime(8, [npc]); // 8 hours passed
```

## System Details

### 1. Needs System

NPCs have 7 core needs that decay over time and affect mood:

#### Core Needs

1. **Sustenance** (Food/Water)
   - Decay: 1.5/hour
   - Thresholds: Starving (10), Hungry (35), Satisfied (65), Well-fed (85)
   - Mood effect: -20 (starving) to +5 (well-fed)

2. **Rest** (Sleep/Energy)
   - Decay: 3.0/hour
   - Thresholds: Exhausted (15), Tired (40), Rested (70), Well-rested (90)
   - Mood effect: -15 (exhausted) to +8 (well-rested)
   - Status effects: Penalties when exhausted, bonuses when well-rested

3. **Social** (Interaction)
   - Decay: 2.0/hour
   - Thresholds: Isolated (15), Lonely (40), Content (65), Socially Fulfilled (85)
   - Mood effect: -12 (isolated) to +6 (fulfilled)
   - Personality modifiers: Outgoing NPCs need more social interaction

4. **Safety** (Security)
   - Decay: 0 (only changes from events)
   - Thresholds: Terrified (15), Anxious (40), Secure (70), Protected (90)
   - Mood effect: -25 (terrified) to +5 (protected)

5. **Purpose** (Meaning)
   - Decay: 0.5/hour
   - Thresholds: Aimless (20), Seeking (45), Fulfilled (70), Driven (90)
   - Mood effect: -10 (aimless) to +10 (driven)

6. **Recreation** (Entertainment)
   - Decay: 1.8/hour
   - Thresholds: Bored (20), Understimulated (45), Entertained (70), Engaged (88)
   - Mood effect: -8 (bored) to +7 (engaged)
   - Types: Social, solitary, cerebral, active

7. **Comfort** (Environment Quality)
   - Decay: 0 (decays toward base value)
   - Thresholds: Miserable (15), Uncomfortable (40), Comfortable (65), Luxurious (88)
   - Mood effect: -12 (miserable) to +8 (luxurious)

#### Personality Effects on Needs

- **Gluttonous**: Hunger decays 50% faster, needs more food
- **Outgoing**: Social need decays 150% faster, higher threshold
- **Lazy**: Rest decays 30% faster, sleeps more
- **Paranoid**: Lower base safety, higher safety threshold

#### Satisfying Needs

```javascript
// Satisfy a need directly
npcDynamicSystems.satisfyNeed(npc, 'sustenance', 50, 'eat-normal-meal');

// Needs are also satisfied through:
// - Social interactions (satisfy social need)
// - Time-based behaviors (NPC autonomously seeks food when hungry)
// - Environmental effects (comfortable bed increases comfort)
```

### 2. Thoughts System

Thoughts are time-limited mood modifiers triggered by events (like Rimworld or Sims moodlets).

#### Thought Categories

- **Social**: Had good conversation (+8, 6h), Was insulted (-10, 24h)
- **Food**: Ate good meal (+7, 8h), Ate without table (-3, 3h)
- **Rest**: Well rested (+8, 12h), Sleep deprived (-15, while true)
- **Traumatic**: Saw loved one die (-30, 720h), Witnessed atrocity (-25, 240h)
- **Positive Events**: Life saved (+20, 480h), Received gift (+10, 72h)
- **Negative Events**: Betrayed (-25, 480h), Humiliated (-18, 168h)
- **Environmental**: Beautiful environment (+6), In darkness (-6)
- **Work**: Career progress (+15, 168h), Criticized for work (-8, 48h)
- **Health**: In pain (-12), Healed (+12, 24h)
- **Combat**: Won combat (+10, 48h), Killed someone (-8, 120h)

#### Thought Mechanics

- **Duration**: Specified in hours or permanent
- **Decay**: Linear, exponential, or none
- **Stacking**: Some thoughts stack (saw corpse x3), others don't
- **Personality modifiers**: Cheerful NPC gets more positive effect from good events

#### Adding Thoughts

```javascript
// Add a thought
npcDynamicSystems.addThought(npc, 'had-good-conversation', {
    name: 'Elena Brightwood' // Context for description
});

// Thoughts automatically:
// - Expire after duration
// - Decay over time
// - Contribute to mood calculation
```

### 3. Dynamic Mood System

Mood is calculated dynamically from multiple factors (no longer static).

#### Mood Calculation

```
Mood Score (0-100) = Base (50)
    + Needs contribution
    + Thoughts contribution
    + Personality baseline
    + Nearby relationships
    + Health effects
```

#### Mood Categories

| Score | Mood | Attitude | Social DC | Effect |
|-------|------|----------|-----------|--------|
| 90+ | Ecstatic | Helpful | 5 | Very positive |
| 75-89 | Happy | Friendly | 10 | Positive |
| 60-74 | Content | Friendly | 12 | Slightly positive |
| 45-59 | Neutral | Indifferent | 15 | Neutral |
| 30-44 | Dissatisfied | Indifferent | 18 | Slightly negative |
| 15-29 | Unhappy | Unfriendly | 22 | Negative |
| 0-14 | Miserable | Hostile | 28 | Very negative |

#### Dynamic DC Example

**Thorin the Merchant** (before):
- Static mood: Friendly
- Social DC: Always 12

**Thorin the Merchant** (after):
- Hungry (need: 20/100): -8 mood
- Thought "Saw corpse": -8 mood
- Thought "Had good sale": +10 mood
- Personality (cheerful): +10 mood
- **Current mood: 54 (Neutral)**
- **Current DC: 15** (changes as situation changes!)

### 4. Relationship Dynamics

Opinion-based relationships that change through interactions (like Rimworld).

#### Opinion System

- **Range**: -100 (bitter enemy) to +100 (soulmate)
- **Base Compatibility**: Calculated from personality compatibility
- **Opinion Modifiers**: Time-limited effects from interactions

#### Relationship Types

| Opinion | Type | Behavior |
|---------|------|----------|
| 70+ | Close Friend | Very cooperative, shares secrets |
| 40-69 | Friend | Cooperative, helpful |
| 10-39 | Acquaintance | Neutral, professional |
| -20-9 | Neutral | Indifferent |
| -50-(-21) | Rival | Uncooperative, competitive |
| <-50 | Enemy | Hostile, may sabotage |

#### Trust Levels

- **Stranger**: Just met, shares nothing
- **Acquaintance**: Casual conversation
- **Trusted**: Shares some information
- **Confidant**: Shares secrets

#### Relationship Progression

```javascript
// Relationships change through interactions
const result = npcDynamicSystems.processSocialInteraction(
    player,
    npc,
    'compliment',
    { skill: 'diplomacy', dc: 12, passed: true }
);

// Success adds opinion modifier:
// "Said something nice to me" +8 opinion (decays over 20 days)

// Opinions also decay over time without interaction
// Default decay: -0.5 opinion every 7 days
```

#### Opinion Modifiers

```javascript
// Example relationship with multiple modifiers:
{
    npcId: 'elena-brightwood',
    opinion: 45,
    opinionModifiers: [
        {
            reason: 'Saved my life',
            value: +50,
            duration: 'permanent'
        },
        {
            reason: 'Had nice conversation',
            value: +8,
            duration: 240, // hours (10 days)
            timestamp: gameTime,
            decayType: 'linear'
        },
        {
            reason: 'Insulted me',
            value: -15,
            duration: 480, // 20 days
            decayType: 'exponential'
        }
    ]
}
```

### 5. Social Interaction System

Process social interactions with success/failure outcomes.

#### Interaction Types

**Friendly**:
- Small Talk (DC 10): Quick chat
- Deep Conversation (DC 18, requires 30+ opinion): Meaningful talk
- Compliment (DC 12): Say something nice
- Share Meal (DC 8): Eat together
- Give Gift (DC 5): Present a gift

**Flirtatious**:
- Flirt (DC 16, requires 20+ opinion): Make romantic advances
- Confess Feelings (DC 20, requires 50+ opinion): Declare love

**Aggressive**:
- Insult (DC 10): Say something offensive
- Intimidate (DC 15): Threaten or coerce

**Professional**:
- Business Proposition (DC 14): Propose a deal
- Request Favor (DC 16, requires 40+ opinion): Ask for help
- Offer Help (DC 8): Offer assistance

**Informational**:
- Ask About Topic (DC 12): Inquire about something
- Gather Rumors (DC 10): Ask about local gossip

#### Success Calculation

```
Success Chance = Base Chance
    + Current mood modifier
    + Existing relationship modifier
    + Personality compatibility
    + Needs state modifier
    + Skill check bonus
```

#### Example Interaction

```javascript
// Player tries to get information from a hungry, tired guard

const guard = {
    name: 'Guard Marcus',
    needs: {
        sustenance: { current: 25 }, // Hungry
        rest: { current: 30 } // Tired
    },
    personalities: ['taciturn'], // Not talkative
    relationshipsDynamic: {
        'player-id': { opinion: 15 } // Slight acquaintance
    }
};

const result = npcDynamicSystems.processSocialInteraction(
    player,
    guard,
    'ask-about-topic',
    { skill: 'diplomacy', dc: 12, passed: true }
);

// Calculation:
// - Base: 0.6
// - Mood (hungry/tired): -0.3
// - Relationship (15): +0.075
// - Personality (taciturn): -0.2
// - Skill passed: +0.3
// = 0.475 (47.5% chance)

// If success: Gets information, +2 opinion
// If failure: No information, opinion unchanged
```

### 6. Autonomous Behavior System

NPCs autonomously seek to fulfill needs and pursue goals.

#### Behavior Categories

1. **Need-Driven** (high priority)
   - Seek Food (when hungry)
   - Seek Rest (when tired)
   - Seek Social Interaction (when lonely)
   - Seek Safety (when anxious)

2. **Scheduled** (medium-high priority)
   - Work (weekday mornings/afternoons)
   - Morning/Evening Routines
   - Sleep (nighttime)

3. **Personality-Driven** (low-medium priority)
   - Investigate Curiosity (curious)
   - Cause Mischief (mischievous)
   - Pray/Meditate (pious)
   - Gossip (verbose/gossipy)

4. **Motivation-Driven** (high priority)
   - Pursue Power (gain-power motivation)
   - Pursue Wealth (gain-wealth motivation)
   - Pursue Knowledge (gain-knowledge motivation)
   - Seek Revenge (seek-revenge motivation)

#### Current Desire

```javascript
// Get what NPC wants to do right now
const desire = npcDynamicSystems.getCurrentDesire(npc);

// Returns:
{
    behaviorId: 'seek-food',
    behavior: { /* behavior config */ },
    priority: 75, // Based on how hungry they are
    trigger: 'need',
    needId: 'sustenance',
    needValue: 25
}
```

#### Schedule Templates

NPCs follow different schedules based on occupation:
- **Commoner**: Work 8-5, evening recreation
- **Merchant**: Run shop 8-7, accounting at night
- **Guard**: Patrol shifts, training on weekends
- **Scholar**: Research and study, late nights
- **Noble**: Social calls, banquets, leisure
- **Criminal**: Sleep during day, work at night

### 7. Time Progression System

Time-based updates for all systems.

#### Manual Time Advancement

```javascript
// Advance time by 8 hours
const results = npcDynamicSystems.advanceTime(8, [npc1, npc2, npc3]);

// Returns:
{
    updated: 3,
    criticalNeeds: [
        {
            npcId: 'npc1',
            npcName: 'Thorin',
            needs: ['sustenance', 'rest']
        }
    ],
    moodChanges: [
        {
            npcId: 'npc2',
            npcName: 'Elena',
            oldMood: 'happy',
            newMood: 'content'
        }
    ],
    thoughtsExpired: 5,
    relationshipsDecayed: 2
}
```

#### Automatic Time Progression

```javascript
// Start automatic updates
// Updates every 1 minute of real time = 1 hour of game time (default scale: 1)
npcDynamicSystems.startAutomaticUpdates(npcs);

// Adjust time scale
npcDynamicSystems.setTimeScale(60); // 1 real minute = 1 game hour

// Stop automatic updates
npcDynamicSystems.stopAutomaticUpdates();
```

## Integration Examples

### Example 1: Party Encounters Hungry Merchant

```javascript
// Initialize merchant
const merchant = await NPCGenerator.generate({
    occupation: 'merchant'
});

// Advance time 12 hours (merchant hasn't eaten)
npcDynamicSystems.advanceTime(12, [merchant]);

// Check status
const status = npcDynamicSystems.getStatus(merchant);
// sustenance: 25/100 (Hungry, -8 mood)
// mood: Dissatisfied (DC 18)

// Player offers food
npcDynamicSystems.satisfyNeed(merchant, 'sustenance', 70, 'eat-good-meal');
npcDynamicSystems.addThought(merchant, 'ate-good-meal');

// Now check status again
const newStatus = npcDynamicSystems.getStatus(merchant);
// sustenance: 95/100 (Well-fed, +5 mood)
// thought: "Ate good meal" (+7 mood)
// mood: Content (DC 12)

// Social interaction is now easier!
```

### Example 2: Building Relationship Over Time

```javascript
// Day 1: First meeting
const result1 = npcDynamicSystems.processSocialInteraction(
    player,
    npc,
    'small-talk',
    { passed: true }
);
// Opinion: 3 (base compatibility) + 3 (small talk) = 6

// Day 2: Help them
const result2 = npcDynamicSystems.processSocialInteraction(
    player,
    npc,
    'offer-help',
    { passed: true }
);
// Opinion: 6 + 12 (offer help) = 18

// Day 5: Share a meal
npcDynamicSystems.processSocialInteraction(player, npc, 'share-meal', { passed: true });
// Opinion: 18 + 10 (share meal) = 28

// Day 10: Deep conversation (now possible with 30+ opinion)
npcDynamicSystems.processSocialInteraction(player, npc, 'deep-conversation', { passed: true });
// Opinion: 28 + 12 (deep talk) = 40
// Relationship type: Friend
// Trust level: Trusted
// May reveal secrets!
```

### Example 3: Traumatic Event Impact

```javascript
// NPC witnesses friend's death
npcDynamicSystems.addThought(npc, 'saw-loved-one-die', {
    name: 'Marcus the Guard'
});

// Immediate effects:
// - Thought: "I saw Marcus die" (-30 mood, 720 hours)
// - Mood: Drops from Happy (75) to Unhappy (45)
// - Social DC: Increases from 10 to 18
// - Attitude: Changes from Friendly to Indifferent

// This persists for 30 days, decaying exponentially
// After 7 days: Still -20 mood
// After 15 days: -10 mood
// After 30 days: Expired

// Relationship with player (if they didn't prevent it):
// - Opinion modifier: "Didn't save Marcus" -20 (permanent)
```

## Best Practices

### 1. Initialize Systems Once

```javascript
// At app startup
await npcDynamicSystems.initialize();
```

### 2. Check Status Before Interactions

```javascript
const status = npcDynamicSystems.getStatus(npc);

if (status.needs.criticalCount > 0) {
    console.log(`${npc.name} has critical needs!`);
}

if (status.mood.score < 40) {
    console.log(`${npc.name} is unhappy (DC ${status.mood.current.socialDC})`);
}
```

### 3. Update NPCs Periodically

```javascript
// When time passes in game
npcDynamicSystems.advanceTime(hoursElapsed, allNPCs);

// Or use automatic updates
npcDynamicSystems.startAutomaticUpdates(allNPCs);
```

### 4. React to Critical Needs

```javascript
const status = npcDynamicSystems.getStatus(npc);

if (status.needs.needs.find(n => n.id === 'sustenance' && n.percentage < 20)) {
    // NPC will seek food autonomously
    const desire = npcDynamicSystems.getCurrentDesire(npc);
    console.log(`${npc.name} wants to ${desire.description}`);
}
```

## Emergence Examples

The magic happens when systems interact:

### Example: The Desperate Thief

```
1. Thief has low sustenance (15/100) and no money (economics.wealth: 0)
2. Hunger creates thought "Starving" (-20 mood)
3. Mood drops to "Miserable" (attitude: hostile, DC 28)
4. Autonomous behavior: "Seek food" (priority: 85)
5. Personality "desperate" + motivation "survive" = willing to steal
6. Player encounters thief attempting robbery
7. If player offers food instead:
   - Satisfies sustenance need
   - Adds thought "Received food from stranger" (+12 mood)
   - Opinion of player: +25 (permanent: "Saved me from starvation")
   - May become ally, provide information, or help later
```

### Example: The Grieving Widow

```
1. NPC witnesses husband's death
2. Thought "Lost loved one" (-35 mood, 1440 hours = 60 days)
3. Mood: Miserable (score: 15)
4. Social need decay faster (isolated, needs support)
5. If player regularly visits and talks:
   - Social interactions satisfy social need
   - Multiple "Had good conversation" thoughts (+8 each)
   - Opinion increases gradually
   - After 30 days, grief thought decay to -18
   - Mood improves to Unhappy (30)
   - Eventually becomes friend, grateful for support
```

## Data Files Reference

- `needs-config.json`: Need definitions, thresholds, satisfaction methods
- `thoughts.json`: Thought types, durations, mood effects
- `social-interactions.json`: Interaction types, success modifiers
- `autonomous-behaviors.json`: Behavior templates
- `time-schedules.json`: Daily activity patterns by occupation

## API Reference

See inline documentation in:
- `npc-needs-system.js`
- `npc-thoughts-system.js`
- `npc-mood-calculator.js`
- `npc-relationship-dynamics.js`
- `npc-behavior-engine.js`
- `npc-time-manager.js`
- `npc-dynamic-systems.js` (main integration module)

## Comparison: Before and After

### Before (Static System)

NPCs are snapshots:
- "Thorin is friendly (DC 12)"
- Stays this way forever
- No simulation or change

### After (Dynamic System)

NPCs are living characters:
- "Thorin is currently content (DC 15) because he's well-rested (+8) but hungry (-8) and thinking about yesterday's good sale (+10)"
- Changes based on needs, events, relationships
- Players can influence mood through actions
- NPCs react differently based on current state

The result: **Emergent, believable, living NPCs that feel like they exist in the world**
