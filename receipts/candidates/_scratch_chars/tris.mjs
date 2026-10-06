import * as THREE from '/Users/atlas/404_assetlib/node_modules/three/build/three.module.js';
const mod = await import(process.argv[2]);
const g = mod.default(THREE); const rows = [];
g.traverse((n) => { if (!n.isMesh) return; const geo = n.geometry; const t = (geo.index ? geo.index.count : geo.attributes.position.count) / 3; rows.push([t, geo.type, n.material.name || n.material.color.getHexString()]); });
rows.sort((a, b) => b[0] - a[0]); let tot = 0; rows.forEach(r => tot += r[0]);
console.log('total', tot); console.log(rows.slice(0, +(process.argv[3] || 15)).map(r => r.join(' ')).join('\n'));
