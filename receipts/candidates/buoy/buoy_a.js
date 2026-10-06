// buoy_a: primitives. Eight SphereGeometry gores (phiStart/phiLength) alternating red and
// whitewash, a turned timber cap, iron eye ring, a hemp rope tube that hangs off the ring and
// trails on the sand, a few kelp fronds on the rope and a barnacle cluster low on the front.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const red = mk(0xb5543a, 'plaster', 0.8), white = mk(0xe9d6b8, 'plaster', 0.85);
  const wood = mk(0x7b5a3e, 'timber', 0.85), iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const hemp = mk(0xa58a5c, 'fabric', 0.95), kelp = mk(0x4f5a2c, 'foliage', 0.8, { side: THREE.DoubleSide });
  const barn = mk(0xd9cfb6, 'stone', 0.9);

  const R = 0.31, CY = 0.33, N = 8;
  for (let i = 0; i < N; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(R, 3, 10, (i / N) * Math.PI * 2, (Math.PI * 2) / N), i % 2 ? white : red);
    s.position.y = CY; s.scale.y = 0.97; g.add(s);
  }
  // bottom boss so it can sit
  const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.05, 10), iron); boss.position.y = CY - R * 0.97 + 0.01; g.add(boss);
  // cap: two stacked bevelled discs
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.07, 12), wood); cap.position.y = CY + R * 0.97 - 0.005 + 0.025; g.add(cap);
  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.025, 12), wood); capTop.position.y = cap.position.y + 0.045; g.add(capTop);
  const yTop = capTop.position.y + 0.0125;
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.014, 5, 8), iron); eye.position.set(0, yTop + 0.02, 0); eye.rotation.y = Math.PI / 2; g.add(eye);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 5, 10), iron); ring.position.set(0, yTop + 0.08, 0); g.add(ring);

  // rope from the ring down the +X side to the ground
  const P = (x, y, z) => new THREE.Vector3(x, y, z);
  const rope = new THREE.CatmullRomCurve3([P(0.05, yTop + 0.06, 0), P(0.11, yTop + 0.01, 0.02), P(0.2, CY + 0.25, 0.06), P(0.31, CY + 0.1, 0.1),
    P(0.33, CY - 0.08, 0.12), P(0.29, CY - 0.24, 0.16), P(0.32, 0.025, 0.27), P(0.45, 0.025, 0.38), P(0.6, 0.025, 0.33), P(0.64, 0.025, 0.18)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(rope, 30, 0.024, 5, false), hemp));
  // frayed end knot
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), hemp); knot.position.copy(rope.getPoint(1)); g.add(knot);
  // kelp fronds hanging from the rope
  for (const [t, a] of [[0.28, 0.3], [0.36, -0.4], [0.45, 0.2]]) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.2, 4, 1), kelp);
    const p = rope.getPoint(t); f.position.set(p.x + 0.03, p.y - 0.08, p.z + 0.02); f.rotation.set(Math.PI, 0, a); f.scale.z = 0.35; g.add(f);
  }
  // barnacle cluster low on the front-left
  const up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < 10; k++) {
    const th = 1.95 + (k % 4) * 0.13 + ((k * 37) % 7) * 0.01, ph = -0.55 + Math.floor(k / 4) * 0.22 + (k % 2) * 0.08;
    const n = new THREE.Vector3(Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph));
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.026, 0.04, 5), barn);
    b.position.set(n.x * (R + 0.012), CY + n.y * R * 0.97 + n.y * 0.012, n.z * (R + 0.012));
    b.quaternion.setFromUnitVectors(up, n); g.add(b);
  }

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
  g.userData.waterline = CY - box.min.y;
  return g;
}
