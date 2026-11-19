# Rig a standing, A-posed, front-facing (-Y) character mesh: joints measured from the mesh itself, a VRM-named skeleton, automatic
# (heat) skin weights, arms lifted to a T-pose and baked as rest, exported as a VRM 1.0 the app poses like any VRM.
# usage: venv/bin/python h3d_rig.py <painted.glb> <out.vrm> <name>
import bpy, sys, os, json, struct, math
from mathutils import Vector, Matrix
src, out, name = sys.argv[1:4]; TMP = out + '.glb'
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
ob = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
P0 = [v.co for v in ob.data.vertices]; off = Vector(((min(p.x for p in P0) + max(p.x for p in P0)) / 2, (min(p.y for p in P0) + max(p.y for p in P0)) / 2, min(p.z for p in P0)))
ob.data.transform(Matrix.Translation(-off)); ob.data.update()   # feet on the floor at the origin (the app measures heights from y = 0)
V = [v.co.copy() for v in ob.data.vertices]
zmin = min(v.z for v in V); zmax = max(v.z for v in V); Hh = zmax - zmin; cx = (min(v.x for v in V) + max(v.x for v in V)) / 2
Z = lambda f: zmin + Hh * f
def band(f, w=0.01): return [v for v in V if abs(v.z - Z(f)) < Hh * w]
def mid(vs): return sum(vs, Vector()) / len(vs) if vs else Vector()
# torso half-width at chest height: the gap between body and arms at z = 0.70
row = sorted(v.x for v in band(0.70)); gaps = [(row[i + 1] - row[i], row[i]) for i in range(len(row) - 1)]
L = [x for x in row if x < cx]; R = [x for x in row if x > cx]
def inner_gap(xs, side):   # the widest jump between consecutive points on one side: between the torso and the arm
    xs = sorted(xs, key=lambda x: abs(x - cx)); best = (0, None)
    for a, b in zip(xs, xs[1:]):
        if abs(b - a) > best[0]: best = (abs(b - a), (a + b) / 2)
    return best[1]
tL, tR = inner_gap(L, -1), inner_gap(R, 1); half = (abs(tL - cx) + abs(tR - cx)) / 2; print('torso half', round(half, 3))
def legs(f):
    vs = [v for v in band(f, 0.012) if abs(v.x - cx) < half * 1.05]; l = [v for v in vs if v.x < cx]; r = [v for v in vs if v.x > cx]; return mid(l), mid(r)
hipL, hipR = legs(0.47); kneeL, kneeR = legs(0.27); ankL, ankR = legs(0.055)
def depth(f): vs = band(f, 0.015); vs = [v for v in vs if abs(v.x - cx) < half]; return mid(vs).y if vs else 0
J = {}
J['hips'] = Vector((cx, depth(0.52), Z(0.52))); J['spine'] = Vector((cx, depth(0.58), Z(0.58))); J['chest'] = Vector((cx, depth(0.66), Z(0.66)))
J['upperChest'] = Vector((cx, depth(0.73), Z(0.73))); J['neck'] = Vector((cx, depth(0.82), Z(0.82))); J['head'] = Vector((cx, depth(0.855), Z(0.855))); J['headTop'] = Vector((cx, depth(0.9), zmax))
for s, hip, knee, ank in (('left', hipL if True else 0, kneeL, ankL), ('right', hipR, kneeR, ankR)): pass
# the character's left is +x when it faces -y (its right hand is on the image's left)
for s, sx in (('left', 1), ('right', -1)):
    pick = lambda a, b: a if (a.x - cx) * sx > 0 else b
    hip, knee, ank = pick(hipL, hipR), pick(kneeL, kneeR), pick(ankL, ankR)
    J[s + 'UpperLeg'] = Vector((hip.x, hip.y, Z(0.49))); J[s + 'LowerLeg'] = knee; J[s + 'Foot'] = Vector((ank.x, ank.y, Z(0.045)))
    toe = [v for v in V if v.z < Z(0.03) and (v.x - cx) * sx > 0]; tip = min(toe, key=lambda v: v.y) if toe else ank
    J[s + 'Toes'] = Vector((ank.x, (ank.y + tip.y) / 2, Z(0.015))); J[s + 'ToesEnd'] = Vector((ank.x, tip.y, Z(0.01)))
    # the arm: points beyond the torso, above the hips; walk outwards along x and take each slice's centre
    arm = [v for v in V if (v.x - cx) * sx > half * 1.05 and v.z > Z(0.45)]
    ext = max(abs(v.x - cx) for v in arm)
    def at(t):   # centre of the arm at a fraction t of the way from the shoulder (x = half) to the fingertips
        x = cx + sx * (half + (ext - half) * t); sl = [v for v in arm if abs(v.x - x) < (ext - half) * 0.04]; return mid(sl)
    sh = Vector((cx + sx * half * 0.92, J['upperChest'].y, Z(0.80)))
    J[s + 'Shoulder'] = Vector((cx + sx * half * 0.25, J['upperChest'].y, Z(0.79))); J[s + 'UpperArm'] = sh
    J[s + 'LowerArm'] = at(0.42); J[s + 'Hand'] = at(0.78); J[s + 'HandEnd'] = at(0.97)
