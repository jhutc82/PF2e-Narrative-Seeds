#!/usr/bin/env node

/**
 * Generate Diverse Attack Type Examples
 *
 * Shows how the system handles:
 * - Natural weapons
 * - Spell attacks
 * - Firearms
 * - Alchemical bombs
 * - Creature attacks
 * - Thrown weapons
 */

import fs from 'fs';
import path from 'path';

class DiverseExampleGenerator {
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

    // Load attack type openings
    this.data.unarmed = JSON.parse(fs.readFileSync('data/combat/openings/melee/unarmed.json', 'utf8'));
    this.data.spell = JSON.parse(fs.readFileSync('data/combat/openings/ranged/spell.json', 'utf8'));
    this.data.firearm = JSON.parse(fs.readFileSync('data/combat/openings/ranged/firearm.json', 'utf8'));
    this.data.bomb = JSON.parse(fs.readFileSync('data/combat/openings/ranged/bomb.json', 'utf8'));
    this.data.thrown = JSON.parse(fs.readFileSync('data/combat/openings/ranged/thrown.json', 'utf8'));

    // Load damage types
    this.data.slashing = JSON.parse(fs.readFileSync('data/combat/damage/slashing.json', 'utf8'));
    this.data.piercing = JSON.parse(fs.readFileSync('data/combat/damage/piercing.json', 'utf8'));
    this.data.fire = JSON.parse(fs.readFileSync('data/combat/damage/fire.json', 'utf8'));
    this.data.acid = JSON.parse(fs.readFileSync('data/combat/damage/acid.json', 'utf8'));
    this.data.force = JSON.parse(fs.readFileSync('data/combat/damage/force.json', 'utf8'));

    // Load locations
    this.data.humanoid = JSON.parse(fs.readFileSync('data/combat/locations/humanoid.json', 'utf8'));
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateNarrative(attackType, damageType, detailLevel, outcome, weaponName, attackerName, targetName) {
    const template = this.pickRandom(this.data.templates[detailLevel][outcome]);
    const opening = this.pickRandom(this.data[attackType][detailLevel][outcome]);

    let verb = '';
    let effect = '';
    let location = '';

    if (outcome === 'criticalSuccess' || outcome === 'success') {
      verb = this.pickRandom(this.data[damageType].verbs[outcome]);
      effect = this.pickRandom(this.data[damageType].effects[outcome]);
      location = this.pickRandom(this.data.humanoid[outcome]);
    } else {
      location = this.pickRandom(this.data.humanoid[outcome] || this.data.humanoid.failure);
    }

    let narrative = template.pattern;
    narrative = narrative.replace(/\$\{opening\}/g, opening);
    narrative = narrative.replace(/\$\{attackerName\}/g, attackerName);
    narrative = narrative.replace(/\$\{targetName\}/g, targetName);
    narrative = narrative.replace(/\$\{weaponType\}/g, weaponName);
    narrative = narrative.replace(/\$\{verb\}/g, verb);
    narrative = narrative.replace(/\$\{effect\}/g, effect);
    narrative = narrative.replace(/\$\{location\}/g, location);

    return narrative;
  }

