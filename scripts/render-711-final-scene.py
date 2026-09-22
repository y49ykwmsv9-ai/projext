#!/usr/bin/env python3
import json, math, os, subprocess, sys, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1280, 720
FPS = 24
DUR = 20.0
N = int(FPS * DUR)
BASE = sys.argv[1]
AUDIO = sys.argv[2]
OUT = sys.argv[3]
PORTRAIT_TARIQ = sys.argv[4] if len(sys.argv) > 4 else ""
PORTRAIT_RODERIC = sys.argv[5] if len(sys.argv) > 5 else ""
CLIO = sys.argv[6] if len(sys.argv) > 6 else "projects/documentary/data/cliopatria.geojson"
os.makedirs("/tmp/reconquista711_frames", exist_ok=True)

base = Image.open(BASE).convert("RGB").resize((W,H), Image.Resampling.LANCZOS)
serif = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
serif_b = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
sans = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
sans_b = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def F(size,b=False):
    return ImageFont.truetype(serif_b if b else serif,size)
def S(size,b=False):
    return ImageFont.truetype(sans_b if b else sans,size)

# Geographic frame used by the generated 711 base map. All event coordinates come from the atlas.
LON0, LON1 = -10.5, 4.5
LAT0, LAT1 = 35.0, 44.5
MAP_X0, MAP_X1 = 90, 1190
MAP_Y0, MAP_Y1 = 55, 640

def xy(lon,lat):
    x = MAP_X0 + (lon-LON0)/(LON1-LON0)*(MAP_X1-MAP_X0)
    y = MAP_Y1 - (lat-LAT0)/(LAT1-LAT0)*(MAP_Y1-MAP_Y0)
    return (x,y)

# Atlas place coordinates.
places = {
  "gibraltar":(-5.35,36.14),
  "guadalete":(-6.22,36.58),
  "seville":(-5.99,37.39),
  "cordoba":(-4.78,37.89),
  "toledo":(-4.03,39.86),
}
P = {k:xy(*v) for k,v in places.items()}
P["roderic_start"] = xy(-4.03,39.86)
P["tariq_start"] = xy(-5.85,35.35)

def lerp(a,b,t):
    return (a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t)

def route_pos(route, progress):
    if progress <= 0: return route[0]
    if progress >= 1: return route[-1]
    lens=[math.dist(route[i],route[i+1]) for i in range(len(route)-1)]
    total=sum(lens); target=total*progress; acc=0
    for a,b,d in zip(route,route[1:],lens):
        if acc+d >= target:
            q=(target-acc)/d if d else 0
            return lerp(a,b,q)
        acc += d
    return route[-1]

def draw_route(draw, route, progress, fill, width=6, dash=False):
    if progress <= 0: return
    pts=[route_pos(route,progress)]
    if progress < 1:
        target=progress*sum(math.dist(route[i],route[i+1]) for i in range(len(route)-1))
    else:
        target=sum(math.dist(route[i],route[i+1]) for i in range(len(route)-1))
    acc=0; pts=[route[0]]
    for a,b in zip(route,route[1:]):
        d=math.dist(a,b)
        if acc+d <= target:
            pts.append(b); acc+=d
        else:
            pts.append(lerp(a,b,(target-acc)/d if d else 0)); break
    if len(pts)>1:
        if dash:
            for i in range(len(pts)-1):
                a,b=pts[i],pts[i+1]
                dist=math.dist(a,b); steps=max(1,int(dist/12))
                for j in range(steps):
                    if j%2==0:
                        q0=j/steps; q1=min(1,(j+1)/steps)
                        draw.line((lerp(a,b,q0),lerp(a,b,q1)),fill=fill,width=width)
        else:
            draw.line(pts,fill=fill,width=width,joint="curve")
        a,b=pts[-2],pts[-1]
        ang=math.atan2(b[1]-a[1],b[0]-a[0])
        ah=15
        p1=(b[0]-ah*math.cos(ang-math.pi/6),b[1]-ah*math.sin(ang-math.pi/6))
        p2=(b[0]-ah*math.cos(ang+math.pi/6),b[1]-ah*math.sin(ang+math.pi/6))
        draw.polygon([b,p1,p2],fill=fill)

def load_geometry():
    if not os.path.exists(CLIO):
        return []
    try:
        return json.load(open(CLIO,encoding="utf-8")).get("features",[])
    except Exception:
        return []

features=load_geometry()

