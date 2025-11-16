#!/usr/bin/env node

/**
 * Show Random Attack Examples
 *
 * Generates fresh random examples across different weapon types
 * to demonstrate narrative variety and quality.
 */

import fs from 'fs';
import path from 'path';

class AttackExampleGenerator {
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

    // Load weapon openings
    this.data.sword = JSON.parse(fs.readFileSync('data/combat/openings/melee/sword.json', 'utf8'));
    this.data.axe = JSON.parse(fs.readFileSync('data/combat/openings/melee/axe.json', 'utf8'));
    this.data.bow = JSON.parse(fs.readFileSync('data/combat/openings/ranged/bow.json', 'utf8'));
    this.data.crossbow = JSON.parse(fs.readFileSync('data/combat/openings/ranged/crossbow.json', 'utf8'));
    this.data.unarmed = JSON.parse(fs.readFileSync('data/combat/openings/melee/unarmed.json', 'utf8'));
    this.data.firearm = JSON.parse(fs.readFileSync('data/combat/openings/ranged/firearm.json', 'utf8'));
    this.data.spell = JSON.parse(fs.readFileSync('data/combat/openings/ranged/spell.json', 'utf8'));

    // Load damage types
    this.data.slashing = JSON.parse(fs.readFileSync('data/combat/damage/slashing.json', 'utf8'));
    this.data.piercing = JSON.parse(fs.readFileSync('data/combat/damage/piercing.json', 'utf8'));
    this.data.bludgeoning = JSON.parse(fs.readFileSync('data/combat/damage/bludgeoning.json', 'utf8'));
    this.data.fire = JSON.parse(fs.readFileSync('data/combat/damage/fire.json', 'utf8'));
    this.data.cold = JSON.parse(fs.readFileSync('data/combat/damage/cold.json', 'utf8'));

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

  showExamples() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║              RANDOM ATTACK EXAMPLES                           ║');
    console.log('║          Fresh narratives showing system variety              ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    const scenarios = [
      {
        title: '⚔️  MELEE WEAPONS',
        examples: [
          { type: 'sword', damage: 'slashing', weapon: 'longsword', attacker: 'Valeros', target: 'the goblin warrior', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'sword', damage: 'slashing', weapon: 'rapier', attacker: 'The duelist', target: 'the bandit', detail: 'detailed', outcome: 'success' },
          { type: 'axe', damage: 'slashing', weapon: 'greataxe', attacker: 'Amiri', target: 'the troll', detail: 'cinematic', outcome: 'success' },
          { type: 'axe', damage: 'slashing', weapon: 'battle axe', attacker: 'The dwarf warrior', target: 'the ogre', detail: 'standard', outcome: 'success' },
        ]
      },
      {
        title: '🏹 BOWS & CROSSBOWS',
        examples: [
          { type: 'bow', damage: 'piercing', weapon: 'longbow', attacker: 'The elven archer', target: 'the orc', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'bow', damage: 'piercing', weapon: 'shortbow', attacker: 'The ranger', target: 'the wolf', detail: 'detailed', outcome: 'success' },
          { type: 'bow', damage: 'piercing', weapon: 'composite longbow', attacker: 'Harsk', target: 'the giant', detail: 'cinematic', outcome: 'success' },
          { type: 'crossbow', damage: 'piercing', weapon: 'heavy crossbow', attacker: 'The guard', target: 'the zombie', detail: 'standard', outcome: 'success' },
          { type: 'crossbow', damage: 'piercing', weapon: 'hand crossbow', attacker: 'The assassin', target: 'the merchant', detail: 'detailed', outcome: 'criticalSuccess' },
        ]
      },
      {
        title: '🔫 FIREARMS',
        examples: [
          { type: 'firearm', damage: 'piercing', weapon: 'flintlock pistol', attacker: 'The gunslinger', target: 'the outlaw', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'firearm', damage: 'piercing', weapon: 'arquebus', attacker: 'The marksman', target: 'the bandit chief', detail: 'detailed', outcome: 'success' },
          { type: 'firearm', damage: 'piercing', weapon: 'hand cannon', attacker: 'The dwarf inventor', target: 'the demon', detail: 'cinematic', outcome: 'success' },
          { type: 'firearm', damage: 'piercing', weapon: 'double-barreled pistol', attacker: 'The outlaw', target: 'the sheriff', detail: 'standard', outcome: 'failure' },
        ]
      },
      {
        title: '👊 UNARMED STRIKES',
        examples: [
          { type: 'unarmed', damage: 'bludgeoning', weapon: 'fist', attacker: 'The monk', target: 'the cultist', detail: 'cinematic', outcome: 'success' },
          { type: 'unarmed', damage: 'bludgeoning', weapon: 'elbow strike', attacker: 'Sajan', target: 'the devil', detail: 'detailed', outcome: 'criticalSuccess' },
          { type: 'unarmed', damage: 'bludgeoning', weapon: 'knee', attacker: 'The brawler', target: 'the thug', detail: 'standard', outcome: 'success' },
          { type: 'unarmed', damage: 'bludgeoning', weapon: 'headbutt', attacker: 'The barbarian', target: 'the orc', detail: 'cinematic', outcome: 'success' },
        ]
      },
      {
        title: '🦖 MONSTER NATURAL ATTACKS',
        examples: [
          { type: 'unarmed', damage: 'piercing', weapon: 'bite', attacker: 'The young red dragon', target: 'the knight', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'unarmed', damage: 'slashing', weapon: 'claws', attacker: 'The owlbear', target: 'the adventurer', detail: 'detailed', outcome: 'success' },
          { type: 'unarmed', damage: 'slashing', weapon: 'talons', attacker: 'The griffon', target: 'the wyvern', detail: 'cinematic', outcome: 'success' },
          { type: 'unarmed', damage: 'piercing', weapon: 'horn', attacker: 'The minotaur', target: 'the hero', detail: 'standard', outcome: 'success' },
          { type: 'unarmed', damage: 'bludgeoning', weapon: 'tentacle', attacker: 'The kraken', target: 'the sailor', detail: 'detailed', outcome: 'criticalSuccess' },
        ]
      },
      {
        title: '🧙 SPELL ATTACKS',
        examples: [
          { type: 'spell', damage: 'fire', weapon: 'produce flame', attacker: 'Ezren the wizard', target: 'the troll', detail: 'cinematic', outcome: 'success' },
          { type: 'spell', damage: 'fire', weapon: 'scorching ray', attacker: 'The sorcerer', target: 'the ice elemental', detail: 'detailed', outcome: 'criticalSuccess' },
          { type: 'spell', damage: 'cold', weapon: 'ray of frost', attacker: 'The ice wizard', target: 'the fire elemental', detail: 'cinematic', outcome: 'success' },
          { type: 'spell', damage: 'fire', weapon: 'disintegrate', attacker: 'Seoni', target: 'the iron golem', detail: 'standard', outcome: 'success' },
        ]
      },
      {
        title: '🐉 LARGER CREATURES vs SMALLER TARGETS',
        examples: [
          { type: 'unarmed', damage: 'bludgeoning', weapon: 'massive fist', attacker: 'The hill giant', target: 'the halfling', detail: 'cinematic', outcome: 'success' },
          { type: 'unarmed', damage: 'piercing', weapon: 'enormous jaws', attacker: 'The ancient dragon', target: 'the human', detail: 'cinematic', outcome: 'criticalSuccess' },
          { type: 'unarmed', damage: 'bludgeoning', weapon: 'huge club-like tail', attacker: 'The gorgosaurus', target: 'the goblin', detail: 'detailed', outcome: 'success' },
          { type: 'sword', damage: 'slashing', weapon: 'massive greatsword', attacker: 'The ogre warrior', target: 'the dwarf', detail: 'standard', outcome: 'success' },
        ]
      },
      {
        title: '❌ MISSES & FAILURES',
        examples: [
          { type: 'sword', damage: 'slashing', weapon: 'longsword', attacker: 'The knight', target: 'the nimble rogue', detail: 'detailed', outcome: 'failure' },
          { type: 'bow', damage: 'piercing', weapon: 'longbow', attacker: 'The archer', target: 'the dragon', detail: 'cinematic', outcome: 'failure' },
          { type: 'firearm', damage: 'piercing', weapon: 'pistol', attacker: 'The gunslinger', target: 'the bandit', detail: 'standard', outcome: 'criticalFailure' },
          { type: 'unarmed', damage: 'bludgeoning', weapon: 'fist', attacker: 'The brawler', target: 'the monk', detail: 'detailed', outcome: 'criticalFailure' },
        ]
      }
    ];

