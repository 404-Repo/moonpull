// marta_fishwife, candidate B: profiles. Body parts are LatheGeometry swept from drawn silhouettes
// (bell skirt, stout bodice, puffed sleeves, rounded clogs, scarf dome), the apron and pockets are
// extruded shapes, the rope coil is a swept tube. Stout fishwife, 1.68 m, front +Z. Jointed like
// tam_fisherman: g.userData.joints, pivots at the joints.
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
  const stripe = M(0xd9dde2, 'fabric', 0.9, DS);
  const cuffC = M(0xb9c4cf, 'fabric', 0.9);
  const apron = M(0x7a4a2c, 'fabric', 0.75);
  const apronDk = M(0x5e3820, 'fabric', 0.75);
  const skirt = M(0x2f3548, 'fabric', 0.92, DS);
  const skirtDk = M(0x252a3a, 'fabric', 0.92);
  const stock = M(0x3a3230, 'fabric', 0.9);
  const clog = M(0x9a6e42, 'timber', 0.8);
  const clogDk = M(0x6e4c2e, 'timber', 0.8);
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
  const L = (pts, seg = 14, ps = 0, pl = Math.PI * 2) => {
    const v = pts.map(([r, y]) => new THREE.Vector2(r, y));
    if (v[0].y > v[v.length - 1].y) v.reverse();
    return new THREE.LatheGeometry(v, seg, ps, pl);
  };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const ext = (pts, depth, bev = 0.008) => {
    const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 1, curveSegments: 4 });
    geo.translate(0, 0, -depth / 2); return geo;
  };

  // ---- hips, world y 0.80: bell skirt swept from the waist
  const hips = J(g, 0, 0.80, 0);
  add(hips, L([[0, 0.07], [0.19, 0.06], [0.215, 0.0], [0.245, -0.12], [0.29, -0.32], [0.325, -0.5], [0.34, -0.58], [0.335, -0.61], [0.31, -0.615]], 18), skirt, 0, 0, 0, 0, 0, 0, 1, 1, 0.88);
  add(hips, L([[0.334, -0.57], [0.348, -0.59], [0.343, -0.62], [0.325, -0.625]], 18), skirtDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.88);
  // apron skirt: an extruded panel bent round the front of the skirt in three facets
  const ap = [[-0.13, 0], [0.13, 0], [0.15, -0.46], [-0.15, -0.46]];
  add(hips, ext(ap, 0.018, 0.006), apron, 0, 0.02, 0.0, 0, 0, 0, 1, 1, 1).position.set(0, 0.02, 0.225);
  for (const s of [1, -1]) {
    const side = add(hips, ext([[0, 0], [0.11, 0], [0.14, -0.42], [0, -0.44]], 0.018, 0.006), apron, 0.12 * s, 0.02, 0.2, 0, 0.65 * s, 0, s, 1, 1);
    side.rotation.x = -0.14;
    add(hips, ext([[-0.06, -0.06], [0.06, -0.06], [0.055, 0.06], [-0.06, 0.06]], 0.02, 0.008), apronDk, 0.075 * s, -0.2, 0.272, -0.14, 0.05 * s, 0);
  }
  hips.children[2].rotation.x = -0.14;
  add(hips, L([[0.21, 0.0], [0.218, 0.01], [0.218, 0.06], [0.21, 0.07]], 16), apronDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.88);

  // ---- legs: stocking sweep, rounded clog sweep laid forward
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.1 * s, -0.04, 0);
    add(ul, L([[0, 0.04], [0.07, 0.03], [0.09, -0.06], [0.08, -0.25], [0.068, -0.35], [0, -0.36]], 10), stock);
    const ll = J(ul, 0, -0.34, 0);
    add(ll, L([[0, 0.02], [0.066, 0.01], [0.07, -0.1], [0.055, -0.3], [0, -0.31]], 10), stock);
    // clog: a swept pod lying along z, opening at the top for the ankle
    const shoe = L([[0, -0.15], [0.05, -0.14], [0.075, -0.08], [0.082, 0.02], [0.075, 0.1], [0.05, 0.15], [0, 0.16]], 12);
    add(ll, shoe, clog, 0, -0.355, 0.06, Math.PI / 2, 0, 0, 1, 1, 0.68);
    add(ll, ext([[-0.07, -0.13], [0.07, -0.13], [0.07, 0.15], [-0.07, 0.15]], 0.02, 0.006), clogDk, 0, -0.405, 0.06, Math.PI / 2, 0, 0, 1, -1, 1);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.86: stout bodice sweep, stripes as thin swept bands, apron bib
  const spine = J(hips, 0, 0.06, 0);
  add(spine, L([[0, -0.03], [0.205, -0.02], [0.215, 0.08], [0.235, 0.22], [0.225, 0.33], [0.17, 0.4], [0.1, 0.42], [0, 0.425]], 18), blouse, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);
  for (let i = 0; i < 10; i++) {
    const a0 = (i / 10) * Math.PI * 2;
    add(spine, L([[0.209, -0.02], [0.219, 0.08], [0.239, 0.22], [0.229, 0.33]], 1, a0, 0.12), stripe, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);
  }
  // bib with pocket, straps over the shoulders to the back
  add(spine, ext([[-0.12, 0], [0.12, 0], [0.13, 0.31], [-0.13, 0.31]], 0.02, 0.006), apron, 0, 0.02, 0.2, -0.08, 0, 0);
  add(spine, ext([[-0.05, -0.04], [0.05, -0.04], [0.05, 0.04], [-0.05, 0.04]], 0.015, 0.006), apronDk, -0.04, 0.17, 0.216, -0.08, 0, 0);
  for (const s of [1, -1]) {
    const pts = [new THREE.Vector3(0.11 * s, 0.32, 0.2), new THREE.Vector3(0.11 * s, 0.43, 0.08), new THREE.Vector3(0.11 * s, 0.43, -0.08), new THREE.Vector3(0.1 * s, 0.3, -0.19), new THREE.Vector3(0.08 * s, 0.03, -0.18)];
    add(spine, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.016, 4, false), apronDk);
  }
  add(spine, L([[0.095, 0.39], [0.12, 0.4], [0.12, 0.44], [0.1, 0.45]], 12), stripe);
  // rope coil over the left shoulder: one swept helix of loops
  const coilPts = [];
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * Math.PI * 2 * 3.3, rr = 0.18 - i * 0.0003;
    coilPts.push(new THREE.Vector3(0.0 + (i / 120) * 0.08, Math.cos(t) * rr * 1.25, Math.sin(t) * rr));
  }
  const coil = new THREE.Group(); coil.position.set(0.15, 0.24, 0.0); coil.rotation.set(0, 0, 0.25); spine.add(coil);
  add(coil, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 140, 0.02, 5, false), rope);
  add(coil, new THREE.TorusGeometry(0.045, 0.028, 5, 10), rope, 0.05, 0.22, 0.0, 0, Math.PI / 2, 0);

  // ---- head, neck at world y 1.28
  const head = J(spine, 0, 0.42, 0.01);
  add(head, L([[0, 0.08], [0.06, 0.08], [0.065, 0], [0, -0.01]], 10), skin);
  const H = new THREE.Group(); H.position.set(0, 0.18, 0.01); H.scale.setScalar(1.1); head.add(H);
  add(H, L([[0, -0.14], [0.085, -0.13], [0.128, -0.06], [0.134, 0.03], [0.12, 0.1], [0.075, 0.14], [0, 0.15]], 16), skin, 0, 0, 0, 0, 0, 0, 1, 1, 0.98);
  for (const s of [1, -1]) {
    add(H, sph(0.019, 8, 6), dark, 0.047 * s, 0.02, 0.118, 0, 0, 0, 1, 1.15, 0.6);
    add(H, ext([[-0.025, 0], [0.025, 0], [0.022, 0.012], [-0.025, 0.008]], 0.015, 0.004), hair, 0.05 * s, 0.05, 0.118, 0, 0.15 * s, -0.1 * s, s, 1, 1);
    add(H, sph(0.027, 8, 6), blush, 0.078 * s, -0.025, 0.1, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.03, 8, 6), skin, 0.13 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8);
    add(H, sph(0.04, 8, 6), hair, 0.108 * s, 0.055, 0.075, 0, 0, 0.3 * s, 0.45, 0.8, 0.6);
  }
  add(H, L([[0, 0.025], [0.02, 0.018], [0.028, -0.008], [0.018, -0.026], [0, -0.028]], 10), skin, 0, -0.01, 0.128, Math.PI / 2, 0, 0, 1, 1, 0.9);
  add(H, cap(0.01, 0.045, 6), lipC, 0, -0.065, 0.118, 0, 0, Math.PI / 2 + 0.08, 1, 1, 0.6);
  // headscarf: swept dome tipped back, hem roll framing the face, knot and tails behind
  const SC = new THREE.Group(); SC.position.set(0, 0.03, -0.02); SC.rotation.x = -0.5; H.add(SC);
  add(SC, L([[0.152, -0.01], [0.156, 0.04], [0.145, 0.1], [0.115, 0.15], [0.06, 0.178], [0, 0.183]], 16), scarf);
  add(SC, new THREE.TorusGeometry(0.152, 0.02, 5, 18), scarfDk, 0, -0.005, 0, Math.PI / 2, 0, 0);
  add(H, sph(0.045, 8, 6), scarf, 0.0, -0.04, -0.16);
  for (const s of [1, -1]) add(H, L([[0.0, 0.0], [0.035, -0.02], [0.03, -0.11], [0.0, -0.13]], 8), scarf, 0.04 * s, -0.05, -0.16, 0.2, 0, 0.45 * s, 1, 1, 0.45);

  // ---- arms, shoulders at world y 1.23: puffed sleeve, rolled cuff, bare forearm
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.245 * s, 0.37, 0);
    ua.rotation.z = 0.14 * s;
    add(ua, L([[0, 0.08], [0.07, 0.07], [0.092, 0.0], [0.088, -0.15], [0.08, -0.24], [0, -0.25]], 12), blouse);
    for (let i = 0; i < 4; i++) add(ua, L([[0.092, 0.0], [0.09, -0.15], [0.082, -0.24]], 1, (i / 4) * Math.PI * 2, 0.3), stripe);
    const la = J(ua, 0, -0.27, 0);
    add(la, L([[0.075, 0.03], [0.09, 0.02], [0.092, -0.05], [0.075, -0.06]], 12), cuffC);
    add(la, L([[0, 0.0], [0.06, -0.01], [0.058, -0.12], [0.048, -0.19], [0, -0.2]], 10), skin);
    add(la, L([[0, 0], [0.048, -0.01], [0.058, -0.05], [0.052, -0.1], [0.035, -0.125], [0, -0.13]], 10), skin, 0, -0.18, 0.005, 0, 0, 0, 0.8, 1, 1);
    add(la, cap(0.02, 0.035, 6), skin, -0.045 * s, -0.22, 0.03, 0.4, 0, 0.5 * s);
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
