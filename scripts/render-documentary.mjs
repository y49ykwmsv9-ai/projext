import fs from 'node:fs';
import path from 'node:path';
import { loadReconquistaAtlas, resolveSceneEntities } from './cliopatria-plus.mjs';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const build = path.join(root, 'projects', 'documentary', 'build');
const manifest = JSON.parse(fs.readFileSync(path.join(build, 'documentary-manifest.json'), 'utf8'));
const sceneAssets = JSON.parse(fs.readFileSync(path.join(root, 'projects', 'documentary', 'scene-assets.json'), 'utf8'));
const mapStyle = JSON.parse(fs.readFileSync(path.join(root, 'projects', 'documentary', 'map-style.json'), 'utf8'));
const atlas = loadReconquistaAtlas();
const assets = path.join(build, 'assets');
const chaptersDir = path.join(build, 'chapters');
const sceneAssetMap = new Map(sceneAssets.assets.map(a => [a.sceneNumber, a.imageUrl]));
fs.mkdirSync(assets, { recursive: true });
fs.mkdirSync(chaptersDir, { recursive: true });

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });
const q = s => String(s).replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'");
const splitNarration = (text, n) => {
  const sentences = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/).filter(Boolean);
  const groups = Array.from({ length: n }, () => []);
  sentences.forEach((s, i) => groups[Math.min(n - 1, Math.floor(i * n / Math.max(1, sentences.length)))].push(s));
  return groups.map(g => g.join(' '));
};
const sceneContext = (c, title, visual) =>
  `This scene focuses on ${title}. ${visual}. The visual reconstruction is illustrative rather than eyewitness footage and uses historically grounded geography, labels, political colors, campaign routes and period context.`;

const canonicalMapUrl = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Reconquista_(914-1492).svg';
const mapSources = [
  ['711', canonicalMapUrl, 'Macucal / Wikimedia Commons'],
  ['early', canonicalMapUrl, 'Macucal / Wikimedia Commons'],
  ['later', canonicalMapUrl, 'Macucal / Wikimedia Commons']
];
for (const [key, url] of mapSources) {
  const ext = url.endsWith('.svg') ? 'svg' : 'png';
  const file = path.join(assets, `map-${key}.${ext}`);
  if (!fs.existsSync(file)) run('curl', ['-L', '--fail', '--retry', '3', '-o', file, url]);
  if (ext === 'svg') {
    const png = file.replace(/\.svg$/, '.png');
    run('rsvg-convert', ['-w', '2200', '-h', '1700', '-o', png, file]);
  }
}

const sourceCredit = 'Map sources: Wikimedia Commons; overlays and animation are original programmatic additions.';
const sceneFiles = [];
let sceneNumber = 0;

function mapSpec(year, title, visual) {
  const text = `${title} ${visual}`.toLowerCase();
  if (year <= 719) return {
    bg: path.join(assets, 'map-711.png'),
    credit: mapStyle.sources.campaign711.credit,
    route: [[400, 610], [455, 560], [610, 470], [625, 355]],
    routeLabel: "Tariq's campaign",
    battle: [470, 555],
    armies: ['UMAYYAD', 'VISIGOTHIC'],
    cities: [['GIBRALTAR', 405, 625], ['GUADALETE', 470, 575], ['CÓRDOBA', 610, 485], ['TOLEDO', 625, 365]]
  };
  if (/granada|alhambra|baza|málaga|boabdil|1482|1492/i.test(text)) return {
    bg: path.join(assets, 'map-later.png'),
    credit: mapStyle.sources.later.credit,
    route: [[760, 540], [735, 500], [710, 455], [680, 410]],
    routeLabel: 'Granada campaign',
    battle: [735, 500],
    armies: ['CASTILE-ARAGON', 'GRANADA'],
    cities: [['GRANADA', 760, 555], ['MÁLAGA', 715, 500], ['BAZA', 680, 450], ['SANTA FE', 790, 520]]
  };
  return {
    bg: path.join(assets, 'map-later.png'),
    credit: mapStyle.sources.later.credit,
    route: [[470, 500], [560, 430], [650, 360], [720, 300]],
    routeLabel: 'Frontier movement',
    battle: [650, 360],
    armies: ['CHRISTIAN KINGDOMS', 'AL-ANDALUS'],
    cities: [['TOLEDO', 650, 340], ['CÓRDOBA', 625, 430], ['SEVILLE', 555, 505], ['VALENCIA', 800, 395]]
  };
}

