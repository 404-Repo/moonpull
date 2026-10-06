#!/bin/bash
# views.sh <slug> [size] : verify then make a 2x2 close-up of right/back/front/3q per candidate
cd /Users/atlas/404-game-recipe && node harness/verify.mjs /Users/atlas/astrocade-game4/receipts/candidates/$1 --size=${2:-560} 2>&1 | grep -E "ok|FAIL|warn|clean|  " | head -30
python3 - /Users/atlas/astrocade-game4/receipts/candidates/$1/_verify <<'PY'
import sys,glob,os
from PIL import Image
d=sys.argv[1]
for f in sorted(glob.glob(d+"/*_?.png")):
    im=Image.open(f); W,H=im.size; s=W//5
    v=[im.crop((i*s,0,(i+1)*s,H)) for i in range(5)]
    out=Image.new("RGB",(s*2,H*2))
    out.paste(v[1],(0,0)); out.paste(v[4],(s,0)); out.paste(v[0],(0,H)); out.paste(v[2],(s,H))
    out.save(f.replace(".png","_quad.jpg"),quality=88)
    print(f.replace(".png","_quad.jpg"))
PY
