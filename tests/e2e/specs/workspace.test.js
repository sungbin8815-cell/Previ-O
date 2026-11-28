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

test('storyboard view keeps a way back on a tablet-sized window', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open({ viewport: { width: 900, height: 700 } }); after(() => b.close());
  await blank(p, true); await hideCoach(p);
  await p.evaluate(() => document.getElementById('boardBtn').click()); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => view), 'board');
  await p.getByRole('radio', { name: '편집' }).click({ timeout: 5000 }); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => view), 'edit');
  assert.deepEqual(errs, []);
});

test('full screen on a computer gives the stage the whole window', { timeout: 180_000 }, async () => {
  const { b, p } = await open(W); after(() => b.close());
  await blank(p, true); await hideCoach(p);
  await p.evaluate(() => document.getElementById('app').classList.add('fullscr')); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const s = document.getElementById('stage').getBoundingClientRect(); return { w: Math.round(s.width), h: Math.round(s.height) }; });
  assert.deepEqual(r, { w: 1440, h: 900 });
});

test('lens rules reach phones too: the toast is solid with light text', { timeout: 180_000 }, async () => {
  const { b, p } = await open({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }); after(() => b.close());
  await blank(p, true); await hideCoach(p);
  const c = await p.evaluate(() => { const t = document.getElementById('toast') || document.querySelector('.toast'); const cs = getComputedStyle(t); return { bg: cs.backgroundColor, ink: cs.color }; });
  assert.equal(c.bg, 'rgb(28, 29, 32)'); assert.equal(c.ink, 'rgb(236, 237, 238)');
});
