// Phone-viewport play session for one jam winner. Usage: node play.mjs <slug> [seconds]
import puppeteer from 'puppeteer';
import fs from 'fs';

const slug = process.argv[2];
const SECS = +(process.argv[3] || 180);
const OUT = `/Users/atlas/astrocade-game4/research/winners/${slug}`;
fs.mkdirSync(OUT, { recursive: true });
const URLS = {
  bellkeeper: 'https://tylerdurdeth.github.io/the-last-bellkeeper/',
  farseek: 'https://farseek.rapidoai.dev/',
  sundrift: 'https://lkruer.github.io/sundrift/game/',
};
const W = 390, H = 844;
const log = [];
const note = (s) => { const l = `[${((Date.now() - t0) / 1000).toFixed(1)}s] ${s}`; log.push(l); console.log(l); };
const t0 = Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: null,
  args: [`--window-size=${W + 20},${H + 140}`, '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--no-first-run'],
});
const page = (await browser.pages())[0];
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1');
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const cdp = await page.createCDPSession();
page.on('console', (m) => { if (m.type() === 'error') note('console.error ' + m.text().slice(0, 200)); });
page.on('pageerror', (e) => note('pageerror ' + String(e).slice(0, 200)));

// --- touch helpers (CDP, so the page sees real touch + pointer events) ---
const pts = new Map();
async function touch(type) {
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...pts.entries()].map(([id, p]) => ({ x: p.x, y: p.y, id, radiusX: 8, radiusY: 8, force: 1 })) });
}
async function down(id, x, y) { pts.set(id, { x, y }); await touch('touchStart'); }
async function move(id, x, y) { pts.set(id, { x, y }); await touch('touchMove'); }
async function up(id) { const p = pts.get(id); pts.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [...pts.entries()].map(([i, q]) => ({ x: q.x, y: q.y, id: i })) }); }
async function tap(x, y) { await down(9, x, y); await sleep(60); await up(9); }
async function tapSel(sel) {
  const r = await page.evaluate((s) => { const e = document.querySelector(s); if (!e || e.hidden || e.offsetParent === null && getComputedStyle(e).position !== 'fixed') return null; const b = e.getBoundingClientRect(); if (!b.width) return null; return { x: b.left + b.width / 2, y: b.top + b.height / 2, t: e.textContent.trim().slice(0, 40) }; }, sel);
  if (r) { await tap(r.x, r.y); note(`tap ${sel} "${r.t}"`); }
  return r;
}
async function rect(sel) {
  return page.evaluate((s) => { for (const e of document.querySelectorAll(s)) { const b = e.getBoundingClientRect(); if (b.width && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none') return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height }; } return null; }, sel).catch(() => null);
}
let shot = 0;
async function snap(tag) {
  shot++;
  const f = `${OUT}/${String(shot).padStart(2, '0')}_${tag}.jpg`;
  await page.screenshot({ path: f, type: 'jpeg', quality: 80 });
  note('frame ' + f.split('/').pop());
}
async function text(sel) { return page.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.trim().replace(/\s+/g, ' ').slice(0, 120) : null; }, sel); }
async function fps() { return page.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 1000) requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); })); }

// Steer a stick toward a screen target: up the screen = forward.
async function stickToward(stick, tx, ty, mag = 1) {
  let dx = tx - W / 2, dy = ty - H * 0.55;
  const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  const R = stick.w / 2;
  await move(1, stick.x + dx * R * mag, stick.y + dy * R * mag);
}

