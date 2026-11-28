const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { open, OUT } = require('../lib/harness');
const { blank } = require('../lib/start');

test('stop ruler sets T8 and one dial shows', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close()); await blank(p, true);
  await p.evaluate(() => { $('#coach') && ($('#coach').hidden = true); openPane('cam'); paneTab('cam', 'expo'); }); await p.waitForTimeout(600);
  await p.click('#nRuler [data-ni="6"]'); await p.waitForTimeout(300); const N = await p.evaluate(() => cur().N);
  // add the first real fixture from the add tab
  await p.evaluate(() => { openPane('light'); paneTab('light', 'add'); }); await p.waitForTimeout(600);
  for (let i = 0; i < 3; i++) { const btn = await p.$('[data-pane="light"] button[data-fx]:not([data-fx="SUN"])'); if (!btn) { const up = await p.$('[data-pane="light"] [data-fam]'); if (up) await up.click(); await p.waitForTimeout(300); continue; } await btn.click(); break; }
  await p.waitForTimeout(800); await p.evaluate(() => { paneTab('light', 'placed'); }); await p.waitForTimeout(600);
  const before = await p.evaluate(() => { const l = shotLights()[0]; return l ? (l.dim ?? 1) : null; });
  const dial = await p.$('#lightEdit .dial'); let dimAfter = null;
  if (dial) { const bb = await dial.boundingBox(); await p.mouse.move(bb.x + 22, bb.y + 22); await p.mouse.down(); await p.mouse.move(bb.x + 22, bb.y + 60, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(400); dimAfter = await p.evaluate(() => shotLights()[0].dim); }
  const dials = await p.evaluate(() => document.querySelectorAll('.dial').length);
  assert.equal(N, 8); assert.equal(dials, 1); assert.deepEqual(errs, []);
});

test('dim dial follows a clockwise and counter-clockwise turn', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close()); await blank(p, true);
  await p.evaluate(() => { $('#coach') && ($('#coach').hidden = true); openPane('light'); paneTab('light', 'add'); }); await p.waitForTimeout(600);
  for (let i = 0; i < 3; i++) { const btn = await p.$('[data-pane="light"] button[data-fx]:not([data-fx="SUN"])'); if (!btn) { const up = await p.$('[data-pane="light"] [data-fam]'); if (up) await up.click(); await p.waitForTimeout(300); continue; } await btn.click(); break; }
  await p.waitForTimeout(800);
  await p.evaluate(() => { paneTab('light', 'placed'); shotLights()[0].dim = 0.05; changed(true, true); }); await p.waitForTimeout(800);
  const bb = await (await p.$('#lightEdit .dial')).boundingBox(), cx = bb.x + 22, cy = bb.y + 22, R = 20, at = deg => [cx + Math.sin(deg * Math.PI / 180) * R, cy - Math.cos(deg * Math.PI / 180) * R];
  const dim = () => p.evaluate(() => +shotLights()[0].dim.toFixed(2)), log = [];
  // clockwise arc: lower left (-135°) → top (0°) → lower right (+135°)
  await p.mouse.move(...at(-135)); await p.mouse.down();
  for (let a = -135; a <= 135; a += 15) { await p.mouse.move(...at(a)); if (a % 45 === 0) log.push([a, await dim()]); }
  await p.mouse.up(); log.push(['cw end', await dim()]);
  // counter-clockwise back: lower right → top → lower left
  await p.mouse.move(...at(135)); await p.mouse.down();
  for (let a = 135; a >= -135; a -= 15) await p.mouse.move(...at(a));
  await p.mouse.up(); log.push(['ccw end', await dim()]);
  assert.deepEqual(log, [[-135, 0.05], [-90, 0.21], [-45, 0.37], [0, 0.53], [45, 0.68], [90, 0.84], [135, 1], ['cw end', 1], ['ccw end', 0.05]]); assert.deepEqual(errs, []);
});
