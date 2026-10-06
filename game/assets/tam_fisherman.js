// tam_fisherman, candidate B: profiles. Every body part is a LatheGeometry swept from a drawn
// silhouette (barrel chest, belly, flared jacket hem, bell-topped wellies), lapels and pockets are
// extruded shapes. Stocky fisherman, 1.78 m, front +Z. Jointed like player_girl.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const DS = { side: THREE.DoubleSide };
  const skin = M(0xe0a684, null, 0.8);
  const oil = M(0xe2b23a, 'fabric', 0.6, DS);
  const oilDk = M(0xbf8f26, 'fabric', 0.65, DS);
  const knit = M(0xe8dcc0, 'fabric', 0.95);
  const knitDk = M(0xd2c4a4, 'fabric', 0.95);
  const pants = M(0x7a5236, 'fabric', 0.9);
  const cuffC = M(0x96704e, 'fabric', 0.9, DS);
  const welly = M(0x4b5a3a, null, 0.55);
  const sole = M(0x2c2a26, null, 0.7);
  const beard = M(0xc0612e, 'fabric', 0.85, DS);
  const beanie = M(0x46679a, 'fabric', 0.95);
  const beanieDk = M(0x3a5683, 'fabric', 0.95, DS);
  const dark = M(0x2b1d16, null, 0.6);
  const blush = M(0xd98a6c, null, 0.85);

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  // profiles are normalised to run bottom-to-top so the swept normals face outward
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
  const GAP = 0.5;
  const OPEN = [GAP, Math.PI * 2 - GAP * 2];

  // ---- hips, world y 0.88
  const hips = J(g, 0, 0.88, 0);
  add(hips, L([[0, 0.07], [0.18, 0.06], [0.195, 0], [0.17, -0.09], [0.09, -0.13], [0, -0.135]], 14), pants, 0, 0, 0, 0, 0, 0, 1, 1, 0.8);

  // ---- legs
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.105 * s, -0.04, 0);
    add(ul, L([[0, 0.05], [0.075, 0.035], [0.098, -0.06], [0.094, -0.22], [0.084, -0.36], [0.06, -0.41], [0, -0.42]], 12), pants);
    const ll = J(ul, 0, -0.38, 0);
    add(ll, L([[0, 0.03], [0.07, 0.025], [0.085, -0.02], [0.082, -0.1], [0, -0.11]], 12), pants);
    // rolled cuff: a fat ring with a lip
    add(ll, L([[0.07, -0.035], [0.1, -0.05], [0.115, -0.08], [0.112, -0.13], [0.1, -0.155], [0.08, -0.16]], 14), cuffC);
    // welly: bell top, straight shaft, heel flare
    add(ll, L([[0.075, -0.13], [0.1, -0.145], [0.096, -0.2], [0.09, -0.34], [0.094, -0.41], [0.1, -0.44], [0.09, -0.455], [0, -0.455]], 14), welly);
    add(ll, sph(0.082, 12, 8), welly, 0, -0.405, 0.07, 0, 0, 0, 1.05, 0.62, 1.5);
    add(ll, ext([[-0.078, -0.11], [0.078, -0.11], [0.082, 0.1], [0.055, 0.17], [-0.055, 0.17], [-0.082, 0.1]], 0.02, 0.006), sole, 0, -0.448, 0.02, Math.PI / 2, 0, 0, 1, -1, 1);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.94
  const spine = J(hips, 0, 0.06, 0);
  // sweater torso: barrel chest and belly
  add(spine, L([[0, -0.15], [0.2, -0.14], [0.22, -0.02], [0.228, 0.12], [0.215, 0.29], [0.16, 0.39], [0.11, 0.41], [0, 0.42]], 16), knit, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);
  // cable ribs: three raised twisted cords
  for (const x of [-0.065, 0, 0.065]) {
    const pts = []; for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(x + Math.sin(i * 1.6) * 0.012, -0.08 + i * 0.055, 0));
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 16, 0.016, 5, false);
    add(spine, geo, knitDk, 0, 0, 0.183 - Math.abs(x) * 0.22);
  }
  add(spine, L([[0.2, -0.1], [0.215, -0.11], [0.215, -0.16], [0.2, -0.17]], 16), knitDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);
  // roll neck
  add(spine, L([[0.09, 0.37], [0.125, 0.38], [0.14, 0.42], [0.13, 0.47], [0.105, 0.5], [0.09, 0.495]], 14), knit);
  // oilskin jacket: one swept shell, open at the front, flared hem
  add(spine, L([[0.285, -0.22], [0.29, -0.2], [0.262, -0.05], [0.25, 0.12], [0.252, 0.3], [0.225, 0.39], [0.16, 0.44], [0.125, 0.445]], 18, ...OPEN), oil, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);
  // hem band
  add(spine, L([[0.292, -0.225], [0.298, -0.2], [0.286, -0.17]], 18, ...OPEN), oilDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);
  for (const s of [1, -1]) {
    // front placket strip along each open edge
    const a = GAP * s;
    add(spine, ext([[-0.025, -0.22], [0.025, -0.22], [0.025, 0.34], [-0.025, 0.34]], 0.02, 0.006), oilDk, Math.sin(a) * 0.255, 0, Math.cos(a) * 0.255 * 0.82, 0, a, 0);
    // notched lapel, folding back off the chest
    add(spine, ext([[0, 0], [0.09, 0.02], [0.07, 0.1], [0.1, 0.13], [0.02, 0.2]], 0.022, 0.008), oil, 0.07 * s, 0.24, 0.185, -0.2, 0.45 * s, 0, s, 1, 1);
    // patch pocket and flap
    add(spine, ext([[-0.07, -0.06], [0.07, -0.06], [0.07, 0.06], [-0.07, 0.06]], 0.025, 0.01), oil, 0.175 * s, -0.06, 0.158, 0, 0.6 * s, 0);
    add(spine, ext([[-0.075, 0], [0.075, 0], [0.065, 0.045], [-0.065, 0.045]], 0.03, 0.008), oilDk, 0.178 * s, 0.0, 0.163, 0, 0.6 * s, 0);
  }
  for (let i = 0; i < 3; i++) add(spine, new THREE.CylinderGeometry(0.015, 0.015, 0.014, 8), dark, -0.14, 0.02 + i * 0.11, 0.19, Math.PI / 2, 0, 0);
  // big folded collar: a swept flare around the back and sides of the neck, open at the front
  add(spine, L([[0.15, 0.43], [0.2, 0.47], [0.235, 0.45], [0.25, 0.39]], 16, 0.85, Math.PI * 2 - 1.7), oil, 0, 0, -0.01, 0, 0, 0, 1, 1, 0.85);
  // back yoke: a swept band across the shoulder blades
  add(spine, L([[0.262, 0.25], [0.27, 0.27], [0.262, 0.29]], 18, Math.PI - 1.2, 2.4), oilDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);

  // ---- head, neck at world y 1.39
  const head = J(spine, 0, 0.45, 0);
  add(head, L([[0, 0.08], [0.075, 0.08], [0.08, 0], [0, -0.01]], 10), skin);
  const H = new THREE.Group(); H.position.set(0, 0.2, 0.01); head.add(H);
  // head: egg sweep, wide jaw
  add(H, L([[0, -0.15], [0.09, -0.135], [0.135, -0.06], [0.14, 0.03], [0.125, 0.1], [0.08, 0.15], [0, 0.165]], 16), skin, 0, 0, 0, 0, 0, 0, 1, 1, 0.95);
  for (const s of [1, -1]) {
    add(H, sph(0.02, 8, 6), dark, 0.05 * s, 0.03, 0.12, 0, 0, 0, 1, 1.2, 0.6);
    add(H, ext([[-0.03, 0], [0.03, 0], [0.025, 0.018], [-0.03, 0.012]], 0.02, 0.004), beard, 0.05 * s, 0.058, 0.124, 0, 0.15 * s, -0.15 * s, s, 1, 1);
    add(H, sph(0.03, 8, 6), blush, 0.08 * s, -0.01, 0.1, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.034, 8, 6), skin, 0.138 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8);
  }
  add(H, L([[0, 0.03], [0.022, 0.02], [0.03, -0.01], [0.02, -0.03], [0, -0.032]], 10), skin, 0, 0.0, 0.135, Math.PI / 2, 0, 0, 1, 1, 0.9);
  // beard: a front half-shell sweep hugging the jaw, plus a moustache
  add(H, L([[0, -0.215], [0.06, -0.205], [0.115, -0.155], [0.142, -0.085], [0.14, -0.045], [0.128, -0.03]], 16, -1.65, 3.3), beard, 0, 0, 0.008, 0, 0, 0, 1, 1, 0.98);
  for (const s of [1, -1]) add(H, cap(0.03, 0.07, 6), beard, 0.122 * s, -0.005, 0.035, 0, 0, 0.1 * s); // sideburns
  for (const s of [1, -1]) add(H, cap(0.026, 0.06, 6), beard, 0.04 * s, -0.045, 0.142, 0, 0, Math.PI / 2 + 0.35 * s);
  add(H, sph(0.022, 8, 6), M(0x8e3f30, null, 0.8), 0, -0.075, 0.148, 0, 0, 0, 1.5, 0.5, 0.6);
  // beanie: swept dome with a rolled cuff
  add(H, L([[0.146, 0.06], [0.148, 0.1], [0.14, 0.145], [0.115, 0.18], [0.065, 0.203], [0, 0.207]], 16), beanie);
  add(H, L([[0.142, 0.05], [0.155, 0.058], [0.158, 0.1], [0.15, 0.118], [0.142, 0.118]], 16), beanieDk, 0, 0, 0, -0.06, 0, 0);

  // ---- arms, shoulders at world y 1.32
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.262 * s, 0.38, 0);
    ua.rotation.z = 0.12 * s;
    add(ua, L([[0, 0.085], [0.07, 0.075], [0.095, 0.01], [0.088, -0.15], [0.08, -0.31], [0, -0.32]], 12), oil);
    const la = J(ua, 0, -0.3, 0);
    add(la, L([[0, 0.03], [0.078, 0.01], [0.078, -0.14], [0.094, -0.155], [0.094, -0.22], [0.07, -0.226], [0, -0.228]], 12), oil);
    // big working hand: mitten sweep plus thumb
    add(la, L([[0, 0], [0.05, -0.01], [0.064, -0.06], [0.06, -0.11], [0.04, -0.145], [0, -0.15]], 10), skin, 0, -0.205, 0.005, 0, 0, 0, 0.8, 1, 1);
    add(la, cap(0.025, 0.045, 6), skin, -0.05 * s, -0.25, 0.035, 0.4, 0, 0.5 * s);
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
