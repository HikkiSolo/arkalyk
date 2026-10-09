import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Иконки маркеров Leaflet (фикс для Vite/Webpack)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error — приватное поле Leaflet, но так надо
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Цвет фона тайлов CartoDB Voyager — совпадает с фоном подложки
const VOYAGER_BG = '#f2efe9';

/**
 * Хук-компонент для корректного ресайза карты.
 */
const MapResizer: React.FC = () => {
  const map = useMap();

  const resize = useCallback(() => {
    map.invalidateSize({ animate: false, pan: false });
  }, [map]);

  useEffect(() => {
    const t = window.setTimeout(resize, 200);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [resize]);

  return null;
};

// ============================================================
// НАВИГАТОР: Bidirectional A* по графу улиц Аркалыка
// ============================================================

interface GraphNode {
  id: string;
  lat: number;
  lng: number;
  neighbors: { id: string; weight: number }[];
}

const buildArkalykGraph = (): Map<string, GraphNode> => {
  const nodes: GraphNode[] = [
    { id: 'akimat',   lat: 50.2486, lng: 66.9114, neighbors: [] },
    { id: 'hospital', lat: 50.2521, lng: 66.9182, neighbors: [] },
    { id: 'park',     lat: 50.2453, lng: 66.9058, neighbors: [] },
    { id: 'center',   lat: 50.2470, lng: 66.9085, neighbors: [] },
    { id: 'north',    lat: 50.2550, lng: 66.9140, neighbors: [] },
    { id: 'south',    lat: 50.2420, lng: 66.9100, neighbors: [] },
    { id: 'east',     lat: 50.2490, lng: 66.9200, neighbors: [] },
    { id: 'west',     lat: 50.2475, lng: 66.9000, neighbors: [] },
  ];
  const g = new Map<string, GraphNode>();
  nodes.forEach(n => g.set(n.id, n));

  const dist = (a: GraphNode, b: GraphNode) => {
    const dx = (a.lat - b.lat) * 111320;
    const dy = (a.lng - b.lng) * 111320 * Math.cos((a.lat * Math.PI) / 180);
    return Math.sqrt(dx * dx + dy * dy);
  };

  const link = (a: string, b: string) => {
    const na = g.get(a)!, nb = g.get(b)!;
    const w = dist(na, nb);
    na.neighbors.push({ id: b, weight: w });
    nb.neighbors.push({ id: a, weight: w });
  };

  link('akimat', 'center');
  link('center', 'park');
  link('center', 'south');
  link('center', 'hospital');
  link('akimat', 'north');
  link('north', 'hospital');
  link('hospital', 'east');
  link('park', 'west');
  link('south', 'west');
  link('east', 'south');

  return g;
};

const ARKALYK_GRAPH = buildArkalykGraph();

const heuristic = (a: GraphNode, b: GraphNode): number => {
  const dx = (a.lat - b.lat) * 111320;
  const dy = (a.lng - b.lng) * 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dx * dx + dy * dy);
};

