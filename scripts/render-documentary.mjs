import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const build = path.join(root,'projects','documentary','build');
const manifest = JSON.parse(fs.readFileSync(path.join(build,'documentary-manifest.json'),'utf8'));
const sceneAssets = JSON.parse(fs.readFileSync(path.join(root,'projects','documentary','scene-assets.json'),'utf8'));
const assets = path.join(build,'assets');
const chaptersDir = path.join(build,'chapters');
const sceneAssetMap = new Map(sceneAssets.assets.map(a => [a.sceneNumber, a.imageUrl]));
fs.mkdirSync(assets,{recursive:true});
fs.mkdirSync(chaptersDir,{recursive:true});

const run = (cmd,args,opts={}) => execFileSync(cmd,args,{stdio:'inherit',...opts});
const q = s => String(s).replaceAll('\\','\\\\').replaceAll(':','\\:').replaceAll("'","\\'");
const splitNarration = (text,n) => {
  const sentences = text.replace(/\\s+/g,' ').trim().split(/(?<=[.!?])\\s+/);
  const groups = Array.from({length:n},()=>[]);
  sentences.forEach((s,i)=>groups[Math.min(n-1,Math.floor(i*n/sentences.length))].push(s));
  return groups.map(g=>g.join(' '));
};
const sceneContext = (c,title,visual,tags) =>
  `This scene focuses on ${title}. The visual reconstruction places the viewer inside the period setting rather than presenting a static illustration. ${visual}. The camera emphasizes people, terrain, architecture, movement and the practical conditions of medieval warfare and daily life. The scene clarifies where this episode fits in the wider chronology of ${c.title}, while keeping the distinction between documented history and visual reconstruction clear. The reconstruction is illustrative, not a surviving eyewitness image.`;

const mapSvg = path.join(assets,'reconquista.svg');
const mapPng = path.join(assets,'reconquista.png');
if (!fs.existsSync(mapSvg)) run('curl',['-L','--fail','--retry','3','-o',mapSvg,'https://commons.wikimedia.org/wiki/Special:Redirect/file/Reconquista_(914-1492).svg']);
run('rsvg-convert',['-w','1280','-h','1136','-o',mapPng,mapSvg]);

const sourceCredit = 'Historical map: Macucal / Wikimedia Commons, CC BY-SA 3.0 / GFDL';
const sceneFiles = [];
let sceneNumber = 0;

for (const c of manifest.chapters) {
  const scenes = c.scenes || [];
  const narrationParts = splitNarration(c.narration,scenes.length);
  const sec = Math.floor((c.minutes * 60) / Math.max(1,scenes.length));

  for (let i=0; i<scenes.length; i++) {
    sceneNumber++;
    const [year,title,visual,tags] = scenes[i];
    const sceneDir = path.join(chaptersDir,c.id);
    fs.mkdirSync(sceneDir,{recursive:true});
    const imageUrl = sceneAssetMap.get(sceneNumber);
    if (!imageUrl) throw new Error(`Missing generated scene asset for scene ${sceneNumber}`);
    const imagePath = path.join(sceneDir,`${i+1}.jpg`);
    if (!fs.existsSync(imagePath)) run('curl',['-L','--fail','--retry','3','-o',imagePath,imageUrl]);

    const txt = path.join(sceneDir,`${i+1}.txt`);
    const wav = path.join(sceneDir,`${i+1}.wav`);
    const mp4 = path.join(sceneDir,`${i+1}.mp4`);
    const script = [narrationParts[i], sceneContext(c,title,visual,tags)].filter(Boolean).join('\\n\\n');
    fs.writeFileSync(txt,script);
    run('piper',['--model','en_US-lessac-medium','--input_file',txt,'--output_file',wav]);

    const motion = [
      `zoompan=z='min(zoom+0.00055,1.08)':x='iw/2-(iw/zoom/2)+32*sin(on/55)':y='ih/2-(ih/zoom/2)+18*cos(on/63)':d=1:s=1280x720:fps=24`,
      `zoompan=z='min(zoom+0.00045,1.07)':x='iw/2-(iw/zoom/2)-35*sin(on/61)':y='ih/2-(ih/zoom/2)+22*sin(on/47)':d=1:s=1280x720:fps=24`,
      `zoompan=z='max(1.08-on*0.00045,1.0)':x='iw/2-(iw/zoom/2)+25*cos(on/58)':y='ih/2-(ih/zoom/2)-18*sin(on/67)':d=1:s=1280x720:fps=24`,
      `zoompan=z='1.03+0.025*sin(on/90)':x='iw/2-(iw/zoom/2)+20*sin(on/73)':y='ih/2-(ih/zoom/2)+20*cos(on/80)':d=1:s=1280x720:fps=24`
    ][i % 4];

    const filter = [
      'scale=1280:720:force_original_aspect_ratio=decrease',
      'pad=1280:720:(ow-iw)/2:(oh-ih)/2',
      motion,
      'drawbox=x=0:y=0:w=iw:h=86:color=black@0.45:t=fill',
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${q(year+'  •  '+title)}':fontcolor=white:fontsize=30:x=42:y=28`,
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='SCENE ${sceneNumber}  •  ${q(tags)}':fontcolor=white@0.88:fontsize=16:box=1:boxcolor=black@0.48:boxborderw=9:x=42:y=665`,
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${q(sourceCredit)}':fontcolor=white@0.75:fontsize=15:x=42:y=695`
    ].join(',');

    const ambience = `aevalsrc=0.006*sin(2*PI*92*t)+0.003*sin(2*PI*137*t):s=22050:d=${sec}`;
    run('ffmpeg',['-y','-loop','1','-i',imagePath,'-i',wav,'-f','lavfi','-i',ambience,'-t',String(sec),'-r','24','-vf',filter,'-filter_complex','[1:a]aresample=22050,apad=pad_dur=90[n];[2:a]volume=0.18[a];[n][a]amix=inputs=2:duration=first:dropout_transition=2[aout]','-map','0:v','-map','[aout]','-c:v','libx264','-preset','veryfast','-tune','stillimage','-b:v','850k','-maxrate','1000k','-bufsize','1700k','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',mp4]);
    sceneFiles.push(mp4);
  }
}

const concatFile = path.join(build,'concat-scenes.txt');
fs.writeFileSync(concatFile,sceneFiles.map(f => `file '${f.replaceAll("'","'\\''")}'`).join('\\n')+'\\n');
const final = path.join(build,'reconquista-documentary-60min.mp4');
run('ffmpeg',['-y','-f','concat','-safe','0','-i',concatFile,'-c','copy','-movflags','+faststart',final]);
run('ffprobe',['-v','error','-show_entries','format=duration,size','-of','default=noprint_wrappers=1',final]);
const plan = {
  title: manifest.title,
  targetDurationMinutes: manifest.targetDurationMinutes,
  output: final,
  resolution: '1280x720',
  narration: 'Piper neural TTS, en_US-lessac-medium',
  sceneCount: sceneFiles.length,
  generatedSceneAssets: sceneAssets.assets.length,
  map: sourceCredit,
  chapters: manifest.chapters.map(c=>({id:c.id,year:c.year,title:c.title,targetSeconds:c.minutes*60,sceneCount:(c.scenes||[]).length}))
};
fs.writeFileSync(path.join(build,'render-plan.json'),JSON.stringify(plan,null,2));
console.log('Finished 40-scene animated documentary: '+final);
