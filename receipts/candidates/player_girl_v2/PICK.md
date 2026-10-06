# player_girl v2: D (B's peaked hood, refined), 7,607 tris

The problem: at the game camera (11.5 m arm in portrait, fov 42, 25.6 deg down) v1 read as a round
orange ball on a body. Reproduced first: `distance/v1_behind.png`, `distance/v1_q34.png`. The hood was a
sphere, its 0x8a5636 brown went orange under the 17.65 h sun and sat on top of the sand's own hue,
and nothing broke the outline.

Method: one parametric body (`_scratch_chars/v2/body.js`, emitted by `v2/gen.mjs`) with three readings
of the brief, judged at game distance through `game/assetlib.js` (keepHierarchy, surfaces true) and the
game's own rig (`createRig`, hour 17.65, azimuth 288), 390x844 at DPR 2, in the game's walk pose
(`_scratch_chars/gamecam.mjs`; `distance/sheet.png` has every frame plus a 3x crop).

- **A, wayfarer in the wind**: the hood pulled back into a long liripipe, red scarf, bedroll slung under
  the pack. Lost: from behind and above, a point that falls backwards is foreshortened straight at the
  camera, so the head still reads round. Strong red flag of a scarf, though.
- **B, tall peak**: crown pulled UP into a teardrop point, mustard scarf, bedroll wide on top. The only
  one whose head is not a ball at 11 m. But the 0.24 m peak read as a garden gnome on the verify sheet,
  cost 10% of body height to the 1.45 m fit, and mustard sits close to the sand.
- **C, colour only**: round hood kept, cream rim, dark lining, braids, red scarf. The control. Still a
  ball from behind, confirming silhouette, not colour, was the missing thing. Also 8,012 tris, over budget.
- **D = B refined (shipped)**: peak cut to 0.13 m, face opening widened 49 to 57 deg so the face is not
  crowded by the rim, scarf switched to red with two tails (red is the one hue the sand, cobbles, grass
  and sea never use). Body fit scale 0.933.

What changed vs v1 (all in the winner):
- Hood: a shell with the face cut out, crown drawn into a soft point, darker cooler brown 0x553020 that
  separates from sand, a light rolled rim 0xc08a55 and a dark lining (the inner shadow), wider drape.
- Scarf: red ring at the neck plus two tails on a new `scarf` joint (pivot at the back of the neck)
  streaming out past the right shoulder, the strongest mark in the behind view.
- Pack: bigger two-tone canvas pack with top flap, front pocket and buckle straps; green bedroll 0.5 m
  wide on top, wider than her shoulders; tin cup on a hook on the right side.
- Tunic saturated teal 0x13807a with a darker hem, charcoal-brown trousers so legs separate from the
  cloak, boots with a cream turned-down cuff that flashes on each stride.
- Head scaled 0.92, hair tufts at cheeks and nape, one braid over the left shoulder.

Kept: joint names and pivots (hips, spine, head, left/right Upper/Lower Arm and Leg, lantern), the
`moonstone` emissive on the lantern (radius up 0.045 to 0.047), 1.45 m, base y=0, front +Z.

Joints proven: `pose_proof_d.png` (pose.mjs: ASSET keepHierarchy, legs +-0.5, knee 0.8, arms opposite):
no tearing, lantern hangs from the right hand, all 13 joints present including `scarf`.

Note for the game: `scarf` is on `userData.joints` but `src/player.js` does not animate it yet. One line
in `animate()` would sway it, e.g. `set('scarf', 0.15 + Math.sin(this.phase) * 0.2 * a, 0, Math.sin(t * 1.3) * 0.08)`.

v1 kept at `receipts/candidates/player_girl/player_girl_v1_shipped.js`.
