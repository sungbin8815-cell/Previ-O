# Paint an image-to-3D mesh from four views (front, back, left, right): every face takes its colour from the view it faces most,
# projected straight along that view. The four pictures share one 2x2 texture atlas; each picture's background is replaced by the
# nearest figure colour so silhouette edges don't pick up grey.
# The mesh faces -Y; its left side is +X. In the left view the camera looks at the +X side (image right = +Y), in the right view at
# the -X side (image right = -Y), in the back view image right = -X.
# usage: venv/bin/python h3d_paint4.py <shape.glb> <front.png> <back.png> <left.png> <right.png> <out.glb> [faces]
import bpy, bmesh, sys, os
import numpy as np
from mathutils import Vector
from PIL import Image
from scipy import ndimage
src, fr, bk, lf, rt, out = sys.argv[1:7]; FACES = int(sys.argv[7]) if len(sys.argv) > 7 else 40000
views = {'front': fr, 'back': bk, 'left': lf, 'right': rt}
S = 1024
atlas = Image.new('RGB', (S * 2, S * 2)); tex_path = os.path.splitext(out)[0] + '_atlas.jpg'; cells = {'front': (0, 0), 'back': (1, 0), 'left': (0, 1), 'right': (1, 1)}
masks, imgs = {}, {}
for n, p in views.items():
    im = Image.open(p).convert('RGB'); W, H = im.size; A = np.asarray(im, dtype=np.float32)
    E = np.minimum(np.abs(A - A[:, 2:3]).sum(2), np.abs(A - A[:, W - 3:W - 2]).sum(2)) > 45
    E = ndimage.binary_opening(E, iterations=1); lab, nl = ndimage.label(E)
    if nl: sizes = ndimage.sum(E, lab, range(1, nl + 1)); keep = [i + 1 for i, z in enumerate(sizes) if z > sizes.max() * 0.02]; E = np.isin(lab, keep)   # the figure: every sizeable blob (a white shirt can split it)
    E = ndimage.binary_closing(E, iterations=2)   # join a split shirt, but keep the gap between the legs open
    M = ndimage.binary_erosion(E, iterations=2); _, (iy, ix) = ndimage.distance_transform_edt(~M, return_indices=True)
    masks[n] = E; imgs[n] = Image.fromarray(A[iy, ix].astype(np.uint8))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
