// picket_fence A: primitives. One square weathered post at the -X end (outer face at x = -1.5), two
// driftwood rails running the full 3 m to x = +1.5 so the next section's post closes the run, eleven
// whitewashed pickets: chamfered boxes topped with a flattened four-sided cone point, small height wobble.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 17);
  const { box, boxB, put, T, jit, rnd } = K;
  addMat(K, 'paint', 0xe6ddca, 0.9, 'timber');
  const HL = 1.5, PW = 0.14;
  boxB('timber', PW, 1.0, PW, -HL + PW / 2, 0, 0, 0, 0.035);
  put('timber', new THREE.ConeGeometry(PW * 0.72, 0.06, 4), T(-HL + PW / 2, 1.03, 0, 0, Math.PI / 4, 0));
  for (const y of [0.28, 0.7]) box('drift', 2 * HL - PW, 0.09, 0.05, PW / 2, y, -0.045, 0, 0, jit(0.01), 0.015);
  const N = 11, span = 2 * HL - PW - 0.1, step = span / N;
  for (let i = 0; i < N; i++) {
    const x = -HL + PW + 0.05 + step * (i + 0.5), h = 0.82 + jit(0.03), w = 0.1;
    box('paint', w, h, 0.045, x, 0.05 + h / 2, 0.0, 0, 0, jit(0.025), 0.012);
    put('paint', new THREE.ConeGeometry(w * 0.707, 0.09, 4), T(x, 0.05 + h + 0.045, 0, 0, Math.PI / 4, 0, 1, 1, 0.45 / 0.707 * 0.707 * 0.64));
  }
  for (let i = 0; i < 3; i++) box('iron', 0.04, 0.04, 0.02, -HL + PW / 2, 0.28 + (i % 2) * 0.42, 0.075, 0, 0, 0, 0);
  K.finish(g);
  return recentre(THREE, g);
}
