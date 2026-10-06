// lamp_post A: primitives. Chunky hammered square iron post (jittered segments), box collars, square-bar bracket with torus scrolls, hex lantern from cylinders.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 11);
  const { box, boxB, cyl, put, T, jit } = K;
  // plinth: chunky stone block with a top step
  boxB('stone', 0.82, 0.4, 0.82, 0, 0, 0, 0, 0.07);
  boxB('stone', 0.6, 0.08, 0.6, 0, 0.4, 0, 0, 0.03);
  // foot collar
  boxB('iron', 0.34, 0.12, 0.34, 0, 0.48, 0, 0, 0.04);
  // hammered post: segments with slight jitter
  const top = 3.06; let y = 0.6; const segH = 0.3;
  while (y < top - 0.01) { const h = Math.min(segH, top - y); box('iron', 0.22 + jit(0.008), h + 0.01, 0.22 + jit(0.008), jit(0.004), y + h / 2, jit(0.004), 0, jit(0.02), 0, 0.012); y += h; }
  for (const yy of [0.62, 1.55, 2.62]) cyl('iron', 0.17, 0.17, 0.1, 8, 0, yy + 0.05, 0, 0, Math.PI / 8, 0);
  boxB('iron', 0.3, 0.08, 0.3, 0, 3.04, 0, 0, 0.03);
  boxB('iron', 0.18, 0.08, 0.18, 0, 3.12, 0, 0, 0.03);
  // bracket arm +x
  box('iron', 0.95, 0.08, 0.08, 0.55, 2.92, 0, 0, 0, 0, 0.02);
  box('iron', 0.08, 0.14, 0.1, 1.0, 2.88, 0, 0, 0, 0, 0.02);
  const tor = (r, a0, arc, x, yy, t = 0.024) => put('iron', new THREE.TorusGeometry(r, t, 5, 14, arc), T(x, yy, 0, 0, 0, a0));
  tor(0.16, Math.PI * 0.5, Math.PI * 1.7, 0.3, 2.72);
  tor(0.08, 0, Math.PI * 1.6, 0.32, 2.7, 0.02);
  tor(0.15, -Math.PI * 0.4, Math.PI * 1.6, 0.68, 2.74);
  tor(0.07, Math.PI, Math.PI * 1.5, 0.66, 2.73, 0.02);
  // chain
  for (let i = 0; i < 3; i++) put('iron', new THREE.TorusGeometry(0.045, 0.014, 4, 8), T(1.0, 2.76 - i * 0.08, 0, 0, i % 2 ? Math.PI / 2 : 0, 0));
  // hex lantern, ~0.56 wide, 0.8 tall
  const lx = 1.0, ly = 1.78;
  cyl('iron', 0.035, 0.035, 0.08, 6, lx, ly + 0.86, 0);
  put('iron', new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), T(lx, ly + 0.64, 0));
  cyl('iron', 0.2, 0.3, 0.1, 6, lx, ly + 0.6, 0);
  cyl('lampglow', 0.25, 0.2, 0.46, 6, lx, ly + 0.3, 0);
  cyl('iron', 0.24, 0.18, 0.07, 6, lx, ly + 0.035, 0);
  cyl('iron', 0.12, 0.07, 0.08, 6, lx, ly - 0.04, 0);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; K.beam('iron', [lx + Math.cos(a) * 0.205, ly + 0.06, Math.sin(a) * 0.205], [lx + Math.cos(a) * 0.255, ly + 0.55, Math.sin(a) * 0.255], 0.04, 0.04, 0.01); }
  K.finish(g);
  return recentre(THREE, g);
}
