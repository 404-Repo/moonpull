import * as THREE from '/Users/atlas/404_assetlib/node_modules/three/build/three.module.js';
const f = process.argv[2];
const g = (await import(f + '?' + Date.now())).default(THREE);
g.updateMatrixWorld(true);
const all = [], rock = [];
let tris = 0;
g.traverse((n) => { if (!n.isMesh) return; all.push(n); if (['sand', 'sand2', 'wet'].includes(n.name)) rock.push(n); tris += n.geometry.attributes.position.count / 3; n.material.side = THREE.DoubleSide; });
const box = new THREE.Box3().setFromObject(g);
const rc = new THREE.Raycaster();
const cast = (objs, o, d) => { rc.set(o, d); const h = rc.intersectObjects(objs, false)[0]; return h ? h.distance : Infinity; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function gap(objs, y) {
  let mn = Infinity, e;
  for (let z = -3.4; z <= 3.41; z += 0.2) {
    const L = cast(objs, V(0, y, z), V(-1, 0, 0)), R = cast(objs, V(0, y, z), V(1, 0, 0));
    if (L + R < mn) { mn = L + R; e = [-L, R]; }
  }
  return { w: +mn.toFixed(2), edges: e.map((v) => +v.toFixed(2)) };
}
function under(objs, half, dz = 0.5) {
  let mn = Infinity;
  for (let x = -half; x <= half + 1e-6; x += 0.25) for (let z = -3.5; z <= 3.51; z += dz) mn = Math.min(mn, 0.3 + cast(objs, V(x, 0.3, z), V(0, 1, 0)));
  return +mn.toFixed(2);
}
const r = {};
for (const [nm, objs] of [['rock', rock], ['all', all]]) {
  const g0 = gap(objs, 0.3), g3 = gap(objs, 3.0), g8 = gap(objs, 8.0);
  const half = Math.min(-g3.edges[0], g3.edges[1], -g0.edges[0], g0.edges[1]) - 0.3;
  r[nm] = { gap0_3: g0, gap3: g3, gap8: g8, undersideCentre: under(objs, 0, 0.1), undersideMid4m: under(objs, 2), undersideOverGap3: under(objs, half) };
}
console.log(JSON.stringify({ tris, size: box.getSize(V()).toArray().map((v) => +v.toFixed(2)), min: box.min.toArray().map((v) => +v.toFixed(2)), ...r }));
