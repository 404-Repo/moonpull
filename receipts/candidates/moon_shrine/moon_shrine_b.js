// moon_shrine B: profiles. Stepped base + plinth + tapered shaft + capital as one square (4-segment) lathe profile,
// moonstone ring by lathe, roof as an extruded sawtooth gable section (tile rows in the profile), extruded barge boards
// and extruded diamond-frame carvings.
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
  const K = makeKit(THREE, 9);
  const { box, boxB, put, T, V, jit } = K;
  const flat = (geo) => { const n = geo.toNonIndexed(); n.deleteAttribute('normal'); n.computeVertexNormals(); return n; };
  const sq = (key, prof, y = 0) => { // radii given as half-side; lathe radius = half-side * sqrt2
    put(key, flat(new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r * Math.SQRT2, h)), 4)), T(0, y, 0, 0, Math.PI / 4, 0));
  };
  // whole stone column in one profile (half-sides)
  sq('stone', [[0, 0], [0.53, 0], [0.53, 0.13], [0.51, 0.16], [0.41, 0.16], [0.41, 0.29], [0.39, 0.31], [0.25, 0.31], [0.25, 0.6],
    [0.28, 0.6], [0.28, 0.65], [0.185, 0.66], [0.15, 1.18], [0.21, 1.2], [0.31, 1.21], [0.31, 1.33], [0.28, 1.35], [0, 1.35]]);
  // block seams on the steps: grooves as thin dark-ish offset blocks (same stone) breaking the silhouette
  for (const [half, y0, h, n] of [[0.535, 0, 0.13, 3], [0.415, 0.16, 0.13, 2]]) {
    const L = half * 2; for (let i = 1; i < n; i++) { const t = -half + L * i / n; for (const s of [-1, 1]) { boxB('stone', 0.03, h + 0.01, 0.03, t, y0, s * half, 0, 0); boxB('stone', 0.03, h + 0.01, 0.03, s * half, y0, t, 0, 0); } }
  }
  boxB('stone', 0.5, 0.08, 0.2, 0, 0, 0.62, 0, 0.03);
  for (const [x, z] of [[-0.42, 0.45], [0.38, -0.47], [0.47, 0.3]]) boxB('kelp', 0.15, 0.02, 0.1, x, 0.13, z, 0.3, 0);
  // diamond-frame carvings: extruded shape with a hole, on each plinth face, zig-zag band on capital faces
  const dia = new THREE.Shape([V(0, 0.11), V(0.11, 0), V(0, -0.11), V(-0.11, 0)].map((p) => new THREE.Vector2(p.x, p.y)));
  dia.holes.push(new THREE.Path([new THREE.Vector2(0, 0.065), new THREE.Vector2(-0.065, 0), new THREE.Vector2(0, -0.065), new THREE.Vector2(0.065, 0)]));
  const diaGeo = new THREE.ExtrudeGeometry(dia, { depth: 0.025, bevelEnabled: false });
  const zz = []; for (let i = 0; i <= 10; i++) zz.push([-0.27 + i * 0.054, i % 2 ? 0.03 : -0.03]);
  const zzShape = new THREE.Shape(zz.map(([x, y]) => new THREE.Vector2(x, y + 0.012)).concat(zz.slice().reverse().map(([x, y]) => new THREE.Vector2(x, y - 0.012))));
  const zzGeo = new THREE.ExtrudeGeometry(zzShape, { depth: 0.02, bevelEnabled: false });
  for (let f = 0; f < 4; f++) K.frame(T(0, 0, 0, 0, f * Math.PI / 2, 0), () => {
    put('stone', diaGeo, T(0, 0.455, 0.25));
    put('stone', new THREE.BoxGeometry(0.05, 0.05, 0.03), T(0, 0.455, 0.255, 0, 0, Math.PI / 4));
    put('stone', zzGeo, T(0, 1.27, 0.31));
  });
  // cloth band, strips, rope with shells
  const by = 0.92; const hw = 0.185 - (0.035 * (by - 0.66) / 0.52) + 0.015;
  for (let f = 0; f < 4; f++) K.frame(T(0, by, 0, 0, f * Math.PI / 2, 0), () => box('tile', hw * 2 + 0.04, 0.08, 0.04, 0, 0, hw, 0, 0, 0, 0));
  box('tile', 0.07, 0.36, 0.03, -0.1, by - 0.2, hw + 0.02, 0.06, 0, 0.06, 0);
  box('cream', 0.06, 0.3, 0.03, 0.0, by - 0.17, hw + 0.025, 0.06, 0, -0.04, 0);
  box('tile', 0.07, 0.3, 0.03, 0.1, by - 0.17, -hw - 0.02, -0.06, 0, 0.05, 0);
  box('cream', 0.06, 0.32, 0.03, hw + 0.02, by - 0.17, 0.05, 0, 0, 0.06, 0);
  const rope = new THREE.CatmullRomCurve3([V(-0.19, 0.86, 0.12), V(-0.1, 0.78, 0.22), V(0.06, 0.77, 0.22), V(0.19, 0.84, 0.12), V(0.2, 0.86, -0.1), V(0, 0.84, -0.21), V(-0.2, 0.86, -0.1)], true);
  put('rope', new THREE.TubeGeometry(rope, 18, 0.02, 4, true), null);
  const shellGeo = new THREE.LatheGeometry([[0, 0], [0.035, 0.005], [0.03, 0.02], [0, 0.025]].map(([x, y]) => new THREE.Vector2(x, y)), 5);
  for (const [x, y, z, rx, ry] of [[-0.12, 0.73, 0.235, 1.5, 0], [0, 0.71, 0.235, 1.5, 0], [0.1, 0.72, 0.235, 1.5, 0], [0.22, 0.78, 0, 1.5, Math.PI / 2], [0.05, 0.78, -0.23, 1.5, Math.PI], [-0.3, 0.31, 0.33, 0, 0], [0.32, 0.31, 0.36, 0, 1], [0.2, 0.13, 0.48, 0, 2]]) put('cream', shellGeo, T(x, y, z, rx, ry, 0));
  // moonstone in a lathed stone ring (axis along Z)
  const dy = 1.57;
  boxB('stone', 0.26, 0.1, 0.18, 0, 1.33, 0, 0, 0.03);
  put('stone', new THREE.LatheGeometry([[0.16, -0.07], [0.21, -0.075], [0.26, -0.04], [0.26, 0.04], [0.21, 0.075], [0.16, 0.07]].map(([x, y]) => new THREE.Vector2(x, y)), 14), T(0, dy, 0, Math.PI / 2, 0, 0));
  put('moonstone', new THREE.LatheGeometry([[0.001, -0.06], [0.12, -0.05], [0.165, 0], [0.12, 0.05], [0.001, 0.06]].map(([x, y]) => new THREE.Vector2(x, y)), 14), T(0, dy, 0, Math.PI / 2, 0, 0));
  // posts + side plates
  const px = 0.29, pz = 0.22, y1 = 1.6;
  for (const sx of [-1, 1]) { for (const sz of [-1, 1]) boxB('timber', 0.075, y1 - 1.35, 0.075, sx * px, 1.35, sz * pz, jit(0.05), 0.015); box('timber', 0.08, 0.08, 0.62, sx * px, y1 - 0.02, 0, 0, 0, 0, 0.015); }
  // roof: extruded sawtooth gable section (XY), ridge along Z
  const a = 0.7, ridgeY = 1.93, L = 0.62, rows = 4, zf = 0.44;
  const ca = Math.cos(a), sa = Math.sin(a);
  const pts = [];
  const along = (s, t, up) => [s * ca * t - s * sa * up * 0, ridgeY - sa * t + up]; // point at distance t down slope, raised up
  // top edge, right slope from ridge to eave with tile steps
  const top = [];
  for (let r = 0; r < rows; r++) { const t0 = L * r / rows, t1 = L * (r + 1) / rows; top.push([t0, 0.03], [t1 - 0.005, 0.085]); top.push([t1, 0.03]); }
  const right = top.map(([t, u]) => [ca * t + sa * u, ridgeY - sa * t + ca * u]);
  const under = (t) => [ca * t, ridgeY - sa * t - 0.03];
  pts.push([0, ridgeY + 0.06]); right.forEach((p) => pts.push(p)); pts.push(under(L)); pts.push([0, ridgeY - 0.03]); pts.push([-under(L)[0], under(L)[1]]);
  right.slice().reverse().forEach(([x, y]) => pts.push([-x, y]));
  K.extrude('tile', pts, zf * 2, T(0, 0, 0));
  // tile seams: shallow cuts suggested by thin raised ridges every tile width, alternating per row
  for (const s of [-1, 1]) for (let r = 0; r < rows; r++) for (let k = 0; k < 4; k++) {
    const t = L * (r + 0.55) / rows; const z = -zf + (k + 0.5 + (r % 2) * 0.5) * (2 * zf / 4.5);
    box('tile', 0.02, 0.05, 0.03, s * (ca * t + sa * 0.08), ridgeY - sa * t + ca * 0.08, z, 0, 0, -s * a, 0);
  }
  // barge boards: extruded thin profile following the gable with upturned tips
  const bb = [[0, ridgeY + 0.12], [ca * (L + 0.02), ridgeY - sa * (L + 0.02) + 0.1], [ca * L + 0.09, ridgeY - sa * L + 0.12], [ca * L + 0.06, ridgeY - sa * L + 0.02], [0, ridgeY + 0.02]];
  const bbFull = bb.concat(bb.slice(1, 4).reverse().map(([x, y]) => [-x, y]));
  for (const z of [zf + 0.025, -zf - 0.025]) K.extrude('timber', [bbFull[0], bbFull[1], bbFull[2], bbFull[3], [0, ridgeY + 0.02], [-bbFull[3][0], bbFull[3][1]], [-bbFull[2][0], bbFull[2][1]], [-bbFull[1][0], bbFull[1][1]]], 0.05, T(0, 0, z));
  box('timber', 0.1, 0.1, 2 * zf + 0.14, 0, ridgeY + 0.075, 0, 0, 0, Math.PI / 4, 0.02);
  K.finish(g);
  return recentre(THREE, g);
}
