// bram_cocklepicker, candidate B: profiles. Every body part is a LatheGeometry swept from a drawn
// silhouette (drooping straw brim and crown in one sweep, pot belly shirt, open vest shell, baggy
// gathered breeches, a beard swept as a half shell), vest panels and patch are extruded shapes.
// Stooped old cockle picker, 1.62 m, front +Z, short rake in the right hand (part of rightLowerArm).
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const DS = { side: THREE.DoubleSide };
  const skin = M(0xdea283, null, 0.8);
  const shirt = M(0xe9e2cf, 'fabric', 0.95, DS);
  const shirtDk = M(0xcfc6b0, 'fabric', 0.95, DS);
  const vest = M(0x5b8434, 'fabric', 0.9, DS);
  const vestDk = M(0x46692a, 'fabric', 0.9, DS);
  const patch = M(0x86a24a, 'fabric', 0.9);
  const breeches = M(0x4a3426, 'fabric', 0.9, DS);
  const breechesDk = M(0x3a281d, 'fabric', 0.9, DS);
  const straw = M(0xd4a659, 'fabric', 0.9, DS);
  const strawDk = M(0xb98a42, 'fabric', 0.9, DS);
  const band = M(0x6b4a2e, 'fabric', 0.85, DS);
  const beardC = M(0xcfccc6, 'fabric', 0.9, DS);
  const rope = M(0xa58a5c, 'fabric', 0.95);
  const dark = M(0x2b1d16, null, 0.6);
  const blush = M(0xd98a6c, null, 0.85);
  const handleC = M(0x7b5a3e, 'timber', 0.85);
  const iron = M(0x8c9196, 'metal', 0.55, { metalness: 0.4 });

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
  const GAP = 0.55;
  const OPEN = [GAP, Math.PI * 2 - GAP * 2];

  // ---- hips, world y 0.76
  const hips = J(g, 0, 0.76, 0);
  add(hips, L([[0, 0.07], [0.16, 0.06], [0.185, 0], [0.165, -0.09], [0.09, -0.13], [0, -0.135]], 12), breeches, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);
  // untucked shirt tail under the vest
  add(hips, L([[0.17, 0.08], [0.18, 0.02], [0.192, -0.06], [0.186, -0.07]], 14), shirtDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);

  // ---- legs: baggy breeches ballooning to a gathered cuff below the knee, bare shins and feet
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.092 * s, -0.04, 0);
    add(ul, L([[0, 0.05], [0.08, 0.035], [0.1, -0.06], [0.104, -0.2], [0.1, -0.3], [0.09, -0.34], [0, -0.35]], 12), breeches);
    const ll = J(ul, 0, -0.32, 0);
    add(ll, L([[0, 0.04], [0.095, 0.03], [0.105, -0.02], [0.095, -0.08], [0.07, -0.11], [0.05, -0.115]], 12), breeches);
    add(ll, L([[0.05, -0.095], [0.07, -0.1], [0.075, -0.12], [0.068, -0.14], [0.046, -0.14]], 12), breechesDk);
    // shin and ankle as one sweep
    add(ll, L([[0.04, -0.1], [0.048, -0.15], [0.044, -0.25], [0.034, -0.33], [0.04, -0.37], [0, -0.38]], 10), skin);
    // foot: a swept wedge laid along +Z, plus big toe
    add(ll, L([[0, -0.07], [0.05, -0.06], [0.062, 0.0], [0.055, 0.07], [0.035, 0.1], [0, 0.105]], 10), skin, 0, -0.383, 0.045, Math.PI / 2, 0, 0, 0.95, 1, 0.42);
    add(ll, sph(0.024, 6, 5), skin, 0.02 * s, -0.39, 0.14, 0, 0, 0, 1, 0.85, 1);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.82, stooped
  const spine = J(hips, 0, 0.06, 0);
  spine.rotation.x = 0.38;
  // shirt torso: small chest, round back
  add(spine, L([[0, -0.08], [0.165, -0.08], [0.172, 0.06], [0.178, 0.2], [0.17, 0.3], [0.13, 0.38], [0.08, 0.4], [0, 0.405]], 14), shirt, 0, 0, 0, 0, 0, 0, 1, 1, 0.82);
  add(spine, L([[0, 0.12], [0.13, 0.15], [0.15, 0.26], [0.11, 0.34], [0, 0.36]], 10, Math.PI - 1.2, 2.4), shirt, 0, 0, -0.04, 0, 0, 0, 1.05, 1, 0.75); // hump
  // open collar: a short V of skin and two collar points
  add(spine, ext([[-0.04, 0], [0.04, 0], [0, -0.08]], 0.02, 0.006), skin, 0, 0.385, 0.128, -0.25, 0, 0);
  for (const s of [1, -1]) add(spine, ext([[0, 0], [0.06, 0.005], [0.03, -0.055]], 0.02, 0.006), shirtDk, 0.03 * s, 0.39, 0.125, -0.4, 0.3 * s, 0, s, 1, 1);
  // vest: one swept shell, open at the front, slight flare at the hem
  add(spine, L([[0.198, -0.06], [0.2, -0.04], [0.188, 0.08], [0.188, 0.22], [0.178, 0.31], [0.15, 0.36], [0.12, 0.375]], 16, ...OPEN), vest, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);
  add(spine, L([[0.203, -0.065], [0.206, -0.04], [0.196, -0.02]], 16, ...OPEN), vestDk, 0, 0, 0, 0, 0, 0, 1, 1, 0.84);
  for (const s of [1, -1]) {
    const a = GAP * s;
    // front panels with a cut-away hem and button edge
    add(spine, ext([[-0.03, -0.06], [0.03, -0.04], [0.03, 0.3], [-0.03, 0.26]], 0.018, 0.006), vest, Math.sin(a) * 0.19, 0, Math.cos(a) * 0.19 * 0.84, 0, a, 0, s, 1, 1);
    add(spine, ext([[-0.045, 0], [0.045, 0], [0.045, 0.018], [-0.045, 0.018]], 0.02, 0.005), vestDk, 0.12 * s, 0.07, 0.138, 0, 0.62 * s, 0);
  }
  for (let i = 0; i < 3; i++) add(spine, new THREE.CylinderGeometry(0.013, 0.013, 0.014, 8), dark, 0.088, 0.06 + i * 0.08, 0.153, Math.PI / 2);
  // stitched patch on the left chest
  add(spine, ext([[-0.04, -0.04], [0.045, -0.035], [0.04, 0.042], [-0.045, 0.038]], 0.012, 0.005), patch, 0.13, 0.21, 0.13, 0, 0.62, 0.1);
  // rope belt
  add(spine, new THREE.TorusGeometry(0.168, 0.016, 5, 16), rope, 0, -0.005, 0, Math.PI / 2, 0, 0, 1, 0.84, 1);

  // ---- head, looking up out of the stoop
  const head = J(spine, 0, 0.42, 0.04);
  head.rotation.x = -0.45;
  add(head, L([[0, 0.08], [0.05, 0.08], [0.054, 0], [0, -0.01]], 10), skin);
  const H = new THREE.Group(); H.position.set(0, 0.16, 0.02); head.add(H);
  // head: egg sweep, narrow top, full cheeks
  add(H, L([[0, -0.12], [0.08, -0.11], [0.115, -0.05], [0.118, 0.03], [0.1, 0.09], [0.06, 0.12], [0, 0.128]], 14), skin, 0, 0, 0, 0, 0, 0, 1, 1, 0.95);
  for (const s of [1, -1]) {
    add(H, sph(0.017, 8, 6), dark, 0.042 * s, 0.015, 0.104, 0, 0, 0, 1, 0.8, 0.6);
    add(H, ext([[-0.035, 0], [0.035, -0.005], [0.04, 0.02], [0, 0.03], [-0.04, 0.02]], 0.03, 0.008), beardC, 0.048 * s, 0.042, 0.1, 0, 0.15 * s, -0.25 * s, s, 1, 1);
    add(H, sph(0.024, 8, 6), blush, 0.07 * s, -0.012, 0.088, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.028, 8, 6), skin, 0.115 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8);
    add(H, sph(0.05, 8, 6), beardC, 0.1 * s, -0.005, -0.045, 0, 0, 0.3 * s, 0.6, 1.0, 1.0);
  }
  add(H, L([[0, 0.035], [0.025, 0.025], [0.036, -0.01], [0.024, -0.035], [0, -0.037]], 10), skin, 0, -0.01, 0.118, Math.PI / 2, 0, 0, 1, 1, 0.9);
  // beard: front half-shell from the cheekbones down to a point over the chest
  add(H, L([[0, -0.32], [0.04, -0.29], [0.09, -0.21], [0.125, -0.12], [0.128, -0.05], [0.12, -0.02]], 16, -1.7, 3.4), beardC, 0, 0, 0.0, 0.18, 0, 0, 1, 1, 0.9);
  for (const s of [1, -1]) add(H, cap(0.026, 0.065, 6), beardC, 0.045 * s, -0.048, 0.118, 0, 0, Math.PI / 2 + 0.45 * s);
  // straw hat: drooping brim and round crown in one sweep, band as a ring sweep
  const hat = new THREE.Group(); hat.position.set(0, 0.07, -0.005); hat.rotation.x = -0.1; H.add(hat);
  add(hat, L([[0.34, -0.045], [0.335, -0.03], [0.28, 0.0], [0.2, 0.025], [0.145, 0.04], [0.135, 0.1], [0.13, 0.16], [0.11, 0.2], [0.06, 0.218], [0, 0.22]], 24), straw);
  add(hat, L([[0.34, -0.048], [0.346, -0.04], [0.34, -0.026]], 24), strawDk);
  add(hat, L([[0.252, 0.012], [0.258, 0.016], [0.252, 0.02]], 24), strawDk);
  add(hat, L([[0.143, 0.035], [0.147, 0.05], [0.144, 0.085], [0.138, 0.09]], 18), band);
  for (const y of [0.12, 0.16]) add(hat, L([[0.134, y - 0.006], [0.138, y], [0.13, y + 0.006]], 18), strawDk);

  // ---- arms: rolled white sleeves, bare forearms
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.2 * s, 0.34, 0);
    add(ua, L([[0, 0.075], [0.06, 0.065], [0.078, 0.0], [0.072, -0.14], [0.066, -0.25], [0, -0.26]], 12), shirt);
    const la = J(ua, 0, -0.27, 0);
    add(la, L([[0.04, 0.03], [0.072, 0.03], [0.082, 0.0], [0.08, -0.04], [0.068, -0.06], [0.04, -0.06]], 12), shirtDk);
    add(la, L([[0, 0.0], [0.046, -0.02], [0.048, -0.1], [0.04, -0.2], [0, -0.21]], 10), skin);
    add(la, L([[0, 0], [0.045, -0.01], [0.056, -0.05], [0.052, -0.09], [0.035, -0.12], [0, -0.125]], 10), skin, 0, -0.2, 0.005, 0, 0, 0, 0.8, 1, 1);
    add(la, cap(0.02, 0.035, 6), skin, -0.04 * s, -0.24, 0.035, 0.5, 0, 0.5 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }
  arms.leftUpperArm.rotation.set(-0.25, 0, 0.12);
  arms.leftLowerArm.rotation.set(-0.3, 0, 0);
  arms.rightUpperArm.rotation.set(-0.38, 0, -0.25);
  arms.rightLowerArm.rotation.set(-0.6, 0, 0);

  // ---- rake in the right hand, world-aligned at build time, head on the ground
  g.updateMatrixWorld(true);
  const grip = new THREE.Group(); grip.position.set(0, -0.265, 0.01); arms.rightLowerArm.add(grip);
  g.updateMatrixWorld(true);
  const gq = new THREE.Quaternion(); grip.getWorldQuaternion(gq); grip.quaternion.copy(gq.invert());
  g.updateMatrixWorld(true);
  const gp = new THREE.Vector3(); grip.getWorldPosition(gp);
  const headAt = new THREE.Vector3(-0.14, 0.09 - gp.y, 0.4);
  const dir = headAt.clone().normalize();
  const len = headAt.length() + 0.15;
  // handle: one sweep with a knob at the top and a swelling at the ferrule
  const handle = L([[0, len], [0.026, len - 0.01], [0.02, len - 0.04], [0.02, 0.08], [0.028, 0.06], [0.03, 0.0], [0, -0.005]], 7);
  const hm = add(grip, handle, handleC);
  hm.position.copy(headAt); hm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate());
  add(grip, new THREE.CylinderGeometry(0.03, 0.026, 0.06, 7), iron, 0, 0, 0).position.copy(headAt).addScaledVector(dir, -0.03);
  grip.children[grip.children.length - 1].quaternion.copy(hm.quaternion);
  const rh = new THREE.Group(); rh.position.copy(headAt); rh.rotation.y = -0.3; grip.add(rh);
  add(rh, ext([[-0.17, -0.022], [0.17, -0.022], [0.15, 0.022], [-0.15, 0.022]], 0.04, 0.006), iron);
  for (let i = 0; i < 5; i++) add(rh, new THREE.ConeGeometry(0.013, 0.1, 6), iron, -0.14 + i * 0.07, -0.07, 0.012, Math.PI + 0.2, 0, 0);

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
