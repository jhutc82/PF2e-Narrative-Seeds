#!/usr/bin/env python3
"""
Fix grammar issues in opening message files.
Capitalize sentences that start with lowercase letters.
"""

import json
import re
from pathlib import Path

def capitalize_sentence_start(text):
    """
    Capitalize the first letter of a sentence if it starts with a lowercase letter.
    Handles template variables like ${attackerName} at the start.
    """
    # Skip if starts with template variable
    if text.startswith('${'):
        return text

    # Skip if starts with uppercase already
    if text and text[0].isupper():
        return text

    # Capitalize first letter
    if text:
        return text[0].upper() + text[1:]

    return text

def fix_grammar_in_file(filepath):
    """Fix grammar issues in a single JSON file."""
    path = Path(filepath)
    if not path.exists():
        print(f"⚠️  Skipping {filepath} (not found)")
        return 0

    print(f"🔧 Processing {filepath}...")

    # Load JSON
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Track changes
    changes = 0

    # Process all strings in the JSON structure
    def process_value(value):
        nonlocal changes
        if isinstance(value, str):
            new_value = capitalize_sentence_start(value)
            if new_value != value:
                changes += 1
                return new_value
            return value
        elif isinstance(value, list):
            return [process_value(item) for item in value]
        elif isinstance(value, dict):
            return {k: process_value(v) for k, v in value.items()}
        return value

    # Apply fixes
    fixed_data = process_value(data)

    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, indent=2, ensure_ascii=False)

    print(f"   ✅ Fixed {changes} grammar issues")
    return changes

def main():
    """Fix all opening files."""
    print("=" * 60)
    print("Fixing Grammar Issues in Opening Files")
    print("=" * 60)
    print()

    total_changes = 0

    # Find all JSON files in combat/openings
    data_dir = Path('data/combat/openings')
    json_files = list(data_dir.rglob('*.json'))

    for filepath in sorted(json_files):
        changes = fix_grammar_in_file(filepath)
        total_changes += changes

    print()
    print("=" * 60)
    print(f"✅ Complete! Fixed {total_changes} total grammar issues")
    print("=" * 60)

if __name__ == '__main__':
    main()
