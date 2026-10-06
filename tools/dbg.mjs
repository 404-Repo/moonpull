import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu','--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto('http://localhost:8796/?autostart', { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true');
const r = await page.$eval('#stick', (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
await page.touchscreen.touchStart(r[0], r[1]); await new Promise(r=>setTimeout(r,60)); await page.touchscreen.touchMove(r[0], r[1]-50);
for (let i=0;i<30;i++){ await new Promise(r=>setTimeout(r,200)); console.log(await page.evaluate(()=>{const p=__DEV__.player;return [p.pos.x.toFixed(1),p.pos.y.toFixed(2),p.pos.z.toFixed(1),p.depth.toFixed(2),p.swept.toFixed(2),p.safe.y.toFixed(2), document.getElementById('fade').className].join(' ')})); }
await browser.close();
