// picket_fence C: different reading. A complete bay with a post at BOTH ends (outer faces at x = +-1.5, so
// tiled runs get paired posts like a panel fence), round-topped pickets (box + half cylinder), a diagonal
// brace between the rails on the back, rough stone collars at the post feet.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 29);
  const { box, boxB, beam, put, T, jit, rnd } = K;
  addMat(K, 'paint', 0xe6ddca, 0.9, 'timber');
  const HL = 1.5, PW = 0.14;
  for (const sx of [-1, 1]) {
    const x = sx * (HL - PW / 2);
    boxB('timber', PW, 1.02 + jit(0.02), PW, x, 0, 0, jit(0.05), 0.035);
    for (let k = 0; k < 4; k++) put('stone', new THREE.DodecahedronGeometry(0.06, 0), T(x + Math.cos(k * 1.6) * 0.1, 0.03, Math.sin(k * 1.6) * 0.1, jit(1), jit(1), 0, 1, 0.6, 1));
  }
  for (const y of [0.28, 0.7]) box('drift', 2 * HL - 2 * PW, 0.09, 0.05, 0, y, -0.045, 0, 0, 0, 0.015);
  beam('drift', [-HL + PW + 0.05, 0.33, -0.08], [HL - PW - 0.05, 0.65, -0.08], 0.08, 0.04, 0);
  const N = 10, span = 2 * HL - 2 * PW - 0.06, step = span / N;
  for (let i = 0; i < N; i++) {
    const x = -span / 2 + step * (i + 0.5), h = 0.78 + jit(0.04), w = 0.1, lean = jit(0.035);
    K.frame(T(x, 0.06, 0, 0, 0, lean), () => {
      boxB('paint', w, h, 0.045, 0, 0, 0, 0, 0.012);
      put('paint', new THREE.CylinderGeometry(w / 2, w / 2, 0.045, 7, 1, false, -Math.PI / 2, Math.PI), T(0, h, 0, Math.PI / 2, 0, 0));
    });
  }
  K.finish(g);
  return recentre(THREE, g);
}
