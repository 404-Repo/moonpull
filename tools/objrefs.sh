#!/bin/bash
# usage: objrefs.sh slug "form description"   (writes ref/objects/<slug>.png)
S="Single isolated 3D game asset render, chunky hand-painted storybook coastal fishing village style, soft bevelled solid shapes with slightly exaggerated proportions, flat matte colours, weathered timber, red clay tile, warm plaster, wet grey stone, no text or lettering anywhere, three-quarter view from slightly above, whole object in frame and centred, nothing cropped, plain flat light grey background, even soft studio lighting, no shadow clutter"
python3 "$(dirname "$0")/atlas_image.py" game4 "ref/objects/$1.png" "objref-$1" "$S. The object: $2"
