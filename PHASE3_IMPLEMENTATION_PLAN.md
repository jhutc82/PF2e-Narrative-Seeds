# Phase 3: Skill Actions - Complete Implementation Plan

**Goal**: Build a skill action narrative system with the same robustness, quality, and architectural excellence as Phase 1 (Combat Narration).

---

## Architecture Overview

### Mirroring Phase 1 Design Principles

Phase 1's success came from:
1. ✅ **Modular architecture** - Separate concerns (detection, generation, formatting)
2. ✅ **Data-driven design** - JSON files, not hardcoded logic
3. ✅ **Template variety engine** - 10-20x narrative variety
4. ✅ **Context-aware filtering** - Semantic correctness
5. ✅ **Performance optimization** - Lazy loading, caching, <50ms generation
6. ✅ **Error handling** - User-friendly notifications
7. ✅ **Testing framework** - Comprehensive automated tests

**Phase 3 will replicate ALL of these.**

---

## File Structure

### New Scripts (Mirror Phase 1)

```
scripts/skill/
├── skill-hooks.js                    # Hook into PF2e skill checks (like combat-hooks.js)
├── skill-generator.js                # Main narrative generator (like combat-generator.js)
├── skill-formatter.js                # Format for chat cards (like combat-formatter.js)
├── action-detector.js                # Detect action type (like anatomy-detector.js)
├── feat-detector.js                  # Detect character feats (new concept)
├── skill-data-helpers.js             # Helper functions (like combat-data-helpers.js)
├── skill-memory.js                   # Track skill action history (like combat-memory.js)
└── skill-context-filters.js          # Context-aware filtering (like context-filters.js)
```

### New Data Files (Mirror Phase 1 Structure)

```
data/skill/
├── action-types.js                   # Action definitions (like anatomy-types.js)
├── actions/                          # Individual action files (like locations/)
│   ├── demoralize.json              # Intimidation - Demoralize
│   ├── tumble-through.json          # Acrobatics - Tumble Through
│   ├── grapple.json                 # Athletics - Grapple
│   ├── trip.json                    # Athletics - Trip
│   ├── shove.json                   # Athletics - Shove
│   ├── disarm.json                  # Athletics - Disarm
│   ├── feint.json                   # Deception - Feint
│   ├── create-diversion.json        # Deception - Create Diversion
│   ├── hide.json                    # Stealth - Hide
│   ├── sneak.json                   # Stealth - Sneak
│   ├── escape.json                  # Athletics/Acrobatics - Escape
│   ├── climb.json                   # Athletics - Climb
│   ├── swim.json                    # Athletics - Swim
│   ├── high-jump.json               # Athletics - High Jump
│   ├── long-jump.json               # Athletics - Long Jump
│   ├── balance.json                 # Acrobatics - Balance
│   ├── force-open.json              # Athletics - Force Open
│   ├── recall-knowledge.json        # Any knowledge skill
│   ├── steal.json                   # Thievery - Steal
│   ├── palm-object.json             # Thievery - Palm an Object
│   ├── pick-lock.json               # Thievery - Pick a Lock
│   ├── disable-device.json          # Thievery - Disable Device
│   ├── request.json                 # Diplomacy - Request
│   ├── command-animal.json          # Nature - Command Animal
│   └── perform.json                 # Performance - Perform
├── feats/                           # Feat modifiers (NEW CONCEPT)
│   ├── intimidating-glare.json      # Visual intimidation
│   ├── battle-cry.json              # Initiative intimidation
│   ├── intimidating-prowess.json    # Physical intimidation
│   ├── titan-wrestler.json          # Size modifications
│   ├── quick-jump.json              # Jump speed/grace
│   ├── combat-climber.json          # Combat climbing
│   ├── quick-swim.json              # Swimming speed
│   ├── kip-up.json                  # Standing with style
│   ├── lengthy-diversion.json       # Extended diversion
│   ├── confabulator.json            # Reduced crit fails
│   ├── cloud-jump.json              # Auto-success jumps
│   ├── swift-sneak.json             # Full-speed stealth
│   ├── terrain-stalker.json         # Terrain stealth
│   └── pickpocket.json              # Observed theft
├── outcomes/                        # Generic outcome templates
│   ├── critical-success.json        # Universal crit success phrases
│   ├── success.json                 # Universal success phrases
│   ├── failure.json                 # Universal failure phrases
│   └── critical-failure.json        # Universal crit failure phrases
├── contexts/                        # Context modifiers
│   ├── combat.json                  # In-combat context
│   ├── exploration.json             # Out-of-combat context
│   └── environmental.json           # Weather, terrain, etc.
└── skill-data.js                    # Master data loader (like combat data loader)
```

### Integration with Existing Systems

**Reuse Phase 1 infrastructure:**
- ✅ `scripts/data-loader.js` - Lazy loading with caching
- ✅ `scripts/utils.js` - PF2eUtils, RandomUtils
- ✅ `scripts/performance-monitor.js` - Performance tracking
- ✅ `scripts/combat/template-engine.js` - Template variety (reusable!)
- ✅ Settings system pattern

---

## Data Structure Design

### Action Data File Example: `demoralize.json`

