export default function (THREE) {
  const g = new THREE.Group();
  let seed = SEED;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const rr = (a, b) => a + (b - a) * rnd();
  const M = (color, name, rough, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true, ...extra }); if (name) m.name = name; return m; };
  const grey = M(0x6c6a64, 'stone', 0.82);
  const brown = M(0x6b5c4c, 'stone', 0.7);
  const kelp = M(0x4f5a2c, 'foliage', 0.8, { side: THREE.DoubleSide });
  const cream = M(0xd9cfb6, 'stone', 0.85, { side: THREE.DoubleSide });
  const lime = M(0xc9c6bb, 'stone', 0.9);
  // position-hash jitter: coincident vertices move together, so non-indexed geometry never cracks
  const hash = (x, y, z) => { const s = Math.sin(Math.round(x * 997) * 12.9898 + Math.round(y * 991) * 78.233 + Math.round(z * 983) * 37.719 + SEED) * 43758.5453; return s - Math.floor(s); };
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
