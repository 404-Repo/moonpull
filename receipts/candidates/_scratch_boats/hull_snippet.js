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
