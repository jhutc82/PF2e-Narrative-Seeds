/**
 * PF2e Narrative Seeds - Anatomy Detector
 * Detects creature anatomy types from PF2e actors using layered detection system
 */

import { getSortedAnatomyTypes, getSortedModifiers, getAnatomyDefinition, getModifierDefinition } from '../../data/combat/anatomy-types.js';

/**
 * Anatomy detection system with layered base + modifiers architecture
 */
export class AnatomyDetector {

  /**
   * Detect anatomy type for an actor (new layered system)
   * @param {Actor} actor - PF2e actor
   * @returns {Object} Anatomy result with base and modifiers
   *   { base: string, modifiers: string[], anatomyKey: string }
   */
  static detect(actor) {
    if (!actor) {
      console.warn("PF2e Narrative Seeds | No actor provided to anatomy detector");
      return { base: "humanoid", modifiers: [], anatomyKey: "humanoid" };
    }

    // Get actor traits and name
    const traits = this.getActorTraits(actor);
    const name = actor.name?.toLowerCase() || "";

    // Step 1: Detect all matching modifiers
    const modifiers = this.detectModifiers(name, traits);

    // Step 2: Detect base anatomy (excluding modifiers from consideration)
    const base = this.detectBaseAnatomy(name, traits);

    // Log the result
    if (modifiers.length > 0) {
      console.log(`PF2e Narrative Seeds | Anatomy detected: ${base} with modifiers [${modifiers.join(", ")}] for ${actor.name}`);
    } else {
      console.log(`PF2e Narrative Seeds | Anatomy detected: ${base} (no modifiers) for ${actor.name}`);
    }

    // Return layered result
    // anatomyKey is kept for backward compatibility
    return {
      base: base,
      modifiers: modifiers,
      anatomyKey: base  // Primary anatomy type (backward compatible)
    };
  }

  /**
   * Detect all matching modifiers
   * @param {string} name - Lowercase creature name
   * @param {Array<string>} traits - Lowercase traits
   * @returns {Array<string>} Array of modifier keys
   */
  static detectModifiers(name, traits) {
    const modifiers = [];
    const sortedModifiers = getSortedModifiers();

    for (const [key, definition] of sortedModifiers) {
      // Check name matches first (more specific)
      if (definition.nameMatches && definition.nameMatches.length > 0) {
        for (const nameMatch of definition.nameMatches) {
          if (name.includes(nameMatch.toLowerCase())) {
            modifiers.push(key);
            break; // Only add this modifier once
          }
        }
        if (modifiers.includes(key)) continue;
      }

      // Check trait matches
      if (definition.traitMatches && definition.traitMatches.length > 0) {
        for (const traitMatch of definition.traitMatches) {
          if (traits.includes(traitMatch.toLowerCase())) {
            modifiers.push(key);
            break; // Only add this modifier once
          }
        }
      }
    }

    return modifiers;
  }

  /**
   * Detect base anatomy type
   * @param {string} name - Lowercase creature name
   * @param {Array<string>} traits - Lowercase traits
   * @returns {string} Base anatomy key
   */
  static detectBaseAnatomy(name, traits) {
    const sortedTypes = getSortedAnatomyTypes();

    for (const [key, definition] of sortedTypes) {
      // Check name matches first (more specific)
      if (definition.nameMatches && definition.nameMatches.length > 0) {
        for (const nameMatch of definition.nameMatches) {
          if (name.includes(nameMatch.toLowerCase())) {
            return key;
          }
        }
      }

      // Check trait matches
      if (definition.traitMatches && definition.traitMatches.length > 0) {
        for (const traitMatch of definition.traitMatches) {
          if (traits.includes(traitMatch.toLowerCase())) {
            return key;
          }
        }
      }
    }

    // Default fallback
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
   * Get anatomy or modifier display name
   * @param {string} key - Anatomy or modifier key
   * @returns {string}
   */
  static getDisplayName(key) {
    // Check if it's a base anatomy first
    let definition = getAnatomyDefinition(key);
    if (definition) {
      return definition.name;
    }

    // Check if it's a modifier
    definition = getModifierDefinition(key);
    if (definition) {
      return definition.name;
    }

    // Fallback to the key itself
    return key;
  }

  /**
   * Get anatomy or modifier description
   * @param {string} key - Anatomy or modifier key
   * @returns {string}
   */
  static getDescription(key) {
    // Check if it's a base anatomy first
    let definition = getAnatomyDefinition(key);
    if (definition) {
      return definition.description;
    }

    // Check if it's a modifier
    definition = getModifierDefinition(key);
    if (definition) {
      return definition.description;
    }

    return "";
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
