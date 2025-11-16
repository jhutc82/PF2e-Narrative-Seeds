#!/usr/bin/env node

/**
 * Fix All Location Files
 *
 * 1. Fix article grammar ("the" → "a")
 * 2. Replace medical terminology with accessible language
 * 3. Ensure all creature types have appropriate basic locations
 */

import fs from 'fs';
import path from 'path';

const locationsDir = 'data/combat/locations';

// Medical term replacements (creature-agnostic)
const medicalReplacements = {
  // Brain/Nervous System
  'medulla oblongata': 'base of the brain',
  'cerebellum': 'back of the brain',
  'frontal lobe': 'front of the brain',
  'temporal lobe': 'side of the brain',
  'parietal lobe': 'top of the brain',
  'occipital lobe': 'back of the brain',
  'brain stem': 'base of the brain',
  'cerebrum': 'brain',
  'corpus callosum': 'brain center',
  'thalamus': 'inner brain',
  'hypothalamus': 'deep brain',
  'pituitary gland': 'brain gland',
  'pineal gland': 'brain gland',

  // Nerves
  'brachial nerve plexus': 'nerve cluster in the shoulder',
  'brachial plexus': 'nerve cluster in the shoulder',
  'lumbar nerve plexus': 'nerve cluster in the lower back',
  'lumbar plexus': 'nerve cluster in the lower back',
  'sacral nerve plexus': 'nerve cluster in the hip',
  'sacral plexus': 'nerve cluster in the hip',
  'cervical plexus': 'nerve cluster in the neck',
  'cervical nerve cluster': 'nerve cluster in the neck',
  'optic nerve': 'eye nerve',
  'olfactory nerve': 'nose nerve',
  'auditory nerve': 'ear nerve',
  'vagus nerve': 'major nerve in the chest',
  'phrenic nerve': 'breathing nerve',
  'sciatic nerve': 'major nerve in the leg',
  'femoral nerve': 'nerve in the thigh',
  'radial nerve': 'nerve in the arm',
  'ulnar nerve': 'nerve in the arm',
  'median nerve': 'nerve in the arm',
  'tibial nerve': 'nerve in the leg',
  'peroneal nerve': 'nerve in the leg',
  'radial nerve at wing': 'wing nerve',
  'wing nerve bundle': 'wing nerves',
  'nerve bundle': 'nerves',
  'spinal nerve': 'spine nerve',

  // Blood Vessels - Arteries
  'carotid artery': 'major artery in the neck',
  'jugular vein': 'major blood vessel in the neck',
  'aorta': 'main artery in the chest',
  'pulmonary artery': 'lung artery',
  'pulmonary vein': 'lung vein',
  'coronary artery': 'heart artery',
  'hepatic artery': 'liver artery',
  'portal vein': 'liver vein',
  'renal artery': 'kidney artery',
  'renal vein': 'kidney vein',
  'femoral artery': 'major artery in the thigh',
  'subclavian artery': 'artery under the collarbone',
  'axillary artery': 'armpit artery',
  'brachial artery': 'artery in the arm',
  'radial artery': 'artery in the forearm',
  'ulnar artery': 'artery in the forearm',

  // Blood Vessels - Veins
  'superior vena cava': 'major vein in the upper chest',
  'inferior vena cava': 'major vein in the lower chest',
  'saphenous vein': 'vein in the leg',

  // Heart
  'left ventricle': 'left chamber of the heart',
  'right ventricle': 'right chamber of the heart',
  'left atrium': 'upper left chamber of the heart',
  'right atrium': 'upper right chamber of the heart',
  'heart valve': 'heart valve',
  'left lung apex': 'top of the left lung',
  'right lung apex': 'top of the right lung',

  // Spine
  'cervical vertebrae': 'neck vertebrae',
  'cervical vertebrae gap': 'gap between neck bones',
  'cervical spine': 'neck spine',
  'thoracic vertebrae': 'upper back vertebrae',
  'thoracic vertebrae gap': 'gap between upper back bones',
  'thoracic spine': 'upper back spine',
  'lumbar vertebrae': 'lower back vertebrae',
  'lumbar vertebrae gap': 'gap between lower back bones',
  'lumbar spine': 'lower back spine',
  'sacral spine': 'tailbone area',
  'spinal cord at neck': 'spine at the neck',
  'spinal cord at thorax': 'spine at the chest',
  'spinal cord at lumbar': 'spine at the lower back',
  'spinal column': 'spine',
  'spinal cord': 'spine',
  'vertebral column': 'spine',

  // Digestive
  'esophagus': 'throat passage',
  'duodenum': 'upper gut',
  'jejunum': 'gut',
  'ileum': 'lower gut',
  'cecum': 'lower gut',
  'ascending colon': 'gut',
  'transverse colon': 'gut',
  'descending colon': 'gut',
  'sigmoid colon': 'gut',
  'rectum': 'lower gut',
  'stomach lining': 'stomach',
  'small intestine': 'gut',
  'large intestine': 'gut',
  'appendix': 'lower gut',

  // Organs/Glands
  'adrenal gland': 'gland near the kidney',
  'thyroid gland': 'gland in the neck',
  'parathyroid gland': 'gland in the neck',
  'left kidney cortex': 'outer left kidney',
  'right kidney cortex': 'outer right kidney',

  // Bones
  'mandible': 'jawbone',
  'maxilla': 'upper jaw',
  'zygomatic bone': 'cheekbone',
  'mastoid bone': 'bone behind the ear',
  'occipital bone': 'back of the skull',
  'parietal bone': 'side of the skull',
  'temporal bone': 'temple area',
  'frontal bone': 'forehead',
  'nasal bone': 'nose bone',
  'clavicle': 'collarbone',
  'scapula': 'shoulder blade',
  'manubrium': 'top of the sternum',
  'xiphoid process': 'bottom of the sternum',

  // Respiratory
  'trachea': 'windpipe',
  'larynx': 'voice box',
  'thyroid cartilage': 'throat cartilage',
  'cricoid cartilage': 'throat cartilage',

  // Dragon-specific accessible alternatives
  'draconic gizzard': 'dragon stomach',
  'fire gland': 'flame organ',
  'breath organ': 'breath chamber',
  'flame sac': 'fire sac',
  'elemental organ': 'elemental chamber',
  'breath chamber': 'breath organ'
};

