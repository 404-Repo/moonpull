// market_stall A: primitives. Half-timbered booth (plaster panels between chamfered posts) on a stone plinth,
// gable tile roof with ridge along X, front awning of alternating red / cream slats on two projecting side
// beams carried by front posts on stone footings, plank counter with five open crates of fish on ice, lanterns.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 41);
  const { box, boxB, beam, cyl, put, frame, T, jit, rnd } = K;
  addMat(K, 'cloth', 0xe9dcc0, 0.9, 'fabric');
  addMat(K, 'clothred', 0xb5402f, 0.9, 'fabric');
  addMat(K, 'fish', 0x8a9aa2, 0.45, null);
  addMat(K, 'fishred', 0xc0583e, 0.6, null);
  const ice = 'cream';
  // ---- booth frame ----
  const BX = 1.25, BZ0 = -1.05, BZ1 = -0.1, SILL = 0.32, PLATE = 2.4;
  // stone plinth blocks around back + sides
  const plinth = (x0, x1, z0, z1) => { const n = Math.max(1, Math.round(Math.max(x1 - x0, z1 - z0) / 0.45)); for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; boxB('stone', (x1 - x0) * (z1 - z0 > x1 - x0 ? 1 : (t1 - t0)) - 0.02 + (z1 - z0 > x1 - x0 ? 0 : 0), SILL + jit(0.02), (z1 - z0) * (z1 - z0 > x1 - x0 ? (t1 - t0) : 1) - 0.02, z1 - z0 > x1 - x0 ? (x0 + x1) / 2 : x0 + (x1 - x0) * (t0 + t1) / 2, 0, z1 - z0 > x1 - x0 ? z0 + (z1 - z0) * (t0 + t1) / 2 : (z0 + z1) / 2, 0, 0.04); } };
  plinth(-BX - 0.1, BX + 0.1, BZ0 - 0.1, BZ0 + 0.12);
  plinth(-BX - 0.1, -BX + 0.12, BZ0 + 0.12, BZ1 + 0.1);
  plinth(BX - 0.12, BX + 0.1, BZ0 + 0.12, BZ1 + 0.1);
  for (const x of [-BX, BX]) for (const z of [BZ0, BZ1]) boxB('timber', 0.17, PLATE - SILL + 0.12, 0.17, x, SILL, z, jit(0.03), 0.03);
  for (const z of [BZ0, BZ1]) box('timber', 2 * BX + 0.3, 0.16, 0.18, 0, PLATE + 0.08, z, 0, 0, 0, 0.03);
  for (const x of [-BX, BX]) box('timber', 0.18, 0.16, BZ1 - BZ0 + 0.3, x, PLATE + 0.08, (BZ0 + BZ1) / 2, 0, 0, 0, 0.03);
  // plaster panels set slightly back, mid rail + braces
  box('plaster', 2 * BX - 0.1, PLATE - SILL, 0.1, 0, (PLATE + SILL) / 2, BZ0 - 0.0, 0, 0, 0, 0);
  for (const sx of [-1, 1]) {
    box('plaster', 0.1, PLATE - SILL, BZ1 - BZ0 - 0.1, sx * BX, (PLATE + SILL) / 2, (BZ0 + BZ1) / 2, 0, 0, 0, 0);
    box('timber', 0.14, 0.12, BZ1 - BZ0, sx * (BX + 0.04), 1.35, (BZ0 + BZ1) / 2, 0, 0, 0, 0.02);
    beam('timber', [sx * (BX + 0.04), SILL + 0.05, BZ0 + 0.08], [sx * (BX + 0.04), 1.3, BZ1 - 0.08], 0.13, 0.11, 0.02);
  }
  box('timber', 2 * BX, 0.12, 0.14, 0, 1.35, BZ0 - 0.04, 0, 0, 0, 0.02);
  box('timber', 0.13, PLATE - SILL, 0.14, 0, (PLATE + SILL) / 2, BZ0 - 0.04, 0, 0, 0, 0.02);
  // ---- gable roof, ridge along X ----
  const RZ = -0.55, RY = 3.04, RUN = 1.0, DROP = 0.62, W = 3.0, OVZ = 0.0;
  const ang = Math.atan2(DROP, RUN), L = Math.hypot(RUN, DROP) + 0.08;
  const slope = (ry, x0) => frame(T(x0, RY, RZ, ang, ry, 0), () => {
    box('timber', W, 0.07, L, W / 2, -0.06, L / 2, 0, 0, 0, 0.02);
    const tw = 0.42, tl = 0.5, step = tl * 0.66; const rows = Math.ceil((L - 0.05) / step);
    for (let r = 0; r < rows; r++) {
      const zc = L - tl / 2 - r * step; const off = (r % 2) * tw * 0.5; const n = Math.ceil((W + tw) / tw);
      for (let i = 0; i < n; i++) {
        let a = -tw / 2 + off + i * tw, b = a + tw * 0.94; a = Math.max(a, 0); b = Math.min(b, W); if (b - a < 0.1) continue;
        box('tile', b - a, 0.05, tl, (a + b) / 2 + jit(0.01), 0.03 + jit(0.008), zc, -0.1 + jit(0.03), jit(0.04), jit(0.03), 0);
      }
    }
  });
  slope(0, -W / 2); slope(Math.PI, W / 2);
  box('tile', W + 0.04, 0.12, 0.2, 0, RY + 0.06, RZ, 0, 0, 0, 0.04);
  // gable infill + king post
  for (const sx of [-1, 1]) {
    const sh = new THREE.Shape([[BZ0, PLATE + 0.16], [BZ1, PLATE + 0.16], [BZ1, RY - DROP * Math.abs(BZ1 - RZ) / RUN - 0.07], [RZ, RY - 0.08], [BZ0, RY - DROP * Math.abs(BZ0 - RZ) / RUN - 0.07]].map((p) => new THREE.Vector2(p[0], p[1])));
    put('plaster', new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }), T(sx * BX - 0.05, 0, 0, 0, -Math.PI / 2, 0));
    box('timber', 0.13, RY - PLATE - 0.3, 0.13, sx * (BX + 0.04), (RY + PLATE) / 2, RZ, 0, 0, 0, 0.02);
  }
  // ---- front posts, awning beams, awning slats ----
  const FZ = 0.95, FXp = 1.32, AY0 = 2.5, AY1 = 2.12, AZ0 = -0.15, AZ1 = 1.22;
  for (const sx of [-1, 1]) {
    boxB('stone', 0.3, 0.26, 0.3, sx * FXp, 0, FZ, jit(0.1), 0.04);
    boxB('timber', 0.17, AY1 + 0.02 - 0.26, 0.17, sx * FXp, 0.26, FZ, 0, 0.03);
    beam('timber', [sx * FXp, AY0 + 0.1, AZ0 - 0.1], [sx * FXp, AY1 + 0.04, AZ1 + 0.15], 0.18, 0.16, 0.03);
    beam('timber', [sx * FXp, AY1 - 0.45, FZ], [sx * FXp, AY1 - 0.05, FZ - 0.4], 0.11, 0.11, 0.02);
    put('rope', new THREE.TorusGeometry(0.11, 0.025, 4, 8), T(sx * FXp, 0.98, FZ, Math.PI / 2));
  }
  box('timber', 2 * FXp, 0.14, 0.14, 0, AY1 - 0.04, FZ, 0, 0, 0, 0.03);
  const NS = 10, SW = (2 * FXp - 0.2) / NS, aang = Math.atan2(AY0 - AY1, AZ1 - AZ0), AL = Math.hypot(AY0 - AY1, AZ1 - AZ0);
  for (let i = 0; i < NS; i++) {
    const x = -FXp + 0.1 + SW * (i + 0.5), key = i % 2 ? 'cloth' : 'clothred';
    frame(T(x, AY0 + 0.12, AZ0, aang, 0, 0), () => {
      box(key, SW + 0.004, 0.04, AL, 0, 0.02, AL / 2, 0, 0, 0, 0);
      box(key, SW + 0.004, 0.24 + (i % 3) * 0.02, 0.04, 0, -0.1, AL + 0.01, -aang, 0, 0, 0);
    });
  }
  // ---- counter ----
  const CZ = 0.72, CW = 2.3, CH = 0.92, CD = 0.5;
  box('timber', CW, CH - 0.06, CD - 0.06, 0, (CH - 0.06) / 2, CZ, 0, 0, 0, 0);
  const NP = 7; for (let i = 0; i < NP; i++) box(i % 2 ? 'timber' : 'wet', CW / NP - 0.015, CH - 0.12, 0.05, -CW / 2 + CW / NP * (i + 0.5), (CH - 0.06) / 2, CZ + CD / 2 - 0.01, 0, 0, jit(0.01), 0.012);
  for (const y of [0.16, CH - 0.2]) box('wet', CW + 0.04, 0.1, 0.06, 0, y, CZ + CD / 2 + 0.04, 0, 0, 0, 0.02);
  for (const sx of [-1, 1]) box('wet', 0.1, CH - 0.06, 0.08, sx * (CW / 2 - 0.02), (CH - 0.06) / 2, CZ + CD / 2 + 0.04, 0, 0, 0, 0.02);
  box('drift', CW + 0.14, 0.07, CD + 0.12, 0, CH, CZ + 0.03, 0, 0, 0, 0.025);
  // crates on the counter, tilted toward the buyer
  const crate = (x, z, tilt, fishKey) => frame(T(x, CH + 0.035, z, -tilt, jit(0.08), 0), () => {
    const w = 0.42, d = 0.3, h = 0.13;
    boxB('timber', w, 0.03, d, 0, 0, 0, 0, 0);
    for (const s of [-1, 1]) { boxB('timber', w, h, 0.03, 0, 0, s * (d / 2 - 0.015), 0, 0); boxB('timber', 0.03, h, d - 0.06, s * (w / 2 - 0.015), 0, 0, 0, 0); }
    boxB(ice, w - 0.06, h - 0.04, d - 0.06, 0, 0.02, 0, 0, 0.02);
    for (let k = 0; k < 3; k++) put(fishKey, new THREE.SphereGeometry(0.045, 6, 4), T(-0.12 + k * 0.12 + jit(0.02), h + 0.0, jit(0.05), 0, 0.3 + jit(0.4), Math.PI / 2, 1, 3.0, 0.8));
  });
  crate(-0.85, CZ + 0.08, 0.16, 'fish'); crate(-0.4, CZ + 0.08, 0.16, 'fishred'); crate(0.05, CZ + 0.08, 0.16, 'fish');
  crate(0.5, CZ + 0.08, 0.16, 'fishred'); crate(-0.62, CZ - 0.18, 0.05, 'fish');
  // cutting board, small tub
  box('drift', 0.42, 0.04, 0.24, 0.55, CH + 0.055, CZ - 0.2, 0, 0.2, 0, 0.012);
  K.lathe('timber', [[0, 0], [0.13, 0], [0.15, 0.2], [0.13, 0.2], [0.12, 0.04], [0, 0.04]], 8, T(0.92, CH + 0.035, CZ - 0.12));
  // back shelf with a barrel and a scale
  box('drift', 2 * BX - 0.1, 0.06, 0.32, 0, 1.0, BZ0 + 0.22, 0, 0, 0, 0.02);
  for (const sx of [-0.9, 0.9]) boxB('timber', 0.08, 0.97, 0.08, sx, 0, BZ0 + 0.3, 0, 0);
  K.lathe('timber', [[0, 0], [0.16, 0], [0.19, 0.17], [0.16, 0.34], [0, 0.34]], 8, T(-0.6, 1.03, BZ0 + 0.22));
  for (const y of [1.08, 1.32]) put('iron', new THREE.TorusGeometry(0.175, 0.012, 3, 8), T(-0.6, y, BZ0 + 0.22, Math.PI / 2));
  cyl('iron', 0.11, 0.08, 0.06, 8, 0.7, 1.33, BZ0 + 0.22); cyl('iron', 0.025, 0.025, 0.25, 5, 0.7, 1.16, BZ0 + 0.22);
  // lanterns: front beam ends + right wall
  const lantern = (x, y, z) => {
    box('iron', 0.2, 0.05, 0.2, x, y + 0.13, z, 0, 0, 0, 0.015); box('iron', 0.17, 0.04, 0.17, x, y - 0.13, z, 0, 0, 0, 0.012);
    box('lampglow', 0.13, 0.22, 0.13, x, y, z, 0, 0, 0, 0);
    for (const a of [-1, 1]) for (const b of [-1, 1]) box('iron', 0.04, 0.24, 0.04, x + a * 0.075, y, z + b * 0.075, 0, 0, 0, 0);
    put('iron', new THREE.TorusGeometry(0.05, 0.012, 3, 8), T(x, y + 0.2, z));
  };
  for (const sx of [-1, 1]) { lantern(sx * (FXp + 0.0), AY1 - 0.38, AZ1 + 0.1); box('iron', 0.04, 0.12, 0.04, sx * FXp, AY1 - 0.1, AZ1 + 0.1, 0, 0, 0, 0); }
  lantern(BX + 0.24, 2.0, -0.5); box('iron', 0.18, 0.04, 0.04, BX + 0.16, 2.26, -0.5, 0, 0, 0, 0);
  K.finish(g);
  return recentre(THREE, g);
}