for k in sorted(J): print(k, tuple(round(c, 3) for c in J[k]))
# parts for recolouring: each face goes to top / bottom / shoes, or stays as is (skin, hair, face); judged by height and by its colour
# in the texture against references sampled at the chest, the thighs and the cheek. Each part is its own material, named the way
# VRoid names them (Tops_/Bottoms_/Shoes_) so the app's colour picker finds it, with the part's mean brightness as 'ref'.
import bmesh, numpy as np
from PIL import Image
mat0 = ob.data.materials[0]; tnode = next(n for n in mat0.node_tree.nodes if n.type == 'TEX_IMAGE'); timg = tnode.image
tw, th = timg.size; T = np.array(timg.pixels[:], dtype=np.float32).reshape(th, tw, 4)[..., :3]
bm = bmesh.new(); bm.from_mesh(ob.data); uvl = bm.loops.layers.uv.active
def colour(f):
    u = sum(l[uvl].uv.x for l in f.loops) / len(f.loops); v = sum(l[uvl].uv.y for l in f.loops) / len(f.loops)
    return T[min(th - 1, max(0, int(v * th))), min(tw - 1, max(0, int(u * tw)))]
def ref(f0, f1, wide):
    cs = [colour(f) for f in bm.faces if Z(f0) < f.calc_center_median().z < Z(f1) and abs(f.calc_center_median().x - cx) < half * wide and f.normal.y < -0.5]
    return np.median(np.array(cs), 0) if cs else np.zeros(3)
rTop, rBot, rSkin = ref(0.66, 0.72, 0.5), ref(0.36, 0.42, 0.6), ref(0.88, 0.91, 0.15)
print('refs top', rTop.round(2), 'bottom', rBot.round(2), 'skin', rSkin.round(2))
parts = {'body': 0, 'top': 1, 'bottom': 2, 'shoes': 3}; lum = {k: [] for k in parts}
# the waistline: walking down the front centre, where the colour stops looking like the top and starts looking like the bottom
wz = Z(0.52)
for k in range(75, 30, -1):
    fs = [f for f in bm.faces if abs(f.calc_center_median().z - Z(k / 100)) < Hh * 0.006 and abs(f.calc_center_median().x - cx) < half * 0.3 and f.normal.y < -0.5]
    if fs and np.abs(np.median([colour(f) for f in fs], 0) - rBot).sum() < np.abs(np.median([colour(f) for f in fs], 0) - rTop).sum(): wz = Z(k / 100 + 0.005); break
