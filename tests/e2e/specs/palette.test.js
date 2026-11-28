const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { open } = require('../lib/harness');
const { blank } = require('../lib/start');
const W = { viewport: { width: 1440, height: 900 } };
const setup = async (pro = true) => { const r = await open(W); after(() => r.b.close()); await blank(r.p, pro); await r.p.evaluate(() => { const c = document.getElementById('coach'); if (c) c.hidden = true; }); return r; };
const tool = (p, id) => p.evaluate(id => { const b = document.querySelector(`#palette [data-group]:not([data-group="fav"]) [data-tool="${id}"]`); return b ? { disabled: b.disabled, pressed: b.getAttribute('aria-pressed') } : null; }, id);

test('palette shows the tool groups in order', { timeout: 180_000 }, async () => {
  const { p, errs } = await setup();
  const g = await p.evaluate(() => [...document.querySelectorAll('#palette .pgroup')].filter(x => x.offsetParent).map(x => x.querySelector('.phead').textContent.trim()));
  assert.deepEqual(g, ['선택·이동', '회전', '카메라', '조명', '세트', '오브젝트', '측정', '주석']);
  assert.equal(await p.evaluate(() => document.getElementById('camBar').offsetParent), null);
  assert.deepEqual(errs, []);
});

test('a palette tool runs the same action', { timeout: 180_000 }, async () => {
  const { p, errs } = await setup();
  await p.evaluate(() => { cur().cam.roll = 7; changed(true); });
  await p.click('#palette [data-group="rotate"] [data-tool="level"]'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => cur().cam.roll), 0);
  await p.click('#palette [data-group="light"] [data-tool="lightAdd"]'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => pane), 'light');
  assert.deepEqual(errs, []);
});

test('object tools are off until an object is picked', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  assert.equal((await tool(p, 'dup')).disabled, true);
  await p.evaluate(() => { startPlace('chair'); movePlace({ x: 0, z: 1 }); confirmPlace(); const o = state.set.props[state.set.props.length - 1]; selObj = { id: o.id, kind: 'prop' }; syncSet(); syncBars(); }); await p.waitForTimeout(300);
  assert.equal((await tool(p, 'dup')).disabled, false);
});

test('tools that need the top view are off in 3D', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  assert.equal((await tool(p, 'tape')).disabled, true);
  await p.evaluate(() => setMode('top')); await p.waitForTimeout(500);
  assert.equal((await tool(p, 'tape')).disabled, false);
});

test('simple mode hides pro-only tools', { timeout: 180_000 }, async () => {
  const { p } = await setup(false);
  const n = await p.evaluate(() => TOOLS.filter(t => t.pro).filter(t => document.querySelector(`#palette [data-tool="${t.id}"]`)?.offsetParent).length);
  assert.equal(n, 0);
});

test('favourite added by right-click appears and survives reload', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  await p.click('#palette [data-group="rotate"] [data-tool="level"]', { button: 'right' }); await p.waitForTimeout(300);
  const favs = () => p.evaluate(() => [...document.querySelectorAll('#palette [data-group="fav"]:not([hidden]) [data-tool]')].map(b => b.dataset.tool));
  assert.deepEqual(await favs(), ['level']);
  await p.reload(); await p.waitForTimeout(1500);
  assert.deepEqual(await favs(), ['level']);
});

test('favourites follow the tool state', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  await p.evaluate(() => paletteFav('dup')); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.querySelector('#palette [data-group="fav"] [data-tool="dup"]').disabled), true);
});

test('groups collapse and the palette narrows', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  await p.click('#palette [data-group="camera"] .phead'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.querySelector('#palette [data-group="camera"] [data-tool="fit"]').offsetParent), null);
  await p.click('#paletteWidth'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => Math.round(document.getElementById('palette').getBoundingClientRect().width)), 52);
});
