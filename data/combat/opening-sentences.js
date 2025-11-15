/**
 * PF2e Narrative Seeds - Opening Sentences
 * Provides variety for the opening sentences of combat messages
 * Organized by detail level and outcome
 */

/**
 * Opening sentences for CINEMATIC detail level
 * These are the most dramatic and descriptive openings
 */
export const CINEMATIC_OPENINGS = {
  criticalSuccess: [
    "Time seems to slow as ${attackerName}'s attack arcs through the air.",
    "In a blur of motion, ${attackerName} finds the perfect opening.",
    "Everything clicks into place as ${attackerName} unleashes their strike.",
    "The world narrows to a single moment as ${attackerName} attacks.",
    "${attackerName}'s movements flow like water, building to a devastating crescendo.",
    "With predatory precision, ${attackerName} seizes the critical moment.",
    "The air itself seems to hold its breath as ${attackerName} strikes.",
    "In one fluid motion, ${attackerName} delivers a masterful attack.",
    "${attackerName} moves with lethal grace, capitalizing on a fleeting opportunity.",
    "Time crystallizes into this singular, perfect strike from ${attackerName}.",
    "Like lightning finding its mark, ${attackerName} attacks with ruthless efficiency.",
    "The battlefield fades away as ${attackerName} focuses everything into one strike.",
    "${attackerName}'s instincts scream - this is the moment.",
    "With surgical precision, ${attackerName} exploits a critical weakness.",
    "Reality sharpens to a razor's edge as ${attackerName} commits to the attack.",
    "${attackerName} reads the flow of combat perfectly, striking at the ideal instant.",
    "In a heartbeat that stretches like eternity, ${attackerName} attacks.",
    "Muscle memory and training align as ${attackerName} delivers a picture-perfect strike.",
    "${attackerName} spots the opening and moves with devastating purpose.",
    "The dance of combat reaches its climax as ${attackerName} strikes true.",
    "With the certainty of a falling star, ${attackerName}'s attack descends.",
    "${attackerName}'s weapon becomes an extension of their will, striking with absolute conviction.",
    "Everything ${attackerName} has trained for culminates in this single, perfect moment.",
    "The chaos of battle crystallizes into clarity as ${attackerName} attacks.",
    "Like a conductor bringing down the baton, ${attackerName} orchestrates the perfect strike.",
    "${attackerName} channels every ounce of skill and power into one devastating blow.",
    "The perfect storm of opportunity and execution converges as ${attackerName} strikes.",
    "With the inexorability of fate itself, ${attackerName}'s attack finds its mark.",
    "${attackerName} transcends mere technique, delivering a strike of pure artistry.",
    "In this frozen moment, ${attackerName} achieves martial perfection.",
    "The stars align for ${attackerName}'s most devastating strike yet.",
    "${attackerName} moves beyond thought, pure instinct guiding a flawless attack.",
    "Time dilates as ${attackerName} commits everything to this single strike.",
    "With the precision of a master craftsman, ${attackerName} delivers destruction.",
    "${attackerName}'s attack cuts through the air like destiny itself.",
    "The universe seems to pivot around ${attackerName}'s devastating strike.",
    "In one transcendent moment, ${attackerName} becomes the perfect weapon.",
    "${attackerName} strikes with the force of an avalanche and the precision of a scalpel.",
    "Every fiber of ${attackerName}'s being focuses on this critical blow.",
    "The gods themselves might envy ${attackerName}'s perfect execution."
  ],

  success: [
    "${attackerName} presses the attack!",
    "${attackerName} pushes forward with determination!",
    "${attackerName} seizes the initiative!",
    "Maintaining pressure, ${attackerName} strikes again!",
    "${attackerName} flows into another attack!",
    "Without hesitation, ${attackerName} continues the assault!",
    "${attackerName} capitalizes on their momentum!",
    "Reading the rhythm of battle, ${attackerName} attacks!",
    "${attackerName} doesn't give ${targetName} a moment to breathe!",
    "With practiced efficiency, ${attackerName} strikes!",
    "${attackerName} transitions smoothly into another blow!",
    "Sensing an opportunity, ${attackerName} attacks!",
    "${attackerName} keeps the pressure relentless!",
    "The offensive continues as ${attackerName} strikes!",
    "${attackerName} drives forward with unwavering focus!",
    "Not wasting a second, ${attackerName} attacks again!",
    "${attackerName} maintains their aggressive stance!",
    "Building on their advantage, ${attackerName} strikes!",
    "${attackerName} channels their training into a solid blow!",
    "With confidence, ${attackerName} delivers another strike!",
    "${attackerName} finds their rhythm and attacks!",
    "Pressing their advantage, ${attackerName} strikes true!",
    "${attackerName} unleashes a practiced strike!",
    "The assault intensifies as ${attackerName} attacks!",
    "${attackerName} moves with purpose and strikes!",
    "Staying on the offensive, ${attackerName} lashes out!",
    "${attackerName} refuses to let up, attacking again!",
    "With grim determination, ${attackerName} strikes!",
    "${attackerName} follows through with another blow!",
    "The tempo quickens as ${attackerName} attacks!",
    "${attackerName} executes a textbook strike!",
    "Drawing on experience, ${attackerName} lands another hit!",
    "${attackerName} strikes with workmanlike efficiency!",
    "Combat instinct guides ${attackerName}'s next attack!",
    "${attackerName} demonstrates their martial prowess!",
    "With controlled aggression, ${attackerName} strikes!",
    "${attackerName} chains together another attack!",
    "The battle flows as ${attackerName} delivers their strike!",
    "${attackerName} keeps ${targetName} on the defensive!",
    "Momentum builds as ${attackerName} attacks once more!"
  ],

  failure: [
    "${attackerName} swings hard, but ${targetName} shifts at the last moment!",
    "${attackerName} commits to the strike, but ${targetName} reads it!",
    "${attackerName} attacks with conviction, yet ${targetName} evades!",
    "${targetName} sees the attack coming and moves!",
    "${attackerName} lunges forward, but ${targetName} anticipates it!",
    "At the critical moment, ${targetName} slips aside from ${attackerName}'s strike!",
    "${attackerName}'s weapon cuts through empty air as ${targetName} dodges!",
    "${targetName}'s reflexes save them from ${attackerName}'s attack!",
    "${attackerName} strikes true, but ${targetName} isn't where they expected!",
    "A near miss - ${targetName} barely avoids ${attackerName}'s blow!",
    "${attackerName} overcommits and ${targetName} capitalizes on it!",
    "${targetName} ducks under ${attackerName}'s attack at the last second!",
    "${attackerName}'s timing is off and ${targetName} exploits it!",
    "Fortune favors ${targetName} as ${attackerName}'s strike misses!",
    "${attackerName} swings with force, but ${targetName} weaves away!",
    "${targetName}'s footwork keeps them just out of ${attackerName}'s reach!",
    "${attackerName} telegraphs the attack and ${targetName} reacts!",
    "A momentary lapse costs ${attackerName} as the attack goes wide!",
    "${targetName} proves elusive, avoiding ${attackerName}'s strike!",
    "${attackerName}'s weapon finds nothing but air!",
    "${targetName} twists away from ${attackerName}'s incoming blow!",
    "The strike misses as ${targetName} displays impressive agility!",
    "${attackerName} misjudges the distance and comes up short!",
    "${targetName} parries ${attackerName}'s attack at the last instant!",
    "A brief stumble causes ${attackerName}'s strike to miss!",
    "${targetName}'s armor deflects ${attackerName}'s blow harmlessly!",
    "${attackerName} attacks, but the angle isn't quite right!",
    "Bad footing throws off ${attackerName}'s strike!",
    "${targetName} rolls with the blow, minimizing ${attackerName}'s impact!",
    "A split-second shift saves ${targetName} from ${attackerName}!",
    "${attackerName}'s weapon skitters off ${targetName}'s defense!",
    "The attack lacks conviction and ${targetName} easily avoids it!",
    "${attackerName} rushes the strike and pays for it!",
    "${targetName} stays calm, evading ${attackerName}'s aggressive attack!",
    "Combat chaos works against ${attackerName} as the strike misses!",
    "${attackerName} swings through ${targetName}'s afterimage!",
    "${targetName} makes ${attackerName}'s attack look clumsy!",
    "The miss frustrates ${attackerName} as ${targetName} dodges clear!",
    "${attackerName}'s attack whistles past ${targetName} harmlessly!",
    "Discipline fails ${attackerName} for just a moment, and it costs them!"
  ],

  criticalFailure: [
    "${attackerName} commits to the strike, but ${targetName} easily evades!",
    "${attackerName} loses their balance completely!",
    "Disaster strikes as ${attackerName}'s attack goes catastrophically wrong!",
    "${attackerName} fumbles badly, leaving them exposed!",
    "Everything that could go wrong does as ${attackerName} attacks!",
    "${targetName} makes ${attackerName} look like a rank amateur!",
    "${attackerName}'s weapon betrays them at the worst possible moment!",
    "A spectacular miss leaves ${attackerName} vulnerable!",
    "${attackerName} trips over their own feet while attacking!",
    "The attack backfires spectacularly for ${attackerName}!",
    "${attackerName}'s weapon slips from their grip!",
    "In an embarrassing display, ${attackerName} completely whiffs!",
    "${attackerName} overextends dangerously, losing all control!",
    "Combat chaos completely overwhelms ${attackerName}!",
    "${attackerName} somehow manages to miss by a mile!",
    "The worst possible outcome - ${attackerName} strikes nothing but air!",
    "${attackerName}'s concentration shatters at the critical moment!",
    "A complete breakdown in form costs ${attackerName} dearly!",
    "${attackerName} staggers, their attack going wildly astray!",
    "Momentum works against ${attackerName} in the worst way!",
    "${targetName} doesn't even need to dodge ${attackerName}'s wild swing!",
    "${attackerName}'s weapon tangles, leaving them defenseless!",
    "An absolute disaster of an attack from ${attackerName}!",
    "${attackerName} strikes with such poor form they hurt themselves!",
    "The gods of battle frown on ${attackerName}'s terrible strike!",
    "${attackerName}'s attack is so poor it's almost impressive!",
    "Gravity seems to work against ${attackerName}'s flailing strike!",
    "${attackerName} proves that even warriors have bad days!",
    "A textbook example of what NOT to do, courtesy of ${attackerName}!",
    "${attackerName}'s attack defies all logic and reason!",
    "Future warriors will study ${attackerName}'s failure as a cautionary tale!",
    "${attackerName} manages to miss, stumble, AND look foolish!",
    "The strike is so bad that ${targetName} looks confused!",
    "${attackerName} loses track of their weapon entirely!",
    "Incompetence and bad luck combine for ${attackerName}!",
    "${attackerName}'s attack is more danger to allies than enemies!",
    "A catastrophic miscalculation leaves ${attackerName} reeling!",
    "${attackerName} would have been better off not attacking at all!",
    "The spectacularly failed strike will haunt ${attackerName}'s dreams!",
    "${attackerName} demonstrates perfect execution of a perfect failure!"
  ]
};

