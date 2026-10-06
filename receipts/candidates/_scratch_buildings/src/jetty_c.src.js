// jetty C: different reading. Hewn octagonal piles with a plinth collar, joists across at 1 m,
// deck boards running LENGTHWISE with staggered butt joints, single K braces per bay, separate rope posts.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 23);
  const { box, beam, jit, put, T } = K;
  const PZ = [-8 / 3, 0, 8 / 3], PX = 1.1, DECK = 2.6;
  for (const z of PZ) for (const s of [-1, 1]) {
    const x = s * PX, top = 2.85;
    K.cyl('wet', 0.16, 0.17, 1.55, 6, x, 0.775, z, 0, jit(0.4), 0);
    K.cyl('timber', 0.15, 0.155, top - 1.55, 6, x, 1.55 + (top - 1.55) / 2, z, 0, jit(0.4), 0);
    K.cyl('iron', 0.165, 0.165, 0.06, 6, x, 1.55, z);
  }
  // headers + joists across X every 1 m
  for (const z of PZ) box('timber', 2.5, 0.22, 0.2, 0, 2.2, z, 0, 0, 0, 0.04);
  for (let i = 0; i < 8; i++) box('timber', 2.4, 0.16, 0.14, 0, 2.43, -3.5 + i, 0, 0, 0, 0);
  // lengthwise deck boards, 9 across, each line split in staggered lengths
  const NB = 9, bw = 2.5 / NB;
  for (let j = 0; j < NB; j++) {
    const x = -1.25 + bw * (j + 0.5); const joints = [-4, -4 + 2 + (j % 3) * 1, 0 + (j % 3) * 1 + 1, 4].filter((v, i, a) => i === 0 || v > a[i - 1] + 0.5);
    if (joints[joints.length - 1] !== 4) joints.push(4);
    for (let k = 0; k < joints.length - 1; k++) { const z0 = joints[k] + 0.012, z1 = joints[k + 1] - 0.012; box('timber', bw - 0.035, 0.08, z1 - z0, x + jit(0.006), DECK - 0.04 + jit(0.008), (z0 + z1) / 2, jit(0.006), jit(0.004), jit(0.01), 0.018); }
  }
  // edge fascia boards
  for (const s of [-1, 1]) box('drift', 0.05, 0.16, 8, s * 1.27, 2.47, 0, 0, 0, 0, 0);
  // K braces on sides, V across
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const x = s * (PX + 0.18), zm = (PZ[k] + PZ[k + 1]) / 2;
    beam('timber', [x, 0.5, PZ[k] + 0.15], [x, 2.1, zm], 0.15, 0.08, 0);
    beam('timber', [x, 0.5, PZ[k + 1] - 0.15], [x, 2.1, zm], 0.15, 0.08, 0);
  }
  for (const z of PZ) for (const s of [-1, 1]) beam('wet', [s * PX, 0.3, z + 0.18], [0, 2.08, z + 0.18], 0.13, 0.08, 0);
  // rope posts on +x at mid-bays and boundaries' neighbours
  const RZ = [-8 / 3, 0, 8 / 3], RY = 3.3;
  for (const z of RZ) { box('drift', 0.14, 0.95, 0.14, 1.18, DECK + 0.45, z, 0, 0, 0, 0.035); box('drift', 0.18, 0.06, 0.18, 1.18, DECK + 0.94, z, 0, 0, 0, 0.02); }
  const rope = (z0, z1, mid) => {
    const pts = []; for (let i = 0; i <= 10; i++) { const z = z0 + (z1 - z0) * i / 10; const u = (z - mid) / (4 / 3); pts.push(new THREE.Vector3(1.18, RY - 0.3 * (1 - u * u), z)); }
    put('rope', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.035, 5, false));
  };
  rope(RZ[0], RZ[1], -4 / 3); rope(RZ[1], RZ[2], 4 / 3); rope(-4, RZ[0], -4); rope(RZ[2], 4, 4);
  for (const z of RZ) put('rope', new THREE.TorusGeometry(0.1, 0.035, 4, 8), T(1.18, RY, z, Math.PI / 2, 0, 0));
  // ladder hung from fascia on -x
  const lx = -1.4, lz = -1.33;
  for (const dz of [-0.26, 0.26]) box('timber', 0.08, 2.9, 0.08, lx, 0.3 + 1.45, lz + dz, 0, 0, 0, 0.02);
  for (let i = 0; i < 7; i++) box('drift', 0.06, 0.06, 0.6, lx, 0.55 + i * 0.36, lz, 0, 0, 0, 0);
  K.finish(g);
  return recentre(THREE, g);
}
