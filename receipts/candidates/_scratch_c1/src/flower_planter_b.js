// flower_planter B: profiles. The box rim is one extruded frame (Shape with a hole) with a bevel, the sides
// are extruded plank boards, end caps chamfered; leaves are flat ShapeGeometry rounded-lobed leaves (DoubleSide)
// set at angles in a dense mound and hanging strings, geranium heads are lathed domes with a petal ring.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 67);
  const { box, boxB, put, T, jit, rnd, beam } = K;
  addMat(K, 'leaf', 0x57773a, 0.85, 'foliage', { side: THREE.DoubleSide });
  addMat(K, 'leaf2', 0x4a6630, 0.85, 'foliage', { side: THREE.DoubleSide });
  addMat(K, 'petal', 0xc8352b, 0.8, 'foliage');
  addMat(K, 'soil', 0x4a3426, 0.95, 'ground');
  const L = 1.1, D = 0.32, H = 0.26;
  // base band + boards
  boxB('drift', L + 0.06, 0.05, D + 0.06, 0, 0, 0, 0, 0.015);
  const board = new THREE.Shape([[0, 0], [0.04, 0], [0.045, 0.01], [0.045, 0.075], [0.04, 0.085], [0, 0.085]].map((p) => new THREE.Vector2(p[0], p[1])));
  const bg = new THREE.ExtrudeGeometry(board, { depth: L, bevelEnabled: false }); bg.translate(0, 0, -L / 2); bg.rotateY(Math.PI / 2);
  for (let i = 0; i < 3; i++) { put('drift', bg, T(0, 0.04 + i * 0.074, D / 2 - 0.045, 0, 0, jit(0.006))); put('drift', bg, T(0, 0.04 + i * 0.074, -D / 2 + 0.045, 0, Math.PI, jit(0.006))); }
  for (const sx of [-1, 1]) box('drift', 0.05, H - 0.04, D - 0.02, sx * (L / 2 - 0.025), 0.05 + (H - 0.04) / 2, 0, 0, 0, 0, 0.012);
  for (const sx of [-1, 1]) box('timber', 0.07, H, D + 0.05, sx * (L / 2 + 0.015), H / 2 + 0.02, 0, 0, 0, 0, 0.02);
  // rim frame
  const ro = new THREE.Shape([[-L / 2 - 0.06, -D / 2 - 0.05], [L / 2 + 0.06, -D / 2 - 0.05], [L / 2 + 0.06, D / 2 + 0.05], [-L / 2 - 0.06, D / 2 + 0.05]].map((p) => new THREE.Vector2(p[0], p[1])));
  ro.holes.push(new THREE.Path([[-L / 2 + 0.03, -D / 2 + 0.03], [-L / 2 + 0.03, D / 2 - 0.03], [L / 2 - 0.03, D / 2 - 0.03], [L / 2 - 0.03, -D / 2 + 0.03]].map((p) => new THREE.Vector2(p[0], p[1]))));
  const rg = new THREE.ExtrudeGeometry(ro, { depth: 0.035, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1 }); rg.rotateX(-Math.PI / 2);
  put('drift', rg, T(0, H + 0.04, 0));
  for (const x of [-0.3, 0.3]) box('timber', 0.08, 0.15, 0.05, x, H - 0.03, D / 2 + 0.03, 0, 0, 0, 0.012);
  box('soil', L - 0.06, 0.02, D - 0.06, 0, H + 0.03, 0, 0, 0, 0, 0);
  // leaf shape: rounded lobed disc on a short petiole
  const ls = new THREE.Shape(); { const n = 7; for (let k = 0; k <= n; k++) { const a = (k / n) * Math.PI * 2; const r = 0.05 * (1 + 0.12 * Math.cos(a * 5)); const p = [Math.cos(a) * r, Math.sin(a) * r * 0.9 + 0.045]; k ? ls.lineTo(p[0], p[1]) : ls.moveTo(p[0], p[1]); } }
  const leafGeo = new THREE.ShapeGeometry(ls, 1);
  const leaf = (x, y, z, rx, ry, s, k) => put(k ? 'leaf' : 'leaf2', leafGeo, T(x, y, z, rx, ry, jit(0.4), s, s, s));
  // low leaf mass so no soil shows between the leaves
  for (const [x, sx] of [[-0.3, 0.3], [0.1, 0.28], [0.38, 0.2]]) put('leaf2', new THREE.SphereGeometry(1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), T(x, H + 0.03, 0, 0, rnd(), 0, sx, 0.09, D / 2 - 0.01));
  for (let i = 0; i < 84; i++) leaf(-0.52 + rnd() * 1.04, H + 0.07 + rnd() * 0.1, -0.15 + rnd() * 0.3, -0.9 - rnd() * 1.0, rnd() * 6.28, 1.1 + rnd() * 0.45, i % 3);
  // hanging strings over the front and the left end
  const hang = (x, z, ry, n) => { for (let k = 0; k < n; k++) leaf(x + jit(0.02), H + 0.03 - k * 0.06, z + 0.01 * k, 0.15 + jit(0.3), ry + jit(0.5), 0.75, k % 2); };
  hang(0.22, D / 2 + 0.07, 0, 6); hang(-0.12, D / 2 + 0.07, 0, 4); hang(-L / 2 - 0.08, 0.06, -Math.PI / 2, 6); hang(L / 2 + 0.08, -0.05, Math.PI / 2, 3);
  // geranium heads: lathed dome + floret bumps
  const dome = new THREE.LatheGeometry([[0, 0.055], [0.03, 0.05], [0.05, 0.03], [0.055, 0.0], [0.0, -0.01]].map((p) => new THREE.Vector2(p[0], p[1])), 6);
  const floret = new THREE.IcosahedronGeometry(0.022, 0);
  for (let i = 0; i < 12; i++) {
    const x = -0.46 + i * 0.084 + jit(0.03), z = jit(0.08), top = 0.43 + rnd() * 0.06;
    beam('leaf2', [x, H + 0.08, z], [x + jit(0.02), top, z], 0, 0, 0, 0, (Lh) => new THREE.CylinderGeometry(0.008, 0.01, Lh, 3, 1));
    put('petal', dome, T(x, top, z, jit(0.3), rnd(), jit(0.3)));
    for (let k = 0; k < 3; k++) { const a = k * 2.09 + rnd(); put('petal', floret, T(x + Math.cos(a) * 0.04, top + 0.035, z + Math.sin(a) * 0.04, rnd(), rnd(), rnd())); }
  }
  K.finish(g);
  return recentre(THREE, g);
}
