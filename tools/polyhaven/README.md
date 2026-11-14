# Poly Haven props → Previ-O

CC0 models from polyhaven.com, converted for phones (one mesh, ≤20k triangles, 512 px JPEG textures, floor-centred, front = +Z).

1. `picks.py` — app type → Poly Haven id, Korean name, catalogue group (name `None` = replace an existing type's box shape)
2. `python3 dl.py ph/` — download the 1k glTF of each pick (uses curl)
3. `venv/bin/python convert_ph.py ph/ out/ thumbs/ [types…]` — Blender as a Python module (`pip install bpy`): GLB + 240×168 thumbnail + `out/ph_meta.json` (real size)
4. `python3 integrate.py <repo>` — copies `props/<type>.glb`, `props/thumbs/<type>.webp`, and adds the catalogue entries to `index.html` (run once per new set)