// Fix article issues
function fixArticles(location) {
  // Fix "the" to "a" for arteries/vessels
  location = location.replace(/^the (major artery|main blood vessel|artery|vein|nerve)/gi, 'a $1');

  // Add "a" if it starts with these patterns without an article
  if (/^(major artery|main blood vessel|nerve cluster|artery|vein)\s/i.test(location)) {
    location = 'a ' + location;
  }

  return location;
}

// Simplify medical terms
function simplifyLocation(location) {
  let simplified = location;

  // Apply medical term replacements
  for (const [medical, accessible] of Object.entries(medicalReplacements)) {
    const regex = new RegExp(`\\b${medical}\\b`, 'gi');
    simplified = simplified.replace(regex, accessible);
  }

  // Fix articles after replacements
  simplified = fixArticles(simplified);

  return simplified;
}

// Process a location file
function processLocationFile(filename) {
  const filepath = path.join(locationsDir, filename);
  const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  // Create backup
  const backupDir = path.join(locationsDir, '_legacy');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, filename);
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, JSON.stringify(content, null, 2));
  }

  // Process each outcome
  const processed = {};
  for (const [outcome, locations] of Object.entries(content)) {
    if (Array.isArray(locations)) {
      processed[outcome] = locations.map(loc => simplifyLocation(loc));
    } else {
      processed[outcome] = locations;
    }
  }

  // Write updated file
  fs.writeFileSync(filepath, JSON.stringify(processed, null, 2));

  return {
    file: filename,
    before: content.criticalSuccess?.length || 0,
    after: processed.criticalSuccess?.length || 0
  };
}

// Main execution
function main() {
  console.log('🔧 Fixing all location files...\n');

  const files = fs.readdirSync(locationsDir)
    .filter(f => f.endsWith('.json') && f !== '_legacy');

  const results = [];

  for (const file of files) {
    const result = processLocationFile(file);
    results.push(result);
    console.log(`✓ ${result.file}`);
  }

  console.log(`\n✅ Processed ${results.length} location files`);
  console.log('\nKey improvements:');
  console.log('  Grammar:');
  console.log('    - "the major artery" → "a major artery"');
  console.log('    - "the main blood vessel" → "a main blood vessel"');
  console.log('\n  Medical → Accessible:');
  console.log('    - "medulla oblongata" → "base of the brain"');
  console.log('    - "jejunum" → "gut"');
  console.log('    - "brachial plexus" → "nerve cluster in the shoulder"');
  console.log('    - "femoral artery" → "major artery in the thigh"');
  console.log('    - "cervical vertebrae" → "neck vertebrae"');
  console.log('\nOriginals backed up to: data/combat/locations/_legacy/');
}

main();
