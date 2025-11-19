#!/usr/bin/env python3
"""
Deep analysis for edge cases and potential runtime issues
"""

import json
from collections import defaultdict

print("=" * 70)
print("DEEP ANALYSIS: EDGE CASES AND POTENTIAL ISSUES")
print("=" * 70)

# Load all data files
with open('/home/user/PF2e-Narrative-Seeds/data/combat/complications/critical-success.json') as f:
    complications = json.load(f)['complications']
    
with open('/home/user/PF2e-Narrative-Seeds/data/combat/dismemberment/dismemberments.json') as f:
    dismemberments = json.load(f)['dismemberments']

# Analysis 1: Check for complications/dismemberments with no creature type filtering
print("\n" + "=" * 70)
print("ANALYSIS 1: Generic vs Specific Filtering")
print("=" * 70)

generic_complications = []
specific_complications = []

for comp in complications:
    contexts = comp.get('applicableContexts', {})
    creature_types = contexts.get('creatureTypes', [])
    
    if not creature_types or 'any' in creature_types:
        generic_complications.append(comp['id'])
    else:
        specific_complications.append(comp['id'])

generic_dismemberments = []
specific_dismemberments = []

for dism in dismemberments:
    contexts = dism.get('applicableContexts', {})
    creature_types = contexts.get('creatureTypes', [])
    
    if not creature_types or 'any' in creature_types:
        generic_dismemberments.append(dism['id'])
    else:
        specific_dismemberments.append(dism['id'])

print(f"\nComplications:")
print(f"  Generic (no creature type filter): {len(generic_complications)}")
print(f"  Specific (has creature type filter): {len(specific_complications)}")

print(f"\nDismemberments:")
print(f"  Generic (no creature type filter): {len(generic_dismemberments)}")
print(f"  Specific (has creature type filter): {len(specific_dismemberments)}")

if len(generic_dismemberments) < 5:
    print(f"\n⚠️  WARNING: Only {len(generic_dismemberments)} generic dismemberments!")
    print("   This means humanoids without specific types may have limited options.")

# Analysis 2: Check for empty arrays
print("\n" + "=" * 70)
print("ANALYSIS 2: Empty or Missing Context Arrays")
print("=" * 70)

issues_found = []

for comp in complications:
    contexts = comp.get('applicableContexts', {})
    
    # Check for empty damage types
    damage_types = contexts.get('damageTypes', [])
    if damage_types is not None and len(damage_types) == 0:
        issues_found.append(f"Complication '{comp['id']}' has empty damageTypes array")
    
    # Check for empty creature types
    creature_types = contexts.get('creatureTypes', [])
    if creature_types is not None and len(creature_types) == 0:
        issues_found.append(f"Complication '{comp['id']}' has empty creatureTypes array")

for dism in dismemberments:
    contexts = dism.get('applicableContexts', {})
    
    # Check for empty damage types
    damage_types = contexts.get('damageTypes', [])
    if damage_types is not None and len(damage_types) == 0:
        issues_found.append(f"Dismemberment '{dism['id']}' has empty damageTypes array")
    
    # Check for empty creature types  
    creature_types = contexts.get('creatureTypes', [])
    if creature_types is not None and len(creature_types) == 0:
        issues_found.append(f"Dismemberment '{dism['id']}' has empty creatureTypes array")

if issues_found:
    print(f"❌ Found {len(issues_found)} issues:")
    for issue in issues_found:
        print(f"   - {issue}")
else:
    print("✅ No empty arrays found")

# Analysis 3: Check for damage type consistency
print("\n" + "=" * 70)
print("ANALYSIS 3: Damage Type Validation")
print("=" * 70)

VALID_DAMAGE_TYPES = {
    'slashing', 'piercing', 'bludgeoning',
    'fire', 'cold', 'electricity', 'acid', 'sonic',
    'positive', 'negative', 'force', 'mental',
    'poison', 'bleed', 'cold-iron', 'silver',
    'any'
}

invalid_damage_types = set()

