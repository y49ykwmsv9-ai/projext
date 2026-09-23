import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const root = process.cwd();
const sceneFile = process.env.SCENE_FILE || 'scene-711-v2.html';
const sceneName = path.basename(sceneFile, path.extname(sceneFile));
const scene = path.join(root, 'projects', 'documentary', 'render', 'scenes', sceneFile);
const outDir = path.join(root, 'projects', 'documentary', 'build', `sample-${sceneName}`);
fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(scene)) throw new Error('Sample scene HTML not found: ' + scene);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  recordVideo: { dir: outDir, size: { width: 1600, height: 900 } },
  reducedMotion: 'no-preference'
});
const page = await context.newPage();

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push('console: ' + msg.text());
});
page.on('pageerror', err => errors.push('pageerror: ' + err.message));

await page.goto('file://' + scene, { waitUntil: 'load' });
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(outDir, 'sample-scene-711-first-frame.png'), fullPage: false });

const durationMs = 19000;
await page.waitForTimeout(durationMs);

const videoPath = await page.video().path();
await context.close();
await browser.close();

if (errors.length) {
  fs.writeFileSync(path.join(outDir, 'browser-errors.txt'), errors.join('\n'));
  throw new Error('Sample scene browser errors detected: ' + errors.join(' | '));
}

const webm = path.join(outDir, `${sceneName}.webm`);
fs.copyFileSync(videoPath, webm);

const mp4 = path.join(outDir, `${sceneName}.mp4`);
execFileSync('ffmpeg', [
  '-y', '-i', webm,
  '-vf', 'fps=30,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
  '-movflags', '+faststart',
  mp4
], { stdio: 'inherit' });

execFileSync('ffprobe', [
  '-v', 'error',
  '-show_entries', 'format=duration,size',
  '-show_entries', 'stream=codec_name,width,height,r_frame_rate',
  '-of', 'default=noprint_wrappers=1',
  mp4
], { stdio: 'inherit' });

fs.writeFileSync(path.join(outDir, 'RENDER-RESULT.txt'),
  'Sample scene render completed.\n' +
  'Scene: The Strait — 711 CE\n' +
  'Source: ' + sceneFile + '\n' +
  'Visual renderer: browser Canvas/WebGL-independent 2D Canvas scene\n' +
  'Output: ' + sceneName + '.mp4\n'
);

console.log('Sample scene render complete:', mp4);
