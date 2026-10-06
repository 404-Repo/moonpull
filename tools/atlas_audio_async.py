#!/usr/bin/env python3
"""Atlas audio via the ASYNC endpoint (the sync one timed out at 1500 s for all four calls on 2026-10-06).
Usage: atlas_audio_async.py <out-dir> <label> "<sfx prompt>" <sfx_s> "<music prompt>" <music_s>"""
import sys, json, os, time, datetime, urllib.request
BASE="https://api.prod-market.atlas.design"; API="80849a63-5c15-4b4b-af04-ef0ecd3e47e6"
LOG=os.path.expanduser("~/astrocade-game4/atlas_calls.jsonl")
key=open(os.path.expanduser("~/.claude/atlas_api_key")).read().strip(); H={"Authorization":"Bearer "+key}
out,label,sp,ss,mp,ms=sys.argv[1],sys.argv[2],sys.argv[3],float(sys.argv[4]),sys.argv[5],float(sys.argv[6])
def req(url,data=None):
    r=urllib.request.Request(url,data=json.dumps(data).encode() if data else None,headers={**H,"Content-Type":"application/json"},method="POST" if data else "GET")
    return json.loads(urllib.request.urlopen(r,timeout=120).read())
rec={"utc":datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),"game":"game4","what":label,"kind":"audio-async","api_id":API}
t0=time.time()
try:
    ex=req(f"{BASE}/0.2/api_execute_async/{API}",{"sfx_prompt":sp,"sfx_seconds":ss,"music_prompt":mp,"music_seconds":ms})
    eid=ex.get("execution_id") or ex.get("id"); rec["execution_id"]=eid
    while time.time()-t0<2400:
        st=req(f"{BASE}/0.2/api_status/{eid}")
        s=st.get("status")
        if s in ("completed","failed","error","cancelled"): break
        time.sleep(15)
    rec["status"]=s
    if s=="completed":
        outs=(st.get("result") or {}).get("outputs") or st.get("outputs") or {}
        os.makedirs(out,exist_ok=True)
        for k,fid in outs.items():
            d=urllib.request.urlopen(urllib.request.Request(f"{BASE}/0.2/download_binary_result/{fid}",headers=H),timeout=300).read()
            open(os.path.join(out,f"{label}_{k}.mp3"),"wb").write(d); rec[f"{k}_bytes"]=len(d)
    else: rec["detail"]=str(st)[:300]
except Exception as e: rec["error"]=str(e)[:300]
rec["secs"]=round(time.time()-t0,1); open(LOG,"a").write(json.dumps(rec)+"\n"); print(json.dumps(rec))
