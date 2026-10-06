# gull: picked C (1,186 tris, verify ok, 1.302 x 0.168 x 0.500 m)

C won by eye after four iterations. Its wings are lofted from cambered airfoil sections with a thick, rounded leading edge and a thin trailing edge, so they read as real wings rather than slabs, edge-on and in 3/4. Four separate lofted secondaries give the scalloped trailing edge of the reference. Four black primaries sweep back from the hand and close to a gull's point. The torso is a sculpted sphere with a deep chest and tapering rump under a grey mantle.

Iterations, kept in _scratch_d/gull:
- v1, 1,644 tris: five primaries splayed like a raptor's fingers, and the driftwood saddle was a box on the back.
- v2, 1,498 tris: the curved driftwood staves read as bee stripes from above.
- v3: the hand was blunt and square in the top view.
- Final: the hand's leading edge is swept, the primaries rotate back as a group, the span is trimmed to 1.30 m, and the hidden root caps on the feathers are dropped.

Why the others lost:
- A (primitives, 4,202 tris): rounded capsule feathers read the most like the clay reference. But it is 3.5x the 1,200 budget for a dozen-on-screen prop, its hand is a box, and its depth is 18% over (0.53 m).
- B (lathe body plus extruded planforms, 1,270 tris): has the cleanest pointed silhouette. But its sawtooth scallops look pixel-stepped up close, the wings are flat slabs edge-on, and it is over budget.

Deliberate deviation from the reference: the reference shows a carved driftwood saddle on the gull's back. Both attempts at it read wrong from the game's above-camera, as a backpack box and then as stripes. C uses a plain grey mantle instead, which joins the wings into one grey upper surface the way a real gull's back does.

## Joints

Proven in pose_proof_c.png, loaded through game/assetlib.js `ASSET(url, {keepHierarchy:true})` via _scratch_d/gull/pose_gull.html with `missing: []`.
- Row 1 is the rest pose from top, below 3/4, game camera and head close-up.
- Row 2 is the upstroke (wing +0.7, tip -0.25) and the downstroke (wing -0.55, tip -0.35), from front and 3/4.
- No tearing at the shoulder or wrist.

The hierarchy is body > head, body > wingL > wingTipL, and body > wingR > wingTipR. Every joint is a Group at its pivot:
- shoulders at x = ±0.05, on the back
- wrists 0.28 m out along each wing
- the neck at the front of the torso

Axes. L is the bird's left, on +X, since it faces +Z.
- **Flap:** rotation.z on wingL and wingR. Positive lifts wingL; negative lifts wingR. The rest pose bakes a glide dihedral (wingL +0.1, wingR -0.1), so add to it rather than setting it.
- **Tip bend:** rotation.z on wingTipL and wingTipR, same sign rule as the flap (positive lifts the L tip, negative lifts the R tip). The rest pose bakes the gull "M" droop (wingTipL -0.16, wingTipR +0.16). Lagging the tip behind the shoulder by a quarter cycle gives a natural flap.
- **head:** rotation.y turns and rotation.x pitches. A positive rotation.x pitches the beak down.
- **body:** rotation.z banks and rotation.x pitches. Translate it for bob.

Flock cost: twelve gulls with keepHierarchy are about 30 meshes each. Bake per joint (5 groups) to about 6 draws each if the flock gets expensive.

## Known weaknesses

- The underside is the same grey and white as the top. Real gulls are pale beneath, and from directly below the wings read darker than they should under a warm ground bounce.
- The faceted low-poly head and body are flat-shaded where the reference is soft clay.
- There are no legs or feet modelled (tucked out of sight in flight).
- Feathers use the `fabric` surface name because no recipe fits, and colour inference would have made them stone or plaster.
