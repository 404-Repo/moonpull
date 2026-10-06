import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB'); out = sys.argv[2]
w, h = im.size; v = w // 5
# 3 views top (front,right,back), 2 bottom (left, 3/4)
o = Image.new('RGB', (v * 3, h * 2), (30, 30, 30))
for k in range(5):
    o.paste(im.crop((k * v, 0, (k + 1) * v, h)), ((k % 3) * v, (k // 3) * h))
o.save(out)
print(im.size)
