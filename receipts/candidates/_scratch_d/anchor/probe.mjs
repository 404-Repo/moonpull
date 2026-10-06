import * as THREE from '/Users/atlas/3dbench/node_modules/three/build/three.module.js';
const f = process.argv[2];
const g = (await import(f + '?' + Date.now())).default(THREE);
g.updateMatrixWorld(true);
const v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
let tris = 0;
g.traverse((n) => {
  if (!n.isMesh) return;
  const p = n.geometry.attributes.position; const box = new THREE.Box3();
  const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
  const t = (n.geometry.index ? n.geometry.index.count : p.count) / 3;
  if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } tris += t * n.count; }
  else { put(n.matrixWorld); tris += t; }
  console.log(n.geometry.type.padEnd(22), (n.isInstancedMesh ? 'x' + n.count : '').padEnd(5), 'miny', box.min.y.toFixed(3), 'maxy', box.max.y.toFixed(3));
});
console.log('tris', tris);
