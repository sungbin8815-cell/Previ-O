import json, os, sys, subprocess, concurrent.futures as cf
from picks import PICKS
OUT = sys.argv[1]
def get(u, p):
    if os.path.exists(p) and os.path.getsize(p) > 0: return 0
    os.makedirs(os.path.dirname(p), exist_ok=True); subprocess.run(['curl', '-sSf', '--retry', '3', '-o', p + '.part', u], check=True); os.rename(p + '.part', p); return os.path.getsize(p)
def one(pid):
    f = json.loads(subprocess.run(['curl', '-sSf', f'https://api.polyhaven.com/files/{pid}'], check=True, capture_output=True).stdout)['gltf']
    res = '1k' if '1k' in f else sorted(f)[0]; g = f[res]['gltf']; d = os.path.join(OUT, pid); n = get(g['url'], os.path.join(d, os.path.basename(g['url'])))
    for rel, inc in g.get('include', {}).items(): n += get(inc['url'], os.path.join(d, rel))
    return pid, n
with cf.ThreadPoolExecutor(6) as ex:
    tot = 0
    for pid, n in ex.map(one, sorted({v[0] for v in PICKS.values()})): tot += n; print(pid, n // 1024, 'KB', flush=True)
print('total MB', tot // 2**20)
