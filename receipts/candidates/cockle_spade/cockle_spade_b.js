// cockle_spade, candidate B: profiles. The blade is one extruded outline (square shoulders, slight
// taper, rounded point) with its bevel subtracted from the drawing; the socket and shaft are lathe
// sweeps with a swelling grip and ferrule rings; the D handle is an extruded ring with a hole.
// Lying flat on its back, 0.9 m long, blade toward +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, r = 0.85, extra = {}) => { const x = new THREE.MeshStandardMaterial({ color, roughness: r, ...extra }); if (name) x.name = name; return x; };
  const iron = M(0x3a3d40, 'metal', 0.6, { metalness: 0.4 }), steel = M(0x8a8d8e, 'metal', 0.45, { metalness: 0.5 });
  const ash = M(0xb79773, 'timber', 0.8), dark = M(0x7b5a3e, 'timber', 0.75);
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; g.add(o); return o; };
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const bev = 0.005;
  // blade outline in (x, length) drawn inside the bevel, then laid flat (extrude depth = thickness)
  const sh = new THREE.Shape();
  const w = 0.095 - bev;
  sh.moveTo(-0.03, 0); sh.lineTo(-w, 0.02); sh.lineTo(-w + 0.01, 0.2);
  sh.quadraticCurveTo(-w + 0.015, 0.29, 0, 0.31); sh.quadraticCurveTo(w - 0.015, 0.29, w - 0.01, 0.2);
  sh.lineTo(w, 0.02); sh.lineTo(0.03, 0); sh.lineTo(-0.03, 0);
  const T = 0.014;
  const blade = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 1, curveSegments: 6 });
  add(blade, iron, 0, bev, 0.13, Math.PI / 2, 0, 0).scale.set(1, 1, -1);
  // bright cutting edge: a thin sweep following the tip
  const edge = new THREE.Shape(); edge.moveTo(-w + 0.01, 0.2); edge.quadraticCurveTo(-w + 0.015, 0.29, 0, 0.31); edge.quadraticCurveTo(w - 0.015, 0.29, w - 0.01, 0.2);
  edge.lineTo(w - 0.03, 0.2); edge.quadraticCurveTo(w - 0.04, 0.27, 0, 0.285); edge.quadraticCurveTo(-w + 0.04, 0.27, -w + 0.03, 0.2); edge.lineTo(-w + 0.01, 0.2);
  add(new THREE.ExtrudeGeometry(edge, { depth: 0.004, bevelEnabled: false, curveSegments: 6 }), steel, 0, T + 2 * bev, 0.13, Math.PI / 2, 0, 0).scale.set(1, 1, -1);
  // socket (lathe along the shaft axis, laid along -Z)
  const lay = (geo, mat, z, y = 0.028) => add(geo, mat, 0, y, z, -Math.PI / 2, 0, 0);
  lay(new THREE.LatheGeometry([V2(0.0, 0), V2(0.048, 0), V2(0.04, 0.04), V2(0.03, 0.13), V2(0.031, 0.15), V2(0.0, 0.15)], 10), iron, 0.16);
  // shaft with a slight swell, then a ferrule and the D handle cheeks
  lay(new THREE.LatheGeometry([V2(0.0, 0), V2(0.024, 0), V2(0.025, 0.2), V2(0.023, 0.38), V2(0.026, 0.42), V2(0.0, 0.42)], 10), ash, 0.02);
  lay(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10).rotateX(Math.PI / 2).rotateX(-Math.PI / 2), iron, -0.39);
  // D handle: extruded ring with an inner hole, lying flat
  const D = new THREE.Shape(); D.moveTo(-0.02, 0); D.lineTo(-0.075, -0.07); D.quadraticCurveTo(-0.08, -0.13, 0, -0.135); D.quadraticCurveTo(0.08, -0.13, 0.075, -0.07); D.lineTo(0.02, 0); D.lineTo(-0.02, 0);
  const hole = new THREE.Path(); hole.moveTo(-0.035, -0.075); hole.lineTo(0.035, -0.075); hole.lineTo(0.04, -0.1); hole.quadraticCurveTo(0, -0.11, -0.04, -0.1); hole.lineTo(-0.035, -0.075); D.holes.push(hole);
  add(new THREE.ExtrudeGeometry(D, { depth: 0.04, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 1, curveSegments: 5 }), dark, 0, 0.006, -0.39, Math.PI / 2, 0, 0).scale.set(1, 1, -1);
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
