#!/usr/bin/env python3
"""
export_atlas.py - stream "Angais/pixel-art-atlas-1.4m" (16x16 RGBA, CC0) and write a curated
atlas.png (16x16 cells, 64 columns) + meta.json ([{"subject","caption",...}]) for the game's
"Load atlas" button.

Selection rules (mirrors the in-game classifier):
  * >= 25% opaque pixels, >= 3 distinct colours, no isolated-noise sprites
  * dedupe by pixel hash, at most K sprites per subject
  * at least M sprites per role (CREATURE / HUMANOID / WEAPON / PROJECTILE / ARMOR / FOOD /
    GEM / KEY_OR_TOOL / FURNITURE / DECOR / TREASURE) when the stream provides them
  * roles come from SUBJECT keywords only (captions are unreliable)

Usage:
  pip install datasets pillow numpy
  python export_atlas.py --n 6000 --per-subject 4 --min-per-role 150 --max-scan 400000
"""
import argparse, json, hashlib, re, math, sys
from collections import defaultdict
import numpy as np
from PIL import Image
from datasets import load_dataset

W = lambda s: s.split()
KW = {
 'UNUSABLE': W('text letter number symbol logo icon emoji font digit cursor pixel texture pattern background border frame'),
 'WEAPON': W('sword blade axe dagger knife spear lance pike halberd wand staff rod stick club mace hammer bow crossbow boomerang shuriken scythe flail whip scepter katana saber rapier cutlass trident sickle machete cane baton cudgel javelin cleaver glaive claymore'),
 'PROJECTILE': W('arrow bolt fireball orb shard missile beam pellet bullet spark flame fire laser rocket bomb dart stone pebble snowball lightning meteor comet'),
 'ARMOR': W('helmet helm armor armour shield boots boot gloves glove gauntlet ring amulet necklace pendant cape cloak robe hat cap belt bracelet greaves chestplate breastplate pauldron mask tunic shirt pants vest coat scarf'),
 'FOOD': W('apple bread meat cheese potion elixir flask carrot cake pie cookie steak ham sausage egg milk wine beer grape berry cherry orange lemon banana pear melon pumpkin corn soup candy honey drumstick burger pizza taco sandwich'),
 'GEM': W('gem crystal ruby diamond emerald sapphire jewel pearl topaz amethyst opal gemstone'),
 'KEY_OR_TOOL': W('key lockpick shovel pickaxe lantern compass map book scroll tome letter paper rope tool wrench hoe saw pliers bucket flag candle telescope hourglass clock anchor'),
 'FURNITURE': W('table chair bed shelf barrel crate lamp bench desk cabinet door window vase pot cauldron bookshelf throne wardrobe sofa couch'),
 'TREASURE': W('coin chest crown ingot chalice trophy treasure gold goblet bag sack purse medal'),
 'DECOR': W('flower tree rock bush plant torch banner statue pillar column grass cactus fence sign tombstone grave stalagmite fountain boulder leaf log stump toy doll figurine plush house building castle tower tent car boat'),
 'HUMANOID': W('knight wizard mage sorcerer witch rogue thief assassin archer ranger hunter barbarian warrior fighter berserker priest cleric monk nun ninja samurai paladin soldier guard king queen prince princess elf dwarf pirate hero villager farmer merchant bard druid shaman necromancer jester gladiator viking'),
 'CREATURE': W('slime ooze blob bat spider skeleton zombie ghost imp demon hound hellhound angel harpy wisp eye eyeball jellyfish golem frog toad rabbit bunny beetle wolf worm maggot shroomling alien bird crow raven owl eagle hawk parrot duck chicken fish shark crab lobster snake serpent cobra dragon wyvern drake lizard gecko turtle tortoise bear lion tiger cat kitten dog puppy fox deer boar pig cow bull horse sheep goat mouse rat ant bee wasp fly moth butterfly scorpion centipede crawler gargoyle ghoul wraith specter spectre spirit phantom banshee vampire werewolf troll ogre goblin orc kobold gnoll minotaur centaur sphinx hydra kraken octopus squid mimic elemental beast monster creature sprite fiend devil gremlin yeti mummy lich cyclops giant bug insect larva grub snail slug leech monkey ape gorilla elephant rhino hippo crocodile alligator eel squirrel hedgehog badger otter beaver raccoon skunk bison camel llama dinosaur raptor'),
}
ORDER = ['UNUSABLE','WEAPON','PROJECTILE','ARMOR','FOOD','GEM','KEY_OR_TOOL','FURNITURE','TREASURE','DECOR','HUMANOID','CREATURE']
WORD2ROLE = {}
for r in ORDER:
    for w in KW[r]:
        WORD2ROLE.setdefault(w, r)

def sing(w):
    return w[:-1] if len(w) > 3 and w.endswith('s') and not w.endswith('ss') else w