  generateExamples() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║        DIVERSE ATTACK TYPE EXAMPLES                           ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    const examples = [
      {
        category: '🦁 NATURAL WEAPONS (Unarmed Category)',
        attacks: [
          { type: 'unarmed', damage: 'slashing', weapon: 'claws', attacker: 'The werebear', target: 'the bandit', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'unarmed', damage: 'piercing', weapon: 'jaws', attacker: 'The owlbear', target: 'the goblin', detail: 'cinematic', outcome: 'success' },
          { type: 'unarmed', damage: 'piercing', weapon: 'tentacles', attacker: 'The kraken', target: 'the sailor', detail: 'detailed', outcome: 'success' },
          { type: 'unarmed', damage: 'slashing', weapon: 'talons', attacker: 'The griffon', target: 'the wyvern', detail: 'standard', outcome: 'criticalSuccess' },
          { type: 'unarmed', damage: 'piercing', weapon: 'stinger', attacker: 'The giant scorpion', target: 'the adventurer', detail: 'cinematic', outcome: 'success' }
        ]
      },
      {
        category: '✨ SPELL ATTACKS (Spell Category)',
        attacks: [
          { type: 'spell', damage: 'acid', weapon: 'acid splash', attacker: 'Ezren', target: 'the skeleton', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'spell', damage: 'fire', weapon: 'produce flame', attacker: 'The wizard', target: 'the troll', detail: 'detailed', outcome: 'success' },
          { type: 'spell', damage: 'force', weapon: 'disintegrate', attacker: 'Seoni', target: 'the iron golem', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'spell', damage: 'force', weapon: 'magic missile', attacker: 'The sorcerer', target: 'the dragon', detail: 'standard', outcome: 'success' },
          { type: 'spell', damage: 'acid', weapon: 'acid arrow', attacker: 'The arcanist', target: 'the demon', detail: 'cinematic', outcome: 'success' }
        ]
      },
      {
        category: '🔫 FIREARMS (Firearm Category)',
        attacks: [
          { type: 'firearm', damage: 'piercing', weapon: 'flintlock pistol', attacker: 'The gunslinger', target: 'the bandit chief', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'firearm', damage: 'piercing', weapon: 'arquebus', attacker: 'The marksman', target: 'the orc', detail: 'detailed', outcome: 'success' },
          { type: 'firearm', damage: 'piercing', weapon: 'pepperbox', attacker: 'The outlaw', target: 'the sheriff', detail: 'standard', outcome: 'success' },
          { type: 'firearm', damage: 'piercing', weapon: 'hand cannon', attacker: 'The dwarf', target: 'the giant', detail: 'cinematic', outcome: 'success' }
        ]
      },
      {
        category: '💣 ALCHEMICAL BOMBS (Bomb Category)',
        attacks: [
          { type: 'bomb', damage: 'fire', weapon: 'alchemist\'s fire', attacker: 'The alchemist', target: 'the troll', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'bomb', damage: 'acid', weapon: 'acid flask', attacker: 'Fumbus', target: 'the ooze', detail: 'detailed', outcome: 'success' },
          { type: 'bomb', damage: 'fire', weapon: 'bottled lightning', attacker: 'The bomber', target: 'the construct', detail: 'standard', outcome: 'success' },
          { type: 'bomb', damage: 'fire', weapon: 'thunderstone', attacker: 'The grenadier', target: 'the harpy', detail: 'cinematic', outcome: 'success' }
        ]
      },
      {
        category: '🎯 THROWN WEAPONS (Thrown Category)',
        attacks: [
          { type: 'thrown', damage: 'piercing', weapon: 'javelin', attacker: 'The warrior', target: 'the ogre', detail: 'cinematic', outcome: 'success' },
          { type: 'thrown', damage: 'piercing', weapon: 'shuriken', attacker: 'The ninja', target: 'the guard', detail: 'detailed', outcome: 'criticalSuccess' },
          { type: 'thrown', damage: 'piercing', weapon: 'dart', attacker: 'The rogue', target: 'the merchant', detail: 'standard', outcome: 'success' }
        ]
      },
      {
        category: '👹 CREATURE SPECIAL ATTACKS',
        attacks: [
          { type: 'unarmed', damage: 'piercing', weapon: 'proboscis', attacker: 'The giant mosquito', target: 'the horse', detail: 'cinematic', outcome: 'success' },
          { type: 'unarmed', damage: 'slashing', weapon: 'scythe-arms', attacker: 'The mantis demon', target: 'the paladin', detail: 'detailed', outcome: 'criticalSuccess' },
          { type: 'unarmed', damage: 'piercing', weapon: 'mandibles', attacker: 'The giant ant', target: 'the farmer', detail: 'standard', outcome: 'success' },
          { type: 'unarmed', damage: 'slashing', weapon: 'wing blades', attacker: 'The vrock', target: 'the cleric', detail: 'cinematic', outcome: 'success' }
        ]
      },
      {
        category: '🐺 ANIMAL INSTINCT BARBARIAN',
        attacks: [
          { type: 'unarmed', damage: 'piercing', weapon: 'bear jaws', attacker: 'Amiri', target: 'the frost giant', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'unarmed', damage: 'slashing', weapon: 'tiger claws', attacker: 'The barbarian', target: 'the owlbear', detail: 'detailed', outcome: 'success' },
          { type: 'unarmed', damage: 'piercing', weapon: 'wolf jaws', attacker: 'The berserker', target: 'the deer', detail: 'standard', outcome: 'success' }
        ]
      },
      {
        category: '🐉 WILD SHAPE DRUID',
        attacks: [
          { type: 'unarmed', damage: 'slashing', weapon: 'dragon claws', attacker: 'Lini', target: 'the evil wizard', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'unarmed', damage: 'piercing', weapon: 'dinosaur bite', attacker: 'The druid', target: 'the hunter', detail: 'detailed', outcome: 'success' },
          { type: 'unarmed', damage: 'slashing', weapon: 'elemental tendril', attacker: 'The shapeshifter', target: 'the demon', detail: 'cinematic', outcome: 'success' }
        ]
      }
    ];

