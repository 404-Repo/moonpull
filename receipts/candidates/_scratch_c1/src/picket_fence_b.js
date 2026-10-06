// picket_fence B: profiles. Each picket is an extruded Shape with a pointed (dog-eared) top and a small
// bevel, rails are extruded boards with chamfered edges, the post a chamfered square with a pyramid cap.
// One post at the -X end; rails run to +1.5 for end-to-end tiling. Pickets vary in height and lean.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 19);
  const { box, boxB, put, T, jit, rnd } = K;
  addMat(K, 'paint', 0xe6ddca, 0.9, 'timber');
  const HL = 1.5, PW = 0.15;
  const ext = (pts, depth, bev) => { const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1]))); const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: !!bev, bevelSize: bev, bevelThickness: bev, bevelSegments: 1 }); geo.translate(0, 0, -depth / 2); return geo; };
  // post with pyramid cap
  boxB('timber', PW, 0.98, PW, -HL + PW / 2, 0, 0, 0, 0.03);
  put('timber', new THREE.ConeGeometry(PW * 0.707, 0.07, 4, 1), T(-HL + PW / 2, 1.015, 0, 0, Math.PI / 4, 0));
  // rails: board profile extruded along x
  const rail = ext([[0, -0.045], [0.04, -0.045], [0.05, -0.035], [0.05, 0.035], [0.04, 0.045], [0, 0.045]], 2 * HL - PW, 0);
  rail.rotateY(Math.PI / 2);
  for (const y of [0.27, 0.69]) put('drift', rail, T(PW / 2, y + jit(0.01), -0.03, 0, 0, jit(0.01)));
  // pickets
  const N = 11, span = 2 * HL - PW - 0.08, step = span / N;
  for (let i = 0; i < N; i++) {
    const w = 0.095 + jit(0.008), h = 0.84 + jit(0.04), x = -HL + PW + 0.04 + step * (i + 0.5);
    const geo = ext([[-w / 2, 0], [w / 2, 0], [w / 2, h - 0.07], [0.0, h], [-w / 2, h - 0.07]], 0.03, 0.008);
    put('paint', geo, T(x, 0.06, 0.015, jit(0.02), jit(0.05), jit(0.03)));
  }
  // nail heads
  for (let i = 0; i < N; i++) for (const y of [0.27, 0.69]) box('iron', 0.04, 0.04, 0.02, -HL + PW + 0.04 + step * (i + 0.5), y, 0.045, 0, 0, 0, 0);
  K.finish(g);
  return recentre(THREE, g);
}
