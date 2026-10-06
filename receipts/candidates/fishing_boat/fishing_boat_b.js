// fishing_boat_b: profiles. The hull is half a LatheGeometry spindle turned onto its side, then
// warped after construction: flattened bottom, sheer that rises fore and aft, and a sawtooth on
// the radius so each strake laps the one below. The wheelhouse is an extruded side profile.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const D = THREE.DoubleSide;
  const hullBlue = mk(0x55687a, 'timber', 0.85, { side: D });
  const red = mk(0xb5543a, 'timber', 0.8, { side: D });
  const wood = mk(0x7b5a3e, 'timber', 0.85);
  const drift = mk(0xb79773, 'timber', 0.85);
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const rope = mk(0xa58a5c, 'fabric', 0.95);
  const sail = mk(0xd9cfb6, 'fabric', 0.95);
  const netM = mk(0x4f5a2c, 'fabric', 0.95);
  const glass = mk(0x2c3a42, null, 0.45);

  const L = 6.7, half = L / 2, Bh = 1.13, Hd = 1.3;
  const rOf = (z) => { const u = z / half; return u >= 0 ? Bh * Math.pow(Math.max(0.001, 1 - u * u), 0.55) : Bh * (1 - 0.38 * Math.pow(-u, 2.4)); };
  const prof = [];
  for (let i = 0; i <= 20; i++) { const z = -half + L * (1 - Math.pow(1 - i / 20, 1.2)); prof.push(new THREE.Vector2(Math.max(0.02, rOf(z)), z)); }
  const NS = 6, segPer = 3, RS = NS * 2 * segPer;
  const geo = new THREE.LatheGeometry(prof, RS, -Math.PI / 2, Math.PI);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), yA = p.getY(i), zA = p.getZ(i);
    const r = Math.hypot(x, zA) || 1e-6, phi = Math.atan2(x, zA);
    const u = yA / half, side = Math.abs(phi) / (Math.PI / 2);
    const k = Math.min(NS - 1, Math.floor(side * NS - 1e-6)), f = side * NS - k;
    const rr = r * (1 + 0.045 * (1 - f));
    const keel = u >= 0 ? 0.32 * u * u * u : 0.06 * Math.pow(-u, 3);
    const sheer = Hd + (u >= 0 ? 0.5 : 0.18) * u * u;
    const vy = Math.pow(Math.cos(phi), 0.75);
    p.setXYZ(i, rr * Math.sin(phi) * (1 + 0.05 * Math.pow(side, 3)), keel + (sheer - keel) * (1 - vy), yA);
  }
  geo.computeVertexNormals();
  // two bands: blue body, red top strake (split by material groups would merge away, so two meshes)
  const hull = new THREE.Mesh(geo, hullBlue); g.add(hull);
  const top = new THREE.Mesh(geo.clone(), red);
  { const q = top.geometry.attributes.position; const keep = [];
    const idx = geo.index.array; for (let t = 0; t < idx.length; t += 3) {
      let all = true; for (let e = 0; e < 3; e++) { const vi = idx[t + e]; const col = Math.floor(vi / prof.length); if (Math.abs(col - RS / 2) < RS / 2 - segPer) all = false; }
      if (all) keep.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    top.geometry.setIndex(keep); top.scale.set(1.004, 1.002, 1.0); g.add(top); }
  // gunwale: extruded rounded section along the sheer line
  const sheerPts = [];
  for (let i = 0; i <= 20; i++) { const z = -half + L * i / 20, u = z / half; sheerPts.push(new THREE.Vector3(rOf(z) * 1.05 * 1.0, Hd + (u >= 0 ? 0.5 : 0.18) * u * u + 0.04, z)); }
  for (const s of [1, -1]) {
    const c = new THREE.CatmullRomCurve3(sheerPts.map((v) => new THREE.Vector3(v.x * s, v.y, v.z)));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.065, 5, false), red));
  }
  const tr = new THREE.Mesh(new THREE.CircleGeometry(rOf(-half) * 1.05, 12, Math.PI, Math.PI), hullBlue);
  tr.scale.set(1, Hd / (rOf(-half) * 1.05), 1); tr.position.set(0, Hd + 0.18, -half); tr.material = hullBlue; g.add(tr);
  const trc = new THREE.Mesh(new THREE.BoxGeometry(rOf(-half) * 2.2, 0.1, 0.13), red); trc.position.set(0, Hd + 0.22, -half); g.add(trc);
  // deck: one extruded plan shape at deck height
  const deckY = 0.62;
  const ds = new THREE.Shape(); const pts = [];
  for (let i = 0; i <= 16; i++) { const z = -half + 0.1 + (L - 0.9) * i / 16; pts.push([rOf(z) * 0.8, z]); }
  ds.moveTo(pts[0][0], pts[0][1]); pts.forEach(([x, z]) => ds.lineTo(x, z)); pts.slice().reverse().forEach(([x, z]) => ds.lineTo(-x, z));
  const deck = new THREE.Mesh(new THREE.ExtrudeGeometry(ds, { depth: 0.06, bevelEnabled: false }), wood);
  deck.rotation.x = Math.PI / 2; deck.position.y = deckY + 0.06; g.add(deck);
  for (let i = -3; i <= 3; i++) { const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 4.6), drift); s2.position.set(i * 0.24, deckY + 0.07, -0.2); g.add(s2); }
  // wheelhouse: a side profile with a raked roof, extruded across the beam
  const cz0 = -2.95, cz1 = -1.6, cw = 1.4, ch = 1.95, cy = deckY + 0.03;
  const sp = new THREE.Shape();
  sp.moveTo(cz0, 0); sp.lineTo(cz1, 0); sp.lineTo(cz1 + 0.05, ch); sp.lineTo(cz0 - 0.05, ch - 0.12); sp.lineTo(cz0, 0);
  const wh = new THREE.Mesh(new THREE.ExtrudeGeometry(sp, { depth: cw - 0.08, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 }), wood);
  wh.rotation.y = -Math.PI / 2; wh.position.set((cw - 0.08) / 2, cy, 0); g.add(wh);
  const rs = new THREE.Shape(); rs.moveTo(cz0 - 0.25, 0); rs.lineTo(cz1 + 0.25, 0); rs.lineTo(cz1 + 0.25, 0.1); rs.lineTo(cz0 - 0.25, 0.1);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: cw + 0.3, bevelEnabled: false }), drift);
  roof.rotation.y = -Math.PI / 2; roof.position.set((cw + 0.3) / 2, cy + ch - 0.06, 0); roof.rotation.z = 0; g.add(roof);
  const win = (x, y, z, ry, w = 0.5) => { const wg = new THREE.Group();
    const f = new THREE.Mesh(new THREE.TorusGeometry(w * 0.42, 0.04, 4, 4), iron); f.rotation.z = Math.PI / 4; f.scale.set(1.25, 1.25, 1); wg.add(f);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, w * 0.72, 0.03), glass); wg.add(pane);
    wg.position.set(x, y, z); wg.rotation.y = ry; g.add(wg); };
  win(-0.33, cy + 1.35, cz1 + 0.06, 0); win(cw / 2 + 0.01, cy + 1.35, (cz0 + cz1) / 2, Math.PI / 2); win(-cw / 2 - 0.01, cy + 1.35, (cz0 + cz1) / 2, Math.PI / 2); win(0, cy + 1.3, cz0 - 0.07, 0);
  const dr = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.45, 0.06), drift); dr.position.set(0.3, cy + 0.73, cz1 + 0.06); g.add(dr);
  // mast with a lathe sail bundle
  const mz = 1.15;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 4.4, 8), wood); mast.position.set(0, deckY + 2.2, mz); g.add(mast);
  const sprof = [[0.03, 0], [0.16, 0.1], [0.24, 0.45], [0.2, 0.75], [0.27, 1.05], [0.22, 1.4], [0.12, 1.65], [0.04, 1.75]].map(([x, y]) => new THREE.Vector2(x, y));
  const sb = new THREE.Mesh(new THREE.LatheGeometry(sprof, 9), sail); sb.scale.set(1.1, 1, 0.75); sb.position.set(0.26, deckY + 2.6, mz - 0.12); g.add(sb);
  for (const y of [deckY + 3.05, deckY + 3.6]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.032, 4, 12), rope); t.rotation.x = Math.PI / 2; t.scale.set(1.75, 1.15, 1); t.position.set(0.17, y, mz - 0.08); g.add(t); }
  const thw = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.3), drift); thw.position.set(0, 1.0, mz); g.add(thw);
  // anchor from a lathe-free primitive set, coils, net
  { const ag = new THREE.Group();
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.07), iron); sh.position.y = -0.31; ag.add(sh);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 4, 10, Math.PI), iron); arc.rotation.set(0, Math.PI / 2, Math.PI); arc.position.y = -0.48; ag.add(arc);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 4, 10), iron); ring.rotation.y = Math.PI / 2; ring.position.y = 0.05; ag.add(ring);
    ag.position.set(rOf(2.45) * 1.05 + 0.1, Hd + 0.5 * Math.pow(2.45 / half, 2) - 0.12, 2.45); g.add(ag); }
  for (const [cx, cz2] of [[0.32, 1.95], [-0.38, 2.2]]) for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.24 - i * 0.03, 0.036, 4, 12), rope); t.rotation.x = Math.PI / 2; t.position.set(cx, deckY + 0.13 + i * 0.065, cz2); g.add(t); }
  const nm = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), netM); nm.scale.set(1.1, 0.35, 0.8); nm.position.set(0.05, deckY + 0.1, -0.35); g.add(nm);
  const rud = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.95, 0.38), wood); rud.position.set(0, 0.62, -half - 0.24); g.add(rud);
  const wlRaw = 0.3;

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
