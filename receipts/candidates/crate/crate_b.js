// crate B: profile sweeps. Every plank and batten is a chamfered cross-section extruded along its length; rope handles are Tubes along sagging curves.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r }); if (name) x.name = name; return x; };
  const wood = M(0x7b5a3e, 'timber'), wood2 = M(0x86643f, 'timber'), dark = M(0x4a3426, 'timber', 0.8), rope = M(0xa58a5c, 'fabric', 0.95), iron = M(0x3a3d40, 'metal', 0.7);
  // chamfered bar: cross-section a x b (x,y), length L along z, centred
  const bar = (a, b, L, ch = 0.008) => {
    const s = new THREE.Shape(), hx = a / 2, hy = b / 2;
    s.moveTo(-hx + ch, -hy); s.lineTo(hx - ch, -hy); s.lineTo(hx, -hy + ch); s.lineTo(hx, hy - ch); s.lineTo(hx - ch, hy); s.lineTo(-hx + ch, hy); s.lineTo(-hx, hy - ch); s.lineTo(-hx, -hy + ch); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: L, bevelEnabled: false }); geo.translate(0, 0, -L / 2); return geo;
  };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
  const W = 0.7, D = 0.56, t = 0.04, rowH = 0.17, gap = 0.015, base = 0.045;
  for (let i = 0; i < 4; i++) add(bar((D - 0.03) / 4 - 0.006, t, W - 0.02), wood2, 0, t / 2 + 0.005, -D / 2 + 0.015 + (i + 0.5) * (D - 0.03) / 4, 0, Math.PI / 2);
  // two skids under the floor
  for (const sx of [1, -1]) add(bar(0.06, 0.045, D), dark, sx * (W / 2 - 0.09), 0.0225, 0);
  for (let r = 0; r < 3; r++) {
    const y = base + rowH / 2 + r * (rowH + gap);
    const m = r === 1 ? wood2 : wood;
    add(bar(t, rowH, W), m, 0, y, D / 2 - t / 2, 0, Math.PI / 2);
    add(bar(t, rowH, W), m, 0, y, -D / 2 + t / 2, 0, Math.PI / 2);
    add(bar(t, rowH, D - 2 * t), m, W / 2 - t / 2, y, 0);
    add(bar(t, rowH, D - 2 * t), m, -W / 2 + t / 2, y, 0);
  }
  const top = base + 3 * rowH + 2 * gap;
  const nail = new THREE.CylinderGeometry(0.02, 0.02, 0.014, 6);
  for (const sz of [1, -1]) for (const sx of [1, -1]) {
    add(bar(0.07, 0.04, top + 0.01), dark, sx * (W / 2 - 0.035), (top + 0.01) / 2, sz * (D / 2 + 0.02), Math.PI / 2);
    for (let r = 0; r < 3; r++) add(nail, iron, sx * (W / 2 - 0.035), base + rowH / 2 + r * (rowH + gap), sz * (D / 2 + 0.045), Math.PI / 2);
  }
  // rope handle: passes out of a hole, sags in a U, back in, on each side
  for (const sx of [1, -1]) {
    const x0 = sx * (W / 2), y0 = top - 0.06;
    const pts = [[0, 0, 0.1], [0.035, -0.04, 0.09], [0.06, -0.12, 0.04], [0.065, -0.14, 0], [0.06, -0.12, -0.04], [0.035, -0.04, -0.09], [0, 0, -0.1]].map(([a, b, c]) => new THREE.Vector3(x0 + sx * a, y0 + b, c));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.02, 6, false), rope, 0, 0, 0);
    for (const z of [0.1, -0.1]) add(new THREE.SphereGeometry(0.032, 6, 4), rope, x0 + sx * 0.012, y0, z);
  }
  // rope knots also visible inside (front reference shows knots on inner far wall)
  for (const sx of [1, -1]) for (const z of [0.1, -0.1]) add(new THREE.SphereGeometry(0.03, 6, 4), rope, sx * (W / 2 - t - 0.015), top - 0.06, z);
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
