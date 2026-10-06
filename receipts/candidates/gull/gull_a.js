// gull_a: primitives. Ellipsoid torso and head, cone beak, wings as rows of flattened
// rounded feather blocks (coverts, secondaries, fanned primaries), fan tail of blocks.
// Joints: body > head; body > wingL > wingTipL; body > wingR > wingTipR. Pivots at the
// shoulder and the wrist. Rest pose is a glide with a gentle gull "M" (baked rotations).
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r }); if (name) q.name = name; return q; };
  const white = mk(0xe8e2d4, 'fabric');
  const grey = mk(0x9a9ea2, 'fabric');
  const greyD = mk(0x7c8086, 'fabric');
  const black = mk(0x2c2c2e, 'fabric');
  const beakM = mk(0xe2a73a, 'fabric', 0.6);
  const eyeM = mk(0x161616, null, 0.4);
  const legM = mk(0xd98a4a, 'fabric', 0.7);

  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const ell = (rx, ry, rz, mat, ws = 10, hs = 7) => { const gg = new THREE.SphereGeometry(1, ws, hs); gg.scale(rx, ry, rz); return new THREE.Mesh(gg, mat); };
  // a feather: a flattened capsule-ish block, rounded at the free end
  const feather = (len, wid, thk, mat) => {
    const gg = new THREE.CapsuleGeometry(wid / 2, Math.max(0.001, len - wid), 2, 6);
    gg.rotateX(Math.PI / 2); gg.scale(1, thk / wid, 1);
    return new THREE.Mesh(gg, mat);
  };

  const body = new THREE.Group(); g.add(body);
  // torso
  const torso = ell(0.068, 0.062, 0.15, white); body.add(torso);
  const back = ell(0.06, 0.03, 0.12, grey); back.position.set(0, 0.035, -0.01); body.add(back);
  // tucked feet
  for (const s of [-1, 1]) { const f = ell(0.018, 0.014, 0.04, legM, 6, 4); f.position.set(s * 0.025, -0.05, -0.1); body.add(f); }
  // tail: fan of five blocks, white with grey tips
  for (let i = -2; i <= 2; i++) {
    const t = feather(0.11, 0.045, 0.03, i === 0 ? white : (Math.abs(i) === 2 ? greyD : grey));
    t.position.set(i * 0.022, 0.005, -0.18); t.rotation.y = i * 0.16; body.add(t);
  }

  // head joint at the neck
  const head = new THREE.Group(); head.position.set(0, 0.03, 0.1); body.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.03, 8, 5), white, 0, 0, 0.03));
  const skull = ell(0.05, 0.05, 0.058, white); skull.position.set(0, 0.022, 0.075); head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.075, 6), beakM);
  beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.01, 0.16); head.add(beak);
  const hook = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 5), beakM); hook.rotation.x = Math.PI * 0.85; hook.position.set(0, 0.0, 0.19); head.add(hook);
  for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.009, 6, 4), eyeM, s * 0.042, 0.035, 0.1); head.add(e); }

  // wings. Built for the +X side (s = 1) and mirrored. Wing-local x runs outward.
  const joints = { body, head };
  for (const s of [1, -1]) {
    const side = s > 0 ? 'L' : 'R';
    const wing = new THREE.Group(); wing.position.set(s * 0.05, 0.035, 0.03); body.add(wing);
    // inner wing (arm): leading edge bar, covert block, secondaries row
    const lead = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.26, 2, 6), grey);
    lead.rotation.z = Math.PI / 2; lead.scale.set(1, 1, 0.8); lead.position.set(s * 0.15, 0.004, 0.04); wing.add(lead);
    const cov = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.034, 0.1), grey); cov.position.set(s * 0.15, 0, -0.01); wing.add(cov);
    for (let i = 0; i < 6; i++) {
      const f = feather(0.12, 0.055, 0.026, i % 2 ? greyD : grey);
      f.position.set(s * (0.03 + i * 0.048), -0.004, -0.085); f.rotation.y = s * -0.05; wing.add(f);
    }
    // outer wing (hand), pivot at the wrist
    const tip = new THREE.Group(); tip.position.set(s * 0.3, 0, 0.0); wing.add(tip);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.032, 0.12), grey); hand.position.set(s * 0.07, 0, -0.005); tip.add(hand);
    const lead2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.019, 0.12, 2, 6), grey); lead2.rotation.z = Math.PI / 2; lead2.scale.set(1, 1, 0.8); lead2.position.set(s * 0.07, 0.003, 0.05); tip.add(lead2);
    // primaries fanning outward and back; outer ones black
    const P = 6;
    for (let i = 0; i < P; i++) {
      const a = (0.15 + i * 0.13);            // sweep angle back from straight out
      const len = 0.22 - Math.abs(i - 1.5) * 0.018;
      const f = feather(len, 0.05, 0.026, i < 2 ? black : (i < 4 ? black : greyD));
      const fg = new THREE.Group(); fg.position.set(s * 0.12, -0.003 * i, 0.02 - i * 0.012);
      f.rotation.y = Math.PI / 2; f.position.x = s * len / 2; fg.add(f);
      fg.rotation.y = s * a; tip.add(fg);
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
