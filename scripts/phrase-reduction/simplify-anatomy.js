#!/usr/bin/env node

/**
 * Simplify Anatomical Locations
 *
 * Replaces medical terminology with accessible, dramatic language
 * that doesn't require medical knowledge to understand.
 */

import fs from 'fs';

const locationFile = 'data/combat/locations/humanoid.json';

// Read current file
const current = JSON.parse(fs.readFileSync(locationFile, 'utf8'));

// Backup original
const backupFile = 'data/combat/locations/_legacy/humanoid.json';
fs.mkdirSync('data/combat/locations/_legacy', { recursive: true });
fs.writeFileSync(backupFile, JSON.stringify(current, null, 2));

// Simplified critical success locations (vital/dramatic hits)
const simplifiedCritical = [
  // Head/Neck (vital)
  "throat",
  "neck",
  "base of the skull",
  "temple",
  "eye",
  "face",

  // Torso (vital organs)
  "heart",
  "chest",
  "upper chest",
  "center of the chest",
  "deep in the chest",
  "vital organs",
  "lung",
  "kidney",
  "liver",
  "stomach",
  "abdomen",
  "gut",

  // Spine/Back
  "spine",
  "lower spine",
  "upper spine",
  "center of the back",

  // Major blood vessels (accessible language)
  "major artery in the neck",
  "major artery in the arm",
  "major artery in the leg",
  "major artery in the thigh",
  "major artery in the groin",
  "main blood vessel in the neck",
  "main blood vessel in the chest",

  // Joints (vulnerable points)
  "knee joint",
  "elbow joint",
  "shoulder joint",
  "hip joint",
  "ankle",

  // Other vital areas
  "groin",
  "inner thigh",
  "armpit",
  "back of the knee",
  "solar plexus",
  "windpipe",
  "collarbone",
  "ribcage",
  "sternum",
  "skull",
  "jaw",
  "nose",
  "bridge of the nose",
  "chin"
];

// Simplified success locations (solid hits, accessible language)
const simplifiedSuccess = [
  // Basic body parts
  "shoulder",
  "left shoulder",
  "right shoulder",
  "chest",
  "upper chest",
  "lower chest",
  "side",
  "left side",
  "right side",
  "back",
  "upper back",
  "lower back",
  "stomach",
  "abdomen",
  "midsection",
  "waist",
  "torso",

  // Arms
  "arm",
  "left arm",
  "right arm",
  "upper arm",
  "left upper arm",
  "right upper arm",
  "forearm",
  "left forearm",
  "right forearm",
  "bicep",
  "left bicep",
  "right bicep",
  "tricep",
  "left tricep",
  "right tricep",
  "elbow",
  "left elbow",
  "right elbow",
  "wrist",
  "left wrist",
  "right wrist",

  // Hands
  "hand",
  "left hand",
  "right hand",
  "palm",
  "left palm",
  "right palm",
  "knuckles",
  "left knuckles",
  "right knuckles",
  "fingers",
  "left fingers",
  "right fingers",
  "thumb",

  // Legs
  "leg",
  "left leg",
  "right leg",
  "thigh",
  "left thigh",
  "right thigh",
  "upper leg",
  "left upper leg",
  "right upper leg",
  "lower leg",
  "left lower leg",
  "right lower leg",
  "knee",
  "left knee",
  "right knee",
  "kneecap",
  "shin",
  "left shin",
  "right shin",
  "calf",
  "left calf",
  "right calf",
  "ankle",
  "left ankle",
  "right ankle",

  // Feet
  "foot",
  "left foot",
  "right foot",
  "heel",
  "toes",

  // Hips/Pelvis
  "hip",
  "left hip",
  "right hip",
  "hip bone",
  "pelvis",
  "groin",
  "inner thigh",
  "outer thigh",

  // Shoulders/Upper back
  "shoulder blade",
  "left shoulder blade",
  "right shoulder blade",
  "shoulder muscle",
  "left shoulder muscle",
  "right shoulder muscle",
  "neck muscle",
  "neck",
  "left neck",
  "right neck",
  "nape",

  // Chest/Abdomen muscles (simplified)
  "chest muscle",
  "left chest muscle",
  "right chest muscle",
  "abdominal muscles",
  "stomach muscles",
  "side muscles",
  "back muscles",
  "flank",
  "left flank",
  "right flank",

  // Leg muscles (simplified)
  "thigh muscle",
  "hamstring",
  "left hamstring",
  "right hamstring",
  "calf muscle",

  // Ribs
  "ribs",
  "ribcage",
  "left ribcage",
  "right ribcage",
  "rib area",
  "side ribs",
  "floating ribs",

  // Head/Face
  "head",
  "crown of head",
  "temple",
  "left temple",
  "right temple",
  "forehead",
  "face",
  "cheek",
  "left cheek",
  "right cheek",
  "cheekbone",
  "left cheekbone",
  "right cheekbone",
  "jaw",
  "left jaw",
  "right jaw",
  "jawline",
  "chin",
  "nose",
  "bridge of nose",
  "ear",
  "left ear",
  "right ear",
  "mouth",
  "lip",
  "brow",
  "left brow",
  "right brow"
];

// Create new structure
const simplified = {
  criticalSuccess: simplifiedCritical,
  success: simplifiedSuccess,
  failure: current.failure,  // Keep as-is (these are fine)
  criticalFailure: current.criticalFailure  // Keep as-is (these are fine)
};

// Write simplified version
fs.writeFileSync(locationFile, JSON.stringify(simplified, null, 2));

console.log('✅ Locations simplified!');
console.log(`\nCritical Success: ${current.criticalSuccess.length} → ${simplifiedCritical.length} locations`);
console.log(`Success: ${current.success.length} → ${simplifiedSuccess.length} locations`);
console.log(`\nRemoved medical terms like:`);
console.log('  - brachial plexus → major artery in the arm');
console.log('  - jejunum → gut');
console.log('  - flexor hallucis longus → foot muscle');
console.log('  - sternocleidomastoid → neck muscle');
console.log(`\nOriginal backed up to: ${backupFile}`);
