// rowboat_b: profiles. Half a LatheGeometry spindle turned on its side and warped after
// construction (flat bottom, sheer, sawtooth strakes); a shrunken copy is the timber lining.
// Thwarts and oar blades are extruded profiles.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const D = THREE.DoubleSide;
  const red = mk(0xb5543a, 'timber', 0.85, { side: D });
  const hullBlue = red;
  const bottom = mk(0x4a3426, 'timber', 0.6, { side: D });
  const inner = mk(0x7b5a3e, 'timber', 0.85, { side: D });
  const drift = mk(0xb79773, 'timber', 0.85);
  const iron = mk(0x3a3d40, 'metal', 0.7, { metalness: 0.3 });
  const L = 3.45, half = L / 2, Bh = 0.66, Hd = 0.56;
  const rOf = (z) => { const u = z / half; return u >= 0 ? Bh * Math.pow(Math.max(0.001, 1 - u * u), 0.55) : Bh * (1 - 0.38 * Math.pow(-u, 2.4)); };
  const prof = [];
  for (let i = 0; i <= 20; i++) { const z = -half + L * (1 - Math.pow(1 - i / 20, 1.2)); prof.push(new THREE.Vector2(Math.max(0.02, rOf(z)), z)); }
  const NS = 5, segPer = 3, RS = NS * 2 * segPer;
  const geo = new THREE.LatheGeometry(prof, RS, -Math.PI / 2, Math.PI);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), yA = p.getY(i), zA = p.getZ(i);
    const r = Math.hypot(x, zA) || 1e-6, phi = Math.atan2(x, zA);
    const u = yA / half, side = Math.abs(phi) / (Math.PI / 2);
    const k = Math.min(NS - 1, Math.floor(side * NS - 1e-6)), f = side * NS - k;
    const rr = r * (1 + 0.06 * Math.pow(1 - f, 2));
    const keel = u >= 0 ? 0.16 * u * u * u : 0.04 * Math.pow(-u, 3);
    const sheer = Hd + (u >= 0 ? 0.22 : 0.1) * u * u;
    const vy = Math.pow(Math.cos(phi), 0.75);
    p.setXYZ(i, rr * Math.sin(phi) * (1 + 0.05 * Math.pow(side, 3)), keel + (sheer - keel) * (1 - vy), yA);
  }
  geo.computeVertexNormals();
  // two bands: blue body, red top strake (split by material groups would merge away, so two meshes)
  const hull = new THREE.Mesh(geo, red); g.add(hull);
  const lin = new THREE.Mesh(geo.clone(), inner); lin.scale.set(0.95, 1, 0.97); lin.position.y = 0.03; g.add(lin);
  const top = new THREE.Mesh(geo.clone(), bottom);
  { const q = top.geometry.attributes.position; const keep = [];
    const idx = geo.index.array; for (let t = 0; t < idx.length; t += 3) {
      let all = true; for (let e = 0; e < 3; e++) { const vi = idx[t + e]; const col = Math.floor(vi / prof.length); if (Math.abs(col - RS / 2) > segPer) all = false; }
      if (all) keep.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    top.geometry.setIndex(keep); top.scale.set(1.01, 1, 1.0); top.position.y = -0.004; g.add(top); }
  // gunwale: extruded rounded section along the sheer line
  const sheerPts = [];
  for (let i = 0; i <= 20; i++) { const z = -half + L * i / 20, u = z / half; sheerPts.push(new THREE.Vector3(rOf(z) * 1.05 * 1.0, Hd + (u >= 0 ? 0.22 : 0.1) * u * u + 0.03, z)); }
  for (const s of [1, -1]) {
    const c = new THREE.CatmullRomCurve3(sheerPts.map((v) => new THREE.Vector3(v.x * s, v.y, v.z)));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.05, 5, false), drift));
  }
  const tr = new THREE.Mesh(new THREE.CircleGeometry(rOf(-half) * 1.05, 12, Math.PI, Math.PI), hullBlue);
  tr.scale.set(1, Hd / (rOf(-half) * 1.05), 1); tr.position.set(0, Hd + 0.1, -half); tr.material = hullBlue; g.add(tr);
  const trc = new THREE.Mesh(new THREE.BoxGeometry(rOf(-half) * 2.2, 0.07, 0.1), drift); trc.position.set(0, Hd + 0.13, -half); g.add(trc);
  const ts = new THREE.Shape(); ts.moveTo(-0.6, 0); ts.lineTo(0.6, 0); ts.lineTo(0.58, 0.05); ts.lineTo(-0.58, 0.05); ts.lineTo(-0.6, 0);
  for (const [z, d, wf] of [[0.85, 0.24, 0.78], [-0.05, 0.26, 0.92], [-1.32, 0.45, 0.82]]) {
    const th = new THREE.Mesh(new THREE.ExtrudeGeometry(ts, { depth: d, bevelEnabled: false }), drift);
    th.scale.x = wf; th.position.set(0, 0.38, z - d / 2); g.add(th);
  }
  for (const z of [-0.9, -0.45, 0.4, 0.8]) { const fr = new THREE.Mesh(new THREE.TorusGeometry(rOf(z) * 0.86, 0.025, 4, 12, Math.PI), drift); fr.rotation.z = Math.PI; fr.scale.y = 0.75; fr.position.set(0, Hd + 0.02, z); g.add(fr); }
  const oar = (a, b2) => {
    const og = new THREE.Group(), dir = new THREE.Vector3().subVectors(b2, a), len = dir.length();
    const prof = [[0.0, 0], [0.034, 0.02], [0.034, len * 0.68], [0.03, len * 0.7]].map(([x, y]) => new THREE.Vector2(x, y));
    og.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 6), drift));
    const bs = new THREE.Shape(); bs.moveTo(-0.035, 0); bs.lineTo(0.035, 0); bs.lineTo(0.1, 0.14); bs.lineTo(0.1, len * 0.3); bs.lineTo(-0.1, len * 0.3); bs.lineTo(-0.1, 0.14); bs.lineTo(-0.035, 0);
    const bl = new THREE.Mesh(new THREE.ExtrudeGeometry(bs, { depth: 0.04, bevelEnabled: false }), drift); bl.position.set(0, len * 0.7, -0.02); og.add(bl);
    og.position.copy(a); og.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()); g.add(og);
  };
  oar(new THREE.Vector3(-0.3, 0.47, -1.15), new THREE.Vector3(0.32, 0.5, 1.15));
  oar(new THREE.Vector3(0.28, 0.48, -1.05), new THREE.Vector3(-0.3, 0.52, 1.3));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 4, 10), iron); ring.rotation.y = Math.PI / 2; ring.position.set(0, Hd + 0.05, half + 0.03); g.add(ring);
  const wlRaw = 0.12;

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
  g.userData.waterline = wlRaw - box.min.y;
  return g;
}
