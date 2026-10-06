// windswept_pine C (different reading): each pad is a flat scalloped cloud, a lobed outline
// extruded thin with a bevel (like the ref's layered needle shelves seen from the side), two or
// three stacked with the lower one wider and darker; lobes droop at the rim. Rocks are faceted
// dodecahedra.
export default function (THREE) {
  const g = new THREE.Group();
  let seed = 31;
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
  const bark = M(0x5e4130, 'timber', 0.9);
  const needle = M(0x3e5a2c, 'foliage', 0.85);
  const needleHi = M(0x58773a, 'foliage', 0.85);
  const rockM = M(0x5f6266, 'stone', 0.75);
  const moss = M(0x4f5a2c, 'foliage', 0.9);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // trunk: rises out of the rocks, leans to +x with an S-bend, crown at ~5.3 m
  const trunkC = new THREE.CatmullRomCurve3([V(0, 0.5, 0), V(0.25, 1.4, 0.05), V(0.85, 2.3, 0.0), V(0.7, 3.2, -0.1), V(0.15, 4.1, 0.0), V(0.3, 4.8, -0.05), V(0.5, 5.25, 0)]);
  // pads: centre, radius, layer count; branches run from trunk param to the pad's underside
  const PADS = [
    { c: V(0.45, 5.45, 0), r: 1.25, n: 3, t: 0.97 },
    { c: V(-1.55, 4.15, 0.25), r: 1.0, n: 2, t: 0.72 },
    { c: V(1.85, 3.55, 0.35), r: 0.95, n: 2, t: 0.55 },
    { c: V(1.55, 2.75, -0.55), r: 0.75, n: 2, t: 0.42 },
    { c: V(-0.35, 4.75, -1.25), r: 0.85, n: 2, t: 0.8 },
    { c: V(0.35, 4.3, 1.15), r: 0.7, n: 2, t: 0.7 },
  ];
  const branchCurve = (pd) => {
    const a = trunkC.getPointAt(pd.t), b = pd.c.clone().setY(pd.c.y - 0.15);
    const m = a.clone().lerp(b, 0.5); m.y = Math.max(a.y, b.y) - 0.25 + (pd.t < 0.6 ? 0.1 : -0.1);
    return new THREE.CatmullRomCurve3([a, a.clone().lerp(m, 0.6).setY(a.y + 0.15), m, b]);
  };
  // tapered tube: TubeGeometry rings rescaled from r0 to r1 along the curve
  const tube = (curve, r0, r1, segs = 10, rad = 6) => {
    const geo = new THREE.TubeGeometry(curve, segs, 1, rad, false), p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) { const P = curve.getPointAt(i / segs), r = r0 + (r1 - r0) * (i / segs); for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(p, k).sub(P).multiplyScalar(r).add(P); p.setXYZ(k, v.x, v.y, v.z); } }
    geo.computeVertexNormals(); return geo;
  };
  const roots = () => {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rr(-0.3, 0.3), s = V(Math.cos(a) * 0.15, 0.9, Math.sin(a) * 0.15);
      const e = V(Math.cos(a) * rr(1.0, 1.25), 0.02, Math.sin(a) * rr(0.9, 1.15));
      const m = V(Math.cos(a) * 0.65, 0.85, Math.sin(a) * 0.6);
      mesh(tube(new THREE.CatmullRomCurve3([s, m, e]), 0.17, 0.05, 8, 5), bark);
    }
  };
  const trunkAndBranches = (rad = 7) => {
    mesh(tube(trunkC, 0.36, 0.13, 16, rad), bark);
    // flared base, sunk into the rocks
    mesh(new THREE.CylinderGeometry(0.34, 0.55, 0.7, rad), bark, 0, 0.6, 0);
    for (const pd of PADS) if (pd.t < 0.95) mesh(tube(branchCurve(pd), 0.12, 0.05, 6, 5), bark);
  };
  trunkAndBranches();
  roots();
  const lobed = (r, lobes, k) => { const s = new THREE.Shape(); const n = lobes * 4; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, rad = r * (0.82 + 0.18 * Math.abs(Math.sin(a * lobes / 2 * 2 / 2 * 2))) * (1 + (hash(i, k, 1) - 0.5) * 0.12); i ? s.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : s.moveTo(Math.cos(a) * rad, Math.sin(a) * rad); } return s; };
  for (const pd of PADS) {
    for (let L = 0; L < pd.n; L++) {
      const rL = pd.r * (1 - L * 0.3), y = pd.c.y + L * 0.22, top = L === pd.n - 1;
      const geo = new THREE.ExtrudeGeometry(lobed(rL, 7, L + pd.t * 10), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.09, bevelSegments: 1, curveSegments: 1 });
      geo.rotateX(-Math.PI / 2);
      const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const d = Math.hypot(p.getX(i), p.getZ(i)) / rL; p.setY(i, p.getY(i) - 0.22 * d * d); }
      geo.computeVertexNormals();
      mesh(geo, top ? needleHi : needle, pd.c.x, y, pd.c.z, 0, rr(0, 6), 0);
    }
  }
  for (const [x, z, s, h, ry] of [[-0.6, 0.4, 0.75, 0.85, 0.3], [0.6, 0.45, 0.7, 0.7, -0.4], [0.1, -0.65, 0.85, 0.95, 0.1], [-1.1, -0.55, 0.55, 0.5, 0.8], [1.25, -0.4, 0.5, 0.45, 0.5], [0.0, 1.05, 0.55, 0.4, 0.2], [-1.2, 0.75, 0.4, 0.3, 1.1]]) {
    const geo = jitter(new THREE.DodecahedronGeometry(1, 0).toNonIndexed(), 0.15); geo.scale(s, h / 2, s * 0.85); geo.translate(0, h / 2, 0);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, 0); geo.computeVertexNormals();
    mesh(geo, rockM, x, 0, z, 0, ry, 0);
    mesh(new THREE.SphereGeometry(0.5, 6, 2, 0, Math.PI * 2, 0, Math.PI / 2), moss, x, h - 0.06, z, 0, ry, 0).scale.set(s * 1.1, 0.14, s * 0.9);
  }
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
