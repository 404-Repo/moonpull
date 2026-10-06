# Critic 5 verdict: "which side looks more like a made thing"

Method: every pair read at native size, then each side cropped to its content and enlarged to 1000 px tall (scratch: /private/tmp/critic5c). KEY files and the rest of the repo were not opened. The "common game" below means the sea-slider game (SEA lever bottom right, serif quest card top left, small backpacker seen from behind). It is in all 14 pairs. I can tell which side it is from what is on screen, and that does not change the judging.

## Set BAR (8 pairs)

| # | Pick | Margin | Reason (pixel-visible) |
|---|------|--------|------------------------|
| 1 | LEFT | clear | L: readable harbour vista, textured roofs and stonework, sea behind. R: a rope or pole cuts across the camera, the dialogue box sits mid-screen, and the hero is a small figure in a big empty board floor. |
| 2 | LEFT | clear | L: a causeway leading into depth, a title card, warm low sun. R: the camera is jammed into the hero, whose body is cut off at the right edge, and two text panels cover the top third. |
| 3 | LEFT | clear | L: dappled tree shadows, a cargo net and a stilt house with real detail. R: the camera faces a wall at point-blank range, an untextured brown box fills the foreground and the hero has his back to the view. |
| 4 | LEFT | decisive | L (landscape, and the shape helped): a dense, deliberate plaza with NPCs, lamps, awnings, flowerbeds and one palette. R: flat sand with props scattered at random, and the wreck pushed up against the HUD. |
| 5 | RIGHT | slight | L: a big hero in a running pose and a gate landmark, but the floor is a blank grey slab with seams and the cliffs are faceted and untextured. R: warm, coherent beach, raft and crabs, though the sand shows banded ripple artifacts. |
| 6 | LEFT | slight | L: sunset sea surface sells the scene, but the boat cabin is crude and the sail is a white lozenge. R: a tutorial panel covers the hero, the hero is cropped at bottom right, and a third grey slab floor. |
| 7 | RIGHT | decisive | R: one strong style throughout (posterized toon shading, halftone, bespoke LED HUD, a JP callout chip, a styled car). L: a grey, untextured blob of a boat-creature on flat water, and a smeared cliff texture. |
| 8 | RIGHT | clear | R: the same authored style, with a road vanishing to a sunset and designed HUD chrome. L: the crab boss is the best asset this game has, but it stands on a featureless lawn with a flat water strip behind it. |

The common game won 1 of 8 (pair 5, slight) and lost 7 of 8, two of them decisively.

**What the preferred BAR frames share:**
- One rendering language applied to every pixel: the toon or posterized racer, and the illustrated Canopy plaza with its consistent outline weight and palette.
- Detail and props spread across the whole frame, the midground and foreground included, so there is no large empty plane.
- The camera frames a composed scene with a leading line (a road, a boardwalk curve) and the hero sits within it, neither cropped nor jammed against a wall.
- UI that is bespoke chrome (LED counters, round handbrake) or sits at the frame edges, rather than generic dark rounded boxes over the middle of the view.

## Set FLOOR (6 pairs)

| # | Pick | Margin | Reason (pixel-visible) |
|---|------|--------|------------------------|
| 1 | LEFT | clear | L: textured roofs, cobbles and stone wall. R (landscape, and the shape helped): a nice dusk vista, but the houses are flat-colour boxes, the dialogue box is cut off at the bottom and debug-style hint text shows. |
| 2 | RIGHT | clear | R: a textured causeway with posts and a title card. L: blurry, featureless sand dunes, the hero is a capsule-like figure, and a dialogue bar covers the bottom 20%. |
| 3 | LEFT | clear | L: sparse, but the wreck, crates and grass tufts are real assets. R: bare sand, untextured grey cubes, a basic well and a hero with no detail. |
| 4 | RIGHT | clear | R: a textured raft, stone stacks and crabs. L: the wreck is one dark untextured hull, the sand is blank and "drag right side up/down" is printed on screen. |
| 5 | RIGHT | slight | L: a pleasant teal sea, but two blocky figures stand on the water surface with nothing else in the frame. R: a crude cabin boat, but the sea, the sail and the sandstone arch at least read as authored. |
| 6 | RIGHT | clear | L: the best floor frame, with a lighthouse islet and a figure in a boat, though everything is flat-shaded and untextured. R: a creature with real authored detail (claws, shell-boat, plants). |

The common game won 6 of 6 (LEFT in pairs 1 and 3, RIGHT in pairs 2, 4, 5 and 6), five clear and one slight. The landscape frames made the floor game look bigger and airier, but that did not save it.

**What the preferred FLOOR frames share:**
- Surface texture: shingles, cobbles, wood grain and sand detail, set against flat Gouraud colour fills.
- Assets that are actual models (crabs, a raft, a shell-boat creature) rather than primitives (cubes, a single hull shell, capsule people).
- No debug or instruction text on screen, and no dialogue box cut off at the frame edge.

## The single fix that would most change each verdict

**BAR**

| # | Left side: fix | Right side: fix |
|---|----------------|-----------------|
| 1 | Hero model (chunky placeholder figure seen from behind) | Camera occluded by rope/pole + mid-screen dialogue |
| 2 | Hero still tiny in a large empty ground plane | Camera distance (hero cropped at frame edge) |
| 3 | Camera pitch, which shows mostly bare dirt | Camera facing a wall + untextured box |
| 4 | Rope lines crossing the camera | Empty sand mid-ground (density) |
| 5 | Grey untextured floor slab | Sand ripple banding + empty ground |
| 6 | Crude boat cabin and sail | Tutorial panel covering the hero |
| 7 | Untextured grey creature or boat | Dark lower half (road loses detail) |
| 8 | Featureless lawn and water strip | Low-res bokeh blobs around the car |

**FLOOR**

| # | Left side: fix | Right side: fix |
|---|----------------|-----------------|
| 1 | Placeholder hero | Untextured flat-colour houses |
| 2 | Untextured blurry dunes | Low-res smeared cobbles |
| 3 | Empty sand mid-ground | Untextured cubes on bare sand |
| 4 | Single untextured hull + debug text | Sand ripple banding |
| 5 | Figures standing on the water with no props | Crude boat cabin |
| 6 | Flat-shaded, untextured everything | Empty lawn under the boss |

## The common game: the one property to change first

**The walkable ground plane, which needs material detail and set-dressing density.** In nearly every frame, the bottom 40 to 60% of the screen is the hero's ground. Today that is smeared sand with banded ripples, blurred low-res cobbles, a flat lawn or an empty water strip, with almost nothing placed on it. The rivals that beat it (the Canopy plaza, the toon racer) keep that same region busy with authored surface (board grain, laid stones, road markings) and props. The common game's best moments (pair 4 R's wreck, pair 8's crab, pair 1's houses) all sit at the top of the frame or on the horizon. The player looks at the empty part, and that part decides "made thing" versus "tech demo".

Fixing the ground covers what was asked for: a crisp, high-frequency ground material with no ripple banding, plus a hand-placed band of foreground props (shells, rope, puddles, planks, tufts). The placeholder-looking hero is a close second. It would rank first if the camera came close enough to make the hero the subject, and it does not.

Harsh summary: as a set of good assets, the common game clearly beats the floor. It loses to the bar because it has no single rendering style and its frames do not look composed.
