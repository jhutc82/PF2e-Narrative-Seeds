# NPC Realism Enhancement Architecture

This document outlines the comprehensive enhancement systems to create deeply realistic, interconnected NPCs.

## 1. Contextual Trait Relationships

### Purpose
Traits should influence each other to create cohesive personalities.

### Schema
```json
{
  "id": "paranoid",
  "influences": {
    "increases": [
      {"id": "watches-door", "multiplier": 3.0, "category": "mannerism"},
      {"id": "keeps-distance", "multiplier": 2.5, "category": "mannerism"},
      {"id": "looks-around", "multiplier": 3.0, "category": "mannerism"},
      {"id": "fear:betrayal", "multiplier": 2.0, "category": "fear"}
    ],
    "decreases": [
      {"id": "stands-too-close", "multiplier": 0.1, "category": "mannerism"},
      {"id": "trusting", "multiplier": 0.0, "category": "personality"}
    ]
  }
}
```

### Implementation
- Add `influences` object to personalities, occupations, backstory events
- During generation, track selected traits and modify likelihood weights
- Accumulate influence effects across all selected traits

## 2. Cultural/Regional Variations

### Purpose
Add depth through cultural identity within ancestries.

### Data Structure
Create `cultures.json`:
```json
{
  "human": {
    "taldan": {
      "name": "Taldan",
      "region": "Taldor",
      "description": "Noble, refined, traditionalist",
      "influences": {
        "speechPatterns": ["formal-speech", "quotes-people", "name-drops"],
        "clothing": ["noble-attire", "family-colors", "heraldic-jewelry"],
        "values": ["honor", "tradition", "nobility"]
      }
    },
    "ulfen": {
      "name": "Ulfen",
      "region": "Lands of the Linnorm Kings",
      "description": "Fierce warriors, direct speakers",
      "influences": {
        "physicalDetails": ["battle-scars", "muscular-build", "war-tattoos"],
        "speechPatterns": ["blunt", "loud-voice", "warrior-metaphors"],
        "clothing": ["furs", "practical-gear", "trophy-jewelry"]
      }
    }
  },
  "elf": {
    "aiudara": {
      "name": "Aiudara Elf",
      "region": "Kyonin",
      "description": "Traditional, connected to nature"
    },
    "ancient": {
      "name": "Ancient Elf",
      "region": "Varied",
      "description": "Worldly, well-traveled, seen empires rise and fall"
    }
  }
}
```

### Schema Addition
Add to options:
```json
{
  "id": "formal-speech",
  "cultures": ["taldan", "chelaxian", "noble-any"],
  "culturalMultiplier": 2.5
}
```

## 3. Age-Appropriate Options

### Schema
```json
{
  "id": "arthritis",
  "ageRange": {
    "min": 45,
    "preferred": 60,
    "max": null
  },
  "ageCategories": ["mature", "elderly"],
  "ageLikelihood": {
    "young": 0.1,
    "adult": 0.3,
    "mature": 1.0,
    "elderly": 2.0
  }
}
```

### Age Categories
- **young**: 15-25
- **adult**: 25-45
- **mature**: 45-65
- **elderly**: 65+

(Adjusted per ancestry lifespan)

## 4. Internal Consistency System

### Incompatibility Matrix
```json
{
  "incompatibilities": [
    {
      "traits": ["verbose", "taciturn"],
      "severity": "impossible",
      "reason": "Cannot be both talkative and quiet"
    },
    {
      "traits": ["smiles-constantly", "frowns"],
      "severity": "impossible"
    },
    {
      "traits": ["gregarious", "reclusive"],
      "severity": "impossible"
    }
  ],
  "interestingTensions": [
    {
      "traits": ["paranoid", "gregarious"],
      "storyPotential": "high",
      "description": "Wants connection but fears betrayal"
    },
    {
      "traits": ["formal-speech", "slovenly"],
      "storyPotential": "high",
      "description": "Fallen noble or eccentric aristocrat"
    },
    {
      "traits": ["wealthy", "stingy-clothing"],
      "storyPotential": "medium",
      "description": "Miser or disguised wealth"
    }
  ]
}
```

## 5. Social Class Deep Integration

### Class Hierarchy
- **destitute**: Beggars, homeless, desperate
- **peasant**: Laborers, farmers, poor workers
- **commoner**: Craftspeople, stable workers, soldiers
- **merchant**: Successful traders, guild masters, professionals
- **gentry**: Minor nobles, wealthy merchants, landowners
- **noble**: Aristocracy, court members, titled families
- **royalty**: Ruling families, highest nobility

### Schema Extension
```json
{
  "id": "pristine-hygiene",
  "socialClass": ["merchant", "gentry", "noble", "royalty"],
  "classMultiplier": {
    "destitute": 0.0,
    "peasant": 0.1,
    "commoner": 0.3,
    "merchant": 1.5,
    "gentry": 2.0,
    "noble": 3.0,
    "royalty": 3.0
  }
}
```

### Class Influences Everything
- Hygiene levels
- Clothing quality
- Speech patterns
- Education level
- Health access
- Possessions
- Scars (untreated vs. healed properly)

## 6. Integrated Backstory Generation

