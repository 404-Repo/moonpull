// cliff_stairs A (primitives): each tread is two or three bevelled stone slabs with staggered
// joints sitting on a solid riser block; the landing is paved with irregular flags; both flanks
// are piles of jittered sandstone boulders stepping up with the flight; timber rail on +x.
  const slabs = (z0, z1, top, k, pave) => {
    const d = z0 - z1, zc = (z0 + z1) / 2;
    mesh(new THREE.BoxGeometry(W, top - 0.12, d), rockDk, 0, (top - 0.12) / 2, zc); // body
    const n = pave ? 3 : 2; const cuts = n === 2 ? [0, 0.38 + (k % 3) * 0.12, 1] : [0, 0.32, 0.66, 1];
    for (let i = 0; i < n; i++) {
      const xa = -HW + cuts[i] * W, xb = -HW + cuts[i + 1] * W;
      if (pave) { for (let j = 0; j < 3; j++) { const za = z0 - (j / 3) * d, zb = z0 - ((j + 1) / 3) * d; mesh(new THREE.BoxGeometry(xb - xa - 0.03, 0.14, za - zb - 0.03), (i + j) % 2 ? step : stepLt, (xa + xb) / 2, top - 0.07, (za + zb) / 2, 0, (hash(i, j, 1) - 0.5) * 0.04, 0); } }
      else mesh(rbox(xb - xa - 0.025, 0.16, d, 0.045, 1), (i + k) % 3 ? step : stepLt, (xa + xb) / 2, top - 0.08, zc);
    }
  };
  STEPS.forEach((s, k) => slabs(s.z0, s.z1, s.top, k, false));
  slabs(LANDING.z0, LANDING.z1, LANDING.top, 0, true);
  flanks(0.35, 0.05);
  rail(HW - 0.1);
