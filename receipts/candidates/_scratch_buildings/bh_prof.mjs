// per-source-line triangle profile for a candidate (boathouse fork's tool)
import * as THREE from 'three'; import fs from 'fs';
const f = process.argv[2]; let src = fs.readFileSync(f, 'utf8');
src = src.replace('function put(key, geo, m) {', 'function put(key, geo, m) { { const st = new Error().stack.split("\\n").map(l=>l.match(/:(\\d+):\\d+\\)?$/)).filter(Boolean).map(x=>+x[1]); const ln = st.find(n=>n>globalThis.__KITEND) || st[1]; const c=(geo.index?geo.index.count:geo.attributes.position.count)/3; globalThis.__P[ln]=(globalThis.__P[ln]||0)+c; }');
const lines = src.split('\n'); globalThis.__KITEND = lines.findIndex(l => l.includes('---- end kit ----')) + 1; globalThis.__P = {};
const tmp = f.replace(/\.js$/, '.prof.mjs'); fs.writeFileSync(tmp, src);
const g = (await import('file://' + tmp)).default(THREE); fs.unlinkSync(tmp);
const P = globalThis.__P; let tot = 0; for (const k in P) tot += P[k];
console.log('total', tot);
for (const [ln, c] of Object.entries(P).sort((a, b) => b[1] - a[1]).slice(0, +(process.argv[3]||18))) console.log(String(Math.round(c)).padStart(6), ln, lines[ln - 1].trim().slice(0, 100));
