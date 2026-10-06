// marta_fishwife, candidate C: a second reading. Stouter and more storybook: a bigger head under a
// kerchief with a pointed tail, a faceted bell skirt in two tiers, a long rounded-slab apron that
// nearly reaches the hem, and the rope worn as a big coil slung from the left shoulder across the
// back to the right hip, so it reads from behind. 1.68 m, front +Z. Jointed like tam_fisherman.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xe0a684, null, 0.8);
  const blouse = M(0x5d7fae, 'fabric', 0.9, { flatShading: true });
  const stripe = M(0xd9dde2, 'fabric', 0.9);
  const cuffC = M(0xb9c4cf, 'fabric', 0.9);
  const apron = M(0x7a4a2c, 'fabric', 0.75);
  const apronDk = M(0x5e3820, 'fabric', 0.75);
  const skirt = M(0x2f3548, 'fabric', 0.92, { side: THREE.DoubleSide, flatShading: true });
  const skirtDk = M(0x252a3a, 'fabric', 0.92, { side: THREE.DoubleSide, flatShading: true });
  const stock = M(0x3a3230, 'fabric', 0.9);
  const clog = M(0x9a6e42, 'timber', 0.8);
  const clogDk = M(0x6e4c2e, 'timber', 0.8);
  const scarf = M(0xb5432f, 'fabric', 0.9, { side: THREE.DoubleSide });
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
  const cyl = (rt, rb, h, s = 12, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
  // rounded slab: an extruded rounded rectangle, bevel subtracted so it measures what was asked
  const slab = (w, h, d, r = 0.02, taper = 0) => {
    const b = 0.006, x0 = -w / 2 + b, x1 = w / 2 - b, y0 = -h / 2 + b, y1 = h / 2 - b, t = taper;
    const sh = new THREE.Shape();
    sh.moveTo(x0 + r - t, y0); sh.lineTo(x1 - r + t, y0); sh.quadraticCurveTo(x1 + t, y0, x1 + t, y0 + r);
    sh.lineTo(x1, y1 - r); sh.quadraticCurveTo(x1, y1, x1 - r, y1); sh.lineTo(x0 + r, y1);
    sh.quadraticCurveTo(x0, y1, x0, y1 - r); sh.lineTo(x0 - t, y0 + r); sh.quadraticCurveTo(x0 - t, y0, x0 + r - t, y0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 1, curveSegments: 3 });
    geo.translate(0, 0, -(d - 2 * b) / 2); return geo;
  };

  // ---- hips, world y 0.79: two-tier faceted skirt
  const hips = J(g, 0, 0.81, 0);
  add(hips, sph(0.21, 10, 5), skirt, 0, 0, 0, 0, 0, 0, 1, 0.6, 0.86);
  add(hips, cyl(0.215, 0.29, 0.34, 10, true), skirt, 0, -0.17, 0, 0, 0, 0, 1, 1, 0.88);
  add(hips, cyl(0.285, 0.35, 0.3, 10, true), skirtDk, 0, -0.44, 0, 0, Math.PI / 10, 0, 1, 1, 0.88);
  add(hips, cyl(0.293, 0.293, 0.04, 10, true), skirt, 0, -0.3, 0, 0, Math.PI / 10, 0, 1, 1, 0.88);
  // apron: three rounded slabs bent round the front, nearly to the hem
  add(hips, slab(0.25, 0.54, 0.03, 0.03, 0.03), apron, 0, -0.25, 0.25, -0.17, 0, 0);
  for (const s of [1, -1]) {
    add(hips, slab(0.13, 0.5, 0.028, 0.03), apron, 0.17 * s, -0.24, 0.19, -0.15, 0.75 * s, 0.03 * s);
    add(hips, slab(0.12, 0.12, 0.03, 0.02), apronDk, 0.1 * s, -0.2, 0.265, -0.17, 0.25 * s, 0);
  }
  add(hips, cyl(0.218, 0.218, 0.05, 12), apronDk, 0, 0.03, 0, 0, 0, 0, 1, 1, 0.88);
  // apron ties: a bow at the back
  for (const s of [1, -1]) add(hips, slab(0.09, 0.05, 0.025, 0.02), apronDk, 0.05 * s, 0.03, -0.2, 0, 0, 0.3 * s);
  for (const s of [1, -1]) add(hips, slab(0.04, 0.16, 0.02, 0.015), apronDk, 0.03 * s, -0.06, -0.205, 0.1, 0, 0.15 * s);

  // ---- legs: thick stockings, big clogs
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.1 * s, -0.04, 0);
    add(ul, cap(0.09, 0.19, 8), stock, 0, -0.17, 0);
    const ll = J(ul, 0, -0.36, 0);
    add(ll, cap(0.068, 0.24, 8), stock, 0, -0.17, 0);
    add(ll, slab(0.15, 0.3, 0.1, 0.06), clog, 0, -0.355, 0.06, Math.PI / 2, 0, 0);
    add(ll, sph(0.075, 10, 6), clog, 0, -0.33, 0.15, 0, 0, 0, 1, 0.6, 1.0);
    add(ll, slab(0.15, 0.3, 0.025, 0.06), clogDk, 0, -0.4, 0.06, Math.PI / 2, 0, 0);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.85: faceted stout bodice with bold stripes
  const spine = J(hips, 0, 0.06, 0);
  add(spine, cyl(0.24, 0.215, 0.38, 12), blouse, 0, 0.18, 0, 0, 0, 0, 1, 1, 0.8);
  add(spine, sph(0.24, 12, 6), blouse, 0, 0.36, 0, 0, 0, 0, 1, 0.45, 0.8);
  for (let i = 0; i < 12; i += 2) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    add(spine, new THREE.BoxGeometry(0.04, 0.37, 0.02), stripe, Math.sin(a) * 0.223, 0.18, Math.cos(a) * 0.223 * 0.8, 0, a, 0.035 * Math.sin(a));
  }
  add(spine, slab(0.27, 0.3, 0.035, 0.03), apron, 0, 0.17, 0.205, -0.04, 0, 0);
  add(spine, slab(0.11, 0.08, 0.025, 0.015), apronDk, 0.045, 0.2, 0.225, -0.04, 0, 0);
  for (const s of [1, -1]) {
    add(spine, new THREE.BoxGeometry(0.045, 0.035, 0.44), apronDk, 0.11 * s, 0.415, 0.0);
    add(spine, new THREE.BoxGeometry(0.04, 0.38, 0.03), apronDk, 0.11 * s, 0.22, -0.19, 0.06, 0, 0);
  }
  add(spine, cyl(0.1, 0.12, 0.06, 10), stripe, 0, 0.42, 0);
  // rope: a big coil slung from the left shoulder, hanging at the right hip behind
  const sling = [new THREE.Vector3(0.14, 0.44, 0.04), new THREE.Vector3(0.16, 0.44, -0.12), new THREE.Vector3(0.06, 0.3, -0.21), new THREE.Vector3(-0.12, 0.1, -0.22), new THREE.Vector3(-0.2, -0.04, -0.17)];
  add(spine, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sling), 16, 0.025, 4, false), rope);
  const sling2 = sling.map((p) => p.clone().add(new THREE.Vector3(0.0, -0.03, 0.035)));
  sling2[2].z += 0.0; sling2.forEach((p, i) => { if (i > 1) p.z -= 0.05; });
  add(spine, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sling2), 16, 0.022, 4, false), rope);
  const coil = new THREE.Group(); coil.position.set(-0.22, -0.03, -0.12); coil.rotation.set(0.1, 0.9, 0.2); spine.add(coil);
  for (let i = 0; i < 4; i++) add(coil, new THREE.TorusGeometry(0.16 - i * 0.01, 0.022, 4, 12), rope, 0, -0.015 * i, (i - 1.5) * 0.028, 0, 0.1 * (i - 1.5), 0.2 * i, 1, 1.3, 1);
  // front loop over the left shoulder
  const front = [new THREE.Vector3(0.16, 0.44, -0.02), new THREE.Vector3(0.2, 0.36, 0.17), new THREE.Vector3(0.22, 0.18, 0.2), new THREE.Vector3(0.24, 0.1, 0.13)];
  add(spine, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(front), 10, 0.024, 4, false), rope);

  // ---- head, neck at world y 1.27: a big storybook head
  const head = J(spine, 0, 0.42, 0.01);
  add(head, cyl(0.06, 0.065, 0.08, 10), skin, 0, 0.03, 0);
  const H = new THREE.Group(); H.position.set(0, 0.17, 0.01); H.scale.setScalar(1.12); head.add(H);
  add(H, sph(0.13, 12, 9), skin, 0, 0, 0, 0, 0, 0, 1, 1.04, 0.98);
  add(H, sph(0.08, 10, 7), skin, 0, -0.06, 0.03, 0, 0, 0, 1.35, 0.8, 1.05);
  for (const s of [1, -1]) {
    add(H, sph(0.02, 8, 6), dark, 0.046 * s, 0.018, 0.116, 0, 0, 0, 1, 1.15, 0.6);
    add(H, cap(0.011, 0.04, 6), hair, 0.05 * s, 0.054, 0.116, 0, 0, Math.PI / 2 - 0.2 * s);
    add(H, sph(0.028, 8, 6), blush, 0.076 * s, -0.025, 0.1, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.03, 8, 6), skin, 0.128 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8);
    add(H, sph(0.04, 8, 6), hair, 0.108 * s, 0.055, 0.075, 0, 0, 0.3 * s, 0.45, 0.8, 0.6);
  }
  add(H, sph(0.03, 10, 8), skin, 0, -0.012, 0.132, 0, 0, 0, 1, 0.95, 0.9);
  add(H, cap(0.01, 0.05, 6), lipC, 0, -0.064, 0.12, 0, 0, Math.PI / 2 + 0.08, 1, 1, 0.6);
  // kerchief: dome, a pointed tail down the back, the knot at the nape
  add(H, new THREE.SphereGeometry(0.15, 14, 7, 0, Math.PI * 2, 0, 1.6), scarf, 0, 0.03, -0.02, -0.5);
  add(H, new THREE.ConeGeometry(0.1, 0.16, 4, 1, true), scarf, 0, -0.05, -0.15, -0.35, Math.PI / 4, 0, 1, 1, 0.5);
  add(H, sph(0.05, 8, 6), scarfDk, 0.0, -0.07, -0.12);
  for (const s of [1, -1]) add(H, cap(0.03, 0.08, 6), scarfDk, 0.055 * s, -0.08, -0.12, 0.3, 0, 1.1 * s, 1.2, 1, 0.6);

  // ---- arms: wide striped sleeves rolled to the elbow, strong forearms
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.255 * s, 0.37, 0);
    ua.rotation.z = 0.18 * s;
    add(ua, sph(0.095, 10, 7), blouse, 0, -0.01, 0);
    add(ua, cyl(0.088, 0.095, 0.2, 10), blouse, 0, -0.12, 0);
    for (const k of [0, 2, 4]) { const a = (k / 6) * Math.PI * 2; add(ua, new THREE.BoxGeometry(0.03, 0.2, 0.012), stripe, Math.sin(a) * 0.093, -0.12, Math.cos(a) * 0.093, 0, a, 0); }
    const la = J(ua, 0, -0.27, 0);
    add(la, cyl(0.1, 0.098, 0.08, 12), cuffC, 0, -0.0, 0);
    add(la, cap(0.06, 0.13, 8), skin, 0, -0.12, 0);
    add(la, sph(0.058, 8, 6), skin, 0, -0.25, 0.008, 0, 0, 0, 0.85, 1.1, 1);
    add(la, cap(0.021, 0.035, 6), skin, -0.047 * s, -0.235, 0.03, 0.5, 0, 0.5 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }
  // rest pose: hands on the hips side, elbows out a little
  arms.leftLowerArm.rotation.x = -0.2; arms.rightLowerArm.rotation.x = -0.2;

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
