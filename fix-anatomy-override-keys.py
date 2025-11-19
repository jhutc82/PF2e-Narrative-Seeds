#!/usr/bin/env python3
"""
Fix anatomy-overrides.json to use correct anatomy keys
"""

import json

file_path = '/home/user/PF2e-Narrative-Seeds/data/combat/effects/anatomy-overrides.json'

# Load the file
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Key mappings
KEY_MAPPINGS = {
    'aberration': 'aberration-general',
    'beast': 'quadruped',
    'fey': 'fey-general',
    'ooze': 'amorphous'
}

print("=" * 60)
print("FIXING ANATOMY-OVERRIDES.JSON")
print("=" * 60)

# Create new data dict with corrected keys
new_data = {}
changes_made = []

for old_key, value in data.items():
    if old_key in KEY_MAPPINGS:
        new_key = KEY_MAPPINGS[old_key]
        new_data[new_key] = value
        changes_made.append(f"'{old_key}' → '{new_key}'")
        print(f"✓ Renamed '{old_key}' to '{new_key}'")
    else:
        new_data[old_key] = value
        print(f"  Kept '{old_key}' (already correct)")

# Sort keys for consistency
sorted_data = dict(sorted(new_data.items()))

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(sorted_data, f, indent=2, ensure_ascii=False)

print("\n" + "=" * 60)
print(f"COMPLETE: Made {len(changes_made)} changes")
print("=" * 60)
for change in changes_made:
    print(f"  {change}")

