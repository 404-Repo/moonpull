// shore_crab, candidate B: profiles. Lathe dome carapace over an extruded scalloped margin plate,
// legs as tapered tubes swept along curves, claws as extruded chela outlines (palm, fixed finger,
// dactyl with a gap) with a bevel. 0.5 m across, front (eyes, claws) +Z. Left = +X.
// Jointed: userData.joints = { body, clawL, clawR, legL0..3, legR0..3 }, each a Group AT its pivot
// on the shell edge. Claw raise: rotation.z (+ clawL, - clawR). Leg lift: rotation.z; swing: rotation.y.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, rough = 0.75, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
  const shellM = M(0xd2643a, 0.7);
  const shellDark = M(0xb24e2c, 0.7);
  const belly = M(0xe3a978, 0.8);
  const legM = M(0xc9602f, 0.72);
  const cream = M(0xd9cfb6, 0.85); cream.name = 'stone';
  const black = M(0x1a1512, 0.35);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  // tapered tube along a curve: radius r0 at start to r1 at end
  const tube = (pts, r0, r1, segs = 8, rad = 5) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, segs, 1, rad, false);
    const p = geo.attributes.position; const c = new THREE.Vector3(), q = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      const u = i / segs; curve.getPointAt(u, c); const r = r0 + (r1 - r0) * u;
      for (let j = 0; j <= rad; j++) {
        const k = i * (rad + 1) + j; q.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c); p.setXYZ(k, q.x, q.y, q.z);
      }
    }
    geo.computeVertexNormals(); return geo;
  };

  // ---- body
  const body = new THREE.Group(); body.position.set(0, 0.1, 0); g.add(body);
  const RX = 1.1, RZ = 0.85;
  const prof = [[0.0005, -0.035], [0.11, -0.03], [0.13, -0.012], [0.137, 0.006], [0.125, 0.028], [0.095, 0.052], [0.055, 0.068], [0.0005, 0.074]].map(([r, y]) => new THREE.Vector2(r, y));
  add(body, new THREE.LatheGeometry(prof, 16), shellM, 0, 0, 0, 0, 0, 0, RX, 1, RZ);
  // scalloped margin plate, teeth along the front half
  const shp = new THREE.Shape(); const N = 34;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2; const sx = Math.sin(t), cz = Math.cos(t);
    let f = 1.0; if (cz > 0.05 && Math.abs(sx) > 0.25) f = i % 2 ? 1.1 : 0.99;
    const x = sx * 0.142 * RX * f, z = cz * 0.142 * RZ * f;
    i ? shp.lineTo(x, -z) : shp.moveTo(x, -z);
  }
  const plate = new THREE.ExtrudeGeometry(shp, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 1 });
  plate.rotateX(-Math.PI / 2);
  add(body, plate, shellDark, 0, -0.004, 0);
  // underside
  add(body, new THREE.SphereGeometry(1, 12, 3, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), belly, 0, -0.03, 0, 0, 0, 0, 0.13, 0.03, 0.1);
  // grooves on the dome: two raised lobes
  for (const s of [1, -1]) add(body, new THREE.SphereGeometry(1, 8, 5), shellM, 0.05 * s, 0.045, -0.015, 0, 0, 0.3 * s, 0.055, 0.03, 0.05);
  // barnacles: little lathe volcanoes
  const barn = new THREE.LatheGeometry([[0.0005, 0.012], [0.006, 0.012], [0.011, 0.002], [0.012, -0.004]].map(([r, y]) => new THREE.Vector2(r, y)), 6);
  const spots = [[0.05, 0.04, 1], [-0.07, 0.01, 1.2], [0.09, -0.04, 0.8], [-0.03, -0.06, 1], [0.02, 0.07, 0.8], [-0.1, -0.03, 0.8], [0.11, 0.03, 0.7], [-0.04, 0.05, 1.3], [0.06, -0.07, 0.7]];
  for (const [x, z, k] of spots) {
    const r = Math.hypot(x / RX, z / RZ); let y = 0.074;
    for (let i = 1; i < prof.length; i++) if (prof[i].x <= r && prof[i - 1].x >= r) { const t = (r - prof[i].x) / (prof[i - 1].x - prof[i].x); y = prof[i].y + (prof[i - 1].y - prof[i].y) * t; }
    add(body, barn, cream, x, y, z, -z * 3, 0, x * 3, k, k, k);
  }
  // eye stalks
  for (const s of [1, -1]) {
    add(body, tube([V(0.028 * s, 0.03, 0.09), V(0.034 * s, 0.065, 0.1), V(0.04 * s, 0.09, 0.105)], 0.009, 0.007, 4, 5), legM);
    add(body, new THREE.SphereGeometry(0.014, 8, 6), black, 0.04 * s, 0.097, 0.107, 0, 0, 0, 0.9, 1.25, 0.9);
  }

  const joints = { body };
  // ---- legs
  const legZ = [0.045, 0.012, -0.022, -0.056], legFwd = [0.5, 0.15, -0.2, -0.55];
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) {
    const j = new THREE.Group();
    const ex = Math.sqrt(Math.max(1 - (legZ[i] / 0.115) ** 2, 0)) * 0.138;
    j.position.set(ex * s, -0.012, legZ[i]); j.rotation.y = -s * legFwd[i]; body.add(j);
    const k = 1 - i * 0.05;
    add(j, tube([V(0, 0, 0), V(0.05 * s * k, 0.035, 0), V(0.1 * s * k, 0.045, 0), V(0.122 * s * k, 0.0, 0), V(0.132 * s * k, -0.088, 0)], 0.017, 0.004, 10, 5), legM);
    joints[(s > 0 ? 'legL' : 'legR') + i] = j;
  }
  // ---- claws: extruded chela outline
  const chela = new THREE.Shape();
  // u (along the claw) is y, v (width) is x
  [[-0.03, 0], [-0.036, 0.06], [-0.012, 0.135], [-0.004, 0.13], [-0.005, 0.075], [0.004, 0.07], [0.02, 0.125], [0.028, 0.122], [0.034, 0.06], [0.03, 0]].forEach(([x, y], i) => i ? chela.lineTo(x, y) : chela.moveTo(x, y));
  const chelaGeo = new THREE.ExtrudeGeometry(chela, { depth: 0.026, bevelEnabled: true, bevelThickness: 0.009, bevelSize: 0.007, bevelSegments: 2, curveSegments: 1 });
  chelaGeo.translate(0, 0, -0.013);
  for (const s of [1, -1]) {
    const j = new THREE.Group(); j.position.set(0.095 * s, 0.0, 0.075); body.add(j);
    const p2 = V(0.075 * s, 0.07, 0.07);
    add(j, tube([V(0, 0, 0), V(0.05 * s, 0.015, 0.045), p2], 0.021, 0.024, 6, 6), legM);
    const hand = new THREE.Group(); hand.position.copy(p2); hand.rotation.set(-0.35, 0.5 * s, -0.3 * s); j.add(hand);
    add(hand, chelaGeo, shellM, 0, 0, 0, 0, 0, 0, s, 1, 1);
    add(hand, new THREE.SphereGeometry(1, 8, 5), belly, 0, 0.035, 0, 0, 0, 0, 0.03, 0.038, 0.03);
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
