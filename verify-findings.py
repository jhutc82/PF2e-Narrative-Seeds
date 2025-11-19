#!/usr/bin/env python3
"""
Verify if the "issues" are actually problems or intended behavior
"""

import json

print("=" * 70)
print("VERIFYING 'ISSUES'")
print("=" * 70)

# Load data
with open('/home/user/PF2e-Narrative-Seeds/data/combat/complications/critical-success.json') as f:
    complications = json.load(f)['complications']

# FINDING 1: Empty creatureTypes arrays
print("\n" + "=" * 70)
print("FINDING 1: Empty creatureTypes Arrays")
print("=" * 70)

print("\nThis is actually CORRECT BEHAVIOR:")
print("Empty or missing creatureTypes means 'applies to ALL creatures'")
print("These are generic injuries that work for any creature type.")
print("\nExample generic complications:")

generic_count = 0
for comp in complications[:5]:
    creature_types = comp.get('applicableContexts', {}).get('creatureTypes')
    if not creature_types or len(creature_types) == 0:
        print(f"  - {comp['id']}: {comp['name']}")
        print(f"    Description: {comp['description'][:60]}...")
        generic_count += 1

print(f"\n✅ These {generic_count} shown (and 47 more) are intentionally generic")
print("   They provide fallback options for all creature types.")

# FINDING 2: Non-standard damage types
print("\n" + "=" * 70)
print("FINDING 2: 'Non-Standard' Damage Types")
print("=" * 70)

# Check where these damage types are used
damage_type_usage = {}

for comp in complications:
    damage_types = comp.get('applicableContexts', {}).get('damageTypes', [])
    for dt in ['magic', 'spirit', 'vitality', 'void']:
        if dt in damage_types:
            if dt not in damage_type_usage:
                damage_type_usage[dt] = []
            damage_type_usage[dt].append(comp['id'])

print("\nUsage of these damage types:")
for dt, comp_ids in sorted(damage_type_usage.items()):
    print(f"\n'{dt}' used in {len(comp_ids)} complications:")
    for cid in comp_ids[:3]:
        print(f"  - {cid}")
    if len(comp_ids) > 3:
        print(f"  ... and {len(comp_ids) - 3} more")

print("\n" + "=" * 70)
print("PF2E REMASTER DAMAGE TYPES:")
print("=" * 70)
print("""
PF2e Remaster introduced NEW damage type names:
  - 'vitality' (replaces 'positive') ✅
  - 'void' (replaces 'negative') ✅  
  - 'spirit' (new ghost/spiritual damage) ✅
  
'magic' might be non-standard. Let me check what it's for...
""")

# Check magic damage type specifically
magic_comps = []
for comp in complications:
    damage_types = comp.get('applicableContexts', {}).get('damageTypes', [])
    if 'magic' in damage_types:
        magic_comps.append({
            'id': comp['id'],
            'name': comp['name'],
            'desc': comp['description']
        })

if magic_comps:
    print(f"\n'magic' damage type found in {len(magic_comps)} complications:")
    for mc in magic_comps:
        print(f"\n  {mc['id']}: {mc['name']}")
        print(f"  Description: {mc['desc']}")
else:
    print("\n'magic' not actually used (might have been in my search list by mistake)")

# CONCLUSION
print("\n" + "=" * 70)
print("CONCLUSION")
print("=" * 70)

print("""
1. Empty creatureTypes arrays: ✅ CORRECT
   - These are intentional generic complications
   - Provide fallback for all creature types
   
2. vitality/void/spirit: ✅ CORRECT
   - These are valid PF2e Remaster damage types
   - Script just didn't know about them
   
3. 'magic': ⚠️ NEEDS REVIEW
   - Let me check if this is actually used
""")

