import type { CliopatriaFeature } from "../lib/cliopatria";

export type HistoricalPolityGeometry = {
  id: string;
  name: string;
  fromYear: number;
  toYear: number;
  areaKm2?: number;
  type?: string;
  memberOf?: string;
  wikidataId?: string;
  seshatId?: string;
  geometry: GeoJSON.Geometry | null;
  bbox?: [number, number, number, number];
  properties: Record<string, unknown>;
};

export function normalizeCliopatriaFeature(feature: CliopatriaFeature): HistoricalPolityGeometry {
  const p = feature.properties ?? {};
  return {
    id: String(feature.id ?? ""),
    name: String(p.Name ?? p.name ?? ""),
    fromYear: Number(p.FromYear ?? p.fromYear ?? -3400),
    toYear: Number(p.ToYear ?? p.toYear ?? 2024),
    areaKm2: Number.isFinite(Number(p.Area)) ? Number(p.Area) : undefined,
    type: p.Type ? String(p.Type) : undefined,
    memberOf: p.MemberOf ? String(p.MemberOf) : undefined,
    wikidataId: p.WikidataID ? String(p.WikidataID) : p.Wikidata ? String(p.Wikidata) : undefined,
    seshatId: p.SeshatID ? String(p.SeshatID) : undefined,
    geometry: feature.geometry,
    bbox: feature.bbox,
    properties: p,
  };
}

export async function getHistoricalPolitiesAtYear(year: number) {
  const { queryCliopatriaYear } = await import("../lib/cliopatria");
  return (await queryCliopatriaYear(year)).map(normalizeCliopatriaFeature);
}

export async function getHistoricalPolitiesAtPoint(year: number, lon: number, lat: number) {
  const { queryCliopatriaPoint } = await import("../lib/cliopatria");
  return (await queryCliopatriaPoint(year, lon, lat)).map(normalizeCliopatriaFeature);
}

export async function getHistoricalPolitiesInArea(year: number, bbox: [number, number, number, number]) {
  const { queryCliopatriaArea } = await import("../lib/cliopatria");
  return (await queryCliopatriaArea(year, bbox)).map(normalizeCliopatriaFeature);
}
