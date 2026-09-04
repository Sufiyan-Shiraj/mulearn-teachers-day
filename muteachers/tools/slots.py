"""Regenerate the photo-slot geometry in src/lib/slots.ts and the punched
`<id>-over.webp` overlays in public/templates.

Run from public/templates:   python3 ../../tools/slots.py . [proof-photo.jpg]

For each template it flood-fills the empty paper inside the printed frame,
fits a minimum-area rectangle to it (the photo box + rotation) and writes the
artwork back out with that paper knocked out to alpha, cropped to the slot so
the file stays small. Pass a photo to also drop proof-<id>.jpg renders.
The per-template tolerance below was picked from the widest stable plateau of
a fill-area sweep — raising it leaks into the frame or the art beside it."""
import json, math, os, sys
from PIL import Image, ImageFilter
from collections import deque

# seed (pct of card) and the flood tolerance chosen from the stable plateau
CFG = {
 'disco':    (50.3, 60.5, 10),
 'scrapbook':(53.4, 49.4, 12),
 'velvet':   (68.25,37.25,16),
 'thankyou': (49.0, 46.25,16),
 'pressed':  (50.0, 45.75,16),
 'grateful': (39.0, 46.4, 16),
 'lilac':    (53.0, 47.25,16),
}

def flood(im, sx, sy, tol):
    W,H = im.size; p = im.load(); sr,sg,sb = p[sx,sy]
    m = bytearray(W*H); q = deque([(sx,sy)]); m[sy*W+sx] = 1
    while q:
        x,y = q.popleft()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny = x+dx, y+dy
            if 0<=nx<W and 0<=ny<H:
                i = ny*W+nx
                if not m[i]:
                    r,g,b = p[nx,ny]
                    if abs(r-sr)<=tol and abs(g-sg)<=tol and abs(b-sb)<=tol:
                        m[i]=1; q.append((nx,ny))
    return m

def hull(pts):
    pts = sorted(set(pts))
    if len(pts) < 3: return pts
    def half(ps):
        out=[]
        for pt in ps:
            while len(out)>=2:
                (x1,y1),(x2,y2)=out[-2],out[-1]
                if (x2-x1)*(pt[1]-y1)-(y2-y1)*(pt[0]-x1) <= 0: out.pop()
                else: break
            out.append(pt)
        return out
    return half(pts)[:-1] + half(pts[::-1])[:-1]

def min_area_rect(h):
    best=None; n=len(h)
    for i in range(n):
        x1,y1=h[i]; x2,y2=h[(i+1)%n]
        ex,ey=x2-x1,y2-y1; L=math.hypot(ex,ey)
        if L<1e-9: continue
        ux,uy=ex/L,ey/L; vx,vy=-uy,ux
        us=[(px-x1)*ux+(py-y1)*uy for px,py in h]
        vs=[(px-x1)*vx+(py-y1)*vy for px,py in h]
        w=max(us)-min(us); ht=max(vs)-min(vs)
        if best is None or w*ht<best[0]:
            cu=(max(us)+min(us))/2; cv=(max(vs)+min(vs))/2
            best=(w*ht, x1+cu*ux+cv*vx, y1+cu*uy+cv*vy, w, ht, math.degrees(math.atan2(uy,ux)))
    return best[1:]

out_dir = sys.argv[1]
proof_photo = Image.open(sys.argv[2]).convert('RGB') if len(sys.argv)>2 else None
geo = {}

for key,(spx,spy,tol) in CFG.items():
    im = Image.open(f'{key}.jpg').convert('RGB'); W,H = im.size
    mask = flood(im, int(W*spx/100), int(H*spy/100), tol)
    pts = [(x,y) for y in range(H) for x in range(W) if mask[y*W+x]]
    cx,cy,w,h,ang = min_area_rect(hull(pts))
    if abs(ang) > 45: ang = ang-180 if ang>0 else ang+180
    if abs(ang) > 45: w,h = h,w; ang = ang-90 if ang>0 else ang+90

    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    bx0,by0,bx1,by1 = min(xs),min(ys),max(xs),max(ys)

    # overlay: whole artwork, slot knocked out, cropped to slot bbox + margin
    pad = int(0.045*W)
    ox0,oy0 = max(0,bx0-pad), max(0,by0-pad)
    ox1,oy1 = min(W,bx1+pad+1), min(H,by1+pad+1)
    alpha = Image.new('L',(W,H),255); ap = alpha.load()
    for y in range(by0,by1+1):
        r=y*W
        for x in range(bx0,bx1+1):
            if mask[r+x]: ap[x,y]=0
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))
    ov = im.convert('RGBA'); ov.putalpha(alpha); ov = ov.crop((ox0,oy0,ox1,oy1))
    ov.save(os.path.join(out_dir,f'{key}-over.webp'),'WEBP',quality=88,method=6)

    geo[key] = dict(
        box=[round((cx-w/2)/W*100,2), round((cy-h/2)/H*100,2),
             round(w/W*100,2), round(h/H*100,2)],
        rot=round(ang,1),
        over=[round(ox0/W*100,3), round(oy0/H*100,3),
              round((ox1-ox0)/W*100,3), round((oy1-oy0)/H*100,3)],
        slotAspect=round(w/h,4),
        coverage=round(len(pts)/(w*h),3),
        overKB=round(os.path.getsize(os.path.join(out_dir,f'{key}-over.webp'))/1024,1),
    )

    # ---- proof: photo placed by the computed geometry, overlay composited on top
    if proof_photo:
        card = im.copy().convert('RGBA')
        ph = proof_photo.copy()
        tw,th = int(w),int(h)
        s = max(tw/ph.width, th/ph.height)
        ph = ph.resize((max(1,int(ph.width*s)), max(1,int(ph.height*s))), Image.LANCZOS)
        ph = ph.crop(((ph.width-tw)//2, (ph.height-th)//2,
                      (ph.width-tw)//2+tw, (ph.height-th)//2+th)).convert('RGBA')
        ph = ph.rotate(-ang, expand=True, resample=Image.BICUBIC)
        card.alpha_composite(ph, (int(cx-ph.width/2), int(cy-ph.height/2)))
        card.alpha_composite(ov, (ox0,oy0))
        card.convert('RGB').resize((W//2,H//2), Image.LANCZOS)\
            .save(os.path.join(out_dir,f'proof-{key}.jpg'),'JPEG',quality=84)

print(json.dumps(geo, indent=2))
