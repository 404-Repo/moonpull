// jetty B: profiles. Lathe logs with rounded weathered tops, planks extruded from a bevelled cross-section,
// ladder extruded from one outline with rung holes, rope via TubeGeometry. Tiles at 8 m along Z.
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

export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 22);
  const { box, beam, jit, put, T } = K;
  const PZ = [-8 / 3, 0, 8 / 3], PX = 1.13, DECK = 2.6;
  const logGeo = (r, h) => new THREE.LatheGeometry([[0, 0], [r * 1.06, 0], [r, h * 0.5], [r * 0.97, h - 0.06], [r * 0.7, h - 0.01], [0, h]].map((p) => new THREE.Vector2(p[0], p[1])), 8);
  const wetGeo = (r, h) => new THREE.LatheGeometry([[0, 0], [r * 1.1, 0], [r * 1.05, h]].map((p) => new THREE.Vector2(p[0], p[1])), 8);
  for (const z of PZ) for (const s of [-1, 1]) {
    const x = s * PX, top = s > 0 ? 3.45 : 2.8;
    put('wet', wetGeo(0.15, 1.5), T(x, 0, z, 0, jit(1), 0));
    put('timber', logGeo(0.145, top - 1.5), T(x, 1.5, z, 0, jit(1), 0));
    put('rope', new THREE.TorusGeometry(0.155, 0.03, 3, 9), T(x, 2.3, z, Math.PI / 2, 0, 0));
  }
  // plank cross-section, chamfered top edges; extruded along X
  const plank = (w, t) => { const c = 0.02; return new THREE.Shape([[-w / 2, -t / 2], [w / 2, -t / 2], [w / 2, t / 2 - c], [w / 2 - c, t / 2], [-w / 2 + c, t / 2], [-w / 2, t / 2 - c]].map((p) => new THREE.Vector2(p[0], p[1]))); };
  const ex = (shape, L) => { const g2 = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false, curveSegments: 1 }); g2.translate(0, 0, -L / 2); return g2; };
  const N = 29, pitch = 8 / N;
  for (let i = 0; i < N; i++) {
    const z = -4 + pitch * (i + 0.5), w = pitch - 0.035;
    // shape XY = (z-width, thickness); extrude Z then rotate so extrusion runs along X
    put('timber', ex(plank(w, 0.09), 2.44 + jit(0.06)), T(jit(0.03), DECK - 0.045 + jit(0.01), z, jit(0.012), Math.PI / 2, jit(0.01)));
  }
  // cap beams + stringers (extruded chamfered squares)
  const sq = (a) => plank(a, a);
  for (const z of PZ) put('timber', ex(sq(0.2), 2.55), T(0, 2.3, z, 0, Math.PI / 2, 0));
  for (const x of [-0.95, 0, 0.95]) put('timber', ex(sq(0.17), 8), T(x, 2.415, 0));
  // braces
  for (const z of PZ) {
    beam('wet', [-PX, 0.4, z + 0.17], [PX, 2.15, z + 0.17], 0.13, 0.08, 0);
    beam('wet', [PX, 0.4, z - 0.17], [-PX, 2.15, z - 0.17], 0.13, 0.08, 0);
  }
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const z0 = PZ[k], z1 = PZ[k + 1], x = s * (PX + 0.17);
    beam('timber', [x, 0.55, z0 + 0.12], [x, 2.15, z1 - 0.12], 0.14, 0.08, 0);
    beam('timber', [x, 2.15, z0 + 0.12], [x, 0.55, z1 - 0.12], 0.14, 0.08, 0);
  }
  // rope: catenary halves meeting at tile boundary low points
  const RY = 3.28, SAG = 0.34;
  const rope = (z0, z1, mid) => {
    const pts = []; for (let i = 0; i <= 10; i++) { const z = z0 + (z1 - z0) * i / 10; const u = (z - mid) / (4 / 3); pts.push(new THREE.Vector3(PX, RY - SAG * (1 - u * u), z)); }
    put('rope', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.035, 5, false));
  };
  rope(PZ[0], PZ[1], -4 / 3); rope(PZ[1], PZ[2], 4 / 3); rope(-4, PZ[0], -4); rope(PZ[2], 4, 4);
  for (const z of PZ) put('rope', new THREE.TorusGeometry(0.15, 0.04, 4, 9), T(PX, RY, z, Math.PI / 2, 0, 0));
  // ladder: one outline with rung holes, extruded 0.07, leaning on -x side
  const LH = 2.9, LW = 0.6, rw = 0.08;
  const sh = new THREE.Shape([[-LW / 2, 0], [LW / 2, 0], [LW / 2, LH], [-LW / 2, LH]].map((p) => new THREE.Vector2(p[0], p[1])));
  for (let i = 0; i < 7; i++) { const y0 = 0.25 + i * 0.37, y1 = y0 + 0.29; sh.holes.push(new THREE.Path([[-LW / 2 + rw, y0], [-LW / 2 + rw, y1], [LW / 2 - rw, y1], [LW / 2 - rw, y0]].map((p) => new THREE.Vector2(p[0], p[1])))); }
  const lg = new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false, curveSegments: 1 });
  lg.translate(0, 0, -0.035);
  // shape plane XY: x across ladder -> world Z, y up the ladder; lean top toward deck (+x)
  put('drift', lg, T(-PX - 0.42, 0.3, 1.33, 0, Math.PI / 2, -0.13));
  K.finish(g);
  return recentre(THREE, g);
}
