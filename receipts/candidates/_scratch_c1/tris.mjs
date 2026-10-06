// per-material triangle breakdown of a candidate module (node, local three)
import * as THREE from '/Users/atlas/cod_bmx/vendor/three/three.module.js';
const mod = await import(process.argv[2] + '?' + Date.now());
const g = mod.default(THREE); const out = {}; let t = 0;
g.traverse((n) => { if (!n.isMesh) return; const c = (n.geometry.index ? n.geometry.index.count : n.geometry.attributes.position.count) / 3 * (n.count || 1); out[n.name || n.material.name] = c; t += c; });
console.log(t, JSON.stringify(out));
