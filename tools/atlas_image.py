#!/usr/bin/env python3
"""Atlas text-to-image (Gemini 3.1 Flash Image, 16:9 2K; max hold 77 credits/call).
Usage: python3 atlas_image.py <game-slug> <out.png> <label> "<prompt>"
Logs every call to studio/production/atlas_calls.jsonl. Never prints or stores the API key."""
import sys, json, os, time, datetime, urllib.request, hashlib
BASE="https://api.prod-market.atlas.design"; API="bfbeea76-8673-492e-8401-975940109276"; MAXHOLD=77
LOG=os.path.expanduser("~/astrocade-game4/atlas_calls.jsonl")
key=open(os.path.expanduser("~/.claude/atlas_api_key")).read().strip(); H={"Authorization":"Bearer "+key}
slug,out,label,prompt=sys.argv[1:5]
rec={"utc":datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),"game":slug,"what":label,"kind":"image","api_id":API,"credits_max_hold":MAXHOLD,"prompt":prompt[:400]}; t0=time.time()
try:
    r=json.loads(urllib.request.urlopen(urllib.request.Request(f"{BASE}/0.2/api_execute/{API}",data=json.dumps({"prompt":prompt}).encode(),headers={**H,"Content-Type":"application/json"},method="POST"),timeout=600).read())
    fid=r["outputs"]["image"]; d=urllib.request.urlopen(urllib.request.Request(f"{BASE}/0.2/download_binary_result/{fid}",headers=H),timeout=300).read()
    os.makedirs(os.path.dirname(os.path.abspath(out)),exist_ok=True); open(out,"wb").write(d)
    rec.update(ok=True,result_id=fid,file=os.path.abspath(out),bytes=len(d),sha256=hashlib.sha256(d).hexdigest()[:16])
except Exception as e:
    rec.update(ok=False,error=str(e)[:300])
rec["secs"]=round(time.time()-t0,1); open(LOG,"a").write(json.dumps(rec)+"\n")
print(json.dumps({k:v for k,v in rec.items() if k!="prompt"}))