function makeMapOverlay(outPath, year, title, visual, sceneIdx) {
  const spec = mapSpec(year, title, visual);
  const [x1, y1] = spec.route[0];
  const [x2, y2] = spec.route[spec.route.length - 1];
  const routePath = spec.route.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');
  const cities = spec.cities.map(([name, x, y]) =>
    `<g><circle cx="${x}" cy="${y}" r="5" fill="#f6ecd8" stroke="#1d1a15" stroke-width="2"/><text x="${x + 10}" y="${y - 9}" fill="#f6ecd8" stroke="#1d1a15" stroke-width="3" paint-order="stroke" font-size="16" font-family="DejaVu Sans" font-weight="700">${q(name)}</text></g>`
  ).join('');
  const arrow = `<path d="${routePath}" fill="none" stroke="#c98a3d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".94"/><polygon points="${x2},${y2} ${x2-18},${y2-8} ${x2-8},${y2+16}" fill="#c98a3d"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
    <defs><filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".65"/></filter></defs>
    <rect x="22" y="20" width="1236" height="78" rx="12" fill="#17140f" opacity=".80"/>
    <text x="48" y="53" fill="#f6ecd8" font-size="28" font-family="DejaVu Sans" font-weight="700">${q(`${year}  •  ${title}`)}</text>
    <text x="48" y="80" fill="#d8c59d" font-size="14" font-family="DejaVu Sans">HISTORICAL MAP • GEOGRAPHIC BASE • PROGRAMMATIC CAMPAIGN OVERLAY</text>
    ${arrow}
    ${cities}
    <g filter="url(#shadow)"><rect x="925" y="545" width="300" height="125" rx="10" fill="#17140f" opacity=".82" stroke="#d8c59d" stroke-width="2"/>
      <text x="950" y="573" fill="#f6ecd8" font-size="15" font-family="DejaVu Sans" font-weight="700">LEGEND</text>
      <line x1="950" y1="594" x2="995" y2="594" stroke="#c98a3d" stroke-width="6"/><text x="1007" y="599" fill="#f6ecd8" font-size="13" font-family="DejaVu Sans">CAMPAIGN ROUTE</text>
      <circle cx="971" cy="620" r="7" fill="#9b3d2f"/><text x="1007" y="625" fill="#f6ecd8" font-size="13" font-family="DejaVu Sans">BATTLE / SIEGE</text>
      <text x="950" y="650" fill="#d8c59d" font-size="12" font-family="DejaVu Sans">${q(spec.armies[0])}  •  ${q(spec.armies[1])}</text>
    </g>
    <g transform="translate(108,585)"><circle r="30" fill="#17140f" opacity=".72" stroke="#d8c59d" stroke-width="2"/><path d="M0-23 L7 10 L0 6 L-7 10 Z" fill="#f6ecd8"/><text x="-7" y="23" fill="#f6ecd8" font-size="11" font-family="DejaVu Sans">N</text></g>
    <text x="42" y="698" fill="#f6ecd8" opacity=".82" font-size="12" font-family="DejaVu Sans">${q(spec.credit)} • ${q(sourceCredit)}</text>
  </svg>`;
  fs.writeFileSync(outPath, svg);
  const png = outPath.replace(/\.svg$/i, '.png');
  run('rsvg-convert', ['-w', '1280', '-h', '720', '-o', png, outPath]);
  return { png, spec };
}

