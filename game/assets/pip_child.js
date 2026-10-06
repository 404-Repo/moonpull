// pip_child, candidate C: a second reading. Toy proportions (head and hair about a third of the
// height), the duffel hung as one faceted bell from the shoulders, a big hood collar, and the ginger
// mop as one hand-displaced icosahedron with spikes pulled out of it rather than separate tufts.
// Village child, 1.1 m, yellow duffel, blue shorts, red wellies. Front +Z. Jointed like tam_fisherman.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xedb995, null, 0.8);
  const coat = M(0xf0bf2a, 'fabric', 0.7, { flatShading: true });
  const coatDk = M(0xcf9a1c, 'fabric', 0.75, { side: THREE.DoubleSide, flatShading: true });
  const toggle = M(0x9a6a3c, 'timber', 0.8);
  const shorts = M(0x3f6aa8, 'fabric', 0.9);
  const welly = M(0xc23a2c, null, 0.55);
  const sole = M(0x5a2a22, null, 0.7);
  const hair = M(0xd0702e, 'fabric', 0.85);
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
  const sph = (r, w = 12, h = 8) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 10) => new THREE.CapsuleGeometry(r, len, 3, rs);
  const cyl = (rt, rb, h, s = 10, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);

  // ---- hips, world y 0.40 (short legs)
  const hips = J(g, 0, 0.4, 0);
  add(hips, sph(0.12, 12, 8), shorts, 0, -0.01, 0, 0, 0, 0, 1, 0.7, 0.85);

  // ---- legs: chunky wellies take most of the leg
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.065 * s, -0.03, 0);
    add(ul, cyl(0.072, 0.085, 0.13, 12), shorts, 0, -0.055, 0);
    add(ul, cap(0.046, 0.06, 8), skin, 0, -0.11, 0);
    const ll = J(ul, 0, -0.16, 0);
    add(ll, cyl(0.075, 0.068, 0.17, 12), welly, 0, -0.1, 0);
    add(ll, cyl(0.082, 0.078, 0.035, 12), welly, 0, -0.02, 0);
    add(ll, cap(0.068, 0.08, 10), welly, 0, -0.17, 0.04, Math.PI / 2, 0, 0, 1, 1, 0.8);
    add(ll, new THREE.BoxGeometry(0.14, 0.035, 0.22), sole, 0, -0.215, 0.035);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.44: the coat is one faceted bell from the shoulders to a short hem
  const spine = J(hips, 0, 0.04, 0);
  add(spine, cyl(0.13, 0.205, 0.34, 10), coat, 0, 0.1, 0, 0, Math.PI / 10, 0, 1, 1, 0.82);
  add(spine, cyl(0.208, 0.212, 0.035, 10), coatDk, 0, -0.07, 0, 0, Math.PI / 10, 0, 1, 1, 0.82);
  add(spine, sph(0.135, 10, 6), coat, 0, 0.27, 0, 0, 0, 0, 1.05, 0.45, 0.85);
  // placket and big toggles
  add(spine, new THREE.BoxGeometry(0.045, 0.32, 0.03), coatDk, 0.015, 0.09, 0.142, -0.17, 0, 0);
  for (let i = 0; i < 3; i++) {
    const y = 0.17 - i * 0.09, z = 0.78 * (0.13 + (0.27 - y) * 0.2206) + 0.03; // on the bell's front face
    add(spine, cap(0.014, 0.05, 6), toggle, 0, y, z, 0, 0, Math.PI / 2);
    add(spine, new THREE.TorusGeometry(0.016, 0.006, 4, 8), toggle, -0.045, y, z - 0.006);
  }
  // patch pockets low on the bell
  for (const s of [1, -1]) {
    add(spine, new THREE.BoxGeometry(0.09, 0.085, 0.03), coat, 0.12 * s, 0.0, 0.13, -0.17, 0.55 * s, 0);
    add(spine, new THREE.BoxGeometry(0.1, 0.03, 0.04), coatDk, 0.122 * s, 0.045, 0.127, -0.17, 0.55 * s, 0);
  }
  // hood collar: a fat ring around the neck with the hood folded down the back
  add(spine, new THREE.TorusGeometry(0.1, 0.04, 6, 12), coat, 0, 0.3, -0.01, Math.PI / 2 - 0.15, 0, 0, 1, 0.9, 1);
  add(spine, sph(0.12, 10, 7, 0), coatDk, 0, 0.26, -0.12, 0.2, 0, 0, 1.15, 0.85, 0.6);

  // ---- head, neck at world y 0.76
  const head = J(spine, 0, 0.32, 0);
  add(head, cyl(0.04, 0.045, 0.05, 8), skin, 0, 0.015, 0);
  const H = new THREE.Group(); H.position.set(0, 0.15, 0.01); H.scale.setScalar(1.08); head.add(H);
  add(H, sph(0.14, 18, 12), skin, 0, 0, 0, 0, 0, 0, 1.02, 1.0, 0.95);
  add(H, sph(0.07, 10, 7), skin, 0, -0.06, 0.04, 0, 0, 0, 1.4, 0.8, 1.05); // round cheeks
  for (const s of [1, -1]) {
    add(H, sph(0.032, 10, 8), white, 0.05 * s, 0.005, 0.115, 0, 0, 0, 0.9, 1.1, 0.6);
    add(H, sph(0.02, 8, 6), dark, 0.05 * s, 0.003, 0.131, 0, 0, 0, 1, 1.15, 0.6);
    add(H, cap(0.01, 0.035, 5), hairDk, 0.052 * s, 0.055, 0.12, 0, 0, Math.PI / 2 - 0.15 * s);
    add(H, sph(0.026, 8, 6), blush, 0.088 * s, -0.04, 0.1, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.032, 8, 6), skin, 0.138 * s, -0.005, 0.0, 0, 0, 0, 0.5, 1, 0.8);
  }
  add(H, sph(0.022, 8, 6), skin, 0, -0.022, 0.14, 0, 0, 0, 1, 0.9, 0.9);
  add(H, new THREE.TorusGeometry(0.026, 0.006, 4, 10, Math.PI), lipC, 0, -0.065, 0.13, Math.PI, 0, 0);
  // mop: icosahedron pushed out to spikes, kept off the face
  const mop = new THREE.IcosahedronGeometry(0.152, 3);
  {
    const p = mop.attributes.position, d = new THREE.Vector3(), seen = new Map();
    for (let i = 0; i < p.count; i++) {
      d.fromBufferAttribute(p, i);
      const key = `${d.x.toFixed(4)},${d.y.toFixed(4)},${d.z.toFixed(4)}`;
      let k = seen.get(key);
      if (k === undefined) {
        const n = d.clone().normalize();
        const h = Math.sin(n.x * 23.1 + n.y * 7.3) * Math.cos(n.z * 19.7 - n.y * 5.1);
        k = 1 + (h > 0.3 ? 0.3 * (h - 0.3) / 0.7 + 0.06 : 0.03 * h);
        // pull back over the face so the eyes stay clear
        if (n.z > 0.35 && n.y < 0.55) k = Math.min(k, 0.72);
        seen.set(key, k);
      }
      p.setXYZ(i, d.x * k, d.y * k * 0.92, d.z * k);
    }
    // smooth normals from the centre so the mop reads as soft locks, not facets
    const nr = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { d.fromBufferAttribute(p, i).normalize(); nr.set([d.x, d.y, d.z], i * 3); }
    mop.setAttribute('normal', new THREE.BufferAttribute(nr, 3));
  }
  add(H, mop, hair, 0, 0.04, -0.03, -0.2, 0, 0);
  // fringe locks over the brow
  for (const [x, rz] of [[0.04, -0.5], [-0.035, 0.45], [0.0, 0.0]]) add(H, new THREE.ConeGeometry(0.035, 0.09, 5), hair, x, 0.1, 0.1, -1.2, 0, rz);

  // ---- arms, shoulders at world y 0.70, held a little out from the bell
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.145 * s, 0.25, 0);
    ua.rotation.z = 0.32 * s;
    add(ua, sph(0.06, 10, 7), coat, 0, -0.005, 0);
    add(ua, cap(0.052, 0.09, 8), coat, 0, -0.08, 0);
    const la = J(ua, 0, -0.15, 0);
    la.rotation.z = -0.15 * s;
    add(la, cap(0.05, 0.05, 8), coat, 0, -0.04, 0);
    add(la, cyl(0.066, 0.066, 0.055, 10), coatDk, 0, -0.095, 0);
    add(la, sph(0.042, 10, 8), skin, 0, -0.15, 0.005, 0, 0, 0, 0.85, 1.1, 0.95);
    add(la, cap(0.014, 0.022, 5), skin, -0.03 * s, -0.135, 0.022, 0.5, 0, 0.5 * s);
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
