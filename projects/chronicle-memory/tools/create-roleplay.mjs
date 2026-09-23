import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const scenarioId = args[0];
const character = args[1];
const displayYear = args[2];

if (!scenarioId || !character || !displayYear) {
  console.error("Usage: node tools/create-roleplay.mjs <scenario-id> <character> <display-year>");
  process.exit(1);
}

const root = path.resolve("roleplays", scenarioId);
if (fs.existsSync(root)) {
  console.error("Scenario already exists: " + scenarioId);
  process.exit(1);
}

for (const dir of ["rounds", "news"]) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

fs.writeFileSync(path.join(root, "scenario.json"), JSON.stringify({
  scenario_id: scenarioId,
  character,
  display_year: displayYear,
  latest_round: 0,
  status: "active",
  metric_schema: "fixed-v1",
  news_style: "period-authentic-local-newspaper"
}, null, 2) + "\n");

fs.writeFileSync(path.join(root, "state.json"), JSON.stringify({
  scenario_id: scenarioId,
  round: 0,
  date: null,
  metrics: {},
  relationships: {},
  history: []
}, null, 2) + "\n");

console.log("Created isolated roleplay: roleplays/" + scenarioId + "/");