for comp in complications:
    damage_types = comp.get('applicableContexts', {}).get('damageTypes', [])
    for dt in damage_types:
        if dt and dt not in VALID_DAMAGE_TYPES:
            invalid_damage_types.add(dt)

for dism in dismemberments:
    damage_types = dism.get('applicableContexts', {}).get('damageTypes', [])
    for dt in damage_types:
        if dt and dt not in VALID_DAMAGE_TYPES:
            invalid_damage_types.add(dt)

if invalid_damage_types:
    print(f"⚠️  Found {len(invalid_damage_types)} non-standard damage types:")
    for dt in sorted(invalid_damage_types):
        print(f"   - '{dt}'")
else:
    print("✅ All damage types are valid")

# Analysis 4: Check for consistent severity in dismemberments
print("\n" + "=" * 70)
print("ANALYSIS 4: Dismemberment Severity Distribution")
print("=" * 70)

severity_counts = defaultdict(int)
for dism in dismemberments:
    severity = dism.get('severity', 'unknown')
    severity_counts[severity] += 1

print("\nSeverity distribution:")
for severity in ['moderate', 'severe', 'critical', 'catastrophic']:
    count = severity_counts[severity]
    print(f"  {severity:15} : {count:3} ({count/len(dismemberments)*100:.1f}%)")

if severity_counts['unknown'] > 0:
    print(f"\n⚠️  {severity_counts['unknown']} dismemberments missing severity!")

# Analysis 5: Check for weight consistency
print("\n" + "=" * 70)
print("ANALYSIS 5: Weight Distribution in Complications")
print("=" * 70)

weights = [comp.get('weight', 0) for comp in complications]
avg_weight = sum(weights) / len(weights) if weights else 0
min_weight = min(weights) if weights else 0
max_weight = max(weights) if weights else 0

print(f"\nWeight statistics:")
print(f"  Average: {avg_weight:.1f}")
print(f"  Min: {min_weight}")
print(f"  Max: {max_weight}")

missing_weight = [comp['id'] for comp in complications if 'weight' not in comp]
if missing_weight:
    print(f"\n⚠️  {len(missing_weight)} complications missing weight property:")
    for comp_id in missing_weight[:5]:
        print(f"   - {comp_id}")
    if len(missing_weight) > 5:
        print(f"   ... and {len(missing_weight) - 5} more")

# Analysis 6: Check for humanoid-only injuries on non-humanoid creature types
print("\n" + "=" * 70)
print("ANALYSIS 6: Anatomical Consistency")
print("=" * 70)

# Body parts that only make sense for humanoids
humanoid_only_parts = ['hand', 'finger', 'foot', 'ear']
non_humanoid_types = ['plant', 'construct', 'elemental-general', 'amorphous', 
                      'dragon', 'aberration-general', 'quadruped']

anatomy_issues = []

for dism in dismemberments:
    location = dism.get('location', '').lower()
    creature_types = dism.get('applicableContexts', {}).get('creatureTypes', [])
    
    # Check if a humanoid-only part is assigned to non-humanoid creatures
    for part in humanoid_only_parts:
        if part in location:
            for ctype in creature_types:
                if ctype in non_humanoid_types:
                    anatomy_issues.append(
                        f"{dism['id']}: '{location}' location for '{ctype}' creature"
                    )

if anatomy_issues:
    print(f"⚠️  Found {len(anatomy_issues)} potential anatomical mismatches:")
    for issue in anatomy_issues[:10]:
        print(f"   - {issue}")
    if len(anatomy_issues) > 10:
        print(f"   ... and {len(anatomy_issues) - 10} more")
else:
    print("✅ No obvious anatomical mismatches found")

# Final summary
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

total_issues = len(issues_found) + len(invalid_damage_types) + len(missing_weight) + len(anatomy_issues)

if total_issues == 0:
    print("\n✅ Deep analysis complete - no critical issues found!")
else:
    print(f"\n⚠️  Found {total_issues} potential issues to review")

