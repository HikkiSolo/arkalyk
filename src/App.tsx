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

// Цвет фона тайлов CartoDB Voyager — совпадает с фоном подложки,
// поэтому при zoom/pan не будет "серых квадратов" и мигания.
const VOYAGER_BG = '#f2efe9';

/**
 * Хук-компонент для корректного ресайза карты.
 * invalidateSize нужен:
 *  - после монтирования (контейнер мог получить размеры позже),
 *  - при ресайзе окна,
 *  - при смене ориентации устройства.
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

  return (
    <div className="w-full h-screen relative bg-slate-900 text-white overflow-hidden">
      {/*
        ЕДИНСТВЕННОЕ, что реально нужно для фикса "серых квадратов":
        1) max-width/max-height: none — снимает Tailwind-ресет `img { max-width: 100% }`,
           который иначе сжимает тайлы 256x256.
        2) фон контейнера = фон подложки CartoDB Voyager.
        Всё остальное (position, width/height, display) трогать НЕЛЬЗЯ —
        Leaflet сам управляет тайлами через transform + inline width/height.
      */}
      <style>{`
        .leaflet-container {
          background: ${VOYAGER_BG};
          font-family: inherit;
        }
        .leaflet-container img {
          max-width: none !important;
          max-height: none !important;
        }
        /* Плавные попапы */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.18);
        }
        .leaflet-popup-tip {
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        /* Убираем "прыжок" курсора при перетаскивании */
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
          // Ключевое: не даём Leaflet пересоздавать тайлы агрессивно
          className="w-full h-full"
          // Явный стиль на контейнер — чтобы фон совпал до первого рендера тайлов
          style={{ background: VOYAGER_BG }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
            // КРИТИЧНО: keepBuffer + updateWhenIdle = меньше "мигания" тайлов
            keepBuffer={4}
            updateWhenIdle={false}
            updateWhenZooming={false}
            // Сглаживание при зуме — убирает "квадраты" на transition
            detectRetina={true}
          />

          <MapResizer />

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
      </div>
    </div>
  );
};

export default App;
