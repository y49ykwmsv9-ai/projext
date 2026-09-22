#!/usr/bin/env python3
import os, math, subprocess, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W,H,FPS,DUR = 1280,720,24,20
N=FPS*DUR
OUT="/tmp/reconquista711"
os.makedirs(OUT,exist_ok=True)

MAP_URL=os.environ["MAP_URL"]
AUDIO_URL=os.environ["AUDIO_URL"]
PORTRAIT_TARIQ="https://commons.wikimedia.org/wiki/Special:Redirect/file/Tariq_ibn_Ziyad.jpg"
PORTRAIT_RODERIC="https://commons.wikimedia.org/wiki/Special:Redirect/file/Rod%C3%A9ric.jpg"

def fetch(url,path):
    req=urllib.request.Request(url,headers={"User-Agent":"ReconquistaDocumentary/1.0"})
    with urllib.request.urlopen(req,timeout=60) as r, open(path,"wb") as f:
        f.write(r.read())

fetch(MAP_URL, f"{OUT}/map.png")
fetch(AUDIO_URL, f"{OUT}/narration.mp3")
for name,url in [("tariq.jpg",PORTRAIT_TARIQ),("roderic.jpg",PORTRAIT_RODERIC)]:
    try: fetch(url,f"{OUT}/{name}")
    except Exception: pass

base=Image.open(f"{OUT}/map.png").convert("RGB").resize((W,H),Image.Resampling.LANCZOS)

# Atlas coordinates: these are the exact stored lon/lat values from reconquista-atlas.json.
places={
"gibraltar":(-5.35,36.14),"guadalete":(-6.22,36.58),"seville":(-5.99,37.39),
"cordoba":(-4.78,37.89),"toledo":(-4.03,39.86)
}
# Calibrated geographic transform against the atlas-linked map control points.
def geo(lon,lat):
    x=841.98391926*lon+141.16455474*lat+35.86195326*lon*lon-10.56647746*lon*lat-2.39763464*lat*lat
    y=-4320.14966728*lon-541.58522246*lat-167.7816283*lon*lon+66.32012454*lon*lat+11.23141653*lat*lat
    return x,y
P={k:geo(*v) for k,v in places.items()}

serif="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
serifb="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
sans="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
sansb="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def F(n,b=False): return ImageFont.truetype(serifb if b else serif,n)
def S(n,b=False): return ImageFont.truetype(sansb if b else sans,n)

def progress_path(points,p):
    if p<=0:return []
    lens=[math.dist(a,b) for a,b in zip(points,points[1:])]
    total=sum(lens); target=total*min(p,1); out=[points[0]]; acc=0
    for a,b,d in zip(points,points[1:],lens):
        if acc+d<=target: out.append(b); acc+=d
        else:
            r=(target-acc)/d if d else 0
            out.append((a[0]+(b[0]-a[0])*r,a[1]+(b[1]-a[1])*r)); break
    return out

def arrow(d,pts,p,fill,width=7):
    q=progress_path(pts,p)
    if len(q)<2:return
    d.line(q,fill=fill,width=width,joint="curve")
    a,b=q[-2],q[-1]; ang=math.atan2(b[1]-a[1],b[0]-a[0]); z=18
    d.polygon([b,(b[0]-z*math.cos(ang-.5),b[1]-z*math.sin(ang-.5)),(b[0]-z*math.cos(ang+.5),b[1]-z*math.sin(ang+.5))],fill=fill)

def marker(d,x,y,label,sub,photo=None,side=1):
    r=34
    d.ellipse((x-r,y-r,x+r,y+r),fill=(15,16,14,235),outline=(218,170,78,255),width=3)
    if photo and os.path.exists(photo):
        im=Image.open(photo).convert("RGB")
        im.thumbnail((56,56),Image.Resampling.LANCZOS)
        mask=Image.new("L",(56,56),0); md=ImageDraw.Draw(mask); md.ellipse((0,0,56,56),fill=255)
        layer=Image.new("RGB",(56,56)); layer.paste(im.resize((56,56)),(0,0),mask)
        frame=Image.new("RGB",(64,64),(30,22,13)); frame.paste(layer,(4,4),mask)
        im2=frame.resize((64,64))
        im2.save(f"{OUT}/tmp_portrait.jpg")
        d.bitmap((x-32,y-32),im2)
        d.ellipse((x-r,y-r,x+r,y+r),outline=(218,170,78,255),width=3)
    bx=x+r+14 if side>0 else x-r-238; by=y-30
    d.rounded_rectangle((bx,by,bx+224,by+62),10,fill=(8,10,9,225),outline=(210,165,78,235),width=2)
    d.text((bx+10,by+7),label,font=S(16,True),fill="white")
    d.text((bx+10,by+32),sub,font=S(12),fill=(227,200,148,255))

