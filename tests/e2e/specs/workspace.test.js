const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { open } = require('../lib/harness');
const { blank } = require('../lib/start');
const W = { viewport: { width: 1440, height: 900 } };
const hideCoach = p => p.evaluate(() => { const c = document.getElementById('coach'); if (c) c.hidden = true; });

test('edit/storyboard switch lives in the timeline header and still switches', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(W); after(() => b.close());
  await blank(p, true); await hideCoach(p);
  assert.equal(await p.evaluate(() => !!document.querySelector('.shots #boardBtn')), true);
  await p.click('#boardBtn'); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => document.getElementById('boardBtn').getAttribute('aria-pressed')), 'true');
  await p.click('#editBtn'); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => document.getElementById('editBtn').getAttribute('aria-pressed')), 'true');
  assert.deepEqual(errs, []);
});

test('app menu holds mode, tutorial, focus practice and key help', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(W); after(() => b.close());
  await blank(p, true); await hideCoach(p);
  await p.click('#appMenuBtn'); await p.waitForTimeout(300);
  const m = await p.evaluate(() => ({ open: !document.getElementById('appMenu').hidden, has: ['uiModeBtn', 'tourBtn', 'fpMenuBtn', 'keysBtn'].map(id => !!document.querySelector('#appMenu #' + id)) }));
  assert.deepEqual(m, { open: true, has: [true, true, true, true] });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.getElementById('appMenu').hidden), true);
  await p.click('#appMenuBtn'); await p.waitForTimeout(200); await p.click('#keysBtn'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => document.getElementById('keyHelp').hidden), false);
  assert.deepEqual(errs, []);
});
