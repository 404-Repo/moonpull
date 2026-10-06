import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu','--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('ERR', e.message));
const F0 = await (async()=>{})();
await page.goto('http://localhost:8796/?autostart&step=9&at=0,0', { waitUntil: 'load' });
await page.waitForFunction('window.__READY__ === true');
await page.evaluate(()=>{ const F=__DEV__.FLATS; window.__TIDE__=-2; __DEV__.player.place(F.raft.x, F.raft.z, 0); });
for (let i=0;i<70;i++){ if(i==42){ await page.evaluate(()=>{const F=__DEV__.FLATS,p=__DEV__.player; window.__steer=setInterval(()=>{},1000);}); }
 if(i>=42){ await page.evaluate(()=>{const F=__DEV__.FLATS,p=__DEV__.player,c=__DEV__.cam; const dx=F.stern.x-p.pos.x,dz=F.stern.z-p.pos.z; const d=Math.hypot(dx,dz)||1; const y=c.yaw; const fx=-Math.sin(y),fz=-Math.cos(y),rx=Math.cos(y),rz=-Math.sin(y); window.__mv=[(dx*rx+dz*rz)/d,(dx*fx+dz*fz)/d];}); } await new Promise(r=>setTimeout(r,150)); if(i==5) await page.evaluate(()=>{window.__TIDE__=undefined; delete window.__TIDE__; __DEV__.tide.target=2.4; __DEV__.tide.hi=2.4; __DEV__.tide.locked=true;});
 console.log(await page.evaluate(()=>{const p=__DEV__.player,t=__DEV__.tide;return [t.level.toFixed(2),p.pos.y.toFixed(2),p.onPlat?'plat':'-',p.swept.toFixed(1), p.pos.x.toFixed(1),p.pos.z.toFixed(1)].join(' ')})); }
await browser.close();
