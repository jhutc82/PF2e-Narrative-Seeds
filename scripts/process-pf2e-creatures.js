/**
 * PF2e Creature Data Processor
 * Downloads and processes creature data from Pf2eTools repository
 *
 * Usage: node scripts/process-pf2e-creatures.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// All creature data URLs
const CREATURE_URLS = [
  // Core Bestiaries
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-b1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-b2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-b3.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-bb.json',

  // Age of Ashes
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoa1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoa2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoa3.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoa4.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoa5.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoa6.json',

  // Extinction Curse
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-ec1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-ec2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-ec3.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-ec4.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-ec5.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-ec6.json',

  // Agents of Edgewatch
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoe1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoe2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoe3.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoe4.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoe5.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-aoe6.json',

  // Abomination Vaults
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-av1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-av2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-av3.json',

  // Strength of Thousands
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sot1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sot2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sot3.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sot4.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sot5.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sot6.json',

  // Quest for the Frozen Flame
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-qff1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-qff2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-qff3.json',

  // Outlaws of Alkenstar
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-oa1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-oa2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-oa3.json',

  // Blood Lords
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-bl1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-bl2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-bl3.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-bl4.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-bl5.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-bl6.json',

  // Gatewalkers
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-gw1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-gw2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-gw3.json',

  // Stolen Fate
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sf1.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sf2.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sf3.json',

  // Kingmaker & Other
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-kingmaker.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-crb.json',

  // Lost Omens Books
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-botd.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-locg.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-lome.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-lomm.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-loil.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-lol.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-loag.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-logm.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-lopsg.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-ngd.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-tio.json',

  // Standalone Adventures
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-fop.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-tff.json',
  'https://raw.githubusercontent.com/Pf2eToolsOrg/Pf2eTools/master/data/bestiary/creatures-sli.json'
];

// Data aggregation
const aggregatedData = {
  traits: new Set(),
  creatureTypes: new Set(),
  attacks: new Set(),
  damageTypes: new Set(),
  naturalWeapons: new Map(), // weapon name -> count
  creaturesByTrait: new Map(), // trait -> [creature names]
  traitCombinations: new Map(), // trait combo -> count
  attackPatterns: new Map() // attack name pattern -> examples
};

/**
 * Download a JSON file from URL
 */
