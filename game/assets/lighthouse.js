// lighthouse A: primitives. Tapered cylinder tower, chamfered stone blocks for the plinth ring and
// door surround, corbel boxes under a round gallery, post-and-torus railing, cylinder lantern room
// with mullions, half-sphere dome, ball finial. 24 m tall, base 6 m, door facing +Z.
// The lamp is a separate child Mesh named 'beacon' with a material named 'beacon' (emissive 0xffe2a0).
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
  // chamfered box: exact w x h x d, centred, bevel c on every edge
  const cbox = (w, h, d, c = 0.06) => {
    c = Math.min(c, w * 0.3, h * 0.3, d * 0.3);
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + c, -h / 2 + c); s.lineTo(w / 2 - c, -h / 2 + c); s.lineTo(w / 2 - c, h / 2 - c); s.lineTo(-w / 2 + c, h / 2 - c); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * c, bevelEnabled: true, bevelSize: c, bevelThickness: c, bevelSegments: 1, curveSegments: 1 });
    geo.translate(0, 0, -(d - 2 * c) / 2); geo.computeVertexNormals(); return geo;
  };
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // ---- tower
  const H0 = 0.4, H1 = 18.6, RB = 2.72, RT = 1.95;
  const R = (y) => RB + (RT - RB) * ((y - H0) / (H1 - H0));
  const seg = (y0, y1, mat, grow = 0) => add(new THREE.CylinderGeometry(R(y1) + grow, R(y0) + grow, y1 - y0, 28, 1), mat, 0, (y0 + y1) / 2, 0);
  seg(H0, 12.2, plaster); seg(12.2, 14.0, red, 0.03); seg(14.0, H1, plaster);
  // thin lips at band edges for depth
  for (const y of [12.2, 14.0]) add(new THREE.TorusGeometry(R(y) + 0.03, 0.06, 4, 28), red, 0, y, 0, Math.PI / 2);

  // ---- plinth ring: two staggered courses of chunky blocks, gap at the door (+Z)
  for (let course = 0; course < 2; course++) {
    const n = 16, off = course * 0.5;
    for (let i = 0; i < n; i++) {
      const th = ((i + off) / n) * Math.PI * 2;
      const a = Math.atan2(Math.sin(th), Math.cos(th));
      if (Math.abs(a) < 0.36) continue;
      const r = 2.82 - course * 0.08, h = 0.55 + rnd() * 0.12, y = course * 0.56 + h / 2;
      add(cbox(1.02 + rnd() * 0.08, h, 0.5 + rnd() * 0.1, 0.09), rnd() > 0.5 ? stone : stoneL,
        Math.sin(th) * r, y, Math.cos(th) * r, 0, th + (rnd() - 0.5) * 0.08, 0);
    }
  }
  // ---- door at +Z: recessed arched timber door inside a stone surround
  const dz = R(1.2) + 0.06;
  const door = new THREE.Shape();
  door.moveTo(-0.5, 0); door.lineTo(0.5, 0); door.lineTo(0.5, 1.5); door.absarc(0, 1.5, 0.5, 0, Math.PI, false); door.closePath();
  const dg = new THREE.ExtrudeGeometry(door, { depth: 0.12, bevelEnabled: false, curveSegments: 10 });
  add(dg, doorWood, 0, 0.12, dz - 0.04);
  for (const x of [-0.25, 0, 0.25]) add(cbox(0.06, 1.6, 0.05, 0.015), timber, x, 0.95, dz + 0.1);
  for (const y of [0.55, 1.35]) add(cbox(0.95, 0.08, 0.05, 0.015), iron, 0, y, dz + 0.13);
  add(new THREE.SphereGeometry(0.05, 8, 6), iron, 0.32, 1.0, dz + 0.16);
  add(cbox(1.5, 0.14, 0.6, 0.04), stone, 0, 0.07, dz + 0.15); // threshold step
  // jambs + arch voussoirs
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++)
    add(cbox(0.36, 0.5, 0.42, 0.07), k % 2 ? stoneL : stone, s * 0.7, 0.27 + k * 0.5, dz + 0.1, 0, 0, 0);
  for (let k = 0; k <= 6; k++) {
    const a = Math.PI * (k / 6);
    add(cbox(0.34, 0.42, 0.44, 0.07), k % 2 ? stone : stoneL, Math.cos(a) * 0.7, 1.62 + Math.sin(a) * 0.7, dz + 0.1, 0, 0, a - Math.PI / 2);
  }

  // ---- windows: recessed dark pane, timber frame, sill. Placed on the taper.
  const win = (y, th, w = 0.62, h = 0.95) => {
    const r = R(y);
    const f = new THREE.Group(); f.position.set(Math.sin(th) * r, y, Math.cos(th) * r); f.rotation.y = th; g.add(f);
    add(cbox(w, h, 0.3, 0.02), pane, 0, 0, -0.12, 0, 0, 0, f);
    add(cbox(w + 0.3, 0.14, 0.2, 0.04), timber, 0, h / 2 + 0.06, 0.04, 0, 0, 0, f);
    add(cbox(w + 0.4, 0.14, 0.3, 0.04), timber, 0, -h / 2 - 0.07, 0.08, 0, 0, 0, f);
    for (const s of [-1, 1]) add(cbox(0.14, h + 0.1, 0.2, 0.04), timber, s * (w / 2 + 0.06), 0, 0.04, 0, 0, 0, f);
    add(cbox(0.06, h, 0.08, 0.015), timber, 0, 0, 0.02, 0, 0, 0, f);
    add(cbox(w, 0.06, 0.08, 0.015), timber, 0, 0.05, 0.02, 0, 0, 0, f);
  };
  win(5.2, 0); win(9.0, 0); win(13.1, 0, 0.56, 0.85); win(16.4, 0, 0.52, 0.8);
  win(7.0, Math.PI); win(14.9, Math.PI, 0.52, 0.8);
  win(11.0, Math.PI / 2, 0.56, 0.85); win(3.6, -Math.PI / 2, 0.56, 0.85); win(15.8, -Math.PI / 2, 0.52, 0.8);

  // ---- gallery: corbel ring, deck, railing
  const GY = H1 + 0.05;
  add(new THREE.CylinderGeometry(R(H1) + 0.18, R(H1) + 0.02, 0.35, 28), plaster, 0, H1 - 0.35, 0);
  for (let i = 0; i < 16; i++) {
    const th = (i / 16) * Math.PI * 2, r = R(H1) + 0.25;
    add(cbox(0.3, 0.7, 0.45, 0.05), plaster, Math.sin(th) * r, H1 - 0.15, Math.cos(th) * r, 0.35, th, 0);
  }
  add(new THREE.CylinderGeometry(2.62, 2.5, 0.4, 32), plaster, 0, GY + 0.2, 0);
  add(new THREE.CylinderGeometry(2.66, 2.66, 0.08, 32), stone, 0, GY + 0.43, 0);
  const RR = 2.48, rail0 = GY + 0.47;
  const post = new THREE.CylinderGeometry(0.04, 0.05, 1.0, 6);
  for (let i = 0; i < 32; i++) {
    const th = (i / 32) * Math.PI * 2; const big = i % 4 === 0;
    add(big ? new THREE.CylinderGeometry(0.06, 0.07, 1.08, 6) : post, iron, Math.sin(th) * RR, rail0 + 0.5, Math.cos(th) * RR);
    if (big) add(new THREE.SphereGeometry(0.08, 8, 6), iron, Math.sin(th) * RR, rail0 + 1.07, Math.cos(th) * RR);
  }
  add(new THREE.TorusGeometry(RR, 0.05, 5, 48), iron, 0, rail0 + 1.0, 0, Math.PI / 2);
  add(new THREE.TorusGeometry(RR, 0.03, 4, 48), iron, 0, rail0 + 0.55, 0, Math.PI / 2);
  add(new THREE.TorusGeometry(RR, 0.03, 4, 48), iron, 0, rail0 + 0.12, 0, Math.PI / 2);

  // ---- lantern room
  const LY = rail0;
  add(new THREE.CylinderGeometry(1.38, 1.45, 0.95, 20), plaster, 0, LY + 0.47, 0);
  add(new THREE.CylinderGeometry(1.5, 1.5, 0.12, 20), bronze, 0, LY + 0.98, 0);
  const GL0 = LY + 1.04, GH = 1.75;
  add(new THREE.CylinderGeometry(1.24, 1.24, GH, 16, 1, true), glass, 0, GL0 + GH / 2, 0);
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2 + Math.PI / 8;
    add(cbox(0.1, GH, 0.1, 0.02), iron, Math.sin(th) * 1.26, GL0 + GH / 2, Math.cos(th) * 1.26, 0, th, 0);
  }
  add(new THREE.TorusGeometry(1.26, 0.04, 4, 24), iron, 0, GL0 + GH * 0.5, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(1.5, 1.38, 0.2, 20), bronze, 0, GL0 + GH + 0.1, 0);
  // the lamp
  add(new THREE.CylinderGeometry(0.22, 0.3, 0.45, 10), iron, 0, GL0 + 0.22, 0);
  const lens = new THREE.LatheGeometry([
    new THREE.Vector2(0.0, 0), new THREE.Vector2(0.32, 0.02), new THREE.Vector2(0.46, 0.25), new THREE.Vector2(0.5, 0.55),
    new THREE.Vector2(0.46, 0.85), new THREE.Vector2(0.32, 1.08), new THREE.Vector2(0.0, 1.1)], 14);
  const beacon = add(lens, beaconMat, 0, GL0 + 0.42, 0);
  beacon.name = 'beacon'; beacon.castShadow = false;
  for (const y of [0.35, 0.75]) add(new THREE.TorusGeometry(0.5, 0.03, 4, 16), iron, 0, GL0 + 0.42 + y, 0, Math.PI / 2);
  // dome, ribs, finial
  const DY = GL0 + GH + 0.2;
  const dome = add(new THREE.SphereGeometry(1.42, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), bronze, 0, DY, 0);
  dome.scale.set(1, 0.72, 1);
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const rib = add(new THREE.TorusGeometry(1.43, 0.045, 4, 10, Math.PI / 2), iron, 0, DY, 0, 0, th + Math.PI / 2, 0);
    rib.scale.set(1, 0.72, 1);
  }
  add(new THREE.CylinderGeometry(0.16, 0.24, 0.35, 10), bronze, 0, DY + 1.1, 0);
  add(new THREE.SphereGeometry(0.24, 12, 8), bronze, 0, DY + 1.45, 0);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), iron, 0, DY + 1.8, 0);

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