await page.goto(URLS[slug], { waitUntil: 'domcontentloaded', timeout: 90000 });
note('loaded ' + URLS[slug]);
const games = {
  async bellkeeper() {
    for (let i = 0; i < 60; i++) { const d = await page.evaluate(() => document.getElementById('startb')?.disabled); if (d === false) break; await sleep(1000); }
    await snap('title');
    await tapSel('#startb');
    await sleep(1500);
    for (let i = 0; i < 8; i++) { if (!(await tapSel('#storyNext'))) break; await sleep(900); if (i === 1) await snap('prologue'); }
    await tapSel('#skipIntro'); await sleep(2500);
    await snap('start');
    note('fps ' + await fps());
    let lastObj = '', shotsAt = 0;
    const end = Date.now() + SECS * 1000;
    while (Date.now() < end) {
      const obj = await text('#objective'); const zone = await text('#zoneName');
      if (obj !== lastObj) { note(`zone="${zone}" objective="${obj}" caption="${await text('#caption')}"`); lastObj = obj; }
      const act = await rect('#action');
      const actTxt = await text('#action');
      if (act && actTxt && !/Catch wind/.test(actTxt) || (act && Math.random() < 0.15)) { await tap(act.x, act.y); note('action: ' + actTxt); await sleep(1200); }
      const stick = await rect('#stick');
      const mk = await rect('#targetMarker');
      if (stick) {
        if (!pts.has(1)) await down(1, stick.x, stick.y);
        if (mk) await stickToward(stick, mk.x, mk.y, 1);
        else await stickToward(stick, W / 2 + (Math.random() - 0.5) * 200, 0, 1);
      }
      if (Math.random() < 0.05) { const j = await rect('#jump'); if (j) await tap(j.x, j.y); }
      await sleep(700);
      if (Date.now() - shotsAt > SECS * 1000 / 9) { await snap('play'); shotsAt = Date.now(); }
      if (await rect('#storyNext')) await tapSel('#storyNext');
      if (await rect('#keepExploring')) { note('ENDING reached'); await snap('ending'); break; }
    }
    if (pts.has(1)) await up(1);
  },
  async farseek() {
    for (let i = 0; i < 90; i++) { if (await rect('#startb')) break; await sleep(1000); }
    await sleep(1500);
    await snap('title');
    await tapSel('#startb');
    await sleep(3000);
    // skip cinematic: taps on the picture
    for (let i = 0; i < 6; i++) { await tap(W / 2, H / 3); await sleep(900); }
    await snap('start');
    note('fps ' + await fps());
    let lastObj = '', shotsAt = 0;
    const end = Date.now() + SECS * 1000;
    while (Date.now() < end) {
      const obj = await text('#objective');
      if (obj !== lastObj) { note(`objective="${obj}" sub="${await text('#objective-sub')}" prompt="${await text('#prompt')}" hint="${await text('#hint')}"`); lastObj = obj; }
      const use = await rect('#touch [data-touch="use"]');
      const pr = await text('#prompt');
      if (use && pr) { await down(3, use.x, use.y); await sleep(400); await up(3); note('use: ' + pr); }
      const stick = await rect('#stick');
      const mk = await rect('#markers > *');
      if (stick) {
        if (!pts.has(1)) await down(1, stick.x, stick.y);
        if (mk) await stickToward(stick, mk.x, mk.y, 1);
        else { await stickToward(stick, W / 2 + (Math.random() - 0.5) * 300, 0, 1); }
      }
      // occasional camera swing toward the marker / look around
      if (!mk && Math.random() < 0.3) { await down(2, 300, 300); await move(2, 360, 300); await up(2); }
      if (Math.random() < 0.06) { const j = await rect('#touch [data-touch="jump"]'); if (j) { await down(4, j.x, j.y); await sleep(100); await up(4); } }
      await sleep(700);
      if (Date.now() - shotsAt > SECS * 1000 / 9) { await snap('play'); shotsAt = Date.now(); }
    }
    if (pts.has(1)) await up(1);
  },
  async sundrift() {
    for (let i = 0; i < 90; i++) { if (await rect('#startb')) break; await sleep(1000); }
    await sleep(2000);
    await snap('title');
    await tapSel('#startb');
    await sleep(4000);
    await snap('start');
    note('fps ' + await fps());
    let shotsAt = 0, phase = 0;
    const end = Date.now() + SECS * 1000;
    const st = await rect('#stick') || { x: W / 2, y: H * 0.8, w: 160 };
    note('stick rect ' + JSON.stringify(st));
    await down(1, st.x, st.y);
    let sx = st.x;
    while (Date.now() < end) {
      // hold to drive, slow sine steering, with periodic handbrake drifts
      phase += 0.7;
      sx = st.x + Math.sin(phase * 0.6) * 45;
      await move(1, sx, st.y);
      if (Math.random() < 0.08) { const b = await rect('#brake'); if (b) { await down(5, b.x, b.y); await sleep(500); await up(5); note('handbrake'); } }
      await sleep(600);
      if (Date.now() - shotsAt > SECS * 1000 / 9) { await snap('play'); shotsAt = Date.now(); note('hud: ' + await text('#hud')); }
      if (await rect('#results')) { note('RESULTS: ' + await text('#results')); await snap('results'); break; }
    }
    if (pts.has(1)) await up(1);
  },
};
try { await games[slug](); } catch (e) { note('ERR ' + e.stack); }
await snap('final');
fs.writeFileSync(`${OUT}/playlog.txt`, log.join('\n') + '\n');
await browser.close();
