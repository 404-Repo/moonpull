// well_islet B: profiles. Stones are bevelled annular sectors (Extrude), posts/windlass/bucket/barnacles are Lathes,
// each gable truss is one extruded A-frame outline with a hole, tile rows are single extruded strips with tongue-and-notch lower edges.
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
  const K = makeKit(THREE, 32);
  const { box, beam, jit, put, T } = K;
  const V2 = (p) => new THREE.Vector2(p[0], p[1]);
  const lathe = (key, pts, seg, m, phi = 0) => put(key, new THREE.LatheGeometry(pts.map(V2), seg, phi), m);
  const exShape = (pts, depth, bev, holes) => {
    const sh = new THREE.Shape(pts.map(V2)); if (holes) holes.forEach((h) => sh.holes.push(new THREE.Path(h.map(V2))));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: bev > 0, bevelSize: bev, bevelThickness: bev, bevelSegments: 1, curveSegments: 2 });
    return geo;
  };
  // ring of sector stones (bevel subtracted so the course is the size drawn)
  const ring = (n, r0, r1, y0, h, off) => {
    const b = 0.025;
    for (let i = 0; i < n; i++) {
      const gap = 0.05 / ((r0 + r1) / 2) + (2 * b) / ((r0 + r1) / 2);
      const a0 = (i + off) / n * Math.PI * 2 + gap / 2, a1 = (i + 1 + off) / n * Math.PI * 2 - gap / 2, am = (a0 + a1) / 2;
      const R0 = r0 + b + jit(0.015), R1 = r1 - b + jit(0.02);
      const pts = [[R0 * Math.cos(a0), R0 * Math.sin(a0)], [R0 * Math.cos(am), R0 * Math.sin(am)], [R0 * Math.cos(a1), R0 * Math.sin(a1)], [R1 * Math.cos(a1), R1 * Math.sin(a1)], [R1 * Math.cos(am), R1 * Math.sin(am)], [R1 * Math.cos(a0), R1 * Math.sin(a0)]];
      const hh = h - 2 * b + jit(0.02);
      put('stone', exShape(pts, hh, b), T(0, y0 + b, 0, -Math.PI / 2, 0, 0));
    }
  };
  ring(11, 0.72, 1.0, 0, 0.36, 0);
  ring(10, 0.62, 0.86, 0.36, 0.3, 0.5);
  ring(10, 0.6, 0.9, 0.66, 0.28, 0);
  K.cyl('iron', 0.63, 0.63, 0.04, 14, 0, 0.82, 0);
  // barnacles (tiny lathe volcanoes) and kelp blades
  for (let i = 0; i < 12; i++) {
    const a = K.rnd() * Math.PI * 2, y = 0.07 + K.rnd() * 0.25, s = 0.7 + K.rnd() * 0.6;
    lathe('cream', [[0.012, 0.03], [0.04, 0.0], [0.05, -0.02]], 5, T(Math.cos(a) * 1.0, y, Math.sin(a) * 1.0, 0, 0, 0, s, s, s).multiply(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(a), 0.2, Math.sin(a)).normalize()))));
  }
  for (const a0 of [0.7, 2.3, 3.7, 5.2]) for (let j = 0; j < 3; j++) {
    const a = a0 + j * 0.12, h = 0.4 + K.rnd() * 0.25;
    put('kelp', exShape([[-0.04, 0], [0.04, 0], [0.03, h * 0.6], [0.06, h], [-0.01, h * 0.7]], 0.02, 0), T(Math.cos(a) * 1.02, 0.15, Math.sin(a) * 1.02, jit(0.25), -a + Math.PI / 2, jit(0.3)));
  }
  // posts (lathe, 4 segments = square, flared foot)
  const PX = 0.8, EY = 2.25, RY = 2.9;
  for (const s of [-1, 1]) {
    lathe('timber', [[0, 0], [0.15, 0], [0.12, 0.12], [0.12, EY - 0.62], [0, EY - 0.62]], 4, T(s * PX, 0.6, 0), Math.PI / 4);
    // gable truss: one outline (rafters + tie + king post) with two holes
    const out = [[-0.95, 0], [0.95, 0], [0.95, 0.1], [0.13, RY - EY + 0.05], [-0.13, RY - EY + 0.05], [-0.95, 0.1]];
    const hy = RY - EY;
    const holes = [[[-0.72, 0.1], [-0.07, 0.1], [-0.07, hy * 0.82]], [[0.07, 0.1], [0.72, 0.1], [0.07, hy * 0.82]]];
    const tg = exShape(out, 0.12, 0, holes); tg.translate(0, 0, -0.06);
    put('timber', tg, T(s * PX, EY - 0.05, 0, 0, Math.PI / 2, 0));
    beam('timber', [s * PX, EY - 0.5, 0.08], [s * PX, EY - 0.05, 0.5], 0.09, 0.09, 0);
    beam('timber', [s * PX, EY - 0.5, -0.08], [s * PX, EY - 0.05, -0.5], 0.09, 0.09, 0);
  }
  box('timber', 2.42, 0.16, 0.18, 0, RY + 0.1, 0, 0, 0, 0, 0.04);
  // roof: board + extruded tile rows
  const run = 1.02, rise = RY - EY + 0.03, a = Math.atan2(rise, run), L = Math.hypot(run, rise) + 0.05, W = 2.3;
  const row = (zTop, zBot, off) => {
    const pts = [[0, 0], [W, 0]]; zBot = zBot - zTop; const tw = 0.38;
    const xs = []; for (let x = W; x > 0.001; x -= tw) xs.push(x); xs.push(0);
    // shape y = -z so walking right-to-left along the bottom keeps a simple polygon
    for (let i = 0; i < xs.length - 1; i++) {
      const x1 = xs[i] - (i === 0 ? 0 : 0.015), x0 = Math.max(xs[i + 1] + 0.015, 0);
      pts.push([x1, -(zBot - 0.05)], [x1 - 0.04, -zBot], [x0 + 0.04, -zBot], [x0, -(zBot - 0.05)]);
    }
    return exShape(pts, 0.045, 0);
  };
  const slope = (m) => K.frame(m, () => {
    box('timber', W, 0.06, L, W / 2, -0.03, L / 2, 0, 0, 0, 0.015);
    for (let r = 0; r < 4; r++) {
      const zb = L - r * 0.29, zt = zb - 0.36;
      // shape plane XY -> slope plane: rx=+90deg maps shape y to -z... use rx so shape y(-z) -> +z down-slope
      put('tile', row(Math.max(zt, 0), zb), T(0, 0.01, Math.max(zt, 0), -Math.PI / 2 - 0.12, 0, 0));
    }
  });
  slope(T(-W / 2, RY + 0.05, 0, a, 0, 0));
  slope(T(W / 2, RY + 0.05, 0, a, Math.PI, 0));
  // windlass log (lathe, along X) with rope coil
  const WY = 1.6;
  lathe('timber', [[0, -0.74], [0.1, -0.74], [0.11, -0.6], [0.11, 0.6], [0.1, 0.74], [0, 0.74]], 8, T(0, WY, 0, 0, 0, Math.PI / 2));
  lathe('rope', [[0, -0.16], [0.14, -0.16], [0.155, -0.08], [0.14, 0], [0.155, 0.08], [0.14, 0.16], [0, 0.16]], 8, T(-0.05, WY, 0, 0, 0, Math.PI / 2));
  K.cyl('rope', 0.015, 0.015, 0.4, 4, 0, WY - 0.33, 0.13);
  K.cyl('timber', 0.04, 0.04, 0.25, 6, PX + 0.18, WY, 0, 0, 0, Math.PI / 2);
  box('timber', 0.06, 0.32, 0.08, PX + 0.3, WY - 0.13, 0, 0, 0, 0, 0.015);
  K.cyl('timber', 0.035, 0.035, 0.22, 6, PX + 0.4, WY - 0.26, 0, 0, 0, Math.PI / 2);
  // bucket (lathe, closed)
  const BY = 0.94;
  lathe('timber', [[0, 0], [0.105, 0], [0.14, 0.22], [0.12, 0.22], [0.09, 0.04], [0, 0.04]], 8, T(0, BY, 0.13));
  lathe('iron', [[0.12, 0.05], [0.125, 0.08], [0.13, 0.08], [0.125, 0.05]], 8, T(0, BY, 0.13));
  lathe('iron', [[0.135, 0.17], [0.14, 0.2], [0.145, 0.2], [0.14, 0.17]], 8, T(0, BY, 0.13));
  put('iron', new THREE.TorusGeometry(0.14, 0.012, 3, 8, Math.PI), T(0, BY + 0.22, 0.13));
  K.finish(g);
  return recentre(THREE, g);
}
