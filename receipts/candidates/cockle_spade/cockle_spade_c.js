// cockle_spade, candidate C: a different reading. A narrow dished "graft" blade (a segmented box
// bent into a shallow scoop), long straps of iron running up both faces of the shaft, and a
// split-wood Y handle with a crossbar. Lying on its back, scoop up, 0.9 m long, blade toward +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, extra = {}) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, ...extra }); if (name) x.name = name; return x; };
  const iron = M(0x3a3d40, 'metal', 0.6, { metalness: 0.4 }), steel = M(0x8a8d8e, 'metal', 0.45, { metalness: 0.5 });
  const wood = M(0x7b5a3e, 'timber', 0.8), pale = M(0xb79773, 'timber', 0.85);
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  // dished blade: box with x segments, bent up at the sides and narrowed to a round nose
  const L = 0.32, W = 0.16;
  const bg = new THREE.BoxGeometry(W, 0.016, L, 8, 1, 8);
  { const p = bg.attributes.position; for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), t = (z + L / 2) / L; // 0 at socket, 1 at the nose
    const nose = t > 0.75 ? Math.sqrt(Math.max(0, 1 - ((t - 0.75) / 0.25) ** 2)) : 1;
    const nx = x * (1 - 0.15 * t) * (0.25 + 0.75 * nose);
    p.setX(i, nx); p.setY(i, p.getY(i) + 0.9 * (nx * nx) / (W / 2) * 1.0 + 0.008);
  } bg.computeVertexNormals(); }
  add(bg, iron, 0, 0.0, 0.29);
  // worn nose: a bright band
  add(new THREE.TorusGeometry(0.05, 0.009, 4, 10, Math.PI), steel, 0, 0.012, 0.41, -Math.PI / 2, 0, 0);
  // shoulders and the strapped socket running up the shaft
  add(new THREE.BoxGeometry(0.12, 0.03, 0.04), iron, 0, 0.022, 0.13);
  for (const s of [1, -1]) add(new THREE.BoxGeometry(0.014, 0.06, 0.22), iron, s * 0.028, 0.03, 0.02);
  for (const z of [-0.04, 0.06]) add(new THREE.SphereGeometry(0.008, 5, 4), steel, 0.036, 0.04, z).scale.set(1, 1, 1);
  // shaft
  add(new THREE.CylinderGeometry(0.023, 0.025, 0.42, 8), pale, 0, 0.03, -0.12, Math.PI / 2, 0, 0);
  // Y handle: the shaft splits into two cheeks joined by a crossbar
  for (const s of [1, -1]) { const o = add(new THREE.CylinderGeometry(0.018, 0.022, 0.15, 7), wood, s * 0.04, 0.026, -0.39); o.quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, 0, -s * 0.45, 'YXZ')); }
  add(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 8), wood, 0, 0.026, -0.45, 0, 0, Math.PI / 2);
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
