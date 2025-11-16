#!/usr/bin/env python3
"""
Fix specific weapon references in opening message files.
Replace specific weapon names with generic terms to prevent messages
showing wrong weapon types (e.g., "katana" when using a longsword).
"""

import json
import re
from pathlib import Path

# Replacement mappings for each weapon category
SWORD_REPLACEMENTS = [
    # Japanese sword terms (remove all Japanese terminology)
    (r'\bthe wakizashi\b', 'the blade'),
    (r'\bwakizashi\b', 'blade'),
    (r'\bthe tachi\b', 'the blade'),
    (r'\btachi\b', 'blade'),
    (r'\bsaya-biki draw\b', 'quick draw'),
    (r'\bsaya-biki\b', 'draw'),
    (r'\bkissaki\b', 'point'),
    (r'\btenouchi grip\b', 'grip'),
    (r'\btenouchi\b', 'grip'),
    (r'\bkiriotoshi\b', 'cutting strike'),
    (r'\bkesa-giri\b', 'diagonal cut'),
    (r'\bdo-giri\b', 'horizontal cut'),
    (r'\bmushin perfection\b', 'perfect focus'),
    (r'\bmushin\b', 'focused'),
    (r'\biai geometry\b', 'perfect form'),
    (r'\biai\b', 'draw'),
    # German fencing terms (remove all German terminology)
    (r'\bthe perfect Zwerchhau\b', 'the perfect diagonal strike'),
    (r'\ba competent Zwerchhau\b', 'a competent diagonal strike'),
    (r'\bZwerchhau\b', 'diagonal strike'),
    (r'\bSchielhau\b', 'angled cut'),
    (r'\bOberhau\b', 'overhead strike'),
    (r'\bUnterhau\b', 'rising cut'),
    (r'\bNebenhut guard\b', 'side guard'),
    (r'\bNebenhut\b', 'guard'),
    (r'\bKrumphau\b', 'hooking strike'),
    (r'\bShielhau\b', 'squinting cut'),
    # Historical fencing masters (replace with generic descriptions)
    (r'\bthe Liechtenauer master strike\b', 'the master strike'),
    (r'\bLiechtenauer\b', 'a master'),
    (r'\bthe Fiore dei Liberi killing blow\b', 'the killing blow'),
    (r'\bFiore dei Liberi\b', 'a master'),
    (r'\bthe Meyer master cut\b', 'the master cut'),
    (r'\bMeyer\b', 'a master'),
    (r'\bthe Thibault\'s perfect thrust\b', 'the perfect thrust'),
    (r'\bThibault\'s\b', 'a master\'s'),
    (r'\ba Verdadera Destreza masterpiece\b', 'a masterful strike'),
    (r'\bVerdadera Destreza\b', 'masterful technique'),
    # Specific swords → generic terms (order matters - longest first)
    (r'\bthe longsword\b', 'the sword'),
    (r'\blongsword\b', 'sword'),
    (r'\bthe rapier\b', 'the blade'),
    (r'\brapier\b', 'blade'),
    (r'\bthe katana\b', 'the blade'),
    (r'\bkatana\b', 'blade'),
    (r'\bthe scimitar\b', 'the curved blade'),
    (r'\bscimitar\b', 'curved blade'),
    (r'\bthe sabre\b', 'the curved blade'),
    (r'\bsabre\b', 'curved blade'),
    (r'\bthe saber\b', 'the curved blade'),
    (r'\bsaber\b', 'curved blade'),
    (r'\bthe greatsword\b', 'the great sword'),
    (r'\bgreatsword\b', 'great sword'),
    (r'\bthe shortsword\b', 'the short blade'),
    (r'\bshortsword\b', 'short blade'),
    (r'\bthe broadsword\b', 'the blade'),
    (r'\bbroadsword\b', 'blade'),
    (r'\bthe claymore\b', 'the great sword'),
    (r'\bclaymore\b', 'great sword'),
    (r'\bthe gladius\b', 'the blade'),
    (r'\bgladius\b', 'blade'),
    (r'\bthe cutlass\b', 'the blade'),
    (r'\bcutlass\b', 'blade'),
    (r'\bthe jian\b', 'the blade'),
    (r'\bjian\b', 'blade'),
    (r'\bthe dao\b', 'the curved blade'),
    (r'\bdao\b', 'curved blade'),
    (r'\bthe khopesh\b', 'the hooked blade'),
    (r'\bkhopesh\b', 'hooked blade'),
    (r'\bthe tulwar\b', 'the curved blade'),
    (r'\btulwar\b', 'curved blade'),
    (r'\bthe talwar\b', 'the curved blade'),
    (r'\btalwar\b', 'curved blade'),
    (r'\bthe shamshir\b', 'the curved blade'),
    (r'\bshamshir\b', 'curved blade'),
    (r'\bthe bastard sword\b', 'the blade'),
    (r'\bbastard sword\b', 'blade'),
    (r'\bthe smallsword\b', 'the light blade'),
    (r'\bsmallsword\b', 'light blade'),
    (r'\bthe falchion\b', 'the heavy blade'),
    (r'\bfalchion edge\b', 'blade edge'),
    (r'\bfalchion\b', 'heavy blade'),
    (r'\bthe estoc\b', 'the blade'),
    (r'\bestoc\b', 'blade'),
    (r'\bthe zweihander\b', 'the great sword'),
    (r'\bzweihander\b', 'great sword'),
    (r'\bthe kriegsmesser\b', 'the heavy blade'),
    (r'\bkriegsmesser\b', 'heavy blade'),
    (r'\bthe spadone\b', 'the great sword'),
    (r'\bspadone\b', 'great sword'),
    (r'\bthe montante\b', 'the great sword'),
    (r'\bmontante\b', 'great sword'),
    (r'\bthe miao dao\b', 'the long blade'),
    (r'\bmiao dao\b', 'long blade'),
    # Remove cultural/regional references
    (r'\btaiji geometry\b', 'perfect form'),
    (r'\btaiji precision\b', 'precise technique'),
    (r'\btaiji\b', 'flowing'),
    (r'\bRoman precision\b', 'precise technique'),
    (r'\bPersian precision\b', 'precise technique'),
    (r'\bPersian finality\b', 'decisive force'),
    (r'\bPersian cavalry precision\b', 'mounted precision'),
    (r'\bScythian savagery\b', 'brutal force'),
    (r'\bKorean perfection\b', 'perfect technique'),
    (r'\bSwiss precision\b', 'precise technique'),
    (r'\bthe shamsheer\b', 'the curved blade'),
    (r'\bshamsheer\b', 'curved blade'),
    # Remove dagger references from sword file
    (r'\bthe tanto\b', 'the short blade'),
    (r'\btanto\b', 'short blade'),
    # Remove hammer references from sword file
    (r'\bthe flail\b', 'the weapon'),
    (r'\bflail\b', 'weapon'),
]

