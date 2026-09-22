import json, os, subprocess, pathlib, sys
from gradio_client import Client, handle_file

root=pathlib.Path("projects/documentary")
build=root/"build"/"wan"
build.mkdir(parents=True,exist_ok=True)
start=int(os.environ.get("SCENE_START","1")); end=int(os.environ.get("SCENE_END","40"))
assets=json.loads((root/"scene-assets.json").read_text())["assets"]
assets=[a for a in assets if start<=a["sceneNumber"]<=end]
client=Client("zerogpu-aoti/wan2-2-fp8da-aoti-faster")
prompt=("Historical animated strategy map of medieval Iberia, geographically accurate parchment cartography, armies "
         "marching along campaign routes, ships crossing straits where appropriate, cities and battle sites anchored "
         "to geography, evolving political boundaries, restrained documentary military-map cinematography, dynamic "
         "troop movement, camera tracking the campaign, no modern UI, no random text, no distorted geography. ")
for a in assets:
    n=a["sceneNumber"]; out=build/f"scene-{n:03d}-wan.mp4"
    if out.exists() and out.stat().st_size>100000: continue
    img=build/f"scene-{n:03d}.png"
    subprocess.run(["curl","-L","--fail","--retry","3","-o",str(img),a["imageUrl"]],check=True)
    motion=("Animate this map as a living historical documentary scene. Preserve map identity and readable labels. "
            "Animate armies, ships, marching routes, battle markers and subtle terrain atmosphere. Follow movement "
            "with a restrained strategic camera. Do not make a static slideshow.")
    result=client.predict(handle_file(str(img)),None,prompt+motion,4,"",5.0,1.0,3.0,1000+n,False,7,api_name="/generate_video")
    src=result[0] if isinstance(result,(tuple,list)) else result
    if isinstance(src,dict): src=src.get("path") or src.get("url")
    if not src: raise RuntimeError(f"No output for scene {n}: {result}")
    if str(src).startswith("http"):
        subprocess.run(["curl","-L","--fail","--retry","3","-o",str(out),str(src)],check=True)
    else: subprocess.run(["cp",str(src),str(out)],check=True)
print(f"generated scenes {start}-{end}")
