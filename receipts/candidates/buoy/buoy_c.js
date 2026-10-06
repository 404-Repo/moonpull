// buoy_c: a different reading: a riveted steel float made of ten bulging staves (pumpkin
// lobes), each its own LatheGeometry gore with the radius pushed out mid-stave so the seams
// sink into grooves. Red and whitewash staves alternate. A flat timber bung on top, an
// iron eye with a ring, a rope that coils once on the ground, kelp and a barnacle crust.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const red = mk(0xb5543a, 'plaster', 0.8), white = mk(0xe9d6b8, 'plaster', 0.85);
  const wood = mk(0x7b5a3e, 'timber', 0.85), iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const hemp = mk(0xa58a5c, 'fabric', 0.95), kelp = mk(0x4f5a2c, 'foliage', 0.8, { side: THREE.DoubleSide });
  const barn = mk(0xd9cfb6, 'stone', 0.9);

  const N = 10, R = 0.3, CY = 0.32, SQ = 0.96, rows = 8, cols = 4;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, da = (Math.PI * 2) / N, pos = [], idx = [];
    for (let r = 0; r <= rows; r++) {
      const th = 0.12 + (Math.PI - 0.24) * r / rows; // leave pole holes for cap and boss
      for (let c = 0; c <= cols; c++) {
        const f = c / cols, a = a0 + da * f, bul = 1 + 0.07 * Math.sin(Math.PI * f) * Math.sin(th);
        const rr = R * Math.sin(th) * bul;
        pos.push(Math.sin(a) * rr, CY + Math.cos(th) * R * SQ, Math.cos(a) * rr);
      }
    }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const A = r * (cols + 1) + c, B = A + 1, C = A + cols + 1, D = C + 1;
      idx.push(A, C, B, B, C, D);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, i % 2 ? white : red));
  }
  const yTopHole = CY + Math.cos(0.12) * R * SQ, rHole = R * Math.sin(0.12);
  // bottom boss and top bung cover the pole holes
  const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.06, 10), iron); boss.position.y = CY - Math.cos(0.12) * R * SQ + 0.005; g.add(boss);
  const bung = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.13, 0.07, 10), wood); bung.position.y = yTopHole + 0.02; g.add(bung);
  const yB = bung.position.y + 0.035;
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.016, 5, 8, Math.PI), iron); eye.position.y = yB; g.add(eye);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.02, 5, 10), iron); ring.position.set(0, yB + 0.035 + 0.04, 0); ring.rotation.y = 0.35; g.add(ring);

  // rope: tied to the ring, over the shoulder, down the side, one coil on the ground
  const P = (x, y, z) => new THREE.Vector3(x, y, z);
  const pts = [P(0.035, yB + 0.035, -0.012), P(0.13, yB - 0.005, 0.03), P(0.24, CY + 0.2, 0.08), P(0.32, CY + 0.04, 0.1), P(0.32, CY - 0.13, 0.12), P(0.27, 0.07, 0.2), P(0.3, 0.023, 0.33)];
  for (let k = 0; k <= 10; k++) { const a = -0.3 + k * 0.62; pts.push(P(0.44 + Math.cos(a + 3.4) * 0.13, 0.023, 0.38 + Math.sin(a + 3.4) * 0.1)); }
  const rope = new THREE.CatmullRomCurve3(pts);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(rope, 34, 0.023, 5, false), hemp));
  // kelp draped over the rope on the shoulder
  for (const [t, a] of [[0.05, 0.4], [0.09, -0.3], [0.13, 0.1]]) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 4, 1), kelp);
    const p = rope.getPoint(t); f.position.set(p.x + 0.02, p.y - 0.09, p.z + 0.02); f.rotation.set(Math.PI + 0.3, 0, a); f.scale.x = 0.35; g.add(f);
  }
  // barnacle crust: squat cones low on the -X/front side
  const up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < 10; k++) {
    const th = 1.95 + (k % 4) * 0.13, ph = -1.1 + Math.floor(k / 4) * 0.2 + (k % 2) * 0.07;
    const n = new THREE.Vector3(Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph));
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.026, 0.04, 5), barn);
    b.position.set(n.x * (R * 1.03 + 0.01), CY + n.y * R * SQ, n.z * (R * 1.03 + 0.01)); b.quaternion.setFromUnitVectors(up, n); g.add(b);
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