/**
 * Opening sentences for DETAILED detail level
 * Includes target names but less dramatic than cinematic
 */
export const DETAILED_OPENINGS = {
  criticalSuccess: [
    "${weaponType} strikes true against ${targetName},",
    "${weaponType} finds its mark on ${targetName},",
    "${weaponType} connects perfectly with ${targetName},",
    "${weaponType} lands a devastating blow on ${targetName},",
    "${weaponType} cuts through ${targetName}'s defenses,",
    "With lethal precision, ${weaponType} hits ${targetName},",
    "${weaponType} delivers a crushing strike to ${targetName},",
    "${weaponType} tears into ${targetName},",
    "${weaponType} punches through ${targetName}'s guard,",
    "Finding the perfect angle, ${weaponType} strikes ${targetName},",
    "${weaponType} overwhelms ${targetName},",
    "${weaponType} hammers into ${targetName},",
    "${weaponType} catches ${targetName} completely off-guard,",
    "With brutal efficiency, ${weaponType} strikes ${targetName},",
    "${weaponType} exploits ${targetName}'s weakness,",
    "${weaponType} delivers a masterful strike against ${targetName},",
    "${weaponType} impacts ${targetName} with tremendous force,",
    "${weaponType} finds the gap in ${targetName}'s defense,",
    "Perfectly placed, ${weaponType} devastates ${targetName},",
    "${weaponType} crashes into ${targetName} with terrible purpose,",
    "${weaponType} catches ${targetName} at the worst possible moment,",
    "With deadly accuracy, ${weaponType} strikes ${targetName},",
    "${weaponType} delivers a crippling blow to ${targetName},",
    "${weaponType} slams into ${targetName} with overwhelming force,",
    "${weaponType} pierces ${targetName}'s defenses utterly,",
    "In a devastating display, ${weaponType} ruins ${targetName},",
    "${weaponType} catches ${targetName} completely exposed,",
    "${weaponType} demonstrates its full lethality on ${targetName},",
    "With terrible precision, ${weaponType} destroys ${targetName},",
    "${weaponType} inflicts massive damage on ${targetName},"
  ],

  success: [
    "${weaponType} lands solidly against ${targetName},",
    "${weaponType} connects with ${targetName},",
    "${weaponType} strikes ${targetName} cleanly,",
    "${weaponType} hits ${targetName} true,",
    "${weaponType} makes contact with ${targetName},",
    "${weaponType} finds ${targetName},",
    "${weaponType} impacts ${targetName},",
    "${weaponType} successfully strikes ${targetName},",
    "${weaponType} hits ${targetName} squarely,",
    "${weaponType} lands a solid blow on ${targetName},",
    "${weaponType} catches ${targetName},",
    "${weaponType} delivers a clean hit to ${targetName},",
    "${weaponType} strikes ${targetName} effectively,",
    "${weaponType} makes solid contact with ${targetName},",
    "${weaponType} punches into ${targetName},",
    "${weaponType} tags ${targetName},",
    "${weaponType} scores a hit on ${targetName},",
    "${weaponType} reaches ${targetName},",
    "${weaponType} gets through to ${targetName},",
    "${weaponType} contacts ${targetName}'s form,",
    "${weaponType} strikes ${targetName} soundly,",
    "${weaponType} meets ${targetName}'s flesh,",
    "${weaponType} delivers its payload to ${targetName},",
    "${weaponType} successfully engages ${targetName},",
    "${weaponType} finds purchase on ${targetName},",
    "${weaponType} marks ${targetName},",
    "${weaponType} achieves contact with ${targetName},",
    "${weaponType} lands home on ${targetName},",
    "${weaponType} proves effective against ${targetName},",
    "${weaponType} connects meaningfully with ${targetName},"
  ],

  failure: [
    "${weaponType} swings toward ${targetName} but goes",
    "${weaponType} aims for ${targetName} but misses,",
    "${weaponType} seeks ${targetName} but fails,",
    "${weaponType} swings at ${targetName}, missing",
    "${weaponType} attempts to strike ${targetName} but goes",
    "${targetName} evades ${weaponType}, which goes",
    "${weaponType} fails to connect with ${targetName},",
    "${weaponType} misses ${targetName}, going",
    "${targetName} dodges ${weaponType}, which hits",
    "${weaponType} swings for ${targetName} unsuccessfully,",
    "${weaponType} can't quite reach ${targetName},",
    "${targetName} avoids ${weaponType}, which strikes",
    "${weaponType} nearly catches ${targetName} but goes",
    "${targetName} steps clear of ${weaponType}, which lands",
    "${weaponType} passes by ${targetName},",
    "${targetName} weaves away from ${weaponType}, which goes",
    "${weaponType} comes up short against ${targetName},",
    "${targetName} deflects ${weaponType},",
    "${weaponType} fails to find ${targetName},",
    "${targetName} parries ${weaponType}, sending it",
    "${weaponType} swishes past ${targetName},",
    "${targetName} blocks ${weaponType}, which glances",
    "${weaponType} strikes where ${targetName} was,",
    "${targetName}'s armor turns ${weaponType},",
    "${weaponType} misses ${targetName} narrowly,",
    "${targetName} sidesteps ${weaponType}, which goes",
    "${weaponType} whistles past ${targetName},",
    "${targetName} anticipates ${weaponType}, moving",
    "${weaponType} skitters off ${targetName},",
    "${targetName} easily avoids ${weaponType},"
  ],

  criticalFailure: [
    "${weaponType} swings wildly at ${targetName}, going",
    "${weaponType} flails at ${targetName}, missing",
    "${weaponType} completely misses ${targetName},",
    "${weaponType} swings horribly at ${targetName},",
    "${targetName} laughs as ${weaponType} goes",
    "${weaponType} embarrassingly misses ${targetName},",
    "${weaponType} fumbles the attack on ${targetName},",
    "In a spectacular miss, ${weaponType} goes",
    "${weaponType} loses all control near ${targetName},",
    "${targetName} doesn't even flinch as ${weaponType} goes",
    "${weaponType} catastrophically misses ${targetName},",
    "${weaponType} fails utterly against ${targetName},",
    "${targetName} easily dodges ${weaponType}'s wild swing,",
    "${weaponType} manages to miss ${targetName} by a mile,",
    "${weaponType} performs terribly against ${targetName},",
    "${targetName} isn't even threatened by ${weaponType},",
    "${weaponType} goes completely astray from ${targetName},",
    "${weaponType} demonstrates perfect incompetence against ${targetName},",
    "${targetName} looks puzzled as ${weaponType} goes",
    "${weaponType} swings so poorly at ${targetName} that it goes",
    "${weaponType} betrays its wielder near ${targetName},",
    "${targetName} barely notices ${weaponType}'s pathetic attempt,",
    "${weaponType} fails spectacularly to threaten ${targetName},",
    "${weaponType} achieves the opposite of hitting ${targetName},",
    "${targetName} remains unscathed as ${weaponType} goes",
    "${weaponType} makes a mockery of itself against ${targetName},",
    "${weaponType} proves useless against ${targetName},",
    "${targetName} almost pities the wielder as ${weaponType} goes",
    "${weaponType} accomplishes nothing against ${targetName},",
    "${weaponType} creates a disaster nowhere near ${targetName},"
  ]
};

