// usage: node gamecam.mjs out_dir name=/path/asset.js [name=...]  -> out_dir/<name>_behind.png, _q34.png, and a sheet
import puppeteer from 'puppeteer';
import { createServer } from 'http';
import fs from 'fs'; import path from 'path';
const ROOT = '/Users/atlas/astrocade-game4';
const SCR = path.dirname(new URL(import.meta.url).pathname);
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png' };
const out = path.resolve(process.argv[2]); fs.mkdirSync(out, { recursive: true });
const srv = createServer((q, s) => {
  const p = decodeURIComponent(q.url.split('?')[0]);
  const f = p.startsWith('/_scr/') ? path.join(SCR, p.slice(6)) : p.startsWith('/_out/') ? path.join(out, p.slice(6)) : path.join(ROOT, p);
  if (!fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;
const b = await puppeteer.launch({ headless: true, args: ['--use-angle=metal', '--no-sandbox'] });
const items = process.argv.slice(3).map((s) => s.split('='));
const views = [['behind', 0], ['q34', 35]];
const shots = [];
for (const [name, asset] of items) for (const [vn, yaw] of views) {
  const pg = await b.newPage(); pg.on('pageerror', (e) => console.log('ERR', e.message));
  await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await pg.goto(`http://127.0.0.1:${port}/_scr/gamecam.html?a=${encodeURIComponent(asset)}&yaw=${yaw}`);
  await pg.waitForFunction(() => document.title.startsWith('DONE'), { timeout: 90000 });
  const file = `${name}_${vn}.png`; await pg.screenshot({ path: path.join(out, file) }); shots.push([name, vn, file]);
  console.log(name, vn, await pg.title()); await pg.close();
}
// sheet: each frame in full (phone size) plus a 3x crop around the hero
const pg = await b.newPage();
const cols = shots.map(([n, v, f]) => `<div><p>${n} ${v}</p><img class=full src="/_out/${f}"><div class=crop><img src="/_out/${f}"></div></div>`).join('');
await pg.setViewport({ width: Math.max(800, shots.length * 400), height: 1400 });
await pg.setContent(`<html><head><base href="http://127.0.0.1:${port}/"><style>body{margin:0;background:#222;color:#eee;font:16px sans-serif;display:flex;gap:10px;padding:10px}
p{margin:2px}.full{width:390px;height:844px;display:block}.crop{width:390px;height:390px;overflow:hidden;position:relative;margin-top:8px}
.crop img{position:absolute;width:1170px;height:2532px;left:-390px;top:-1290px}</style></head><body>${cols}</body></html>`);
await pg.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))));
await pg.screenshot({ path: path.join(out, 'sheet.png'), fullPage: true });
await b.close(); srv.close();
