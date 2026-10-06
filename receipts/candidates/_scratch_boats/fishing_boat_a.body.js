// fishing_boat_a: primitives. Every strake is a run of tilted Box planks laid station by station,
// so the clinker overlap is real plank thickness. Cabin, mast and fittings are boxes and cylinders.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const hullBlue = mk(0x55687a, 'timber', 0.85);
  const red = mk(0xb5543a, 'timber', 0.8);
  const bottom = mk(0x4a3426, 'timber', 0.6);
  const wood = mk(0x7b5a3e, 'timber', 0.85);
  const drift = mk(0xb79773, 'timber', 0.85);
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const rope = mk(0xa58a5c, 'fabric', 0.95);
  const sail = mk(0xd9cfb6, 'fabric', 0.95);
  const netM = mk(0x4f5a2c, 'fabric', 0.95);
  const glass = mk(0x2c3a42, null, 0.45);

  const L = 6.7, half = L / 2, B = 2.25, Hm = 1.3;
  const halfB = (u) => (u >= 0 ? (B / 2) * Math.pow(Math.max(0, 1 - u * u), 0.55) : (B / 2) * (1 - 0.4 * Math.pow(-u, 2.4)));
  const keelY = (u) => (u >= 0 ? 0.32 * u * u * u : 0.06 * -u * -u * -u);
  const sheerY = (u) => Hm + (u >= 0 ? 0.5 : 0.18) * u * u;
  const sec = (u, t, s = 1) => { const th = t * Math.PI / 2, b = halfB(u), k = keelY(u); return new THREE.Vector3(s * b * Math.pow(Math.sin(th), 0.75), k + (sheerY(u) - k) * Math.pow(1 - Math.cos(th), 0.85), u * half); };
  const N = 6, S = 14, thick = 0.06, tilt = 0.1;
  const zA = new THREE.Vector3(), yA = new THREE.Vector3(), xA = new THREE.Vector3(), out = new THREE.Vector3(), mtx = new THREE.Matrix4();
  for (const s of [1, -1]) for (let k = 0; k < N; k++) for (let j = 0; j < S; j++) {
    const u0 = -1 + 2 * j / S, u1 = -1 + 2 * (j + 1) / S, t0 = k / N, t1 = (k + 1) / N;
    const a = sec(u0, t0, s), b2 = sec(u0, t1, s), c2 = sec(u1, t0, s), d2 = sec(u1, t1, s);
    const lo = a.clone().add(c2).multiplyScalar(0.5), hi = b2.clone().add(d2).multiplyScalar(0.5);
    const back = a.clone().add(b2).multiplyScalar(0.5), front = c2.clone().add(d2).multiplyScalar(0.5);
    zA.subVectors(front, back); const len = zA.length(); zA.normalize();
    yA.subVectors(hi, lo); const h = yA.length(); yA.addScaledVector(zA, -yA.dot(zA)).normalize();
    out.crossVectors(yA, zA).multiplyScalar(s);
    if (k === 0) out.set(0, -1, 0).addScaledVector(yA, 0).normalize();
    const y2 = yA.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(out, -Math.sin(tilt)).normalize();
    xA.crossVectors(y2, zA);
    mtx.makeBasis(xA, y2, zA);
    const mat = k < 2 ? bottom : k === 5 ? red : hullBlue;
    const pl = new THREE.Mesh(new THREE.BoxGeometry(thick, h * 1.14 + 0.02, len * 1.06 + 0.02), mat);
    pl.quaternion.setFromRotationMatrix(mtx);
    pl.position.copy(lo).add(hi).multiplyScalar(0.5).addScaledVector(out, thick / 2);
    g.add(pl);
  }
  // keel and stem
  const keel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, L * 0.95), bottom); keel.position.set(0, 0.0, -0.1); g.add(keel);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.12, sheerY(1) + 0.25, 0.14), bottom); stem.position.set(0, (sheerY(1) + 0.25) / 2, half - 0.02); stem.rotation.x = 0.12; g.add(stem);
  // transom
  const tr = new THREE.Mesh(new THREE.BoxGeometry(halfB(-1) * 2 + 0.06, sheerY(-1) - 0.1, 0.08), hullBlue); tr.position.set(0, sheerY(-1) / 2 + 0.07, -half - 0.02); g.add(tr);
  // gunwale cap, one box per station
  for (const s of [1, -1]) for (let j = 0; j < S; j++) {
    const p0 = sec(-1 + 2 * j / S, 1, s), p1 = sec(-1 + 2 * (j + 1) / S, 1, s);
    const d = p1.clone().sub(p0), len = d.length();
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, len + 0.08), red);
    r.position.copy(p0).add(p1).multiplyScalar(0.5); r.position.y += 0.05;
    r.lookAt(r.position.clone().add(d)); g.add(r);
  }
  const tcap = new THREE.Mesh(new THREE.BoxGeometry(halfB(-1) * 2 + 0.2, 0.1, 0.14), red); tcap.position.set(0, sheerY(-1) + 0.05, -half); g.add(tcap);
  // deck: one slab and plank strips
  const deckY = 0.62;
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.21, len = (i === 0 ? 5.1 : 5.1 - Math.abs(i) * Math.abs(i) * 0.12);
    const pl = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.06, len), wood); pl.position.set(x, deckY, -0.35 - Math.abs(i) * 0.02); g.add(pl);
  }
  // cabin: a box with plank battens, roof slab, windows and a door
  const cz = -2.25, cw = 1.4, cl = 1.3, ch = 1.95, cy = deckY + 0.03;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(cw, ch, cl), wood); cab.position.set(0, cy + ch / 2, cz); g.add(cab);
  for (let i = 1; i < 7; i++) {
    for (const zz of [cz + cl / 2, cz - cl / 2]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, ch, 0.04), drift); b.position.set(-cw / 2 + i * cw / 7, cy + ch / 2, zz); g.add(b); }
    for (const xx of [cw / 2, -cw / 2]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, ch, 0.04), drift); b.position.set(xx, cy + ch / 2, cz - cl / 2 + i * cl / 7); g.add(b); }
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.3, 0.14, cl + 0.3), drift); roof.position.set(0, cy + ch + 0.07, cz); g.add(roof);
  const win = (x, y, z, ry) => {
    const wg = new THREE.Group();
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.08), iron); wg.add(f);
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.1), glass); wg.add(p);
    const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.12), iron); wg.add(m1);
    const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.12), iron); wg.add(m2);
    wg.position.set(x, y, z); wg.rotation.y = ry; g.add(wg);
  };
  win(-0.33, cy + 1.35, cz + cl / 2 + 0.02, 0); win(cw / 2 + 0.02, cy + 1.35, cz, Math.PI / 2); win(-cw / 2 - 0.02, cy + 1.35, cz, Math.PI / 2); win(0, cy + 1.35, cz - cl / 2 - 0.02, 0);
  const df = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.52, 0.06), iron); df.position.set(0.32, cy + 0.76, cz + cl / 2 + 0.02); g.add(df);
  const dr = new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.42, 0.08), drift); dr.position.set(0.32, cy + 0.71, cz + cl / 2 + 0.03); g.add(dr);
  // mast, sail as a capsule bundle, rope wraps
  const mz = 1.15;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 4.4, 8), wood); mast.position.set(0, deckY + 2.2, mz); g.add(mast);
  const sb = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.3, 3, 8), sail); sb.position.set(0.24, deckY + 3.45, mz - 0.1); g.add(sb);
  for (const y of [deckY + 3.0, deckY + 3.7]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 4, 12), rope); t.rotation.x = Math.PI / 2; t.scale.set(1.2, 0.8, 1); t.position.set(0.14, y, mz - 0.06); g.add(t); }
  const thw = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.3), drift); thw.position.set(0, 1.0, mz); g.add(thw);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 0.36), drift); bench.position.set(0, deckY + 0.3, -1.3); g.add(bench);
  // anchor
  {
    const ag = new THREE.Group();
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.62, 5), iron); sh.position.y = -0.31; ag.add(sh);
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.34), iron); st.position.y = -0.06; ag.add(st);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 4, 10), iron); ring.rotation.y = Math.PI / 2; ring.position.y = 0.05; ag.add(ring);
    for (const s of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.3), iron); arm.position.set(0, -0.55, s * 0.12); arm.rotation.x = s * 0.6; ag.add(arm); const f = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), iron); f.position.set(0, -0.44, s * 0.25); ag.add(f); }
    const au = 2.45 / half; ag.position.set(halfB(au) + 0.1, sheerY(au) - 0.12, 2.45); g.add(ag);
  }
  for (const [cx, cz2] of [[0.32, 1.95], [-0.38, 2.2]]) for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.24 - i * 0.03, 0.036, 4, 12), rope); t.rotation.x = Math.PI / 2; t.position.set(cx, deckY + 0.07 + i * 0.065, cz2); g.add(t);
  }
  const nm = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 5), netM); nm.scale.set(1.1, 0.35, 0.8); nm.position.set(0.05, deckY + 0.05, -0.35); g.add(nm);
  for (const [fx, fz] of [[-0.5, -0.1], [0.45, -0.6], [0.6, 0.0]]) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), red); f.position.set(fx, deckY + 0.13, fz); g.add(f); }
  const rud = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.95, 0.38), wood); rud.position.set(0, 0.62, -half - 0.24); g.add(rud);
  const wlRaw = sec(0, 2 / 6).y;

__RECENTRE__
  g.userData.waterline = wlRaw - box.min.y;
  return g;
}
