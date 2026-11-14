# Wire the converted Poly Haven props into index.html: catalogue sizes, groups, model list, thumbnails, AI-prompt names.
import json, os, re, shutil, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from picks import PICKS
from names_en import EN

HERE = os.path.dirname(os.path.abspath(__file__)); REPO = sys.argv[1]
meta = json.load(open(os.path.join(HERE, 'out', 'ph_meta.json')))
P = os.path.join(REPO, 'index.html'); s = open(P, encoding='utf-8').read()
def rep(a, b):
    global s
    if s.count(a) != 1: sys.exit(f'anchor x{s.count(a)}: {a[:80]!r}')
    s = s.replace(a, b)

os.makedirs(os.path.join(REPO, 'props', 'thumbs'), exist_ok=True)
lin = lambda v: (v / 255) / 12.92 if v <= 10 else (((v / 255) + 0.055) / 1.055) ** 2.4
rows, done = [], []
for app, (pid, name, grp) in PICKS.items():
    m = meta.get(app)
    if not m: print('skip (not converted)', app); continue
    shutil.copy(os.path.join(HERE, 'out', app + '.glb'), os.path.join(REPO, 'props', app + '.glb'))
    im = Image.open(os.path.join(HERE, 'thumbs', app + '.png')).convert('RGBA')
    im.resize((160, 112), Image.LANCZOS).save(os.path.join(REPO, 'props', 'thumbs', app + '.webp'), quality=82, method=6)
    px = [p for p in im.getdata() if p[3] > 200]; avg = [sum(p[i] for p in px) / len(px) for i in range(3)] if px else [128] * 3
    rgb = [round(lin(v), 3) for v in avg]
    done.append(app)
    if name is None:   # an existing catalogue type: keep its name and colour, take the model's real size
        s, n = re.subn(r"(\b%s: \{ name: '[^']*', )w: [\d.]+, d: [\d.]+, h: [\d.]+" % app, r"\g<1>w: %s, d: %s, h: %s" % (m['w'], m['d'], m['h']), s)
        if n != 1: sys.exit('size update failed ' + app)
    else:
        rows.append(f"  {app}: {{ name: '{name}', w: {m['w']}, d: {m['d']}, h: {m['h']}, rgb: [{rgb[0]}, {rgb[1]}, {rgb[2]}] }},")

# catalogue entries for the new pieces
rep("""  // drawn with 짓기 (build mode)""", "  // scanned models (Poly Haven, CC0), converted for phones: the size is the model's own\n" + "\n".join(rows) + "\n  // drawn with 짓기 (build mode)")
# they load as models
rep("""  'shelf', 'tv', 'plant', 'rug', 'floorlamp', 'kitchen', 'fridge', 'bench', 'lamp', 'car', 'bin', 'cone', 'hydrant', 'bollard']);""",
    """  'shelf', 'tv', 'plant', 'rug', 'floorlamp', 'kitchen', 'fridge', 'bench', 'lamp', 'car', 'bin', 'cone', 'hydrant', 'bollard',
  ...PH_PROPS]);""")
rep("""const PROPS_ON = !/[?&]props=0\\b/.test(location.search), PROP_V = '?v=2';""",
    """const PROPS_ON = !/[?&]props=0\\b/.test(location.search), PROP_V = '?v=3';""")
rep("""const PROPS = {""", "// pieces with a scanned model and a rendered catalogue picture (props/<type>.glb, props/thumbs/<type>.webp)\nconst PH_PROPS = %s;\nconst PROPS = {" % json.dumps(done).replace('"', "'").replace(',', ', '))
# catalogue groups
add = {}
for app, (pid, name, grp) in PICKS.items():
    if name and app in done: add.setdefault(grp, []).append(app)
for grp, ids in add.items():
    m = re.search(r"\['%s', \[([^\]]*)\]\]" % re.escape(grp), s)
    if not m: sys.exit('group not found ' + grp)
    s = s[:m.end(1)] + ', ' + ', '.join(f"'{i}'" for i in ids) + s[m.end(1):]
# AI prompt names
rep("""const EN_PROP = { wall: 'a wall',""", "const EN_PROP = { " + ", ".join(f"{k}: '{EN[k]}'" for k in done if PICKS[k][1]) + ", wall: 'a wall',")
# the catalogue shows the rendered picture for scanned pieces
rep("""    requestAnimationFrame(() => { const src = propThumb(e.target.dataset.thumb); if (src) e.target.style.backgroundImage = `url(${src})`; }); }), { rootMargin: '120px' }) : null;""",
    """    requestAnimationFrame(() => { const src = thumbSrc(e.target.dataset.thumb); if (src) e.target.style.backgroundImage = `url(${src})`; }); }), { rootMargin: '120px' }) : null;""")
rep("""  document.querySelectorAll('#propAdd [data-thumb]').forEach(el => io ? io.observe(el) : (el.style.backgroundImage = `url(${propThumb(el.dataset.thumb)})`)); }""",
    """  document.querySelectorAll('#propAdd [data-thumb]').forEach(el => io ? io.observe(el) : (el.style.backgroundImage = `url(${thumbSrc(el.dataset.thumb)})`)); }""")
rep("""$('#propAdd').innerHTML = PROP_GROUPS.map(""", """const thumbSrc = t => PROPS_ON && PH_PROPS.includes(t) ? 'props/thumbs/' + t + '.webp' + PROP_V : propThumb(t);
$('#propAdd').innerHTML = PROP_GROUPS.map(""")
# scanned materials carry their own textures: the role tweaks (grain, weave, brushed metal) are for the Blender-made pieces only
rep("""  if (m.userData.prop) return m; m.userData.prop = m.userData.shared = true; const role = (m.name || '').split('_')[0];""",
    """  if (m.userData.prop) return m; m.userData.prop = m.userData.shared = true; const role = m.map ? '' : (m.name || '').split('_')[0];""")
open(P, 'w', encoding='utf-8').write(s)
# triangle counts alongside the others
pj = os.path.join(REPO, 'props', 'props.json'); tri = json.load(open(pj)) if os.path.exists(pj) else {}
for k in done: tri[k] = meta[k]['tris']
json.dump(tri, open(pj, 'w'), indent=0)
print('integrated', len(done), 'new rows', len(rows))
