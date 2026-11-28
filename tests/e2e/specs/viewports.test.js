const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { open, OUT } = require('../lib/harness');
const { blank } = require('../lib/start');

test('desktop viewport layouts', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open({ viewport: { width: 1440, height: 900 } }); after(() => b.close());
  await blank(p, true); await p.evaluate(() => { $('#coach').hidden = true; });
  const r = {};
  r.start = await p.evaluate(() => ({ vp: vpLay, cls: $('#app').className, pane, vf: !$('#vf').hidden, world: !$('#worldwrap').hidden }));
  // monitor drag pans the camera while the 3D pane is also on screen
  const v = await p.locator('#view').boundingBox(); const pan0 = await p.evaluate(() => cur().cam.pan);
  await p.mouse.move(v.x + v.width / 2, v.y + v.height / 2); await p.mouse.down(); await p.mouse.move(v.x + v.width / 2 + 80, v.y + v.height / 2, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(300);
  r.monPan = [pan0, await p.evaluate(() => cur().cam.pan)];
  // 3D pane orbit changes the viewer, not the shot
  const w = await p.locator('#world').boundingBox(); const az0 = await p.evaluate(() => viewer.az);
  await p.mouse.move(w.x + 40, w.y + w.height - 40); await p.mouse.down(); await p.mouse.move(w.x + 120, w.y + w.height - 40, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(300);
  r.orbit = [az0, await p.evaluate(() => viewer.az)];
  // three views: the small pane swaps into the big one
  await p.click('#vpLay button[data-vp="3"]'); await p.waitForTimeout(800);
  r.three = await p.evaluate(() => ({ vp: vpLay, w2: !$('#world2wrap').hidden, w2w: $('#world2').width, mode }));
  await p.locator('#world2wrap').click({ position: { x: 100, y: 100 } }); await p.waitForTimeout(900);
  r.swap = await p.evaluate(() => mode);
  // 모니터 alone goes to the one-view layout
  await p.click('#modeSeg button[data-mode="mon"]'); await p.waitForTimeout(800);
  r.monOnly = await p.evaluate(() => ({ vp: vpLay, mode, world: !$('#worldwrap').hidden, vf: !$('#vf').hidden, cls: $('#app').className }));
  await p.click('#vpLay button[data-vp="2"]'); await p.waitForTimeout(800);
  r.back2 = await p.evaluate(() => ({ vp: vpLay, mode, vf: !$('#vf').hidden, world: !$('#worldwrap').hidden }));
  // full playback keeps the layout and lights the red frame only while it plays
  await p.evaluate(() => { $('#addBtn').click(); }); await p.waitForTimeout(300);
  await p.keyboard.press('p'); await p.waitForTimeout(500);
  r.play = await p.evaluate(() => ({ anim: $('#app').classList.contains('anim'), vp: vpLay, border: getComputedStyle($('#view')).boxShadow.slice(0, 40) }));
  await p.keyboard.press('p'); await p.waitForTimeout(400);
  r.after = await p.evaluate(() => ({ anim: $('#app').classList.contains('anim'), border: getComputedStyle($('#view')).boxShadow.slice(0, 40) }));
  await p.keyboard.press('F6'); r.f6 = await p.evaluate(() => document.activeElement.closest('.bar, #stage, #drawer, .shots')?.className || document.activeElement.tagName);
  await p.keyboard.press('F6'); r.f6b = await p.evaluate(() => document.activeElement.closest('.bar, #stage, #drawer, .shots')?.className || document.activeElement.tagName);
  assert.equal(r.start.vp, '2');
  assert.notEqual(r.monPan[1], r.monPan[0]); assert.notEqual(r.orbit[1], r.orbit[0]);
  assert.equal(r.three.w2, true); assert.equal(r.swap, 'top');
  assert.equal(r.monOnly.vp, '1'); assert.equal(r.monOnly.mode, 'mon');
  assert.equal(r.back2.vp, '2'); assert.equal(r.back2.mode, '3d');
  assert.equal(r.play.anim, true); assert.ok(r.play.border.startsWith('rgb(229, 72, 58)'));
  assert.equal(r.after.anim, false); assert.equal(r.f6b, 'shots'); assert.deepEqual(errs, []);
});