    scenarios.forEach(scenario => {
      console.log('═'.repeat(65));
      console.log(scenario.title);
      console.log('═'.repeat(65));
      console.log();

      scenario.examples.forEach((ex, idx) => {
        const narrative = this.generateNarrative(
          ex.type,
          ex.damage,
          ex.detail,
          ex.outcome,
          ex.weapon,
          ex.attacker,
          ex.target
        );

        const outcomeLabel = ex.outcome === 'criticalSuccess' ? '💥 CRITICAL HIT' :
                            ex.outcome === 'success' ? '✓ Hit' :
                            ex.outcome === 'failure' ? '✗ Miss' :
                            '💔 CRITICAL MISS';

        console.log(`${idx + 1}. ${ex.attacker} → ${ex.target} (${ex.weapon}) [${outcomeLabel}]`);
        console.log(`   "${narrative}"\n`);
      });

      console.log();
    });

    // Show variety with same setup
    console.log('═'.repeat(65));
    console.log('🎲 VARIETY DEMONSTRATION');
    console.log('Same attacker, target, weapon - 5 different random narratives');
    console.log('═'.repeat(65));
    console.log();

    console.log('Setup: Valeros attacks the goblin with a longsword (success)\n');

    for (let i = 1; i <= 5; i++) {
      const narrative = this.generateNarrative(
        'sword',
        'slashing',
        'cinematic',
        'success',
        'longsword',
        'Valeros',
        'the goblin'
      );
      console.log(`${i}. "${narrative}"\n`);
    }

    console.log('═'.repeat(65));
    console.log('\n✨ Each narrative is randomly generated from:');
    console.log('   • 20 opening phrases');
    console.log('   • 15 cinematic success templates');
    console.log('   • 24 damage verbs');
    console.log('   • 24 damage effects');
    console.log('   • 243 hit locations');
    console.log(`   = ${(20 * 15 * 24 * 24 * 243).toLocaleString()} possible combinations!\n`);
  }
}

// Main execution
function main() {
  const generator = new AttackExampleGenerator();
  generator.showExamples();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AttackExampleGenerator };
