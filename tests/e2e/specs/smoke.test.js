const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { open, libPath } = require('../lib/harness');
const { blank } = require('../lib/start');

test('app opens a blank pro project without page errors', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close());
  await blank(p, true);
  assert.equal(await p.evaluate(() => document.getElementById('startScreen').hidden), true);
  assert.equal(await p.evaluate(() => state.shots.length), 1);
  assert.deepEqual(errs, []);
});

test('harness reports missing libs', () => {
  assert.throws(() => libPath('three/build/three.module.js', '/nonexistent'), /npm --prefix tests\/e2e install/);
});
