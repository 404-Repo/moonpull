// raft_b: profiles. Logs are ExtrudeGeometry of a lumpy bark outline with end-grain ring shapes
// laid on the caps; planks are extruded rounded profiles; the coil is a Tube along a spiral.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const wood = mk(0x7b5a3e, 'timber', 0.88);
  const drift = mk(0xb79773, 'timber', 0.85);
  const dark = mk(0x4a3426, 'timber', 0.6);
  const rope = mk(0xa58a5c, 'fabric', 0.95);
  const R = 0.19;
  const bark = (r, seed) => { const s = new THREE.Shape(); const n = 14;
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = r * (1 + 0.05 * Math.sin(a * 5 + seed) + 0.03 * Math.sin(a * 3 + seed * 2)); const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
    return s; };
  const ringShape = (ro, ri) => { const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h); return s; };
  const xs = [-1.075, -0.645, -0.215, 0.215, 0.645, 1.075], lens = [2.5, 2.6, 2.45, 2.58, 2.5, 2.6];
  xs.forEach((x, i) => {
    const l = lens[i], zc = ((i * 5) % 3 - 1) * 0.04, bv = 0.03;
    const geo = new THREE.ExtrudeGeometry(bark(R - bv, i), { depth: l - 2 * bv, bevelEnabled: true, bevelSize: bv, bevelThickness: bv, bevelSegments: 2, curveSegments: 4 });
    const log = new THREE.Mesh(geo, wood); log.position.set(x, R, zc - l / 2 + bv); g.add(log);
    for (const s of [1, -1]) {
      const z = zc + s * (l / 2 + 0.003);
      [[R * 0.78, R * 0.66, drift, 0.015], [R * 0.48, R * 0.36, drift, 0.015], [R * 0.2, 0, dark, 0.02]].forEach(([ro, ri, m, d]) => {
        const rg = new THREE.Mesh(ri > 0 ? new THREE.ExtrudeGeometry(ringShape(ro, ri), { depth: d, bevelEnabled: false, curveSegments: 6 }) : new THREE.CylinderGeometry(ro, ro, d, 8), m);
        if (ri > 0) rg.position.set(x, R, s > 0 ? z : z - d); else { rg.rotation.x = Math.PI / 2; rg.position.set(x, R, z); }
        g.add(rg);
      });
    }
  });
  const ps = new THREE.Shape(); const pw = 0.22, ph = 0.07, rr = 0.02;
  ps.moveTo(-pw / 2 + rr, 0); ps.lineTo(pw / 2 - rr, 0); ps.quadraticCurveTo(pw / 2, 0, pw / 2, rr); ps.lineTo(pw / 2, ph - rr); ps.quadraticCurveTo(pw / 2, ph, pw / 2 - rr, ph); ps.lineTo(-pw / 2 + rr, ph); ps.quadraticCurveTo(-pw / 2, ph, -pw / 2, ph - rr); ps.lineTo(-pw / 2, rr); ps.quadraticCurveTo(-pw / 2, 0, -pw / 2 + rr, 0);
  const deckY = 2 * R - 0.02;
  for (let i = 0; i < 9; i++) {
    const w = 2.35 + ((i * 3) % 4) * 0.06, z = -1.0 + i * 0.25;
    const p = new THREE.Mesh(new THREE.ExtrudeGeometry(ps, { depth: w, bevelEnabled: false, curveSegments: 2 }), i % 4 === 2 ? wood : drift);
    p.rotation.y = Math.PI / 2; p.position.set(-w / 2 + ((i * 5) % 3 - 1) * 0.04, deckY, z); g.add(p);
  }
  const deckTop = deckY + ph;
  for (const s of [1, -1]) {
    const pts = []; for (let i = 0; i <= 8; i++) { const z = -1.2 + 2.4 * i / 8; pts.push(new THREE.Vector3(s * 1.08, deckTop + 0.025, z)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.027, 5, false), rope));
    for (const z of [-1.1, 1.1]) { // a lashing wound three turns round the outer log
      const sp = []; for (let i = 0; i <= 36; i++) { const a = i / 12 * Math.PI * 2; sp.push(new THREE.Vector3(s * 1.075 + Math.cos(a) * (R + 0.03), R + Math.sin(a) * (R + 0.03), z - 0.07 + i / 36 * 0.14)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp), 48, 0.026, 4, false), rope));
    }
  }
  const post = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.11, 0], [0.1, 0.3], [0.08, 0.35], [0, 0.36]].map(([a, b]) => new THREE.Vector2(a, b)), 10), wood); post.position.set(0.85, deckTop, -0.85); g.add(post);
  const coil = []; for (let i = 0; i <= 60; i++) { const a = i / 20 * Math.PI * 2, r = 0.28 - i / 60 * 0.12; coil.push(new THREE.Vector3(0.55 + Math.cos(a) * r, deckTop + 0.03 + (i / 60) * 0.06, -0.2 + Math.sin(a) * r)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 70, 0.03, 4, false), rope));

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
