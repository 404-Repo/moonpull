// nell_tidekeeper, candidate B: profiles. Coat, skirt, head, boots are Lathe sweeps; pockets and
// lapels are Extrudes; the staff is a Tube along a gnarled curve. Stooped old tide-keeper, 1.7 m, front +Z.
// Long navy coat, cream knitted scarf, grey bun, dark rubber boots, staff with a brass ring in the
// right hand (part of rightLowerArm). Jointed: g.userData.joints with pivots at the joints.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xe2ad8e, null, 0.8);
  const coat = M(0x3b4c6b, 'fabric', 0.9);
  const coatDk = M(0x2c3a52, 'fabric', 0.9, { side: THREE.DoubleSide });
  const knit = M(0x332c27, 'fabric', 0.95);
  const scarf = M(0xd9cfb6, 'fabric', 0.95);
  const trousers = M(0x2f2a26, 'fabric', 0.9);
  const boot = M(0x4a4d4b, null, 0.6);
  const sole = M(0x2a2b2b, null, 0.7);
  const hair = M(0xa7a39c, 'fabric', 0.85);
  const hairDk = M(0x85817a, 'fabric', 0.85);
  const dark = M(0x2b1d16, null, 0.6);
  const blush = M(0xd9907a, null, 0.85);
  const lipC = M(0x9a5546, null, 0.8);
  const staffC = M(0x6a4a32, 'timber', 0.85);
  const brass = M(0xa88a4a, 'metal', 0.5, { metalness: 0.5 });

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const cyl = (rt, rb, h, s = 12, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
  const lathe = (pts, seg = 14, p0 = 0, pl = Math.PI * 2) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, p0, pl);
  const slab = (w, h, d, bev = 0.01) => { const sh = new THREE.Shape(); const x = w / 2 - bev, y = h / 2 - bev, r = Math.min(x, y) * 0.4;
    sh.moveTo(-x, -y + r); sh.quadraticCurveTo(-x, -y, -x + r, -y); sh.lineTo(x - r, -y); sh.quadraticCurveTo(x, -y, x, -y + r); sh.lineTo(x, y); sh.lineTo(-x, y); sh.lineTo(-x, -y + r);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * bev, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 1, curveSegments: 3 }); geo.translate(0, 0, -(d - 2 * bev) / 2); return geo; };
  const ragged = (geo, below, amp) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < below) p.setY(i, p.getY(i) + amp * Math.sin(Math.atan2(p.getX(i), p.getZ(i)) * 7) + amp * 0.5 * Math.cos(Math.atan2(p.getX(i), p.getZ(i)) * 3)); geo.computeVertexNormals(); return geo; };

  // ---- hips, world y 0.84: coat skirt hangs from here so it stays upright while she leans
  const hips = J(g, 0, 0.84, 0);
  add(hips, sph(0.17, 12, 8), trousers, 0, 0, 0, 0, 0, 0, 1, 0.7, 0.85);
  const skirtPts = [[0.19, 0.1], [0.205, 0.0], [0.225, -0.2], [0.255, -0.38], [0.265, -0.43]];
  add(hips, ragged(lathe(skirtPts, 18, 0.3, Math.PI * 2 - 0.6), -0.4, 0.015), coat, 0, 0, -0.01, 0, 0, 0, 1, 1, 0.82);
  add(hips, ragged(lathe(skirtPts.map(([r, y]) => [r - 0.008, y]), 18, 0.3, Math.PI * 2 - 0.6), -0.4, 0.015), coatDk, 0, 0, -0.01, 0, 0, 0, 1, 1, 0.81);
  add(hips, lathe([[0.17, 0.08], [0.18, -0.1], [0.19, -0.3], [0.2, -0.36]], 10, -0.35, 0.7), knit, 0, 0, -0.01, 0, 0, 0, 1, 1, 0.8);
  for (const s of [1, -1]) {
    add(hips, slab(0.15, 0.15, 0.04), coat, 0.175 * s, -0.12, 0.1, 0, 0.75 * s, 0);
    add(hips, slab(0.16, 0.045, 0.05), coatDk, 0.175 * s, -0.05, 0.102, 0, 0.75 * s, 0);
  }

  // ---- legs: dark trousers, wide rubber boots
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.09 * s, -0.04, 0);
    add(ul, cap(0.08, 0.24), trousers, 0, -0.19, 0);
    const ll = J(ul, 0, -0.38, 0);
    add(ll, cap(0.068, 0.16), trousers, 0, -0.1, 0);
    add(ll, lathe([[0.06, -0.16], [0.1, -0.17], [0.1, -0.2], [0.088, -0.21], [0.085, -0.3], [0.09, -0.36], [0, -0.38]], 12), boot);
    add(ll, cap(0.075, 0.12, 10), boot, 0, -0.37, 0.05, Math.PI / 2, 0, 0, 1.05, 1, 0.85);
    add(ll, new THREE.BoxGeometry(0.16, 0.04, 0.27), sole, 0, -0.4, 0.045);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.90, leaning forward
  const spine = J(hips, 0, 0.06, 0);
  spine.rotation.x = 0.17;
  add(spine, cyl(0.19, 0.2, 0.36, 14), knit, 0, 0.17, 0, 0, 0, 0, 1, 1, 0.8);
  // coat upper body: one sweep with the front left open, the stoop hump built into the profile
  const torsoPts = [[0.2, -0.04], [0.205, 0.08], [0.215, 0.22], [0.2, 0.34], [0.15, 0.42], [0.08, 0.46]];
  add(spine, lathe(torsoPts, 18, 0.45, Math.PI * 2 - 0.9), coat, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);
  add(spine, lathe(torsoPts.map(([r, y]) => [r - 0.008, y]), 18, 0.45, Math.PI * 2 - 0.9), coatDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.83);
  add(spine, sph(0.15, 10, 7), coat, 0, 0.3, -0.1, 0, 0, 0, 1.2, 0.9, 0.7); // hump
  for (const s of [1, -1]) {
    add(spine, slab(0.07, 0.34, 0.03), coat, 0.085 * s, 0.2, 0.165, 0, 0.35 * s, 0.06 * s);
    add(spine, slab(0.12, 0.15, 0.035), coat, 0.11 * s, 0.45, 0.06, -0.3, 0.5 * s, 0);
  }
  // scarf: thick wrap and two tails
  add(spine, new THREE.TorusGeometry(0.115, 0.055, 8, 14), scarf, 0, 0.45, 0.03, Math.PI / 2 + 0.2, 0, 0);
  add(spine, cap(0.045, 0.24, 8), scarf, 0.035, 0.27, 0.19, -0.12, 0, 0.08, 1.3, 1, 0.55);
  add(spine, cap(0.042, 0.17, 8), scarf, -0.05, 0.31, 0.2, -0.2, 0, -0.15, 1.25, 1, 0.55);
  for (let i = 0; i < 4; i++) add(spine, new THREE.BoxGeometry(0.04, 0.045, 0.04), scarf, 0.0 + i * 0.022 + 0.0, 0.1, 0.2, 0, 0, 0);

  // ---- head (neck), looking up out of the stoop
  const head = J(spine, 0, 0.44, 0.04);
  head.rotation.x = -0.22;
  add(head, cyl(0.05, 0.055, 0.08, 10), skin, 0, 0.03, 0);
  const H = new THREE.Group(); H.position.set(0, 0.14, 0.01); head.add(H);
  add(H, lathe([[0, -0.13], [0.06, -0.125], [0.105, -0.09], [0.125, -0.03], [0.128, 0.03], [0.115, 0.09], [0.08, 0.125], [0, 0.135]], 16), skin, 0, 0, 0, 0, 0, 0, 1, 1, 0.96);
  add(H, sph(0.07, 10, 7), skin, 0, -0.06, 0.04, 0, 0, 0, 1.35, 0.8, 1.1); // jowls
  for (const s of [1, -1]) {
    add(H, sph(0.02, 8, 6), dark, 0.045 * s, 0.012, 0.113, 0, 0, 0, 1, 0.75, 0.6);
    add(H, sph(0.028, 8, 6), skin, 0.045 * s, 0.03, 0.108, 0, 0, 0, 1.2, 0.55, 0.7); // heavy lid
    add(H, cap(0.013, 0.035, 6), hair, 0.05 * s, 0.05, 0.11, 0, 0, Math.PI / 2 - 0.25 * s); // bushy brow
    add(H, sph(0.026, 8, 6), blush, 0.072 * s, -0.03, 0.095, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.03, 8, 6), skin, 0.122 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8); // ears
  }
  add(H, sph(0.032, 10, 8), skin, 0, -0.012, 0.128, 0, 0, 0, 1, 0.95, 0.9); // big round nose
  add(H, cap(0.009, 0.04, 6), lipC, 0, -0.065, 0.118, 0, 0, Math.PI / 2 + 0.0, 1, 1, 0.6);
  // hair: grey cap swept back, loose strands, bun on top
  add(H, new THREE.SphereGeometry(0.133, 14, 7, 0, Math.PI * 2, 0, 1.5), hair, 0, 0.012, -0.012, -0.12);
  add(H, sph(0.12, 12, 7), hair, 0, 0.01, -0.035, 0, 0, 0, 1.05, 1.0, 0.95);
  add(H, sph(0.06, 10, 7), hair, 0, 0.11, -0.065, 0, 0, 0, 1.1, 0.9, 1);
  add(H, new THREE.TorusGeometry(0.05, 0.022, 6, 14), hairDk, 0, 0.1, -0.06, Math.PI / 2 - 0.6);
  add(H, sph(0.04, 8, 6), hair, 0.02, 0.16, -0.08);
  for (const s of [1, -1]) add(H, sph(0.05, 8, 6), hair, 0.105 * s, 0.02, 0.02, 0, 0, 0.3 * s, 0.5, 1.2, 0.9);
  add(H, sph(0.045, 8, 6), hair, -0.05, 0.1, 0.075, 0.5, 0, 0.5, 1.5, 0.55, 0.6);

  // ---- arms (shoulders), wide coat sleeves
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.215 * s, 0.37, 0);
    add(ua, sph(0.085, 10, 7), coat, 0, -0.01, 0);
    add(ua, lathe([[0, 0.04], [0.07, 0.02], [0.075, -0.1], [0.068, -0.26], [0, -0.29]], 10), coat);
    const la = J(ua, 0, -0.28, 0);
    add(la, lathe([[0, 0.03], [0.064, 0.02], [0.066, -0.1], [0.08, -0.2], [0.07, -0.205], [0, -0.2]], 10), coat);
    add(la, cyl(0.05, 0.052, 0.04, 10), knit, 0, -0.215, 0);
    add(la, sph(0.055, 10, 8), skin, 0, -0.265, 0.008, 0, 0, 0, 0.85, 1.05, 1);
    add(la, cap(0.02, 0.035, 6), skin, -0.045 * s, -0.245, 0.03, 0.5, 0, 0.5 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }
  // rest pose: left arm hangs by the pocket, right arm forward and bent around the staff
  arms.leftUpperArm.rotation.set(-0.05, 0, 0.22);
  arms.leftLowerArm.rotation.set(-0.35, 0, 0);
  arms.rightUpperArm.rotation.set(-0.35, 0, -0.32);
  arms.rightLowerArm.rotation.set(-0.85, 0, 0.1);

  // ---- staff, gripped in the right hand, kept plumb in world at build time
  g.updateMatrixWorld(true);
  const grip = new THREE.Group(); grip.position.set(0, -0.265, 0.01); arms.rightLowerArm.add(grip);
  g.updateMatrixWorld(true);
  const gq = new THREE.Quaternion(); grip.getWorldQuaternion(gq); grip.quaternion.copy(gq.invert());
  g.updateMatrixWorld(true);
  const gp = new THREE.Vector3(); grip.getWorldPosition(gp);
  const below = gp.y - 0.0, above = 0.34;   // runs from the ground to above the hand
  const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8, y = -below + t * (below + above); pts.push(new THREE.Vector3(0.014 * Math.sin(t * 11), y, 0.012 * Math.cos(t * 8))); }
  add(grip, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.024, 7, false), staffC);
  add(grip, sph(0.024, 7, 5), staffC, pts[0].x, pts[0].y + 0.01, pts[0].z);
  add(grip, sph(0.04, 8, 6), staffC, 0.01, above, 0, 0, 0, 0, 1, 1.3, 1); // knob
  add(grip, new THREE.TorusGeometry(0.055, 0.011, 6, 16), brass, 0.035, above - 0.07, 0, 0, Math.PI / 2, 0.4);

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
