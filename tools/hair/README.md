# Hair pipeline

Blender as a Python module (`pip install bpy`).

1. `hair_remesh.py <out> 0.0032 22000 <files>` — merge strand clumps into one smooth mass (keeps vertex colours and the `previo` head measure).
   Not for scalp-hugging styles (buzz, thin, bun, pony, twin): their layer is thinner than the voxel and breaks into holes — those stay as modelled.
2. `hair_cut.py <out> <files>` — a blunt fringe at brow height (pulled down from the hairline, pushed clear of the brow bone) and straight ends.
