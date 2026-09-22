import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const build = path.join(root,'projects','documentary','build');
const manifest = JSON.parse(fs.readFileSync(path.join(build,'documentary-manifest.json'),'utf8'));
const assets = path.join(build,'assets');
const scenesDir = path.join(build,'scenes');
fs.mkdirSync(assets,{recursive:true});
fs.mkdirSync(scenesDir,{recursive:true});

const run=(cmd,args,opts={})=>execFileSync(cmd,args,{stdio:'inherit',...opts});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const mapSvg=path.join(assets,'reconquista.svg');
const mapPng=path.join(assets,'reconquista.png');
if(!fs.existsSync(mapSvg)) run('curl',['-L','--fail','--retry','3','-o',mapSvg,'https://commons.wikimedia.org/wiki/Special:Redirect/file/Reconquista_(914-1492).svg']);
run('rsvg-convert',['-w','2560','-h','2272','-o',mapPng,mapSvg]);

// Research-driven scene design: every chapter is broken into distinct visual beats.
// The animation language uses maps, routes, armies, siege diagrams, cities, trade,
// dynastic portraits/silhouettes and timeline graphics rather than a single held image.
const sceneTypes=['map','advance','battle','siege','city','court','trade','frontier'];
const colors={bg:'#101216',paper:'#d9c7a0',ink:'#25211a',gold:'#c6a15b',red:'#8d3d35',blue:'#426b83',green:'#58704e',white:'#f3eee2'};

