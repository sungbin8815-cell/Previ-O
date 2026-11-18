# Shrink the textures inside a VRM (glb) without touching anything else: every image is resized to at most MAX px and re-encoded
# (PNG kept for alpha and normal maps); the binary chunk is rebuilt with the new buffer views. usage: python3 vrm_shrink.py in.vrm out.vrm [MAX]
import io, json, struct, sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]; MAX = int(sys.argv[3]) if len(sys.argv) > 3 else 1024
b = open(src, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + jl]); bo = 20 + jl; bl = struct.unpack('<I', b[bo:bo + 4])[0]; bin_ = b[bo + 8:bo + 8 + bl]
views = j['bufferViews']; data = [bin_[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in views]
for im in j.get('images', []):
    if 'bufferView' not in im: continue
    i = im['bufferView']; pic = Image.open(io.BytesIO(data[i])); pic.load(); w, h = pic.size
    if max(w, h) <= MAX and im.get('name') != 'Thumbnail': continue
    k = (256 if im.get('name') == 'Thumbnail' else MAX) / max(w, h)
    if k < 1: pic = pic.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    out = io.BytesIO(); pic.save(out, 'PNG', optimize=True); data[i] = out.getvalue(); im['mimeType'] = 'image/png'
blob = bytearray(); 
for v, d in zip(views, data):
    while len(blob) % 4: blob.append(0)
    v['byteOffset'] = len(blob); v['byteLength'] = len(d); blob += d
while len(blob) % 4: blob.append(0)
j['buffers'][0]['byteLength'] = len(blob)
js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * ((4 - len(js) % 4) % 4)
total = 12 + 8 + len(js) + 8 + len(blob)
open(dst, 'wb').write(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(blob)) + b'BIN\x00' + bytes(blob))
print(src, len(b) // 1024, 'KB ->', total // 1024, 'KB')
