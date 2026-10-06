# sea_arch: picked B (profiles), 7,057 tris, verify ok, 18.7 x 14.8 x 8.1 m

B won by eye: every stratum is its own plan outline extruded with a chunky bevel, so the layers read
as soft overhanging pillows of sandstone like the reference, the legs pinch at the waist and flare
into grey wet feet, and the three thick bridge strata overhang the legs on both faces. It reads from
all four sides and the three-quarter view.
A (chamfered-box primitives, 6,367) read as laid masonry rather than rock: too many thin, even
courses. C (one swept inverted-U with terraced displacement, 9,390) has the best rounded inner arch
but the strata came out as fine saw-tooth ridging, it is the heaviest, and it overshoots width and
depth (19.5 x 9.3 m).

Frame: legs centred at x = -6 and x = +6, bridge spans X, the passage is open along Z
(a boat sails through along local Z; rotate the asset in the level for any other heading).
Weed band (kelp moss patches, fronds, barnacles) on the lower 3 m; wet grey stone below 3.0 m;
grass tufts, moss and shrubs on the top and the outer shelves. Materials: stone x4 values
(sand, darker sand, wet grey, barnacle cream), foliage x2 (kelp, grass).

Measured from the built geometry by raycasting (src/measure.mjs, origin = asset origin after
recentring, base y = 0):
- Underside of the bridge: 9.45 m over the centre of the gap (minimum across the full 7 m depth),
  9.46 m minimum over the middle 4 m of the span. Haunch blocks round the inner corners, so the
  minimum over the whole clear span (|x| < 3.4 m) is 8.26 m.
- Gap width between the legs' inner faces, narrowest across all z: 7.41 m at 0.3 m (water level),
  7.91 m at 3 m, 7.49 m at 8 m. Including kelp fronds hanging off the inner faces: 7.29 m at 0.3 m,
  7.79 m at 3 m. Inner faces sit at about x = -3.7 and x = +3.7 to +4.1.
- Rock alone is 18.1 x 14.1 x 7.4 m; the dressing (shrubs, fronds) brings the box to 18.7 x 14.8 x 8.1.

Known weakness: the bridge underside is a flat ceiling (no sag or drip lip), the pillows are fairly
uniform in thickness, and the barnacles are too small to read beyond about 10 m.

Sources: src/kit.js (shared builder, dressing by raycast), src/{a,b,c}_main.js; each candidate file
is main + kit concatenated, so the module has no imports.