def active(f,year):
    p=f.get("properties",{})
    try: return float(p.get("FromYear")) <= year <= float(p.get("ToYear"))
    except: return False

def name(f):
    p=f.get("properties",{})
    return p.get("Name") or p.get("name") or p.get("PolityName") or ""

def resolve(cands,year=711):
    cs=[c.lower() for c in cands]
    matches=[]
    for f in features:
        if not active(f,year): continue
        n=name(f).lower()
        if any(c==n or c in n or n in c for c in cs):
            matches.append(f)
    matches.sort(key=lambda f: float(f.get("properties",{}).get("Area") or 0), reverse=True)
    return matches[0] if matches else None

def polygon_paths(geom):
    if not geom: return []
    typ=geom.get("type"); coords=geom.get("coordinates",[])
    if typ=="Polygon": return [coords]
    if typ=="MultiPolygon": return [p for p in coords]
    return []

def draw_geojson_polity(draw, f, fill, outline):
    if not f: return
    for poly in polygon_paths(f.get("geometry")):
        for ring in poly[:1]:
            pts=[xy(lon,lat) for lon,lat,*_ in ring]
            if len(pts)>2:
                draw.polygon(pts,fill=fill,outline=outline)

umayyad=resolve(["Umayyad Caliphate"])
visigothic=resolve(["Visigothic Kingdom"])

def load_portrait(path):
    try:
        im=Image.open(path).convert("RGB")
        im.thumbnail((180,180),Image.Resampling.LANCZOS)
        side=min(im.size); left=(im.width-side)//2; top=(im.height-side)//2
        return im.crop((left,top,left+side,top+side))
    except Exception:
        return None

tariq_img=load_portrait(PORTRAIT_TARIQ)
roderic_img=load_portrait(PORTRAIT_RODERIC)

def portrait_marker(im, x,y, title, sub, side):
    r=34
    d.ellipse((x-r-4,y-r-4,x+r+4,y+r+4),fill=(18,14,10,235),outline=(218,177,99,255),width=2)
    if im:
        mask=Image.new("L",(2*r,2*r),0); md=ImageDraw.Draw(mask); md.ellipse((0,0,2*r,2*r),fill=255)
        crop=im.resize((2*r,2*r),Image.Resampling.LANCZOS)
        layer=Image.new("RGBA",(2*r,2*r),(0,0,0,0)); layer.paste(crop,(0,0),mask)
        canvas.paste(layer,(int(x-r),int(y-r)),layer)
        dd=ImageDraw.Draw(canvas,"RGBA")
        dd.ellipse((x-r,y-r,x+r,y+r),outline=(228,192,119,255),width=3)
    else:
        d.ellipse((x-19,y-23,x+19,y+23),fill=(142,105,67,255),outline=(238,205,145,255),width=2)
    bx=x-r-245 if side=="left" else x+r+12
    by=max(72,y-34)
    d.rounded_rectangle((bx,by,bx+232,by+67),10,fill=(10,12,10,225),outline=(213,166,76,240),width=2)
    d.text((bx+10,by+8),title,font=S(16,True),fill="white")
    d.text((bx+10,by+34),sub,font=S(12),fill=(226,199,148,255))

umayyad_fill=(58,112,67,55)
vis_fill=(160,125,62,48)

