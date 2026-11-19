# Paint an image-to-3D mesh from its own source image: decimate for phones, front-project the picture as the texture (UV = where
# each point falls in the picture), and send faces that look away from the camera on the head to a hair-coloured patch.
# usage: venv/bin/python h3d_paint.py <shape.glb> <source.png> <out.glb> [faces]
import bpy, bmesh, sys, os
from mathutils import Vector
from PIL import Image
src, img_path, out = sys.argv[1:4]; FACES = int(sys.argv[4]) if len(sys.argv) > 4 else 40000
# the figure's box in the picture: pixels that differ from the corner background colour
im = Image.open(img_path).convert('RGB'); W, H = im.size; px = im.load(); bg = px[5, 5]
def isfg(x, y):
    r, g, b = px[x, y]; d = lambda e: abs(r - e[0]) + abs(g - e[1]) + abs(b - e[2]); return min(d(px[2, y]), d(px[W - 3, y])) > 45   # against this row's own background at both edges (it is a gradient)
cols = [x for x in range(0, W, 2) if any(isfg(x, y) for y in range(0, int(H * 0.97), 4))]
rows = [y for y in range(0, int(H * 0.97), 2) if any(isfg(x, y) for x in range(0, W, 4))]
X0, X1, Y0, Y1 = min(cols), max(cols), min(rows), max(rows); print('figure box', X0, X1, Y0, Y1)
# hair colour: the median of the top 4% of the figure
hs = sorted(px[x, y] for y in range(Y0 + 4, Y0 + int((Y1 - Y0) * 0.04)) for x in range(X0, X1) if isfg(x, y) and sum(px[x, y]) < 200)
hair = hs[len(hs) // 2] if hs else (20, 18, 18); print('hair', hair)
# a hair-coloured patch in the corner of a padded copy of the picture, for the back of the head
# the figure's colours grown out over the background (edges of the silhouette and the sides sample beyond it)
import numpy as np
from PIL import ImageFilter
A = np.asarray(im, dtype=np.float32); E = np.minimum(np.abs(A - A[:, 2:3]).sum(2), np.abs(A - A[:, W - 3:W - 2]).sum(2)); M = (E > 45).astype(np.float32)
from scipy import ndimage
M = ndimage.binary_erosion(M > 0.5, iterations=2)                                                  # trim the soft edge itself
_, (iy, ix) = ndimage.distance_transform_edt(~M, return_indices=True)                              # every pixel takes its nearest figure pixel
C = A[iy, ix]
im = Image.fromarray(np.clip(C, 0, 255).astype(np.uint8))
pad = Image.new('RGB', (W, H + 32), hair); pad.paste(im, (0, 0)); tex_path = os.path.splitext(out)[0] + '_tex.jpg'
pad.thumbnail((2048, 2048)); pad.save(tex_path, quality=88); TW, TH = W, H + 32

bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
ob = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]; bpy.context.view_layer.objects.active = ob; ob.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
n0 = len(ob.data.polygons)
if n0 > FACES: d = ob.modifiers.new('d', 'DECIMATE'); d.ratio = FACES / n0; bpy.ops.object.modifier_apply(modifier='d')
me = ob.data; P = [v.co for v in me.vertices]
lo = Vector((min(p.x for p in P), min(p.y for p in P), min(p.z for p in P))); hi = Vector((max(p.x for p in P), max(p.y for p in P), max(p.z for p in P)))
# the camera looks along +y (front faces have normal -y): picture x <- model x, picture y <- model z
def uv(p): u = X0 + (p.x - lo.x) / (hi.x - lo.x) * (X1 - X0); v = Y1 - (p.z - lo.z) / (hi.z - lo.z) * (Y1 - Y0); return (u / TW, 1 - v / TH)
neck = lo.z + (hi.z - lo.z) * 0.83
bm = bmesh.new(); bm.from_mesh(me); layer = bm.loops.layers.uv.new('UVMap')
back = 0
for f in bm.faces:
    cm = f.calc_center_median(); away = f.normal.y > 0.25 and cm.z > neck and abs(cm.x - (lo.x + hi.x) / 2) < (hi.x - lo.x) * 0.12                # the back of the head: hair, not the face again
    for l in f.loops: l[layer].uv = (8 / TW, 1 - (H + 16) / TH) if away else uv(l.vert.co)
    back += away
bm.to_mesh(me); bm.free(); print('faces', len(me.polygons), 'back-of-head faces', back)
for p in me.polygons: p.use_smooth = True
mat = bpy.data.materials.new('body'); mat.use_nodes = True; nt = mat.node_tree; b = nt.nodes['Principled BSDF']
t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(tex_path); t.interpolation = 'Linear'; nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
b.inputs['Roughness'].default_value = 0.6
me.materials.clear(); me.materials.append(mat)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=88, use_selection=True)
print(out, os.path.getsize(out) // 1024, 'KB')
