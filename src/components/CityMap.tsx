import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Plus, Minus, Locate, Navigation, Footprints, Car, X } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import {
  ARKALYK_CENTER,
  mapMarkers,
  distanceTargets,
  buildingFootprints,
  roadNodes,
  roadEdges,
  trafficNodes,
} from '@/data';
import type { MapMarker, MarkerCategory, RoadEdge, BuildingFootprint } from '@/types';

const cartoKey = import.meta.env.VITE_CARTO_API_KEY as string | undefined;
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

interface CityMapProps {
  activeFilters: Set<string>;
  searchQuery: string;
  flyToId: string | null;
  distanceTarget: string | null;
  onMarkerClick: (marker: MapMarker) => void;
  visibleLayers: Set<MarkerCategory>;
  navRouteTarget: MapMarker | null;
  showTrafficNodes: boolean;
}

const categoryConfig: Record<MarkerCategory, { color: string; glow: string; labelKk: string; labelRu: string }> = {
  education: { color: '#4f46e5', glow: 'rgba(79,70,229,0.35)', labelKk: 'Білім', labelRu: 'Образование' },
  government: { color: '#475569', glow: 'rgba(71,85,105,0.35)', labelKk: 'Үкімет', labelRu: 'Госуслуги' },
  school: { color: '#4f46e5', glow: 'rgba(79,70,229,0.35)', labelKk: 'Мектеп', labelRu: 'Школа' },
  transport: { color: '#10b981', glow: 'rgba(16,185,129,0.35)', labelKk: 'Көлік', labelRu: 'Транспорт' },
  health: { color: '#f43f5e', glow: 'rgba(244,63,94,0.35)', labelKk: 'Денсаулық', labelRu: 'Здоровье' },
  commerce: { color: '#f59e0b', glow: 'rgba(245,158,11,0.35)', labelKk: 'Сауда', labelRu: 'Торговля' },
  justice: { color: '#1e3a5f', glow: 'rgba(30,58,95,0.35)', labelKk: 'Әділет', labelRu: 'Правосудие' },
  busStop: { color: '#059669', glow: 'rgba(5,150,105,0.30)', labelKk: 'Аялдама', labelRu: 'Остановка' },
  religion: { color: '#0d9488', glow: 'rgba(13,148,136,0.35)', labelKk: 'Дін', labelRu: 'Религия' },
};

function getIconSvg(category: string): string {
  switch (category) {
    case 'education':
      return '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>';
    case 'government':
      return '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5"/>';
    case 'school':
      return '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>';
    case 'transport':
      return '<rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M8 19v2M16 19v2"/>';
    case 'health':
      return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>';
    case 'commerce':
      return '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>';
    case 'justice':
      return '<path d="M12 3v18M3 6h18M6 6l-3 6a3 3 0 0 0 6 0L6 6zM18 6l-3 6a3 3 0 0 0 6 0l-3-6zM9 21h6"/>';
    case 'busStop':
      return '<circle cx="12" cy="9" r="3"/><path d="M4.5 16a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M14.5 16a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M3 13h18"/>';
    case 'religion':
      return '<path d="M12 2v8M8 6h8M10 10v12M14 10v12M6 22h12"/>';
    default:
      return '<rect x="4" y="2" width="16" height="20" rx="2"/>';
  }
}

