// fishing_boat_c: hand-built clinker BufferGeometry hull, planked cabin, mast with furled sail.
// Hull colour 0x55687a: the reference paints the hull a weathered slate blue-grey that the
// palette does not carry; it is wet-stone grey pushed toward the sea so it reads as paint, not stone.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const D = THREE.DoubleSide;
  const hullBlue = mk(0x55687a, 'timber', 0.85, { side: D });
  const red = mk(0xb5543a, 'timber', 0.8, { side: D });
  const bottom = mk(0x4a3426, 'timber', 0.6, { side: D });
  const wood = mk(0x7b5a3e, 'timber', 0.85);
  const drift = mk(0xb79773, 'timber', 0.85);
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const rope = mk(0xa58a5c, 'fabric', 0.95);
  const sail = mk(0xd9cfb6, 'fabric', 0.95);
  const netM = mk(0x4f5a2c, 'fabric', 0.95);
  const glass = mk(0x2c3a42, null, 0.45);

  const H = clinkerHull(THREE, {
    L: 6.7, B: 2.15, H: 1.3, riseBow: 0.5, riseStern: 0.18, rocker: 0.32, rockerS: 0.06,
    bowPow: 2, bowFull: 0.55, sternW: 0.62, sternPow: 2.4, secX: 0.75, secY: 0.85, flare: 0.05,
    N: 6, sub: 3, lipPow: 2.2, cols: 14, bowBias: true, lap: 0.07, innerOff: 0.08,
    strakeMat: (k) => (k < 2 ? bottom : k === 5 ? red : hullBlue),
    innerMat: hullBlue, transomMat: hullBlue, railMat: red, railR: 0.065, railSegs: 36,
    keelMat: bottom, keelR: 0.06, stemTop: 0.18,
  });
  g.add(H.g);
  const zOf = (u) => u * H.half;
  const uOf = (z) => z / H.half;
  const wlRaw = H.sec(0, 2 / 6)[1];

  // deck planks, each trimmed to the hull's inside at deck height
  const deckY = 0.6, pw = 0.22;
  for (let i = -4; i <= 4; i++) {
    const x = i * pw, e = Math.abs(x) + pw / 2 + 0.07;
    let zMin = null, zMax = null;
    for (let s = 0; s <= 80; s++) { const u = -1 + 2 * s / 80; if (H.xAtY(u, deckY) > e) { if (zMin === null) zMin = zOf(u); zMax = zOf(u); } }
    if (zMin === null) continue;
    const len = zMax - zMin - 0.04;
    const pl = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.025, 0.06, len), i % 3 === 0 ? drift : wood);
    pl.position.set(x, deckY + (i % 2) * 0.008, (zMin + zMax) / 2); g.add(pl);
  }

  // cabin at the stern
  const cz0 = -2.95, cz1 = -1.6, cw = 1.4, cy0 = deckY + 0.03, ch = 1.95, czc = (cz0 + cz1) / 2, cl = cz1 - cz0;
  const core = new THREE.Mesh(new THREE.BoxGeometry(cw - 0.08, ch, cl - 0.08), wood);
  core.position.set(0, cy0 + ch / 2, czc); g.add(core);
  const nX = 7, nZ = 7;
  for (let i = 0; i < nX; i++) {
    const x = -cw / 2 + (i + 0.5) * cw / nX, hh = ch - (i % 2) * 0.03;
    for (const zz of [cz1, cz0]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(cw / nX - 0.02, hh, 0.07), wood);
      b.position.set(x, cy0 + hh / 2, zz - Math.sign(zz - czc) * 0.035); g.add(b);
    }
  }
  for (let i = 0; i < nZ; i++) {
    const z = cz0 + (i + 0.5) * cl / nZ, hh = ch - ((i + 1) % 2) * 0.03;
    for (const xx of [cw / 2, -cw / 2]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, hh, cl / nZ - 0.02), wood);
      b.position.set(xx - Math.sign(xx) * 0.035, cy0 + hh / 2, z); g.add(b);
    }
  }
  for (const xx of [-1, 1]) for (const zz of [cz0, cz1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, ch + 0.04, 0.12), drift);
    p.position.set(xx * (cw / 2 + 0.01), cy0 + ch / 2, zz); g.add(p);
  }
  // roof: planks running across, overhanging
  for (let i = 0; i < 7; i++) {
    const z = cz0 - 0.15 + (i + 0.5) * (cl + 0.3) / 7;
    const r = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.34, 0.1, (cl + 0.3) / 7 - 0.02), wood);
    r.position.set(0, cy0 + ch + 0.05 + (i % 2) * 0.012, z); g.add(r);
  }
  // window: iron frame, dark pane, cross mullion. Built facing +Z, then placed.
  const windowAt = (x, y, z, ry, w = 0.5, h = 0.5) => {
    const wg = new THREE.Group();
    const add = (geo, mat, px, py, pz) => { const q = new THREE.Mesh(geo, mat); q.position.set(px, py, pz); wg.add(q); };
    add(new THREE.BoxGeometry(w, h, 0.03), glass, 0, 0, 0.03);
    add(new THREE.BoxGeometry(w + 0.12, 0.07, 0.08), iron, 0, h / 2 + 0.03, 0.06);
    add(new THREE.BoxGeometry(w + 0.12, 0.07, 0.08), iron, 0, -h / 2 - 0.03, 0.06);
    add(new THREE.BoxGeometry(0.07, h, 0.08), iron, w / 2 + 0.03, 0, 0.06);
    add(new THREE.BoxGeometry(0.07, h, 0.08), iron, -w / 2 - 0.03, 0, 0.06);
    add(new THREE.BoxGeometry(0.045, h, 0.05), iron, 0, 0, 0.05);
    add(new THREE.BoxGeometry(w, 0.045, 0.05), iron, 0, 0, 0.05);
    wg.position.set(x, y, z); wg.rotation.y = ry; g.add(wg);
  };
  windowAt(-0.33, cy0 + 1.35, cz1, 0);
  windowAt(cw / 2, cy0 + 1.35, czc, Math.PI / 2, 0.55, 0.5);
  windowAt(-cw / 2, cy0 + 1.35, czc, -Math.PI / 2, 0.55, 0.5);
  windowAt(0, cy0 + 1.35, cz0, Math.PI, 0.45, 0.4);
  // door on the forward face
  {
    const dx = 0.3, dw = 0.55, dh = 1.45;
    const fr = (w, h, x, y) => { const q = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.09), iron); q.position.set(x, y, cz1 + 0.06); g.add(q); };
    fr(0.07, dh, dx - dw / 2 - 0.035, cy0 + dh / 2); fr(0.07, dh, dx + dw / 2 + 0.035, cy0 + dh / 2); fr(dw + 0.14, 0.07, dx, cy0 + dh + 0.035);
    for (let i = 0; i < 3; i++) { const q = new THREE.Mesh(new THREE.BoxGeometry(dw / 3 - 0.015, dh - 0.02, 0.05), drift); q.position.set(dx - dw / 3 + i * dw / 3, cy0 + dh / 2, cz1 + 0.05); g.add(q); }
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), iron); k.position.set(dx + dw / 2 - 0.1, cy0 + 0.75, cz1 + 0.1); g.add(k);
  }
  // bench in front of the cabin, thwart at the mast
  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.36), drift); bench.position.set(0, deckY + 0.42, -1.3); g.add(bench);
  for (const x of [-0.6, 0.6]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.3), wood); lg.position.set(x, deckY + 0.2, -1.3); g.add(lg); }
  const mz = 1.15;
  const thw = 2 * H.xAtY(uOf(mz), 1.0) - 0.15;
  const tw = new THREE.Mesh(new THREE.BoxGeometry(thw, 0.08, 0.32), drift); tw.position.set(0, 1.0, mz); g.add(tw);

  // mast, furled sail, lashings
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 4.5, 8), wood); mast.position.set(0, deckY + 2.25, mz); g.add(mast);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 8), iron); cap.position.set(0, deckY + 4.46, mz); g.add(cap);
  const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.0, 6), wood); yard.rotation.z = Math.PI / 2; yard.position.set(0.3, deckY + 4.3, mz - 0.1); g.add(yard);
  const prof = [[0.03, 0], [0.16, 0.1], [0.24, 0.45], [0.2, 0.75], [0.27, 1.05], [0.22, 1.4], [0.12, 1.65], [0.04, 1.75]].map(([x, y]) => new THREE.Vector2(x, y));
  const sb = new THREE.Mesh(new THREE.LatheGeometry(prof, 9), sail);
  sb.scale.set(1.1, 1, 0.75); sb.position.set(0.26, deckY + 2.6, mz - 0.12); sb.rotation.z = -0.06; g.add(sb);
  for (const y of [deckY + 3.05, deckY + 3.6, deckY + 2.55]) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.032, 4, 12), rope);
    t.rotation.x = Math.PI / 2; t.scale.set(1.75, 1.15, 1); t.position.set(0.17, y, mz - 0.08); g.add(t);
  }

  // anchor hanging outside the bow, starboard
  {
    const az = 2.45, au = uOf(az);
    const ax = H.pt(au, 1, 0.03)[0] + 0.09, atop = H.sheerY(au) - 0.12;
    const ag = new THREE.Group();
    const shank = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.07), iron); shank.position.y = -0.31; ag.add(shank);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.34), iron); stock.position.y = -0.06; ag.add(stock);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 5, 10), iron); ring.rotation.y = Math.PI / 2; ring.position.y = 0.05; ag.add(ring);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 5, 10, Math.PI), iron); arc.rotation.set(0, Math.PI / 2, Math.PI); arc.position.y = -0.48; ag.add(arc);
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), iron); f.position.set(0, -0.44, s * 0.22); f.rotation.x = s * 0.35; ag.add(f); }
    ag.position.set(ax, atop, az); ag.rotation.y = -0.18; g.add(ag);
    const rp = H.pt(uOf(az + 0.45), 1, 0.05);
    const rc = new THREE.CatmullRomCurve3([new THREE.Vector3(rp[0] - 0.05, rp[1] + 0.06, rp[2]), new THREE.Vector3(ax + 0.12, atop + 0.25, az + 0.25), new THREE.Vector3(ax, atop + 0.05, az)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(rc, 10, 0.028, 5, false), rope));
  }
  // rope coils on the foredeck
  for (const [cx, cz] of [[0.32, 1.95], [-0.38, 2.2]]) {
    for (let i = 0; i < 3; i++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.24 - i * 0.03, 0.036, 4, 12), rope);
      t.rotation.x = Math.PI / 2; t.position.set(cx, deckY + 0.07 + i * 0.065, cz); g.add(t);
    }
  }
  // net pile with floats
  {
    const geo = new THREE.IcosahedronGeometry(0.5, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const h = Math.sin(x * 12.9 + z * 7.3 + y * 3.1) * 0.5 + 0.5;
      p.setXYZ(i, x * (0.9 + 0.25 * h), Math.max(-0.05, y) * (0.8 + 0.4 * h), z * (0.9 + 0.2 * h));
    }
    geo.computeVertexNormals();
    const nm = new THREE.Mesh(geo, netM); nm.scale.set(1.1, 0.42, 0.8); nm.position.set(0.05, deckY + 0.05, -0.35); g.add(nm);
    for (const [fx, fz] of [[-0.5, -0.1], [0.45, -0.6], [0.6, 0.0], [-0.3, -0.75]]) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), red); f.position.set(fx, deckY + 0.13, fz - 0.05); g.add(f);
    }
  }
  // rudder and tiller
  {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.95, 0.38), wood); r.position.set(0, 0.62, -H.half - 0.22); g.add(r);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.7), drift); tl.position.set(0, H.sheerY(-1) + 0.02, -H.half + 0.12); tl.rotation.x = -0.12; g.add(tl);
  }
  // bollards on the bow rail
  for (const s of [-1, 1]) { const u = 0.62, p = H.pt(u, 1, -0.06); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 7), wood); b.position.set(s * (p[0] - 0.05), p[1] + 0.12, p[2]); g.add(b); }

  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.waterline = wlRaw - box.min.y;
  return g;
}

