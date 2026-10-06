// lobster pot A: primitives. Half-torus hoops on short legs, cylinder rods along the length, a torus entrance ring with cylinder funnel spokes, cylinder base frame with board slats.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, side) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, side: side || THREE.FrontSide }); if (name) x.name = name; return x; };
  const willow = M(0xb79773, 'timber', 0.9), willow2 = M(0xa58a5c, 'timber', 0.9), frame = M(0x7b5a3e, 'timber'), rope = M(0xa58a5c, 'fabric', 0.95);
  const L = 0.6, R = 0.21, baseY = 0.035, wallH = 0.07, yc = baseY + wallH, rr = 0.02;
  const add = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); g.add(o); return o; };
  const up = new THREE.Vector3(0, 1, 0);
  const rod = (a, b, r = rr, mat = willow, seg = 5) => { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(up, d.normalize()); g.add(o); return o; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // the D outline at a given z: straight legs then the arch
  const D = (z, k = 12) => { const pts = [V(R, baseY, z), V(R, yc, z)]; for (let i = 1; i < k; i++) { const a = (i / k) * Math.PI; pts.push(V(R * Math.cos(a), yc + R * Math.sin(a), z)); } pts.push(V(-R, yc, z), V(-R, baseY, z)); return pts; };
  // trailing rope from the front-right base corner out across the ground
  const ropeCurve = new THREE.CatmullRomCurve3([V(R - 0.02, baseY + 0.03, L / 2 - 0.04), V(R + 0.05, 0.05, L / 2 - 0.02), V(R + 0.14, 0.02, L / 2 - 0.03), V(R + 0.2, 0.02, L / 2 - 0.14), V(R + 0.12, 0.02, L / 2 - 0.24), V(R + 0.22, 0.02, L / 2 - 0.36)]);
  const addRope = () => { add(new THREE.TubeGeometry(ropeCurve, 30, 0.02, 5, false), rope); add(new THREE.SphereGeometry(0.03, 6, 4), rope, R + 0.22, 0.022, L / 2 - 0.36); };
  // base frame and slats
  for (const sx of [1, -1]) rod(V(sx * R, baseY, -L / 2), V(sx * R, baseY, L / 2), 0.025, frame, 6);
  for (const sz of [1, -1]) rod(V(-R, baseY, sz * L / 2), V(R, baseY, sz * L / 2), 0.025, frame, 6);
  for (const z of [-0.18, 0, 0.18]) add(new THREE.BoxGeometry(2 * R, 0.04, 0.08), frame, 0, baseY - 0.005, z);
  // hoops
  const nh = 5;
  for (let i = 0; i < nh; i++) {
    const z = -L / 2 + (i / (nh - 1)) * L;
    add(new THREE.TorusGeometry(R, rr * (i === 0 || i === nh - 1 ? 1.3 : 1), 4, 14, Math.PI), i % 2 ? willow2 : willow, 0, yc, z);
    for (const sx of [1, -1]) rod(V(sx * R, baseY, z), V(sx * R, yc, z), rr * 1.1);
  }
  // longitudinal rods
  for (let k = 0; k <= 8; k++) { const a = (k / 8) * Math.PI; rod(V(R * Math.cos(a), yc + R * Math.sin(a), -L / 2), V(R * Math.cos(a), yc + R * Math.sin(a), L / 2), rr * 0.95, k % 2 ? willow2 : willow); }
  for (const sx of [1, -1]) rod(V(sx * R, (baseY + yc) / 2, -L / 2), V(sx * R, (baseY + yc) / 2, L / 2), rr * 0.95);
  // back end: vertical rods inside the D
  for (const x of [-0.14, -0.07, 0, 0.07, 0.14]) rod(V(x, baseY, -L / 2), V(x, yc + Math.sqrt(R * R - x * x), -L / 2), rr * 0.9);
  rod(V(-R, yc + 0.06, -L / 2), V(R, yc + 0.06, -L / 2), rr * 0.9);
  // front end: entrance ring set into the pot, spokes back to the D frame
  const ey = yc + 0.03, ez = L / 2 - 0.13, er = 0.085;
  add(new THREE.TorusGeometry(er, 0.025, 5, 16), willow2, 0, ey, ez);
  add(new THREE.TorusGeometry(er + 0.055, 0.018, 4, 16), willow, 0, ey, ez + 0.07);
  const fd = D(L / 2, 12);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; const p0 = V(er * Math.cos(a), ey + er * Math.sin(a), ez); let best = fd[0], bd = 1e9; for (const q of fd) { const d = Math.atan2(q.y - ey, q.x) - a; const dd = Math.abs(Math.atan2(Math.sin(d), Math.cos(d))); if (dd < bd) { bd = dd; best = q; } } rod(p0, best, 0.018); }
  addRope();
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
