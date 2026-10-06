// rowboat_a: primitives. Each strake is a run of tilted Box planks laid station by station, the
// gunwale is boxes, ribs are bent from short boxes, oars are cylinders and box blades.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const red = mk(0xb5543a, 'timber', 0.85);
  const bottom = mk(0x4a3426, 'timber', 0.6);
  const inner = mk(0x7b5a3e, 'timber', 0.85);
  const drift = mk(0xb79773, 'timber', 0.85);
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const L = 3.45, half = L / 2, B = 1.42, Hm = 0.56;
  const halfB = (u) => (u >= 0 ? (B / 2) * Math.pow(Math.max(0, 1 - u * u), 0.62) : (B / 2) * (1 - 0.42 * Math.pow(-u, 2.6)));
  const keelY = (u) => (u >= 0 ? 0.16 * u * u * u : 0.04 * Math.pow(-u, 3));
  const sheerY = (u) => Hm + (u >= 0 ? 0.22 : 0.1) * u * u;
  const sec = (u, t, s = 1) => { const th = t * Math.PI / 2, b = halfB(u), k = keelY(u); return new THREE.Vector3(s * b * Math.pow(Math.sin(th), 0.75), k + (sheerY(u) - k) * Math.pow(1 - Math.cos(th), 0.9), u * half); };
  const N = 5, S = 12, thick = 0.045, tilt = 0.12;
  const zA = new THREE.Vector3(), yA = new THREE.Vector3(), xA = new THREE.Vector3(), out = new THREE.Vector3(), mtx = new THREE.Matrix4();
  const plank = (u0, u1, t0, t1, s, mat, th, tl, inward) => {
    const a = sec(u0, t0, s), b2 = sec(u0, t1, s), c2 = sec(u1, t0, s), d2 = sec(u1, t1, s);
    const lo = a.clone().add(c2).multiplyScalar(0.5), hi = b2.clone().add(d2).multiplyScalar(0.5);
    zA.subVectors(c2.clone().add(d2), a.clone().add(b2)); const len = zA.length() / 2; zA.normalize();
    yA.subVectors(hi, lo); const h = yA.length(); yA.addScaledVector(zA, -yA.dot(zA)).normalize();
    out.crossVectors(yA, zA).multiplyScalar(s);
    const y2 = yA.clone().multiplyScalar(Math.cos(tl)).addScaledVector(out, -Math.sin(tl)).normalize();
    xA.crossVectors(y2, zA); mtx.makeBasis(xA, y2, zA);
    const pl = new THREE.Mesh(new THREE.BoxGeometry(th, h * 1.12 + 0.015, len * 1.06 + 0.015), mat);
    pl.quaternion.setFromRotationMatrix(mtx);
    pl.position.copy(lo).add(hi).multiplyScalar(0.5).addScaledVector(out, inward ? -th / 2 - thick : th / 2);
    g.add(pl);
  };
  for (const s of [1, -1]) for (let k = 0; k < N; k++) for (let j = 0; j < S; j++) {
    const u0 = -1 + 2 * j / S, u1 = -1 + 2 * (j + 1) / S;
    plank(u0, u1, k / N, (k + 1) / N, s, k < 1 ? bottom : red, thick, tilt, false);
  }
  // inside lining: one plank per station across the whole side
  for (const s of [1, -1]) for (let j = 0; j < S; j++) plank(-1 + 2 * j / S, -1 + 2 * (j + 1) / S, 0.02, 1, s, inner, 0.02, 0, true);
  // gunwale
  for (const s of [1, -1]) for (let j = 0; j < S; j++) {
    const p0 = sec(-1 + 2 * j / S, 1, s), p1 = sec(-1 + 2 * (j + 1) / S, 1, s), d = p1.clone().sub(p0);
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, d.length() + 0.06), drift);
    r.position.copy(p0).add(p1).multiplyScalar(0.5); r.position.y += 0.03; r.lookAt(r.position.clone().add(d)); g.add(r);
  }
  const keel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, L * 0.92), drift); keel.position.set(0, -0.01, -0.08); g.add(keel);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.08, sheerY(1) + 0.1, 0.1), drift); stem.position.set(0, (sheerY(1) + 0.1) / 2, half - 0.01); g.add(stem);
  const tr = new THREE.Mesh(new THREE.BoxGeometry(halfB(-1) * 2 + 0.06, sheerY(-1) - 0.06, 0.06), red); tr.position.set(0, sheerY(-1) / 2 + 0.04, -half - 0.01); g.add(tr);
  const tcap = new THREE.Mesh(new THREE.BoxGeometry(halfB(-1) * 2 + 0.16, 0.07, 0.1), drift); tcap.position.set(0, sheerY(-1) + 0.03, -half); g.add(tcap);
  // ribs: three short boxes per side per frame
  for (const u of [-0.6, -0.3, 0, 0.3, 0.6]) for (const s of [1, -1]) for (let i = 0; i < 3; i++) {
    const a = sec(u, i / 3 + 0.02, s), b2 = sec(u, (i + 1) / 3, s), d = b2.clone().sub(a);
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, d.length() + 0.03), drift);
    r.position.copy(a).add(b2).multiplyScalar(0.5); r.position.x -= s * 0.05; r.position.y += 0.03; r.lookAt(r.position.clone().add(d)); g.add(r);
  }
  const seat = (z, d, y) => { const s = new THREE.Mesh(new THREE.BoxGeometry(halfB(z / half) * 1.75, 0.05, d), drift); s.position.set(0, y, z); g.add(s); };
  seat(0.85, 0.24, 0.4); seat(-0.05, 0.26, 0.4); seat(-1.32, 0.45, 0.42);
  for (let i = -2; i <= 2; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, 2.2), drift); b.position.set(i * 0.13, 0.1, -0.1); g.add(b); }
  const oar = (x0, z0, x1, z1, y) => {
    const og = new THREE.Group(), len = Math.hypot(x1 - x0, z1 - z0);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len * 0.72, 6), drift); sh.rotation.x = Math.PI / 2; sh.position.z = -len * 0.14; og.add(sh);
    const bl = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.035, len * 0.3), drift); bl.position.z = len * 0.36; og.add(bl);
    og.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); og.rotation.y = Math.atan2(x1 - x0, z1 - z0); g.add(og);
  };
  oar(-0.3, -1.15, 0.32, 1.15, 0.48); oar(0.28, -1.05, -0.3, 1.3, 0.52);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 4, 10), iron); ring.rotation.y = Math.PI / 2; ring.position.set(0, sheerY(1) - 0.15, half + 0.07); g.add(ring);
  const wlRaw = sec(0, 0.2).y;

__RECENTRE__
  g.userData.waterline = wlRaw - box.min.y;
  return g;
}
