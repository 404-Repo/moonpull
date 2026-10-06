# Critic 3 verdict (blind, frames only)

Method: every pair read in full, each side cropped and enlarged 2x (PIL, scratch in /private/tmp/critic3s). No KEY file, no game, no other folder opened.

"Common game" below = the portrait game with the vertical SEA slider (Gullwick Harbour / The Causeway / The Shellflats / Gull Head / The Undertow). It is in all 14 pairs.

Confound to flag: pair BAR 4 left and every FLOOR opponent are landscape captures pillarboxed next to a portrait capture. Wide frames get more scene in view; I judged the picture, not the frame size, but it helps the wide side.

## Set BAR

| Pair | Winner | Margin | Why (pixel-visible) |
|---|---|---|---|
| 01 | LEFT | slight | L: tiled roofs, chimney, stone wall, cobbles, sea, golden side light, real depth. R: rope crosses the frame diagonally, camera steep and cramped, hero readable but scene is flat plaza. |
| 02 | LEFT | clear | R: camera jammed into the floor, hero cut off at the frame edge, two text panels over the top third, white gust ring smeared over it. L: causeway with posts, surf both sides, title card; weak spot is a big blank brown path in the middle. |
| 03 | LEFT | clear | R: camera behind a wall, hero hidden by an untextured foreground box, flat grey stone. L: stilt house, net rack, dappled tree shadows on dirt. |
| 04 | LEFT | clear | L (wide): dense authored plaza, NPCs with props, lamps, mosaics, awnings, consistent palette. R: sparse sand flats, a fence and a tiny hero; most of the frame is bare ground. |
| 05 | LEFT | slight | R: big dynamic hero and a carved cliff, but the floor is flat grey tiles and the statues are coarse blocks. L: wreck, raft, stacked stones, crab companion, warm grade; the beach is a plain untextured slab. |
| 06 | RIGHT | clear | L: tutorial panel and hero's own back fill half the frame, grass blades poke over the camera. R: boat with a sail, textured sea, cliff in sunset light; the glossy SEA orb is the one ugly thing. |
| 07 | LEFT | clear | L: strong art direction (synthwave dusk, ink-line trees, CRT HUD with bespoke digit panels, detailed car). R: boss shell is a flat grey untextured dome, a dialogue card covers the lower third. |
| 08 | RIGHT | slight | R: same racer, night road, mood and HUD carry it; the bokeh blobs around the car are overdone. L: the crab boss is a proper detailed model and the cliff is textured, but the dialogue card covers the bottom 30% and the hero is not visible. |

Tally: common game wins 5/8 (01, 02, 03, 05, 06) and loses 3 (04, 07, 08). Two of its wins are slight, and two of its clear wins (02, 03) come from the opponent framing itself badly, not from the common game being stronger.

