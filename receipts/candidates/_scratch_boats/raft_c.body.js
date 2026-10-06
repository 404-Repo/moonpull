// raft_c: a second reading of the reference. Long deck planks run WITH the logs, staggered at
// the ends; logs are Lathe profiles with chamfered ends and stepped end-grain rings; the lashings
// are Tubes that weave over and under every log across both ends.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const wood = mk(0x7b5a3e, 'timber', 0.88);
  const drift = mk(0xb79773, 'timber', 0.85);
  const dark = mk(0x4a3426, 'timber', 0.6);
  const rope = mk(0xa58a5c, 'fabric', 0.95);
  const R = 0.2, xs = [-1.08, -0.65, -0.216, 0.216, 0.65, 1.08], lens = [2.45, 2.6, 2.5, 2.58, 2.46, 2.6];
  xs.forEach((x, i) => {
    const l = lens[i], h = l / 2, r = R * (0.94 + 0.06 * ((i * 7) % 3) / 2);
    // profile along the log axis (lathe y = log length), chamfer then stepped grain at each end
    const prof = [[0.0, -h + 0.02], [r * 0.25, -h + 0.02], [r * 0.3, -h], [r * 0.55, -h], [r * 0.6, -h + 0.015], [r * 0.82, -h + 0.015], [r * 0.9, -h + 0.005], [r, -h + 0.05], [r * 1.02, 0], [r, h - 0.05], [r * 0.9, h - 0.005], [r * 0.82, h - 0.015], [r * 0.6, h - 0.015], [r * 0.55, h], [r * 0.3, h], [r * 0.25, h - 0.02], [0.0, h - 0.02]];
    const log = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 12), wood);
    log.rotation.x = Math.PI / 2; log.position.set(x, R, ((i * 5) % 3 - 1) * 0.04); g.add(log);
    for (const s of [1, -1]) { const cap = new THREE.Mesh(new THREE.CircleGeometry(r * 0.9, 12), drift); cap.position.set(x, R, log.position.z + s * (h - 0.008)); cap.rotation.y = s > 0 ? 0 : Math.PI; g.add(cap); }
    for (const s of [1, -1]) { const k = new THREE.Mesh(new THREE.CircleGeometry(r * 0.28, 8), dark); k.position.set(x, R, log.position.z + s * (h - 0.016)); k.rotation.y = s > 0 ? 0 : Math.PI; g.add(k); }
  });
  // cross bearers under the deck, then long planks along the logs
  const by = 2 * R - 0.03;
  for (const z of [-0.95, 0.95]) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 0.16), wood); b.position.set(0, by + 0.04, z); g.add(b); }
  const deckY = by + 0.06, pw = 0.235;
  for (let i = 0; i < 10; i++) {
    const x = -1.06 + i * pw, l = 2.2 + ((i * 3) % 4) * 0.07, zc = ((i * 5) % 3 - 1) * 0.05;
    const p = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.03, 0.07, l), i === 4 ? wood : drift); p.position.set(x, deckY + 0.035 + (i % 2) * 0.006, zc); g.add(p);
  }
  const deckTop = deckY + 0.076;
  // lashings: weave over the bearer and under each log, at both ends
  for (const z of [-0.95, 0.95]) {
    const pts = [];
    xs.forEach((x, i) => { pts.push(new THREE.Vector3(x - 0.2, deckTop - 0.03, z)); pts.push(new THREE.Vector3(x, -0.0 + 0.03, z + 0.05)); });
    pts.push(new THREE.Vector3(1.3, deckTop - 0.03, z));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.026, 4, false), rope));
  }
  // rope round the deck edge, the corner post and a flat coil
  const edge = [new THREE.Vector3(-1.12, deckTop + 0.02, -1.1), new THREE.Vector3(-1.12, deckTop + 0.02, 1.1), new THREE.Vector3(1.12, deckTop + 0.02, 1.1), new THREE.Vector3(1.12, deckTop + 0.02, -1.1)];
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true, 'catmullrom', 0.1), 48, 0.027, 4, true), rope));
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.38, 10), wood); post.position.set(0.86, deckTop + 0.19, -0.88); g.add(post);
  const pc = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 10), drift); pc.position.set(0.86, deckTop + 0.39, -0.88); g.add(pc);
  for (let k = 0; k < 2; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.027, 4, 12), rope); t.rotation.x = Math.PI / 2; t.position.set(0.86, deckTop + 0.15 + k * 0.055, -0.88); g.add(t); }
  const coil = []; for (let i = 0; i <= 60; i++) { const a = i / 20 * Math.PI * 2, r = 0.3 - i / 60 * 0.13; coil.push(new THREE.Vector3(0.5 + Math.cos(a) * r, deckTop + 0.03 + (i / 60) * 0.05, -0.25 + Math.sin(a) * r)); }
  coil.push(new THREE.Vector3(0.2, deckTop + 0.03, 0.15));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 70, 0.03, 4, false), rope));

__RECENTRE__
  g.userData.deckTop = deckTop - box.min.y;
  return g;
}