HAMMER_REPLACEMENTS = [
    # Cultural/foreign weapon names that ended up in hammer.json
    (r'\bthe tabar-e-zin\b', 'the weapon'),
    (r'\btabar-e-zin\b', 'weapon'),
    (r'\bthe tabar\b', 'the weapon'),
    (r'\btabar\b', 'weapon'),
    (r'\bthe sagaris\b', 'the weapon'),
    (r'\bsagaris\b', 'weapon'),
    (r'\bthe chuk-do\b', 'the weapon'),
    (r'\bchuk-do\b', 'weapon'),
    # Standard hammers
    (r'\bthe warhammer\b', 'the hammer'),
    (r'\bwarhammer\b', 'hammer'),
    (r'\bthe greatclub\b', 'the heavy weapon'),
    (r'\bgreatclub\b', 'heavy weapon'),
    (r'\bthe maul\b', 'the heavy weapon'),
    (r'\bmaul\b', 'heavy weapon'),
    (r'\bthe mace\b', 'the weapon'),
    (r'\bmace\b', 'weapon'),
    (r'\bthe morning star\b', 'the spiked weapon'),  # Two words version
    (r'\bmorning star\b', 'spiked weapon'),
    (r'\bthe morningstar\b', 'the spiked weapon'),
    (r'\bmorningstar\b', 'spiked weapon'),
    (r'\bthe flail\b', 'the chained weapon'),
    (r'\bflail\b', 'chained weapon'),
    (r'\bthe club\b', 'the weapon'),
    (r'\bclub\b', 'weapon'),
    (r'\bthe quarterstaff\b', 'the staff'),
    (r'\bquarterstaff\b', 'staff'),
    # Remove polearm references from hammer file
    (r'\bthe glaive-guisarme\b', 'the polearm'),
    (r'\bglaive-guisarme\b', 'polearm'),
    (r'\bthe halberd\b', 'the polearm'),
    (r'\bhalberd\b', 'polearm'),
    # Remove axe references from hammer file
    (r'\bthe tomahawk\b', 'the thrown weapon'),
    (r'\btomahawk\b', 'thrown weapon'),
]