// Clinker hull built vertex by vertex. u runs stern (-1) to bow (+1) along Z, t runs keel (0)
// to sheer (1) around the section. Each strake is its own strip, pushed outward by a sawtooth
// so its lower edge laps over the strake below, with a downward-facing ledge at every seam.
function clinkerHull(THREE, P) {
  const half = P.L / 2;
  const halfB = (u) => (u >= 0
    ? (P.B / 2) * Math.pow(Math.max(0, 1 - Math.pow(u, P.bowPow)), P.bowFull)
    : (P.B / 2) * (1 - (1 - P.sternW) * Math.pow(-u, P.sternPow)));
  const keelY = (u) => (u >= 0 ? P.rocker * Math.pow(u, 3) : P.rockerS * Math.pow(-u, 3));
  const sheerY = (u) => P.H + (u >= 0 ? P.riseBow : P.riseStern) * u * u;
  const sec = (u, t) => {
    const th = t * Math.PI / 2, b = halfB(u), k = keelY(u);
    return [b * Math.pow(Math.sin(th), P.secX) + P.flare * b * t * t * t,
      k + (sheerY(u) - k) * Math.pow(1 - Math.cos(th), P.secY)];
  };
  const pt = (u, t, off) => {
    const e = 1e-3, a = sec(u, Math.max(0, t - e)), c = sec(u, Math.min(1, t + e));
    let nx = c[1] - a[1], ny = -(c[0] - a[0]);
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const p = sec(u, t);
    return [p[0] + nx * off, p[1] + ny * off, u * half];
  };
  const xAtY = (u, y) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (sec(u, m)[1] < y) lo = m; else hi = m; }
    return sec(u, (lo + hi) / 2)[0];
  };
  const us = [];
  for (let j = 0; j < P.cols; j++) { const s = j / (P.cols - 1); us.push(-1 + 2 * (P.bowBias ? 1 - Math.pow(1 - s, 1.25) : s)); }
  function grid(rows, mat) {
    const pos = [], idx = [], C = us.length, R = rows.length;
    for (const s of [1, -1]) {
      const base = pos.length / 3;
      for (const [t, off] of rows) for (const u of us) { const p = pt(u, t, off); pos.push(p[0] * s, p[1], p[2]); }
      for (let r = 0; r < R - 1; r++) for (let j = 0; j < C - 1; j++) {
        const a = base + r * C + j, b = a + 1, c = a + C, d = c + 1;
        if (s > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
  }
  const g = new THREE.Group();
  const N = P.N, lap = P.lap, sub = P.sub || 2;
  for (let k = 0; k < N; k++) {
    const t0 = k / N, t1 = (k + 1) / N, m = P.strakeMat(k), rows = [];
    for (let i = 0; i <= sub; i++) { const f = i / sub; rows.push([t0 + (t1 - t0) * f, lap * Math.pow(1 - f, P.lipPow || 1)]); }
    g.add(grid(rows, m));
    if (k > 0) g.add(grid([[t0, 0], [t0, lap]], m));
  }
  if (P.innerMat) {
    const rows = []; for (let i = 0; i <= 6; i++) rows.push([i / 6, -P.innerOff]);
    g.add(grid(rows, P.innerMat));
  }
  if (P.transomMat) {
    const ring = [];
    for (let i = 0; i <= 10; i++) { const p = pt(-1, i / 10, lap); ring.push(p); }
    const sh = new THREE.Shape();
    const outl = ring.slice().reverse().map((p) => [p[0], p[1]]).concat(ring.slice(1).map((p) => [-p[0], p[1]]));
    sh.moveTo(outl[0][0], outl[0][1]);
    for (let i = 1; i < outl.length; i++) sh.lineTo(outl[i][0], outl[i][1]);
    const tg = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false });
    const tm = new THREE.Mesh(tg, P.transomMat); tm.position.z = -half - 0.02; g.add(tm);
  }
  if (P.railMat) {
    const off = -P.innerOff / 2, pts = [];
    for (const u of us) { const p = pt(u, 1, off); pts.push(new THREE.Vector3(p[0], p[1] + P.railR * 0.4, p[2])); }
    for (let j = us.length - 2; j >= 0; j--) { const p = pt(us[j], 1, off); pts.push(new THREE.Vector3(-p[0], p[1] + P.railR * 0.4, p[2])); }
    const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, P.railSegs || 48, P.railR, P.railRad || 5, true), P.railMat));
  }
  if (P.keelMat) {
    const pts = [];
    for (let i = 0; i <= 8; i++) { const u = -1 + (i / 8) * 1.9; const p = pt(u, 0, lap + P.keelR * 0.6); pts.push(new THREE.Vector3(0, p[1], p[2])); }
    for (let i = 0; i <= 5; i++) { const t = i / 5; const p = sec(1, t); pts.push(new THREE.Vector3(0, p[1] + (i === 5 ? P.stemTop : 0), half + P.keelR * 0.5)); }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, P.keelR, 5, false), P.keelMat));
  }
  const rib = (u, r, mat) => {
    const pts = [];
    for (let i = 8; i >= 0; i--) { const p = pt(u, i / 8, -P.innerOff - r); pts.push(new THREE.Vector3(-p[0], p[1], p[2])); }
    for (let i = 1; i <= 8; i++) { const p = pt(u, i / 8, -P.innerOff - r); pts.push(new THREE.Vector3(p[0], p[1], p[2])); }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, r, 4, false), mat);
  };
  return { g, pt, sec, halfB, keelY, sheerY, xAtY, half, rib };
}
