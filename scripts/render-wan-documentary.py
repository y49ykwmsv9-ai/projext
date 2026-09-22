import json, os, subprocess, pathlib
from gradio_client import Client, handle_file

ROOT=pathlib.Path("projects/documentary")
BUILD=ROOT/"build"/"wan"
BUILD.mkdir(parents=True, exist_ok=True)
assets=json.loads((ROOT/"scene-assets.json").read_text())["assets"]
client=Client("zerogpu-aoti/wan2-2-fp8da-aoti-faster")

def prompt_for(n):
    return ("Historical animated strategy map of medieval Iberia, geographically accurate parchment cartography, "
            "armies marching along campaign routes, ships crossing straits where appropriate, cities and battle sites "
            "anchored to geography, evolving political boundaries, restrained documentary military-map cinematography, "
            "dynamic troop movement, camera tracking the campaign, no modern UI, no random text, no distorted geography.")

clips=[]
for a in assets:
    n=a["sceneNumber"]
    out=BUILD/f"scene-{n:03d}-wan.mp4"
    if out.exists() and out.stat().st_size>100000:
        clips.append(out); continue
    img=BUILD/f"scene-{n:03d}.png"
    subprocess.run(["curl","-L","--fail","--retry","3","-o",str(img),a["imageUrl"]],check=True)
    motion=("Animate this map as a living historical documentary scene. Preserve its map identity and readable labels. "
            "Animate armies, ships, marching routes, battle markers and subtle terrain atmosphere. Follow movement with "
            "a restrained strategic camera. Do not turn it into a static slideshow.")
    result=client.predict(handle_file(str(img)),None,prompt_for(n)+" "+motion,4,"",5.0,1.0,3.0,42+n,False,6,api_name="/generate_video")
    src=result[0] if isinstance(result,(tuple,list)) else result
    if isinstance(src,dict): src=src.get("path") or src.get("url")
    if not src: raise RuntimeError(f"No video returned for scene {n}: {result}")
    if str(src).startswith("http"):
        subprocess.run(["curl","-L","--fail","--retry","3","-o",str(out),str(src)],check=True)
    else:
        subprocess.run(["cp",str(src),str(out)],check=True)
    clips.append(out)

scene_final=[]
for n,src in enumerate(clips,1):
    dst=BUILD/f"scene-{n:03d}-90s.mp4"
    subprocess.run(["ffmpeg","-y","-stream_loop","17","-i",str(src),"-filter_complex",
        "[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,fps=16,trim=duration=90,setpts=PTS-STARTPTS[outv]",
        "-map","[outv]","-an","-c:v","libx264","-preset","veryfast","-crf","20","-pix_fmt","yuv420p","-movflags","+faststart",str(dst)],check=True)
    scene_final.append(dst)

concat=BUILD/"concat.txt"
concat.write_text("\n".join("file '"+str(p.resolve())+"'" for p in scene_final))
final=ROOT/"build"/"reconquista-documentary-60min-wan.mp4"
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(concat),"-c","copy",str(final)],check=True)
subprocess.run(["ffprobe","-v","error","-show_entries","format=duration,size","-of","json",str(final)],check=True)
print(final)
