#!/usr/bin/env python3
import json

with open('/home/user/PF2e-Narrative-Seeds/data/combat/effects/anatomy-overrides.json', 'r') as f:
    data = json.load(f)

# Show the invalid keys and their descriptions
invalid_keys = ['aberration', 'beast', 'fey', 'ooze']

for key in invalid_keys:
    if key in data:
        print(f"\n{'='*60}")
        print(f"KEY: '{key}'")
        print(f"{'='*60}")
        
        if 'criticalSuccess' in data[key]:
            print(f"\nCritical Success descriptions ({len(data[key]['criticalSuccess'])}):")
            for i, desc in enumerate(data[key]['criticalSuccess'][:3], 1):
                print(f"  {i}. {desc}")
            if len(data[key]['criticalSuccess']) > 3:
                print(f"  ... and {len(data[key]['criticalSuccess']) - 3} more")
        
        if 'success' in data[key]:
            print(f"\nSuccess descriptions ({len(data[key]['success'])}):")
            for i, desc in enumerate(data[key]['success'][:3], 1):
                print(f"  {i}. {desc}")
            if len(data[key]['success']) > 3:
                print(f"  ... and {len(data[key]['success']) - 3} more")

print("\n" + "="*60)
print("ANALYSIS:")
print("="*60)
print("""
These keys need to be updated to match anatomy system:

1. 'aberration' → Should be 'aberration-general'
   (Generic aberration descriptions - applies to all aberrations)

2. 'beast' → Should be 'quadruped' 
   (These descriptions are for furry 4-legged animals)
   Note: Could also add 'avian', 'serpent', etc. later if needed

3. 'fey' → Should be 'fey-general'
   (Generic fey descriptions - applies to all fey)

4. 'ooze' → Should be 'amorphous'
   (Ooze/slime descriptions)
""")
