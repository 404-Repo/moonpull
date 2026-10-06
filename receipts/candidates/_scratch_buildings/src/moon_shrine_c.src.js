// moon_shrine C: different breakdown. Masonry reading: steps and column assembled from individual irregular stones,
// shaft as three stacked tapering drums, the moonstone set in an eight-voussoir stone frame, roof with a sagging ridge
// (tiles follow a curved slope) on a timber frame with a gable collar.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 21);
  const { box, boxB, put, T, V, jit, beam } = K;
  // steps: ring of rough blocks, low then high
  const ring = (y, h, half, n, depth) => {
    const L = half * 2;
    for (const s of [-1, 1]) {
      for (let i = 0; i < n; i++) { const w = L / n; boxB('stone', w - 0.015, h + jit(0.015), depth, -half + w * (i + 0.5), y, s * (half - depth / 2), jit(0.04), 0.035); }
      const m = Math.max(1, n - 1), w2 = (L - 2 * depth) / m;
      for (let i = 0; i < m; i++) boxB('stone', depth, h + jit(0.015), w2 - 0.015, s * (half - depth / 2), y, -half + depth + w2 * (i + 0.5), jit(0.04), 0.035);
    }
    boxB('stone', L - 2 * depth + 0.01, h - 0.01, L - 2 * depth + 0.01, 0, y, 0, 0, 0);
  };
  ring(0, 0.15, 0.54, 2, 0.3);
  ring(0.15, 0.15, 0.41, 2, 0.2);
  boxB('stone', 0.46, 0.08, 0.2, 0, 0, 0.64, 0.05, 0.03);
  for (const [x, z] of [[-0.45, 0.42], [0.4, -0.46], [0.46, 0.25]]) boxB('kelp', 0.16, 0.02, 0.11, x, 0.15 + 0.01, z, 0.4, 0);
  // plinth with recessed panel: frame bars and a raised diamond boss on each face
  boxB('stone', 0.5, 0.33, 0.5, 0, 0.3, 0, 0, 0.04);
  boxB('stone', 0.56, 0.06, 0.56, 0, 0.6, 0, 0, 0.025);
  for (let f = 0; f < 4; f++) K.frame(T(0, 0.465, 0, 0, f * Math.PI / 2, 0), () => {
    const z = 0.26;
    box('stone', 0.4, 0.035, 0.03, 0, 0.11, z, 0, 0, 0, 0); box('stone', 0.4, 0.035, 0.03, 0, -0.11, z, 0, 0, 0, 0);
    box('stone', 0.035, 0.19, 0.03, 0.18, 0, z, 0, 0, 0, 0); box('stone', 0.035, 0.19, 0.03, -0.18, 0, z, 0, 0, 0, 0);
    box('stone', 0.11, 0.11, 0.045, 0, 0, z, 0, 0, Math.PI / 4, 0);
    box('stone', 0.05, 0.05, 0.03, -0.11, 0, z, 0, 0, Math.PI / 4, 0); box('stone', 0.05, 0.05, 0.03, 0.11, 0, z, 0, 0, Math.PI / 4, 0);
  });
  // shaft: three stacked tapering drums (square, chamfered)
  const drums = [[0.36, 0.66, 0.2], [0.34, 0.86, 0.2], [0.32, 1.06, 0.16]];
  for (const [w, y, h] of drums) boxB('stone', w + jit(0.01), h - 0.005, w + jit(0.01), jit(0.008), y, jit(0.008), jit(0.05), 0.03);
  // capital: underslab + thick slab with zig-zag teeth
  boxB('stone', 0.42, 0.05, 0.42, 0, 1.2, 0, 0, 0.015);
  boxB('stone', 0.62, 0.13, 0.62, 0, 1.24, 0, 0, 0.04);
  for (let f = 0; f < 4; f++) K.frame(T(0, 1.305, 0, 0, f * Math.PI / 2, 0), () => {
    for (let i = 0; i < 4; i++) box('stone', 0.07, 0.07, 0.025, -0.195 + i * 0.13, 0, 0.31, 0, 0, Math.PI / 4, 0);
  });
  // cloth wraps and strips, rope + shells
  const by = 0.95, hw = 0.18;
  for (let f = 0; f < 4; f++) K.frame(T(0, by, 0, 0, f * Math.PI / 2, 0), () => box('tile', hw * 2 + 0.04, 0.09, 0.04, 0, 0, hw, 0, 0, 0, 0));
  box('tile', 0.08, 0.38, 0.03, -0.09, by - 0.22, hw + 0.02, 0.06, 0, 0.07, 0);
  box('cream', 0.06, 0.32, 0.03, 0.02, by - 0.19, hw + 0.025, 0.06, 0, -0.05, 0);
  box('tile', 0.07, 0.3, 0.03, 0.08, by - 0.18, -hw - 0.02, -0.06, 0, 0.05, 0);
  box('cream', 0.06, 0.3, 0.03, -hw - 0.02, by - 0.17, -0.05, 0, 0, -0.06, 0);
  box('cream', 0.06, 0.36, 0.03, 0.29, 1.08, 0.3, 0, 0, 0.05, 0);
  const rope = new THREE.CatmullRomCurve3([V(-0.2, 0.84, 0.12), V(-0.1, 0.77, 0.22), V(0.06, 0.76, 0.22), V(0.2, 0.83, 0.12), V(0.21, 0.85, -0.1), V(0, 0.83, -0.21), V(-0.21, 0.85, -0.1)], true);
  put('rope', new THREE.TubeGeometry(rope, 18, 0.02, 4, true), null);
  const shell = (x, y, z, rx, ry) => put('cream', new THREE.ConeGeometry(0.04, 0.03, 5, 1), T(x, y, z, rx, ry, 0, 1, 1, 0.5));
  for (const [x, y, z, rx, ry] of [[-0.11, 0.72, 0.235, 1.5, 0], [0.0, 0.7, 0.235, 1.5, 0], [0.1, 0.71, 0.235, 1.5, 0], [0.22, 0.77, 0, 1.5, Math.PI / 2], [0.04, 0.77, -0.23, 1.5, Math.PI], [-0.32, 0.31, 0.33, 0, 0], [0.33, 0.31, 0.35, 0, 1], [0.2, 0.16, 0.48, 0, 2]]) shell(x, y + 0.015, z, rx, ry);
  // moonstone in eight-voussoir frame
  const dy = 1.57, R = 0.215;
  boxB('stone', 0.28, 0.08, 0.2, 0, 1.37, 0, 0, 0.025);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; box('stone', 0.17, 0.09, 0.15, Math.cos(a) * R, dy + Math.sin(a) * R, 0, 0, 0, a + Math.PI / 2, 0); }
  put('moonstone', new THREE.SphereGeometry(0.17, 10, 6), T(0, dy, 0, 0, 0, 0, 1, 1, 0.45));
  // timber frame: four posts, side plates, gable collar above the stone
  const px = 0.3, pz = 0.22, y1 = 1.6;
  for (const sx of [-1, 1]) { for (const sz of [-1, 1]) boxB('timber', 0.08, y1 - 1.37, 0.08, sx * px, 1.37, sz * pz, jit(0.05), 0.015); box('timber', 0.085, 0.08, 0.62, sx * px, y1 - 0.02, 0, 0, 0, 0, 0.015); }
  // roof with sagging slope: each slope is bent (tile rows follow a curve dropping steeper near the eave)
  const ridgeY = 1.95, zf = 0.44, L = 0.64, a0 = 0.58, a1 = 0.86;
  const slopePt = (t) => { // t in [0, L] -> (x, y) along a concave curve
    const u = t / L; const ang = a0 + (a1 - a0) * u * u; // steepens toward... keep concave (sag) by flattening at the eave
    let x = 0, y = 0; const n = 8; for (let k = 0; k < n; k++) { const uu = (k + 0.5) / n * u; const an = a1 - (a1 - a0) * uu; x += Math.cos(an) * t / n; y += Math.sin(an) * t / n; }
    return [x, ridgeY - y];
  };
  const tw = 0.21, tl = 0.21, step = 0.14;
  for (const s of [1, -1]) {
    // underboard as short segments along the curve
    for (let k = 0; k < 4; k++) { const [x0, y0] = slopePt(L * k / 4), [x1, y1b] = slopePt(L * (k + 1) / 4); beam('drift', [s * x0, y0 - 0.02, 0], [s * x1, y1b - 0.02, 0], 0.03, 2 * zf, 0); }
    for (let r = 0; r * step + tl <= L + 0.02; r++) {
      const tc = L - tl / 2 - r * step; const [xa, ya] = slopePt(tc - tl / 2), [xb, yb] = slopePt(tc + tl / 2);
      const ang = Math.atan2(ya - yb, xb - xa); const cx = (xa + xb) / 2, cy = (ya + yb) / 2;
      const off = (r % 2) * tw / 2;
      for (let x = -zf - off; x < zf; x += tw) {
        const z0 = Math.max(x, -zf), z1 = Math.min(x + tw * 0.93, zf); if (z1 - z0 < 0.05) continue;
        // tile: thin box, tilted by the slope angle about Z, butt lifted
        box('tile', tl, 0.03, z1 - z0, s * (cx + Math.sin(ang) * 0.03), cy + Math.cos(ang) * 0.03 + jit(0.004), (z0 + z1) / 2, 0, jit(0.05), -s * (ang - 0.2) + jit(0.03), 0);
      }
    }
    // barge boards along the curve, front and back, with upturned tip
    for (const z of [zf + 0.025, -zf - 0.025]) {
      for (let k = 0; k < 3; k++) { const [x0, y0] = slopePt(L * k / 3 - (k ? 0 : 0)), [x1, y1b] = slopePt(L * (k + 1) / 3 + (k === 2 ? 0.02 : 0)); beam('timber', [s * x0, y0 + 0.05, z], [s * x1, y1b + 0.05, z], 0.08, 0.05, 0); }
      const [xe, ye] = slopePt(L); box('timber', 0.1, 0.07, 0.05, s * (xe + 0.04), ye + 0.09, z, 0, 0, s * 0.6, 0);
    }
  }
  // gable collar beam above the stone + ridge
  for (const z of [zf - 0.02, -zf + 0.02]) box('timber', 0.3, 0.06, 0.06, 0, 1.85, z, 0, 0, 0, 0);
  box('timber', 0.1, 0.1, 2 * zf + 0.14, 0, ridgeY + 0.07, 0, 0, 0, Math.PI / 4, 0.02);
  K.finish(g);
  return recentre(THREE, g);
}
