# Hair clumps -> one smooth mass (life-sim game hair): voxel remesh, smooth, decimate, keep the original vertex colours.
# usage: venv/bin/python hair_remesh.py <out dir> <voxel m> <max tris> <hair.glb ...>
import bpy, os, sys
out, voxel, max_tris = sys.argv[1], float(sys.argv[2]), int(sys.argv[3])
os.makedirs(out, exist_ok=True)
for f in sys.argv[4:]:
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=f)
    src = [x for x in bpy.context.scene.objects if x.type == 'MESH'][0]
    bpy.context.view_layer.objects.active = src; src.select_set(True)
    bpy.ops.object.duplicate(); ob = bpy.context.view_layer.objects.active
    ob.data.remesh_voxel_size = voxel; ob.data.use_remesh_fix_poles = True
    bpy.ops.object.voxel_remesh()
    sm = ob.modifiers.new('sm', 'CORRECTIVE_SMOOTH') if False else ob.modifiers.new('sm', 'SMOOTH'); sm.factor = 0.5; sm.iterations = int(os.environ.get('HAIR_SMOOTH', '3'))
    bpy.ops.object.modifier_apply(modifier='sm')
    n = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if n > max_tris:
        d = ob.modifiers.new('dec', 'DECIMATE'); d.ratio = max_tris / n; bpy.ops.object.modifier_apply(modifier='dec')
    # the original's vertex colours, onto the new surface
    ob.data.color_attributes.new('Color', 'FLOAT_COLOR', 'POINT')
    dt = ob.modifiers.new('dt', 'DATA_TRANSFER'); dt.object = src; dt.use_vert_data = True; dt.data_types_verts = {'COLOR_VERTEX'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vcol_vert_select_src = 'ALL'; dt.layers_vcol_vert_select_dst = 'NAME'
    bpy.ops.object.modifier_apply(modifier='dt')
    for p in ob.data.polygons: p.use_smooth = True
    bpy.data.objects.remove(src, do_unlink=True)
    ob.name = ob.data.name = os.path.basename(f)[:-4].split('_')[-1]
    bpy.ops.object.select_all(action='SELECT')
    o = os.path.join(out, os.path.basename(f))
    bpy.ops.export_scene.gltf(filepath=o, export_format='GLB', use_selection=True, export_normals=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False,
                              export_materials='NONE', export_yup=True, export_extras=True)
    print(os.path.basename(f), 'tris', sum(len(p.vertices) - 2 for p in ob.data.polygons), 'kb', os.path.getsize(o) // 1024, flush=True)