SPEAR_REPLACEMENTS = [
    # Specific polearm names
    (r'\bthe lochaber point\b', 'the polearm point'),
    (r'\bthe lochaber blade\b', 'the polearm blade'),
    (r'\bthe lochaber\b', 'the polearm'),
    (r'\blochaber point\b', 'polearm point'),
    (r'\blochaber blade\b', 'polearm blade'),
    (r'\blochaber\b', 'polearm'),
    (r'\bthe partizan point\b', 'the polearm point'),
    (r'\bthe partizan blade\b', 'the polearm blade'),
    (r'\bthe partizan\b', 'the polearm'),
    (r'\bpartizan point\b', 'polearm point'),
    (r'\bpartizan blade\b', 'polearm blade'),
    (r'\bpartizan\b', 'polearm'),
    (r'\bthe pollspear\b', 'the polearm'),
    (r'\bpollspear\b', 'polearm'),
    (r'\bthe crescent spear\b', 'the curved polearm'),
    (r'\bcrescent spear\b', 'curved polearm'),
    (r'\bthe bardiche blade\b', 'the polearm blade'),
    (r'\bthe bardiche\b', 'the polearm'),
    (r'\bbardiche blade\b', 'polearm blade'),
    (r'\bbardiche\b', 'polearm'),
    (r'\bthe ji blade\b', 'the polearm blade'),
    (r'\bji blade\b', 'polearm blade'),
    # Remove axe cross-contamination from spear file
    (r'\bAxe weight\b', 'Weapon weight'),
    (r'\bAxe head\b', 'Spear head'),
    (r'\bAxe momentum\b', 'Weapon momentum'),
    # Remove thrown weapon cross-contamination
    (r'\bThe dart rotates\b', 'The projectile flies'),
    (r'\bthe dart\b', 'the projectile'),
    # Remove cultural/regional references
    (r'\bItalian fury\b', 'fierce power'),
    (r'\bEastern European fury\b', 'fierce power'),
    (r'\bancient Chinese precision\b', 'ancient precision'),
    (r'\bChinese precision\b', 'precise technique'),
    (r'\bEastern arc\b', 'sweeping arc'),
    (r'\bPersian precision\b', 'precise technique'),
    (r'\bPersian cavalry precision\b', 'mounted precision'),
    (r'\bPersian finality\b', 'decisive force'),
    (r'\bScythian savagery\b', 'brutal force'),
    (r'\bKorean perfection\b', 'perfect technique'),
    (r'\bSwiss precision\b', 'precise technique'),
    # Remove generic "savage" used as cultural descriptor
    (r'\bperfect savage technique\b', 'perfect brutal technique'),
    (r'\bsavage technique\b', 'brutal technique'),
    # Foreign compound weapon names that were already partially replaced
    (r'\bmulti-pronged spear-e-zin\b', 'multi-pronged spear'),
    (r'\bspear-e-zin\b', 'spear'),
    (r'\bpolearm spear-point\b', 'polearm point'),
    # Specific spears
    (r'\bthe battle spear\b', 'the spear'),
    (r'\bbattle spear\b', 'spear'),
    (r'\bthe pike\b', 'the polearm'),
    (r'\bpike\b', 'polearm'),
    (r'\bthe halberd\b', 'the polearm'),
    (r'\bhalberd\b', 'polearm'),
    (r'\bthe glaive\b', 'the polearm'),
    (r'\bglaive\b', 'polearm'),
    (r'\bthe lance\b', 'the spear'),
    (r'\blance\b', 'spear'),
    (r'\bthe javelin\b', 'the spear'),
    (r'\bjavelin\b', 'spear'),
    (r'\bthe trident\b', 'the multi-pronged spear'),
    (r'\btrident\b', 'multi-pronged spear'),
    (r'\bthe naginata\b', 'the polearm'),
    (r'\bnaginata\b', 'polearm'),
    # Remove hammer references from spear file
    (r'\bthe splitting maul\b', 'the heavy weapon'),
    (r'\bsplitting maul\b', 'heavy weapon'),
    # Remove axe references from spear file
    (r'\bthe tomahawk\b', 'the thrown weapon'),
    (r'\btomahawk\b', 'thrown weapon'),
]

