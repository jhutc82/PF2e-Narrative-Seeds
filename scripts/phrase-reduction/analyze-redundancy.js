#!/usr/bin/env node

/**
 * Phrase Redundancy Analysis Script
 *
 * Analyzes phrase files to identify:
 * - Structural patterns (e.g., "X from ${attackerName}!")
 * - Quality-word phrases (e.g., "acceptable", "adequate")
 * - Duplicate sentence structures
 * - Recommendations for phrases to keep vs. remove
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PhraseAnalyzer {
  constructor() {
    this.patterns = {
      'from_attacker': /from \$\{attackerName\}!?$/,
      'quality_words': /\b(acceptable|adequate|workmanlike|properly|reasonable|reasonably)\b/i,
      'passive_voice': /\b(is|are|was|were|been|being)\s+\w+ed\b/,
      'timing_quality': /timing\s+is\s+\w+/i,
      'delivers_x': /delivers?\s+a\s+\w+/i,
      'with_quality': /with\s+(adequate|acceptable|good|proper|reasonable)\s+/i,
      'functions_properly': /functions?\s+properly/i,
      'shows_quality': /shows?\s+\w+\s+(form|technique|control)/i
    };

    this.results = {
      totalPhrases: 0,
      patternMatches: {},
      recommendations: {
        keep: [],
        remove: [],
        consider: []
      },
      structuralGroups: {}
    };
  }

  /**
   * Analyze a single phrase file
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      const relativePath = path.relative(process.cwd(), filePath);
      const fileResults = {
        path: relativePath,
        totalPhrases: 0,
        patterns: {},
        quality: {
          excellent: [],
          good: [],
          acceptable: [],
          poor: []
        }
      };

      // Analyze each phrase array in the file
      this.analyzePhraseArrays(data, fileResults);

      return fileResults;
    } catch (error) {
      console.error(`Error analyzing ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Recursively analyze phrase arrays in data structure
   */
  analyzePhraseArrays(obj, fileResults, path = '') {
    if (Array.isArray(obj)) {
      // This is a phrase array
      obj.forEach((phrase, index) => {
        if (typeof phrase === 'string') {
          this.analyzePhrase(phrase, fileResults, `${path}[${index}]`);
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      // Recurse into object properties
      for (const [key, value] of Object.entries(obj)) {
        this.analyzePhraseArrays(value, fileResults, path ? `${path}.${key}` : key);
      }
    }
  }

  /**
   * Analyze a single phrase
   */
  analyzePhrase(phrase, fileResults, location) {
    fileResults.totalPhrases++;
    this.results.totalPhrases++;

    let score = 100;
    const issues = [];
    const patterns = [];

    // Check for problematic patterns
    for (const [patternName, regex] of Object.entries(this.patterns)) {
      if (regex.test(phrase)) {
        patterns.push(patternName);
        fileResults.patterns[patternName] = (fileResults.patterns[patternName] || 0) + 1;
        this.results.patternMatches[patternName] = (this.results.patternMatches[patternName] || 0) + 1;

        // Deduct points based on pattern type
        switch (patternName) {
          case 'quality_words':
          case 'passive_voice':
          case 'functions_properly':
            score -= 30;
            issues.push(`Weak quality word or passive voice`);
            break;
          case 'from_attacker':
            score -= 20;
            issues.push(`Structural clone pattern`);
            break;
          default:
            score -= 15;
        }
      }
    }

    // Bonus points for good qualities
    if (phrase.length < 60) {
      score += 10; // Concise
    } else if (phrase.length > 100) {
      score -= 20; // Too verbose
      issues.push(`Too verbose (${phrase.length} chars)`);
    }

    // Check for strong action verbs
    const strongVerbs = /\b(flash|gleam|slash|thrust|strike|cut|swing|arc|seek|commit|execute|channel)\w*\b/i;
    if (strongVerbs.test(phrase)) {
      score += 15;
    }

    // Categorize based on score
    const phraseInfo = {
      phrase,
      location,
      score,
      patterns,
      issues,
      length: phrase.length
    };

    if (score >= 90) {
      fileResults.quality.excellent.push(phraseInfo);
    } else if (score >= 70) {
      fileResults.quality.good.push(phraseInfo);
    } else if (score >= 50) {
      fileResults.quality.acceptable.push(phraseInfo);
    } else {
      fileResults.quality.poor.push(phraseInfo);
    }

    // Extract structural signature (remove variable names)
    const structure = this.extractStructure(phrase);
    if (!this.results.structuralGroups[structure]) {
      this.results.structuralGroups[structure] = [];
    }
    this.results.structuralGroups[structure].push(phrase);
  }

  /**
   * Extract structural signature from phrase
   */
  extractStructure(phrase) {
    return phrase
      .replace(/\$\{attackerName\}/g, 'ATTACKER')
      .replace(/\$\{targetName\}/g, 'TARGET')
      .replace(/\$\{weapon\}/g, 'WEAPON')
      .replace(/\b(steel|blade|sword|axe|hammer|weapon|metal)\b/gi, 'WEAPON_WORD')
      .replace(/\b(flash|gleam|slash|thrust|strike|cut|swing|arc)\w*/gi, 'ACTION')
      .replace(/\b(acceptable|adequate|good|proper|reasonable)\b/gi, 'QUALITY');
  }

  /**
   * Generate report
   */
  generateReport(fileResults) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         PHRASE REDUNDANCY ANALYSIS REPORT                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // File summary
    console.log(`📁 File: ${fileResults.path}`);
    console.log(`📊 Total phrases: ${fileResults.totalPhrases}\n`);

    // Pattern distribution
    console.log('🔍 Pattern Matches:');
    console.log('─────────────────────────────────────────────────────────────');
    for (const [pattern, count] of Object.entries(fileResults.patterns).sort((a, b) => b[1] - a[1])) {
      const percentage = ((count / fileResults.totalPhrases) * 100).toFixed(1);
      console.log(`  ${pattern.padEnd(20)} ${count.toString().padStart(4)} (${percentage}%)`);
    }
    console.log('');

    // Quality distribution
    console.log('⭐ Quality Distribution:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`  ⭐⭐⭐⭐⭐ Excellent   ${fileResults.quality.excellent.length.toString().padStart(4)} (${((fileResults.quality.excellent.length / fileResults.totalPhrases) * 100).toFixed(1)}%)`);
    console.log(`  ⭐⭐⭐⭐ Good       ${fileResults.quality.good.length.toString().padStart(4)} (${((fileResults.quality.good.length / fileResults.totalPhrases) * 100).toFixed(1)}%)`);
    console.log(`  ⭐⭐⭐ Acceptable ${fileResults.quality.acceptable.length.toString().padStart(4)} (${((fileResults.quality.acceptable.length / fileResults.totalPhrases) * 100).toFixed(1)}%)`);
    console.log(`  ⭐⭐ Poor       ${fileResults.quality.poor.length.toString().padStart(4)} (${((fileResults.quality.poor.length / fileResults.totalPhrases) * 100).toFixed(1)}%)`);
    console.log('');

    // Recommendations
    const keepCount = fileResults.quality.excellent.length + fileResults.quality.good.length;
    const removeCount = fileResults.quality.poor.length;
    const considerCount = fileResults.quality.acceptable.length;

    console.log('💡 Recommendations:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`  ✅ KEEP:     ${keepCount} phrases (excellent/good quality)`);
    console.log(`  ❓ CONSIDER: ${considerCount} phrases (review case-by-case)`);
    console.log(`  ❌ REMOVE:   ${removeCount} phrases (poor quality/redundant)`);
    console.log(`  📉 Potential reduction: ${((removeCount / fileResults.totalPhrases) * 100).toFixed(1)}%`);
    console.log('');

    // Show examples of poor quality phrases
    if (fileResults.quality.poor.length > 0) {
      console.log('❌ Examples of phrases to REMOVE (lowest quality):');
      console.log('─────────────────────────────────────────────────────────────');
      const examples = fileResults.quality.poor
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);

      examples.forEach((item, index) => {
        console.log(`\n  ${index + 1}. Score: ${item.score}`);
        console.log(`     "${item.phrase}"`);
        console.log(`     Issues: ${item.issues.join(', ')}`);
        if (item.patterns.length > 0) {
          console.log(`     Patterns: ${item.patterns.join(', ')}`);
        }
      });
      console.log('');
    }

    // Show examples of excellent phrases
    if (fileResults.quality.excellent.length > 0) {
      console.log('✅ Examples of phrases to KEEP (highest quality):');
      console.log('─────────────────────────────────────────────────────────────');
      const examples = fileResults.quality.excellent
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      examples.forEach((item, index) => {
        console.log(`\n  ${index + 1}. Score: ${item.score}`);
        console.log(`     "${item.phrase}"`);
      });
      console.log('');
    }
  }

  /**
   * Generate structural redundancy report
   */
  generateStructuralReport() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         STRUCTURAL REDUNDANCY ANALYSIS                        ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    const duplicateStructures = Object.entries(this.results.structuralGroups)
      .filter(([_, phrases]) => phrases.length > 1)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 20);

    console.log(`Found ${duplicateStructures.length} structural patterns with duplicates\n`);

    duplicateStructures.forEach(([structure, phrases], index) => {
      console.log(`\n${index + 1}. Pattern: "${structure}"`);
      console.log(`   Count: ${phrases.length} phrases`);
      console.log(`   Examples:`);
      phrases.slice(0, 3).forEach(phrase => {
        console.log(`   - "${phrase}"`);
      });
      if (phrases.length > 3) {
        console.log(`   ... and ${phrases.length - 3} more`);
      }
    });
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node analyze-redundancy.js <file-path>');
    console.log('   or: node analyze-redundancy.js --all');
    console.log('\nExamples:');
    console.log('  node analyze-redundancy.js data/combat/openings/sword.json');
    console.log('  node analyze-redundancy.js --all');
    process.exit(1);
  }

  const analyzer = new PhraseAnalyzer();

  if (args[0] === '--all') {
    // Analyze all opening files
    const openingsDir = path.join(process.cwd(), 'data/combat/openings');
    const files = fs.readdirSync(openingsDir).filter(f => f.endsWith('.json'));

    console.log(`\nAnalyzing ${files.length} opening files...\n`);

    files.forEach(file => {
      const filePath = path.join(openingsDir, file);
      const results = analyzer.analyzeFile(filePath);
      if (results) {
        analyzer.generateReport(results);
      }
    });

    analyzer.generateStructuralReport();
  } else {
    // Analyze single file
    const filePath = path.resolve(args[0]);
    const results = analyzer.analyzeFile(filePath);
    if (results) {
      analyzer.generateReport(results);
    }
  }
}

// Run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PhraseAnalyzer };
