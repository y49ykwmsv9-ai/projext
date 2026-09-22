import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root,'projects','documentary','build','documentary-manifest.json'),'utf8'));
const out = path.join(root,'projects','documentary','build','render-plan.json');

const plan = {
  title: manifest.title,
  targetDurationMinutes: manifest.targetDurationMinutes,
  format: '16:9 1080p',
  chapters: manifest.chapters.map((c) => ({
    id: c.id,
    title: c.title,
    year: c.year,
    targetSeconds: c.minutes * 60,
    narrationCharacters: c.narration.length,
    shots: c.visualPlan.map((visual, i) => ({
      index: i + 1,
      seconds: Math.max(8, Math.round((c.minutes * 60) / c.visualPlan.length)),
      visual
    }))
  })),
  assembly: [
    'Render map plates from the chapter visual plan.',
    'Animate borders, arrows and timeline markers from the historical data layer.',
    'Lay narration beneath the map/archival plates.',
    'Use original title cards and lower-thirds.',
    'Cross-check every dated event against the source notes before final export.'
  ]
};

fs.writeFileSync(out, JSON.stringify(plan,null,2));
console.log('Documentary render plan written to ' + out);
