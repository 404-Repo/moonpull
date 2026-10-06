// market_stall C: different part breakdown. Booth walls are thick solid plaster slabs with half-timber
// boards applied proud of them; the roof is two thick slabs carrying long tile COURSES (each course 3 bars
// angled into a sagging ridge) instead of single tiles; the awning is one folded piece per stripe that bends
// down into the valance; crates sit on a two-step tiered display; lanterns hang on chain from the beams.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 47);
  const { box, boxB, beam, cyl, put, frame, T, jit, rnd } = K;
  addMat(K, 'cloth', 0xe9dcc0, 0.9, 'fabric');
  addMat(K, 'clothred', 0xb5402f, 0.9, 'fabric');
  addMat(K, 'fish', 0x8a9aa2, 0.45, null);
  addMat(K, 'fishred', 0xc0583e, 0.6, null);
  const BX = 1.22, BZ0 = -1.05, BZ1 = -0.2, H = 2.35;
  // solid walls on a stone course
  boxB('stone', 2 * BX + 0.34, 0.3, 0.34, 0, 0, BZ0, 0, 0.05);
  for (const sx of [-1, 1]) boxB('stone', 0.34, 0.3, BZ1 - BZ0 + 0.1, sx * BX, 0, (BZ0 + BZ1) / 2 + 0.05, 0, 0.05);
  boxB('plaster', 2 * BX + 0.16, H - 0.3, 0.18, 0, 0.3, BZ0, 0, 0.04);
  for (const sx of [-1, 1]) boxB('plaster', 0.18, H - 0.3, BZ1 - BZ0, sx * BX, 0.3, (BZ0 + BZ1) / 2 + 0.05, 0, 0.04);
  // applied half-timber: posts, rails, X braces on the back, single brace on the sides
  const ZB = BZ0 - 0.1;
  for (const x of [-BX - 0.02, -0.4, 0.4, BX + 0.02]) box('timber', 0.15, H - 0.25, 0.07, x, 0.3 + (H - 0.25) / 2, ZB, 0, 0, 0, 0.02);
  for (const y of [0.36, 1.35, H + 0.02]) box('timber', 2 * BX + 0.2, 0.13, 0.07, 0, y, ZB, 0, 0, 0, 0.02);
  beam('timber', [-0.4, 0.42, ZB], [0.4, 1.29, ZB], 0.12, 0.06, 0); beam('timber', [0.4, 0.42, ZB], [-0.4, 1.29, ZB], 0.12, 0.06, 0);
  for (const sx of [-1, 1]) {
    const xs = sx * (BX + 0.1);
    for (const z of [BZ0 - 0.02, BZ1 + 0.05]) box('timber', 0.07, H - 0.25, 0.15, xs, 0.3 + (H - 0.25) / 2, z, 0, 0, 0, 0.02);
    for (const y of [0.36, 1.35, H + 0.02]) box('timber', 0.07, 0.13, BZ1 - BZ0 + 0.12, xs, y, (BZ0 + BZ1) / 2 + 0.02, 0, 0, 0, 0.02);
    beam('timber', [xs, 1.41, BZ0 + 0.05], [xs, H - 0.04, BZ1 - 0.02], 0.06, 0.12, 0);
  }
  // roof slabs with sagging tile courses
  const RZ = -0.62, RY = 3.02, RUN = 1.02, DROP = 0.6, W = 3.0;
  const ang = Math.atan2(DROP, RUN), L = Math.hypot(RUN, DROP) + 0.06;
  for (const [ry, x0] of [[0, -W / 2], [Math.PI, W / 2]]) frame(T(x0, RY, RZ, ang, ry, 0), () => {
    box('timber', W, 0.1, L, W / 2, -0.07, L / 2, 0, 0, 0, 0.03);
    const NC = 6, step = L / NC;
    for (let c = 0; c < NC; c++) {
      const z = L - step * (c + 0.5);
      // three bars per course; the middle one dips (sag) and the ends tilt toward it
      const segs = [[0, W / 3, 0.03], [W / 3, 2 * W / 3, -0.035], [2 * W / 3, W, 0.03]];
      for (const [a, b, s] of segs) box('tile', b - a + 0.03, 0.07, step + 0.07, (a + b) / 2, 0.035 + (s < 0 ? -0.025 : 0) + jit(0.006), z, -0.12, jit(0.02), (a < 0.1 ? -1 : a > W / 2 ? 1 : 0) * 0.02 + jit(0.01), 0.025);
      for (let k = 1; k < 7; k++) box('timber', 0.04, 0.05, step * 0.9, (W / 7) * k + jit(0.05) + (c % 2) * 0.2, 0.06, z + 0.02, -0.12, 0, 0, 0);
    }
  });
  box('tile', W + 0.06, 0.14, 0.22, 0, RY + 0.05, RZ, 0, 0, 0, 0.05);
  for (const sx of [-1, 1]) {
    const sh = new THREE.Shape([[BZ0 - 0.09, H + 0.08], [BZ1 + 0.09, H + 0.08], [BZ1 + 0.09, RY - DROP * Math.abs(BZ1 + 0.09 - RZ) / RUN - 0.1], [RZ, RY - 0.12], [BZ0 - 0.09, RY - DROP * Math.abs(BZ0 - 0.09 - RZ) / RUN - 0.1]].map((p) => new THREE.Vector2(p[0], p[1])));
    put('plaster', new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: false }), T(sx * BX - 0.09, 0, 0, 0, -Math.PI / 2, 0));
    box('timber', 0.07, RY - H - 0.25, 0.14, sx * (BX + 0.1), (RY + H) / 2 - 0.04, RZ, 0, 0, 0, 0.02);
  }
  // front frame
  const FZ = 0.9, FXp = 1.3, AY0 = 2.45, AY1 = 2.08, AZ0 = -0.15, AZ1 = 1.15;
  for (const sx of [-1, 1]) {
    boxB('stone', 0.3, 0.14, 0.3, sx * FXp, 0, FZ, 0, 0.04); boxB('stone', 0.24, 0.12, 0.24, sx * FXp, 0.14, FZ, 0.3, 0.03);
    boxB('timber', 0.17, AY1 - 0.24, 0.17, sx * FXp, 0.26, FZ, 0, 0.03);
    beam('timber', [sx * FXp, AY0 + 0.08, AZ0 - 0.15], [sx * FXp, AY1 + 0.0, AZ1 + 0.2], 0.17, 0.17, 0.03);
    beam('timber', [sx * FXp, AY1 - 0.45, FZ], [sx * FXp, AY1 - 0.05, FZ - 0.4], 0.1, 0.1, 0.02);
    put('rope', new THREE.TorusGeometry(0.11, 0.028, 4, 8), T(sx * FXp, 0.97, FZ, Math.PI / 2));
  }
  // awning: each stripe folds over the front beam into the valance
  const NS = 9, SW = (2 * FXp - 0.16) / NS;
  for (let i = 0; i < NS; i++) {
    const key = i % 2 ? 'cloth' : 'clothred'; const x = -FXp + 0.08 + SW * (i + 0.5);
    const tip = [x, AY1 + 0.1, AZ1 + 0.05], bot = [x, AY1 - 0.16 - (i % 2) * 0.04, AZ1 + 0.08];
    beam(key, [x, AY0 + 0.15, AZ0], [x, (AY0 + AY1) / 2 + 0.07, (AZ0 + AZ1) / 2], SW + 0.004, 0.045, 0);
    beam(key, [x, (AY0 + AY1) / 2 + 0.07, (AZ0 + AZ1) / 2], tip, SW + 0.004, 0.045, 0);
    beam(key, tip, bot, SW + 0.004, 0.045, 0);
  }
  box('drift', 2 * FXp, 0.1, 0.1, 0, AY1 + 0.04, AZ1, 0, 0, 0, 0.02);
  // tiered counter
  const CZ = 0.62, CW = 2.25;
  boxB('timber', CW, 0.6, 0.62, 0, 0, CZ, 0, 0.03);
  for (let i = 0; i < 9; i++) box('wet', 0.05, 0.56, 0.04, -CW / 2 + 0.1 + i * (CW - 0.2) / 8, 0.3, CZ + 0.32, 0, 0, 0, 0);
  boxB('timber', CW, 0.32, 0.36, 0, 0.6, CZ - 0.13, 0, 0.03);
  boxB('drift', CW + 0.1, 0.06, 0.32, 0, 0.6, CZ + 0.19, 0, 0.02);
  boxB('drift', CW + 0.1, 0.06, 0.4, 0, 0.92, CZ - 0.13, 0, 0.02);
  const crate = (x, y, z, tilt, fishKey) => frame(T(x, y, z, -tilt, jit(0.08), 0), () => {
    const w = 0.4, d = 0.28, h = 0.13;
    boxB('timber', w, 0.03, d, 0, 0, 0, 0, 0);
    for (const s of [-1, 1]) { boxB('timber', w, h, 0.03, 0, 0, s * (d / 2 - 0.015), 0, 0); boxB('timber', 0.03, h, d - 0.06, s * (w / 2 - 0.015), 0, 0, 0, 0); }
    boxB('cream', w - 0.06, h - 0.04, d - 0.06, 0, 0.02, 0, 0, 0.02);
    for (let k = 0; k < 3; k++) put(fishKey, new THREE.SphereGeometry(0.045, 6, 4), T(-0.12 + k * 0.12 + jit(0.02), h, jit(0.05), 0, 0.3 + jit(0.4), Math.PI / 2, 1, 3.0, 0.8));
  });
  [-0.84, -0.42, 0, 0.42, 0.84].forEach((x, i) => crate(x, 0.66, CZ + 0.19, 0.12, i % 2 ? 'fishred' : 'fish'));
  [-0.6, -0.15, 0.3].forEach((x, i) => crate(x, 0.98, CZ - 0.13, 0.08, i % 2 ? 'fish' : 'fishred'));
  K.lathe('timber', [[0, 0], [0.16, 0], [0.19, 0.17], [0.16, 0.34], [0, 0.34]], 8, T(0.85, 0.98, CZ - 0.13));
  for (const y of [1.03, 1.27]) put('iron', new THREE.TorusGeometry(0.175, 0.012, 3, 8), T(0.85, y, CZ - 0.13, Math.PI / 2));
  // back shelf
  box('drift', 2 * BX - 0.2, 0.06, 0.3, 0, 1.3, BZ0 + 0.24, 0, 0, 0, 0.02);
  for (let i = 0; i < 4; i++) K.lathe('timber', [[0, 0], [0.09, 0], [0.1, 0.16], [0, 0.16]], 6, T(-0.8 + i * 0.5, 1.33, BZ0 + 0.24));
  // lanterns on chains
  const lantern = (x, y, z) => {
    box('iron', 0.2, 0.05, 0.2, x, y + 0.13, z, 0, 0.4, 0, 0.015); K.lathe('iron', [[0, 0], [0.1, 0], [0, 0.08]], 4, T(x, y + 0.155, z, 0, 0.4 + Math.PI / 4, 0));
    box('iron', 0.17, 0.04, 0.17, x, y - 0.13, z, 0, 0.4, 0, 0.012);
    box('lampglow', 0.13, 0.22, 0.13, x, y, z, 0, 0.4, 0, 0);
    for (let k = 0; k < 3; k++) put('iron', new THREE.TorusGeometry(0.035, 0.01, 3, 6), T(x, y + 0.23 + k * 0.06, z, 0, k * 1.57, 0));
  };
  for (const sx of [-1, 1]) lantern(sx * FXp, AY1 - 0.42, AZ1 + 0.08);
  lantern(BX + 0.32, 1.92, -0.62); box('iron', 0.22, 0.04, 0.04, BX + 0.22, 2.36, -0.62, 0, 0, 0, 0);
  K.finish(g);
  return recentre(THREE, g);
}
