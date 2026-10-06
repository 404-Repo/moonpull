# Critic 1 verdict: "which side looks more like a made thing"

Method: I read all 14 pair images, then cropped each phone frame and upscaled it 2x for detail. Floor pairs mix a portrait and a landscape frame. I judged them as composed, not by aspect ratio.

## Set BAR

| Pair | Pick | Margin | Reason |
|---|---|---|---|
| 01 | LEFT | decisive | Left: tiled roofs, chimney stonework, warm key light with AO, a readable character behind a capped wall. Right: the camera is buried in a translucent stone slab and the character's head fills the frame. It reads as a broken camera, not a shot. |
| 02 | RIGHT | slight | Right: ink-outlined stylized art, painted cobbles, balustrade, a costumed character. Left: the bottom half is a smeared green/beige gradient with no material, and the crate floats on mush. Right loses points for the black ceiling slab across the top. |
| 03 | LEFT | decisive | Left: a strong leading-line causeway, rope posts, foam edges, cast shadows, the character centred. Right: the camera is inside geometry, a semi-transparent slab with a hard half-disc cutout, and the character is hidden. |
| 04 | LEFT | clear | Left: a finished well prop with tile roof, a shrine, a sea band and a styled hint toast (but flat, featureless grass). Right: a hard-edged circular occlusion hole cut through the wall, and a huge blank cream wall takes half the frame. |
| 05 | RIGHT | decisive | Right: a stilt house with ladder, plank detail and long raking shadows, a dock and a second character. Left: the camera is pressed into a blank wall with a floating hand, and stacked text panels are the only content. This is a tech-demo frame. |
| 06 | RIGHT | decisive | Right: a beached red boat, pier trestles, flagstone texture, a lit character. Left: the same blank-wall close-up with a tutorial overlay and nothing to read in the world. |
| 07 | RIGHT | decisive | Right: a full art direction. Sunset palette, detailed car, pine and blossom silhouettes, a lantern, a branded HUD (score odometer, clock, JP banner) and a screen-grain filter. Left: an empty sand plane with one shadow and a tiny character. It reads as an unfinished level. |
| 08 | LEFT | clear | Left: night palette, "CLIP!/FLATTENED!" score juice, a drift gauge, a detailed car. The muddy dark midground costs it. Right: a decent wreck and raft, but flat plank shading, a bare sand plane and a low-energy frame. |

**What separated winners from losers (BAR):**
- **Camera discipline.** Every decisive loss had the camera in or against geometry: a wall close-up, a translucent slab or a cutout hole. The winners keep a third-person framing with the subject clear, and foreground, midground and background are all read.
- **Surface variety.** Winners show three or more distinct authored materials in frame (tile, stone, plank, foam, painted cobble). Losers are one flat plane, either a sand/grass gradient or a blank wall.
- **Light with direction.** Winners have raking key light, long cast shadows, AO in corners and a warm/cool split. Losers are evenly lit or murky.
- **Composition intent.** Winners use leading lines (causeway, pier) or a hero prop. Losers centre a tiny character on empty ground.
- **Commercial UI and juice.** The racer's diegetic, branded HUD and score popups read as "shipped" in a way no other frame does. Plain dark-pill objective panels read as competent but generic.

## Set FLOOR

| Pair | Pick | Margin | Reason |
|---|---|---|---|
| 01 | LEFT | clear | Left: textured roofs, stone wall, cobbles, AO, a styled character. Right: nice sunset and depth, but flat-shaded untextured houses, capsule-simple NPCs, and a dialogue box clipped off the bottom edge. |
| 02 | RIGHT | clear | Right: a tight textured causeway with foam and posts. Left: a vast smeared brown terrain with low-poly rocks scattered without intent, and a long dialogue box that is cut off at the frame edge. |
| 03 | LEFT | clear | Left: an authored well with roof and rope, a shrine, a styled toast. Right: a primitive well on bare mud, untextured grey cubes and rocks, and a clipped dialogue box. |
| 04 | RIGHT | clear | Right: a stilt house with plank and post detail and raking shadows. Left: the wreck ribs give a good silhouette, but the hull is a single untextured brown mass on a flat brown plane. |
| 05 | LEFT | slight | Left: sunset sea, light shaft, boat, two characters, story dialogue. It is primitive, with floating cubes. Right: an empty sand field, one big shadow, the character tucked into the corner. Nothing is authored in frame. |
| 06 | LEFT | slight | Left: a wreck with plank detail, a raft, beach grass, a crab companion. Right: a lighthouse island with a pier and a strong composition, but flat-shaded rocks, block characters and an untextured boat. |

**What separated winners from losers (FLOOR):**
- **Texture versus flat shading.** The landscape game is almost entirely vertex-colour flat shading: untextured hulls, houses and rocks. Wherever the portrait game shows authored surfaces, it wins.
- **Character fidelity.** A styled, proportioned hero with a backpack and lantern beats the stick-simple yellow-coat figures with block heads.
- **UI fit.** Dialogue boxes clipped at the bottom edge and the "drag right side up/down" debug-style hint text read as first pass. The portrait game's contained panels read as finished.
- **The landscape game wins only on mood and narrative:** lighting gradient, light shaft, staged NPCs, a world with a story. It won where the opponent frame was empty sand.
- **Empty ground loses in both games.** Wide bare sand or mud with no props drags either side down. Density of authored props is the deciding variable when materials are close.

## Single property that would most change the verdict, per pair (both candidates)

### BAR
| Pair | Left: fix | Right: fix |
|---|---|---|
| 01 | Flat grass strip and soft ground: add material on the grass | Camera collision: pull out of the slab, never render the occluder |
| 02 | Smeared untextured ground filling the lower half | Black ceiling slab and grey blobs crowding the top of the frame |
| 03 | Add midground props or life on the islet (already wins) | Camera inside geometry and the hard half-disc cutout |
| 04 | Featureless grass plane around the well | Hard-edged circular occlusion hole: replace with a soft fade, or reframe |
| 05 | Camera pressed into the wall during the push interaction | Clutter in the lower foreground. Already strong, so add a hero focal prop |
| 06 | Same wall-hugging camera: pull back to show the stelae | Soft or blurry foreground ground and an empty middle: add a focal prop |
| 07 | Empty sand plane with no props or landmarks in frame | Busy grain filter over the car. Already wins, so minor |
| 08 | Muddy, unreadable dark midground behind the car | Flat untextured plank and sand shading on the wreck scene |

### FLOOR
| Pair | Left: fix | Right: fix |
|---|---|---|
| 01 | Already wins. Soft blurred cobbles in the foreground | Untextured flat-shaded buildings and simple NPCs |
| 02 | Flat smeared mud terrain with no material | Already wins. Add a horizon landmark to read scale |
| 03 | Already wins. Featureless grass | Primitive grey cubes and bare mud around the well |
| 04 | Untextured wreck hull and a flat brown ground plane | Already wins. Shadow-heavy, busy foreground |
| 05 | Floating primitive cubes and blocky characters in the water | Empty sand frame with the character pushed to the corner |
| 06 | Flat untextured plank shading on the wreck | Flat-shaded rocks and block characters on the boat |

## Bottom line
- **Camera failures decide BAR.** The most common reason for a decisive loss is the camera sitting in or against geometry.
- **After the camera, empty ground decides it.** Large flat, blurry, untextured planes with sparse props lose in both sets.
- **Texture decides FLOOR.** Authored surface materials beat flat-shaded low poly. Mood and narrative staging win only when the other frame is empty.
