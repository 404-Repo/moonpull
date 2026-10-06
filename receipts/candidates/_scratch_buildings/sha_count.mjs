import * as THREE from '/Users/atlas/3dbench/node_modules/three/build/three.module.js';
for (const f of process.argv.slice(2)) {
  const mod = await import(f + '?' + Date.now()); const g = mod.default(THREE);
  const out = {}; let tot = 0; const bb = new THREE.Box3().setFromObject(g);
  g.traverse((o) => { if (o.isMesh) { const t = o.geometry.attributes.position.count / 3; out[o.name] = Math.round(t); tot += t; } });
  console.log(f.split('/').pop(), Math.round(tot), JSON.stringify(out), bb.getSize(new THREE.Vector3()).toArray().map((v) => v.toFixed(2)).join('x'));
}
