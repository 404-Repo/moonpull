// sea_rock A (profiles): every stratum is its own irregular plan outline, extruded with a soft bevel,
// stacked with small overhangs; the main rock's top stratum is cut by a hole for the tide pool.
export default function (THREE) {
  const g = new THREE.Group();
  let seed = 11;
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
  const sand = M(0xc6a888, 'stone', 0.88);
  const sandDk = M(0xa98a6a, 'stone', 0.85);
  const wet = M(0x6e6a55, 'stone', 0.6);
  const kelp = M(0x4f5a2c, 'foliage', 0.8, { side: THREE.DoubleSide });
  const cream = M(0xd9cfb6, 'stone', 0.85, { side: THREE.DoubleSide });
  const water = M(0x3f8290, null, 0.15, { metalness: 0.0 });
  const rocks = [];
  // layout shared by all three: main rock with the pool, a back rock, a small front rock
  const R = { main: { x: -0.35, z: 0.15, rx: 1.15, rz: 1.1, h: 2.2 }, back: { x: 0.85, z: -0.75, rx: 0.95, rz: 0.85, h: 1.9 }, front: { x: 1.15, z: 0.75, rx: 0.72, rz: 0.62, h: 1.15 } };
  const dress = () => {
    g.updateMatrixWorld(true);
    const shoot = (r, ang, y) => hitOn(rocks, new THREE.Vector3(r.x + Math.cos(ang) * 6, y, r.z + Math.sin(ang) * 6), new THREE.Vector3(-Math.cos(ang), 0, -Math.sin(ang)));
    const barnGeo = new THREE.CylinderGeometry(0.035, 0.065, 0.07, 5, 1, true);
    const barn = (s, n) => { if (!s) return; for (let i = 0; i < n; i++) { const t = new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).cross(s.n).normalize().multiplyScalar(rr(0.04, 0.2)); onSurface({ p: s.p.clone().add(t), n: s.n }, barnGeo, cream, 0.015).scale.setScalar(rr(0.8, 1.5)); } };
    const patch = (s, w, d) => { if (!s) return; const m = onSurface(s, new THREE.SphereGeometry(0.5, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2), kelp, -0.04, rr(0, 6)); m.scale.set(w, 0.12, d); };
    const frond = (len, w) => { const geo = new THREE.PlaneGeometry(w, len, 1, 5); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + len / 2, t = y / len; p.setXYZ(i, p.getX(i) * (1 - t * 0.55) + Math.sin(t * 5) * 0.05, y, t * t * len * 0.4); } geo.computeVertexNormals(); return geo; };
    for (const k of ['main', 'back', 'front']) {
      const r = R[k], n = k === 'front' ? 4 : 5;
      for (let i = 0; i < n; i++) barn(shoot(r, rr(0, Math.PI * 2), rr(0.12, 0.6)), 3 + Math.floor(rr(0, 3)));
      for (let i = 0; i < n * 0.8; i++) { const s = shoot(r, rr(0, Math.PI * 2), rr(0.45, 0.95)); patch(s, rr(0.35, 0.6), rr(0.25, 0.45)); }
      for (let i = 0; i < (k === 'front' ? 3 : 5); i++) {
        const a = rr(0, Math.PI * 2), s = shoot(r, a, 0.2); if (!s) continue;
        for (let j = 0; j < 3; j++) { const m = mesh(frond(rr(0.5, 0.9), rr(0.08, 0.13)), kelp, s.p.x + s.n.x * 0.05 + rr(-0.1, 0.1), 0, s.p.z + s.n.z * 0.05 + rr(-0.1, 0.1), 0, 0, 0); m.rotation.order = 'YXZ'; m.rotation.y = Math.atan2(s.n.x, s.n.z) + rr(-0.6, 0.6); m.rotation.x = rr(-0.15, 0.1); }
      }
    }
  };
  const outline = (rx, rz, k, n = 9) => {
    const pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, f = 1 + (hash(i, k, 3) - 0.5) * 0.26; pts.push(new THREE.Vector3(Math.cos(a) * rx * f, Math.sin(a) * rz * f, 0)); }
    return new THREE.CatmullRomCurve3(pts, true).getSpacedPoints(14).slice(0, 14).map((p) => new THREE.Vector2(p.x, p.y));
  };
  const layer = (r, y0, th, sc, mat, k, hole) => {
    const s = new THREE.Shape(outline(r.rx * sc, r.rz * sc, k));
    if (hole) s.holes.push(new THREE.Path(outline(r.rx * hole, r.rz * hole * 0.9, k + 50, 8).reverse()));
    const bev = Math.min(0.2, th * 0.34);
    const geo = new THREE.ExtrudeGeometry(s, { depth: th - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.9, bevelSegments: 2, curveSegments: 2 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, bev, 0);
    jitter(geo, 0.05);
    const m = mesh(geo, mat, r.x, y0, r.z, 0, (hash(k, 1, 1) - 0.5) * 0.5, 0); rocks.push(m);
    if (hole) {
      const w = new THREE.ShapeGeometry(new THREE.Shape(outline(r.rx * hole * 1.1, r.rz * hole * 0.99, k + 50, 8)), 4); w.rotateX(-Math.PI / 2);
      const wm = new THREE.Mesh(w, water); wm.position.y = th - 0.13; m.add(wm);
      for (const [dx, dz, s] of [[0.42, -0.3, 0.15], [-0.5, 0.2, 0.11], [0.1, 0.4, 0.09], [-0.15, -0.2, 0.07]]) { const st = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(s, 0), 0.03), dx > 0.3 ? sandDk : cream); st.position.set(dx * r.rx, th - 0.13, dz * r.rz); st.scale.y = 0.55; m.add(st); }
    }
    return m;
  };
  const stack = (r, ths, scs, mats, kb, poolHole) => {
    let y = 0;
    ths.forEach((th, i) => { layer(r, y, th + 0.04, scs[i], mats[i], kb + i, poolHole && i === ths.length - 1 ? poolHole : 0); y += th; });
  };
  stack(R.main, [0.6, 0.56, 0.54, 0.5], [1.0, 1.04, 0.99, 0.88], [wet, sandDk, sand, sand], 10, 0.52);
  stack(R.back, [0.62, 0.66, 0.62], [1.0, 1.03, 0.86], [wet, sandDk, sand], 30);
  stack(R.front, [0.58, 0.57], [1.0, 0.9], [wet, sand], 40);
  dress();
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
