# Critic 4 verdict: "which side looks more like a made thing"

Method: every pair split into left and right, black letterbox cropped off, portrait sides enlarged 2x (PIL, scratch dir /private/tmp/critic4c), plus 2x zooms on suspected artifacts. No KEY files or other folders opened. Names below are on-screen text only, used to say which game is which.

The game in every pair is the portrait **SEA-dial game**: SEA slider at lower right, blocky backpack kid, region titles such as Gullwick Harbour, Shellflats, Gull Head and The Undertow.

## Set BAR

| # | Pick | Margin | Reasons |
|---|---|---|---|
| 1 | RIGHT | slight | R (Canopy Terrace) has a well-modelled toon character, crisp wood and stone, and one palette throughout. L has the better vista (sea, roofs, chimney), but the kid is a low-res block toy and the cobbles at the bottom go soft. |
| 2 | LEFT | clear | L has an authored area title card, a leading-line causeway, water foam and posts. R's camera is jammed into the crouching character, two text panels cover the top half and the "Talk to Mara" button is cut off. |
| 3 | LEFT | clear | L is top-down with long raking shadows, a stilt hut, a net rack and a more detailed kid. R's camera faces a flat grey wall, with a crate blocking the bottom and nothing to read. |
| 4 | RIGHT | decisive | R (landscape, which helped) is a dense square: NPCs, lanterns, stalls, a curved boardwalk, clean toon shading. In L the bottom half is a blurred smear and a fence post renders straight through the player. |
| 5 | LEFT | slight | L has a voxel wreck, raft, stones, a crab and rippled sand under warm light. R has a strong running pose and a portal, but its chunky Roblox-like hero and faceted cliffs read as kit. L loses a little to the blur glow under the kid. |
| 6 | RIGHT | clear | R has a sea horizon, a cliff arch, a boat cabin and a feedback toast. L buries the hero under a tutorial box, the back of the head fills a third of the frame and a grass sprite sits in the lens. R's sail is an odd white lozenge. |
| 7 | LEFT | decisive | L is a drift racer with real art direction: a designed arcade HUD (combo, score, time), Japanese signage, a detailed car, a sunset palette and a CRT curve. R's crab-boat in flat water under a striped cliff is plain next to it. |
| 8 | LEFT | slight | L has a fully authored crab boss carrying a boat shell, plus NPC dialogue. R's HUD is still strong, but the night road is murky and the drift smoke is a ring of flat grey discs around a posterized car (confirmed on zoom). |

SEA-dial game wins 5 of 8 (pairs 2, 3, 5, 6, 8) and loses 3 (pairs 1, 4, 7).

**What the preferred BAR frames share (visible in the pixels):**
- One art direction carried across HUD, characters and world: the racer's HUD language, the Terrace's toon palette.
- The camera frames a subject with readable depth: a vista, a square, a boss. Losers frame a wall, a back of a head or a smear.
- The player character is drawn at the same fidelity as the world.
- Nothing broken in frame: no clipping, no blurred foreground, no stacked or cut-off panels.

**One fix per side that would most change the verdict:**

| # | Left | Right |
|---|---|---|
| 1 | Character fidelity: the blocky egg-head kid | Fewer UI panels: 3 boxes plus a rope across the frame |
| 2 | The muddy, blurred foreground ground | Camera distance: it clips into the hero |
| 3 | Kid scale: tiny in frame | The camera facing a wall |
| 4 | Foreground blur and the post through the player | Small HUD text at landscape scale |
| 5 | The bloom puddle and blur under the player | Faceted kit cliffs and the generic hero |
| 6 | The tutorial panel over the hero | The sail mesh, a white blob |
| 7 | Night-time readability | Flat water and the empty midground |
| 8 | Dull water and plain grass in the foreground | The drift smoke discs and posterized car |

## Set FLOOR

Every floor opponent is a landscape capture; the SEA-dial game is portrait. The landscape shape gave the floor side width but not finish.

| # | Pick | Margin | Reasons |
|---|---|---|---|
| 1 | LEFT | clear | L has textured roofs, a stone wall and a chimney. R is flat-shaded low poly with no surface texture, a dialogue box cut off at the frame bottom and a "drag right side up/down" hint string overlapping it. |
| 2 | RIGHT | clear | R has the causeway title card, cobbles and foam. L is an empty brown untextured plain with stick posts, and its dialogue is clipped again. |
| 3 | LEFT | slight | L has dense props, a wreck and a title card, even with the post-through-player and the blur. R is clean but bare: a flat sand disc, grey boxes for rocks, clipped text. |
| 4 | LEFT | clear | L has rippled sand texture, a detailed voxel wreck and a crab. R's wreck is a dark silhouette on flat sand, and a joystick ring sits over the scene. |
| 5 | RIGHT | clear | R has a boat cabin, a cliff arch and a horizon. L has two thin figures standing on open water next to a basic sailboat, which reads as a bug, and the text is clipped. |
| 6 | RIGHT | clear | R has the crab boss. L is the floor's best frame (lighthouse, pier, boat wake) but still flat-shaded with programmer-art figures. |

SEA-dial game wins 6 of 6.

**What separates the preferred FLOOR frames:** surface texture against flat vertex colour, designed HUD panels against default rounded boxes with clipped text and a leftover hint string, and props and characters with modelled detail against capsules and boxes. The floor side only competes on sky gradient and composition.

**One fix per side that would most change the verdict:**

| # | Left | Right |
|---|---|---|
| 1 | Bottom-third blur | Surface texture on the flat materials |
| 2 | Empty, untextured terrain | Blurred foreground |
| 3 | Post through the player and the blur | Prop density and textured rocks |
| 4 | Glow puddle under the player | Wreck material: a black silhouette |
| 5 | Figures standing on the water | Sail mesh |
| 6 | Character models (capsule people) | Nothing urgent; the dialogue box crowds the hero |

## The game in every pair (SEA-dial): one property to change first

**The blurred, glowing foreground.** A depth-of-field or motion smear plus a bloom puddle under the player turns the bottom 30 to 40 percent of almost every frame into mush (BAR 2, 4, 5, FLOOR 3 and 4). That is exactly where the player character and the thumb controls sit.

A made game is sharpest where the player looks, and this one is softest there. It reads as a rendering error, not a style. It is also what turned pair 4 from close into decisive, combined with the post rendering through the player (an occlusion bug that also needs fixing).

Fix the foreground and the textured cobbles, sand and props that already beat the floor would read at full value. Second in line: the blocky low-res hero, which looks a tier below its own world and below every rival character in BAR.
