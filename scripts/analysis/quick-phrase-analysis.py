#!/usr/bin/env python3
"""
PF2e Narrative Seeds - Quick Phrase Analysis
Fast analysis focusing on exact duplicates and statistics
"""

import json
import os
from pathlib import Path
from collections import defaultdict, Counter

class QuickPhraseAnalyzer:
    def __init__(self, data_dir):
        self.data_dir = Path(data_dir)
        self.all_phrases = []
        self.phrase_locations = defaultdict(list)

    def load_all_files(self):
        """Load all JSON data files"""
        print("Loading all data files...")

        # Damage files
        damage_dir = self.data_dir / 'combat' / 'damage'
        for file_path in damage_dir.glob('*.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                file_name = file_path.name

                if 'verbs' in data:
                    for outcome, verbs in data['verbs'].items():
                        for verb in verbs:
                            self.all_phrases.append(verb)
                            self.phrase_locations[verb].append(f"{file_name}:verbs:{outcome}")

                if 'effects' in data:
                    for outcome, effects in data['effects'].items():
                        for effect in effects:
                            self.all_phrases.append(effect)
                            self.phrase_locations[effect].append(f"{file_name}:effects:{outcome}")

        # Location files
        location_dir = self.data_dir / 'combat' / 'locations'
        for file_path in location_dir.glob('*.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                file_name = file_path.name

                for outcome, locations in data.items():
                    for location in locations:
                        self.all_phrases.append(location)
                        self.phrase_locations[location].append(f"{file_name}:{outcome}")

        print(f"Loaded {len(self.all_phrases)} total phrase instances")
        print(f"Found {len(set(self.all_phrases))} unique phrases")

    def analyze_duplicates(self):
        """Analyze exact duplicates"""
        print("\n=== EXACT DUPLICATE ANALYSIS ===\n")

        # Count occurrences
        phrase_counts = Counter(self.all_phrases)
        duplicates = {phrase: count for phrase, count in phrase_counts.items() if count > 1}

        print(f"Total duplicated phrases: {len(duplicates)}")
        print(f"Total duplicate instances: {sum(duplicates.values()) - len(duplicates)}")

        # Show top duplicates
        print("\n## Top 20 Most Duplicated Phrases:\n")
        for phrase, count in sorted(duplicates.items(), key=lambda x: x[1], reverse=True)[:20]:
            print(f"{count}x: \"{phrase}\"")
            locations = self.phrase_locations[phrase]
            files = set(loc.split(':')[0] for loc in locations)
            print(f"    Files: {', '.join(sorted(files))}")
            print()

        return duplicates

    def analyze_by_category(self):
        """Analyze phrase counts by category"""
        print("\n=== CATEGORY ANALYSIS ===\n")

        categories = defaultdict(int)
        for phrase, locations in self.phrase_locations.items():
            for loc in locations:
                parts = loc.split(':')
                if len(parts) >= 2:
                    category = parts[1] if 'verbs' in loc or 'effects' in loc else 'locations'
                    categories[category] += 1

        print("Phrase counts by category:")
        for category in sorted(categories.keys()):
            print(f"  {category}: {categories[category]}")

    def calculate_reduction_potential(self, duplicates):
        """Calculate how much could be reduced"""
        print("\n=== REDUCTION POTENTIAL ===\n")

        # Calculate savings from removing duplicates
        duplicate_instances = sum(duplicates.values()) - len(duplicates)
        total_phrases = len(self.all_phrases)
        unique_phrases = len(set(self.all_phrases))

        reduction_pct = (duplicate_instances / total_phrases) * 100

        print(f"Total phrase instances: {total_phrases}")
        print(f"Unique phrases: {unique_phrases}")
        print(f"Duplicate instances (can be removed): {duplicate_instances}")
        print(f"Potential reduction from exact duplicates: {reduction_pct:.1f}%")

        # If we consolidate duplicates into shared files
        print(f"\nIf duplicates consolidated into shared files:")
        print(f"  Current: {total_phrases} phrase instances")
        print(f"  After cleanup: {unique_phrases} phrase instances")
        print(f"  Reduction: {total_phrases - unique_phrases} instances ({(1 - unique_phrases/total_phrases)*100:.1f}%)")

    def find_cross_file_duplicates(self):
        """Find phrases that appear in multiple files"""
        print("\n=== CROSS-FILE DUPLICATES ===\n")

        cross_file = []
        for phrase, locations in self.phrase_locations.items():
            files = set(loc.split(':')[0] for loc in locations)
            if len(files) > 1:
                cross_file.append((phrase, files, len(locations)))

        print(f"Phrases appearing in multiple files: {len(cross_file)}")

        # Show examples
        print("\n## Top 10 Cross-File Duplicates:\n")
        for phrase, files, count in sorted(cross_file, key=lambda x: len(x[1]), reverse=True)[:10]:
            print(f"\"{phrase}\"")
            print(f"  Appears in {len(files)} files: {', '.join(sorted(files))}")
            print(f"  Total occurrences: {count}")
            print()

    def run_analysis(self):
        """Run full analysis"""
        self.load_all_files()
        duplicates = self.analyze_duplicates()
        self.analyze_by_category()
        self.calculate_reduction_potential(duplicates)
        self.find_cross_file_duplicates()

if __name__ == '__main__':
    data_dir = Path(__file__).parent.parent.parent / 'data'
    analyzer = QuickPhraseAnalyzer(data_dir)
    analyzer.run_analysis()
