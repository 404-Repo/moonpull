// laundry_line A: primitives. Two square posts 4 m apart on cobble pads, rope wrapped round each post top,
// a sagging rope of short cylinders, and five garments as segmented planes bent in z (DoubleSide):
// red shirt (body + sleeve planes), blue/white striped towel (alternating strip planes), cream sheet,
// yellow jumper with long sleeves, small green rag. Box pegs at each hanging point.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 37);
  const { box, boxB, put, T, jit, rnd } = K;
  const fab = (k, c) => addMat(K, k, c, 0.92, 'fabric', { side: THREE.DoubleSide });
  fab('red', 0xb5402f); fab('blue', 0x3f6fa8); fab('white', 0xe9e4d6); fab('sheet', 0xe2d4b0); fab('yellow', 0xd9a63a); fab('green', 0x5f8a3a);
  const PX = 2.0, PH = 2.2, RY = 2.02, SAG = 0.3;
  for (const sx of [-1, 1]) {
    K.lathe('stone', [[0, 0], [0.22, 0], [0.24, 0.03], [0.21, 0.06], [0, 0.06]], 9, T(sx * PX, 0, 0));
    boxB('timber', 0.17, PH - 0.04, 0.17, sx * PX, 0.04, 0, jit(0.06), 0.035);
    for (const dy of [0, 0.05]) put('rope', new THREE.TorusGeometry(0.12, 0.022, 4, 8), T(sx * PX, RY + dy, 0, Math.PI / 2, 0, 0));
  }
  const ropeY = (x) => { const t = (x + PX) / (2 * PX); return RY - SAG * 4 * t * (1 - t); };
  const pts = []; for (let i = 0; i <= 16; i++) { const x = -PX + 0.1 + (2 * PX - 0.2) * i / 16; pts.push([x, ropeY(x), 0]); }
  strand(K, 'rope', pts, 0.018, 4);
  const slope = (x) => (ropeY(x + 0.05) - ropeY(x - 0.05)) / 0.1;
  // bent plane: w x h hanging from its top edge, local origin at top centre
  function cloth(key, w, h, cx, dy, nx, ny, wave, k, extra) {
    const geo = new THREE.PlaneGeometry(w, h, nx, ny); geo.translate(0, -h / 2, 0);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) + (extra ? extra.ox : 0), y = p.getY(i) + (extra ? extra.oy : 0); const d = -y / 0.6; p.setZ(i, wave * Math.sin(x * k + 0.7) * (0.3 + d) + 0.03 * d * d); }
    geo.computeVertexNormals();
    put(key, geo, T(cx + (extra ? extra.ox : 0), ropeY(cx) + dy + (extra ? extra.oy : 0), 0, 0, 0, Math.atan(slope(cx)) * 0.6 + (extra ? extra.rz : 0)));
  }
  const peg = (x) => box('timber', 0.04, 0.11, 0.045, x, ropeY(x) - 0.01, 0.02, 0, 0, 0, 0.008);
  // red shirt
  let x = -1.45; cloth('red', 0.42, 0.5, x, -0.06, 4, 4, 0.03, 14); cloth('red', 0.17, 0.15, x - 0.24, -0.08, 1, 1, 0.01, 10, { ox: 0, oy: 0, rz: -0.75 }); cloth('red', 0.17, 0.15, x + 0.24, -0.08, 1, 1, 0.01, 10, { ox: 0, oy: 0, rz: 0.75 });
  peg(x - 0.17); peg(x + 0.17);
  // striped towel: strips share one displacement field
  x = -0.75; { const w = 0.46, H = 0.62, n = 7; for (let s = 0; s < n; s++) { const h = H / n; const geo = new THREE.PlaneGeometry(w, h, 4, 1); geo.translate(0, -h / 2 - s * h, 0); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const xx = p.getX(i), d = -p.getY(i) / 0.6; p.setZ(i, 0.035 * Math.sin(xx * 12 + 0.3) * (0.3 + d) + 0.03 * d * d); } geo.computeVertexNormals(); put(s % 2 ? 'white' : 'blue', geo, T(x, ropeY(x) - 0.04, 0, 0, 0, Math.atan(slope(x)) * 0.6)); } }
  peg(x - 0.19); peg(x + 0.19);
  // cream sheet, larger and lower
  x = 0.0; cloth('sheet', 0.62, 0.78, x, -0.04, 6, 5, 0.05, 16); peg(x - 0.27); peg(x + 0.27);
  // yellow jumper
  x = 0.85; cloth('yellow', 0.42, 0.46, x, -0.06, 4, 4, 0.03, 12);
  for (const s of [-1, 1]) cloth('yellow', 0.13, 0.42, x + s * 0.27, -0.09, 1, 3, 0.015, 9, { ox: 0, oy: 0, rz: s * 0.18 });
  peg(x - 0.17); peg(x + 0.17);
  // green rag
  x = 1.55; cloth('green', 0.2, 0.3, x, -0.03, 2, 3, 0.025, 15, { ox: 0, oy: 0, rz: 0.12 }); peg(x);
  K.finish(g);
  return recentre(THREE, g);
}
