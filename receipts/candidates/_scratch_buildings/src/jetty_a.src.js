// jetty A: primitives. Round log piles (wet below 1.6 m), cap beams, 3 stringers, 30 cross planks,
// X braces across and along, rope rail on +x posts (half-spans end at z=+-4 at the sag low point so copies tile), ladder on -x.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 21);
  const { box, beam, jit, put, T } = K;
  const PZ = [-8 / 3, 0, 8 / 3], PX = 1.12, DECK = 2.6;
  // piles
  for (const z of PZ) for (const s of [-1, 1]) {
    const x = s * PX, top = s > 0 ? 3.45 : 2.78;
    K.cyl('wet', 0.15, 0.16, 1.6, 8, x, 0.8, z, 0, jit(0.3), 0);
    K.cyl('timber', 0.14, 0.15, top - 1.6 - 0.04, 8, x, 1.6 + (top - 1.64) / 2, z, 0, jit(0.3), 0);
    K.cyl('timber', 0.11, 0.14, 0.05, 8, x, top - 0.02, z);
  }
  // cap beams across, stringers along
  for (const z of PZ) box('timber', 2.5, 0.2, 0.2, 0, 2.3, z, 0, 0, 0, 0.04);
  for (const x of [-0.95, 0, 0.95]) box('timber', 0.18, 0.18, 8, x, 2.41, 0, 0, 0, 0, 0);
  // planks
  const N = 29, pitch = 8 / N;
  for (let i = 0; i < N; i++) {
    const z = -4 + pitch * (i + 0.5), L = 2.42 + jit(0.06);
    box('timber', L, 0.09, pitch - 0.035, jit(0.03), DECK - 0.045 + jit(0.008), z, jit(0.01), jit(0.012), jit(0.01), 0.018);
  }
  // braces: across (X) at each pile pair, along each side between piles
  for (const z of PZ) {
    beam('wet', [-PX + 0.05, 0.35, z + 0.17], [PX - 0.05, 2.15, z + 0.17], 0.13, 0.08, 0);
    beam('wet', [PX - 0.05, 0.35, z - 0.17], [-PX + 0.05, 2.15, z - 0.17], 0.13, 0.08, 0);
  }
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const z0 = PZ[k], z1 = PZ[k + 1], x = s * (PX + 0.17);
    beam('timber', [x, 0.5, z0 + 0.1], [x, 2.15, z1 - 0.1], 0.14, 0.08, 0);
    beam('timber', [x, 2.15, z0 + 0.1], [x, 0.5, z1 - 0.1], 0.14, 0.08, 0);
  }
  // rope rail on +x: catenary halves so tile boundaries meet at the low point
  const RY = 3.3, SAG = 0.32, rx = PX;
  const rope = (z0, z1, mid) => {
    const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10, z = z0 + (z1 - z0) * t; const u = (z - mid) / (8 / 3 / 2); pts.push(new THREE.Vector3(rx, RY - SAG * (1 - u * u), z)); }
    put('rope', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.035, 5, false), null);
  };
  rope(PZ[0], PZ[1], -4 / 3); rope(PZ[1], PZ[2], 4 / 3);
  rope(-4, PZ[0], -4); rope(PZ[2], 4, 4);
  for (const z of PZ) put('rope', new THREE.TorusGeometry(0.15, 0.035, 4, 8), T(rx, RY, z, Math.PI / 2, 0, 0));
  // ladder on -x
  const lx = -PX - 0.2, lz = 1.33;
  for (const dz of [-0.25, 0.25]) beam('timber', [lx - 0.18, 0.35, lz + dz], [lx, DECK + 0.45, lz + dz], 0.07, 0.1, 0.02);
  for (let i = 0; i < 7; i++) { const t = (i + 0.6) / 7.5; box('drift', 0.07, 0.06, 0.6, lx - 0.18 + 0.18 * t - 0.03, 0.35 + (DECK + 0.1) * t, lz, 0, 0, 0, 0); }
  K.finish(g);
  return recentre(THREE, g);
}
