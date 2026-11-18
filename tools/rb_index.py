# chars/vrm/rb/index.json: every converted Rocketbox avatar with a Korean label, sex and gallery group
import json, os, re, sys
O = sys.argv[1]
JOB = { 'Business': '회사원', 'Chef': '요리사', 'Construction': '건설 노동자', 'Delivery': '배달원', 'Fire': '소방관', 'Gardener': '정원사', 'Medical': '의료진', 'Military': '군인',
        'Pilot': '조종사', 'Police': '경찰', 'Security': '경비원', 'Sports': '운동선수', 'Wood': '목수' }
out = []
for f in sorted(os.listdir(O)):
    if not f.endswith('.vrm'): continue
    n = f[:-4]; m = re.match(r'(\w+?)_(Female|Male)_(\w+?)_?(\d+)$', n) or re.match(r'(Female|Male)_(\w+?)_(\d+)$', n)
    parts = n.split('_'); sex = 'f' if 'Female' in parts else 'm'; num = parts[-1]
    if parts[0] in ('Female', 'Male'):
        kind = parts[1]; grp = 'c' if kind == 'Child' else sex
        label = ('여자아이' if sex == 'f' else '남자아이') if kind == 'Child' else ('파티 ' if kind == 'Party' else '') + ('여성' if sex == 'f' else '남성')
    else:
        grp = 'p'; label = JOB.get(parts[0], parts[0]) + (' (여)' if sex == 'f' else ' (남)')
    out.append({ 'id': n, 'name': f'{label} {num}', 'who': sex, 'grp': grp })
json.dump(out, open(os.path.join(O, 'index.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), {g: sum(1 for x in out if x['grp'] == g) for g in 'fmcp'})
