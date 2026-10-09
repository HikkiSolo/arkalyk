import { X, Sun, Moon, Settings, GraduationCap, Heart, Bus, Building2, ShoppingBag, CircleDot, Check, Church, TrafficCone } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import type { MarkerCategory } from '@/types';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  visibleLayers: Set<MarkerCategory>;
  onToggleLayer: (cat: MarkerCategory) => void;
  showTrafficNodes: boolean;
  onToggleTrafficNodes: () => void;
}

interface LayerToggle {
  cat: MarkerCategory;
  icon: typeof GraduationCap;
  labelKk: string;
  labelRu: string;
  color: string;
}

const layerToggles: LayerToggle[] = [
  { cat: 'education', icon: GraduationCap, labelKk: 'Оқу орындары (АрҚПИ, Колледждер, Мектептер)', labelRu: 'Учебные заведения (АрҚПИ, Колледжи, Школы)', color: '#4f46e5' },
  { cat: 'health', icon: Heart, labelKk: 'Денсаулық сақтау (Аурухана, Поликлиника)', labelRu: 'Здравоохранение (Больница, Поликлиника)', color: '#f43f5e' },
  { cat: 'transport', icon: Bus, labelKk: 'Көлік (Вокзал, Автовокзал)', labelRu: 'Транспорт (Вокзал, Автовокзал)', color: '#10b981' },
  { cat: 'busStop', icon: CircleDot, labelKk: 'Автобус аялдаулары және бағыттар', labelRu: 'Автобусные остановки и маршруты', color: '#059669' },
  { cat: 'government', icon: Building2, labelKk: 'Үкімет және соттар (Әкімдік, ЦОН, Прокуратура)', labelRu: 'Госуслуги и суды (Акимат, ЦОН, Прокуратура)', color: '#475569' },
  { cat: 'commerce', icon: ShoppingBag, labelKk: 'Сауда және банктер (ТД, Нарық, Kaspi/Halyk)', labelRu: 'Торговля и банки (ТД, Рынок, Kaspi/Halyk)', color: '#f59e0b' },
  { cat: 'religion', icon: Church, labelKk: 'Дін және мәдениет (Мешіт, Шіркеу)', labelRu: 'Религия и культура (Мечеть, Церковь)', color: '#0d9488' },
];

export default function SettingsPanel({ open, onClose, visibleLayers, onToggleLayer, showTrafficNodes, onToggleTrafficNodes }: SettingsPanelProps) {
  const { lang, t, theme, toggleTheme } = useLang();
  if (!open) return null;
  const isDark = theme === 'dark';

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 z-[1500] animate-[fadeIn_0.2s]" onClick={onClose} />

      <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-[380px] z-[1501] flex flex-col shadow-2xl animate-[slideIn_0.3s_ease-out] ${
        isDark ? 'bg-slate-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-md">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{t.settings}</div>
            <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{t.tagline}</div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Theme Switcher */}
          <div>
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
              {lang === 'kk' ? 'Тақырып' : 'Тема'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => isDark && toggleTheme()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  !isDark
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-xs font-medium">{lang === 'kk' ? 'Жарық' : 'Светлая'}</span>
              </button>
              <button
                onClick={() => !isDark && toggleTheme()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-slate-100'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-xs font-medium">{lang === 'kk' ? 'Қараңғы' : 'Тёмная'}</span>
              </button>
            </div>
          </div>

          {/* Layer Toggles */}
          <div>
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
              {t.layerToggles}
            </div>
            <div className="space-y-2">
              {/* Traffic lights & crosswalks toggle */}
              <div
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all ${
                  isDark
                    ? showTrafficNodes
                      ? 'bg-slate-800/90 border-slate-700/50'
                      : 'bg-slate-800/40 border-slate-700/30 opacity-50'
                    : showTrafficNodes
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-50/50 border-slate-100 opacity-50'
                }`}
              >
                <div
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#dc262615' }}
                >
                  <TrafficCone className="w-4 h-4" style={{ color: '#dc2626' }} />
                </div>
                <span className={`flex-1 text-left text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {lang === 'kk' ? '🚦 Светофорлар және өтпе жолдар' : '🚦 Светофоры и пешеходные переходы'}
                </span>
                <button
                  onClick={onToggleTrafficNodes}
                  className="shrink-0 relative outline-none"
                  aria-pressed={showTrafficNodes}
                >
                  <div
                    className={`w-10 h-5.5 rounded-full transition-all duration-200 ${
                      showTrafficNodes ? '' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                    }`}
                    style={showTrafficNodes ? { background: '#dc2626' } : undefined}
                  >
                    <div
                      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full shadow-sm transition-all duration-200 flex items-center justify-center ${
                        showTrafficNodes ? 'left-[22px]' : 'left-0.5'
                      } ${showTrafficNodes ? 'bg-white' : isDark ? 'bg-slate-400' : 'bg-white'}`}
                    >
                      {showTrafficNodes && <Check className="w-3 h-3" style={{ color: '#dc2626' }} />}
                    </div>
                  </div>
                </button>
              </div>

              {layerToggles.map((layer) => {
                const Icon = layer.icon;
                const isVisible = visibleLayers.has(layer.cat);
                return (
                  <div
                    key={layer.cat}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all ${
                      isDark
                        ? isVisible
                          ? 'bg-slate-800/90 border-slate-700/50'
                          : 'bg-slate-800/40 border-slate-700/30 opacity-50'
                        : isVisible
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-slate-50/50 border-slate-100 opacity-50'
                    }`}
                  >
                    <div
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${layer.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: layer.color }} />
                    </div>
                    <span className={`flex-1 text-left text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {lang === 'kk' ? layer.labelKk : layer.labelRu}
                    </span>
                    {/* Toggle switch — visually active when isVisible */}
                    <button
                      onClick={() => onToggleLayer(layer.cat)}
                      className="shrink-0 relative outline-none"
                      aria-pressed={isVisible}
                    >
                      <div
                        className={`w-10 h-5.5 rounded-full transition-all duration-200 ${
                          isVisible ? '' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                        }`}
                        style={isVisible ? { background: layer.color } : undefined}
                      >
                        <div
                          className={`absolute top-0.5 w-4.5 h-4.5 rounded-full shadow-sm transition-all duration-200 flex items-center justify-center ${
                            isVisible ? 'left-[22px]' : 'left-0.5'
                          } ${isVisible ? 'bg-white' : isDark ? 'bg-slate-400' : 'bg-white'}`}
                        >
                          {isVisible && (
                            <Check className="w-3 h-3" style={{ color: layer.color }} />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