for i in range(N):
    t=i/FPS
    canvas=base.copy()
    d=ImageDraw.Draw(canvas,"RGBA")

    # Cinematic vignette and subtle paper grain.
    vign=Image.new("L",(W,H),0); vd=ImageDraw.Draw(vign)
    vd.rectangle((0,0,W,H),fill=0)
    for k in range(24):
        pad=k*18
        vd.rectangle((pad,pad,W-pad,H-pad),outline=int(4+k*3))
    vign=vign.filter(ImageFilter.GaussianBlur(28))
    dark=Image.new("RGBA",(W,H),(0,0,0,0)); dark.putalpha(vign.point(lambda x:int(x*0.55)))
    canvas=Image.alpha_composite(canvas.convert("RGBA"),dark)
    d=ImageDraw.Draw(canvas,"RGBA")

    # Database-driven territorial overlays.
    draw_geojson_polity(d,visigothic,vis_fill,(118,91,44,150))
    draw_geojson_polity(d,umayyad,umayyad_fill,(63,119,73,150))

    # Routes are tied to narration events, not decorative motion.
    crossing=[P["tariq_start"],P["gibraltar"]]
    vis_route=[P["roderic_start"],P["guadalete"]]
    invasion=[P["guadalete"],P["seville"],P["cordoba"],P["toledo"]]

    if t < 2.8:
        p=max(0,min(1,t/2.8))
        draw_route(d,crossing,p,(82,213,108,235),6)
        fleet_pos=route_pos(crossing,p)
        for j in range(3):
            fx=fleet_pos[0]-j*14; fy=fleet_pos[1]+j*7
            d.polygon([(fx,fy-7),(fx+13,fy),(fx,fy+7)],fill=(82,213,108,245),outline=(238,239,208,220))
    elif t < 6.4:
        draw_route(d,crossing,1,(82,213,108,235),6)
        p=(t-2.8)/3.6
        draw_route(d,vis_route,p,(210,67,55,235),6,dash=True)
        pos=route_pos(vis_route,p)
        for j in range(4):
            x=pos[0]-j*12; y=pos[1]+(j%2)*8
            d.rectangle((x-4,y-4,x+4,y+4),fill=(210,67,55,245),outline=(255,231,205,220))
    elif t < 10.6:
        draw_route(d,crossing,1,(82,213,108,235),6)
        draw_route(d,vis_route,1,(210,67,55,180),6,dash=True)
        p=min(1,max(0,(t-6.4)/2.8))
        g=route_pos([P["gibraltar"],P["guadalete"],P["seville"]],p)
        r=route_pos([P["roderic_start"],P["guadalete"]],min(1,(t-6.4)/1.3))
        for pos,col in [(g,(82,213,108,245)),(r,(210,67,55,245))]:
            for j in range(5):
                d.ellipse((pos[0]-7+j*9,pos[1]-7,pos[0]+7+j*9,pos[1]+7),fill=col,outline=(245,240,218,210))
        if t>=7.1:
            pulse=10+18*(0.5+0.5*math.sin((t-7.1)*math.pi*4))
            x,y=P["guadalete"]
            d.ellipse((x-pulse,y-pulse,x+pulse,y+pulse),outline=(255,187,62,240),width=4)
            d.line((x-14,y-14,x+14,y+14),fill=(255,235,190,255),width=3)
            d.line((x+14,y-14,x-14,y+14),fill=(255,235,190,255),width=3)
    else:
        draw_route(d,crossing,1,(82,213,108,235),6)
        draw_route(d,vis_route,1,(210,67,55,110),6,dash=True)
        p=min(1,max(0,(t-10.6)/8.0))
        draw_route(d,invasion,p,(82,213,108,240),7)
        pos=route_pos(invasion,p)
        for j in range(6):
            off=j*11
            d.ellipse((pos[0]-7-off,pos[1]-7+(j%2)*8,pos[0]+7-off,pos[1]+7+(j%2)*8),fill=(82,213,108,240),outline=(244,239,213,220))

    # Cities become active exactly as the narrated advance reaches them.
    city_state={"gibraltar":True}
    city_state["guadalete"]=t>=6.8
    city_state["seville"]=t>=12.2
    city_state["cordoba"]=t>=14.1
    city_state["toledo"]=t>=18.0
    for key,label in [("gibraltar","Gibraltar"),("guadalete","Guadalete"),("seville","Seville"),("cordoba","Córdoba"),("toledo","Toledo")]:
        x,y=P[key]
        active_city=city_state[key]
        rad=7 if active_city else 5
        d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=(239,194,76,245) if active_city else (239,232,202,235),outline=(30,26,18,255),width=2)
        d.text((x+10,y-15),label,font=S(16,True),fill=(252,246,221,255),stroke_width=2,stroke_fill=(20,25,18,210))

    # Battle card only exists during the actual battle beat.
    if 7.0 <= t <= 10.6:
        bx,by=P["guadalete"][0]+26,P["guadalete"][1]-70
        d.rounded_rectangle((bx,by,bx+238,by+58),9,fill=(12,14,12,225),outline=(213,166,76,235),width=2)
        d.text((bx+11,by+8),"BATTLE OF GUADALETE",font=S(15,True),fill="white")
        d.text((bx+11,by+31),"711 • Visigothic defeat",font=S(12),fill=(226,199,148,255))

    # Leader portraits appear when they enter the narrated sequence.
    if 0.6 <= t <= 18.8:
        portrait_marker(tariq_img,P["tariq_start"][0]+18,P["tariq_start"][1]-8,"TARIQ IBN ZIYAD","Umayyad commander • 711","right")
    if 2.7 <= t <= 10.8:
        portrait_marker(roderic_img,P["roderic_start"][0]-10,P["roderic_start"][1]-18,"RODERIC","Visigothic king • 711","left")

    # Phase caption follows the narration.
    if t<2.8: phase="CROSSING THE STRAIT"
    elif t<6.4: phase="RODERIC MARCHES SOUTH"
    elif t<10.6: phase="GUADALETE • 711"
    elif t<15.3: phase="THE ROAD OPENS INLAND"
    else: phase="ADVANCE ON TOLEDO"

    d.rounded_rectangle((22,18,505,96),14,fill=(29,22,14,220),outline=(215,172,97,235),width=2)
    d.text((39,28),"THE CONQUEST OF IBERIA",font=F(27,True),fill=(246,231,194,255))
    d.text((39,65),"711 AD",font=F(19,True),fill=(240,213,160,255))
    d.rounded_rectangle((860,18,1256,60),10,fill=(8,13,11,225),outline=(91,160,102,230),width=2)
    d.text((880,27),"CLIOPATRIA+ • 711 EVENT ATLAS",font=S(14,True),fill=(151,232,164,255))

    d.rounded_rectangle((850,598,1252,640),8,fill=(12,14,12,220),outline=(190,150,83,210),width=1)
    d.text((869,610),phase,font=S(15,True),fill=(245,230,193,255))

    # Persistent event timeline with exact scene beats.
    d.rounded_rectangle((22,654,1258,706),10,fill=(8,10,9,228),outline=(147,112,65,220),width=2)
    d.text((36,668),"711",font=S(18,True),fill=(246,221,161,255))
    d.line((92,681,1190,681),fill=(178,160,126,210),width=2)
    beats=[(0.0,"CROSS"),(2.8,"RODERIC"),(7.0,"BATTLE"),(10.6,"ADVANCE"),(18.0,"TOLEDO")]
    for bt,label in beats:
        x=92+(bt/20)*1098
        d.line((x,674,x,688),fill=(205,187,150,220),width=2)
        d.text((x-22,688),label,font=S(9,True),fill=(190,177,151,220))
    mx=92+(min(t,20)/20)*1098
    d.ellipse((mx-7,674,mx+7,688),fill=(240,190,71,255))

    # End-state emphasis: Toledo is highlighted only after the route reaches it.
    if t>=18.0:
        x,y=P["toledo"]
        pulse=16+4*math.sin((t-18)*math.pi*2)
        d.ellipse((x-pulse,y-pulse,x+pulse,y+pulse),outline=(247,202,92,235),width=3)
        d.rounded_rectangle((x+20,y-55,x+215,y-10),9,fill=(13,14,12,225),outline=(213,166,76,235),width=2)
        d.text((x+31,y-43),"TOLEDO • 711",font=S(15,True),fill="white")

    # Grain.
    noise=Image.effect_noise((W,H),20).convert("L").point(lambda v:int(v*0.07))
    grain=Image.merge("RGBA",(noise,noise,noise,noise))
    canvas=Image.alpha_composite(canvas,grain)
    canvas.convert("RGB").save(f"/tmp/reconquista711_frames/f{i:04d}.jpg",quality=92)

# Render frames + high quality Runway narration. The audio is trimmed/padded to exactly 20 seconds.
wav="/tmp/reconquista711_audio.m4a"
subprocess.run(["ffmpeg","-y","-i",AUDIO,"-af","loudnorm=I=-16:TP=-1.5:LRA=7,apad","-t","20","-c:a","aac","-b:a","192k",wav],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
silent="/tmp/reconquista711_video.mp4"
subprocess.run(["ffmpeg","-y","-framerate",str(FPS),"-i","/tmp/reconquista711_frames/f%04d.jpg","-c:v","libx264","-preset","medium","-crf","17","-pix_fmt","yuv420p","-movflags","+faststart",silent],check=True)
subprocess.run(["ffmpeg","-y","-i",silent,"-i",wav,"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","192k","-t","20","-movflags","+faststart",OUT],check=True)
print(json.dumps({"output":OUT,"duration":20,"fps":FPS,"narration":"Runway cinematic neural voice","atlas":"Cliopatria v0.2.0 + Reconquista atlas","umayyad_resolved":bool(umayyad),"visigothic_resolved":bool(visigothic)}))
