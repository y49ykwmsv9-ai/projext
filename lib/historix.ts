import type { HistoricalRecord, HistoricalRecordKind } from "./historical-records";

export type HistorixDomain = "events" | "places" | "people" | "relations" | "observations" | "polities";

export type HistorixGraph = {
  database: "HISTORIX";
  version: string;
  generated_at: string;
  source: string;
  record_counts: Record<string, number>;
  events: HistoricalRecord[];
  places: HistoricalRecord[];
  people: HistoricalRecord[];
  relations: Array<{ id:string; from_type:HistoricalRecordKind; from_id:string; relation:string; to_type:"polity"; to_id:string; source:string }>;
};

export type HistorixEventEnrichment = {
  id: string;
  identity: { canonical_name: string; alternate_names: string[]; event_type: string; subtype: string };
  chronology: { start: number; end: number | null; date_label: string | null; date_precision: string; is_approximate: boolean; uncertainty_years: number | null };
  geography: { region: string; place_ids: string[]; polity_ids: string[]; extent_note: string | null };
  participants: Array<{ id: string; kind: string; role: string }>;
  context: { causes: string[]; triggers: string[]; preceding_event_ids: string[]; background: string | null };
  narrative: { summary: string; phases: Array<{ label: string; description: string; start?: number | null; end?: number | null }>; turning_points: string[] };
  consequences: { political: string[]; territorial: string[]; demographic: string[]; economic: string[]; military: string[]; cultural: string[] };
  quantitative: Array<{ metric: string; value?: number | null; lower?: number | null; upper?: number | null; unit?: string | null; status: string; source_ids?: string[]; notes?: string | null }>;
  evidence: { claims: Array<{ claim: string; source_ids: string[]; confidence: string; notes?: string | null }>; primary_source_ids: string[]; secondary_source_ids: string[] };
  uncertainty: { confidence: string; disputes: string[]; unknowns: string[] };
  graph: { preceding_event_ids: string[]; following_event_ids: string[]; related_place_ids: string[]; related_person_ids: string[]; related_polity_ids: string[] };
  editorial: { status: string; missing_fields: string[]; last_reviewed: string | null; editor_notes: string | null };
};


export type HistorixPlace = {
  id: string;
  identity: { canonical_name: string; alternate_names: string[]; place_type: string; wikidata_id: string | null };
  chronology: { start: number | null; end: number | null; date_precision: string };
  geography: { latitude: number | null; longitude: number | null; country_ids: string[]; region_ids: string[]; admin_parent_ids: string[] };
  hierarchy: { parent_place_ids: string[]; child_place_ids: string[] };
  associations: { polity_ids: string[]; event_ids: string[]; person_ids: string[] };
  evidence: { source_ids: string[]; confidence: string; source_links: string[] };
  uncertainty: { unknowns: string[]; disputes: string[] };
  editorial: { status: string; last_reviewed: string | null; notes: string | null };
};

let placePromise: Promise<HistorixPlace[]>|undefined;
export function loadHistorixPlaces(): Promise<HistorixPlace[]> {
  placePromise ??= fetch("/data/history-library/places/historix-places.json").then(async r => {
    if(!r.ok) throw new Error("HISTORIX 1.5 place layer unavailable ("+r.status+")");
    const payload=await r.json() as { records: HistorixPlace[] };
    return payload.records;
  });
  return placePromise;
}

export async function getHistorixPlace(id:string) {
  const rows=await loadHistorixPlaces();
  return rows.find(row=>row.id===id);
}

export async function searchHistorixPlaces(query:string, year?:number) {
  const rows=await loadHistorixPlaces();
  const q=query.trim().toLocaleLowerCase();
  return rows.filter(row => {
    const text=[row.identity.canonical_name,...row.identity.alternate_names,row.identity.place_type].join(" ").toLocaleLowerCase();
    if(q && !text.includes(q)) return false;
    if(year===undefined) return true;
    const start=row.chronology.start ?? -Infinity;
    const end=row.chronology.end ?? Infinity;
    return start<=year && year<=end;
  });
}

export type HistorixPolity = {
  id: string;
  identity: { canonical_name: string; alternate_names: string[]; polity_type: string };
  chronology: { start: number | null; end: number | null; date_precision: string };
  geography: { regions: string[]; capital_place_ids: string[]; territorial_notes: string[] };
  status: { historix_reference_count: number; cliopatria_link: string };
  predecessors: string[]; successors: string[]; rulers: string[];
  associated_event_ids: string[]; associated_person_ids: string[]; associated_place_ids: string[];
  source_links: string[];
  evidence: { source_ids: string[]; confidence: string };
  uncertainty: { unknowns: string[]; disputes: string[] };
  editorial: { status: string; last_reviewed: string | null; notes: string | null };
};