DAGGER_REPLACEMENTS = [
    # Specific polearm names that ended up in dagger.json
    (r'\bthe lochaber dagger\b', 'the blade'),
    (r'\blochaber dagger\b', 'blade'),
    (r'\bthe partizan dagger\b', 'the blade'),
    (r'\bpartizan dagger\b', 'blade'),
    # Japanese dagger terms
    (r'\bthe wakizashi\b', 'the blade'),
    (r'\bwakizashi\b', 'blade'),
    # Remove cultural/regional references
    (r'\bItalian fury\b', 'fierce power'),
    (r'\bEastern European fury\b', 'fierce power'),
    (r'\bChinese precision\b', 'precise technique'),
    (r'\bEastern arc\b', 'sweeping arc'),
    (r'\bPersian precision\b', 'precise technique'),
    (r'\bPersian cavalry precision\b', 'mounted precision'),
    (r'\bPersian finality\b', 'decisive force'),
    (r'\bScythian savagery\b', 'brutal force'),
    (r'\bKorean perfection\b', 'perfect technique'),
    (r'\bSwiss precision\b', 'precise technique'),
    # Foreign compound weapon names that were already partially replaced
    (r'\bblade-e-zin\b', 'blade'),
    (r'\bbowie knife dagger-blade\b', 'heavy blade'),
    # Specific daggers
    (r'\bthe stiletto\b', 'the dagger'),
    (r'\bstiletto\b', 'dagger'),
    (r'\bthe kukri\b', 'the curved blade'),
    (r'\bkukri\b', 'curved blade'),
    (r'\bthe dirk\b', 'the dagger'),
    (r'\bdirk\b', 'dagger'),
    (r'\bthe tanto\b', 'the blade'),
    (r'\btanto\b', 'blade'),
    (r'\bthe kris\b', 'the wavy blade'),
    (r'\bkris\b', 'wavy blade'),
    (r'\bthe main gauche\b', 'the parrying dagger'),
    (r'\bmain gauche\b', 'parrying dagger'),
    # Remove polearm references from dagger file
    (r'\bthe poledagger\b', 'the long dagger'),
    (r'\bpoledagger\b', 'long dagger'),
    (r'\bthe halberd\b', 'the weapon'),  # This shouldn't be in dagger.json at all
    (r'\bhalberd\b', 'weapon'),
    # Remove thrown weapon references from dagger file
    (r'\bthe throwing knife\b', 'the thrown blade'),
    (r'\bthrowing knife\b', 'thrown blade'),
    # Remove sword references from dagger file
    (r'\bthe falchion dagger\b', 'the heavy dagger'),
    (r'\bfalchion dagger\b', 'heavy dagger'),
    (r'\bthe cinquedea trident-dagger\b', 'the broad dagger'),
    (r'\bcinquedea trident-dagger\b', 'broad dagger'),
    # Remove axe references from dagger file
    (r'\bthe tomahawk\b', 'the thrown weapon'),
    (r'\btomahawk\b', 'thrown weapon'),
    # Remove hammer references from dagger file
    (r'\bthe splitting maul\b', 'the heavy weapon'),
    (r'\bsplitting maul\b', 'heavy weapon'),
    (r'\bthe maul\b', 'the heavy weapon'),
    (r'\bmaul\b', 'heavy weapon'),
]

