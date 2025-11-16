#!/usr/bin/env node

/**
 * Phrase Reduction Script
 *
 * Reduces phrase sets based on quality analysis while maintaining variety.
 * Implements the strategy from PHRASE_REDUCTION_ANALYSIS.md:
 * - Keep top 15-20 phrases per outcome
 * - Remove structural clones
 * - Remove quality-word filler
 * - Remove verbose/awkward phrases
 */

import fs from 'fs';
import path from 'path';
import { PhraseAnalyzer } from './analyze-redundancy.js';

class PhraseReducer {
  constructor(options = {}) {
    this.targetCount = options.targetCount || 20;
    this.dryRun = options.dryRun !== false;
    this.backupDir = options.backupDir || '_legacy';
    this.analyzer = new PhraseAnalyzer();
  }

  /**
   * Score and rank phrases for reduction
   */
  scorePhrases(phrases) {
    const scored = phrases.map(phrase => {
      let score = 100;
      const issues = [];

      // Deduct for problematic patterns
      if (/from \$\{attackerName\}!?$/.test(phrase)) {
        score -= 25;
        issues.push('structural_clone');
      }

      if (/\b(acceptable|adequate|workmanlike|properly|reasonable|reasonably)\b/i.test(phrase)) {
        score -= 30;
        issues.push('quality_words');
      }

      if (/\b(is|are|was|were|been|being)\s+\w+ed\b/.test(phrase)) {
        score -= 20;
        issues.push('passive_voice');
      }

      if (/functions?\s+properly|mechanics?\s+function/i.test(phrase)) {
        score -= 30;
        issues.push('technical_awkward');
      }

      // Length penalties
      if (phrase.length > 100) {
        score -= 20;
        issues.push('too_verbose');
      } else if (phrase.length < 60) {
        score += 10; // Bonus for conciseness
      }

      // Bonus for strong action verbs
      if (/\b(flash|gleam|slash|thrust|strike|cut|swing|arc|seek|commit|execute|channel|deliver)\w*\b/i.test(phrase)) {
        score += 15;
      }

      // Bonus for vivid imagery
      if (/\b(whisper|sing|hum|crystallize|blur|explode|erupt)\w*\b/i.test(phrase)) {
        score += 10;
      }

      // Bonus for specific details
      if (/\b(fuller|pommel|cross-guard|edge|point|blade|steel)\b/i.test(phrase)) {
        score += 5;
      }

      return {
        phrase,
        score,
        issues,
        length: phrase.length
      };
    });

    // Sort by score (highest first)
    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Select top phrases ensuring structural diversity
   */
  selectTopPhrases(scoredPhrases, targetCount) {
    const selected = [];
    const structures = new Set();

    // Extract structural signature
    const getStructure = (phrase) => {
      return phrase
        .replace(/\$\{attackerName\}/g, 'A')
        .replace(/\$\{targetName\}/g, 'T')
        .replace(/\$\{weapon\}/g, 'W')
        .replace(/\b(steel|blade|sword|metal)\b/gi, 'X')
        .replace(/\b(flash|gleam|slash|thrust|strike|cut|swing)\w*/gi, 'V');
    };

    // First pass: select highest scoring unique structures
    for (const item of scoredPhrases) {
      const structure = getStructure(item.phrase);

      if (!structures.has(structure) || selected.length < targetCount / 2) {
        selected.push(item);
        structures.add(structure);

        if (selected.length >= targetCount) {
          break;
        }
      }
    }

    // Second pass: fill remaining slots with next highest scores
    if (selected.length < targetCount) {
      for (const item of scoredPhrases) {
        if (!selected.includes(item)) {
          selected.push(item);
          if (selected.length >= targetCount) {
            break;
          }
        }
      }
    }

    return selected;
  }

  /**
   * Reduce phrases in a specific section
   */
  reduceSection(phrases, sectionName) {
    const originalCount = phrases.length;

    if (originalCount <= this.targetCount) {
      console.log(`  ✓ ${sectionName}: Already at or below target (${originalCount} phrases)`);
      return phrases;
    }

    // Score all phrases
    const scored = this.scorePhrases(phrases);

    // Select top phrases
    const selected = this.selectTopPhrases(scored, this.targetCount);

    // Calculate reduction
    const newCount = selected.length;
    const removed = originalCount - newCount;
    const reductionPercent = ((removed / originalCount) * 100).toFixed(1);

    console.log(`  📉 ${sectionName}: ${originalCount} → ${newCount} (${reductionPercent}% reduction)`);

    // Show quality stats
    const avgScoreBefore = (scored.reduce((sum, item) => sum + item.score, 0) / scored.length).toFixed(1);
    const avgScoreAfter = (selected.reduce((sum, item) => sum + item.score, 0) / selected.length).toFixed(1);
    console.log(`     Quality: ${avgScoreBefore} → ${avgScoreAfter} avg score`);

    // Show what was removed
    const removed_items = scored.slice(newCount);
    const issueCount = {};
    removed_items.forEach(item => {
      item.issues.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    });

    if (Object.keys(issueCount).length > 0) {
      console.log(`     Removed:`);
      for (const [issue, count] of Object.entries(issueCount).sort((a, b) => b[1] - a[1])) {
        console.log(`       - ${count}x ${issue}`);
      }
    }

    return selected.map(item => item.phrase);
  }

  /**
   * Reduce an entire file
   */
  reduceFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const relativePath = path.relative(process.cwd(), filePath);

      console.log(`\n📁 ${relativePath}`);
      console.log('═'.repeat(60));

      // Create backup
      if (!this.dryRun) {
        this.createBackup(filePath);
      }

      let totalBefore = 0;
      let totalAfter = 0;

      // Process each detail level
      for (const [detailLevel, outcomes] of Object.entries(data)) {
        if (typeof outcomes !== 'object') continue;

        console.log(`\n  📊 ${detailLevel}:`);

        for (const [outcome, phrases] of Object.entries(outcomes)) {
          if (!Array.isArray(phrases)) continue;

          totalBefore += phrases.length;
          const reduced = this.reduceSection(phrases, outcome);
          totalAfter += reduced.length;

          // Update data
          data[detailLevel][outcome] = reduced;
        }
      }

      // Summary
      const totalReduction = ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1);
      console.log(`\n  ✨ Total: ${totalBefore} → ${totalAfter} (${totalReduction}% reduction)`);

