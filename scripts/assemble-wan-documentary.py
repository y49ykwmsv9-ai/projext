import pathlib, subprocess, os, json
root=pathlib.Path("projects/documentary"); build=root/"build"/"wan"; build.mkdir(parents=True,exist_ok=True)
files=sorted(build.glob("scene-*-wan.mp4"))
if len(files)!=40: raise SystemExit(f"Expected 40 generated clips, found {len(files)}")
final=root/"build"/"reconquista-documentary-60min-wan.mp4"
parts=[]
for i,src in enumerate(files,1):
    dst=build/f"scene-{i:03d}-90s.mp4"
    subprocess.run(["ffmpeg","-y","-stream_loop","17","-i",str(src),"-filter_complex",
      "[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,fps=16,trim=duration=90,setpts=PTS-STARTPTS[outv]",
      "-map","[outv]","-an","-c:v","libx264","-preset","veryfast","-crf","20","-pix_fmt","yuv420p",str(dst)],check=True)
    parts.append(dst)
concat=build/"concat.txt"; concat.write_text("\n".join("file '"+str(p.resolve())+"'" for p in parts))
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(concat),"-c","copy",str(final)],check=True)
subprocess.run(["ffprobe","-v","error","-show_entries","format=duration,size","-of","json",str(final)],check=True)