print('waist at', round((wz - zmin) / Hh, 3))
# the sleeve end on each arm: walking out from the shoulder, where the colour turns from the top's to the skin's
ext = {sx: max(abs(v.x - cx) for v in V if (v.x - cx) * sx > half and v.z > Z(0.45)) for sx in (1, -1)}
sleeve = {}
for sx in (1, -1):
    sleeve[sx] = half
    for k in range(2, 40):
        x0 = half + (ext[sx] - half) * k / 40; fs = [f for f in bm.faces if abs(abs(f.calc_center_median().x - cx) - x0) < (ext[sx] - half) / 60 and (f.calc_center_median().x - cx) * sx > 0 and f.calc_center_median().z > Z(0.45)]
        if not fs: continue
        fs = [f for f in fs if f.normal.y < -0.3] or fs; mc = np.median([colour(f) for f in fs], 0); warm = lambda c: (c[0] - c[2]) / max(0.05, c.max())
        if abs(warm(mc) - warm(rSkin)) < abs(warm(mc) - warm(rTop)): break
        sleeve[sx] = x0
fr = max((sleeve[k] - half) / (ext[k] - half) for k in sleeve); sleeve = {k: half + (ext[k] - half) * fr for k in sleeve}   # clothes are symmetric: the longer reading wins
print('sleeve ends at', {k: round((v - half) / (ext[k] - half), 2) for k, v in sleeve.items()})
lab = {}
for f in bm.faces:
    m = f.calc_center_median(); z = m.z; c = colour(f); d = lambda r: float(np.abs(c - r).sum())
    arm = abs(m.x - cx) > half * (1.02 if z > Z(0.66) else 1.45) and z > Z(0.42)
    if z > Z(0.83): p = 'body'
    elif z < Z(0.055): p = 'shoes'
    elif arm: sx = 1 if m.x > cx else -1; p = 'top' if abs(m.x - cx) < sleeve[sx] else 'body'
    else: p = 'top' if z > wz else 'bottom'
    if not arm and z > Z(0.74) and d(rSkin) < d(rTop) * 0.7: p = 'body'        # the neckline: skin above the collar
    lab[f.index] = p
for _ in range(0):   # arms: majority of the neighbours, so sleeves and skin form clean areas
    new = dict(lab)
    for f in bm.faces:
        m = f.calc_center_median()
        if not (abs(m.x - cx) > half * 1.02 and Z(0.42) < m.z < Z(0.83)): continue
        nb = [lab[g.index] for e in f.edges for g in e.link_faces if g is not f]; nb.append(lab[f.index])
        new[f.index] = max(set(nb), key=nb.count)
    lab = new
for f in bm.faces:
    p = lab[f.index]; f.material_index = parts[p]; lum[p].append(float(colour(f) @ np.array([0.299, 0.587, 0.114])))
FI = [f.material_index for f in bm.faces]
bm.to_mesh(ob.data); bm.free()
names = {'body': 'Body_00_SKIN', 'top': 'Tops_00_CLOTH', 'bottom': 'Bottoms_00_CLOTH', 'shoes': 'Shoes_00_CLOTH'}
ob.data.materials.clear()
for k in parts:
    m = mat0.copy(); m.name = names[k]; m['ref'] = round(max(0.03, float(np.mean(lum[k]))) if lum[k] else 0.5, 4); ob.data.materials.append(m)
ob.data.polygons.foreach_set('material_index', FI); ob.data.update()
print('part faces', {k: len(v) for k, v in lum.items()})
# skeleton
arm_d = bpy.data.armatures.new('rig'); rig = bpy.data.objects.new('rig', arm_d); bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='EDIT'); E = arm_d.edit_bones
def bone(n, a, b, parent=None, conn=False):
    e = E.new(n); e.head = J[a] if isinstance(a, str) else a; e.tail = J[b] if isinstance(b, str) else b
    if parent: e.parent = E[parent]; e.use_connect = conn
    return e
bone('hips', 'hips', 'spine'); bone('spine', 'spine', 'chest', 'hips', True); bone('chest', 'chest', 'upperChest', 'spine', True)
bone('upperChest', 'upperChest', 'neck', 'chest', True); bone('neck', 'neck', 'head', 'upperChest', True); bone('head', 'head', 'headTop', 'neck', True)
for s in ('left', 'right'):
    bone(s + 'UpperLeg', s + 'UpperLeg', s + 'LowerLeg', 'hips'); bone(s + 'LowerLeg', s + 'LowerLeg', s + 'Foot', s + 'UpperLeg', True)
    bone(s + 'Foot', s + 'Foot', s + 'Toes', s + 'LowerLeg', True); bone(s + 'Toes', s + 'Toes', s + 'ToesEnd', s + 'Foot', True)
    bone(s + 'Shoulder', s + 'Shoulder', s + 'UpperArm', 'upperChest'); bone(s + 'UpperArm', s + 'UpperArm', s + 'LowerArm', s + 'Shoulder', True)
    bone(s + 'LowerArm', s + 'LowerArm', s + 'Hand', s + 'UpperArm', True); bone(s + 'Hand', s + 'Hand', s + 'HandEnd', s + 'LowerArm', True)
