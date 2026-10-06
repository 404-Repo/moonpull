// net_rack A: primitives. Square-section A-frame legs crossing above a round top bar, outer cross planks,
// back stretcher. Net = diamond lattice of 4-sided cord tubes over a draped surface (two long falls and a
// sagging middle swag), hanging in front with a short fold behind the bar; cork floats on the hems; fish basket.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 11);
  const { box, beam, log, cyl, put, T, jit, rnd } = K;
  addMat(K, 'net', 0xa58a5c, 0.95, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'cork', 0x9a5a32, 0.8, 'timber');
  addMat(K, 'fish', 0x8a9aa2, 0.5, null);
  const FX = 1.45, LEGT = 0.14;
  // A-frames
  for (const sx of [-1, 1]) {
    const x = sx * FX;
    beam('timber', [x - 0.075, 0, -0.62], [x - 0.075, 1.9, 0.14], LEGT, LEGT, 0.03);
    beam('timber', [x + 0.075, 0, 0.62], [x + 0.075, 1.9, -0.14], LEGT, LEGT, 0.03);
    // outer cross plank + inner lower plank
    box('drift', 0.07, 0.16, 1.05, x + sx * 0.18, 0.55, 0, 0, 0, 0.03, 0.02);
    box('drift', 0.07, 0.14, 0.62, x - sx * 0.15, 1.2, 0, 0, 0, -0.02, 0.02);
    // bolt heads
    for (const z of [-0.42, 0.42]) cyl('iron', 0.025, 0.025, 0.04, 6, x + sx * 0.22, 0.55, z, 0, 0, Math.PI / 2);
    // feet blocks
    for (const z of [-0.62, 0.62]) box('wet', 0.22, 0.08, 0.26, x + (z > 0 ? 0.075 : -0.075), 0.04, z, 0, 0, 0, 0.02);
  }
  // top bar resting in the crotch, back stretcher
  log('timber', [-1.75, 1.66, 0], [1.75, 1.66, 0], 0.085, 8);
  box('timber', 2.75, 0.13, 0.1, 0, 0.5, -0.47, 0, 0, 0, 0.03);
  // net surface: u along x, v down. top edge follows the bar where draped, sags in the middle
  const X0 = -1.15, X1 = 1.2;
  const topY = (u) => { const m = Math.max(0, 1 - Math.abs(u - 0.5) / 0.17); return 1.6 - 0.55 * Math.sin(m * Math.PI / 2) ** 2; };
  const lenF = (u) => { const m = Math.max(0, 1 - Math.abs(u - 0.5) / 0.17); return 1.18 - 0.2 * Math.sin(u * 9) - 0.75 * m * m; };
  const P = (u, v) => {
    const x = X0 + (X1 - X0) * u + 0.04 * Math.sin(v * 5 + u * 13) * v;
    const y = topY(u) - lenF(u) * v;
    const z = 0.12 + 0.07 * Math.sin(u * 23) * v + 0.1 * v * v + 0.04 * Math.sin(v * 7);
    return [x, Math.max(0.25, y), z];
  };
  const NU = 13, NV = 7;
  const r = 0.012;
  // diagonals in (u,v) grid: lines u+v = const and u-v = const, sampled on a half grid
  const cord = (pts) => strand(K, 'net', pts, r, 3);
  for (let k = -NV; k <= NU; k++) {
    const a = [], b = [];
    for (let j = 0; j <= NV; j++) {
      const i1 = k + j, i2 = k + NV - j;
      if (i1 >= 0 && i1 <= NU) a.push(P(i1 / NU, j / NV));
      if (i2 >= 0 && i2 <= NU) b.push(P(i2 / NU, j / NV));
    }
    if (a.length > 1) cord(a); if (b.length > 1) cord(b);
  }
  // hem cords + top headrope over the bar
  const hem = []; for (let i = 0; i <= NU; i++) hem.push(P(i / NU, 1));
  strand(K, 'rope', hem, 0.018, 4);
  // fold behind the bar on the draped parts (keeps the back readable)
  for (const [ua, ub] of [[0, 0.32], [0.68, 1]]) {
    const xa = X0 + (X1 - X0) * ua, xb = X0 + (X1 - X0) * ub;
    for (let x = xa; x <= xb + 1e-6; x += 0.14) strand(K, 'net', [[x, 1.72, 0.05], [x + 0.02, 1.7, -0.09], [x - 0.03, 1.38 + 0.08 * Math.sin(x * 9), -0.12]], r, 3);
    strand(K, 'net', [[xa, 1.5, -0.11], [xb, 1.48, -0.12]], r, 3);
    strand(K, 'net', [[xa, 1.62, -0.1], [xb, 1.6, -0.11]], r, 3);
  }
  // cork floats on the hem and the side edges
  const corkGeo = new THREE.SphereGeometry(0.045, 6, 4);
  for (let i = 0; i <= NU; i += 2) { const p = P(i / NU, 1); put('cork', corkGeo, T(p[0], p[1] - 0.02, p[2] + 0.02, 0, 0, 0, 1, 1.3, 1)); }
  for (const u of [0, 1]) for (const v of [0.3, 0.65]) { const p = P(u, v); put('cork', corkGeo, T(p[0], p[1], p[2] + 0.02, 0, 0, 0, 1, 1.3, 1)); }
  for (const u of [0.15, 0.85, 0.42, 0.58]) { const p = P(u, 0.02); put('cork', corkGeo, T(p[0], p[1] + 0.05, 0.13, 0, 0, 0, 1, 1.3, 1)); }
  // fish basket front-right with a rope coil
  K.lathe('rope', [[0.0, 0], [0.2, 0.0], [0.26, 0.08], [0.28, 0.24], [0.3, 0.26], [0.27, 0.26], [0.25, 0.1], [0, 0.04]], 10, T(0.35, 0, 0.55));
  for (let i = 0; i < 6; i++) put('fish', new THREE.SphereGeometry(0.05, 6, 4), T(0.35 + jit(0.13), 0.27 + rnd() * 0.06, 0.55 + jit(0.12), jit(0.6), rnd() * 3, 0.7 + jit(0.3), 1, 3.2, 1));
  K.put('rope', new THREE.TorusGeometry(0.16, 0.025, 4, 12), T(0.75, 0.03, 0.62, Math.PI / 2, 0, 0, 1, 1, 1));
  K.finish(g);
  return recentre(THREE, g);
}
