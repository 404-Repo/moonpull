import * as THREE from 'three';
const f = process.argv[2];
const g = (await import('file://' + f)).default(THREE); g.updateMatrixWorld(true);
const meshes = []; g.traverse((o) => o.isMesh && meshes.push(o));
const rc = new THREE.Raycaster();
const cast = (o, d, filt) => { rc.set(o, d); const h = rc.intersectObjects(meshes, false).filter((h) => !filt || filt(h)); return h[0]; };
// find tread x-centre: scan x at mid-run on step 1 for hits on 'stone' at tread height
const box = new THREE.Box3().setFromObject(g); console.log('bbox', box.min.toArray().map(v=>v.toFixed(2)).join(','), box.max.toArray().map(v=>v.toFixed(2)).join(','));
const off = new THREE.Vector3(); // locate the first tread: scan z from +front
let rows = [];
for (let z = box.max.z - 0.05; z > box.min.z; z -= 0.05) { const h = cast(new THREE.Vector3(+process.env.MX || 0.45, 20, z), new THREE.Vector3(0, -1, 0)); if (h) rows.push([z, h.point.y, h.object.material.name]); }
// collapse into plateaus
let pl = []; for (const [z, y, n] of rows) { const last = pl[pl.length - 1]; if (last && Math.abs(last.y - y) < 0.03) { last.z1 = z; } else pl.push({ z0: z, z1: z, y, n }); }
console.log('profile at x=0 (z from front to back): ' + pl.filter(p => p.z0 - p.z1 > 0.15).map(p => `${p.y.toFixed(3)}@[${p.z0.toFixed(2)},${p.z1.toFixed(2)}]`).join(' '));
// clear width per tread at 0.15 and 0.6 above the tread
for (const p of pl.filter(p => p.z0 - p.z1 > 0.15)) {
  const z = (p.z0 + p.z1) / 2; const out = [];
  for (const dy of [0.15, 0.6]) { const o = new THREE.Vector3(0, p.y + dy, z); const L = cast(o, new THREE.Vector3(-1, 0, 0)), R = cast(o, new THREE.Vector3(1, 0, 0)); out.push(`${dy}: L ${L ? L.point.x.toFixed(2) + L.object.material.name[0] : '-'} R ${R ? R.point.x.toFixed(2) + R.object.material.name[0] : '-'}`); }
  if (process.argv[3]) console.log(`  y ${p.y.toFixed(2)} z ${z.toFixed(2)}  ${out.join(' | ')}`); else p.w = out;
}
const ws = pl.filter(p => p.z0 - p.z1 > 0.15).map(p => p.w).flat().filter(Boolean);
