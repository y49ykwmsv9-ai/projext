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

const mapPolities = [
  ['AL-ANDALUS','#7b2d2d',180,430,'☾'],
  ['ASTURIAS','#496b3a',360,210,'✠'],
  ['LEÓN','#657d3f',500,260,'✠'],
  ['CASTILE','#8b6f2d',650,350,'✠'],
  ['ARAGÓN','#a04444',820,300,'✚'],
  ['PORTUGAL','#3f6b4f',470,520,'✚'],
  ['NAVARRE','#5c4b7a',560,180,'✦'],
  ['GRANADA','#4c3b78',760,510,'☾']
];

function makeMapOverlay(outPath, year, title, sceneIdx) {
  const arrows = [
    [210,430,610,320,'#c98a3d'],
    [610,320,820,300,'#c98a3d'],
    [820,300,760,500,'#b84a3a'],
    [470,520,700,420,'#6d8c56']
  ];
  const arrowSvg = arrows.map(([x1,y1,x2,y2,c]) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="8" stroke-linecap="round" opacity=".9"/><polygon points="${x2},${y2} ${x2-20},${y2-8} ${x2-10},${y2+16}" fill="${c}"/>`
  ).join('');
  const shields = mapPolities.map(([name,c,x,y,s]) =>
    `<g><path d="M${x} ${y} l24 0 0 25 q-12 18 -24 0z" fill="${c}" stroke="#e7dcc3" stroke-width="2"/><text x="${x+12}" y="${y+18}" text-anchor="middle" fill="#fff" font-size="12" font-family="DejaVu Sans">${s}</text><text x="${x+34}" y="${y+16}" fill="#f1eadc" font-size="17" font-family="DejaVu Sans" font-weight="700">${name}</text></g>`
  ).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
    <rect width="1280" height="720" fill="#17140f" opacity=".9"/>
    <rect x="35" y="35" width="1210" height="650" rx="18" fill="#3a3328" stroke="#c6ad78" stroke-width="3"/>
    <text x="70" y="88" fill="#e9dec5" font-size="28" font-family="DejaVu Sans" font-weight="700">${q(year+'  •  '+title)}</text>
    <text x="70" y="118" fill="#b8aa8d" font-size="15" font-family="DejaVu Sans">POLITICAL MAP • SCHEMATIC RECONSTRUCTION • NOT TO SCALE</text>
    <path d="M120 180 C300 120 470 155 560 220 C670 295 840 180 1100 260 L1130 560 C920 610 730 555 570 590 C410 625 230 560 110 500Z" fill="#a89572" stroke="#d9c69b" stroke-width="3"/>
    <path d="M150 330 C300 260 400 300 540 345 C650 380 820 290 1030 350 L1060 520 C850 560 720 490 540 525 C380 550 260 500 150 470Z" fill="#87775c" opacity=".55"/>
    ${arrowSvg}
    ${shields}
    <text x="1040" y="640" fill="#c8b99b" font-size="14" font-family="DejaVu Sans">CHRONICLE • IBERIA</text>
  </svg>`;
  fs.writeFileSync(outPath,svg);
  const png=outPath.replace(/\.svg$/i,'.png');
  run('rsvg-convert',['-w','1280','-h','720','-o',png,outPath]);
  return png;
}

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
    const isMapScene = /map|frontier|route|road|new frontier|political|chronology|horizon/i.test(title+' '+visual);
    const mapOverlay = isMapScene ? makeMapOverlay(path.join(sceneDir,`${i+1}-map.svg`),year,title,i) : null;
    const imagePath = path.join(sceneDir,`${i+1}.jpg`);
    if (!fs.existsSync(imagePath)) run('curl',['-L','--fail','--retry','3','-o',imagePath,imageUrl]);

    const txt = path.join(sceneDir,`${i+1}.txt`);
    const wav = path.join(sceneDir,`${i+1}.wav`);
    const mp4 = path.join(sceneDir,`${i+1}.mp4`);
    const script = [narrationParts[i], sceneContext(c,title,visual,tags)].filter(Boolean).join('\\n\\n');
    fs.writeFileSync(txt,script);
    run(path.join(process.env.HOME || '/home/runner','.local','bin','piper'),['--data-dir',path.join(root,'voices'),'--model','en_US-lessac-medium','--input_file',txt,'--output_file',wav]);

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

    const overlayInput = mapOverlay ? ['-loop','1','-i',mapOverlay] : [];
    const overlayFilter = mapOverlay
      ? `[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,${motion}[base];[2:v]scale=1280:720,format=rgba,colorchannelmixer=aa=0.92[map];[base][map]overlay=0:0[comp]`
      : '';
    const ambience = `aevalsrc=0.006*sin(2*PI*92*t)+0.003*sin(2*PI*137*t):s=22050:d=${sec}`;
    run('ffmpeg',['-y','-loop','1','-i',imagePath,'-i',wav,...overlayInput,'-f','lavfi','-i',ambience,'-t',String(sec),'-r','24','-vf',mapOverlay ? 'null' : filter,'-filter_complex', mapOverlay
      ? `${overlayFilter};[1:a]aresample=22050,apad=pad_dur=90[n];[3:a]volume=0.18[a];[n][a]amix=inputs=2:duration=first:dropout_transition=2[aout]`
      : '[1:a]aresample=22050,apad=pad_dur=90[n];[2:a]volume=0.18[a];[n][a]amix=inputs=2:duration=first:dropout_transition=2[aout]','-map',mapOverlay ? '[comp]' : '0:v','-map','[aout]','-c:v','libx264','-preset','veryfast','-tune','stillimage','-b:v','850k','-maxrate','1000k','-bufsize','1700k','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',mp4]);
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
