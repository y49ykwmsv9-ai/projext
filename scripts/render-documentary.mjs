import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const build = path.join(root,'projects','documentary','build');
const manifest = JSON.parse(fs.readFileSync(path.join(build,'documentary-manifest.json'),'utf8'));
const assets = path.join(build,'assets');
const chaptersDir = path.join(build,'chapters');
fs.mkdirSync(assets,{recursive:true});
fs.mkdirSync(chaptersDir,{recursive:true});

const run = (cmd,args,opts={}) => execFileSync(cmd,args,{stdio:'inherit',...opts});
const q = s => s.replaceAll('\\','\\\\').replaceAll(':','\\:').replaceAll("'","\\'");

const mapSvg = path.join(assets,'reconquista.svg');
const mapPng = path.join(assets,'reconquista.png');
if (!fs.existsSync(mapSvg)) {
  run('curl',['-L','--fail','--retry','3','-o',mapSvg,'https://commons.wikimedia.org/wiki/Special:Redirect/file/Reconquista_(914-1492).svg']);
}
run('rsvg-convert',['-w','1280','-h','1136','-o',mapPng,mapSvg]);

const sourceCredit = 'Map: Macucal, Wikimedia Commons, CC BY-SA 3.0 / GFDL';
const chapterFiles = [];
const wavFiles = [];

for (const c of manifest.chapters) {
  const txt = path.join(chaptersDir, c.id+'.txt');
  const wav = path.join(chaptersDir, c.id+'.wav');
  fs.writeFileSync(txt, c.narration + '\n\n');
  run('espeak-ng',['-v','en-us','-s','75','-p','42','-a','165','-f',txt,'-w',wav]);
  wavFiles.push(wav);
}

const audioConcat = path.join(chaptersDir,'audio-concat.txt');
fs.writeFileSync(audioConcat, wavFiles.map(f => `file '${f.replaceAll("'","'\\''")}'`).join('\n')+'\n');
const fullWav = path.join(chaptersDir,'full-narration.wav');
run('ffmpeg',['-y','-f','concat','-safe','0','-i',audioConcat,'-af','apad=pad_dur=3600','-t','3600',fullWav]);

const final = path.join(build,'reconquista-documentary-60min.mp4');
const filters = [
  'scale=1280:720:force_original_aspect_ratio=decrease',
  'pad=1280:720:(ow-iw)/2:(oh-ih)/2',
  'zoompan=z=1.03:d=86400:s=1280x720:fps=24',
  `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='THE RECONQUISTA':fontcolor=white:fontsize=44:box=1:boxcolor=black@0.55:boxborderw=18:x=45:y=40`,
  ...manifest.chapters.flatMap((c,i) => {
    const start = i*360;
    const end = (i+1)*360;
    const label = `${c.year}  •  ${c.title}`.replaceAll('\\','\\\\').replaceAll(':','\\:').replaceAll("'","\\'");
    return [
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${label}':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.60:boxborderw=14:x=45:y=105:enable='between(t,${start},${end})'`,
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${sourceCredit}':fontcolor=white@0.82:fontsize=17:box=1:boxcolor=black@0.45:boxborderw=10:x=45:y=670:enable='between(t,${start},${end})'`
    ];
  })
].join(',');

run('ffmpeg',['-y','-loop','1','-i',mapPng,'-i',fullWav,'-t','3600','-r','24','-vf',filters,'-c:v','libx264','-preset','veryfast','-tune','stillimage','-b:v','900k','-maxrate','1100k','-bufsize','1800k','-pix_fmt','yuv420p','-c:a','aac','-b:a','64k','-movflags','+faststart',final]);

run('ffprobe',['-v','error','-show_entries','format=duration,size','-of','default=noprint_wrappers=1',final]);

const plan = {
  title: manifest.title,
  targetDurationMinutes: manifest.targetDurationMinutes,
  output: final,
  resolution: '1280x720',
  narration: 'espeak-ng local free TTS',
  map: sourceCredit,
  chapters: manifest.chapters.map(c=>({id:c.id,year:c.year,title:c.title,targetSeconds:c.minutes*60}))
};
fs.writeFileSync(path.join(build,'render-plan.json'),JSON.stringify(plan,null,2));
console.log('Finished documentary: '+final);