    examples.forEach(category => {
      console.log('═'.repeat(65));
      console.log(category.category);
      console.log('═'.repeat(65));
      console.log();

      category.attacks.forEach((attack, idx) => {
        const narrative = this.generateNarrative(
          attack.type,
          attack.damage,
          attack.detail,
          attack.outcome,
          attack.weapon,
          attack.attacker,
          attack.target
        );

        console.log(`${idx + 1}. ${attack.attacker} attacking with ${attack.weapon} (${attack.outcome}):`);
        console.log(`   "${narrative}"\n`);
      });

      console.log();
    });

    // Show how same attack type with different weapons works
    console.log('═'.repeat(65));
    console.log('🔄 SAME CATEGORY, DIFFERENT WEAPONS');
    console.log('All use "unarmed" category but with different weapon names');
    console.log('═'.repeat(65));
    console.log();

    const naturalWeapons = [
      { weapon: 'jaws', attacker: 'The wolf' },
      { weapon: 'claws', attacker: 'The bear' },
      { weapon: 'beak', attacker: 'The owlbear' },
      { weapon: 'tentacles', attacker: 'The kraken' },
      { weapon: 'stinger', attacker: 'The scorpion' },
      { weapon: 'horns', attacker: 'The minotaur' },
      { weapon: 'talons', attacker: 'The griffon' },
      { weapon: 'bite', attacker: 'The dragon' }
    ];

    naturalWeapons.forEach((weapon, idx) => {
      const narrative = this.generateNarrative(
        'unarmed',
        'slashing',
        'standard',
        'success',
        weapon.weapon,
        weapon.attacker,
        'the adventurer'
      );

      console.log(`${idx + 1}. ${weapon.weapon}:`);
      console.log(`   "${narrative}"\n`);
    });

    // Show spell variety
    console.log('═'.repeat(65));
    console.log('✨ SPELL ATTACK VARIETY');
    console.log('All use "spell" category but with different spell names');
    console.log('═'.repeat(65));
    console.log();

    const spells = [
      { weapon: 'acid splash', damage: 'acid' },
      { weapon: 'produce flame', damage: 'fire' },
      { weapon: 'ray of frost', damage: 'fire' },
      { weapon: 'disintegrate', damage: 'force' },
      { weapon: 'shocking grasp', damage: 'fire' },
      { weapon: 'acid arrow', damage: 'acid' },
      { weapon: 'scorching ray', damage: 'fire' },
      { weapon: 'polar ray', damage: 'fire' }
    ];

    spells.forEach((spell, idx) => {
      const narrative = this.generateNarrative(
        'spell',
        spell.damage,
        'detailed',
        'success',
        spell.weapon,
        'The wizard',
        'the enemy'
      );

      console.log(`${idx + 1}. ${spell.weapon}:`);
      console.log(`   "${narrative}"\n`);
    });

    // Summary
    console.log('═'.repeat(65));
    console.log('📊 COVERAGE SUMMARY');
    console.log('═'.repeat(65));
    console.log();
    console.log('The system handles ANY attack type by:');
    console.log('  1. Categorizing into one of 12 types (sword, unarmed, spell, etc.)');
    console.log('  2. Using appropriate narrative phrases for that category');
    console.log('  3. Extracting specific weapon/attack name from game data');
    console.log('  4. Inserting the name into the narrative template');
    console.log();
    console.log('This means:');
    console.log('  ✅ Every PF2e weapon works automatically');
    console.log('  ✅ Every natural attack works automatically');
    console.log('  ✅ Every spell attack works automatically');
    console.log('  ✅ Every creature attack works automatically');
    console.log('  ✅ Future content works automatically (no updates needed!)');
    console.log();
    console.log('═'.repeat(65));
    console.log();
  }
}

// Main execution
function main() {
  const generator = new DiverseExampleGenerator();
  generator.generateExamples();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DiverseExampleGenerator };
