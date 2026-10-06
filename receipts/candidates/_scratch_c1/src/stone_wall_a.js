// stone_wall A: InstancedMesh. Four running-bond courses of squashed dodecahedra (through-stones spanning
// the full depth) in two stone tones, packed on a recessed dark mortar core, under a row of chamfered
// capstones. Every course and the cap row ends exactly at x = +-2 so sections butt end to end.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 5);
  const { rnd, jit } = K;
  addMat(K, 'mortar', 0x575550, 0.95, 'stone');
  addMat(K, 'stone2', 0x7a776f, 0.9, 'stone');
  const HL = 2.0, D = 0.6;
  K.box('mortar', 2 * HL, 0.78, 0.2, 0, 0.39, 0, 0, 0, 0, 0);
  const courses = [[0.0, 0.25], [0.24, 0.21], [0.44, 0.19], [0.62, 0.18]];
  const proto = new THREE.DodecahedronGeometry(1, 0);
  const lists = { stone: [], stone2: [] };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  courses.forEach(([y0, h], ci) => {
    let x = -HL; const first = ci % 2 ? 0.22 + rnd() * 0.1 : 0.4 + rnd() * 0.1;
    let len = first;
    while (x < HL - 1e-3) {
      if (x + len > HL - 0.18) len = HL - x;
      const cx = x + len / 2, isEnd = x <= -HL + 1e-6 || x + len >= HL - 1e-6;
      e.set(jit(0.08), isEnd ? 0 : jit(0.12), isEnd ? 0 : jit(0.06)); q.setFromEuler(e);
      // dodecahedron reaches 0.934 of its radius on x: end stones stop exactly at the section end
      const sx = isEnd ? len / 2 / 0.934 : len / 2 * 1.18, sy = h / 2 * (1.25 + jit(0.06)), sz = D / 2 * (1.0 + jit(0.03));
      m4.compose(new THREE.Vector3(cx, y0 + h / 2 + 0.01, jit(0.015)), q, new THREE.Vector3(sx, sy, sz));
      (rnd() < 0.35 ? lists.stone2 : lists.stone).push(m4.clone());
      x += len; len = 0.32 + rnd() * 0.24;
    }
  });
  for (const key of Object.keys(lists)) {
    const im = new THREE.InstancedMesh(proto, K.mats[key], lists[key].length);
    lists[key].forEach((m, i) => im.setMatrixAt(i, m));
    im.name = key; im.castShadow = im.receiveShadow = true; g.add(im);
  }
  // clamp: dodecahedron vertices reach the scale on x, so the end stones end at +-2 by construction
  // capstones: 8 slabs, slightly irregular, flush at the ends
  const caps = 8, cw = 2 * HL / caps;
  for (let i = 0; i < caps; i++) {
    const end = i === 0 || i === caps - 1;
    K.box('stone', cw - 0.025, 0.17 + jit(0.015), D + 0.02, -HL + cw * (i + 0.5) + (i === 0 ? 0.0125 : i === caps - 1 ? -0.0125 : 0), 0.9, jit(0.02), 0, end ? 0 : jit(0.03), jit(0.02), 0.05);
  }
  // moss tufts on a few joints
  const moss = new THREE.SphereGeometry(1, 5, 3);
  for (let i = 0; i < 7; i++) K.put('kelp', moss, K.T(-1.6 + i * 0.53 + jit(0.1), 0.8, (i % 2 ? 1 : -1) * 0.27, 0, 0, 0, 0.12, 0.035, 0.05));
  K.finish(g);
  return recentre(THREE, g);
}
