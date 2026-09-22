import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const configPath = path.join(root, 'projects', 'documentary', 'documentary.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const csvPath = path.join(root, 'data', 'historical-polities-expansion-v2.csv');

function parseCsv(text) {
  const lines = text.trim().split(/\\r?\\n/);
  const headers = lines.shift().split(',');
  return lines.map(function(line) {
    const cells = [];
    let cell = '';
    let quote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { quote = !quote; continue; }
      if (c === ',' && !quote) { cells.push(cell); cell = ''; }
      else cell += c;
    }
    cells.push(cell);
    const row = {};
    headers.forEach(function(h, i) { row[h] = cells[i] || ''; });
    return row;
  });
}

const polities = fs.existsSync(csvPath) ? parseCsv(fs.readFileSync(csvPath, 'utf8')) : [];
function activeForYear(year) {
  return polities
    .filter(function(p) { return Number(p.start_year) <= year && Number(p.end_year) >= year; })
    .map(function(p) { return p.name; })
    .filter(Boolean)
    .slice(0, 80);
}

const narration = {
  c01: 'In 1936 Europe was not yet at war, but the political system built after the First World War was under sustained pressure. Germany remilitarized the Rhineland in March, testing whether the other powers would enforce the postwar settlement. Later that year Germany and Italy announced the Rome-Berlin Axis, while Germany and Japan signed the Anti-Comintern Pact. Rearmament, ideological conflict, and the weakness of collective security were changing the strategic balance. The important point is not that a single decision made a later war inevitable. Rather, several governments were testing the limits of the international order at the same time. This documentary follows those changes year by year, separating documented events from later interpretations.',
  c02: 'In 1938 the crisis moved directly into Central Europe. Germany incorporated Austria in the Anschluss in March, and later in the year the Munich Agreement transferred the Sudeten border regions of Czechoslovakia to Germany. The settlement was presented at the time as a way to prevent a larger European war, but it left Czechoslovakia strategically weakened. In November, Kristallnacht marked a major escalation of organized anti-Jewish violence under the Nazi regime. These events belong in the same chronology, but they should not be collapsed into one simple story: territorial expansion, diplomacy, persecution, and military preparation were connected while remaining distinct processes.',
  c03: 'On August 23, 1939 Germany and the Soviet Union signed a non-aggression agreement with a secret protocol dividing parts of Eastern Europe into spheres of influence. On September 1 Germany invaded Poland. Britain and France declared war on Germany on September 3, turning the Polish crisis into a European war. Soviet forces entered eastern Poland on September 17, and Poland was partitioned between the two powers. The campaign demonstrated the vulnerability of smaller states caught between larger military powers. It also began an occupation system that would bring mass repression, displacement, and murder across Eastern Europe.',
  c04: 'The relative lull after the destruction of Poland ended in April 1940. Germany attacked Denmark and Norway, then launched its western offensive on May 10 against the Low Countries and France. German forces reached the English Channel, and France signed an armistice in June. Britain remained in the war, protected by the Channel and supported by the Royal Air Force and Royal Navy. The Battle of Britain followed as Germany sought the conditions for a possible invasion. The failure to secure air superiority meant that Britain was not removed from the war, and the conflict entered a different phase.',
  c05: 'In 1941 the war widened dramatically. Germany and its allies attacked Yugoslavia and Greece in April, then on June 22 launched the invasion of the Soviet Union. German armies advanced deep into Soviet territory, but the campaign did not produce the quick victory Berlin had sought. By the autumn, resistance around Leningrad and Moscow was hardening, and the Soviet counteroffensive near Moscow in December pushed German forces away from the capital. One day after Japan attacked Pearl Harbor on December 7, the United States declared war on Japan. Germany and Italy then declared war on the United States. A European conflict had become a truly global war.',
  c06: 'By 1942 Axis expansion reached its greatest geographic extent, but the strategic picture was changing. In the Pacific, the United States halted a major Japanese advance at Midway. In North Africa, British forces and their allies contested the Axis advance toward Egypt. On the Eastern Front, Germany renewed its offensive toward the Volga and the Caucasus, reaching Stalingrad. The city became the center of a battle that consumed enormous resources and manpower. At the same time, Nazi persecution had developed into systematic mass murder, with millions of Jews and other targeted people being deported and murdered. Military history and the history of genocide must therefore be presented together without treating one as an explanation that erases the other.',
  c07: 'The surrender of the German Sixth Army at Stalingrad in February 1943 marked a major strategic reversal on the Eastern Front. Germany still possessed formidable military power, but its ability to dictate the direction of the war was diminishing. In July the Germans launched the Battle of Kursk, where Soviet forces absorbed and then defeated the offensive. That same month Allied forces landed in Sicily. Italy\'s Fascist government fell, and after the Italian armistice German forces occupied much of the peninsula and continued the fighting. The war was becoming a contest in which the Axis powers increasingly reacted to Allied and Soviet initiatives.',
  c08: 'In 1944 the Allies opened a major front in Western Europe with the Normandy landings on June 6. More than two million Allied soldiers would enter France during the campaign that followed. In the east, the Soviet Operation Bagration destroyed much of German Army Group Centre and drove German forces westward. Paris was liberated in August, while Romania changed sides and German positions in southeastern Europe began to unravel. The Warsaw Uprising also revealed the brutal political and military conditions in occupied Poland. By the end of the year Germany still had significant forces, but it was fighting from increasingly compressed defensive positions.',
  c09: 'The final campaign in Europe began with enormous Soviet and Western Allied advances in early 1945. Soviet forces crossed into Germany from the east while American and British forces crossed the Rhine in March. Berlin was encircled in April. Adolf Hitler died on April 30, and Germany surrendered unconditionally in May. The surrender ended the European war, but it did not immediately end the global conflict. Across the continent, the physical destruction was immense, millions of people had been displaced or killed, and the political map was about to be transformed.',
  c10: 'The war continued in Asia after Germany\'s surrender. The United States used atomic bombs against Hiroshima on August 6 and Nagasaki on August 9. The Soviet Union entered the war against Japan on August 8 and invaded Japanese-held Manchuria. Japan agreed to surrender in August and formally surrendered on September 2, 1945. The result was not a simple return to the world of 1939. Europe was divided into competing political spheres, the United States and Soviet Union emerged as superpowers, colonial systems faced mounting challenges, and the institutions of the postwar international order began to take shape. The documentary ends here because the war did not simply close a chapter. It created the conditions for the next one.'
};

