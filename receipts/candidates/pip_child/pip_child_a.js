// pip_child, candidate A: primitives. Spheres, capsules, cylinders and cones. Village child, 1.1 m,
// big head (about a quarter of the height) under a tousled ginger mop of cone tufts, short A-line
// yellow duffel coat with hood, toggles and patch pockets, blue shorts, red wellies. Front +Z.
// Jointed like tam_fisherman: g.userData.joints, pivots at the joints.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xedb995, null, 0.8);
  const coat = M(0xf0bf2a, 'fabric', 0.7);
  const coatDk = M(0xcf9a1c, 'fabric', 0.75, { side: THREE.DoubleSide });
  const toggle = M(0x9a6a3c, 'timber', 0.8);
  const shorts = M(0x3f6aa8, 'fabric', 0.9);
  const welly = M(0xc23a2c, null, 0.55);
  const sole = M(0x5a2a22, null, 0.7);
  const hair = M(0xd0702e, 'fabric', 0.85);
  const hairDk = M(0xb45a22, 'fabric', 0.85);
  const dark = M(0x2b1d16, null, 0.6);
  const white = M(0xf4efe6, null, 0.6);
  const blush = M(0xe8907a, null, 0.85);

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const cyl = (rt, rb, h, s = 14, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);

  // ---- hips, world y 0.46
  const hips = J(g, 0, 0.43, 0);
  add(hips, sph(0.125, 14, 8), shorts, 0, -0.02, 0, 0, 0, 0, 1, 0.75, 0.82);
  // coat skirt: short A-line flare hanging from the hips
  add(hips, cyl(0.15, 0.19, 0.12, 14), coat, 0, -0.01, 0, 0, 0, 0, 1, 1, 0.85);
  add(hips, new THREE.TorusGeometry(0.188, 0.016, 5, 16), coatDk, 0, -0.07, 0, Math.PI / 2, 0, 0, 1, 0.85, 1);
  for (const s of [1, -1]) {
    // patch pockets on the skirt
    add(hips, new THREE.BoxGeometry(0.085, 0.08, 0.03), coat, 0.11 * s, -0.025, 0.13, -0.18, 0.55 * s, 0);
    add(hips, new THREE.BoxGeometry(0.095, 0.03, 0.04), coatDk, 0.112 * s, 0.018, 0.135, -0.18, 0.55 * s, 0);
  }

  // ---- legs: short shorts, bare knees, big red wellies
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.068 * s, -0.04, 0);
    add(ul, cyl(0.068, 0.082, 0.13, 12), shorts, 0, -0.065, 0);
    add(ul, cap(0.045, 0.07, 8), skin, 0, -0.12, 0);
    const ll = J(ul, 0, -0.18, 0);
    add(ll, cap(0.042, 0.05, 8), skin, 0, -0.02, 0);
    add(ll, cyl(0.07, 0.064, 0.17, 14), welly, 0, -0.13, 0);
    add(ll, new THREE.TorusGeometry(0.068, 0.014, 5, 14), welly, 0, -0.045, 0, Math.PI / 2);
    add(ll, cap(0.064, 0.08, 10), welly, 0, -0.2, 0.035, Math.PI / 2, 0, 0, 1, 1, 0.82);
    add(ll, new THREE.BoxGeometry(0.13, 0.03, 0.2), sole, 0, -0.245, 0.035);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.50: a rounded duffel body
  const spine = J(hips, 0, 0.04, 0);
  add(spine, cyl(0.135, 0.155, 0.26, 16), coat, 0, 0.12, 0, 0, 0, 0, 1, 1, 0.82);
  add(spine, sph(0.137, 16, 8), coat, 0, 0.25, 0, 0, 0, 0, 1, 0.45, 0.82);
  // front placket and three toggles on cord loops
  add(spine, new THREE.BoxGeometry(0.04, 0.27, 0.025), coatDk, 0.012, 0.11, 0.122);
  for (let i = 0; i < 3; i++) {
    const y = 0.04 + i * 0.075;
    add(spine, cap(0.012, 0.045, 6), toggle, 0, y, 0.142, 0, 0, Math.PI / 2);
    add(spine, new THREE.TorusGeometry(0.014, 0.005, 4, 8), toggle, -0.04, y, 0.136);
  }
  // hood bunched on the back of the shoulders
  add(spine, sph(0.12, 12, 8), coatDk, 0, 0.29, -0.09, 0, 0, 0, 1.15, 0.7, 0.75);
  add(spine, new THREE.TorusGeometry(0.105, 0.03, 6, 16), coat, 0, 0.285, -0.02, Math.PI / 2 - 0.25, 0, 0, 1, 0.85, 1);

  // ---- head, neck at world y 0.80: big round head and a mop of ginger tufts
  const head = J(spine, 0, 0.3, 0);
  add(head, cyl(0.04, 0.045, 0.05, 10), skin, 0, 0.02, 0);
  const H = new THREE.Group(); H.position.set(0, 0.16, 0.01); H.scale.setScalar(1.15); head.add(H);
  add(H, sph(0.135, 14, 10), skin, 0, 0, 0, 0, 0, 0, 1, 1.02, 0.96);
  for (const s of [1, -1]) {
    add(H, sph(0.03, 10, 8), white, 0.048 * s, 0.0, 0.112, 0, 0, 0, 0.9, 1.1, 0.6);
    add(H, sph(0.019, 8, 6), dark, 0.048 * s, -0.002, 0.128, 0, 0, 0, 1, 1.15, 0.6);
    add(H, cap(0.009, 0.035, 5), hairDk, 0.05 * s, 0.05, 0.118, 0, 0, Math.PI / 2 - 0.15 * s);
    add(H, sph(0.025, 8, 6), blush, 0.085 * s, -0.04, 0.095, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.03, 8, 6), skin, 0.133 * s, -0.005, 0.0, 0, 0, 0, 0.5, 1, 0.8);
  }
  add(H, sph(0.02, 8, 6), skin, 0, -0.025, 0.135, 0, 0, 0, 1, 0.9, 0.9);
  add(H, new THREE.TorusGeometry(0.025, 0.006, 4, 10, Math.PI), M(0x9a4a3c, null, 0.8), 0, -0.06, 0.122, Math.PI, 0, 0);
  // hair: a cap over the back and top, then tufts sticking out in every direction
  add(H, new THREE.SphereGeometry(0.145, 14, 8, 0, Math.PI * 2, 0, 1.75), hair, 0, 0.012, -0.012, -0.35);
  add(H, sph(0.13, 12, 8), hair, 0, -0.01, -0.035, 0, 0, 0, 1.07, 1.0, 0.95);
  const tufts = [
    [0, 0.14, 0.05, -0.6, 0], [0.06, 0.14, 0.02, -0.4, -0.5], [-0.06, 0.14, 0.03, -0.5, 0.5], [0, 0.15, -0.05, 0.3, 0],
    [0.09, 0.11, 0.07, -0.9, -0.7], [-0.09, 0.11, 0.07, -0.9, 0.7], [0.13, 0.06, -0.02, 0, -1.3], [-0.13, 0.06, -0.02, 0, 1.3],
    [0.1, 0.09, -0.09, 0.8, -0.8], [-0.1, 0.09, -0.09, 0.8, 0.8], [0, 0.08, -0.14, 1.3, 0], [0.04, 0.0, -0.15, 1.6, -0.3],
    [-0.05, 0.0, -0.15, 1.6, 0.3], [0.14, -0.02, -0.06, 0.6, -1.5], [-0.14, -0.02, -0.06, 0.6, 1.5], [0.03, 0.12, 0.1, -1.2, -0.2],
  ];
  tufts.forEach(([x, y, z, rx, rz], i) => add(H, new THREE.ConeGeometry(0.05, 0.08, 5), i % 3 ? hair : hairDk, x, y, z, rx, 0, rz));
  // fringe sweeping over the brow
  add(H, sph(0.06, 10, 6), hair, 0.03, 0.095, 0.085, 0.4, 0, -0.3, 1.5, 0.55, 0.7);
  add(H, sph(0.05, 10, 6), hair, -0.055, 0.09, 0.08, 0.4, 0, 0.4, 1.3, 0.55, 0.7);

  // ---- arms, shoulders at world y 0.76
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.15 * s, 0.25, 0);
    ua.rotation.z = 0.18 * s;
    add(ua, sph(0.058, 10, 7), coat, 0, -0.005, 0);
    add(ua, cap(0.05, 0.1, 10), coat, 0, -0.085, 0);
    const la = J(ua, 0, -0.16, 0);
    add(la, cap(0.047, 0.06, 10), coat, 0, -0.04, 0);
    add(la, cyl(0.062, 0.062, 0.05, 12), coatDk, 0, -0.1, 0); // turned-back cuff
    add(la, sph(0.04, 10, 8), skin, 0, -0.15, 0.005, 0, 0, 0, 0.85, 1.1, 0.95);
    add(la, cap(0.014, 0.022, 5), skin, -0.03 * s, -0.135, 0.02, 0.5, 0, 0.5 * s);
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