```json
{
  "action": "demoralize",
  "actionName": "Demoralize",
  "skill": "intimidation",
  "traits": ["auditory", "concentrate", "emotion", "mental"],
  "description": "Frighten a foe with threats",

  "variants": {
    "default": {
      "displayName": "Demoralize",
      "narratives": {
        "minimal": {
          "criticalSuccess": [
            "You terrify {targetName}!",
            "You break {targetName}'s nerve!",
            "{targetName} recoils in fear!"
          ],
          "success": [
            "You unnerve {targetName}.",
            "You intimidate {targetName}.",
            "{targetName} hesitates."
          ],
          "failure": [
            "{targetName} isn't impressed.",
            "Your threat falls flat.",
            "{targetName} stands firm."
          ],
          "criticalFailure": [
            "{targetName} laughs at you!",
            "Your intimidation backfires!",
            "You look foolish!"
          ]
        },
        "standard": {
          "criticalSuccess": [
            "You unleash a fearsome threat that breaks {targetName}'s nerve completely!",
            "Your intimidating display sends {targetName} reeling backward in terror!",
            "{targetName} staggers, face pale with fear at your menacing presence!"
          ],
          "success": [
            "You bellow a threatening warning that makes {targetName} hesitate.",
            "Your menacing words catch {targetName}'s attention, making them nervous.",
            "{targetName} flinches at your intimidating display."
          ],
          "failure": [
            "You try to intimidate {targetName}, but they're unimpressed by your threats.",
            "Your threatening words don't seem to affect {targetName}.",
            "{targetName} stands firm against your intimidation attempt."
          ],
          "criticalFailure": [
            "Your clumsy intimidation attempt makes {targetName} laugh derisively!",
            "{targetName} mocks your failed threat, emboldening them further!",
            "Your intimidation backfires spectacularly - {targetName} seems amused!"
          ]
        },
        "detailed": {
          "criticalSuccess": [
            "Your voice thunders with raw menace as you lock eyes with {targetName}. They stumble backward, terror etched across their face, completely shaken by the primal fear you've invoked!",
            "You unleash a fearsome war cry that resonates with pure dominance. {targetName}'s composure shatters entirely - they pale, hands trembling as the weight of your threat crashes over them!",
            "Stepping forward with aggressive intent, you deliver a bone-chilling threat. {targetName}'s bravado crumbles instantly, replaced by wide-eyed panic as they realize the danger they face!"
          ],
          "success": [
            "You growl a menacing warning through gritted teeth. {targetName} takes an involuntary step back, their confidence clearly shaken by your display.",
            "Your intimidating words carry undeniable weight. {targetName}'s eyes dart nervously as they reassess the situation, no longer quite so certain.",
            "With a threatening gesture, you make your intentions crystal clear. {targetName} swallows hard, visibly unnerved by your aggressive posture."
          ],
          "failure": [
            "You try to project menace, but your words lack the conviction needed. {targetName} barely reacts, their confidence unshaken.",
            "Your attempted intimidation comes across as forced and hollow. {targetName} meets your gaze steadily, unimpressed.",
            "Despite your best efforts to seem threatening, {targetName} doesn't seem particularly concerned by your display."
          ],
          "criticalFailure": [
            "Your attempt at intimidation is so poorly delivered that {targetName} actually laughs out loud! Their mocking response emboldens them, making them more confident than before!",
            "You stumble over your threatening words, voice cracking embarrassingly. {targetName} grins wickedly, your failed intimidation only fueling their courage!",
            "Your aggressive display backfires completely - you overcommit and nearly lose your balance. {targetName} smirks at your clumsiness, clearly not taking you seriously now!"
          ]
        },
        "cinematic": {
          "criticalSuccess": [
            "The very air seems to chill as you channel pure, predatory menace. Your eyes burn with lethal promise as your words drip with inevitable violence. {targetName}'s blood turns to ice - their hands shake uncontrollably, breath coming in ragged gasps as primal terror overrides all reason. They know, with absolute certainty, that they are prey before a apex predator.",
            "Your battle cry tears through the chaos like the roar of an ancient dragon - raw, primal, absolutely dominant. The sound reverberates in {targetName}'s very bones. Their face drains of all color as their legs nearly give out beneath them. This isn't mere intimidation - it's the recognition of overwhelming, unstoppable force!",
            "You become death incarnate in this moment. Each word falls like a hammer blow of doom. Each step forward radiates inexorable violence. {targetName}'s courage doesn't just falter - it shatters completely. Their weapon wavers as their nerve breaks, consumed by the terrible certainty that they face something far beyond their ability to resist!"
          ],
          "success": [
            "Menace radiates from your every word and gesture like heat from a forge. {targetName}'s confidence visibly wavers - their stance shifts defensively, uncertainty creeping into their eyes. They're not broken, but they're definitely concerned now.",
            "You unleash a threat laden with dark promise and undeniable conviction. The shift in {targetName}'s demeanor is immediate - jaw tightening, eyes narrowing, a slight backward step betraying their sudden unease. Your message has been received.",
            "Your intimidating display combines aggressive body language with perfectly chosen words of menace. {targetName} tries to maintain composure, but you catch the telltale signs - the white knuckles, the tense shoulders, the quick glance assessing escape routes. They're rattled."
          ],
          "failure": [
            "You attempt to project overwhelming menace, but something in your delivery rings hollow. {targetName}'s eyes remain steady, their stance unchanged. Your threat, for all its bluster, lacks the teeth to give them pause.",
            "Despite drawing on every ounce of intimidating presence you can muster, {targetName} seems frustratingly unmoved. They meet your threatening gaze with calm indifference, secure in whatever reserves of courage or foolishness keep them fearless.",
            "Your words of menace fall on surprisingly unimpressed ears. {targetName} doesn't even bother responding - their casual dismissal of your intimidation attempt stinging more than outright mockery would."
          ],
          "criticalFailure": [
            "In trying to project overwhelming dominance, you instead reveal the desperation beneath your bravado. {targetName}'s eyes light up with predatory glee as they recognize your fear dressed up as aggression. Your voice cracks mid-threat, destroying any credibility. They actually smile - you've just shown them weakness!",
            "Your attempted intimidation is so transparently overplayed that it has the opposite effect entirely. {targetName} bursts into genuine laughter at your theatrical display. Worse, their mocking sets your cheeks burning with humiliation, and everyone watching knows your threatening words were empty posturing!",
            "You commit so hard to your menacing advance that you literally trip over your own feet! Stumbling awkwardly, you have to catch yourself to avoid falling. {targetName}'s expression shifts from caution to open amusement - any fear they might have felt is now replaced with the certainty that you're more danger to yourself than to them!"
          ]
        }
      }
    },

    "feats": {
      "intimidating-glare": {
        "displayName": "Demoralize (Intimidating Glare)",
        "traits": ["concentrate", "emotion", "mental", "visual"],
        "narratives": {
          "minimal": {
            "criticalSuccess": [
              "Your glare terrifies {targetName}!",
              "Your stare breaks {targetName}!",
              "{targetName} freezes under your gaze!"
            ],
            "success": [
              "Your glare unnerves {targetName}.",
              "Your stare intimidates {targetName}.",
              "{targetName} flinches from your gaze."
            ],
            "failure": [
              "{targetName} meets your stare.",
              "Your glare has no effect.",
              "{targetName} isn't fazed."
            ],
            "criticalFailure": [
              "{targetName} stares back defiantly!",
              "Your glare fails completely!",
              "{targetName} seems amused!"
            ]
          },
          "standard": {
            "criticalSuccess": [
              "Your withering glare freezes {targetName} in place - terror visible in their wide eyes!",
              "You lock eyes with {targetName}, radiating pure menace. They stumble backward, unable to meet your gaze!",
              "Your piercing stare conveys such unmistakable threat that {targetName} goes pale, completely intimidated!"
            ],
            "success": [
              "Your cold, predatory stare makes {targetName} visibly uncomfortable.",
              "You fix {targetName} with an intimidating glare that makes them hesitate nervously.",
              "{targetName} flinches under your intense, menacing gaze."
            ],
            "failure": [
              "You try to intimidate {targetName} with your stare, but they don't seem affected.",
              "Your menacing glare doesn't quite land - {targetName} meets your eyes steadily.",
              "{targetName} isn't bothered by your intimidating look."
            ],
            "criticalFailure": [
              "{targetName} stares right back at you, completely unimpressed by your glare!",
              "Your attempted intimidating stare just looks awkward - {targetName} smirks!",
              "You try to lock eyes menacingly, but {targetName} dismisses you with a laugh!"
            ]
          },
          "detailed": {
            "criticalSuccess": [
              "Your eyes become twin pools of absolute menace as you fix {targetName} with an unblinking predator's stare. No words are needed - the threat in your gaze is crystal clear. {targetName}'s breath catches, face draining of color as they're pinned by your withering glare!",
              "You lock eyes with {targetName}, your expression a masterwork of silent threat. Every ounce of danger you represent crystallizes in that look. They actually stumble backward, unable to hold your gaze, thoroughly cowed by the intensity of your intimidating stare!",
              "Your piercing gaze cuts through {targetName} like a blade. In your eyes they see their own defeat reflected back, inevitable and inescapable. The sheer weight of your silent menace breaks their nerve completely - they pale, trembling under your unrelenting stare!"
            ],
            "success": [
              "You fix {targetName} with a cold, calculating stare that speaks volumes without a single word. They shift uncomfortably under your predatory gaze, visibly unnerved.",
              "Your eyes narrow to dangerous slits as you bore into {targetName} with an intimidating glare. They break eye contact quickly, clearly rattled by the silent threat.",
              "With practiced menace, you lock eyes with {targetName}. Your unblinking stare radiates threat. They swallow hard, unable to fully meet your gaze."
            ],
            "failure": [
              "You try to pin {targetName} with an intimidating stare, but your silent threat doesn't seem to register. They meet your eyes with confidence.",
              "Despite your best effort at a menacing glare, {targetName} appears unmoved. Your silent intimidation lacks the impact you'd hoped for.",
              "You fix {targetName} with what you intend as a withering look, but they don't seem particularly concerned by your wordless threat."
            ],
            "criticalFailure": [
              "You attempt to project overwhelming menace through your stare alone, but something in your expression misses the mark entirely. {targetName} actually laughs at your intense look, mocking your silent attempt at intimidation!",
              "Your trying-too-hard glare comes across as more comical than menacing. {targetName} meets your eyes and grins, clearly not taking your wordless threat seriously at all!",
              "You lock eyes with {targetName}, trying to channel pure menace, but end up holding the stare so long it becomes awkward. When you finally blink, they smirk - your intimidation attempt has become a joke!"
            ]
          },
          "cinematic": {
            "criticalSuccess": [
              "Time seems to slow as you turn your gaze upon {targetName}. Your eyes become twin abysses of pitiless, predatory intent - windows into something ancient and utterly merciless. The temperature seems to drop. Sound fades. There is only your stare and the prey it has marked. {targetName}'s entire body goes rigid with primal terror. Their weapon trembles in nerveless fingers. They cannot look away, cannot move, transfixed like a rabbit before a serpent. In your eyes, they see their own death, patient and certain.",
              "Your expression shifts into something inhuman - a perfect mask of emotionless, inevitable violence. As your eyes lock onto {targetName}, they burn with cold fire, promising suffering beyond words. The message is absolutely clear without a single syllable: resistance is futile, mercy is impossible, and their fate is sealed. {targetName} actually gasps, stumbling backward as their legs nearly give out. The sheer force of personality behind your stare has broken something fundamental in them!",
              "You become a living monument to menace, and your eyes are its terrible altar. When you fix {targetName} with your gaze, it's not just intimidation - it's revelation. In one crystalline moment, your stare strips away all their courage, all their bravado, all their defiance, leaving only naked truth: they are facing something far beyond their ability to resist. The certainty in your predatory glare is absolute. {targetName} makes a small, broken sound as terror floods through them, every survival instinct screaming to flee!"
            ],
            "success": [
              "Your eyes become chips of ice, reflecting no warmth, no hesitation, only calculated threat. As you lock onto {targetName}, your stare carries weight - the pressure of controlled violence barely restrained. They feel it like a physical force. Their confident posture wavers. Their breathing quickens slightly. They cannot quite hold your gaze. The silent message is received: they should be very, very careful.",
              "You channel every ounce of menace into a single, unwavering stare. Your expression is perfectly controlled - no bluster, no theatrics, just the cold certainty of a predator evaluating prey. {targetName} meets your eyes for a moment, then looks away, jaw tightening. They try to hide it, but you've seen the flicker of uncertainty, the moment of doubt. Your wordless intimidation has found its mark.",
              "Your gaze transforms into something piercing and relentless, boring into {targetName} with uncomfortable intensity. You don't need to speak - your eyes communicate volumes of threat and dark promise. {targetName}'s composure cracks visibly. A slight step backward. A tensing of shoulders. They're rattled, and everyone can see it. Your silent dominance has asserted itself."
            ],
            "failure": [
              "You summon your most intimidating glare, trying to project overwhelming menace through sheer force of personality. But {targetName} meets your stare with surprising steadiness. Whatever you're trying to communicate with your eyes, they're not receiving - or perhaps not caring. Your silent threat fails to land.",
              "Despite your best efforts to intimidate through pure ocular intensity, {targetName} seems frustratingly unbothered. They hold your gaze without flinching, their expression calm and unmoved. Your wordless attempt at dominance breaks against the wall of their composure.",
              "You fix {targetName} with what you intend as a bone-chilling stare, but something doesn't quite work. Maybe your expression isn't quite right, or maybe they're simply made of sterner stuff than you anticipated. Either way, your silent intimidation passes over them like water off a duck's back."
            ],
            "criticalFailure": [
              "You attempt to channel pure malevolence through your gaze alone, trying to cow {targetName} with the sheer force of your stare. But something goes terribly wrong. Your expression, meant to be terrifying, instead looks strained and slightly desperate. {targetName}'s eyes widen - not in fear, but in genuine surprise - and then they laugh. Actually laugh! The sound cuts through any remaining credibility your intimidation attempt might have had. Worse, others are looking now, witnessing your failed staring contest. Your cheeks burn with humiliation!",
              "You lock eyes with {targetName}, pouring every ounce of intimidation into your wordless glare. You hold it... and hold it... and keep holding it. But they don't break. They don't even blink. Instead, they raise an eyebrow quizzically. Then they smile - a genuine, amused smile. Your intense stare has become awkward. When you finally break eye contact, thoroughly defeated, {targetName} actually chuckles. Your attempt at silent dominance has backfired spectacularly!",
              "In your attempt to project overwhelming menace through pure visual intensity, you unconsciously widen your eyes, lean forward slightly, and adopt what you think is a terrifying expression. Unfortunately, {targetName} doesn't see terrifying - they see ridiculous. A snort of laughter escapes them before they can stop it. Your fearsome glare has become comedy. The mocking light in their eyes makes it clear: not only are they not intimidated, they're actively enjoying watching you try and fail to seem scary!"
            ]
          }
        }
      },

      "battle-cry": {
        "displayName": "Demoralize (Battle Cry)",
        "context": "combat-start",
        "narratives": {
          "standard": {
            "criticalSuccess": [
              "Your war cry echoes across the battlefield as combat begins, sending {targetName} reeling in terror!",
              "You unleash a fearsome battle shout that breaks {targetName}'s nerve before the fighting even starts!",
              "Your opening roar shakes {targetName} to their core - they pale with fear!"
            ],
            "success": [
              "Your battle cry catches {targetName}'s attention as combat starts, making them hesitate.",
              "You bellow a war shout that clearly rattles {targetName}'s confidence.",
              "Your opening intimidation makes {targetName} uncertain as the fight begins."
            ]
          }
        }
      },

      "intimidating-prowess": {
        "displayName": "Demoralize (Intimidating Prowess)",
        "modifierNote": "Uses Strength if higher than Charisma",
        "narratives": {
          "standard": {
            "criticalSuccess": [
              "You loom over {targetName} with overwhelming physical menace - they stagger backward in terror!",
              "The raw threat of your imposing presence completely breaks {targetName}'s will!",
              "Your powerful frame radiates such danger that {targetName} goes pale with fear!"
            ],
            "success": [
              "You use your imposing stature to intimidate {targetName}, making them nervous.",
              "Your physical presence conveys unmistakable threat - {targetName} hesitates.",
              "You loom menacingly over {targetName}, clearly unnerving them."
            ]
          }
        }
      }
    }
  }
}
```

