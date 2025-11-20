/**
 * Validation script for ancestry tagging in JSON files
 * Verifies that all options have proper "ancestries" fields
 */

import fs from 'fs/promises';
import path from 'path';

const dataDir = './data/social/npc';

const filesToCheck = [
  'mannerisms.json',
  'physical-details.json',
  'speech-patterns.json',
  'psychological-depth.json',
  'plot-hooks.json',
  'moods.json',
  'personalities.json',
  'motivations.json',
  'quirks.json',
  'occupations.json',
  'sensory-signature.json',
  'health-conditions.json'
];

console.log('=== Validating Ancestry Tags ===\n');

let totalFiles = 0;
let totalOptions = 0;
let taggedOptions = 0;
let untaggedOptions = 0;
let errors = [];

for (const filename of filesToCheck) {
  const filepath = path.join(dataDir, filename);

  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const data = JSON.parse(content);

    totalFiles++;

    console.log(`\n--- ${filename} ---`);

    // Check different data structures
    let fileOptions = 0;
    let fileTagged = 0;
    let fileUntagged = 0;

    // Helper to check an array of options
    const checkArray = (arr, category = '') => {
      if (!Array.isArray(arr)) return;

      arr.forEach((option, index) => {
        fileOptions++;
        totalOptions++;

        if (option.ancestries) {
          fileTagged++;
          taggedOptions++;

          // Validate ancestries is an array
          if (!Array.isArray(option.ancestries)) {
            errors.push(`${filename}/${category || 'root'}[${index}]: ancestries is not an array`);
          }

          // Check for valid values
          if (option.ancestries.length === 0) {
            errors.push(`${filename}/${category || 'root'}[${index}]: ancestries is empty`);
          }
        } else {
          fileUntagged++;
          untaggedOptions++;
          errors.push(`${filename}/${category || 'root'}[${index}] (${option.id || option.name || 'unknown'}): Missing ancestries field`);
        }
      });
    };

    // Check different file structures
    if (data.mannerisms) checkArray(data.mannerisms, 'mannerisms');
    if (data.moods) checkArray(data.moods, 'moods');
    if (data.traits) checkArray(data.traits, 'traits');
    if (data.motivations) checkArray(data.motivations, 'motivations');
    if (data.quirks) checkArray(data.quirks, 'quirks');
    if (data.professions) checkArray(data.professions, 'professions');

    // Physical details has nested structure
    if (data.voiceQualities) checkArray(data.voiceQualities, 'voiceQualities');
    if (data.scarsAndMarkings) checkArray(data.scarsAndMarkings, 'scarsAndMarkings');
    if (data.tattoos) checkArray(data.tattoos, 'tattoos');
    if (data.clothingStyles) checkArray(data.clothingStyles, 'clothingStyles');
    if (data.jewelry) checkArray(data.jewelry, 'jewelry');
    if (data.physicalQuirks) checkArray(data.physicalQuirks, 'physicalQuirks');
    if (data.posture) checkArray(data.posture, 'posture');
    if (data.hygiene) checkArray(data.hygiene, 'hygiene');

    // Speech patterns has nested structure
    if (data.catchphrases) checkArray(data.catchphrases, 'catchphrases');
    if (data.verbalTics) checkArray(data.verbalTics, 'verbalTics');
    if (data.conversationStyles) checkArray(data.conversationStyles, 'conversationStyles');
    if (data.accents) checkArray(data.accents, 'accents');
    if (data.speakingSpeed) checkArray(data.speakingSpeed, 'speakingSpeed');
    if (data.laughTypes) checkArray(data.laughTypes, 'laughTypes');
    if (data.emotionalTells) checkArray(data.emotionalTells, 'emotionalTells');

    // Psychological depth
    if (data.fears) checkArray(data.fears, 'fears');
    if (data.desires) checkArray(data.desires, 'desires');
    if (data.regrets) checkArray(data.regrets, 'regrets');
    if (data.vices) checkArray(data.vices, 'vices');
    if (data.virtues) checkArray(data.virtues, 'virtues');

    // Plot hooks
    if (data.secrets) checkArray(data.secrets, 'secrets');
    if (data.goals) checkArray(data.goals, 'goals');
    if (data.conflicts) checkArray(data.conflicts, 'conflicts');
    if (data.questHooks) checkArray(data.questHooks, 'questHooks');

    // Sensory signature
    if (data.scents) checkArray(data.scents, 'scents');
    if (data.sounds) checkArray(data.sounds, 'sounds');
    if (data.textures) checkArray(data.textures, 'textures');
    if (data.temperatures) checkArray(data.temperatures, 'temperatures');
    if (data.auras) checkArray(data.auras, 'auras');
    if (data.visualSignatures) checkArray(data.visualSignatures, 'visualSignatures');

    // Health conditions
    if (data.chronicConditions) checkArray(data.chronicConditions, 'chronicConditions');
    if (data.disabilities) checkArray(data.disabilities, 'disabilities');
    if (data.fitnessLevels) checkArray(data.fitnessLevels, 'fitnessLevels');
    if (data.allergiesAndSensitivities) checkArray(data.allergiesAndSensitivities, 'allergiesAndSensitivities');
    if (data.mentalHealthConditions) checkArray(data.mentalHealthConditions, 'mentalHealthConditions');
    if (data.addictions) checkArray(data.addictions, 'addictions');
    if (data.currentHealthStatus) checkArray(data.currentHealthStatus, 'currentHealthStatus');
    if (data.scarsAndInjuryHistory) checkArray(data.scarsAndInjuryHistory, 'scarsAndInjuryHistory');

    console.log(`  Total options: ${fileOptions}`);
    console.log(`  Tagged: ${fileTagged} (${((fileTagged / fileOptions) * 100).toFixed(1)}%)`);
    if (fileUntagged > 0) {
      console.log(`  ❌ Untagged: ${fileUntagged}`);
    } else {
      console.log(`  ✅ All options tagged`);
    }

  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    errors.push(`${filename}: ${error.message}`);
  }
}

console.log('\n=== Summary ===');
console.log(`Files checked: ${totalFiles}`);
console.log(`Total options: ${totalOptions}`);
console.log(`Tagged: ${taggedOptions} (${((taggedOptions / totalOptions) * 100).toFixed(1)}%)`);
console.log(`Untagged: ${untaggedOptions} (${((untaggedOptions / totalOptions) * 100).toFixed(1)}%)`);

if (errors.length > 0) {
  console.log(`\n❌ Validation Errors (${errors.length}):`);
  errors.slice(0, 20).forEach(err => console.log(`  - ${err}`));
  if (errors.length > 20) {
    console.log(`  ... and ${errors.length - 20} more errors`);
  }
  process.exit(1);
} else {
  console.log('\n✅ All files validated successfully!');
  console.log('All options have proper ancestry tagging.');
}
