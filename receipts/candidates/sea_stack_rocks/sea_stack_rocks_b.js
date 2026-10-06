// sea_stack_rocks B: profiles. Every rock is a LatheGeometry swept with only 6 to 7 sides, so it
// faces like cut stone, then jittered. The spire profile steps in at ledges, which reads as
// stacked strata; a slight shear leans the top. Brown footing lathe, grey upper lathe.
export default function (THREE) {
  const g = new THREE.Group();
  let seed = 29;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const rr = (a, b) => a + (b - a) * rnd();
  const M = (color, name, rough, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true, ...extra }); if (name) m.name = name; return m; };
  const grey = M(0x6c6a64, 'stone', 0.82);
  const brown = M(0x6b5c4c, 'stone', 0.7);
  const kelp = M(0x4f5a2c, 'foliage', 0.8, { side: THREE.DoubleSide });
  const cream = M(0xd9cfb6, 'stone', 0.85, { side: THREE.DoubleSide });
  const lime = M(0xc9c6bb, 'stone', 0.9);
  // position-hash jitter: coincident vertices move together, so non-indexed geometry never cracks
  const hash = (x, y, z) => { const s = Math.sin(Math.round(x * 997) * 12.9898 + Math.round(y * 991) * 78.233 + Math.round(z * 983) * 37.719 + 29) * 43758.5453; return s - Math.floor(s); };
  const jitter = (geo, amt, floorY) => {
    const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const h = hash(v.x, v.y, v.z), h2 = hash(v.z + 3.1, v.x - 1.7, v.y + 0.3), h3 = hash(v.y - 5.3, v.z + 2.9, v.x + 7.7);
      v.x += (h - 0.5) * amt; v.y += (h2 - 0.5) * amt * 0.7; v.z += (h3 - 0.5) * amt;
      if (floorY !== undefined && v.y < floorY) v.y = floorY;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals(); return geo;
  };
  const rocks = [];
  const mesh = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  // ---- surface dressing, stuck to the rock by raycasting toward its axis
  const rc = new THREE.Raycaster(); const nm = new THREE.Matrix3();
  const hit = (ox, oy, oz, tx, ty, tz) => {
    const o = new THREE.Vector3(ox, oy, oz), d = new THREE.Vector3(tx - ox, ty - oy, tz - oz).normalize();
    rc.set(o, d); const h = rc.intersectObjects(rocks, false)[0]; if (!h) return null;
    nm.getNormalMatrix(h.object.matrixWorld); const n = h.face.normal.clone().applyMatrix3(nm).normalize();
    return { p: h.point, n };
  };
  const up = new THREE.Vector3(0, 1, 0);
  const onSurface = (s, geo, mat, lift = 0, spin = 0) => {
    const m = new THREE.Mesh(geo, mat); m.castShadow = true;
    m.quaternion.setFromUnitVectors(up, s.n); m.rotateY(spin);
    m.position.copy(s.p).addScaledVector(s.n, lift); g.add(m); return m;
  };
  const shoot = (cx, cz, ang, y, R = 8) => hit(cx + Math.cos(ang) * R, y, cz + Math.sin(ang) * R, cx, y, cz);
  const barnGeo = new THREE.CylinderGeometry(0.022, 0.055, 0.06, 6, 1, true); // open: the base sits in the rock, the open top reads as the barnacle mouth
  const barnacles = (s, n) => { if (!s) return; for (let i = 0; i < n; i++) { const t = new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).cross(s.n).normalize().multiplyScalar(rr(0.03, 0.16)); onSurface({ p: s.p.clone().add(t), n: s.n }, barnGeo, cream, 0.012, 0).scale.setScalar(rr(0.8, 1.4)); } };
  const patch = (s, mat, w, d) => { if (!s) return; const m = onSurface(s, new THREE.SphereGeometry(0.5, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), mat, -0.045, rr(0, 6)); m.scale.set(w, 0.1, d); return m; };
  const frondGeo = (len, w) => {
    const geo = new THREE.PlaneGeometry(w, len, 1, 5); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) + len / 2, t = y / len; p.setXYZ(i, p.getX(i) * (1 - t * 0.6) + Math.sin(t * 5) * 0.06, y, t * t * len * 0.35); }
    geo.computeVertexNormals(); return geo;
  };
  const kelpClump = (x, z, n, len, base = 0) => { for (let i = 0; i < n; i++) { const m = mesh(frondGeo(len * rr(0.7, 1.1), rr(0.14, 0.2)), kelp, x + rr(-0.12, 0.12), base, z + rr(-0.12, 0.12), rr(-0.25, 0.25), (i / n) * Math.PI * 2 + rr(-0.3, 0.3), rr(-0.25, 0.25)); m.rotation.order = 'YXZ'; } };
  const lathe = (pts, sides, x, z, sx, sz, lean, mat, ry, amt) => {
    const geo = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), sides);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setXYZ(i, p.getX(i) * sx + y * lean, y, p.getZ(i) * sz); }
    geo.rotateY(ry); const g2 = geo.toNonIndexed(); jitter(g2, amt, 0.0);
    const m = mesh(g2, mat, x, 0, z); rocks.push(m); return m;
  };
  // spire: brown footing, grey stacked upper with ledges
  lathe([[0, 0], [1.5, 0], [1.58, 0.45], [1.42, 1.05], [1.2, 1.3], [0.0, 1.32]], 7, 0.3, -0.5, 1.0, 0.85, 0.0, brown, 0.3, 0.16);
  lathe([[0, 1.0], [1.25, 1.0], [1.28, 1.6], [1.12, 2.25], [0.95, 2.4], [0.92, 2.9], [0.75, 3.1], [0.66, 3.55], [0.42, 3.95], [0.2, 4.12], [0, 4.18]], 7, 0.3, -0.5, 1.0, 0.92, -0.06, grey, 1.0, 0.2);
  // shoulders
  lathe([[0, 0], [0.85, 0], [0.9, 0.6], [0.7, 1.35], [0.3, 1.6], [0, 1.62]], 6, 1.4, -0.2, 1.0, 0.85, 0.08, brown, 0.5, 0.16);
  lathe([[0, 0.9], [0.62, 0.9], [0.66, 1.5], [0.5, 2.05], [0.2, 2.2], [0, 2.2]], 6, -0.6, -0.45, 1.0, 1.0, -0.05, grey, 0.2, 0.14);
  lathe([[0, 0], [0.95, 0], [0.95, 0.5], [0.6, 0.95], [0, 1.0]], 6, 0.6, -1.6, 1.0, 0.75, 0.0, brown, 0.9, 0.16);
  // the two low rocks in front: domed, with a step on top
  lathe([[0, 0], [1.15, 0], [1.2, 0.35], [1.05, 0.8], [0.6, 0.95], [0.55, 1.15], [0.25, 1.25], [0, 1.25]], 7, -1.9, 0.5, 1.0, 0.85, 0.0, brown, 0.6, 0.16);
  lathe([[0, 0], [0.9, 0], [0.92, 0.3], [0.75, 0.62], [0.4, 0.8], [0, 0.82]], 6, -0.2, 1.5, 1.0, 0.8, 0.0, brown, 2.0, 0.14);
  lathe([[0, 0.6], [0.45, 0.6], [0.42, 0.85], [0.2, 0.92], [0, 0.92]], 6, -0.2, 1.45, 1.0, 0.8, 0.0, grey, 1.0, 0.08);
  // ---- dressing: barnacles low and mid, moss on ledges, bird-lime on top, kelp in the joints
  g.updateMatrixWorld(true);
  const down = (x, z) => hit(x, 12, z, x, 0, z);
  for (let i = 0; i < 9; i++) barnacles(shoot(0.3, -0.5, rr(0, Math.PI * 2), rr(0.5, 2.6)), 5 + Math.floor(rr(0, 5)));
  for (let i = 0; i < 4; i++) barnacles(shoot(-1.9, 0.5, rr(-1.2, 2.6), rr(0.25, 0.8)), 5);
  for (let i = 0; i < 3; i++) barnacles(shoot(-0.2, 1.5, rr(-0.3, 3.4), rr(0.2, 0.5)), 4);
  for (let i = 0; i < 3; i++) barnacles(shoot(0.6, -1.6, rr(3.6, 5.8), rr(0.2, 0.6)), 4);
  for (const [x, z, w] of [[-1.9, 0.45, 0.9], [-0.25, 1.45, 0.7], [-0.6, -0.35, 0.6], [1.35, -0.15, 0.7], [0.6, -1.6, 0.8], [0.2, -0.4, 0.6]]) patch(down(x + rr(-0.2, 0.2), z + rr(-0.2, 0.2)), kelp, w, w * 0.7);
  for (let i = 0; i < 6; i++) patch(shoot(0.3, -0.5, rr(0, Math.PI * 2), rr(1.4, 2.6)), kelp, rr(0.3, 0.5), rr(0.35, 0.6));
  
  for (let i = 0; i < 9; i++) patch(shoot(0.05, -0.5, rr(0, Math.PI * 2), rr(2.6, 3.4)), lime, rr(0.22, 0.34), rr(0.45, 0.8));
  for (const [x, z, n, len] of [[-0.95, 0.9, 8, 1.05], [1.0, 0.6, 6, 0.85], [1.6, -1.35, 6, 0.8], [-1.25, -1.15, 6, 0.75], [-2.7, 1.15, 5, 0.6], [0.8, 1.8, 5, 0.55]]) kelpClump(x, z, n, len);
  { const s = down(-0.65, -0.3); if (s) kelpClump(-0.65, -0.3, 4, 0.5, s.p.y - 0.05); }
  { const s = down(1.35, -0.1); if (s) kelpClump(1.35, -0.1, 3, 0.45, s.p.y - 0.05); }
  // contract recentring (vertex-measured)
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
