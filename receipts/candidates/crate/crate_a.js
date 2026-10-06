// crate A: primitives. Box planks, box battens, cylinder nail heads, half-torus rope handles.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r }); if (name) x.name = name; return x; };
  const wood = M(0x7b5a3e, 'timber'), dark = M(0x4a3426, 'timber', 0.8), rope = M(0xa58a5c, 'fabric', 0.95), iron = M(0x3a3d40, 'metal', 0.7);
  const W = 0.7, D = 0.56, t = 0.04, rowH = 0.17, gap = 0.015, base = 0.04;
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
  // floor
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(W - 0.02, t, (D - 0.03) / 4 - 0.006), wood, 0, t / 2, -D / 2 + 0.015 + (i + 0.5) * (D - 0.03) / 4);
  for (let r = 0; r < 3; r++) {
    const y = base + rowH / 2 + r * (rowH + gap);
    const s = 1 - 0.03 * ((r * 7) % 3); // slight unevenness
    add(new THREE.BoxGeometry(W, rowH, t), wood, 0, y, D / 2 - t / 2, 0, 0, 0.004 * (r - 1)).scale.set(s, 1, 1);
    add(new THREE.BoxGeometry(W, rowH, t), wood, 0, y, -D / 2 + t / 2, 0, 0, -0.004 * (r - 1));
    add(new THREE.BoxGeometry(t, rowH, D - 2 * t), wood, W / 2 - t / 2, y, 0);
    add(new THREE.BoxGeometry(t, rowH, D - 2 * t), wood, -W / 2 + t / 2, y, 0);
  }
  const top = base + 3 * rowH + 2 * gap;
  // corner battens on front/back faces, and on sides
  const nail = new THREE.CylinderGeometry(0.02, 0.02, 0.014, 6);
  for (const sz of [1, -1]) for (const sx of [1, -1]) {
    add(new THREE.BoxGeometry(0.07, top + 0.01, 0.04), dark, sx * (W / 2 - 0.035), (top + 0.01) / 2, sz * (D / 2 + 0.02));
    add(new THREE.BoxGeometry(0.04, top - 0.02, 0.06), dark, sx * (W / 2 + 0.02), (top - 0.02) / 2, sz * (D / 2 - 0.07));
    for (let r = 0; r < 3; r++) add(nail, iron, sx * (W / 2 - 0.035), base + rowH / 2 + r * (rowH + gap), sz * (D / 2 + 0.045), Math.PI / 2);
  }
  // rope handles on left/right sides
  for (const sx of [1, -1]) {
    const tg = new THREE.TorusGeometry(0.075, 0.02, 5, 10, Math.PI); tg.rotateZ(Math.PI); tg.rotateY(Math.PI / 2);
    add(tg, rope, sx * (W / 2 + 0.06), top - 0.07, 0);
    for (const z of [0.075, -0.075]) add(new THREE.SphereGeometry(0.03, 6, 4), rope, sx * (W / 2 + 0.03), top - 0.07, z);
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
