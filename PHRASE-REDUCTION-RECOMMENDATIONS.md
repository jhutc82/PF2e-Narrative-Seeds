# Phrase Reduction Recommendations

## Executive Summary

Analysis of the PF2e Narrative Seeds data reveals **21.4% reduction potential** by consolidating exact duplicate phrases across anatomy files.

**Current State:**
- 16,327 total phrase instances
- 12,836 unique phrases
- 1,306 duplicated phrases (appearing in multiple files)
- 3,491 duplicate instances that could be eliminated

## Top Duplicates

### Common Locations (Anatomy Files)

These basic body parts appear in 20-38 different anatomy files:

| Phrase | Occurrences | Files |
|--------|-------------|-------|
| "neck" | 38x | 31 files |
| "spine" | 31x | 28 files |
| "skull" | 31x | 29 files |
| "left side" | 30x | 30 files |
| "right side" | 30x | 30 files |
| "left eye" | 26x | 26 files |
| "right eye" | 26x | 26 files |
| "heart" | 23x | 23 files |
| "throat" | 22x | 19 files |
| "vital organs" | 21x | 21 files |
| "brain" | 19x | 19 files |
| "chest" | 19x | 13 files |
| "chest cavity" | 18x | 18 files |
| "ribcage" | 18x | 15 files |
| "kidney" | 17x | 16 files |
| "back" | 17x | 15 files |

### Common Miss Phrases

These miss descriptions appear in 22-32 different anatomy files:

| Phrase | Occurrences | Files |
|--------|-------------|-------|
| "wildly off target" | 32x | 32 files |
| "harmlessly past" | 31x | 31 files |
| "through empty air" | 26x | 21 files |
| "completely missing" | 22x | 22 files |

## Recommendations

### Option 1: Create Shared Location Files (Recommended)

**Approach:** Create shared location files for common body parts that can be inherited by multiple anatomy types.

**Implementation:**
1. Create `data/combat/locations/shared/common-humanoid.json` with basic body parts
2. Create `data/combat/locations/shared/common-quadruped.json` with animal-specific parts
3. Modify DataLoader to load shared locations first, then anatomy-specific
4. Remove duplicates from individual anatomy files

**Benefits:**
- Reduces file size by ~20%
- Easier maintenance (fix once, applies everywhere)
- Consistent naming across anatomies
- Preserves existing variety

**Estimated Time:** 4-6 hours

**Code Changes Required:**
```javascript
// In DataLoader.loadLocationData()
async loadLocationData(anatomyKey, outcome) {
  // Load shared locations first
  const sharedLocations = await this.loadSharedLocations(anatomyKey, outcome);

  // Load anatomy-specific locations
  const specificLocations = await this.loadAnatomySpecificLocations(anatomyKey, outcome);

  // Merge with specific overriding shared
  return [...sharedLocations, ...specificLocations];
}
```

### Option 2: Keep Current Structure (No Changes)

**Rationale:** The duplicates serve a purpose - they ensure every anatomy type has a complete set of hit locations without requiring complex inheritance logic.

**Benefits:**
- No code changes required
- Simpler data structure
- Each anatomy file is self-contained
- No risk of breaking existing functionality

**Drawbacks:**
- 21% larger data files
- Maintenance burden (must update 30+ files for common changes)

## Analysis Details

### Category Breakdown

| Category | Phrase Count |
|----------|--------------|
| Locations | 12,127 |
| Verbs | 2,850 |
| Effects | 1,350 |
| **Total** | **16,327** |

### Cross-File Statistics

- **1,208 phrases** appear in multiple files
- Top duplicate appears in **32 different files**
- Average duplicated phrase appears in **2.9 files**

## Implementation Priority

Given the current module state with recent improvements:

**Priority: LOW-MEDIUM**

**Reasoning:**
1. Template variety system (completed) already multiplies effective variety 10-20x
2. Context-aware filtering (completed) prevents semantic errors
3. The 21% reduction is beneficial but not critical
4. Risk of introducing bugs with data restructuring
5. Development time better spent on new features

**Recommendation:** Defer this optimization unless:
- Data maintenance becomes a significant burden
- File size becomes a performance concern
- New features require this consolidation

## Conclusion

While **21.4% phrase reduction** is achievable through consolidation, the current duplicate structure may be intentional for simplicity. The recent template variety improvements (10-20x multiplier) have already addressed variety concerns more effectively than phrase reduction would.

**Suggested Action:** Document this finding for future consideration, but prioritize new features over data optimization at this time.