ob = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]; bpy.context.view_layer.objects.active = ob; ob.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
n0 = len(ob.data.polygons)
if n0 > FACES: d = ob.modifiers.new('d', 'DECIMATE'); d.ratio = FACES / n0; bpy.ops.object.modifier_apply(modifier='d')
me = ob.data; P = [v.co for v in me.vertices]
lo = Vector((min(p.x for p in P), min(p.y for p in P), min(p.z for p in P))); hi = Vector((max(p.x for p in P), max(p.y for p in P), max(p.z for p in P)))
# register each view: rasterise the mesh's silhouette seen from that side at the picture's scale (figure height in px / mesh height),
# feet on the figure's lowest row, then slide it sideways to where it overlaps the picture's figure most
from PIL import ImageDraw
HOR = {'front': lambda p: p.x, 'back': lambda p: -p.x, 'left': lambda p: p.y, 'right': lambda p: -p.y}
tris = [[me.vertices[i].co for i in poly.vertices] for poly in me.polygons]
reg = {}
for n in views:
    E = masks[n]; H, W = E.shape; ys = np.where(E.any(1))[0]; fy0, fy1 = ys.min(), ys.max(); k = (fy1 - fy0) / (hi.z - lo.z)
    h = HOR[n]; t0 = min(h(p) for p in P); t1 = max(h(p) for p in P); mw = int((t1 - t0) * k) + 2
    mm = Image.new('L', (mw, H), 0); dr = ImageDraw.Draw(mm)
    for tri in tris: dr.polygon([((h(p) - t0) * k, fy1 - (p.z - lo.z) * k) for p in tri], fill=255)
    Mm = np.asarray(mm) > 0; best = (-1, 0)
    for ox in range(-mw // 2, W - mw // 2, 2):
        a0, a1 = max(0, ox), min(W, ox + mw); 
        if a1 <= a0: continue
        sc = np.logical_and(E[:, a0:a1], Mm[:, a0 - ox:a1 - ox]).sum() - 0.5 * np.logical_xor(E[:, a0:a1], Mm[:, a0 - ox:a1 - ox]).sum()
        if sc > best[0]: best = (sc, ox)
    ox = best[1]; iou = np.logical_and(E[:, max(0, ox):min(W, ox + mw)], Mm[:, max(0, -ox):min(mw, W - ox)]).sum() / max(1, np.logical_or(E[:, max(0, ox):min(W, ox + mw)], Mm[:, max(0, -ox):min(mw, W - ox)]).sum())
    reg[n] = (k, t0, ox, fy1, W, H); print(n, 'scale', round(k, 1), 'px/m, offset', ox, 'overlap', round(float(iou), 3))
    # atlas cell: the whole picture scaled to fit the cell
    c = min(S / W, S / H); cell = Image.new('RGB', (S, S)); cell.paste(imgs[n].resize((int(W * c), int(H * c)), Image.LANCZOS), (0, 0))
    cx, cy = cells[n]; atlas.paste(cell, (cx * S, cy * S)); reg[n] += (c,)
atlas.save(tex_path, quality=90)
def uv(view, p):
    k, t0, ox, fy1, W, H, c = reg[view]; cx, cy = cells[view]
    px = ox + (HOR[view](p) - t0) * k; py = fy1 - (p.z - lo.z) * k
    return ((cx * S + px * c) / (2 * S), 1 - (cy * S + py * c) / (2 * S))
CORE = {n: ndimage.binary_erosion(m, iterations=3) for n, m in masks.items()}
# side views: the arms hang down there, so a hand covers the thigh; light pixels between knee and hip height are hand, not trousers
for n in ('left', 'right'):
    E = masks[n]; ys = np.where(E.any(1))[0]; y0, y1 = ys.min(), ys.max(); A = np.asarray(imgs[n], dtype=np.float32); L = A.mean(2)
    band = np.zeros_like(E); band[int(y0 + (y1 - y0) * 0.38):int(y0 + (y1 - y0) * 0.75)] = True
    trou = np.median(L[band & E]); hand = ndimage.binary_dilation((L > trou * 1.8) & band & E, iterations=6)
    CORE[n] = CORE[n] & ~hand; print(n, 'hand pixels masked', int(hand.sum()))
# depth per view: the nearest surface in each 4 px cell (points splatted from the densely sampled faces); a point hidden behind
# another part (a hand in front of the thigh, the far leg in a side view) is not painted from that view
DEPTH = {'front': lambda p: p.y, 'back': lambda p: -p.y, 'left': lambda p: -p.x, 'right': lambda p: p.x}   # smaller = nearer the camera
ZB = {}
for n in views:
    k, t0, ox, fy1, W, H, c = reg[n]; g = 4; Zm = np.full((H // g + 2, W // g + 2), np.inf)
    for tri in tris:
        for (wa, wb, wc) in ((1, 0, 0), (0, 1, 0), (0, 0, 1), (1/3, 1/3, 1/3), (.5, .5, 0), (0, .5, .5), (.5, 0, .5)):
            q = tri[0] * wa + tri[1] * wb + tri[2] * wc if len(tri) == 3 else tri[0]
            x = int((ox + (HOR[n](q) - t0) * k) / g); y = int((fy1 - (q.z - lo.z) * k) / g)
            if 0 <= x < Zm.shape[1] and 0 <= y < Zm.shape[0]: Zm[y, x] = min(Zm[y, x], DEPTH[n](q))
    ZB[n] = ndimage.minimum_filter(Zm, size=2)
def visible(view, p):
    k, t0, ox, fy1, W, H, c = reg[view]; g = 4; x = int((ox + (HOR[view](p) - t0) * k) / g); y = int((fy1 - (p.z - lo.z) * k) / g)
    Zm = ZB[view]; return 0 <= x < Zm.shape[1] and 0 <= y < Zm.shape[0] and DEPTH[view](p) <= Zm[y, x] + 0.025
def inside(view, p):
    k, t0, ox, fy1, W, H, c = reg[view]; x = int(ox + (HOR[view](p) - t0) * k); y = int(fy1 - (p.z - lo.z) * k)
    return 0 <= x < W and 0 <= y < H and bool(CORE[view][y, x])
DIR = {'front': Vector((0, -1, 0)), 'back': Vector((0, 1, 0)), 'left': Vector((1, 0, 0)), 'right': Vector((-1, 0, 0))}
W8 = {'front': 1.15, 'back': 1.0, 'left': 0.9, 'right': 0.9}   # lean on the front (the face) where views tie
bm = bmesh.new(); bm.from_mesh(me); layer = bm.loops.layers.uv.new('UVMap'); count = {k: 0 for k in DIR}
for f in bm.faces:
    order = sorted(DIR, key=lambda k: -f.normal.dot(DIR[k]) * W8[k]); view = next((k for k in order if all(inside(k, l.vert.co) for l in f.loops)), order[0])   # seen by none: the best view that at least lands on the figure (same garment in front)
    for k in order[:3]:                     # a point outside that view's figure, or hidden behind another part there, takes the next view
        if f.normal.dot(DIR[k]) > -0.1 and all(inside(k, l.vert.co) and visible(k, l.vert.co) for l in f.loops): view = k; break
    count[view] += 1
    for l in f.loops: l[layer].uv = uv(view, l.vert.co)
bm.to_mesh(me); bm.free(); print('faces per view', count)
for p in me.polygons: p.use_smooth = True
mat = bpy.data.materials.new('body'); mat.use_nodes = True; nt = mat.node_tree; b = nt.nodes['Principled BSDF']
t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(tex_path); nt.links.new(t.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.6
me.materials.clear(); me.materials.append(mat)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=88, use_selection=True)
print(out, os.path.getsize(out) // 1024, 'KB')
