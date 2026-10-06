// lobster pot B: profiles. Each hoop is a Tube swept along the D outline, the back is an extruded D panel with lattice holes, the entrance funnel is a lathe split into willow strips, base boards are extruded.
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
  const dbl = M(0xb79773, 'timber', 0.9, THREE.DoubleSide);
  // base boards (extruded chamfered)
  const bs = new THREE.Shape(); const bw = 2 * R + 0.04, bh = 0.04, ch = 0.008;
  bs.moveTo(-bw / 2 + ch, 0); bs.lineTo(bw / 2 - ch, 0); bs.lineTo(bw / 2, ch); bs.lineTo(bw / 2, bh - ch); bs.lineTo(bw / 2 - ch, bh); bs.lineTo(-bw / 2 + ch, bh); bs.lineTo(-bw / 2, bh - ch); bs.lineTo(-bw / 2, ch);
  for (const z of [-0.24, -0.08, 0.08, 0.24]) { const geo = new THREE.ExtrudeGeometry(bs, { depth: 0.1, bevelEnabled: false }); geo.translate(0, 0, -0.05); add(geo, frame, 0, baseY - 0.02 - 0.015 + 0.0, z); }
  // hoops swept along the D outline
  const nh = 6;
  for (let i = 0; i < nh; i++) { const z = -L / 2 + 0.02 + (i / (nh - 1)) * (L - 0.04); add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(D(z, 10)), 24, rr * (i === 0 || i === nh - 1 ? 1.3 : 1), 4, false), i % 2 ? willow2 : willow); }
  // longitudinal rods
  for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI; rod(V(R * Math.cos(a), yc + R * Math.sin(a), -L / 2 + 0.02), V(R * Math.cos(a), yc + R * Math.sin(a), L / 2 - 0.02), rr * 0.95, k % 2 ? willow2 : willow); }
  for (const sx of [1, -1]) rod(V(sx * R, baseY + 0.03, -L / 2 + 0.02), V(sx * R, baseY + 0.03, L / 2 - 0.02), rr * 0.95);
  // back panel: D shape, lattice holes, extruded thin
  const ds = new THREE.Shape(); ds.moveTo(R, 0); ds.lineTo(R, wallH); ds.absarc(0, wallH, R, 0, Math.PI, false); ds.lineTo(-R, 0); ds.closePath();
  const cell = 0.07, wall = 0.04;
  for (let x = -R + wall; x + cell <= R - wall + 1e-6; x += cell + wall) for (let y = wall; y + cell <= wallH + R; y += cell + wall) {
    const inside = (px, py) => py <= wallH || px * px + (py - wallH) ** 2 <= (R - wall) ** 2;
    if (inside(x, y) && inside(x + cell, y) && inside(x, y + cell) && inside(x + cell, y + cell)) { const h = new THREE.Path(); h.moveTo(x, y); h.lineTo(x, y + cell); h.lineTo(x + cell, y + cell); h.lineTo(x + cell, y); h.closePath(); ds.holes.push(h); }
  }
  const bp = new THREE.ExtrudeGeometry(ds, { depth: 0.04, bevelEnabled: false, curveSegments: 8 }); add(bp, willow2, 0, baseY, -L / 2 + 0.0);
  // entrance funnel: lathe strips around the Z axis, narrow inside, wide at the face
  const ey = yc + 0.03, er = 0.085;
  const prof = [new THREE.Vector2(er, 0), new THREE.Vector2(er + 0.03, 0.06), new THREE.Vector2(R - 0.03, 0.15)];
  const strips = 12;
  for (let k = 0; k < strips; k++) { const lg = new THREE.LatheGeometry(prof, 1, (k / strips) * Math.PI * 2, (Math.PI * 2) / strips * 0.55); lg.rotateX(Math.PI / 2); const o = add(lg, dbl, 0, ey, L / 2 - 0.02 - 0.15); o.rotation.z = 0; }
  const ringT = new THREE.TorusGeometry(er, 0.025, 5, 16); add(ringT, willow2, 0, ey, L / 2 - 0.17);
  const ringO = new THREE.TorusGeometry(R - 0.03, 0.02, 4, 18); add(ringO, willow, 0, ey, L / 2 - 0.02);
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
