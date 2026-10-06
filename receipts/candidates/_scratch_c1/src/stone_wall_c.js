// stone_wall C: lumpy field stones. Fewer, bigger stones: each an icosahedron (detail 1) with vertices
// pushed in and out by per-stone noise, squashed into a boulder and baked; three irregular courses with
// small chinking stones in the joints, chunky chamfered slab capstones, moss in the joints, grass at the foot.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 13);
  const { rnd, jit, put, T } = K;
  addMat(K, 'mortar', 0x575550, 0.95, 'stone');
  addMat(K, 'stone2', 0x7a776f, 0.9, 'stone');
  const HL = 2.0, D = 0.6;
  K.box('mortar', 2 * HL, 0.8, 0.22, 0, 0.4, 0, 0, 0, 0, 0);
  const lump = (seed, det = 1) => {
    const geo = new THREE.IcosahedronGeometry(1, det); const p = geo.attributes.position; const v = new THREE.Vector3();
    const a = 1 + seed * 7.1, b = 2 + seed * 3.3;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + 0.1 * Math.sin(v.x * 3 + a) * Math.cos(v.y * 2.7 + b) + 0.06 * Math.sin(v.z * 4 + a * b); v.multiplyScalar(n); v.x = Math.max(-1, Math.min(1, v.x)); v.y = Math.max(-1, Math.min(1, v.y)); p.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals(); return geo;
  };
  const courses = [[0.0, 0.3], [0.28, 0.27], [0.53, 0.25]];
  let s = 0;
  courses.forEach(([y0, h], ci) => {
    let x = -HL; let len = ci % 2 ? 0.32 + rnd() * 0.1 : 0.55 + rnd() * 0.1;
    while (x < HL - 1e-3) {
      if (x + len > HL - 0.25) len = HL - x;
      const isEnd = x <= -HL + 1e-6 || x + len >= HL - 1e-6;
      const key = rnd() < 0.35 ? 'stone2' : 'stone';
      put(key, lump(s++), T(x + len / 2, y0 + h / 2 + 0.01, jit(0.02), jit(0.08), isEnd ? 0 : jit(0.1), isEnd ? 0 : jit(0.08), isEnd ? len / 2 : len / 2 * 1.12, h / 2 * 1.15, D / 2 * 0.93));
      if (ci < 2 && x + len < HL - 0.15) for (const sz of [-1, 1]) put('stone2', lump(s++, 0), T(x + len, y0 + h, sz * 0.25, jit(0.3), jit(0.4), jit(0.3), 0.08, 0.06, 0.05));
      x += len; len = 0.45 + rnd() * 0.25;
    }
  });
  const caps = 7, cw = 2 * HL / caps;
  for (let i = 0; i < caps; i++) {
    const cx = -HL + cw * (i + 0.5), end = i === 0 || i === caps - 1;
    K.box('stone', cw - 0.025, 0.18 + jit(0.015), D + 0.02, cx + (i === 0 ? 0.0125 : i === caps - 1 ? -0.0125 : 0), 0.9, jit(0.01), 0, end ? 0 : jit(0.04), jit(0.015), 0.06);
  }
  const moss = new THREE.SphereGeometry(1, 5, 3);
  for (let i = 0; i < 9; i++) put('kelp', moss, T(-1.7 + i * 0.42 + jit(0.08), (i % 3) * 0.27 + 0.28, (i % 2 ? 1 : -1) * 0.26, 0, 0, 0, 0.12, 0.035, 0.04));
  for (const [x, z] of [[-1.3, 0.27], [-0.2, 0.28], [0.9, 0.27], [-0.7, -0.27], [1.4, -0.27]]) for (let k = 0; k < 4; k++) put('kelp', new THREE.ConeGeometry(0.03, 0.22, 3), T(x + jit(0.06), 0.1, z + jit(0.02), jit(0.3), rnd() * 3, jit(0.3)));
  K.finish(g);
  return recentre(THREE, g);
}
