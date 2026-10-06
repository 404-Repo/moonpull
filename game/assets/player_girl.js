// player_girl, candidate A: primitives (spheres, capsules, cylinders, partial-sphere hood).
// 1.45 m, front +Z. Jointed: g.userData.joints, each joint a Group AT the pivot with geometry offset inside.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xe7b48f, null, 0.8);
  const hoodC = M(0x8a5636, 'fabric', 0.9);
  const hoodIn = M(0x5c3622, 'fabric', 0.9, { side: THREE.DoubleSide });
  const patch = M(0xa9714a, 'fabric', 0.9);
  const tunic = M(0x4c7d74, 'fabric', 0.88);
  const pants = M(0x7a4a32, 'fabric', 0.9);
  const leather = M(0x8c5a34, 'fabric', 0.75);
  const dark = M(0x2b1d16, null, 0.6);
  const white = M(0xf4eee2, null, 0.6);
  const hair = M(0x5a3826, 'fabric', 0.85);
  const lip = M(0xb06a5a, null, 0.8);
  const pack = M(0xb79773, 'fabric', 0.9);
  const roll = M(0x55703c, 'fabric', 0.9);
  const iron = M(0x3a3d40, 'metal', 0.6, { metalness: 0.4 });
  const moon = M(0x9fd8ff, null, 0.3, { emissive: 0x9fd8ff, emissiveIntensity: 1.3 });
  moon.name = 'moonstone';

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const sph = (r, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
  const cap = (r, len, rs = 8) => new THREE.CapsuleGeometry(r, len, 2, rs);
  const cyl = (rt, rb, h, s = 12, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);

  // ---- hips (pelvis), world y 0.64
  const hips = J(g, 0, 0.64, 0);
  add(hips, sph(0.14, 12, 8), pants, 0, 0.0, 0, 0, 0, 0, 1, 0.75, 0.8);
  // belt
  add(hips, cyl(0.135, 0.14, 0.05, 16), leather, 0, 0.05, 0, 0, 0, 0, 1, 1, 0.8);

  // ---- legs
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.075 * s, -0.03, 0);
    add(ul, cap(0.072, 0.14), pants, 0, -0.13, 0);
    if (s > 0) add(ul, new THREE.BoxGeometry(0.07, 0.07, 0.02), patch, 0.03, -0.16, 0.068, 0, 0.3, 0.2);
    const ll = J(ul, 0, -0.29, 0);
    add(ll, cap(0.064, 0.08), pants, 0, -0.06, 0);
    add(ll, sph(0.074, 10, 6), pants, 0, -0.14, 0, 0, 0, 0, 1, 0.6, 1); // blousy cuff
    add(ll, cyl(0.068, 0.062, 0.13, 12), leather, 0, -0.22, 0);
    add(ll, new THREE.TorusGeometry(0.068, 0.018, 5, 12), leather, 0, -0.16, 0, Math.PI / 2);
    add(ll, cap(0.06, 0.1, 10), leather, 0, -0.3, 0.035, Math.PI / 2, 0, 0, 1.05, 1, 0.9); // foot
    add(ll, new THREE.BoxGeometry(0.13, 0.04, 0.22), dark, 0, -0.335, 0.035); // sole
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.70
  const spine = J(hips, 0, 0.06, 0);
  // tunic: flared skirt + chest
  add(spine, cyl(0.135, 0.175, 0.22, 16), tunic, 0, 0.0, 0, 0, 0, 0, 1, 1, 0.8);
  add(spine, cyl(0.15, 0.135, 0.16, 16), tunic, 0, 0.18, 0, 0, 0, 0, 1, 1, 0.78);
  add(spine, sph(0.15, 12, 6), tunic, 0, 0.25, 0, 0, 0, 0, 1, 0.45, 0.78);
  // capelet (open cone) with patches and a tie
  add(spine, cyl(0.1, 0.235, 0.2, 18, true), hoodIn, 0, 0.23, 0, 0, 0, 0, 1, 1, 0.82);
  add(spine, cyl(0.105, 0.24, 0.2, 18, true), hoodC, 0, 0.23, 0.002, 0, 0, 0, 1.02, 1, 0.84);
  add(spine, new THREE.BoxGeometry(0.07, 0.06, 0.02), patch, 0.12, 0.2, 0.15, -0.4, 0.5, 0.2);
  add(spine, new THREE.BoxGeometry(0.06, 0.06, 0.02), patch, -0.17, 0.17, -0.06, 0, -1.4, 0);
  add(spine, new THREE.BoxGeometry(0.06, 0.012, 0.012).translate(0, 0, 0), leather, 0, 0.3, 0.12, 0, 0, 0.7);
  add(spine, new THREE.BoxGeometry(0.06, 0.012, 0.012), leather, 0, 0.3, 0.12, 0, 0, -0.7);
  // strap: left shoulder to right hip, and satchel
  add(spine, new THREE.BoxGeometry(0.045, 0.44, 0.025), leather, -0.02, 0.12, 0.165, 0.18, 0, -0.75);
  add(spine, new THREE.BoxGeometry(0.055, 0.05, 0.03), iron, 0.04, 0.19, 0.17, 0.18, 0, -0.75);
  add(spine, new THREE.BoxGeometry(0.16, 0.13, 0.08), leather, -0.18, -0.06, 0.06, 0, 0.5, 0);
  add(spine, new THREE.BoxGeometry(0.165, 0.06, 0.085), M(0x6e4428, 'fabric', 0.8), -0.18, -0.02, 0.062, 0, 0.5, 0);
  // backpack + bedroll
  add(spine, new THREE.BoxGeometry(0.26, 0.28, 0.13), pack, 0, 0.16, -0.17);
  add(spine, sph(0.13, 12, 8), pack, 0, 0.16, -0.2, 0, 0, 0, 1, 1.05, 0.45);
  add(spine, new THREE.BoxGeometry(0.17, 0.11, 0.04), M(0x9a7c58, 'fabric', 0.9), 0, 0.08, -0.245);
  add(spine, cyl(0.075, 0.075, 0.34, 14), roll, 0, 0.36, -0.19, 0, 0, Math.PI / 2);
  for (const s of [1, -1]) {
    add(spine, new THREE.TorusGeometry(0.045, 0.014, 5, 10), M(0x3f5a2e, 'fabric', 0.9), 0.17 * s, 0.36, -0.19, 0, Math.PI / 2, 0);
    add(spine, new THREE.TorusGeometry(0.077, 0.012, 4, 14), leather, 0.09 * s, 0.36, -0.19, 0, Math.PI / 2, 0);
  }

  // ---- head, neck at world y 1.02
  const head = J(spine, 0, 0.32, 0);
  add(head, cyl(0.045, 0.05, 0.08, 10), skin, 0, 0.02, 0);
  const H = new THREE.Group(); H.position.set(0, 0.17, 0.01); head.add(H);
  add(H, sph(0.15, 18, 12), skin, 0, 0, 0, 0, 0, 0, 1, 1.03, 0.97);
  for (const s of [1, -1]) {
    add(H, sph(0.037, 10, 6), white, 0.056 * s, 0.0, 0.126, 0, 0, 0, 0.9, 1.1, 0.5);
    add(H, sph(0.028, 10, 6), dark, 0.057 * s, -0.006, 0.14, 0, 0, 0, 0.9, 1.15, 0.45);
    add(H, new THREE.BoxGeometry(0.055, 0.014, 0.02), hair, 0.057 * s, 0.055, 0.13, 0, 0, -0.15 * s);
    add(H, sph(0.03, 8, 6), M(0xe59c86, null, 0.85), 0.085 * s, -0.055, 0.105, 0, 0, 0, 1, 0.6, 0.4);
  }
  add(H, sph(0.022, 10, 8), skin, 0, -0.035, 0.152, 0, 0, 0, 1, 1, 0.9);
  add(H, cap(0.009, 0.03, 6), M(0x8e4a3c, null, 0.8), 0, -0.088, 0.128, 0, 0, Math.PI / 2, 1, 1, 0.6);
  // hair: fringe + side locks
  add(H, new THREE.SphereGeometry(0.155, 14, 6, 0, Math.PI * 2, 0, 1.2), hair, 0, 0.012, -0.004);
  add(H, sph(0.055, 10, 8), hair, -0.045, 0.075, 0.115, 0.4, 0, 0.6, 1.5, 0.6, 0.55);
  add(H, sph(0.05, 10, 8), hair, 0.065, 0.075, 0.11, 0.4, 0, -0.5, 1.3, 0.6, 0.55);
  for (const s of [1, -1]) add(H, cap(0.035, 0.09, 8), hair, 0.125 * s, -0.04, 0.05, 0.1, 0, 0.12 * s);
  // hood: open partial sphere shell, outer + lining, peak at the back
  const hoodGeo = (r) => new THREE.SphereGeometry(r, 16, 10, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, 2.35);
  add(H, hoodGeo(0.19), hoodC, 0, 0.02, -0.015);
  add(H, hoodGeo(0.178), hoodIn, 0, 0.02, -0.012);
  add(H, new THREE.ConeGeometry(0.055, 0.085, 8), hoodC, 0, 0.12, -0.16, -0.75);
  // rolled hem along both edges of the hood opening (meridian arcs of the hood sphere)
  for (const phi of [0.95, -0.95]) {
    const rim = new THREE.TorusGeometry(0.188, 0.017, 5, 14, 2.35); rim.rotateZ(-0.78);
    add(H, rim, hoodC, 0, 0.02, -0.015, 0, phi - Math.PI / 2, 0);
  }
  add(H, new THREE.BoxGeometry(0.07, 0.06, 0.02), patch, 0.08, 0.13, -0.12, -0.7, 0.6, 0);
  add(H, new THREE.BoxGeometry(0.06, 0.05, 0.02), patch, -0.13, 0.03, 0.06, 0, -1.2, 0);
  // hood drape down the back of the neck
  add(H, cyl(0.12, 0.17, 0.14, 16, true), hoodC, 0, -0.17, -0.03, 0, 0, 0, 1, 1, 0.9);

  // ---- arms, shoulders at world y 0.97
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.165 * s, 0.26, 0);
    ua.rotation.z = 0.36 * s;
    add(ua, sph(0.06, 10, 8), tunic, 0, -0.01, 0);
    add(ua, cap(0.048, 0.13), tunic, 0, -0.1, 0);
    const la = J(ua, 0, -0.2, 0);
    add(la, cap(0.044, 0.1), tunic, 0, -0.06, 0);
    add(la, cyl(0.05, 0.05, 0.04, 10), M(0x3d675f, 'fabric', 0.9), 0, -0.13, 0);
    add(la, sph(0.042, 10, 8), skin, 0, -0.19, 0.005, 0, 0, 0, 0.8, 1.1, 0.95);
    add(la, cap(0.016, 0.03, 6), skin, -0.03 * s, -0.17, 0.03, 0.5, 0, 0.4 * s);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }

  // ---- lantern from the right hand
  const lantern = J(arms.rightLowerArm, 0, -0.2, 0.01);
  lantern.rotation.z = 0.36; // undo arm splay so it hangs plumb
  add(lantern, new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI), iron, 0, -0.03, 0, 0, 0, Math.PI);
  add(lantern, cyl(0.012, 0.05, 0.04, 10), iron, 0, -0.07, 0);
  add(lantern, cyl(0.055, 0.055, 0.015, 12), iron, 0, -0.095, 0);
  add(lantern, cyl(0.045, 0.045, 0.09, 12), moon, 0, -0.145, 0);
  add(lantern, cyl(0.055, 0.05, 0.03, 12), iron, 0, -0.2, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    add(lantern, new THREE.BoxGeometry(0.012, 0.1, 0.012), iron, Math.cos(a) * 0.05, -0.145, Math.sin(a) * 0.05);
  }

  g.userData.joints = { hips, spine, head, ...arms, ...legs, lantern };

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
