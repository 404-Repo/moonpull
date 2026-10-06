import * as THREE from 'three';
const mod = await import('file://' + process.argv[2]);
const g = mod.default(THREE);
g.traverse((n) => { if (n.isMesh && n.material.name === 'tile') { const p = n.geometry.attributes.position, q = n.geometry.attributes.normal; let up = 0, dn = 0;
  for (let i = 0; i < q.count; i++) { if (q.getY(i) > 0.3) up++; else if (q.getY(i) < -0.3) dn++; } console.log('verts', p.count, 'up', up, 'down', dn); } });
