const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { open } = require('../lib/harness');
const { blank } = require('../lib/start');
const W = { viewport: { width: 1440, height: 900 } };
const setup = async () => { const r = await open(W); after(() => r.b.close()); await blank(r.p, true); await r.p.evaluate(() => { const c = document.getElementById('coach'); if (c) c.hidden = true; }); return r; };

test('header edits move, length and memo of the picked shot', { timeout: 180_000 }, async () => {
  const { p, errs } = await setup();
  const mv = await p.evaluate(() => MOVES.find(m => m.k !== 'static').k);
  await p.selectOption('#tlMove', mv); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => cur().move), mv);
  await p.click('#tlDurP'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => cur().dur), 4);
  await p.fill('#tlNote', '테스트 메모'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => cur().note), '테스트 메모');
  await p.evaluate(() => { document.activeElement.blur(); }); await p.waitForTimeout(400);
  await p.evaluate(() => undo()); await p.waitForTimeout(300);
  assert.notEqual(await p.evaluate(() => cur().note), '테스트 메모');
  assert.deepEqual(errs, []);
});

test('length stops at 1 second', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  for (let i = 0; i < 5; i++) { await p.click('#tlDurM'); await p.waitForTimeout(100); }
  assert.equal(await p.evaluate(() => cur().dur), 1);
});

test('timeline height drags and is remembered', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  const h = () => p.evaluate(() => Math.round(document.querySelector('.shots').getBoundingClientRect().height));
  const h0 = await h(), r = await p.locator('#tlResize').boundingBox();
  await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await p.mouse.down(); await p.mouse.move(r.x + r.width / 2, r.y - 100, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(300);
  const h1 = await h(); assert.ok(h1 > h0 + 50, `${h0} → ${h1}`);
  await p.reload(); await p.waitForTimeout(1500); await p.evaluate(() => { const r = document.querySelector('#mcResume, .hm-resume'); if (r) r.click(); }); await p.waitForTimeout(1500);
  assert.equal(await p.evaluate(() => getComputedStyle(document.querySelector('.app')).getPropertyValue('--tlh').trim()), h1 + 'px');
});

test('only export is a lime button; delete reads as danger', { timeout: 180_000 }, async () => {
  const { p } = await setup();
  const lime = await p.evaluate(() => [...document.querySelectorAll('.ax-host button')].filter(b => b.offsetParent && getComputedStyle(b).backgroundColor === 'rgb(201, 221, 79)').length);
  assert.equal(lime, 1);
  assert.equal(await p.evaluate(() => getComputedStyle(PREVIO_UI.reg.get(document.getElementById('delBtn')).host.querySelector('button')).color), 'rgb(229, 103, 92)');
});