for e in E: e.roll = 0
bpy.ops.object.mode_set(mode='OBJECT')
# skin: heat weights; meshes from image-to-3D are often not closed, so fall back to envelopes if heat fails
bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
vg = ob.vertex_groups; empty = sum(1 for v in ob.data.vertices if not v.groups); print('unweighted verts', empty, 'of', len(ob.data.vertices))
if empty > len(ob.data.vertices) * 0.02:
    for g in list(vg): vg.remove(g)
    mods = [m for m in ob.modifiers if m.type == 'ARMATURE']; ob.parent = None
    for m in mods: ob.modifiers.remove(m)
    bpy.ops.object.parent_set(type='ARMATURE_ENVELOPE'); print('fell back to envelope weights')
# T-pose: arms to horizontal, baked into the mesh and the rest pose
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE'); M = rig.matrix_world
for s in ('left', 'right'):
    pb = rig.pose.bones[s + 'UpperArm']
    for _ in range(3):
        h = M @ pb.head; e = M @ rig.pose.bones[s + 'LowerArm'].head; d = (e - h).normalized(); t = Vector((1 if d.x > 0 else -1, 0, 0))
        pb.matrix = (M.inverted() @ Matrix.Translation(h) @ d.rotation_difference(t).to_matrix().to_4x4() @ Matrix.Translation(-h) @ M) @ pb.matrix; bpy.context.view_layer.update()
    for nb in ('LowerArm', 'Hand'):   # straighten the forearm and hand along the arm too
        pb = rig.pose.bones[s + nb]; h = M @ pb.head; e = M @ pb.tail; d = (e - h).normalized(); t = Vector((1 if d.x > 0 else -1, 0, 0))
        pb.matrix = (M.inverted() @ Matrix.Translation(h) @ d.rotation_difference(t).to_matrix().to_4x4() @ Matrix.Translation(-h) @ M) @ pb.matrix; bpy.context.view_layer.update()
bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.view_layer.objects.active = ob
mod = next(m for m in ob.modifiers if m.type == 'ARMATURE'); keep = ob.modifiers.new('keep', 'ARMATURE'); keep.object = rig
bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.armature_apply(selected=False); bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=TMP, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=88, export_skins=True, export_animations=False, export_yup=True, export_extras=True)
b = open(TMP, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); rest = b[20 + jl:]
idx = {n.get('name'): i for i, n in enumerate(j['nodes'])}
hb = {k: {'node': idx[k]} for k in ['hips', 'spine', 'chest', 'upperChest', 'neck', 'head'] + [s + p for s in ('left', 'right') for p in ('UpperLeg', 'LowerLeg', 'Foot', 'Toes', 'Shoulder', 'UpperArm', 'LowerArm', 'Hand')] if k in idx}
j.setdefault('extensionsUsed', []).append('VRMC_vrm')
j.setdefault('extensions', {})['VRMC_vrm'] = {'specVersion': '1.0', 'meta': {'name': name, 'version': '1', 'authors': ['PREVIO'], 'licenseUrl': 'https://vrm.dev/licenses/1.0/', 'avatarPermission': 'everyone',
    'commercialUsage': 'corporation', 'creditNotation': 'unnecessary', 'allowRedistribution': True, 'modification': 'allowModificationRedistribution'}, 'humanoid': {'humanBones': hb}}
js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * ((4 - len(js) % 4) % 4)
open(out, 'wb').write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I', len(js)) + b'JSON' + js + rest); os.remove(TMP)
print(out, os.path.getsize(out) // 1024, 'KB', len(hb), 'bones')
