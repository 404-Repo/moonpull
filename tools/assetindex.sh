#!/bin/bash
# writes game/assets/index.json listing every asset module present
cd "$(dirname "$0")/../game/assets" && ls *.js 2>/dev/null | sed 's/\.js$//' | python3 -c "import sys,json;print(json.dumps(sorted(l.strip() for l in sys.stdin if l.strip())))" > index.json && cat index.json
