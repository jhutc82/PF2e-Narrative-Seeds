#!/usr/bin/env python3
"""
Check anatomy-overrides.json for consistency with anatomy system
"""

import json

# Valid keys from anatomy-types.js
VALID_ANATOMY_KEYS = [
    # Base anatomies
    "will-o-wisp", "scythe-tree", "shambling-mound", "troll", "owlbear", "worg",
    "giant-cyclops", "dragon", "fey-tiny", "fey-small", "fey-humanoid", "fey-general",
    "air-elemental", "earth-elemental", "fire-elemental", "water-elemental", "elemental-general",
    "golem", "construct", "amorphous", "vine", "plant", "aberration-tentacled", "aberration-general",
    "insectoid", "serpent", "avian", "aquatic", "quadruped", "demon", "devil", "daemon",
    "fiend", "angel", "archon", "azata", "celestial", "psychopomp", "monitor",
    "giant", "goblinoid", "orc", "humanoid",
    # Modifiers
    "incorporeal", "skeletal", "skeleton", "zombie", "vampire", "mummy", "lich", "undead"
]

print("=" * 60)
print("CHECKING ANATOMY-OVERRIDES.JSON")
print("=" * 60)

# Load anatomy-overrides.json
with open('/home/user/PF2e-Narrative-Seeds/data/combat/effects/anatomy-overrides.json', 'r') as f:
    data = json.load(f)

print(f"\nFound {len(data)} creature type keys in anatomy-overrides.json:\n")

invalid_keys = []
valid_keys = []

for key in sorted(data.keys()):
    if key in VALID_ANATOMY_KEYS:
        valid_keys.append(key)
        print(f"✓ '{key}' - VALID")
    else:
        invalid_keys.append(key)
        print(f"✗ '{key}' - NOT IN ANATOMY SYSTEM")
        
        # Check if it's close to a valid key
        similar = [k for k in VALID_ANATOMY_KEYS if key.lower() in k.lower() or k.lower() in key.lower()]
        if similar:
            print(f"  Similar keys found: {', '.join(similar)}")

print("\n" + "=" * 60)
print(f"SUMMARY: {len(valid_keys)} valid, {len(invalid_keys)} invalid")
print("=" * 60)

if invalid_keys:
    print("\n⚠️  ISSUES FOUND!")
    print(f"Invalid keys: {', '.join(invalid_keys)}")
else:
    print("\n✅ All keys are valid!")
