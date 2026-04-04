import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import * as api from '../services/api';

export default function MetricCards() {
  const { selectedMarket } = useAppContext();
  const [data, setData] = useState({
    vacancy: '—',
    vacancyTrend: '',
    jobs: '—',
    jobsTrend: '',
    permits: '—',
    permitsTrend: '',
    rent: '—',
    rentTrend: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      api.getVacancy(selectedMarket),
      api.getJobGrowth(selectedMarket),
      api.getPermits(selectedMarket),
      api.getRents(selectedMarket)
    ]).then(([vacRef, jobRef, permRef, rentRef]) => {
      if (active) {
        const fallbacks = {
          vacancy: { value: '5.2%', trend: '+0.4%' },
          jobs: { value: '3.8%', trend: 'Above Avg' },
          permits: { value: '1,402', trend: 'Monthly Vol' },
          rent: { value: '$2,215', trend: '+2.4% Predicted' }
        };

        const extract = (res: any, fallback: { value: string; trend: string }) => {
          const first = res?.data?.[0];
          return {
            value: first?.value != null ? String(first.value) : fallback.value,
            trend: first?.trend != null ? String(first.trend) : fallback.trend,
          };
        };

        const v = vacRef.status === 'fulfilled' ? extract(vacRef.value, fallbacks.vacancy) : fallbacks.vacancy;
        const j = jobRef.status === 'fulfilled' ? extract(jobRef.value, fallbacks.jobs) : fallbacks.jobs;
        const p = permRef.status === 'fulfilled' ? extract(permRef.value, fallbacks.permits) : fallbacks.permits;
        const r = rentRef.status === 'fulfilled' ? extract(rentRef.value, fallbacks.rent) : fallbacks.rent;

        setData({
          vacancy: v.value,
          vacancyTrend: v.trend,
          jobs: j.value,
          jobsTrend: j.trend,
          permits: p.value,
          permitsTrend: p.trend,
          rent: r.value,
          rentTrend: r.trend,
        });
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [selectedMarket]);

  return (
    <div className="absolute bottom-6 left-6 right-6 z-20 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Metric Card 1 */}
      <div className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32 relative">
        {loading && <div className="absolute inset-0 bg-surface-container/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl"><span className="material-symbols-outlined animate-spin text-primary opacity-50">sync</span></div>}
        <div>
          <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Current Vacancy Rate</span>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface">{data.vacancy}</h3>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs text-error font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            {data.vacancyTrend}
          </span>
          <div className="h-8 w-24 flex items-end gap-0.5">
            <div className="w-full bg-outline-variant/30 h-[20%] rounded-t-sm"></div>
            <div className="w-full bg-outline-variant/30 h-[40%] rounded-t-sm"></div>
            <div className="w-full bg-outline-variant/30 h-[30%] rounded-t-sm"></div>
            <div className="w-full bg-primary/40 h-[60%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[80%] rounded-t-sm"></div>
          </div>
        </div>
      </div>

      {/* Metric Card 2 */}
      <div className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32 relative">
        {loading && <div className="absolute inset-0 bg-surface-container/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl"><span className="material-symbols-outlined animate-spin text-primary opacity-50">sync</span></div>}
        <div>
          <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Job Growth %</span>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface">{data.jobs}</h3>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs text-primary font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            {data.jobsTrend}
          </span>
          <div className="h-8 w-24 flex items-end gap-0.5">
            <div className="w-full bg-primary/20 h-[30%] rounded-t-sm"></div>
            <div className="w-full bg-primary/40 h-[50%] rounded-t-sm"></div>
            <div className="w-full bg-primary/60 h-[45%] rounded-t-sm"></div>
            <div className="w-full bg-primary/80 h-[70%] rounded-t-sm"></div>
            <div className="w-full bg-primary h-[90%] rounded-t-sm"></div>
          </div>
        </div>
      </div>

      {/* Metric Card 3 */}
      <div className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32 relative">
        {loading && <div className="absolute inset-0 bg-surface-container/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl"><span className="material-symbols-outlined animate-spin text-primary opacity-50">sync</span></div>}
        <div>
          <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">New Permits Issued</span>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface">{data.permits}</h3>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs text-outline font-medium">{data.permitsTrend}</span>
          <div className="h-8 w-24 flex items-end gap-0.5">
            <div className="w-full bg-tertiary/20 h-[50%] rounded-t-sm"></div>
            <div className="w-full bg-tertiary/40 h-[60%] rounded-t-sm"></div>
            <div className="w-full bg-tertiary/60 h-[40%] rounded-t-sm"></div>
            <div className="w-full bg-tertiary/80 h-[55%] rounded-t-sm"></div>
            <div className="w-full bg-tertiary h-[65%] rounded-t-sm"></div>
          </div>
        </div>
      </div>

      {/* Metric Card 4: Forecast */}
      <div className="bg-primary/10 p-5 rounded-xl border border-primary/20 flex flex-col justify-between h-32 relative overflow-hidden">
        {loading && <div className="absolute inset-0 bg-surface-container/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl"><span className="material-symbols-outlined animate-spin text-primary opacity-50">sync</span></div>}
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <span className="material-symbols-outlined text-4xl text-primary">auto_graph</span>
        </div>
        <div>
          <span className="text-[10px] font-label text-primary uppercase tracking-wider mb-1 block">Forecast Rent (Q4)</span>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface">{data.rent}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary">{data.rentTrend}</span>
        </div>
      </div>
    </div>
  );
}
