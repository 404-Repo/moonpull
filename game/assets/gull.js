// gull_c: hand-built. Wings lofted from cambered airfoil sections (thick rounded leading edge,
// thin trailing edge) with separate lofted secondaries and four primaries that close to a black
// point; torso a sculpted sphere (deep chest, tapering rump) under a grey mantle.
// Joints: body > head; body > wingL > wingTipL; body > wingR > wingTipR, pivots at shoulder and
// wrist. Rest pose is a glide with baked z rotations (wing +-0.1, tip -+0.16): add to them.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r }); if (name) q.name = name; return q; };
  const white = mk(0xe8e2d4, 'fabric');
  const grey = mk(0x9a9ea2, 'fabric');
  const greyD = mk(0x7c8086, 'fabric');
  const black = mk(0x2c2c2e, 'fabric');
    const beakM = mk(0xe2a73a, 'fabric', 0.6);
  const eyeM = mk(0x161616, null, 0.4);

  // Loft along local +x. Each station: [x, zLeadingEdge, zTrailingEdge, thickness, yOffset].
  // Section is a 6-point cambered airfoil loop; the ends are closed with fans.
  const loft = (st, mat, s = 1, rootCap = true) => {
    const K = 6, pos = [], idx = [];
    const sec = (le, te, t, y) => {
      const c = le - te, cam = t * 0.25;
      return [[le, y + cam * 0.2], [le - c * 0.22, y + t * 0.5 + cam], [le - c * 0.62, y + t * 0.32 + cam * 0.6],
        [te, y], [le - c * 0.62, y - t * 0.12], [le - c * 0.22, y - t * 0.38 + cam * 0.3]];
    };
    for (const [x, le, te, t, y] of st) for (const [z, yy] of sec(le, te, t, y)) pos.push(s * x, yy, z);
    const N = st.length;
    for (let i = 0; i < N - 1; i++) for (let k = 0; k < K; k++) {
      const a = i * K + k, b = i * K + (k + 1) % K, c = a + K, d = b + K;
      if (s > 0) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
    }
    for (const [i, flip] of (rootCap ? [[0, 1], [N - 1, -1]] : [[N - 1, -1]])) {
      const ci = pos.length / 3; let cx = 0, cy = 0, cz = 0;
      for (let k = 0; k < K; k++) { cx += pos[(i * K + k) * 3]; cy += pos[(i * K + k) * 3 + 1]; cz += pos[(i * K + k) * 3 + 2]; }
      pos.push(cx / K, cy / K, cz / K);
      for (let k = 0; k < K; k++) { const a = i * K + k, b = i * K + (k + 1) % K; (flip * s > 0) ? idx.push(ci, b, a) : idx.push(ci, a, b); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const ng = geo.toNonIndexed(); ng.computeVertexNormals();
    return new THREE.Mesh(ng, mat);
  };

  const body = new THREE.Group(); g.add(body);
  // sculpted torso
  const tg = new THREE.SphereGeometry(1, 10, 8), P = tg.attributes.position, v3 = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) {
    v3.fromBufferAttribute(P, i);
    let { x, y, z } = v3;
    const back = z < 0 ? Math.pow(-z, 1.4) : 0;
    const k = 1 - 0.6 * back;
    x *= 0.068 * k; y = (y * (y < 0 ? 0.066 : 0.056)) * k + back * 0.018; z *= 0.14;
    P.setXYZ(i, x, y, z);
  }
  tg.computeVertexNormals(); body.add(new THREE.Mesh(tg, white));
  // grey mantle over the back, joining the two wings into one grey upper surface
  const mg = new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2); mg.scale(0.06, 0.03, 0.115);
  const mantle = new THREE.Mesh(mg, grey); mantle.position.set(0, 0.03, -0.005); body.add(mantle);
  // tail: lofted fan along -z (built along +x then turned)
  const tail = loft([[0, 0.035, -0.035, 0.03, 0], [0.06, 0.05, -0.05, 0.026, 0], [0.1, 0.06, -0.06, 0.022, 0.004]], white);
  tail.rotation.y = Math.PI / 2; tail.position.set(0, 0.012, -0.1); body.add(tail);
  for (let i = -1; i <= 1; i++) {
    const t = loft([[0, 0.022, -0.022, 0.024, 0], [0.04, 0.022, -0.022, 0.02, 0], [0.055, 0.004, -0.004, 0.016, 0]], i ? greyD : grey, 1, false);
    t.rotation.y = Math.PI / 2 + i * 0.3; t.position.set(i * 0.03, 0.016, -0.17); body.add(t);
  }

  const head = new THREE.Group(); head.position.set(0, 0.032, 0.105); body.add(head);
  const hg = new THREE.SphereGeometry(1, 8, 6); hg.scale(0.048, 0.05, 0.062);
  const sk = new THREE.Mesh(hg, white); sk.position.set(0, 0.02, 0.06); head.add(sk);
  const beak = loft([[0, 0.022, -0.022, 0.026, 0], [0.04, 0.016, -0.016, 0.02, 0.0], [0.06, 0.008, -0.008, 0.016, -0.006], [0.07, 0.004, -0.004, 0.012, -0.012]], beakM);
  beak.rotation.y = -Math.PI / 2; beak.position.set(0, 0.008, 0.1); head.add(beak);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 4), eyeM); e.position.set(s * 0.04, 0.035, 0.085); head.add(e); }

  const joints = { body, head };
  for (const s of [1, -1]) {
    const side = s > 0 ? 'L' : 'R';
    const wing = new THREE.Group(); wing.position.set(s * 0.05, 0.036, 0.03); body.add(wing);
    // arm: coverts panel, then a scalloped darker secondaries edge (each feather its own loft)
    wing.add(loft([[0, 0.07, -0.1, 0.05, 0], [0.12, 0.072, -0.09, 0.044, 0.002], [0.22, 0.068, -0.08, 0.04, 0.002], [0.28, 0.06, -0.07, 0.036, 0]], grey, s));
    for (let i = 0; i < 4; i++) {
      const x0 = 0.02 + i * 0.064;
      const f = loft([[0, 0.034, -0.034, 0.022, 0], [0.055, 0.036, -0.036, 0.02, 0], [0.085, 0.014, -0.014, 0.016, 0]], i % 2 ? greyD : grey, 1, false);
      f.rotation.y = Math.PI / 2; f.position.set(s * (x0 + 0.02), -0.004, -0.06); wing.add(f);
    }
    const tip = new THREE.Group(); tip.position.set(s * 0.28, 0, 0); wing.add(tip);
    tip.add(loft([[0, 0.06, -0.07, 0.036, 0], [0.08, 0.044, -0.056, 0.032, 0], [0.16, 0.012, -0.042, 0.026, 0]], grey, s));
    // four primaries lying close, outermost longest, so the hand closes to a gull's point
    for (let i = 0; i < 4; i++) {
      const len = 0.2 - i * 0.03, a = 0.3 + i * 0.09;
      const f = loft([[0, 0.03, -0.03, 0.024, 0], [len * 0.6, 0.03, -0.026, 0.02, 0], [len, 0.008, -0.008, 0.012, -0.004]], black, 1, false);
      const fg = new THREE.Group(); fg.position.set(s * (0.13 - i * 0.012), -0.004 * i, 0.0 - i * 0.022);
      f.rotation.y = s > 0 ? 0 : Math.PI; fg.add(f); fg.rotation.y = s * a; tip.add(fg);
    }
    wing.rotation.z = s * 0.1; tip.rotation.z = s * -0.16;
    joints['wing' + side] = wing; joints['wingTip' + side] = tip;
  }

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
  g.userData.joints = joints;
  return g;
}
