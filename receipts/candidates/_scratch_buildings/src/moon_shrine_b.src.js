// moon_shrine B: profiles. Stepped base + plinth + tapered shaft + capital as one square (4-segment) lathe profile,
// moonstone ring by lathe, roof as an extruded sawtooth gable section (tile rows in the profile), extruded barge boards
// and extruded diamond-frame carvings.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 9);
  const { box, boxB, put, T, V, jit } = K;
  const flat = (geo) => { const n = geo.toNonIndexed(); n.deleteAttribute('normal'); n.computeVertexNormals(); return n; };
  const sq = (key, prof, y = 0) => { // radii given as half-side; lathe radius = half-side * sqrt2
    put(key, flat(new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r * Math.SQRT2, h)), 4)), T(0, y, 0, 0, Math.PI / 4, 0));
  };
  // whole stone column in one profile (half-sides)
  sq('stone', [[0, 0], [0.53, 0], [0.53, 0.13], [0.51, 0.16], [0.41, 0.16], [0.41, 0.29], [0.39, 0.31], [0.25, 0.31], [0.25, 0.6],
    [0.28, 0.6], [0.28, 0.65], [0.185, 0.66], [0.15, 1.18], [0.21, 1.2], [0.31, 1.21], [0.31, 1.33], [0.28, 1.35], [0, 1.35]]);
  // block seams on the steps: grooves as thin dark-ish offset blocks (same stone) breaking the silhouette
  for (const [half, y0, h, n] of [[0.535, 0, 0.13, 3], [0.415, 0.16, 0.13, 2]]) {
    const L = half * 2; for (let i = 1; i < n; i++) { const t = -half + L * i / n; for (const s of [-1, 1]) { boxB('stone', 0.03, h + 0.01, 0.03, t, y0, s * half, 0, 0); boxB('stone', 0.03, h + 0.01, 0.03, s * half, y0, t, 0, 0); } }
  }
  boxB('stone', 0.5, 0.08, 0.2, 0, 0, 0.62, 0, 0.03);
  for (const [x, z] of [[-0.42, 0.45], [0.38, -0.47], [0.47, 0.3]]) boxB('kelp', 0.15, 0.02, 0.1, x, 0.13, z, 0.3, 0);
  // diamond-frame carvings: extruded shape with a hole, on each plinth face, zig-zag band on capital faces
  const dia = new THREE.Shape([V(0, 0.11), V(0.11, 0), V(0, -0.11), V(-0.11, 0)].map((p) => new THREE.Vector2(p.x, p.y)));
  dia.holes.push(new THREE.Path([new THREE.Vector2(0, 0.065), new THREE.Vector2(-0.065, 0), new THREE.Vector2(0, -0.065), new THREE.Vector2(0.065, 0)]));
  const diaGeo = new THREE.ExtrudeGeometry(dia, { depth: 0.025, bevelEnabled: false });
  const zz = []; for (let i = 0; i <= 10; i++) zz.push([-0.27 + i * 0.054, i % 2 ? 0.03 : -0.03]);
  const zzShape = new THREE.Shape(zz.map(([x, y]) => new THREE.Vector2(x, y + 0.012)).concat(zz.slice().reverse().map(([x, y]) => new THREE.Vector2(x, y - 0.012))));
  const zzGeo = new THREE.ExtrudeGeometry(zzShape, { depth: 0.02, bevelEnabled: false });
  for (let f = 0; f < 4; f++) K.frame(T(0, 0, 0, 0, f * Math.PI / 2, 0), () => {
    put('stone', diaGeo, T(0, 0.455, 0.25));
    put('stone', new THREE.BoxGeometry(0.05, 0.05, 0.03), T(0, 0.455, 0.255, 0, 0, Math.PI / 4));
    put('stone', zzGeo, T(0, 1.27, 0.31));
  });
  // cloth band, strips, rope with shells
  const by = 0.92; const hw = 0.185 - (0.035 * (by - 0.66) / 0.52) + 0.015;
  for (let f = 0; f < 4; f++) K.frame(T(0, by, 0, 0, f * Math.PI / 2, 0), () => box('tile', hw * 2 + 0.04, 0.08, 0.04, 0, 0, hw, 0, 0, 0, 0));
  box('tile', 0.07, 0.36, 0.03, -0.1, by - 0.2, hw + 0.02, 0.06, 0, 0.06, 0);
  box('cream', 0.06, 0.3, 0.03, 0.0, by - 0.17, hw + 0.025, 0.06, 0, -0.04, 0);
  box('tile', 0.07, 0.3, 0.03, 0.1, by - 0.17, -hw - 0.02, -0.06, 0, 0.05, 0);
  box('cream', 0.06, 0.32, 0.03, hw + 0.02, by - 0.17, 0.05, 0, 0, 0.06, 0);
  const rope = new THREE.CatmullRomCurve3([V(-0.19, 0.86, 0.12), V(-0.1, 0.78, 0.22), V(0.06, 0.77, 0.22), V(0.19, 0.84, 0.12), V(0.2, 0.86, -0.1), V(0, 0.84, -0.21), V(-0.2, 0.86, -0.1)], true);
  put('rope', new THREE.TubeGeometry(rope, 18, 0.02, 4, true), null);
  const shellGeo = new THREE.LatheGeometry([[0, 0], [0.035, 0.005], [0.03, 0.02], [0, 0.025]].map(([x, y]) => new THREE.Vector2(x, y)), 5);
  for (const [x, y, z, rx, ry] of [[-0.12, 0.73, 0.235, 1.5, 0], [0, 0.71, 0.235, 1.5, 0], [0.1, 0.72, 0.235, 1.5, 0], [0.22, 0.78, 0, 1.5, Math.PI / 2], [0.05, 0.78, -0.23, 1.5, Math.PI], [-0.3, 0.31, 0.33, 0, 0], [0.32, 0.31, 0.36, 0, 1], [0.2, 0.13, 0.48, 0, 2]]) put('cream', shellGeo, T(x, y, z, rx, ry, 0));
  // moonstone in a lathed stone ring (axis along Z)
  const dy = 1.57;
  boxB('stone', 0.26, 0.1, 0.18, 0, 1.33, 0, 0, 0.03);
  put('stone', new THREE.LatheGeometry([[0.16, -0.07], [0.21, -0.075], [0.26, -0.04], [0.26, 0.04], [0.21, 0.075], [0.16, 0.07]].map(([x, y]) => new THREE.Vector2(x, y)), 14), T(0, dy, 0, Math.PI / 2, 0, 0));
  put('moonstone', new THREE.LatheGeometry([[0.001, -0.06], [0.12, -0.05], [0.165, 0], [0.12, 0.05], [0.001, 0.06]].map(([x, y]) => new THREE.Vector2(x, y)), 14), T(0, dy, 0, Math.PI / 2, 0, 0));
  // posts + side plates
  const px = 0.29, pz = 0.22, y1 = 1.6;
  for (const sx of [-1, 1]) { for (const sz of [-1, 1]) boxB('timber', 0.075, y1 - 1.35, 0.075, sx * px, 1.35, sz * pz, jit(0.05), 0.015); box('timber', 0.08, 0.08, 0.62, sx * px, y1 - 0.02, 0, 0, 0, 0, 0.015); }
  // roof: extruded sawtooth gable section (XY), ridge along Z
  const a = 0.7, ridgeY = 1.93, L = 0.62, rows = 4, zf = 0.44;
  const ca = Math.cos(a), sa = Math.sin(a);
  const pts = [];
  const along = (s, t, up) => [s * ca * t - s * sa * up * 0, ridgeY - sa * t + up]; // point at distance t down slope, raised up
  // top edge, right slope from ridge to eave with tile steps
  const top = [];
  for (let r = 0; r < rows; r++) { const t0 = L * r / rows, t1 = L * (r + 1) / rows; top.push([t0, 0.03], [t1 - 0.005, 0.085]); top.push([t1, 0.03]); }
  const right = top.map(([t, u]) => [ca * t + sa * u, ridgeY - sa * t + ca * u]);
  const under = (t) => [ca * t, ridgeY - sa * t - 0.03];
  pts.push([0, ridgeY + 0.06]); right.forEach((p) => pts.push(p)); pts.push(under(L)); pts.push([0, ridgeY - 0.03]); pts.push([-under(L)[0], under(L)[1]]);
  right.slice().reverse().forEach(([x, y]) => pts.push([-x, y]));
  K.extrude('tile', pts, zf * 2, T(0, 0, 0));
  // tile seams: shallow cuts suggested by thin raised ridges every tile width, alternating per row
  for (const s of [-1, 1]) for (let r = 0; r < rows; r++) for (let k = 0; k < 4; k++) {
    const t = L * (r + 0.55) / rows; const z = -zf + (k + 0.5 + (r % 2) * 0.5) * (2 * zf / 4.5);
    box('tile', 0.02, 0.05, 0.03, s * (ca * t + sa * 0.08), ridgeY - sa * t + ca * 0.08, z, 0, 0, -s * a, 0);
  }
  // barge boards: extruded thin profile following the gable with upturned tips
  const bb = [[0, ridgeY + 0.12], [ca * (L + 0.02), ridgeY - sa * (L + 0.02) + 0.1], [ca * L + 0.09, ridgeY - sa * L + 0.12], [ca * L + 0.06, ridgeY - sa * L + 0.02], [0, ridgeY + 0.02]];
  const bbFull = bb.concat(bb.slice(1, 4).reverse().map(([x, y]) => [-x, y]));
  for (const z of [zf + 0.025, -zf - 0.025]) K.extrude('timber', [bbFull[0], bbFull[1], bbFull[2], bbFull[3], [0, ridgeY + 0.02], [-bbFull[3][0], bbFull[3][1]], [-bbFull[2][0], bbFull[2][1]], [-bbFull[1][0], bbFull[1][1]]], 0.05, T(0, 0, z));
  box('timber', 0.1, 0.1, 2 * zf + 0.14, 0, ridgeY + 0.075, 0, 0, 0, Math.PI / 4, 0.02);
  K.finish(g);
  return recentre(THREE, g);
}
