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

test('app surfaces and text use the lens tokens', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close());
  await blank(p, true);
  const s = await p.evaluate(() => { const bs = getComputedStyle(document.body); return { bg: bs.backgroundColor, ink: bs.color, font: bs.fontFamily, bar: getComputedStyle(document.querySelector('.bar')).backgroundColor }; });
  assert.equal(s.bg, 'rgb(13, 14, 15)'); assert.equal(s.bar, 'rgb(21, 22, 24)'); assert.equal(s.ink, 'rgb(236, 237, 238)'); assert.match(s.font, /^"?SUIT/);
  assert.deepEqual(errs, []);
});

test('canvas colours stay light on the dark stage', { timeout: 180_000 }, async () => {
  const { b, p } = await open(); after(() => b.close());
  await blank(p, true);
  assert.equal(await p.evaluate(() => C.ink.toUpperCase()), '#ECEDEE');
});

test('simple mode uses the same tokens', { timeout: 180_000 }, async () => {
  const { b, p } = await open(); after(() => b.close());
  await blank(p, false);
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.bar')).backgroundColor), 'rgb(21, 22, 24)');
});

test('phone grips are dark', { timeout: 180_000 }, async () => {
  const { b, p } = await open({ device: 'iPhone 13 landscape' }); after(() => b.close());
  await blank(p, true);
  const bgs = await p.evaluate(() => ['#camBar', '#rail'].map(q => getComputedStyle(document.querySelector(q)).backgroundColor));
  for (const c of bgs) assert.ok(['rgb(13, 14, 15)', 'rgb(21, 22, 24)'].includes(c), c);
});

test('floating panels are solid', { timeout: 180_000 }, async () => {
  const { b, p } = await open(); after(() => b.close());
  await blank(p, true); await p.evaluate(() => { const c = document.getElementById('coach'); if (c) c.hidden = true; });
  await p.getByRole('button', { name: '내보내기' }).click(); await p.waitForTimeout(300);
  const m = await p.evaluate(() => { const s = getComputedStyle(document.getElementById('xMenu')); return { bg: s.backgroundColor, bf: s.backdropFilter, sh: s.boxShadow }; });
  assert.equal(m.bg, 'rgb(28, 29, 32)'); assert.equal(m.bf, 'none'); assert.match(m.sh, /0px 8px 24px/);
});

test('focus ring is 2px ink', { timeout: 180_000 }, async () => {
  const { b, p } = await open(); after(() => b.close());
  await blank(p, true); await p.evaluate(() => { const c = document.getElementById('coach'); if (c) c.hidden = true; document.body.focus(); });
  await p.keyboard.press('Tab'); await p.waitForTimeout(200);
  const f = await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return { w: s.outlineWidth, c: s.outlineColor }; });
  assert.equal(f.w, '2px'); assert.equal(f.c, 'rgb(236, 237, 238)');
});
