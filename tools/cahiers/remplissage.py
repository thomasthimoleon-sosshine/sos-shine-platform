import pymupdf, sys
d=pymupdf.open(sys.argv[1]); H=d[1].rect.height
haut, bas_marge = 70.0, H-46
f=[]
for n in range(1,d.page_count):
    p=d[n]; ys=[]
    for b in p.get_text("dict")["blocks"]:
        if b["type"]==0 and b["bbox"][3] < bas_marge and b["bbox"][1] > haut-20: ys.append(b["bbox"][3])
    for dr in p.get_drawings():
        if dr["rect"].y1 < bas_marge: ys.append(dr["rect"].y1)
    bas = max(ys) if ys else haut
    f.append((n+1, round((bas-haut)/(bas_marge-haut)*100)))
print("pages :", d.page_count)
print("sous 60 % :", [x for x in f if x[1]<60])
print("moyenne :", round(sum(r for _,r in f)/len(f)))
