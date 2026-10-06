// player_girl, candidate C: a different reading. Chunkier toy proportions (bigger head, bigger boots,
// mitten hands), faceted carved-wood shading, and the hood and capelet as ONE garment piece.
// 1.45 m, front +Z, jointed.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, rough = 0.85, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true, ...extra });
    if (name) m.name = name;
    return m;
  };
  const skin = M(0xe7b48f, null, 0.8, { flatShading: false });
  const cloak = M(0x8a5636, 'fabric', 0.9, { side: THREE.DoubleSide });
  const lining = M(0x5c3622, 'fabric', 0.9, { side: THREE.DoubleSide });
  const patch = M(0xa9714a, 'fabric', 0.9);
  const tunic = M(0x4c7d74, 'fabric', 0.88);
  const pants = M(0x7a4a32, 'fabric', 0.9);
  const leather = M(0x8c5a34, 'fabric', 0.75);
  const leatherDk = M(0x6e4428, 'fabric', 0.8);
  const dark = M(0x2b1d16, null, 0.6, { flatShading: false });
  const white = M(0xf4eee2, null, 0.6, { flatShading: false });
  const hair = M(0x5a3826, 'fabric', 0.85);
  const blush = M(0xe59c86, null, 0.85, { flatShading: false });
  const pack = M(0xb79773, 'fabric', 0.9);
  const roll = M(0x55703c, 'fabric', 0.9);
  const iron = M(0x3a3d40, 'metal', 0.6, { metalness: 0.4 });
  const moon = M(0x9fd8ff, null, 0.3, { emissive: 0x9fd8ff, emissiveIntensity: 1.3, flatShading: false });
  moon.name = 'moonstone';

  const add = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; parent.add(m); return m;
  };
  const J = (parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; };
  const ico = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);
  const cyl = (rt, rb, h, s = 8, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);

  // ---- hips, world y 0.58
  const hips = J(g, 0, 0.58, 0);
  add(hips, ico(0.15, 1), pants, 0, 0, 0, 0, 0, 0, 1, 0.7, 0.8);
  add(hips, cyl(0.15, 0.155, 0.05, 10), leatherDk, 0, 0.06, 0, 0, 0, 0, 1, 1, 0.82);

  // ---- legs: short and stubby, very big boots
  const legs = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ul = J(hips, 0.08 * s, -0.03, 0);
    add(ul, ico(0.085, 1), pants, 0, -0.1, 0, 0, 0, 0, 1, 1.5, 1);
    if (s < 0) add(ul, new THREE.BoxGeometry(0.07, 0.07, 0.025), patch, -0.025, -0.12, 0.08, 0, -0.3, -0.2);
    const ll = J(ul, 0, -0.24, 0);
    add(ll, ico(0.07, 1), pants, 0, -0.03, 0, 0, 0, 0, 1, 1.1, 1);
    add(ll, cyl(0.09, 0.075, 0.07, 9), leather, 0, -0.1, 0);              // turned-down cuff
    add(ll, cyl(0.075, 0.08, 0.11, 9), leather, 0, -0.19, 0);
    add(ll, ico(0.085, 1), leather, 0, -0.25, 0.06, 0, 0, 0, 0.95, 0.65, 1.45); // toe
    add(ll, new THREE.BoxGeometry(0.15, 0.04, 0.26), dark, 0, -0.32, 0.04);
    legs[side + 'UpperLeg'] = ul; legs[side + 'LowerLeg'] = ll;
  }

  // ---- spine, world y 0.64; a pear-shaped tunic
  const spine = J(hips, 0, 0.06, 0);
  add(spine, cyl(0.135, 0.19, 0.2, 10), tunic, 0, 0.02, 0, 0, 0, 0, 1, 1, 0.8);
  add(spine, cyl(0.12, 0.14, 0.12, 10), tunic, 0, 0.17, 0, 0, 0, 0, 1, 1, 0.8);
  add(spine, new THREE.BoxGeometry(0.05, 0.38, 0.03), leather, -0.01, 0.1, 0.165, 0.1, 0, -0.78);
  add(spine, new THREE.BoxGeometry(0.06, 0.055, 0.035), iron, 0.04, 0.17, 0.18, 0.1, 0, -0.78);
  add(spine, new THREE.BoxGeometry(0.17, 0.14, 0.09), leather, -0.2, -0.04, 0.05, 0, 0.5, 0);
  add(spine, new THREE.BoxGeometry(0.175, 0.07, 0.095), leatherDk, -0.2, 0.01, 0.052, 0, 0.5, 0);
  // the cloak: one piece. A cone capelet and the hood shell share a material and overlap at the collar.
  const capeGeo = cyl(0.11, 0.27, 0.22, 12, true);
  { const p = capeGeo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setY(i, p.getY(i) + 0.025 * Math.sin(Math.atan2(p.getX(i), p.getZ(i)) * 6)); capeGeo.computeVertexNormals(); }
  add(spine, capeGeo, cloak, 0, 0.18, 0, 0, 0, 0, 1, 1, 0.85);
  add(spine, cyl(0.1, 0.25, 0.2, 12, true), lining, 0, 0.17, 0, 0, 0, 0, 1, 1, 0.82);
  add(spine, new THREE.BoxGeometry(0.08, 0.07, 0.025), patch, -0.13, 0.15, 0.17, -0.4, -0.5, 0.2);
  add(spine, new THREE.BoxGeometry(0.07, 0.07, 0.025), patch, 0.08, 0.14, -0.21, 0.3, 0.2, 0.1);
  // backpack + bedroll
  add(spine, new THREE.BoxGeometry(0.28, 0.28, 0.14), pack, 0, 0.12, -0.18, 0, 0, 0);
  add(spine, new THREE.BoxGeometry(0.2, 0.12, 0.05), M(0x9a7c58, 'fabric', 0.9), 0, 0.05, -0.27);
  add(spine, cyl(0.08, 0.08, 0.36, 10), roll, 0, 0.32, -0.19, 0, 0, Math.PI / 2);
  for (const s of [1, -1]) add(spine, new THREE.TorusGeometry(0.083, 0.014, 4, 10), leather, 0.09 * s, 0.32, -0.19, 0, Math.PI / 2, 0);
  for (const s of [1, -1]) add(spine, new THREE.TorusGeometry(0.045, 0.016, 4, 10), M(0x3f5a2e, 'fabric', 0.9), 0.18 * s, 0.32, -0.19, 0, Math.PI / 2, 0);

  // ---- head: bigger (r 0.175), neck at world y 0.93
  const head = J(spine, 0, 0.29, 0);
  add(head, cyl(0.05, 0.055, 0.06, 8), skin, 0, 0.01, 0);
  const H = new THREE.Group(); H.position.set(0, 0.19, 0.01); head.add(H);
  add(H, new THREE.SphereGeometry(0.175, 18, 12), skin, 0, 0, 0, 0, 0, 0, 1.02, 0.98, 0.95);
  for (const s of [1, -1]) {
    add(H, new THREE.SphereGeometry(0.04, 12, 8), white, 0.065 * s, -0.005, 0.145, 0, 0, 0, 0.85, 1.1, 0.45);
    add(H, new THREE.SphereGeometry(0.031, 12, 8), dark, 0.066 * s, -0.01, 0.158, 0, 0, 0, 0.85, 1.15, 0.4);
    add(H, new THREE.BoxGeometry(0.06, 0.016, 0.02), hair, 0.066 * s, 0.062, 0.152, 0, 0, -0.18 * s);
    add(H, new THREE.SphereGeometry(0.034, 8, 6), blush, 0.1 * s, -0.065, 0.12, 0, 0, 0, 1, 0.6, 0.4);
  }
  add(H, new THREE.SphereGeometry(0.024, 8, 6), skin, 0, -0.04, 0.17);
  add(H, new THREE.CapsuleGeometry(0.01, 0.034, 2, 6), M(0x8e4a3c, null, 0.8, { flatShading: false }), 0, -0.1, 0.146, 0, 0, Math.PI / 2, 1, 1, 0.6);
  add(H, new THREE.SphereGeometry(0.18, 14, 6, 0, Math.PI * 2, 0, 1.15), hair, 0, 0.012, -0.005);
  add(H, ico(0.06, 0), hair, -0.05, 0.09, 0.13, 0.4, 0, 0.6, 1.5, 0.6, 0.55);
  add(H, ico(0.055, 0), hair, 0.07, 0.085, 0.125, 0.4, 0, -0.5, 1.3, 0.6, 0.55);
  for (const s of [1, -1]) add(H, ico(0.045, 0), hair, 0.145 * s, -0.05, 0.06, 0, 0, 0.15 * s, 0.8, 1.6, 0.9);
  // hood shell: open sphere, then a tapered tail falling down the back
  const hood = (r) => new THREE.SphereGeometry(r, 14, 9, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, 2.3);
  add(H, hood(0.215), cloak, 0, 0.025, -0.02);
  add(H, hood(0.2), lining, 0, 0.025, -0.018);
  add(H, new THREE.ConeGeometry(0.075, 0.16, 7), cloak, 0, 0.06, -0.24, -1.9);
  add(H, new THREE.BoxGeometry(0.08, 0.07, 0.025), patch, -0.1, 0.15, -0.12, -0.7, -0.6, 0);

  // ---- arms (shoulders at world y 0.88), short with mitten hands
  const arms = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? 'left' : 'right';
    const ua = J(spine, 0.165 * s, 0.24, 0);
    ua.rotation.z = 0.36 * s;
    add(ua, ico(0.062, 1), tunic, 0, -0.01, 0);
    add(ua, cyl(0.055, 0.05, 0.17, 8), tunic, 0, -0.09, 0);
    const la = J(ua, 0, -0.18, 0);
    add(la, ico(0.05, 1), tunic, 0, 0, 0);
    add(la, cyl(0.05, 0.06, 0.13, 8), tunic, 0, -0.07, 0);
    add(la, new THREE.SphereGeometry(0.048, 10, 8), skin, 0, -0.17, 0.005, 0, 0, 0, 0.85, 1.05, 1);
    add(la, new THREE.SphereGeometry(0.022, 8, 6), skin, -0.035 * s, -0.15, 0.03);
    arms[side + 'UpperArm'] = ua; arms[side + 'LowerArm'] = la;
  }

  // ---- lantern: a squat hexagonal lamp, bigger so it reads at game distance
  const lantern = J(arms.rightLowerArm, 0, -0.18, 0.01);
  lantern.rotation.z = 0.36;
  add(lantern, new THREE.TorusGeometry(0.035, 0.009, 4, 10, Math.PI), iron, 0, -0.035, 0, 0, 0, Math.PI);
  add(lantern, new THREE.ConeGeometry(0.07, 0.05, 6), iron, 0, -0.06, 0);
  add(lantern, cyl(0.055, 0.055, 0.11, 6), moon, 0, -0.14, 0);
  add(lantern, cyl(0.068, 0.06, 0.03, 6), iron, 0, -0.205, 0);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; add(lantern, new THREE.BoxGeometry(0.012, 0.11, 0.012), iron, Math.sin(a) * 0.058, -0.14, Math.cos(a) * 0.058); }

  g.userData.joints = { hips, spine, head, ...arms, ...legs, lantern };

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
