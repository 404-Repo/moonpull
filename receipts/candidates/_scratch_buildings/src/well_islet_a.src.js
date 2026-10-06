// well_islet A: primitives. Plinth ring of chamfered stones + 2 wall courses, gable roof on two posts, windlass, bucket.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 31);
  const { box, boxB, beam, jit, put, T, cyl } = K;
  const ring = (key, n, r, dr, y0, h, off, c) => {
    for (let i = 0; i < n; i++) {
      const a = (i + off) / n * Math.PI * 2, w = 2 * Math.PI * r / n - 0.04;
      box(key, dr + jit(0.03), h + jit(0.03), w, Math.cos(a) * r, y0 + h / 2 + jit(0.01), Math.sin(a) * r, jit(0.04), -a, jit(0.04), c);
    }
  };
  ring('stone', 11, 0.86, 0.3, 0, 0.36, 0, 0.06);
  ring('stone', 10, 0.76, 0.26, 0.36, 0.3, 0.5, 0.05);
  ring('stone', 10, 0.77, 0.3, 0.66, 0.28, 0, 0.06);
    cyl('iron', 0.64, 0.64, 0.04, 14, 0, 0.82, 0);
  // barnacles + kelp
  for (let i = 0; i < 12; i++) { const a = K.rnd() * Math.PI * 2, r = 1.01; put('cream', new THREE.IcosahedronGeometry(0.035 + K.rnd() * 0.025, 0), T(Math.cos(a) * r, 0.06 + K.rnd() * 0.28, Math.sin(a) * r)); }
  for (const a0 of [0.6, 2.2, 3.6, 5.1]) for (let j = 0; j < 3; j++) {
    const a = a0 + j * 0.1, r = 1.0; put('kelp', new THREE.ConeGeometry(0.05, 0.45 + K.rnd() * 0.25, 4), T(Math.cos(a) * r, 0.3, Math.sin(a) * r, jit(0.3), K.rnd() * 3, jit(0.35), 1, 1, 0.4));
  }
  // posts and gable trusses at x = +-0.8
  const PX = 0.8, EY = 2.25, RY = 2.85;
  for (const s of [-1, 1]) {
    const x = s * PX;
    boxB('timber', 0.17, EY - 0.6, 0.17, x, 0.6, 0, 0, 0.035);
    box('timber', 0.14, 0.14, 1.75, x, EY, 0, 0, 0, 0, 0.03);
    beam('timber', [x, EY - 0.05, 0.85], [x, RY + 0.05, 0], 0.12, 0.13);
    beam('timber', [x, EY - 0.05, -0.85], [x, RY + 0.05, 0], 0.12, 0.13);
    box('timber', 0.1, 0.55, 0.1, x, EY + 0.33, 0, 0, 0, 0, 0);
    beam('timber', [x, EY - 0.5, 0.06], [x, EY - 0.05, 0.5], 0.09, 0.09, 0);
    beam('timber', [x, EY - 0.5, -0.06], [x, EY - 0.05, -0.5], 0.09, 0.09, 0);
  }
  // ridge beam with chunky ends
  box('timber', 2.4, 0.16, 0.18, 0, RY + 0.12, 0, 0, 0, 0.0, 0.04);
  // roof slopes: board + tiles
  const run = 1.0, rise = RY - EY + 0.05, a = Math.atan2(rise, run), L = Math.hypot(run, rise) + 0.05, W = 2.3;
  const slope = (m) => K.frame(m, () => {
    box('timber', W, 0.06, L, W / 2, -0.03, L / 2, 0, 0, 0, 0.015);
    for (let r = 0; r < 4; r++) {
      const zc = L - 0.17 - r * 0.29, off = (r % 2) * 0.19;
      for (let x0 = -0.19 + off; x0 < W; x0 += 0.38) {
        const a0 = Math.max(x0, 0), a1 = Math.min(x0 + 0.36, W); if (a1 - a0 < 0.1) continue;
        box('tile', a1 - a0, 0.05, 0.36, (a0 + a1) / 2, 0.05, zc, -0.14 + jit(0.03), jit(0.04), jit(0.03), 0);
      }
    }
  });
  slope(T(-W / 2, RY + 0.05, 0, a, 0, 0));
  slope(T(W / 2, RY + 0.05, 0, a, Math.PI, 0));
  // windlass
  const WY = 1.6;
  K.cyl('timber', 0.11, 0.11, 1.48, 8, 0, WY, 0, 0, 0, Math.PI / 2);
  for (let i = 0; i < 3; i++) put('rope', new THREE.TorusGeometry(0.13, 0.035, 3, 8), T(-0.12 + i * 0.07, WY, 0, 0, Math.PI / 2, 0));
  K.cyl('rope', 0.015, 0.015, 0.4, 4, 0, WY - 0.33, 0.12);
  // crank on +x
  K.cyl('timber', 0.04, 0.04, 0.25, 6, PX + 0.18, WY, 0, 0, 0, Math.PI / 2);
  box('timber', 0.06, 0.32, 0.08, PX + 0.3, WY - 0.13, 0, 0, 0, 0, 0.015);
  K.cyl('timber', 0.035, 0.035, 0.22, 6, PX + 0.4, WY - 0.26, 0, 0, 0, Math.PI / 2);
  // bucket
  const BY = 1.05;
  K.cyl('timber', 0.14, 0.11, 0.22, 8, 0, BY, 0.12);
  K.cyl('iron', 0.145, 0.145, 0.03, 8, 0, BY + 0.06, 0.12);
  K.cyl('iron', 0.125, 0.125, 0.03, 8, 0, BY - 0.06, 0.12);
  put('iron', new THREE.TorusGeometry(0.14, 0.012, 3, 8, Math.PI), T(0, BY + 0.11, 0.12));
  K.finish(g);
  return recentre(THREE, g);
}
