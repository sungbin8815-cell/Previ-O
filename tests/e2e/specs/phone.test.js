const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { open, OUT } = require('../lib/harness');
const { blank } = require('../lib/start');

test('phone landscape opens and the camera panel opens', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open({ device: 'iPhone 13 landscape' }); after(() => b.close());
  await blank(p, true); await p.waitForTimeout(1500);
  await p.evaluate(() => { $('#coach') && ($('#coach').hidden = true); openPane('cam'); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, 'phone-camera.png') });
  assert.equal(await p.evaluate(() => pane), 'cam'); assert.deepEqual(errs, []);
});
