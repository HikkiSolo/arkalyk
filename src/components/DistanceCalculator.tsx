import { useState } from 'react';
import { Route, Navigation, Fuel, Clock, Calculator } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { distanceTargets, FUEL_PRICE_PER_LITER, FUEL_CONSUMPTION_PER_100KM } from '@/data';

interface DistanceCalcProps {
  onSelectTarget: (targetId: string) => void;
  selectedTarget: string | null;
}

export default function DistanceCalculator({ onSelectTarget, selectedTarget }: DistanceCalcProps) {
  const { lang, t } = useLang();
  const [selectedId, setSelectedId] = useState<string>(selectedTarget ?? '');

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (id) {
      onSelectTarget(id);
    }
  };

  const target = distanceTargets.find((d) => d.id === selectedId);

  const distanceKm = target ? target.distanceKm : 0;
  const driveHours = target ? target.driveHours : 0;
  const fuelLiters = (distanceKm * FUEL_CONSUMPTION_PER_100KM) / 100;
  const fuelCost = Math.round(fuelLiters * FUEL_PRICE_PER_LITER);
  const hours = Math.floor(driveHours);
  const minutes = Math.round((driveHours - hours) * 60);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-4 h-4 text-cyan-500" />
        <h3 className="text-sm font-semibold text-slate-800">{t.distanceCalc}</h3>
      </div>

      {/* From */}
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <div className="flex-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t.from}</div>
          <div className="text-xs font-semibold text-slate-800">Арқалық</div>
        </div>
      </div>

      <div className="flex items-center justify-center -my-1">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-0.5 h-3 bg-gradient-to-b from-emerald-400 to-cyan-400" />
          <Route className="w-3.5 h-3.5 text-cyan-500" />
          <div className="w-0.5 h-3 bg-gradient-to-b from-cyan-400 to-slate-300" />
        </div>
      </div>

      {/* To — dropdown with all Kazakhstan cities */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">{t.to}</div>
        <select
          value={selectedId}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-300 outline-none transition-all cursor-pointer"
        >
          <option value="">{lang === 'kk' ? 'Қала таңдаңыз...' : 'Выберите город...'}</option>
          {distanceTargets.map((dest) => (
            <option key={dest.id} value={dest.id}>
              {dest.name[lang]} (~{dest.distanceKm} км)
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {target && (
        <div className="bg-white rounded-xl border border-cyan-200 p-3.5 space-y-3 animate-[fadeIn_0.3s_ease-out] shadow-sm">
          <div className="text-center pb-2 border-b border-slate-100">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t.routeTo}</div>
            <div className="text-base font-bold text-slate-800 mt-0.5">{target.name[lang]}</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-50 flex items-center justify-center mb-1">
                <Navigation className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-sm font-bold text-slate-800">{distanceKm}</div>
              <div className="text-[9px] text-slate-400">км</div>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-amber-50 flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                {hours > 0 ? `${hours}с ` : ''}{minutes > 0 ? `${minutes}м` : (hours === 0 ? '0м' : '')}
              </div>
              <div className="text-[9px] text-slate-400">{t.driveTime}</div>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-50 flex items-center justify-center mb-1">
                <Fuel className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-sm font-bold text-slate-800">{fuelLiters.toFixed(1)}</div>
              <div className="text-[9px] text-slate-400">литр</div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400">{t.totalCost}</div>
              <div className="text-[9px] text-slate-300">{FUEL_PRICE_PER_LITER} ₸/л · {FUEL_CONSUMPTION_PER_100KM}л/100км</div>
            </div>
            <div className="text-lg font-bold text-emerald-600">{fuelCost.toLocaleString('ru-RU')} ₸</div>
          </div>
        </div>
      )}
    </div>
  );
}
