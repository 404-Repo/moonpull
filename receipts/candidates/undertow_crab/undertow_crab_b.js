// undertow_crab, candidate B: profiles and sweeps. Shell = an overturned hull swept as a
// half-lathe spindle along Z, split into lapped strake bands (each band its own lathe, stepped
// out a little, so the planking reads as clinker), tube gunwale and keel, half-disc transom,
// snapped rudder. Crab: lathe dome carapace, lathe spindle leg segments, chelae extruded from a
// toothed side outline with a bevel, abdomen as a chain of lathe barrels along a curl.
// ~9 m tall, ~12 m long, front +Z, crab's left = +X.
// Joints (Groups at pivots): body, shell (top-level), clawL/clawR (shoulder), clawLPincer/
// clawRPincer (dactyl hinge), eyeL/eyeR (stalk base), legL0..2/legR0..2 (body).
export default function (THREE) {
  const g = new THREE.Group();
  const D = THREE.DoubleSide;
  const M = (color, name, rough = 0.78, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra }); if (name) m.name = name; return m; };
  const red = M(0xc65a30, null, 0.72);
  const redDark = M(0x9e4329, null, 0.72);
  const tan = M(0xd9a173, null, 0.8);
  const pink = M(0xe9b6a4, null, 0.85);
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x7ff6ff, emissive: 0x7ff6ff, emissiveIntensity: 1.3, roughness: 0.3 }); eyeM.name = 'bosseye';
  const slate = M(0x55687a, 'timber', 0.85, { side: D, flatShading: true });
  const wood = M(0x7b5a3e, 'timber', 0.85, { side: D, flatShading: true });
  const clay = M(0xb5543a, 'timber', 0.8, { side: D });
  const wet = M(0x4a3426, 'timber', 0.6, { side: D });
  const cream = M(0xd9cfb6, 'stone', 0.85);
  const kelp = M(0x4f5a2c, 'foliage', 0.9, { side: D });
  const V = (x, y, z) => new THREE.Vector3(x, y, z), Y = V(0, 1, 0);
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const add = (p, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz); p.add(m); return m; };
  // a lathe spindle between two points: bulged in the middle, r0 at a, r1 at b
  const spindle = (p, a, b, r0, r1, mat, bulge = 1.12, seg = 8) => {
    const d = b.clone().sub(a), L = d.length(), rm = (r0 + r1) / 2 * bulge;
    const pts = [V2(0.001, 0), V2(r0 * 0.85, 0.02 * L), V2(r0, 0.12 * L), V2(rm, 0.5 * L), V2(r1, 0.88 * L), V2(r1 * 0.85, 0.98 * L), V2(0.001, L)];
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, seg), mat);
    m.position.copy(a); m.quaternion.setFromUnitVectors(Y, d.normalize()); p.add(m); return m;
  };
  const point = (p, a, b, r, mat) => { const d = b.clone().sub(a), L = d.length(); const pts = [V2(0.001, 0), V2(r, 0.05 * L), V2(r * 0.95, 0.4 * L), V2(r * 0.5, 0.8 * L), V2(0.001, L)]; const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 7), mat); m.position.copy(a); m.quaternion.setFromUnitVectors(Y, d.normalize()); p.add(m); return m; };

  // ============ BODY ============
  const body = new THREE.Group(); body.position.set(0, 2.55, 0.9); body.scale.setScalar(1.2); g.add(body);
  const joints = { body };
  const cz = 1.85;
  {
    // carapace: lathe dome with a lip, squashed to an oval; grooved by a second, smaller dome
    const prof = [V2(0.001, -0.55), V2(0.8, -0.5), V2(1.0, -0.3), V2(1.04, -0.1), V2(1.0, 0.02), V2(0.95, 0.12), V2(0.82, 0.38), V2(0.6, 0.6), V2(0.3, 0.74), V2(0.001, 0.78)];
    add(body, new THREE.LatheGeometry(prof, 18), red, 0, 0.05, cz, 0, 0, 0, 1.4, 1, 1.32);
    add(body, new THREE.LatheGeometry([V2(0.001, 0), V2(0.5, 0.0), V2(0.48, 0.12), V2(0.3, 0.24), V2(0.001, 0.28)], 10), redDark, 0, 0.55, cz + 0.25, 0, 0, 0, 1.4, 1, 1.2);
    add(body, new THREE.TorusGeometry(1.03, 0.07, 4, 24), redDark, 0, -0.05, cz, Math.PI / 2, 0, 0, 1.4, 1.32, 1);
    for (const s of [1, -1]) for (let i = 0; i < 4; i++) point(body, V((0.45 + i * 0.25) * s, 0.55 - i * 0.14, cz + 0.85 + i * 0.07), V((0.5 + i * 0.28) * s, 0.8 - i * 0.12, cz + 1.0 + i * 0.07), 0.07, tan);
    add(body, new THREE.LatheGeometry([V2(0.001, -0.3), V2(0.4, -0.25), V2(0.5, 0), V2(0.35, 0.25), V2(0.001, 0.3)], 8), tan, 0, -0.05, cz + 1.3, Math.PI / 2, 0, 0, 1.2, 0.6, 1);
    for (const s of [1, -1]) {
      spindle(body, V(0.2 * s, -0.25, cz + 1.4), V(0.32 * s, -0.8, cz + 1.65), 0.1, 0.09, tan);
      spindle(body, V(0.32 * s, -0.8, cz + 1.65), V(0.25 * s, -1.05, cz + 1.5), 0.09, 0.05, red);
      spindle(body, V(0.15 * s, 0.25, cz + 1.35), V(0.75 * s, 0.85, cz + 2.0), 0.06, 0.045, red, 1, 5);
      spindle(body, V(0.75 * s, 0.85, cz + 2.0), V(1.9 * s, 1.0, cz + 2.6), 0.045, 0.015, redDark, 1, 5);
    }
  }
  // abdomen: lathe barrels strung along a curl, each one a soft segment
  {
    const curve = new THREE.CatmullRomCurve3([V(0, -0.1, 1.0), V(0.05, 0.2, -0.3), V(0.2, 0.9, -1.6), V(0.35, 1.7, -2.6), V(0.45, 2.45, -3.0), V(0.4, 2.9, -2.5), V(0.25, 2.85, -1.8)]);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, a = curve.getPointAt(t0), b = curve.getPointAt(t1);
      const r = (t) => Math.max(0.3, t < 0.12 ? 1.0 + t * 3 : 1.4 - (t - 0.12) * 1.25);
      const s = spindle(body, a.clone().addScaledVector(b.clone().sub(a), -0.12), b.clone().addScaledVector(b.clone().sub(a), 0.12), r(t0) * 0.9, r(t1) * 0.9, i % 2 ? pink : pink, 1.18, 12);
      s.scale.set(1.12, 1, 1);
      if (i < 4) { const m = add(body, new THREE.TorusGeometry(r(t0) * 0.98, 0.06, 4, 14), tan, a.x, a.y, a.z); m.quaternion.setFromUnitVectors(V(0, 0, 1), b.clone().sub(a).normalize()); }
    }
    const pe = curve.getPointAt(1);
    for (const s of [1, -1]) add(body, new THREE.LatheGeometry([V2(0.001, 0), V2(0.3, 0.1), V2(0.25, 0.4), V2(0.001, 0.5)], 6), redDark, pe.x + 0.25 * s, pe.y - 0.1, pe.z + 0.1, 1.2, 0, 0.3 * s);
  }
  // eyes
  for (const s of [1, -1]) {
    const e = new THREE.Group(); e.position.set(0.38 * s, 0.6, 3.0); body.add(e);
    const top = V(0.26 * s, 1.15, 0.35);
    spindle(e, V(0, 0, 0), top, 0.2, 0.15, tan, 0.95);
    add(e, new THREE.TorusGeometry(0.19, 0.07, 5, 10), red, top.x, top.y, top.z, Math.PI / 2 - 0.2, 0, 0);
    add(e, new THREE.LatheGeometry([V2(0.001, -0.3), V2(0.2, -0.24), V2(0.28, 0), V2(0.22, 0.25), V2(0.001, 0.36)], 10), eyeM, top.x, top.y + 0.3, top.z + 0.05);
    joints[s > 0 ? 'eyeL' : 'eyeR'] = e;
  }
  // legs: lathe spindles, knuckles at the joints
  const legZ = [1.95, 1.15, 0.35], legFwd = [0.6, 0.1, -0.45];
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    const j = new THREE.Group(); j.position.set(1.15 * s, -0.25, legZ[i]); j.rotation.y = -s * legFwd[i]; body.add(j);
    const k = 1 - i * 0.07;
    const p1 = V(0.95 * s * k, 0.4, 0), p2 = V(1.85 * s * k, 0.6, 0), p3 = V(2.75 * s * k, -0.85, 0), p4 = V(3.1 * s * k, -1.85, 0);
    spindle(j, V(0, 0, 0), p1, 0.38, 0.34, red); spindle(j, p1, p2, 0.36, 0.33, red, 1.2); spindle(j, p2, p3, 0.32, 0.25, red, 1.15);
    point(j, p3, p4, 0.24, redDark);
    point(j, p1.clone().lerp(p2, 0.5).add(V(0, 0.3, 0)), p1.clone().lerp(p2, 0.5).add(V(0.05 * s, 0.6, 0)), 0.07, tan);
    joints[(s > 0 ? 'legL' : 'legR') + i] = j;
  }
  // claws: side outline extruded across X with a bevel. Hand points +Z; the dactyl hinges on top
  // and opens with rotation.x < 0.
  const extrudeYZ = (pts, depth, mat, parent) => {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * 0.35, bevelSize: 0.12, bevelSegments: 2, curveSegments: 4 });
    geo.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(geo, mat); m.rotation.y = -Math.PI / 2; parent.add(m); return m;
  };
  for (const s of [1, -1]) {
    const big = s < 0, k = big ? 1.15 : 0.68;
    const j = new THREE.Group(); j.position.set(1.05 * s, -0.25, 2.45); body.add(j);
    const p1 = V(0.85 * s, -0.3, 0.25), p2 = V(1.25 * s * (big ? 1.1 : 1), -0.35, 0.6);
    spindle(j, V(0, 0, 0), p1, 0.38, 0.36, red); spindle(j, p1, p2, 0.36, 0.42, red, 1.2);
    const hand = new THREE.Group(); hand.position.copy(p2); hand.rotation.set(0.15, -(big ? 0.5 : 0.4) * s, 0); hand.scale.setScalar(k); j.add(hand);
    // palm + fixed finger outline (z forward, y up), teeth along the upper edge of the finger
    extrudeYZ([[0, -0.35], [0.3, -0.55], [1.2, -0.6], [1.9, -0.55], [2.5, -0.35], [2.85, -0.05], [2.7, -0.1], [2.55, 0.0], [2.4, -0.15], [2.2, -0.05], [2.05, -0.2], [1.85, -0.1], [1.7, -0.22], [1.45, -0.05], [1.4, 0.35], [1.1, 0.55], [0.4, 0.55], [0, 0.35]], 0.55, red, hand);
    add(hand, new THREE.LatheGeometry([V2(0.001, 0), V2(0.45, 0.1), V2(0.55, 0.6), V2(0.45, 1.1), V2(0.001, 1.25)], 8), tan, -0.15 * s, 0, 0.1, Math.PI / 2, 0, 0, 0.8, 1, 0.9);
    for (let i = 0; i < 3; i++) add(hand, new THREE.SphereGeometry(0.08, 5, 4), cream, 0.38 * s, 0.25 - i * 0.2, 0.5 + i * 0.3);
    const pin = new THREE.Group(); pin.position.set(0, 0.35, 1.35); hand.add(pin);
    extrudeYZ([[0, -0.2], [0.3, -0.25], [0.45, -0.12], [0.65, -0.25], [0.85, -0.12], [1.05, -0.25], [1.25, -0.2], [1.5, -0.45], [1.45, -0.05], [1.1, 0.25], [0.5, 0.35], [0, 0.25]], 0.45, redDark, pin);
    joints[big ? 'clawR' : 'clawL'] = j; joints[big ? 'clawRPincer' : 'clawLPincer'] = pin;
  }

  // ============ SHELL: half-lathe hull in lapped strake bands ============
  const shell = new THREE.Group(); shell.position.set(0, 3.75, 0.45); shell.rotation.x = -0.26; g.add(shell);
  joints.shell = shell;
  const L = 7.4, Rb = 2.75, Hs = 3.3;
  // profile along the length: radius (in Rb units) at each station, stern (-L/2) to bow (+L/2)
  const stations = [[-L / 2, 0.8], [-L / 2 + 0.6, 0.92], [-1.5, 1.0], [0.3, 1.0], [1.7, 0.93], [2.6, 0.75], [3.2, 0.48], [L / 2, 0.08]];
  const prof = stations.map(([z, r]) => V2(r, z));
  const nb = 6, dphi = Math.PI / 2 / nb;
  for (let k = 0; k < nb; k++) {
    const grow = 1 + 0.022 * (nb - 1 - k);           // bands nearer the keel sit proud (lapped)
    const mat = k === 0 ? clay : k < 4 ? slate : wood;
    for (const side of [0, 1]) {
      const phiStart = side === 0 ? Math.PI / 2 + k * dphi : 3 * Math.PI / 2 - (k + 1) * dphi;
      const geo = new THREE.LatheGeometry(prof.map((p) => V2(p.x * grow, p.y)), 3, phiStart, dphi);
      add(shell, geo, mat, 0, 0, 0, Math.PI / 2, 0, 0, Rb, 1, Hs);
    }
  }
  // dark wet inside
  add(shell, new THREE.LatheGeometry(prof.map((p) => V2(p.x * 0.95, p.y)), 10, Math.PI / 2, Math.PI), wet, 0, 0, 0, Math.PI / 2, 0, 0, Rb, 1, Hs);
  const hullPt = (z, phi, grow = 1) => { let r = 0; for (let i = 0; i < stations.length - 1; i++) { const [za, ra] = stations[i], [zb, rb] = stations[i + 1]; if (z >= za && z <= zb) r = ra + (rb - ra) * (z - za) / (zb - za); } return V(Math.sin(phi) * r * Rb * grow, -Math.cos(phi) * r * Hs * grow, z); };
  // gunwale and keel as swept tubes
  for (const s of [1, -1]) { const pts = []; for (let i = 0; i <= 12; i++) { const z = -L / 2 + i * L / 12; pts.push(hullPt(z, s > 0 ? Math.PI / 2 : 3 * Math.PI / 2, 1.04)); } shell.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.13, 5, false), clay)); }
  { const pts = []; for (let i = 0; i <= 12; i++) { const z = -L / 2 + i * (L - 0.05) / 12; pts.push(hullPt(z, Math.PI, 1.12)); } pts.push(V(0, 0.2, L / 2 + 0.3)); shell.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.16, 6, false), wet)); }
  // transom: half disc
  add(shell, new THREE.CircleGeometry(1, 14, 0, Math.PI), wood, 0, 0, -L / 2 - 0.01, 0, Math.PI, 0, 0.8 * Rb * 1.1, 0.8 * Hs * 1.1, 1).material = wood;
  // snapped rudder
  add(shell, new THREE.BoxGeometry(0.16, 1.4, 0.8), wood, 0, 0.8 * Hs + 0.4, -L / 2 - 0.4, 0.2, 0, 0.12);
  add(shell, new THREE.ConeGeometry(0.42, 0.5, 4), wood, 0.05, 0.8 * Hs + 1.25, -L / 2 - 0.45, 0, Math.PI / 4, 0.4, 0.4, 1, 1.4);
  // crust
  let rnd = 11; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const place = (geo, mat, z, phi, lift, sc) => { const p = hullPt(z, phi, 1.13), n = V(Math.sin(phi) / Rb, -Math.cos(phi) / Hs, 0).normalize(); const m = new THREE.Mesh(geo, mat); m.position.copy(p).addScaledVector(n, lift); m.quaternion.setFromUnitVectors(Y, n); m.scale.set(...sc); shell.add(m); return m; };
  const barn = new THREE.LatheGeometry([V2(0.2, 0), V2(0.17, 0.12), V2(0.1, 0.22), V2(0.06, 0.2), V2(0.04, 0.12)], 7);
  for (const [z, ph] of [[0.5, 2.2], [-1.5, 3.6], [-2.6, 2.6], [1.6, 3.9], [0.2, 4.2], [-0.8, 2.0], [-2.9, 3.0], [2.4, 2.9]]) for (let i = 0; i < 4; i++) { const s = 0.8 + R() * 0.7; place(barn, cream, z + (R() - 0.5) * 0.5, ph + (R() - 0.5) * 0.2, 0, [s, s, s]); }
  for (const [z, ph, w] of [[-0.5, 2.8, 0.9], [1.2, 3.6, 0.7], [0.8, 2.3, 0.8], [-2.5, 3.5, 0.75], [2.3, 3.2, 0.6]]) place(new THREE.IcosahedronGeometry(1, 1), kelp, z, ph, 0.02, [w, 0.1, w * 1.5]);
  const ribbon = (len, w) => { const geo = new THREE.PlaneGeometry(w, len, 1, 6); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + len / 2; p.setXYZ(i, p.getX(i) * (1 - 0.6 * y / len), y, Math.sin(y * 2.2) * 0.18 * y / len + 0.1 * y * y / len); } geo.computeVertexNormals(); return geo; };
  for (const [z, ph, len] of [[0.9, 3.05, 1.9], [1.2, 3.3, 1.4], [-1.9, 3.1, 1.6], [-1.2, 2.8, 1.2], [0.2, 3.5, 1.1]]) { place(ribbon(len, 0.32), kelp, z, ph, 0, [1, 1, 1]).rotateY(R() * 3); place(ribbon(len * 0.7, 0.26), kelp, z + 0.15, ph + 0.05, 0, [1, 1, 1]).rotateY(R() * 3); }
  for (const [x, z] of [[2.8, -0.5], [-2.8, 0.8], [2.7, 1.5]]) { const m = new THREE.Mesh(ribbon(1.5, 0.35), kelp); m.position.set(x, 0, z); m.rotation.set(Math.PI, 0, 0); shell.add(m); }
  for (const [z, ph] of [[1.4, 2.5], [-2.0, 3.9]]) { const cg = new THREE.Group(); cg.position.copy(hullPt(z, ph, 1.1)); shell.add(cg); spindle(cg, V(0, 0, 0), V(0, 0.5, 0), 0.08, 0.06, clay, 1, 5); for (const [x, zz] of [[0.25, 0.05], [-0.2, 0.15], [0.05, -0.25]]) spindle(cg, V(0, 0.3, 0), V(x, 0.7, zz), 0.06, 0.04, clay, 1, 5); }

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
