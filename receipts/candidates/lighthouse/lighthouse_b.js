// lighthouse B: profiles. The tower is one LatheGeometry with a storybook flared foot and a gentle
// curved taper; the gallery corbel is an ogee lathe; plinth stones are bevelled extruded annular
// sectors; door and window frames are extruded arched shapes with holes; the dome is a lathed bell.
// 24 m tall, base 6 m, door facing +Z. Lamp = child Mesh 'beacon', material 'beacon' (emissive 0xffe2a0).
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
    if (name) m.name = name; return m;
  };
  const plaster = M(0xe9d6b8, 'plaster', 0.9);
  const red = M(0xb5543a, 'plaster', 0.88);
  const stone = M(0x6c6a64, 'stone', 0.9);
  const stoneL = M(0x85827a, 'stone', 0.9);
  const timber = M(0x7b5a3e, 'timber', 0.85);
  const doorWood = M(0x6a4a30, 'timber', 0.8);
  const pane = M(0x2a3238, null, 0.4);
  const iron = M(0x3a3d40, 'metal', 0.6, { metalness: 0.4 });
  const bronze = M(0x6b5a4c, 'metal', 0.55, { metalness: 0.45 });
  const glass = M(0xcfe6f0, null, 0.15, { transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
  const beaconMat = M(0x201e1c, null, 0.7, { emissive: 0xffe2a0, emissiveIntensity: 1.2 }); // dark base: surfaces.js leaves it untextured, and it reads as an unlit lens at emissiveIntensity 0
  beaconMat.name = 'beacon';

  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = g) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const lathe = (pts, segs, mat, y = 0) => add(new THREE.LatheGeometry(pts.map(([r, h]) => V2(r, h)), segs), mat, 0, y, 0);
  let seed = 23; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // ---- tower profile radius: flared foot, curved taper
  const H0 = 0.3, H1 = 18.6;
  const R = (y) => { const t = (y - H0) / (H1 - H0); return 1.98 + 0.72 * Math.pow(1 - t, 1.25) + 0.2 * Math.exp(-(y - H0) * 1.6); };
  const prof = (y0, y1, n, grow = 0) => { const p = []; for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * i / n; p.push([R(y) + grow, y]); } return p; };
  lathe([[0, H0], ...prof(H0, 12.2, 8)], 32, plaster);
  lathe([[R(12.2), 12.2], [R(12.2) + 0.07, 12.25], ...prof(12.32, 13.88, 2, 0.07), [R(14.0) + 0.07, 13.95], [R(14.0), 14.0]], 32, red);
  lathe([...prof(14.0, H1, 4), [R(H1) + 0.15, H1 + 0.05]], 32, plaster);

  // ---- plinth: bevelled annular-sector stones, two courses, door gap at +Z
  const sector = (r0, r1, a0, a1, h) => {
    const s = new THREE.Shape(), n = 3, b = 0.06;
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; const p = [Math.cos(a) * (r1 - b), Math.sin(a) * (r1 - b)]; i ? s.lineTo(...p) : s.moveTo(...p); }
    for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * i / n; s.lineTo(Math.cos(a) * (r0 + b), Math.sin(a) * (r0 + b)); }
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: h - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 1, curveSegments: 1 });
    geo.translate(0, 0, b); geo.rotateX(-Math.PI / 2); geo.computeVertexNormals(); return geo;
  };
  // after rotateX(-PI/2): shape (x, y) -> world (x, -z). So shape angle a points at world (cos a, -sin a).
  const front = -Math.PI / 2; // shape angle that faces world +Z
  for (let course = 0; course < 2; course++) {
    const n = 14, off = course * 0.5, gap = 0.32;
    for (let i = 0; i < n; i++) {
      const a0 = ((i + off) / n) * Math.PI * 2 + 0.03, a1 = ((i + off + 1) / n) * Math.PI * 2 - 0.03;
      const mid = Math.atan2(Math.sin((a0 + a1) / 2 - front), Math.cos((a0 + a1) / 2 - front));
      if (Math.abs(mid) < gap + 0.2) continue;
      const h = 0.52 + rnd() * 0.12;
      add(sector(2.45 - course * 0.1, 3.0 - course * 0.1 + rnd() * 0.06, a0, a1, h), rnd() > 0.5 ? stone : stoneL, 0, course * 0.54, 0);
    }
  }

  // ---- door: arched frame with hole (stone surround), timber door, plank grooves
  const arch = (w, hs, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, hs); s.absarc(0, hs, w / 2, 0, Math.PI, false); s.closePath(); return s; };
  const dz = R(H0) - 0.04;
  const sur = arch(1.75, 1.55); sur.holes.push(arch(1.0, 1.5));
  add(new THREE.ExtrudeGeometry(sur, { depth: 0.38, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 1, curveSegments: 10 }), stone, 0, 0.06, dz);
  // keystone + voussoir joints as proud blocks
  for (let k = 0; k <= 4; k++) {
    const a = Math.PI * (0.1 + 0.8 * k / 4);
    const geo = new THREE.BoxGeometry(0.06, 0.4, 0.45);
    add(geo, stoneL, Math.cos(a) * 0.68, 1.61 + Math.sin(a) * 0.68, dz + 0.24, 0, 0, a - Math.PI / 2);
  }
  add(new THREE.ExtrudeGeometry(arch(1.0, 1.5), { depth: 0.1, bevelEnabled: false, curveSegments: 10 }), doorWood, 0, 0.06, dz + 0.06);
  for (const x of [-0.25, 0, 0.25]) add(new THREE.BoxGeometry(0.05, 1.55, 0.04), timber, x, 0.85, dz + 0.17);
  for (const y of [0.5, 1.3]) add(new THREE.BoxGeometry(0.92, 0.08, 0.05), iron, 0, y, dz + 0.19);
  add(new THREE.SphereGeometry(0.05, 8, 6), iron, 0.32, 0.95, dz + 0.22);
  add(new THREE.BoxGeometry(1.6, 0.12, 0.5), stone, 0, 0.06, dz + 0.4);

  // ---- windows: extruded frame with hole, recessed pane, sill
  const rect = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.closePath(); return s; };
  const win = (y, th, w = 0.6, h = 0.9) => {
    const r = R(y);
    const f = new THREE.Group(); f.position.set(Math.sin(th) * r, y, Math.cos(th) * r); f.rotation.y = th; g.add(f);
    const fr = rect(w + 0.2, h + 0.2); fr.holes.push(rect(w, h));
    add(new THREE.ExtrudeGeometry(fr, { depth: 0.12, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 1 }), timber, 0, 0, -0.06, 0, 0, 0, f);
    add(new THREE.BoxGeometry(w + 0.02, h + 0.02, 0.3), pane, 0, 0, -0.13, 0, 0, 0, f);
    add(new THREE.BoxGeometry(0.05, h, 0.06), timber, 0, 0, -0.04, 0, 0, 0, f);
    add(new THREE.BoxGeometry(w, 0.05, 0.06), timber, 0, 0, -0.04, 0, 0, 0, f);
    add(new THREE.BoxGeometry(w + 0.36, 0.1, 0.26), timber, 0, -h / 2 - 0.12, 0.06, 0, 0, 0, f);
  };
  win(5.2, 0); win(9.0, 0); win(13.1, 0, 0.55, 0.8); win(16.4, 0, 0.5, 0.75);
  win(7.0, Math.PI); win(14.9, Math.PI, 0.5, 0.75);
  win(11.0, Math.PI / 2, 0.55, 0.8); win(3.4, -Math.PI / 2, 0.55, 0.8); win(15.8, -Math.PI / 2, 0.5, 0.75);

  // ---- gallery: ogee corbel lathe + scalloped bracket blocks + deck
  const rt = R(H1);
  lathe([[rt - 0.05, H1 - 1.1], [rt + 0.05, H1 - 0.9], [rt + 0.1, H1 - 0.7], [rt + 0.25, H1 - 0.4], [rt + 0.5, H1 - 0.2], [2.6, H1 + 0.05],
    [2.62, H1 + 0.45], [2.4, H1 + 0.5], [0, H1 + 0.5]], 32, plaster);
  for (let i = 0; i < 16; i++) {
    const th = (i / 16) * Math.PI * 2 + Math.PI / 16;
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, 0.9); s.lineTo(0.55, 0.9); s.quadraticCurveTo(0.1, 0.6, 0.0, 0.0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: false, curveSegments: 4 });
    geo.translate(0, 0, -0.11);
    const piv = new THREE.Group(); piv.rotation.y = th - Math.PI / 2; g.add(piv);
    add(geo, plaster, rt - 0.02, H1 - 1.0, 0, 0, 0, 0, piv);
  }
  const DECK = H1 + 0.5;
  add(new THREE.CylinderGeometry(2.66, 2.66, 0.08, 32), stone, 0, DECK + 0.04, 0);
  // railing: rails swept along a circle (extrudePath), balusters
  const RR = 2.5;
  const circ = new THREE.CatmullRomCurve3(Array.from({ length: 24 }, (_, i) => new THREE.Vector3(Math.cos(i / 24 * Math.PI * 2) * RR, 0, Math.sin(i / 24 * Math.PI * 2) * RR)), true);
  for (const [y, r] of [[1.05, 0.055], [0.6, 0.03], [0.15, 0.035]])
    add(new THREE.TubeGeometry(circ, 40, r, 4, true), iron, 0, DECK + y, 0);
  for (let i = 0; i < 32; i++) {
    const th = (i / 32) * Math.PI * 2, big = i % 4 === 0;
    add(new THREE.CylinderGeometry(big ? 0.06 : 0.035, big ? 0.07 : 0.045, big ? 1.12 : 1.05, 6), iron, Math.sin(th) * RR, DECK + 0.55, Math.cos(th) * RR);
    if (big) add(new THREE.SphereGeometry(0.08, 8, 6), iron, Math.sin(th) * RR, DECK + 1.13, Math.cos(th) * RR);
    else { // scroll between posts
      const t2 = th + Math.PI / 32;
      add(new THREE.TorusGeometry(0.11, 0.018, 3, 8), iron, Math.sin(t2) * RR, DECK + 0.38, Math.cos(t2) * RR, 0, t2 + Math.PI / 2, 0);
    }
  }

  // ---- lantern room: lathed plinth drum, glazing, lathed bell dome
  const LY = DECK + 0.08;
  lathe([[0, LY], [1.48, LY], [1.42, LY + 0.15], [1.38, LY + 0.85], [1.52, LY + 0.92], [1.52, LY + 1.02], [0, LY + 1.02]], 24, plaster);
  const GL0 = LY + 1.02, GH = 1.75;
  add(new THREE.CylinderGeometry(1.24, 1.24, GH, 16, 1, true), glass, 0, GL0 + GH / 2, 0);
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2 + Math.PI / 8;
    add(new THREE.BoxGeometry(0.1, GH, 0.1), iron, Math.sin(th) * 1.26, GL0 + GH / 2, Math.cos(th) * 1.26, 0, th, 0);
  }
  add(new THREE.TorusGeometry(1.26, 0.04, 4, 24), iron, 0, GL0 + GH * 0.55, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.22, 0.3, 0.45, 10), iron, 0, GL0 + 0.22, 0);
  const lens = new THREE.LatheGeometry([V2(0, 0), V2(0.32, 0.02), V2(0.46, 0.25), V2(0.5, 0.55), V2(0.46, 0.85), V2(0.32, 1.08), V2(0, 1.1)], 14);
  const beacon = add(lens, beaconMat, 0, GL0 + 0.42, 0);
  beacon.name = 'beacon'; beacon.castShadow = false;
  for (const y of [0.35, 0.75]) add(new THREE.TorusGeometry(0.5, 0.03, 4, 16), iron, 0, GL0 + 0.42 + y, 0, Math.PI / 2);
  const DY = GL0 + GH;
  const dp = [[0, DY], [1.55, DY], [1.55, DY + 0.16], [1.42, DY + 0.22], [1.38, DY + 0.45], [1.25, DY + 0.75], [1.0, DY + 1.0], [0.6, DY + 1.18], [0.26, DY + 1.26], [0.18, DY + 1.45], [0, DY + 1.48]];
  lathe(dp, 24, bronze);
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const pts = dp.slice(3, 9).map(([r, y]) => new THREE.Vector3(Math.sin(th) * (r + 0.03), y, Math.cos(th) * (r + 0.03)));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.045, 3), iron);
  }
  add(new THREE.SphereGeometry(0.26, 12, 8), bronze, 0, DY + 1.68, 0);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), iron, 0, DY + 2.05, 0);

  g.userData.beacon = beacon;

  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
