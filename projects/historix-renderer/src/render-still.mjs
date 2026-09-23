import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const scenePath = path.resolve(process.argv[2] || "projects/historix-renderer/scenes/iberia-0711-gibraltar.json");
const scene = JSON.parse(fs.readFileSync(scenePath, "utf8"));
const repoRoot = path.resolve(path.dirname(scenePath), "../../..");
const csvPath = path.join(repoRoot, "data/historical-polities-since-1000-bce.csv");

if (!fs.existsSync(csvPath)) {
  throw new Error(`Bundled historical database not found: ${csvPath}`);
}

const csv = fs.readFileSync(csvPath, "utf8");
const rows = new Set(
  csv.split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const first = line.match(/^\"([^\"]+)\"/);
    return first ? first[1] : line.split(",")[0].trim();
  })
);

for (const { id } of scene.databaseBindings.polities) {
  if (!rows.has(id)) {
    throw new Error(`Historical polity record missing from bundled database: ${id}`);
  }
}

const W = scene.render.width;
const H = scene.render.height;
const outDir = path.join(repoRoot, "projects/historix-renderer/dist/scenes");
fs.mkdirSync(outDir, { recursive: true });

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cities = [
  ["Toledo", 1035, 382, "royal"],
  ["Córdoba", 920, 560, "city"],
  ["Mérida", 785, 470, "city"],
  ["Seville", 720, 600, "city"],
  ["Zaragoza", 1060, 295, "city"],
  ["Tarraco", 1180, 355, "city"],
  ["Gibraltar", 705, 710, "port"],
  ["Ceuta", 640, 760, "port"]
];

const cityMarkup = cities.map(([name, x, y, type]) => {
  const r = type === "royal" ? 7 : 5;
  const labelY = y - 13;
  return `
    <g class="city">
      <circle cx="${x}" cy="${y}" r="${r + 7}" fill="#0b1116" opacity=".72"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="#e7d6a5" stroke="#161b1d" stroke-width="2"/>
      <text x="${x + 12}" y="${labelY}" fill="#f3ead4" font-family="Arial,sans-serif" font-size="${type === "royal" ? 21 : 17}" font-weight="${type === "royal" ? 700 : 500}">${esc(name)}</text>
    </g>`;
}).join("");

const terrainLines = Array.from({ length: 12 }, (_, i) => {
  const y = 275 + i * 43;
  return `<path d="M570 ${y} C700 ${y-30} 825 ${y+25} 940 ${y-5} S1170 ${y-28} 1325 ${y+15}" fill="none" stroke="#b5aa7c" stroke-width="3" opacity=".28"/>`;
}).join("");

const mountainPeaks = [
  [650,350],[705,315],[765,340],[835,300],[910,335],[990,290],[1080,330],[1150,305],[1230,365]
].map(([x,y]) => `
  <path d="M${x-35} ${y+35} L${x} ${y-25} L${x+38} ${y+35} Z" fill="#5c5f4c" stroke="#d0c18e" stroke-width="2" opacity=".78"/>
  <path d="M${x-10} ${y-8} L${x} ${y-25} L${x+10} ${y-8}" fill="none" stroke="#e9dfc0" stroke-width="3" opacity=".65"/>
`).join("");

const waveLines = Array.from({ length: 15 }, (_, i) => {
  const y = 120 + i * 65;
  return `<path d="M40 ${y} C210 ${y-20} 340 ${y+22} 505 ${y} S760 ${y-18} 905 ${y+3}" fill="none" stroke="#5d8790" stroke-width="2" opacity=".23"/>`;
}).join("");

const ships = [0,1,2,3].map((i) => {
  const x = 535 + i * 30, y = 735 + (i % 2) * 24;
  return `
  <g transform="translate(${x} ${y})">
    <path d="M0 0 L38 0 L30 9 L8 9 Z" fill="#7c5940" stroke="#1b2021" stroke-width="2"/>
    <path d="M18 0 L18 -24 M18 -24 L31 -8 L18 -8 Z" fill="#d8c99b" stroke="#1b2021" stroke-width="2"/>
  </g>`;
}).join("");

