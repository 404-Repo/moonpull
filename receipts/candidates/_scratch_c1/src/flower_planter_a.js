// flower_planter A: primitives. Window box of horizontal chamfered planks with a thick overhanging top rim,
// a base band, two bracket blocks on the front and end battens. Leaves are flattened low-poly spheres in a
// mound plus trailing runs over the front and left end; geraniums are clusters of red icosahedra on stems.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 61);
  const { box, boxB, put, T, jit, rnd, beam } = K;
  addMat(K, 'leaf', 0x57773a, 0.85, 'foliage');
  addMat(K, 'leaf2', 0x4a6630, 0.85, 'foliage');
  addMat(K, 'petal', 0xc8352b, 0.8, 'foliage');
  addMat(K, 'ground', 0x4a3426, 0.95, 'ground');
  const L = 1.12, D = 0.32, H = 0.28;
  boxB('drift', L + 0.04, 0.05, D + 0.04, 0, 0, 0, 0, 0.015);
  for (let i = 0; i < 3; i++) for (const sz of [-1, 1]) box('drift', L, H / 3 - 0.008, 0.04, jit(0.005), 0.05 + (i + 0.5) * H / 3, sz * (D / 2 - 0.02), jit(0.01), 0, 0, 0.012);
  for (const sx of [-1, 1]) box('drift', 0.04, H, D - 0.04, sx * (L / 2 - 0.02), 0.05 + H / 2, 0, 0, 0, 0, 0.01);
  for (const sx of [-1, 1]) box('timber', 0.06, H + 0.02, D + 0.04, sx * (L / 2 + 0.01), 0.04 + H / 2, 0, 0, 0, 0, 0.015);
  // rim
  for (const sz of [-1, 1]) box('drift', L + 0.12, 0.05, 0.08, 0, H + 0.075, sz * (D / 2), 0, 0, 0, 0.015);
  for (const sx of [-1, 1]) box('drift', 0.08, 0.05, D + 0.08, sx * (L / 2 + 0.02), H + 0.075, 0, 0, 0, 0, 0.015);
  for (const x of [-0.32, 0.32]) box('timber', 0.08, 0.14, 0.05, x, H - 0.02, D / 2 + 0.035, 0, 0, 0, 0.012);
  box('ground', L - 0.04, 0.02, D - 0.06, 0, H + 0.03, 0, 0, 0, 0, 0);
  // leaf mound
  const leafGeo = new THREE.SphereGeometry(0.05, 5, 3);
  for (let i = 0; i < 44; i++) {
    const x = -0.5 + rnd() * 1.0, z = -0.12 + rnd() * 0.24, y = H + 0.06 + rnd() * 0.1;
    put(i % 3 ? 'leaf' : 'leaf2', leafGeo, T(x, y, z, jit(0.5), rnd() * 6, jit(0.5), 1.1 + jit(0.2), 0.28, 1.1 + jit(0.2)));
  }
  // trailing runs: front middle-right and left end
  const trail = (x0, z0, dx, dz) => { for (let k = 0; k < 6; k++) put(k % 2 ? 'leaf' : 'leaf2', leafGeo, T(x0 + dx * k * 0.03 + jit(0.02), H + 0.06 - k * 0.055, z0 + dz * (0.03 + k * 0.006), jit(0.3) + dz * 1.2, rnd() * 6, dx * 1.2, 0.9, 0.3, 0.9)); };
  trail(0.25, D / 2 + 0.05, 0, 1); trail(-0.1, D / 2 + 0.05, 0, 1); trail(-L / 2 - 0.02, 0.05, -1, 0);
  // geranium clusters
  const flo = new THREE.IcosahedronGeometry(0.03, 0);
  for (let i = 0; i < 11; i++) {
    const x = -0.46 + i * 0.092 + jit(0.03), z = jit(0.08), top = 0.43 + rnd() * 0.06;
    beam('leaf2', [x, H + 0.08, z], [x + jit(0.02), top, z], 0, 0, 0, 0, (Lh) => new THREE.CylinderGeometry(0.008, 0.01, Lh, 3, 1));
    for (let k = 0; k < 6; k++) { const a = k * 1.2 + rnd(); const r = k ? 0.035 : 0; put('petal', flo, T(x + Math.cos(a) * r, top + (k ? 0.0 : 0.02) + jit(0.008), z + Math.sin(a) * r, rnd(), rnd(), rnd())); }
  }
  K.finish(g);
  return recentre(THREE, g);
}
