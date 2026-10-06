// well_islet C: different reading. Lumpy boulder plinth (scaled icosahedra) under a wall of random-width
// dressed stones in 3 staggered courses, posts standing on the plinth, curved upturned ridge with tiles following the sag.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 33);
  const { box, boxB, beam, jit, put, T, rnd } = K;
  // boulder plinth
  const NB = 11;
  for (let i = 0; i < NB; i++) {
    const a = (i + jit(0.15)) / NB * Math.PI * 2, r = 0.86;
    put('stone', new THREE.IcosahedronGeometry(0.25, 0), T(Math.cos(a) * r, 0.17, Math.sin(a) * r, jit(0.5), -a + jit(0.3), jit(0.5), 1.0 + jit(0.1), 0.72 + jit(0.08), 1.2 + jit(0.1)));
  }
  // wall: random width stones per course
  const course = (r, dr, y0, h, start) => {
    let a = start; const end = start + Math.PI * 2;
    while (a < end - 0.05) {
      let w = 0.4 + rnd() * 0.24; let da = w / r; if (a + da > end - 0.12) da = end - a;
      const am = a + da / 2;
      box('stone', dr + jit(0.03), h + jit(0.03), da * r - 0.045, Math.cos(am) * r, y0 + h / 2, Math.sin(am) * r, jit(0.03), -am, jit(0.03), 0.05);
      a += da;
    }
  };
  course(0.76, 0.26, 0.3, 0.26, 0.1);
  course(0.76, 0.26, 0.56, 0.24, 0.35);
  course(0.77, 0.32, 0.8, 0.18, 0.0);
  K.cyl('iron', 0.63, 0.63, 0.04, 10, 0, 0.78, 0);
  for (let i = 0; i < 14; i++) { const a = rnd() * Math.PI * 2; put('cream', new THREE.OctahedronGeometry(0.035 + rnd() * 0.025, 0), T(Math.cos(a) * 1.04, 0.08 + rnd() * 0.2, Math.sin(a) * 1.04)); }
  for (const a0 of [0.4, 1.9, 3.3, 4.8]) for (let j = 0; j < 3; j++) { const a = a0 + j * 0.1; put('kelp', new THREE.ConeGeometry(0.05, 0.5 + rnd() * 0.3, 4), T(Math.cos(a) * 1.0, 0.35, Math.sin(a) * 1.0, jit(0.35), rnd() * 3, jit(0.35), 1, 1, 0.4)); }
  // posts on the plinth just outside the wall, with knee braces into a cross head
  const PX = 0.9, EY = 2.2, RY = 2.78;
  for (const s of [-1, 1]) {
    const x = s * PX;
    boxB('timber', 0.18, EY - 0.3, 0.18, x, 0.3, 0, 0, 0.04);
    box('timber', 0.15, 0.15, 1.5, x, EY, 0, 0, 0, 0, 0);
    beam('timber', [x, EY - 0.06, 0.92], [x, RY, 0], 0.12, 0.12, 0);
    beam('timber', [x, EY - 0.06, -0.92], [x, RY, 0], 0.12, 0.12, 0);
    beam('timber', [x, EY - 0.55, 0.07], [x, EY - 0.05, 0.55], 0.1, 0.1, 0);
    beam('timber', [x, EY - 0.55, -0.07], [x, EY - 0.05, -0.55], 0.1, 0.1, 0);
  }
  // curved ridge: segments rising at the ends
  const W = 2.3, sag = (x) => 0.1 * Math.pow(2 * x / W, 2);
  const segs = 4; for (let i = 0; i < segs; i++) { const x0 = -W / 2 - 0.08 + (W + 0.16) * i / segs, x1 = -W / 2 - 0.08 + (W + 0.16) * (i + 1) / segs; beam('timber', [x0, RY + 0.12 + sag(x0), 0], [x1, RY + 0.12 + sag(x1), 0], 0.18, 0.16, 0.03, 0); }
  // roof slopes: tiles laid per row, lifted by the sag curve so the eave line smiles
  const run = 1.05, rise = RY - EY, a = Math.atan2(rise, run), L = Math.hypot(run, rise) + 0.04;
  for (const side of [1, -1]) {
    for (let r = 0; r < 3; r++) {
      const zc = L - 0.22 - r * 0.36; const off = (r % 2) * 0.23;
      for (let x0 = -W / 2 - 0.23 + off; x0 < W / 2; x0 += 0.46) {
        const a0 = Math.max(x0, -W / 2), a1 = Math.min(x0 + 0.44, W / 2); if (a1 - a0 < 0.12) continue;
        const xm = (a0 + a1) / 2; const y = RY + 0.06 + sag(xm) - Math.sin(a) * zc, z = side * Math.cos(a) * zc;
        box('tile', a1 - a0, 0.06, 0.46, xm, y, z, side > 0 ? a - 0.12 + jit(0.03) : a - 0.12 + jit(0.03), side > 0 ? jit(0.04) : Math.PI + jit(0.04), jit(0.03), 0);
      }
    }
    // board under tiles
    box('timber', W, 0.05, L, 0, RY + 0.02 - Math.sin(a) * L / 2, side * Math.cos(a) * L / 2, a, side > 0 ? 0 : Math.PI, 0, 0.01);
  }
  // windlass + coil + crank
  const WY = 1.55;
  K.cyl('timber', 0.12, 0.12, 1.66, 7, 0, WY, 0, 0, 0, Math.PI / 2);
  for (let i = 0; i < 3; i++) put('rope', new THREE.TorusGeometry(0.14, 0.035, 3, 7), T(-0.1 + i * 0.075, WY, 0, 0, Math.PI / 2, 0));
  K.cyl('rope', 0.015, 0.015, 0.45, 4, 0, WY - 0.35, 0.13);
  K.cyl('timber', 0.04, 0.04, 0.25, 6, PX + 0.2, WY, 0, 0, 0, Math.PI / 2);
  box('timber', 0.06, 0.3, 0.08, PX + 0.3, WY - 0.12, 0, 0, 0, 0, 0.015);
  K.cyl('timber', 0.035, 0.035, 0.22, 6, PX + 0.4, WY - 0.24, 0, 0, 0, Math.PI / 2);
  const BY = 0.97;
  K.cyl('timber', 0.14, 0.11, 0.22, 8, 0, BY, 0.13);
  K.cyl('iron', 0.145, 0.145, 0.03, 8, 0, BY + 0.06, 0.13);
  put('iron', new THREE.TorusGeometry(0.14, 0.012, 3, 8, Math.PI), T(0, BY + 0.11, 0.13));
  K.finish(g);
  return recentre(THREE, g);
}
