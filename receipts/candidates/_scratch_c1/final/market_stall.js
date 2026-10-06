// market_stall B: profiles. Same booth idea built from swept sections: hewn posts (extruded octagon),
// a sagging canvas awning where each stripe is an extruded arc (bowed downward between beams) ending in a
// scalloped valance cut from a Shape, a lathed barrel and tub, roof tiles laid by the kit with a sagging ridge.
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
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 43);
  const { box, boxB, beam, cyl, put, frame, T, jit, rnd } = K;
  addMat(K, 'cloth', 0xe9dcc0, 0.9, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'clothred', 0xb5402f, 0.9, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'fish', 0x8a9aa2, 0.45, null);
  addMat(K, 'fishred', 0xc0583e, 0.6, null);
  const hewn = (w, d) => { const a = w / 2, b = d / 2, c = Math.min(a, b) * 0.32; return new THREE.Shape([[-a + c, -b], [a - c, -b], [a, -b + c], [a, b - c], [a - c, b], [-a + c, b], [-a, b - c], [-a, -b + c]].map((p) => new THREE.Vector2(p[0] + jit(0.005), p[1] + jit(0.005)))); };
  const sweep = (key, a, b, w, d) => beam(key, a, b, 0, 0, 0, 0, (L) => { const geo = new THREE.ExtrudeGeometry(hewn(w, d), { depth: L, bevelEnabled: false }); geo.translate(0, 0, -L / 2); geo.rotateX(-Math.PI / 2); return geo; });
  const BX = 1.22, BZ0 = -1.05, BZ1 = -0.15, SILL = 0.3, PLATE = 2.35;
  // stone plinth as a single extruded U footprint, with block joints
  const fp = new THREE.Shape([[-BX - 0.12, BZ0 - 0.12], [BX + 0.12, BZ0 - 0.12], [BX + 0.12, BZ1 + 0.1], [BX - 0.14, BZ1 + 0.1], [BX - 0.14, BZ0 + 0.14], [-BX + 0.14, BZ0 + 0.14], [-BX + 0.14, BZ1 + 0.1], [-BX - 0.12, BZ1 + 0.1]].map((p) => new THREE.Vector2(p[0], -p[1])));
  put('stone', new THREE.ExtrudeGeometry(fp, { depth: SILL - 0.04, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.02, bevelSegments: 1 }), T(0, 0.02, 0, -Math.PI / 2, 0, 0));
  for (let x = -BX + 0.3; x < BX; x += 0.5) box('wet', 0.03, SILL - 0.04, 0.05, x + jit(0.05), SILL / 2, BZ0 - 0.13, 0, 0, 0, 0);
  for (const x of [-BX, BX]) for (const z of [BZ0, BZ1]) sweep('timber', [x, SILL, z], [x + jit(0.02), PLATE + 0.14, z], 0.18, 0.18);
  for (const z of [BZ0, BZ1]) sweep('timber', [-BX - 0.18, PLATE + 0.08, z], [BX + 0.18, PLATE + 0.08, z], 0.17, 0.17);
  for (const x of [-BX, BX]) sweep('timber', [x, PLATE + 0.08, BZ0 - 0.15], [x, PLATE + 0.08, BZ1 + 0.15], 0.17, 0.17);
  box('plaster', 2 * BX - 0.1, PLATE - SILL, 0.1, 0, (PLATE + SILL) / 2, BZ0, 0, 0, 0, 0);
  for (const sx of [-1, 1]) {
    box('plaster', 0.1, PLATE - SILL, BZ1 - BZ0 - 0.1, sx * BX, (PLATE + SILL) / 2, (BZ0 + BZ1) / 2, 0, 0, 0, 0);
    sweep('timber', [sx * (BX + 0.05), SILL + 0.05, BZ1 - 0.1], [sx * (BX + 0.05), PLATE, BZ0 + 0.1], 0.1, 0.12);
    sweep('timber', [sx * (BX + 0.05), 1.3, BZ0], [sx * (BX + 0.05), 1.3, BZ1], 0.12, 0.1);
  }
  for (const x of [-0.45, 0.45]) sweep('timber', [x, SILL, BZ0 - 0.05], [x, PLATE, BZ0 - 0.05], 0.12, 0.1);
  sweep('timber', [-BX, 1.3, BZ0 - 0.05], [BX, 1.3, BZ0 - 0.05], 0.12, 0.1);
  // roof: ridge along X with a sag, kit tiles
  const RZ = -0.6, RY = 3.0, RUN = 1.0, DROP = 0.6, W = 3.0;
  const ang = Math.atan2(DROP, RUN), L = Math.hypot(RUN, DROP) + 0.06;
  for (const [ry, x0] of [[0, -W / 2], [Math.PI, W / 2]]) frame(T(x0, RY, RZ, ang, ry, 0), () => { box('timber', W, 0.07, L, W / 2, -0.06, L / 2, 0, 0, 0, 0.02); K.tiles('tile', W, L, 0.48, 0.5, 0.055, 0.66, 0.08); });
  for (let i = 0; i < 7; i++) { const x = -W / 2 + (i + 0.5) * W / 7; put('tile', new THREE.CylinderGeometry(0.11, 0.11, W / 7 + 0.02, 6, 1, false, 0, Math.PI), T(x, RY + 0.04, RZ, 0, 0, Math.PI / 2)); }
  for (const sx of [-1, 1]) {
    const sh = new THREE.Shape([[BZ0, PLATE + 0.16], [BZ1, PLATE + 0.16], [BZ1, RY - DROP * Math.abs(BZ1 - RZ) / RUN - 0.08], [RZ, RY - 0.1], [BZ0, RY - DROP * Math.abs(BZ0 - RZ) / RUN - 0.08]].map((p) => new THREE.Vector2(p[0], p[1])));
    put('plaster', new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }), T(sx * BX - 0.05, 0, 0, 0, -Math.PI / 2, 0));
    sweep('timber', [sx * (BX + 0.05), PLATE + 0.16, RZ], [sx * (BX + 0.05), RY - 0.12, RZ], 0.12, 0.1);
  }
  // front posts + awning beams
  const FZ = 0.92, FXp = 1.3, AY0 = 2.45, AY1 = 2.1, AZ0 = -0.2, AZ1 = 1.2;
  for (const sx of [-1, 1]) {
    K.lathe('stone', [[0, 0], [0.17, 0], [0.17, 0.2], [0.13, 0.28], [0, 0.28]], 6, T(sx * FXp, 0, FZ));
    sweep('timber', [sx * FXp, 0.28, FZ], [sx * FXp, AY1 + 0.02, FZ], 0.17, 0.17);
    sweep('timber', [sx * FXp, AY0 + 0.1, AZ0 - 0.1], [sx * FXp, AY1 + 0.02, AZ1 + 0.18], 0.17, 0.17);
    sweep('timber', [sx * FXp, AY1 - 0.45, FZ], [sx * FXp, AY1 - 0.05, FZ - 0.4], 0.1, 0.1);
    put('rope', new THREE.TorusGeometry(0.11, 0.025, 3, 8), T(sx * FXp, 0.95, FZ, Math.PI / 2));
    put('rope', new THREE.TorusGeometry(0.11, 0.025, 3, 8), T(sx * FXp, 1.0, FZ, Math.PI / 2));
  }
  // awning: each stripe is an arc swept across its width (sags between the side beams' slope line)
  const NS = 10, SW = (2 * FXp - 0.16) / NS, aang = Math.atan2(AY0 - AY1, AZ1 - AZ0), AL = Math.hypot(AY0 - AY1, AZ1 - AZ0);
  for (let i = 0; i < NS; i++) {
    const key = i % 2 ? 'cloth' : 'clothred'; const x = -FXp + 0.08 + SW * i;
    // profile in (z along slope, y) with a belly, extruded across x
    const pts = []; const n = 6; for (let k = 0; k <= n; k++) { const t = k / n; pts.push([t * AL, -0.12 * Math.sin(t * Math.PI)]); }
    for (let k = n; k >= 0; k--) { const t = k / n; pts.push([t * AL, -0.12 * Math.sin(t * Math.PI) + 0.035]); }
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: SW + 0.004, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(x + SW + 0.002, 0, 0);
    frame(T(0, AY0 + 0.12, AZ0, aang, 0, 0), () => put(key, geo));
    // scalloped valance tab (shape with a rounded bottom)
    const v = new THREE.Shape(); v.moveTo(-SW / 2, 0); v.lineTo(SW / 2, 0); v.lineTo(SW / 2, -0.17); v.quadraticCurveTo(0, -0.33, -SW / 2, -0.17); v.lineTo(-SW / 2, 0);
    const vg = new THREE.ExtrudeGeometry(v, { depth: 0.035, bevelEnabled: false, curveSegments: 3 });
    put(key, vg, T(x + SW / 2, AY1 + 0.17, AZ1 + 0.03, 0, 0, 0));
  }
  // counter: plank front from an extruded board profile, top slab
  const CZ = 0.7, CW = 2.3, CH = 0.92, CD = 0.5;
  box('wet', CW - 0.04, CH - 0.06, CD - 0.08, 0, (CH - 0.06) / 2, CZ - 0.02, 0, 0, 0, 0);
  const board = new THREE.Shape([[0, 0], [-0.035, 0], [-0.05, 0.015], [-0.05, 0.185], [-0.035, 0.2], [0, 0.2]].map((p) => new THREE.Vector2(p[0], p[1])));
  const bgeo = new THREE.ExtrudeGeometry(board, { depth: CW, bevelEnabled: false }); bgeo.translate(0, 0, -CW / 2); bgeo.rotateY(Math.PI / 2);
  for (let i = 0; i < 4; i++) put(i % 2 ? 'timber' : 'drift', bgeo, T(0, 0.04 + i * 0.205, CZ + CD / 2 - 0.06, 0, 0, jit(0.008)));
  for (const x of [-CW / 2 + 0.05, 0, CW / 2 - 0.05]) box('wet', 0.1, CH - 0.06, 0.06, x, (CH - 0.06) / 2, CZ + CD / 2 + 0.03, 0, 0, 0, 0.02);
  box('drift', CW + 0.14, 0.07, CD + 0.12, 0, CH, CZ + 0.03, 0, 0, 0, 0.025);
  const crate = (x, z, tilt, fishKey) => frame(T(x, CH + 0.035, z, -tilt, jit(0.08), 0), () => {
    const w = 0.42, d = 0.3, h = 0.13;
    boxB('timber', w, 0.03, d, 0, 0, 0, 0, 0);
    for (const s of [-1, 1]) { boxB('timber', w, h, 0.03, 0, 0, s * (d / 2 - 0.015), 0, 0); boxB('timber', 0.03, h, d - 0.06, s * (w / 2 - 0.015), 0, 0, 0, 0); }
    boxB('cream', w - 0.06, h - 0.04, d - 0.06, 0, 0.02, 0, 0, 0.02);
    for (let k = 0; k < 3; k++) put(fishKey, new THREE.SphereGeometry(0.045, 5, 3), T(-0.12 + k * 0.12 + jit(0.02), h, jit(0.05), 0, 0.3 + jit(0.4), Math.PI / 2, 1, 3.0, 0.8));
  });
  crate(-0.85, CZ + 0.08, 0.16, 'fish'); crate(-0.4, CZ + 0.08, 0.16, 'fishred'); crate(0.05, CZ + 0.08, 0.16, 'fish'); crate(0.5, CZ + 0.08, 0.16, 'fishred'); crate(-0.62, CZ - 0.18, 0.05, 'fish');
  K.lathe('timber', [[0, 0], [0.13, 0], [0.15, 0.2], [0.13, 0.2], [0.12, 0.04], [0, 0.04]], 8, T(0.9, CH + 0.035, CZ - 0.12));
  // back table + barrel
  box('drift', 2 * BX - 0.1, 0.06, 0.32, 0, 1.0, BZ0 + 0.22, 0, 0, 0, 0.02);
  K.lathe('timber', [[0, 0], [0.16, 0], [0.19, 0.17], [0.16, 0.34], [0, 0.34]], 8, T(-0.6, 1.03, BZ0 + 0.22));
  for (const y of [1.08, 1.32]) put('iron', new THREE.TorusGeometry(0.175, 0.015, 3, 8), T(-0.6, y, BZ0 + 0.22, Math.PI / 2));
  // lanterns: lathed glass and cap
  const lantern = (x, y, z) => {
    K.lathe('iron', [[0, 0.12], [0.11, 0.1], [0.12, 0.08], [0.0, 0.2]], 6, T(x, y, z));
    K.lathe('lampglow', [[0, -0.12], [0.07, -0.11], [0.08, 0.0], [0.07, 0.1], [0, 0.11]], 6, T(x, y, z));
    K.lathe('iron', [[0, -0.15], [0.09, -0.14], [0.09, -0.1], [0, -0.1]], 6, T(x, y, z));
    for (let a = 0; a < 3; a++) box('iron', 0.04, 0.24, 0.04, x + 0.085 * Math.cos(a * 2.1), y, z + 0.085 * Math.sin(a * 2.1), 0, 0, 0, 0);
    put('iron', new THREE.TorusGeometry(0.05, 0.012, 3, 5), T(x, y + 0.25, z));
  };
  for (const sx of [-1, 1]) { lantern(sx * FXp, AY1 - 0.36, AZ1 + 0.12); box('iron', 0.04, 0.1, 0.04, sx * FXp, AY1 - 0.08, AZ1 + 0.12, 0, 0, 0, 0); }
  lantern(BX + 0.22, 1.95, -0.6); box('iron', 0.16, 0.04, 0.04, BX + 0.14, 2.24, -0.6, 0, 0, 0, 0);
  K.finish(g);
  return recentre(THREE, g);
}
