// net_rack C: different reading. Round log A-frames lashed at the crossing with rope collars, log top bar.
// The net is heavy and solid: a displaced cloth sheet (DoubleSide) in a darker hemp, with a raised cord grid
// on its front, gathered into deep vertical folds; a separate swag hangs between the two falls. Floats on hems.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 31);
  const { box, log, put, T, jit, rnd } = K;
  addMat(K, 'sheet', 0x7f6844, 0.95, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'net', 0xb39a6a, 0.95, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'cork', 0x9a5a32, 0.8, 'timber');
  const FX = 1.45;
  for (const sx of [-1, 1]) {
    const x = sx * FX;
    log('timber', [x - 0.07, 0, -0.62], [x - 0.07, 1.9, 0.13], 0.075, 7);
    log('timber', [x + 0.07, 0, 0.62], [x + 0.07, 1.9, -0.13], 0.075, 7);
    log('drift', [x + sx * 0.16, 0.55, -0.5], [x + sx * 0.16, 0.55, 0.5], 0.05, 6);
    put('rope', new THREE.TorusGeometry(0.11, 0.03, 4, 8), T(x, 1.58, 0, 0, Math.PI / 2, 0, 1, 1.3, 1));
  }
  log('timber', [-1.75, 1.66, 0], [1.75, 1.66, 0], 0.085, 8);
  log('timber', [-1.4, 0.5, -0.47], [1.4, 0.5, -0.47], 0.06, 6);
  // cloth sheet: displaced plane, deep folds
  function cloth(key, x0, x1, top, len, zc, side, folds) {
    const NU = 14, NV = 6;
    const geo = new THREE.PlaneGeometry(1, 1, NU, NV);
    const p = geo.attributes.position;
    const F = (u, v) => [x0 + (x1 - x0) * u, top(u) - len(u) * v, zc + side * (0.03 + 0.08 * v * v) + 0.07 * Math.sin(u * folds * Math.PI * 2) * (0.3 + v)];
    for (let i = 0; i < p.count; i++) { const u = p.getX(i) + 0.5, v = 0.5 - p.getY(i); p.setXYZ(i, ...F(u, v)); }
    geo.computeVertexNormals(); put(key, geo);
    // raised cord grid on the outward face
    for (let k = 0; k <= 8; k++) { const u = k / 8, pts = []; for (let j = 0; j <= 4; j++) { const q = F(u, j / 4); q[2] += side * 0.012; pts.push(q); } strand(K, 'net', pts, 0.012, 3); }
    for (let j = 1; j <= 4; j++) { const v = j / 4, pts = []; for (let k = 0; k <= 10; k++) { const q = F(k / 10, v); q[2] += side * 0.012; pts.push(q); } strand(K, 'net', pts, 0.012, 3); }
    return F;
  }
  const corkGeo = new THREE.SphereGeometry(0.045, 6, 4);
  const FL = cloth('sheet', -1.2, -0.3, () => 1.64, (u) => 1.15 - 0.15 * u, 0.1, 1, 3);
  const FR = cloth('sheet', 0.35, 1.22, () => 1.64, (u) => 0.95 + 0.15 * u, 0.1, 1, 3);
  cloth('sheet', -1.2, -0.3, () => 1.66, () => 0.3, -0.1, -1, 2);
  cloth('sheet', 0.35, 1.22, () => 1.66, () => 0.3, -0.1, -1, 2);
  // swag between the falls
  const FS = cloth('sheet', -0.35, 0.4, (u) => 1.6 - 0.5 * Math.sin(u * Math.PI), () => 0.35, 0.16, 1, 1);
  for (const F of [FL, FR, FS]) for (let k = 0; k <= 4; k++) { const q = F(k / 4, 1); put('cork', corkGeo, T(q[0], q[1] - 0.02, q[2] + 0.03, 0, 0, 0, 1, 1.3, 1)); }
  // coiled rope and a crate stand-in basket
  put('rope', new THREE.TorusGeometry(0.17, 0.03, 4, 12), T(0.6, 0.03, 0.55, Math.PI / 2));
  put('rope', new THREE.TorusGeometry(0.13, 0.03, 4, 12), T(0.6, 0.08, 0.55, Math.PI / 2));
  K.lathe('rope', [[0.0, 0], [0.2, 0.0], [0.26, 0.08], [0.28, 0.24], [0.3, 0.26], [0.27, 0.26], [0.25, 0.1], [0, 0.04]], 10, T(-0.2, 0, 0.6));
  K.finish(g);
  return recentre(THREE, g);
}