      // Write reduced file
      if (!this.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
        console.log(`  ✅ File updated`);
      } else {
        console.log(`  ℹ️  DRY RUN - no changes made`);
      }

      return {
        file: relativePath,
        totalBefore,
        totalAfter,
        reduction: totalReduction
      };
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Create backup of original file
   */
  createBackup(filePath) {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath);
    const backupPath = path.join(dir, this.backupDir, filename);

    // Create backup directory if it doesn't exist
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copy file to backup
    fs.copyFileSync(filePath, backupPath);
    console.log(`  💾 Backup created: ${path.relative(process.cwd(), backupPath)}`);
  }

  /**
   * Generate summary report
   */
  generateSummary(results) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                  REDUCTION SUMMARY                            ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    const totalBefore = results.reduce((sum, r) => sum + (r?.totalBefore || 0), 0);
    const totalAfter = results.reduce((sum, r) => sum + (r?.totalAfter || 0), 0);
    const overallReduction = ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1);

    console.log(`📊 Overall Statistics:`);
    console.log(`   Total phrases before: ${totalBefore}`);
    console.log(`   Total phrases after:  ${totalAfter}`);
    console.log(`   Total removed:        ${totalBefore - totalAfter}`);
    console.log(`   Overall reduction:    ${overallReduction}%\n`);

    console.log(`📁 Files processed: ${results.filter(r => r !== null).length}`);

    if (this.dryRun) {
      console.log(`\n⚠️  This was a DRY RUN - no changes were made.`);
      console.log(`   Run with --commit to apply changes.\n`);
    } else {
      console.log(`\n✅ Changes applied successfully!`);
      console.log(`   Backups saved in _legacy/ directories.\n`);
    }
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const options = {
    dryRun: !args.includes('--commit'),
    targetCount: 20
  };

  // Check for target count override
  const targetIndex = args.indexOf('--target');
  if (targetIndex !== -1 && args[targetIndex + 1]) {
    options.targetCount = parseInt(args[targetIndex + 1], 10);
  }

  // Get files to process
  const files = args.filter(arg => !arg.startsWith('--') && arg !== '--all');
  const processAll = args.includes('--all');

  if (files.length === 0 && !processAll) {
    console.log('Usage: node reduce-phrases.js [options] <file-paths...>');
    console.log('   or: node reduce-phrases.js --all [options]');
    console.log('\nOptions:');
    console.log('  --commit          Actually apply changes (default is dry-run)');
    console.log('  --target N        Target phrase count per section (default: 20)');
    console.log('  --all             Process all melee weapon files');
    console.log('\nExamples:');
    console.log('  node reduce-phrases.js data/combat/openings/melee/sword.json');
    console.log('  node reduce-phrases.js --commit data/combat/openings/melee/sword.json');
    console.log('  node reduce-phrases.js --target 15 --all');
    console.log('  node reduce-phrases.js --commit --all');
    process.exit(1);
  }

  const reducer = new PhraseReducer(options);

  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║              PHRASE REDUCTION TOOL                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`\nTarget phrase count: ${options.targetCount} per section`);
  console.log(`Mode: ${options.dryRun ? 'DRY RUN (preview only)' : 'COMMIT (will modify files)'}\n`);

  let filesToProcess = [];

  if (processAll) {
    // Process all melee weapon files
    const meleeDir = path.join(process.cwd(), 'data/combat/openings/melee');
    filesToProcess = fs.readdirSync(meleeDir)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(meleeDir, f));
  } else {
    filesToProcess = files.map(f => path.resolve(f));
  }

  // Process files
  const results = filesToProcess.map(file => reducer.reduceFile(file));

  // Generate summary
  reducer.generateSummary(results);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PhraseReducer };
