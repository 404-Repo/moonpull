// stone_wall B: pillow stones. Each stone is a heavily chamfered box (soft octagonal section on every face,
// the "soft bevelled solid shape" of the style) laid in five running-bond courses as through-stones,
// slight tilt and set-back per stone, on a dark core, with a row of thick capstones overhanging both faces.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 9);
  const { box, rnd, jit } = K;
  addMat(K, 'mortar', 0x575550, 0.95, 'stone');
  addMat(K, 'stone2', 0x7a776f, 0.9, 'stone');
  const HL = 2.0, D = 0.6;
  box('mortar', 2 * HL, 0.78, D - 0.2, 0, 0.39, 0, 0, 0, 0, 0);
  const courses = [[0.0, 0.24], [0.24, 0.2], [0.44, 0.19], [0.63, 0.19]];
  courses.forEach(([y0, h], ci) => {
    let x = -HL; let len = ci % 2 ? 0.24 + rnd() * 0.08 : 0.42 + rnd() * 0.1;
    while (x < HL - 1e-3) {
      if (x + len > HL - 0.16) len = HL - x;
      const hh = h - 0.012 + jit(0.015), c = Math.min(hh, len) * 0.42;
      const key = rnd() < 0.3 ? 'stone2' : 'stone';
      const isEnd = x <= -HL + 1e-6 || x + len >= HL - 1e-6;
      box(key, len - 0.012, hh, D - 0.02 + jit(0.03), x + len / 2, y0 + h / 2, jit(0.025), jit(0.04), isEnd ? 0 : jit(0.05), isEnd ? 0 : jit(0.04), c);
      x += len; len = 0.34 + rnd() * 0.24;
    }
  });
  const caps = 9, cw = 2 * HL / caps;
  for (let i = 0; i < caps; i++) {
    const end = i === 0 || i === caps - 1;
    box('stone', cw - 0.02, 0.17 + jit(0.015), D + 0.02, -HL + cw * (i + 0.5) + (i === 0 ? 0.01 : i === caps - 1 ? -0.01 : 0), 0.82 + 0.085 - 0.0, jit(0.02), 0, end ? 0 : jit(0.03), jit(0.02), 0.05);
  }
  const moss = new THREE.SphereGeometry(1, 5, 3);
  for (let i = 0; i < 8; i++) K.put('kelp', moss, K.T(-1.7 + i * 0.48 + jit(0.1), 0.82, (i % 2 ? 1 : -1) * 0.27, 0, 0, 0, 0.12, 0.035, 0.05));
  K.finish(g);
  return recentre(THREE, g);
}
