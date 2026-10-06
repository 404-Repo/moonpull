// stilt_house_a B: profiles. Walls are extruded Shapes with real window holes, frames/railings/ladder/
// X-brace panels are single extruded outlines with holes, posts are lathed octagons, roof is an
// extruded inverted-V slab with scalloped extruded tile-row strips, gables board-and-batten.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 41);
  const { frame, T, put, jit } = K;
  const box = (k, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, c = 0.03) => K.box(k, w, h, d, x, y, z, rx, ry, rz, Math.min(w, h, d) < 0.135 ? 0 : c);
  const boxB = (k, w, h, d, x, y, z, ry = 0, c = 0.03) => box(k, w, h, d, x, y + h / 2, z, 0, ry, 0, c);
  const beam = (k, a, b, w, d, c = 0.03) => K.beam(k, a, b, w, d, Math.min(w, d) < 0.135 ? 0 : c);
  const HX = 2.3, HZ = 2.2, FL = 2.55, TOP = 5.0, PT = 1.25, OV = 0.6, OZ = 0.6;
  const PC = 1 / Math.hypot(1, PT);
  const R = TOP + 0.12 + 0.12 / PC + HX * PT;
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const rectPts = (x0, y0, x1, y1) => [V2(x0, y0), V2(x1, y0), V2(x1, y1), V2(x0, y1)];
  // extrude a shape (outer pts, hole rects) in local XY, depth along local z, centred on z=zc
  function ext(key, outer, holes, depth, zc = 0, m) {
    const sh = new THREE.Shape(outer);
    for (const h of holes || []) sh.holes.push(new THREE.Path(h.reverse ? h : h));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 2 });
    geo.translate(0, 0, zc - depth / 2);
    put(key, geo, m);
  }
  // frame outline: rect ring
  const ring = (key, x0, y0, x1, y1, t, depth, zc) => ext(key, rectPts(x0 - t, y0 - t, x1 + t, y1 + t), [rectPts(x0, y0, x1, y1)], depth, zc);
  function wall(key, x0, x1, y0, y1, t, holes) {
    ext(key, rectPts(x0, y0, x1, y1), holes.map((h) => rectPts(h.x0, h.y0, h.x1, h.y1)), t, -t / 2);
  }
  function win(h, t, shut) {
    const w = h.x1 - h.x0, ht = h.y1 - h.y0, cx = (h.x0 + h.x1) / 2;
    ring('timber', h.x0, h.y0, h.x1, h.y1, 0.11, 0.16, 0.03);
    box('timber', w + 0.4, 0.1, 0.26, cx, h.y0 - 0.12, 0.08, 0, 0, 0, 0.03);
    box('wet', w, ht, 0.04, cx, h.y0 + ht / 2, -t + 0.03, 0, 0, 0, 0);
    if (shut !== 'closed') {
      box('window', w, ht, 0.03, cx, h.y0 + ht / 2, -t + 0.07);
      // glazing bars as one extruded grid
      ext('timber', rectPts(h.x0, h.y0, h.x1, h.y1), [rectPts(h.x0 + 0.03, h.y0 + 0.03, cx - 0.025, h.y0 + ht / 2 - 0.025), rectPts(cx + 0.025, h.y0 + 0.03, h.x1 - 0.03, h.y0 + ht / 2 - 0.025), rectPts(h.x0 + 0.03, h.y0 + ht / 2 + 0.025, cx - 0.025, h.y1 - 0.03), rectPts(cx + 0.025, h.y0 + ht / 2 + 0.025, h.x1 - 0.03, h.y1 - 0.03)], 0.05, -t + 0.11);
    }
    // shutter = extruded board outline with V-grooves cut as slits, plus Z-batten
    const leaf = (x0, x1, z) => {
      const n = 3, bw = (x1 - x0) / n, pts = [];
      pts.push(V2(x0, h.y0 + 0.02), V2(x1, h.y0 + 0.02));
      for (let i = n; i > 0; i--) { const xa = x0 + bw * i, xb = xa - bw; pts.push(V2(xa, h.y1 - 0.02 - (i % 2) * 0.03), V2(xb + 0.02, h.y1 - 0.02 - (i % 2) * 0.03), V2(xb + 0.01, h.y1 - 0.05)); }
      ext('drift', pts, [], 0.05, z);
      for (let i = 1; i < n; i++) box('wet', 0.02, ht - 0.1, 0.02, x0 + bw * i, h.y0 + ht / 2, z + 0.022);
      box('drift', x1 - x0 - 0.04, 0.07, 0.04, (x0 + x1) / 2, h.y0 + ht * 0.2, z + 0.045);
      box('drift', x1 - x0 - 0.04, 0.07, 0.04, (x0 + x1) / 2, h.y0 + ht * 0.8, z + 0.045);
      beam('drift', [x0 + 0.05, h.y0 + ht * 0.25, z + 0.045], [x1 - 0.05, h.y0 + ht * 0.75, z + 0.045], 0.06, 0.04);
    };
    if (shut === 'closed') { leaf(h.x0, cx, -0.07); leaf(cx, h.x1, -0.07); }
    else if (shut === 'open') { leaf(h.x0 - 0.13 - w / 2, h.x0 - 0.13, 0.07); leaf(h.x1 + 0.13, h.x1 + 0.13 + w / 2, 0.07); }
    else if (shut === 'one') leaf(h.x0 - 0.13 - w / 2, h.x0 - 0.13, 0.07);
  }
  function door(h, t) {
    const w = h.x1 - h.x0, ht = h.y1 - h.y0, cx = (h.x0 + h.x1) / 2;
    ext('timber', [V2(h.x0 - 0.14, h.y0), V2(h.x0, h.y0), V2(h.x0, h.y1), V2(h.x1, h.y1), V2(h.x1, h.y0), V2(h.x1 + 0.14, h.y0), V2(h.x1 + 0.18, h.y1 + 0.17), V2(h.x0 - 0.18, h.y1 + 0.17)], [], 0.18, 0.04);
    const n = 4, bw = w / n, pts = [V2(h.x0, h.y0)];
    for (let i = 0; i < n; i++) { pts.push(V2(h.x0 + bw * (i + 1) - 0.01, h.y0), V2(h.x0 + bw * (i + 1), h.y0 + 0.02)); }
    pts.push(V2(h.x1, h.y1), V2(h.x0, h.y1));
    ext('timber', pts, [], 0.07, -t + 0.1);
    for (let i = 1; i < n; i++) box('wet', 0.02, ht - 0.04, 0.02, h.x0 + bw * i, h.y0 + ht / 2, -t + 0.14);
    for (const yy of [0.22, 0.78]) box('iron', w * 0.8, 0.07, 0.03, cx - w * 0.08, h.y0 + ht * yy, -t + 0.15);
    K.cyl('iron', 0.035, 0.035, 0.05, 6, cx + w * 0.32, h.y0 + ht * 0.5, -t + 0.16, Math.PI / 2, 0, 0);
  }
  // X-brace panel as one extruded outline with four triangular holes
  function xPanel(key, x0, y0, x1, y1, t, depth, zc, kk) {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0, k = kk || t * 0.8;
    const fx = k * Math.hypot(w, h) / h, fy = k * Math.hypot(w, h) / w; // diagonal half-width offsets
    const holes = [
      [V2(x0 + t + fx, y0 + t), V2(x1 - t - fx, y0 + t), V2(cx, cy - fy)],
      [V2(x1 - t, y0 + t + fy), V2(x1 - t, y1 - t - fy), V2(cx + fx, cy)],
      [V2(x1 - t - fx, y1 - t), V2(x0 + t + fx, y1 - t), V2(cx, cy + fy)],
      [V2(x0 + t, y1 - t - fy), V2(x0 + t, y0 + t + fy), V2(cx - fx, cy)],
    ];
    ext(key, rectPts(x0, y0, x1, y1), holes, depth, zc);
  }
  // railing panel: one outline, holes between balusters
  function railPanel(len, h, n, nb) {
    const holes = [], pw = 0.12, step = (len - pw) / n;
    for (let i = 0; i < n; i++) {
      const a = i * step + pw, b = (i + 1) * step;
      holes.push(rectPts(a, 0.1, b, h * 0.5 - 0.04), rectPts(a, h * 0.5 + 0.04, b, h - 0.14));
    }
    ext('drift', rectPts(0, 0, len, h), holes, 0.08, 0);
    for (let i = 0; i <= n; i++) box('drift', 0.13, h + 0.12, 0.13, pw / 2 + i * step, (h + 0.12) / 2, 0, 0, 0, 0, 0.02);
    box('drift', len + 0.08, 0.1, 0.16, len / 2, h - 0.03, 0, 0, 0, 0, 0.02);
  }
  const post = (key, x, y0, y1, z, r) => K.lathe(key, [[0, 0], [r * 1.12, 0], [r, 0.08], [r, y1 - y0 - 0.06], [r * 0.9, y1 - y0], [0, y1 - y0]], 8, T(x, y0, z, 0, Math.PI / 8, 0));
  const pad = (x, z) => K.lathe('stone', [[0, 0], [0.36, 0], [0.33, 0.2], [0.24, 0.3], [0, 0.3]], 6, T(x, 0, z, 0, jit(0.5), 0));

  // ---------- stilts with brace panels ----------
  const posts = [];
  for (const x of [-2.1, 0, 2.1]) for (const z of [-2.0, 0, 2.0]) if (!(x === 0 && z === 0)) posts.push([x, z]);
  const deckPosts = [[-0.95, 3.45], [1.05, 3.45], [2.95, 3.45], [2.95, -1.95]];
  for (const [x, z] of posts.concat(deckPosts)) { pad(x, z); post('timber', x, 0.3, FL - 0.28, z, 0.17); }
  for (const z of [-2.0, 2.0]) for (const [xa, xb] of [[-2.1, 0], [0, 2.1]]) frame(T(0, 0, z + 0.17 * Math.sign(z)), () => xPanel('timber', xa + 0.12, 0.45, xb - 0.12, 2.2, 0.07, 0.1, 0, 0.07));
  for (const x of [-2.1, 2.1]) for (const [za, zb] of [[-2.0, 0], [0, 2.0]]) frame(T(x + 0.17 * Math.sign(x), 0, 0, 0, Math.PI / 2, 0), () => xPanel('timber', -zb + 0.12, 0.45, -za - 0.12, 2.2, 0.07, 0.1, 0, 0.07));
  // floor platform as an extruded rim with joist ends
  box('timber', 2 * HX + 0.3, 0.3, 2 * HZ + 0.3, 0, FL - 0.15, 0, 0, 0, 0, 0.05);
  for (let z = -1.8; z <= 1.81; z += 0.6) for (const sx of [-1, 1]) box('timber', 0.3, 0.18, 0.16, sx * (HX + 0.25), FL - 0.2, z, 0, 0, 0, 0.03);

  // ---------- deck ----------
  const dz0 = HZ + 0.15, dz1 = 3.6, dx0 = -1.2, dx1 = 3.15, DT = FL;
  // deck boards as one extruded comb (boards with gaps) running along z
  { const pts = [], n = Math.floor((dx1 - dx0) / 0.24);
    for (let i = 0; i < n; i++) { const a = dx0 + i * 0.24, b = a + 0.215, e = jit(0.05); pts.push([a, b, e]); }
    for (const [a, b, e] of pts) ext(K.rnd() < 0.3 ? 'drift' : 'timber', rectPts(a, dz0 - 0.15, b, dz1 + 0.06 + e), [], 0.07, 0, T(0, DT - 0.035, 0, -Math.PI / 2, 0, 0).multiply(new THREE.Matrix4().makeScale(1, -1, 1)));
  }
  box('timber', dx1 - dx0, 0.24, 0.2, (dx0 + dx1) / 2, DT - 0.2, dz1 - 0.1, 0, 0, 0, 0.04);
  box('timber', 0.2, 0.24, dz1 + 2.1, dx1 - 0.1, DT - 0.2, (dz1 - 2.1) / 2, 0, 0, 0, 0.04);
  box('timber', 0.2, 0.24, dz1 - dz0, dx0 + 0.1, DT - 0.2, (dz0 + dz1) / 2, 0, 0, 0, 0.04);
  for (let z = -1.95; z < dz0 - 0.1; z += 0.24) box('timber', dx1 - HX - 0.15, 0.07, 0.21, (HX + 0.15 + dx1) / 2, DT - 0.035, z, 0, jit(0.01), 0, 0);
  frame(T(0.3, DT, dz1 - 0.08), () => railPanel(dx1 - 0.3 - 0.08, 1.0, 5));
  frame(T(dx1 - 0.08, DT, dz1 - 0.08, 0, Math.PI / 2, 0), () => railPanel(dz1 + 1.95 - 0.08, 1.0, 5));
  // knee braces
  beam('timber', [1.05, 1.0, 3.45], [1.05, 2.2, 2.4], 0.14, 0.12); beam('timber', [2.95, 1.0, 3.45], [2.95, 2.2, 2.4], 0.14, 0.12);
  // ladder: one extruded outline (stringers + rungs) leaned against the deck
  { const lw = 0.7, lh = Math.hypot(DT + 0.25, 1.05), holes = [], n = 8;
    for (let i = 0; i < n; i++) { const y0 = 0.18 + i * (lh - 0.3) / n; holes.push(rectPts(0.1, y0, lw - 0.1, y0 + (lh - 0.3) / n - 0.08)); }
    const tilt = Math.atan2(1.05, DT + 0.25);
    ext('timber', rectPts(0, 0, lw, lh), holes, 0.13, 0, T(-0.4 - lw / 2, 0, dz1 + 1.1, -tilt, 0, 0));
  }

  // ---------- walls ----------
  const WT = 0.22;
  const fh = { door: { x0: -1.25, x1: -0.3, y0: FL, y1: FL + 2.0 }, w1: { x0: 0.25, x1: 0.95, y0: FL + 0.95, y1: FL + 1.95 }, w2: { x0: 1.35, x1: 2.05, y0: FL + 0.95, y1: FL + 1.95 } };
  frame(T(0, 0, HZ), () => {
    wall('ochre', -HX, HX, FL, TOP, WT, Object.values(fh)); door(fh.door, WT); win(fh.w1, WT, 'closed'); win(fh.w2, WT, 'closed');
    for (const x of [-1.85, 0.0, 1.15]) box('timber', 0.2, TOP - FL, 0.1, x, (FL + TOP) / 2, 0.05, 0, 0, 0, 0.025);
    box('timber', 2 * HX + 0.36, 0.28, 0.3, 0, TOP - 0.02, 0.1, 0, 0, 0, 0.05);
  });
  frame(T(0, 0, -HZ, 0, Math.PI, 0), () => {
    const h = { x0: -0.4, x1: 0.4, y0: FL + 0.95, y1: FL + 1.95 };
    wall('ochre', -HX, HX, FL, TOP, WT, [h]); win(h, WT, 'open');
    xPanel('timber', -2.15, FL + 0.02, -1.0, TOP - 0.1, 0.1, 0.1, 0.05); xPanel('timber', 1.0, FL + 0.02, 2.15, TOP - 0.1, 0.1, 0.1, 0.05);
    box('timber', 2 * HX + 0.36, 0.28, 0.3, 0, TOP - 0.02, 0.1, 0, 0, 0, 0.05);
  });
  frame(T(-HX, 0, 0, 0, -Math.PI / 2, 0), () => {
    const h = { x0: 0.8, x1: 1.5, y0: FL + 0.95, y1: FL + 1.95 };
    wall('ochre', -HZ, HZ, FL, TOP, WT, [h]); win(h, WT, 'open');
    xPanel('timber', -2.1, FL + 0.02, -0.75, TOP - 0.1, 0.1, 0.1, 0.05); xPanel('timber', -0.75, FL + 0.02, 0.5, TOP - 0.1, 0.1, 0.1, 0.05);
  });
  frame(T(HX, 0, 0, 0, Math.PI / 2, 0), () => {
    const d = { x0: -0.5, x1: 0.45, y0: FL, y1: FL + 2.0 }, h = { x0: 1.0, x1: 1.7, y0: FL + 0.95, y1: FL + 1.95 };
    wall('ochre', -HZ, HZ, FL, TOP, WT, [d, h]); door(d, WT); win(h, WT, 'closed');
    xPanel('timber', -2.1, FL + 0.02, -0.75, TOP - 0.1, 0.1, 0.1, 0.05);
  });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) boxB('timber', 0.28, TOP - FL + 0.1, 0.28, sx * (HX + 0.02), FL - 0.02, sz * (HZ + 0.02), 0, 0.04);
  for (const sx of [-1, 1]) box('timber', 0.3, 0.24, 2 * HZ + 0.3, sx * (HX + 0.03), TOP - 0.2, 0, 0, 0, 0, 0.05);

  // ---------- gables: extruded pentagon with holes, board-and-batten ----------
  const ytop = (x) => R - Math.abs(x) * PT - 0.19 / PC;
  function gable(holes, shut) {
    const y0 = TOP + 0.12;
    ext('timber', [V2(-HX, y0), V2(HX, y0), V2(HX, ytop(HX)), V2(0, ytop(0)), V2(-HX, ytop(-HX))], holes.map((h) => rectPts(h.x0, h.y0, h.x1, h.y1)), 0.2, -0.1);
    for (let x = -HX + 0.3; x < HX - 0.1; x += 0.3) {
      const yt = ytop(x) - 0.02; if (yt < y0 + 0.15) continue;
      let y = y0; const segs = [];
      for (const h of holes.filter((h) => x > h.x0 - 0.15 && x < h.x1 + 0.15)) { segs.push([y, h.y0 - 0.15]); y = h.y1 + 0.15; }
      segs.push([y, yt]);
      for (const [a, b] of segs) if (b - a > 0.1) box('wet', 0.07, b - a, 0.05, x, (a + b) / 2, 0.02);
    }
    box('timber', 0.24, ytop(0) - y0, 0.14, 0, (y0 + ytop(0)) / 2, 0.06, 0, 0, 0, 0.03);
    holes.forEach((h) => win(h, 0.2, shut));
  }
  frame(T(0, 0, HZ), () => gable([{ x0: -1.15, x1: -0.5, y0: 5.55, y1: 6.25 }, { x0: 0.5, x1: 1.15, y0: 5.55, y1: 6.25 }], 'one'));
  frame(T(0, 0, -HZ, 0, Math.PI, 0), () => gable([{ x0: -0.35, x1: 0.35, y0: 5.6, y1: 6.4 }], 'open'));

  // ---------- roof: extruded slab + scalloped tile-row strips ----------
  function rowStrip(W, s0, s1, tw, offset) {
    // outline in (x, s) where s grows down-slope; scalloped lower edge s1
    const pts = [V2(0, s0), V2(W, s0)];
    const n = Math.ceil((W + tw) / tw);
    for (let i = n; i >= 0; i--) {
      const xa = Math.min(W, Math.max(0, offset + i * tw)), xb = Math.min(W, Math.max(0, offset + (i - 1) * tw));
      if (xa - xb < 0.02) continue;
      const lo = s1 + jit(0.03);
      pts.push(V2(xa, lo - 0.03), V2(xb + 0.035, lo), V2(xb, s1 - 0.13));
    }
    return pts;
  }
  function gableRoof(ry, run, z0, z1, opts = {}) {
    const pt = opts.pitch || 1, c = 1 / Math.hypot(1, pt), sn = pt * c, L = run / c, W = z1 - z0, th = 0.12;
    ext('timber', [V2(-run, ry - run * pt), V2(0, ry), V2(run, ry - run * pt), V2(run, ry - run * pt - th / c), V2(0, ry - th / c), V2(-run, ry - run * pt - th / c)].map((p) => V2(p.x, p.y - 0.001)), [], W, (z0 + z1) / 2);
    for (const sx of [1, -1]) {
      const ez = new THREE.Vector3(sx * c, -sn, 0), ex = new THREE.Vector3(0, 0, -sx), ey = new THREE.Vector3().crossVectors(ez, ex);
      const m = new THREE.Matrix4().makeBasis(ex, ey, ez).setPosition(0, ry, sx > 0 ? z1 : z0);
      frame(m, () => {
        const tl = opts.tl || 0.58, step = tl * 0.66, tw = opts.tw || 0.54;
        for (let s = L - tl, r = 0; s > -tl * 0.5; s -= step, r++) {
          const s0 = Math.max(0, s), s1 = s + tl, lift = 0.09;
          const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0));
          put('tile', new THREE.ExtrudeGeometry(new THREE.Shape(rowStrip(W, s0, s1, tw, (r % 2) * tw * 0.5)), { depth: 0.06, bevelEnabled: false, curveSegments: 1 }),
            T(0, 0.065 + lift * 0.5, s1, -Math.atan2(lift, tl), 0, 0).multiply(T(0, 0, -s1)).multiply(basis));
        }
        box('timber', 0.14, 0.32, L + 0.05, -0.05, 0.02, L / 2, 0, 0, 0, 0.03);
        box('timber', 0.14, 0.32, L + 0.05, W + 0.05, 0.02, L / 2, 0, 0, 0, 0.03);
        if (opts.rafters) for (let x = 0.3; x < W - 0.2; x += 0.55) box('timber', 0.13, 0.16, 0.9, x, -0.24, L - 0.45, 0, 0, 0, 0.025);
        if (opts.brackets) for (let zz = 0.5; zz < L - 0.2; zz += 0.42) { box('timber', 0.1, 0.12, 0.16, 0.12, -0.22, zz); box('timber', 0.1, 0.12, 0.16, W - 0.12, -0.22, zz); }
      });
    }
    beam('timber', [0, ry + 0.12, z0 - 0.12], [0, ry + 0.12, z1 + 0.12], 0.3, 0.26, 0.04);
    if (opts.ridgeEnds) { box('timber', 0.36, 0.36, 0.3, 0, ry + 0.14, z1 + 0.18, 0, 0, 0, 0.05); box('timber', 0.36, 0.36, 0.3, 0, ry + 0.14, z0 - 0.18, 0, 0, 0, 0.05); }
  }
  gableRoof(R, HX + OV, -HZ - OZ, HZ + OZ, { pitch: PT, rafters: true, brackets: true, ridgeEnds: true });
  frame(T(-2.0, 0, -0.6, 0, -Math.PI / 2, 0), () => {
    const dw = 1.2, dy0 = 5.45, dy1 = 6.35;
    for (const s of [-1, 1]) box('timber', 0.12, dy1 - dy0 + 0.3, 1.6, s * dw / 2, (dy0 + dy1) / 2 + 0.1, -0.8, 0, 0, 0, 0);
    const h = { x0: -0.25, x1: 0.25, y0: dy0 + 0.15, y1: dy1 - 0.12 };
    ext('timber', [V2(-dw / 2, dy0), V2(dw / 2, dy0), V2(dw / 2, dy1), V2(0, dy1 + dw / 2), V2(-dw / 2, dy1)], [rectPts(h.x0, h.y0, h.x1, h.y1)], 0.12, -0.06);
    win(h, 0.12, 'none');
    const run = dw / 2 + 0.25; gableRoof(dy1 + run - 0.08, run, -1.6, 0.3, { tw: 0.36, tl: 0.42 });
  });
  // chimney
  const cx = 1.0, cz = -1.5;
  boxB('stone', 0.62, 2.1, 0.62, cx, 6.25, cz, 0, 0.05);
  boxB('stone', 0.76, 0.14, 0.76, cx, 8.25, cz, 0, 0.03);
  boxB('stone', 0.5, 0.1, 0.5, cx, 8.39, cz, 0, 0.02);
  for (let y = 6.6; y < 8.2; y += 0.35) box('stone', 0.66, 0.05, 0.66, cx, y, cz, 0, 0, 0, 0);

  K.finish(g);
  return recentre(THREE, g);
}
