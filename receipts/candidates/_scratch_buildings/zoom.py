import sys
from PIL import Image
slug=sys.argv[1]; xs=sys.argv[2]; views=[int(v) for v in sys.argv[3].split(',')]
ims=[Image.open(f'{slug}/_verify/{slug}_{x}.png') for x in xs]
w,h=ims[0].size; v=w//5
out=Image.new('RGB',(v*len(views),h*len(ims)))
for i,im in enumerate(ims):
    for j,k in enumerate(views): out.paste(im.crop((v*k,0,v*(k+1),h)),(v*j,h*i))
out.save(f'_scratch_buildings/{slug}_zoom.png')
