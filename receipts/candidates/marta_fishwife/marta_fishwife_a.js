// marta_fishwife, candidate A: primitives. Stout harbour fishwife, 1.68 m, front +Z. Red headscarf
// knotted at the back, blue striped blouse with rolled sleeves, long brown leather apron with
// patch pockets, wide navy skirt hung from the hips, wooden clogs, a coil of hemp rope over the
// left shoulder. Jointed like tam_fisherman: g.userData.joints, pivots at the joints.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const DS = { side: THREE.DoubleSide };
  const skin = M(0xe0a684, null, 0.8);
  const blouse = M(0x5d7fae, 'fabric', 0.9);
  const stripe = M(0xd9dde2, 'fabric', 0.9);
  const cuffC = M(0xb9c4cf, 'fabric', 0.9);
  const apron = M(0x7a4a2c, 'fabric', 0.75, DS);
  const apronDk = M(0x5e3820, 'fabric', 0.75);
  const skirt = M(0x2f3548, 'fabric', 0.92, DS);
  const skirtDk = M(0x252a3a, 'fabric', 0.92, DS);
  const stock = M(0x3a3230, 'fabric', 0.9);
  const clog = M(0x9a6e42, 'timber', 0.8);
  const scarf = M(0xb5432f, 'fabric', 0.9, DS);
  const scarfDk = M(0x8e3224, 'fabric', 0.9);
  const hair = M(0x5a4232, 'fabric', 0.85);
  const rope = M(0xa58a5c, 'fabric', 0.95);
  const dark = M(0x2b1d16, null, 0.6);
  const blush = M(0xd98a6c, null, 0.85);
  const lipC = M(0x9a5546, null, 0.8);

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const cyl = (rt, rb, h, s = 12, open = false, ts = 0, tl = Math.PI * 2) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open, ts, tl);

  // ---- hips, world y 0.80: the skirt and apron hang from here
  const hips = J(g, 0, 0.82, 0);
  add(hips, sph(0.2, 14, 8), skirt, 0, 0.0, 0, 0, 0, 0, 1, 0.6, 0.85);
  add(hips, cyl(0.205, 0.33, 0.6, 16, true), skirt, 0, -0.3, 0, 0, 0, 0, 1, 1, 0.88);
  add(hips, new THREE.TorusGeometry(0.33, 0.025, 5, 16), skirtDk, 0, -0.6, 0, Math.PI / 2, 0, 0, 1, 0.88, 1);
  // apron skirt: a front arc a little proud of the skirt, ending a hand above the hem
  add(hips, cyl(0.218, 0.32, 0.5, 12, true, -1.05, 2.1), apron, 0, -0.25, 0.012, 0, 0, 0, 1, 1, 0.9);
  add(hips, cyl(0.321, 0.323, 0.035, 12, false, -1.05, 2.1), apronDk, 0, -0.49, 0.012, 0, 0, 0, 1, 1, 0.9);
  // waist band
  add(hips, cyl(0.215, 0.215, 0.05, 16), apronDk, 0, 0.03, 0, 0, 0, 0, 1, 1, 0.86);
  // patch pockets, one with a hanging tag
  for (const s of [1, -1]) add(hips, new THREE.BoxGeometry(0.12, 0.12, 0.03), apronDk, 0.11 * s, -0.17, 0.235, -0.18, 0.4 * s, 0);
  add(hips, new THREE.BoxGeometry(0.04, 0.06, 0.02), M(0x8a8478, 'metal', 0.6), 0.2, -0.25, 0.22, -0.18, 0.5, 0);

  // ---- legs: dark stockings, wooden clogs
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.1 * s, -0.04, 0);
    add(ul, cap(0.085, 0.2), stock, 0, -0.17, 0);
    const ll = J(ul, 0, -0.36, 0);
    add(ll, cap(0.065, 0.24), stock, 0, -0.17, 0);
    // clog: rounded wooden shoe with a raised toe
    add(ll, cap(0.075, 0.16, 10), clog, 0, -0.37, 0.05, Math.PI / 2, 0, 0, 1.1, 1, 0.75);
    add(ll, sph(0.07, 10, 6), clog, 0, -0.355, 0.15, 0, 0, 0, 1.05, 0.75, 1.0);
    add(ll, new THREE.BoxGeometry(0.15, 0.04, 0.28), M(0x6e4c2e, 'timber', 0.8), 0, -0.4, 0.05);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.86: stout striped blouse, apron bib and straps
  const spine = J(hips, 0, 0.06, 0);
  add(spine, cyl(0.21, 0.215, 0.36, 18), blouse, 0, 0.17, 0, 0, 0, 0, 1, 1, 0.82);
  add(spine, sph(0.215, 18, 8), blouse, 0, 0.33, 0, 0, 0, 0, 1, 0.55, 0.82);
  // stripes: light bands around the blouse
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    add(spine, new THREE.BoxGeometry(0.03, 0.36, 0.02), stripe, Math.sin(a) * 0.214, 0.18, Math.cos(a) * 0.214 * 0.82, 0, a, 0);
  }
  // bust
  add(spine, sph(0.13, 12, 8), blouse, 0, 0.23, 0.07, 0, 0, 0, 1.35, 0.8, 0.9);
  // bib
  add(spine, new THREE.BoxGeometry(0.26, 0.3, 0.035), apron, 0, 0.18, 0.2, -0.05, 0, 0);
  add(spine, new THREE.BoxGeometry(0.1, 0.08, 0.025), apronDk, -0.04, 0.2, 0.22, -0.05, 0, 0);
  for (const s of [1, -1]) {
    add(spine, new THREE.BoxGeometry(0.04, 0.03, 0.42), apronDk, 0.1 * s, 0.4, 0.0, 0, 0, 0);
    add(spine, new THREE.BoxGeometry(0.035, 0.36, 0.03), apronDk, 0.1 * s, 0.22, -0.175, 0, 0, 0);
  }
  // collar: open neckline with a pale undershirt
  add(spine, cyl(0.1, 0.12, 0.06, 12), stripe, 0, 0.41, 0.0);
  // rope coil over the left shoulder: three loops hanging front and back
  const coil = new THREE.Group(); coil.position.set(0.19, 0.24, 0.0); coil.rotation.set(0, Math.PI / 2, 0.15); spine.add(coil);
  for (let i = 0; i < 4; i++) add(coil, new THREE.TorusGeometry(0.19 - i * 0.012, 0.022, 5, 16), rope, 0.0, -0.02 * i, (i - 1.5) * 0.03, 0, 0.08 * (i - 1.5), 0.15 * i, 1, 1.25, 1);
  add(coil, new THREE.TorusGeometry(0.05, 0.03, 5, 10), rope, 0, 0.17, 0.0, 0, 0.3, 0);

  // ---- head, neck at world y 1.28
  const head = J(spine, 0, 0.42, 0.01);
  add(head, cyl(0.06, 0.065, 0.08, 10), skin, 0, 0.03, 0);
  const H = new THREE.Group(); H.position.set(0, 0.18, 0.01); H.scale.setScalar(1.1); head.add(H);
  add(H, sph(0.13, 14, 10), skin, 0, 0, 0, 0, 0, 0, 1, 1.05, 0.98);
  add(H, sph(0.08, 10, 7), skin, 0, -0.06, 0.03, 0, 0, 0, 1.3, 0.8, 1.05); // full cheeks and jaw
  for (const s of [1, -1]) {
    add(H, sph(0.019, 8, 6), dark, 0.047 * s, 0.02, 0.115, 0, 0, 0, 1, 1.15, 0.6);
    add(H, cap(0.011, 0.04, 6), hair, 0.05 * s, 0.055, 0.115, 0, 0, Math.PI / 2 - 0.15 * s);
    add(H, sph(0.027, 8, 6), blush, 0.075 * s, -0.025, 0.1, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.03, 8, 6), skin, 0.128 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8);
  }
  add(H, sph(0.028, 10, 8), skin, 0, -0.01, 0.132, 0, 0, 0, 1, 0.95, 0.9);
  add(H, cap(0.01, 0.045, 6), lipC, 0, -0.06, 0.12, 0, 0, Math.PI / 2 + 0.08, 1, 1, 0.6);
  // hair showing under the scarf, swept to the sides
  add(H, new THREE.SphereGeometry(0.135, 14, 7, 0, Math.PI * 2, 0, 1.3), hair, 0, 0.0, -0.005, -0.25);
  for (const s of [1, -1]) add(H, sph(0.04, 8, 6), hair, 0.108 * s, 0.055, 0.075, 0, 0, 0.3 * s, 0.45, 0.8, 0.6);
  // headscarf: a red dome tied over the hair, folded hem band, knot and two tails at the back
  const SC = new THREE.Group(); SC.position.set(0, 0.03, -0.015); SC.rotation.x = -0.5; H.add(SC);
  add(SC, new THREE.SphereGeometry(0.152, 14, 7, 0, Math.PI * 2, 0, 1.55), scarf);
  add(SC, new THREE.TorusGeometry(0.15, 0.02, 5, 18), scarfDk, 0, 0.004, 0, Math.PI / 2, 0, 0);
  add(H, sph(0.045, 8, 6), scarf, 0.0, -0.02, -0.15);
  for (const s of [1, -1]) add(H, cap(0.032, 0.11, 6), scarf, 0.05 * s, -0.1, -0.15, 0.25, 0, 0.45 * s, 1.3, 1, 0.5);

  // ---- arms, shoulders at world y 1.23: blouse to above the elbow, rolled cuff, bare forearm
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.24 * s, 0.37, 0);
    ua.rotation.z = 0.14 * s;
    add(ua, sph(0.09, 10, 7), blouse, 0, -0.01, 0);
    add(ua, cap(0.078, 0.17), blouse, 0, -0.13, 0);
    for (const k of [-0.05, 0.05]) add(ua, new THREE.BoxGeometry(0.018, 0.2, 0.155), stripe, k, -0.13, 0);
    const la = J(ua, 0, -0.27, 0);
    add(la, cyl(0.085, 0.08, 0.08, 12), cuffC, 0, -0.01, 0);
    add(la, cap(0.058, 0.14), skin, 0, -0.12, 0);
    add(la, sph(0.055, 10, 8), skin, 0, -0.25, 0.008, 0, 0, 0, 0.85, 1.1, 1);
    add(la, cap(0.02, 0.035, 6), skin, -0.045 * s, -0.235, 0.03, 0.5, 0, 0.5 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }
  arms.leftLowerArm.rotation.x = -0.15; arms.rightLowerArm.rotation.x = -0.15;

  g.userData.joints = { hips, spine, head, ...arms, ...legs };

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
