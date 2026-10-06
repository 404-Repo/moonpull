// tam_fisherman, candidate A: primitives (spheres, capsules, cylinders, open partial cylinders).
// Stocky middle-aged fisherman, 1.78 m, front +Z. Yellow oilskin jacket worn open over a cream
// cable-knit roll-neck, blue beanie, ginger beard, brown trousers with rolled cuffs, green wellies.
// Jointed: g.userData.joints, each joint a Group AT the pivot with geometry offset inside.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xe0a684, null, 0.8);
  const oil = M(0xe2b23a, 'fabric', 0.6, { side: THREE.DoubleSide });
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
  const cyl = (rt, rb, h, s = 12, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
  const GAP = 0.5; // half-angle of the open jacket front, radians

  // ---- hips, world y 0.88
  const hips = J(g, 0, 0.88, 0);
  add(hips, sph(0.19, 14, 8), pants, 0, -0.02, 0, 0, 0, 0, 1, 0.65, 0.8);

  // ---- legs
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.105 * s, -0.04, 0);
    add(ul, cap(0.092, 0.2, 10), pants, 0, -0.17, 0);
    const ll = J(ul, 0, -0.38, 0);
    add(ll, cap(0.082, 0.08, 10), pants, 0, -0.04, 0);
    // rolled trouser cuff over the boot top
    add(ll, cyl(0.105, 0.1, 0.09, 14), cuffC, 0, -0.12, 0);
    add(ll, new THREE.TorusGeometry(0.1, 0.022, 6, 14), cuffC, 0, -0.08, 0, Math.PI / 2);
    // welly shaft, cuff ring, foot and sole
    add(ll, cyl(0.092, 0.088, 0.27, 14), welly, 0, -0.29, 0);
    add(ll, new THREE.TorusGeometry(0.09, 0.016, 5, 14), welly, 0, -0.165, 0, Math.PI / 2);
    add(ll, cap(0.078, 0.13, 10), welly, 0, -0.39, 0.06, Math.PI / 2, 0, 0, 1.1, 1, 0.9);
    add(ll, new THREE.BoxGeometry(0.17, 0.035, 0.3), sole, 0, -0.44, 0.055);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.94
  const spine = J(hips, 0, 0.06, 0);
  // sweater body (visible in the jacket opening), slight belly
  add(spine, cyl(0.215, 0.205, 0.5, 16), knit, 0, 0.14, 0, 0, 0, 0, 1, 1, 0.78);
  add(spine, sph(0.2, 14, 8), knit, 0, 0.06, 0.03, 0, 0, 0, 1, 0.9, 0.85);
  // cable-knit ribs: chains of bobbles up the chest
  for (const x of [-0.06, 0, 0.06]) for (let i = 0; i < 6; i++) add(spine, sph(0.024, 6, 3), knitDk, x, -0.04 + i * 0.065, 0.2 - Math.abs(x) * 0.25, 0, 0, 0, 1, 1.3, 0.6);
  // ribbed sweater hem below the jacket opening
  add(spine, cyl(0.21, 0.21, 0.05, 16), knitDk, 0, -0.1, 0, 0, 0, 0, 1, 1, 0.82);
  // roll neck
  add(spine, cyl(0.11, 0.12, 0.1, 14), knit, 0, 0.42, 0);
  add(spine, new THREE.TorusGeometry(0.11, 0.035, 6, 14), knit, 0, 0.42, 0, Math.PI / 2);
  // oilskin jacket: open cylinder with a gap at the front, hanging to below the hips
  add(spine, new THREE.CylinderGeometry(0.235, 0.255, 0.58, 18, 1, true, GAP, Math.PI * 2 - GAP * 2), oil, 0, 0.11, 0, 0, 0, 0, 1, 1, 0.82);
  // shoulder yoke: partial sphere cap, same gap
  add(spine, new THREE.SphereGeometry(0.235, 18, 6, Math.PI / 2 + GAP, Math.PI * 2 - GAP * 2, 0, Math.PI / 2), oil, 0, 0.4, 0, 0, 0, 0, 1, 0.32, 0.82);
  // hem ring and front plackets (thickness at the open edges)
  add(spine, new THREE.CylinderGeometry(0.262, 0.262, 0.04, 18, 1, true, GAP, Math.PI * 2 - GAP * 2), oilDk, 0, -0.165, 0, 0, 0, 0, 1, 1, 0.82);
  for (const s of [1, -1]) {
    const a = GAP * s;
    add(spine, new THREE.BoxGeometry(0.05, 0.56, 0.035), oilDk, Math.sin(a) * 0.235, 0.11, Math.cos(a) * 0.235 * 0.82, 0, a, 0);
    // lapel / collar folding back
    add(spine, new THREE.BoxGeometry(0.08, 0.18, 0.03), oil, 0.11 * s, 0.38, 0.16, -0.25, 0.5 * s, -0.35 * s);
    add(spine, new THREE.BoxGeometry(0.17, 0.07, 0.04), oil, 0.13 * s, 0.45, 0.02, 0.5, 0.25 * s, -0.5 * s);
    // patch pocket with flap on the lower front
    add(spine, new THREE.BoxGeometry(0.13, 0.12, 0.03), oil, 0.17 * s, -0.04, 0.155, 0, 0.55 * s, 0);
    add(spine, new THREE.BoxGeometry(0.14, 0.04, 0.045), oilDk, 0.17 * s, 0.025, 0.16, 0, 0.55 * s, 0);
  }
  for (let i = 0; i < 3; i++) add(spine, cyl(0.014, 0.014, 0.012, 8), dark, -0.13, 0.02 + i * 0.12, 0.175, Math.PI / 2, 0, 0, 1, 1, 1);
  // back seam / yoke stripe for the rear view
  add(spine, new THREE.BoxGeometry(0.3, 0.03, 0.02), oilDk, 0, 0.32, -0.2, 0.15, 0, 0);

  // ---- head, neck at world y 1.40
  const head = J(spine, 0, 0.45, 0);
  add(head, cyl(0.07, 0.08, 0.08, 10), skin, 0, 0.02, 0);
  const H = new THREE.Group(); H.position.set(0, 0.19, 0.01); H.scale.setScalar(1.1); head.add(H);
  add(H, sph(0.125, 16, 12), skin, 0, 0, 0, 0, 0, 0, 1, 1.08, 1);
  // face
  for (const s of [1, -1]) {
    add(H, sph(0.018, 8, 6), dark, 0.045 * s, 0.025, 0.112, 0, 0, 0, 1, 1.2, 0.6);
    add(H, new THREE.BoxGeometry(0.05, 0.016, 0.022), beard, 0.047 * s, 0.06, 0.112, 0, 0, -0.18 * s);
    add(H, sph(0.028, 8, 6), blush, 0.07 * s, -0.01, 0.095, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.03, 8, 6), skin, 0.125 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8); // ear
  }
  add(H, sph(0.03, 10, 8), skin, 0, 0.0, 0.13, 0, 0, 0, 1, 0.95, 0.9); // nose
  // ginger beard and moustache
  add(H, sph(0.115, 14, 8), beard, 0, -0.065, 0.045, 0, 0, 0, 1.0, 0.85, 0.85);
  add(H, sph(0.06, 10, 6), beard, 0, -0.12, 0.09, 0.3, 0, 0, 1.0, 0.9, 0.7);
  for (const s of [1, -1]) {
    add(H, cap(0.022, 0.05, 6), beard, 0.035 * s, -0.035, 0.125, 0, 0, Math.PI / 2 + 0.35 * s);
    add(H, cap(0.03, 0.07, 6), beard, 0.11 * s, -0.02, 0.04, 0, 0, 0.1 * s); // sideburn
  }
  add(H, sph(0.022, 8, 6), M(0xb5644e, null, 0.8), 0, -0.065, 0.128, 0, 0, 0, 1.4, 0.5, 0.6); // smile
  // beanie: dome, folded cuff with ribbing
  add(H, new THREE.SphereGeometry(0.135, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), beanie, 0, 0.04, -0.005, 0, 0, 0, 1, 1.0, 1);
  add(H, cyl(0.14, 0.138, 0.065, 18), beanieDk, 0, 0.055, -0.005, -0.08, 0, 0);
  add(H, new THREE.TorusGeometry(0.133, 0.02, 6, 18), beanieDk, 0, 0.086, -0.005, Math.PI / 2 - 0.08, 0, 0);

  // ---- arms, shoulders at world y 1.32
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.255 * s, 0.38, 0);
    ua.rotation.z = 0.12 * s;
    add(ua, sph(0.09, 12, 8), oil, 0, -0.02, 0);
    add(ua, cap(0.08, 0.16, 10), oil, 0, -0.14, 0);
    const la = J(ua, 0, -0.3, 0);
    add(la, cap(0.074, 0.12, 10), oil, 0, -0.08, 0);
    add(la, cyl(0.088, 0.084, 0.07, 12), oilDk, 0, -0.19, 0); // turned-back cuff
    // hand, fist half-closed
    add(la, sph(0.068, 10, 8), skin, 0, -0.275, 0.005, 0, 0, 0, 0.85, 1.15, 1);
    add(la, cap(0.025, 0.045, 6), skin, -0.05 * s, -0.25, 0.04, 0.4, 0, 0.5 * s);
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
