#!/usr/bin/env node

/**
 * Damage Phrase Reduction Script
 *
 * Reduces damage verb/effect phrases based on quality analysis.
 * Target: 10-12 verbs per outcome (down from ~95)
 */

import fs from 'fs';
import path from 'path';

class DamageReducer {
  constructor(options = {}) {
    this.targetCount = options.targetCount || 12;
    this.dryRun = options.dryRun !== false;
    this.backupDir = options.backupDir || '_legacy';
  }

  /**
   * Score damage verbs/effects
   */
  scorePhrases(phrases) {
    const scored = phrases.map(phrase => {
      let score = 100;
      const issues = [];

      // Deduct for weak quality words
      if (/\b(acceptable|adequate|workmanlike|properly|reasonable|reasonably)\b/i.test(phrase)) {
        score -= 30;
        issues.push('quality_words');
      }

      // Deduct for passive voice
      if (/\b(is|are|was|were|been|being)\s+\w+ed\b/.test(phrase)) {
        score -= 20;
        issues.push('passive_voice');
      }

      // Bonus for strong action verbs
      if (/\b(cleave|slash|carve|rend|slice|cut|hack|sever|gash|lacerate|shear|bisect|sunder|rip|tear|split)\w*\b/i.test(phrase)) {
        score += 15;
      }

      // Bonus for vivid adverbs
      if (/\b(brutally|savagely|viciously|mercilessly|catastrophically|horrifically|devastatingly|gruesomely)\b/i.test(phrase)) {
        score += 10;
      }

      // Bonus for specific details
      if (/\b(bone|muscle|sinew|flesh|tissue|organ|artery|vein)\b/i.test(phrase)) {
        score += 10;
      }

      // Length check
      if (phrase.length > 80) {
        score -= 15;
        issues.push('too_verbose');
      } else if (phrase.length < 40) {
        score += 5; // Bonus for conciseness
      }

      return {
        phrase,
        score,
        issues,
        length: phrase.length
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Select top phrases ensuring variety
   */
  selectTopPhrases(scoredPhrases, targetCount) {
    const selected = [];
    const usedWords = new Set();

    // Extract key words from phrase
    const getKeyWords = (phrase) => {
      const words = phrase.toLowerCase().match(/\b\w+\b/g) || [];
      return words.filter(w => w.length > 4 && !['through', 'across', 'their', 'that', 'this', 'with'].includes(w));
    };

    // First pass: select diverse phrases
    for (const item of scoredPhrases) {
      const keyWords = getKeyWords(item.phrase);
      const newWords = keyWords.filter(w => !usedWords.has(w));

      // Prioritize phrases with new vocabulary
      if (newWords.length > 0 || selected.length < targetCount / 2) {
        selected.push(item);
        keyWords.forEach(w => usedWords.add(w));

        if (selected.length >= targetCount) {
          break;
        }
      }
    }

    // Second pass: fill remaining slots
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
   * Reduce a damage file
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

      // Process verbs
      if (data.verbs) {
        console.log(`\n  📊 Verbs:`);

        for (const [outcome, phrases] of Object.entries(data.verbs)) {
          if (!Array.isArray(phrases)) continue;

          totalBefore += phrases.length;

          const scored = this.scorePhrases(phrases);
          const selected = this.selectTopPhrases(scored, this.targetCount);

          totalAfter += selected.length;

          const removed = phrases.length - selected.length;
          const reductionPercent = ((removed / phrases.length) * 100).toFixed(1);

          console.log(`  📉 ${outcome}: ${phrases.length} → ${selected.length} (${reductionPercent}% reduction)`);

          const avgScoreBefore = (scored.reduce((sum, item) => sum + item.score, 0) / scored.length).toFixed(1);
          const avgScoreAfter = (selected.reduce((sum, item) => sum + item.score, 0) / selected.length).toFixed(1);
          console.log(`     Quality: ${avgScoreBefore} → ${avgScoreAfter} avg score`);

          data.verbs[outcome] = selected.map(item => item.phrase);
        }
      }

      // Process effects if present
      if (data.effects) {
        console.log(`\n  📊 Effects:`);

        for (const [outcome, phrases] of Object.entries(data.effects)) {
          if (!Array.isArray(phrases)) continue;

          totalBefore += phrases.length;

          const scored = this.scorePhrases(phrases);
          const selected = this.selectTopPhrases(scored, Math.min(this.targetCount, phrases.length));

          totalAfter += selected.length;

          const removed = phrases.length - selected.length;
          const reductionPercent = ((removed / phrases.length) * 100).toFixed(1);

          console.log(`  📉 ${outcome}: ${phrases.length} → ${selected.length} (${reductionPercent}% reduction)`);

          const avgScoreBefore = (scored.reduce((sum, item) => sum + item.score, 0) / scored.length).toFixed(1);
          const avgScoreAfter = (selected.reduce((sum, item) => sum + item.score, 0) / selected.length).toFixed(1);
          console.log(`     Quality: ${avgScoreBefore} → ${avgScoreAfter} avg score`);

          data.effects[outcome] = selected.map(item => item.phrase);
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

    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

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

  const options = {
    dryRun: !args.includes('--commit'),
    targetCount: 12
  };

  const targetIndex = args.indexOf('--target');
  if (targetIndex !== -1 && args[targetIndex + 1]) {
    options.targetCount = parseInt(args[targetIndex + 1], 10);
  }

  const files = args.filter(arg => !arg.startsWith('--') && arg !== '--all');
  const processAll = args.includes('--all');

  if (files.length === 0 && !processAll) {
    console.log('Usage: node reduce-damage.js [options] <file-paths...>');
    console.log('   or: node reduce-damage.js --all [options]');
    console.log('\nOptions:');
    console.log('  --commit          Actually apply changes (default is dry-run)');
    console.log('  --target N        Target phrase count per section (default: 12)');
    console.log('  --all             Process all damage type files');
    console.log('\nExamples:');
    console.log('  node reduce-damage.js data/combat/damage/slashing.json');
    console.log('  node reduce-damage.js --commit --all');
    process.exit(1);
  }

  const reducer = new DamageReducer(options);

  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           DAMAGE PHRASE REDUCTION TOOL                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`\nTarget phrase count: ${options.targetCount} per section`);
  console.log(`Mode: ${options.dryRun ? 'DRY RUN (preview only)' : 'COMMIT (will modify files)'}\n`);

  let filesToProcess = [];

  if (processAll) {
    const damageDir = path.join(process.cwd(), 'data/combat/damage');
    filesToProcess = fs.readdirSync(damageDir)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(damageDir, f));
  } else {
    filesToProcess = files.map(f => path.resolve(f));
  }

  const results = filesToProcess.map(file => reducer.reduceFile(file));
  reducer.generateSummary(results);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DamageReducer };
