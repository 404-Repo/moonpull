# lighthouse: A (primitives), 9,856 tris, verify ok, 6.20 x 24.06 x 6.30 m

Won by eye. A reads closest to the reference from all four sides: straight tapered plaster shaft, one red band with lips,
a chunky two-course ring of chamfered wet-stone blocks around the foot, an arched plank door in a voussoir surround at +Z,
nine timber-framed windows (four up the front, two back, three on the sides), sixteen corbels under a round gallery,
iron railing with knobbed posts, glazed lantern room with eight mullions, ribbed bronze dome and ball finial.
B (lathe profiles, 10,844) has the nicest ogee gallery cornice, but its flared foot swallows the plinth stones and the
extruded door surround sticks out as a fin in the side views. C (stacked off-axis drums, InstancedMesh stone skirt,
eight-sided lantern, 10,244) reads as a stack of tyres: the bevelled drum seams dominate and the shaft no longer looks
like the smooth whitewashed tower in the reference.

## Beacon (how the game finds and lights it)
The lamp is its own child Mesh named `beacon` with a material whose `.name === 'beacon'`
(base colour 0x201e1c, emissive 0xffe2a0, emissiveIntensity 1.2). Tested through game/assetlib.js ASSET()
(receipts/candidates/lighthouse/_beacon_test.html):
- Default merged load (with or without `surfaces: true`): mesh name and userData are lost, but the beacon material
  stays its own bucket (unique emissive), 168 tris. Find it with
  `obj.traverse(n => { if (n.isMesh && n.material.name === 'beacon') beacon = n; })`.
- `keepHierarchy: true`: `obj.getObjectByName('beacon')` and `obj.userData.beacon` both resolve.
- Light it by setting `beacon.material.emissiveIntensity` (0 = unlit dark lens, 1.2 default, 2+ for night with bloom).
  Note ASSET() clones share materials, so every lighthouse instance changes together (there is one).
- Base colour is deliberately near-black neutral so surfaces.js classify() returns null and leaves it untextured;
  a pale colour was classified as stone/timber and got a texture map.
- The glass is transparent (opacity 0.32, depthWrite false) and is also left untextured by surfaces.js.

## Known weakness
The lantern glass is a single open cylinder, so the mullions sit outside a round pane rather than framing flat panes;
fine at game distance, visible in close-up.
