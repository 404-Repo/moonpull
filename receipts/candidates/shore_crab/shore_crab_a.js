// shore_crab, candidate A: primitives. Ellipsoid shell halves with a rim lip and front teeth,
// capsule/cylinder leg segments, sphere-and-cone claws. 0.5 m across, front (eyes, claws) +Z.
// Jointed: userData.joints = { body, clawL, clawR, legL0..3, legR0..3 }. Every leg and claw is a
// Group placed AT the shell edge (its pivot) with geometry offset inside. Left = +X.
// Claw raise: rotation.z (+ for clawL, - for clawR). Leg lift: rotation.z (+ left, - right);
// leg swing fore/aft: rotation.y.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough = 0.75, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
  const shellM = M(0xd2643a, 0.7);
  const shellDark = M(0xb24e2c, 0.7);
  const belly = M(0xe3a978, 0.8);
  const legM = M(0xc9602f, 0.72);
  const legTip = M(0x9b4424, 0.7);
  const cream = M(0xd9cfb6, 0.85); cream.name = 'stone';
  const black = M(0x1a1512, 0.35);

  const Y = new THREE.Vector3(0, 1, 0);
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const seg = (parent, a, b, r0, r1, mat, rs = 5) => {
    const d = b.clone().sub(a); const L = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, L, rs, 1), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(Y, d.normalize());
    m.castShadow = true; parent.add(m); return m;
  };
  const ball = (parent, p, r, mat) => add(parent, new THREE.SphereGeometry(r, 6, 4), mat, p.x, p.y, p.z);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---- body: shell centre 0.10 m above ground
  const body = new THREE.Group(); body.position.set(0, 0.085, 0); g.add(body);
  const SX = 0.13, SY = 0.062, SZ = 0.1;
  add(body, new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), shellM, 0, 0, 0, 0, 0, 0, SX, SY, SZ);
  add(body, new THREE.SphereGeometry(1, 16, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), belly, 0, 0.002, 0, 0, 0, 0, SX * 0.94, 0.04, SZ * 0.92);
  // rim lip around the shell edge
  add(body, new THREE.TorusGeometry(1, 0.08, 4, 18), shellDark, 0, 0.0, 0, Math.PI / 2, 0, 0, SX, SZ, 0.14);
  // a raised central ridge (gastric area) and two lobes
  add(body, new THREE.SphereGeometry(1, 10, 6), shellM, 0, 0.035, -0.005, 0, 0, 0, 0.07, 0.045, 0.07);
  for (const s of [1, -1]) add(body, new THREE.SphereGeometry(1, 8, 5), shellM, 0.07 * s, 0.025, -0.02, 0, 0, 0, 0.05, 0.035, 0.05);
  // front teeth along the anterolateral margin
  for (let i = 0; i < 5; i++) for (const s of [1, -1]) {
    const a = 0.35 + i * 0.22; // angle from +Z toward the side
    const x = Math.sin(a) * SX * 1.02 * s, z = Math.cos(a) * SZ * 1.02;
    add(body, new THREE.ConeGeometry(0.012, 0.03, 4).rotateX(Math.PI / 2), shellDark, x, 0.004, z, 0, 0, 0, 1, 0.6, 1).lookAt(x * 2, 0.004, z * 2);
  }
  // barnacle spots on the shell top
  const spots = [[0.045, 0.035, 6], [-0.06, 0.01, 7], [0.08, -0.035, 5], [-0.025, -0.05, 6], [0.015, 0.06, 5], [-0.09, -0.025, 5], [0.095, 0.025, 4], [-0.035, 0.045, 8], [0.05, -0.06, 4]];
  for (const [x, z, r] of spots) {
    const k = 1 - (x / SX) ** 2 - (z / SZ) ** 2; const y = SY * Math.sqrt(Math.max(k, 0));
    add(body, new THREE.CylinderGeometry(r * 0.0015, r * 0.0026, 0.009, 5), cream, x, y + 0.002, z, -z * 3, 0, x * 3);
  }
  // eye stalks
  for (const s of [1, -1]) {
    seg(body, V(0.026 * s, 0.03, 0.082), V(0.034 * s, 0.078, 0.1), 0.009, 0.008, legM, 6);
    add(body, new THREE.SphereGeometry(0.014, 8, 6), black, 0.034 * s, 0.085, 0.102, 0, 0, 0, 0.9, 1.2, 0.9);
  }
  // mouth plate
  add(body, new THREE.BoxGeometry(0.045, 0.022, 0.02), belly, 0, -0.006, 0.09);

  // ---- legs
  const joints = { body };
  const legZ = [0.04, 0.01, -0.02, -0.05];
  const legFwd = [0.5, 0.15, -0.2, -0.55];
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) {
    const j = new THREE.Group();
    const ex = Math.sqrt(Math.max(1 - (legZ[i] / SZ) ** 2, 0)) * SX * 0.92;
    j.position.set(ex * s, -0.01, legZ[i]);
    j.rotation.y = -s * legFwd[i];
    body.add(j);
    const k = 1 - i * 0.05;
    const p0 = V(0, 0, 0), p1 = V(0.05 * s * k, 0.03, 0), p2 = V(0.11 * s * k, 0.045, 0), p3 = V(0.14 * s * k, -0.075, 0);
    seg(j, p0, p1, 0.018, 0.017, legM);
    seg(j, p1, p2, 0.017, 0.015, legM); ball(j, p2, 0.016, legM);
    seg(j, p2, p3, 0.015, 0.004, legTip);
    joints[(s > 0 ? 'legL' : 'legR') + i] = j;
  }

  // ---- claws: pivot at the front corner of the shell
  for (const s of [1, -1]) {
    const j = new THREE.Group(); j.position.set(0.08 * s, 0.0, 0.065); body.add(j);
    const p0 = V(0, 0, 0), p1 = V(0.055 * s, 0.02, 0.045), p2 = V(0.075 * s, 0.075, 0.07);
    seg(j, p0, p1, 0.02, 0.018, legM); ball(j, p1, 0.02, legM);
    seg(j, p1, p2, 0.02, 0.024, legM);
    // palm
    const hand = new THREE.Group(); hand.position.copy(p2); hand.rotation.set(-0.35, 0, -0.35 * s); hand.scale.setScalar(1.25); j.add(hand);
    add(hand, new THREE.SphereGeometry(1, 9, 6), shellM, 0, 0.04, 0, 0, 0, 0, 0.038, 0.055, 0.032);
    add(hand, new THREE.SphereGeometry(1, 8, 5), belly, -0.012 * s, 0.035, 0.01, 0, 0, 0, 0.025, 0.04, 0.025);
    // fixed finger + moving dactyl, gap between
    add(hand, new THREE.ConeGeometry(0.017, 0.07, 6), shellDark, 0.012 * s, 0.115, 0.0, 0, 0, -0.25 * s);
    add(hand, new THREE.ConeGeometry(0.015, 0.065, 6), shellDark, -0.02 * s, 0.11, 0.0, 0, 0, 0.35 * s);
    add(hand, new THREE.SphereGeometry(0.008, 5, 4), cream, 0.025 * s, 0.06, 0.02);
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
