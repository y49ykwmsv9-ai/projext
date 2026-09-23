import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const scenePath = path.resolve(process.argv[2] || "projects/historix-renderer/scenes/iberia-0711-gibraltar.json");
const scene = JSON.parse(fs.readFileSync(scenePath, "utf8"));

// Resolve repository-relative data from the scene location, not process.cwd().
// GitHub Actions checks the repository out at /home/runner/work/projext/projext,
// while this renderer lives two levels below the repository root.
const repoRoot = path.resolve(path.dirname(scenePath), "../..");
const csvPath = path.join(repoRoot, "data/historical-polities-since-1000-bce.csv");
if (!fs.existsSync(csvPath)) {
  throw new Error(`Bundled historical database not found: ${csvPath}`);
}
const csv = fs.readFileSync(csvPath, "utf8");
const rows = new Set(
  csv.split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const first = line.match(/^"([^"]+)"/);
    return first ? first[1] : line.split(",")[0].trim();
  })
);

for (const { id } of scene.databaseBindings.polities) {
  if (!rows.has(id)) {
    throw new Error(`Historical polity record missing from bundled database: ${id}`);
  }
}

const W = scene.render.width, H = scene.render.height;
const outDir = path.join(repoRoot, "projects/historix-renderer/dist/scenes");
fs.mkdirSync(outDir, { recursive: true });

const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#182536"/><stop offset="1" stop-color="#6b5a45"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#173e52"/><stop offset="1" stop-color="#0b1f2a"/></linearGradient>
    <filter id="shadow"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <rect x="0" y="330" width="1920" height="750" fill="url(#sea)"/>

  <path d="M650 365 L760 315 L930 320 L1060 375 L1195 410 L1290 505 L1260 610 L1160 675 L1070 770 L900 785 L760 720 L690 620 L600 555 L585 455 Z"
        fill="#6d725d" stroke="#d6c99c" stroke-width="6"/>
  <path d="M650 365 L760 315 L930 320 L1060 375 L1195 410 L1290 505 L1260 610 L1160 675 L1070 770 L900 785 L760 720 L690 620 L600 555 L585 455 Z"
        fill="none" stroke="#30372f" stroke-width="2"/>

  <path d="M690 900 L790 815 L1040 800 L1210 845 L1350 920 L1420 1080 L570 1080 Z"
        fill="#554d3d" stroke="#c5b58b" stroke-width="4"/>

  <path d="M835 785 C800 745 775 710 760 665 C748 625 755 590 790 555"
        fill="none" stroke="#e4b84d" stroke-width="10" stroke-linecap="round"/>
  <path d="M790 555 L765 575 L775 535 Z" fill="#e4b84d"/>

  <path d="M640 475 C760 430 900 455 1020 430 S1200 455 1260 500" fill="none" stroke="#8d8f72" stroke-width="10" opacity=".55"/>
  <path d="M720 610 C850 570 980 610 1130 575" fill="none" stroke="#8d8f72" stroke-width="8" opacity=".45"/>

  <g transform="translate(770 850)">
    <circle cx="0" cy="0" r="18" fill="#d7b45a"/><circle cx="42" cy="-8" r="18" fill="#d7b45a"/>
    <circle cx="82" cy="5" r="18" fill="#d7b45a"/><circle cx="22" cy="38" r="18" fill="#d7b45a"/>
    <circle cx="64" cy="42" r="18" fill="#d7b45a"/>
    <path d="M0 -25 V-55 M42 -33 V-63 M82 -20 V-50" stroke="#d7b45a" stroke-width="5"/>
  </g>
  <g transform="translate(1120 430)">
    <circle cx="0" cy="0" r="20" fill="#a24f4f"/><circle cx="48" cy="18" r="20" fill="#a24f4f"/>
    <circle cx="92" cy="-5" r="20" fill="#a24f4f"/><circle cx="38" cy="58" r="20" fill="#a24f4f"/>
  </g>

  <g fill="#f2e8c9" stroke="#15191d" stroke-width="5">
    <circle cx="790" cy="555" r="12"/><circle cx="970" cy="575" r="12"/>
    <circle cx="1070" cy="490" r="12"/><circle cx="1035" cy="410" r="12"/>
  </g>

  <text x="90" y="105" fill="#f3ead4" font-family="Georgia,serif" font-size="58" font-weight="700">${esc(scene.title)}</text>
  <text x="90" y="160" fill="#d7cfbc" font-family="Arial,sans-serif" font-size="28">${esc(scene.subtitle)}</text>
  <text x="90" y="225" fill="#e4b84d" font-family="Arial,sans-serif" font-size="26" font-weight="700">IBERIA • 711 CE</text>

  <text x="755" y="525" fill="#f3ead4" font-family="Arial,sans-serif" font-size="26" font-weight="700">Jabal Tariq</text>
  <text x="925" y="615" fill="#f3ead4" font-family="Arial,sans-serif" font-size="24">Córdoba</text>
  <text x="1015" y="450" fill="#f3ead4" font-family="Arial,sans-serif" font-size="24">Toledo</text>
  <text x="1085" y="400" fill="#e7b2a8" font-family="Arial,sans-serif" font-size="22">Visigothic response</text>
  <text x="715" y="955" fill="#f0dfad" font-family="Arial,sans-serif" font-size="23">North Africa</text>

  <g transform="translate(90 910)">
    <rect width="470" height="112" rx="12" fill="#10161c" opacity=".9" stroke="#bcae8a"/>
    <text x="24" y="36" fill="#f3ead4" font-family="Arial,sans-serif" font-size="21" font-weight="700">HISTORIX SOURCE GRAPH</text>
    <text x="24" y="66" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="18">Tariq → Gibraltar → Córdoba → Toledo</text>
    <text x="24" y="91" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="17">Visigothic Kingdom • historical polity layer</text>
  </g>

  <g transform="translate(1450 885)">
    <rect width="370" height="125" rx="12" fill="#10161c" opacity=".92" stroke="#bcae8a"/>
    <text x="22" y="34" fill="#f3ead4" font-family="Arial,sans-serif" font-size="18" font-weight="700">HISTORICAL NOTE</text>
    <text x="22" y="61" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="16">Landing at Gibraltar is well attested;</text>
    <text x="22" y="84" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="16">some conquest details rely on later</text>
    <text x="22" y="107" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="16">narrative traditions.</text>
  </g>

  <text x="1470" y="100" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="19">PROGRAMMATIC RENDER • HISTORIX</text>
</svg>`;

const stem = scene.render.outputStem;
const svgPath = path.join(outDir, stem + ".svg");
const pngPath = path.join(outDir, stem + ".png");
const reportPath = path.join(outDir, stem + ".json");
fs.writeFileSync(svgPath, svg, "utf8");

const r = spawnSync("rsvg-convert", ["-w", String(W), "-h", String(H), "-o", pngPath, svgPath], {stdio:"inherit"});
if (r.status !== 0) throw new Error("rsvg-convert failed");

const report = {
  sceneId: scene.id,
  title: scene.title,
  renderer: "historix-renderer",
  renderingBackend: "GitHub Actions + librsvg",
  programmatic: true,
  sourceScene: path.relative(repoRoot, scenePath),
  databasePath: path.relative(repoRoot, csvPath),
  databaseValidation: scene.databaseBindings.polities.map(x => x.id),
  outputs: [path.relative(repoRoot, svgPath), path.relative(repoRoot, pngPath)],
  historicalScope: scene.period,
  generatedAt: new Date().toISOString()
};
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
