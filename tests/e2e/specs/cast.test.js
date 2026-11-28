const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { open, OUT } = require('../lib/harness');
const { blank } = require('../lib/start');

test('every age and gender renders without errors', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close());
  await blank(p);
  for (const [who, age] of [['f', 'child'], ['m', 'teen'], ['f', 'senior'], ['m', 'mid']]) { await p.evaluate(([who, age]) => { const c = castOf('A'); c.who = who; c.age = age; changed(true, true); setMode('3d'); }, [who, age]); await p.waitForTimeout(2500); }
  assert.deepEqual(errs, []);
});
