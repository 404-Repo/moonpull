#!/bin/bash
# build.sh <slug> <letter> [usehull]
S=/Users/atlas/astrocade-game4/receipts/candidates/_scratch_boats
OUT=/Users/atlas/astrocade-game4/receipts/candidates/$1/$1_$2.js
python3 - "$S" "$1" "$2" "$3" "$OUT" <<'PY'
import sys
S,slug,l,use,out=sys.argv[1:]
body=open(f"{S}/{slug}_{l}.body.js").read()
rec=open(f"{S}/recentre.js").read()
body=body.replace("__RECENTRE__",rec.rstrip("\n"))
if use=="hull": body=body+"\n"+open(f"{S}/hull_snippet.js").read()
open(out,"w").write(body)
PY