route=[P["gibraltar"],P["guadalete"],P["cordoba"],P["toledo"]]
response=[P["toledo"],(635,350),P["guadalete"]]

for i in range(N):
    t=i/FPS
    im=base.copy()
    d=ImageDraw.Draw(im,"RGBA")

    # Controlled cinematic push-in during each historical beat.
    if t<3: zoom=1.0+0.018*t
    elif t<11: zoom=1.018+0.018*(t-3)
    else: zoom=1.16+0.012*(t-11)
    # Keep composition centered on Iberia.
    if zoom!=1:
        nw,nh=int(W*zoom),int(H*zoom)
        z=im.resize((nw,nh),Image.Resampling.BICUBIC)
        im=z.crop(((nw-W)//2,(nh-H)//2,(nw+W)//2,(nh+H)//2))
        d=ImageDraw.Draw(im,"RGBA")

    # 0-3: crossing and landing, matching the narration.
    if t<4.2:
        p=min(max((t-0.3)/3.4,0),1)
        sea_start=(500,625)
        land=P["gibraltar"]
        arrow(d,[sea_start,land],p,(113,210,119,235),6)
        if p>0:
            q=progress_path([sea_start,land],p)[-1]
            d.ellipse((q[0]-7,q[1]-7,q[0]+7,q[1]+7),fill=(125,230,135,255),outline="white",width=2)
        d.rounded_rectangle((35,120,340,168),8,fill=(8,12,10,205),outline=(90,170,102,220),width=1)
        d.text((52,133),"711 • TARIQ CROSSES",font=S(17,True),fill=(220,242,220,255))

    # 3-7: Roderic mobilizes while Tariq moves to Guadalete.
    if 2.8<t<8:
        p=min(max((t-2.8)/4.8,0),1)
        arrow(d,[P["gibraltar"],P["guadalete"]],p,(95,210,111,245),8)
        r=min(max((t-3.2)/3.0,0),1)
        arrow(d,[P["toledo"],(620,365),P["guadalete"]],r,(215,76,61,235),7)
        if r>0:
            q=progress_path([P["toledo"],(620,365),P["guadalete"]],r)[-1]
            d.ellipse((q[0]-7,q[1]-7,q[0]+7,q[1]+7),fill=(230,85,68,245),outline="white",width=2)

    # 7-11: actual event beat, both armies converge at Guadalete.
    if 6.8<t<12:
        x,y=P["guadalete"]; pulse=12+10*(.5+.5*math.sin((t-7)*math.pi*2.2))
        d.ellipse((x-pulse,y-pulse,x+pulse,y+pulse),outline=(255,187,67,240),width=3)
        d.line((x-13,y-13,x+13,y+13),fill=(255,232,183,255),width=3)
        d.line((x+13,y-13,x-13,y+13),fill=(255,232,183,255),width=3)
        if 7.2<t<9.8:
            d.rounded_rectangle((x+22,y-72,x+292,y-20),8,fill=(10,11,10,225),outline=(215,166,76,235),width=2)
            d.text((x+34,y-61),"BATTLE OF GUADALETE",font=S(17,True),fill="white")
            d.text((x+34,y-37),"711 • Visigothic defeat",font=S(12),fill=(230,198,142,255))

    # 10-16: the road opens; Tariq's route continues inland.
    if 10<t<17:
        p=min(max((t-10)/6.0,0),1)
        arrow(d,[P["guadalete"],P["cordoba"],P["toledo"]],p,(102,216,113,245),8)
        q=progress_path([P["guadalete"],P["cordoba"],P["toledo"]],p)[-1]
        d.ellipse((q[0]-8,q[1]-8,q[0]+8,q[1]+8),fill=(110,235,125,245),outline=(245,248,220,255),width=2)
        if 11.0<t<15.8:
            d.rounded_rectangle((35,120,365,168),8,fill=(8,12,10,205),outline=(90,170,102,220),width=1)
            d.text((52,133),"711 • ROAD TO CÓRDOBA",font=S(17,True),fill=(220,242,220,255))

    # 15-19: Toledo becomes the destination.
    if 15<t<19.7:
        x,y=P["toledo"]
        d.ellipse((x-16,y-16,x+16,y+16),outline=(118,232,125,220),width=3)
        d.ellipse((x-5,y-5,x+5,y+5),fill=(118,232,125,255))
        d.rounded_rectangle((x+18,y-45,x+245,y+8),8,fill=(9,11,10,220),outline=(200,159,75,230),width=2)
        d.text((x+30,y-35),"TOLEDO • 711",font=S(17,True),fill="white")
        d.text((x+30,y-12),"Visigothic capital",font=S(12),fill=(226,199,148,255))

    # Geographic labels remain visible throughout, not random popups.
    for name,key in [("Gibraltar","gibraltar"),("Guadalete","guadalete"),("Seville","seville"),("Córdoba","cordoba"),("Toledo","toledo")]:
        x,y=P[key]
        d.ellipse((x-4,y-4,x+4,y+4),fill=(247,237,204,255),outline=(25,25,20,255),width=2)
        d.text((x+9,y-14),name,font=S(16,True),fill=(250,244,223,255),stroke_width=2,stroke_fill=(15,20,16,220))

    # Leader markers appear when narration introduces them.
    if t>=2.8:
        marker(d,560,126,"RODERIC","Visigothic king • 711",f"{OUT}/roderic.jpg" if os.path.exists(f"{OUT}/roderic.jpg") else None,-1)
    if t>=0.5:
        marker(d,770,318,"TARIQ IBN ZIYAD","Umayyad commander • 711",f"{OUT}/tariq.jpg" if os.path.exists(f"{OUT}/tariq.jpg") else None,1)

    # Title and documentary rail.
    d.rounded_rectangle((22,18,470,103),14,fill=(28,21,14,220),outline=(213,171,94,235),width=2)
    d.text((40,28),"THE CONQUEST OF IBERIA",font=F(27,True),fill=(246,231,194,255))
    d.text((192,67),"711 AD",font=F(21,True),fill=(240,213,160,255))
    d.rounded_rectangle((1025,18,1258,63),10,fill=(8,12,10,225),outline=(91,160,102,225),width=2)
    d.text((1040,25),"CLIOPATRIA+",font=S(15,True),fill=(151,232,164,255))
    d.text((1040,44),"atlas-linked animation",font=S(10),fill=(220,230,218,255))

    # Timeline with event ticks tied to narration beats.
    d.rounded_rectangle((20,650,1260,706),10,fill=(7,9,8,232),outline=(147,112,65,220),width=2)
    d.text((36,668),"711",font=S(18,True),fill=(246,221,161,255))
    d.line((92,680,1195,680),fill=(178,160,126,210),width=2)
    for x,lab in [(260,"CROSSING"),(510,"GUADALETE"),(790,"CÓRDOBA"),(1050,"TOLEDO")]:
        d.line((x,675,x,686),fill=(205,184,145,220),width=2); d.text((x-38,690),lab,font=S(9,True),fill=(208,195,171,255))
    mx=92+(t/20)*1103; d.ellipse((mx-7,673,mx+7,687),fill=(240,190,71,255))

    # Vignette
    vig=Image.new("L",(W,H),0); vd=ImageDraw.Draw(vig)
    for r,a in [(0,155),(170,95),(330,30)]:
        vd.ellipse((-r,-r,W+r,H+r),outline=a,width=max(1,r//3))
    vig=vig.filter(ImageFilter.GaussianBlur(80))
    shade=Image.new("RGBA",(W,H),(0,0,0,0)); shade.putalpha(vig)
    im=Image.alpha_composite(im.convert("RGBA"),shade).convert("RGB")
    im.save(f"{OUT}/f{i:04d}.jpg",quality=91)

# Make exact 20s MP4 and synchronize the 20.16s narration.
subprocess.run(["ffmpeg","-y","-framerate",str(FPS),"-i",f"{OUT}/f%04d.jpg","-i",f"{OUT}/narration.mp3",
                "-filter_complex","[1:a]atempo=1.008,aformat=sample_fmts=fltp:sample_rates=48000[a]",
                "-map","0:v:0","-map","[a]","-t","20","-r",str(FPS),"-c:v","libx264","-preset","medium","-crf","18",
                "-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart",f"{OUT}/reconquista-711-cinematic-20s.mp4"],check=True)
subprocess.run(["ffprobe","-v","error","-show_entries","format=duration:stream=width,height,r_frame_rate","-of","json",f"{OUT}/reconquista-711-cinematic-20s.mp4"],check=True)
print(f"{OUT}/reconquista-711-cinematic-20s.mp4")
