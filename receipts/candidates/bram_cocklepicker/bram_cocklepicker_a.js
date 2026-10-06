// bram_cocklepicker, candidate A: primitives. Stooped old cockle picker, 1.62 m, front +Z.
// Wide woven straw hat with a brown band, big grey beard and bushy brows, white shirt with rolled
// sleeves, green patched vest, dark brown baggy knee breeches, bare feet, a short rake with a grey
// iron head held low in the right hand (part of rightLowerArm). Jointed like tam_fisherman.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const DS = { side: THREE.DoubleSide };
  const skin = M(0xdea283, null, 0.8);
  const shirt = M(0xe9e2cf, 'fabric', 0.95);
  const shirtDk = M(0xcfc6b0, 'fabric', 0.95, DS);
  const vest = M(0x5b8434, 'fabric', 0.9, DS);
  const vestDk = M(0x46692a, 'fabric', 0.9);
  const patch = M(0x86a24a, 'fabric', 0.9);
  const breeches = M(0x4a3426, 'fabric', 0.9);
  const breechesDk = M(0x3a281d, 'fabric', 0.9);
  const straw = M(0xd4a659, 'fabric', 0.9, DS);
  const strawDk = M(0xb98a42, 'fabric', 0.9, DS);
  const band = M(0x6b4a2e, 'fabric', 0.85);
  const beardC = M(0xcfccc6, 'fabric', 0.9);
  const beardDk = M(0xa9a59e, 'fabric', 0.9);
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
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const cyl = (rt, rb, h, s = 12, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
  const up = new THREE.Vector3(0, 1, 0);
  const rod = (parent, a, b, r, mat, seg = 6) => {
    const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const o = add(parent, cyl(r, r, len, seg), mat);
    o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(up, d.normalize()); return o;
  };

  // ---- hips, world y 0.76: untucked shirt tail and breeches seat
  const hips = J(g, 0, 0.76, 0);
  add(hips, sph(0.17, 10, 7), breeches, 0, -0.02, 0, 0, 0, 0, 1.05, 0.75, 0.85);
  add(hips, cyl(0.175, 0.19, 0.14, 14, true), shirtDk, 0, 0.0, 0.0, 0, 0, 0, 1, 1, 0.85);

  // ---- legs: baggy breeches to below the knee, bare shins and feet
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.09 * s, -0.04, 0);
    add(ul, cap(0.098, 0.2, 10), breeches, 0, -0.17, 0, 0, 0, 0, 1, 1, 0.95);
    const ll = J(ul, 0, -0.32, 0);
    add(ll, cap(0.1, 0.06, 10), breeches, 0, -0.04, 0, 0, 0, 0, 1, 1, 0.95); // baggy knee
    add(ll, new THREE.TorusGeometry(0.075, 0.025, 5, 12), breechesDk, 0, -0.11, 0, Math.PI / 2); // gathered cuff
    add(ll, cap(0.045, 0.2, 8), skin, 0, -0.23, 0);
    // bare foot: a long soft wedge with a big toe and an ankle bone
    add(ll, sph(0.06, 10, 7), skin, 0, -0.395, 0.05, 0, 0, 0, 0.95, 0.5, 1.85);
    add(ll, sph(0.025, 6, 5), skin, 0.02 * s, -0.395, 0.152, 0, 0, 0, 1, 0.9, 1);
    for (let t = 0; t < 2; t++) add(ll, sph(0.017, 6, 4), skin, (-0.012 - t * 0.017) * s, -0.4, 0.145 - t * 0.008);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.82, stooped forward
  const spine = J(hips, 0, 0.06, 0);
  spine.rotation.x = 0.36;
  add(spine, cyl(0.16, 0.175, 0.38, 14), shirt, 0, 0.17, 0, 0, 0, 0, 1, 1, 0.82);
  add(spine, sph(0.175, 12, 7), shirt, 0, 0.35, -0.01, 0, 0, 0, 1.05, 0.45, 0.82);
  add(spine, sph(0.15, 9, 6), shirt, 0, 0.3, -0.08, 0, 0, 0, 1.1, 0.9, 0.8); // stoop hump
  // open collar V
  add(spine, new THREE.BoxGeometry(0.06, 0.1, 0.03), skin, 0, 0.33, 0.14, -0.2);
  for (const s of [1, -1]) add(spine, new THREE.BoxGeometry(0.07, 0.05, 0.03), shirtDk, 0.05 * s, 0.39, 0.12, -0.5, 0, 0.5 * s);
  // vest: open front shell, armholes at the top
  add(spine, new THREE.CylinderGeometry(0.183, 0.198, 0.36, 16, 1, true, 0.5, Math.PI * 2 - 1.0), vest, 0, 0.16, 0, 0, 0, 0, 1, 1, 0.84);
  add(spine, new THREE.SphereGeometry(0.19, 14, 6, 0, Math.PI * 2, 0, 1.2), vest, 0, 0.33, -0.015, 0, 0, 0, 1.0, 0.5, 0.84);
  for (const s of [1, -1]) {
    add(spine, new THREE.BoxGeometry(0.075, 0.34, 0.035), vest, 0.085 * s, 0.16, 0.152, 0, 0.42 * s, 0); // front panels
    add(spine, new THREE.BoxGeometry(0.02, 0.33, 0.04), vestDk, 0.05 * s, 0.16, 0.162, 0, 0.42 * s, 0); // edge
    add(spine, new THREE.BoxGeometry(0.1, 0.022, 0.03), vestDk, 0.12 * s, 0.07, 0.135, 0, 0.6 * s, 0); // welt pocket
  }
  for (let i = 0; i < 3; i++) add(spine, cyl(0.013, 0.013, 0.014, 8), dark, 0.055, 0.1 + i * 0.075, 0.172, Math.PI / 2);
  // patch on the left chest, stitched corners
  add(spine, new THREE.BoxGeometry(0.085, 0.08, 0.02), patch, 0.125, 0.22, 0.125, 0, 0.6, 0.12);
  // rope belt with knot
  add(spine, new THREE.TorusGeometry(0.168, 0.016, 5, 16), rope, 0, 0.0, 0, Math.PI / 2, 0, 0, 1, 0.84, 1);
  add(spine, sph(0.03, 6, 5), rope, 0.04, -0.005, 0.14);

  // ---- head, neck at world y ~1.21, looking up out of the stoop
  const head = J(spine, 0, 0.42, 0.04);
  head.rotation.x = -0.42;
  add(head, cyl(0.048, 0.054, 0.08, 10), skin, 0, 0.03, 0);
  const H = new THREE.Group(); H.position.set(0, 0.15, 0.02); head.add(H);
  add(H, sph(0.115, 12, 9), skin, 0, 0, 0, 0, 0, 0, 0.98, 1.05, 0.98);
  for (const s of [1, -1]) {
    add(H, sph(0.017, 8, 6), dark, 0.042 * s, 0.015, 0.105, 0, 0, 0, 1, 0.8, 0.6);
    add(H, cap(0.022, 0.05, 6), beardC, 0.048 * s, 0.045, 0.1, 0, 0, Math.PI / 2 - 0.35 * s, 1, 1, 0.8); // bushy brows
    add(H, sph(0.024, 8, 6), blush, 0.07 * s, -0.012, 0.09, 0, 0, 0, 1, 0.7, 0.5);
    add(H, sph(0.028, 8, 6), skin, 0.113 * s, 0.0, 0.0, 0, 0, 0, 0.5, 1, 0.8); // ears
    add(H, sph(0.05, 8, 6), beardC, 0.1 * s, -0.01, -0.04, 0, 0, 0.3 * s, 0.6, 1.0, 1.0); // side hair
  }
  add(H, sph(0.034, 10, 8), skin, 0, -0.01, 0.122, 0, 0, 0, 1, 1.1, 0.95); // big round nose
  // beard: a big grey mass from the cheeks down over the chest, with a moustache
  add(H, sph(0.11, 10, 7), beardC, 0, -0.1, 0.05, 0, 0, 0, 1.12, 1.0, 0.85);
  add(H, new THREE.ConeGeometry(0.1, 0.22, 10), beardC, 0, -0.24, 0.07, Math.PI + 0.3, 0, 0, 1.1, 1, 0.75);
  add(H, sph(0.06, 8, 6), beardDk, 0, -0.17, 0.11, 0, 0, 0, 1.2, 0.8, 0.6);
  for (const s of [1, -1]) add(H, cap(0.026, 0.06, 6), beardC, 0.04 * s, -0.045, 0.118, 0, 0, Math.PI / 2 + 0.4 * s);
  // straw hat: wide drooping brim, round crown, brown band, woven rings
  const hat = new THREE.Group(); hat.position.set(0, 0.075, -0.005); hat.rotation.x = -0.08; H.add(hat);
  add(hat, cyl(0.16, 0.33, 0.06, 24, true), straw, 0, 0.0, 0);
  add(hat, cyl(0.155, 0.325, 0.06, 24, true), strawDk, 0, -0.012, 0);
  add(hat, new THREE.TorusGeometry(0.33, 0.016, 4, 18), strawDk, 0, -0.03, 0, Math.PI / 2);
  add(hat, new THREE.TorusGeometry(0.25, 0.01, 3, 18), strawDk, 0, 0.0, 0, Math.PI / 2);
  add(hat, cyl(0.12, 0.14, 0.13, 16), straw, 0, 0.09, 0);
  add(hat, new THREE.SphereGeometry(0.12, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), straw, 0, 0.155, 0, 0, 0, 0, 1, 0.4, 1);
  add(hat, cyl(0.143, 0.146, 0.04, 16), band, 0, 0.05, 0);
  for (let i = 0; i < 2; i++) add(hat, new THREE.TorusGeometry(0.128 - i * 0.004, 0.006, 3, 16), strawDk, 0, 0.1 + i * 0.03, 0, Math.PI / 2);

  // ---- arms: white sleeves rolled to the elbow, bare forearms
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.2 * s, 0.34, 0);
    add(ua, sph(0.075, 10, 7), shirt, 0, -0.01, 0);
    add(ua, cap(0.068, 0.17, 8), shirt, 0, -0.13, 0);
    const la = J(ua, 0, -0.27, 0);
    add(la, cyl(0.078, 0.074, 0.08, 12), shirtDk, 0, -0.02, 0); // rolled cuff
    add(la, cap(0.045, 0.14, 8), skin, 0, -0.13, 0);
    add(la, sph(0.055, 10, 8), skin, 0, -0.255, 0.008, 0, 0, 0, 0.8, 1.1, 1);
    add(la, cap(0.02, 0.035, 6), skin, -0.04 * s, -0.24, 0.035, 0.5, 0, 0.5 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }
  arms.leftUpperArm.rotation.set(-0.2, 0, 0.12);
  arms.leftLowerArm.rotation.set(-0.35, 0, 0);
  arms.rightUpperArm.rotation.set(-0.35, 0, -0.25);
  arms.rightLowerArm.rotation.set(-0.6, 0, 0);

  // ---- rake, gripped in the right hand: built world-aligned so the head rests on the ground
  g.updateMatrixWorld(true);
  const grip = new THREE.Group(); grip.position.set(0, -0.255, 0.01); arms.rightLowerArm.add(grip);
  g.updateMatrixWorld(true);
  const gq = new THREE.Quaternion(); grip.getWorldQuaternion(gq); grip.quaternion.copy(gq.invert());
  g.updateMatrixWorld(true);
  const gp = new THREE.Vector3(); grip.getWorldPosition(gp);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const headAt = V(-0.12, 0.09 - gp.y, 0.42);          // rake head point, grip space (world axes)
  const dir = headAt.clone().normalize();
  const top = dir.clone().multiplyScalar(-0.16);
  rod(grip, top, headAt, 0.022, handleC, 7);
  add(grip, sph(0.026, 7, 5), handleC, top.x, top.y, top.z);
  // ferrule and iron head: a bar across, five tines down
  const ferr = headAt.clone().addScaledVector(dir, -0.07);
  rod(grip, ferr, headAt, 0.027, iron, 7);
  const rh = new THREE.Group(); rh.position.copy(headAt); rh.rotation.y = -0.25; grip.add(rh);
  add(rh, new THREE.BoxGeometry(0.34, 0.045, 0.05), iron, 0, 0, 0);
  for (let i = 0; i < 5; i++) add(rh, new THREE.CylinderGeometry(0.012, 0.008, 0.1, 6), iron, -0.14 + i * 0.07, -0.065, 0.012, 0.2, 0, 0);

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