---

## Detection Systems

### action-detector.js (Mirrors anatomy-detector.js)

```javascript
/**
 * Skill Action Detector
 * Detects which skill action was used from PF2e message flags
 */

export class ActionDetector {

  /**
   * Detect action from message
   * @param {ChatMessage} message
   * @returns {string|null} Action slug (e.g., "demoralize", "tumble-through")
   */
  static detectAction(message) {
    const flags = message.flags?.pf2e;
    if (!flags) return null;

    const context = flags.context;
    if (!context) return null;

    // Method 1: Check context.action directly
    if (context.action) {
      return this.normalizeActionSlug(context.action);
    }

    // Method 2: Check context.options array for action: prefix
    if (context.options && Array.isArray(context.options)) {
      const actionOption = context.options.find(opt =>
        opt.startsWith("action:")
      );

      if (actionOption) {
        return this.normalizeActionSlug(
          actionOption.replace("action:", "")
        );
      }
    }

    // Method 3: Check message item directly
    const item = flags.origin?.uuid;
    if (item) {
      return this.detectActionFromItem(item);
    }

    return null;
  }

  /**
   * Normalize action slug to consistent format
   * @param {string} slug
   * @returns {string}
   */
  static normalizeActionSlug(slug) {
    return slug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-');
  }

  /**
   * Check if message is a skill action
   * @param {ChatMessage} message
   * @returns {boolean}
   */
  static isSkillAction(message) {
    const action = this.detectAction(message);
    return action !== null;
  }

  /**
   * Get skill used for action
   * @param {ChatMessage} message
   * @returns {string|null}
   */
  static getSkill(message) {
    const context = message.flags?.pf2e?.context;
    if (!context) return null;

    // Try multiple possible locations
    return context.skill ||
           context.statistic ||
           context.skillName ||
           null;
  }

  /**
   * Get action traits
   * @param {string} actionSlug
   * @returns {Array<string>}
   */
  static getActionTraits(actionSlug) {
    const actionData = this.getActionData(actionSlug);
    return actionData?.traits || [];
  }

  /**
   * Debug action detection
   * @param {ChatMessage} message
   */
  static debugDetection(message) {
    console.group("🎯 Skill Action Detection Debug");

    const action = this.detectAction(message);
    console.log("Action detected:", action);

    const skill = this.getSkill(message);
    console.log("Skill used:", skill);

    const traits = action ? this.getActionTraits(action) : [];
    console.log("Action traits:", traits);

    console.log("Full flags:", message.flags?.pf2e);

    console.groupEnd();
  }
}
```