const outDir = path.join(root, 'projects', 'documentary', 'build');
fs.mkdirSync(outDir, { recursive: true });

const chapters = config.chapters.map(function(c) {
  return Object.assign({}, c, {
    activeHistoricalPolities: activeForYear(c.year),
    narration: narration[c.id] || '',
    visualPlan: [
      'opening title and date',
      'animated historical map with clearly labeled borders',
      'chronological timeline with dated markers',
      'original archival-style still plate',
      'statistical or geographic graph when the data supports it',
      'chapter recap map'
    ]
  });
});

const manifest = Object.assign({}, config, {
  generatedAt: new Date().toISOString(),
  methodology: {
    sourcePolicy: 'Use dated primary and secondary historical references; do not infer motives when the record is uncertain.',
    mapPolicy: 'Use bundled or generated geographic data; no runtime dependency on third-party map tiles.',
    visualPolicy: 'Original documentary graphics and generated plates, not a reproduction of another channel\'s branded package.'
  },
  chapters: chapters
});

fs.writeFileSync(path.join(outDir, 'documentary-manifest.json'), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(outDir, 'documentary-script.md'),
  '# The World at War: 1936–1945\n\n' +
  chapters.map(function(c) {
    return '## ' + c.year + ' — ' + c.title + '\n\n' +
      c.narration + '\n\n' +
      '**Historical polities indexed for ' + c.year + ':** ' +
      c.activeHistoricalPolities.slice(0, 20).join(', ') + '\n';
  }).join('\n')
);

const shotRows = ['chapter,year,shot,duration_seconds,visual'];
chapters.forEach(function(c) {
  const each = Math.max(8, Math.round((c.minutes * 60) / c.visualPlan.length));
  c.visualPlan.forEach(function(v, i) {
    shotRows.push([c.id, c.year, i + 1, each, '"' + v + '"'].join(','));
  });
});
fs.writeFileSync(path.join(outDir, 'documentary-shotlist.csv'), shotRows.join('\n') + '\n');

console.log('Generated ' + chapters.length + ' chapters, ' + config.targetDurationMinutes +
  ' target minutes, and ' + polities.length + ' historical polity records available to the generator.');
