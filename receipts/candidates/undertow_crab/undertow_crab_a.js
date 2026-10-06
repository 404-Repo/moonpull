// undertow_crab, candidate A: primitives. Smooth crab from scaled spheres and capsules (sphere
// carapace, capsule limbs, sphere-chain abdomen); shell = an overturned boat assembled from
// individual plank boxes laid around a half-barrel (gaps between planks, a couple sprung),
// a half-cone bow, a boarded transom and a snapped rudder, crusted with barnacles and weed.
// ~9 m tall, ~12 m long, front +Z, crab's left = +X.
// Joints (Groups at pivots): body, shell (top-level), clawL/clawR (shoulder), clawLPincer/
// clawRPincer (dactyl hinge), eyeL/eyeR (stalk base), legL0..2/legR0..2 (body).
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.8, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra }); if (name) m.name = name; return m; };
  const red = M(0xc65a30, null, 0.7);
  const redDark = M(0x9c4128, null, 0.7);
  const tan = M(0xd9a173, null, 0.8);
  const pink = M(0xe9b6a4, null, 0.85);
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x7ff6ff, emissive: 0x7ff6ff, emissiveIntensity: 1.3, roughness: 0.3 }); eyeM.name = 'bosseye';
  const plank = M(0x7b5a3e, 'timber', 0.85);
  const teal = M(0x4f8582, 'timber', 0.85);
  const wet = M(0x4a3426, 'timber', 0.6, { side: THREE.DoubleSide });
  const cream = M(0xd9cfb6, 'stone', 0.85);
  const kelp = M(0x4f5a2c, 'foliage', 0.9, { side: THREE.DoubleSide });
  const coral = M(0xb5543a, null, 0.8);
  const V = (x, y, z) => new THREE.Vector3(x, y, z), Y = V(0, 1, 0);
  const add = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); p.add(m); return m; };
  const sph = new THREE.SphereGeometry(1, 12, 9), sphLo = new THREE.SphereGeometry(1, 8, 6);
  const limb = (p, a, b, r, mat) => { const d = b.clone().sub(a), L = d.length(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, L - r), 3, 8), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); p.add(m); return m; };
  const cone = (p, a, b, r, mat, seg = 7) => { const d = b.clone().sub(a), L = d.length(); const m = new THREE.Mesh(new THREE.ConeGeometry(r, L, seg), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); p.add(m); return m; };

  // ============ BODY ============
  const body = new THREE.Group(); body.position.set(0, 2.55, 0.9); body.scale.setScalar(1.2); g.add(body);
  const joints = { body };
  const cz = 1.85;
  add(body, sph, red, 0, 0.1, cz, 0, 0, 0, 1.4, 0.8, 1.35);              // carapace
  add(body, sph, redDark, 0, 0.45, cz + 0.2, 0, 0, 0, 1.0, 0.5, 1.0);     // raised cardiac plate
  add(body, sph, tan, 0, -0.3, cz, 0, 0, 0, 1.25, 0.45, 1.2);             // underside
  for (const s of [1, -1]) {
    add(body, sph, red, 0.75 * s, 0.35, cz + 0.6, 0, 0, 0, 0.55, 0.4, 0.6);  // gill lobes
    for (let i = 0; i < 3; i++) add(body, sphLo, tan, (0.55 + i * 0.3) * s, 0.6 - i * 0.12, cz + 0.95, 0, 0, 0, 0.09, 0.09, 0.09);
  }
  add(body, sph, tan, 0, -0.05, cz + 1.25, 0, 0, 0, 0.55, 0.42, 0.3);     // face
  for (const s of [1, -1]) {
    limb(body, V(0.2 * s, -0.25, cz + 1.4), V(0.32 * s, -0.8, cz + 1.65), 0.1, tan);
    limb(body, V(0.32 * s, -0.8, cz + 1.65), V(0.25 * s, -1.05, cz + 1.5), 0.08, red);
    limb(body, V(0.15 * s, 0.25, cz + 1.35), V(0.75 * s, 0.85, cz + 2.0), 0.05, red);
    limb(body, V(0.75 * s, 0.85, cz + 2.0), V(1.9 * s, 1.0, cz + 2.6), 0.035, redDark);
  }
  // abdomen: chain of soft spheres curling up and back into the shell
  const ab = [[0, -0.05, 0.6, 1.1], [0.05, 0.2, -0.4, 1.3], [0.15, 0.75, -1.5, 1.4], [0.3, 1.5, -2.45, 1.25], [0.4, 2.25, -2.9, 1.0], [0.4, 2.75, -2.45, 0.75], [0.3, 2.8, -1.85, 0.5]];
  for (const [x, y, z, r] of ab) add(body, sph, pink, x, y, z, 0, 0, 0, r * 1.12, r, r);
  for (let i = 0; i < ab.length - 1; i++) { const a = ab[i], b = ab[i + 1]; add(body, sphLo, tan, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.1, (a[2] + b[2]) / 2, 0, 0, 0, (a[3] + b[3]) * 0.42, 0.12, (a[3] + b[3]) * 0.3); }
  // eyes
  for (const s of [1, -1]) {
    const e = new THREE.Group(); e.position.set(0.38 * s, 0.6, 3.0); body.add(e);
    const top = V(0.26 * s, 1.15, 0.35);
    limb(e, V(0, 0, 0), top, 0.17, tan);
    add(e, new THREE.TorusGeometry(0.2, 0.07, 6, 12), red, top.x, top.y, top.z, Math.PI / 2 - 0.2, 0, 0);
    add(e, sph, eyeM, top.x, top.y + 0.3, top.z + 0.05, 0, 0, 0, 0.27, 0.36, 0.27);
    joints[s > 0 ? 'eyeL' : 'eyeR'] = e;
  }
  // legs
  const legZ = [1.95, 1.15, 0.35], legFwd = [0.6, 0.1, -0.45];
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    const j = new THREE.Group(); j.position.set(1.15 * s, -0.25, legZ[i]); j.rotation.y = -s * legFwd[i]; body.add(j);
    const k = 1 - i * 0.07;
    const p1 = V(0.95 * s * k, 0.4, 0), p2 = V(1.85 * s * k, 0.6, 0), p3 = V(2.75 * s * k, -0.85, 0), p4 = V(3.1 * s * k, -1.85, 0);
    limb(j, V(0, 0, 0), p1, 0.36, red); limb(j, p1, p2, 0.33, red); limb(j, p2, p3, 0.28, red);
    add(j, sphLo, redDark, p2.x, p2.y, p2.z, 0, 0, 0, 0.36, 0.34, 0.34);
    cone(j, p3, p4, 0.26, redDark);
    add(j, sphLo, tan, p1.x * 0.5 + p2.x * 0.5, 0.75, 0, 0, 0, 0, 0.12, 0.12, 0.12);
    joints[(s > 0 ? 'legL' : 'legR') + i] = j;
  }
  // claws: hand points +Z in its frame; dactyl on top opens with rotation.x < 0
  for (const s of [1, -1]) {
    const big = s < 0, k = big ? 1.15 : 0.68;
    const j = new THREE.Group(); j.position.set(1.05 * s, -0.25, 2.45); body.add(j);
    const p1 = V(0.85 * s, -0.3, 0.25), p2 = V(1.25 * s * (big ? 1.1 : 1), -0.35, 0.6);
    limb(j, V(0, 0, 0), p1, 0.36, red); limb(j, p1, p2, 0.38, red);
    add(j, sphLo, redDark, p1.x, p1.y, p1.z, 0, 0, 0, 0.42, 0.42, 0.42);
    const hand = new THREE.Group(); hand.position.copy(p2); hand.rotation.set(0.15, -(big ? 0.5 : 0.4) * s, 0); hand.scale.setScalar(k); j.add(hand);
    add(hand, sph, red, 0, 0, 0.75, 0, 0, 0, 0.5, 0.58, 0.9);          // palm
    add(hand, sph, tan, -0.25 * s, -0.08, 0.8, 0, 0, 0, 0.3, 0.45, 0.7); // pale inner palm
    for (let i = 0; i < 4; i++) add(hand, sphLo, cream, 0.3 * s, 0.35 - (i % 2) * 0.2, 0.4 + i * 0.3, 0, 0, 0, 0.08, 0.08, 0.08);
    // fixed finger: two cones bending up
    limb(hand, V(0, -0.3, 1.4), V(0, -0.35, 2.1), 0.24, red);
    cone(hand, V(0, -0.35, 2.1), V(0, -0.05, 2.85), 0.22, redDark);
    for (let i = 0; i < 3; i++) cone(hand, V(0, -0.15, 1.6 + i * 0.35), V(0, 0.05, 1.65 + i * 0.35), 0.06, cream, 4);
    const pin = new THREE.Group(); pin.position.set(0, 0.3, 1.35); hand.add(pin);
    add(pin, sphLo, redDark, 0, 0, 0, 0, 0, 0, 0.3, 0.28, 0.28);
    limb(pin, V(0, 0, 0), V(0, 0.08, 0.75), 0.24, red);
    cone(pin, V(0, 0.08, 0.75), V(0, -0.3, 1.5), 0.22, redDark);
    for (let i = 0; i < 3; i++) cone(pin, V(0, -0.1, 0.35 + i * 0.35), V(0, -0.3, 0.4 + i * 0.35), 0.06, cream, 4);
    joints[big ? 'clawR' : 'clawL'] = j; joints[big ? 'clawRPincer' : 'clawLPincer'] = pin;
  }

  // ============ SHELL: overturned boat from planks ============
  const shell = new THREE.Group(); shell.position.set(0, 3.75, 0.45); shell.rotation.x = -0.26; g.add(shell);
  joints.shell = shell;
  const L = 7.0, Rb = 2.7, Hs = 3.3, z0 = -L / 2, nP = 13;  // half-barrel: radius Rb across, height Hs
  const hull = new THREE.Group(); shell.add(hull);
  const surf = (th, z) => { const taper = z > 1.2 ? 1 - Math.pow((z - 1.2) / (L / 2 - 1.2 + 1.3), 2) * 0.55 : 1; return V(Math.cos(th) * Rb * taper, Math.sin(th) * Hs * taper, z); };
  let rnd = 3; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < nP; i++) {
    const th = (i + 0.5) / nP * Math.PI, dth = Math.PI / nP;
    // each plank: 3 straight sections following the bow taper
    const zs = [z0, -0.6, 1.2, L / 2 - 0.3 - (i % 3) * 0.15];
    for (let k = 0; k < 3; k++) {
      const a = surf(th, zs[k]), b = surf(th, zs[k + 1]);
      const w = Math.hypot(Math.cos(th + dth / 2) - Math.cos(th - dth / 2), Math.sin(th + dth / 2) - Math.sin(th - dth / 2)) * Math.max(Rb, Hs) * 0.92 * (k === 2 ? 0.8 : 1);
      const mat = (i === 6 || i < 1 || i > nP - 2) ? plank : (i % 4 === 0 ? plank : teal);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, b.distanceTo(a) + 0.05), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.lookAt(m.position.clone().add(b.clone().sub(a)));
      m.rotateZ(th - Math.PI / 2 + (R() - 0.5) * 0.04);
      if (i === 3 && k === 1) { m.rotateX(-0.12); m.position.addScaledVector(V(Math.cos(th), Math.sin(th), 0), 0.15); } // sprung plank
      hull.add(m);
    }
  }
  // inner lining, so the inside reads dark and wet rather than see-through
  add(hull, new THREE.CylinderGeometry(1, 1, L - 0.4, 14, 1, true, Math.PI / 2, Math.PI), wet, 0, 0, -0.1, Math.PI / 2, 0, 0, Rb - 0.15, 1, Hs - 0.15);
  // keel and stem
  limb(hull, V(0, Hs + 0.1, z0 - 0.1), V(0, Hs + 0.1, 1.2), 0.17, wet);
  limb(hull, V(0, Hs + 0.1, 1.2), V(0, Hs * 0.85 + 0.1, L / 2 - 0.3), 0.17, wet);
  limb(hull, V(0, Hs * 0.85 + 0.1, L / 2 - 0.3), V(0, 0.1, L / 2 + 0.9), 0.17, wet);
  // bow cap: half cone closing the nose
  add(hull, new THREE.ConeGeometry(Rb * 0.84, 1.2, 12, 1, true, Math.PI / 2, Math.PI), teal, 0, 0, L / 2 + 0.3, Math.PI / 2, 0, 0, 1, 1, Hs / Rb).material.side = THREE.DoubleSide;
  // gunwale rails
  for (const s of [1, -1]) { limb(hull, V(s * (Rb + 0.05), 0, z0), V(s * (Rb + 0.05), 0, 1.2), 0.14, redDark); limb(hull, V(s * (Rb + 0.05), 0, 1.2), V(s * 2.3, 0, L / 2 - 0.3), 0.14, redDark); limb(hull, V(s * 2.3, 0, L / 2 - 0.3), V(s * 0.15, 0, L / 2 + 0.85), 0.14, redDark); }
  // transom: vertical boards
  for (let i = -4; i <= 4; i++) { const x = i * Rb / 4.5; const h = Math.sqrt(Math.max(0, 1 - (x / Rb) ** 2)) * Hs; add(hull, new THREE.BoxGeometry(Rb / 4.5 - 0.06, h, 0.14), i % 3 ? plank : teal, x, h / 2, z0 - 0.02); }
  // broken rudder
  add(hull, new THREE.BoxGeometry(0.16, 1.4, 0.8), plank, 0, Hs + 0.5, z0 - 0.4, 0.2, 0, 0.12);
  add(hull, new THREE.ConeGeometry(0.42, 0.5, 4), plank, 0.05, Hs + 1.35, z0 - 0.45, 0, Math.PI / 4, 0.4, 0.4, 1, 1.4);
  // barnacles, weed, kelp, coral
  const barn = new THREE.CylinderGeometry(0.08, 0.2, 0.24, 7);
  const place = (geo, mat, th, z, lift, sc) => { const p = surf(th, z), n = V(Math.cos(th), Math.sin(th) * Rb / Hs, 0).normalize(); const m = new THREE.Mesh(geo, mat); m.position.copy(p).addScaledVector(n, lift); m.quaternion.setFromUnitVectors(Y, n); m.scale.set(...sc); hull.add(m); return m; };
  for (const [th, z] of [[1.2, 0.5], [2.2, -1.5], [0.6, -2.4], [1.8, 1.6], [2.6, 0.2], [0.9, -0.8], [1.5, -2.8], [2.0, 2.4]]) for (let i = 0; i < 4; i++) { const s = 0.7 + R() * 0.7; place(barn, cream, th + (R() - 0.5) * 0.15, z + (R() - 0.5) * 0.5, 0.15, [s, s, s]); }
  for (const [th, z, w] of [[1.4, -0.5, 0.9], [2.4, 1.2, 0.7], [0.7, 0.8, 0.8], [1.9, -2.5, 0.75], [1.1, 2.3, 0.6]]) place(new THREE.IcosahedronGeometry(1, 1), kelp, th, z, 0.08, [w, 0.1, w * 1.5]);
  const ribbon = (len, w) => { const geo = new THREE.PlaneGeometry(w, len, 1, 6); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + len / 2; p.setXYZ(i, p.getX(i) * (1 - 0.6 * y / len), y, Math.sin(y * 2.2) * 0.18 * y / len + 0.1 * y * y / len); } geo.computeVertexNormals(); return geo; };
  for (const [th, z, len] of [[1.5, 0.9, 1.9], [1.65, 1.2, 1.4], [1.45, -1.9, 1.6], [1.2, -1.2, 1.2], [2.0, 0.2, 1.1]]) { place(ribbon(len, 0.32), kelp, th, z, 0.1, [1, 1, 1]).rotateY(R() * 3); place(ribbon(len * 0.7, 0.26), kelp, th + 0.05, z + 0.15, 0.1, [1, 1, 1]).rotateY(R() * 3); }
  for (const [x, z] of [[2.7, -0.5], [-2.7, 0.8], [2.7, 1.5]]) { const m = new THREE.Mesh(ribbon(1.5, 0.35), kelp); m.position.set(x, 0, z); m.rotation.set(Math.PI, 0, 0); hull.add(m); }
  for (const [th, z] of [[1.0, 1.4], [2.3, -2.0]]) { const p = surf(th, z); const cg = new THREE.Group(); cg.position.copy(p); hull.add(cg); limb(cg, V(0, 0, 0), V(0, 0.5, 0), 0.07, coral); for (const [x, zz] of [[0.25, 0.05], [-0.2, 0.15], [0.05, -0.25]]) limb(cg, V(0, 0.3, 0), V(x, 0.7, zz), 0.055, coral); }

  g.userData.joints = joints;

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
