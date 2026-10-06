// dev: render fixed viewpoints at given tide levels. node views.mjs out "x,y,z,tx,ty,tz,tide" ...
import puppeteer from 'puppeteer';
const [out, ...vs] = process.argv.slice(2);
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 640, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto('http://localhost:8796/?autostart', { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true');
let i = 0;
for (const v of vs) {
  const a = v.split(',').map(Number);
  await page.evaluate((a) => { window.__VIEW__ = a.slice(0, 6); window.__TIDE__ = a[6] ?? 0; document.getElementById('hud').style.display = 'none'; }, a);
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: `${out}_${i++}.jpg`, type: 'jpeg', quality: 80 });
}
await browser.close();
