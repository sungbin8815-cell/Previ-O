// Builds the Astryx layer the app loads: dist/previo-ui.js (React, Astryx components, the bridge) and dist/previo-ui.css
// (Astryx base styles, the cart and well themes, the bridge styles). Run `npm install` once, then `npm run build`; commit dist/.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('dist', { recursive: true });
await build({ entryPoints: ['src/main.jsx'], bundle: true, minify: true, format: 'esm', target: 'es2022', jsx: 'automatic',
  outfile: 'dist/previo-ui.js', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'none', logLevel: 'warning' });
const css = ['node_modules/@astryxdesign/core/dist/astryx.css', 'src/themes/cart/cart.css', 'src/themes/well/well.css', 'src/bridge.css'].map(f => `/* ${f} */\n` + readFileSync(f, 'utf8')).join('\n');
writeFileSync('dist/previo-ui.css', css);
for (const f of ['dist/previo-ui.js', 'dist/previo-ui.css']) console.log(f, Math.round(readFileSync(f).length / 1024), 'KB');
