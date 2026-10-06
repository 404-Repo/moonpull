// barrel B: lathe profiles. Each stave is a thin slice of a bulged lathe (phiStart/phiLength), hoops are lathed bands following the bulge, lid recessed in the chime.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, side) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, side: side || THREE.FrontSide }); if (name) x.name = name; return x; };
  const wood = M(0x7b5a3e, 'timber', 0.85, THREE.DoubleSide), wood2 = M(0x8a6645, 'timber', 0.85, THREE.DoubleSide), dark = M(0x4a3426, 'timber', 0.8), iron = M(0x3a3d40, 'metal', 0.7), hole = M(0x1e1612, null, 0.95);
  const H = 0.9, rE = 0.25, rM = 0.305, N = 16, T = 0.035;
  const rAt = (y) => rE + (rM - rE) * (1 - ((y - H / 2) / (H / 2)) ** 2);
  const prof = [];
  const S = 7;
  for (let i = 0; i <= S; i++) { const y = (i / S) * H; prof.push(new THREE.Vector2(rAt(y), y)); }
  for (let i = S; i >= 0; i -= S) { const y = (i / S) * H; prof.push(new THREE.Vector2(rAt(y) - T, y)); }
  prof.push(new THREE.Vector2(rAt(0), 0));
  const step = (Math.PI * 2) / N, gap = 0.035;
  for (let i = 0; i < N; i++) {
    const st = new THREE.Mesh(new THREE.LatheGeometry(prof, 2, i * step + gap / 2, step - gap), i % 4 === 1 ? wood2 : wood);
    g.add(st);
  }
  const core = new THREE.Mesh(new THREE.CylinderGeometry(rE - T - 0.003, rE - T - 0.003, H - 0.01, 16), dark); core.position.y = H / 2; g.add(core);
  // lid: lathed dish set below the chime
  const lidP = [new THREE.Vector2(0, H - 0.05), new THREE.Vector2(rE - T, H - 0.05), new THREE.Vector2(rE - T, H - 0.07)];
  g.add(new THREE.Mesh(new THREE.LatheGeometry(lidP, 20), wood));
  for (let k = -2; k <= 2; k++) { const w = 2 * Math.sqrt(Math.max(0, (rE - T - 0.01) ** 2 - (k * 0.085) ** 2)); const p = new THREE.Mesh(new THREE.BoxGeometry(w, 0.015, 0.075), k % 2 ? wood2 : wood); p.position.set(0, H - 0.042, k * 0.085); g.add(p); }
  // hoops as lathed bands: rectangle section offset to the bulge
  const hoop = (y0, h) => { const pts = [], k = 4; for (let i = 0; i <= k; i++) { const y = y0 + (i / k) * h; pts.push(new THREE.Vector2(rAt(y) + 0.014, y)); } for (let i = k; i >= 0; i -= k) { const y = y0 + (i / k) * h; pts.push(new THREE.Vector2(rAt(y) - 0.002, y)); } pts.push(pts[0].clone()); return new THREE.Mesh(new THREE.LatheGeometry(pts, 22), iron); };
  for (const y of [0.05, 0.17, H - 0.23, H - 0.11]) g.add(hoop(y, 0.06));
  for (const y of [0.08, 0.2, H - 0.2, H - 0.08]) for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + 0.6; const r = rAt(y) + 0.016; const s = new THREE.Mesh(new THREE.SphereGeometry(0.02, 5, 3), iron); s.position.set(Math.sin(a) * r, y, Math.cos(a) * r); g.add(s); }
  const bz = rM + 0.003;
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 10), hole); b.rotation.x = Math.PI / 2; b.position.set(0, H / 2, bz); g.add(b);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 4, 12), dark); ring.position.set(0, H / 2, bz); g.add(ring);
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