### feat-detector.js (NEW - Unique to Phase 3)

```javascript
/**
 * Feat Detector
 * Detects character feats that modify skill actions
 */

export class FeatDetector {

  // Cache of actor feats for performance
  static featCache = new Map();
  static CACHE_TIMEOUT = 60000; // 1 minute

  /**
   * Detect feats from message
   * @param {ChatMessage} message
   * @param {string} actionSlug
   * @returns {Array<string>} Array of feat slugs
   */
  static detectFeats(message, actionSlug) {
    const actor = this.getActorFromMessage(message);
    if (!actor) return [];

    // Get relevant feats for this action
    const relevantFeats = this.getRelevantFeats(actionSlug);

    // Check which ones actor has
    const actorFeats = this.getActorFeats(actor);

    return relevantFeats.filter(feat =>
      actorFeats.has(feat)
    );
  }

  /**
   * Get actor from message
   * @param {ChatMessage} message
   * @returns {Actor|null}
   */
  static getActorFromMessage(message) {
    const actorId = message.speaker?.actor;
    if (!actorId) return null;

    return game.actors.get(actorId);
  }

  /**
   * Get actor's feats (cached)
   * @param {Actor} actor
   * @returns {Set<string>} Set of feat slugs
   */
  static getActorFeats(actor) {
    const cacheKey = actor.id;
    const cached = this.featCache.get(cacheKey);

    // Check cache
    if (cached && Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
      return cached.feats;
    }

    // Build feat set
    const feats = new Set();

    for (const item of actor.items) {
      if (item.type === 'feat') {
        const slug = this.normalizeFeatSlug(item.slug || item.name);
        feats.add(slug);
      }
    }

    // Cache it
    this.featCache.set(cacheKey, {
      feats: feats,
      timestamp: Date.now()
    });

    return feats;
  }

  /**
   * Get feats relevant to an action
   * @param {string} actionSlug
   * @returns {Array<string>}
   */
  static getRelevantFeats(actionSlug) {
    const featMap = {
      'demoralize': [
        'intimidating-glare',
        'battle-cry',
        'intimidating-prowess',
        'terrified-retreat',
        'scare-to-death'
      ],
      'tumble-through': [
        'assurance-acrobatics'
      ],
      'grapple': [
        'titan-wrestler',
        'assurance-athletics'
      ],
      'trip': [
        'titan-wrestler',
        'assurance-athletics'
      ],
      'shove': [
        'titan-wrestler',
        'assurance-athletics'
      ],
      'disarm': [
        'titan-wrestler',
        'assurance-athletics'
      ],
      'high-jump': [
        'quick-jump',
        'powerful-leap',
        'cloud-jump',
        'assurance-athletics'
      ],
      'long-jump': [
        'quick-jump',
        'powerful-leap',
        'cloud-jump',
        'assurance-athletics'
      ],
      'climb': [
        'combat-climber',
        'assurance-athletics'
      ],
      'swim': [
        'quick-swim',
        'assurance-athletics'
      ],
      'hide': [
        'terrain-stalker',
        'assurance-stealth'
      ],
      'sneak': [
        'swift-sneak',
        'terrain-stalker',
        'assurance-stealth'
      ],
      'feint': [
        'confabulator',
        'assurance-deception'
      ],
      'create-diversion': [
        'lengthy-diversion',
        'confabulator',
        'assurance-deception'
      ],
      'balance': [
        'steady-balance',
        'assurance-acrobatics'
      ],
      'escape': [
        'assurance-acrobatics',
        'assurance-athletics'
      ],
      'steal': [
        'pickpocket',
        'subtle-theft',
        'assurance-thievery'
      ],
      'palm-object': [
        'pickpocket',
        'subtle-theft',
        'assurance-thievery'
      ]
    };

    return featMap[actionSlug] || [];
  }

  /**
   * Normalize feat slug
   * @param {string} slug
   * @returns {string}
   */
  static normalizeFeatSlug(slug) {
    return slug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/[()]/g, '');
  }

  /**
   * Check if actor has specific feat
   * @param {Actor} actor
   * @param {string} featSlug
   * @returns {boolean}
   */
  static hasFeat(actor, featSlug) {
    const feats = this.getActorFeats(actor);
    return feats.has(this.normalizeFeatSlug(featSlug));
  }

  /**
   * Clear feat cache for actor
   * @param {Actor} actor
   */
  static clearCache(actor = null) {
    if (actor) {
      this.featCache.delete(actor.id);
    } else {
      this.featCache.clear();
    }
  }

  /**
   * Debug feat detection
   * @param {Actor} actor
   * @param {string} actionSlug
   */
  static debugDetection(actor, actionSlug) {
    console.group("🎖️ Feat Detection Debug");

    console.log("Actor:", actor.name);
    console.log("Action:", actionSlug);

    const allFeats = this.getActorFeats(actor);
    console.log("All actor feats:", Array.from(allFeats));

    const relevantFeats = this.getRelevantFeats(actionSlug);
    console.log("Relevant feats for action:", relevantFeats);

    const detectedFeats = relevantFeats.filter(feat => allFeats.has(feat));
    console.log("Detected feats:", detectedFeats);

    console.groupEnd();
  }
}
```

