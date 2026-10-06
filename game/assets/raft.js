// raft_a: primitives. Six Cylinder logs along Z with stepped end-grain discs, Box deck planks
// across them, rope as Torus wraps at the corners and Tube runs along the deck edges.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const wood = mk(0x7b5a3e, 'timber', 0.88);
  const drift = mk(0xb79773, 'timber', 0.85);
  const dark = mk(0x4a3426, 'timber', 0.6);
  const rope = mk(0xa58a5c, 'fabric', 0.95);
  const R = 0.19, xs = [-1.075, -0.645, -0.215, 0.215, 0.645, 1.075], lens = [2.5, 2.6, 2.45, 2.58, 2.5, 2.6];
  xs.forEach((x, i) => {
    const l = lens[i], r = R * (0.95 + 0.05 * ((i * 7) % 3) / 2), zc = ((i * 5) % 3 - 1) * 0.04;
    const log = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.02, l, 12, 1, true), wood); log.rotation.x = Math.PI / 2; log.position.set(x, R, zc); g.add(log);
    for (const s of [1, -1]) {
      const z = zc + s * l / 2;
      [[r * 1.03, 0.0, wood], [r * 0.9, 0.004, drift], [r * 0.64, 0.008, dark], [r * 0.52, 0.012, drift], [r * 0.2, 0.016, dark]].forEach(([rr, o, m]) => {
        const d = new THREE.Mesh(new THREE.CircleGeometry(rr, 12), m); d.rotation.y = s > 0 ? 0 : Math.PI; d.position.set(x, R, z + s * o); g.add(d);
      });
    }
  });
  // deck planks across the logs, staggered ends
  const deckY = 2 * R - 0.02, n = 9, pw = 0.25;
  for (let i = 0; i < n; i++) {
    const w = 2.35 + ((i * 3) % 4) * 0.06, z = -1.0 + i * pw;
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, 0.075, pw - 0.03), i % 4 === 2 ? wood : drift);
    p.position.set(((i * 5) % 3 - 1) * 0.04, deckY + 0.037, z); p.rotation.y = ((i * 7) % 5 - 2) * 0.006; g.add(p);
  }
  const deckTop = deckY + 0.075;
  // rope along both long edges, and wraps where it meets the end logs
  for (const s of [1, -1]) {
    const pts = []; for (let i = 0; i <= 6; i++) { const z = -1.15 + 2.3 * i / 6; pts.push(new THREE.Vector3(s * 1.08, deckTop + 0.025 + Math.sin(i * 1.7) * 0.01, z)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.027, 5, false), rope));
    for (const z of [-1.1, 1.1]) for (let k = 0; k < 2; k++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R + 0.03, 0.027, 4, 12), rope); t.position.set(s * 1.075, R, z + (k - 0.5) * 0.065); g.add(t);
    }
  }
  // bollard and a coil
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.35, 10), wood); post.position.set(0.85, deckTop + 0.175, -0.85); g.add(post);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.04, 10), drift); top.position.set(0.85, deckTop + 0.37, -0.85); g.add(top);
  for (let k = 0; k < 2; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.026, 4, 12), rope); t.rotation.x = Math.PI / 2; t.position.set(0.85, deckTop + 0.12 + k * 0.05, -0.85); g.add(t); }
  for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.28 - k * 0.04, 0.03, 4, 12), rope); t.rotation.x = Math.PI / 2; t.position.set(0.55, deckTop + 0.03 + k * 0.05, -0.2); g.add(t); }

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
  g.userData.deckTop = deckTop - box.min.y;
  return g;
}
