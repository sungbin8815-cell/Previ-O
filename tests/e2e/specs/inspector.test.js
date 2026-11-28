const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { open } = require('../lib/harness');
const { blank } = require('../lib/start');
const W = { viewport: { width: 1440, height: 900 } };
const setup = async () => { const r = await open(W); after(() => r.b.close()); await blank(r.p, true); await r.p.evaluate(() => { const c = document.getElementById('coach'); if (c) c.hidden = true; openPane('cam'); }); return r; };

test('picking switches the inspector and names the target', { timeout: 180_000 }, async () => {
  const { p, errs } = await setup();
  await p.evaluate(() => { openPane('light'); paneTab('light', 'add'); }); await p.waitForTimeout(500);
  for (let i = 0; i < 3; i++) { const btn = await p.$('[data-pane="light"] button[data-fx]:not([data-fx="SUN"])'); if (!btn) { const up = await p.$('[data-pane="light"] [data-fam]'); if (up) await up.click(); await p.waitForTimeout(400); continue; } await btn.click(); break; }
  await p.waitForTimeout(600);
  await p.evaluate(() => { selObj = null; camSel = false; syncBars(); openPane('cam'); }); await p.waitForTimeout(200);
  await p.evaluate(() => { selObj = { id: shotLights()[0].id, kind: 'light' }; syncBars(); }); await p.waitForTimeout(300);
  const lit = await p.evaluate(() => { const el = document.getElementById('inspTarget'), r = el.getBoundingClientRect(); return { pane, name: el.textContent.trim(), want: lightLabel(findObj(selObj.id)), w: r.width, h: r.height }; });
  assert.equal(lit.pane, 'light'); assert.equal(lit.name, lit.want); assert.ok(lit.w > 40 && lit.h >= 12, 'target name is visible');
  await p.evaluate(() => { selObj = { id: 'SUN', kind: 'light' }; syncBars(); }); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.getElementById('inspTarget').textContent.trim()), '햇빛');
  await p.evaluate(() => { selObj = null; camSel = false; syncBars(); }); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => document.getElementById('inspTarget').textContent.trim()), '카메라');
  assert.deepEqual(errs, []);
});

test('closing the inspector leaves a right index that reopens panels', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  await p.click('#drawerClose'); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const b = document.getElementById('rail').getBoundingClientRect(); return { shown: b.width > 0, right: Math.round(b.right), w: innerWidth }; });
  assert.equal(r.shown, true); assert.equal(r.right, r.w);
  await p.click('#rail [data-pane="set"]'); await p.waitForTimeout(400);
  assert.equal(await p.evaluate(() => pane), 'set');
  assert.equal(await p.evaluate(() => document.getElementById('rail').getBoundingClientRect().width), 0);
});

test('shortcut opens a panel from the closed state', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  await p.click('#drawerClose'); await p.waitForTimeout(300);
  await p.mouse.click(700, 400); await p.keyboard.press('l'); await p.waitForTimeout(400);
  assert.equal(await p.evaluate(() => pane), 'light');
});
