// sea_arch, candidate C: a different reading. One continuous rock swept along an inverted-U
// centreline (rounded-rectangle section), then terraced: every vertex is pushed out along its
// horizontal normal by a per-stratum amount with a lip at the top of each band, so the strata
// read as ledges wrapping the whole form. Legs at x = -6 and +6, passage open along Z.
export default function (THREE) {
  const g = new THREE.Group();
  const K = archKit(THREE, 9001);
  const { rnd, jit, V, put } = K;
  const UNDER = 9.5, TOPC = 11.6, HB = 2.1; // bridge centreline and half-thickness (underside = TOPC - HB)
  const path = new THREE.CatmullRomCurve3([
    V(-6.2, -0.2, 0), V(-6.1, 3, 0), V(-6.0, 6.5, 0), V(-5.7, 9.2, 0), V(-4.2, 11.1, 0), V(-2, TOPC, 0),
    V(0, TOPC + 0.05, 0), V(2, TOPC, 0), V(4.2, 11.1, 0), V(5.7, 9.2, 0), V(6.0, 6.5, 0), V(6.1, 3, 0), V(6.2, -0.2, 0)], false, 'centripetal');
  const NU = 104, NV = 26;
  const pts = path.getSpacedPoints(NU);
  // section half-size: a along the in-plane normal, b along Z
  const secA = (p) => { const y = p.y; if (Math.abs(p.x) < 4.6 && y > 9) return HB; const foot = Math.max(0, 2.6 - y) * 0.28; const waist = y > 3 && y < 8 ? -0.12 : 0; return 2.0 + foot + waist; };
  const secB = (p) => 3.35 + Math.max(0, 2.4 - p.y) * 0.22;
  // strata: band edges and per-band push
  const bands = []; { let y = -0.5; while (y < 16) { const h = 0.8 + rnd() * 0.55; bands.push({ y0: y, h, push: jit(0.22), lip: 0.16 + rnd() * 0.16, dx: jit(0.15), dz: jit(0.2) }); y += h; } }
  const band = (y) => bands.find((b) => y >= b.y0 && y < b.y0 + b.h) || bands[bands.length - 1];
  const ring = [];
  for (let i = 0; i <= NU; i++) {
    const p = pts[i]; const t = path.getTangentAt(i / NU); const n = V(-t.y, t.x, 0).normalize();
    const a = secA(p), b = secB(p); const row = [];
    for (let j = 0; j < NV; j++) {
      const th = (j / NV) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      const r = Math.pow(Math.pow(Math.abs(c), 4) + Math.pow(Math.abs(s), 4), -0.25);
      const q = p.clone().addScaledVector(n, c * r * a).add(V(0, 0, s * r * b));
      // terrace: horizontal outward direction from the centreline
      const hd = V(q.x - p.x, 0, q.z - p.z); const hl = hd.length();
      if (hl > 0.3) {
        hd.divideScalar(hl); const B = band(q.y); const f = (q.y - B.y0) / B.h;
        const lip = f > 0.62 ? B.lip * Math.min(1, (f - 0.62) / 0.2) : 0;
        q.addScaledVector(hd, B.push + lip); q.x += B.dx; q.z += B.dz;
      }
      row.push(q);
    }
    ring.push(row);
  }
  const keyAt = (y) => (y < 3.0 ? 'wet' : (band(y).push > 0 ? 'sand' : 'sand2'));
  const pos = { sand: [], sand2: [], wet: [] };
  const tri = (A, B, C) => { const y = (A.y + B.y + C.y) / 3; pos[keyAt(y)].push(A.x, A.y, A.z, B.x, B.y, B.z, C.x, C.y, C.z); };
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const A = ring[i][j], B = ring[i][(j + 1) % NV], C = ring[i + 1][(j + 1) % NV], D = ring[i + 1][j];
    tri(A, B, C); tri(A, C, D);
  }
  for (const end of [0, NU]) { // caps under the feet
    const r = ring[end]; const c = r.reduce((s, v) => s.add(v), V(0, 0, 0)).divideScalar(NV);
    for (let j = 0; j < NV; j++) end === 0 ? tri(c, r[(j + 1) % NV], r[j]) : tri(c, r[j], r[(j + 1) % NV]);
  }
  for (const k in pos) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos[k], 3)); put(k, geo); }
  // a few loose capstones on top
  const cap = (x, z, w, d, h) => put(rnd() < 0.5 ? 'sand' : 'sand2', K.cboxGeo(w, h, d, 0.2), K.T(x, TOPC + HB + h / 2 - 0.55, z, 0, jit(0.4), 0));
  cap(-5.4, -0.6, 3.2, 2.8, 0.55); cap(5.2, 0.8, 2.6, 2.4, 0.5); cap(0.6, -1.0, 2.0, 1.6, 0.4);
  K.wobble(['sand', 'sand2', 'wet'], 0.1);
  const rock = K.meshes(g, ['sand', 'sand2', 'wet']);
  K.dress(g, rock, [{ x: -6.2, z: 0 }, { x: 6.2, z: 0 }]);
  K.meshes(g, ['cream', 'kelp', 'grass']);
  return K.recentre(g);
}
