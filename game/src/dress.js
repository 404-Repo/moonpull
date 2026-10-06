// Dressing: what makes Gullwick a lived-in place rather than houses on a lawn. Walls and fences
// along the street, laundry between houses, nets and a fish stall on the square, flowers on
// porches, pines and gorse on the benches, big rocks breaking the cliff face, kelp on the
// low beach that the tide uncovers.
export async function dressHarbour(ctx) {
  const { put, world } = ctx;
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const T = world.terrain;

  // the square: stall, nets, planters
  await put('market_stall', -158, 46.5, { rot: 0.25 }); world.solid({ x: -158, z: 46.5, hw: 1.6, hd: 1.0, rot: 0.25 });
  await put('net_rack', -141.5, 45.5, { rot: -0.1 }); world.solid({ x: -141.5, z: 45.5, hw: 1.8, hd: 0.4, rot: -0.1 });
  await put('net_rack', -136, 37.5, { rot: 0.1 }); world.solid({ x: -136, z: 37.5, hw: 1.8, hd: 0.4, rot: 0.1 });
  await put('net_rack', -170, 31.5, { rot: -0.3 }); world.solid({ x: -170, z: 31.5, hw: 1.8, hd: 0.4, rot: -0.3 });

  // the street's sea side: a dry-stone wall broken by the ramps, fences on the upper lane
  const wallRun = async (x0, x1, z, rot = 0) => { for (let x = x0; x + 4 <= x1; x += 4) { await put('stone_wall', x + 2, z, { rot }); world.solid({ x: x + 2, z, hw: 2, hd: 0.35, rot }); } };
  await wallRun(-194, -154, 42.2); await wallRun(-146, -122, 42.2); await wallRun(-108, -96, 42.0);
  const fenceRun = async (x0, x1, z) => { for (let x = x0; x + 3 <= x1; x += 3) { await put('picket_fence', x + 1.5, z, { rot: 0 }); world.solid({ x: x + 1.5, z, hw: 1.5, hd: 0.15 }); } };
  await fenceRun(-108, -99, 33.5);   // a little yard by the boathouse

  // laundry between the bench-two houses and on the shore stilts
  for (const [x, z, r] of [[-180.5, 69, 0.05], [-157, 70, -0.05], [-133, 69.5, 0.1], [-182.5, 34, 0.3], [-126.5, 36, -0.2]]) {
    await put('laundry_line', x, z, { rot: r }); world.solid({ x: x - 2, z, r: 0.2 }); world.solid({ x: x + 2, z, r: 0.2 });
  }
  // planters on porches and walls
  for (const [x, z, r] of [[-152, 45.6, 0], [-147, 45.6, 0], [-163, 47.8, 0.2], [-136, 45.4, 0], [-118, 45.2, 0.1], [-175, 45.4, 0]]) await put('flower_planter', x, z, { rot: r });

  // pines and gorse on the benches and the cliff top
  for (let i = 0; i < 16; i++) {
    const x = -200 + rnd() * 100, z = 76 + rnd() * 30;
    await put('windswept_pine', x, z, { rot: rnd() * 6, scale: 0.8 + rnd() * 0.6 });
  }
  for (const [x, z] of [[-196, 52], [-104, 54], [-108, 64], [-194, 66], [-171, 61], [-118, 61]]) { await put('windswept_pine', x, z, { rot: rnd() * 6, scale: 0.9 + rnd() * 0.3 }); world.solid({ x, z, r: 0.5 }); }
  for (let i = 0; i < 90; i++) {
    const x = -205 + rnd() * 115, z = 38 + rnd() * 40;
    const h = T(x, z);
    if (h < 2.5) continue;
    let near = false; for (const s of world.solids) if (Math.hypot(s.x - x, s.z - z) < 3.2) { near = true; break; }
    if (near) continue;
    if (Math.abs(z - 48) < 6.5 || Math.abs(z - 62) < 5) continue;   // keep the street and the lane open
    await put('shrub_clump', x, z, { rot: rnd() * 6, scale: 0.6 + rnd() * 0.7 });
  }
  // a few boulders fallen at the cliff foot
  for (let i = 0; i < 7; i++) {
    const x = -200 + i * 15 + rnd() * 6, z = 73 + rnd() * 2;
    await put('sea_rock', x, z, { rot: rnd() * 6, scale: 1.1 + rnd() * 0.5, foot: 1.5 });
    world.solid({ x, z, r: 2.2 });
  }
  // shore rocks and kelp the low tide uncovers
  for (let i = 0; i < 18; i++) {
    const x = -205 + rnd() * 140, z = 8 + rnd() * 20;
    const h = T(x, z);
    if (h > 0.6 || h < -2.6) continue;
    if (Math.abs(x + 112) < 10 && z < 30) continue;   // keep the causeway head clear
    const big = rnd() < 0.3;
    await put(big ? 'sea_rock' : 'kelp_clump', x, z, { rot: rnd() * 6, scale: big ? 0.8 + rnd() * 0.5 : 1 });
    if (big) world.solid({ x, z, r: 1.6 });
  }
  // the stairs up to the upper lane
  await put('cliff_stairs', -145, 56, { rot: Math.PI, raw: true }).then((o) => { if (o) o.position.y = 4.65; });
}

