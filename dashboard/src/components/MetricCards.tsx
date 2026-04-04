export default function MetricCards() {
  return (
    <div className="absolute bottom-6 left-6 right-6 z-20 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Metric Card 1 */}
      <div className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32">
        <div>
          <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Current Vacancy Rate</span>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface">5.2%</h3>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs text-error font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            +0.4%
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
      <div className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32">
        <div>
          <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Job Growth %</span>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface">3.8%</h3>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs text-primary font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            Above Avg
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
      <div className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32">
        <div>
          <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">New Permits Issued</span>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface">1,402</h3>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs text-outline font-medium">Monthly Vol</span>
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
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <span className="material-symbols-outlined text-4xl text-primary">auto_graph</span>
        </div>
        <div>
          <span className="text-[10px] font-label text-primary uppercase tracking-wider mb-1 block">Forecast Rent (Q4)</span>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface">$2,215</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary">+2.4% Predicted</span>
        </div>
      </div>
    </div>
  );
}