for (const c of manifest.chapters) {
  const scenes = c.scenes || [];
  const narrationParts = splitNarration(c.narration, scenes.length);
  const sec = Math.round((c.minutes * 60) / Math.max(1, scenes.length));

  for (let i = 0; i < scenes.length; i++) {
    sceneNumber++;
    const [year, title, visual, tags] = scenes[i];
    const atlasEntities = resolveSceneEntities(atlas, sceneNumber);
    const atlasNames = atlasEntities.map(e => e.name).join(', ');
    const sceneDir = path.join(chaptersDir, c.id);
    fs.mkdirSync(sceneDir, { recursive: true });
    const imageUrl = sceneAssetMap.get(sceneNumber);
    if (!imageUrl) throw new Error(`Missing generated scene asset for scene ${sceneNumber}`);
    const isMapScene = /map|frontier|route|road|new frontier|political|chronology|horizon|conquest|campaign|advance|falls|granada/i.test(`${title} ${visual}`);
    const imagePath = path.join(sceneDir, `${i + 1}.jpg`);
    if (!fs.existsSync(imagePath)) run('curl', ['-L', '--fail', '--retry', '3', '-o', imagePath, imageUrl]);

    const txt = path.join(sceneDir, `${i + 1}.txt`);
    const wav = path.join(sceneDir, `${i + 1}.wav`);
    const mp4 = path.join(sceneDir, `${i + 1}.mp4`);
    const script = [narrationParts[i], sceneContext(c, title, visual), `Historical atlas entities: ${atlasNames}. Route and event geometry is labeled as reconstructed unless sourced geometry is explicitly available.`].filter(Boolean).join('\n\n');
    fs.writeFileSync(txt, script);
    run(path.join(process.env.HOME || '/home/runner', '.local', 'bin', 'piper'), ['--data-dir', path.join(root, 'voices'), '--model', 'en_US-lessac-medium', '--input_file', txt, '--output_file', wav]);

    const motion = [
      `zoompan=z='min(zoom+0.00055,1.08)':x='iw/2-(iw/zoom/2)+32*sin(on/55)':y='ih/2-(ih/zoom/2)+18*cos(on/63)':d=1:s=1280x720:fps=24`,
      `zoompan=z='min(zoom+0.00045,1.07)':x='iw/2-(iw/zoom/2)-35*sin(on/61)':y='ih/2-(ih/zoom/2)+22*sin(on/47)':d=1:s=1280x720:fps=24`,
      `zoompan=z='max(1.08-on*0.00045,1.0)':x='iw/2-(iw/zoom/2)+25*cos(on/58)':y='ih/2-(ih/zoom/2)-18*sin(on/67)':d=1:s=1280x720:fps=24`,
      `zoompan=z='1.03+0.025*sin(on/90)':x='iw/2-(iw/zoom/2)+20*sin(on/73)':y='ih/2-(ih/zoom/2)+20*cos(on/80)':d=1:s=1280x720:fps=24`
    ][i % 4];

    const ambience = `aevalsrc=0.006*sin(2*PI*92*t)+0.003*sin(2*PI*137*t):s=22050:d=${sec}`;
    if (isMapScene) {
      const overlayInfo = makeMapOverlay(path.join(sceneDir, `${i + 1}-map.svg`), year, title, visual, i);
      const [x1, y1] = overlayInfo.spec.route[0];
      const [x2, y2] = overlayInfo.spec.route[overlayInfo.spec.route.length - 1];
      const [bx, by] = overlayInfo.spec.battle;
      const mapFilter = [
        '[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
        motion,
        'eq=contrast=1.05:saturation=0.82:brightness=-0.02[base]',
        '[2:v]scale=1280:720,format=rgba,colorchannelmixer=aa=0.98[ui]',
        '[base][ui]overlay=0:0[mapui]',
        `[mapui]drawbox=x='${q(String(x1))}+(${q(String(x2-x1))})*mod(t/${sec},1)':y='${q(String(y1))}+(${q(String(y2-y1))})*mod(t/${sec},1)':w=18:h=18:color=#c98a3d@0.96:t=fill[moving]`,
        `[moving]drawbox=x='${bx}-(${q(String(24))}+10*sin(2*PI*t))*0.5':y='${by}-(${q(String(24))}+10*sin(2*PI*t))*0.5':w='${q(String(24))}+10*sin(2*PI*t)':h='${q(String(24))}+10*sin(2*PI*t)':color=#9b3d2f@0.58:t=fill[pulsed]`,
        `[pulsed]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${q(overlayInfo.spec.routeLabel)}':fontcolor=#f6ecd8:fontsize=18:box=1:boxcolor=black@0.45:boxborderw=8:x=55:y=120[comp]`
      ].join(';');
      run('ffmpeg', ['-y', '-loop', '1', '-i', overlayInfo.spec.bg, '-i', wav, '-loop', '1', '-i', overlayInfo.png, '-f', 'lavfi', '-i', ambience, '-t', String(sec), '-filter_complex', `${mapFilter};[1:a]aresample=22050,apad=pad_dur=90[n];[3:a]volume=0.16[a];[n][a]amix=inputs=2:duration=first:dropout_transition=2[aout]`, '-map', '[comp]', '-map', '[aout], '-r', '24', '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-b:v', '950k', '-maxrate', '1100k', '-bufsize', '2200k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4]);
    } else {
      const filter = [
        'scale=1280:720:force_original_aspect_ratio=decrease',
        'pad=1280:720:(ow-iw)/2:(oh-ih)/2',
        motion,
        'drawbox=x=0:y=0:w=iw:h=86:color=black@0.45:t=fill',
        `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${q(year + '  •  ' + title)}':fontcolor=white:fontsize=30:x=42:y=28`,
        `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='SCENE ${sceneNumber}  •  ${q(tags)}':fontcolor=white@0.88:fontsize=16:box=1:boxcolor=black@0.48:boxborderw=9:x=42:y=665`
      ].join(',');
      run('ffmpeg', ['-y', '-loop', '1', '-i', imagePath, '-i', wav, '-f', 'lavfi', '-i', ambience, '-t', String(sec), '-filter_complex', `[0:v]${filter}[v];[1:a]aresample=22050,apad=pad_dur=90[n];[2:a]volume=0.16[a];[n][a]amix=inputs=2:duration=first:dropout_transition=2[aout]`, '-map', '[v]', '-map', '[aout], '-r', '24', '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-b:v', '850k', '-maxrate', '1000k', '-bufsize', '1700k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4]);
    }
    sceneFiles.push(mp4);
  }
}

