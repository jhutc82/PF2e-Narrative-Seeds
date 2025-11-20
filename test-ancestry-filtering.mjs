/**
 * Test script for ancestry-aware NPC generation
 * Verifies that NPCs receive only appropriate options for their ancestry
 */

import { NPCGenerator } from './scripts/social/npc-generator.js';

// Test ancestries with specific physical limitations
const testAncestries = [
  'human',      // baseline - should have all human-appropriate options
  'leshy',      // plant-based - no hair, no traditional skin
  'automaton',  // mechanical - no organic features
  'tengu',      // beaked - no lips
  'catfolk',    // furred - has claws, tail
  'kobold'      // reptilian - has scales
];

console.log('=== Testing Ancestry-Aware NPC Generation ===\n');

for (const ancestry of testAncestries) {
  console.log(`\n--- Testing ${ancestry.toUpperCase()} ---`);

  try {
    const npc = await NPCGenerator.generate({
      ancestry: ancestry,
      detailLevel: 'comprehensive'
    });

    if (!npc) {
      console.error(`❌ Failed to generate ${ancestry} NPC`);
      continue;
    }

    console.log(`✅ Generated ${ancestry} NPC: ${npc.name}`);

    // Check for problematic options based on ancestry
    if (ancestry === 'leshy') {
      // Leshy shouldn't have hair-related mannerisms
      const hairMannerism = npc.mannerisms?.find(m =>
        m.description?.toLowerCase().includes('hair') ||
        m.description?.toLowerCase().includes('twirl')
      );
      if (hairMannerism) {
        console.error(`❌ PROBLEM: Leshy has hair-related mannerism: ${hairMannerism.description}`);
      } else {
        console.log(`✅ No inappropriate hair mannerisms`);
      }

      // Check for skin-based scars
      const skinScar = npc.physicalDetails?.scarsAndMarkings?.find(s =>
        s.description?.toLowerCase().includes('vitiligo') ||
        s.description?.toLowerCase().includes('port-wine') ||
        s.description?.toLowerCase().includes('stretch mark')
      );
      if (skinScar) {
        console.error(`❌ PROBLEM: Leshy has skin-based scar: ${skinScar.description}`);
      } else {
        console.log(`✅ No inappropriate skin-based scars`);
      }
    }

    if (ancestry === 'automaton') {
      // Automaton shouldn't have organic features
      const organicFeature = npc.physicalDetails?.scarsAndMarkings?.find(s =>
        s.description?.toLowerCase().includes('vitiligo') ||
        s.description?.toLowerCase().includes('blood') ||
        s.description?.toLowerCase().includes('sweat')
      );
      if (organicFeature) {
        console.error(`❌ PROBLEM: Automaton has organic feature: ${organicFeature.description}`);
      } else {
        console.log(`✅ No inappropriate organic features`);
      }
    }

    if (ancestry === 'tengu') {
      // Tengu shouldn't have lip-based mannerisms
      const lipMannerism = npc.mannerisms?.find(m =>
        m.description?.toLowerCase().includes('lip') ||
        m.id === 'lip-biting'
      );
      if (lipMannerism) {
        console.error(`❌ PROBLEM: Tengu has lip-based mannerism: ${lipMannerism.description}`);
      } else {
        console.log(`✅ No inappropriate lip mannerisms`);
      }
    }

    // Log some details to verify variety
    console.log(`  Personalities: ${npc.personalities?.map(p => p.trait).join(', ')}`);
    console.log(`  Mannerisms: ${npc.mannerisms?.slice(0, 2).map(m => m.description).join(', ')}`);
    if (npc.physicalDetails?.scarsAndMarkings?.length > 0) {
      console.log(`  Scars: ${npc.physicalDetails.scarsAndMarkings.slice(0, 2).map(s => s.description).join(', ')}`);
    }
    if (npc.sensorySignature?.scents?.length > 0) {
      console.log(`  Scents: ${npc.sensorySignature.scents.slice(0, 2).map(s => s.description).join(', ')}`);
    }

  } catch (error) {
    console.error(`❌ Error generating ${ancestry} NPC:`, error.message);
  }
}

console.log('\n=== Test Complete ===');
