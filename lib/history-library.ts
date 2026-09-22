export type HistoryResourceType =
  | "polity"
  | "event"
  | "person"
  | "place"
  | "observation"
  | "relation";

export interface HistoryCatalog {
  schema_version: string;
  generated_at: string;
  polity_count?: number;
  lookup?: Record<string, string>;
  resource_roots?: Record<string, string>;
}

const CATALOG_URL = "/data/history-library/catalog.json";

let catalogPromise: Promise<HistoryCatalog> | null = null;

async function catalog(): Promise<HistoryCatalog> {
  if (!catalogPromise) {
    catalogPromise = fetch(CATALOG_URL).then(async (response) => {
      if (!response.ok) throw new Error(`History catalog failed: ${response.status}`);
      return response.json() as Promise<HistoryCatalog>;
    });
  }
  return catalogPromise;
}

/**
 * Lazy-load one historical resource. The application never needs to import
 * the entire historical library just to start a simulation.
 */
export async function getHistoryResource<T = unknown>(
  type: HistoryResourceType,
  id: string,
): Promise<T> {
  const safeId = id.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const root = `/data/history-library/${type}s/`;
  const response = await fetch(`${root}${safeId}.json`);
  if (!response.ok) {
    throw new Error(`Historical resource not found: ${type}/${safeId}`);
  }
  return response.json() as Promise<T>;
}

export async function getPolity<T = unknown>(id: string): Promise<T> {
  return getHistoryResource<T>("polity", id);
}

export async function getHistoryCatalog(): Promise<HistoryCatalog> {
  return catalog();
}