const concatFile = path.join(build, 'concat-scenes.txt');
fs.writeFileSync(concatFile, sceneFiles.map(f => "file '" + f.replaceAll("'", "'\\\\''") + "'").join('\n') + '\n');
const final = path.join(build, 'reconquista-documentary-60min.mp4');
run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concatFile, '-c', 'copy', '-movflags', '+faststart', final]);
run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size', '-of', 'default=noprint_wrappers=1', final]);
const plan = {
  title: manifest.title,
  targetDurationMinutes: manifest.targetDurationMinutes,
  output: final,
  resolution: '1280x720',
  narration: 'Piper neural TTS, en_US-lessac-medium',
  sceneCount: sceneFiles.length,
  generatedSceneAssets: sceneAssets.assets.length,
  mapStyle: mapStyle.name,
  mapDesignBasis: mapStyle.designBasis,
  animation: mapStyle.animation,
  historicalAtlas: {
    datasetId: atlas.datasetId,
    schemaVersion: atlas.schemaVersion,
    source: 'projects/documentary/data/cliopatria-plus/reconquista-atlas.json',
    counts: Object.fromEntries(['polities','places','events','routes','people'].map(k => [k, atlas[k]?.length ?? 0]))
  },
  chapters: manifest.chapters.map(c => ({ id: c.id, year: c.year, title: c.title, targetSeconds: c.minutes * 60, sceneCount: (c.scenes || []).length }))
};
fs.writeFileSync(path.join(build, 'render-plan.json'), JSON.stringify(plan, null, 2));
console.log(`Finished ${sceneFiles.length}-scene ${manifest.targetDurationMinutes}-minute documentary: ${final}`);
