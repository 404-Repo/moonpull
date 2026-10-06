// cockle_spade, candidate A: primitives. A short spade lying flat on its back: a dark iron blade
// (box body, half-disc rounded tip, rolled treads on the shoulders, a bright worn cutting edge),
// a tapered iron socket with two rivets, a pale ash shaft and a T-grip crossbar. 0.9 m long,
// blade toward +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, extra = {}) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, ...extra }); if (name) x.name = name; return x; };
  const iron = M(0x3a3d40, 'metal', 0.6, { metalness: 0.4 }), steel = M(0x8a8d8e, 'metal', 0.45, { metalness: 0.5 });
  const ash = M(0xb79773, 'timber', 0.8), grip = M(0x7b5a3e, 'timber', 0.75), rust = M(0x7a4a32, 'metal', 0.9);
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  const T = 0.022, by = T / 2, W = 0.19;
  // blade: body, rounded tip, worn edge
  add(new THREE.BoxGeometry(W, T, 0.2), iron, 0, by, 0.26);
  add(new THREE.CylinderGeometry(W / 2, W / 2, T, 14, 1, false, -Math.PI / 2, Math.PI), iron, 0, by, 0.36);
  add(new THREE.TorusGeometry(W / 2 - 0.004, 0.012, 4, 14, Math.PI), steel, 0, by, 0.36, -Math.PI / 2, 0, 0);
  // rust bloom near the shoulder
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.004, 8), rust, 0.05, T + 0.002, 0.22, 0, 0, 0).scale.set(1, 1, 0.7);
  // treads: rolled-over top edge on each shoulder
  for (const s of [1, -1]) add(new THREE.CylinderGeometry(0.017, 0.017, 0.07, 6), iron, s * 0.06, 0.017, 0.165, 0, 0, Math.PI / 2);
  // socket: tapered iron sleeve from the blade up the shaft, with two rivets
  add(new THREE.CylinderGeometry(0.03, 0.045, 0.13, 10), iron, 0, 0.032, 0.105, Math.PI / 2, 0, 0).scale.set(1, 1, 0.75);
  add(new THREE.BoxGeometry(0.1, T, 0.05), iron, 0, by, 0.16);
  for (const z of [0.07, 0.13]) add(new THREE.SphereGeometry(0.009, 6, 4), steel, 0, 0.058, z);
  // shaft and T grip
  add(new THREE.CylinderGeometry(0.022, 0.024, 0.46, 10), ash, 0, 0.026, -0.18, Math.PI / 2, 0, 0);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.035, 10), iron, 0, 0.03, -0.39, Math.PI / 2, 0, 0);
  add(new THREE.CylinderGeometry(0.026, 0.026, 0.15, 10), grip, 0, 0.026, -0.43, 0, 0, Math.PI / 2);
  for (const s of [1, -1]) add(new THREE.SphereGeometry(0.028, 8, 6), grip, s * 0.075, 0.026, -0.43);
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
