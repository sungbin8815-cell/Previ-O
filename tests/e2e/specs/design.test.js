const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { open } = require('../lib/harness');
const { blank } = require('../lib/start');

test('every Astryx control is drawn with the lens theme', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close());
  await blank(p, true); await p.waitForTimeout(600);
  const themes = await p.evaluate(() => [...document.querySelectorAll('.ax-host')].map(h => h.dataset.astryxTheme));
  const primaryBg = await p.evaluate(() => { const r = PREVIO_UI.reg.get(document.getElementById('exportBtn')); return getComputedStyle(r.host.querySelector('button')).backgroundColor; });
  assert.deepEqual([...new Set(themes)], ['lens']);
  assert.equal(primaryBg, 'rgb(201, 221, 79)');
  assert.deepEqual(errs, []);
});
