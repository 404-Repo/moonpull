// lobster_pot_lost, candidate B: profiles. A round "inkwell" willow creel: the body is a lathe
// profile that every rib and ring is swept along, with a lathed entrance funnel in the top. It lies
// tipped over on the sand, a rib sprung loose, kelp blades draped over it, rope wound round and
// trailing to a lathed cork dahn float whose marker pole has snapped. About 0.6 m across, front +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, side) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, side: side || THREE.FrontSide }); if (name) x.name = name; return x; };
  const willow = M(0xb79773, 'timber', 0.9), willow2 = M(0xa58a5c, 'timber', 0.9), base = M(0x4a3426, 'timber', 0.6);
  const funnel = M(0x8e7550, 'fabric', 0.95, THREE.DoubleSide), rope = M(0xa58a5c, 'fabric', 0.95);
  const kelp = M(0x4f5a2c, 'foliage', 0.6, THREE.DoubleSide), kelp2 = M(0x5f6a30, 'foliage', 0.6, THREE.DoubleSide);
  const cork = M(0xb5543a, null, 0.75), corkIn = M(0xc99a5c, null, 0.9), pole = M(0x7b5a3e, 'timber', 0.85);
  const V = (x, y, z) => new THREE.Vector3(x, y, z), up = V(0, 1, 0);
  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; parent.add(o); return o; };
  const tube = (parent, pts, r, mat, seg = 6, rs = 3) => add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, rs, false), mat);
  const ribbon = (pts, w, mat, seg = 12) => {
    const c = new THREE.CatmullRomCurve3(pts), pos = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, p = c.getPoint(t), T = c.getTangent(t);
      let s = new THREE.Vector3().crossVectors(T, up); if (s.lengthSq() < 1e-4) s.set(1, 0, 0); s.normalize();
      const hw = w * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.08))) * (1 + 0.3 * Math.sin(i * 2.1));
      pos.push(p.x - s.x * hw, p.y - s.y * hw, p.z - s.z * hw, p.x + s.x * hw, p.y + s.y * hw, p.z + s.z * hw);
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    return add(g, geo, mat);
  };
  // the body profile (radius, height): flat base, bulging wall, shoulder curving in to the mouth
  const prof = [[0.26, 0.02], [0.29, 0.1], [0.285, 0.2], [0.24, 0.29], [0.15, 0.34], [0.1, 0.345]];
  const curve2 = new THREE.SplineCurve(prof.map(([r, y]) => new THREE.Vector2(r, y)));
  const pot = new THREE.Group(); g.add(pot);
  // weighted base: a dark disc with a rim
  add(pot, new THREE.CylinderGeometry(0.255, 0.26, 0.04, 14), base, 0, 0.02, 0);
  add(pot, new THREE.TorusGeometry(0.262, 0.02, 4, 14), base, 0, 0.035, 0, Math.PI / 2);
  // ribs swept along the profile; one sprung loose and bowed outward
  const nr = 10;
  for (let k = 0; k < nr; k++) {
    const a = (k / nr) * Math.PI * 2, sprung = k === 3;
    const pts = [];
    for (let i = 0; i <= 5; i++) {
      const p = curve2.getPoint(i / 5); let r = p.x, y = p.y;
      if (sprung && i >= 3) { r += (i - 2) * 0.04; y += (i - 2) * 0.03; }
      pts.push(V(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    tube(pot, pts, 0.013, k % 2 ? willow : willow2, 6, 3);
  }
  // horizontal woven rings at three heights, plus the mouth ring
  for (const t of [0.2, 0.45, 0.72]) { const p = curve2.getPoint(t); add(pot, new THREE.TorusGeometry(p.x, 0.017, 3, 16), t === 0.45 ? willow2 : willow, 0, p.y, 0, Math.PI / 2); }
  add(pot, new THREE.TorusGeometry(0.1, 0.024, 4, 12), willow2, 0, 0.345, 0, Math.PI / 2);
  // entrance funnel: a lathed cone hanging down inside from the mouth
  add(pot, new THREE.LatheGeometry([V(0.055, 0.17), V(0.07, 0.24), V(0.1, 0.345)].map((p) => new THREE.Vector2(p.x, p.y)), 10), funnel);
  // tip it over onto its shoulder, mouth toward the front left
  pot.rotation.set(0.95, 0.5, 0.25);
  pot.position.set(0, 0.24, -0.02); pot.scale.setScalar(0.88);
  // kelp blades draped across the upturned side and trailing to the sand
  ribbon([V(-0.2, 0.42, -0.12), V(-0.02, 0.48, -0.1), V(0.16, 0.4, -0.08), V(0.27, 0.22, -0.05), V(0.33, 0.02, 0.0)], 0.1, kelp);
  ribbon([V(-0.15, 0.4, 0.04), V(0.02, 0.45, 0.06), V(0.18, 0.33, 0.1), V(0.27, 0.14, 0.16), V(0.36, 0.015, 0.2)], 0.08, kelp2);
  ribbon([V(0.05, 0.47, -0.16), V(-0.1, 0.4, -0.22), V(-0.22, 0.24, -0.27), V(-0.28, 0.06, -0.3), V(-0.33, 0.015, -0.33)], 0.09, kelp);
  ribbon([V(0.0, 0.44, -0.25), V(0.04, 0.3, -0.33), V(0.06, 0.1, -0.38), V(0.1, 0.015, -0.38)], 0.075, kelp2);
  // rope: two loose turns about the creel, then away across the sand to the float
  const rp = [];
  for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2.6; rp.push(V(Math.cos(a) * 0.31, Math.max(0.02, 0.22 + Math.sin(a) * 0.24), -0.12 + i * 0.02)); }
  rp.push(V(0.24, 0.02, 0.22), V(0.3, 0.02, 0.28));
  tube(g, rp, 0.015, rope, 24, 4);
  // dahn float: lathed cork drum on its side, split open, with the marker pole snapped short
  const fl = new THREE.Group(); fl.position.set(0.34, 0.075, 0.26); fl.rotation.set(0, 0.3, Math.PI / 2); g.add(fl);
  const fprof = [[0.0, -0.06], [0.06, -0.06], [0.075, -0.035], [0.075, 0.035], [0.06, 0.06], [0.0, 0.06]].map(([r, y]) => new THREE.Vector2(r, y));
  add(fl, new THREE.LatheGeometry(fprof, 10, 0, Math.PI * 1.55), cork);
  add(fl, new THREE.LatheGeometry(fprof.map((p) => new THREE.Vector2(p.x * 0.85, p.y * 0.92)), 8, 0, Math.PI * 1.55), corkIn).material.side = THREE.BackSide;
  add(fl, new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), pole, 0, 0.11, 0);
  add(fl, new THREE.ConeGeometry(0.02, 0.06, 5), pole, 0.006, 0.2, 0, 0, 0, 0.3); // splintered end
  add(fl, new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), pole, 0, -0.1, 0);
  // the snapped-off top of the pole, lying nearby
  add(g, new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), pole, 0.12, 0.02, 0.3, Math.PI / 2, 0.9, 0);
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
