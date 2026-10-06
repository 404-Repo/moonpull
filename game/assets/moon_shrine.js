// moon_shrine A: primitives. Box steps, carved plinth (raised diamond bars), tapered 4-sided shaft, zig-zag capital,
// torus-ringed moonstone disc, four timber posts and a box-tiled gable roof.
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
  const K = makeKit(THREE, 5);
  const { box, boxB, cyl, put, T, V, jit, beam } = K;
  // ---- stepped base (blocky, slightly irregular blocks) ----
  const course = (y, h, half, nPer, key = 'stone') => {
    // ring of blocks around a square of half-size `half`
    const L = half * 2, bl = L / nPer;
    for (let i = 0; i < nPer; i++) {
      const x = -half + bl * (i + 0.5);
      boxB(key, bl - 0.01, h + jit(0.01), 0.24, x + jit(0.01), y, half - 0.12, jit(0.03), 0.03);
      boxB(key, bl - 0.01, h + jit(0.01), 0.24, x + jit(0.01), y, -half + 0.12, jit(0.03), 0.03);
    }
    const sn = Math.max(1, nPer - 2);
    for (let i = 0; i < sn; i++) {
      const z = -half + 0.24 + (L - 0.48) / sn * (i + 0.5);
      boxB(key, 0.24, h + jit(0.01), (L - 0.48) / sn - 0.01, half - 0.12, y, z + jit(0.01), jit(0.03), 0.03);
      boxB(key, 0.24, h + jit(0.01), (L - 0.48) / sn - 0.01, -half + 0.12, y, z + jit(0.01), jit(0.03), 0.03);
    }
    boxB(key, L - 0.46, h - 0.01, L - 0.46, 0, y, 0, 0, 0.0);
  };
  course(0, 0.16, 0.52, 3);
  course(0.16, 0.15, 0.4, 2);
  boxB('stone', 0.5, 0.09, 0.2, 0, 0, 0.6, 0, 0.03); // front tread
  // moss patches
  for (const [x, z] of [[-0.42, 0.45], [0.38, -0.47], [0.47, 0.3], [-0.3, -0.36]]) boxB('kelp', 0.14, 0.02, 0.1, x, 0.16, z, 0.3, 0);
  // ---- carved plinth ----
  const py0 = 0.31, ph = 0.32, pw = 0.5;
  boxB('stone', pw, ph, pw, 0, py0, 0, 0, 0.04);
  boxB('stone', pw + 0.06, 0.05, pw + 0.06, 0, py0 + ph - 0.02, 0, 0, 0.02);
  for (let f = 0; f < 4; f++) {
    const ry = f * Math.PI / 2;
    K.frame(T(0, py0 + ph / 2 - 0.01, 0, 0, ry, 0), () => {
      const z = pw / 2 + 0.008, r = 0.1;
      for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; box('stone', 0.15, 0.03, 0.025, Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, z, 0, 0, a + Math.PI / 2, 0); }
      box('stone', 0.05, 0.05, 0.02, 0, 0, z, 0, 0, Math.PI / 4, 0);
    });
  }
  // ---- tapered shaft ----
  const sy0 = py0 + ph + 0.03, sy1 = 1.2;
  put('stone', new THREE.CylinderGeometry(0.3 / Math.SQRT2 * 1.0, 0.37 / Math.SQRT2, sy1 - sy0, 4, 1), T(0, (sy0 + sy1) / 2, 0, 0, Math.PI / 4, 0));
  // cloth band around shaft + hanging strips + rope with shells
  const by = 0.92, bw = 0.355;
  for (let f = 0; f < 4; f++) K.frame(T(0, by, 0, 0, f * Math.PI / 2, 0), () => box('tile', bw + 0.03, 0.08, 0.04, 0, 0, bw / 2, 0, 0, 0, 0));
  box('tile', 0.07, 0.36, 0.025, -0.1, by - 0.2, 0.2, 0.08, 0, 0.06, 0);
  box('cream', 0.06, 0.3, 0.025, -0.02, by - 0.17, 0.205, 0.08, 0, -0.04, 0);
  box('tile', 0.07, 0.3, 0.025, 0.12, by - 0.17, -0.2, -0.08, 0, 0.05, 0);
  const rope = new THREE.CatmullRomCurve3([V(-0.19, 0.9, 0.12), V(-0.1, 0.82, 0.22), V(0.06, 0.8, 0.22), V(0.19, 0.88, 0.12), V(0.2, 0.92, -0.1), V(0.0, 0.9, -0.2), V(-0.2, 0.92, -0.1), V(-0.19, 0.9, 0.12)]);
  put('rope', new THREE.TubeGeometry(rope, 16, 0.02, 4, false), null);
  const shell = (x, y, z, ry, rx = 0.4, s = 1) => put('cream', new THREE.SphereGeometry(0.038 * s, 5, 2, 0, Math.PI * 2, 0, Math.PI / 2), T(x, y, z, rx, ry, 0, 1, 0.45, 1));
  shell(-0.12, 0.76, 0.24, 0, 1.4); shell(0.0, 0.74, 0.24, 0, 1.4); shell(0.1, 0.75, 0.24, 0, 1.4); shell(0.2, 0.8, 0.0, Math.PI / 2, 1.4); shell(-0.21, 0.8, 0.0, -Math.PI / 2, 1.4); shell(0.05, 0.8, -0.23, Math.PI, 1.4);
  // shells on steps
  for (const [x, z] of [[-0.3, 0.33], [0.33, 0.36], [0.18, 0.47]]) shell(x, 0.31 - (Math.abs(x) > 0.39 || Math.abs(z) > 0.39 ? 0.15 : 0), z, x * 3, 0, 1.2);
  // ---- capital with zig-zag carving ----
  const cy0 = sy1, ch = 0.14, cw = 0.62;
  boxB('stone', 0.42, 0.05, 0.42, 0, cy0 - 0.03, 0, 0, 0.015);
  boxB('stone', cw, ch, cw, 0, cy0, 0, 0, 0.04);
  for (let f = 0; f < 4; f++) K.frame(T(0, cy0 + ch / 2, 0, 0, f * Math.PI / 2, 0), () => {
    for (let i = 0; i < 5; i++) { const x = -0.22 + i * 0.11; box('stone', 0.085, 0.02, 0.018, x, 0, cw / 2 + 0.006, 0, 0, i % 2 ? 0.75 : -0.75, 0); }
  });
  // hanging cloth from capital corners
  box('cream', 0.06, 0.34, 0.03, 0.27, cy0 - 0.15, 0.32, 0, 0, 0.05, 0);
  box('tile', 0.06, 0.28, 0.03, -0.29, cy0 - 0.12, -0.32, 0, 0, -0.05, 0);
  // ---- moonstone in stone ring ----
  const dy = 1.57;
  boxB('stone', 0.26, 0.1, 0.18, 0, cy0 + ch, 0, 0, 0.03);
  put('stone', new THREE.TorusGeometry(0.2, 0.055, 4, 12), T(0, dy, 0));
  cyl('stone', 0.2, 0.2, 0.06, 14, 0, dy, 0, Math.PI / 2, 0, 0);
  put('moonstone', new THREE.SphereGeometry(0.165, 10, 5), T(0, dy, 0, 0, 0, 0, 1, 1, 0.42));
  // ---- posts + roof ----
  const px = 0.29, pz = 0.22, y0 = cy0 + ch, y1 = 1.6;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) boxB('timber', 0.075, y1 - y0, 0.075, sx * px, y0, sz * pz, jit(0.05), 0.015);
  for (const sx of [-1, 1]) box('timber', 0.08, 0.08, 0.62, sx * px, y1 - 0.02, 0, 0, 0, 0, 0.015);
  // roof: ridge along Z, gable faces +Z
  const a = 0.7, ridgeY = 1.93, zf = 0.42, L = 0.6;
  for (const s of [1, -1]) {
    const d = V(s * Math.cos(a), -Math.sin(a), 0), r = V(0, 0, -s), n = d.clone().cross(r);
    const M = new THREE.Matrix4().makeBasis(r, n, d).setPosition(0, ridgeY, s * zf);
    K.frame(M, () => {
      box('drift', 2 * zf, 0.03, L, zf, -0.015, L / 2, 0, 0, 0, 0);
      const tw = 0.21, tl = 0.21, step = tl * 0.62;
      for (let row = 0; row * step + tl <= L + 0.04; row++) {
        const zc = L - tl / 2 - row * step, off = (row % 2) * tw / 2;
        for (let x = -tw / 2 + off; x < 2 * zf; x += tw) {
          const x0 = Math.max(x, 0), x1 = Math.min(x + tw * 0.93, 2 * zf); if (x1 - x0 < 0.05) continue;
          box('tile', x1 - x0, 0.03, tl, (x0 + x1) / 2, 0.03 + jit(0.004), zc, -0.2 + jit(0.04), jit(0.05), jit(0.03), 0);
        }
      }
    });
    // barge boards (front and back), curling up at the eave
    for (const z of [zf + 0.02, -zf - 0.02]) {
      beam('timber', [0, ridgeY + 0.04, z], [s * Math.cos(a) * (L + 0.02), ridgeY - Math.sin(a) * (L + 0.02) + 0.04, z], 0.085, 0.05, 0);
      box('timber', 0.1, 0.07, 0.05, s * (Math.cos(a) * L + 0.03), ridgeY - Math.sin(a) * L + 0.07, z, 0, 0, s * 0.5, 0);
    }
  }
  box('timber', 0.11, 0.1, 2 * zf + 0.12, 0, ridgeY + 0.07, 0, 0, 0, Math.PI / 4, 0.02);
  boxB('timber', 0.09, 0.1, 0.09, 0, ridgeY + 0.08, zf + 0.04, 0, 0.02);
  K.finish(g);
  return recentre(THREE, g);
}
