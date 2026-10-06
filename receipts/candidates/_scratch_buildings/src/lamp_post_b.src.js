// lamp_post B: profiles. Lathe plinth-foot, lathed octagonal collars, extruded flat scroll bracket plate, lathed hex lantern with domed cap.
//@@KIT
export default function (THREE) {
  const g = new THREE.Group();
  const K = makeKit(THREE, 23);
  const { boxB, lathe, extrude, put, T } = K;
  boxB('stone', 0.8, 0.42, 0.8, 0, 0, 0, 0, 0.08);
  // post: extruded square with chamfer profile, along Y
  extrude('iron', [[-0.11, -0.08], [-0.08, -0.11], [0.08, -0.11], [0.11, -0.08], [0.11, 0.08], [0.08, 0.11], [-0.08, 0.11], [-0.11, 0.08]], 2.66, T(0, 0.42 + 1.33, 0, -Math.PI / 2, 0, 0));
  // lathed octagonal collars and foot
  lathe('iron', [[0, 0], [0.24, 0], [0.24, 0.05], [0.17, 0.14], [0, 0.14]], 8, T(0, 0.42, 0, 0, Math.PI / 8, 0));
  for (const y of [1.5, 2.6]) lathe('iron', [[0, 0], [0.15, 0], [0.19, 0.04], [0.19, 0.08], [0.15, 0.12], [0, 0.12]], 8, T(0, y, 0, 0, Math.PI / 8, 0));
  lathe('iron', [[0, 0], [0.2, 0], [0.2, 0.06], [0.12, 0.12], [0.06, 0.2], [0, 0.22]], 8, T(0, 3.0, 0, 0, Math.PI / 8, 0));
  // bracket: extruded plate (XY plane, thin in z) top bar + double scroll silhouette
  const arc = (cx, cy, r, a0, a1, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
  extrude('iron', [[0.08, 2.86], [1.06, 2.86], [1.06, 2.96], [0.08, 2.96]], 0.08, T(0, 0, 0), 0);
  // scroll spirals as extruded thick ribbons (spiral outer edge + inner edge)
  const spiral = (cx, cy, r0, r1, turns, dir) => { const outer = [], inner = []; const n = 22; for (let i = 0; i <= n; i++) { const t = i / n; const a = dir * t * turns * Math.PI * 2; const r = r0 + (r1 - r0) * t; outer.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); inner.push([cx + Math.cos(a) * (r - 0.04), cy + Math.sin(a) * (r - 0.04)]); } return outer.concat(inner.reverse()); };
  extrude('iron', spiral(0.32, 2.7, 0.17, 0.05, 0.85, 1), 0.06, T(0, 0, 0));
  extrude('iron', spiral(0.72, 2.71, 0.15, 0.05, 0.85, -1), 0.06, T(0, 0, 0));
  K.beam('iron', [0.1, 2.38, 0], [0.5, 2.86, 0], 0.05, 0.05, 0.01);
  // hook + chain
  for (let i = 0; i < 3; i++) put('iron', new THREE.TorusGeometry(0.045, 0.014, 4, 8), T(1.0, 2.79 - i * 0.08, 0, 0, i % 2 ? Math.PI / 2 : 0, 0));
  // lantern by lathe, hex (6 segments)
  const lx = 1.0, ly = 1.78;
  lathe('iron', [[0, -0.06], [0.08, -0.06], [0.14, 0], [0.24, 0.02], [0.24, 0.08], [0.2, 0.08], [0, 0.08]], 6, T(lx, ly, 0));
  lathe('lampglow', [[0.195, 0.08], [0.25, 0.54], [0, 0.54]].reverse().concat([]).reverse(), 6, T(lx, ly, 0));
  lathe('iron', [[0, 0.54], [0.3, 0.54], [0.3, 0.6], [0.2, 0.66], [0.17, 0.74], [0.12, 0.8], [0.05, 0.83], [0.035, 0.92], [0, 0.92]], 6, T(lx, ly, 0));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; K.beam('iron', [lx + Math.cos(a) * 0.2, ly + 0.08, Math.sin(a) * 0.2], [lx + Math.cos(a) * 0.255, ly + 0.55, Math.sin(a) * 0.255], 0.04, 0.04, 0.01); }
  // glass needs a floor and cap: discs
  K.cyl('lampglow', 0.19, 0.19, 0.02, 6, lx, ly + 0.09, 0);
  K.finish(g);
  g.children.forEach((m) => { if (m.material.name === 'lampglow' || m.material.name === 'metal') m.material.side = THREE.DoubleSide; });
  return recentre(THREE, g);
}
