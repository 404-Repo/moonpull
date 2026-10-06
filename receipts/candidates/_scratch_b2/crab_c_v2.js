// shore_crab, candidate C: different breakdown. A hand-built faceted carapace (BufferGeometry from a
// crenellated top-view outline lofted through rings, flat shaded like a painted bevel), chunky
// flat-shaded leg segments with knuckle nubs, and blocky claws (faceted palm, wedge fingers).
// 0.5 m across, front (eyes, claws) +Z, left = +X.
// Jointed: userData.joints = { body, clawL, clawR, legL0..3, legR0..3 }, each a Group AT its pivot
// on the shell edge. Claw raise: rotation.z (+ clawL, - clawR). Leg lift: rotation.z; swing: rotation.y.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough = 0.75) => new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true });
  const shellM = M(0xd2643a, 0.7);
  const shellDark = M(0xb24e2c, 0.7);
  const belly = M(0xe3a978, 0.8);
  const legM = M(0xc9602f, 0.72);
  const tipM = M(0x9b4424, 0.7);
  const cream = M(0xd9cfb6, 0.85); cream.name = 'stone';
  const black = new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 0.35 });
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const Y = V(0, 1, 0);
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const seg = (parent, a, b, r0, r1, mat, flat = 0.75) => {
    const d = b.clone().sub(a); const L = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, L, 5, 1), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(Y, d.normalize());
    m.scale.set(1, 1, flat); m.castShadow = true; parent.add(m); return m;
  };

  // ---- carapace: crenellated outline lofted through rings
  const K = 24, RX = 0.135, RZ = 0.103;
  const outline = [];
  for (let k = 0; k < K; k++) {
    const t = (k / K) * Math.PI * 2; const sx = Math.sin(t), cz = Math.cos(t);
    let f = 1; if (cz > 0.0 && Math.abs(sx) > 0.3) f = k % 2 ? 1.08 : 0.97; // front-side teeth
    if (cz > 0.92) f = 0.9; // flattened front between the eyes
    outline.push([sx * RX * f, cz * RZ * f]);
  }
  const rings = [[-0.027, 0.82], [-0.007, 1.0], [0.01, 1.0], [0.036, 0.84], [0.056, 0.55]];
  const pos = [];
  const P = (r, k) => { const [x, z] = outline[k % K]; const [y, s] = rings[r]; return [x * s, y, z * s]; };
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  for (let r = 0; r < rings.length - 1; r++) for (let k = 0; k < K; k++) {
    const a = P(r, k), b = P(r, k + 1), c = P(r + 1, k + 1), d = P(r + 1, k);
    tri(a, b, c); tri(a, c, d);
  }
  const top = [0, 0.066, -0.005], bot = [0, -0.032, 0];
  for (let k = 0; k < K; k++) { tri(P(rings.length - 1, k), P(rings.length - 1, k + 1), top); tri(P(0, k + 1), P(0, k), bot); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.computeVertexNormals();
  const body = new THREE.Group(); body.position.set(0, 0.085, 0); g.add(body);
  const shell = add(body, cg, shellM);
  // fix winding if the first top-fan triangle faces down
  {
    const i0 = (rings.length - 1) * K * 6 * 3; const a = V(pos[i0], pos[i0 + 1], pos[i0 + 2]), b = V(pos[i0 + 3], pos[i0 + 4], pos[i0 + 5]), c = V(pos[i0 + 6], pos[i0 + 7], pos[i0 + 8]);
    const n = b.clone().sub(a).cross(c.clone().sub(a));
    if (n.y < 0) { cg.index = null; const p = cg.attributes.position; for (let i = 0; i < p.count; i += 3) { const x = p.getX(i + 1), y = p.getY(i + 1), z = p.getZ(i + 1); p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2)); p.setXYZ(i + 2, x, y, z); } cg.computeVertexNormals(); }
  }
  // belly plate and a darker rim band
  add(body, new THREE.CylinderGeometry(0.096, 0.078, 0.02, 10), belly, 0, -0.029, -0.005, 0, 0, 0, 1.2, 1, 0.95);
  add(body, new THREE.CylinderGeometry(1, 1, 0.012, 20, 1, true), shellDark, 0, 0.001, 0, 0, 0, 0, RX * 1.005, 1, RZ * 1.005).material.side = THREE.DoubleSide;
  // raised lobes
  for (const s of [1, -1]) add(body, new THREE.DodecahedronGeometry(1, 0), shellM, 0.048 * s, 0.045, -0.018, 0, 0.4 * s, 0, 0.044, 0.02, 0.04);
  // barnacles: faceted cones with a dark hole
  const spots = [[0.044, 0.03, 1], [-0.06, 0.005, 1.2], [0.078, -0.035, 0.8], [-0.026, -0.052, 1], [0.013, 0.056, 0.8], [-0.087, -0.03, 0.8], [0.095, 0.022, 0.7], [-0.04, 0.044, 1.3], [0.04, -0.06, 0.8]];
  for (const [x, z, k] of spots) {
    const rr = Math.max(Math.abs(x) / RX, Math.abs(z) / RZ, Math.hypot(x / RX, z / RZ));
    const y = rr > 0.84 ? 0.01 + (1 - rr) / 0.16 * 0.026 : rr > 0.55 ? 0.036 + (0.84 - rr) / 0.29 * 0.02 : 0.056 + (0.55 - rr) / 0.55 * 0.01;
    add(body, new THREE.CylinderGeometry(0.005 * k, 0.011 * k, 0.012 * k, 6), cream, x, y + 0.004, z, -z * 3, 0, x * 3);
  }
  // eye stalks
  for (const s of [1, -1]) {
    seg(body, V(0.024 * s, 0.022, 0.085), V(0.032 * s, 0.078, 0.098), 0.01, 0.008, legM, 1);
    add(body, new THREE.SphereGeometry(0.015, 8, 6), black, 0.032 * s, 0.086, 0.1, 0, 0, 0, 0.9, 1.25, 0.9);
  }
  add(body, new THREE.BoxGeometry(0.045, 0.022, 0.02), belly, 0, -0.012, 0.088);

  const joints = { body };
  // ---- legs
  const legZ = [0.04, 0.01, -0.02, -0.05], legFwd = [0.5, 0.15, -0.2, -0.55];
  const knuckle = new THREE.DodecahedronGeometry(0.017, 0);
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) {
    const j = new THREE.Group();
    const ex = Math.sqrt(Math.max(1 - (legZ[i] / RZ) ** 2, 0)) * RX * 0.9;
    j.position.set(ex * s, -0.012, legZ[i]); j.rotation.y = -s * legFwd[i]; body.add(j);
    const k = 1 - i * 0.05;
    const p1 = V(0.05 * s * k, 0.03, 0), p2 = V(0.11 * s * k, 0.045, 0), p3 = V(0.14 * s * k, -0.075, 0);
    seg(j, V(0, 0, 0), p1, 0.019, 0.018, legM);
    seg(j, p1, p2, 0.018, 0.016, legM);
    add(j, knuckle, legM, p2.x, p2.y, p2.z, 0, 0, 0, 1, 0.9, 0.8);
    seg(j, p2, p3, 0.016, 0.004, tipM);
    joints[(s > 0 ? 'legL' : 'legR') + i] = j;
  }
  // ---- claws
  for (const s of [1, -1]) {
    const j = new THREE.Group(); j.position.set(0.08 * s, 0.0, 0.065); body.add(j);
    const p1 = V(0.05 * s, 0.018, 0.045), p2 = V(0.075 * s, 0.07, 0.07);
    seg(j, V(0, 0, 0), p1, 0.022, 0.02, legM, 0.85);
    add(j, new THREE.DodecahedronGeometry(0.022, 0), legM, p1.x, p1.y, p1.z);
    seg(j, p1, p2, 0.022, 0.026, legM, 0.85);
    const hand = new THREE.Group(); hand.position.copy(p2); hand.rotation.set(-0.35, 0.4 * s, -0.3 * s); hand.scale.setScalar(1.25); j.add(hand);
    add(hand, new THREE.DodecahedronGeometry(1, 0), shellM, 0, 0.045, 0, 0, 0, 0, 0.04, 0.058, 0.03);
    add(hand, new THREE.DodecahedronGeometry(1, 0), belly, -0.014 * s, 0.04, 0.012, 0, 0, 0, 0.022, 0.035, 0.02);
    add(hand, new THREE.ConeGeometry(0.018, 0.075, 4), shellDark, 0.013 * s, 0.12, 0, 0, Math.PI / 4, -0.2 * s, 1, 1, 0.7);
    add(hand, new THREE.ConeGeometry(0.016, 0.07, 4), shellDark, -0.02 * s, 0.115, 0, 0, Math.PI / 4, 0.32 * s, 1, 1, 0.7);
    joints[s > 0 ? 'clawL' : 'clawR'] = j;
  }
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
