import sys,glob
from PIL import Image
d,out,ncol=sys.argv[1],sys.argv[2],int(sys.argv[3])
fs=sorted(glob.glob(d+'/*.jpg'))
im0=Image.open(fs[0]); w,h=im0.size; s=422/h; tw,th=int(w*s),422
rows=(len(fs)+ncol-1)//ncol
W=Image.new('RGB',(tw*ncol,th*rows))
for i,f in enumerate(fs): W.paste(Image.open(f).resize((tw,th)),((i%ncol)*tw,(i//ncol)*th))
W.save(out); print(len(fs),'frames')
