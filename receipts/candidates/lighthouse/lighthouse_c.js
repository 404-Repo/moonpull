// lighthouse C: different breakdown. The tower is stacked hand-laid drums, each a touch off-axis so the
// shaft has a storybook wobble; the foot is a skirt of rough stones as an InstancedMesh; the gallery
// sits on square brackets; the lantern is an eight-sided glazed cage (flat panes between posts) under
// a faceted eight-sided dome. 24 m, base 6 m, door facing +Z.
// Lamp = child Mesh 'beacon', material 'beacon' (emissive 0xffe2a0).
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
  const cbox = (w, h, d, c = 0.06) => {
    c = Math.min(c, w * 0.3, h * 0.3, d * 0.3);
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + c, -h / 2 + c); s.lineTo(w / 2 - c, -h / 2 + c); s.lineTo(w / 2 - c, h / 2 - c); s.lineTo(-w / 2 + c, h / 2 - c); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: d - 2 * c, bevelEnabled: true, bevelSize: c, bevelThickness: c, bevelSegments: 1, curveSegments: 1 });
    geo.translate(0, 0, -(d - 2 * c) / 2); geo.computeVertexNormals(); return geo;
  };
  let seed = 37; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  // ---- tower as stacked drums with a slight wobble; each drum bevelled at its top edge
  const H0 = 0.0, H1 = 18.5, RB = 2.8, RT = 2.0;
  const R = (y) => RB + (RT - RB) * Math.pow((y - H0) / (H1 - H0), 0.9);
  const courses = [0, 1.3, 3.2, 5.4, 7.6, 9.8, 12.1, 14.0, 16.2, H1];
  const off = [];
  for (let i = 0; i < courses.length - 1; i++) {
    const y0 = courses[i], y1 = courses[i + 1];
    const ox = (rnd() - 0.5) * 0.04, oz = (rnd() - 0.5) * 0.04; off.push([ox, oz]);
    const mat = i === 6 ? red : plaster;
    const r0 = R(y0), r1 = R(y1);
    const pts = [new THREE.Vector2(0, y0), new THREE.Vector2(r0, y0), new THREE.Vector2(r1 + 0.02, y1 - 0.12), new THREE.Vector2(r1 - 0.04, y1), new THREE.Vector2(0, y1)];
    const geo = new THREE.LatheGeometry(pts, 28);
    add(geo, mat, ox, 0, oz);
  }

  // ---- rough stone skirt: InstancedMesh, two courses, gap at the door
  const stoneGeo = cbox(1, 1, 1, 0.16);
  const placed = [];
  for (let course = 0; course < 2; course++) {
    const n = 15;
    for (let i = 0; i < n; i++) {
      const th = ((i + course * 0.5) / n) * Math.PI * 2 + (rnd() - 0.5) * 0.06;
      const a = Math.atan2(Math.sin(th), Math.cos(th));
      if (Math.abs(a) < 0.34) continue;
      const w = 1.0 + rnd() * 0.25, h = 0.55 + rnd() * 0.15, d = 0.55 + rnd() * 0.12, r = 2.78 - course * 0.12;
      placed.push([Math.sin(th) * r, course * 0.55 + h / 2, Math.cos(th) * r, th + (rnd() - 0.5) * 0.12, w, h, d, (rnd() - 0.5) * 0.08]);
    }
  }
  for (const [mat, pick] of [[stone, 0], [stoneL, 1]]) {
    const list = placed.filter((_, i) => i % 2 === pick);
    const im = new THREE.InstancedMesh(stoneGeo, mat, list.length);
    const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach(([x, y, z, ry, w, h, d, rz], i) => { q.setFromEuler(e.set(0, ry, rz)); mm.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(w, h, d)); im.setMatrixAt(i, mm); });
    im.castShadow = true; im.receiveShadow = true; g.add(im);
  }

  // ---- door: arched timber door, stone jamb blocks and voussoirs, small hood
  const dz = R(1.0) + 0.04;
  const door = new THREE.Shape();
  door.moveTo(-0.5, 0); door.lineTo(0.5, 0); door.lineTo(0.5, 1.5); door.absarc(0, 1.5, 0.5, 0, Math.PI, false); door.closePath();
  add(new THREE.ExtrudeGeometry(door, { depth: 0.14, bevelEnabled: false, curveSegments: 10 }), doorWood, 0, 0.1, dz - 0.1);
  for (const x of [-0.25, 0, 0.25]) add(cbox(0.06, 1.6, 0.05, 0.015), timber, x, 0.95, dz + 0.06);
  for (const y of [0.5, 1.3]) add(cbox(0.95, 0.08, 0.05, 0.015), iron, 0, y, dz + 0.09);
  add(new THREE.SphereGeometry(0.05, 8, 6), iron, 0.32, 1.0, dz + 0.12);
  add(cbox(1.5, 0.12, 0.6, 0.04), stone, 0, 0.06, dz + 0.2);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++)
    add(cbox(k % 2 ? 0.34 : 0.44, 0.5, 0.5, 0.08), k % 2 ? stoneL : stone, s * (0.72 + (k % 2 ? -0.03 : 0.02)), 0.27 + k * 0.5, dz + 0.06);
  for (let k = 0; k <= 6; k++) {
    const a = Math.PI * (k / 6);
    add(cbox(k === 3 ? 0.4 : 0.34, k === 3 ? 0.52 : 0.44, 0.5, 0.08), k % 2 ? stone : stoneL, Math.cos(a) * 0.72, 1.62 + Math.sin(a) * 0.72, dz + 0.06, 0, 0, a - Math.PI / 2);
  }

  // ---- arched windows with timber frame, sill and lintel, recessed dark glass
  const win = (y, th, w = 0.6, h = 1.0) => {
    const r = R(y);
    const f = new THREE.Group(); f.position.set(Math.sin(th) * r, y, Math.cos(th) * r); f.rotation.y = th; g.add(f);
    const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2 - w / 2); s.absarc(0, h / 2 - w / 2, w / 2, 0, Math.PI, false); s.closePath();
    const fr = new THREE.Shape(); const W = w + 0.22, Hh = h + 0.22;
    fr.moveTo(-W / 2, -Hh / 2); fr.lineTo(W / 2, -Hh / 2); fr.lineTo(W / 2, Hh / 2 - W / 2); fr.absarc(0, Hh / 2 - W / 2, W / 2, 0, Math.PI, false); fr.closePath();
    fr.holes.push(s);
    add(new THREE.ExtrudeGeometry(fr, { depth: 0.14, bevelEnabled: false, curveSegments: 6 }), timber, 0, 0, -0.06, 0, 0, 0, f);
    add(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false, curveSegments: 6 }), pane, 0, 0, -0.2, 0, 0, 0, f);
    add(cbox(0.05, h - 0.05, 0.06, 0.01), timber, 0, -0.02, -0.12, 0, 0, 0, f);
    add(cbox(w, 0.05, 0.06, 0.01), timber, 0, 0.0, -0.12, 0, 0, 0, f);
    add(cbox(W + 0.16, 0.12, 0.28, 0.03), timber, 0, -Hh / 2 - 0.04, 0.06, 0, 0, 0, f);
  };
  win(4.9, 0); win(8.9, 0); win(13.05, 0, 0.55, 0.9); win(16.6, 0, 0.5, 0.85);
  win(6.9, Math.PI); win(14.9, Math.PI, 0.5, 0.85);
  win(11.0, Math.PI / 2, 0.55, 0.9); win(3.2, -Math.PI / 2, 0.55, 0.9); win(15.6, -Math.PI / 2, 0.5, 0.85);

  // ---- gallery: necking band, square brackets, thick deck, iron railing with corner knobs
  const [ox, oz] = off[off.length - 1];
  const top = new THREE.Group(); top.position.set(ox, 0, oz); g.add(top);
  add(new THREE.CylinderGeometry(RT + 0.14, RT + 0.08, 0.3, 28), plaster, 0, H1 - 0.75, 0, 0, 0, 0, top);
  for (let i = 0; i < 12; i++) {
    const th = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const b = new THREE.Group(); b.rotation.y = th; top.add(b);
    add(cbox(0.32, 0.38, 0.62, 0.05), plaster, 0, H1 - 0.2, RT + 0.22, 0, 0, 0, b);
    add(cbox(0.26, 0.36, 0.3, 0.05), plaster, 0, H1 - 0.55, RT + 0.12, 0, 0, 0, b);
  }
  add(new THREE.CylinderGeometry(2.65, 2.55, 0.38, 28), plaster, 0, H1 + 0.19, 0, 0, 0, 0, top);
  add(new THREE.CylinderGeometry(2.6, 2.6, 0.08, 28), stone, 0, H1 + 0.42, 0, 0, 0, 0, top);
  const D = H1 + 0.46, RR = 2.48;
  add(new THREE.TorusGeometry(RR, 0.055, 5, 40), iron, 0, D + 1.0, 0, Math.PI / 2, 0, 0, top);
  add(new THREE.TorusGeometry(RR, 0.03, 4, 40), iron, 0, D + 0.15, 0, Math.PI / 2, 0, 0, top);
  for (let i = 0; i < 40; i++) {
    const th = (i / 40) * Math.PI * 2, big = i % 5 === 0;
    add(new THREE.CylinderGeometry(big ? 0.065 : 0.032, big ? 0.075 : 0.04, 1.0, 6), iron, Math.sin(th) * RR, D + 0.5, Math.cos(th) * RR, 0, 0, 0, top);
    if (big) add(new THREE.SphereGeometry(0.085, 8, 5), iron, Math.sin(th) * RR, D + 1.07, Math.cos(th) * RR, 0, 0, 0, top);
  }

  // ---- eight-sided lantern room
  const LY = D;
  add(new THREE.CylinderGeometry(1.42, 1.5, 1.0, 8), plaster, 0, LY + 0.5, 0, 0, Math.PI / 8, 0, top);
  add(new THREE.CylinderGeometry(1.58, 1.58, 0.12, 8), bronze, 0, LY + 1.06, 0, 0, Math.PI / 8, 0, top);
  const GL0 = LY + 1.12, GH = 1.7, AP = 1.3;
  const side = 2 * AP * Math.tan(Math.PI / 8);
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2;
    add(new THREE.PlaneGeometry(side, GH), glass, Math.sin(th) * AP, GL0 + GH / 2, Math.cos(th) * AP, 0, th, 0, top);
    const tc = th + Math.PI / 8, rc = AP / Math.cos(Math.PI / 8);
    add(cbox(0.12, GH, 0.12, 0.02), iron, Math.sin(tc) * rc, GL0 + GH / 2, Math.cos(tc) * rc, 0, tc, 0, top);
    add(cbox(side, 0.06, 0.07, 0.01), iron, Math.sin(th) * AP, GL0 + GH * 0.55, Math.cos(th) * AP, 0, th, 0, top);
  }
  add(new THREE.CylinderGeometry(0.22, 0.3, 0.45, 8), iron, 0, GL0 + 0.22, 0, 0, 0, 0, top);
  const lens = new THREE.LatheGeometry([
    new THREE.Vector2(0, 0), new THREE.Vector2(0.32, 0.02), new THREE.Vector2(0.46, 0.25), new THREE.Vector2(0.5, 0.55),
    new THREE.Vector2(0.46, 0.85), new THREE.Vector2(0.32, 1.08), new THREE.Vector2(0, 1.1)], 12);
  const beacon = add(lens, beaconMat, 0, GL0 + 0.42, 0, 0, 0, 0, top);
  beacon.name = 'beacon'; beacon.castShadow = false;
  for (const y of [0.35, 0.75]) add(new THREE.TorusGeometry(0.5, 0.03, 4, 12), iron, 0, GL0 + 0.42 + y, 0, Math.PI / 2, 0, 0, top);
  // faceted dome: eight-sided lathe with a flared eave, ribs at the corners
  const DY = GL0 + GH;
  const dp = [[0, DY], [1.62, DY], [1.62, DY + 0.14], [1.48, DY + 0.22], [1.4, DY + 0.5], [1.18, DY + 0.85], [0.8, DY + 1.1], [0.3, DY + 1.25], [0.2, DY + 1.45], [0, DY + 1.46]];
  const dome = add(new THREE.LatheGeometry(dp.map(([r, y]) => new THREE.Vector2(r / Math.cos(Math.PI / 8), y)), 8), bronze, 0, 0, 0, 0, Math.PI / 8 + Math.PI / 8, 0, top);
  dome.rotation.y = Math.PI / 8;
  add(new THREE.SphereGeometry(0.26, 12, 8), bronze, 0, DY + 1.66, 0, 0, 0, 0, top);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), iron, 0, DY + 2.05, 0, 0, 0, 0, top);

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
