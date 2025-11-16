#!/usr/bin/env python3
"""
PF2e Narrative Seeds - Phrase Reduction Analysis
Identifies duplicate and near-duplicate phrases for cleanup
Uses fuzzy matching to find similar phrases that can be consolidated
"""

import json
import os
from pathlib import Path
from difflib import SequenceMatcher
from collections import defaultdict
import re

class PhraseAnalyzer:
    def __init__(self, data_dir):
        self.data_dir = Path(data_dir)
        self.all_phrases = []
        self.phrase_locations = defaultdict(list)
        self.duplicates = []
        self.near_duplicates = []

    def normalize_phrase(self, phrase):
        """Normalize phrase for comparison"""
        # Remove extra whitespace
        normalized = re.sub(r'\s+', ' ', phrase).strip()
        # Lowercase for comparison
        return normalized.lower()

    def similarity_ratio(self, str1, str2):
        """Calculate similarity ratio between two strings"""
        return SequenceMatcher(None, str1, str2).ratio()

    def load_damage_files(self):
        """Load all damage type files"""
        damage_dir = self.data_dir / 'combat' / 'damage'
        if not damage_dir.exists():
            print(f"Warning: {damage_dir} does not exist")
            return

        for file_path in damage_dir.glob('*.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                file_name = file_path.name

                # Process verbs
                if 'verbs' in data:
                    for outcome, verbs in data['verbs'].items():
                        for verb in verbs:
                            self.all_phrases.append(verb)
                            self.phrase_locations[verb].append({
                                'file': file_name,
                                'type': 'verb',
                                'outcome': outcome
                            })

                # Process effects
                if 'effects' in data:
                    for outcome, effects in data['effects'].items():
                        for effect in effects:
                            self.all_phrases.append(effect)
                            self.phrase_locations[effect].append({
                                'file': file_name,
                                'type': 'effect',
                                'outcome': outcome
                            })

    def load_location_files(self):
        """Load all location files"""
        location_dir = self.data_dir / 'combat' / 'locations'
        if not location_dir.exists():
            print(f"Warning: {location_dir} does not exist")
            return

        for file_path in location_dir.glob('*.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                file_name = file_path.name

                for outcome, locations in data.items():
                    for location in locations:
                        self.all_phrases.append(location)
                        self.phrase_locations[location].append({
                            'file': file_name,
                            'type': 'location',
                            'outcome': outcome
                        })

    def load_opening_files(self):
        """Load all opening sentence files"""
        opening_dirs = [
            self.data_dir / 'combat' / 'openings',
            self.data_dir / 'combat' / 'openings' / 'ranged',
            self.data_dir / 'combat' / 'openings' / 'melee',
            self.data_dir / 'combat' / 'openings' / 'defense'
        ]

        for opening_dir in opening_dirs:
            if not opening_dir.exists():
                continue

            for file_path in opening_dir.glob('*.json'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    file_name = f"{opening_dir.name}/{file_path.name}"

                    for outcome, openings in data.items():
                        if isinstance(openings, list):
                            for opening in openings:
                                self.all_phrases.append(opening)
                                self.phrase_locations[opening].append({
                                    'file': file_name,
                                    'type': 'opening',
                                    'outcome': outcome
                                })

    def find_exact_duplicates(self):
        """Find phrases that appear in multiple files"""
        for phrase, locations in self.phrase_locations.items():
            if len(locations) > 1:
                # Check if it's in multiple files (not just multiple outcomes in same file)
                files = set(loc['file'] for loc in locations)
                if len(files) > 1:
                    self.duplicates.append({
                        'phrase': phrase,
                        'count': len(locations),
                        'locations': locations,
                        'files': list(files)
                    })

    def find_near_duplicates(self, threshold=0.85):
        """Find phrases that are very similar (fuzzy matching)"""
        unique_phrases = list(set(self.all_phrases))
        print(f"  Comparing {len(unique_phrases)} unique phrases...")

        # Group phrases by length category to reduce comparisons
        length_buckets = defaultdict(list)
        for phrase in unique_phrases:
            length_bucket = len(phrase) // 10  # Bucket by 10-char intervals
            length_buckets[length_bucket].append(phrase)

        total_comparisons = 0
        for i, phrase1 in enumerate(unique_phrases):
            if i % 1000 == 0:
                print(f"  Progress: {i}/{len(unique_phrases)} ({i/len(unique_phrases)*100:.1f}%)")

            norm1 = self.normalize_phrase(phrase1)
            len1 = len(phrase1)
            length_bucket1 = len1 // 10

            # Only compare with phrases of similar length (within ±20 chars)
            for bucket in range(max(0, length_bucket1-2), length_bucket1+3):
                if bucket not in length_buckets:
                    continue

                for phrase2 in length_buckets[bucket]:
                    if phrase1 == phrase2:
                        continue

                    # Skip if length difference > 20%
                    len2 = len(phrase2)
                    if abs(len1 - len2) / max(len1, len2) > 0.2:
                        continue

                    total_comparisons += 1
                    norm2 = self.normalize_phrase(phrase2)

                    if norm1 == norm2:
                        continue  # Exact duplicate (case difference only)

                    similarity = self.similarity_ratio(norm1, norm2)
                    if similarity >= threshold:
                        self.near_duplicates.append({
                            'phrase1': phrase1,
                            'phrase2': phrase2,
                            'similarity': similarity,
                            'locations1': self.phrase_locations[phrase1],
                            'locations2': self.phrase_locations[phrase2]
                        })

        print(f"  Total comparisons made: {total_comparisons:,}")

    def generate_report(self, output_file='phrase-reduction-report.md'):
        """Generate markdown report of findings"""
        report = []
        report.append("# Phrase Reduction Analysis Report\n")
        report.append(f"**Total unique phrases analyzed:** {len(set(self.all_phrases))}\n")
        report.append(f"**Total phrase instances:** {len(self.all_phrases)}\n\n")

        # Exact duplicates
        report.append(f"## Exact Duplicates ({len(self.duplicates)} phrases)\n")
        report.append("Phrases that appear in multiple damage types or files.\n\n")

        if self.duplicates:
            # Sort by count (most duplicated first)
            sorted_dups = sorted(self.duplicates, key=lambda x: x['count'], reverse=True)

            for dup in sorted_dups[:50]:  # Top 50
                report.append(f"### \"{dup['phrase']}\"\n")
                report.append(f"- **Occurrences:** {dup['count']}\n")
                report.append(f"- **Files:** {', '.join(dup['files'])}\n")
                report.append(f"- **Locations:**\n")
                for loc in dup['locations']:
                    report.append(f"  - {loc['file']} ({loc['type']}, {loc['outcome']})\n")
                report.append("\n")

        # Near duplicates
        report.append(f"\n## Near Duplicates ({len(self.near_duplicates)} pairs)\n")
        report.append("Phrases that are very similar (≥85% similarity) and could be consolidated.\n\n")

        if self.near_duplicates:
            # Sort by similarity (most similar first)
            sorted_near = sorted(self.near_duplicates, key=lambda x: x['similarity'], reverse=True)

            for near in sorted_near[:100]:  # Top 100
                report.append(f"### Similarity: {near['similarity']:.1%}\n")
                report.append(f"1. \"{near['phrase1']}\"\n")
                report.append(f"2. \"{near['phrase2']}\"\n")
                report.append("\n")

        # Statistics
        report.append("\n## Statistics\n\n")
        report.append(f"- **Exact duplicates:** {len(self.duplicates)} phrases\n")
        report.append(f"- **Near duplicates:** {len(self.near_duplicates)} pairs\n")

        # Calculate potential reduction
        duplicate_instances = sum(d['count'] - 1 for d in self.duplicates)
        near_duplicate_potential = len(self.near_duplicates)
        total_potential = duplicate_instances + near_duplicate_potential
        reduction_pct = (total_potential / len(self.all_phrases)) * 100 if self.all_phrases else 0

        report.append(f"- **Potential phrase reductions:** {total_potential} instances\n")
        report.append(f"- **Estimated reduction:** {reduction_pct:.1f}%\n")

        # Write report
        with open(output_file, 'w', encoding='utf-8') as f:
            f.writelines(report)

        print(f"Report written to {output_file}")
        print(f"Total unique phrases: {len(set(self.all_phrases))}")
        print(f"Exact duplicates: {len(self.duplicates)}")
        print(f"Near duplicates: {len(self.near_duplicates)}")
        print(f"Potential reduction: {reduction_pct:.1f}%")

    def run_analysis(self):
        """Run full analysis"""
        print("Loading damage files...")
        self.load_damage_files()

        print("Loading location files...")
        self.load_location_files()

        print("Loading opening files...")
        self.load_opening_files()

        print(f"Loaded {len(self.all_phrases)} total phrase instances")
        print(f"Found {len(set(self.all_phrases))} unique phrases")

        print("\nFinding exact duplicates...")
        self.find_exact_duplicates()

        print("Finding near duplicates (this may take a while)...")
        self.find_near_duplicates(threshold=0.85)

        print("\nGenerating report...")
        self.generate_report()

if __name__ == '__main__':
    # Run from project root
    data_dir = Path(__file__).parent.parent.parent / 'data'
    analyzer = PhraseAnalyzer(data_dir)
    analyzer.run_analysis()
