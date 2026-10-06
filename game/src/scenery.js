// Landmarks that must be on the horizon from the very first frame: the dark lighthouse on the
// Stack (the goal), the arches of Gull Head, the reefs.
import * as THREE from 'three';

export async function buildScenery(ctx) {
  const { put, world, scene } = ctx;
  const lh = await put('lighthouse', 220, -72, { rot: Math.PI * 0.85, raw: true });
  if (lh) {
    lh.position.y = world.terrain(220, -72) - 0.3;
    lh.traverse((o) => { if (o.material && o.material.name === 'beacon') { ctx.beacon = o.material; o.material.emissiveIntensity = 0; } });
  }
  const beamLight = new THREE.PointLight(0xffe2a0, 0, 120, 1.6);
  beamLight.position.set(220, world.terrain(220, -72) + 22.5, -72);
  scene.add(beamLight);
  ctx.beaconLight = beamLight;
  // reefs scattered off the Stack and round Gull Head
  for (const [x, z, r] of [[198, -40, 0.4], [236, -44, 2.1], [206, -84, 1.2], [160, -52, 0.9], [140, -64, 2.6], [176, -70, 0.3], [-70, -60, 1.0], [-140, -40, 2.0], [10, -100, 0.6]]) {
    await put('sea_stack_rocks', x, z, { rot: r });
    world.solid({ x, z, r: 2.4 });
  }
}
