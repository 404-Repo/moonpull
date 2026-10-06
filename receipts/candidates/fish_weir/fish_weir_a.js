// fish_weir_a: primitives. Octagonal (chamfered) stakes with slanted or ridged tops and a dark
// wet sleeve low down; wattle as horizontal withy tubes woven over/under the stakes by a cosine
// offset along the curve normal; uprights (sails) between stakes; kelp ribbons caught low.
// Runs along local X, bowing toward +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (hex, name, r = 0.85, extra = {}) => { const q = new THREE.MeshStandardMaterial({ color: hex, roughness: r, ...extra }); if (name) q.name = name; return q; };
  const wet = mk(0x4a3426, 'timber', 0.55);
  const wood = mk(0x7b5a3e, 'timber', 0.88);
  const drift = mk(0xb79773, 'timber', 0.9);
  const withyA = mk(0x6a4c33, 'timber', 0.85);
  const withyB = mk(0x4a3426, 'timber', 0.6);
  const withyC = mk(0x7b5a3e, 'timber', 0.85);
  const kelp = mk(0x4f5a2c, 'foliage', 0.6, { side: THREE.DoubleSide });
  const barn = mk(0xd9cfb6, 'stone', 0.9);

  let seed = 11; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const BOW = 0.8, HALF = 5;
  const zc = (x) => BOW * (1 - (x / HALF) ** 2);
  const dz = (x) => -2 * BOW * x / (HALF * HALF);
  const nrm = (x) => { const a = -dz(x), l = Math.hypot(a, 1); return [a / l, 1 / l]; };

  // 14 stakes
  const N = 14, xs = [], hs = [];
  for (let i = 0; i < N; i++) { xs.push(-4.7 + 9.4 * i / (N - 1) + (R() - 0.5) * 0.12); hs.push(0.9 + 0.5 * R()); }
  hs[3] = 1.4; hs[9] = 1.38; hs[12] = 0.92;

  const post = (h, w, d, mode) => {
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1);
    geo.rotateY(Math.PI / 8); geo.scale(w / 0.924, h, d / 0.924); geo.translate(0, h / 2, 0);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i); if (y < h - 1e-4) continue;
      const x = p.getX(i) / (w / 2);
      p.setY(i, y - (mode === 0 ? 0.09 * (x + 1) / 2 : 0.06 * Math.abs(x)));
    }
    geo.computeVertexNormals();
    return geo;
  };

  const stakes = [];
  for (let i = 0; i < N; i++) {
    const s = new THREE.Group();
    const h = hs[i], w = 0.13 + R() * 0.04, d = 0.11 + R() * 0.03;
    s.add(new THREE.Mesh(post(h, w, d, i % 3 === 1 ? 1 : 0), i % 2 ? drift : wood));
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 8, 1, true), wet);
    sleeve.geometry.rotateY(Math.PI / 8); const sh = 0.38 + R() * 0.12; sleeve.geometry.scale((w + 0.014) / 0.924, sh, (d + 0.014) / 0.924);
    sleeve.position.y = sh / 2; s.add(sleeve);
    if (i % 3 === 0) for (let k = 0; k < 3; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 2), barn);
      const a = R() * Math.PI * 2; b.position.set(Math.cos(a) * w * 0.5, 0.1 + R() * 0.25, Math.sin(a) * d * 0.5); b.scale.y = 0.7; s.add(b);
    }
    s.position.set(xs[i], 0, zc(xs[i]));
    s.rotation.set((R() - 0.5) * 0.12, -Math.atan(dz(xs[i])), (R() - 0.5) * 0.12);
    g.add(s); stakes.push(s);
  }

  // kelp ribbon: flattened cone hanging from a point, splayed
  const ribbon = (x, y, z, len, tiltX, tiltZ, yaw, up = false, wid = 0.06) => {
    const geo = new THREE.ConeGeometry(wid, len, 3, 1, true); geo.translate(0, up ? len / 2 : -len / 2, 0); geo.scale(1, 1, 0.35);
    const m = new THREE.Mesh(geo, kelp); m.position.set(x, y, z); m.rotation.set(tiltX, yaw, tiltZ); g.add(m);
  };

  // wattle runs: stake index ranges
  const runs = [[1, 5], [8, 11]];
  const ROWS = 14, A = 0.08;
  for (const [a, b] of runs) {
    let top = 9; for (let k = a; k <= b; k++) top = Math.min(top, hs[k]);
    top = Math.min(top - 0.12, 0.82);
    const y0 = 0.07, step = (top - y0) / (ROWS - 1);
    const xa = xs[a] - 0.14, xb = xs[b] + 0.14;
    const phaseAt = (x) => {
      if (x <= xs[a]) return a + (x - xs[a]) / (xs[a + 1] - xs[a]);
      for (let k = a; k < b; k++) if (x <= xs[k + 1]) return k + (x - xs[k]) / (xs[k + 1] - xs[k]);
      return b + (x - xs[b]) / (xs[b] - xs[b - 1]);
    };
    for (let r = 0; r < ROWS; r++) {
      const pts = [], S = (b - a) * 4 + 2;
      for (let j = 0; j <= S; j++) {
        const x = xa + (xb - xa) * j / S, ph = phaseAt(x);
        const off = A * Math.cos(Math.PI * ph + r * Math.PI), n = nrm(x);
        const y = y0 + r * step + 0.012 * Math.sin(x * 3.1 + r);
        pts.push(new THREE.Vector3(x + n[0] * off, y, zc(x) + n[1] * off));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, (b - a) * 4 + 2, 0.028, 4, false), r < 3 ? withyB : (r % 3 === 1 ? withyC : withyA));
      g.add(tube);
    }
    // sails: thin uprights midway between stakes
    for (let k = a; k < b; k++) {
      const x = (xs[k] + xs[k + 1]) / 2;
      const sail = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, top + 0.08, 5), wood);
      sail.position.set(x, (top + 0.08) / 2, zc(x)); g.add(sail);
    }
    // weed caught on the lower withies
    for (let k = a; k < b; k++) {
      const x = xs[k] + (xs[k + 1] - xs[k]) * (0.3 + R() * 0.4), n = nrm(x);
      for (let q = 0; q < 3; q++) ribbon(x + (R() - 0.5) * 0.12 + n[0] * 0.1, y0 + step * (5.5 + R() * 2), zc(x) + n[1] * 0.1, 0.22 + R() * 0.1, 0.25 + R() * 0.3, (R() - 0.5) * 0.6, R() * 3, false, 0.085);
    }
  }
  // weed at stake feet
  for (let i = 0; i < N; i++) {
    if (i % 2 === 1 && i !== 7) continue;
    const n = nrm(xs[i]);
    for (let q = 0; q < 3; q++) {
      const side = q === 1 ? -1 : 1;
      ribbon(xs[i] + (R() - 0.5) * 0.1 + n[0] * 0.1 * side, 0.04, zc(xs[i]) + n[1] * 0.1 * side, 0.3 + R() * 0.14, side * (0.3 + R() * 0.3), (R() - 0.5) * 0.6, R() * 3, true);
    }
  }

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
