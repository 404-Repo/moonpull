// laundry_line B: profiles. Garments are ShapeGeometry silhouettes (T-shirt with sleeves and collar dip,
// long-sleeved jumper, towel with stripe bands cut as separate shapes, sheet with a ragged hem), each
// subdivided and bent in z; rope is a TubeGeometry along the catenary; posts are extruded hewn sections
// with bevelled tops, rope lashings as torus pairs, cobble pads of a few flat stones.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 53);
  const { box, put, T, jit, rnd } = K;
  const fab = (k, c) => addMat(K, k, c, 0.92, 'fabric', { side: THREE.DoubleSide });
  fab('red', 0xb5402f); fab('blue', 0x3f6fa8); fab('white', 0xe9e4d6); fab('sheet', 0xe2d4b0); fab('yellow', 0xd9a63a); fab('green', 0x5f8a3a);
  const PX = 2.0, PH = 2.2, RY = 2.02, SAG = 0.32;
  const hewn = new THREE.Shape([[-0.06, -0.09], [0.06, -0.09], [0.09, -0.06], [0.09, 0.06], [0.06, 0.09], [-0.06, 0.09], [-0.09, 0.06], [-0.09, -0.06]].map((p) => new THREE.Vector2(p[0], p[1])));
  for (const sx of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(hewn, { depth: PH - 0.06, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.03, bevelSegments: 1 }); geo.rotateX(-Math.PI / 2);
    put('timber', geo, T(sx * PX, 0.03, 0, 0, jit(0.2), 0));
    for (let k = 0; k < 5; k++) put('stone', new THREE.CylinderGeometry(0.1, 0.11, 0.05, 6), T(sx * PX + Math.cos(k * 1.26 + 0.3) * 0.17, 0.025, Math.sin(k * 1.26 + 0.3) * 0.17, 0, rnd(), 0));
    for (const dy of [-0.02, 0.04]) put('rope', new THREE.TorusGeometry(0.12, 0.024, 4, 9), T(sx * PX, RY + dy, 0, Math.PI / 2, 0, 0));
  }
  const ropeY = (x) => { const t = (x + PX) / (2 * PX); return RY - SAG * 4 * t * (1 - t); };
  const pts = []; for (let i = 0; i <= 12; i++) { const x = -PX + 0.1 + (2 * PX - 0.2) * i / 12; pts.push([x, ropeY(x), 0]); }
  tube(K, 'rope', pts, 0.018, 4, 30);
  const slope = (x) => (ropeY(x + 0.05) - ropeY(x - 0.05)) / 0.1;
  // silhouette -> ShapeGeometry, subdivided via a fine outline, then bent
  function garment(key, outline, cx, dy, wave, k, rz = 0) {
    const sh = new THREE.Shape(outline.map((p) => new THREE.Vector2(p[0], p[1])));
    const geo = new THREE.ShapeGeometry(sh, 3); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), d = -p.getY(i) / 0.6; p.setZ(i, wave * Math.sin(x * k + 0.5) * (0.25 + d) + 0.035 * d * d); }
    geo.computeVertexNormals(); put(key, geo, T(cx, ropeY(cx) + dy, 0, 0, 0, Math.atan(slope(cx)) * 0.6 + rz, GS, GS, GS));
  }
  const GS = 1.25;
  const peg = (x) => box('timber', 0.04, 0.11, 0.045, x, ropeY(x) - 0.01, 0.02, 0, 0, 0, 0.008);
  const dense = (pts, n = 3) => { const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } return out; };
  // T-shirt
  let x = -1.42;
  garment('red', dense([[-0.12, 0], [-0.05, -0.05], [0.05, -0.05], [0.12, 0], [0.2, -0.01], [0.32, -0.14], [0.24, -0.22], [0.2, -0.17], [0.21, -0.5], [0.08, -0.47], [-0.04, -0.52], [-0.2, -0.49], [-0.2, -0.17], [-0.24, -0.22], [-0.32, -0.14], [-0.2, -0.01]]), x, -0.04, 0.03, 13);
  peg(x - 0.19); peg(x + 0.19);
  // striped towel: bands as separate shapes sharing one bend field
  x = -0.66; for (let s = 0; s < 7; s++) { const y0 = -s * 0.09, y1 = y0 - 0.09; garment(s % 2 ? 'white' : 'blue', dense([[-0.23, y0], [0.23, y0], [0.23 + (s === 6 ? 0.01 : 0), y1], [-0.23, y1]], 4), x, -0.04, 0.035, 12); }
  peg(x - 0.24); peg(x + 0.24);
  // sheet with ragged hem
  x = 0.12; { const o = [[-0.31, 0], [0.31, 0], [0.32, -0.74]]; for (let i = 1; i < 8; i++) o.push([0.32 - i * 0.08, -0.74 - (i % 2 ? 0.05 : 0) - 0.03 * Math.sin(i)]); o.push([-0.31, -0.7]); garment('sheet', dense(o, 3), x, -0.03, 0.05, 15); }
  peg(x - 0.34); peg(x + 0.34);
  // jumper with long sleeves hanging down
  x = 0.98;
  garment('yellow', dense([[-0.1, 0], [0.1, 0], [0.2, -0.01], [0.33, -0.08], [0.33, -0.44], [0.25, -0.44], [0.24, -0.14], [0.2, -0.16], [0.2, -0.46], [-0.2, -0.46], [-0.2, -0.16], [-0.24, -0.14], [-0.25, -0.44], [-0.33, -0.44], [-0.33, -0.08], [-0.2, -0.01]]), x, -0.05, 0.03, 11);
  peg(x - 0.2); peg(x + 0.2);
  x = 1.62; garment('green', dense([[-0.09, 0], [0.09, 0], [0.11, -0.28], [0.0, -0.32], [-0.08, -0.27]]), x, -0.03, 0.025, 15, 0.12); peg(x);
  K.finish(g);
  return recentre(THREE, g);
}
