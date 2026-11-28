const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { open, OUT } = require('../lib/harness');
const { blank } = require('../lib/start');

test('drawn room, door and window cut the walls', { timeout: 180_000 }, async () => {
  const { b, p, errs } = await open(); after(() => b.close());
  await blank(p);
  await p.evaluate(() => { state.set.props = []; setMode('top'); }); await p.waitForTimeout(1200); await p.evaluate(() => { viewer.dist = 34; viewer.tx = 0; viewer.tz = 0; renderWorld(); }); await p.waitForTimeout(300);
  await p.click('#buildBtn'); await p.waitForTimeout(300);
  const tap = async (x, z) => { const r = await p.evaluate(([x, z]) => { const q = projW(worldV, { x, y: 0, z }), w = $('#world').getBoundingClientRect(); return { x: w.left + q.x, y: w.top + q.y }; }, [x, z]);
    await p.mouse.move(r.x, r.y); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(150); };
  // a 4 × 3 m room: four corners and back to the start (closes it)
  for (const [x, z] of [[-2, -1.5], [2, -1.5], [2, 1.5], [-2, 1.53], [-2.02, -1.48]]) await tap(x, z);
  await p.click('#bTool [data-bt="floor"]'); await tap(-2, -1.5); await p.mouse.move(400, 300); await tap(2, 1.5);
  await p.click('#bTool [data-bt="block"]'); await tap(0.5, 0.3); await tap(1.5, 1.0);
  await p.click('#bDone');
  // a door near the bottom wall snaps into it and cuts the wall; a window into the right wall
  await p.evaluate(() => { startPlace('flatdoor'); movePlace({ x: -0.6, z: -1.3 }); confirmPlace(); }); await p.waitForTimeout(200);
  await p.evaluate(() => { startPlace('flatwin'); movePlace({ x: 2.2, z: 0.2 }); confirmPlace(); });
  const pieces = await p.evaluate(() => state.set.props.filter(o => o.type === 'wall').map(o => wallPieces(o).length));
  const boxes = await p.evaluate(() => setBoxes().filter(b => b.obj && b.obj.type === 'wall').length);
  await p.screenshot({ path: path.join(OUT, 'build-top.png') });
  assert.deepEqual(pieces, [3, 3, 1, 1]); assert.equal(boxes, 8); assert.deepEqual(errs, []);
});