const armyDots = Array.from({ length: 24 }, (_, i) => {
  const x = 620 + (i % 6) * 18;
  const y = 760 + Math.floor(i / 6) * 18;
  return `<circle cx="${x}" cy="${y}" r="4" fill="#d5ad52"/>`;
}).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#111b26"/><stop offset=".55" stop-color="#26353d"/><stop offset="1" stop-color="#0c171e"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#163b49"/><stop offset=".5" stop-color="#0d2a37"/><stop offset="1" stop-color="#081b25"/>
    </linearGradient>
    <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7d8065"/><stop offset=".45" stop-color="#62664f"/><stop offset="1" stop-color="#4d5042"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#e5bd61" stop-opacity=".28"/><stop offset="1" stop-color="#e5bd61" stop-opacity="0"/></radialGradient>
    <filter id="shadow"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect y="185" width="100%" height="895" fill="url(#sea)"/>
  ${waveLines}

  <!-- atmospheric light over the Strait -->
  <ellipse cx="700" cy="700" rx="280" ry="210" fill="url(#glow)"/>

  <!-- Iberian Peninsula silhouette -->
  <path d="M575 330 L665 270 L760 248 L870 265 L965 250 L1050 285 L1130 270 L1210 315
           L1280 365 L1310 445 L1270 515 L1215 550 L1190 625 L1115 650 L1060 705
           L970 720 L885 690 L810 665 L735 620 L690 570 L625 545 L585 485 L548 425 Z"
        fill="url(#land)" stroke="#dfcf9d" stroke-width="5"/>
  <path d="M575 330 L665 270 L760 248 L870 265 L965 250 L1050 285 L1130 270 L1210 315
           L1280 365 L1310 445 L1270 515 L1215 550 L1190 625 L1115 650 L1060 705
           L970 720 L885 690 L810 665 L735 620 L690 570 L625 545 L585 485 L548 425 Z"
        fill="none" stroke="#252b28" stroke-width="2"/>

  <!-- internal historical-region guides, deliberately approximate and labeled -->
  <path d="M690 570 C760 530 810 510 875 520 S990 490 1060 430" fill="none" stroke="#d6c99c" stroke-width="2" stroke-dasharray="8 8" opacity=".55"/>
  <path d="M760 248 C790 340 770 420 785 470 S820 585 810 665" fill="none" stroke="#d6c99c" stroke-width="2" stroke-dasharray="8 8" opacity=".45"/>
  <path d="M965 250 C940 330 960 405 920 480 S900 610 885 690" fill="none" stroke="#d6c99c" stroke-width="2" stroke-dasharray="8 8" opacity=".45"/>
  ${terrainLines}
  ${mountainPeaks}

  <!-- North Africa -->
  <path d="M470 800 L535 735 L650 720 L760 750 L865 805 L940 870 L990 930 L1015 1080 L400 1080 Z"
        fill="#514b3c" stroke="#b8aa80" stroke-width="4"/>
  <path d="M470 800 C610 835 745 815 880 875" fill="none" stroke="#8e8666" stroke-width="8" opacity=".35"/>
  <path d="M505 850 C630 900 760 875 920 940" fill="none" stroke="#8e8666" stroke-width="5" opacity=".25"/>

  <!-- Gibraltar / Strait -->
  <path d="M535 735 C590 705 635 695 705 710" fill="none" stroke="#e5d6a5" stroke-width="5"/>
  <path d="M535 735 C590 720 650 720 705 710" fill="none" stroke="#111a20" stroke-width="18" opacity=".55"/>
  ${ships}

  <!-- invasion route -->
  <path d="M625 755 C650 740 678 730 705 710 C760 660 805 610 835 570 C865 530 895 500 925 470 C965 435 1000 410 1035 382"
        fill="none" stroke="#e6bd58" stroke-width="8" stroke-linecap="round" stroke-dasharray="18 10"/>
  <path d="M1020 390 L1045 378 L1027 360 Z" fill="#e6bd58"/>
  <path d="M610 780 C655 750 690 725 705 710" fill="none" stroke="#f4df9e" stroke-width="2" opacity=".8"/>

  <!-- landing force -->
  <g>
    ${armyDots}
    <circle cx="690" cy="750" r="58" fill="none" stroke="#e4bd5e" stroke-width="2" opacity=".5"/>
    <circle cx="690" cy="750" r="75" fill="none" stroke="#e4bd5e" stroke-width="1" stroke-dasharray="5 9" opacity=".35"/>
  </g>

  <!-- Visigothic field force -->
  <g>
    ${Array.from({length:16},(_,i)=>`<circle cx="${1120+(i%4)*18}" cy="${490+Math.floor(i/4)*18}" r="4" fill="#a95c55"/>`).join("")}
    <path d="M1090 470 L1175 505" stroke="#a95c55" stroke-width="3" opacity=".55"/>
  </g>

  ${cityMarkup}

  <!-- major labels -->
  <text x="92" y="92" fill="#f3ead4" font-family="Georgia,serif" font-size="54" font-weight="700">${esc(scene.title)}</text>
  <text x="95" y="137" fill="#d4ccba" font-family="Arial,sans-serif" font-size="24">${esc(scene.subtitle)}</text>
  <text x="95" y="178" fill="#e5bd58" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="3">SPRING–SUMMER 711 • WESTERN MEDITERRANEAN</text>

  <text x="565" y="695" fill="#f4e9c8" font-family="Arial,sans-serif" font-size="18" font-weight="700">STRAIT OF GIBRALTAR</text>
  <text x="565" y="820" fill="#ead9a7" font-family="Arial,sans-serif" font-size="18">Umayyad-aligned landing force</text>
  <text x="1110" y="458" fill="#e4aaa2" font-family="Arial,sans-serif" font-size="18" font-weight="700">VISIGOTHIC FIELD FORCE</text>
  <text x="730" y="930" fill="#d5c9a7" font-family="Arial,sans-serif" font-size="18">North Africa</text>

  <!-- timeline -->
  <g transform="translate(80 945)">
    <line x1="0" y1="0" x2="1740" y2="0" stroke="#9f936f" stroke-width="2" opacity=".65"/>
    <circle cx="30" cy="0" r="7" fill="#e5bd58"/>
    <circle cx="860" cy="0" r="5" fill="#d2c6a4"/>
    <circle cx="1710" cy="0" r="5" fill="#d2c6a4"/>
    <text x="0" y="35" fill="#d7cfbd" font-family="Arial,sans-serif" font-size="16">711 • landing</text>
    <text x="805" y="35" fill="#d7cfbd" font-family="Arial,sans-serif" font-size="16">campaign advances</text>
    <text x="1590" y="35" fill="#d7cfbd" font-family="Arial,sans-serif" font-size="16">Visigothic crisis</text>
  </g>

  <!-- source / graph overlay -->
  <g transform="translate(1390 80)">
    <rect width="445" height="245" rx="14" fill="#0b1117" opacity=".94" stroke="#a99b77"/>
    <text x="24" y="34" fill="#f3ead4" font-family="Arial,sans-serif" font-size="18" font-weight="700">HISTORIX • SOURCE GRAPH</text>
    <line x1="55" y1="88" x2="150" y2="128" stroke="#e5bd58" stroke-width="3"/>
    <line x1="150" y1="128" x2="250" y2="88" stroke="#e5bd58" stroke-width="3"/>
    <line x1="250" y1="88" x2="350" y2="128" stroke="#a99b77" stroke-width="3"/>
    <circle cx="55" cy="88" r="10" fill="#e5bd58"/><circle cx="150" cy="128" r="10" fill="#e5bd58"/>
    <circle cx="250" cy="88" r="10" fill="#d8d0bd"/><circle cx="350" cy="128" r="10" fill="#a95c55"/>
    <text x="25" y="172" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="15">Tariq → Gibraltar → Córdoba → Toledo</text>
    <text x="25" y="198" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="14">Visigothic Kingdom • polity layer</text>
    <text x="25" y="222" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="14">HISTORIX / CLIOPATRIA bridge</text>
  </g>

  <!-- historical caution -->
  <g transform="translate(1390 350)">
    <rect width="445" height="142" rx="14" fill="#0b1117" opacity=".94" stroke="#a99b77"/>
    <text x="24" y="30" fill="#f3ead4" font-family="Arial,sans-serif" font-size="17" font-weight="700">HISTORICAL SOURCE NOTE</text>
    <text x="24" y="58" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="14">Landing at Gibraltar is well attested.</text>
    <text x="24" y="82" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="14">Chronology and conquest details can</text>
    <text x="24" y="106" fill="#c9c3b5" font-family="Arial,sans-serif" font-size="14">depend on later narrative traditions.</text>
    <text x="24" y="130" fill="#e5bd58" font-family="Arial,sans-serif" font-size="13">Visualized as evidence-aware reconstruction.</text>
  </g>

  <text x="1430" y="540" fill="#9f9a8e" font-family="Arial,sans-serif" font-size="13" letter-spacing="2">PROGRAMMATIC HISTORICAL VISUALIZATION</text>
</svg>`;

const stem = scene.render.outputStem;
const svgPath = path.join(outDir, stem + ".svg");
const pngPath = path.join(outDir, stem + ".png");
const reportPath = path.join(outDir, stem + ".json");

fs.writeFileSync(svgPath, svg, "utf8");
const r = spawnSync("rsvg-convert", ["-w", String(W), "-h", String(H), "-o", pngPath, svgPath], { stdio: "inherit" });
if (r.status !== 0) throw new Error("rsvg-convert failed");

const report = {
  sceneId: scene.id,
  title: scene.title,
  renderer: "historix-renderer",
  renderingBackend: "GitHub Actions + librsvg",
  visualRevision: "cinematic-map-v2",
  programmatic: true,
  sourceScene: path.relative(repoRoot, scenePath),
  databasePath: path.relative(repoRoot, csvPath),
  databaseValidation: scene.databaseBindings.polities.map(x => x.id),
  graphNodes: scene.graph.nodes.length,
  graphEdges: scene.graph.edges.length,
  outputs: [path.relative(repoRoot, svgPath), path.relative(repoRoot, pngPath)],
  historicalScope: scene.period,
  generatedAt: new Date().toISOString()
};
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
