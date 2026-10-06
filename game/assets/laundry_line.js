// laundry_line B: profiles. Garments are ShapeGeometry silhouettes (T-shirt with sleeves and collar dip,
// long-sleeved jumper, towel with stripe bands cut as separate shapes, sheet with a ragged hem), each
// subdivided and bent in z; rope is a TubeGeometry along the catenary; posts are extruded hewn sections
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
// with bevelled tops, rope lashings as torus pairs, cobble pads of a few flat stones.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 53);
  const { box, put, T, jit, rnd } = K;
  const fab = (k, c) => addMat(K, k, c, 0.92, 'fabric', { side: THREE.DoubleSide });
  fab('red', 0xb5402f); fab('blue', 0x3f6fa8); fab('white', 0xe9e4d6); fab('sheet', 0xe2d4b0); fab('yellow', 0xd9a63a); fab('green', 0x5f8a3a);
  const PX = 2.0, PH = 2.2, RY = 2.02, SAG = 0.32;
  const hewn = new THREE.Shape([[-0.06, -0.09], [0.06, -0.09], [0.09, -0.06], [0.09, 0.06], [0.06, 0.09], [-0.06, 0.09], [-0.09, 0.06], [-0.09, -0.06]].map((p) => new THREE.Vector2(p[0], p[1])));
  for (const sx of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(hewn, { depth: PH - 0.06, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.03, bevelSegments: 1 }); geo.rotateX(-Math.PI / 2);
    put('timber', geo, T(sx * PX, 0.03, 0, 0, jit(0.2), 0));
    for (let k = 0; k < 5; k++) put('stone', new THREE.CylinderGeometry(0.1, 0.11, 0.05, 6), T(sx * PX + Math.cos(k * 1.26 + 0.3) * 0.17, 0.025, Math.sin(k * 1.26 + 0.3) * 0.17, 0, rnd(), 0));
    for (const dy of [-0.02, 0.04]) put('rope', new THREE.TorusGeometry(0.12, 0.024, 4, 9), T(sx * PX, RY + dy, 0, Math.PI / 2, 0, 0));
  }
  const ropeY = (x) => { const t = (x + PX) / (2 * PX); return RY - SAG * 4 * t * (1 - t); };
  const pts = []; for (let i = 0; i <= 12; i++) { const x = -PX + 0.1 + (2 * PX - 0.2) * i / 12; pts.push([x, ropeY(x), 0]); }
  tube(K, 'rope', pts, 0.018, 4, 30);
  const slope = (x) => (ropeY(x + 0.05) - ropeY(x - 0.05)) / 0.1;
  // silhouette -> ShapeGeometry, subdivided via a fine outline, then bent
  function garment(key, outline, cx, dy, wave, k, rz = 0) {
    const sh = new THREE.Shape(outline.map((p) => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ShapeGeometry(sh, 3); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), d = -p.getY(i) / 0.6; p.setZ(i, wave * Math.sin(x * k + 0.5) * (0.25 + d) + 0.035 * d * d); }
    geo.computeVertexNormals(); put(key, geo, T(cx, ropeY(cx) + dy, 0, 0, 0, Math.atan(slope(cx)) * 0.6 + rz, GS, GS, GS));
  }
  const GS = 1.25;
  const peg = (x) => box('timber', 0.04, 0.11, 0.045, x, ropeY(x) - 0.01, 0.02, 0, 0, 0, 0.008);
  const dense = (pts, n = 3) => { const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } return out; };
  // T-shirt
  let x = -1.42;
  garment('red', dense([[-0.12, 0], [-0.05, -0.05], [0.05, -0.05], [0.12, 0], [0.2, -0.01], [0.32, -0.14], [0.24, -0.22], [0.2, -0.17], [0.21, -0.5], [0.08, -0.47], [-0.04, -0.52], [-0.2, -0.49], [-0.2, -0.17], [-0.24, -0.22], [-0.32, -0.14], [-0.2, -0.01]]), x, -0.04, 0.03, 13);
  peg(x - 0.19); peg(x + 0.19);
  // striped towel: bands as separate shapes sharing one bend field
  x = -0.66; for (let s = 0; s < 7; s++) { const y0 = -s * 0.09, y1 = y0 - 0.09; garment(s % 2 ? 'white' : 'blue', dense([[-0.23, y0], [0.23, y0], [0.23 + (s === 6 ? 0.01 : 0), y1], [-0.23, y1]], 4), x, -0.04, 0.035, 12); }
  peg(x - 0.24); peg(x + 0.24);
  // sheet with ragged hem
  x = 0.12; { const o = [[-0.31, 0], [0.31, 0], [0.32, -0.74]]; for (let i = 1; i < 8; i++) o.push([0.32 - i * 0.08, -0.74 - (i % 2 ? 0.05 : 0) - 0.03 * Math.sin(i)]); o.push([-0.31, -0.7]); garment('sheet', dense(o, 3), x, -0.03, 0.05, 15); }
  peg(x - 0.34); peg(x + 0.34);
  // jumper with long sleeves hanging down
  x = 0.98;
  garment('yellow', dense([[-0.1, 0], [0.1, 0], [0.2, -0.01], [0.33, -0.08], [0.33, -0.44], [0.25, -0.44], [0.24, -0.14], [0.2, -0.16], [0.2, -0.46], [-0.2, -0.46], [-0.2, -0.16], [-0.24, -0.14], [-0.25, -0.44], [-0.33, -0.44], [-0.33, -0.08], [-0.2, -0.01]]), x, -0.05, 0.03, 11);
  peg(x - 0.2); peg(x + 0.2);
  x = 1.62; garment('green', dense([[-0.09, 0], [0.09, 0], [0.11, -0.28], [0.0, -0.32], [-0.08, -0.27]]), x, -0.03, 0.025, 15, 0.12); peg(x);
  K.finish(g);
  return recentre(THREE, g);
}
