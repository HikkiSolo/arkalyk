import { GraduationCap, School, MapPin } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { mapMarkers } from '@/data';
import type { MapMarker } from '@/types';

interface EducationPanelProps {
  onShowOnMap: (marker: MapMarker) => void;
}

export default function EducationPanel({ onShowOnMap }: EducationPanelProps) {
  const { lang, t } = useLang();

  const institutes = mapMarkers.filter((m) => m.category === 'education');
  const schools = mapMarkers.filter((m) => m.category === 'school');

  const renderCard = (marker: MapMarker) => (
    <div
      key={marker.id}
      className="bg-slate-50 rounded-xl border border-slate-100 p-3 hover:border-cyan-200 transition-all"
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            marker.category === 'education'
              ? 'bg-blue-50 text-blue-500'
              : 'bg-emerald-50 text-emerald-500'
          }`}
        >
          {marker.category === 'education' ? (
            <GraduationCap className="w-4 h-4" />
          ) : (
            <School className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-800 truncate">{marker.name[lang]}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{marker.description[lang]}</div>
          <button
            onClick={() => onShowOnMap(marker)}
            className="mt-2 flex items-center gap-1 text-[10px] font-medium text-cyan-600 hover:text-cyan-500 transition-colors"
          >
            <MapPin className="w-3 h-3" />
            {t.showOnMap}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-slate-800">{t.institutes}</h3>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{institutes.length}</span>
        </div>
        <div className="space-y-2">{institutes.map(renderCard)}</div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <School className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-slate-800">{t.schools}</h3>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{schools.length}</span>
        </div>
        <div className="space-y-2">{schools.map(renderCard)}</div>
      </div>
    </div>
  );
}
