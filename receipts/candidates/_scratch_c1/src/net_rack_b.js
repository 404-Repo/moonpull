// net_rack B: profiles. Legs are an extruded hewn (irregular octagon) section swept along each leg, top
// bar a lathed pole with tapered ends. Net = flat cord ribbons laid in a draped surface (custom geometry,
// DoubleSide), folded over the bar: two separate nets, each with a long front fall and a short back fall.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 23);
  const { box, beam, put, T, jit, rnd } = K;
  addMat(K, 'net', 0xa58a5c, 0.95, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'netd', 0x7f6844, 0.95, 'fabric', { side: THREE.DoubleSide });
  addMat(K, 'cork', 0x9a5a32, 0.8, 'timber');
  addMat(K, 'fish', 0x8a9aa2, 0.5, null);
  const hewn = (w, d) => { const a = w / 2, b = d / 2, c = Math.min(a, b) * 0.35; return new THREE.Shape([[-a + c, -b], [a - c, -b], [a, -b + c], [a, b - c], [a - c, b], [-a + c, b], [-a, b - c], [-a, -b + c]].map((p) => new THREE.Vector2(p[0] + jit(0.006), p[1] + jit(0.006)))); };
  const sweep = (key, a, b, w, d) => beam(key, a, b, 0, 0, 0, 0, (L) => { const geo = new THREE.ExtrudeGeometry(hewn(w, d), { depth: L, bevelEnabled: false }); geo.translate(0, 0, -L / 2); geo.rotateX(-Math.PI / 2); return geo; });
  const FX = 1.45;
  for (const sx of [-1, 1]) {
    const x = sx * FX;
    sweep('timber', [x - 0.075, 0, -0.62], [x - 0.075, 1.86, 0.12], 0.15, 0.13);
    sweep('timber', [x + 0.075, 0, 0.62], [x + 0.075, 1.86, -0.12], 0.15, 0.13);
    sweep('drift', [x + sx * 0.18, 0.5, -0.55], [x + sx * 0.18, 0.6, 0.55], 0.07, 0.17);
    sweep('drift', [x - sx * 0.155, 1.15, -0.32], [x - sx * 0.155, 1.18, 0.32], 0.06, 0.14);
    for (const z of [-0.4, 0.4]) K.cyl('iron', 0.025, 0.025, 0.04, 6, x + sx * 0.23, 0.55 + z * 0.09, z, 0, 0, Math.PI / 2);
  }
  K.lathe('timber', [[0, -1.76], [0.06, -1.76], [0.085, -1.66], [0.09, 0], [0.085, 1.66], [0.06, 1.76], [0, 1.76]], 8, T(0, 1.665, 0, 0, 0, Math.PI / 2));
  sweep('timber', [-1.4, 0.48, -0.47], [1.4, 0.5, -0.47], 0.1, 0.13);
  // ribbon net builder over a surface P(u,v)
  function net(key, P, NU, NV, w) {
    const pos = [];
    const add = (pa, pb) => {
      const A = new THREE.Vector3(...pa), B = new THREE.Vector3(...pb);
      const d = B.clone().sub(A); const n = new THREE.Vector3(0, 0, 1);
      const s = d.clone().cross(n).normalize().multiplyScalar(w / 2);
      const a0 = A.clone().sub(s), a1 = A.clone().add(s), b0 = B.clone().sub(s), b1 = B.clone().add(s);
      pos.push(...a0.toArray(), ...b0.toArray(), ...b1.toArray(), ...a0.toArray(), ...b1.toArray(), ...a1.toArray());
    };
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
      // diamond cell: centre-of-edge points
      const pl = P(i / NU, (j + 0.5) / NV), pr = P((i + 1) / NU, (j + 0.5) / NV), pt = P((i + 0.5) / NU, j / NV), pb = P((i + 0.5) / NU, (j + 1) / NV);
      add(pl, pt); add(pt, pr); add(pr, pb); add(pb, pl);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    put(key, geo);
  }
  const corkGeo = new THREE.LatheGeometry([[0, -0.05], [0.042, -0.03], [0.042, 0.03], [0, 0.05]].map((p) => new THREE.Vector2(p[0], p[1])), 6);
  function fall(key, x0, x1, top, len, zc, side, wav, hemCork) {
    const P = (u, v) => {
      const x = x0 + (x1 - x0) * u + 0.05 * Math.sin(v * 4 + u * 11) * v;
      const L = len(u);
      return [x, top(u) - L * v, zc + side * (0.02 + 0.09 * v * v + wav * Math.sin(u * 19 + 1) * v)];
    };
    const NU = Math.max(3, Math.round((x1 - x0) / 0.19)), NV = 6;
    net(key, P, NU, NV, 0.03);
    const hem = []; for (let i = 0; i <= NU; i++) hem.push(P(i / NU, 1));
    strand(K, "rope", hem, 0.016, 3);
    if (hemCork) for (let i = 0; i <= NU; i += 2) { const p = P(i / NU, 1); put('cork', corkGeo, T(p[0], p[1] - 0.03, p[2] + side * 0.02)); }
    return P;
  }
  // left net: long front fall, mid swag on its right edge
  const PL = fall('net', -1.2, -0.05, (u) => 1.62 - 0.35 * Math.max(0, u - 0.7) / 0.3, (u) => 1.1 - 0.25 * u + 0.08 * Math.sin(u * 8), 0.1, 1, 0.07, true);
  fall('net', -1.2, -0.35, () => 1.66, (u) => 0.35 + 0.06 * Math.sin(u * 9), -0.1, -1, 0.03, false);
  // right net: hangs from the right, its left part a sagging swag
  const PR = fall('netd', -0.15, 1.25, (u) => 1.62 - 0.6 * Math.max(0, 1 - u / 0.4) ** 2, (u) => 0.55 + 0.6 * Math.min(1, u / 0.45) + 0.05 * Math.sin(u * 10), 0.13, 1, 0.08, true);
  fall('netd', 0.45, 1.25, () => 1.66, (u) => 0.45 + 0.05 * Math.sin(u * 7), -0.1, -1, 0.03, true);
  for (const P of [PL, PR]) for (const v of [0.35, 0.7]) for (const u of [0, 1]) { const p = P(u, v); put('cork', corkGeo, T(p[0], p[1], p[2] + 0.02)); }
  // basket with fish + coiled rope
  K.lathe('rope', [[0.0, 0], [0.2, 0.0], [0.26, 0.08], [0.28, 0.24], [0.3, 0.26], [0.27, 0.26], [0.25, 0.1], [0, 0.04]], 10, T(0.4, 0, 0.6));
  for (const y of [0.09, 0.17]) put('timber', new THREE.TorusGeometry(0.275, 0.015, 3, 12), T(0.4, y, 0.6, Math.PI / 2));
  for (let i = 0; i < 6; i++) put('fish', new THREE.SphereGeometry(0.05, 5, 3), T(0.4 + jit(0.13), 0.27 + rnd() * 0.06, 0.6 + jit(0.12), jit(0.6), rnd() * 3, 0.7 + jit(0.3), 1, 3.2, 1));
  put('rope', new THREE.TorusGeometry(0.16, 0.025, 4, 12), T(0.82, 0.03, 0.66, Math.PI / 2));
  K.finish(g);
  return recentre(THREE, g);
}
