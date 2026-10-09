import React, { useEffect, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error — приватное поле Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ------------------------------------------------------------
// ТИПЫ
// ------------------------------------------------------------
interface SmartPoint {
  id: number;
  name: string;
  description: string;
  coords: [number, number];
  category: string;
}

interface RouteInfo {
  distance: number; // метры
  duration: number; // секунды
  coords: [number, number][];
}

// ------------------------------------------------------------
// ДАННЫЕ
// ------------------------------------------------------------
const ARKALYK_CENTER: [number, number] = [50.2486, 66.9114];

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

// ------------------------------------------------------------
// КАРТА: ресайз + подгонка под маршрут
// ------------------------------------------------------------
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

const FitRoute: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length < 2) return;
    const bounds = L.latLngBounds(coords.map(c => L.latLng(c[0], c[1])));
    map.fitBounds(bounds, { padding: [80, 80] });
  }, [map, coords]);
  return null;
};

// ------------------------------------------------------------
// OSRM
// ------------------------------------------------------------
const fetchRoute = async (
  start: [number, number],
  end: [number, number]
): Promise<RouteInfo | null> => {
  const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM error');
    const data = await res.json();
    if (!data.routes || !data.routes[0]) return null;
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]]
    );
    return {
      distance: route.distance,
      duration: route.duration,
      coords,
    };
  } catch {
    return null;
  }
};

