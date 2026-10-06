import puppeteer from 'puppeteer';
import { createServer } from 'http';
import fs from 'fs'; import path from 'path';
const ROOT = '/Users/atlas/astrocade-game4';
const SCR = path.dirname(new URL(import.meta.url).pathname);
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
const srv = createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  const f = p.endsWith('.html') && !p.startsWith('/game') ? path.join(SCR, path.basename(p)) : path.join(ROOT, p);
  if (!fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;
const b = await puppeteer.launch({ headless: true, args: ['--use-angle=metal', '--no-sandbox'] });
const pg = await b.newPage(); pg.on('console', (m) => console.log('page:', m.text())); pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.setViewport({ width: 1800, height: 1200 });
const asset = process.argv[2]; const out = process.argv[3];
await pg.goto(`http://127.0.0.1:${port}/view.html?a=${encodeURIComponent(asset)}&m=${process.argv[4]||'rest'}`);
await pg.waitForFunction(() => document.title.startsWith('DONE'), { timeout: 60000 });
console.log(await pg.title());
console.log('gl:', await pg.evaluate(() => { const g = document.querySelector('canvas').getContext('webgl2'); const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : '?'; }));
await pg.screenshot({ path: out });
await b.close(); srv.close();
