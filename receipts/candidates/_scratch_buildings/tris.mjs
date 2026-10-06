import * as THREE from 'three';
for (const f of process.argv.slice(2)) {
  const mod = await import(new URL('file://' + f).href + '?' + Date.now());
  const g = mod.default(THREE); const per = {}; let t = 0;
  g.traverse((n) => { if (n.isMesh) { const c = (n.geometry.index ? n.geometry.index.count : n.geometry.attributes.position.count) / 3; per[n.material.name || n.name] = (per[n.material.name || n.name] || 0) + c; t += c; } });
  const b = new THREE.Box3().setFromObject(g); const s = b.getSize(new THREE.Vector3());
  console.log(f.split('/').pop(), 'tris', t, JSON.stringify(per), 'size', s.toArray().map((x) => x.toFixed(2)).join('x'));
}
