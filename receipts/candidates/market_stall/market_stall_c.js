// market_stall C: different part breakdown. Booth walls are thick solid plaster slabs with half-timber
// boards applied proud of them; the roof is two thick slabs carrying long tile COURSES (each course 3 bars
// angled into a sagging ridge) instead of single tiles; the awning is one folded piece per stripe that bends
// ---- MOONPULL build kit (inlined; no imports). Palette and names per STYLE_LOCK.md ----
function makeKit(THREE, seed) {
  let s = (seed >>> 0) || 7;
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const jit = (a) => (rnd() * 2 - 1) * a;
  const mk = (color, rough, name, extra) => {
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0 }, extra || {}));
    if (name) m.name = name; return m;
  };
  const mats = {
    timber: mk(0x7b5a3e, 0.85, 'timber'), wet: mk(0x4a3426, 0.55, 'timber'), drift: mk(0xb79773, 0.85, 'timber'),
    tile: mk(0xb5543a, 0.8, 'tile'), plaster: mk(0xe9d6b8, 0.9, 'plaster'), ochre: mk(0xc99a5c, 0.9, 'plaster'),
    stone: mk(0x6c6a64, 0.9, 'stone'), sand: mk(0xc6a888, 0.9, 'stone'), kelp: mk(0x4f5a2c, 0.9, 'foliage'),
    cream: mk(0xd9cfb6, 0.85, 'stone'), rope: mk(0xa58a5c, 0.9, 'fabric'), iron: mk(0x3a3d40, 0.6, 'metal'),
    window: mk(0xffb560, 0.7, null, { emissive: 0xffb560, emissiveIntensity: 0.55 }),
    moonstone: mk(0x9fd8ff, 0.4, 'moonstone', { emissive: 0x9fd8ff, emissiveIntensity: 1.0 }),
    lampglow: mk(0xffb560, 0.5, 'lampglow', { emissive: 0xffb560, emissiveIntensity: 1.2 }),
  };
  const buckets = {};
  const stack = [new THREE.Matrix4()];
  const cur = () => stack[stack.length - 1];
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function T(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'));
    return new THREE.Matrix4().compose(V(x, y, z), q, V(sx, sy, sz));
  }
  function frame(m, fn) { stack.push(cur().clone().multiply(m)); fn(); stack.pop(); }
  const va = new THREE.Vector3(), vb = new THREE.Vector3();
  function put(key, geo, m) {
    if (!mats[key]) throw new Error('no material ' + key);
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (!g.attributes.normal) g.computeVertexNormals();
    const M = cur().clone(); if (m) M.multiply(m);
    const N = new THREE.Matrix3().getNormalMatrix(M);
    const p = g.attributes.position, n = g.attributes.normal;
    const b = buckets[key] || (buckets[key] = { pos: [], nrm: [] });
    const ord = M.determinant() < 0 ? [0, 2, 1] : [0, 1, 2];
    for (let i = 0; i < p.count; i += 3) for (const j of ord) {
      va.fromBufferAttribute(p, i + j).applyMatrix4(M); b.pos.push(va.x, va.y, va.z);
      vb.fromBufferAttribute(n, i + j).applyMatrix3(N).normalize(); b.nrm.push(vb.x, vb.y, vb.z);
    }
  }
  // chamfered box, centred, flat shaded. c = chamfer in metres.
  const cache = new Map();
  function cboxGeo(w, h, d, c) {
    c = Math.min(c || 0, w * 0.45, h * 0.45, d * 0.45);
    const key = [w, h, d, c].map((x) => x.toFixed(4)).join(',');
    if (cache.has(key)) return cache.get(key);
    let geo;
    if (c <= 0.002) geo = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    else {
      const hx = w / 2, hy = h / 2, hz = d / 2;
      const P = (sx, sy, sz, ax) => ax === 0 ? [sx * hx, sy * (hy - c), sz * (hz - c)] : ax === 1 ? [sx * (hx - c), sy * hy, sz * (hz - c)] : [sx * (hx - c), sy * (hy - c), sz * hz];
      const tris = [];
      const quad = (a, b, cc, d2) => { tris.push([a, b, cc], [a, cc, d2]); };
      const S = [-1, 1];
      for (const t of S) {
        quad(P(t, -1, -1, 0), P(t, 1, -1, 0), P(t, 1, 1, 0), P(t, -1, 1, 0));
        quad(P(-1, t, -1, 1), P(1, t, -1, 1), P(1, t, 1, 1), P(-1, t, 1, 1));
        quad(P(-1, -1, t, 2), P(1, -1, t, 2), P(1, 1, t, 2), P(-1, 1, t, 2));
      }
      for (const a of S) for (const b2 of S) {
        quad(P(-1, a, b2, 1), P(1, a, b2, 1), P(1, a, b2, 2), P(-1, a, b2, 2));
        quad(P(a, -1, b2, 0), P(a, 1, b2, 0), P(a, 1, b2, 2), P(a, -1, b2, 2));
        quad(P(a, b2, -1, 0), P(a, b2, 1, 0), P(a, b2, 1, 1), P(a, b2, -1, 1));
      }
      for (const x of S) for (const y of S) for (const z of S) tris.push([P(x, y, z, 0), P(x, y, z, 1), P(x, y, z, 2)]);
      const pos = [];
      const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), nn = new THREE.Vector3(), cen = new THREE.Vector3();
      for (const t of tris) {
        A.fromArray(t[0]); B.fromArray(t[1]); C.fromArray(t[2]);
        nn.subVectors(B, A).cross(C.clone().sub(A)); cen.copy(A).add(B).add(C);
        if (nn.dot(cen) < 0) pos.push(...t[0], ...t[2], ...t[1]); else pos.push(...t[0], ...t[1], ...t[2]);
      }
      geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.computeVertexNormals();
    }
    cache.set(key, geo); return geo;
  }
  // box: size w,h,d at x,y,z (centre) with rotation; c chamfer (default 0.03)
  function box(key, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, c = 0.03) { put(key, cboxGeo(w, h, d, c), T(x, y, z, rx, ry, rz)); }
  // box whose base sits at y (bottom), convenience
  function boxB(key, w, h, d, x, y, z, ry = 0, c = 0.03) { box(key, w, h, d, x, y + h / 2, z, 0, ry, 0, c); }
  function cyl(key, rt, rb, h, seg, x, y, z, rx = 0, ry = 0, rz = 0) {
    put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 8, 1), T(x, y, z, rx, ry, rz));
  }
  // beam between points a and b (arrays), cross section w x d, roll about its axis
  function beam(key, a, b, w, d, c = 0.03, roll = 0, geoFn) {
    const A = V(...a), B = V(...b); const dir = B.clone().sub(A); const L = dir.length(); dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir);
    if (roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), roll));
    const m = new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, V(1, 1, 1));
    put(key, geoFn ? geoFn(L) : cboxGeo(w, L, d, c), m);
  }
  function log(key, a, b, r, seg = 7) { beam(key, a, b, 0, 0, 0, 0, (L) => new THREE.CylinderGeometry(r, r, L, seg, 1)); }
  // roof tiles in a local frame: x along ridge 0..W, z down-slope 0..L, y = slope normal (surface at y=0)
  function tiles(key, W, L, tw = 0.42, tl = 0.5, th = 0.06, lap = 0.62, lift = 0.09) {
    const step = tl * lap; const rows = Math.ceil(L / step);
    for (let r = 0; r < rows; r++) {
      const zc = L - tl / 2 - r * step; if (zc - tl / 2 < -0.02) break;
      const off = (r % 2) * tw * 0.5; const n = Math.ceil((W + tw) / tw);
      for (let i = 0; i < n; i++) {
        let x0 = -tw / 2 + off + i * tw, x1 = x0 + tw * 0.94; x0 = Math.max(x0, 0); x1 = Math.min(x1, W);
        if (x1 - x0 < 0.08) continue;
        box(key, x1 - x0, th, tl, (x0 + x1) / 2 + jit(0.01), th / 2 + lift * 0.5 + jit(0.008), zc, -Math.atan2(lift, tl) + jit(0.03), jit(0.04), jit(0.03), 0.018);
      }
    }
  }
  function lathe(key, pts, seg, m) { put(key, new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg || 12), m); }
  function extrude(key, pts, depth, m, bevel) {
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: !!bevel, bevelSize: bevel || 0, bevelThickness: bevel || 0, bevelSegments: 1, curveSegments: 4 });
    geo.translate(0, 0, -depth / 2); put(key, geo, m);
  }
  function finish(g) {
    let tris = 0;
    for (const key of Object.keys(buckets)) {
      const b = buckets[key]; if (!b.pos.length) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.nrm, 3));
      geo.computeBoundingBox();
      const bb = geo.boundingBox, sz = bb.getSize(V()); const W = Math.max(sz.x, sz.z, 1e-3), H = Math.max(sz.y, 1e-3);
      const p = geo.attributes.position, n = geo.attributes.normal, uv = [];
      for (let i = 0; i < p.count; i++) {
        const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
        const x = (p.getX(i) - bb.min.x) / W, y = (p.getY(i) - bb.min.y) / H, z = (p.getZ(i) - bb.min.z) / W;
        if (ay >= ax && ay >= az) uv.push(x, z); else if (ax >= az) uv.push(z, y); else uv.push(x, y);
      }
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      const mesh = new THREE.Mesh(geo, mats[key]); mesh.name = key; mesh.castShadow = true; mesh.receiveShadow = true;
      g.add(mesh); tris += p.count / 3;
    }
    g.userData.tris = tris;
    return g;
  }
  return { THREE, mats, rnd, jit, T, V, frame, put, cboxGeo, box, boxB, cyl, beam, log, tiles, lathe, extrude, finish };
}
function recentre(THREE, g) {
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
  return g;
}
// ---- end kit ----
// ---- C1 extras (inlined; no imports) ----
function addMat(K, key, color, rough, name, extra) {
  const m = new K.THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0 }, extra || {}));
  if (name) m.name = name; K.mats[key] = m; return m;
}
// tube along a smooth curve through points
function tube(K, key, pts, r, radial = 5, segs = 0) {
  const THREE = K.THREE;
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const n = segs || Math.max(4, Math.round(curve.getLength() / 0.12));
  K.put(key, new THREE.TubeGeometry(curve, n, r, radial, false));
}
// polyline of straight cylinders (cheap rope / strand)
function strand(K, key, pts, r, radial = 4) {
  for (let i = 0; i < pts.length - 1; i++) K.beam(key, pts[i], pts[i + 1], 0, 0, 0, 0, (L) => new K.THREE.CylinderGeometry(r, r, L + r * 0.6, radial, 1, true));
}
// catenary-ish sag between a and b, n points
function sag(a, b, d, n) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - d * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]); }
  return out;
}
// ---- end extras ----
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
