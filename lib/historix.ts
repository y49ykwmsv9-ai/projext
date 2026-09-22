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
  relations: Array<{
    id: string;
    from_type: HistoricalRecordKind;
    from_id: string;
    relation: string;
    to_type: "polity";
    to_id: string;
    source: string;
  }>;
};

const BASE = "/data/history-library";

let graphPromise: Promise<HistorixGraph> | undefined;

export function loadHistorixGraph(): Promise<HistorixGraph> {
  graphPromise ??= fetch(`${BASE}/graph/curated-records.json`).then(async (response) => {
    if (!response.ok) throw new Error(`HISTORIX graph unavailable (${response.status})`);
    return await response.json() as HistorixGraph;
  });
  return graphPromise;
}

export async function queryHistorix(
  kind: HistoricalRecordKind,
  query: string,
  year?: number,
): Promise<HistoricalRecord[]> {
  const graph = await loadHistorixGraph();
  const records = kind === "event" ? graph.events : kind === "place" ? graph.places : graph.people;
  const q = query.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const text = `${record.name} ${record.description} ${record.region} ${record.tags.join(" ")}`.toLocaleLowerCase();
    if (!text.includes(q)) return false;
    if (year === undefined) return true;
    const start = record.start ?? -Infinity;
    const end = record.end ?? start;
    return start <= year && year <= end;
  });
}

export async function getHistorixRecord(kind: HistoricalRecordKind, id: string) {
  const graph = await loadHistorixGraph();
  const records = kind === "event" ? graph.events : kind === "place" ? graph.places : graph.people;
  return records.find((record) => record.id === id);
}

export async function getHistorixRelations(recordId: string) {
  const graph = await loadHistorixGraph();
  return graph.relations.filter((relation) => relation.from_id === recordId);
}

export function clearHistorixGraphCache() {
  graphPromise = undefined;
}
