import * as THREE from '/Users/atlas/404_assetlib/vendor/three/three.module.js';
const f = (await import(process.argv[2])).default; const g = f(THREE); g.updateMatrixWorld(true);
g.children.forEach((c, i) => { const b = new THREE.Box3().setFromObject(c, true); console.log(i, c.geometry?.type, b.min.y.toFixed(3), b.max.y.toFixed(3)); });
console.log('wl', g.userData.waterline);
