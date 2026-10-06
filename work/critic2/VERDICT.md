# Critic 2 verdict (blind, visual only)

Method: each side cropped and enlarged 2x. No game, server, browser or key file opened. Games are named below by what is visible on screen (HUD titles), not by any label.

Visible games: **Harbour** (Gullwick Harbour / The Shellflats, portrait, SEA slider, round-head kid with backpack), **Canopy** (The Canopy Terrace, red-coated apprentice), **Gate** (desert, "Gate address" HUD, explorer in blue), **Racer** (night drive, Japanese HUD, white car), **Flatsea** (landscape, "Objective / Pearls / Score", HIGH/LOW slider, yellow-coat girl, untextured low poly).

Harbour is on screen in every pair of both sets, so it is very likely the constant game.

## Set BAR

| # | Winner | Margin | Reason |
|---|---|---|---|
| 1 | LEFT (Harbour) | slight | Clean read: cobbles, sea, lamp, barrels. Right has two stacked dialogue panels plus a chart button over a quarter of the frame, a rope slashing through it, and a camera jammed onto the player |
| 2 | LEFT (Harbour) | clear | Tiled roofs, chimney, stone wall, warm light, real composition. Right: text covers the top 30%, player cut off at the frame edge, empty plank floor |
| 3 | RIGHT (Harbour) | clear | Causeway leads the eye with posts, foam edge and a destination. Left: camera inside the player's shoulder, flat grey crate filling the foreground, untextured green cliff blobs |
| 4 | LEFT (Canopy, wide frame) | decisive | Dense authored square: stalls, awnings, NPCs, lanterns, inlaid floor medallions, strong shadow pattern. Right: flat lime lawn, one well, empty sea, a mannequin kid |
| 5 | RIGHT (Harbour) | clear | Stilt house with ladder, rail and hard sun shadows reads as built. Left: faceted low-poly cliffs, flat grey floor, oversized player cropped and blocking the gate |
| 6 | RIGHT (Harbour) | clear | Shadowed dirt yard, nets, stilt house. Left: tutorial box over the middle, player fills the lower half with a black unlit face, grass sprite poking through the joystick |
| 7 | RIGHT (Racer) | decisive | Strong art direction: dusk grade, pink tree canopies, shrine lantern, branded HUD, detailed car. Left: near-empty sand plane, a line of fence, a faceless kid |
| 8 | LEFT (Racer) | decisive | Graded purple dusk, lit road dots, cohesive retro HUD, speed and motion. Right: big flat-shaded brown hull, raft, bare sand, nothing lit with intent |

**What the preferred frames share in BAR (visible in the pixels):** one art direction across the whole frame, either a colour grade (Racer dusk) or a dense, purpose-built set (Canopy square). Every surface has a material (tile, plank, roof shingle) rather than flat colour. Shadows land as patterns. The camera frames a destination, and the player fills 5 to 15% of the frame. The HUD is either branded or kept out of the middle. The losers show flat or faceted untextured masses, cameras inside the player, text panels over the centre of play, or empty ground planes.

## Set FLOOR

| # | Winner | Margin | Reason |
|---|---|---|---|
| 1 | LEFT (Harbour) | clear | Textured cobbles, prop dressing. Right: untextured flat-colour sheds, the dialogue box clipped by the screen bottom, a debug hint "drag right side up/down" over the slider |
| 2 | RIGHT (Harbour) | clear | Stone causeway, foam, posts. Left: smeared brown blob terrain, faceted rocks, a 3-line dialogue cut off at the bottom, debug hint |
| 3 | RIGHT (Harbour) | clear | Brick well, roofed shrine, grass. Left: grey primitive cubes, a flat octagon plinth, mud-coloured terrain with no surface detail |
| 4 | RIGHT (Harbour) | clear | Timber stilt house with plank detail and strong shadows. Left: the wreck is a single dark untextured hull, the sand is smooth gradient, and the debug hint shows |
| 5 | RIGHT (Harbour) | slight | Harbour frame is mostly empty sand, but it has fence and grass material. Left has the best Flatsea frame (sunset over water), but the figures are capsules and the dialogue is clipped |
| 6 | LEFT (Harbour) | clear | Hull planking, raft, warm shadows. Right: a pleasant composition, but the rock, island and boat are all flat-shaded primitives with no texture |

**What the preferred frames share in FLOOR:** visible surface material on every ground and prop (cobble, plank, shingle, brick), contact shadows under props, and no debug or clipped UI. Flatsea loses on surfaces alone: its lighting and sky are often the nicer of the two.

## Most consequential fix, per pair, both sides

| Pair | Harbour side | Other side |
|---|---|---|
| BAR 1 | player character (tiny, generic, no face read) | UI clutter: two text panels over play |
| BAR 2 | empty foreground cobble field | camera framing: player cropped at the edge |
| BAR 3 | flat, generic daylight grade | camera distance: inside the shoulder |
| BAR 4 | empty mid-ground (flat lawn, nothing authored) | none needed; portrait framing only |
| BAR 5 | player character silhouette | faceted untextured cliff surfaces |
| BAR 6 | flat, generic daylight grade | tutorial panel over the centre plus unlit face |
| BAR 7 | set dressing density (empty sand plane) | none needed |
| BAR 8 | colour grade and lighting intent | none needed |
| FLOOR 1 | player character | untextured materials |
| FLOOR 2 | colour grade | terrain material (smeared blob) |
| FLOOR 3 | colour grade | primitive cube props, no material |
| FLOOR 4 | player character | untextured wreck and terrain |
| FLOOR 5 | set dressing density (empty sand) | character models (capsule people) |
| FLOOR 6 | colour grade | flat-shaded rock and island surfaces |

## Overall

Harbour, the likely constant game, wins FLOOR 6 of 6 and BAR 5 of 8, and loses decisively whenever it meets a game with a real art direction (Racer 2 of 2, Canopy's wide square). Its weakness is not surfaces. It is the **look**: neutral, flat noon light with no grade, scenes with large empty ground, and a faceless round-head mannequin as the hero. It reads as a competent asset kit, not as a game with a point of view.

**The weakest game overall is Flatsea (the FLOOR opponent).** Change first: **surface materials.** Every ground, rock, hull and house is untextured, flat-shaded colour, and that is what makes it read as a first-pass tech demo even when its sunset lighting and composition beat Harbour's (FLOOR 5 and 6). Second: remove the debug hint and fix the dialogue clipping, a cheap fix.

**If the question is the constant game (Harbour):** change the **colour grade and key light** first. A committed time-of-day grade and a warmer, lower sun would cover the empty ground with shadow pattern, which is exactly what Racer and Canopy win on. The hero model is second.

Caveat: some sides were landscape captures and others portrait. That changes how much set is visible (BAR 4, all of FLOOR) and probably favours the wide frames on density.
