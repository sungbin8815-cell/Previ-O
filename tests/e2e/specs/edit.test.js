const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { open, OUT } = require('../lib/harness');
const { blank } = require('../lib/start');

test('wall rows edit, floor material and undo', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close());
  await blank(p);
    const r = await p.evaluate(() => { state.set.props = []; build.tool = 'wall'; build.on = true; buildTap({ x: 0, z: -2 }); buildTap({ x: 3, z: -2 }); buildTap({ x: 3.03, z: 0.04 });
      build.tool = 'floor'; buildTap({ x: 0, z: -2 }); buildTap({ x: 3, z: 0 }); buildToggle(false);
      const w = state.set.props[0], f = state.set.props.find(o => o.type === 'floor'); const out = { types: state.set.props.map(o => o.type), w2: state.set.props[1] && [state.set.props[1].x, state.set.props[1].z, state.set.props[1].yaw, state.set.props[1].sx] };
      selObj = { id: w.id, kind: 'prop' }; openPane('set'); syncSet(); out.wallRows = [...document.querySelectorAll('#propEdit label')].map(l => l.textContent);
      const inp = document.querySelector('#propEdit [data-k="mh"]'); inp.value = 3.2; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true })); out.wh = w.sh;
      selObj = { id: f.id, kind: 'prop' }; syncSet(); document.querySelector('#propEdit [data-mat="grass"]').click(); out.fmat = f.mat;
      undo(); out.afterUndo = state.set.props.find(o => o.type === 'floor').mat; return out; });
  assert.deepEqual(r.wallRows, ['길이', '높이', '두께', '방향']); assert.equal(r.wh, 3.2); assert.equal(r.fmat, 'grass'); assert.equal(r.afterUndo, 'oak'); assert.deepEqual(errs, []);
});
