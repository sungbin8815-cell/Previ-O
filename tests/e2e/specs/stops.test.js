const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { open, OUT } = require('../lib/harness');
const { blank } = require('../lib/start');

test('stop readout per lens kit', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close());
  await blank(p);
    const r = await p.evaluate(async () => { const s = cur(); s.N = 2.8; const out = [];
      const snap = tag => { syncPanels(); const o = optics(s), e = expo(s); out.push({ tag, kit: KIT().id, label: $('#nOut').textContent, alt: $('#nAlt').textContent, segShown: !$('#stopSeg').hidden, fGeo: +o.N.toFixed(3), dofNear: +o.near.toFixed(3), dofFar: +o.far.toFixed(3), Lmg: +e.Lmg.toFixed(2), hud: $('#hudTop') ? $('#hudTop').textContent.slice(0, 60) : '' }); };
      state.kit = 'free'; state.freeStop = 'T'; snap('free T');
      document.querySelector('#stopSeg [data-stop="f"]').click(); snap('free f');
      state.kit = 'gm'; s.f = 35; snap('Sony GM');
      state.kit = 'masterp'; s.f = 35; snap('Master Prime');
      return out; });
  assert.deepEqual(r.map(x => x.kit), ['free', 'free', 'gm', 'masterp']); for (const x of r) assert.ok(x.label.length > 0); assert.deepEqual(errs, []);
});
