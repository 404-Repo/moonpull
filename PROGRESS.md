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
