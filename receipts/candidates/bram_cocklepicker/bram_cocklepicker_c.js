// bram_cocklepicker, candidate C: a second reading. A deeper hunch with bent knees and the head
// pushed forward, a bigger hat tipped back, faceted low-segment masses (flat shaded, like Nell C),
// the vest hung as separate front and back slabs, and the rake reaching forward as if mid-scrape.
// Stooped old cockle picker, 1.62 m, front +Z, rake part of rightLowerArm. Jointed like Tam.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true, ...extra });
    if (name) m.name = name;
    return m;
  };
  const DS = { side: THREE.DoubleSide };
  const skin = M(0xdea283, null, 0.8, { flatShading: false });
  const shirt = M(0xe9e2cf, 'fabric', 0.95);
  const shirtDk = M(0xcfc6b0, 'fabric', 0.95, DS);
  const vest = M(0x5b8434, 'fabric', 0.9);
  const vestDk = M(0x46692a, 'fabric', 0.9);
  const patch = M(0x86a24a, 'fabric', 0.9);
  const breeches = M(0x4a3426, 'fabric', 0.9);
  const breechesDk = M(0x3a281d, 'fabric', 0.9);
  const straw = M(0xd4a659, 'fabric', 0.9, DS);
  const strawDk = M(0xb98a42, 'fabric', 0.9, DS);
  const band = M(0x6b4a2e, 'fabric', 0.85);
  const beardC = M(0xcfccc6, 'fabric', 0.9);
  const beardDk = M(0xaaa69f, 'fabric', 0.9);
  const rope = M(0xa58a5c, 'fabric', 0.95);
  const dark = M(0x2b1d16, null, 0.6, { flatShading: false });
  const blush = M(0xd98a6c, null, 0.85, { flatShading: false });
  const handleC = M(0x7b5a3e, 'timber', 0.85);
  const iron = M(0x8c9196, 'metal', 0.55, { metalness: 0.4 });

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const cyl = (rt, rb, h, s = 9, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const up = new THREE.Vector3(0, 1, 0);
  const rod = (parent, a, b, r, mat, seg = 6) => {
    const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const o = add(parent, cyl(r, r * 0.9, len, seg), mat);
    o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(up, d.normalize()); return o;
  };

  // ---- hips, world y 0.72, knees bent so the pelvis sits back
  const hips = J(g, 0, 0.72, -0.03);
  hips.rotation.x = 0.12;
  add(hips, sph(0.175, 9, 6), breeches, 0, -0.02, 0, 0, 0, 0, 1.05, 0.8, 0.9);
  add(hips, cyl(0.18, 0.2, 0.12, 9, true), shirtDk, 0, 0.01, 0, 0, 0, 0, 1, 1, 0.88);

  // ---- legs: knees forward, baggy breeches, bare feet planted wide
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.1 * s, -0.04, 0);
    ul.rotation.set(-0.38, 0, 0.04 * s);
    add(ul, cyl(0.11, 0.1, 0.28, 8), breeches, 0, -0.15, 0);
    const ll = J(ul, 0, -0.3, 0);
    ll.rotation.x = 0.6;
    add(ll, sph(0.105, 8, 6), breeches, 0, -0.03, 0, 0, 0, 0, 1, 1.1, 1);
    add(ll, cyl(0.075, 0.07, 0.04, 8), breechesDk, 0, -0.12, 0);
    add(ll, cyl(0.046, 0.04, 0.24, 8), skin, 0, -0.25, 0);
    // foot, built so it sits flat once the knee bend and thigh lean cancel out
    const foot = new THREE.Group(); foot.position.set(0, -0.375, 0); foot.rotation.x = -0.6 + 0.38 - 0.12; ll.add(foot);
    add(foot, box(0.1, 0.06, 0.2), skin, 0, -0.005, 0.045);
    add(foot, cyl(0.05, 0.05, 0.1, 8), skin, 0, -0.005, 0.145, 0, 0, Math.PI / 2, 1, 1, 0.6);
    add(foot, sph(0.024, 6, 4), skin, 0.025 * s, 0.0, 0.17);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, deep hunch
  const spine = J(hips, 0, 0.06, 0);
  spine.rotation.x = 0.45;
  add(spine, cyl(0.16, 0.18, 0.36, 10), shirt, 0, 0.16, 0, 0, 0, 0, 1, 1, 0.84);
  add(spine, sph(0.18, 10, 6), shirt, 0, 0.33, -0.02, 0, 0, 0, 1.05, 0.55, 0.84);
  add(spine, sph(0.15, 8, 6), vest, 0, 0.28, -0.1, 0, 0, 0, 1.15, 1.0, 0.8); // hump under the vest back
  // vest: one back slab, two front slabs angled to the chest, all bevelled boxes
  add(spine, box(0.36, 0.34, 0.06), vest, 0, 0.17, -0.13, 0.04);
  for (const s of [1, -1]) {
    add(spine, box(0.06, 0.34, 0.24), vest, 0.17 * s, 0.17, -0.0, 0, 0, 0.03 * s); // side panels
    add(spine, box(0.12, 0.34, 0.05), vest, 0.105 * s, 0.17, 0.125, 0, 0.35 * s, 0); // front panels
    add(spine, box(0.025, 0.34, 0.06), vestDk, 0.05 * s, 0.17, 0.142, 0, 0.35 * s, 0);
    add(spine, box(0.08, 0.06, 0.2), vest, 0.13 * s, 0.355, 0.0, 0, 0, -0.35 * s); // shoulder straps
    add(spine, box(0.09, 0.025, 0.03), vestDk, 0.12 * s, 0.07, 0.14, 0, 0.5 * s, 0);
  }
  add(spine, box(0.08, 0.075, 0.02), patch, 0.12, 0.23, 0.145, 0, 0.35, 0.12);
  for (let i = 0; i < 3; i++) add(spine, cyl(0.014, 0.014, 0.014, 8), dark, 0.06, 0.09 + i * 0.08, 0.162, Math.PI / 2);
  add(spine, new THREE.TorusGeometry(0.17, 0.02, 4, 12), rope, 0, -0.005, 0, Math.PI / 2, 0, 0, 1, 0.86, 1);
  add(spine, box(0.07, 0.08, 0.03), skin, 0, 0.36, 0.13, -0.3); // open collar

  // ---- head, pushed forward and up
  const head = J(spine, 0, 0.4, 0.06);
  head.rotation.x = -0.55;
  add(head, cyl(0.05, 0.056, 0.09, 8), skin, 0, 0.035, 0);
  const H = new THREE.Group(); H.position.set(0, 0.16, 0.03); H.scale.setScalar(1.08); head.add(H);
  add(H, sph(0.115, 12, 9), skin, 0, 0, 0, 0, 0, 0, 0.96, 1.05, 1);
  for (const s of [1, -1]) {
    add(H, sph(0.017, 8, 6), dark, 0.042 * s, 0.012, 0.106, 0, 0, 0, 1, 0.8, 0.6);
    add(H, box(0.07, 0.035, 0.04), beardC, 0.05 * s, 0.045, 0.1, 0, 0.2 * s, -0.3 * s); // brows
    add(H, sph(0.024, 8, 6), blush, 0.068 * s, -0.012, 0.09, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.028, 6, 5), skin, 0.113 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8);
    add(H, new THREE.IcosahedronGeometry(0.055, 0), beardC, 0.095 * s, -0.01, -0.05, 0, 0, 0, 0.7, 1.1, 1.0);
  }
  add(H, sph(0.036, 8, 6), skin, 0, -0.012, 0.122, 0, 0, 0, 1, 1.1, 0.95);
  // beard: faceted chunks stacked to a wide, spade-shaped mass
  add(H, new THREE.IcosahedronGeometry(0.11, 1), beardC, 0, -0.1, 0.05, 0, 0, 0, 1.15, 0.95, 0.8);
  add(H, new THREE.IcosahedronGeometry(0.09, 1), beardC, 0, -0.2, 0.08, 0.3, 0, 0, 1.2, 1.0, 0.7);
  add(H, new THREE.IcosahedronGeometry(0.055, 0), beardDk, 0, -0.28, 0.1, 0, 0, 0, 1.3, 1, 0.8);
  for (const s of [1, -1]) add(H, cap(0.028, 0.06, 6), beardC, 0.045 * s, -0.048, 0.118, 0, 0, Math.PI / 2 + 0.4 * s);
  // hat: bigger, tipped back, a wavy brim (vertex jitter) and a squat crown
  const hat = new THREE.Group(); hat.position.set(0, 0.07, -0.015); hat.rotation.x = -0.22; H.add(hat);
  const brim = new THREE.CylinderGeometry(0.15, 0.36, 0.07, 20, 1, true);
  { const p = brim.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z); if (r > 0.3) p.setY(i, p.getY(i) + 0.014 * Math.sin(Math.atan2(z, x) * 5)); } brim.computeVertexNormals(); }
  add(hat, brim, straw);
  add(hat, brim, strawDk, 0, -0.012, 0, 0, 0, 0, 0.985, 1, 0.985);
  add(hat, cyl(0.13, 0.145, 0.14, 12), straw, 0, 0.1, 0);
  add(hat, cyl(0.1, 0.13, 0.04, 12), straw, 0, 0.19, 0);
  add(hat, cyl(0.148, 0.15, 0.045, 12), band, 0, 0.055, 0);
  add(hat, new THREE.TorusGeometry(0.36, 0.014, 3, 20), strawDk, 0, -0.035, 0, Math.PI / 2);

  // ---- arms
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.2 * s, 0.33, 0);
    add(ua, sph(0.078, 8, 6), shirt, 0, -0.01, 0);
    add(ua, cyl(0.075, 0.068, 0.22, 8), shirt, 0, -0.13, 0);
    const la = J(ua, 0, -0.27, 0);
    add(la, cyl(0.08, 0.076, 0.07, 8), shirtDk, 0, -0.015, 0);
    add(la, cyl(0.048, 0.04, 0.18, 8), skin, 0, -0.13, 0);
    add(la, box(0.08, 0.1, 0.07), skin, 0, -0.26, 0.008);
    add(la, cap(0.02, 0.035, 6), skin, -0.045 * s, -0.24, 0.035, 0.5, 0, 0.5 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }
  arms.leftUpperArm.rotation.set(-0.35, 0, 0.18);
  arms.leftLowerArm.rotation.set(-0.5, 0, 0);
  arms.rightUpperArm.rotation.set(-0.7, 0, -0.2);
  arms.rightLowerArm.rotation.set(-0.5, 0, 0);

  // ---- rake reaching forward, head on the sand in front of him
  g.updateMatrixWorld(true);
  const grip = new THREE.Group(); grip.position.set(0, -0.26, 0.01); arms.rightLowerArm.add(grip);
  g.updateMatrixWorld(true);
  const gq = new THREE.Quaternion(); grip.getWorldQuaternion(gq); grip.quaternion.copy(gq.invert());
  g.updateMatrixWorld(true);
  const gp = new THREE.Vector3(); grip.getWorldPosition(gp);
  const headAt = new THREE.Vector3(-0.05, 0.09 - gp.y, 0.55);
  const dir = headAt.clone().normalize();
  const top = dir.clone().multiplyScalar(-0.18);
  rod(grip, top, headAt, 0.022, handleC, 6);
  rod(grip, headAt.clone().addScaledVector(dir, -0.07), headAt, 0.028, iron, 6);
  const rh = new THREE.Group(); rh.position.copy(headAt); grip.add(rh);
  add(rh, box(0.36, 0.05, 0.05), iron);
  for (let i = 0; i < 6; i++) add(rh, box(0.022, 0.1, 0.022), iron, -0.15 + i * 0.06, -0.065, 0.015, 0.25, 0, 0);

  g.userData.joints = { hips, spine, head, ...arms, ...legs };

  // contract recentring: move root children only so joint hierarchy stays intact
  const bb = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
