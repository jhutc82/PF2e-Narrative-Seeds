#!/usr/bin/env python3
"""
Fix creature type names to match anatomy-types.js definitions
"""

import json
import sys

# Mapping of our old names to correct anatomy keys
CREATURE_TYPE_MAPPING = {
    "aberration": "aberration-general",
    "beast": "quadruped",  # Most beasts are quadrupeds
    "elemental": "elemental-general",
    "fey": "fey-general",
    "ooze": "amorphous",
    # skeleton and zombie stay as-is (they're modifiers, but we'll handle that separately)
    # construct, dragon, plant are already correct
}

def fix_creature_types_in_list(creature_list):
    """Update creature type names in a list"""
    if not creature_list:
        return creature_list

    fixed_list = []
    for creature_type in creature_list:
        if creature_type in CREATURE_TYPE_MAPPING:
            fixed_list.append(CREATURE_TYPE_MAPPING[creature_type])
            print(f"  Mapped '{creature_type}' → '{CREATURE_TYPE_MAPPING[creature_type]}'")
        else:
            fixed_list.append(creature_type)

    return fixed_list

def fix_complications_file(filepath):
    """Fix creature types in complications file"""
    print(f"\n=== Fixing {filepath} ===")

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changes_made = 0
    for complication in data.get('complications', []):
        if 'applicableContexts' in complication and 'creatureTypes' in complication['applicableContexts']:
            old_types = complication['applicableContexts']['creatureTypes'].copy()
            new_types = fix_creature_types_in_list(old_types)

            if old_types != new_types:
                print(f"\n{complication['id']}:")
                complication['applicableContexts']['creatureTypes'] = new_types
                changes_made += 1

    if changes_made > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"\n✓ Updated {changes_made} complications")
    else:
        print("✓ No changes needed")

    return changes_made

def fix_dismemberments_file(filepath):
    """Fix creature types in dismemberments file"""
    print(f"\n=== Fixing {filepath} ===")

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changes_made = 0
    for dismemberment in data.get('dismemberments', []):
        if 'applicableContexts' in dismemberment and 'creatureTypes' in dismemberment['applicableContexts']:
            old_types = dismemberment['applicableContexts']['creatureTypes'].copy()
            new_types = fix_creature_types_in_list(old_types)

            if old_types != new_types:
                print(f"\n{dismemberment['id']}:")
                dismemberment['applicableContexts']['creatureTypes'] = new_types
                changes_made += 1

    if changes_made > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"\n✓ Updated {changes_made} dismemberments")
    else:
        print("✓ No changes needed")

    return changes_made

def main():
    complications_file = '/home/user/PF2e-Narrative-Seeds/data/combat/complications/critical-success.json'
    dismemberments_file = '/home/user/PF2e-Narrative-Seeds/data/combat/dismemberment/dismemberments.json'

    total_changes = 0
    total_changes += fix_complications_file(complications_file)
    total_changes += fix_dismemberments_file(dismemberments_file)

    print(f"\n{'='*60}")
    print(f"TOTAL CHANGES: {total_changes}")
    print(f"{'='*60}")

    return 0 if total_changes >= 0 else 1

if __name__ == '__main__':
    sys.exit(main())
