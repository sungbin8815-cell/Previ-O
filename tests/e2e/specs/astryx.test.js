const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { open, OUT } = require('../lib/harness');
const { blank } = require('../lib/start');

test('shortcut, slider, kit, board and add shot through Astryx', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open({}); after(() => b.close()); const out = {};
  await blank(p, true); await p.waitForTimeout(800);
  await p.evaluate(() => { $('#coach') && ($('#coach').hidden = true); });
  // keyboard shortcut
  await p.mouse.click(400, 400); await p.keyboard.press('c'); await p.waitForTimeout(500);
  out.keyC = await p.evaluate(() => document.querySelector('#rail [data-pane="cam"]').getAttribute('aria-pressed'));
  // focal slider through Astryx: press End on the slider
  const f0 = await p.evaluate(() => cur().f);
  const sl = p.locator('.drawer [role=slider]').first(); await sl.focus(); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400);
  out.focal = [f0, await p.evaluate(() => cur().f)];
  // undo through the Astryx button
  await p.getByRole('button', { name: '실행 취소' }).click(); await p.waitForTimeout(400); out.undo = await p.evaluate(() => cur().f);
  // lens kit selector
  await p.locator('.drawer [role=combobox]').first().click(); await p.waitForTimeout(400);
  const opt = p.getByRole('option').nth(1); out.kitOpt = await opt.textContent().catch(() => null); await opt.click().catch(e => out.kitErr = e.message.slice(0, 80)); await p.waitForTimeout(500);
  out.kit = await p.evaluate(() => document.querySelector('.drawer select') && document.querySelector('.drawer select').value);
  // board / edit switch and the export menu
  await p.getByRole('radio', { name: '보드' }).click(); await p.waitForTimeout(600); out.board = await p.evaluate(() => document.querySelector('#boardBtn').getAttribute('aria-pressed'));
  await p.getByRole('radio', { name: '편집' }).click(); await p.waitForTimeout(600);
  await p.getByRole('button', { name: '내보내기' }).click(); await p.waitForTimeout(400); out.menu = await p.evaluate(() => !document.querySelector('#xMenu').hidden);
  await p.mouse.click(500, 400); await p.waitForTimeout(300);
  out.cover = await p.evaluate(() => { const e = [...document.querySelectorAll('.ax-host button')].find(x => x.textContent.includes('샷') && x.dataset.variant === 'primary'); const q = e.getBoundingClientRect(); const t = document.elementFromPoint(q.x + q.width / 2, q.y + q.height / 2); return t.tagName + '.' + String(t.className).slice(0, 40) + ' #' + t.id + ' menu ' + !document.querySelector('#xMenu').hidden; });
  await p.screenshot({ path: path.join(OUT, 'astryx-func.png') });
  // add a shot
  const n0 = await p.evaluate(() => state.shots.length); await p.getByRole('button', { name: '＋ 샷' }).click({ timeout: 5000 }).catch(e => out.shotErr = 1); await p.waitForTimeout(600); out.shots = [n0, await p.evaluate(() => state.shots.length)];
  assert.equal(out.keyC, 'true'); assert.notEqual(out.focal[1], out.focal[0]); assert.equal(out.kit, 'sig'); assert.equal(out.board, 'true'); assert.equal(out.menu, true); assert.deepEqual(out.shots, [1, 2]); assert.deepEqual(errs, []);
});

test('export menu opens, toggles and closes', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open({}); after(() => b.close());
  await blank(p, true); await p.evaluate(() => { $('#coach') && ($('#coach').hidden = true); });
  const btn = p.getByRole('button', { name: '내보내기' }); const st = () => p.evaluate(() => !$('#xMenu').hidden);
  const ax = () => btn.getAttribute('aria-expanded');
  const out = {};
  await btn.click(); await p.waitForTimeout(300); out.firstClick = [await st(), await ax()];
  await btn.click(); await p.waitForTimeout(300); out.secondClick = [await st(), await ax()];
  await btn.click(); await p.waitForTimeout(300); out.thirdClick = [await st(), await ax()];
  await p.mouse.click(500, 400); await p.waitForTimeout(300); out.outside = [await st(), await ax()];
  await btn.click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: '편집' }).or(p.getByRole('radio', { name: '편집' })).first().click(); await p.waitForTimeout(300); out.otherControl = await st();
  out.haspopup = await btn.getAttribute('aria-haspopup');
  assert.deepEqual(out.firstClick, [true, 'true']); assert.deepEqual(out.secondClick, [false, 'false']); assert.deepEqual(out.thirdClick, [true, 'true']); assert.deepEqual(out.outside, [false, 'false']); assert.equal(out.otherControl, false); assert.equal(out.haspopup, 'menu'); assert.deepEqual(errs, []);
});

test('Esc and outside presses close the export menu', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open({}); after(() => b.close());
  await blank(p, true); await p.evaluate(() => { $('#coach') && ($('#coach').hidden = true); });
  await p.getByRole('button', { name: '내보내기' }).click(); await p.waitForTimeout(300); const a = await p.evaluate(() => !$('#xMenu').hidden);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); const e = await p.evaluate(() => !$('#xMenu').hidden);
  if (e) { await p.getByRole('button', { name: '내보내기' }).click(); await p.waitForTimeout(300); }
  else { await p.getByRole('button', { name: '내보내기' }).click(); await p.waitForTimeout(300); }
  await p.mouse.click(500, 400); await p.waitForTimeout(300); const c = await p.evaluate(() => !$('#xMenu').hidden);
  await p.getByRole('button', { name: '내보내기' }).click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: '실행 취소' }).click({ force: true }).catch(() => {}); await p.waitForTimeout(300); const d = await p.evaluate(() => !$('#xMenu').hidden);
  assert.deepEqual({ open: a, afterEsc: e, afterCanvasClick: c, afterOtherButton: d }, { open: true, afterEsc: false, afterCanvasClick: false, afterOtherButton: false }); assert.deepEqual(errs, []);
});
