// tam_fisherman, candidate C: a different part breakdown. Built from soft rounded slabs (a
// rounded-box helper that pushes a subdivided box out to a radius), so he reads as chunky carved
// blocks: a square barrel torso, jacket as separate front panels + back panel + sleeves, block
// boots with a toe cap. Stocky fisherman, 1.78 m, front +Z. Jointed like player_girl.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xe0a684, null, 0.8);
  const oil = M(0xe2b23a, 'fabric', 0.6);
  const oilDk = M(0xbf8f26, 'fabric', 0.65);
  const knit = M(0xe8dcc0, 'fabric', 0.95);
  const knitDk = M(0xd2c4a4, 'fabric', 0.95);
  const pants = M(0x7a5236, 'fabric', 0.9);
  const cuffC = M(0x96704e, 'fabric', 0.9);
  const welly = M(0x4b5a3a, null, 0.55);
  const sole = M(0x2c2a26, null, 0.7);
  const beard = M(0xc0612e, 'fabric', 0.85);
  const beanie = M(0x46679a, 'fabric', 0.95);
  const beanieDk = M(0x3a5683, 'fabric', 0.95);
  const dark = M(0x2b1d16, null, 0.6);
  const blush = M(0xd98a6c, null, 0.85);

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  // rounded box: subdivided box, every vertex pulled onto an inner box and pushed out by r
  const cache = new Map();
  const rb = (w, h, d, r, seg = 3) => {
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const key = [w, h, d, r, seg].join();
    if (cache.has(key)) return cache.get(key);
    const geo = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
    const p = geo.attributes.position, q = new THREE.Vector3(), c = new THREE.Vector3();
    const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
    for (let i = 0; i < p.count; i++) {
      q.fromBufferAttribute(p, i);
      c.set(Math.max(-hx, Math.min(hx, q.x)), Math.max(-hy, Math.min(hy, q.y)), Math.max(-hz, Math.min(hz, q.z)));
      q.sub(c); if (q.lengthSq() > 0) q.setLength(r); q.add(c);
      p.setXYZ(i, q.x, q.y, q.z);
    }
    geo.computeVertexNormals(); cache.set(key, geo); return geo;
  };

  // ---- hips, world y 0.88
  const hips = J(g, 0, 0.88, 0);
  add(hips, rb(0.4, 0.2, 0.28, 0.08), pants, 0, -0.03, 0);

  // ---- legs
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.1 * s, -0.04, 0);
    add(ul, rb(0.18, 0.42, 0.19, 0.07), pants, 0, -0.19, 0);
    const ll = J(ul, 0, -0.38, 0);
    add(ll, rb(0.16, 0.14, 0.17, 0.06), pants, 0, -0.04, 0);
    add(ll, rb(0.21, 0.1, 0.21, 0.04), cuffC, 0, -0.12, 0);
    add(ll, rb(0.21, 0.025, 0.21, 0.01, 1), M(0x86603f, 'fabric', 0.9), 0, -0.085, 0);
    add(ll, rb(0.18, 0.3, 0.18, 0.05), welly, 0, -0.3, 0);
    add(ll, rb(0.2, 0.04, 0.2, 0.015, 1), welly, 0, -0.165, 0);
    add(ll, rb(0.17, 0.12, 0.3, 0.055), welly, 0, -0.395, 0.05);
    add(ll, rb(0.19, 0.035, 0.32, 0.012, 1), sole, 0, -0.44, 0.05);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.94
  const spine = J(hips, 0, 0.06, 0);
  add(spine, rb(0.42, 0.56, 0.32, 0.12, 4), knit, 0, 0.13, 0.0);
  // cable rows: stacked chevron blocks
  for (const x of [-0.06, 0, 0.06]) for (let i = 0; i < 5; i++) {
    add(spine, rb(0.045, 0.045, 0.03, 0.012, 1), knitDk, x, -0.03 + i * 0.075, 0.16, 0, 0, Math.PI / 4);
  }
  add(spine, rb(0.4, 0.05, 0.3, 0.02, 1), knitDk, 0, -0.13, 0.01);
  add(spine, rb(0.22, 0.1, 0.2, 0.05), knit, 0, 0.44, 0);
  // jacket: back panel, two side-front panels, shoulder yoke, collar
  add(spine, rb(0.5, 0.62, 0.08, 0.035), oil, 0, 0.1, -0.13);
  for (const s of [1, -1]) {
    add(spine, rb(0.08, 0.62, 0.3, 0.035), oil, 0.235 * s, 0.1, 0.0);
    add(spine, rb(0.15, 0.62, 0.07, 0.03), oil, 0.17 * s, 0.1, 0.14, 0, -0.1 * s, 0);
    add(spine, rb(0.04, 0.6, 0.075, 0.015, 1), oilDk, 0.1 * s, 0.1, 0.148, 0, -0.1 * s, 0);
    add(spine, rb(0.1, 0.17, 0.04, 0.02), oil, 0.12 * s, 0.33, 0.175, -0.2, -0.3 * s, -0.3 * s);
    add(spine, rb(0.12, 0.11, 0.035, 0.015), oil, 0.18 * s, -0.04, 0.185, 0, -0.1 * s, 0);
    add(spine, rb(0.13, 0.04, 0.045, 0.012, 1), oilDk, 0.18 * s, 0.02, 0.19, 0, -0.1 * s, 0);
  }
  add(spine, rb(0.52, 0.1, 0.34, 0.05), oil, 0, 0.4, -0.01);
  add(spine, rb(0.3, 0.08, 0.1, 0.035), oil, 0, 0.47, -0.08, 0.3, 0, 0);
  add(spine, rb(0.52, 0.035, 0.36, 0.012, 1), oilDk, 0, -0.205, 0.0);
  add(spine, rb(0.4, 0.03, 0.02, 0.008, 1), oilDk, 0, 0.3, -0.172);
  for (let i = 0; i < 3; i++) add(spine, new THREE.CylinderGeometry(0.015, 0.015, 0.014, 8), dark, -0.1, 0.0 + i * 0.11, 0.185, Math.PI / 2, 0, 0);

  // ---- head, neck at world y 1.39
  const head = J(spine, 0, 0.45, 0);
  add(head, rb(0.14, 0.1, 0.13, 0.05), skin, 0, 0.03, 0);
  const H = new THREE.Group(); H.position.set(0, 0.2, 0.01); head.add(H);
  add(H, rb(0.26, 0.28, 0.25, 0.11, 4), skin, 0, 0, 0);
  for (const s of [1, -1]) {
    add(H, sph(0.02, 8, 6), dark, 0.05 * s, 0.03, 0.122, 0, 0, 0, 1, 1.2, 0.6);
    add(H, rb(0.06, 0.02, 0.025, 0.008, 1), beard, 0.05 * s, 0.065, 0.122, 0, 0, -0.15 * s);
    add(H, sph(0.03, 8, 6), blush, 0.08 * s, -0.01, 0.105, 0, 0, 0, 1, 0.7, 0.5);
    add(H, rb(0.03, 0.06, 0.045, 0.014), skin, 0.135 * s, 0.0, 0.0);
    add(H, rb(0.05, 0.12, 0.09, 0.022), beard, 0.115 * s, -0.04, 0.04);
  }
  add(H, rb(0.05, 0.06, 0.05, 0.022), skin, 0, 0.0, 0.135);
  add(H, rb(0.26, 0.15, 0.13, 0.06), beard, 0, -0.1, 0.08);
  add(H, rb(0.15, 0.08, 0.08, 0.035), beard, 0, -0.18, 0.1, 0.2, 0, 0);
  for (const s of [1, -1]) add(H, cap(0.024, 0.055, 6), beard, 0.038 * s, -0.04, 0.15, 0, 0, Math.PI / 2 + 0.35 * s);
  add(H, sph(0.022, 8, 6), M(0xb5644e, null, 0.8), 0, -0.07, 0.15, 0, 0, 0, 1.4, 0.5, 0.6);
  add(H, rb(0.29, 0.17, 0.28, 0.11, 4), beanie, 0, 0.12, -0.005);
  add(H, rb(0.3, 0.07, 0.29, 0.04), beanieDk, 0, 0.065, -0.005, -0.06, 0, 0);

  // ---- arms, shoulders at world y 1.32
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.27 * s, 0.38, 0);
    ua.rotation.z = 0.12 * s;
    add(ua, rb(0.18, 0.18, 0.18, 0.08), oil, 0, -0.02, 0);
    add(ua, rb(0.16, 0.32, 0.16, 0.065), oil, 0, -0.16, 0);
    const la = J(ua, 0, -0.3, 0);
    add(la, rb(0.15, 0.2, 0.15, 0.06), oil, 0, -0.08, 0);
    add(la, rb(0.18, 0.07, 0.18, 0.03), oilDk, 0, -0.19, 0);
    add(la, rb(0.1, 0.13, 0.12, 0.045), skin, 0, -0.275, 0.005);
    add(la, cap(0.025, 0.045, 6), skin, -0.05 * s, -0.25, 0.045, 0.4, 0, 0.5 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }

  g.userData.joints = { hips, spine, head, ...arms, ...legs };

  // contract recentring: move root children only so joint hierarchy stays intact
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
