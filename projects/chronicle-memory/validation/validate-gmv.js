#!/usr/bin/env node
/*
 * Chronicle Memory / GMV-62BCE-001 validation gate.
 *
 * Purpose:
 *   Turn the mandatory rules in README.md into repeatable pre-commit checks.
 *
 * Modes:
 *   node projects/chronicle-memory/validation/validate-gmv.js
 *   node projects/chronicle-memory/validation/validate-gmv.js --round 38
 *
 * The validator is intentionally dependency-free so it can run in GitHub Actions
 * and locally without installing a package.
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CAMPAIGN = path.join(ROOT, "roleplays", "GMV-62BCE-001");
const SCENARIO = path.join(CAMPAIGN, "scenario.json");
const STATE = path.join(CAMPAIGN, "state.json");
const ROUNDS = path.join(CAMPAIGN, "rounds");
const NEWS = path.join(CAMPAIGN, "news");

const FIXED_CONDITIONS = new Set([
  "economy", "agriculture", "infrastructure", "trade", "taxation",
  "readiness", "morale", "supply", "organization", "stability",
  "legitimacy", "exhaustion", "technology", "intelligence"
]);

const FIXED_RELATION = "relations";

const FORBIDDEN_LEGACY_METRICS = new Set([
  "tax_rate_index",
  "taxation_index",
  "agriculture_investment_index",
  "agriculture_index",
  "military_expenditure_index",
  "military_spending_index",
  "frontier_readiness_index",
  "friendship_index",
  "hostility_index",
  "diplomatic_warmth_index"
]);

const EXACT_METRICS = new Set([
  "population", "treasury", "currency", "soldiers", "food_stock",
  "total_troops", "available_troops", "deployed_troops", "garrison_troops",
  "reserve_manpower", "permanent_losses", "temporary_unavailable",
  "recruitment_gains", "reinforcements_received", "births", "deaths",
  "immigration", "emigration", "migration", "land_area_sq_miles"
]);

let errors = [];
let warnings = [];

function fail(code, message) { errors.push({ code, message }); }
function warn(code, message) { warnings.push({ code, message }); }

// Historical migration compatibility: gmv-round-v2 stores the authoritative normalized view
// and preserves the pre-migration record under legacy_record. The validator must validate the
// normalized view while treating missing legacy before/after values as explicit provenance gaps.
function validateNormalizedRound(round) {
  if (round.schema_version !== "gmv-round-v2") return [];
  const errors = [];
  if (round.campaign_id !== "GMV-62BCE-001") errors.push("normalized round has incorrect campaign_id");
  if (!Number.isInteger(round.round) || round.round < 1) errors.push("normalized round has invalid round number");
  if (!round.period || typeof round.period !== "object" || !round.period.start || !round.period.end) errors.push("normalized round has incomplete period");
  if (!round.action || !round.action.action_id || !round.action.actor || !round.action.action_text) errors.push("normalized round has incomplete action");
  if (!Array.isArray(round.events)) errors.push("normalized round events must be an array");
  for (const e of round.events || []) {
    if (!e.event_id || !e.date || !e.headline) errors.push("normalized event missing event_id/date/headline");
    for (const s of e.state_changes || []) {
      if (s.before === null || s.after === null) {
        if (s.provenance !== "legacy-migration") errors.push(`normalized event ${e.event_id} has missing before/after without legacy-migration provenance`);
      }
      if (typeof s.delta !== "number") errors.push(`normalized event ${e.event_id} has non-numeric delta`);
    }
  }
  return errors;
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { fail("JSON_INVALID", `${file}: ${e.message}`); return null; }
}

function sentenceCount(text) {
  if (!text || typeof text !== "string") return 0;
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).length;
}

function isDateLike(value) {
  return typeof value === "string" && /^-?\d{4,}-\d{2}-\d{2}$/.test(value);
}

function assertSame(a, b, code, message) {
  if (a !== b) fail(code, message + ` (got ${a} vs ${b})`);
}

function validateIdentity(scenario, state, round, news, expectedRound) {
  if (!scenario || !state || !round || !news) return;

  for (const [label, obj] of [["scenario", scenario], ["state", state], ["round", round]]) {
    assertSame(obj.scenario_id || obj.campaign_id, "GMV-62BCE-001", "SCENARIO_ID", label + " has wrong campaign/scenario id");
  }
  if (news) assertSame(news.campaign_id || news.scenario_id, "GMV-62BCE-001", "NEWS_CAMPAIGN_ID", "news has wrong campaign/scenario id");

  assertSame(scenario.latest_round, state.round, "LATEST_ROUND_STATE",
    "scenario.latest_round must equal state.round");
  assertSame(scenario.latest_round, round.round, "LATEST_ROUND_RECORD",
    "scenario.latest_round must equal round.round");
  assertSame(scenario.latest_round, news.round, "LATEST_ROUND_NEWS",
    "scenario.latest_round must equal news.round");

  if (expectedRound != null) {
    assertSame(expectedRound, round.round, "REQUESTED_ROUND_MISMATCH",
      "requested round does not match round record");
  }

  if (!isDateLike(scenario.latest_date) || !isDateLike(state.date)) {
    fail("DATE_FORMAT", "scenario.latest_date and state.date must use ISO-like signed historical dates");
  }
  assertSame(scenario.latest_date, state.date, "LATEST_DATE",
    "scenario.latest_date must equal state.date");
  assertSame(scenario.latest_date, round.period.end, "ROUND_END_DATE",
    "scenario.latest_date must equal round.period.end");
  assertSame(scenario.latest_date, news.period.end, "NEWS_END_DATE",
    "scenario.latest_date must equal news.period.end");
}

function validateMetricSchema(scenario, state, round) {
  if (!scenario || !state || !round) return;

  if (scenario.metric_schema !== "fixed-v1+land-area-v1") {
    fail("METRIC_SCHEMA", "Campaign must use fixed-v1+land-area-v1.");
  }
  if (round.schema_version !== "gmv-round-v2" && round.metric_schema !== scenario.metric_schema) {
    fail("METRIC_SCHEMA_MISMATCH", "Round metric_schema must match scenario metric_schema.");
  }

  const metrics = state.metrics || {};
  for (const key of Object.keys(metrics)) {
    if (FORBIDDEN_LEGACY_METRICS.has(key)) {
      fail("LEGACY_METRIC", `Forbidden legacy metric present in state: ${key}`);
    }
  }

  for (const [key, value] of Object.entries(metrics)) {
    if (FIXED_CONDITIONS.has(key) && (typeof value !== "number" || value < 0 || value > 100)) {
      fail("FIXED_SCALE", `${key} must be numeric and remain on the 0-100 scale.`);
    }
    if (key === FIXED_RELATION && (typeof value !== "number" || value < -100 || value > 100)) {
      fail("RELATION_SCALE", "relations must remain on the -100 to +100 scale.");
    }
  }

  const ledgerTotals = round.schema_version === "gmv-round-v2" ? Object.fromEntries(Object.entries(round.round_ledger || {}).map(([k,v]) => [k, v.delta])) : (round.running_total || {});
  for (const [metric, delta] of Object.entries(ledgerTotals)) {
    if (typeof delta !== "number" || !Number.isFinite(delta)) {
      fail("DELTA_NUMERIC", `running_total.${metric} must be numeric.`);
    }
  }
}

function validateRoundEvents(round, news) {
  if (!round || !news) return;
  const events=Array.isArray(round.events)?round.events:[];
  const newsEvents=Array.isArray(news.events)?news.events:[];
  if (news.schema_version !== "gmv-news-v2") fail("NEWS_SCHEMA", "Historical news records must use gmv-news-v2.");
  if (news.schema_version === "gmv-news-v2" && !news.legacy_record) fail("NEWS_MIGRATION", "Migrated news must preserve legacy_record.");
  if(events.length===0) fail("NO_EVENTS","A substantive round must contain event records.");
  if(newsEvents.length!==events.length) fail("NEWS_EVENT_PARITY","News index and round event record counts must match.");
  const v2=round.schema_version==="gmv-round-v2";
  const ids=new Set(events.map(e=>v2?e.event_id:e.event));
  for(const e of events){
    const id=e.event_id||e.event;
    if(v2){
      if(!e.event_id) fail("EVENT_ID","Normalized event missing event_id.");
      if(!isDateLike(e.date)) fail("EVENT_DATE",`Event ${id} has invalid date.`);
      if(!e.headline) fail("EVENT_HEADLINE",`Event ${id} is missing a headline.`);
      if(e.article!==null && (typeof e.article!=="string" || sentenceCount(e.article)<5)) fail("NEWS_DEPTH",`Event ${id} must contain a substantial article of at least 5 sentences when article text exists.`);
      if(!Array.isArray(e.state_changes)) fail("EVENT_LEDGER",`Event ${id} is missing normalized state_changes.`);
    } else {
      if(!Number.isInteger(e.event)) fail("EVENT_ID","Every event must have an integer event id.");
      if(!isDateLike(e.date)) fail("EVENT_DATE",`Event ${id} has invalid date.`);
      if(!e.headline) fail("EVENT_HEADLINE",`Event ${id} is missing a headline.`);
      if(typeof e.article!=="string" || sentenceCount(e.article)<5) fail("NEWS_DEPTH",`Event ${id} must contain a substantial article of at least 5 sentences.`);
      if(!e.ledger || typeof e.ledger!=="object") fail("EVENT_LEDGER",`Event ${id} is missing its state-change ledger.`);
    }
  }
  for(const n of newsEvents){const id=n.event_id||n.event;if(!ids.has(id)) fail("NEWS_ORPHAN","News event "+id+" has no round event record."); if(news.schema_version==="gmv-news-v2" && n.source_event_id!==id) fail("NEWS_SOURCE_ID","News event "+id+" must point to the matching source event.");}
  for(const e of events.filter(e=>e.special_event===true)) if(!Number.isInteger(e.magnitude)||e.magnitude<1||e.magnitude>11) fail("SPECIAL_MAGNITUDE",`Special event ${e.event_id||e.event} has invalid magnitude.`);
}

function validateRunningTotals(round) {
  if(!round) return;
  if(round.schema_version==="gmv-round-v2"){
    const sums={}; for(const e of round.events||[]) for(const s of e.state_changes||[]) if(typeof s.delta==="number") sums[s.metric]=(sums[s.metric]||0)+s.delta;
    for(const [metric,obj] of Object.entries(round.round_ledger||{})){const expected=typeof obj==="object"?obj.delta:obj,actual=sums[metric]||0;if(Math.abs(actual-expected)>1e-9) fail("RUNNING_TOTAL",`round_ledger.${metric} = ${expected}, but event state_changes sum to ${actual}.`);}
    return;
  }
  const events=Array.isArray(round.events)?round.events:[],sums={};
  for(const e of events) for(const [metric,delta] of Object.entries(e.ledger||{})){if(typeof delta!=="number"||!Number.isFinite(delta)){fail("LEDGER_NUMERIC",`Event ${e.event} has non-numeric ledger value for ${metric}.`);continue;}sums[metric]=(sums[metric]||0)+delta;}
  for(const [metric,expected] of Object.entries(round.running_total||{})){const actual=sums[metric]||0;if(Math.abs(actual-expected)>1e-9)fail("RUNNING_TOTAL",`running_total.${metric} = ${expected}, but event ledgers sum to ${actual}.`);}
  for(const [metric,actual] of Object.entries(sums)) if(!(metric in (round.running_total||{}))) fail("RUNNING_TOTAL_MISSING",`Event ledgers contain ${metric} but running_total does not record it.`);
}

function validateFinancials(round, state) {
  if (!round || !state) return;
  const f = round.financials;
  if (!f) return;
  const gross = Number(f.gross_receipts);
  const costs = Number(f.operating_security_maintenance ?? f.operating_security_and_maintenance_costs);
  const net = Number(f.net_public_commercial_profit ?? f.net_public_profit);
  if (Number.isFinite(gross) && Number.isFinite(costs) && Number.isFinite(net) && gross - costs !== net) {
    fail("FINANCIAL_RECONCILIATION", "gross receipts minus operating/security/maintenance costs must equal the declared net public commercial profit.");
  }
  if (Number.isFinite(f.private_transfer) && Number.isFinite(f.private_transfer_rate) && Number.isFinite(net)) {
    const expectedTransfer = Math.round(net * f.private_transfer_rate);
    if (expectedTransfer !== f.private_transfer) fail("PRIVATE_TRANSFER", "private transfer must reconcile to the declared transfer rate and net public profit.");
  }
  if (Number.isFinite(f.estate_tax_rate) && Number.isFinite(f.taxable_income_basis) && Number.isFinite(f.estate_tax)) {
    const expectedTax = Math.round(f.taxable_income_basis * f.estate_tax_rate * 100) / 100;
    if (Math.abs(expectedTax - f.estate_tax) > 1e-9) fail("ESTATE_TAX", "estate tax must reconcile exactly to taxable income basis and declared rate.");
  }
}

function validateMilitaryConservation(state) {
  const m = state && state.metrics;
  if (!m) return;
  const buckets = ["available_troops", "deployed_troops", "garrison_troops", "temporary_unavailable"];
  const present = buckets.filter(k => Number.isFinite(m[k]));
  if (Number.isFinite(m.total_troops) && present.length > 0) {
    const serving = buckets.reduce((sum, k) => sum + (Number(m[k]) || 0), 0);
    if (serving > m.total_troops) {
      fail("MILITARY_CONSERVATION", "Tracked troop buckets exceed total troops.");
    }
  } else if (Number.isFinite(m.soldiers)) {
    warn("MILITARY_LEGACY_SHAPE", "Current state uses soldiers without explicit troop buckets; future rounds should carry the full conservation buckets.");
  }
}

function validateLandArea(state, scenario) {
  if (!state || !scenario) return;
  const metric = scenario.land_area_metric;
  if (!metric) fail("LAND_AREA_RULE", "Land-area metric definition is missing.");
  if (metric && metric.name !== "land_area_sq_miles") fail("LAND_AREA_RULE", "Land area must use land_area_sq_miles.");
  if (!state.holdings || state.holdings.land_area_sq_miles !== state.metrics.land_area_sq_miles) {
    fail("LAND_AREA_SYNC", "state.holdings.land_area_sq_miles must equal state.metrics.land_area_sq_miles.");
  }
}

function validateInformationBoundaries(round) {
  if (!round) return;
  // Structural guard: every event must identify a type, and WORLD/INTELLIGENCE
  // reporting must not be represented as unexplained omniscient state.
  for (const e of round.events || []) {
    const eventType = String(e.type || "").toUpperCase();
    if (!["DIRECT", "CONNECTED", "SURPRISE", "WORLD", "RUMOR", "INFERENCE", "AGRICULTURE", "PATRONAGE", "RELATIONS", "ROUNDUP"].includes(eventType)) {
      fail("EVENT_TYPE", `Event ${e.event_id || e.event} uses unsupported information/event type: ${e.type}`);
    }
  }
}

function validateEndOfRoundChecks(round) {
  if (!round || round.schema_version !== "gmv-round-v2") return;
  const checks = round.end_of_round_checks;
  if (!checks || typeof checks !== "object") {
    fail("END_OF_ROUND_CHECKS", "Canonical round is missing end_of_round_checks.");
    return;
  }
  const special = checks.special_event_resolution;
  if (!special || typeof special !== "object") {
    fail("SPECIAL_EVENT_CHECK", "Every round must record a special-event/magnitude resolution check.");
  } else {
    const selected = special.selected;
    if (typeof selected !== "boolean") fail("SPECIAL_EVENT_SELECTED", "special_event_resolution.selected must be boolean.");
    if (selected && (!Number.isInteger(special.magnitude) || special.magnitude < 1 || special.magnitude > 10)) fail("SPECIAL_EVENT_MAGNITUDE", "Selected standard special events must have a magnitude from 1 to 10.");
    if (!selected && special.magnitude !== null) fail("SPECIAL_EVENT_NULL_MAGNITUDE", "Unselected special events must have magnitude null.");
    if (typeof special.opportunity_chance !== "number" || special.opportunity_chance < 0 || special.opportunity_chance > 1) fail("SPECIAL_EVENT_OPPORTUNITY", "Every round must record a valid special-event opportunity chance.");
    if (!Array.isArray(special.magnitude_11_checks)) fail("MAG11_CHECK", "Every round must record the magnitude-11 check array.");
    if (!Number.isInteger(special.magnitude_11_events) || special.magnitude_11_events < 0) fail("MAG11_COUNT", "Every round must record a non-negative magnitude_11_events count.");
    if (!selected && special.magnitude_11_events !== 0) fail("MAG11_SELECTION", "A round without a selected special event cannot record accepted magnitude-11 events.");
    if (round.special_event !== null && round.special_event !== undefined) {
      if (Boolean(round.special_event.selected) !== selected) fail("SPECIAL_EVENT_PARITY", "round.special_event and special_event_resolution disagree on selection.");
      if (selected && round.special_event.magnitude !== special.magnitude) fail("SPECIAL_EVENT_PARITY", "round.special_event and special_event_resolution disagree on magnitude.");
    }
  }
  const commit = checks.commit_check;
  if (!commit || typeof commit !== "object" || commit.required !== true || commit.verified_after_commit !== true) {
    fail("COMMIT_CHECK", "Canonical round must record a successful post-commit verification.");
  }
}

function validateGitCommitState(round, scenario) {
  if (!round || !scenario) return;
  const { execSync } = require("child_process");
  try {
    const tracked = execSync(
      `git ls-files --error-unmatch "roleplays/GMV-62BCE-001/rounds/round-\${String(round.round).padStart(3, "0")}.json" "roleplays/GMV-62BCE-001/news/round-\${String(round.round).padStart(3, "0")}.json" "roleplays/GMV-62BCE-001/state.json" "roleplays/GMV-62BCE-001/scenario.json"`,
      { cwd: ROOT, encoding: "utf8" }
    ).trim().split(/\r?\n/).filter(Boolean);
    if (tracked.length !== 4) fail("COMMIT_TRACKING", "Canonical round/state/scenario files are not all tracked by git.");
    const dirty = execSync("git status --porcelain --untracked-files=no", { cwd: ROOT, encoding: "utf8" }).trim();
    if (dirty) fail("COMMIT_CLEAN", "Canonical round validation must run from a clean committed working tree.");
    const head = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
    if (!head) fail("COMMIT_HEAD", "Unable to resolve the validating commit.");
  } catch (e) {
    fail("COMMIT_CHECK_RUNTIME", `Unable to verify committed canonical state: \${e.message}`);
  }
}

function validateHistoricalScriptGuard(round) {
  if (!round) return;
  const text = JSON.stringify(round).toLowerCase();
  const forbidden = [
    "automatically happens because it happened historically",
    "forced by history",
    "historical script",
    "canon event forced"
  ];
  for (const phrase of forbidden) {
    if (text.includes(phrase)) fail("HISTORY_SCRIPT", `Round contains forbidden scripted-history language: ${phrase}`);
  }
}

function discoverRounds() {
  if (!fs.existsSync(ROUNDS)) return [];
  return fs.readdirSync(ROUNDS)
    .filter(f => /^round-\d+\.json$/.test(f))
    .map(f => Number(f.match(/\d+/)[0]))
    .sort((a,b) => a-b);
}

function validateChronology(scenario) {
  const rounds = discoverRounds();
  for (const n of rounds) {
    const f = path.join(ROUNDS, "round-" + String(n).padStart(3,"0") + ".json");
    const r = readJson(f);
    if (r && r.schema_version !== "gmv-round-v2") fail("HISTORICAL_SCHEMA", "Round " + n + " is not normalized to gmv-round-v2.");
    const nf = path.join(NEWS, "round-" + String(n).padStart(3,"0") + ".json");
    const nr = fs.existsSync(nf) ? readJson(nf) : null;
    if (nr && nr.schema_version !== "gmv-news-v2") fail("HISTORICAL_NEWS_SCHEMA", "News round " + n + " is not normalized to gmv-news-v2.");
  }
  if (!rounds.length) { fail("NO_ROUND_FILES", "No round records found."); return; }
  if (!rounds.includes(scenario.latest_round)) {
    fail("LATEST_ROUND_MISSING", `scenario.latest_round ${scenario.latest_round} has no round file.`);
  }
  const gaps = [];
  for (let i = 1; i < rounds.length; i++) {
    if (rounds[i] !== rounds[i-1] + 1) gaps.push(`${rounds[i-1]}->${rounds[i]}`);
  }
  if (gaps.length) fail("ROUND_GAP", `Round sequence contains gaps: ${gaps.join(", ")}`);
}

function validateNoFuturePointer(round, scenario) {
  if (!round || !scenario) return;
  if (round.round !== scenario.latest_round) {
    fail("CANONICAL_POINTER", "A candidate continuation must be based on scenario.latest_round.");
  }
}


function validatePropertyLedger(state, scenario) {
  if (!state || !scenario) return;
  const ledger = state.property_ledger;
  if (!ledger || ledger.schema_version !== "property-ledger-v1.1") {
    fail("PROPERTY_LEDGER", "Persistent property_ledger is required.");
    return;
  }
  if (!Array.isArray(ledger.records) || ledger.records.length === 0) {
    fail("PROPERTY_LEDGER_EMPTY", "Property ledger must contain persistent holding records.");
    return;
  }
  const ids = new Set();
  let knownArea = 0;
  for (const h of ledger.records) {
    if (!h.holding_id || ids.has(h.holding_id)) fail("PROPERTY_ID", "Property ledger holding IDs must be stable and unique.");
    ids.add(h.holding_id);
    for (const key of ["acquisition_date","acquisition_round","acquisition_value"]) {
      if (!(key in h)) fail("PROPERTY_METADATA", `Property ${h.holding_id || "unknown"} is missing ${key}; use null when the historical source does not preserve it.`);
    }
    if (Number.isFinite(h.area_sq_miles) && h.current_status && /active/i.test(h.current_status)) knownArea += h.area_sq_miles;
    if (!h.provenance) fail("PROPERTY_PROVENANCE", `Property ${h.holding_id || "unknown"} is missing provenance.`);
  }
  if (!Number.isFinite(ledger.derived_total_land_area_sq_miles)) fail("PROPERTY_TOTAL", "Property ledger must expose a numeric derived total.");
  if (Math.abs(ledger.derived_total_land_area_sq_miles - Number(state.metrics.land_area_sq_miles)) > 1e-9) fail("PROPERTY_TOTAL_SYNC", "Property ledger derived total must equal state land_area_sq_miles.");
  if (state.holdings && Math.abs(Number(state.holdings.land_area_sq_miles) - ledger.derived_total_land_area_sq_miles) > 1e-9) fail("PROPERTY_HOLDINGS_SYNC", "holdings.land_area_sq_miles must equal the property-ledger derived total.");
  if (scenario.land_area_metric && scenario.land_area_metric.name !== "land_area_sq_miles") fail("PROPERTY_METRIC", "Scenario land-area metric must remain land_area_sq_miles.");
  const spatial = ledger.spatial_reconstruction;
  if (!spatial || spatial.baseline_round !== 33 || spatial.baseline_area_sq_miles !== 4) fail("PROPERTY_SPATIAL_BASELINE", "Round 33 must preserve the confirmed 4.00 sq mi baseline.");
  if (spatial && (!spatial.allocation || spatial.allocation.principal_estate_sq_miles !== 3 || spatial.allocation.lake_port_sq_miles !== 1)) fail("PROPERTY_SPATIAL_ALLOCATION", "Resolved allocation must be 3.00 sq mi principal estate + 1.00 sq mi lake port.");
  const principal = ledger.records.find(h => h.holding_id === "principal_estate");
  const port = ledger.records.find(h => h.holding_id === "lake_port");
  if (!principal || principal.current_status !== "active_historically_established" || principal.area_sq_miles !== 3 || principal.area_status !== "reconstructed_component_allocation") fail("PROPERTY_PRINCIPAL", "Principal estate must be established at reconstructed 3.00 sq mi.");
  if (!port || port.current_status !== "active_historically_established" || port.area_sq_miles !== 1 || port.area_status !== "reconstructed_component_allocation") fail("PROPERTY_LAKE_PORT", "Lake port must be established at reconstructed 1.00 sq mi.");

  if (state.next_round_gate && state.next_round_gate.status !== "OPEN") warn("NEXT_ROUND_BLOCKED", "Historical/property audit gate is currently blocked; no next round may be generated.");
}

function validateHistoricalSchemaAndCommit() {
  const rounds = discoverRounds();
  if (!rounds.length) return;
  for (const n of rounds) {
    const rf = path.join(ROUNDS, `round-${String(n).padStart(3,"0")}.json`);
    const nf = path.join(NEWS, `round-${String(n).padStart(3,"0")}.json`);
    const rr = readJson(rf);
    const nn = fs.existsSync(nf) ? readJson(nf) : null;
    if (!rr) { fail("HISTORY_ROUND_READ", `Unable to read historical round ${n}.`); continue; }
    if (rr.schema_version !== "gmv-round-v2") fail("HISTORY_SCHEMA", `Historical round ${n} is not gmv-round-v2.`);
    validateNormalizedRound(rr).forEach(m => fail("HISTORY_NORMALIZED_SCHEMA", `Round ${n}: ${m}`));
    if (!nn) { fail("HISTORY_NEWS_MISSING", `Historical news file missing for round ${n}.`); continue; }
    if (nn.schema_version !== "gmv-news-v2") fail("HISTORY_NEWS_SCHEMA", `Historical news ${n} is not gmv-news-v2.`);
    if (!nn.legacy_record) fail("HISTORY_NEWS_MIGRATION", `Historical news ${n} lacks required legacy_record.`);
  }
  try {
    const status = execSync("git status --porcelain --untracked-files=no", {cwd:ROOT,encoding:"utf8"}).trim();
    if (status) fail("HISTORY_COMMIT_DIRTY", "Historical audit requires a clean committed checkout.");
    for (const n of rounds) {
      for (const rel of [
        `roleplays/GMV-62BCE-001/rounds/round-${String(n).padStart(3,"0")}.json`,
        `roleplays/GMV-62BCE-001/news/round-${String(n).padStart(3,"0")}.json`
      ]) {
        const disk = fs.readFileSync(path.join(ROOT,rel),"utf8");
        const committed = execSync(`git show HEAD:${rel}`,{cwd:ROOT,encoding:"utf8"});
        if (disk !== committed) fail("HISTORY_NOT_COMMITTED", `Working-tree ${rel} differs from HEAD; canonical history is not actually committed.`);
      }
    }
  } catch (e) {
    fail("HISTORY_COMMIT_RUNTIME", `Unable to prove historical files are committed: ${e.message}`);
  }
}

function validateNextRoundGate(state) {
  if (!state || !state.next_round_gate) {
    fail("NEXT_ROUND_GATE", "Persistent state must contain next_round_gate.");
    return;
  }
  if (state.next_round_gate.status === "BLOCKED_PENDING_HISTORICAL_LEDGER_AUDIT") {
    warn("NEXT_ROUND_LOCK", "Next-round generation is intentionally blocked until historical schema/property/commit audit passes.");
  }
  if (state.next_round_gate.status === "OPEN" && state.next_round_gate.audit_status !== "PASS_WITH_DOCUMENTED_UNCERTAINTY") {
    fail("NEXT_ROUND_GATE_AUDIT_STATUS", "OPEN gate requires a passing historical audit status.");
  }
}

function main() {
  const expectedRoundArg = process.argv.indexOf("--round");
  const expectedRound = expectedRoundArg >= 0 ? Number(process.argv[expectedRoundArg + 1]) : null;

  const scenario = readJson(SCENARIO);
  const state = readJson(STATE);
  const latestRound = scenario ? scenario.latest_round : expectedRound;
  const roundFile = latestRound != null ? path.join(ROUNDS, `round-${String(latestRound).padStart(3, "0")}.json`) : null;
  const newsFile = latestRound != null ? path.join(NEWS, `round-${String(latestRound).padStart(3, "0")}.json`) : null;
  const round = roundFile && fs.existsSync(roundFile) ? readJson(roundFile) : null;
  const news = newsFile && fs.existsSync(newsFile) ? readJson(newsFile) : null;

  if (!round) fail("ROUND_FILE_MISSING", `Canonical round file not found: ${roundFile}`);
  if (!news) fail("NEWS_FILE_MISSING", `Canonical news file not found: ${newsFile}`);

  validateNormalizedRound(round).forEach((m) => fail("NORMALIZED_SCHEMA", m));
  validateIdentity(scenario, state, round, news, expectedRound);
  validateMetricSchema(scenario, state, round);
  validateRoundEvents(round, news);
  validateRunningTotals(round);
  validateFinancials(round, state);
  validateMilitaryConservation(state);
  validateLandArea(state, scenario);
  validatePropertyLedger(state, scenario);
  validateHistoricalSchemaAndCommit();
  validateNextRoundGate(state);
  validateInformationBoundaries(round);
  validateHistoricalScriptGuard(round);
  validateEndOfRoundChecks(round, scenario);
  validateGitCommitState(round, scenario);
  validateChronology(scenario);
  validateNoFuturePointer(round, scenario);

  console.log("Chronicle Memory / GMV validation");
  console.log("================================");
  console.log(`Canonical round: ${scenario && scenario.latest_round}`);
  console.log(`Canonical date:  ${scenario && scenario.latest_date}`);
  console.log(`Round files:      ${discoverRounds().length}`);
  console.log("End-of-round gates: special-event/magnitude-11 + committed-clean-tree");

  if (warnings.length) {
    console.log("\nWARNINGS:");
    for (const w of warnings) console.log(`- [${w.code}] ${w.message}`);
  }

  if (errors.length) {
    console.error("\nFAILED:");
    for (const e of errors) console.error(`- [${e.code}] ${e.message}`);
    process.exitCode = 1;
  } else {
    console.log("\nPASSED: canonical identity, chronology, event/news parity, metric scales, ledgers, financial reconciliation, land-area consistency, and core README invariants.");
  }
}

main();