// The Shellflats: old fish weirs in curving rows, an anchor the wreck dropped, buoys that float
// when the sea is up and lie on the sand when it is down, tide-pool rocks and kelp.
export async function dressFlats(ctx) {
  const { put, world } = ctx;
  let seed = 23; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const [x, z, r] of [[8, -22, 0.4], [18, -30, 0.9], [-6, -40, -0.3], [72, -30, 1.4], [82, -38, 1.9], [28, -72, 0.1], [40, -76, -0.2]]) {
    await put('fish_weir', x, z, { rot: r });
  }
  await put('anchor', 36, -50, { rot: 0.8 }); world.solid({ x: 36, z: -50, r: 1.2 });
  // something every dozen metres along the two walks across the flats, off to either side
  const legs = [[[-30, 4], [40, -40]], [[52, -50], [100, -6]]];
  const kinds = ['sea_stack_rocks', 'kelp_clump', 'fish_weir', 'kelp_clump', 'rowboat', 'sea_stack_rocks', 'kelp_clump', 'buoy'];
  let k = 0;
  for (const [[ax, az], [bx, bz]] of legs) {
    const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L, nz = (bx - ax) / L;
    for (let d = 8; d < L - 6; d += 11) {
      const side = (k % 2 ? 1 : -1) * (5 + rnd() * 8);
      const x = ax + (bx - ax) * d / L + nx * side, z = az + (bz - az) * d / L + nz * side;
      const slug = kinds[k++ % kinds.length];
      if (slug === 'rowboat' || slug === 'buoy') {
        const o = await put(slug, x, z, { raw: true, rot: rnd() * 6 });
        if (o) world.floater(o, { x, z, draft: slug === 'rowboat' ? 0.14 : 0.3, rot: rnd() * 6, tiltWhenGrounded: slug === 'rowboat' ? 0.25 : 0.5, bob: 1.5 });
        continue;
      }
      await put(slug, x, z, { rot: rnd() * 6, scale: slug === 'sea_stack_rocks' ? 0.7 + rnd() * 0.7 : 1 });
      if (slug === 'sea_stack_rocks') world.solid({ x, z, r: 1.5 });
    }
  }
  for (const [x, z] of [[5, -60], [60, -66], [-15, -28], [88, -52], [20, -88], [64, -16]]) {
    const o = await put('buoy', x, z, { raw: true, rot: rnd() * 6 });
    if (o) world.floater(o, { x, z, draft: 0.3, rot: rnd() * 6, tiltWhenGrounded: 0.5, bob: 2 });
  }
  for (let i = 0; i < 40; i++) {
    const x = -20 + rnd() * 120, z = -95 + rnd() * 80;
    if (Math.hypot(x - 46, z - 46 * -1) < 14) continue;
    const r = rnd();
    const slug = r < 0.25 ? 'sea_stack_rocks' : r < 0.75 ? 'kelp_clump' : 'shrub_clump';
    if (slug === 'shrub_clump' && world.terrain(x, z) < 1.0) continue;
    await put(slug, x, z, { rot: rnd() * 6, scale: slug === 'sea_stack_rocks' ? 0.4 + rnd() * 0.4 : 0.8 + rnd() * 0.5 });
    if (slug === 'sea_stack_rocks') world.solid({ x, z, r: 1.4 });
  }
}

