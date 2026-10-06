// My own gate: play the objective chain on a phone with REAL multi-touch (stick + tide dial at
// once, through CDP), assert each step advances, photograph it in motion.
//   node tools/play.mjs [--url=] [--out=] [--w=844 --h=390] [--route=harbour|flats|all] [--step=n --at=x,z]
import puppeteer from 'puppeteer';
import fs from 'fs';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const BASE = arg('url', 'http://localhost:8796/');
const OUT = arg('out', '/private/tmp/claude-501/-Users-atlas/b41d2d72-1f23-42d4-a1af-a08304467058/scratchpad/play');
const W = +arg('w', 844), H = +arg('h', 390), ROUTE = arg('route', 'harbour');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
const q = [];
if (process.argv.includes('--clean')) q.push('clean');
if (arg('step')) q.push('step=' + arg('step'));
if (arg('at')) q.push('at=' + arg('at'));
await page.goto(BASE + (q.length ? '?' + q.join('&') : ''), { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true');
const cdp = await page.target().createCDPSession();
const touches = new Map();
async function sendTouch(type) {
  const pts = [...touches.entries()].map(([id, p]) => ({ x: p.x, y: p.y, id, radiusX: 8, radiusY: 8, force: 1 }));
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
}
async function down(id, x, y) { touches.set(id, { x, y }); await sendTouch('touchStart'); }
async function move(id, x, y) { touches.set(id, { x, y }); await sendTouch('touchMove'); }
// CDP: points missing from a touchMove are released; touchEnd must carry no points
async function up(id) { touches.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); if (touches.size) await sendTouch('touchStart'); }
const box = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, vis: e.offsetParent !== null && r.width > 0 }; });
const G = () => page.evaluate(() => window.__GAME__);
let shot = 0, t0 = Date.now();
const snap = async (name) => { const f = `${OUT}/${String(shot++).padStart(2, '0')}_${name}.jpg`; await page.screenshot({ path: f, type: 'jpeg', quality: 78 }); };
const log = async (m) => { const g = await G(); console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${m} | step ${g.step} pos ${g.pos} y ${g.y} tide ${g.tide} depth ${g.depth} use ${g.use} | ${g.objective}`); };

// start, with a real tap
const sb = await box('#startb');
await page.touchscreen.tap(sb.cx, sb.cy); await sleep(1200); await snap('start');

// dial: hold at value v (-1..1) with finger id 2
let dialHeld = false;
async function dial(v) {
  const b = await box('#tidetrack');
  const y = b.y + (1 - (v + 1) / 2) * b.h, x = b.cx;
  if (!dialHeld) { await down(2, x, y); dialHeld = true; } else await move(2, x, y);
}
async function dialOff() { if (dialHeld) { await up(2); dialHeld = false; } }

// walk to (x,z) with the stick, steering every 120 ms from telemetry
async function walk(tx, tz, { r = 1.5, run = true, timeout = 60000, during, snapEvery = 0, name = 'walk' } = {}) {
  const sb2 = await box('#stick');
  await down(1, sb2.cx, sb2.cy); await sleep(50);
  const end = Date.now() + timeout; let lastSnap = Date.now(), ok = false, stuck = 0, last = null;
  while (Date.now() < end) {
    const g = await G();
    const dx = tx - g.pos[0], dz = tz - g.pos[1], d = Math.hypot(dx, dz);
    if (process.env.TRACE) console.log('   t', g.pos, g.y, g.tide, g.depth);
    if (d < r) { ok = true; break; }
    const y = g.camYaw, fx = -Math.sin(y), fz = -Math.cos(y), rx = Math.cos(y), rz = -Math.sin(y);
    const my = (dx * fx + dz * fz) / d, mx = (dx * rx + dz * rz) / d;
    const R = run ? 58 : 34;
    await move(1, sb2.cx + mx * R, sb2.cy - my * R);
    if (during) await during(g);
    if (snapEvery && Date.now() - lastSnap > snapEvery) { lastSnap = Date.now(); await snap(name); }
    if (last && Math.hypot(g.pos[0] - last[0], g.pos[1] - last[1]) < 0.05) stuck++; else stuck = 0;
    last = g.pos;
    if (stuck > 25) break;
    await sleep(120);
  }
  await up(1);
  await log(`${ok ? 'reached' : 'FAILED to reach'} ${tx},${tz}`);
  return ok;
}
async function tap(x, y) { await down(3, x, y); await sleep(60); await up(3); }
async function use() { const b = await box('#act'); if (!b.vis) { await log('no use button'); return false; } await tap(b.cx, b.cy); await sleep(400); return true; }
async function talkThrough() { for (let i = 0; i < 12; i++) { const g = await G(); if (!g.talking) break; const b = await box('#say'); await snap('talk'); await tap(b.cx, b.cy); await sleep(500); } }
async function waitTide(pred, ms = 15000) { const e = Date.now() + ms; while (Date.now() < e) { const g = await G(); if (process.env.TRACE) console.log("   w", g.pos, g.y, g.tide, g.mv, g.vel); if (pred(g.tide)) return true; await sleep(150); } return false; }
const expectStep = async (n, what) => { const g = await G(); const ok = g.step >= n; console.log(ok ? `  PASS ${what}` : `  FAIL ${what} (step ${g.step}, wanted ${n})`); results.push([what, ok]); return ok; };
const results = [];

if (ROUTE === 'harbour' || ROUTE === 'all') {
  await log('begin');
  await walk(-151, 48.8, { r: 1.0, snapEvery: 2500 });
  await use(); await talkThrough();
  await expectStep(1, 'talked to Nell, got the lantern');
  await walk(-118, 28, { r: 2, snapEvery: 3000 });
  await dial(-1); await waitTide((t) => t < -1.1); await snap('lowtide');
  await walk(-104, -30, { r: 3, snapEvery: 2500, name: 'causeway', during: async () => dial(-1) });
  await walk(-100, -36, { r: 2.5, during: async () => dial(-1) });
  await dialOff();
  await expectStep(2, 'crossed the causeway to the islet');
  await dial(1); await waitTide((t) => t > 1.6, 12000); await snap('wellfull'); await sleep(800);
  await expectStep(3, 'raised the sea to fill the well');
  await walk(-100, -38.4, { r: 0.6, run: false, during: async () => dial(1) });
  await use(); await snap('shard');
  await expectStep(4, 'took the moon shard');
  await dial(-1); await waitTide((t) => t < -1.6, 12000);
  await walk(-104, -28, { r: 2.5, during: async () => dial(-1) });
  await walk(-121, 28, { r: 2.5, snapEvery: 2500, name: 'return', during: async () => dial(-1) });
  await dialOff();
  await walk(-124, 34, { r: 2.5 });
  await expectStep(5, 'came back to the harbour');
  await walk(-159.5, 30.8, { r: 1.0, snapEvery: 3000 });
  await use(); await talkThrough();
  await expectStep(6, 'talked to Tam');
  await walk(-160, 41.2, { r: 1.2 });
  await dial(1); await waitTide((t) => t > 2.1, 15000); await sleep(2500); await snap('boatfloat');
  await talkThrough();
  await expectStep(7, 'floated Tam\'s boat');
  await sleep(1500); await talkThrough();
  await dial(-1); await waitTide((t) => t < -2.0, 15000);
  await walk(-72, 6, { r: 3, snapEvery: 3000, name: 'east', during: async () => dial(-1) });
  await walk(-30, 4, { r: 3, snapEvery: 3000, name: 'bar', during: async () => dial(-1) });
  await dialOff();
  await expectStep(8, 'crossed the sand bar east');
}
if (ROUTE === 'flats' || ROUTE === 'all') {
  const F = await page.evaluate(() => ({ stern: __DEV__.FLATS.stern, raft: __DEV__.FLATS.raft, wreck: __DEV__.FLATS.wreck }));
  await log('flats begin ' + JSON.stringify(F));
  await dial(-1); await waitTide((t) => t < -2.0, 15000);
  await walk(F.wreck.x - 11, F.wreck.z + 5, { r: 2, snapEvery: 2500, name: 'flats', during: async () => dial(-1) });
  await expectStep(9, 'found the wreck');
  await walk(F.raft.x, F.raft.z, { r: 0.7, run: false, snapEvery: 2500, name: 'toraft', during: async () => dial(-1) });
  await dial(1); await waitTide((t) => t > 2.2, 15000); await snap('raftup');
  await walk(F.stern.x, F.stern.z, { r: 0.8, run: false, during: async () => dial(1) });
  await expectStep(10, 'rode the raft up to the cabin');
  await use(); await snap('lens');
  await expectStep(11, 'took the lens');
  await dial(-1); await waitTide((t) => t < -2.0, 15000);
  await walk(103, -4, { r: 2.5, snapEvery: 3000, name: 'east2', during: async () => dial(-1) });
  await dialOff();
  await expectStep(12, 'carried the lens to Gull Head');
}
if (ROUTE === 'head' || ROUTE === 'all' || ROUTE === 'late') {
  await walk(99, -1.8, { r: 1.2, name: 'head' });
  await use(); await talkThrough();
  await expectStep(13, 'met Tam at Gull Head');
  await walk(100.5, -4.5, { r: 1.5 });
  await use(); await sleep(500);
  await expectStep(14, 'boarded the boat');
  const end = Date.now() + 150000; let lastSnap = 0;
  while (Date.now() < end) {
    const g = await G();
    if (g.step >= 15) break;
    if (g.win) { const c = (g.win[0] + g.win[1]) / 2; await dial(Math.max(-1, Math.min(1, c / 2.4))); }
    if (Date.now() - lastSnap > 4000) { lastSnap = Date.now(); await snap('needle'); }
    await sleep(150);
  }
  await dialOff();
  await expectStep(15, 'threaded the Needles');
}
if (ROUTE === 'stack' || ROUTE === 'all' || ROUTE === 'late') {
  await dial(-1); await waitTide((t) => t < -1.8, 15000);
  for (const [x, z] of [[196, -6], [200, -16], [205, -29], [210, -42]]) await walk(x, z, { r: 2.2, snapEvery: 3000, name: 'stones', during: async () => dial(-1) });
  await expectStep(16, 'crossed the stepping stones');
  await walk(221, -48, { r: 2, during: async () => dial(-1) });
  await dialOff();
  await expectStep(17, 'climbed onto the ledge (boss wakes)');
  const end = Date.now() + 420000; let lastSnap = 0, phaseT = Date.now();
  while (Date.now() < end) {
    const g = await G();
    if (g.step >= 20) break;
    const [st] = g.boss || [];
    if (st === 'lurk' || st === 'rise') await dial(1);
    else if (st === 'hunt') await dial(-1);
    else if (st === 'stranded') await dial(1);
    else if (st === 'exposed') { await dial(1); if (g.use === 'Shine') await use(); }
    else await dial(0);
    if (Date.now() - lastSnap > 3000) { lastSnap = Date.now(); await snap('boss'); console.log('   boss', g.boss, 'tide', g.tide, 'step', g.step); }
    await sleep(120);
  }
  await dialOff();
  await expectStep(20, 'beat the Undertow three times');
  await walk(220, -57.5, { r: 1.2 });
  await use();
  await sleep(18000); await snap('finale');
  await expectStep(21, 'lit the lamp');
  const endOn = await page.evaluate(() => document.getElementById('end').classList.contains('on'));
  console.log(endOn ? '  PASS end card shown' : '  FAIL end card not shown'); results.push(['end card', endOn]);
  await snap('endcard');
}
if (ROUTE === 'errands') {
  const E = async (n, what) => { const g = await G(); const ok = g.errands >= n; console.log(ok ? `  PASS ${what}` : `  FAIL ${what} (errands ${g.errands})`); results.push([what, ok]); };
  await walk(-136.5, 42.6, { r: 1.0 }); await use(); await E(1, 'Marta asks');
  await walk(-150, 44, { r: 1.2 }); await walk(-150, 32, { r: 1.5 });
  await dial(-1); await waitTide((t) => t < -2.2, 15000);
  for (const [x, z] of [[-147, 5], [-131, 3], [-160, 5]]) { await walk(x, z + 1.2, { r: 0.8, during: async () => dial(-1) }); await use(); }
  await E(2, 'found three pots');
  await walk(-150, 32, { r: 1.5, during: async () => dial(-1) }); await dialOff(); await walk(-150, 44, { r: 1.2 }); await walk(-136.5, 42.6, { r: 1.0 }); await use(); await E(3, 'pots returned');
  await walk(-150, 44, { r: 1.2 }); await walk(-150, 33, { r: 1.5 });
  await walk(-126, 35.6, { r: 1.0 }); await use(); await E(4, 'Pip asks');
  await walk(-150, 33, { r: 1.5 }); await walk(-150, 44, { r: 1.2 });
  await dial(1); const until = Date.now() + 60000; while (Date.now() < until) { const g = await G(); if (g.errands >= 5) break; await sleep(300); }
  await E(5, 'boat carried home on high water');
  await dial(-1); await waitTide((t) => t < -0.5, 15000);
  const tb = await page.evaluate(() => { const u = __DEV__.world.uses.find((u) => u.id === 'toyboat'); return [u.x, u.z]; });
  await walk(-150, 33, { r: 1.5, during: async () => dial(-1) });
  await walk(tb[0], tb[1] + 1, { r: 1.0, during: async () => dial(-1) }); await use(); await E(6, 'picked up the toy boat');
  await dialOff(); await walk(-126, 35.6, { r: 1.0 }); await use(); await E(7, 'boat returned to Pip');
}
await log('end'); await snap('end');
const g = await G();
console.log(`draws ${g.draws} tris ${g.tris} fps ${g.fps}`);
console.log('errors', errs.length, errs.slice(0, 5));
console.log('RESULT', results.filter((r) => r[1]).length + '/' + results.length);
await browser.close();