### Backstory Templates
```json
{
  "backstoryTemplates": [
    {
      "id": "witnessed-murder",
      "name": "Witnessed a Murder",
      "plotHook": "secret:witnessed-murder",
      "triggers": {
        "fears": [
          {"id": "fear:authority", "likelihood": 3.0},
          {"id": "fear:dark", "likelihood": 2.0}
        ],
        "mannerisms": [
          {"id": "avoids-eye-contact", "likelihood": 2.5},
          {"id": "looks-around", "likelihood": 2.5}
        ],
        "health": [
          {"id": "insomnia", "likelihood": 2.0},
          {"id": "anxiety", "likelihood": 2.5}
        ],
        "speechPatterns": [
          {"id": "nervous-laughter", "likelihood": 2.0},
          {"id": "trails-off", "likelihood": 1.5}
        ]
      }
    },
    {
      "id": "former-soldier",
      "name": "War Veteran",
      "occupation": "soldier",
      "triggers": {
        "physicalDetails": [
          {"id": "battle-scars", "likelihood": 3.0},
          {"id": "missing-digit", "likelihood": 1.5}
        ],
        "mannerisms": [
          {"id": "watches-door", "likelihood": 2.5},
          {"id": "military-posture", "likelihood": 3.0}
        ],
        "health": [
          {"id": "old-war-wound", "likelihood": 2.5},
          {"id": "ptsd", "likelihood": 1.8}
        ],
        "personalities": [
          {"id": "disciplined", "likelihood": 2.0},
          {"id": "vigilant", "likelihood": 2.5}
        ]
      }
    }
  ]
}
```

## 7. Pre-Generated Relationships

### Relationship System
```json
{
  "relationshipTypes": [
    {
      "type": "family",
      "subtypes": ["parent", "child", "sibling", "spouse", "cousin"],
      "sharedTraits": ["ancestry", "culture", "region"],
      "inheritedTraits": {
        "parent-child": ["personality:stubborn", "quirk:superstitious"],
        "siblings": ["upbringing", "social-class"]
      }
    },
    {
      "type": "professional",
      "subtypes": ["colleague", "rival", "mentor", "apprentice"],
      "sharedContext": ["occupation", "organization", "social-class"]
    },
    {
      "type": "social",
      "subtypes": ["friend", "enemy", "lover", "ex-lover"],
      "crossContext": true
    }
  ]
}
```

### Relationship Web Generation
When generating multiple NPCs:
1. Determine community size and structure
2. Create relationship graph
3. Share appropriate traits
4. Create interconnected plot hooks
5. Generate compatible/conflicting motivations

## 8. Mixed Ancestry & Versatile Heritages

### Ancestry Mixing System
```json
{
  "mixedAncestries": {
    "half-elf": {
      "primary": "human",
      "secondary": "elf",
      "inheritanceRatio": 0.5,
      "uniqueOptions": [...],
      "selectionStrategy": "blend"
    },
    "half-orc": {
      "primary": "human",
      "secondary": "orc",
      "inheritanceRatio": 0.4,
      "uniqueOptions": [...],
      "selectionStrategy": "blend"
    }
  },
  "versatileHeritages": {
    "tiefling": {
      "overlay": true,
      "baseAncestry": "any",
      "additionalFeatures": [
        "horns-small", "horns-large", "tail-devil",
        "skin-red-tint", "eyes-glowing", "unnatural-beauty"
      ],
      "influences": {
        "social": "prejudice-modifier",
        "personality": "rebellious-tendency"
      }
    },
    "aasimar": {
      "overlay": true,
      "baseAncestry": "any",
      "additionalFeatures": [
        "halo-faint", "eyes-metallic", "skin-luminescent",
        "hair-metallic", "beauty-otherworldly"
      ]
    },
    "dhampir": {
      "overlay": true,
      "baseAncestry": "any",
      "additionalFeatures": [
        "pale-skin-extreme", "fangs-subtle", "no-reflection",
        "cold-touch", "light-sensitivity"
      ],
      "healthModifications": {
        "removes": ["pregnancy", "aging-normal"],
        "adds": ["blood-hunger", "light-sensitivity"]
      }
    }
  }
}
```

### Selection Strategy
```javascript
// For half-elf
options = [
  ...filterByAncestry(allOptions, "human"),
  ...filterByAncestry(allOptions, "elf"),
  ...halfElfUniqueOptions
]

// For tiefling half-elf
baseOptions = [...half-elf options]
overlayOptions = [...tiefling features]
finalNPC = merge(baseOptions, overlayOptions)
```

## Implementation Priority

1. **Contextual Trait Relationships** (Phase 1)
   - Add influences to personalities, occupations
   - Implement influence engine in generator

2. **Age-Appropriate Filtering** (Phase 1)
   - Add age ranges to all options
   - Implement age-based likelihood modification

3. **Social Class Integration** (Phase 2)
   - Add class tags and multipliers
   - Deep integration across categories

4. **Cultural Variations** (Phase 2)
   - Create cultures.json
   - Add culture selection and filtering

5. **Consistency Checks** (Phase 3)
   - Create incompatibility matrix
   - Add tension detection

6. **Backstory Templates** (Phase 3)
   - Create template system
   - Link plot hooks to trait cascades

7. **Mixed Ancestry** (Phase 4)
   - Implement ancestry mixing
   - Add versatile heritage overlays

8. **Relationship Generation** (Phase 4)
   - Build relationship web system
   - Integrate with families/factions

## Expected Impact

- **Cohesion**: Traits reinforce each other naturally
- **Diversity**: Cultural variations multiply options
- **Realism**: Age and class create authentic profiles
- **Depth**: Backstories manifest in present behaviors
- **Complexity**: Relationships create community context
- **Flexibility**: Mixed ancestries enable unique characters

This system will create NPCs that feel like real people with interconnected histories, motivations, and behaviors.