// more of the Marguerite: a trail of her cargo across the sand, half buried
export async function wreckDebris(ctx) {
  const { put, world } = ctx;
  let seed = 41; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const kinds = ['barrel', 'crate', 'crate', 'barrel', 'lobster_pot', 'kelp_clump'];
  for (let i = 0; i < 26; i++) {
    const t = i / 26, a = -0.6 + t * 1.6;
    const x = 46 - 12 * t * 2.2 + Math.cos(a * 3) * 5 + (rnd() - 0.5) * 6, z = -46 + 18 * t + (rnd() - 0.5) * 8;
    const slug = kinds[i % kinds.length];
    const o = await put(slug, x, z, { rot: rnd() * 6, raw: true });
    if (o) { o.position.y = world.terrain(x, z) - 0.18 - rnd() * 0.2; o.rotation.x = (rnd() - 0.5) * 0.7; o.rotation.z = (rnd() - 0.5) * 0.7; }
  }
  // more weirs in arcs, the way old flats are scored with them
  for (const [x, z, r] of [[-22, -16, 0.2], [52, -20, 1.2], [94, -30, 1.7], [60, -84, -0.4], [-2, -78, 0.5], [12, -52, 2.4]]) await put('fish_weir', x, z, { rot: r });
  // beached rowboats that float when the sea comes back
  for (const [x, z, r] of [[24, -36, 0.8], [74, -58, 2.2], [-12, -44, 1.9], [88, -20, 0.4]]) {
    const o = await put('rowboat', x, z, { raw: true, rot: r });
    if (o) world.floater(o, { x, z, draft: 0.14, rot: r, tiltWhenGrounded: 0.28, bob: 1.5 });
  }
  // rock reefs with kelp skirts
  for (let i = 0; i < 14; i++) {
    const x = -15 + rnd() * 115, z = -95 + rnd() * 75;
    if (Math.hypot(x - 46, z + 46) < 13) continue;
    await put('sea_stack_rocks', x, z, { rot: rnd() * 6, scale: 0.35 + rnd() * 0.4 });
    for (let k = 0; k < 3; k++) await put('kelp_clump', x + (rnd() - 0.5) * 4, z + (rnd() - 0.5) * 4, { rot: rnd() * 6 });
    world.solid({ x, z, r: 1.2 });
  }
}

// gulls wheel over the places you are going; merged models, banked and bobbed as a whole
export async function gulls(ctx) {
  const { put, world, scene } = ctx;
  const flock = [];
  const centres = [[-140, 20, 22], [-100, -40, 16], [40, -46, 18], [120, -20, 26], [215, -66, 34]];
  for (let i = 0; i < 12; i++) {
    const c = centres[i % centres.length];
    const o = await put('gull', c[0], c[1], { raw: true });
    if (!o) return;
    flock.push({ o, cx: c[0], cz: c[1], y: c[2] + Math.random() * 6, r: 8 + Math.random() * 14, w: (0.25 + Math.random() * 0.2) * (Math.random() < 0.5 ? -1 : 1), a: Math.random() * 6 });
  }
  world.tick((dt, t) => {
    for (const g of flock) {
      g.a += g.w * dt;
      const x = g.cx + Math.cos(g.a) * g.r, z = g.cz + Math.sin(g.a) * g.r;
      g.o.position.set(x, g.y + Math.sin(t * 0.8 + g.a) * 1.2, z);
      g.o.rotation.set(0, -g.a + (g.w > 0 ? Math.PI : 0), (g.w > 0 ? -1 : 1) * 0.35);
    }
  });
}
