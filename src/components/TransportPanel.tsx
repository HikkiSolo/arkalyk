import { Bus, Clock, ArrowRight } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { busRoutes } from '@/data';

export default function TransportPanel() {
  const { lang, t } = useLang();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Bus className="w-4 h-4 text-cyan-500" />
        <h3 className="text-sm font-semibold text-slate-800">{t.transportSchedule}</h3>
      </div>

      {busRoutes.map((route) => (
        <div
          key={route.id}
          className="bg-slate-50 rounded-xl border border-slate-100 p-3 hover:border-cyan-200 transition-all"
        >
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: route.color }}
            >
              {route.number}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-700 mb-1 truncate">{route.route[lang]}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {route.schedule}
                </span>
                <span className="flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> {route.interval}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
