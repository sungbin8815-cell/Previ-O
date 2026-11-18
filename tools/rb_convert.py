# Microsoft Rocketbox avatar (FBX + TGA, MIT licence) -> a phone-sized VRM 1.0 the app loads like any VRM:
# one GLB with 1024 px textures, then the VRMC_vrm humanoid map (3ds Max biped bone names -> VRM bones) written into its JSON.
# usage: venv/bin/python rb_convert.py <avatar dir with Export/ and Textures/> <out.vrm> <display name>
import bpy, os, sys, json, struct
src, out, name = sys.argv[1], sys.argv[2], sys.argv[3]
av = os.path.basename(os.path.normpath(src)); tex = os.path.join(src, 'Textures'); TMP = out + '.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=os.path.join(src, 'Export', av + '.fbx'), automatic_bone_orientation=False)
def img(path, size=1024):
    if not os.path.exists(path): return None
    im = bpy.data.images.load(path); w, h = im.size
    if max(w, h) > size: im.scale(size * w // max(w, h), size * h // max(w, h))
    return im
# T-pose: lift each upper arm to horizontal in pose mode, bake that into the mesh and make it the rest pose (VRM's rest is a T-pose)
import math
from mathutils import Matrix, Vector
arm = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]; M = arm.matrix_world
BIP = next(b.name.split(' ')[0] for b in arm.data.bones if b.name.endswith(' Pelvis'))
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='POSE')
for S, sx in (('L', 1), ('R', -1)):
    pb = arm.pose.bones[BIP + ' %s UpperArm' % S]; h = M @ arm.data.bones[BIP + ' %s UpperArm' % S].head_local; e = M @ arm.data.bones[BIP + ' %s Forearm' % S].head_local
    for _ in range(3):
        h = M @ pb.head; e = M @ arm.pose.bones[BIP + ' %s Forearm' % S].head; d = (e - h).normalized(); ang = math.atan2(-d.z, abs(d.x))
        t = Vector((1 if d.x > 0 else -1, d.y, 0)).normalized(); q = d.rotation_difference(t).to_matrix().to_4x4()
        pb.matrix = (M.inverted() @ Matrix.Translation(h) @ q @ Matrix.Translation(-h) @ M) @ pb.matrix; bpy.context.view_layer.update()
    bpy.context.view_layer.update()
    e2 = M @ pb.tail; print('arm', S, 'now dz', round(((M @ arm.pose.bones[BIP + ' %s Forearm' % S].head) - h).z, 3))
bpy.ops.object.mode_set(mode='OBJECT')
for ob in [o for o in bpy.context.scene.objects if o.type == 'MESH']:
    mod = next(m for m in ob.modifiers if m.type == 'ARMATURE'); bpy.context.view_layer.objects.active = ob
    keep = ob.modifiers.new('keep', 'ARMATURE'); keep.object = arm
    bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.armature_apply(selected=False); bpy.ops.object.mode_set(mode='OBJECT')
files = os.listdir(tex)
for ob in [o for o in bpy.context.scene.objects if o.type == 'MESH']:
    for m in ob.data.materials:
        key = m.name.split('.')[0]; m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
        bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled'); outn = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(bsdf.outputs[0], outn.inputs[0])
        col = next((f for f in files if f.startswith(key) and f.endswith('_color.tga')), None)
        nrm = next((f for f in files if f.startswith(key) and f.endswith('_normal.tga')), None)
        if col:
            t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(os.path.join(tex, col)); nt.links.new(t.outputs['Color'], bsdf.inputs['Base Color'])
            if 'opacity' in key: nt.links.new(t.outputs['Alpha'], bsdf.inputs['Alpha']); m.blend_method = 'HASHED' if hasattr(m, 'blend_method') else None
        if nrm:
            t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(os.path.join(tex, nrm)); t.image.colorspace_settings.name = 'Non-Color'
            nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(t.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
        bsdf.inputs['Roughness'].default_value = 0.55 if 'head' in key or 'body' in key else 0.7
        if 'Specular IOR Level' in bsdf.inputs: bsdf.inputs['Specular IOR Level'].default_value = 0.35
bpy.ops.export_scene.gltf(filepath=TMP, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=85, export_animations=False, export_yup=True, export_skins=True, export_morph=False)
# VRMC_vrm: humanoid by node name
b = open(TMP, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); rest = b[20 + jl:]
idx = {n.get('name'): i for i, n in enumerate(j['nodes'])}
B = { 'hips': 'Pelvis', 'spine': 'Spine', 'chest': 'Spine1', 'upperChest': 'Spine2', 'neck': 'Neck', 'head': 'Head', 'leftEye': 'LEye', 'rightEye': 'REye', 'jaw': 'MJaw' }
for s, S in (('left', 'L'), ('right', 'R')):
    B.update({ s + 'Shoulder': S + ' Clavicle', s + 'UpperArm': S + ' UpperArm', s + 'LowerArm': S + ' Forearm', s + 'Hand': S + ' Hand',
               s + 'UpperLeg': S + ' Thigh', s + 'LowerLeg': S + ' Calf', s + 'Foot': S + ' Foot', s + 'Toes': S + ' Toe0' })
    for fi, f in enumerate(['Thumb', 'Index', 'Middle', 'Ring', 'Little']):
        for k, part in enumerate(['Metacarpal' if f == 'Thumb' else 'Proximal', 'Proximal' if f == 'Thumb' else 'Intermediate', 'Distal']):
            B[s + f + part] = f'{S} Finger{fi}' + ('' if k == 0 else str(k))
hb = {}
for vb, bip in B.items():
    n = BIP + ' ' + bip
    if n in idx: hb[vb] = { 'node': idx[n] }
missing = [k for k in ['hips', 'spine', 'head', 'leftUpperArm', 'leftLowerArm', 'leftHand', 'rightUpperArm', 'rightLowerArm', 'rightHand', 'leftUpperLeg', 'leftLowerLeg', 'leftFoot', 'rightUpperLeg', 'rightLowerLeg', 'rightFoot'] if k not in hb]
if missing: sys.exit('missing bones: ' + ', '.join(missing))
j.setdefault('extensionsUsed', []).append('VRMC_vrm')
j.setdefault('extensions', {})['VRMC_vrm'] = { 'specVersion': '1.0', 'meta': { 'name': name, 'version': '1', 'authors': ['Microsoft Rocketbox'], 'copyrightInformation': 'Microsoft Rocketbox Avatar Library (MIT License)',
    'licenseUrl': 'https://vrm.dev/licenses/1.0/', 'avatarPermission': 'everyone', 'commercialUsage': 'corporation', 'creditNotation': 'unnecessary', 'allowRedistribution': True, 'modification': 'allowModificationRedistribution',
    'otherLicenseUrl': 'https://github.com/microsoft/Microsoft-Rocketbox/blob/master/LICENSE' }, 'humanoid': { 'humanBones': hb } }
js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * ((4 - len(js) % 4) % 4)
total = 12 + 8 + len(js) + len(rest)
open(out, 'wb').write(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<I', len(js)) + b'JSON' + js + rest); os.remove(TMP)
print(out, total // 1024, 'KB', len(hb), 'bones mapped')
