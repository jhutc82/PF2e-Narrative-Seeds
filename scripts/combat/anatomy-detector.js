/**
 * PF2e Narrative Seeds - Anatomy Detector
 * Detects creature anatomy types from PF2e actors
 */

import { getSortedAnatomyTypes, getAnatomyDefinition } from '../../data/combat/anatomy-types.js';

/**
 * Anatomy detection system
 */
export class AnatomyDetector {

  /**
   * Detect anatomy type for an actor
   * @param {Actor} actor - PF2e actor
   * @returns {string} Anatomy type key
   */
  static detect(actor) {
    if (!actor) {
      console.warn("PF2e Narrative Seeds | No actor provided to anatomy detector");
      return "humanoid";
    }

    // Get actor traits and name
    const traits = this.getActorTraits(actor);
    const name = actor.name?.toLowerCase() || "";

    // Check each anatomy type in priority order
    const sortedTypes = getSortedAnatomyTypes();

    for (const [key, definition] of sortedTypes) {
      // Check name matches first (more specific)
      if (definition.nameMatches && definition.nameMatches.length > 0) {
        for (const nameMatch of definition.nameMatches) {
          if (name.includes(nameMatch.toLowerCase())) {
            console.log(`PF2e Narrative Seeds | Anatomy detected: ${key} (name match: ${nameMatch})`);
            return key;
          }
        }
      }

      // Check trait matches
      if (definition.traitMatches && definition.traitMatches.length > 0) {
        for (const traitMatch of definition.traitMatches) {
          if (traits.includes(traitMatch.toLowerCase())) {
            console.log(`PF2e Narrative Seeds | Anatomy detected: ${key} (trait match: ${traitMatch})`);
            return key;
          }
        }
      }
    }

    // Default fallback
    console.log(`PF2e Narrative Seeds | Anatomy detected: humanoid (default fallback for ${actor.name})`);
    return "humanoid";
  }

  /**
   * Get actor traits as lowercase array
   * @param {Actor} actor
   * @returns {Array<string>}
   */
  static getActorTraits(actor) {
    const traits = [];

    // Get system traits
    if (actor.system?.traits?.value) {
      traits.push(...actor.system.traits.value);
    }

    // Get traits from items (for some systems)
    if (actor.system?.traits?.traits) {
      traits.push(...actor.system.traits.traits.value);
    }

    // Additional trait sources
    if (actor.system?.details?.creatureType) {
      traits.push(actor.system.details.creatureType);
    }

    // Normalize to lowercase
    return traits.map(t => {
      if (typeof t === 'string') return t.toLowerCase();
      if (typeof t === 'object' && t.value) return t.value.toLowerCase();
      return '';
    }).filter(t => t.length > 0);
  }

  /**
   * Get anatomy display name
   * @param {string} anatomyKey
   * @returns {string}
   */
  static getDisplayName(anatomyKey) {
    const definition = getAnatomyDefinition(anatomyKey);
    return definition ? definition.name : anatomyKey;
  }

  /**
   * Get anatomy description
   * @param {string} anatomyKey
   * @returns {string}
   */
  static getDescription(anatomyKey) {
    const definition = getAnatomyDefinition(anatomyKey);
    return definition ? definition.description : "";
  }

  /**
   * Test detection for debugging
   * @param {Actor} actor
   */
  static debugDetection(actor) {
    console.log("=== Anatomy Detection Debug ===");
    console.log("Actor:", actor.name);
    console.log("Traits:", this.getActorTraits(actor));
    console.log("Detected:", this.detect(actor));
    console.log("==============================");
  }
}