What distinguishes preferred frames (BAR):
- One clear art direction held across every surface: racer (ink line, CRT, purple-orange) and Canopy (cream stone, teal and orange accents).
- A readable subject: hero or vehicle large enough to read pose and silhouette (racer car, Canopy apprentice, desert explorer).
- Dense, specific props in the middle ground (awnings, barrels, nets, NPCs carrying things).
- Low, directional sun with long cast shadows (the common game's best property; it shows in every frame).
- Losers are mostly camera failures: occlusion, clipping into geometry, UI stacked over the action.

## Set FLOOR

| Pair | Winner | Margin | Why (pixel-visible) |
|---|---|---|---|
| 01 | LEFT | decisive | R: flat-shaded boxes, solid-colour roofs, no texture anywhere, generic purple UI pills. L: textured roofs, stone, cobbles. |
| 02 | RIGHT | decisive | L: smeared brown terrain, blurry horizon band, posts and rocks scattered with no logic. R: causeway, surf, title card. |
| 03 | LEFT | clear | R has a decent well and wreck, but the ground is untextured and the blocks are primitives. L: wreck, fence, grass tufts. Both have too much bare sand. |
| 04 | LEFT | clear | R: big wreck and good shadows, but untextured sand, rocks are bare low-poly rocks, grey "pearl" spheres. L: textured stones, raft, crab. |
| 05 | LEFT | decisive | R: blocky characters wading in a flat teal plane, toy boat, empty sea. L: textured water, sail, cliff. |
| 06 | LEFT | clear | R is its best frame (lighthouse island, dock, glow on the hull), but terrain is untextured and characters are primitives. L: crab boss with a proper model, layered cliff. |

Tally: common game wins 6/6, 3 of them decisive.

What distinguishes preferred frames (FLOOR): surface texture on terrain and buildings versus flat vertex colour; authored props with secondary detail (ropes, fences, grass, rivets) versus primitives; a styled UI versus stock pills. The floor game has a similar sunset grade, so in this set the grade is not what decides it. Material is.

## Single fix per side that would most change the verdict

| Pair | Left side | Right side |
|---|---|---|
| BAR 01 | Hero: tiny, back-facing, faceless | Camera: rope occluding, steep angle |
| BAR 02 | Ground: blank, blurry mid-path | Camera clipping into floor |
| BAR 03 | Hero size (one-tenth of frame height) | Camera behind wall, foreground box |
| BAR 04 | Hero small in a wide shot (minor) | Empty ground, tiny hero |
| BAR 05 | Untextured beach slab | Flat grey floor tiles |
| BAR 06 | Tutorial panel + camera on back | Glossy stock SEA orb UI |
| BAR 07 | CRT curvature crops HUD (minor) | Untextured grey boss shell |
| BAR 08 | Dialogue card covers action | Bokeh blobs swamp the car |
| FLOOR 01 | Hero size | No textures at all |
| FLOOR 02 | Terrain smear and blur | Hero size |
| FLOOR 03 | Bare sand, tiny hero | Untextured ground, primitives |
| FLOOR 04 | Bare sand, tiny hero | Untextured sand and rocks |
| FLOOR 05 | Stock SEA orb UI | Primitive characters, empty water |
| FLOOR 06 | Dialogue card covers frame | Untextured terrain and primitives |

(Common game is LEFT in BAR 01, 02, 03, 05, 08; RIGHT in BAR 04, 06, 07; LEFT in FLOOR 01, 03-06; RIGHT in FLOOR 02.)

## The common game: the one property to change first

**The hero: size in frame and silhouette.** In every frame the player is a back-facing figure about 8 to 10% of frame height, with a smooth brown acorn-shaped head, no face, no hair shapes and no rim light. It reads as a placeholder pawn. Every bar opponent that beats or nearly beats it (racer car, Canopy apprentice, desert explorer) puts a large subject with a strong silhouette at the centre of the shot. Bring the chase camera closer and lower so the hero fills about 20% of frame height, give the head a hair and face silhouette, and add a rim or back light so the figure separates from the sand. This is the one change that would turn its slight wins into clear ones.

**Is that the same as empty ground or flat grade? No, it is different.**
- **Flat colour grade:** not a problem now. The golden-hour grade with long cast shadows is the strongest property in every frame, and the best in either set except the racer.
- **Empty ground:** partly still a problem. Gullwick and Gull Head frames are dense. The Shellflats and Causeway frames (BAR 02, 04, 05; FLOOR 02, 03, 04) still give 40 to 60% of the frame to bare, low-detail sand or path, and the beach in BAR 05 is an untextured slab. It is second on my list, not first.
- Also seen: the big glossy blue SEA orb is the most stock-looking pixel group on screen and clashes with the dark-panel serif UI, and the boss shell (BAR 07) is untextured grey. Both are smaller than the hero problem.

Harsh bottom line: against the floor it wins every time. Against the bar it wins 5 of 8, but two of those are slight and two come from the opponent framing itself badly. It lost to the racer both times and to the one well-framed Canopy shot.
