// Merge a jointed model per joint: every mesh that moves with one joint becomes one mesh per
// material in that joint's space, so a character keeps its limbs and loses most of its draw calls
// (asset-contract.md, "Anything that moves"). Uses the canonical loader's bakeStatic for the merge
// itself, so instanced parts and colour attributes survive exactly as they do for static props.
import * as THREE from 'three';
import { bakeStatic } from '../assetlib.js';

export function mergePerJoint(root) {
  const joints = new Set(Object.values(root.userData.joints || {}).filter(Boolean));
  if (!joints.size) return root;
  const hasJoint = (o) => { let f = false; o.traverse((n) => { if (n !== o && joints.has(n)) f = true; }); return f; };
  root.updateMatrixWorld(true);
  const owners = [root, ...joints];
  for (const J of owners) {
    const take = [];
    const walk = (node) => {
      for (const c of node.children) {
        if (joints.has(c)) continue;
        if (c.isLight) continue;
        if (hasJoint(c)) walk(c); else take.push(c);
      }
    };
    walk(J);
    if (take.length < 2) continue;
    const inv = new THREE.Matrix4().copy(J.matrixWorld).invert();
    const tmp = new THREE.Group();
    for (const c of take) {
      const k = c.clone(true);
      k.matrixAutoUpdate = false;
      k.matrix.multiplyMatrices(inv, c.matrixWorld);
      k.matrix.decompose(k.position, k.quaternion, k.scale);
      k.matrixAutoUpdate = true;
      tmp.add(k);
      c.parent.remove(c);
    }
    tmp.updateMatrixWorld(true);
    const merged = bakeStatic(tmp);
    for (const m of [...merged.children]) J.add(m);
  }
  return root;
}
