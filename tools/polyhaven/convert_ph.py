# Poly Haven glTF (1k) -> phone-sized GLB for Previ-O props, plus a catalogue thumbnail and the real size.
# usage: venv/bin/python convert_ph.py <ph dir> <out dir> <thumb dir> [app_type ...]
import bpy, bmesh, json, math, os, sys
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from picks import PICKS

SRC, OUT, THUMB = sys.argv[1:4]
ONLY = set(sys.argv[4:])
MAX_TRIS = 20000
# files that hold several versions side by side: keep one (by object name); and one file modelled at 10x
KEEP = { 'crate': lambda n: n.endswith('_a'), 'acunit': lambda n: 'rust' not in n, 'trashcan': lambda n: 'rust' not in n, 'floodlight': lambda n: 'standing_double_a' in n }
SCALE = { 'shelfrack': 0.1 }
TEX = 512
os.makedirs(OUT, exist_ok=True); os.makedirs(THUMB, exist_ok=True)
meta_path = os.path.join(OUT, 'ph_meta.json')
meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)

def convert(app, pid):
    reset()
    d = os.path.join(SRC, pid)
    g = [f for f in os.listdir(d) if f.endswith('.gltf')][0]
    bpy.ops.import_scene.gltf(filepath=os.path.join(d, g))
    keep = KEEP.get(app)
    if keep:
        for o in list(bpy.context.scene.objects):
            if not keep(o.name): bpy.data.objects.remove(o, do_unlink=True)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in list(bpy.context.scene.objects):
        if o.type != 'MESH': o.hide_set(False)
    # bake every transform (and parent) into the meshes, then make one object
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    bpy.ops.object.make_single_user(object=True, obdata=True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    for o in list(bpy.context.scene.objects):
        if o is not ob: bpy.data.objects.remove(o, do_unlink=True)
    if app in SCALE: ob.data.transform(__import__('mathutils').Matrix.Scale(SCALE[app], 4)); ob.data.update(); bpy.context.view_layer.update()
    n0 = tris(ob)
    if n0 > MAX_TRIS:
        m = ob.modifiers.new('dec', 'DECIMATE'); m.ratio = MAX_TRIS / n0; m.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=m.name)
    # floor centre at the origin
    bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    lo = Vector((min(v.x for v in bb), min(v.y for v in bb), min(v.z for v in bb)))
    hi = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
    off = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    ob.data.transform(__import__('mathutils').Matrix.Translation(-off)); ob.location = (0, 0, 0)
    size = hi - lo
    bpy.ops.object.shade_smooth_by_angle() if hasattr(bpy.ops.object, 'shade_smooth_by_angle') else None
    # phone-sized textures
    for img in bpy.data.images:
        if img.size[0] > TEX or img.size[1] > TEX:
            img.scale(min(TEX, img.size[0]), min(TEX, img.size[1]))
    out = os.path.join(OUT, app + '.glb')
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=82, use_selection=False,
                              export_apply=True, export_animations=False, export_cameras=False, export_lights=False, export_yup=True)
    thumb(ob, size, os.path.join(THUMB, app + '.png'))
    # Blender x = app x, Blender -y = app forward (+z), Blender z = up
    meta[app] = { 'pid': pid, 'w': round(size.x, 3), 'd': round(size.y, 3), 'h': round(size.z, 3), 'tris': tris(ob), 'tris0': n0, 'kb': os.path.getsize(out) // 1024 }
    print(app, meta[app], flush=True)

def thumb(ob, size, path):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 24; sc.cycles.device = 'CPU'; sc.cycles.use_denoising = False
    sc.render.resolution_x, sc.render.resolution_y = 240, 168; sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'Standard'
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.75, 0.78, 0.82, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 0.9
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.2; so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(50), math.radians(10), math.radians(-35))
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    az, el = math.radians(35), math.radians(26)   # front-right, from above, like the app's own thumbnails
    dirv = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    c = Vector((0, 0, size.z / 2)); co.location = c + dirv * 20
    co.rotation_euler = (-dirv).to_track_quat('-Z', 'Y').to_euler()
    # fit: project the box corners on the view plane
    import itertools
    R = co.rotation_euler.to_matrix(); rx, ry = R.col[0], R.col[1]
    pts = [Vector((x, y, z)) for x, y, z in itertools.product((-size.x / 2, size.x / 2), (-size.y / 2, size.y / 2), (0, size.z))]
    us = [(p - c).dot(rx) for p in pts]; vs = [(p - c).dot(ry) for p in pts]
    cam.ortho_scale = max((max(us) - min(us)) * 1.12, (max(vs) - min(vs)) * 1.12 * 240 / 168)
    co.location += rx * (max(us) + min(us)) / 2 + ry * (max(vs) + min(vs)) / 2
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

for app, (pid, name, grp) in PICKS.items():
    if ONLY and app not in ONLY: continue
    try: convert(app, pid)
    except Exception as e: print('FAILED', app, pid, repr(e), flush=True)
    json.dump(meta, open(meta_path, 'w'), indent=1, ensure_ascii=False)
