#!/usr/bin/env node

/**
 * Generate Example Narrative Outputs
 *
 * Demonstrates the variety and quality of combat narratives
 * after phrase reduction + template expansion.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NarrativeExampleGenerator {
  constructor() {
    this.data = {};
    this.loadData();
  }

  loadData() {
    // Load templates
    this.data.templates = {
      cinematic: JSON.parse(fs.readFileSync('data/combat/templates/cinematic.json', 'utf8')),
      detailed: JSON.parse(fs.readFileSync('data/combat/templates/detailed.json', 'utf8')),
      standard: JSON.parse(fs.readFileSync('data/combat/templates/standard.json', 'utf8'))
    };

    // Load sword openings
    this.data.sword = JSON.parse(fs.readFileSync('data/combat/openings/melee/sword.json', 'utf8'));

    // Load slashing damage
    this.data.slashing = JSON.parse(fs.readFileSync('data/combat/damage/slashing.json', 'utf8'));

    // Load humanoid locations
    this.data.humanoid = JSON.parse(fs.readFileSync('data/combat/locations/humanoid.json', 'utf8'));
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateNarrative(detailLevel, outcome) {
    // Pick random components
    const template = this.pickRandom(this.data.templates[detailLevel][outcome]);
    const opening = this.pickRandom(this.data.sword[detailLevel][outcome]);

    let verb = '';
    let effect = '';
    let location = '';

    if (outcome === 'criticalSuccess' || outcome === 'success') {
      verb = this.pickRandom(this.data.slashing.verbs[outcome]);
      effect = this.pickRandom(this.data.slashing.effects[outcome]);
      location = this.pickRandom(this.data.humanoid[outcome]);
    } else {
      location = this.pickRandom(this.data.humanoid[outcome] || this.data.humanoid.failure);
    }

    // Replace template variables
    let narrative = template.pattern;
    narrative = narrative.replace(/\$\{opening\}/g, opening);
    narrative = narrative.replace(/\$\{attackerName\}/g, 'Valeros');
    narrative = narrative.replace(/\$\{targetName\}/g, 'the goblin');
    narrative = narrative.replace(/\$\{weaponType\}/g, 'longsword');
    narrative = narrative.replace(/\$\{verb\}/g, verb);
    narrative = narrative.replace(/\$\{effect\}/g, effect);
    narrative = narrative.replace(/\$\{location\}/g, location);

    return {
      narrative,
      components: {
        template: template.grammar,
        opening,
        verb,
        effect,
        location
      }
    };
  }

  generateExamples() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║           NARRATIVE OUTPUT EXAMPLES                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    const scenarios = [
      { level: 'cinematic', outcome: 'criticalSuccess', title: 'Cinematic Critical Success' },
      { level: 'cinematic', outcome: 'success', title: 'Cinematic Success' },
      { level: 'cinematic', outcome: 'failure', title: 'Cinematic Failure' },
      { level: 'cinematic', outcome: 'criticalFailure', title: 'Cinematic Critical Failure' },
      { level: 'detailed', outcome: 'criticalSuccess', title: 'Detailed Critical Success' },
      { level: 'detailed', outcome: 'success', title: 'Detailed Success' },
      { level: 'standard', outcome: 'success', title: 'Standard Success' },
    ];

    scenarios.forEach(scenario => {
      console.log(`\n${'='.repeat(65)}`);
      console.log(`${scenario.title.toUpperCase()}`);
      console.log(`${'='.repeat(65)}\n`);

      // Generate 5 examples to show variety
      for (let i = 1; i <= 5; i++) {
        const result = this.generateNarrative(scenario.level, scenario.outcome);
        console.log(`Example ${i}:`);
        console.log(`"${result.narrative}"\n`);
      }
    });

    // Show template variety with same components
    console.log(`\n${'='.repeat(65)}`);
    console.log(`TEMPLATE VARIETY DEMONSTRATION`);
    console.log(`Using the SAME base phrases, different templates create variety`);
    console.log(`${'='.repeat(65)}\n`);

    // Fix the components
    const opening = this.data.sword.cinematic.success[0];
    const verb = this.data.slashing.verbs.success[0];
    const effect = this.data.slashing.effects.success[0];
    const location = this.data.humanoid.success[0];

    console.log(`Fixed Components:`);
    console.log(`  Opening: "${opening}"`);
    console.log(`  Verb: "${verb}"`);
    console.log(`  Effect: "${effect}"`);
    console.log(`  Location: "${location}"\n`);

    console.log(`Different Template Outputs:\n`);

    // Generate with each template
    const templates = this.data.templates.cinematic.success;
    templates.slice(0, 8).forEach((template, i) => {
      let narrative = template.pattern;
      narrative = narrative.replace(/\$\{opening\}/g, opening);
      narrative = narrative.replace(/\$\{attackerName\}/g, 'Valeros');
      narrative = narrative.replace(/\$\{targetName\}/g, 'the goblin');
      narrative = narrative.replace(/\$\{weaponType\}/g, 'longsword');
      narrative = narrative.replace(/\$\{verb\}/g, verb);
      narrative = narrative.replace(/\$\{effect\}/g, effect);
      narrative = narrative.replace(/\$\{location\}/g, location);

      console.log(`${i + 1}. [${template.grammar}]`);
      console.log(`   "${narrative}"\n`);
    });

    // Show quality comparison
    console.log(`\n${'='.repeat(65)}`);
    console.log(`QUALITY COMPARISON: Before vs After`);
    console.log(`${'='.repeat(65)}\n`);

    console.log(`❌ BEFORE (from _legacy backup - structural clones):\n`);

    const legacyFile = 'data/combat/openings/melee/_legacy/sword.json';
    if (fs.existsSync(legacyFile)) {
      const legacy = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
      const clones = legacy.cinematic.success.filter(p => p.match(/from \$\{attackerName\}!?$/));

      console.log(`Structural Clone Pattern ("X from \${attackerName}!"):\n`);
      clones.slice(0, 5).forEach((phrase, i) => {
        console.log(`${i + 1}. "${phrase}"`);
      });
      console.log(`\n...and ${clones.length - 5} more identical patterns`);

      console.log(`\n\n✅ AFTER (current - all unique structures):\n`);
      this.data.sword.cinematic.success.slice(0, 5).forEach((phrase, i) => {
        console.log(`${i + 1}. "${phrase}"`);
      });
      console.log(`\nEach phrase has unique structure and wording!`);
    }

    console.log(`\n\n${'='.repeat(65)}`);
    console.log(`VARIETY STATISTICS`);
    console.log(`${'='.repeat(65)}\n`);

    const stats = {
      openings: this.data.sword.cinematic.success.length,
      templates: this.data.templates.cinematic.success.length,
      verbs: this.data.slashing.verbs.success.length,
      effects: this.data.slashing.effects.success.length,
      locations: this.data.humanoid.success.length
    };

    console.log(`For a single cinematic success attack:\n`);
    console.log(`  Opening phrases:  ${stats.openings}`);
    console.log(`  Templates:        ${stats.templates}`);
    console.log(`  Damage verbs:     ${stats.verbs}`);
    console.log(`  Damage effects:   ${stats.effects}`);
    console.log(`  Hit locations:    ${stats.locations}\n`);

    const combinations = stats.openings * stats.templates * stats.verbs * stats.effects * stats.locations;
    console.log(`  Total combinations: ${combinations.toLocaleString()}`);
    console.log(`  = ${(combinations / 1e6).toFixed(2)} MILLION unique narratives!`);
    console.log(`\nFor just ONE outcome of ONE weapon against ONE anatomy type!\n`);

    console.log(`${'='.repeat(65)}\n`);
  }
}

// Main execution
function main() {
  const generator = new NarrativeExampleGenerator();
  generator.generateExamples();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { NarrativeExampleGenerator };
