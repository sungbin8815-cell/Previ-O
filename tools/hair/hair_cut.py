# Blunt cuts for game-style hair: a straight fringe at brow height and straight ends, instead of jagged strand tips.
# usage: venv/bin/python hair_cut.py <out dir> <hair.glb ...>
# Works in the file's own space (glTF: y up, z forward) using the head measure stored in the file (C, W, H, D).
import bpy, bmesh, json, os, sys
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
NO_FRINGE = {'part', 'pony', 'bun', 'buzz', 'thin', 'twin'}   # styles swept back or off the face: leave the front alone
for f in sys.argv[2:]:
    style = os.path.basename(f)[:-4].split('_')[-1]
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=f)
    ob = [x for x in bpy.context.scene.objects if x.type == 'MESH'][0]
    ref = json.loads(ob.get('previo') or [x for x in bpy.context.scene.objects if x.get('previo')][0]['previo'])
    C, W, H, D = ref['C'], ref['W'], ref['H'], ref['D']
    # Blender is z-up: glTF (x, y, z) -> Blender (x, -z, y)
    cy, cz = C[1], C[2]; ey = cy - 0.25 * H            # eye height (hairMeasure: cy = ey + 0.2 (top - ey), H = top - cy)
    fringe = ey + 0.011                                   # just under the brows
    M = ob.matrix_world; Mi = M.inverted(); me = ob.data; bm = bmesh.new(); bm.from_mesh(me)
    ys = [(M @ v.co).z for v in bm.verts]; low = min(ys); ends = low + 0.016
    nf = ne = 0
    for v in bm.verts:
        w = M @ v.co; x, y, z = w.x, w.z, -w.y             # back to glTF axes
        if style not in NO_FRINGE:
            sm = lambda a, b, t: (lambda u: u * u * (3 - 2 * u))(min(1, max(0, (t - a) / (b - a))))
            wx = 1 - sm(0.5 * W, 0.78 * W, abs(x - C[0])); wz = sm(cz + 0.3 * D, cz + 0.6 * D, z); wy = 1 - sm(ey + 0.085, ey + 0.125, y)
            k = wx * wz * wy
            if k > 0:
                y -= 0.075 * k; z += 0.024 * k                    # bring the fringe down, a little off the brow bone
                if y < fringe and wx > 0.5: y = fringe; nf += 1   # and cut it straight
                elif y < fringe: y = fringe + (y - fringe) * 0.3
        if y < ends and not (z > cz + 0.3 * D and abs(x - C[0]) < 0.66 * W): y = ends; ne += 1
        v.co = Mi @ __import__('mathutils').Vector((x, -z, y))
    bm.to_mesh(me); bm.free()
    bpy.ops.object.select_all(action='SELECT')
    o = os.path.join(out, os.path.basename(f))
    bpy.ops.export_scene.gltf(filepath=o, export_format='GLB', use_selection=True, export_normals=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False,
                              export_materials='NONE', export_yup=True, export_extras=True)
    print(os.path.basename(f), 'fringe verts', nf, 'end verts', ne, flush=True)
