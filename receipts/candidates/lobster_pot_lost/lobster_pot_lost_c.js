// lobster_pot_lost, candidate C: a different reading. A rectangular slatted timber creel (the
// boxy east-coast kind) built from bevelled slats, upright but with its lid hoop cracked and a
// corner post split, a net mouth ring at the front, matted kelp heaped on top and hanging down
// the sides as lobed clumps, a rope tangle, and a cracked red float wedged against the back.
// 0.6 m long, front +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, side) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, side: side || THREE.FrontSide }); if (name) x.name = name; return x; };
  const slat = M(0x7b5a3e, 'timber', 0.85), wet = M(0x4a3426, 'timber', 0.55), bleach = M(0xb79773, 'timber', 0.9);
  const net = M(0xa58a5c, 'fabric', 0.95, THREE.DoubleSide), rope = M(0xa58a5c, 'fabric', 0.95);
  const kelp = M(0x4f5a2c, 'foliage', 0.6, THREE.DoubleSide), kelp2 = M(0x5f6a30, 'foliage', 0.6, THREE.DoubleSide);
  const floatC = M(0xb5543a, null, 0.6, THREE.DoubleSide), floatIn = M(0xd9cfb6, null, 0.9), barn = M(0xd9cfb6, null, 0.9);
  const V = (x, y, z) => new THREE.Vector3(x, y, z), up = V(0, 1, 0);
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const L = 0.56, W = 0.4, H = 0.28;
  // base: three runners and floor boards
  for (const x of [-W / 2 + 0.03, 0, W / 2 - 0.03]) add(B(0.05, 0.04, L), wet, x, 0.02, 0);
  for (const z of [-0.2, -0.07, 0.07, 0.2]) add(B(W, 0.025, 0.09), slat, 0, 0.052, z);
  // corner posts; the front-right one split and leaning
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    if (sx === 1 && sz === 1) { add(B(0.045, H * 0.6, 0.045), slat, sx * (W / 2 - 0.02), 0.04 + H * 0.3, sz * (L / 2 - 0.02), 0.12, 0, -0.18); continue; }
    add(B(0.045, H, 0.045), slat, sx * (W / 2 - 0.02), 0.04 + H / 2, sz * (L / 2 - 0.02));
  }
  // side slats with gaps (three per side), the top one on the right side missing
  for (const sx of [1, -1]) for (const [i, y] of [0.1, 0.18, 0.26].entries()) {
    if (sx === 1 && i === 2) continue;
    add(B(0.022, 0.05, L - 0.03), i === 1 ? bleach : slat, sx * (W / 2 - 0.01), y, 0);
  }
  // back end slats
  for (const y of [0.1, 0.18, 0.26]) add(B(W - 0.04, 0.05, 0.022), slat, 0, y, -L / 2 + 0.01);
  // lid: bent hoops over the top, the middle one cracked into two arms
  const hoop = (z, mat, arc = Math.PI, rot = 0) => add(new THREE.TorusGeometry(W / 2 - 0.01, 0.018, 4, 10, arc), mat, 0, 0.04 + H, z, 0, 0, rot);
  hoop(-0.2, bleach); hoop(0.2, bleach);
  hoop(0, bleach, Math.PI * 0.4, 0.1); hoop(0, bleach, Math.PI * 0.35, Math.PI * 0.6 + 0.15);
  for (const a of [0.5, 1.57, 2.64]) add(new THREE.CylinderGeometry(0.014, 0.014, L - 0.04, 5, 1, true), slat, Math.cos(a) * (W / 2 - 0.01), 0.04 + H + Math.sin(a) * (W / 2 - 0.01), 0, Math.PI / 2);
  // front: a slatted end board with a round net mouth
  add(B(W - 0.04, 0.06, 0.022), slat, 0, 0.1, L / 2 - 0.01);
  add(new THREE.TorusGeometry(0.085, 0.02, 4, 12), bleach, 0, 0.22, L / 2 - 0.01);
  add(new THREE.ConeGeometry(0.085, 0.16, 8, 1, true), net, 0, 0.22, L / 2 - 0.1, -Math.PI / 2);
  // barnacles on the runners
  for (const [x, z] of [[0.17, 0.15], [0.17, -0.1], [-0.17, 0.22], [0.0, -0.26]]) add(new THREE.ConeGeometry(0.018, 0.02, 5), barn, x, 0.05, z);
  // kelp: a matted heap on the lid and lobed clumps hanging over the sides
  const lump = (x, y, z, sx, sy, sz, mat) => add(new THREE.SphereGeometry(0.07, 7, 5), mat, x, y, z).scale.set(sx, sy, sz);
  lump(0.02, 0.5, -0.05, 2.0, 0.6, 1.6, kelp); lump(-0.08, 0.48, 0.12, 1.3, 0.5, 1.2, kelp2);
  const blade = (pts, w, mat) => {
    const c = new THREE.CatmullRomCurve3(pts), pos = [], idx = [], seg = 10;
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, p = c.getPoint(t), T = c.getTangent(t);
      let s = new THREE.Vector3().crossVectors(T, up); if (s.lengthSq() < 1e-4) s.set(1, 0, 0); s.normalize();
      const hw = w * 0.5 * (0.45 + 0.55 * Math.sin(Math.PI * Math.min(1, t + 0.1))) * (1 + 0.3 * Math.sin(i * 2.3));
      pos.push(p.x - s.x * hw, p.y - s.y * hw, p.z - s.z * hw, p.x + s.x * hw, p.y + s.y * hw, p.z + s.z * hw);
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    return add(geo, mat);
  };
  blade([V(0.05, 0.5, -0.1), V(0.2, 0.45, -0.12), V(0.25, 0.3, -0.14), V(0.27, 0.12, -0.12), V(0.33, 0.01, -0.1)], 0.1, kelp);
  blade([V(-0.05, 0.5, 0.0), V(-0.2, 0.44, 0.02), V(-0.24, 0.3, 0.05), V(-0.26, 0.12, 0.1), V(-0.32, 0.01, 0.15)], 0.11, kelp2);
  blade([V(0.0, 0.5, 0.1), V(0.03, 0.42, 0.26), V(0.06, 0.25, 0.31), V(0.1, 0.08, 0.34), V(0.13, 0.01, 0.36)], 0.08, kelp);
  blade([V(-0.06, 0.49, -0.12), V(-0.08, 0.4, -0.28), V(-0.1, 0.22, -0.32), V(-0.14, 0.01, -0.34)], 0.09, kelp2);
  // rope: knotted round the split corner, looped across the lid and off along the sand
  tube([V(0.2, 0.15, 0.28), V(0.24, 0.24, 0.24), V(0.12, 0.33, 0.2), V(-0.12, 0.34, 0.1), V(-0.23, 0.2, -0.02), V(-0.26, 0.03, -0.15), V(-0.16, 0.02, -0.3), V(0.0, 0.02, -0.32), V(0.2, 0.02, -0.3)], 0.015, rope, 30);
  function tube(pts, r, mat, seg) { return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 4, false), mat); }
  // cracked float wedged at the back right: half shell, cream inside, a stub of its eye
  const fx = 0.3, fz = -0.16;
  add(new THREE.SphereGeometry(0.095, 10, 6, 0, Math.PI * 1.3), floatC, fx, 0.09, fz, 0.4, -0.5, 0.3);
  add(new THREE.SphereGeometry(0.088, 8, 5, 0, Math.PI * 1.3), floatIn, fx, 0.09, fz, 0.4, -0.5, 0.3);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), floatC, fx - 0.04, 0.17, fz + 0.03, 0.3, 0, 0.4);
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