function sceneSvg(c,index,type,seconds){
  const title=esc(c.title), year=esc(c.year), label=esc(type.toUpperCase());
  const seed=index+1, shift=(seed*73)%420;
  const troop=(x,y,col,dir=1)=>`<g transform="translate(${x} ${y})"><circle r="11" fill="${col}" stroke="#111" stroke-width="3"/><path d="M0 -7 L${12*dir} 0 L0 7Z" fill="${colors.white}"/></g>`;
  const route=(x1,y1,x2,y2,col)=>`<path d="M${x1} ${y1} Q ${(x1+x2)/2} ${(y1+y2)/2-70} ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="18 14"><animate attributeName="stroke-dashoffset" from="0" to="-160" dur="2.8s" repeatCount="indefinite"/></path>`;
  let body='';
  if(type==='map'||type==='advance'){
    body=`<image href="reconquista.png" x="120" y="60" width="1040" height="925" opacity=".92"/>
      <rect x="120" y="60" width="1040" height="925" fill="#d9c7a0" opacity=".12"/>
      ${route(300+shift/4,760,760,420,colors.red)}${route(820,520,1010,300,colors.blue)}
      ${troop(330+shift/3,740,colors.red)}${troop(390+shift/4,700,colors.red)}${troop(780,430,colors.blue,-1)}${troop(850,380,colors.blue,-1)}
      <text x="150" y="930" class="maplabel">IBERIAN PENINSULA • CAMPAIGN MAP</text>`;
  } else if(type==='battle'){
    body=`<rect x="110" y="150" width="1060" height="700" rx="30" fill="#c8b78e"/>
      <path d="M160 670 C350 510 500 760 690 570 S980 440 1120 260" fill="none" stroke="#8f805f" stroke-width="90" opacity=".45"/>
      ${route(260,650,880,330,colors.red)}${route(960,300,430,610,colors.blue)}
      ${[0,1,2,3,4,5,6].map(i=>troop(260+i*75,650-i*42,colors.red)).join('')}
      ${[0,1,2,3,4,5].map(i=>troop(960-i*72,300+i*48,colors.blue,-1)).join('')}
      <text x="150" y="205" class="scenehead">ARMIES CLOSE • FORMATIONS SHIFT • FRONT LINES COLLIDE</text>`;
  } else if(type==='siege'){
    body=`<rect x="120" y="160" width="1040" height="690" rx="26" fill="#bda979"/>
      <path d="M350 680 L350 380 L520 280 L690 380 L690 680Z" fill="#77654a" stroke="#25211a" stroke-width="8"/>
      <path d="M350 380 L520 280 L690 380" fill="none" stroke="#e2d4ae" stroke-width="12"/>
      ${[0,1,2,3,4].map(i=>`<rect x="${760+i*62}" y="${610-i*55}" width="48" height="22" rx="8" fill="${colors.red}"><animate attributeName="x" values="${760+i*62};${730+i*62};${760+i*62}" dur="3s" repeatCount="indefinite"/></rect>`).join('')}
      <path d="M740 650 L600 500" stroke="${colors.gold}" stroke-width="12" marker-end="url(#arrow)"/>
      <text x="150" y="220" class="scenehead">SIEGE LOGISTICS • ARTILLERY • FORTIFICATIONS</text>`;
  } else if(type==='city'){
    body=`<rect x="110" y="150" width="1060" height="700" fill="#9e8c67"/>
      <g fill="#514937" stroke="#29251d" stroke-width="5">
      <path d="M170 720V450L260 370L350 450V720Z"/><path d="M390 720V390L490 300L590 390V720Z"/><path d="M650 720V470L740 360L830 470V720Z"/><path d="M890 720V410L1010 320L1120 410V720Z"/></g>
      <g fill="${colors.gold}"><circle cx="260" cy="400" r="18"/><circle cx="490" cy="330" r="18"/><circle cx="740" cy="400" r="18"/><circle cx="1010" cy="360" r="18"/></g>
      <path d="M130 760 H1150" stroke="#e1d2ae" stroke-width="18"/><text x="150" y="220" class="scenehead">CITY LIFE • MARKETS • WALLS • MONUMENTS</text>`;
  } else if(type==='court'){
    body=`<rect x="120" y="150" width="1040" height="700" rx="32" fill="#312b25"/>
      <path d="M300 730V410 Q520 260 740 410V730" fill="#5e4735"/>
      <circle cx="520" cy="330" r="72" fill="#d1ad83"/><path d="M445 290 Q520 220 595 290 L570 260 L520 210 L470 260Z" fill="${colors.gold}"/>
      <circle cx="820" cy="390" r="58" fill="#c39f78"/><circle cx="250" cy="410" r="58" fill="#bd956f"/>
      <path d="M520 470 V680 M820 460 V680 M250 480 V680" stroke="${colors.gold}" stroke-width="24"/>
      <text x="150" y="220" class="scenehead">RULERS • DIPLOMACY • SUCCESSION • POWER</text>`;
  } else if(type==='trade'){
    body=`<rect x="110" y="150" width="1060" height="700" fill="#cbb98e"/>
      <path d="M180 670 Q420 350 720 600 T1090 300" fill="none" stroke="${colors.blue}" stroke-width="55" opacity=".65"/>
      <path d="M250 640 Q500 420 850 520" fill="none" stroke="${colors.gold}" stroke-width="14" stroke-dasharray="22 14"><animate attributeName="stroke-dashoffset" from="0" to="-180" dur="2s" repeatCount="indefinite"/></path>
      ${[0,1,2,3].map(i=>`<rect x="${300+i*180}" y="${470+(i%2)*80}" width="80" height="55" rx="10" fill="${colors.red}"><animate attributeName="y" values="${470+(i%2)*80};${440+(i%2)*80};${470+(i%2)*80}" dur="2.2s" repeatCount="indefinite"/></rect>`).join('')}
      <text x="150" y="220" class="scenehead">TRADE • TRIBUTE • MIGRATION • INFORMATION</text>`;
  } else {
    body=`<rect x="120" y="150" width="1040" height="700" fill="#b3a17a"/>
      <path d="M120 600 Q400 470 650 620 T1160 500" fill="none" stroke="#71634c" stroke-width="130" opacity=".6"/>
      ${route(190,610,500,500,colors.red)}${route(1050,470,720,560,colors.blue)}
      ${troop(330,560,colors.red)}${troop(410,520,colors.red)}${troop(880,520,colors.blue,-1)}
      <path d="M600 400V700" stroke="#2e2a22" stroke-width="8" stroke-dasharray="18 12"/>
      <text x="150" y="220" class="scenehead">THE FRONTIER IS A ZONE, NOT A LINE</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
  <defs><marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12Z" fill="${colors.gold}"/></marker>
  <style>.title{font:700 42px 'DejaVu Sans';fill:${colors.white}}.sub{font:22px 'DejaVu Sans';fill:#d9c7a0}.scenehead{font:700 25px 'DejaVu Sans';fill:#f3eee2;letter-spacing:1px}.maplabel{font:700 19px 'DejaVu Sans';fill:#25211a}</style></defs>
  <rect width="1280" height="720" fill="${colors.bg}"/>
  <text x="70" y="70" class="title">${year} • ${title}</text><text x="70" y="105" class="sub">${label} • SCENE ${index+1}</text>
  <g transform="translate(0 0)">${body}</g>
  <rect x="40" y="650" width="1200" height="42" rx="12" fill="#090a0c" opacity=".75"/>
  <text x="60" y="678" class="sub">Chronicle AI • Sources and uncertainty notes in production manifest</text>
  </svg>`;
}

const sceneFiles=[];
for(const c of manifest.chapters){
  const narrationPath=path.join(scenesDir,c.id+'.txt');
  fs.writeFileSync(narrationPath,c.narration+'\n');
  for(let s=0;s<6;s++){
    const type=sceneTypes[(s+c.year)%sceneTypes.length];
    const svg=path.join(scenesDir,`${c.id}-scene-${String(s+1).padStart(2,'0')}.svg`);
    const png=svg.replace('.svg','.png');
    fs.writeFileSync(svg,sceneSvg(c,s,type,60));
    run('rsvg-convert',['-w','1280','-h','720','-o',png,svg]);
    sceneFiles.push({c,s,png,type});
  }
}

// Natural neural narration through a free external TTS service. No paid API key is required.
// Edge-TTS voices are substantially less synthetic than the previous eSpeak output.
const audioDir=path.join(scenesDir,'audio'); fs.mkdirSync(audioDir,{recursive:true});
run('python3',['-m','pip','install','--disable-pip-version-check','--break-system-packages','-q','edge-tts']);
const chapterAudio=[];
for(const c of manifest.chapters){
  const out=path.join(audioDir,c.id+'.mp3');
  run('edge-tts',['--voice','en-US-ChristopherNeural','--rate=-5%','--pitch=-2Hz','--text',c.narration,'--write-media',out]);
  chapterAudio.push(out);
}

const chapterVideos=[];
for(const c of manifest.chapters){
  const files=sceneFiles.filter(x=>x.c.id===c.id);
  const list=path.join(scenesDir,c.id+'-video.txt');
  const per=60;
  const concat=[];
  for(const f of files){
    const v=f.png.replace('.png','.mp4');
    // Each scene is its own encoded clip, with a distinct animated treatment.
    const motion=f.type==='battle'?'zoompan=z=1.06:d=1440:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s=1280x720:fps=24':
      f.type==='map'||f.type==='advance'?'zoompan=z=1.02:d=1440:x=on/12:y=on/20:s=1280x720:fps=24':
      'zoompan=z=1.045:d=1440:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s=1280x720:fps=24';
    run('ffmpeg',['-y','-loop','1','-i',f.png,'-t',String(per),'-vf',motion,'-r','24','-c:v','libx264','-preset','veryfast','-tune','stillimage','-b:v','700k','-pix_fmt','yuv420p','-an',v]);
    concat.push(v);
  }
  fs.writeFileSync(list,concat.map(x=>`file '${x.replaceAll("'","'\\''")}'`).join('\n')+'\n');
  const silent=path.join(scenesDir,c.id+'-silent.mp4');
  run('ffmpeg',['-y','-f','concat','-safe','0','-i',list,'-c','copy',silent]);
  const narrated=path.join(scenesDir,c.id+'-narrated.mp4');
  run('ffmpeg',['-y','-i',silent,'-i',chapterAudio.find(x=>x.endsWith(c.id+'.mp3')),'-t','360','-c:v','copy','-c:a','aac','-b:a','96k','-af','apad=pad_dur=360','-t','360',narrated]);
  chapterVideos.push(narrated);
}

const final=path.join(build,'reconquista-documentary-scenes-60min.mp4');
const finalList=path.join(scenesDir,'final.txt');
fs.writeFileSync(finalList,chapterVideos.map(x=>`file '${x.replaceAll("'","'\\''")}'`).join('\n')+'\n');
run('ffmpeg',['-y','-f','concat','-safe','0','-i',finalList,'-c','copy','-movflags','+faststart',final]);
run('ffprobe',['-v','error','-show_entries','format=duration,size','-of','default=noprint_wrappers=1',final]);

const plan={title:manifest.title,targetDurationMinutes:60,output:final,resolution:'1280x720',sceneCount:sceneFiles.length,sceneDurationSeconds:60,narration:'Edge-TTS en-US-ChristopherNeural',visuals:'6 individually rendered animated scenes per chapter; map/battle/siege/city/court/trade/frontier treatments',map:'Macucal, Wikimedia Commons, CC BY-SA 3.0 / GFDL'};
fs.writeFileSync(path.join(build,'render-plan.json'),JSON.stringify(plan,null,2));
console.log('Finished scene-based documentary: '+final);const sourceCredit = 'Map: Macucal, Wikimedia Commons, CC BY-SA 3.0 / GFDL';
const chapterFiles = [];
const sceneFiles = [];

const escapeFilter = s => s.replaceAll('\\','\\\\').replaceAll(':','\\:').replaceAll("'","\\'");

for (const c of manifest.chapters) {
  const scenes = c.scenes || [];
  const sec = Math.floor((c.minutes * 60) / Math.max(1, scenes.length));
  for (let i=0; i<scenes.length; i++) {
    const [year, title, visual, tags] = scenes[i];
    const sceneDir = path.join(chaptersDir,c.id);
    fs.mkdirSync(sceneDir,{recursive:true});
    const txt = path.join(sceneDir,`${i+1}.txt`);
    const wav = path.join(sceneDir,`${i+1}.wav`);
    const mp4 = path.join(sceneDir,`${i+1}.mp4`);
    const script = `${c.narration}\\n\\nScene focus: ${title}. ${visual}.\\n`;
    fs.writeFileSync(txt,script);
    run('espeak-ng',['-v','en-us','-s','88','-p','38','-a','150','-f',txt,'-w',wav]);

    const sceneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
      <rect width="1280" height="720" fill="#111318"/>
      <rect x="0" y="0" width="1280" height="720" fill="#20242c"/>
      <path d="M80 560 C300 350 480 610 720 330 S1040 260 1200 120" fill="none" stroke="#b69b62" stroke-width="4" opacity=".65"/>
      <circle cx="240" cy="450" r="30" fill="#b69b62"/><circle cx="520" cy="500" r="24" fill="#d8d2c4"/><circle cx="850" cy="300" r="28" fill="#b69b62"/>
      <text x="70" y="90" fill="#b69b62" font-family="DejaVu Sans" font-size="24">CHRONICLE AI • ${escapeFilter(c.year)}</text>
      <text x="70" y="165" fill="#f4f1e8" font-family="DejaVu Sans" font-size="52" font-weight="700">${escapeFilter(title)}</text>
      <text x="70" y="235" fill="#c9c5bb" font-family="DejaVu Sans" font-size="22">${escapeFilter(visual)}</text>
      <text x="70" y="650" fill="#c9c5bb" font-family="DejaVu Sans" font-size="18">${escapeFilter(tags)}</text>
      <text x="70" y="685" fill="#8e8b84" font-family="DejaVu Sans" font-size="16">${escapeFilter(sourceCredit)}</text>
    </svg>`;
    const svgPath=path.join(sceneDir,`${i+1}.svg`);
    const pngPath=path.join(sceneDir,`${i+1}.png`);
    fs.writeFileSync(svgPath,sceneSvg);
    run('rsvg-convert',['-w','1280','-h','720','-o',pngPath,svgPath]);

    const motion = i % 3 === 0
      ? 'zoompan=z=1+0.06*on/864:d=1:s=1280x720:fps=24'
      : i % 3 === 1
      ? 'zoompan=z=1.06-0.06*on/864:d=1:s=1280x720:fps=24'
      : 'zoompan=z=1.02+0.02*sin(on/120):d=1:s=1280x720:fps=24';
    const filter = [
      motion,
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${escapeFilter(year+'  •  '+title)}':fontcolor=white:fontsize=30:box=1:boxcolor=black@0.58:boxborderw=14:x=42:y=40`,
      `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='SCENE ${i+1}  •  ${escapeFilter(tags)}':fontcolor=white@0.82:fontsize=16:box=1:boxcolor=black@0.42:boxborderw=9:x=42:y=665`
    ].join(',');
    run('ffmpeg',['-y','-loop','1','-i',pngPath,'-i',wav,'-t',String(sec),'-r','24','-vf',filter,'-af','apad','-c:v','libx264','-preset','veryfast','-tune','stillimage','-b:v','800k','-maxrate','950k','-bufsize','1600k','-pix_fmt','yuv420p','-c:a','aac','-b:a','80k','-movflags','+faststart',mp4]);
    sceneFiles.push(mp4);
  }
}

const concatFile = path.join(build,'concat-scenes.txt');
fs.writeFileSync(concatFile,sceneFiles.map(f => `file '${f.replaceAll("'","'\\''")}'`).join('\n')+'\n');
const final = path.join(build,'reconquista-documentary-60min.mp4');
run('ffmpeg',['-y','-f','concat','-safe','0','-i',concatFile,'-c','copy','-movflags','+faststart',final]);
run('ffprobe',['-v','error','-show_entries','format=duration,size','-of','default=noprint_wrappers=1',final]);
const plan = {
  title: manifest.title,
  targetDurationMinutes: manifest.targetDurationMinutes,
  output: final,
  resolution: '1280x720',
  narration: 'temporary local voice track; scene-level pacing',
  sceneCount: sceneFiles.length,
  map: sourceCredit,
  chapters: manifest.chapters.map(c=>({id:c.id,year:c.year,title:c.title,targetSeconds:c.minutes*60,sceneCount:(c.scenes||[]).length}))
};
fs.writeFileSync(path.join(build,'render-plan.json'),JSON.stringify(plan,null,2));
console.log('Finished scene-based documentary: '+final);
