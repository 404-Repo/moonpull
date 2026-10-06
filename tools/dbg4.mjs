import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu','--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto('http://localhost:8796/', { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true');
for (const t of [1500, 6000, 7000]) { await new Promise(r=>setTimeout(r,t)); await page.screenshot({ path: `/private/tmp/claude-501/-Users-atlas/b41d2d72-1f23-42d4-a1af-a08304467058/scratchpad/title_${t}.jpg`, type:'jpeg', quality: 70 }); }
console.log(await page.evaluate(()=>{const e=document.querySelector('#slides .sl.on');const r=e.getBoundingClientRect();return [r.width,r.height,getComputedStyle(e).backgroundImage]}));
await browser.close();
