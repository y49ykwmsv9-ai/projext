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

for (const c of manifest.chapters) {
  const txt = path.join(chaptersDir, c.id+'.txt');
  const wav = path.join(chaptersDir, c.id+'.wav');
  const mp4 = path.join(chaptersDir, c.id+'.mp4');
  fs.writeFileSync(txt, c.narration + '\n\n');
  run('espeak-ng',['-v','en-us','-s','75','-p','42','-a','165','-f',txt,'-w',wav]);

  const card = path.join(chaptersDir,c.id+'.png');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
    <rect width="1280" height="720" fill="#111318"/>
    <rect x="54" y="54" width="1172" height="612" rx="24" fill="#1a1d24" stroke="#b69b62" stroke-width="3"/>
    <text x="90" y="150" fill="#b69b62" font-family="DejaVu Sans" font-size="30">CHRONICLE AI • HISTORICAL DOCUMENTARY</text>
    <text x="90" y="250" fill="#f4f1e8" font-family="DejaVu Sans" font-size="64" font-weight="700">${c.year}</text>
    <text x="90" y="335" fill="#f4f1e8" font-family="DejaVu Sans" font-size="42">${c.title}</text>
    <text x="90" y="570" fill="#c9c5bb" font-family="DejaVu Sans" font-size="22">${sourceCredit}</text>
    <text x="90" y="610" fill="#8e8b84" font-family="DejaVu Sans" font-size="18">Research references listed in documentary-manifest.json</text>
  </svg>`;
  fs.writeFileSync(card.replace('.png','.svg'),svg);
  run('rsvg-convert',['-w','1280','-h','720','-o',card,card.replace('.png','.svg')]);

  const filter = [
    'scale=1280:720:force_original_aspect_ratio=decrease',
    'pad=1280:720:(ow-iw)/2:(oh-ih)/2',
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${q(c.year+'  •  '+c.title)}':fontcolor=white:fontsize=34:box=1:boxcolor=black@0.55:boxborderw=16:x=45:y=45`,
    `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${q(sourceCredit)}':fontcolor=white@0.85:fontsize=18:box=1:boxcolor=black@0.45:boxborderw=10:x=45:y=660`
  ].join(',');

  run('ffmpeg',['-y','-loop','1','-i',mapPng,'-i',wav,'-t',String(c.minutes*60),'-r','24','-vf',filter,'-af','apad=pad_dur=360','-c:v','libx264','-preset','veryfast','-b:v','900k','-maxrate','1100k','-bufsize','1800k','-pix_fmt','yuv420p','-c:a','aac','-b:a','64k','-movflags','+faststart',mp4]);
  chapterFiles.push(mp4);
}

const concatFile = path.join(build,'concat.txt');
fs.writeFileSync(concatFile, chapterFiles.map(f => `file '${f.replaceAll("'","'\\''")}'`).join('\n')+'\n');
const final = path.join(build,'reconquista-documentary-60min.mp4');
run('ffmpeg',['-y','-f','concat','-safe','0','-i',concatFile,'-c','copy','-movflags','+faststart',final]);

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
