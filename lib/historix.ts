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
}