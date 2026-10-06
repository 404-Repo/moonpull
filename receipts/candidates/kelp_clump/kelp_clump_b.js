// kelp_clump B (sweeps): pebble stone as a LatheGeometry; every ribbon strand is a thin flat
// rectangle extruded along a CatmullRom drape path (ExtrudeGeometry with extrudePath), so the
// strands have real thickness and edges; bladderwrack fronds as before.
export default function (THREE) {
  const g = new THREE.Group();
  let seed = 23;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const rr = (a, b) => a + (b - a) * rnd();
  const M = (color, name, rough, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra }); if (name) m.name = name; return m; };
  // position-hash noise: coincident vertices move together, so seams never crack
  const hash = (x, y, z, s = 0) => { const q = Math.sin(Math.round(x * 997) * 12.9898 + Math.round(y * 991) * 78.233 + Math.round(z * 983) * 37.719 + 41 + s) * 43758.5453; return q - Math.floor(q); };
  const jitter = (geo, amt, floorY) => {
    const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const a = hash(v.x, v.y, v.z), b = hash(v.z + 3.1, v.x - 1.7, v.y + 0.3), c = hash(v.y - 5.3, v.z + 2.9, v.x + 7.7);
      v.x += (a - 0.5) * amt; v.y += (b - 0.5) * amt * 0.7; v.z += (c - 0.5) * amt;
      if (floorY !== undefined && v.y < floorY) v.y = floorY;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals(); return geo;
  };
  const mesh = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  // rounded box (bevelled) via extrude of a rounded rect
  const rbox = (w, h, d, r, segs = 2) => {
    const s = new THREE.Shape(); const x = -w / 2 + r, y = -d / 2 + r, W = w - 2 * r, D = d - 2 * r;
    s.moveTo(x, -d / 2); s.lineTo(x + W, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, y); s.lineTo(w / 2, y + D); s.quadraticCurveTo(w / 2, d / 2, x + W, d / 2);
    s.lineTo(x, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, y + D); s.lineTo(-w / 2, y); s.quadraticCurveTo(-w / 2, -d / 2, x, -d / 2);
    const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(h - 2 * r, 0.001), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: segs, curveSegments: 2 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, r, 0); geo.computeBoundingBox(); const bb = geo.boundingBox; geo.translate(0, -bb.min.y - h / 2, 0);
    return geo; // centred on origin, height h
  };
  const rc = new THREE.Raycaster(); const nm3 = new THREE.Matrix3(); const UP = new THREE.Vector3(0, 1, 0);
  const hitOn = (targets, o, d) => { rc.set(o, d.clone().normalize()); const h = rc.intersectObjects(targets, false)[0]; if (!h) return null; nm3.getNormalMatrix(h.object.matrixWorld); return { p: h.point, n: h.face.normal.clone().applyMatrix3(nm3).normalize() }; };
  const onSurface = (s, geo, mat, lift = 0, spin = 0) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.quaternion.setFromUnitVectors(UP, s.n); m.rotateY(spin); m.position.copy(s.p).addScaledVector(s.n, lift); g.add(m); return m; };
  // split a non-indexed geometry into one single-material mesh per class (classify by triangle centroid)
  const splitMesh = (ng, cls, mats, x = 0, y = 0, z = 0, ry = 0) => {
    const pos = ng.attributes.position, nor = ng.attributes.normal, buckets = mats.map(() => ({ p: [], n: [] }));
    const c = new THREE.Vector3();
    for (let t = 0; t < pos.count / 3; t++) {
      c.set(0, 0, 0); for (let k = 0; k < 3; k++) c.x += pos.getX(t * 3 + k) / 3, c.y += pos.getY(t * 3 + k) / 3, c.z += pos.getZ(t * 3 + k) / 3;
      const b = buckets[cls(c)];
      for (let k = 0; k < 3; k++) { const i = t * 3 + k; b.p.push(pos.getX(i), pos.getY(i), pos.getZ(i)); b.n.push(nor.getX(i), nor.getY(i), nor.getZ(i)); }
    }
    const out = [];
    buckets.forEach((b, i) => { if (!b.p.length) return; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3)); out.push(mesh(geo, mats[i], x, y, z, 0, ry, 0)); });
    return out;
  };
  const stoneM = M(0x6c6a64, 'stone', 0.6);
  const kelpDk = M(0x4f5a2c, 'foliage', 0.75, { side: THREE.DoubleSide });
  const kelpOl = M(0x6f5c2b, 'foliage', 0.7, { side: THREE.DoubleSide });
  const wrack = M(0x5c6630, 'foliage', 0.7, { side: THREE.DoubleSide });
  const blad = M(0x7b8442, 'foliage', 0.65);
  // stone, approximated as an ellipsoid for draping: centre y = S.cy, radii a (x), b (y), c (z)
  const S = { a: 0.44, b: 0.3, c: 0.36, cy: 0.13, x: 0.18 };
  const surf = (x, z) => { const q = 1 - ((x - S.x) / S.a) ** 2 - (z / S.c) ** 2; return q > 0 ? S.cy + S.b * Math.sqrt(q) : 0; };
  // drape path from a start point on the stone, heading horizontally along ang
  const drape = (x0, z0, ang, reach, lift, n = 10, wig = 0.08) => {
    const pts = []; const dx = Math.cos(ang), dz = Math.sin(ang), lx = -dz, lz = dx; const ph = rr(0, 6);
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = x0 + dx * reach * t + lx * Math.sin(t * 4 + ph) * wig * t, z = z0 + dz * reach * t + lz * Math.sin(t * 4 + ph) * wig * t;
      const y = Math.max(surf(x, z), 0) + 0.025 + lift * Math.sin(Math.PI * Math.min(t * 2.2, 1)) * (1 - t * 0.5) + (t > 0.9 ? (t - 0.9) * 0.4 : 0);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  };
  // flat ribbon along a path: width tapers, twists a little; one quad per segment
  const ribbon = (pts, w0, w1, twist = 0.6) => {
    const pos = [], idx = [], up = new THREE.Vector3(0, 1, 0), T = new THREE.Vector3(), Sd = new THREE.Vector3(), Nn = new THREE.Vector3();
    pts.forEach((p, k) => {
      const a = pts[Math.max(k - 1, 0)], b = pts[Math.min(k + 1, pts.length - 1)]; T.subVectors(b, a).normalize();
      Sd.crossVectors(T, up).normalize(); Nn.crossVectors(Sd, T).normalize();
      const t = k / (pts.length - 1), w = (w0 + (w1 - w0) * t) * (t > 0.92 ? 0.6 : 1) / 2, th = Math.sin(t * 3) * twist;
      const side = Sd.clone().multiplyScalar(Math.cos(th)).addScaledVector(Nn, Math.sin(th));
      pos.push(p.x + side.x * w, p.y + side.y * w, p.z + side.z * w, p.x - side.x * w, p.y - side.y * w, p.z - side.z * w);
      if (k) { const i = k * 2; idx.push(i - 2, i - 1, i, i - 1, i + 1, i); }
    });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  };
  // bladderwrack: a forked stem with paired oval bladders, standing from a point on the stone
  const bladGeo = new THREE.OctahedronGeometry(1, 0);
  const wrackFrond = (x, z, ang, len, tiltOut) => {
    const base = new THREE.Group(); base.position.set(x, surf(x, z) - 0.02, z); base.rotation.order = 'YXZ'; base.rotation.y = ang; base.rotation.x = tiltOut; g.add(base);
    const branch = (parent, l, depth, spread) => {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.016, l, 4, 1), wrack); st.position.y = l / 2; parent.add(st);
      const tip = new THREE.Group(); tip.position.y = l; parent.add(tip);
      for (const f of [0.35, 0.7]) for (const sd of [-1, 1]) { const b = new THREE.Mesh(bladGeo, blad); b.scale.set(0.026, 0.042, 0.022).multiplyScalar(rr(0.9, 1.3)); b.position.set(sd * 0.03, l * f, 0); b.rotation.z = -sd * 0.6; parent.add(b); }
      if (depth > 0) for (const sd of [-1, 1]) { const c = new THREE.Group(); c.rotation.z = sd * spread; c.rotation.x = rr(-0.3, 0.3); tip.add(c); branch(c, l * 0.72, depth - 1, spread * 0.9); }
      else { const b = new THREE.Mesh(bladGeo, blad); b.scale.set(0.028, 0.04, 0.024); b.position.y = 0.02; tip.add(b); }
    };
    branch(base, len, 1, 0.55);
  };
  { const prof = []; for (let i = 0; i <= 8; i++) { const t = i / 8, a = -Math.PI / 2 + t * Math.PI; prof.push(new THREE.Vector2(Math.max(Math.cos(a), 0.001), Math.sin(a))); }
    const geo = new THREE.LatheGeometry(prof, 12); geo.scale(S.a, S.b, S.c); const ng = jitter(geo.toNonIndexed(), 0.07); mesh(ng, stoneM, S.x, S.cy, 0); }
  const strand = (pts, w, th) => {
    const sh = new THREE.Shape(); sh.moveTo(-th / 2, -w / 2); sh.lineTo(th / 2, -w / 2); sh.lineTo(th / 2, w / 2); sh.lineTo(-th / 2, w / 2); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { steps: 8, bevelEnabled: false, extrudePath: new THREE.CatmullRomCurve3(pts) });
    return geo;
  };
  for (let i = 0; i < 16; i++) {
    const main = i < 11, ang = main ? Math.PI * 0.75 + rr(-0.9, 0.9) : rr(0, Math.PI * 2);
    mesh(strand(drape(S.x + rr(-0.15, 0.12), rr(-0.12, 0.1), ang, main ? rr(0.75, 1.0) : rr(0.45, 0.65), rr(0.1, 0.22), 8), rr(0.07, 0.1), 0.012), rnd() < 0.55 ? kelpOl : kelpDk);
  }
  for (let i = 0; i < 8; i++) { const a = -Math.PI * 0.25 + rr(-1.1, 1.1), r = rr(0.05, 0.3); wrackFrond(S.x + Math.cos(a) * r, Math.sin(a) * r * 0.8, -a + Math.PI / 2, rr(0.12, 0.16), rr(0.35, 0.9)); }
  // contract recentring (vertex-measured)
  {
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
  }
  return g;
}
