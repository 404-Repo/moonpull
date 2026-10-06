# MOONPULL progress

Lead: Claude (Opus 5.5) as a jam entrant, running GAME.md's prompt from ~/404-game-recipe @ 4effad3.
Repo: ~/astrocade-game4. Images: Atlas text-to-image (Gemini 3.1 Flash Image) via tools/atlas_image.py, every call logged in atlas_calls.jsonl.

## Milestone 1: concept and scope chosen (2026-10-06)

**MOONPULL**, a third-person coastal adventure. You carry a lantern holding the fallen moon's pull and move the sea level of the whole coast up and down with your right thumb. Let go and the sea drifts back home. Full pitch, journey table and risks: `CONCEPT.md`. Style lock: `STYLE_LOCK.md`. Concept frames: `ref/concept/`.

Why this concept (reasons, not taste):
- **A verb nobody in jam 001 used.** Bellkeeper carries wind, Farseek steers sunlight, SUNDRIFT trades drifts for time of day. Water level as the player's tool is the same class of idea (one global, visible state in your hand) and it appears in none of the 25 entry files. The "what nobody else tried" row is 20 of 100.
- **It makes the world expansive by construction.** Every place has two states (low tide, high tide), so one authored coast reads as two. The journey is about 420 x 160 m along one shoreline, against Bellkeeper's 92 m tree (research/winners/WINNERS.md, measured).
- **Ben's notes are built in.** Human scale, Bellkeeper's measured camera (fov 42, pitch 25.6 deg, arm 10.8 m / 11.5 m portrait, focus +1.0 m, yaw-only drag) is already in `game/src/camera.js`. Authored places, a goal, a journey, people, a boss.
- **Phone-first.** One stick, one tide dial, one labelled context button. Dialogue is non-blocking captions so the thumb never waits.
- **TIMBER's failure avoided:** no 42 x 19 m patch, no rounds, no planning board.

Scope (four places, one coast):
1. Gullwick Harbour: stilt village, Nell, causeway to the well islet, Tam's stranded boat, sand bar east.
2. The Shellflats: the drained bay, crabs that own the sand at low water, the wreck of the Marguerite, ride the raft up to the lens.
3. Gull Head: the Needle Run in Tam's boat. The keel hits the reefs if the sea is too low, the mast hits the sea arches if it is too high. (Changed from lock-gate sea caves at design time: a 2.4 m sea reach cannot climb a 15 m shaft without a second rule.)
4. The Stack: stepping stones, the Undertow (a giant hermit crab wearing a boat), defeated three times with the tide and no weapon, then the lighthouse is lit and the sea goes home.