/**
 * Opening sentences for STANDARD detail level
 * Simple and direct without target names
 */
export const STANDARD_OPENINGS = {
  criticalSuccess: [
    "${weaponType} strikes true,",
    "${weaponType} lands perfectly,",
    "${weaponType} connects with devastating force,",
    "${weaponType} hits the mark,",
    "${weaponType} finds its target,",
    "${weaponType} delivers a crushing blow,",
    "${weaponType} strikes with lethal precision,",
    "${weaponType} impacts with tremendous force,",
    "${weaponType} lands a critical strike,",
    "${weaponType} connects devastatingly,",
    "${weaponType} hits with perfect accuracy,",
    "${weaponType} strikes home,",
    "${weaponType} lands a devastating hit,",
    "${weaponType} connects brutally,",
    "${weaponType} finds the perfect angle,",
    "${weaponType} delivers a powerful strike,",
    "${weaponType} hits with crushing impact,",
    "${weaponType} strikes decisively,",
    "${weaponType} lands with terrible force,",
    "${weaponType} connects with ruthless efficiency,",
    "${weaponType} impacts critically,",
    "${weaponType} strikes a perfect blow,",
    "${weaponType} delivers maximum damage,",
    "${weaponType} hits exactly right,",
    "${weaponType} lands a masterful strike,",
    "${weaponType} connects with full force,",
    "${weaponType} strikes with deadly accuracy,",
    "${weaponType} delivers a crippling blow,",
    "${weaponType} impacts with overwhelming power,",
    "${weaponType} finds the weak point,"
  ],

  success: [
    "${weaponType} lands solidly,",
    "${weaponType} strikes true,",
    "${weaponType} connects,",
    "${weaponType} hits cleanly,",
    "${weaponType} makes contact,",
    "${weaponType} strikes home,",
    "${weaponType} lands a hit,",
    "${weaponType} finds its mark,",
    "${weaponType} impacts solidly,",
    "${weaponType} strikes successfully,",
    "${weaponType} delivers a blow,",
    "${weaponType} connects well,",
    "${weaponType} hits true,",
    "${weaponType} lands effectively,",
    "${weaponType} makes solid contact,",
    "${weaponType} strikes cleanly,",
    "${weaponType} hits squarely,",
    "${weaponType} impacts,",
    "${weaponType} connects with purpose,",
    "${weaponType} lands the blow,",
    "${weaponType} strikes firmly,",
    "${weaponType} delivers its strike,",
    "${weaponType} meets flesh,",
    "${weaponType} hits soundly,",
    "${weaponType} makes its mark,",
    "${weaponType} strikes competently,",
    "${weaponType} lands on target,",
    "${weaponType} delivers damage,",
    "${weaponType} connects adequately,",
    "${weaponType} proves effective,"
  ],

  failure: [
    "${weaponType} swings",
    "${weaponType} misses,",
    "${weaponType} fails to connect,",
    "${weaponType} goes wide,",
    "${weaponType} swings past",
    "${weaponType} misses the mark,",
    "${weaponType} comes up short,",
    "${weaponType} fails to hit,",
    "${weaponType} swings through air,",
    "${weaponType} doesn't connect,",
    "${weaponType} misses narrowly,",
    "${weaponType} swings ineffectively,",
    "${weaponType} fails,",
    "${weaponType} goes astray,",
    "${weaponType} whistles past",
    "${weaponType} swings and misses,",
    "${weaponType} seeks but fails,",
    "${weaponType} passes by",
    "${weaponType} doesn't land,",
    "${weaponType} swings without effect,",
    "${weaponType} misses its target,",
    "${weaponType} fails to find flesh,",
    "${weaponType} swings harmlessly,",
    "${weaponType} misses completely,",
    "${weaponType} cuts only air,",
    "${weaponType} swings unsuccessfully,",
    "${weaponType} goes off-target,",
    "${weaponType} fails to make contact,",
    "${weaponType} doesn't find its mark,",
    "${weaponType} swings futilely,"
  ],

  criticalFailure: [
    "${weaponType} goes",
    "${weaponType} misses badly,",
    "${weaponType} swings wildly,",
    "${weaponType} fumbles,",
    "${weaponType} flails",
    "${weaponType} completely misses,",
    "${weaponType} fails spectacularly,",
    "${weaponType} goes astray,",
    "${weaponType} swings catastrophically,",
    "${weaponType} misses embarrassingly,",
    "${weaponType} fails utterly,",
    "${weaponType} goes nowhere near",
    "${weaponType} swings uselessly,",
    "${weaponType} completely fails,",
    "${weaponType} misses by a mile,",
    "${weaponType} flails wildly,",
    "${weaponType} goes disastrously",
    "${weaponType} swings pathetically,",
    "${weaponType} accomplishes nothing,",
    "${weaponType} fails miserably,",
    "${weaponType} betrays its wielder,",
    "${weaponType} swings hopelessly,",
    "${weaponType} misses spectacularly,",
    "${weaponType} goes horribly",
    "${weaponType} fails completely,",
    "${weaponType} swings terribly,",
    "${weaponType} misses in the worst way,",
    "${weaponType} goes embarrassingly",
    "${weaponType} creates a disaster,",
    "${weaponType} proves utterly ineffective,"
  ]
};

