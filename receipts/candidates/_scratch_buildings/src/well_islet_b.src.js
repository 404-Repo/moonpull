// well_islet B: profiles. Stones are bevelled annular sectors (Extrude), posts/windlass/bucket/barnacles are Lathes,
// each gable truss is one extruded A-frame outline with a hole, tile rows are single extruded strips with tongue-and-notch lower edges.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 32);
  const { box, beam, jit, put, T } = K;
  const V2 = (p) => new THREE.Vector2(p[0], p[1]);
  const lathe = (key, pts, seg, m, phi = 0) => put(key, new THREE.LatheGeometry(pts.map(V2), seg, phi), m);
  const exShape = (pts, depth, bev, holes) => {
    const sh = new THREE.Shape(pts.map(V2)); if (holes) holes.forEach((h) => sh.holes.push(new THREE.Path(h.map(V2))));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: bev > 0, bevelSize: bev, bevelThickness: bev, bevelSegments: 1, curveSegments: 2 });
    return geo;
  };
  // ring of sector stones (bevel subtracted so the course is the size drawn)
  const ring = (n, r0, r1, y0, h, off) => {
    const b = 0.025;
    for (let i = 0; i < n; i++) {
      const gap = 0.05 / ((r0 + r1) / 2) + (2 * b) / ((r0 + r1) / 2);
      const a0 = (i + off) / n * Math.PI * 2 + gap / 2, a1 = (i + 1 + off) / n * Math.PI * 2 - gap / 2, am = (a0 + a1) / 2;
      const R0 = r0 + b + jit(0.015), R1 = r1 - b + jit(0.02);
      const pts = [[R0 * Math.cos(a0), R0 * Math.sin(a0)], [R0 * Math.cos(am), R0 * Math.sin(am)], [R0 * Math.cos(a1), R0 * Math.sin(a1)], [R1 * Math.cos(a1), R1 * Math.sin(a1)], [R1 * Math.cos(am), R1 * Math.sin(am)], [R1 * Math.cos(a0), R1 * Math.sin(a0)]];
      const hh = h - 2 * b + jit(0.02);
      put('stone', exShape(pts, hh, b), T(0, y0 + b, 0, -Math.PI / 2, 0, 0));
    }
  };
  ring(11, 0.72, 1.0, 0, 0.36, 0);
  ring(10, 0.62, 0.86, 0.36, 0.3, 0.5);
  ring(10, 0.6, 0.9, 0.66, 0.28, 0);
  K.cyl('iron', 0.63, 0.63, 0.04, 14, 0, 0.82, 0);
  // barnacles (tiny lathe volcanoes) and kelp blades
  for (let i = 0; i < 12; i++) {
    const a = K.rnd() * Math.PI * 2, y = 0.07 + K.rnd() * 0.25, s = 0.7 + K.rnd() * 0.6;
    lathe('cream', [[0.012, 0.03], [0.04, 0.0], [0.05, -0.02]], 5, T(Math.cos(a) * 1.0, y, Math.sin(a) * 1.0, 0, 0, 0, s, s, s).multiply(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(a), 0.2, Math.sin(a)).normalize()))));
  }
  for (const a0 of [0.7, 2.3, 3.7, 5.2]) for (let j = 0; j < 3; j++) {
    const a = a0 + j * 0.12, h = 0.4 + K.rnd() * 0.25;
    put('kelp', exShape([[-0.04, 0], [0.04, 0], [0.03, h * 0.6], [0.06, h], [-0.01, h * 0.7]], 0.02, 0), T(Math.cos(a) * 1.02, 0.15, Math.sin(a) * 1.02, jit(0.25), -a + Math.PI / 2, jit(0.3)));
  }
  // posts (lathe, 4 segments = square, flared foot)
  const PX = 0.8, EY = 2.25, RY = 2.9;
  for (const s of [-1, 1]) {
    lathe('timber', [[0, 0], [0.15, 0], [0.12, 0.12], [0.12, EY - 0.62], [0, EY - 0.62]], 4, T(s * PX, 0.6, 0), Math.PI / 4);
    // gable truss: one outline (rafters + tie + king post) with two holes
    const out = [[-0.95, 0], [0.95, 0], [0.95, 0.1], [0.13, RY - EY + 0.05], [-0.13, RY - EY + 0.05], [-0.95, 0.1]];
    const hy = RY - EY;
    const holes = [[[-0.72, 0.1], [-0.07, 0.1], [-0.07, hy * 0.82]], [[0.07, 0.1], [0.72, 0.1], [0.07, hy * 0.82]]];
    const tg = exShape(out, 0.12, 0, holes); tg.translate(0, 0, -0.06);
    put('timber', tg, T(s * PX, EY - 0.05, 0, 0, Math.PI / 2, 0));
    beam('timber', [s * PX, EY - 0.5, 0.08], [s * PX, EY - 0.05, 0.5], 0.09, 0.09, 0);
    beam('timber', [s * PX, EY - 0.5, -0.08], [s * PX, EY - 0.05, -0.5], 0.09, 0.09, 0);
  }
  box('timber', 2.42, 0.16, 0.18, 0, RY + 0.1, 0, 0, 0, 0, 0.04);
  // roof: board + extruded tile rows
  const run = 1.02, rise = RY - EY + 0.03, a = Math.atan2(rise, run), L = Math.hypot(run, rise) + 0.05, W = 2.3;
  const row = (zTop, zBot, off) => {
    const pts = [[0, 0], [W, 0]]; zBot = zBot - zTop; const tw = 0.38;
    const xs = []; for (let x = W; x > 0.001; x -= tw) xs.push(x); xs.push(0);
    // shape y = -z so walking right-to-left along the bottom keeps a simple polygon
    for (let i = 0; i < xs.length - 1; i++) {
      const x1 = xs[i] - (i === 0 ? 0 : 0.015), x0 = Math.max(xs[i + 1] + 0.015, 0);
      pts.push([x1, -(zBot - 0.05)], [x1 - 0.04, -zBot], [x0 + 0.04, -zBot], [x0, -(zBot - 0.05)]);
    }
    return exShape(pts, 0.045, 0);
  };
  const slope = (m) => K.frame(m, () => {
    box('timber', W, 0.06, L, W / 2, -0.03, L / 2, 0, 0, 0, 0.015);
    for (let r = 0; r < 4; r++) {
      const zb = L - r * 0.29, zt = zb - 0.36;
      // shape plane XY -> slope plane: rx=+90deg maps shape y to -z... use rx so shape y(-z) -> +z down-slope
      put('tile', row(Math.max(zt, 0), zb), T(0, 0.01, Math.max(zt, 0), -Math.PI / 2 - 0.12, 0, 0));
    }
  });
  slope(T(-W / 2, RY + 0.05, 0, a, 0, 0));
  slope(T(W / 2, RY + 0.05, 0, a, Math.PI, 0));
  // windlass log (lathe, along X) with rope coil
  const WY = 1.6;
  lathe('timber', [[0, -0.74], [0.1, -0.74], [0.11, -0.6], [0.11, 0.6], [0.1, 0.74], [0, 0.74]], 8, T(0, WY, 0, 0, 0, Math.PI / 2));
  lathe('rope', [[0, -0.16], [0.14, -0.16], [0.155, -0.08], [0.14, 0], [0.155, 0.08], [0.14, 0.16], [0, 0.16]], 8, T(-0.05, WY, 0, 0, 0, Math.PI / 2));
  K.cyl('rope', 0.015, 0.015, 0.4, 4, 0, WY - 0.33, 0.13);
  K.cyl('timber', 0.04, 0.04, 0.25, 6, PX + 0.18, WY, 0, 0, 0, Math.PI / 2);
  box('timber', 0.06, 0.32, 0.08, PX + 0.3, WY - 0.13, 0, 0, 0, 0, 0.015);
  K.cyl('timber', 0.035, 0.035, 0.22, 6, PX + 0.4, WY - 0.26, 0, 0, 0, Math.PI / 2);
  // bucket (lathe, closed)
  const BY = 0.94;
  lathe('timber', [[0, 0], [0.105, 0], [0.14, 0.22], [0.12, 0.22], [0.09, 0.04], [0, 0.04]], 8, T(0, BY, 0.13));
  lathe('iron', [[0.12, 0.05], [0.125, 0.08], [0.13, 0.08], [0.125, 0.05]], 8, T(0, BY, 0.13));
  lathe('iron', [[0.135, 0.17], [0.14, 0.2], [0.145, 0.2], [0.14, 0.17]], 8, T(0, BY, 0.13));
  put('iron', new THREE.TorusGeometry(0.14, 0.012, 3, 8, Math.PI), T(0, BY + 0.22, 0.13));
  K.finish(g);
  return recentre(THREE, g);
}
