// toy_boat, candidate A: primitives. A child's carved wooden sailboat sitting upright on its keel:
// a hull from a stretched half cylinder with a cone bow and a flat transom, a red painted strake,
// a deck slab, a dowel mast, a triangular cloth mainsail and jib (flattened three-sided prisms) and
// a little pennant. 0.45 m long, bow toward +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, extra = {}) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, ...extra }); if (name) x.name = name; return x; };
  const hullC = M(0x9a7048, 'timber', 0.8), deck = M(0xb79773, 'timber', 0.85), red = M(0xb5543a, 'timber', 0.7);
  const sail = M(0xe9d6b8, 'fabric', 0.95), patch = M(0xc99a5c, 'fabric', 0.95), mast = M(0x7b5a3e, 'timber', 0.8), keel = M(0x4a3426, 'timber', 0.6);
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  const HW = 0.075, HL = 0.3, hy = 0.075;
  // hull: lower half of a cylinder laid along Z, squashed, with a cone bow and a transom
  add(new THREE.CylinderGeometry(HW, HW, HL, 12, 1, false, Math.PI / 2, Math.PI), hullC, 0, hy, -0.02, Math.PI / 2, 0, 0).scale.set(1, 1, 0.8);
  add(new THREE.ConeGeometry(HW, 0.13, 12, 1, false, Math.PI / 2, Math.PI), hullC, 0, hy, HL / 2 - 0.02 + 0.065, Math.PI / 2, 0, 0).scale.set(1, 1, 0.8);
  add(new THREE.CylinderGeometry(HW, HW, 0.02, 12, 1, false, Math.PI / 2, Math.PI), keel, 0, hy, -HL / 2 - 0.03, Math.PI / 2, 0, 0).scale.set(1, 1, 0.8);
  // keel fin so it sits on the ground
  add(new THREE.BoxGeometry(0.02, 0.03, 0.26), keel, 0, 0.015, 0.0);
  // red painted strake just below the deck
  add(new THREE.BoxGeometry(HW * 2 + 0.008, 0.018, HL - 0.02), red, 0, hy - 0.012, -0.02);
  add(new THREE.ConeGeometry(HW + 0.004, 0.11, 12, 1, true), red, 0, hy - 0.012, HL / 2 + 0.035, Math.PI / 2, 0, 0).scale.set(1, 1, 0.22);
  // deck slab and a little cockpit
  add(new THREE.BoxGeometry(HW * 2 - 0.01, 0.016, HL - 0.02), deck, 0, hy + 0.006, -0.02);
  add(new THREE.ConeGeometry(HW - 0.005, 0.11, 3, 1), deck, 0, hy + 0.006, HL / 2 + 0.03, Math.PI / 2, 0, 0).scale.set(1, 1, 0.12);
  add(new THREE.BoxGeometry(0.07, 0.02, 0.06), keel, 0, hy + 0.012, -0.1);
  // mast, boom
  add(new THREE.CylinderGeometry(0.009, 0.011, 0.36, 7), mast, 0, hy + 0.18, 0.04);
  add(new THREE.CylinderGeometry(0.007, 0.007, 0.18, 6), mast, 0, hy + 0.04, -0.045, Math.PI / 2, 0, 0);
  // mainsail: triangle prism (3 sided cylinder) flattened into a thin sheet
  const tri = (w, h) => { const t = new THREE.CylinderGeometry(w, w, 0.01, 3); t.rotateX(Math.PI / 2); return t; };
  const ms = add(tri(0.17, 0.01), sail, 0.006, hy + 0.17, -0.035, 0, Math.PI / 2, 0); ms.scale.set(1.0, 1.55, 1); ms.rotation.z = 0; ms.rotation.set(0, Math.PI / 2, Math.PI / 2 + 0.52);
  add(new THREE.BoxGeometry(0.008, 0.05, 0.05), patch, 0.012, hy + 0.13, -0.05);
  // jib forward of the mast
  const jb = add(tri(0.11, 0.01), sail, 0.004, hy + 0.13, 0.12, 0, Math.PI / 2, 0); jb.rotation.set(0, Math.PI / 2, -Math.PI / 2 - 0.5); jb.scale.set(1, 1.25, 1);
  // pennant at the masthead
  add(new THREE.ConeGeometry(0.018, 0.07, 3), red, 0, hy + 0.35, 0.0, -Math.PI / 2, 0, 0).scale.set(0.3, 1, 1);
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