// ------------------------------------------------------------
// ПРИЛОЖЕНИЕ
// ------------------------------------------------------------
const App: React.FC = () => {
  // Настройки
  const [darkTheme, setDarkTheme] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Выбранная точка
  const [selectedPoint, setSelectedPoint] = useState<SmartPoint | null>(null);

  // Маршрут
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Подложка карты в зависимости от темы
  const tileUrl = darkTheme
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const mapBg = darkTheme ? '#0f172a' : '#f2efe9';

  // Показать маршрут от центра до точки
  const buildRouteTo = async (point: SmartPoint) => {
    setSelectedPoint(point);
    setLoadingRoute(true);
    const r = await fetchRoute(ARKALYK_CENTER, point.coords);
    setRoute(r);
    setLoadingRoute(false);
  };

  // Очистить маршрут
  const clearRoute = () => setRoute(null);

  // Цвета темы
  const shell = darkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-900';
  const panel = darkTheme
    ? 'bg-slate-900/95 border-slate-700/60 text-white'
    : 'bg-white/95 border-slate-200 text-slate-900';
  const subtext = darkTheme ? 'text-slate-400' : 'text-slate-500';
  const btn = darkTheme
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-slate-100 border-slate-200 text-slate-900';

  return (
    <div className={`w-full h-screen relative overflow-hidden ${shell}`}>
      <style>{`
        .leaflet-container {
          background: ${mapBg};
          font-family: inherit;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .leaflet-container img {
          max-width: none !important;
          max-height: none !important;
        }
        .leaflet-tile {
          backface-visibility: hidden !important;
          -webkit-backface-visibility: hidden !important;
          transform-style: flat !important;
        }
        .leaflet-tile-container,
        .leaflet-pane {
          transform-style: flat !important;
        }
        .leaflet-zoom-animated { transform-origin: 0 0; }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.18);
        }
        .leaflet-grab { cursor: grab; }
        .leaflet-dragging .leaflet-grab { cursor: grabbing; }
      `}</style>

      {/* Шапка */}
      <header
        className={`absolute top-0 left-0 right-0 z-[1000] backdrop-blur-md border-b px-6 py-4 shadow-lg ${
          darkTheme
            ? 'bg-slate-900/85 border-slate-700/50'
            : 'bg-white/85 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-md">
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Arkalyk Smart Map</h1>
              <p className={`text-xs ${subtext}`}>
                Арқалық Умная Карта · Интерактивная карта города
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-2 text-xs ${subtext}`}>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Система активна
            </div>
            <button
              onClick={() => setSettingsOpen(o => !o)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${btn}`}
              aria-label="Настройки"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Меню настроек */}
      {settingsOpen && (
        <div
          className={`absolute top-20 right-6 z-[1000] w-72 rounded-2xl shadow-2xl border backdrop-blur-md p-4 ${panel}`}
        >
          <h2 className="font-bold text-sm mb-3">Настройки</h2>

          {/* Тема — единственный тумблер */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs">Тёмная тема</span>
            <button
              onClick={() => setDarkTheme(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                darkTheme ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              aria-label="Переключить тему"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  darkTheme ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Метки */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs">Показывать метки</span>
            <button
              onClick={() => setShowMarkers(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                showMarkers ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              aria-label="Переключить метки"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  showMarkers ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Очистить маршрут */}
          {route && (
            <button
              onClick={clearRoute}
              className={`w-full text-xs py-2 rounded-lg border transition-colors ${btn}`}
            >
              Очистить маршрут
            </button>
          )}
        </div>
      )}

      {/* Карта */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={ARKALYK_CENTER}
          zoom={14}
          scrollWheelZoom
          zoomControl={false}
          preferCanvas
          zoomAnimation={false}
          fadeAnimation={false}
          markerZoomAnimation={false}
          className="w-full h-full"
          style={{ background: mapBg }}
        >
          <TileLayer
            key={darkTheme ? 'dark' : 'light'}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
            subdomains="abcd"
            maxZoom={20}
            keepBuffer={4}
            updateWhenIdle={false}
            updateWhenZooming={false}
            detectRetina={true}
          />

          <MapResizer />

          {/* Маршрут */}
          {route && (
            <>
              <Polyline
                positions={route.coords}
                pathOptions={{ color: '#007AFF', weight: 6, opacity: 0.9 }}
              />
              <FitRoute coords={route.coords} />
            </>
          )}

          {/* Метки — только если включены */}
          {showMarkers &&
            smartPoints.map(point => (
              <Marker
                key={point.id}
                position={point.coords}
                eventHandlers={{ click: () => buildRouteTo(point) }}
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

      {/* Инфо о маршруте — нижняя карточка */}
      {(route || loadingRoute) && (
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[min(420px,calc(100vw-2rem))] rounded-2xl shadow-2xl border backdrop-blur-md px-5 py-4 ${panel}`}
        >
          {loadingRoute ? (
            <div className={`text-sm ${subtext}`}>Строим маршрут…</div>
          ) : route ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#007AFF]">
                  Маршрут построен
                </span>
                <button
                  onClick={clearRoute}
                  className={`text-xs ${subtext} hover:opacity-80`}
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`rounded-lg p-3 ${darkTheme ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                  <div className={`mb-0.5 ${subtext}`}>Дистанция</div>
                  <div className="font-mono text-emerald-400 text-lg">
                    {(route.distance / 1000).toFixed(2)} км
                  </div>
                </div>
                <div className={`rounded-lg p-3 ${darkTheme ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                  <div className={`mb-0.5 ${subtext}`}>Время в пути</div>
                  <div className="font-mono text-emerald-400 text-lg">
                    {Math.round(route.duration / 60)} мин
                  </div>
                </div>
              </div>
              {selectedPoint && (
                <div className={`mt-2 text-[11px] ${subtext}`}>
                  Из центра Аркалыка → {selectedPoint.name}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Боковая панель точки */}
      {selectedPoint && !route && !loadingRoute && (
        <aside
          className={`absolute bottom-6 left-6 z-[1000] w-80 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl border backdrop-blur-md p-5 ${panel}`}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {selectedPoint.category}
            </span>
            <button
              onClick={() => setSelectedPoint(null)}
              className={`text-lg leading-none ${subtext} hover:opacity-80`}
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          <h2 className="text-lg font-bold mb-2">{selectedPoint.name}</h2>
          <p className={`text-sm leading-relaxed mb-4 ${subtext}`}>
            {selectedPoint.description}
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`rounded-lg p-2.5 ${darkTheme ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
              <div className={`mb-0.5 ${subtext}`}>Широта</div>
              <div className="font-mono text-emerald-400">
                {selectedPoint.coords[0].toFixed(4)}
              </div>
            </div>
            <div className={`rounded-lg p-2.5 ${darkTheme ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
              <div className={`mb-0.5 ${subtext}`}>Долгота</div>
              <div className="font-mono text-emerald-400">
                {selectedPoint.coords[1].toFixed(4)}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Легенда */}
      <div
        className={`absolute bottom-6 right-6 z-[1000] rounded-xl px-4 py-3 text-xs shadow-xl border backdrop-blur-md ${panel}`}
      >
        <div className="font-semibold mb-1.5">Легенда</div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow" />
          <span className={subtext}>Точки интереса</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-block w-3 h-0.5 bg-[#007AFF]" />
          <span className={subtext}>Маршрут OSRM</span>
        </div>
      </div>
    </div>
  );
};

export default App;
