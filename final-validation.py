#!/usr/bin/env python3
"""
Final comprehensive validation of creature type system
"""

import json
from collections import defaultdict

print("=" * 70)
print("FINAL COMPREHENSIVE VALIDATION")
print("=" * 70)

# Load all data files
print("\n📁 Loading data files...")
with open('/home/user/PF2e-Narrative-Seeds/data/combat/complications/critical-success.json') as f:
    complications = json.load(f)['complications']
    
with open('/home/user/PF2e-Narrative-Seeds/data/combat/dismemberment/dismemberments.json') as f:
    dismemberments = json.load(f)['dismemberments']
    
with open('/home/user/PF2e-Narrative-Seeds/data/combat/effects/anatomy-overrides.json') as f:
    overrides = json.load(f)

# Valid anatomy keys from anatomy-types.js
VALID_KEYS = {
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
}

# Extract creature types from each data source
def extract_creature_types(items):
    """Extract unique creature types from complications or dismemberments"""
    types = set()
    for item in items:
        if 'applicableContexts' in item and 'creatureTypes' in item['applicableContexts']:
            types.update(item['applicableContexts']['creatureTypes'])
    types.discard('any')  # Ignore wildcard
    return types

complication_types = extract_creature_types(complications)
dismemberment_types = extract_creature_types(dismemberments)
override_types = set(overrides.keys())

print(f"✓ Loaded {len(complications)} complications")
print(f"✓ Loaded {len(dismemberments)} dismemberments")
print(f"✓ Loaded {len(overrides)} anatomy overrides")

# Validation 1: Check all types are valid
print("\n" + "=" * 70)
print("VALIDATION 1: All creature types must be valid anatomy keys")
print("=" * 70)

all_types = complication_types | dismemberment_types | override_types
invalid = all_types - VALID_KEYS

if invalid:
    print(f"❌ FAILED: Found {len(invalid)} invalid creature types:")
    for t in sorted(invalid):
        print(f"   - '{t}'")
else:
    print(f"✅ PASSED: All {len(all_types)} unique creature types are valid")
    print(f"   Used types: {', '.join(sorted(all_types))}")

# Validation 2: Check coverage consistency
print("\n" + "=" * 70)
print("VALIDATION 2: Creature type coverage across systems")
print("=" * 70)

print(f"\nComplications cover: {len(complication_types)} creature types")
print(f"Dismemberments cover: {len(dismemberment_types)} creature types")
print(f"Overrides cover: {len(override_types)} creature types")

# Types with complications but no dismemberments
missing_dismember = complication_types - dismemberment_types
if missing_dismember:
    print(f"\n⚠️  {len(missing_dismember)} types have complications but NO dismemberments:")
    for t in sorted(missing_dismember):
        print(f"   - {t}")

# Types with dismemberments but no complications
missing_complications = dismemberment_types - complication_types
if missing_complications:
    print(f"\n⚠️  {len(missing_complications)} types have dismemberments but NO complications:")
    for t in sorted(missing_complications):
        print(f"   - {t}")

# Types with either but no overrides
has_injuries = complication_types | dismemberment_types
missing_overrides = has_injuries - override_types
if missing_overrides:
    print(f"\n⚠️  {len(missing_overrides)} types have injuries but NO narrative overrides:")
    for t in sorted(missing_overrides):
        print(f"   - {t}")

# Validation 3: Check modifier vs base separation
print("\n" + "=" * 70)
print("VALIDATION 3: Modifier vs Base anatomy separation")
print("=" * 70)

MODIFIERS = {"incorporeal", "skeletal", "skeleton", "zombie", "vampire", "mummy", "lich", "undead"}

modifier_usage = all_types & MODIFIERS
base_usage = all_types - MODIFIERS

print(f"\n✓ {len(modifier_usage)} modifier types used: {', '.join(sorted(modifier_usage))}")
print(f"✓ {len(base_usage)} base anatomy types used: {', '.join(sorted(base_usage))}")

# Validation 4: Count entries per creature type
print("\n" + "=" * 70)
print("VALIDATION 4: Entry counts per creature type")
print("=" * 70)

complication_counts = defaultdict(int)
for comp in complications:
    if 'applicableContexts' in comp and 'creatureTypes' in comp['applicableContexts']:
        for ct in comp['applicableContexts']['creatureTypes']:
            if ct != 'any':
                complication_counts[ct] += 1

dismemberment_counts = defaultdict(int)
for dism in dismemberments:
    if 'applicableContexts' in dism and 'creatureTypes' in dism['applicableContexts']:
        for ct in dism['applicableContexts']['creatureTypes']:
            if ct != 'any':
                dismemberment_counts[ct] += 1

print("\nCreature Type Coverage:")
print(f"{'Type':<20} {'Complications':<15} {'Dismemberments':<15} {'Overrides':<10}")
print("-" * 70)

for ctype in sorted(all_types):
    comp_count = complication_counts.get(ctype, 0)
    dism_count = dismemberment_counts.get(ctype, 0)
    over_mark = "✓" if ctype in override_types else "✗"
    
    print(f"{ctype:<20} {comp_count:>3} entries      {dism_count:>3} entries      {over_mark}")

# Final summary
print("\n" + "=" * 70)
print("FINAL SUMMARY")
print("=" * 70)

issues = []
if invalid:
    issues.append(f"❌ {len(invalid)} invalid creature type names")
else:
    print("✅ All creature type names are valid")

if not invalid and not missing_overrides:
    print("✅ All creature types have proper coverage")
else:
    if missing_overrides:
        issues.append(f"⚠️  {len(missing_overrides)} types missing narrative overrides")

if not issues:
    print("\n🎉 ALL VALIDATIONS PASSED! System is fully consistent.")
else:
    print("\n⚠️  Issues found:")
    for issue in issues:
        print(f"   {issue}")

