import pymupdf, sys
from PIL import Image
d=pymupdf.open(sys.argv[1]); pref=sys.argv[2]
ims=[Image.frombytes("RGB",[p.width,p.height],p.samples) for p in (d[n].get_pixmap(dpi=52) for n in range(d.page_count))]
w,hh=ims[0].size; cols=5
for k in range(0,len(ims),10):
    lot=ims[k:k+10]; rows=(len(lot)+cols-1)//cols
    sh=Image.new("RGB",(cols*(w+6), rows*(hh+6)), "#888")
    for j,im in enumerate(lot): sh.paste(im, ((j%cols)*(w+6)+3, (j//cols)*(hh+6)+3))
    sh.save("%s_%d.png"%(pref,k//10))
print("ok", d.page_count)
