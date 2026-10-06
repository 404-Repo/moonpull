  // ---- dressing: barnacles low and mid, moss on ledges, bird-lime on top, kelp in the joints
  g.updateMatrixWorld(true);
  const down = (x, z) => hit(x, 12, z, x, 0, z);
  for (let i = 0; i < 9; i++) barnacles(shoot(0.3, -0.5, rr(0, Math.PI * 2), rr(0.5, 2.6)), 5 + Math.floor(rr(0, 5)));
  for (let i = 0; i < 4; i++) barnacles(shoot(-1.9, 0.5, rr(-1.2, 2.6), rr(0.25, 0.8)), 5);
  for (let i = 0; i < 3; i++) barnacles(shoot(-0.2, 1.5, rr(-0.3, 3.4), rr(0.2, 0.5)), 4);
  for (let i = 0; i < 3; i++) barnacles(shoot(0.6, -1.6, rr(3.6, 5.8), rr(0.2, 0.6)), 4);
  for (const [x, z, w] of [[-1.9, 0.45, 0.9], [-0.25, 1.45, 0.7], [-0.6, -0.35, 0.6], [1.35, -0.15, 0.7], [0.6, -1.6, 0.8], [0.2, -0.4, 0.6]]) patch(down(x + rr(-0.2, 0.2), z + rr(-0.2, 0.2)), kelp, w, w * 0.7);
  for (let i = 0; i < 6; i++) patch(shoot(0.3, -0.5, rr(0, Math.PI * 2), rr(1.4, 2.6)), kelp, rr(0.3, 0.5), rr(0.35, 0.6));
  
  for (let i = 0; i < 9; i++) patch(shoot(0.05, -0.5, rr(0, Math.PI * 2), rr(2.6, 3.4)), lime, rr(0.22, 0.34), rr(0.45, 0.8));
  for (const [x, z, n, len] of [[-0.95, 0.9, 8, 1.05], [1.0, 0.6, 6, 0.85], [1.6, -1.35, 6, 0.8], [-1.25, -1.15, 6, 0.75], [-2.7, 1.15, 5, 0.6], [0.8, 1.8, 5, 0.55]]) kelpClump(x, z, n, len);
  { const s = down(-0.65, -0.3); if (s) kelpClump(-0.65, -0.3, 4, 0.5, s.p.y - 0.05); }
  { const s = down(1.35, -0.1); if (s) kelpClump(1.35, -0.1, 3, 0.45, s.p.y - 0.05); }
