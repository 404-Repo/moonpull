// moon_shrine C: different breakdown. Masonry reading: steps and column assembled from individual irregular stones,
// shaft as three stacked tapering drums, the moonstone set in an eight-voussoir stone frame, roof with a sagging ridge
// (tiles follow a curved slope) on a timber frame with a gable collar.
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
  const K = makeKit(THREE, 21);
  const { box, boxB, put, T, V, jit, beam } = K;
  // steps: ring of rough blocks, low then high
  const ring = (y, h, half, n, depth) => {
    const L = half * 2;
    for (const s of [-1, 1]) {
      for (let i = 0; i < n; i++) { const w = L / n; boxB('stone', w - 0.015, h + jit(0.015), depth, -half + w * (i + 0.5), y, s * (half - depth / 2), jit(0.04), 0.035); }
      const m = Math.max(1, n - 1), w2 = (L - 2 * depth) / m;
      for (let i = 0; i < m; i++) boxB('stone', depth, h + jit(0.015), w2 - 0.015, s * (half - depth / 2), y, -half + depth + w2 * (i + 0.5), jit(0.04), 0.035);
    }
    boxB('stone', L - 2 * depth + 0.01, h - 0.01, L - 2 * depth + 0.01, 0, y, 0, 0, 0);
  };
  ring(0, 0.15, 0.54, 2, 0.3);
  ring(0.15, 0.15, 0.41, 2, 0.2);
  boxB('stone', 0.46, 0.08, 0.2, 0, 0, 0.64, 0.05, 0.03);
  for (const [x, z] of [[-0.45, 0.42], [0.4, -0.46], [0.46, 0.25]]) boxB('kelp', 0.16, 0.02, 0.11, x, 0.15 + 0.01, z, 0.4, 0);
  // plinth with recessed panel: frame bars and a raised diamond boss on each face
  boxB('stone', 0.5, 0.33, 0.5, 0, 0.3, 0, 0, 0.04);
  boxB('stone', 0.56, 0.06, 0.56, 0, 0.6, 0, 0, 0.025);
  for (let f = 0; f < 4; f++) K.frame(T(0, 0.465, 0, 0, f * Math.PI / 2, 0), () => {
    const z = 0.26;
    box('stone', 0.4, 0.035, 0.03, 0, 0.11, z, 0, 0, 0, 0); box('stone', 0.4, 0.035, 0.03, 0, -0.11, z, 0, 0, 0, 0);
    box('stone', 0.035, 0.19, 0.03, 0.18, 0, z, 0, 0, 0, 0); box('stone', 0.035, 0.19, 0.03, -0.18, 0, z, 0, 0, 0, 0);
    box('stone', 0.11, 0.11, 0.045, 0, 0, z, 0, 0, Math.PI / 4, 0);
    box('stone', 0.05, 0.05, 0.03, -0.11, 0, z, 0, 0, Math.PI / 4, 0); box('stone', 0.05, 0.05, 0.03, 0.11, 0, z, 0, 0, Math.PI / 4, 0);
  });
  // shaft: three stacked tapering drums (square, chamfered)
  const drums = [[0.36, 0.66, 0.2], [0.34, 0.86, 0.2], [0.32, 1.06, 0.16]];
  for (const [w, y, h] of drums) boxB('stone', w + jit(0.01), h - 0.005, w + jit(0.01), jit(0.008), y, jit(0.008), jit(0.05), 0.03);
  // capital: underslab + thick slab with zig-zag teeth
  boxB('stone', 0.42, 0.05, 0.42, 0, 1.2, 0, 0, 0.015);
  boxB('stone', 0.62, 0.13, 0.62, 0, 1.24, 0, 0, 0.04);
  for (let f = 0; f < 4; f++) K.frame(T(0, 1.305, 0, 0, f * Math.PI / 2, 0), () => {
    for (let i = 0; i < 4; i++) box('stone', 0.07, 0.07, 0.025, -0.195 + i * 0.13, 0, 0.31, 0, 0, Math.PI / 4, 0);
  });
  // cloth wraps and strips, rope + shells
  const by = 0.95, hw = 0.18;
  for (let f = 0; f < 4; f++) K.frame(T(0, by, 0, 0, f * Math.PI / 2, 0), () => box('tile', hw * 2 + 0.04, 0.09, 0.04, 0, 0, hw, 0, 0, 0, 0));
  box('tile', 0.08, 0.38, 0.03, -0.09, by - 0.22, hw + 0.02, 0.06, 0, 0.07, 0);
  box('cream', 0.06, 0.32, 0.03, 0.02, by - 0.19, hw + 0.025, 0.06, 0, -0.05, 0);
  box('tile', 0.07, 0.3, 0.03, 0.08, by - 0.18, -hw - 0.02, -0.06, 0, 0.05, 0);
  box('cream', 0.06, 0.3, 0.03, -hw - 0.02, by - 0.17, -0.05, 0, 0, -0.06, 0);
  box('cream', 0.06, 0.36, 0.03, 0.29, 1.08, 0.3, 0, 0, 0.05, 0);
  const rope = new THREE.CatmullRomCurve3([V(-0.2, 0.84, 0.12), V(-0.1, 0.77, 0.22), V(0.06, 0.76, 0.22), V(0.2, 0.83, 0.12), V(0.21, 0.85, -0.1), V(0, 0.83, -0.21), V(-0.21, 0.85, -0.1)], true);
  put('rope', new THREE.TubeGeometry(rope, 18, 0.02, 4, true), null);
  const shell = (x, y, z, rx, ry) => put('cream', new THREE.ConeGeometry(0.04, 0.03, 5, 1), T(x, y, z, rx, ry, 0, 1, 1, 0.5));
  for (const [x, y, z, rx, ry] of [[-0.11, 0.72, 0.235, 1.5, 0], [0.0, 0.7, 0.235, 1.5, 0], [0.1, 0.71, 0.235, 1.5, 0], [0.22, 0.77, 0, 1.5, Math.PI / 2], [0.04, 0.77, -0.23, 1.5, Math.PI], [-0.32, 0.31, 0.33, 0, 0], [0.33, 0.31, 0.35, 0, 1], [0.2, 0.16, 0.48, 0, 2]]) shell(x, y + 0.015, z, rx, ry);
  // moonstone in eight-voussoir frame
  const dy = 1.57, R = 0.215;
  boxB('stone', 0.28, 0.08, 0.2, 0, 1.37, 0, 0, 0.025);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; box('stone', 0.17, 0.09, 0.15, Math.cos(a) * R, dy + Math.sin(a) * R, 0, 0, 0, a + Math.PI / 2, 0); }
  put('moonstone', new THREE.SphereGeometry(0.17, 10, 6), T(0, dy, 0, 0, 0, 0, 1, 1, 0.45));
  // timber frame: four posts, side plates, gable collar above the stone
  const px = 0.3, pz = 0.22, y1 = 1.6;
  for (const sx of [-1, 1]) { for (const sz of [-1, 1]) boxB('timber', 0.08, y1 - 1.37, 0.08, sx * px, 1.37, sz * pz, jit(0.05), 0.015); box('timber', 0.085, 0.08, 0.62, sx * px, y1 - 0.02, 0, 0, 0, 0, 0.015); }
  // roof with sagging slope: each slope is bent (tile rows follow a curve dropping steeper near the eave)
  const ridgeY = 1.95, zf = 0.44, L = 0.64, a0 = 0.58, a1 = 0.86;
  const slopePt = (t) => { // t in [0, L] -> (x, y) along a concave curve
    const u = t / L; const ang = a0 + (a1 - a0) * u * u; // steepens toward... keep concave (sag) by flattening at the eave
    let x = 0, y = 0; const n = 8; for (let k = 0; k < n; k++) { const uu = (k + 0.5) / n * u; const an = a1 - (a1 - a0) * uu; x += Math.cos(an) * t / n; y += Math.sin(an) * t / n; }
    return [x, ridgeY - y];
  };
  const tw = 0.21, tl = 0.21, step = 0.14;
  for (const s of [1, -1]) {
    // underboard as short segments along the curve
    for (let k = 0; k < 4; k++) { const [x0, y0] = slopePt(L * k / 4), [x1, y1b] = slopePt(L * (k + 1) / 4); beam('drift', [s * x0, y0 - 0.02, 0], [s * x1, y1b - 0.02, 0], 0.03, 2 * zf, 0); }
    for (let r = 0; r * step + tl <= L + 0.02; r++) {
      const tc = L - tl / 2 - r * step; const [xa, ya] = slopePt(tc - tl / 2), [xb, yb] = slopePt(tc + tl / 2);
      const ang = Math.atan2(ya - yb, xb - xa); const cx = (xa + xb) / 2, cy = (ya + yb) / 2;
      const off = (r % 2) * tw / 2;
      for (let x = -zf - off; x < zf; x += tw) {
        const z0 = Math.max(x, -zf), z1 = Math.min(x + tw * 0.93, zf); if (z1 - z0 < 0.05) continue;
        // tile: thin box, tilted by the slope angle about Z, butt lifted
        box('tile', tl, 0.03, z1 - z0, s * (cx + Math.sin(ang) * 0.03), cy + Math.cos(ang) * 0.03 + jit(0.004), (z0 + z1) / 2, 0, jit(0.05), -s * (ang - 0.2) + jit(0.03), 0);
      }
    }
    // barge boards along the curve, front and back, with upturned tip
    for (const z of [zf + 0.025, -zf - 0.025]) {
      for (let k = 0; k < 3; k++) { const [x0, y0] = slopePt(L * k / 3 - (k ? 0 : 0)), [x1, y1b] = slopePt(L * (k + 1) / 3 + (k === 2 ? 0.02 : 0)); beam('timber', [s * x0, y0 + 0.05, z], [s * x1, y1b + 0.05, z], 0.08, 0.05, 0); }
      const [xe, ye] = slopePt(L); box('timber', 0.1, 0.07, 0.05, s * (xe + 0.04), ye + 0.09, z, 0, 0, s * 0.6, 0);
    }
  }
  // gable collar beam above the stone + ridge
  for (const z of [zf - 0.02, -zf + 0.02]) box('timber', 0.3, 0.06, 0.06, 0, 1.85, z, 0, 0, 0, 0);
  box('timber', 0.1, 0.1, 2 * zf + 0.14, 0, ridgeY + 0.07, 0, 0, 0, Math.PI / 4, 0.02);
  K.finish(g);
  return recentre(THREE, g);
}
