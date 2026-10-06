import puppeteer from 'puppeteer';
const OUT = '/Users/atlas/astrocade-game4/floor/_frames';
const b = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage();
await p.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
p.on('pageerror', e => console.log('PAGEERR', e.message));
await p.goto('http://localhost:8797/', { waitUntil: 'networkidle0' });
await p.waitForFunction('window.__READY__', { timeout: 30000 });
const cdp = await p.createCDPSession();
const wait = ms => new Promise(r => setTimeout(r, ms));
const touches = new Map();
async function send(type) {
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...touches.entries()].map(([id, t]) => ({ x: t.x, y: t.y, id })) });
}
async function down(id, x, y) { touches.set(id, { x, y }); await send('touchStart'); }
async function move(id, x, y) { touches.set(id, { x, y }); await send('touchMove'); }
async function up(id) { touches.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [...touches.entries()].map(([i, t]) => ({ x: t.x, y: t.y, id: i })) }); }
const SC = { x: 99, y: 297 };
async function stickHold(dx, dy) { await down(1, SC.x, SC.y); for (let i = 1; i <= 5; i++) { await move(1, SC.x + dx * i / 5, SC.y + dy * i / 5); await wait(30); } }
async function seaDrag(dy, steps = 12) { const x = 680, y0 = dy > 0 ? 120 : 300; await down(2, x, y0); for (let i = 1; i <= steps; i++) { await move(2, x, y0 + dy * i / steps); await wait(40); } await up(2); }
const G = () => p.evaluate(() => JSON.stringify(window.__GAME__));
const D = (code) => p.evaluate(code);
async function shot(i) { await p.screenshot({ path: `${OUT}/f${i}.jpg`, type: 'jpeg', quality: 82 }); console.log('f' + i, await G()); }

await p.tap('#startb'); await wait(1200);
// f0 village: walk along the boardwalk toward Nell
await D('__DEBUG__.tp(-47,6.2); __DEBUG__.yaw(-0.15)');
await wait(700);
await stickHold(4, -52); await wait(1400); await shot(0);
await wait(1800); await up(1); await wait(300);
console.log('after nell walk', await G());
console.log('obj after Nell (walked, no teleport)', await G());
// f1 causeway at low tide: go down the ramp, pull the sea low with the right thumb while walking east
await D('__DEBUG__.tp(-11.5,3); __DEBUG__.yaw(-0.35)'); await wait(500);
await seaDrag(170); await wait(1500);
await D('__DEBUG__.yaw(0.05)');
await stickHold(10, -52); await wait(2500); await shot(1);
await wait(800); await up(1);
// to the islet
await D('__DEBUG__.tp(28,0); __DEBUG__.yaw(0)'); await wait(300);
await stickHold(0, -52); await wait(2600); await up(1); await wait(300);
console.log('obj after islet', await G());
// f2 islet: walk up to the well while raising the sea
await D('__DEBUG__.tp(34,-2.5); __DEBUG__.yaw(0.25)'); await wait(600);
await stickHold(4, -50); await wait(900); await shot(2); await up(1);
await down(2, 680, 320); for (let i = 1; i <= 14; i++) { await move(2, 680 - i * 4, 320 - i * 16); await wait(40); }
await up(2); await wait(1500);
await D('__DEBUG__.tp(40,1.5)'); await wait(1200);
console.log('obj after shard', await G());
// f3 flats at low tide past the wreck
await seaDrag(220); await wait(1800);
await D('__DEBUG__.tp(58,2); __DEBUG__.yaw(0.35)'); await wait(400);
await stickHold(0, -52); await wait(2200); await shot(3); await wait(1500); await up(1);
// f4 Tam's boat floating
await D('__DEBUG__.tp(84,-1); __DEBUG__.yaw(-1.2)'); await wait(800);
await seaDrag(-130); await wait(2000);
console.log('obj after float', await G());
await stickHold(-30, -45); await wait(900); await shot(4); await wait(1200); await up(1); await wait(500);
console.log('after boarding walk', await G());
const st = await D('JSON.stringify({sailing:__DEBUG__.state().sailing, boat:__DEBUG__.state().boatFloat})'); console.log(st);
if (!JSON.parse(st).sailing) { await D('__DEBUG__.tp(81.5,-5.5)'); await wait(600); }
await D('__DEBUG__.yaw(0.2)');
await wait(4500); await shot(5);
await wait(7000); console.log('end', await G());
await b.close();