function downloadJSON(url) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.error(`Failed to download ${url}: HTTP ${response.statusCode}`);
        resolve(null); // Continue even if one file fails
        return;
      }

      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✓ Downloaded: ${url.split('/').pop()}`);
          resolve(json);
        } catch (error) {
          console.error(`Failed to parse JSON from ${url}:`, error.message);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error(`Network error downloading ${url}:`, error.message);
      resolve(null);
    });
  });
}

/**
 * Process a single creature entry
 */
function processCreature(creature) {
  if (!creature || !creature.name) return;

  // Extract traits
  if (creature.traits) {
    creature.traits.forEach(trait => {
      aggregatedData.traits.add(trait.toLowerCase());

      // Track which creatures have which traits
      if (!aggregatedData.creaturesByTrait.has(trait.toLowerCase())) {
        aggregatedData.creaturesByTrait.set(trait.toLowerCase(), []);
      }
      aggregatedData.creaturesByTrait.get(trait.toLowerCase()).push(creature.name);
    });

    // Track trait combinations
    if (creature.traits.length > 0) {
      const combo = creature.traits.slice(0, 3).sort().join('+').toLowerCase();
      aggregatedData.traitCombinations.set(combo,
        (aggregatedData.traitCombinations.get(combo) || 0) + 1);
    }
  }

  // Extract creature type
  if (creature.creatureType) {
    aggregatedData.creatureTypes.add(creature.creatureType.toLowerCase());
  }

  // Extract attacks and damage types from various sources
  const attacks = [];

  // Check items array for attacks
  if (creature.items && Array.isArray(creature.items)) {
    attacks.push(...creature.items);
  }

  // Check attacks in abilities
  if (creature.abilities) {
    ['top', 'mid', 'bot'].forEach(section => {
      if (creature.abilities[section]) {
        creature.abilities[section].forEach(ability => {
          if (ability.activity && ability.activity.entry) {
            attacks.push(ability);
          }
        });
      }
    });
  }

  // Check action entries
  if (creature.action && Array.isArray(creature.action)) {
    attacks.push(...creature.action);
  }

  // Process attacks
  attacks.forEach(attack => {
    if (!attack) return;

    const attackName = (attack.name || attack.entry || '').toLowerCase();
    if (!attackName) return;

    // Track attack names
    aggregatedData.attacks.add(attackName);

    // Identify natural weapons
    const naturalWeaponPatterns = [
      'bite', 'claw', 'tail', 'horn', 'gore', 'slam', 'fist', 'tentacle',
      'wing', 'sting', 'stinger', 'beak', 'trunk', 'hoof', 'hooves', 'pincer',
      'pincers', 'pseudopod', 'vine', 'tendril', 'branch', 'antler', 'antlers',
      'mandible', 'mandibles', 'spine', 'spines', 'quill', 'foot', 'feet',
      'kick', 'head butt', 'headbutt', 'jaws', 'fangs', 'teeth', 'talons',
      'tusk', 'tusks'
    ];

    naturalWeaponPatterns.forEach(pattern => {
      if (attackName.includes(pattern)) {
        aggregatedData.naturalWeapons.set(pattern,
          (aggregatedData.naturalWeapons.get(pattern) || 0) + 1);

        // Track pattern with examples
        if (!aggregatedData.attackPatterns.has(pattern)) {
          aggregatedData.attackPatterns.set(pattern, new Set());
        }
        aggregatedData.attackPatterns.get(pattern).add(attackName);
      }
    });

    // Extract damage types from damage arrays
    if (attack.damage) {
      let damageArray = attack.damage;
      if (!Array.isArray(damageArray)) {
        damageArray = [damageArray];
      }

      damageArray.forEach(dmg => {
        if (dmg.type) {
          aggregatedData.damageTypes.add(dmg.type.toLowerCase());
        }
      });
    }
  });
}

/**
 * Process a single JSON file
 */
function processFile(json) {
  if (!json || !json.creature || !Array.isArray(json.creature)) {
    console.log('No creature array found in file');
    return 0;
  }

  json.creature.forEach(processCreature);
  return json.creature.length;
}

/**
 * Generate summary report
 */
function generateReport() {
  const report = {
    summary: {
      totalTraits: aggregatedData.traits.size,
      totalCreatureTypes: aggregatedData.creatureTypes.size,
      totalAttackPatterns: aggregatedData.attacks.size,
      totalDamageTypes: aggregatedData.damageTypes.size,
      totalNaturalWeaponTypes: aggregatedData.naturalWeapons.size
    },
    traits: Array.from(aggregatedData.traits).sort(),
    creatureTypes: Array.from(aggregatedData.creatureTypes).sort(),
    damageTypes: Array.from(aggregatedData.damageTypes).sort(),
    naturalWeapons: Array.from(aggregatedData.naturalWeapons.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
    topTraitCombinations: Array.from(aggregatedData.traitCombinations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([combo, count]) => ({ combo, count })),
    attackPatternExamples: Array.from(aggregatedData.attackPatterns.entries())
      .map(([pattern, examples]) => ({
        pattern,
        count: examples.size,
        examples: Array.from(examples).slice(0, 5)
      }))
      .sort((a, b) => b.count - a.count),
    traitDistribution: Array.from(aggregatedData.creaturesByTrait.entries())
      .map(([trait, creatures]) => ({
        trait,
        count: creatures.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100)
  };

  return report;
}

/**
 * Main processing function
 */
async function main() {
  console.log('=== PF2e Creature Data Processor ===\n');
  console.log(`Processing ${CREATURE_URLS.length} files...\n`);

  let totalCreatures = 0;
  let processedFiles = 0;
  let failedFiles = 0;

  // Download and process all files
  for (const url of CREATURE_URLS) {
    const json = await downloadJSON(url);
    if (json) {
      const count = processFile(json);
      totalCreatures += count;
      processedFiles++;
      console.log(`  Processed ${count} creatures\n`);
    } else {
      failedFiles++;
    }
  }

  console.log('\n=== Processing Complete ===');
  console.log(`Files processed: ${processedFiles}/${CREATURE_URLS.length}`);
  console.log(`Files failed: ${failedFiles}`);
  console.log(`Total creatures: ${totalCreatures}\n`);

  // Generate report
  const report = generateReport();

  // Save report to file
  const outputDir = path.join(__dirname, '..', 'data', 'processed');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const reportPath = path.join(outputDir, 'creature-data-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${reportPath}`);

  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Unique Traits: ${report.summary.totalTraits}`);
  console.log(`Creature Types: ${report.summary.totalCreatureTypes}`);
  console.log(`Attack Patterns: ${report.summary.totalAttackPatterns}`);
  console.log(`Damage Types: ${report.summary.totalDamageTypes}`);
  console.log(`Natural Weapon Types: ${report.summary.totalNaturalWeaponTypes}`);

  console.log('\n=== Top 20 Traits by Frequency ===');
  report.traitDistribution.slice(0, 20).forEach(({ trait, count }) => {
    console.log(`  ${trait}: ${count}`);
  });

  console.log('\n=== Top 20 Natural Weapons ===');
  report.naturalWeapons.slice(0, 20).forEach(({ name, count }) => {
    console.log(`  ${name}: ${count}`);
  });

  console.log('\n=== Damage Types ===');
  report.damageTypes.forEach(type => {
    console.log(`  ${type}`);
  });

  console.log('\nProcessing complete! Check the report file for full details.');
}

// Run the processor
main().catch(console.error);
