// pip_child, candidate B: profiles. Every body part is a LatheGeometry swept from a drawn silhouette
// (A-line duffel coat flaring to a short hem, round head, bell-topped wellies); pockets, flaps and the
// hood are extruded shapes. Village child, 1.1 m, big head, ginger mop, yellow duffel, blue shorts,
// red wellies. Front +Z. Jointed like tam_fisherman.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const DS = { side: THREE.DoubleSide };
  const skin = M(0xedb995, null, 0.8);
  const coat = M(0xf0bf2a, 'fabric', 0.7, DS);
  const coatDk = M(0xcf9a1c, 'fabric', 0.75, DS);
  const toggle = M(0x9a6a3c, 'timber', 0.8);
  const shorts = M(0x3f6aa8, 'fabric', 0.9);
  const welly = M(0xc23a2c, null, 0.55);
  const sole = M(0x5a2a22, null, 0.7);
  const hair = M(0xd0702e, 'fabric', 0.85, DS);
  const hairDk = M(0xb45a22, 'fabric', 0.85);
  const dark = M(0x2b1d16, null, 0.6);
  const white = M(0xf4efe6, null, 0.6);
  const blush = M(0xe8907a, null, 0.85);
  const lipC = M(0x9a4a3c, null, 0.8);

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const L = (pts, seg = 14, ps = 0, pl = Math.PI * 2) => {
    const v = pts.map(([r, y]) => new THREE.Vector2(r, y));
    if (v[0].y > v[v.length - 1].y) v.reverse();
    return new THREE.LatheGeometry(v, seg, ps, pl);
  };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const ext = (pts, depth, bev = 0.006) => {
    const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 1, curveSegments: 4 });
    geo.translate(0, 0, -depth / 2); return geo;
  };

  // ---- hips, world y 0.44
  const hips = J(g, 0, 0.41, 0);
  add(hips, L([[0, 0.05], [0.12, 0.045], [0.13, 0], [0.12, -0.06], [0.07, -0.09], [0, -0.095]], 14), shorts, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);
  // coat skirt: A-line flare from the waist to a short hem with a rolled band
  add(hips, L([[0.14, 0.07], [0.15, 0.02], [0.168, -0.04], [0.19, -0.085], [0.195, -0.095]], 18), coat, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);
  add(hips, L([[0.188, -0.075], [0.202, -0.085], [0.2, -0.103], [0.186, -0.11]], 18), coatDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);
  for (const s of [1, -1]) {
    add(hips, ext([[-0.045, -0.045], [0.045, -0.045], [0.045, 0.04], [-0.045, 0.04]], 0.02), coat, 0.112 * s, -0.035, 0.14, -0.2, 0.6 * s, 0);
    add(hips, ext([[-0.05, 0], [0.05, 0], [0.045, 0.03], [-0.045, 0.03]], 0.024), coatDk, 0.114 * s, 0.0, 0.145, -0.2, 0.6 * s, 0);
  }

  // ---- legs
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.066 * s, -0.04, 0);
    add(ul, L([[0, 0.03], [0.06, 0.02], [0.072, -0.04], [0.074, -0.1], [0.06, -0.11], [0, -0.11]], 12), shorts);
    add(ul, L([[0, -0.08], [0.044, -0.09], [0.046, -0.14], [0.043, -0.18], [0, -0.19]], 10), skin);
    const ll = J(ul, 0, -0.17, 0);
    add(ll, L([[0, 0.02], [0.042, 0.01], [0.04, -0.06], [0, -0.07]], 10), skin);
    // welly: bell top, straight shaft, rounded toe, sole
    add(ll, L([[0.055, -0.03], [0.074, -0.04], [0.078, -0.06], [0.07, -0.12], [0.068, -0.2], [0.072, -0.235], [0.06, -0.245], [0, -0.245]], 14), welly);
    add(ll, sph(0.064, 12, 8), welly, 0, -0.205, 0.05, 0, 0, 0, 1.0, 0.7, 1.35);
    add(ll, ext([[-0.06, -0.08], [0.06, -0.08], [0.064, 0.08], [0.04, 0.13], [-0.04, 0.13], [-0.064, 0.08]], 0.016, 0.005), sole, 0, -0.245, 0.02, Math.PI / 2, 0, 0, 1, -1, 1);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.49: duffel body swept round, shoulders sloping into the hood
  const spine = J(hips, 0, 0.05, 0);
  add(spine, L([[0, -0.03], [0.142, -0.03], [0.148, 0.05], [0.15, 0.15], [0.14, 0.22], [0.11, 0.27], [0.07, 0.285], [0, 0.29]], 18), coat, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);
  // front placket strip and toggles
  add(spine, ext([[-0.02, -0.03], [0.02, -0.03], [0.02, 0.25], [-0.02, 0.25]], 0.016), coatDk, 0.015, 0, 0.123);
  for (let i = 0; i < 3; i++) {
    const y = 0.03 + i * 0.075;
    add(spine, L([[0, -0.025], [0.011, -0.02], [0.013, 0], [0.011, 0.02], [0, 0.025]], 6), toggle, 0, y, 0.138, 0, 0, Math.PI / 2);
    add(spine, new THREE.TorusGeometry(0.013, 0.005, 4, 8), toggle, -0.038, y, 0.13);
  }
  // hood: a swept bowl lying open on the back, rim facing up
  add(spine, L([[0, -0.07], [0.06, -0.065], [0.1, -0.035], [0.115, 0.01], [0.112, 0.035]], 14), coatDk, 0, 0.255, -0.1, -1.0, 0, 0, 1.1, 1, 0.8);
  add(spine, L([[0.105, 0.025], [0.122, 0.03], [0.124, 0.045], [0.11, 0.05]], 14), coat, 0, 0.255, -0.1, -1.0, 0, 0, 1.1, 1, 0.8);
  // collar band
  add(spine, L([[0.075, 0.26], [0.1, 0.27], [0.102, 0.305], [0.08, 0.31]], 14), coat);

  // ---- head, neck at world y 0.78
  const head = J(spine, 0, 0.29, 0);
  add(head, L([[0, 0.06], [0.04, 0.06], [0.044, 0], [0, -0.01]], 10), skin);
  const H = new THREE.Group(); H.position.set(0, 0.16, 0.01); H.scale.setScalar(1.15); head.add(H);
  // round child head, full cheeks, small chin
  add(H, L([[0, -0.125], [0.07, -0.118], [0.118, -0.07], [0.136, 0.0], [0.13, 0.07], [0.095, 0.12], [0, 0.14]], 18), skin);
  for (const s of [1, -1]) {
    add(H, sph(0.03, 10, 8), white, 0.048 * s, 0.0, 0.112, 0, 0, 0, 0.9, 1.1, 0.6);
    add(H, sph(0.019, 8, 6), dark, 0.048 * s, -0.002, 0.128, 0, 0, 0, 1, 1.15, 0.6);
    add(H, ext([[-0.025, 0], [0.025, 0], [0.02, 0.012], [-0.025, 0.008]], 0.012, 0.003), hairDk, 0.05 * s, 0.045, 0.12, 0, 0.1 * s, -0.12 * s, s, 1, 1);
    add(H, sph(0.025, 8, 6), blush, 0.083 * s, -0.04, 0.097, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.028, 8, 6), skin, 0.132 * s, -0.005, 0.0, 0, 0, 0, 0.5, 1, 0.8);
  }
  add(H, L([[0, 0.022], [0.016, 0.015], [0.02, -0.005], [0.012, -0.02], [0, -0.022]], 8), skin, 0, -0.025, 0.128, Math.PI / 2, 0, 0);
  add(H, new THREE.TorusGeometry(0.024, 0.006, 4, 10, Math.PI), lipC, 0, -0.058, 0.118, Math.PI, 0, 0);
  // hair: a swept helmet over the back and crown, then spiky locks swept as small cones
  add(H, L([[0.142, -0.04], [0.15, 0.02], [0.142, 0.08], [0.11, 0.135], [0.06, 0.162], [0, 0.17]], 16, Math.PI * 0.62, Math.PI * 1.76), hair, 0, 0, -0.005);
  add(H, L([[0.145, 0.04], [0.15, 0.09], [0.12, 0.14], [0.07, 0.165], [0, 0.172]], 16), hair, 0, 0, -0.005, 0, 0, 0, 1, 1, 1);
  const lock = L([[0, 0.075], [0.015, 0.055], [0.034, 0.025], [0.042, 0.0], [0, -0.005]], 5);
  const locks = [
    [0, 0.155, 0.04, -0.5, 0], [0.065, 0.15, 0.02, -0.3, -0.55], [-0.065, 0.15, 0.02, -0.35, 0.55], [0, 0.16, -0.05, 0.35, 0],
    [0.1, 0.11, 0.075, -0.9, -0.8], [-0.1, 0.11, 0.075, -0.9, 0.8], [0.14, 0.05, -0.02, 0, -1.35], [-0.14, 0.05, -0.02, 0, 1.35],
    [0.1, 0.1, -0.1, 0.8, -0.8], [-0.1, 0.1, -0.1, 0.8, 0.8], [0, 0.07, -0.145, 1.35, 0], [0.06, -0.01, -0.14, 1.7, -0.4],
    [-0.06, -0.01, -0.14, 1.7, 0.4], [0.145, -0.03, -0.06, 0.5, -1.6], [-0.145, -0.03, -0.06, 0.5, 1.6], [0.035, 0.13, 0.1, -1.25, -0.3],
    [-0.04, 0.125, 0.1, -1.3, 0.35],
  ];
  locks.forEach(([x, y, z, rx, rz], i) => add(H, lock, i % 3 ? hair : hairDk, x, y, z, rx, 0, rz, 1, 1, 0.8));

  // ---- arms, shoulders at world y 0.74
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.148 * s, 0.245, 0);
    ua.rotation.z = 0.2 * s;
    add(ua, L([[0, 0.055], [0.045, 0.045], [0.058, 0.0], [0.054, -0.08], [0.05, -0.16], [0, -0.165]], 12), coat);
    const la = J(ua, 0, -0.155, 0);
    add(la, L([[0, 0.02], [0.05, 0.01], [0.05, -0.07], [0.064, -0.08], [0.066, -0.125], [0.05, -0.13], [0, -0.13]], 12), coat);
    add(la, L([[0, 0], [0.032, -0.008], [0.04, -0.035], [0.036, -0.065], [0.022, -0.08], [0, -0.083]], 10), skin, 0, -0.12, 0.004, 0, 0, 0, 0.85, 1, 1);
    add(la, cap(0.013, 0.02, 5), skin, -0.03 * s, -0.145, 0.02, 0.5, 0, 0.5 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }

  g.userData.joints = { hips, spine, head, ...arms, ...legs };

  // fit to the 1.1 m brief: scale the whole jointed tree from the hips, pivots stay at the joints
  { const b = new THREE.Box3(), q = new THREE.Vector3(); g.updateMatrixWorld(true);
    g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return; for (let i = 0; i < p.count; i++) b.expandByPoint(q.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
    const k = 1.1 / (b.max.y - b.min.y); hips.scale.setScalar(k); hips.position.y *= k; }

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