---

## Generator Architecture

### skill-generator.js (Mirrors combat-generator.js)

```javascript
/**
 * Skill Narrative Generator
 * Generates contextual narratives for skill actions
 */

import { ActionDetector } from './action-detector.js';
import { FeatDetector } from './feat-detector.js';
import { TemplateEngine } from '../combat/template-engine.js';
import { DataLoader } from '../data-loader.js';
import { RandomUtils } from '../utils.js';
import { PerformanceMonitor } from '../performance-monitor.js';
import { SkillMemory } from './skill-memory.js';

export class SkillNarrativeGenerator {

  constructor() {
    this.templateEngine = new TemplateEngine();
    this.memory = new SkillMemory();
  }

  /**
   * Generate narrative for skill action
   * @param {Object} skillData - {message, action, skill, outcome, actor, target}
   * @returns {Promise<Object>} Generated narrative data
   */
  async generate(skillData) {
    const timer = PerformanceMonitor.start('skill-narrative-generation');

    try {
      // Extract data
      const { message, action, skill, outcome, actor, target } = skillData;

      // Detect feats
      const feats = FeatDetector.detectFeats(message, action);

      // Load action data
      const actionData = await DataLoader.load(`skill/actions/${action}.json`);
      if (!actionData) {
        console.warn(`No data found for action: ${action}`);
        return null;
      }

      // Determine which variant to use
      const variant = this.selectVariant(actionData, feats);

      // Get detail level
      const detailLevel = this.getDetailLevel();

      // Get narratives for this outcome
      const narratives = variant.narratives[detailLevel]?.[outcome];
      if (!narratives || narratives.length === 0) {
        console.warn(`No narratives for ${action} at ${detailLevel}/${outcome}`);
        return null;
      }

      // Select narrative (with variety tracking)
      const template = this.selectNarrativeWithVariety(
        narratives,
        action,
        outcome
      );

      // Build interpolation context
      const context = this.buildContext(skillData, variant, feats);

      // Interpolate template
      const text = this.templateEngine.interpolate(template, context);

      // Track usage
      this.memory.recordAction(actor, action, outcome);

      PerformanceMonitor.end(timer);

      return {
        text: text,
        action: action,
        skill: skill,
        outcome: outcome,
        variant: variant.displayName,
        feats: feats,
        detailLevel: detailLevel
      };

    } catch (error) {
      console.error("Skill narrative generation failed:", error);
      PerformanceMonitor.end(timer);
      return null;
    }
  }

  /**
   * Select variant based on feats
   * @param {Object} actionData
   * @param {Array<string>} feats
   * @returns {Object}
   */
  selectVariant(actionData, feats) {
    // Check for feat-specific variants
    if (feats.length > 0 && actionData.variants.feats) {
      for (const feat of feats) {
        if (actionData.variants.feats[feat]) {
          return actionData.variants.feats[feat];
        }
      }
    }

    // Fall back to default
    return actionData.variants.default;
  }

  /**
   * Get detail level from settings
   * @returns {string}
   */
  getDetailLevel() {
    return game.settings.get("pf2e-narrative-seeds", "skillDetailLevel") || "standard";
  }

  /**
   * Select narrative with variety tracking
   * @param {Array<string>} narratives
   * @param {string} action
   * @param {string} outcome
   * @returns {string}
   */
  selectNarrativeWithVariety(narratives, action, outcome) {
    const cacheKey = `${action}-${outcome}`;
    return RandomUtils.selectWithVariety(narratives, cacheKey);
  }

  /**
   * Build interpolation context
   * @param {Object} skillData
   * @param {Object} variant
   * @param {Array<string>} feats
   * @returns {Object}
   */
  buildContext(skillData, variant, feats) {
    const { actor, target, action, skill } = skillData;

    return {
      actorName: actor?.name || "Someone",
      targetName: target?.name || "the target",
      actionName: variant.displayName || action,
      skillName: skill,
      feats: feats.join(', ')
    };
  }
}
```

