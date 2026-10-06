// gull_b: profiles. Lathe torso (fat chest tapering to the tail), lathe head, wings and tail
// as extruded planforms with a scalloped feathered trailing edge, a separate black extruded
// tip on the hand. Joints: body > head; body > wingL > wingTipL; body > wingR > wingTipR.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r }); if (name) q.name = name; return q; };
  const white = mk(0xe8e2d4, 'fabric');
  const grey = mk(0x9a9ea2, 'fabric');
  const greyD = mk(0x7c8086, 'fabric');
  const black = mk(0x2c2c2e, 'fabric');
  const beakM = mk(0xe2a73a, 'fabric', 0.6);
  const eyeM = mk(0x161616, null, 0.4);

  // Lathe around Y, then turned so the axis runs along Z (y -> z).
  const lathe = (pts, segs, mat) => {
    const gg = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segs);
    gg.rotateX(Math.PI / 2); return new THREE.Mesh(gg, mat);
  };
  // Planform in the XZ plane: shape (x, y) -> world (x, z = y), thickness t centred on y = 0.
  const plan = (pts, t, mat) => {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    const gg = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false, curveSegments: 2 });
    gg.rotateX(Math.PI / 2); gg.translate(0, t / 2, 0);
    return new THREE.Mesh(gg, mat);
  };
  // scallops: trailing edge from (x0,z0) to (x1,z1) in n feathers, each dipping by d
  const scallop = (x0, z0, x1, z1, n, d) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = i / n, b = (i + 1) / n, mdl = (a + b) / 2;
      out.push([x0 + (x1 - x0) * a, z0 + (z1 - z0) * a]);
      out.push([x0 + (x1 - x0) * mdl, z0 + (z1 - z0) * mdl - d]);
    }
    out.push([x1, z1]);
    return out;
  };

  const body = new THREE.Group(); g.add(body);
  // torso profile, y here = position along the body (tail -0.17 .. chest +0.14)
  const torso = lathe([[0.001, -0.15], [0.03, -0.13], [0.05, -0.08], [0.064, -0.01], [0.066, 0.05], [0.055, 0.1], [0.035, 0.13], [0.001, 0.14]], 10, white);
  torso.scale.set(1, 0.92, 1); body.add(torso);
  // grey mantle saddle on the back
  const mantle = plan([[-0.05, 0.08], [0.05, 0.08], [0.06, -0.02], [0.035, -0.11], [-0.035, -0.11], [-0.06, -0.02]], 0.03, grey);
  mantle.position.y = 0.045; body.add(mantle);
  // tail fan
  const tail = plan([[-0.035, -0.08], [0.035, -0.08], ...scallop(0.06, -0.18, -0.06, -0.18, 4, 0.018)], 0.03, white);
  tail.position.y = 0.0; body.add(tail);
  const tailTip = plan(scallop(0.062, -0.18, -0.062, -0.18, 4, 0.019).concat([[-0.06, -0.15], [0.06, -0.15]]), 0.032, greyD);
  body.add(tailTip);

  const head = new THREE.Group(); head.position.set(0, 0.03, 0.1); body.add(head);
  const skull = lathe([[0.001, -0.02], [0.035, 0.0], [0.05, 0.04], [0.05, 0.08], [0.035, 0.115], [0.001, 0.13]], 9, white);
  skull.position.set(0, 0.02, 0.0); head.add(skull);
  const beak = lathe([[0.02, 0.0], [0.016, 0.03], [0.009, 0.055], [0.001, 0.068]], 6, beakM);
  beak.position.set(0, 0.012, 0.115); head.add(beak);
  const gonys = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.025, 4), beakM); gonys.rotation.x = Math.PI; gonys.position.set(0, -0.004, 0.155); head.add(gonys);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 4), eyeM); e.position.set(s * 0.043, 0.04, 0.085); head.add(e); }

  const joints = { body, head };
  for (const s of [1, -1]) {
    const side = s > 0 ? 'L' : 'R';
    const M = (pts) => pts.map(([x, z]) => [s * x, z]);
    const wing = new THREE.Group(); wing.position.set(s * 0.05, 0.035, 0.03); body.add(wing);
    // inner wing: leading edge straight, trailing edge scalloped (secondaries)
    const inner = plan(M([[0, 0.07], [0.31, 0.065], ...scallop(0.31, -0.11, 0, -0.14, 6, 0.025)]), 0.034, grey);
    wing.add(inner);
    // thick rounded leading edge
    const le = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.28, 2, 6), grey); le.rotation.z = Math.PI / 2; le.position.set(s * 0.155, 0.002, 0.058); wing.add(le);
    // darker secondaries band showing along the trailing edge on top
    const sec = plan(M(scallop(0.3, -0.105, 0.0, -0.135, 6, 0.025).concat([[0, -0.09], [0.3, -0.075]])), 0.038, greyD);
    wing.add(sec);

    const tip = new THREE.Group(); tip.position.set(s * 0.3, 0, 0); wing.add(tip);
    // hand: swept leading edge to a point, primaries' fingered trailing edge
    const handPts = [[0, 0.065], [0.14, 0.05], [0.26, 0.0], [0.32, -0.05], ...[[0.29, -0.08], [0.25, -0.07], [0.24, -0.1], [0.2, -0.09], [0.18, -0.12], [0.13, -0.11], [0.1, -0.13], [0.05, -0.115], [0, -0.115]]];
    const hand = plan(M(handPts), 0.03, grey); tip.add(hand);
    const blackPts = [[0.13, 0.045], [0.26, 0.0], [0.32, -0.05], [0.29, -0.08], [0.25, -0.07], [0.24, -0.1], [0.2, -0.09], [0.18, -0.12], [0.13, -0.11], [0.12, -0.02]];
    const bt = plan(M(blackPts), 0.034, black); bt.position.y = 0.0; tip.add(bt);
    const le2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.12, 2, 6), grey); le2.rotation.z = Math.PI / 2; le2.position.set(s * 0.07, 0.002, 0.055); tip.add(le2);

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
