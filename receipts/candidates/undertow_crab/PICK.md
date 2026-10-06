# undertow_crab: picked C (10,596 tris, verify ok, 9.91 x 9.15 x 13.13 m)

C won by eye because it is the only candidate where the shell is clearly the harbour's fishing boat turned keel up. It reuses the vertex-built clinker hull from fishing_boat.js (strakes, red rim stripe, transom, keel and stem), and the crab underneath is the shore crab grown up: a faceted crenellated carapace, hex leg segments with knuckles, flat-shaded and in the same reds. Barnacle clusters, draped weed, kelp ribbons, red and blue coral, a rope over the hull and a snapped rudder at the transom sit on the hull. The front three-quarter view matches the reference read: shell tilted front-up, face and glowing eyes under the bow rim, crusher held across the front.

- A (primitives, 20,164 tris by the verifier, over the 20k budget). Smooth sphere-and-capsule crab under a plank-box half barrel with the reference's teal paint. The planks read as a covered wagon, not a hull, a closed half-cone nose sits over the face, and the pink abdomen shows through the transom gaps from behind.
- B (sweeps, 12,242 tris). Lathe-spindle limbs with extruded toothed chelae, which give the strongest claw silhouette of the three. The half-lathe hull reads as a helmet or turtle shell, though, because the strake bands do not show and the keel tube floats.

One iteration on C after the first sheet. The hull got a rounder section and a 0.26 rad front-up pitch. It was shortened to 7.4 m and moved forward over the carapace. The crab was scaled up by 1.22 and the legs made chunkier and crouched. The claws were pulled in, which took the length from 15.8 m to 13.1 m. The crusher now scales 1.15 against 0.70, and the fingers and teeth were thickened.

Joints proven through game/assetlib.js `ASSET(url, {keepHierarchy:true})`, with an empty missing list and every joint a Group. The proofs were rendered with receipts/candidates/_scratch_boss/view.html and view.mjs, adapted from the _scratch_chars pose page:
- pose_proof_claws.png: claws raised, pincers open.
- pose_proof_noshell.png: shell hidden, showing the finished pale-pink curled abdomen with bands and tail fan.
- pose_proof_stride.png: legs mid-stride.

## Joint axes (crab's left = +X, front = +Z)

| joint | pivot | motion |
|---|---|---|
| body | under carapace, root child | bob: position.y; tilt: rotation.z/x. Carries claws, legs, eyes |
| shell | boat rim centre, root child | lift: position.y +; drift: position/rotation freely. Body is finished without it |
| clawL / clawR | shoulder | raise: rotation.x NEGATIVE (both); swing in/out: rotation.y |
| clawLPincer / clawRPincer | dactyl hinge, top of palm | open: rotation.x NEGATIVE (0.6 = wide); 0 = closed |
| eyeL / eyeR | stalk base | sway: rotation.z (+ tilts L outward, - tilts R outward); nod: rotation.x |
| legL0..2 / legR0..2 | body side (0 = front) | lift: rotation.z (+ for L, - for R); stride: rotation.y (rest yaw is baked, so add to it, do not set it) |

clawR (on -X) is the crusher at 1.15x hand scale, against 0.70x on clawL.

## Weaknesses
- 279 meshes and 14 materials. Loaded with keepHierarchy, that costs a lot of draw calls. Bake it per joint (14 joints) before it goes in the scene, as the contract advises.
- The bow stem drops vertically between the eye stalks in the pure front view.
- The hull is the fishing boat's slate blue with a red stripe, not the reference's teal. This was kept deliberately for palette and set coherence.
- Each leg has one joint, so a stride swings the whole leg rather than bending at the knee, the same limitation as the shore crab.
- The shell's open underside shows a few thwart and rib pieces. They read fine, but nothing models the inside of the deck.
