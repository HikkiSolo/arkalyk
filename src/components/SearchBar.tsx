import { useState, useRef, useEffect } from 'react';
import { Menu, Search, X, Bot, MapPin, Settings, Sun, Moon, Navigation } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { mapMarkers } from '@/data';
import type { MapMarker, MarkerCategory } from '@/types';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  results: MapMarker[];
  onResultsChange: (results: MapMarker[]) => void;
  onSelectResult: (marker: MapMarker) => void;
  onOpenDrawer: () => void;
  onOpenAI: () => void;
  onOpenSettings: () => void;
  visibleLayers: Set<MarkerCategory>;
  onBuildRoute: (marker: MapMarker) => void;
}

const categoryColors: Record<MarkerCategory, string> = {
  education: '#4f46e5',
  government: '#475569',
  school: '#4f46e5',
  transport: '#10b981',
  health: '#f43f5e',
  commerce: '#f59e0b',
  justice: '#1e3a5f',
  busStop: '#059669',
  religion: '#0d9488',
};

export default function SearchBar({
  query,
  onQueryChange,
  results,
  onResultsChange,
  onSelectResult,
  onOpenDrawer,
  onOpenAI,
  onOpenSettings,
  visibleLayers,
  onBuildRoute,
}: SearchBarProps) {
  const { lang, t, theme, toggleTheme } = useLang();
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      onResultsChange([]);
      return;
    }
    const filtered = mapMarkers.filter(
      (m) =>
        visibleLayers.has(m.category) &&
        (m.name.kk.toLowerCase().includes(q) ||
          m.name.ru.toLowerCase().includes(q) ||
          m.description.kk.toLowerCase().includes(q) ||
          m.description.ru.toLowerCase().includes(q))
    );
    onResultsChange(filtered);
  }, [query, onResultsChange, visibleLayers]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showDropdown = focused && query.length > 0;

  return (
    <div ref={wrapperRef} className="absolute top-3 left-3 right-3 sm:right-auto z-[1000] flex items-center gap-2">
      {/* Hamburger menu button */}
      <button
        onClick={onOpenDrawer}
        className={`shrink-0 w-11 h-11 rounded-2xl shadow-lg flex items-center justify-center transition-all ${
          isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'
        } hover:shadow-xl`}
        title="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search input */}
      <div className="relative flex-1 sm:w-[380px]">
        <div className={`flex items-center rounded-2xl shadow-lg transition-all ${showDropdown ? 'rounded-b-none shadow-xl' : ''} ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}>
          <Search className={`ml-3.5 w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={t.searchHint}
            className={`flex-1 bg-transparent px-2.5 py-3 text-sm focus:outline-none ${
              isDark ? 'text-slate-100 placeholder-slate-400' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
          {query && (
            <button
              onClick={() => {
                onQueryChange('');
                setFocused(false);
              }}
              className={`mr-1 w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`mr-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isDark ? 'text-amber-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
            title={isDark ? t.light : t.dark}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Settings gear */}
          <button
            onClick={onOpenSettings}
            className={`mr-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>
          {/* AI button inside search bar */}
          <button
            onClick={onOpenAI}
            className="mr-2 w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white hover:shadow-md transition-all"
            title={t.aiAssistant}
          >
            <Bot className="w-4 h-4" />
          </button>
        </div>

        {/* Search results dropdown */}
        {showDropdown && (
          <div className={`absolute top-full left-0 right-0 rounded-b-2xl shadow-xl border-t max-h-[300px] overflow-y-auto ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            {results.length === 0 ? (
              <div className={`px-4 py-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{t.noResults}</div>
            ) : (
              results.map((marker) => (
                <div
                  key={marker.id}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors text-left border-b last:border-0 ${
                    isDark ? 'hover:bg-slate-700/50 border-slate-700/50' : 'hover:bg-slate-50 border-slate-50'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectResult(marker);
                      setFocused(false);
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${categoryColors[marker.category]}15` }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: categoryColors[marker.category] }} />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{marker.name[lang]}</div>
                      <div className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{marker.description[lang]}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onBuildRoute(marker);
                      setFocused(false);
                    }}
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all whitespace-nowrap"
                    title={lang === 'kk' ? 'Маршрут салу' : 'Построить маршрут'}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {lang === 'kk' ? 'Маршрут' : 'Маршрут'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
