// barrel A: primitives. Each of 16 staves is two tilted boxes meeting at the belly; torus hoops, sphere rivets, cylinder lid with plank boxes, cylinder bung.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r }); if (name) x.name = name; return x; };
  const wood = M(0x7b5a3e, 'timber'), wood2 = M(0x8a6645, 'timber'), dark = M(0x4a3426, 'timber', 0.8), iron = M(0x3a3d40, 'metal', 0.7), hole = M(0x1e1612, null, 0.95);
  const H = 0.9, rE = 0.25, rM = 0.3, N = 16;
  const rAt = (y) => rE + (rM - rE) * (1 - Math.abs(y - H / 2) / (H / 2));
  const half = H / 2, tilt = Math.atan((rM - rE) / half), segL = Math.hypot(half, rM - rE);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, piv = new THREE.Group(); piv.rotation.y = a; g.add(piv);
    const w = (2 * Math.PI * rM) / N - 0.008, m = i % 3 === 0 ? wood2 : wood;
    const lo = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, segL, 0.04), m); lo.position.set(0, half / 2, (rE + rM) / 2 - 0.02); lo.rotation.x = tilt; piv.add(lo);
    const hi = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, segL, 0.04), m); hi.position.set(0, half * 1.5, (rE + rM) / 2 - 0.02); hi.rotation.x = -tilt; piv.add(hi);
  }
  // inner core so gaps read dark, not see-through
  const core = new THREE.Mesh(new THREE.CylinderGeometry(rE - 0.02, rE - 0.02, H - 0.02, 16), dark); core.position.y = H / 2; g.add(core);
  // lid recessed below the chime, with planks
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(rE - 0.025, rE - 0.025, 0.04, 20), wood); lid.position.y = H - 0.05; g.add(lid);
  for (let k = -2; k <= 2; k++) { const w = 2 * Math.sqrt(Math.max(0, (rE - 0.03) ** 2 - (k * 0.09) ** 2)); const p = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, 0.08), k % 2 ? wood2 : wood); p.position.set(0, H - 0.025, k * 0.09); g.add(p); }
  // hoops: pairs near top and bottom
  for (const y of [0.08, 0.2, H - 0.2, H - 0.08]) {
    const r = rAt(y) + 0.012;
    const t = new THREE.TorusGeometry(r, 0.022, 4, 32); t.rotateX(Math.PI / 2); t.scale(1, 1.6, 1);
    const h = new THREE.Mesh(t, iron); h.position.y = y; g.add(h);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3; const s = new THREE.Mesh(new THREE.SphereGeometry(0.02, 5, 3), iron); s.position.set(Math.sin(a) * (r + 0.02), y, Math.cos(a) * (r + 0.02)); g.add(s); }
  }
  // bung hole on the front belly
  const bz = rM + 0.005;
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10), hole); b.rotation.x = Math.PI / 2; b.position.set(0, H / 2, bz); g.add(b);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 4, 12), dark); ring.position.set(0, H / 2, bz); g.add(ring);
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
