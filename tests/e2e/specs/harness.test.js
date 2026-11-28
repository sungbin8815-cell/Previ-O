const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const path = require('path');
const { serve } = require('../lib/harness');

test('a run without the test libraries fails fast and exits', { timeout: 60_000 }, () => {
  const env = { ...process.env, E2E_LIBS: '/nonexistent' }; delete env.NODE_TEST_CONTEXT; // a nested test run reports to its parent unless this is removed
  const r = spawnSync(process.execPath, ['--test', path.join(__dirname, 'smoke.test.js')], { env, timeout: 45_000, encoding: 'utf8' });
  assert.notEqual(r.error && r.error.code, 'ETIMEDOUT', 'the test process hung instead of exiting');
  assert.notEqual(r.status, 0);
  assert.match(r.stdout + r.stderr, /npm --prefix tests\/e2e install/);
});

test('the test server listens on loopback only', async () => {
  const { srv } = await serve(true);
  try { assert.equal(srv.address().address, '127.0.0.1'); } finally { srv.close(); }
});
