# Combat Complications System

The Combat Complications system adds tactical depth to critical outcomes by introducing short-term mechanical effects that enhance the narrative experience without overwhelming complexity.

## Overview

Complications are minimal mechanical effects that can occur on critical successes and critical failures:
- **Critical Success**: Affects the target of the attack
- **Critical Failure**: Affects the attacker

These effects are contextual, matching the damage type and anatomy location hit, and last only 1-2 rounds.

## Features

### Contextual Effects
Complications are intelligently selected based on:
- **Damage Type**: Bludgeoning, piercing, or slashing
- **Anatomy Location**: Head, torso, limbs, etc.
- **Outcome**: Critical success or critical failure

### Examples

**Critical Success Complications** (applied to target):
- **Staggered**: Target becomes off-guard for 1 round (head/torso hits)
- **Off-Balance**: Clumsy 1 for 1 round (limb/torso hits)
- **Winded**: Sickened 1 for 1 round (bludgeoning to torso)
- **Dazed**: Stupefied 1 for 1 round (bludgeoning to head)
- **Bleeding Wound**: 1d4 persistent bleed damage (slashing/piercing)
- **Exposed**: -1 status penalty to AC for 1 round
- **Hampered Movement**: -5 ft speed for 1 round (leg hits)

**Critical Failure Complications** (applied to attacker):
- **Overextended**: Attacker becomes off-guard for 1 round
- **Weapon Jarred**: Clumsy 1 for 1 round
- **Lost Footing**: Off-guard for 1 round
- **Defensive Gap**: -1 status penalty to AC for 1 round
- **Stumble**: -5 ft speed for 1 round
- **Rattled**: -1 status penalty to attack rolls for 1 round

## User Interface

When a complication is generated, it appears in the combat narrative card with:
- **Warning Icon**: ⚠️ to draw attention
- **Complication Name**: Clear indication of the effect
- **Duration**: How long the effect lasts
- **Description**: Flavor text explaining the complication
- **Apply Button**: One-click application to the appropriate actor

### Applying Complications

1. After a critical outcome, check if a complication is shown in the narrative card
2. Review the complication details
3. Click the "✨ Apply to [Target/Attacker]" button
4. The effect is automatically applied to the correct actor
5. The button disables to prevent double-application

## Settings

### Enable Combat Complications
**Default**: Enabled
**Description**: Master toggle for the complications system

### Complication Frequency
**Default**: 60%
**Range**: 0-100% (in 5% increments)
**Description**: Percentage chance for a complication to occur on critical outcomes

## Technical Implementation

### Data Structure
Complications are defined in JSON files:
- `/data/combat/complications/critical-success.json`
- `/data/combat/complications/critical-failure.json`

Each complication includes:
```json
{
  "id": "unique-id",
  "name": "Display Name",
  "description": "Flavor text",
  "outcome": "criticalSuccess|criticalFailure",
  "duration": 1,
  "weight": 20,
  "applicableContexts": {
    "damageTypes": ["bludgeoning", "piercing", "slashing"],
    "anatomyTypes": ["head", "torso", "limbs"]
  },
  "effect": {
    "type": "condition|persistent-damage|penalty|speed-penalty",
    "condition": "off-guard",
    "value": 1,
    "duration": 1
  }
}
```

### Effect Application
The system uses PF2e's native effect system to apply:
- **Conditions**: off-guard, clumsy, stupefied, sickened
- **Persistent Damage**: Bleed damage
- **Penalties**: AC, attack, speed modifiers
- **Custom Effects**: Temporary item-based effects with rule elements

### Permission Checks
- Only the GM or the actor's owner can apply complications
- Permission is verified before effect application
- Clear error messages for permission issues

## Design Philosophy

The complications system follows these principles:

1. **Minimal Complexity**: Effects are simple and familiar (standard PF2e conditions)
2. **Short Duration**: 1-2 rounds maximum, no permanent effects
3. **Contextual**: Effects match the narrative (head hits cause dazed, leg hits hamper movement)
4. **Optional**: GMs can disable or adjust frequency to taste
5. **One-Click Application**: Easy to use in the heat of combat
6. **Non-Intrusive**: Appears only on critical outcomes when appropriate

## GM Tips

- **Start Conservative**: Begin with the default 60% frequency and adjust based on your table's preference
- **Selective Application**: You don't have to apply every complication shown
- **Narrative First**: Use complications to enhance storytelling, not as mandatory mechanics
- **Player Agency**: Consider showing complications to players for critical failures to build tension
- **Balance**: Critical failures on attackers balance out critical success complications on targets

## Future Enhancements

Potential future additions:
- Custom complication creation through UI
- Complication chains (one complication leading to another)
- Severity scaling based on level difference
- Complication categories (minor/moderate/severe)
- Integration with specific weapon traits

## Troubleshooting

**Complication not appearing**: Check that "Enable Combat Complications" is on and frequency is > 0%

**Button not working**: Ensure you have permission to modify the target actor

**Effect not applying**: Check console for errors; may need to manually apply effect

**Too many/few complications**: Adjust "Complication Frequency" in module settings

## API Access

For module developers:
```javascript
// Check if complications are enabled
game.settings.get('pf2e-narrative-seeds', 'enableComplications');

// Get complication frequency
game.settings.get('pf2e-narrative-seeds', 'complicationChance');

// Access ComplicationManager
const ComplicationManager = game.modules.get('pf2e-narrative-seeds').api.ComplicationManager;
```
