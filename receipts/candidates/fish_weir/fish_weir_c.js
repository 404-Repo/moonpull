// fish_weir_c: a different reading. Stakes are round split logs (LatheGeometry with a knobbly
// taper, top sheared off on a slant), wrapped in a dark weed-stained sleeve where the tide sits.
// Wattle withies are torus arcs, one per bay per course, each bowing alternately to the front and
// the back so the courses read as woven around the stakes. Uprights between stakes, kelp low.
// Runs along local X, bowing toward +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const wet = mk(0x4a3426, 'timber', 0.55);
  const wood = mk(0x7b5a3e, 'timber', 0.88);
  const drift = mk(0xb79773, 'timber', 0.9);
  const withy = mk(0x6a4c33, 'timber', 0.85);
  const withyWet = mk(0x4a3426, 'timber', 0.6);
  const kelp = mk(0x4f5a2c, 'foliage', 0.6, { side: THREE.DoubleSide });
  const barn = mk(0xd9cfb6, 'stone', 0.9);

  let seed = 47; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const BOW = 0.85, HALF = 5;
  const zc = (x) => BOW * (1 - (x / HALF) ** 2);
  const dz = (x) => -2 * BOW * x / (HALF * HALF);
  const nrm = (x) => { const a = -dz(x), l = Math.hypot(a, 1); return [a / l, 1 / l]; };

  const N = 14, xs = [], hs = [];
  for (let i = 0; i < N; i++) { xs.push(-4.7 + 9.4 * i / (N - 1) + (R() - 0.5) * 0.12); hs.push(0.9 + 0.5 * R()); }
  hs[4] = 1.4; hs[8] = 1.33; hs[0] = 0.95;

  const log = (h, r0) => {
    const pts = [new THREE.Vector2(0.001, 0)];
    const K = 3;
    for (let k = 0; k <= K; k++) { const t = k / K; pts.push(new THREE.Vector2(r0 * (1 - 0.15 * t) * (1 + 0.05 * Math.sin(t * 9 + r0 * 40)), t * h)); }
    pts.push(new THREE.Vector2(r0 * 0.55, h + 0.01)); pts.push(new THREE.Vector2(0.001, h + 0.015));
    const geo = new THREE.LatheGeometry(pts, 7);
    const p = geo.attributes.position, cut = 0.07 + R() * 0.06;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > h - 0.05) p.setY(i, y - cut * (p.getX(i) / r0 + 1) / 2 * Math.min(1, (y - (h - 0.05)) / 0.05)); }
    // flatten one side slightly: a split log
    for (let i = 0; i < p.count; i++) if (p.getZ(i) < -r0 * 0.55) p.setZ(i, -r0 * 0.55);
    geo.computeVertexNormals();
    return geo;
  };

  for (let i = 0; i < N; i++) {
    const s = new THREE.Group();
    const r0 = 0.07 + R() * 0.02;
    s.add(new THREE.Mesh(log(hs[i], r0), i % 3 === 0 ? drift : wood));
    const sh = 0.34 + R() * 0.16;
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(r0 + 0.012, r0 + 0.018, sh, 7, 1, true), wet);
    sleeve.position.y = sh / 2; s.add(sleeve);
    if (i % 4 === 1) for (let k = 0; k < 4; k++) {
      const b = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.04, 5), barn);
      const a = R() * 6.28; b.position.set(Math.cos(a) * (r0 + 0.012), 0.08 + R() * 0.25, Math.sin(a) * (r0 + 0.012)); b.rotation.set(Math.sin(a) * 1.4, 0, -Math.cos(a) * 1.4); s.add(b);
    }
    s.position.set(xs[i], 0, zc(xs[i]));
    s.rotation.set((R() - 0.5) * 0.14, -Math.atan(dz(xs[i])) + R() * 6.28 * 0, (R() - 0.5) * 0.12);
    g.add(s);
  }

  // torus-arc withies
  const runs = [[1, 4], [7, 11]];
  const COURSES = 11, SAG = 0.1, TR = 0.025;
  const arc = (x0, x1, y, sign, mat) => {
    const ax = x0, az = zc(x0), bx = x1, bz = zc(x1);
    const c = Math.hypot(bx - ax, bz - az), Rr = (c * c / 4 + SAG * SAG) / (2 * SAG), ang = 2 * Math.asin(c / (2 * Rr));
    const geo = new THREE.TorusGeometry(Rr, TR, 4, 5, ang);
    geo.rotateZ(Math.PI / 2 - ang / 2); geo.translate(0, -Rr * Math.cos(ang / 2), 0);
    geo.rotateX(sign > 0 ? Math.PI / 2 : -Math.PI / 2); // bulge to -z or +z in the bay frame
    const m = new THREE.Mesh(geo, mat);
    const grp = new THREE.Group(); grp.add(m);
    grp.position.set((ax + bx) / 2, y, (az + bz) / 2);
    grp.rotation.y = -Math.atan2(bz - az, bx - ax);
    g.add(grp);
  };
  for (const [a, b] of runs) {
    let top = 9; for (let k = a; k <= b; k++) top = Math.min(top, hs[k]);
    top = Math.min(top - 0.12, 0.82);
    const y0 = 0.07, step = (top - y0) / (COURSES - 1);
    for (let r = 0; r < COURSES; r++) for (let k = a; k < b; k++) {
      arc(xs[k], xs[k + 1], y0 + r * step + 0.012 * Math.sin(k * 3 + r), ((k + r) % 2 ? 1 : -1), r < 3 ? withyWet : withy);
    }
    for (let k = a; k < b; k++) {
      const x = (xs[k] + xs[k + 1]) / 2;
      const up = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, top + 0.06, 5), wood);
      up.position.set(x, (top + 0.06) / 2, zc(x)); up.rotation.z = (R() - 0.5) * 0.1; g.add(up);
    }
  }

  // kelp: bent strap fronds (two-segment planes), at feet and over the lower courses
  const frond = (x, y, z, len, yaw, lean) => {
    const geo = new THREE.PlaneGeometry(0.08, len, 1, 3); geo.translate(0, len / 2, 0);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = p.getY(i) / len; p.setZ(i, lean * t * t * len); p.setX(i, p.getX(i) * (1 - 0.6 * t)); }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, kelp); m.position.set(x, y, z); m.rotation.y = yaw; g.add(m);
  };
  for (let i = 0; i < N; i++) {
    if (i % 2 && i !== 5) continue;
    for (let q = 0; q < 4; q++) { const a = q * 1.57 + R(); frond(xs[i] + Math.cos(a) * 0.09, 0.0, zc(xs[i]) + Math.sin(a) * 0.09, 0.22 + R() * 0.18, -a + Math.PI / 2, 0.8 + R() * 0.5); }
  }
  for (const [a, b] of runs) for (let k = a; k < b; k++) {
    if ((k + 1) % 2) continue;
    const x = xs[k] + (xs[k + 1] - xs[k]) * (0.3 + R() * 0.4), n = nrm(x);
    for (let q = 0; q < 3; q++) {
      const geo = new THREE.PlaneGeometry(0.07, 0.28 + R() * 0.1, 1, 2); geo.translate(0, -0.15, 0);
      const m = new THREE.Mesh(geo, kelp); m.position.set(x + (R() - 0.5) * 0.15 + n[0] * 0.11, 0.42, zc(x) + n[1] * 0.11);
      m.rotation.set(0.2, -Math.atan(dz(x)), (R() - 0.5) * 0.4); g.add(m);
    }
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
