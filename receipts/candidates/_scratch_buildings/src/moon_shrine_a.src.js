// moon_shrine A: primitives. Box steps, carved plinth (raised diamond bars), tapered 4-sided shaft, zig-zag capital,
// torus-ringed moonstone disc, four timber posts and a box-tiled gable roof.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 5);
  const { box, boxB, cyl, put, T, V, jit, beam } = K;
  // ---- stepped base (blocky, slightly irregular blocks) ----
  const course = (y, h, half, nPer, key = 'stone') => {
    // ring of blocks around a square of half-size `half`
    const L = half * 2, bl = L / nPer;
    for (let i = 0; i < nPer; i++) {
      const x = -half + bl * (i + 0.5);
      boxB(key, bl - 0.01, h + jit(0.01), 0.24, x + jit(0.01), y, half - 0.12, jit(0.03), 0.03);
      boxB(key, bl - 0.01, h + jit(0.01), 0.24, x + jit(0.01), y, -half + 0.12, jit(0.03), 0.03);
    }
    const sn = Math.max(1, nPer - 2);
    for (let i = 0; i < sn; i++) {
      const z = -half + 0.24 + (L - 0.48) / sn * (i + 0.5);
      boxB(key, 0.24, h + jit(0.01), (L - 0.48) / sn - 0.01, half - 0.12, y, z + jit(0.01), jit(0.03), 0.03);
      boxB(key, 0.24, h + jit(0.01), (L - 0.48) / sn - 0.01, -half + 0.12, y, z + jit(0.01), jit(0.03), 0.03);
    }
    boxB(key, L - 0.46, h - 0.01, L - 0.46, 0, y, 0, 0, 0.0);
  };
  course(0, 0.16, 0.52, 3);
  course(0.16, 0.15, 0.4, 2);
  boxB('stone', 0.5, 0.09, 0.2, 0, 0, 0.6, 0, 0.03); // front tread
  // moss patches
  for (const [x, z] of [[-0.42, 0.45], [0.38, -0.47], [0.47, 0.3], [-0.3, -0.36]]) boxB('kelp', 0.14, 0.02, 0.1, x, 0.16, z, 0.3, 0);
  // ---- carved plinth ----
  const py0 = 0.31, ph = 0.32, pw = 0.5;
  boxB('stone', pw, ph, pw, 0, py0, 0, 0, 0.04);
  boxB('stone', pw + 0.06, 0.05, pw + 0.06, 0, py0 + ph - 0.02, 0, 0, 0.02);
  for (let f = 0; f < 4; f++) {
    const ry = f * Math.PI / 2;
    K.frame(T(0, py0 + ph / 2 - 0.01, 0, 0, ry, 0), () => {
      const z = pw / 2 + 0.008, r = 0.1;
      for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; box('stone', 0.15, 0.03, 0.025, Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, z, 0, 0, a + Math.PI / 2, 0); }
      box('stone', 0.05, 0.05, 0.02, 0, 0, z, 0, 0, Math.PI / 4, 0);
    });
  }
  // ---- tapered shaft ----
  const sy0 = py0 + ph + 0.03, sy1 = 1.2;
  put('stone', new THREE.CylinderGeometry(0.3 / Math.SQRT2 * 1.0, 0.37 / Math.SQRT2, sy1 - sy0, 4, 1), T(0, (sy0 + sy1) / 2, 0, 0, Math.PI / 4, 0));
  // cloth band around shaft + hanging strips + rope with shells
  const by = 0.92, bw = 0.355;
  for (let f = 0; f < 4; f++) K.frame(T(0, by, 0, 0, f * Math.PI / 2, 0), () => box('tile', bw + 0.03, 0.08, 0.04, 0, 0, bw / 2, 0, 0, 0, 0));
  box('tile', 0.07, 0.36, 0.025, -0.1, by - 0.2, 0.2, 0.08, 0, 0.06, 0);
  box('cream', 0.06, 0.3, 0.025, -0.02, by - 0.17, 0.205, 0.08, 0, -0.04, 0);
  box('tile', 0.07, 0.3, 0.025, 0.12, by - 0.17, -0.2, -0.08, 0, 0.05, 0);
  const rope = new THREE.CatmullRomCurve3([V(-0.19, 0.9, 0.12), V(-0.1, 0.82, 0.22), V(0.06, 0.8, 0.22), V(0.19, 0.88, 0.12), V(0.2, 0.92, -0.1), V(0.0, 0.9, -0.2), V(-0.2, 0.92, -0.1), V(-0.19, 0.9, 0.12)]);
  put('rope', new THREE.TubeGeometry(rope, 16, 0.02, 4, false), null);
  const shell = (x, y, z, ry, rx = 0.4, s = 1) => put('cream', new THREE.SphereGeometry(0.038 * s, 5, 2, 0, Math.PI * 2, 0, Math.PI / 2), T(x, y, z, rx, ry, 0, 1, 0.45, 1));
  shell(-0.12, 0.76, 0.24, 0, 1.4); shell(0.0, 0.74, 0.24, 0, 1.4); shell(0.1, 0.75, 0.24, 0, 1.4); shell(0.2, 0.8, 0.0, Math.PI / 2, 1.4); shell(-0.21, 0.8, 0.0, -Math.PI / 2, 1.4); shell(0.05, 0.8, -0.23, Math.PI, 1.4);
  // shells on steps
  for (const [x, z] of [[-0.3, 0.33], [0.33, 0.36], [0.18, 0.47]]) shell(x, 0.31 - (Math.abs(x) > 0.39 || Math.abs(z) > 0.39 ? 0.15 : 0), z, x * 3, 0, 1.2);
  // ---- capital with zig-zag carving ----
  const cy0 = sy1, ch = 0.14, cw = 0.62;
  boxB('stone', 0.42, 0.05, 0.42, 0, cy0 - 0.03, 0, 0, 0.015);
  boxB('stone', cw, ch, cw, 0, cy0, 0, 0, 0.04);
  for (let f = 0; f < 4; f++) K.frame(T(0, cy0 + ch / 2, 0, 0, f * Math.PI / 2, 0), () => {
    for (let i = 0; i < 5; i++) { const x = -0.22 + i * 0.11; box('stone', 0.085, 0.02, 0.018, x, 0, cw / 2 + 0.006, 0, 0, i % 2 ? 0.75 : -0.75, 0); }
  });
  // hanging cloth from capital corners
  box('cream', 0.06, 0.34, 0.03, 0.27, cy0 - 0.15, 0.32, 0, 0, 0.05, 0);
  box('tile', 0.06, 0.28, 0.03, -0.29, cy0 - 0.12, -0.32, 0, 0, -0.05, 0);
  // ---- moonstone in stone ring ----
  const dy = 1.57;
  boxB('stone', 0.26, 0.1, 0.18, 0, cy0 + ch, 0, 0, 0.03);
  put('stone', new THREE.TorusGeometry(0.2, 0.055, 4, 12), T(0, dy, 0));
  cyl('stone', 0.2, 0.2, 0.06, 14, 0, dy, 0, Math.PI / 2, 0, 0);
  put('moonstone', new THREE.SphereGeometry(0.165, 10, 5), T(0, dy, 0, 0, 0, 0, 1, 1, 0.42));
  // ---- posts + roof ----
  const px = 0.29, pz = 0.22, y0 = cy0 + ch, y1 = 1.6;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) boxB('timber', 0.075, y1 - y0, 0.075, sx * px, y0, sz * pz, jit(0.05), 0.015);
  for (const sx of [-1, 1]) box('timber', 0.08, 0.08, 0.62, sx * px, y1 - 0.02, 0, 0, 0, 0, 0.015);
  // roof: ridge along Z, gable faces +Z
  const a = 0.7, ridgeY = 1.93, zf = 0.42, L = 0.6;
  for (const s of [1, -1]) {
    const d = V(s * Math.cos(a), -Math.sin(a), 0), r = V(0, 0, -s), n = d.clone().cross(r);
    const M = new THREE.Matrix4().makeBasis(r, n, d).setPosition(0, ridgeY, s * zf);
    K.frame(M, () => {
      box('drift', 2 * zf, 0.03, L, zf, -0.015, L / 2, 0, 0, 0, 0);
      const tw = 0.21, tl = 0.21, step = tl * 0.62;
      for (let row = 0; row * step + tl <= L + 0.04; row++) {
        const zc = L - tl / 2 - row * step, off = (row % 2) * tw / 2;
        for (let x = -tw / 2 + off; x < 2 * zf; x += tw) {
          const x0 = Math.max(x, 0), x1 = Math.min(x + tw * 0.93, 2 * zf); if (x1 - x0 < 0.05) continue;
          box('tile', x1 - x0, 0.03, tl, (x0 + x1) / 2, 0.03 + jit(0.004), zc, -0.2 + jit(0.04), jit(0.05), jit(0.03), 0);
        }
      }
    });
    // barge boards (front and back), curling up at the eave
    for (const z of [zf + 0.02, -zf - 0.02]) {
      beam('timber', [0, ridgeY + 0.04, z], [s * Math.cos(a) * (L + 0.02), ridgeY - Math.sin(a) * (L + 0.02) + 0.04, z], 0.085, 0.05, 0);
      box('timber', 0.1, 0.07, 0.05, s * (Math.cos(a) * L + 0.03), ridgeY - Math.sin(a) * L + 0.07, z, 0, 0, s * 0.5, 0);
    }
  }
  box('timber', 0.11, 0.1, 2 * zf + 0.12, 0, ridgeY + 0.07, 0, 0, 0, Math.PI / 4, 0.02);
  boxB('timber', 0.09, 0.1, 0.09, 0, ridgeY + 0.08, zf + 0.04, 0, 0.02);
  K.finish(g);
  return recentre(THREE, g);
}
