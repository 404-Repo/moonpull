#!/usr/bin/env python3
"""Atlas audio: ONE call returns one sound effect (ElevenLabs SFX v2, 0.5-22 s, <=18 credits) AND one music take
(MiniMax Music 3 instrumental, 1-300 s, <=25 credits). Max hold 43 credits per call.
For an SFX-only call pass music_seconds 1 (still billed, keep it cheap). Takes ~2 min; use a long timeout; re-run failures.
Usage: python3 atlas_audio.py <game-slug> <out-dir> <label> "<sfx prompt>" <sfx_seconds> "<music prompt>" <music_seconds>
Writes <out-dir>/<label>_sfx.mp3 and <label>_music.mp3 (raw; convert with chassis/tools/audio_pack.sh). Logs to studio/production/atlas_calls.jsonl."""
import sys, json, os, time, datetime, urllib.request, hashlib
BASE="https://api.prod-market.atlas.design"; API="80849a63-5c15-4b4b-af04-ef0ecd3e47e6"; MAXHOLD=43
LOG=os.path.expanduser("~/astrocade-game4/atlas_calls.jsonl")
key=open(os.path.expanduser("~/.claude/atlas_api_key")).read().strip(); H={"Authorization":"Bearer "+key}
slug,outdir,label,sp,ss,mp,ms=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4],float(sys.argv[5]),sys.argv[6],float(sys.argv[7])
rec={"utc":datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),"game":slug,"what":label,"kind":"audio","api_id":API,"credits_max_hold":MAXHOLD,"sfx_prompt":sp[:200],"sfx_seconds":ss,"music_prompt":mp[:200],"music_seconds":ms}; t0=time.time()
try:
    r=json.loads(urllib.request.urlopen(urllib.request.Request(f"{BASE}/0.2/api_execute/{API}",data=json.dumps({"sfx_prompt":sp,"sfx_seconds":ss,"music_prompt":mp,"music_seconds":ms}).encode(),headers={**H,"Content-Type":"application/json"},method="POST"),timeout=1500).read())
    os.makedirs(outdir,exist_ok=True); rec["result_ids"]=r["outputs"]; rec["ok"]=True
    for k,fid in r["outputs"].items():
        d=urllib.request.urlopen(urllib.request.Request(f"{BASE}/0.2/download_binary_result/{fid}",headers=H),timeout=300).read()
        f=os.path.join(outdir,f"{label}_{k}.mp3"); open(f,"wb").write(d); rec[f"{k}_bytes"]=len(d)
except Exception as e:
    rec.update(ok=False,error=str(e)[:300])
rec["secs"]=round(time.time()-t0,1); open(LOG,"a").write(json.dumps(rec)+"\n")
print(json.dumps({k:v for k,v in rec.items() if 'prompt' not in k}))
