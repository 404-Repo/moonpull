import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu','--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390 });
page.on('pageerror', (e) => console.log('ERR', e.message));
page.on('console', (m) => { if (m.type()==='error') console.log('CERR', m.text()); });
await page.goto('http://localhost:8796/?autostart&step=15&at=214,-42', { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true');
for(let k=0;k<6;k++){await new Promise(r=>setTimeout(r,2500)); console.log(await page.evaluate(()=>document.getElementById('sayname').textContent+': '+document.getElementById('saytext').textContent.slice(0,60)+' | '+document.getElementById('say').className+' step '+__DEV__.story.i));}
console.log(await page.evaluate(()=>{const s=__DEV__.story; return JSON.stringify({i:s.i, n:s.steps.length, text:s.current&&s.current.text, chk: s.current&&s.current.check&&s.current.check(), talking: document.getElementById('say').className, pos:[__DEV__.player.pos.x,__DEV__.player.pos.z]});}));
await browser.close();
