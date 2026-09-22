import { loadReconquistaAtlas } from './cliopatria-plus.mjs';

export function createAtlasAnimationEngine({ atlas = loadReconquistaAtlas(), mapBounds, viewport }) {
  const [minLon, minLat, maxLon, maxLat] = mapBounds;
  const { width, height, pad = 0 } = viewport;

  const project = ([lon, lat]) => {
    const x = pad + ((lon - minLon) / (maxLon - minLon)) * (width - pad * 2);
    const y = height - pad - ((lat - minLat) / (maxLat - minLat)) * (height - pad * 2);
    return [x, y];
  };

  const entity = (id) => {
    const value = atlas.entities.get(id);
    if (!value) throw new Error(`Atlas entity not found: ${id}`);
    return value;
  };

  const place = (id) => {
    const value = entity(id);
    if (value.geometry?.type !== 'Point') throw new Error(`Atlas entity ${id} is not a point place`);
    return { ...value, pixel: project(value.geometry.coordinates) };
  };

  const route = (routeId) => {
    const r = entity(routeId);
    if (r.type && r.type !== 'route') throw new Error(`Atlas entity ${routeId} is not a route`);
    const places = (r.points ?? []).map(([placeId]) => place(placeId));
    return { ...r, places, pixels: places.map(p => p.pixel) };
  };

  const event = (eventId) => {
    const e = entity(eventId);
    const location = e.placeId ? place(e.placeId) : null;
    return { ...e, location };
  };

  const leader = (personId) => {
    const p = entity(personId);
    return p;
  };

  const resolveAnimation = (track) => {
    switch (track.type) {
      case 'route-draw':
      case 'sprite-route':
        return route(track.routeId);
      case 'event-pulse':
      case 'event-card':
        return event(track.eventId);
      case 'leader-marker':
        return leader(track.personId);
      case 'place-labels':
        return (track.placeIds ?? []).map(place);
      default:
        return track;
    }
  };

  return { atlas, project, entity, place, route, event, leader, resolveAnimation };
}
