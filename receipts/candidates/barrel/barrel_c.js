// barrel C: hand-shaped body. One open cylinder whose vertices are pushed into a belly and grooved at every stave seam, then flat iron hoops as wide Tubes, raised chime, lid planks, bung with a wooden plug.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, side) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, side: side || THREE.FrontSide }); if (name) x.name = name; return x; };
  const wood = M(0x7b5a3e, 'timber', 0.85, THREE.DoubleSide), wood2 = M(0x8a6645, 'timber'), dark = M(0x4a3426, 'timber', 0.8), iron = M(0x3a3d40, 'metal', 0.7), hole = M(0x1e1612, null, 0.95);
  const H = 0.9, rE = 0.25, rM = 0.305, N = 14, PER = 4;
  const rAt = (y) => rE + (rM - rE) * Math.sin((y / H) * Math.PI);
  const body = new THREE.CylinderGeometry(1, 1, H, N * PER, 8, true);
  const p = body.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i) + H / 2, z = p.getZ(i);
    const a = Math.atan2(x, z), f = ((a / (Math.PI * 2)) * N + N) % 1;
    const groove = Math.abs(f) < 1e-3 || Math.abs(f - 1) < 1e-3 ? 0.012 : 0;
    const r = rAt(y) - groove;
    p.setXYZ(i, Math.sin(a) * r, y, Math.cos(a) * r);
  }
  body.computeVertexNormals();
  g.add(new THREE.Mesh(body, wood));
  // inner wall + lid, lid planks raised a touch
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(rE - 0.035, rE - 0.035, H - 0.01, 16), dark); inner.position.y = H / 2; g.add(inner);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(rE - 0.03, rE - 0.03, 0.03, 20), wood2); lid.position.y = H - 0.055; g.add(lid);
  for (let k = -1; k <= 1; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(2 * Math.sqrt((rE - 0.04) ** 2 - (k * 0.1) ** 2), 0.012, 0.008 + 0.04), dark); s.position.set(0, H - 0.038, k * 0.1 + 0.05); g.add(s); }
  // chime ring at top lip
  const chime = new THREE.TorusGeometry(rE - 0.012, 0.016, 4, 28); chime.rotateX(Math.PI / 2); const ch = new THREE.Mesh(chime, wood2); ch.position.y = H - 0.012; g.add(ch);
  // hoops: wide flat bands, made as a short open cylinder offset outward
  const band = (y, h) => { const r = rAt(y) + 0.01; const c = new THREE.Mesh(new THREE.CylinderGeometry(rAt(y + h / 2) + 0.01, rAt(y - h / 2) + 0.01, h, 28, 1, true), iron); c.material = iron; c.position.y = y; g.add(c);
    const e = new THREE.TorusGeometry(r + 0.002, 0.012, 3, 28); e.rotateX(Math.PI / 2); for (const d of [h / 2, -h / 2]) { const m = new THREE.Mesh(e, iron); m.position.y = y + d; g.add(m); } return r; };
  for (const y of [0.09, 0.21, H - 0.21, H - 0.09]) { const r = band(y, 0.06); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + 0.2; const s = new THREE.Mesh(new THREE.SphereGeometry(0.02, 5, 3), iron); s.position.set(Math.sin(a) * (r + 0.008), y, Math.cos(a) * (r + 0.008)); g.add(s); } }
  iron.side = THREE.DoubleSide;
  // bung and plug
  const bz = rM - 0.004;
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10), hole); b.rotation.x = Math.PI / 2; b.position.set(0, H / 2, bz); g.add(b);
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 0.05, 8), dark); plug.rotation.x = Math.PI / 2; plug.position.set(0, H / 2, bz + 0.012); g.add(plug);
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