let polityPromise: Promise<HistorixPolity[]>|undefined;
export function loadHistorixPolities(): Promise<HistorixPolity[]> {
  polityPromise ??= fetch("/data/history-library/polities/historix-linked.json").then(async r => {
    if(!r.ok) throw new Error("HISTORIX 1.4 polity layer unavailable ("+r.status+")");
    const payload=await r.json() as { records: HistorixPolity[] };
    return payload.records;
  });
  return polityPromise;
}

export async function getHistorixPolity(id:string) {
  const rows=await loadHistorixPolities();
  return rows.find(row=>row.id===id);
}

export type HistorixObservation = {
  entity_id: string;
  metric: string;
  year: number;
  value: number;
  lower?: number;
  upper?: number;
  unit: string;
  currency_basis?: string;
  confidence: "high"|"medium"|"low"|"unknown";
  source_ids: string[];
  source_record_id: string;
  notes?: string;
};

const BASE="/data/history-library";
let graphPromise: Promise<HistorixGraph>|undefined;
const observationCache = new Map<string, Promise<HistorixObservation[]>>();

let eventEnrichmentPromise: Promise<HistorixEventEnrichment[]>|undefined;

export function loadHistorixEventEnrichments(): Promise<HistorixEventEnrichment[]> {
  eventEnrichmentPromise ??= fetch("/data/history-library/enrichment/events.json").then(async r => {
    if(!r.ok) throw new Error("HISTORIX 1.3 event enrichments unavailable ("+r.status+")");
    const payload=await r.json() as { records: HistorixEventEnrichment[] };
    return payload.records;
  });
  return eventEnrichmentPromise;
}

export async function getHistorixEventEnrichment(id:string) {
  const rows=await loadHistorixEventEnrichments();
  return rows.find(row=>row.id===id);
}

export function loadHistorixGraph(): Promise<HistorixGraph> {
  graphPromise ??= fetch(`${BASE}/graph/curated-records.json`).then(async r => {
    if(!r.ok) throw new Error(`HISTORIX graph unavailable (${r.status})`);
    return await r.json() as HistorixGraph;
  });
  return graphPromise;
}

export async function queryHistorix(kind: HistoricalRecordKind, query: string, year?: number): Promise<HistoricalRecord[]> {
  const graph=await loadHistorixGraph();
  const records=kind==="event"?graph.events:kind==="place"?graph.places:graph.people;
  const q=query.trim().toLocaleLowerCase();
  return records.filter(record=>{
    const text=`${record.name} ${record.description} ${record.region} ${record.tags.join(" ")}`.toLocaleLowerCase();
    if(!text.includes(q)) return false;
    if(year===undefined) return true;
    const start=record.start??-Infinity, end=record.end??start;
    return start<=year && year<=end;
  });
}

export async function getHistorixRecord(kind: HistoricalRecordKind,id:string) {
  const graph=await loadHistorixGraph();
  const records=kind==="event"?graph.events:kind==="place"?graph.places:graph.people;
  return records.find(record=>record.id===id);
}

export async function getHistorixRelations(recordId:string) {
  const graph=await loadHistorixGraph();
  return graph.relations.filter(r=>r.from_id===recordId);
}

export async function loadHistorixObservations(entityId:string, metric?:string):Promise<HistorixObservation[]> {
  const key=entityId;
  let promise=observationCache.get(key);
  if(!promise) {
    promise=fetch(`${BASE}/observations/${encodeURIComponent(entityId)}.json`).then(async r=>{
      if(!r.ok) {
        if(r.status===404) return [];
        throw new Error(`HISTORIX observations unavailable (${r.status})`);
      }
      return await r.json() as HistorixObservation[];
    });
    observationCache.set(key,promise);
  }
  const rows=await promise;
  return metric ? rows.filter(row=>row.metric===metric) : rows;
}

export async function queryHistorixObservations(metric:string,year?:number,entityId?:string):Promise<HistorixObservation[]> {
  const ids=entityId ? [entityId] : [];
  if(!ids.length) return [];
  const rows=(await Promise.all(ids.map(id=>loadHistorixObservations(id,metric)))).flat();
  return year===undefined ? rows : rows.filter(row=>row.year===year);
}

export function clearHistorixCache() {
  graphPromise=undefined;
  observationCache.clear();
  polityPromise=undefined;
  placePromise=undefined;
}