---

## Data Volume Estimation

### Per Action (25 actions)

**Single Action Example (Demoralize):**
- Default variant: 4 outcomes × 4 detail levels × ~15 phrases = **240 phrases**
- Intimidating Glare: 4 outcomes × 4 detail levels × ~12 phrases = **192 phrases**
- Battle Cry: 4 outcomes × 2 detail levels × ~8 phrases = **64 phrases**
- Intimidating Prowess: 4 outcomes × 2 detail levels × ~8 phrases = **64 phrases**
- **Total per action: ~560 phrases**

**All 25 Actions:**
- Not all actions have 3-4 feat variants
- Average ~300 phrases per action (simpler actions)
- **Total: ~7,500 phrases** across all skill actions

**Comparison to Phase 1:**
- Phase 1: ~12,000 lines across 50 anatomy types
- Phase 3: ~7,500 phrases across 25 actions
- Similar scale, manageable scope

---

## Settings Integration

### New Settings (Mirror Combat Settings)

```javascript
// Enable skill narration
game.settings.register("pf2e-narrative-seeds", "enableSkills", {
  name: "Enable Skill Action Narration",
  hint: "Generate descriptions for skill actions in encounter mode",
  scope: "world",
  config: true,
  type: Boolean,
  default: true,
  onChange: value => {
    ui.notifications.info("Skill narration " + (value ? "enabled" : "disabled") + ". Reload required.");
  }
});

// Skill detail level
game.settings.register("pf2e-narrative-seeds", "skillDetailLevel", {
  name: "Skill Detail Level",
  hint: "How much information to include",
  scope: "world",
  config: true,
  type: String,
  choices: {
    "minimal": "Minimal (Quick description)",
    "standard": "Standard (Balanced)",
    "detailed": "Detailed (Full description)",
    "cinematic": "Cinematic (Maximum drama)"
  },
  default: "standard"
});

// Show detected feats
game.settings.register("pf2e-narrative-seeds", "showDetectedFeats", {
  name: "Show Detected Feats",
  hint: "Display which feats were detected in narrative output",
  scope: "world",
  config: true,
  type: Boolean,
  default: false
});
```