/**
 * Get a random opening sentence for the specified detail level and outcome
 * @param {string} detailLevel - minimal, standard, detailed, or cinematic
 * @param {string} outcome - criticalSuccess, success, failure, or criticalFailure
 * @param {Object} context - Context object with attackerName, targetName, weaponType, etc.
 * @returns {string|null} The opening sentence template, or null if not applicable
 */
export function getOpeningSentence(detailLevel, outcome, context = {}) {
  // Minimal detail level doesn't use opening sentences
  if (detailLevel === 'minimal') {
    return null;
  }

  // Select the appropriate openings array
  let openings;
  switch(detailLevel) {
    case 'cinematic':
      openings = CINEMATIC_OPENINGS[outcome];
      break;
    case 'detailed':
      openings = DETAILED_OPENINGS[outcome];
      break;
    case 'standard':
      openings = STANDARD_OPENINGS[outcome];
      break;
    default:
      return null;
  }

  if (!openings || openings.length === 0) {
    return null;
  }

  // Select a random opening
  const template = openings[Math.floor(Math.random() * openings.length)];

  // Replace placeholders with actual values
  return interpolateTemplate(template, context);
}

/**
 * Interpolate template with context values
 * @param {string} template - Template string with ${variable} placeholders
 * @param {Object} context - Object with values to interpolate
 * @returns {string}
 */
function interpolateTemplate(template, context) {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}