The bar, measured from the podium (WINNERS.md): 8+ named zones, 35+ objective steps with one branch, a named guide NPC, a 3-phase climax with a finale and end card, 12+ minutes, Bellkeeper camera, 60 fps with 450 or fewer draws on a phone. My current plan has about 20 main steps, so the content phase must add side errands (villagers' tide requests, things the low tide reveals) to clear 35.

Already done beyond the concept, measured:
- 22 assets through the 404 loop (3 candidates each, verify sheet, pick by eye), in `game/assets/`, receipts in `receipts/candidates/`.
- Engine: one heightfield coast, sea and ground shaders reading the same height texture (foam line, wet sand that stays wet after the sea leaves, cobbled paths), tide model, wading and "carried back to dry ground", floaters (boats, rafts, the well bucket), story engine.
- Harbour objective chain played end to end by my own real multi-touch gate (`tools/play.mjs`: stick and tide dial held at once through CDP): **8 of 8 steps PASS**, 0 console errors, 114-125 draws, 0.34-0.39 M triangles on an 844x390 phone viewport (headless GPU, 60 fps reported, not a phone).
- Floor build (one agent, one pass, no loop): `floor/`, frames in `floor/_frames/`.

Not yet: any critic round, the blind comparison, art density in the harbour (it reads sparse and the cliff texture smears), areas 3 and 4, the boss, music.

**Port:** :8795 is held by the live Slack translator bot (`~/slack_translator/server.py`, pid 930). I did not kill it. The build is served on **:8796** (`python3 -m http.server 8796` in `game/`).

## Milestone 2: first playable vertical slice (2026-10-06)

Serving at **:8796** (`game/`, static server, always the working tree). Gullwick Harbour is complete and playable end to end, and the two areas after it already play through too.

**Measured, my own real multi-touch gate** (`tools/play.mjs --route=all`, stick and tide dial held at once through CDP, 844x390 phone viewport, headless GPU): **15 of 15 objective steps PASS** from Nell to the end of the Needle Run, 0 console errors, peak about 150-220 draws, 0.1-0.7 M triangles depending on view. The same chain also passed at 390x844 portrait and 960x540.
- Harbour (8 steps): Nell gives the lantern, low tide over the causeway, raise the sea to fill the well and lift the shard, get back before the sea does, Tam, float his boat (with a "get up on the wall first" warning, because the sea you raise will take you off your feet), deepest low tide over the sand bar.
- Shellflats (4): crabs that own the sand at low water, ride the tethered raft up the wreck's side at high water into the stern cabin, the lens.
- Gull Head (3): the Needle Run, 6 gates of sea arches and reefs, a green band on the tide dial shows the window; a strike stops the boat and Tam backs off, no death.

**Critic rounds (fresh harsh critic each, blind pairs from `harness/pairs.mjs`, keys moved out of the folder, in-motion portrait frames):**

| round | vs podium frames (Bellkeeper, Farseek, SUNDRIFT) | vs floor | property named first | what I changed |
|---|---|---|---|---|
| 1 | 5 of 8 (losses: 1 slight, 1 clear, 1 decisive) | 5 of 6 | empty ground: flat sand and lawn planes | flats dressed (fish weirs, anchor, buoys that float, kelp, rocks every ~11 m along both walks), gulls, near-field ground detail in the shader |
| 2 | 5 of 8 (losses: 3 decisive, to SUNDRIFT twice and Bellkeeper's wide square) | 6 of 6 | colour grade and main light: commit to a lower, warmer sun | sun to hour 17.65, about 17:39 (lower, warmer, longer shadows), 90 gorse candidates on the benches |

Caveats on those numbers: 8 pairs is coarse; round 1's podium frames included several of the research bot's camera-in-a-wall frames (unfair to them), so round 2 used their best frames; aspect ratios differ (they are portrait captures from a different harness); the critic correctly guessed which game was constant. The round 2 losses are decisive and come from art direction (SUNDRIFT's grade and branded HUD, Bellkeeper's dense built square), which is the honest gap.

Also done: Bellkeeper camera with pitch-then-yaw-swing collision (critic 1 had flagged our camera inside geometry at the wreck); dialogue as non-blocking captions; the dark lighthouse on a shaped sea stack is visible from the harbour as the goal; 38 assets through the 404 loop at that point (I first wrote 46 here; corrected at milestone 3 from index.json); harbour music (Atlas, MiniMax Music) plays with gaps because the service returned 21 s for a 75 s request.

Not done or weak: the hero reads as a faceless mannequin from behind (critic 2's second property); the critic has not yet seen the Needle Run; the Stack, the boss and the ending are not built; music for the other places is generating; no jam.mjs run yet.

## Milestone 3: content complete (2026-10-06)

The whole game exists and plays from title to end card. Serving at **:8796**.

**Content**
- Four places, ten named zones announced on arrival: Gullwick Harbour, The Causeway, Well Islet, The Sand Bar, The Shellflats, The Marguerite, Gull Head, The Needles, The Stack, The Basin.
- Main story: 22 objective steps. Harbour 8, Shellflats 4, Gull Head 3 (the Needle Run, six gates), the Stack 7: stepping stones on a drowned spine, the Undertow in three phases (lure it with high water, strand it with low water, raise the sea hard so its boat floats off its back, shine the lantern; each phase wants more bait and the ledge is the only safe ground), then the lighthouse is lit in a crane-shot finale (beam, sunset to dusk, moonrise) and an end card with stats and "Keep exploring".
- Errands in any order, alongside the road: Marta's three pots (deep low tide off the jetty), Pip's toy boat (only a high sea carries it home, a low one sets it down), Bram's spade (by the far weir). 10 more steps, 5 lost things counted on the end card. Total tracked steps 32 (Bellkeeper's measured tally is about 35, inferred).
- People: Nell, Tam, Marta, Pip, Bram, the Undertow. Title slideshow with three painted prologue cards (Atlas images), pause menu with sound toggle, zone banners.
- Music: four cues (harbour, flats, boss, finale) from Atlas MiniMax Music, 21 to 45 s each, played with gaps; synthesised surf, gulls and swell.
- 44 3D assets through the 404 loop (counted from game/assets/index.json); hero v2 (pointed hood, red scarf, bigger pack) after critic 2, plus a warm rim light on the hero only after critic 3.

**Measured (my real multi-touch gate, tools/play.mjs)**
- Main chain end to end in one run: 20 of 20 gate assertions (every main step plus the end card), 0 console errors, peak ~150-220 draws, 0.1-0.75 M triangles, 390x844 portrait. Bot time 257 s; the bot knows every answer, so a first human play is longer, unmeasured.
- Errands: Marta and Pip 7 of 7, Bram 3 of 3.
- Boss route 5 of 5 on two consecutive runs after the shine-reach fix. Before that fix a portrait run failed the boss (0 hits in 420 s): the button radius (30 m) was smaller than the shine radius (36 m), so the prompt never showed for a far exposure. Fixed; flakiness is now unmeasured beyond 2 of 2 runs.
- `harness/ship.mjs`: 68 modules parse, every path stays inside the folder. Game folder 3.7 MB.

**Critic round 3** (fresh critic, blind, same podium frames as round 2, frames now include the Needle Run and the boss): vs podium **5 of 8** (losses: Bellkeeper's wide square clear, SUNDRIFT clear and slight), vs floor **6 of 6** (3 decisive). The critic says the colour grade is now our strongest property and empty ground is fixed in the harbour and Gull Head but not on the Shellflats. First property it names: the hero's size in frame (8 to 10% of frame height). That conflicts with Ben's instruction to use Bellkeeper's camera (whose hero is about 1/8 of the frame), so I kept the camera and changed the hero instead (v2 silhouette, rim light, lantern-styled dial, lighter captions). Not re-judged yet.

Not done: jam.mjs against a public URL; the Shellflats still give 40 to 60% of some frames to bare sand; the arches read blocky; a human first-play time is unknown.

## Milestone 4: jam gate PASS and blind comparison (2026-10-06)

No public repo or Pages site was created (Ben's call). The gate ran against the existing tunnel and against localhost, one at a time, no orphaned Chrome found beforehand.

**jam.mjs** (recipe @ 4effad3, 390x844 @3x phone, real touch, 4G profile, CPU 2x slower), final commit 833c58b. Verdict blocks in `work/jam_verdicts_final.txt`.

| | localhost:8796 | tunnel (riders-swap-diana-glenn.trycloudflare.com) |
|---|---|---|
| ready | 7.2 s (budget 20) | 8.2 s |
| weight | 3.6 MB (budget 10) | 3.6 MB |
| started / moved | real tap / 15.4 m | real tap / 15.4 m |
| peak draws / tris | 203 / 687,032 | 203 / 687,032 |
| errors / 404s | 0 / 0 | 0 / 0 |
| external deps | cdn only (jsdelivr three, Google Fonts) | same |
| RESULT | PASS | PASS |

The fps the gate prints (60) is the Mac's Metal GPU, not a phone; the gate does not judge fps and neither do I. The earlier runs on 74371ea and 888eb0b also passed on both URLs (tunnel ready 8.0 and 9.8 s; the tunnel adds latency the real gate would not).

**My own gate after the last change** (tools/play.mjs, real multi-touch, 390x844): main story 20 of 20, 0 errors.

**Shellflats fill** (critic 3's second property): a trail of the wreck's cargo half buried in the sand, more fish weirs (now solid), four more beached rowboats that float on a rising sea, dark reef rocks with kelp skirts, sand ripple relief in the ground shader, the wreck's sand base sunk.

**Blind comparison, rounds 4 and 5** (fresh harsh critic each, keys withheld, same podium frames as rounds 2 and 3, my frames at the same fixed indices of a fresh full run so I could not cherry-pick):

| round | vs podium | vs floor | losses vs podium | property named first |
|---|---|---|---|---|
| 2 | 5 of 8 | 6 of 6 | Bellkeeper wide square (decisive), SUNDRIFT x2 (decisive) | colour grade and main light |
| 3 | 5 of 8 | 6 of 6 | Bellkeeper wide square (clear), SUNDRIFT (clear, slight) | hero size and silhouette |
| 4 | 5 of 8 | 6 of 6 | Bellkeeper square (slight), Bellkeeper wide square (decisive), SUNDRIFT (decisive) | blurred, glowing foreground |
| 5 | 5 of 8 | 6 of 6 | Bellkeeper wide square (decisive), SUNDRIFT (decisive, clear) | ground plane material and foreground props |

What round 4 named and what I did: the "blur" was real and measurable, the render rig's phone tier draws at 1x and a 3x phone upscales it; the game now renders at up to 2x. I also softened the lantern's light pool and made weirs solid (a post rendered through the player). Round 5 still calls the near ground soft and under-dressed, so this is only partly fixed.

**Reading of the numbers, honestly:**
- Against the floor (one agent, one pass) the method wins every pair in five rounds, 29 of 30 overall.
- Against the podium the count has sat at 5 of 8 for four rounds while the named property changed each time. The same three podium frames win every round: Bellkeeper's wide, dense village square (a landscape capture, which the critics said helped it) and SUNDRIFT's two frames with a single committed art direction (CRT frame, branded HUD, ink-line trees). By GAME.md's stopping rule that is a gap about art direction and composition, not something another polish round closes. I stopped here.
- The critics correctly spotted which game was constant each round, so the pairs are blind to side, not to identity.
- Eight pairs is coarse; a landscape-vs-portrait shape mismatch remains in the podium set.

**Would it win the jam?** Measured: it clears the gate with margin, beats the floor every time, and wins 5 of 8 frame pairs against the podium's best frames. Inferred, not measured: stage two is 40% "good to play"; the tide verb, boss and Needle Run all work under my bot, but nobody has played it for 30 minutes by hand, and a human first-play time is unknown. Its "what nobody else tried" (the sea level as the player's tool) is the strongest card. Against Bellkeeper's look it is behind on art direction.

**What I would do next:** a human playtest on a real phone (feel of the tide dial, boss difficulty, the sea's pull-back speed); commit to one rendering style the way SUNDRIFT does (an outline or toon pass across world and hero) instead of more props; a dense hand-composed hero shot in the harbour square at landscape aspect; and a nearer camera option only if Ben agrees, since the critics keep asking for a bigger hero and Ben asked for Bellkeeper's camera.