---

## Integration with main.js

```javascript
// Phase 3: Skills
if (NarrativeSeedsSettings.get("enableSkills")) {
  console.log("PF2e Narrative Seeds | Initializing skill narration...");
  SkillHooks.initialize();
  this.generators.set("skills", SkillHooks);
}
```

---

## Testing Framework

### skill-action-tests.js (Mirror combat tests)

```javascript
/**
 * Skill Action Narrative Tests
 */

export class SkillActionTests {

  static async runAll() {
    console.log("=== SKILL ACTION NARRATIVE TESTS ===");

    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Test action detection
    await this.testActionDetection(results);

    // Test feat detection
    await this.testFeatDetection(results);

    // Test narrative generation
    await this.testNarrativeGeneration(results);

    // Test variety engine
    await this.testVariety(results);

    // Test all actions
    await this.testAllActions(results);

    this.printResults(results);
    return results;
  }

  static async testActionDetection(results) {
    // Test that Demoralize is detected correctly
    // Test that Tumble Through is detected correctly
    // etc.
  }

  static async testFeatDetection(results) {
    // Test Intimidating Glare detection
    // Test Battle Cry detection
    // Test Titan Wrestler detection
    // etc.
  }

  static async testNarrativeGeneration(results) {
    // Test each action generates valid narratives
    // Test each outcome generates narratives
    // Test feat variants work
  }

  static async testVariety(results) {
    // Test variety tracking prevents repetition
    // Test 100 generations don't repeat excessively
  }

  static async testAllActions(results) {
    const actions = [
      'demoralize', 'tumble-through', 'grapple', 'trip',
      'shove', 'disarm', 'feint', 'create-diversion',
      'hide', 'sneak', 'escape', 'climb', 'swim',
      'high-jump', 'long-jump', 'balance', 'force-open',
      'recall-knowledge', 'steal', 'palm-object',
      'pick-lock', 'disable-device', 'request',
      'command-animal', 'perform'
    ];

    for (const action of actions) {
      await this.testAction(action, results);
    }
  }
}
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Create file structure
- [ ] Implement action-detector.js
- [ ] Implement feat-detector.js
- [ ] Create skill-generator.js
- [ ] Add settings
- [ ] Basic integration with main.js

### Week 2-3: Data Creation (Athletics & Intimidation)
- [ ] Demoralize (with all feat variants)
- [ ] Grapple
- [ ] Trip
- [ ] Shove
- [ ] Disarm
- [ ] Climb
- [ ] Swim
- [ ] High Jump
- [ ] Long Jump
- [ ] Force Open

### Week 4-5: Data Creation (Acrobatics, Deception, Stealth)
- [ ] Tumble Through
- [ ] Balance
- [ ] Escape
- [ ] Feint
- [ ] Create Diversion
- [ ] Hide
- [ ] Sneak

### Week 6: Data Creation (Thievery, Knowledge, Misc)
- [ ] Steal
- [ ] Palm Object
- [ ] Pick Lock
- [ ] Disable Device
- [ ] Recall Knowledge
- [ ] Request
- [ ] Command Animal
- [ ] Perform

### Week 7: Polish & Testing
- [ ] Testing framework
- [ ] Performance optimization
- [ ] Error handling
- [ ] Context filtering
- [ ] Documentation
- [ ] Integration testing

### Week 8: Release
- [ ] Final QA
- [ ] Documentation complete
- [ ] Release Phase 3

---

## Success Metrics

### Functional Goals
- ✅ Generate narratives for ~25 skill actions
- ✅ Support all 4 degrees of success
- ✅ Detect and adapt to ~15 relevant feats
- ✅ Support 4 detail levels
- ✅ Work with variety tracking system

### Quality Goals
- ✅ ~7,500+ unique narrative phrases
- ✅ <50ms generation time (match Phase 1)
- ✅ Context-aware feat detection
- ✅ Grammatically correct interpolation
- ✅ Variety system prevents repetition

### User Experience
- ✅ Same settings pattern as Phase 1
- ✅ Same visibility controls
- ✅ Same chat card integration
- ✅ Regenerate button support
- ✅ Error notifications

---

## Risk Mitigation

### Risk 1: Action Detection Doesn't Work
**Mitigation**: Quick test protocol (2 minutes in Foundry)
**Fallback**: Cancel Phase 3 if detection impossible

### Risk 2: Feat Detection Doesn't Work
**Mitigation**: Phase 3A (without feats) → Phase 3B (with feats)
**Fallback**: Launch with generic narratives only

### Risk 3: Scope Creep
**Mitigation**: Limit to 25 core actions, 15 key feats
**Fallback**: Launch with fewer actions initially

### Risk 4: Data Creation Takes Too Long
**Mitigation**: Use template patterns from Phase 1
**Fallback**: Release in stages (Athletics first, then others)

---

## Summary

Phase 3 will:
1. ✅ **Mirror Phase 1's architecture** - Same quality, same patterns
2. ✅ **Support ~25 encounter mode skill actions**
3. ✅ **Detect and adapt to ~15 character feats**
4. ✅ **Generate ~7,500+ unique narrative phrases**
5. ✅ **Integrate seamlessly** with existing systems
6. ✅ **Maintain <50ms generation time**
7. ✅ **Include comprehensive testing**

**Total Estimated Effort: 7-8 weeks** (with full feat support)

**Next Step**: Run the 2-minute Foundry test to confirm action/feat detection works, then begin implementation.
