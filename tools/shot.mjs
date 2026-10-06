// Dev capture: load the game, tap start with a real touch, optionally run a scripted sequence of
// real inputs, and save frames plus console errors.
//   node tools/shot.mjs [--url=] [--out=dir] [--w=844 --h=390] [--script=name] [--desktop]
import puppeteer from 'puppeteer';
import fs from 'fs';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const URL = arg('url', 'http://localhost:8796/');
const OUT = arg('out', '/private/tmp/claude-501/-Users-atlas/b41d2d72-1f23-42d4-a1af-a08304467058/scratchpad/shots');
const W = +arg('w', 844), H = +arg('h', 390), DESK = process.argv.includes('--desktop');
const SCRIPT = arg('script', 'look');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: DESK ? 1 : 2, isMobile: !DESK, hasTouch: !DESK });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
page.on('requestfailed', (r) => errs.push('failed: ' + r.url()));
page.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
const t0 = Date.now();
await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction('window.__READY__ === true', { timeout: 90000 });
console.log('ready in', ((Date.now() - t0) / 1000).toFixed(1), 's');
let n = 0;
const snap = async (name) => { const f = `${OUT}/${String(n++).padStart(2, '0')}_${name}.jpg`; await page.screenshot({ path: f, type: 'jpeg', quality: 82 }); const g = await page.evaluate(() => JSON.stringify(window.__GAME__)); console.log(f, g); };
await snap('title');
const b = await page.$eval('#startb', (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
if (DESK) await page.mouse.click(b[0], b[1]); else await page.touchscreen.tap(b[0], b[1]);
await sleep(1500);
await snap('start');

// helpers driving REAL input
const stickHold = async (dx, dy, ms) => {
  const r = await page.$eval('#stick', (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.touchscreen.touchStart(r[0], r[1]); await sleep(60);
  await page.touchscreen.touchMove(r[0] + dx, r[1] + dy); await sleep(ms); await page.touchscreen.touchEnd();
};
const key = async (k, ms) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); };
const scripts = {
  async look() { for (let i = 0; i < 3; i++) { await stickHold(0, -50, 1500); await snap('walk' + i); } },
  async dev() { await sleep(500); },
};
await (scripts[SCRIPT] || scripts.look)();
await snap('end');
fs.writeFileSync(`${OUT}/errors.txt`, errs.join('\n'));
console.log('errors:', errs.length); for (const e of errs.slice(0, 15)) console.log('  ', e.slice(0, 220));
await browser.close();