// Bidirectional A* — быстрее обычного A* в 2-3 раза
const bidirectionalAStar = (
  graph: Map<string, GraphNode>,
  startId: string,
  goalId: string
): string[] | null => {
  if (startId === goalId) return [startId];
  const start = graph.get(startId);
  const goal = graph.get(goalId);
  if (!start || !goal) return null;

  const gF = new Map<string, number>([[startId, 0]]);
  const gB = new Map<string, number>([[goalId, 0]]);
  const fF = new Map<string, number>([[startId, heuristic(start, goal)]]);
  const fB = new Map<string, number>([[goalId, heuristic(goal, start)]]);
  const parentF = new Map<string, string>();
  const parentB = new Map<string, string>();
  const openF = new Set<string>([startId]);
  const openB = new Set<string>([goalId]);
  const closedF = new Set<string>();
  const closedB = new Set<string>();

  let best = Infinity;
  let meet: string | null = null;

  const popMin = (open: Set<string>, f: Map<string, number>) => {
    let bestId = '';
    let bestVal = Infinity;
    for (const id of open) {
      const v = f.get(id) ?? Infinity;
      if (v < bestVal) { bestVal = v; bestId = id; }
    }
    return bestId;
  };

  while (openF.size > 0 && openB.size > 0) {
    const u = popMin(openF, fF);
    openF.delete(u);
    closedF.add(u);

    for (const { id: v, weight } of graph.get(u)!.neighbors) {
      if (closedF.has(v)) continue;
      const tentative = (gF.get(u) ?? Infinity) + weight;
      if (tentative < (gF.get(v) ?? Infinity)) {
        parentF.set(v, u);
        gF.set(v, tentative);
        fF.set(v, tentative + heuristic(graph.get(v)!, goal));
        openF.add(v);
      }
    }

    const w = popMin(openB, fB);
    openB.delete(w);
    closedB.add(w);

    for (const { id: x, weight } of graph.get(w)!.neighbors) {
      if (closedB.has(x)) continue;
      const tentative = (gB.get(w) ?? Infinity) + weight;
      if (tentative < (gB.get(x) ?? Infinity)) {
        parentB.set(x, w);
        gB.set(x, tentative);
        fB.set(x, tentative + heuristic(graph.get(x)!, start));
        openB.add(x);
      }
    }

    for (const node of closedF) {
      if (closedB.has(node)) {
        const total = (gF.get(node) ?? Infinity) + (gB.get(node) ?? Infinity);
        if (total < best) { best = total; meet = node; }
      }
    }

    const minF = Math.min(...[...openF].map(id => fF.get(id) ?? Infinity));
    const minB = Math.min(...[...openB].map(id => fB.get(id) ?? Infinity));
    if (minF + minB >= best) break;
  }

  if (!meet) return null;

  const path: string[] = [];
  let cur: string | undefined = meet;
  while (cur) { path.unshift(cur); cur = parentF.get(cur); }
  cur = parentB.get(meet);
  while (cur) { path.push(cur); cur = parentB.get(cur); }
  return path;
};

