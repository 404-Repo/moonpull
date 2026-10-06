// flower_planter C: different reading. Box with square corner posts and inset plank panels (frame and
// panel), the foliage as three lumpy displaced-sphere bush masses filling and spilling over the box, red
// geranium umbels as small displaced spheres poking above, and a few cut leaf-cards trailing off the ends.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 71);
  const { box, boxB, put, T, jit, rnd, beam } = K;
  addMat(K, 'leaf', 0x57773a, 0.85, 'foliage', { side: THREE.DoubleSide });
  addMat(K, 'leaf2', 0x4a6630, 0.85, 'foliage');
  addMat(K, 'petal', 0xc8352b, 0.8, 'foliage');
  const L = 1.1, D = 0.32, H = 0.3;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) boxB('timber', 0.07, H + 0.02, 0.07, sx * (L / 2 - 0.0), 0, sz * (D / 2), 0, 0.015);
  for (let i = 0; i < 3; i++) for (const sz of [-1, 1]) box('drift', L - 0.06, H / 3 - 0.01, 0.035, 0, 0.04 + (i + 0.5) * (H - 0.04) / 3, sz * (D / 2 - 0.005), jit(0.01), 0, 0, 0.01);
  for (const sx of [-1, 1]) box('drift', 0.035, H - 0.04, D - 0.06, sx * (L / 2), 0.02 + H / 2, 0, 0, 0, 0, 0.01);
  boxB('timber', L, 0.04, D - 0.04, 0, 0, 0, 0, 0.01);
  for (const sz of [-1, 1]) box('timber', L + 0.12, 0.05, 0.08, 0, H + 0.04, sz * D / 2, 0, 0, 0, 0.015);
  for (const sx of [-1, 1]) box('timber', 0.08, 0.05, D + 0.08, sx * (L / 2 + 0.02), H + 0.04, 0, 0, 0, 0, 0.015);
  const blob = (seed, det = 1) => { const geo = new THREE.IcosahedronGeometry(1, det); const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); v.multiplyScalar(1 + 0.18 * Math.sin(v.x * 5 + seed) * Math.cos(v.z * 4 + seed * 2) + 0.1 * Math.sin(v.y * 6 + seed)); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; };
  put('leaf2', blob(1), T(-0.3, H + 0.06, 0.0, 0, 0.3, 0, 0.3, 0.13, 0.19));
  put('leaf2', blob(2), T(0.05, H + 0.08, 0.02, 0, 1.2, 0, 0.28, 0.15, 0.19));
  put('leaf2', blob(3), T(0.36, H + 0.06, -0.01, 0, 2.1, 0, 0.26, 0.12, 0.18));
  // leaf cards on the mound and trailing
  const card = new THREE.CircleGeometry(0.05, 6);
  for (let i = 0; i < 30; i++) put('leaf', card, T(-0.5 + rnd(), H + 0.1 + rnd() * 0.08, (rnd() < 0.5 ? -1 : 1) * (0.12 + rnd() * 0.06), -0.6 + jit(0.5), rnd() * 6, 0, 1, 0.9, 1));
  for (const [x, z] of [[-L / 2 - 0.07, 0.04], [0.2, D / 2 + 0.06], [L / 2 + 0.07, -0.06]]) for (let k = 0; k < 5; k++) put('leaf', card, T(x + jit(0.02), H + 0.02 - k * 0.06, z, jit(0.4), x < -0.4 || x > 0.4 ? Math.PI / 2 : 0, 0, 0.8, 0.8, 0.8));
  for (let i = 0; i < 11; i++) {
    const x = -0.45 + i * 0.09 + jit(0.03), z = jit(0.08), top = 0.43 + rnd() * 0.06;
    beam('leaf2', [x, H + 0.1, z], [x, top, z], 0, 0, 0, 0, (Lh) => new THREE.CylinderGeometry(0.008, 0.01, Lh, 3, 1));
    put('petal', blob(i + 5, 0), T(x, top + 0.02, z, 0, rnd() * 3, 0, 0.055, 0.04, 0.055));
  }
  K.finish(g);
  return recentre(THREE, g);
}