AXE_REPLACEMENTS = [
    # Specific polearm names that ended up in axe.json
    (r'\bthe lochaber axe\b', 'the axe'),
    (r'\blochaber axe\b', 'axe'),
    (r'\bthe lochaber blade\b', 'the blade'),
    (r'\blochaber blade\b', 'blade'),
    (r'\bthe lochaber\b', 'the axe'),
    (r'\blochaber\b', 'axe'),
    (r'\bthe partizan blade\b', 'the blade'),
    (r'\bpartizan blade\b', 'blade'),
    (r'\bthe partizan\b', 'the polearm'),
    (r'\bpartizan\b', 'polearm'),
    (r'\bthe bardiche blade\b', 'the axe blade'),
    (r'\bbardiche blade\b', 'axe blade'),
    (r'\bthe bardiche\b', 'the axe'),
    (r'\bbardiche\b', 'axe'),
    (r'\bthe ji blade\b', 'the blade'),
    (r'\bji blade\b', 'blade'),
    # Cultural/foreign axe names
    (r'\bthe tabar-e-zin\b', 'the axe'),
    (r'\btabar-e-zin\b', 'axe'),
    (r'\bthe tabar\b', 'the axe'),
    (r'\btabar\b', 'axe'),
    (r'\bthe sagaris\b', 'the axe'),
    (r'\bsagaris\b', 'axe'),
    (r'\bthe chuk-do\b', 'the axe'),
    (r'\bchuk-do\b', 'axe'),
    # Remove cultural/regional references
    (r'\bItalian fury\b', 'fierce power'),
    (r'\bEastern European fury\b', 'fierce power'),
    (r'\bancient Chinese precision\b', 'ancient precision'),
    (r'\bChinese precision\b', 'precise technique'),
    (r'\bEastern arc\b', 'sweeping arc'),
    (r'\bPersian precision\b', 'precise technique'),
    (r'\bPersian cavalry precision\b', 'mounted precision'),
    (r'\bPersian finality\b', 'decisive force'),
    (r'\bScythian savagery\b', 'brutal force'),
    (r'\bKorean perfection\b', 'perfect technique'),
    (r'\bSwiss precision\b', 'precise technique'),
    # Specific axes
    (r'\bthe battleaxe\b', 'the axe'),
    (r'\bbattleaxe\b', 'axe'),
    (r'\bthe handaxe\b', 'the axe'),
    (r'\bhandaxe\b', 'axe'),
    (r'\bthe greataxe\b', 'the great axe'),
    (r'\bgreataxe\b', 'great axe'),
    (r'\bthe tomahawk\b', 'the axe'),
    (r'\btomahawk\b', 'axe'),
    (r'\bthe hatchet\b', 'the axe'),
    (r'\bhatchet\b', 'axe'),
    (r'\bthe throwing axe\b', 'the axe'),
    (r'\bthrowing axe\b', 'axe'),
    # Remove polearm references from axe file
    (r'\bthe glaive-guisarme\b', 'the polearm'),
    (r'\bglaive-guisarme\b', 'polearm'),
    (r'\bthe halberd\b', 'the polearm'),
    (r'\bhalberd\b', 'polearm'),
    (r'\bthe poleaxe\b', 'the polearm'),
    (r'\bpoleaxe\b', 'polearm'),
    (r'\bthe ranseur trident-axe\b', 'the polearm'),
    (r'\branseur trident-axe\b', 'polearm'),
    (r'\bthe glaive\b', 'the polearm'),
    (r'\bglaive\b', 'polearm'),
    # Remove hammer references from axe file
    (r'\bthe splitting maul\b', 'the heavy weapon'),
    (r'\bsplitting maul\b', 'heavy weapon'),
    (r'\bthe maul\b', 'the heavy weapon'),
    (r'\bmaul\b', 'heavy weapon'),
]

