import sys
from PIL import Image
p, out = sys.argv[1], sys.argv[2]
im = Image.open(p); w, h = im.size; s = w // 5
# 2x2 grid of front,right,back,left + separate three-quarter
views = [im.crop((i*s, 0, (i+1)*s, h)) for i in range(5)]
g = Image.new('RGB', (2*s, 2*h)); [g.paste(views[i], ((i%2)*s, (i//2)*h)) for i in range(4)]
g.save(out + '_sides.png'); views[4].save(out + '_q.png')
