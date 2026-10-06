// sea_arch, candidate A: primitives. Every stratum is a run of chamfered blocks, stacked with
// offsets and slight yaw so the layers step in and out as overhanging ledges; a smooth position
// noise then breaks the ruler edges. Legs centred x = -6 and x = +6, passage open along Z.
export default function (THREE) {
  const g = new THREE.Group();
  const K = archKit(THREE, 1709);
  const { rnd, jit, T, put, cboxGeo } = K;
  const block = (key, w, h, d, x, y, z, ry = 0, c = 0.22) => put(key, cboxGeo(w, h, d, c), T(x, y + h / 2, z, 0, ry, 0));
  const UNDER = 9.5, TOP = 14;
  const key = (y, i) => (y < 3.1 ? 'wet' : (i % 2 ? 'sand2' : 'sand'));
  // ---- legs: strata from the sand up to the bridge
  for (const sx of [-1, 1]) {
    let y = 0, i = 0;
    while (y < UNDER - 0.05) {
      const h = Math.min(0.75 + rnd() * 0.5, UNDER - y);
      const flare = y < 2.2 ? (2.2 - y) * 0.35 : 0;            // bulbous foot, mostly outward
      const w = 4.0 + flare * 1.1 + jit(0.25), d = 6.8 + flare * 0.7 + jit(0.35);
      const cx = sx * (6 + flare * 0.5) + jit(0.15);           // inner face stays near |x| = 4
      const k = key(y, i);
      if (rnd() < 0.55) { // split front/back into two blocks with a crack
        const f = 0.4 + rnd() * 0.2;
        block(k, w + jit(0.2), h, d * f - 0.08, cx + jit(0.12), y, -d / 2 + (d * f) / 2, jit(0.05));
        block(k, w + jit(0.2), h * (0.9 + rnd() * 0.1), d * (1 - f) - 0.08, cx + jit(0.12), y, d / 2 - (d * (1 - f)) / 2, jit(0.05));
      } else block(k, w, h, d, cx, y, jit(0.2), jit(0.06));
      y += h; i++;
    }
    // shoulder ledges on the outer flank, as in the reference
    block('sand', 1.4, 1.3, 4.2, sx * 7.9, 5.6 + rnd() * 0.6, 1.2 * sx, jit(0.1), 0.3);
    block('sand2', 1.2, 1.0, 3.2, sx * 7.8, 4.7, -1.4 * sx, jit(0.1), 0.25);
    // haunch blocks where leg meets bridge: rounds the inner corner of the opening
    block('sand', 1.1, 1.0, 6.0, sx * 3.75, UNDER - 0.85, 0, 0, 0.35);
    block('sand2', 0.7, 0.6, 5.4, sx * 3.25, UNDER - 0.45, 0, 0, 0.25);
  }
  // ---- bridge: long strata spanning x, each layer 2-3 blocks with staggered seams
  let y = UNDER, i = 0;
  const lay = [0.95, 0.8, 0.85, 0.75, 0.6];
  for (const h of lay) {
    const n = 2 + (i % 2); const W = 16.2 + jit(0.6); const x0 = -W / 2 + jit(0.3);
    let acc = x0; const cuts = [];
    for (let j = 1; j < n; j++) cuts.push(x0 + (W * j) / n + jit(1.2));
    cuts.push(x0 + W);
    let prev = x0;
    for (const cx of cuts) {
      const w = cx - prev - 0.06;
      block(key(y, i), w, h, 6.6 + jit(0.5) - (i === lay.length - 1 ? 1.2 : 0), prev + w / 2, y, jit(0.25), jit(0.04), 0.26);
      prev = cx;
    }
    y += h; i++;
  }
  // raised slabs on top, where grass gathers
  block('sand', 4.2, 0.55, 3.6, -5.2, y - 0.1, -0.6, 0.15, 0.22);
  block('sand2', 3.0, 0.5, 2.8, 5.6, y - 0.12, 0.9, -0.2, 0.2);
  block('sand', 2.4, 0.4, 2.2, 0.8, y - 0.15, -1.2, 0.3, 0.18);
  K.wobble(['sand', 'sand2', 'wet'], 0.14);
  const rock = K.meshes(g, ['sand', 'sand2', 'wet']);
  K.dress(g, rock, [{ x: -6.3, z: 0 }, { x: 6.3, z: 0 }]);
  K.meshes(g, ['cream', 'kelp', 'grass']);
  return K.recentre(g);
}
