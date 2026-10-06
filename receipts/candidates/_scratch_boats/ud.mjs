import * as THREE from '/Users/atlas/3dbench/node_modules/three/build/three.module.js';
for (const s of ['fishing_boat', 'rowboat', 'raft']) {
  const g = (await import('/Users/atlas/astrocade-game4/game/assets/' + s + '.js')).default(THREE);
  console.log(s, JSON.stringify(g.userData));
}