THROWN_REPLACEMENTS = [
    (r'\bthe javelin\b', 'the projectile'),
    (r'\bjavelin\b', 'projectile'),
    (r'\bthe throwing knife\b', 'the thrown blade'),
    (r'\bthrowing knife\b', 'thrown blade'),
    (r'\bthe shuriken\b', 'the thrown blade'),
    (r'\bshuriken\b', 'thrown blade'),
    (r'\bthe chakram\b', 'the thrown disc'),
    (r'\bchakram\b', 'thrown disc'),
    (r'\bthe dart\b', 'the projectile'),
    (r'\bdart\b', 'projectile'),
    # Specific thrown weapons
    (r'\bthe throwing axe\b', 'the thrown weapon'),
    (r'\bthrowing axe\b', 'thrown weapon'),
    (r'\bthe hatchet\b', 'the thrown axe'),
    (r'\bhatchet\b', 'thrown axe'),
    (r'\bthe trident\b', 'the thrown spear'),
    (r'\btrident\b', 'thrown spear'),
]

FIREARM_REPLACEMENTS = [
    (r'\bthe pistol\b', 'the firearm'),
    (r'\bpistol\b', 'firearm'),
    (r'\bthe musket\b', 'the firearm'),
    (r'\bmusket\b', 'firearm'),
    (r'\bthe rifle\b', 'the firearm'),
    (r'\brifle\b', 'firearm'),
    (r'\bthe arquebus\b', 'the firearm'),
    (r'\barquebus\b', 'firearm'),
    (r'\bthe blunderbuss\b', 'the firearm'),
    (r'\bblunderbuss\b', 'firearm'),
]

BOW_REPLACEMENTS = [
    (r'\bthe longbow\b', 'the bow'),
    (r'\blongbow\b', 'bow'),
    (r'\bthe shortbow\b', 'the bow'),
    (r'\bshortbow\b', 'bow'),
    (r'\bthe composite bow\b', 'the bow'),
    (r'\bcomposite bow\b', 'bow'),
    (r'\bthe recurve\b', 'the bow'),
    (r'\brecurve\b', 'bow'),
]

CROSSBOW_REPLACEMENTS = [
    (r'\bthe heavy crossbow\b', 'the crossbow'),
    (r'\bheavy crossbow\b', 'crossbow'),
    (r'\bthe light crossbow\b', 'the crossbow'),
    (r'\blight crossbow\b', 'crossbow'),
    (r'\bthe hand crossbow\b', 'the crossbow'),
    (r'\bhand crossbow\b', 'crossbow'),
    (r'\bthe arbalest\b', 'the crossbow'),
    (r'\barbalest\b', 'crossbow'),
]

UNARMED_REPLACEMENTS = [
    # Remove cultural/regional references
    (r'\bPersian precision\b', 'precise technique'),
    (r'\bPersian cavalry precision\b', 'mounted precision'),
    (r'\bPersian finality\b', 'decisive force'),
    (r'\bScythian savagery\b', 'brutal force'),
    (r'\bKorean perfection\b', 'perfect technique'),
    (r'\bSwiss precision\b', 'precise technique'),
    # Foreign compound weapon names that were already partially replaced
    (r'\bpalm strike-e-zin\b', 'palm strike'),
    (r'\btail strike\b', 'tail attack'),
    (r'\bflowing strike\b', 'flowing attack'),
    (r'\bhaymaker strike-fist\b', 'heavy strike'),
    # Remove hammer references from unarmed file
    (r'\bthe splitting maul\b', 'the heavy strike'),
    (r'\bsplitting maul\b', 'heavy strike'),
    # Remove polearm references from unarmed file
    (r'\bthe bite trident-strike\b', 'the triple strike'),
    (r'\bbite trident-strike\b', 'triple strike'),
    (r'\bthe halberd\b', 'the weapon'),
    (r'\bhalberd\b', 'weapon'),
    # Remove axe references from unarmed file
    (r'\bthe tomahawk\b', 'the strike'),
    (r'\btomahawk\b', 'strike'),
]

