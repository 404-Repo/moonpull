// rowboat_c: hand-built clinker BufferGeometry hull (red strakes outside, a timber skin inside),
// ribs swept along the section, three thwarts, bottom boards, two oars laid across, bow ring.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const D = THREE.DoubleSide;
  const red = mk(0xb5543a, 'timber', 0.85, { side: D });
  const bottom = mk(0x4a3426, 'timber', 0.6, { side: D });
  const inner = mk(0x7b5a3e, 'timber', 0.85, { side: D });
  const drift = mk(0xb79773, 'timber', 0.85);
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });

  const H = clinkerHull(THREE, {
    L: 3.45, B: 1.32, H: 0.56, riseBow: 0.22, riseStern: 0.1, rocker: 0.16, rockerS: 0.04,
    bowPow: 2, bowFull: 0.62, sternW: 0.58, sternPow: 2.6, secX: 0.75, secY: 0.9, flare: 0.08,
    N: 5, sub: 3, lipPow: 2.2, cols: 14, bowBias: true, lap: 0.04, innerOff: 0.045,
    strakeMat: (k) => (k < 1 ? bottom : red),
    innerMat: inner, transomMat: red, railMat: drift, railR: 0.045, railSegs: 32,
    keelMat: drift, keelR: 0.04, stemTop: 0.12,
  });
  g.add(H.g);
  const zOf = (u) => u * H.half, uOf = (z) => z / H.half;
  const wlRaw = H.sec(0, 1 / 5)[1];

  for (const u of [-0.66, -0.33, 0.0, 0.33, 0.64]) g.add(H.rib(u, 0.025, drift));
  // bottom boards
  const by = 0.1;
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.13, e = Math.abs(x) + 0.06 + 0.05;
    let z0 = null, z1 = null;
    for (let s = 0; s <= 60; s++) { const u = -1 + 2 * s / 60; if (H.keelY(u) < by - 0.04 && H.xAtY(u, by) > e) { if (z0 === null) z0 = zOf(u); z1 = zOf(u); } }
    if (z0 === null) continue;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, z1 - z0), drift); b.position.set(x, by, (z0 + z1) / 2); g.add(b);
  }
  // thwarts sit on risers just below the gunwale
  const seat = (z, d, y) => {
    const w = 2 * (H.xAtY(uOf(z), y) - 0.05);
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), drift); s.position.set(0, y, z); g.add(s);
  };
  seat(0.85, 0.24, 0.4); seat(-0.05, 0.26, 0.4); seat(-1.32, 0.45, 0.42);
  // oars crossing the thwarts
  const oar = (a, b2) => {
    const og = new THREE.Group();
    const dir = new THREE.Vector3().subVectors(b2, a), len = dir.length();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.038, len * 0.7, 6), drift); shaft.position.y = len * 0.35; og.add(shaft);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.14, 6), drift); grip.position.y = -0.06; og.add(grip);
    const bs = new THREE.Shape(); bs.moveTo(-0.035, 0); bs.lineTo(0.035, 0); bs.lineTo(0.1, 0.14); bs.lineTo(0.1, len * 0.3 - 0.04); bs.quadraticCurveTo(0.1, len * 0.3, 0.06, len * 0.3); bs.lineTo(-0.06, len * 0.3); bs.quadraticCurveTo(-0.1, len * 0.3, -0.1, len * 0.3 - 0.04); bs.lineTo(-0.1, 0.14); bs.lineTo(-0.035, 0);
    const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(bs, { depth: 0.04, bevelEnabled: false, curveSegments: 2 }), drift);
    blade.position.set(0, len * 0.7, -0.02); og.add(blade);
    og.position.copy(a); og.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    g.add(og);
  };
  oar(new THREE.Vector3(-0.3, 0.47, -1.15), new THREE.Vector3(0.32, 0.5, 1.15));
  oar(new THREE.Vector3(0.28, 0.48, -1.05), new THREE.Vector3(-0.3, 0.52, 1.3));
  // oarlock pads and bow ring
  for (const s of [-1, 1]) { const p = H.pt(uOf(0.05), 1, 0); const pad = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.24), drift); pad.position.set(s * p[0], p[1] + 0.07, 0.05); g.add(pad); }
  const st = H.sec(1, 0.8);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 4, 10), iron); ring.rotation.y = Math.PI / 2; ring.position.set(0, st[1] - 0.05, H.half + 0.07); g.add(ring);
  // corner knees at the transom
  for (const s of [-1, 1]) { const p = H.pt(-0.95, 1, -0.06); const k = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.16), drift); k.position.set(s * (p[0] - 0.06), p[1] + 0.01, p[2]); g.add(k); }

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
