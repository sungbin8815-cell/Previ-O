// Opens PREVIO in a real browser for the e2e tests. The repo is served from a local server on a free port; the CDN libraries the
// app loads are answered from tests/e2e/node_modules (same versions), so the tests do not depend on the network. Fonts pass through.
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..'), NM = path.resolve(__dirname, '../node_modules');
const OUT = path.resolve(__dirname, '../out'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.vrm': 'model/gltf-binary',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.hdr': 'application/octet-stream', '.webmanifest': 'application/manifest+json' };

function libPath(rel, root = NM) { const f = path.join(root, rel);
  if (!fs.existsSync(f)) throw new Error(`missing ${rel}: run npm --prefix tests/e2e install first`); return f; }

let srv = null, port = 0;
function serve() { if (srv) return Promise.resolve(port);
  srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  return new Promise(res => srv.listen(0, () => { port = srv.address().port; res(port); })); }

function cdnFile(u) {
  if (u.includes('Sortable')) return libPath('sortablejs/Sortable.min.js');
  if (u.includes('lz-string')) return libPath('lz-string/libs/lz-string.min.js');
  if (u.includes('es-module-shims')) return libPath('es-module-shims/dist/es-module-shims.js');
  if (u.includes('three-vrm')) return libPath('@pixiv/three-vrm/lib/three-vrm.module.min.js');
  const m = u.match(/three@0\.160\.0\/(.*)$/); return m ? libPath('three/' + m[1]) : null; }

async function open(opts = {}) { const at = await serve();
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ ...(opts.device ? devices[opts.device] : { viewport: opts.viewport || { width: 1280, height: 800 } }), serviceWorkers: 'block' });
  const p = await ctx.newPage(), errs = [];
  await p.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/, r => { const u = r.request().url();
    if (/fonts\.(googleapis|gstatic)\.com|SUIT/.test(u)) return r.continue().catch(() => r.abort().catch(() => {}));
    const f = cdnFile(u); if (!f) return r.fulfill({ body: '', contentType: 'text/css' });
    return r.fulfill({ path: f, contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' } }); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await p.goto(`http://localhost:${at}/index.html` + (opts.q || ''), { waitUntil: 'load' }); await p.waitForTimeout(1500);
  // a click aimed at the app's hidden control lands on the Astryx component drawn in its place
  const axTarget = sel => p.evaluateHandle(sel => { const el = document.querySelector(sel); if (!el || !window.PREVIO_UI) return el;
    const reg = PREVIO_UI.reg; if (reg.has(el)) return reg.get(el).host.querySelector('button, [role=slider], input') || el;
    const grp = el.parentElement && reg.get(el.parentElement); if (grp) { const items = [...el.parentElement.querySelectorAll(':scope > button')].filter(b => getComputedStyle(b).display !== 'none' && !b.hidden);
      const ax = grp.host.querySelectorAll('[role=radio], [role=tab], button'); return ax[items.indexOf(el)] || el; } return el; }, sel);
  const click0 = p.click.bind(p); p.click = async (sel, o) => { const h = (await axTarget(sel)).asElement(); if (h && await h.evaluate(e => !!e.closest('.ax-host'))) return h.click(o); return click0(sel, o); };
  const close = b.close.bind(b); b.close = async () => { await close(); if (srv) { srv.close(); srv = null; } };
  return { b, p, errs }; }

module.exports = { open, serve, libPath, OUT };
