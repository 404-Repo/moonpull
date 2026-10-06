// sea_arch, candidate B: profiles. Each stratum is its own plan outline (a jittered rounded
// superellipse) extruded up by its thickness with a chunky bevel, so every layer is a soft
// pillow of stone with its own overhang. Legs pinch at the waist and flare at the sand;
// the bridge is a run of long pillows. Legs centred x = -6 and x = +6, passage open along Z.
export default function (THREE) {
  const g = new THREE.Group();
  const K = archKit(THREE, 4242);
  const { rnd, jit, T, put } = K;
  const BS = 0.22, BT = 0.16; // bevel size / thickness, subtracted from what is drawn
  function plan(a, b, n = 16, p = 3.2, j = 0.06, pinch = 0) {
    const sh = new THREE.Shape();
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      const r = Math.pow(Math.pow(Math.abs(c), p) + Math.pow(Math.abs(s), p), -1 / p) * (1 + jit(j));
      const x = c * r * (a - BS), y = s * r * (b - BS) * (1 - pinch * Math.exp(-c * c * 6));
      if (i === 0) sh.moveTo(x, y); else sh.lineTo(x, y);
    }
    sh.closePath(); return sh;
  }
  // stratum with base at y0, thickness h, centred (cx, cz), half sizes a (x) and b (z)
  function stratum(key, y0, h, cx, cz, a, b, ry = 0, opt = {}) {
    const geo = new THREE.ExtrudeGeometry(plan(a, b, opt.n, opt.p, opt.j, opt.pinch), { depth: Math.max(0.05, h - 2 * BT), bevelEnabled: true, bevelSize: BS, bevelThickness: BT, bevelSegments: 1, curveSegments: 1, steps: 1 });
    put(key, geo, T(cx, y0 + BT, cz, -Math.PI / 2, ry, 0));
  }
  const UNDER = 9.5;
  const key = (y, i) => (y < 3.0 ? 'wet' : (i % 2 ? 'sand2' : 'sand'));
  // leg half-width (x) over height: big foot, waist at ~5 m, widening into the haunch
  const halfX = (y) => y < 2.5 ? 2.55 - y * 0.18 : y < 6 ? 2.1 - (y - 2.5) * 0.04 : 1.96 + (y - 6) * 0.1;
  const halfZ = (y) => y < 2.5 ? 3.6 - y * 0.12 : 3.25 + jit(0.12);
  for (const sx of [-1, 1]) {
    let y = 0, i = 0;
    while (y < UNDER - 0.1) {
      let h = Math.min(1.3 + rnd() * 0.7, UNDER - y); if (UNDER - y - h < 0.8) h = UNDER - y;
      const a = halfX(y + h / 2) + jit(0.12), b = halfZ(y + h / 2);
      // the foot spreads outward more than into the channel
      const cx = sx * (6 + (a - 2) * 0.55) + jit(0.12);
      stratum(key(y, i), y, h, cx, jit(0.25), a, b, jit(0.12), { n: 18 });
      if (y > 3 && rnd() < 0.6) // a lumpy shelf stuck on the outer flank
        stratum('sand', y + h * 0.15, h * 0.7, sx * (7.5 + rnd() * 0.2), jit(1.6), 0.9, 1.3 + rnd() * 0.5, rnd() * 3, { n: 10, p: 2.4, j: 0.12 });
      y += h; i++;
    }
    // haunch where the leg grows into the bridge
    stratum('sand2', UNDER - 1.2, 1.25, sx * 4.4, 0, 1.3, 3.2, 0, { n: 12, p: 2.6 });
  }
  // the bridge: long pillows, the lowest one slightly narrower so the next overhangs it
  let y = UNDER, i = 0;
  for (const [h, ext, depth] of [[1.5, 7.9, 3.1], [1.4, 8.25, 3.4], [1.2, 7.9, 3.2]]) {
    stratum(key(y, i + 1), y, h, jit(0.3), jit(0.2), ext + jit(0.2), depth + jit(0.15), jit(0.03), { n: 22, p: 3.6, j: 0.04, pinch: 0.06 });
    y += h; i++;
  }
  // raised pillows on top, as in the reference, where the grass gathers
  stratum('sand', y - 0.12, 0.6, -5.0, -0.5, 2.3, 2.0, 0.3, { n: 12, p: 2.4 });
  stratum('sand2', y - 0.12, 0.5, 5.3, 0.6, 1.9, 1.8, -0.4, { n: 12, p: 2.4 });
  stratum('sand', y - 0.12, 0.4, 0.6, -0.9, 1.6, 1.3, 0.8, { n: 10, p: 2.2 });
  K.wobble(['sand', 'sand2', 'wet'], 0.12);
  const rock = K.meshes(g, ['sand', 'sand2', 'wet']);
  K.dress(g, rock, [{ x: -6.5, z: 0 }, { x: 6.5, z: 0 }]);
  K.meshes(g, ['cream', 'kelp', 'grass']);
  return K.recentre(g);
}