# Map files to their replacement rules
FILE_REPLACEMENTS = {
    'data/combat/openings/melee/sword.json': SWORD_REPLACEMENTS,
    'data/combat/openings/melee/hammer.json': HAMMER_REPLACEMENTS,
    'data/combat/openings/melee/spear.json': SPEAR_REPLACEMENTS,
    'data/combat/openings/melee/dagger.json': DAGGER_REPLACEMENTS,
    'data/combat/openings/melee/axe.json': AXE_REPLACEMENTS,
    'data/combat/openings/melee/unarmed.json': UNARMED_REPLACEMENTS,
    'data/combat/openings/ranged/thrown.json': THROWN_REPLACEMENTS,
    'data/combat/openings/ranged/firearm.json': FIREARM_REPLACEMENTS,
    'data/combat/openings/ranged/bow.json': BOW_REPLACEMENTS,
    'data/combat/openings/ranged/crossbow.json': CROSSBOW_REPLACEMENTS,
}

def apply_replacements(text, replacements):
    """Apply all replacement patterns to text (case-insensitive)."""
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text

def fix_weapon_file(filepath, replacements):
    """Fix a single weapon opening file."""
    path = Path(filepath)
    if not path.exists():
        print(f"⚠️  Skipping {filepath} (not found)")
        return 0

    print(f"🔧 Processing {filepath}...")

    # Load JSON
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Track changes
    changes = 0

    # Process all strings in the JSON structure
    def process_value(value):
        nonlocal changes
        if isinstance(value, str):
            new_value = apply_replacements(value, replacements)
            if new_value != value:
                changes += 1
            return new_value
        elif isinstance(value, list):
            return [process_value(item) for item in value]
        elif isinstance(value, dict):
            return {k: process_value(v) for k, v in value.items()}
        return value

    # Apply replacements
    fixed_data = process_value(data)

    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(fixed_data, f, indent=2, ensure_ascii=False)

    print(f"   ✅ Made {changes} replacements")
    return changes

def main():
    """Fix all weapon opening files."""
    print("=" * 60)
    print("Fixing Specific Weapon References in Opening Files")
    print("=" * 60)
    print()

    total_changes = 0

    for filepath, replacements in FILE_REPLACEMENTS.items():
        changes = fix_weapon_file(filepath, replacements)
        total_changes += changes
        print()

    print("=" * 60)
    print(f"✅ Complete! Made {total_changes} total replacements")
    print("=" * 60)

if __name__ == '__main__':
    main()

# Add these to existing replacements
import sys

# Monkey-patch to add more replacements
AXE_REPLACEMENTS_EXTRA = [
    (r'\bThe pollaxe head\b', 'The axe head'),
    (r'\bthe pollaxe head\b', 'the axe head'),
    (r'\bThe pollaxe\b', 'The polearm'),
    (r'\bthe pollaxe\b', 'the polearm'),
    (r'\bpollaxe\b', 'polearm'),
    (r'\bthe battle axe head\b', 'the axe head'),
    (r'\bbattle axe head\b', 'axe head'),
    (r'\bperfect savage technique\b', 'perfect brutal technique'),
    (r'\bsavage technique\b', 'brutal technique'),
]

DAGGER_REPLACEMENTS_EXTRA = [
    (r'\bperfect savage technique\b', 'perfect brutal technique'),
    (r'\bsavage technique\b', 'brutal technique'),
]

UNARMED_REPLACEMENTS_EXTRA = [
    (r'\bperfect savage technique\b', 'perfect brutal technique'),
    (r'\bsavage technique\b', 'brutal technique'),
]

# Insert these at the beginning of the existing replacement lists
FILE_REPLACEMENTS['data/combat/openings/melee/axe.json'] = AXE_REPLACEMENTS_EXTRA + FILE_REPLACEMENTS['data/combat/openings/melee/axe.json']
FILE_REPLACEMENTS['data/combat/openings/melee/dagger.json'] = DAGGER_REPLACEMENTS_EXTRA + FILE_REPLACEMENTS['data/combat/openings/melee/dagger.json']
FILE_REPLACEMENTS['data/combat/openings/melee/unarmed.json'] = UNARMED_REPLACEMENTS_EXTRA + FILE_REPLACEMENTS['data/combat/openings/melee/unarmed.json']
