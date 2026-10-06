// jetty B: profiles. Lathe logs with rounded weathered tops, planks extruded from a bevelled cross-section,
// ladder extruded from one outline with rung holes, rope via TubeGeometry. Tiles at 8 m along Z.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 22);
  const { box, beam, jit, put, T } = K;
  const PZ = [-8 / 3, 0, 8 / 3], PX = 1.13, DECK = 2.6;
  const logGeo = (r, h) => new THREE.LatheGeometry([[0, 0], [r * 1.06, 0], [r, h * 0.5], [r * 0.97, h - 0.06], [r * 0.7, h - 0.01], [0, h]].map((p) => new THREE.Vector2(p[0], p[1])), 8);
  const wetGeo = (r, h) => new THREE.LatheGeometry([[0, 0], [r * 1.1, 0], [r * 1.05, h]].map((p) => new THREE.Vector2(p[0], p[1])), 8);
  for (const z of PZ) for (const s of [-1, 1]) {
    const x = s * PX, top = s > 0 ? 3.45 : 2.8;
    put('wet', wetGeo(0.15, 1.5), T(x, 0, z, 0, jit(1), 0));
    put('timber', logGeo(0.145, top - 1.5), T(x, 1.5, z, 0, jit(1), 0));
    put('rope', new THREE.TorusGeometry(0.155, 0.03, 3, 9), T(x, 2.3, z, Math.PI / 2, 0, 0));
  }
  // plank cross-section, chamfered top edges; extruded along X
  const plank = (w, t) => { const c = 0.02; return new THREE.Shape([[-w / 2, -t / 2], [w / 2, -t / 2], [w / 2, t / 2 - c], [w / 2 - c, t / 2], [-w / 2 + c, t / 2], [-w / 2, t / 2 - c]].map((p) => new THREE.Vector2(p[0], p[1]))); };
  const ex = (shape, L) => { const g2 = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false, curveSegments: 1 }); g2.translate(0, 0, -L / 2); return g2; };
  const N = 29, pitch = 8 / N;
  for (let i = 0; i < N; i++) {
    const z = -4 + pitch * (i + 0.5), w = pitch - 0.035;
    // shape XY = (z-width, thickness); extrude Z then rotate so extrusion runs along X
    put('timber', ex(plank(w, 0.09), 2.44 + jit(0.06)), T(jit(0.03), DECK - 0.045 + jit(0.01), z, jit(0.012), Math.PI / 2, jit(0.01)));
  }
  // cap beams + stringers (extruded chamfered squares)
  const sq = (a) => plank(a, a);
  for (const z of PZ) put('timber', ex(sq(0.2), 2.55), T(0, 2.3, z, 0, Math.PI / 2, 0));
  for (const x of [-0.95, 0, 0.95]) put('timber', ex(sq(0.17), 8), T(x, 2.415, 0));
  // braces
  for (const z of PZ) {
    beam('wet', [-PX, 0.4, z + 0.17], [PX, 2.15, z + 0.17], 0.13, 0.08, 0);
    beam('wet', [PX, 0.4, z - 0.17], [-PX, 2.15, z - 0.17], 0.13, 0.08, 0);
  }
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const z0 = PZ[k], z1 = PZ[k + 1], x = s * (PX + 0.17);
    beam('timber', [x, 0.55, z0 + 0.12], [x, 2.15, z1 - 0.12], 0.14, 0.08, 0);
    beam('timber', [x, 2.15, z0 + 0.12], [x, 0.55, z1 - 0.12], 0.14, 0.08, 0);
  }
  // rope: catenary halves meeting at tile boundary low points
  const RY = 3.28, SAG = 0.34;
  const rope = (z0, z1, mid) => {
    const pts = []; for (let i = 0; i <= 10; i++) { const z = z0 + (z1 - z0) * i / 10; const u = (z - mid) / (4 / 3); pts.push(new THREE.Vector3(PX, RY - SAG * (1 - u * u), z)); }
    put('rope', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.035, 5, false));
  };
  rope(PZ[0], PZ[1], -4 / 3); rope(PZ[1], PZ[2], 4 / 3); rope(-4, PZ[0], -4); rope(PZ[2], 4, 4);
  for (const z of PZ) put('rope', new THREE.TorusGeometry(0.15, 0.04, 4, 9), T(PX, RY, z, Math.PI / 2, 0, 0));
  // ladder: one outline with rung holes, extruded 0.07, leaning on -x side
  const LH = 2.9, LW = 0.6, rw = 0.08;
  const sh = new THREE.Shape([[-LW / 2, 0], [LW / 2, 0], [LW / 2, LH], [-LW / 2, LH]].map((p) => new THREE.Vector2(p[0], p[1])));
  for (let i = 0; i < 7; i++) { const y0 = 0.25 + i * 0.37, y1 = y0 + 0.29; sh.holes.push(new THREE.Path([[-LW / 2 + rw, y0], [-LW / 2 + rw, y1], [LW / 2 - rw, y1], [LW / 2 - rw, y0]].map((p) => new THREE.Vector2(p[0], p[1])))); }
  const lg = new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false, curveSegments: 1 });
  lg.translate(0, 0, -0.035);
  // shape plane XY: x across ladder -> world Z, y up the ladder; lean top toward deck (+x)
  put('drift', lg, T(-PX - 0.45, 0.25, 1.33, 0.13, Math.PI / 2, 0));
  K.finish(g);
  return recentre(THREE, g);
}
