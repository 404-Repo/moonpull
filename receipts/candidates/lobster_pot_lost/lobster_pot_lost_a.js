// lobster_pot_lost, candidate A: adapted from game/assets/lobster_pot.js (primitives). The same
// D-hooped willow cage on a timber base, lower segment counts, one hoop snapped and sprung, the pot
// tipped onto one side rail, kelp ribbons draped over the top and trailing to the sand, a tangle of
// rope wrapped round it and a cracked red float (half shell plus a loose shard). 0.6 m long, front +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, side) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, side: side || THREE.FrontSide }); if (name) x.name = name; return x; };
  const willow = M(0xb79773, 'timber', 0.9), willow2 = M(0xa58a5c, 'timber', 0.9), frame = M(0x4a3426, 'timber', 0.6), rope = M(0xa58a5c, 'fabric', 0.95);
  const kelp = M(0x4f5a2c, 'foliage', 0.6, THREE.DoubleSide), kelp2 = M(0x5f6a30, 'foliage', 0.6, THREE.DoubleSide);
  const floatC = M(0xb5543a, null, 0.6, THREE.DoubleSide), floatIn = M(0xd9cfb6, null, 0.9);
  const pot = new THREE.Group(); g.add(pot);
  const L = 0.6, R = 0.2, baseY = 0.035, wallH = 0.06, yc = baseY + wallH, rr = 0.019;
  const add = (geo, mat, x = 0, y = 0, z = 0, parent = pot) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  const up = new THREE.Vector3(0, 1, 0);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const rod = (a, b, r = rr, mat = willow, seg = 4, parent = pot) => { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg, 1, true), mat); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(up, d.normalize()); o.castShadow = true; parent.add(o); return o; };
  // flat ribbon along a curve (kelp blade), tapering to a point
  const ribbon = (pts, w, mat, parent = g, seg = 14) => {
    const c = new THREE.CatmullRomCurve3(pts), pos = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, p = c.getPoint(t), T = c.getTangent(t);
      let s = new THREE.Vector3().crossVectors(T, up); if (s.lengthSq() < 1e-4) s.set(1, 0, 0); s.normalize();
      const hw = w * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.05))) * 0.5 * (1 + 0.25 * Math.sin(i * 1.7));
      pos.push(p.x - s.x * hw, p.y - s.y * hw, p.z - s.z * hw, p.x + s.x * hw, p.y + s.y * hw, p.z + s.z * hw);
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const o = new THREE.Mesh(geo, mat); o.castShadow = true; parent.add(o); return o;
  };
  // base frame and slats
  for (const sx of [1, -1]) rod(V(sx * R, baseY, -L / 2), V(sx * R, baseY, L / 2), 0.025, frame, 6);
  for (const sz of [1, -1]) rod(V(-R, baseY, sz * L / 2), V(R, baseY, sz * L / 2), 0.025, frame, 6);
  for (const z of [-0.17, 0.05]) add(new THREE.BoxGeometry(2 * R, 0.04, 0.08), frame, 0, baseY - 0.005, z);
  // hoops: the third one snapped, its two halves sprung outward
  const nh = 4;
  for (let i = 0; i < nh; i++) {
    const z = -L / 2 + (i / (nh - 1)) * L;
    if (i === 2) {
      const a = add(new THREE.TorusGeometry(R, rr, 4, 6, Math.PI * 0.42), willow2, 0, yc, z);
      const b = add(new THREE.TorusGeometry(R, rr, 4, 6, Math.PI * 0.38), willow2, 0, yc, z); b.rotation.z = Math.PI * 0.62;
      a.rotation.set(0.25, 0, -0.08); b.rotation.x = -0.3;
    } else add(new THREE.TorusGeometry(R, rr * (i === 0 || i === nh - 1 ? 1.3 : 1), 4, 12, Math.PI), i % 2 ? willow2 : willow, 0, yc, z);
    for (const sx of [1, -1]) rod(V(sx * R, baseY, z), V(sx * R, yc, z), rr * 1.1);
  }
  // longitudinal rods, two on the near side broken short
  for (let k = 0; k <= 6; k++) {
    const a = (k / 6) * Math.PI, x = R * Math.cos(a), y = yc + R * Math.sin(a);
    const z1 = k === 2 ? 0.02 : k === 3 ? -0.05 : L / 2;
    rod(V(x, y, -L / 2), V(x, y, z1), rr * 0.95, k % 2 ? willow2 : willow);
    if (k === 2) rod(V(x, y, z1), V(x + 0.03, y + 0.09, z1 + 0.06), rr * 0.9, willow2);
  }
  // back end: vertical rods
  for (const x of [-0.12, 0, 0.12]) rod(V(x, baseY, -L / 2), V(x, yc + Math.sqrt(R * R - x * x), -L / 2), rr * 0.9);
  // front entrance ring and funnel spokes
  const ey = yc + 0.03, ez = L / 2 - 0.12, er = 0.08;
  add(new THREE.TorusGeometry(er, 0.024, 4, 12), willow2, 0, ey, ez);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; const p0 = V(er * Math.cos(a), ey + er * Math.sin(a), ez); const q = V(Math.cos(a) * R * 0.98, Math.max(baseY, yc + Math.sin(a) * R * 0.98), L / 2); rod(p0, q, 0.016); }
  // tip the whole cage onto its side rail
  pot.rotation.set(0, 0.25, -0.22); pot.position.set(0.0, 0.05, 0);
  pot.updateMatrixWorld(true);
  // kelp: blades draped over the cage and trailing to the ground on both sides
  ribbon([V(-0.05, 0.36, -0.2), V(0.1, 0.36, -0.15), V(0.2, 0.26, -0.1), V(0.27, 0.1, -0.05), V(0.33, 0.01, 0.04)], 0.09, kelp);
  ribbon([V(-0.1, 0.35, 0.05), V(0.05, 0.37, 0.1), V(0.18, 0.28, 0.16), V(0.26, 0.12, 0.2), V(0.31, 0.01, 0.27)], 0.08, kelp2);
  ribbon([V(0.02, 0.37, -0.05), V(-0.12, 0.33, -0.08), V(-0.2, 0.2, -0.12), V(-0.24, 0.05, -0.16), V(-0.3, 0.01, -0.27)], 0.1, kelp);
  ribbon([V(-0.08, 0.3, 0.2), V(-0.18, 0.2, 0.24), V(-0.23, 0.06, 0.28), V(-0.27, 0.01, 0.3)], 0.07, kelp2);
  ribbon([V(0.05, 0.34, -0.28), V(0.0, 0.22, -0.34), V(-0.04, 0.05, -0.36), V(-0.08, 0.01, -0.36)], 0.08, kelp);
  // a holdfast knot of kelp on the top
  add(new THREE.SphereGeometry(0.06, 7, 5), kelp, 0.0, 0.36, -0.06, g).scale.set(1.4, 0.6, 1.1);
  // rope: wrapped twice round the cage, then out across the sand to the float
  const rp = [];
  for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI * 3.6, z = -0.18 + i * 0.022; rp.push(V(Math.cos(a) * 0.25, 0.17 + Math.sin(a) * 0.19, z)); }
  rp.push(V(0.3, 0.02, 0.24), V(0.36, 0.02, 0.2));
  for (const p of rp) if (p.y < 0.02) p.y = 0.02;
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp), 34, 0.016, 4, false), rope, 0, 0, 0, g);
  // cracked float: a red half shell rolled on its side, cream inside, a loose shard beside it
  const fx = 0.4, fz = 0.08;
  const shell = add(new THREE.SphereGeometry(0.1, 10, 6, 0, Math.PI * 1.35), floatC, fx, 0.095, fz, g); shell.rotation.set(0.3, 0.6, 0.2);
  const inner = add(new THREE.SphereGeometry(0.092, 8, 5, 0, Math.PI * 1.35), floatIn, fx, 0.095, fz, g); inner.rotation.copy(shell.rotation);
  add(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 6), floatC, fx + 0.1, 0.12, fz + 0.02, g).rotation.z = 1.2;
  const shard = add(new THREE.SphereGeometry(0.1, 5, 3, 0, 1.0, 0, 0.9), floatC, 0.36, 0.1, -0.12, g); shard.rotation.set(Math.PI, 0.4, 0);
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