function createMarkerIcon(marker: MapMarker, zoom: number): L.DivIcon {
  const cfg = categoryConfig[marker.category];
  const isBusStop = marker.category === 'busStop';
  const isDetailed = zoom >= 17;
  const size = isBusStop ? (isDetailed ? 24 : 18) : (isDetailed ? 40 : 30);
  const showLabel = zoom >= 15;

  const labelHtml = `<div class="map-marker-label ${showLabel ? '' : 'hidden-label'}">${marker.name.kk}</div>`;

  const html = `
    <div class="map-marker-wrap" style="--mc: ${cfg.color}; --mg: ${cfg.glow};">
      <div class="map-marker-pin ${isDetailed ? 'detailed' : ''}" style="width:${size}px;height:${size}px;">
        <svg viewBox="0 0 24 24" width="${size * 0.5}" height="${size * 0.5}" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${getIconSvg(marker.category)}
        </svg>
      </div>
      ${labelHtml}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [size, size + 18],
    iconAnchor: [size / 2, size / 2 + 8],
    popupAnchor: [0, -size / 2],
  });
}

function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    html: '<div class="user-location-wrap"><div class="user-location-halo"></div><div class="user-location-dot"></div></div>',
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function createTrafficLightIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div class="traffic-node-icon traffic-light-icon">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round">
        <rect x="8" y="2" width="8" height="20" rx="3" fill="#1e293b" stroke="#dc2626"/>
        <circle cx="12" cy="7" r="1.5" fill="#ef4444"/>
        <circle cx="12" cy="12" r="1.5" fill="#eab308"/>
        <circle cx="12" cy="17" r="1.5" fill="#22c55e"/>
      </svg>
    </div>`,
    className: 'traffic-node-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createCrosswalkIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div class="traffic-node-icon crosswalk-icon">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0891b2" stroke-width="2" stroke-linecap="round">
        <path d="M5 4v16M9 4v16M13 4v16M17 4v16M3 8h18M3 16h18" stroke="#0891b2"/>
      </svg>
    </div>`,
    className: 'traffic-node-marker',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nodeKm(i: number, j: number): number {
  return haversineKm(roadNodes[i][0], roadNodes[i][1], roadNodes[j][0], roadNodes[j][1]);
}

// --- Building collision geometry ---
// Check if a line segment between two lat/lng points intersects any edge of a polygon
function segmentsIntersect(
  a1: [number, number], a2: [number, number],
  b1: [number, number], b2: [number, number]
): boolean {
  const d = (ax: number, ay: number, bx: number, by: number) => ax * by - ay * bx;
  const r1 = d(a2[0] - a1[0], a2[1] - a1[1], b1[0] - a1[0], b1[1] - a1[1]);
  const r2 = d(a2[0] - a1[0], a2[1] - a1[1], b2[0] - a1[0], b2[1] - a1[1]);
  const r3 = d(b2[0] - b1[0], b2[1] - b1[1], a1[0] - b1[0], a1[1] - b1[1]);
  const r4 = d(b2[0] - b1[0], b2[1] - b1[1], a2[0] - b1[0], a2[1] - b1[1]);
  return (r1 * r2 < 0) && (r3 * r4 < 0);
}

function lineIntersectsPolygon(
  p1: [number, number], p2: [number, number],
  polygon: [number, number][]
): boolean {
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    if (segmentsIntersect(p1, p2, polygon[i], polygon[next])) return true;
  }
  return false;
}

function isInsidePolygon(pt: [number, number], polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check if a route segment between two road nodes passes through any building
function segmentCrossesBuilding(a: [number, number], b: [number, number], buildings: BuildingFootprint[]): boolean {
  for (const bld of buildings) {
    if (lineIntersectsPolygon(a, b, bld.footprint)) return true;
    if (isInsidePolygon(a, bld.footprint) || isInsidePolygon(b, bld.footprint)) return true;
  }
  return false;
}

function findNearestNode(pt: [number, number]): number {
  let minDist = Infinity;
  let nearestIdx = 0;
  roadNodes.forEach((node, i) => {
    // Skip nodes that are inside a building polygon — route must stay on streets
    if (buildingFootprints.some((bld) => isInsidePolygon(node, bld.footprint))) return;
    const d = (node[0] - pt[0]) ** 2 + (node[1] - pt[1]) ** 2;
    if (d < minDist) { minDist = d; nearestIdx = i; }
  });
  return nearestIdx;
}

function findNearestNodeOutsideBuildings(pt: [number, number]): number {
  // Find nearest road node that is NOT inside any building polygon
  let minDist = Infinity;
  let nearestIdx = 0;
  roadNodes.forEach((node, i) => {
    if (buildingFootprints.some((bld) => isInsidePolygon(node, bld.footprint))) return;
    const d = (node[0] - pt[0]) ** 2 + (node[1] - pt[1]) ** 2;
    if (d < minDist) { minDist = d; nearestIdx = i; }
  });
  return nearestIdx;
}

function buildAdjacencyList(mode: 'walk' | 'drive'): Map<number, { node: number; dist: number; type: RoadEdge['type'] }[]> {
  const adj = new Map<number, { node: number; dist: number; type: RoadEdge['type'] }[]>();
  for (let i = 0; i < roadNodes.length; i++) adj.set(i, []);

  for (const edge of roadEdges) {
    const d = nodeKm(edge.from, edge.to);
    if (mode === 'walk' || edge.type === 'road') {
      // Building collision check: discard any edge that cuts through a building polygon
      const a = roadNodes[edge.from];
      const b = roadNodes[edge.to];
      if (segmentCrossesBuilding(a, b, buildingFootprints)) continue;

      adj.get(edge.from)!.push({ node: edge.to, dist: d, type: edge.type });
      adj.get(edge.to)!.push({ node: edge.from, dist: d, type: edge.type });
    }
  }
  return adj;
}

function dijkstra(startIdx: number, endIdx: number, mode: 'walk' | 'drive'): number[] {
  const adj = buildAdjacencyList(mode);
  const dist = new Array(roadNodes.length).fill(Infinity);
  const prev = new Array(roadNodes.length).fill(-1);
  const visited = new Set<number>();
  dist[startIdx] = 0;

  for (let iter = 0; iter < roadNodes.length; iter++) {
    let u = -1;
    let minD = Infinity;
    for (let i = 0; i < dist.length; i++) {
      if (!visited.has(i) && dist[i] < minD) { minD = dist[i]; u = i; }
    }
    if (u === -1 || u === endIdx) break;
    visited.add(u);

    const neighbors = adj.get(u) || [];
    for (const { node: v, dist: d } of neighbors) {
      if (visited.has(v)) continue;
      // Walking on roads has a small penalty (prefer pedestrian paths)
      const penalty = mode === 'walk' ? 1.15 : 1.0;
      const alt = dist[u] + d * penalty;
      if (alt < dist[v]) { dist[v] = alt; prev[v] = u; }
    }
  }

  // Reconstruct path
  const path: number[] = [];
  let curr = endIdx;
  while (curr !== -1) { path.unshift(curr); curr = prev[curr]; }
  if (path[0] !== startIdx) return [startIdx, endIdx];
  return path;
}

function buildRoute(start: [number, number], end: [number, number], mode: 'walk' | 'drive'): { pts: [number, number][]; distKm: number; turns: number } {
  const startIdx = findNearestNodeOutsideBuildings(start);
  const endIdx = findNearestNodeOutsideBuildings(end);
  const nodePath = dijkstra(startIdx, endIdx, mode);

  // Snap route start/end to the road node positions (not the raw marker position)
  // so the final polyline connects cleanly to the street network
  const startNode = roadNodes[startIdx];
  const endNode = roadNodes[endIdx];

  const pts: [number, number][] = [start, startNode];
  for (let i = 1; i < nodePath.length; i++) pts.push(roadNodes[nodePath[i]]);
  pts.push(endNode, end);

  // Filter out any consecutive duplicate points
  const cleanPts: [number, number][] = [];
  for (const p of pts) {
    const last = cleanPts[cleanPts.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) cleanPts.push(p);
  }

  let distKm = 0;
  for (let i = 1; i < cleanPts.length; i++) {
    distKm += haversineKm(cleanPts[i - 1][0], cleanPts[i - 1][1], cleanPts[i][0], cleanPts[i][1]);
  }

  return { pts: cleanPts, distKm, turns: Math.max(0, nodePath.length - 1) };
}

function formatDistance(km: number, lang: 'kk' | 'ru'): string {
  if (km < 1) return `${Math.round(km * 1000)} ${lang === 'kk' ? 'м' : 'м'}`;
  return `${km.toFixed(2)} км`;
}

export default function CityMap({ activeFilters, searchQuery, flyToId, distanceTarget, onMarkerClick, visibleLayers, navRouteTarget, showTrafficNodes }: CityMapProps) {
  const { lang, t, theme } = useLang();
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const buildingsRef = useRef<L.Layer[]>([]);
  const trafficLayersRef = useRef<L.Marker[]>([]);
  const userLocationRef = useRef<L.Marker | null>(null);
  const navRouteRef = useRef<L.Polyline | null>(null);
  const navOutlineRef = useRef<L.Polyline | null>(null);
  const navStartRef = useRef<L.CircleMarker | null>(null);
  const navEndRef = useRef<L.CircleMarker | null>(null);
  const flyToIdRef = useRef<string | null>(null);
  const activeFiltersRef = useRef<Set<string>>(activeFilters);
  const searchQueryRef = useRef<string>(searchQuery);
  const langRef = useRef(lang);
  const onMarkerClickRef = useRef(onMarkerClick);
  const visibleLayersRef = useRef<Set<MarkerCategory>>(visibleLayers);
  const showTrafficRef = useRef(showTrafficNodes);
  const userPosRef = useRef<[number, number] | null>(null);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [routeMode, setRouteMode] = useState<'walk' | 'drive'>('drive');
  const [routeInfo, setRouteInfo] = useState<{ distKm: number; walkMin: number; driveMin: number; turns: number } | null>(null);
  const routeModeRef = useRef(routeMode);

  flyToIdRef.current = flyToId;
  activeFiltersRef.current = activeFilters;
  searchQueryRef.current = searchQuery;
  langRef.current = lang;
  onMarkerClickRef.current = onMarkerClick;
  visibleLayersRef.current = visibleLayers;
  showTrafficRef.current = showTrafficNodes;
  routeModeRef.current = routeMode;

  useEffect(() => {
    if (!leafletMap) return;
    const map = leafletMap;
    mapRef.current = map;

    const initialZoom = map.getZoom();
    mapMarkers.forEach((marker) => {
      const icon = createMarkerIcon(marker, initialZoom);
      const lm = L.marker([marker.lat, marker.lng], { icon, zIndexOffset: initialZoom >= 17 ? 1000 : 500 });
      lm.on('click', () => onMarkerClickRef.current(marker));
      lm.addTo(map);
      markersRef.current.set(marker.id, lm);
    });

    map.on('zoomend', () => {
      const zoom = map.getZoom();
      markersRef.current.forEach((lm, id) => {
        const marker = mapMarkers.find((m) => m.id === id);
        if (!marker) return;
        lm.setIcon(createMarkerIcon(marker, zoom));
        lm.setZIndexOffset(zoom >= 17 ? 1000 : 500);
      });
      updateBuildings(zoom);
      updateMarkerVisibility();
    });

    updateMarkerVisibility();
    updateTrafficNodes();

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
      map.setView([50.2486, 66.9114], 15);
    }, 100);

    return () => {
      clearTimeout(resizeTimer);
      map.off('zoomend');
      markersRef.current.forEach((lm) => lm.remove());
      markersRef.current.clear();
      buildingsRef.current = [];
      trafficLayersRef.current = [];
      navRouteRef.current = null;
      navOutlineRef.current = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletMap]);

  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => mapRef.current?.invalidateSize(), 200);
  }, [theme]);

  useEffect(() => {
    updateTrafficNodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTrafficNodes]);

  function updateTrafficNodes() {
    const map = mapRef.current;
    if (!map) return;

    trafficLayersRef.current.forEach((m) => map.removeLayer(m));
    trafficLayersRef.current = [];

    if (!showTrafficRef.current) return;

    trafficNodes.forEach((node) => {
      const icon = node.type === 'trafficLight' ? createTrafficLightIcon() : createCrosswalkIcon();
      const m = L.marker([node.lat, node.lng], { icon, interactive: false, zIndexOffset: 800 });
      m.addTo(map);
      trafficLayersRef.current.push(m);
    });
  }

  function updateBuildings(zoom: number) {
    const map = mapRef.current;
    if (!map) return;

    buildingsRef.current.forEach((l) => map.removeLayer(l));
    buildingsRef.current = [];

    if (zoom < 15) return;

    const isDark = document.documentElement.classList.contains('dark');

    buildingFootprints.forEach((bld) => {
      const pts: L.LatLngExpression[] = bld.footprint;
      const outline = L.polygon(pts, {
        color: '#475569',
        weight: 1,
        opacity: 0.8,
        fillColor: bld.color,
        fillOpacity: isDark ? 0.06 : 0.04,
        className: 'building-flat-outline',
      });
      outline.addTo(map);
      buildingsRef.current.push(outline);

      if (bld.zones && bld.zones.length > 0) {
        outline.on('click', (e: L.LeafletMouseEvent) => {
          const currentLang = langRef.current;
          const isDarkClick = document.documentElement.classList.contains('dark');
          const textColor = isDarkClick ? '#f1f5f9' : '#1e293b';
          const subColor = isDarkClick ? '#a1a1aa' : '#64748b';
          const zoneLabel = currentLang === 'kk' ? 'Ішкі аймақтар' : 'Внутренние зоны';
          const zoneList = bld.zones!.map((z) => `• ${currentLang === 'kk' ? z.nameKk : z.nameRu}`).join('<br>');

          L.popup({ className: 'building-zone-popup', maxWidth: 250 })
            .setLatLng(e.latlng)
            .setContent(
              `<div style="font-family:Inter,system-ui,sans-serif;">
                <div style="font-weight:700;font-size:13px;color:${textColor};margin-bottom:2px;">${bld.name[currentLang]}</div>
                <div style="font-size:10px;color:${subColor};margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">${zoneLabel}</div>
                <div style="font-size:11px;color:${textColor};line-height:1.6;">${zoneList}</div>
              </div>`
            )
            .openOn(map);
        });
      }
    });
  }

  function updateMarkerVisibility() {
    const filters = activeFiltersRef.current;
    const query = searchQueryRef.current.toLowerCase().trim();
    const layers = visibleLayersRef.current;

    markersRef.current.forEach((lm, id) => {
      const marker = mapMarkers.find((m) => m.id === id);
      if (!marker) return;

      const passesLayer = layers.has(marker.category);
      const passesFilter = filters.size === 0 || filters.has(marker.category);
      const passesSearch =
        !query ||
        marker.name.kk.toLowerCase().includes(query) ||
        marker.name.ru.toLowerCase().includes(query) ||
        marker.description.kk.toLowerCase().includes(query) ||
        marker.description.ru.toLowerCase().includes(query);

      if (passesLayer && passesFilter && passesSearch) {
        if (!mapRef.current?.hasLayer(lm)) lm.addTo(mapRef.current!);
      } else {
        if (mapRef.current?.hasLayer(lm)) mapRef.current.removeLayer(lm);
      }
    });

    if (mapRef.current) updateBuildings(mapRef.current.getZoom());
  }

  useEffect(() => {
    updateMarkerVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters, searchQuery, lang, visibleLayers]);

  useEffect(() => {
    if (!flyToId || !mapRef.current) return;
    const marker = mapMarkers.find((m) => m.id === flyToId);
    if (!marker) return;
    const lm = markersRef.current.get(flyToId);
    if (!lm) return;

    mapRef.current.flyTo([marker.lat, marker.lng], 17, { duration: 1.2 });
    setTimeout(() => {
      const currentLang = langRef.current;
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#f1f5f9' : '#1e293b';
      const subColor = isDark ? '#a1a1aa' : '#64748b';
      const btnBg = isDark ? '#1e3a5f' : '#2563eb';
      const routeLabel = currentLang === 'kk' ? 'Маршрут салу' : 'Построить маршрут';
      const fromLabel = currentLang === 'kk' ? 'Орталықтан' : 'От центра';

      lm.bindPopup(
        `<div style="font-family:Inter,system-ui,sans-serif;min-width:200px;">
          <div style="font-weight:700;font-size:13px;color:${textColor};margin-bottom:3px;">${marker.name[currentLang]}</div>
          <div style="font-size:12px;color:${subColor};margin-bottom:8px;">${marker.description[currentLang]}</div>
          <button id="nav-btn-${marker.id}" style="
            display:flex;align-items:center;gap:6px;
            background:${btnBg};color:#ffffff;
            border:none;border-radius:8px;
            padding:6px 12px;font-size:11px;font-weight:600;
            cursor:pointer;width:100%;justify-content:center;
          ">${routeLabel} (${fromLabel})</button>
        </div>`
      ).openPopup();

      setTimeout(() => {
        const btn = document.getElementById(`nav-btn-${marker.id}`);
        if (btn) btn.onclick = () => drawNavRoute(marker);
      }, 100);
    }, 1300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToId]);

  useEffect(() => {
    if (!navRouteTarget) return;
    drawNavRoute(navRouteTarget);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navRouteTarget]);

  function clearNavRoute() {
    const map = mapRef.current;
    if (!map) return;
    if (navRouteRef.current) { map.removeLayer(navRouteRef.current); navRouteRef.current = null; }
    if (navOutlineRef.current) { map.removeLayer(navOutlineRef.current); navOutlineRef.current = null; }
    if (navStartRef.current) { map.removeLayer(navStartRef.current); navStartRef.current = null; }
    if (navEndRef.current) { map.removeLayer(navEndRef.current); navEndRef.current = null; }
    setRouteInfo(null);
  }

  function drawNavRoute(targetMarker: MapMarker) {
    const map = mapRef.current;
    if (!map) return;

    clearNavRoute();

    const start: [number, number] = userPosRef.current ?? ARKALYK_CENTER;
    const end: [number, number] = [targetMarker.lat, targetMarker.lng];
    const mode = routeModeRef.current;

    const { pts, distKm, turns } = buildRoute(start, end, mode);
    const walkMin = Math.round((distKm / 5) * 60);
    const driveMin = Math.round((distKm / 40) * 60);
    setRouteInfo({ distKm, walkMin, driveMin, turns });

    // Outline
    const outline = L.polyline(pts, {
      color: mode === 'walk' ? '#0891b2' : '#3b82f6',
      weight: 8, opacity: 0.2, className: 'nav-route-line',
    });
    outline.addTo(map);
    navOutlineRef.current = outline;

    // Main route
    const route = L.polyline(pts, {
      color: mode === 'walk' ? '#0891b2' : '#3b82f6',
      weight: 4, opacity: 0.85, dashArray: mode === 'walk' ? '4, 4' : '8, 6', className: 'nav-route-line',
    });
    route.addTo(map);
    navRouteRef.current = route;

    // Start marker (green circle)
    navStartRef.current = L.circleMarker(start, {
      radius: 7, color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1, weight: 2,
    }).addTo(map);

    // End marker (red circle)
    navEndRef.current = L.circleMarker(end, {
      radius: 7, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1, weight: 2,
    }).addTo(map);

    map.fitBounds(L.latLngBounds(pts), { padding: [80, 80] });
  }

  // Redraw route when mode changes
  useEffect(() => {
    if (!navRouteRef.current) return;
    const targetLat = (navEndRef.current?.getLatLng()?.lat) ?? null;
    if (targetLat === null) return;
    const targetLng = navEndRef.current?.getLatLng()?.lng ?? null;
    if (targetLng === null) return;
    const marker = mapMarkers.find((m) => Math.abs(m.lat - targetLat) < 0.0001 && Math.abs(m.lng - targetLng) < 0.0001);
    if (marker) drawNavRoute(marker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeMode]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.eachLayer((layer) => {
      if ((layer as L.Polyline).options?.className === 'distance-line') {
        mapRef.current!.removeLayer(layer);
      }
    });
    if (!distanceTarget) return;
    const target = distanceTargets.find((d) => d.id === distanceTarget);
    if (!target || !mapRef.current) return;
    const latlngs: L.LatLngExpression[] = [ARKALYK_CENTER, [target.lat, target.lng]];
    L.polyline(latlngs, {
      color: '#0891b2', weight: 3, opacity: 0.6, dashArray: '10, 8', className: 'distance-line',
    }).addTo(mapRef.current);
    mapRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [80, 80] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distanceTarget]);

  const locateUser = () => {
    const map = mapRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      const fallback: [number, number] = [50.2490, 66.9120];
      userPosRef.current = fallback;
      placeUserDot(fallback);
      setHasUserLocation(true);
      map.flyTo(fallback, 16, { duration: 1.0 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const posArr: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        userPosRef.current = posArr;
        placeUserDot(posArr);
        setHasUserLocation(true);
        map.flyTo(posArr, 16, { duration: 1.0 });
      },
      () => {
        const fallback: [number, number] = [50.2490, 66.9120];
        userPosRef.current = fallback;
        placeUserDot(fallback);
        setHasUserLocation(true);
        map.flyTo(fallback, 16, { duration: 1.0 });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  function placeUserDot(pos: [number, number]) {
    const map = mapRef.current;
    if (!map) return;
    if (userLocationRef.current) map.removeLayer(userLocationRef.current);
    const marker = L.marker(pos, { icon: createUserLocationIcon(), zIndexOffset: 2000, interactive: false });
    marker.addTo(map);
    userLocationRef.current = marker;
  }

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const recenter = () => mapRef.current?.flyTo([50.2486, 66.9114], 15, { duration: 1.2 });

  const legendCategories = (Object.keys(categoryConfig) as MarkerCategory[]).filter((c) => c !== 'busStop');

  return (
    <div className="relative w-full h-full">
      <MapContainer
        ref={setLeafletMap}
        center={ARKALYK_CENTER}
        zoom={14}
        minZoom={12}
        maxZoom={19}
        zoomControl={false}
        attributionControl
        preferCanvas
        className="w-full h-full"
        style={{ background: theme === 'dark' ? '#0f172a' : '#e5e7eb' }}
      >
        {cartoKey ? (
          <TileLayer
            url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoKey)}`}
            attribution={`${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`}
            subdomains="abcd"
            maxZoom={19}
            crossOrigin="anonymous"
          />
        ) : (
          // CARTO serves a watermark without a key, so fall back to OSM tiles
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution={OSM_ATTRIBUTION}
            maxZoom={19}
            crossOrigin="anonymous"
          />
        )}
      </MapContainer>

      {/* Route mode toggle + info panel */}
      {routeInfo && (
        <div className={`absolute top-20 left-3 z-[500] rounded-xl shadow-lg p-3 max-w-[280px] ${
          theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'
        } backdrop-blur`}>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setRouteMode('drive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                routeMode === 'drive'
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              {lang === 'kk' ? 'Көлік' : 'Авто'}
            </button>
            <button
              onClick={() => setRouteMode('walk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                routeMode === 'walk'
                  ? 'bg-cyan-500 text-white'
                  : theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              {lang === 'kk' ? 'Жаяу' : 'Пешком'}
            </button>
            <button
              onClick={clearNavRoute}
              className={`ml-auto w-7 h-7 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
            {formatDistance(routeInfo.distKm, lang)}
          </div>
          <div className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {routeMode === 'walk'
              ? `${lang === 'kk' ? 'Жаяу' : 'Пешком'} ~${routeInfo.walkMin} ${lang === 'kk' ? 'мин' : 'мин'}`
              : `${lang === 'kk' ? 'Көлікпен' : 'На авто'} ~${routeInfo.driveMin} ${lang === 'kk' ? 'мин' : 'мин'}`}
            {' · '}
            {lang === 'kk' ? 'Бұрылыстар' : 'Поворотов'}: {routeInfo.turns}
          </div>
        </div>
      )}

      <div className="absolute right-3 bottom-6 z-[500] flex flex-col gap-1.5">
        <button
          onClick={zoomIn}
          className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all ${
            theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
          } hover:shadow-xl`}
          title={t.zoomInHint}
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={zoomOut}
          className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all ${
            theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
          } hover:shadow-xl`}
          title={t.zoomOutHint}
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={recenter}
          className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-cyan-600 transition-all ${
            theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-cyan-50'
          } hover:shadow-xl`}
          title={t.recenter}
        >
          <Locate className="w-5 h-5" />
        </button>
        <button
          onClick={locateUser}
          className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all ${
            hasUserLocation
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : theme === 'dark'
                ? 'bg-slate-800 text-blue-400 hover:bg-slate-700'
                : 'bg-white text-blue-600 hover:bg-blue-50'
          } hover:shadow-xl`}
          title={lang === 'kk' ? 'Менің орным' : 'Моё местоположение'}
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      <div
        className={`absolute left-3 bottom-6 z-[500] backdrop-blur rounded-xl shadow-lg p-2.5 max-w-[170px] hidden sm:block ${
          theme === 'dark' ? 'bg-slate-800/90' : 'bg-white/90'
        }`}
      >
        <div className={`text-[9px] font-semibold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
          {t.legend}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {legendCategories.map((cat) => {
            const cfg = categoryConfig[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {lang === 'kk' ? cfg.labelKk : cfg.labelRu}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
