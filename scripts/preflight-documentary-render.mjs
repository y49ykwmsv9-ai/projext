import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const renderer = fs.readFileSync('scripts/render-documentary.mjs', 'utf8');
const baseline = fs.readFileSync('projects/documentary/render/SCENE-BASELINE-v2.md', 'utf8');
const qualityGate = fs.readFileSync('projects/documentary/render/DOCUMENTARY-VISUAL-QUALITY-GATE-v1.md', 'utf8');
const fail = message => { console.error('DOCUMENTARY PREFLIGHT FAILED: ' + message); process.exit(1); };

if (!baseline.includes('Historical geometry integrity')) fail('global scene baseline is missing the historical geometry integrity contract');
if (!baseline.includes('Never represent a major polity with a generic six-sided polygon')) fail('global scene baseline is missing the placeholder-polygon prohibition');
if (!qualityGate.includes('Geographic geometry integrity')) fail('visual quality gate is missing geographic geometry checks');
if (!qualityGate.includes('political territories rendered as generic six-sided/rectangular/circular blobs')) fail('visual quality gate is missing the generic-polygon automatic FAIL condition');

if (!renderer.includes('[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,' + '${motion}' + ',eq=contrast=1.05:saturation=0.82:brightness=-0.02[base]')) fail('map video pipeline is not chained with filter commas before the first labeled output');
if (renderer.includes("'[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',\\n        motion,\\n        'eq=contrast=1.05")) fail('regression detected: map filters are separated by semicolons, creating unlabeled FFmpeg inputs');

const mapGraph = [
  '[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,zoompan=z=1.01:x=0:y=0:d=1:s=1280x720:fps=24,eq=contrast=1.05:saturation=0.82:brightness=-0.02[base]',
  '[1:v]scale=1280:720,format=rgba,colorchannelmixer=aa=0.98[ui]',
  '[base][ui]overlay=0:0[mapui]',
  "[mapui]drawbox=x='400+225*mod(t/5,1)':y='610-255*mod(t/5,1)':w=18:h=18:color=0xc98a3d@0.96:t=fill[moving]",
  "[moving]drawbox=x='470-(24+10*sin(2*PI*t))*0.5':y='555-(24+10*sin(2*PI*t))*0.5':w='24+10*sin(2*PI*t)':h='24+10*sin(2*PI*t)':color=0x9b3d2f@0.58:t=fill[pulsed]",
  '[pulsed]copy[comp]'
].join(';');

const standardGraph = "[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,zoompan=z=1.01:x=0:y=0:d=1:s=1280x720:fps=24,drawbox=x=0:y=0:w=iw:h=86:color=black@0.45:t=fill[video]";
const run = args => execFileSync('ffmpeg', args, { stdio: 'pipe' });
try {
  run(['-v','error','-f','lavfi','-i','color=c=0x202020:s=1280x720:r=24:d=1','-f','lavfi','-i','color=c=black:s=1280x720:r=24:d=1','-filter_complex',mapGraph,'-map','[comp]','-frames:v','1','-f','null','-']);
  run(['-v','error','-f','lavfi','-i','color=c=0x202020:s=1280x720:r=24:d=1','-filter_complex',standardGraph,'-map','[video]','-frames:v','1','-f','null','-']);
  run(['-v','error','-f','lavfi','-i','aevalsrc=0.006*sin(2*PI*92*t)+0.003*sin(2*PI*137*t):s=22050:d=1','-filter_complex','[0:a]aresample=22050,apad=pad_dur=1[n];[n]volume=0.16[aout]','-map','[aout]','-frames:a','1','-f','null','-']);
} catch (error) { fail('FFmpeg preflight rejected a representative filter/audio graph: ' + (error.stderr?.toString() || error.message)); }
console.log('Documentary render preflight passed: map graph, standard graph, and audio graph are accepted by FFmpeg.');