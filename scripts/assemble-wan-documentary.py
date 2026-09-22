import pathlib, subprocess, re
root=pathlib.Path("projects/documentary"); build=root/"build"/"wan"; build.mkdir(parents=True,exist_ok=True)
files=sorted(build.glob("scene-*-wan.mp4"))
if len(files)!=40: raise SystemExit(f"Expected 40 generated clips, found {len(files)}")
script=(root/"build"/"documentary-script.md").read_text()
chapters=re.findall(r"## (.*?)\n\n(.*?)(?=\n## |\Z)",script,re.S)
if len(chapters)!=10: raise SystemExit(f"Expected 10 narration chapters, found {len(chapters)}")
chapter_videos=[]
for ci,(heading,narration) in enumerate(chapters,1):
    audio=build/f"chapter-{ci:02d}-voice.wav"
    subprocess.run(["piper","--model","voices/en_US-lessac-medium.onnx","--output_file",str(audio)],input=narration.encode(),check=True)
    parts=files[(ci-1)*4:ci*4]; vids=[]
    for j,src in enumerate(parts,1):
        dst=build/f"chapter-{ci:02d}-scene-{j}.mp4"
        subprocess.run(["ffmpeg","-y","-stream_loop","17","-i",str(src),"-filter_complex",
          "[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,fps=16,trim=duration=90,setpts=PTS-STARTPTS[v]",
          "-map","[v]","-an","-c:v","libx264","-preset","veryfast","-crf","20","-pix_fmt","yuv420p",str(dst)],check=True)
        vids.append(dst)
    cc=build/f"chapter-{ci:02d}-concat.txt"; cc.write_text("\n".join("file '"+str(v.resolve())+"'" for v in vids))
    silent=build/f"chapter-{ci:02d}-silent.mp4"
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(cc),"-c","copy",str(silent)],check=True)
    finalc=build/f"chapter-{ci:02d}.mp4"
    subprocess.run(["ffmpeg","-y","-i",str(silent),"-i",str(audio),"-filter_complex","[1:a]apad=pad_dur=360,atrim=duration=360[a]","-map","0:v","-map","[a]","-c:v","copy","-c:a","aac","-b:a","160k","-t","360",str(finalc)],check=True)
    chapter_videos.append(finalc)
concat=root/"build"/"wan-chapters.txt"; concat.write_text("\n".join("file '"+str(p.resolve())+"'" for p in chapter_videos))
final=root/"build"/"reconquista-documentary-60min-wan.mp4"
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(concat),"-c","copy",str(final)],check=True)
print(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration,size","-of","json",str(final)],capture_output=True,text=True,check=True).stdout)
