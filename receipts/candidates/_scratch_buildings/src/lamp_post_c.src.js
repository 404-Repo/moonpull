// lamp_post C: different reading. Tapered octagonal post on a rough two-block stone base, swan-neck curved arm (tube along a curve) with one big scroll brace, square-section lantern with pyramid hood and dome finial.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 37);
  const { box, boxB, cyl, put, T, jit } = K;
  boxB('stone', 0.86, 0.26, 0.86, 0, 0, 0, 0.05, 0.07);
  boxB('stone', 0.64, 0.2, 0.64, 0, 0.26, 0, -0.04, 0.06);
  cyl('iron', 0.17, 0.2, 0.1, 8, 0, 0.51, 0);
  // tapered octagonal post, hammered: stacked frusta with tiny jitter
  let y = 0.56; const top = 3.08; const n = 9;
  for (let i = 0; i < n; i++) { const h = (top - y) / (n - i); const r0 = 0.135 - 0.025 * (i / n), r1 = 0.135 - 0.025 * ((i + 1) / n); put('iron', new THREE.CylinderGeometry(r1 + jit(0.004), r0 + jit(0.004), h + 0.005, 8, 1), T(jit(0.004), y + h / 2, jit(0.004), 0, Math.PI / 8 + jit(0.03), 0)); y += h; }
  for (const yy of [0.66, 1.5, 2.5]) cyl('iron', 0.16, 0.16, 0.1, 8, 0, yy, 0, 0, Math.PI / 8, 0);
  cyl('iron', 0.17, 0.12, 0.1, 8, 0, 3.1, 0); put('iron', new THREE.SphereGeometry(0.08, 8, 4), T(0, 3.17, 0));
  // swan-neck arm: tube along a curve
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.05, 2.75, 0), new THREE.Vector3(0.4, 2.98, 0), new THREE.Vector3(0.8, 3.0, 0), new THREE.Vector3(1.02, 2.88, 0), new THREE.Vector3(1.04, 2.76, 0)]);
  put('iron', new THREE.TubeGeometry(curve, 16, 0.04, 6, false), null);
  // scroll brace under it
  put('iron', new THREE.TorusGeometry(0.17, 0.025, 5, 14, Math.PI * 1.6), T(0.3, 2.66, 0, 0, 0, Math.PI * 0.45));
  put('iron', new THREE.TorusGeometry(0.08, 0.02, 5, 10, Math.PI * 1.5), T(0.3, 2.63, 0, 0, 0, -0.2));
  put('iron', new THREE.TorusGeometry(0.12, 0.022, 5, 12, Math.PI * 1.5), T(0.64, 2.8, 0, 0, 0, -Math.PI * 0.6));
  for (let i = 0; i < 2; i++) put('iron', new THREE.TorusGeometry(0.045, 0.014, 4, 8), T(1.04, 2.7 - i * 0.08, 0, 0, i % 2 ? Math.PI / 2 : 0, 0));
  // square lantern
  const lx = 1.04, ly = 1.82;
  box('iron', 0.5, 0.07, 0.5, lx, ly, 0, 0, 0, 0, 0.02);
  box('iron', 0.24, 0.07, 0.24, lx, ly - 0.06, 0, 0, 0, 0, 0.02);
  box('lampglow', 0.42, 0.44, 0.42, lx, ly + 0.26, 0, 0, 0, 0, 0.01);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box('iron', 0.06, 0.48, 0.06, lx + sx * 0.22, ly + 0.26, sz * 0.22, 0, 0, 0, 0.012);
  for (const s of [-1, 1]) { box('iron', 0.03, 0.42, 0.44, lx + s * 0.0, ly + 0.26, 0, 0, 0, 0, 0.005); }
  box('iron', 0.56, 0.06, 0.56, lx, ly + 0.51, 0, 0, 0, 0, 0.02);
  put('iron', new THREE.ConeGeometry(0.36, 0.22, 4, 1), T(lx, ly + 0.65, 0, 0, Math.PI / 4, 0));
  put('iron', new THREE.SphereGeometry(0.09, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), T(lx, ly + 0.74, 0));
  K.finish(g);
  return recentre(THREE, g);
}
