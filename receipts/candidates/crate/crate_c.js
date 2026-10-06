// crate C: a different reading, a frame-and-slat crate. Four corner posts and a top rim carry spaced slats with open gaps, a diagonal brace front and back, and full rope rings through side blocks.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r }); if (name) x.name = name; return x; };
  const wood = M(0x7b5a3e, 'timber'), drift = M(0xb79773, 'timber', 0.9), dark = M(0x4a3426, 'timber', 0.8), rope = M(0xa58a5c, 'fabric', 0.95), iron = M(0x3a3d40, 'metal', 0.7);
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
  const W = 0.7, D = 0.56, H = 0.6, p = 0.06, t = 0.04;
  for (const sx of [1, -1]) for (const sz of [1, -1]) add(new THREE.BoxGeometry(p, H, p), dark, sx * (W / 2 - p / 2), H / 2, sz * (D / 2 - p / 2));
  // floor boards
  for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(W - 2 * p, t, (D - 2 * p) / 5 - 0.008), wood, 0, 0.05, -D / 2 + p + (i + 0.5) * (D - 2 * p) / 5);
  // bottom rails and top rim
  for (const y of [0.05, H - 0.035]) {
    for (const sz of [1, -1]) add(new THREE.BoxGeometry(W - 2 * p, 0.07, t), y < 0.1 ? dark : drift, 0, y, sz * (D / 2 - t / 2));
    for (const sx of [1, -1]) add(new THREE.BoxGeometry(t, 0.07, D - 2 * p), y < 0.1 ? dark : drift, sx * (W / 2 - t / 2), y, 0);
  }
  // spaced slats (3 per face) with open gaps
  const slatH = 0.1, ys = [0.17, 0.3, 0.43];
  ys.forEach((y, i) => {
    const m = i === 1 ? drift : wood;
    for (const sz of [1, -1]) add(new THREE.BoxGeometry(W - 2 * p, slatH, t), m, 0, y, sz * (D / 2 - t / 2));
    for (const sx of [1, -1]) add(new THREE.BoxGeometry(t, slatH, D - 2 * p), m, sx * (W / 2 - t / 2), y, 0);
  });
  // diagonal braces on front and back, outside the slats
  const dx = W - 2 * p, dy = H - 0.14, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  for (const sz of [1, -1]) add(new THREE.BoxGeometry(len, 0.06, 0.04), dark, 0, H / 2, sz * (D / 2 + 0.02), 0, 0, sz * ang);
  // nails at brace ends and post heads
  const nail = new THREE.CylinderGeometry(0.02, 0.02, 0.014, 6);
  for (const sz of [1, -1]) for (const sx of [1, -1]) for (const y of [0.05, H - 0.035]) add(nail, iron, sx * (W / 2 - p / 2), y, sz * (D / 2 + 0.006), Math.PI / 2);
  // rope rings through blocks on the sides
  for (const sx of [1, -1]) {
    add(new THREE.BoxGeometry(0.05, 0.08, 0.14), dark, sx * (W / 2 + 0.025), H - 0.12, 0);
    const ring = new THREE.TorusGeometry(0.07, 0.02, 5, 14); ring.rotateY(Math.PI / 2);
    add(ring, rope, sx * (W / 2 + 0.065), H - 0.19, 0, 0, 0, sx * 0.25);
  }
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
