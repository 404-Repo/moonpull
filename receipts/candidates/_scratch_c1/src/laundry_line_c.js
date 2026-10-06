// laundry_line C: different reading. Cloths are FOLDED OVER the line: every garment is a front and a back
// layer joined by a rounded fold (a half tube) around the rope, so it has volume from the side and the back;
// the back layers are shorter. Round log posts with a short cross-arm at the top, rope lashed round the arm.
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 59);
  const { box, put, T, jit, rnd, log } = K;
  const fab = (k, c) => addMat(K, k, c, 0.92, 'fabric', { side: THREE.DoubleSide });
  fab('red', 0xb5402f); fab('blue', 0x3f6fa8); fab('white', 0xe9e4d6); fab('sheet', 0xe2d4b0); fab('yellow', 0xd9a63a); fab('green', 0x5f8a3a);
  const PX = 2.0, PH = 2.2, RY = 2.0, SAG = 0.3;
  for (const sx of [-1, 1]) {
    K.lathe('stone', [[0, 0], [0.22, 0], [0.24, 0.03], [0.21, 0.06], [0, 0.06]], 8, T(sx * PX, 0, 0));
    log('timber', [sx * PX, 0.04, 0], [sx * PX + jit(0.02), PH - 0.02, 0], 0.085, 8);
    K.lathe('timber', [[0, 0], [0.085, 0], [0.06, 0.04], [0, 0.05]], 8, T(sx * PX, PH - 0.05, 0));
    log('timber', [sx * PX, RY + 0.04, -0.2], [sx * PX, RY + 0.04, 0.2], 0.05, 6);
    put('rope', new THREE.TorusGeometry(0.1, 0.024, 4, 8), T(sx * PX, RY, 0, 0, Math.PI / 2, 0, 1, 1.2, 1));
  }
  const ropeY = (x) => { const t = (x + PX) / (2 * PX); return RY - SAG * 4 * t * (1 - t); };
  const pts = []; for (let i = 0; i <= 14; i++) { const x = -PX + 0.08 + (2 * PX - 0.16) * i / 14; pts.push([x, ropeY(x), 0]); }
  tube(K, 'rope', pts, 0.018, 4, 28);
  const slope = (x) => (ropeY(x + 0.05) - ropeY(x - 0.05)) / 0.1;
  // folded cloth: width w, front drop hf, back drop hb
  function folded(key, w, hf, hb, cx, wave, k) {
    const rz = Math.atan(slope(cx)) * 0.8;
    K.frame(T(cx, ropeY(cx), 0, 0, 0, rz), () => {
      put(key, new THREE.CylinderGeometry(0.03, 0.03, w, 6, 1, true, 0, Math.PI), T(0, 0, 0, 0, 0, Math.PI / 2));
      for (const [side, h] of [[1, hf], [-1, hb]]) {
        const geo = new THREE.PlaneGeometry(w, h, 4, 3); geo.translate(0, -h / 2, 0); const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = p.getX(i), d = -p.getY(i) / 0.6; p.setZ(i, side * (0.03 + 0.02 * d) + wave * Math.sin(x * k + side) * d); }
        geo.computeVertexNormals(); put(key, geo);
      }
    });
  }
  const peg = (x) => box('timber', 0.04, 0.11, 0.08, x, ropeY(x) + 0.02, 0, 0, 0, 0, 0.008);
  folded('red', 0.44, 0.48, 0.22, -1.45, 0.03, 13); peg(-1.62); peg(-1.28);
  // striped towel folded: stripes as stacked strips on the front, a blue back
  { const cx = -0.75; folded('blue', 0.46, 0.6, 0.3, cx, 0.03, 12); K.frame(T(cx, ropeY(cx), 0, 0, 0, Math.atan(slope(cx)) * 0.8), () => { for (let s = 0; s < 3; s++) { const y = -0.1 - s * 0.17; const geo = new THREE.PlaneGeometry(0.46, 0.07, 4, 1); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), d = -(p.getY(i) + y) / 0.6; p.setZ(i, 0.03 + 0.02 * d + 0.03 * Math.sin(x * 12 + 1) * d + 0.004); } geo.computeVertexNormals(); put('white', geo, T(0, y, 0)); } }); }
  peg(-0.95); peg(-0.55);
  folded('sheet', 0.62, 0.76, 0.4, 0.02, 0.05, 15); peg(-0.26); peg(0.3);
  folded('yellow', 0.48, 0.44, 0.22, 0.88, 0.03, 11); peg(0.7); peg(1.06);
  folded('green', 0.2, 0.28, 0.14, 1.55, 0.025, 15); peg(1.55);
  K.finish(g);
  return recentre(THREE, g);
}