def classify(subject):
    toks = [sing(t) for t in re.split(r'[^a-z]+', (subject or '').lower()) if t]
    if not toks:
        return 'UNUSABLE'
    role = WORD2ROLE.get(toks[-1])                      # head noun first
    if not role:
        for t in toks:                                  # then any object word
            r = WORD2ROLE.get(t)
            if r and r not in ('CREATURE', 'HUMANOID'):
                role = r; break
    if not role:
        for t in toks:                                  # then creature words
            r = WORD2ROLE.get(t)
            if r: role = r; break
    return role or 'DECOR'

def metrics(a):
    """a: HxWx4 uint8. returns dict or None if rejected"""
    op = a[..., 3] > 127
    n = int(op.sum())
    if n < 64:                                           # >= 25% of 256 pixels
        return None
    rgb = (a[..., :3] >> 4).astype(np.int32)
    cols = len({(int(r), int(g), int(b)) for r, g, b in rgb[op]})
    if cols < 3:
        return None
    ys, xs = np.where(op)
    w, h = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
    pad = np.pad(op, 1)
    nb = sum(np.roll(np.roll(pad, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dx or dy)[1:-1, 1:-1]
    noise = int((op & (nb == 0)).sum())
    if noise > 3:                                        # isolated-noise sprites
        return None
    mirror = op[:, ::-1]
    sym = float((op & mirror).sum()) / n
    return dict(n=n, cols=cols, w=int(w), h=int(h), fill=n / (w * h), sym=sym)

def score(m):
    return m['cols'] * 2 + m['sym'] * 20 + m['fill'] * 20

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--n', type=int, default=6000, help='sprites in atlas')
    ap.add_argument('--per-subject', type=int, default=4, help='max sprites per subject (K)')
    ap.add_argument('--min-per-role', type=int, default=150, help='min sprites per role (M)')
    ap.add_argument('--max-scan', type=int, default=400000, help='max rows to stream')
    ap.add_argument('--dataset', default='Angais/pixel-art-atlas-1.4m')
    ap.add_argument('--out', default='atlas.png')
    ap.add_argument('--meta', default='meta.json')
    ap.add_argument('--seed', type=int, default=1)
    args = ap.parse_args()

    ds = load_dataset(args.dataset, split='train', streaming=True).shuffle(seed=args.seed, buffer_size=20000)
    seen = set()
    per_subject = defaultdict(int)
    cand = []                                            # (score, role, subject, caption, row_id, array)
    per_role_cap = max(args.min_per_role * 3, args.n // 4)
    role_count = defaultdict(int)
    scanned = 0
    for row in ds:
        scanned += 1
        if scanned > args.max_scan:
            break
        if scanned % 5000 == 0:
            print(f'scanned {scanned}, candidates {len(cand)}', file=sys.stderr)
        subject = row.get('subject') or ''
        role = classify(subject)
        if role == 'UNUSABLE' or per_subject[subject] >= args.per_subject or role_count[role] >= per_role_cap:
            continue
        img = row['image'].convert('RGBA')
        if img.size != (16, 16):
            img = img.resize((16, 16), Image.NEAREST)
        a = np.array(img, dtype=np.uint8)
        h = hashlib.md5(a.tobytes()).hexdigest()
        if h in seen:
            continue
        m = metrics(a)
        if not m:
            continue
        seen.add(h)
        per_subject[subject] += 1
        role_count[role] += 1
        cand.append((score(m), role, subject, row.get('caption', ''), row.get('row_id', scanned), a))
        if len(cand) >= args.n * 3 and all(role_count[r] >= args.min_per_role for r in ORDER[1:]):
            break

    # final pick: guarantee M per role, then fill by global score
    cand.sort(key=lambda c: -c[0])
    chosen, used = [], set()
    for r in ORDER[1:]:
        k = 0
        for i, c in enumerate(cand):
            if c[1] == r and i not in used:
                chosen.append(c); used.add(i); k += 1
                if k >= args.min_per_role: break
    for i, c in enumerate(cand):
        if len(chosen) >= args.n: break
        if i not in used:
            chosen.append(c); used.add(i)
    chosen = chosen[:args.n]

    cols = 64
    rows = math.ceil(len(chosen) / cols)
    atlas = Image.new('RGBA', (cols * 16, rows * 16), (0, 0, 0, 0))
    meta = []
    for i, c in enumerate(chosen):
        atlas.paste(Image.fromarray(c[5], 'RGBA'), ((i % cols) * 16, (i // cols) * 16))
        meta.append({'subject': c[2], 'caption': c[3], 'role': c[1], 'row_id': c[4]})
    atlas.save(args.out)
    with open(args.meta, 'w', encoding='utf-8') as f:
        json.dump(meta, f)
    by_role = defaultdict(int)
    for c in chosen: by_role[c[1]] += 1
    print(f'wrote {args.out} ({len(chosen)} sprites) and {args.meta}; per role: {dict(by_role)}')

if __name__ == '__main__':
    main()
