// rowboat_c: hand-built clinker BufferGeometry hull (red strakes outside, a timber skin inside),
// ribs swept along the section, three thwarts, bottom boards, two oars laid across, bow ring.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const D = THREE.DoubleSide;
  const red = mk(0xb5543a, 'timber', 0.85, { side: D });
  const bottom = mk(0x4a3426, 'timber', 0.6, { side: D });
  const inner = mk(0x7b5a3e, 'timber', 0.85, { side: D });
  const drift = mk(0xb79773, 'timber', 0.85);
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });

  const H = clinkerHull(THREE, {
    L: 3.45, B: 1.32, H: 0.56, riseBow: 0.22, riseStern: 0.1, rocker: 0.16, rockerS: 0.04,
    bowPow: 2, bowFull: 0.62, sternW: 0.58, sternPow: 2.6, secX: 0.75, secY: 0.9, flare: 0.08,
    N: 5, sub: 3, lipPow: 2.2, cols: 14, bowBias: true, lap: 0.04, innerOff: 0.045,
    strakeMat: (k) => (k < 1 ? bottom : red),
    innerMat: inner, transomMat: red, railMat: drift, railR: 0.045, railSegs: 32,
    keelMat: drift, keelR: 0.04, stemTop: 0.12,
  });
  g.add(H.g);
  const zOf = (u) => u * H.half, uOf = (z) => z / H.half;
  const wlRaw = H.sec(0, 1 / 5)[1];

  for (const u of [-0.66, -0.33, 0.0, 0.33, 0.64]) g.add(H.rib(u, 0.025, drift));
  // bottom boards
  const by = 0.1;
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.13, e = Math.abs(x) + 0.06 + 0.05;
    let z0 = null, z1 = null;
    for (let s = 0; s <= 60; s++) { const u = -1 + 2 * s / 60; if (H.keelY(u) < by - 0.04 && H.xAtY(u, by) > e) { if (z0 === null) z0 = zOf(u); z1 = zOf(u); } }
    if (z0 === null) continue;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, z1 - z0), drift); b.position.set(x, by, (z0 + z1) / 2); g.add(b);
  }
  // thwarts sit on risers just below the gunwale
  const seat = (z, d, y) => {
    const w = 2 * (H.xAtY(uOf(z), y) - 0.05);
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), drift); s.position.set(0, y, z); g.add(s);
  };
  seat(0.85, 0.24, 0.4); seat(-0.05, 0.26, 0.4); seat(-1.32, 0.45, 0.42);
  // oars crossing the thwarts
  const oar = (a, b2) => {
    const og = new THREE.Group();
    const dir = new THREE.Vector3().subVectors(b2, a), len = dir.length();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.038, len * 0.7, 6), drift); shaft.position.y = len * 0.35; og.add(shaft);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.14, 6), drift); grip.position.y = -0.06; og.add(grip);
    const bs = new THREE.Shape(); bs.moveTo(-0.035, 0); bs.lineTo(0.035, 0); bs.lineTo(0.1, 0.14); bs.lineTo(0.1, len * 0.3 - 0.04); bs.quadraticCurveTo(0.1, len * 0.3, 0.06, len * 0.3); bs.lineTo(-0.06, len * 0.3); bs.quadraticCurveTo(-0.1, len * 0.3, -0.1, len * 0.3 - 0.04); bs.lineTo(-0.1, 0.14); bs.lineTo(-0.035, 0);
    const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(bs, { depth: 0.04, bevelEnabled: false, curveSegments: 2 }), drift);
    blade.position.set(0, len * 0.7, -0.02); og.add(blade);
    og.position.copy(a); og.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    g.add(og);
  };
  oar(new THREE.Vector3(-0.3, 0.47, -1.15), new THREE.Vector3(0.32, 0.5, 1.15));
  oar(new THREE.Vector3(0.28, 0.48, -1.05), new THREE.Vector3(-0.3, 0.52, 1.3));
  // oarlock pads and bow ring
  for (const s of [-1, 1]) { const p = H.pt(uOf(0.05), 1, 0); const pad = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.24), drift); pad.position.set(s * p[0], p[1] + 0.07, 0.05); g.add(pad); }
  const st = H.sec(1, 0.8);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 4, 10), iron); ring.rotation.y = Math.PI / 2; ring.position.set(0, st[1] - 0.05, H.half + 0.07); g.add(ring);
  // corner knees at the transom
  for (const s of [-1, 1]) { const p = H.pt(-0.95, 1, -0.06); const k = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.16), drift); k.position.set(s * (p[0] - 0.06), p[1] + 0.01, p[2]); g.add(k); }

__RECENTRE__
  g.userData.waterline = wlRaw - box.min.y;
  return g;
}
