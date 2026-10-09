import { useState } from 'react';
import { X, Languages, Bus, GraduationCap, Calculator, Bot, Filter, CloudSun, Droplets, Bus as BusIcon, Gauge, Settings, Moon } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { cityPulseData } from '@/data';
import TransportPanel from './TransportPanel';
import EducationPanel from './EducationPanel';
import DistanceCalculator from './DistanceCalculator';
import type { MapMarker, MarkerCategory } from '@/types';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  activeFilters: Set<string>;
  onToggleFilter: (category: string) => void;
  onClearFilters: () => void;
  onShowOnMap: (marker: MapMarker) => void;
  onSelectDistanceTarget: (targetId: string) => void;
  distanceTarget: string | null;
  onOpenAI: () => void;
  onOpenSettings: () => void;
}

type TabId = 'pulse' | 'transport' | 'education' | 'distance';

const filterCategories: { id: MarkerCategory; color: string }[] = [
  { id: 'education', color: '#4f46e5' },
  { id: 'school', color: '#4f46e5' },
  { id: 'government', color: '#475569' },
  { id: 'justice', color: '#1e3a5f' },
  { id: 'transport', color: '#10b981' },
  { id: 'busStop', color: '#059669' },
  { id: 'health', color: '#f43f5e' },
  { id: 'commerce', color: '#f59e0b' },
];

export default function Drawer({
  open,
  onClose,
  activeFilters,
  onToggleFilter,
  onClearFilters,
  onShowOnMap,
  onSelectDistanceTarget,
  distanceTarget,
  onOpenAI,
  onOpenSettings,
}: DrawerProps) {
  const { lang, toggleLang, t, theme, toggleTheme } = useLang();
  const [activeTab, setActiveTab] = useState<TabId>('pulse');
  const isDark = theme === 'dark';

  const tabs: { id: TabId; icon: typeof Bus; label: string }[] = [
    { id: 'pulse', icon: Gauge, label: t.cityPulse },
    { id: 'transport', icon: Bus, label: t.transport },
    { id: 'education', icon: GraduationCap, label: t.education },
    { id: 'distance', icon: Calculator, label: t.distanceCalc },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/30 z-[1200] animate-[fadeIn_0.2s]" onClick={onClose} />}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[340px] max-w-[85vw] z-[1201] flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3.5 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
              <Gauge className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{t.appName}</div>
              <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{t.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
              title={isDark ? t.light : t.dark}
            >
              {isDark ? <CloudSun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenSettings}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
              title={t.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Language switcher */}
        <div className={`flex gap-2 px-4 py-2.5 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <button
            onClick={() => lang !== 'kk' && toggleLang()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              lang === 'kk' ? 'bg-cyan-500 text-white' : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            Қазақша
          </button>
          <button
            onClick={() => lang !== 'ru' && toggleLang()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              lang === 'ru' ? 'bg-cyan-500 text-white' : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            Русский
          </button>
        </div>

        {/* Tab navigation */}
        <div className={`flex gap-1 px-3 py-2 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                  isActive
                    ? isDark ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                    : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-medium leading-tight text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter chips */}
        {(activeTab === 'transport' || activeTab === 'education') && (
          <div className={`px-4 pt-3 pb-2 border-b ${isDark ? 'border-slate-700/30' : 'border-slate-50'}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <Filter className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.filters}</span>
              {activeFilters.size > 0 && (
                <button onClick={onClearFilters} className="ml-auto text-[10px] text-cyan-600 hover:text-cyan-500">{t.reset}</button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={onClearFilters}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                  activeFilters.size === 0
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                    : isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {t.all}
              </button>
              {filterCategories.map((cat) => {
                const isActive = activeFilters.has(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => onToggleFilter(cat.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                      isActive
                        ? ''
                        : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                    style={isActive ? { background: `${cat.color}20`, borderColor: `${cat.color}60`, color: cat.color } : undefined}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    {t.category[cat.id]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'pulse' && (
            <div className="space-y-3">
              <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.cityPulse}</div>

              <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800/90 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <CloudSun className="w-5 h-5 text-amber-500" />
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.weatherAir}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className={`text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{cityPulseData.weather.temp}°C</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {lang === 'kk'
                        ? `Ауа райы: +${cityPulseData.weather.temp}°C, Күн ашық (AQI ${cityPulseData.aqi.value})`
                        : `Погода: +${cityPulseData.weather.temp}°C, Ясный день (AQI ${cityPulseData.aqi.value})`}
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{cityPulseData.weather.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>AQI {cityPulseData.aqi.value}</span>
                    </div>
                  </div>
                </div>
                <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
                    style={{ background: `${cityPulseData.aqi.color}15`, color: cityPulseData.aqi.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cityPulseData.aqi.color }} />
                    {t.cleanAir}
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 dark:bg-emerald-900/20 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t.utilities}</span>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {lang === 'kk' ? 'ЖКХ және Водоканал — Штатный режим' : 'ЖКХ и Водоканал — Штатный режим'}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-500">{lang === 'kk' ? 'Барлық жүйелер жұмыс істеп тұр' : 'Все системы работают штатно'}</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <BusIcon className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{t.transportStatus}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{cityPulseData.transportStatus.onLinePercent}%</div>
                  <div className="flex-1">
                    <div className="text-xs text-amber-600 dark:text-amber-500 font-medium">{t.onLine}</div>
                    <div className="text-[10px] text-amber-500 mt-0.5">
                      {t.activeRoutes}: {cityPulseData.transportStatus.activeRoutes.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transport' && <TransportPanel />}
          {activeTab === 'education' && <EducationPanel onShowOnMap={onShowOnMap} />}
          {activeTab === 'distance' && (
            <DistanceCalculator onSelectTarget={onSelectDistanceTarget} selectedTarget={distanceTarget} />
          )}
        </div>

        {/* AI Assistant button at bottom */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <button
            onClick={onOpenAI}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-2xl px-4 py-3 transition-all shadow-md"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-white">{t.aiAssistant}</div>
              <div className="text-[10px] text-white/70">AI · ЖИ</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