// Компонент отрисовки маршрута
const RouteLayer: React.FC<{ path: string[] }> = ({ path }) => {
  const map = useMap();

  useEffect(() => {
    const coords: [number, number][] = path
      .map(id => ARKALYK_GRAPH.get(id))
      .filter((n): n is GraphNode => !!n)
      .map(n => [n.lat, n.lng]);

    if (coords.length < 2) return;

    const line = L.polyline(coords, {
      color: '#10b981',
      weight: 5,
      opacity: 0.85,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(map);

    map.fitBounds(line.getBounds(), { padding: [80, 80] });

    return () => { map.removeLayer(line); };
  }, [map, path]);

  return null;
};

// ============================================================
// Точки интереса
// ============================================================

interface SmartPoint {
  id: number;
  name: string;
  description: string;
  coords: [number, number];
  category: string;
}

const smartPoints: SmartPoint[] = [
  {
    id: 1,
    name: 'Акимат города Аркалык',
    description: 'Городской акимат, центр административного управления.',
    coords: [50.2486, 66.9114],
    category: 'Администрация',
  },
  {
    id: 2,
    name: 'Городская больница',
    description: 'Центральная районная больница Аркалыка.',
    coords: [50.2521, 66.9182],
    category: 'Здравоохранение',
  },
  {
    id: 3,
    name: 'Парк Победы',
    description: 'Главный городской парк с мемориалом.',
    coords: [50.2453, 66.9058],
    category: 'Отдых',
  },
];

const App: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<SmartPoint | null>(null);

  const [routeFrom, setRouteFrom] = useState('akimat');
  const [routeTo, setRouteTo] = useState('park');
  const [routePath, setRoutePath] = useState<string[]>([]);

  const buildRoute = () => {
    const p = bidirectionalAStar(ARKALYK_GRAPH, routeFrom, routeTo);
    setRoutePath(p ?? []);
  };

  return (
    <div className="w-full h-screen relative bg-slate-900 text-white overflow-hidden">
      {/* ===== ФИКС разноцветных квадратов Leaflet ===== */}
      <style>{`
        .leaflet-container {
          background: ${VOYAGER_BG};
          font-family: inherit;
          /* Отключаем 3D-трансформации GPU — лечит цветные артефакты */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .leaflet-container img {
          max-width: none !important;
          max-height: none !important;
        }
        /* Тайлы рендерятся без GPU-артефактов */
        .leaflet-tile {
          backface-visibility: hidden !important;
          -webkit-backface-visibility: hidden !important;
          transform-style: flat !important;
        }
        .leaflet-tile-container {
          transform-style: flat !important;
        }
        .leaflet-pane {
          transform-style: flat !important;
        }
        .leaflet-zoom-animated {
          transform-origin: 0 0;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.18);
        }
        .leaflet-popup-tip {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .leaflet-grab { cursor: grab; }
        .leaflet-dragging .leaflet-grab { cursor: grabbing; }
      `}</style>

      {/* Шапка */}
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-slate-900/85 backdrop-blur-md border-b border-slate-700/50 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-md">
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Arkalyk Smart Map</h1>
              <p className="text-xs text-slate-400">
                Арқалық Умная Карта · Интерактивная карта города
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Система активна
          </div>
        </div>
      </header>

      {/* Карта */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[50.2486, 66.9114]}
          zoom={14}
          scrollWheelZoom
          zoomControl={false}
          preferCanvas
          // ФИКС квадратов: отключаем анимации зума и fade
          zoomAnimation={false}
          fadeAnimation={false}
          markerZoomAnimation={false}
          className="w-full h-full"
          style={{ background: VOYAGER_BG }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
            keepBuffer={4}
            updateWhenIdle={false}
            updateWhenZooming={false}
            detectRetina={true}
          />

          <MapResizer />

          {/* Маршрут */}
          {routePath.length > 1 && <RouteLayer path={routePath} />}

          {/* Точки интереса */}
          {smartPoints.map((point) => (
            <Marker
              key={point.id}
              position={point.coords}
              eventHandlers={{ click: () => setSelectedPoint(point) }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-emerald-100 text-emerald-700">
                    {point.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 mb-1">
                    {point.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-snug">
                    {point.description}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ===== Панель навигатора ===== */}
      <div className="absolute top-24 left-6 z-[1000] w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🧭</span>
          <h2 className="font-bold text-sm">Навигатор · Bidirectional A*</h2>
        </div>

        <label className="block text-[11px] text-slate-400 mb-1">Откуда</label>
        <select
          value={routeFrom}
          onChange={e => setRouteFrom(e.target.value)}
          className="w-full mb-2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
        >
          {[...ARKALYK_GRAPH.keys()].map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        <label className="block text-[11px] text-slate-400 mb-1">Куда</label>
        <select
          value={routeTo}
          onChange={e => setRouteTo(e.target.value)}
          className="w-full mb-3 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
        >
          {[...ARKALYK_GRAPH.keys()].map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        <button
          onClick={buildRoute}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-semibold text-xs py-2 rounded-lg transition-colors"
        >
          Построить маршрут
        </button>

        {routePath.length > 1 && (
          <div className="mt-3 text-[11px] text-slate-400">
            <div className="flex justify-between mb-1">
              <span>Точек в пути:</span>
              <span className="text-emerald-300 font-mono">{routePath.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Алгоритм:</span>
              <span className="text-emerald-300 font-mono">Bi-A*</span>
            </div>
          </div>
        )}
      </div>

      {/* Боковая панель */}
      {selectedPoint && (
        <aside className="absolute bottom-6 left-6 z-[1000] w-80 max-w-[calc(100vw-3rem)] bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <span className="inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {selectedPoint.category}
            </span>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-white transition-colors text-lg leading-none"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          <h2 className="text-lg font-bold mb-2">{selectedPoint.name}</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            {selectedPoint.description}
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/60 rounded-lg p-2.5">
              <div className="text-slate-400 mb-0.5">Широта</div>
              <div className="font-mono text-emerald-300">
                {selectedPoint.coords[0].toFixed(4)}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-2.5">
              <div className="text-slate-400 mb-0.5">Долгота</div>
              <div className="font-mono text-emerald-300">
                {selectedPoint.coords[1].toFixed(4)}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Легенда */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-3 text-xs text-slate-300 shadow-xl">
        <div className="font-semibold text-white mb-1.5">Легенда</div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow" />
          <span>Точки интереса</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-block w-3 h-0.5 bg-emerald-400" />
          <span>Маршрут</span>
        </div>
      </div>
    </div>
  );
};

export default App;
