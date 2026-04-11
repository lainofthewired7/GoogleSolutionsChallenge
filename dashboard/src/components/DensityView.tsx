import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import DensityMap from './DensityMap';

export default function DensityView() {
  const { marketInfo } = useAppContext();
  const [metric, setMetric] = useState<'population' | 'migration'>('population');

  // Pseudo-random deterministic values based on market name for dynamic visuals
  const seed = marketInfo ? marketInfo.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 100;
  const popBase = (seed * 0.008 + 1.2).toFixed(1);
  const density = 1500 + (seed * 14);
  const growthRate = ((seed % 8) + 1.4).toFixed(1);
  const netMigration = ((seed % 40) + 10).toFixed(1);
  const inflowOrigin = ['California', 'New York', 'Texas', 'Illinois', 'Florida', 'Washington'][seed % 6];
  const demographic = ['Millennial', 'Gen Z', 'Young Professional', 'Families'][seed % 4];

  return (
    <div className="absolute inset-0 animate-fade-in bg-surface">
      {/* Map Segment - Background */}
      <DensityMap metric={metric} />

      {/* Header Overlay */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="glass-panel px-4 py-3 rounded-xl border border-outline-variant/20 shadow-sm backdrop-blur-md bg-surface-container-low/80">
          <h1 className="text-xl font-bold font-headline tracking-tight text-on-surface">
            Market Density
          </h1>
          <p className="text-on-surface-variant mt-0.5 text-[10px] uppercase font-bold tracking-widest">
            {(marketInfo && marketInfo.name) || 'Market'}
          </p>
        </div>
      </div>

      {/* Toggle Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="glass-panel p-1.5 rounded-xl border border-outline-variant/20 flex gap-1 shadow-md backdrop-blur-xl bg-surface-container-low/80">
          <button
            onClick={() => setMetric('population')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              metric === 'population'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface hover:bg-surface-variant'
            }`}
          >
            Population Density
          </button>
          <button
            onClick={() => setMetric('migration')}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              metric === 'migration'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface hover:bg-surface-variant'
            }`}
          >
            Migration Flows
          </button>
        </div>
      </div>

      {/* Statistics Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-none">
        {metric === 'population' ? (
          <>
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 flex flex-col justify-between bg-surface-container-low/80 backdrop-blur-xl shadow-lg pointer-events-auto h-28">
              <div>
                <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Estimated Area Population</span>
                <h3 className="text-2xl font-headline font-extrabold text-on-surface">{popBase}M</h3>
              </div>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                Positive YoY Trend
              </span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 flex flex-col justify-between bg-surface-container-low/80 backdrop-blur-xl shadow-lg pointer-events-auto h-28">
              <div>
                <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Core Density</span>
                <h3 className="text-2xl font-headline font-extrabold text-on-surface">{density.toLocaleString()} <span className="text-sm font-normal text-on-surface-variant">/ sq mi</span></h3>
              </div>
              <span className="text-xs text-outline font-medium">Highly concentrated downtown</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 flex flex-col justify-between bg-surface-container-low/80 backdrop-blur-xl shadow-lg pointer-events-auto h-28">
              <div>
                <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Growth Rate (5yr)</span>
                <h3 className="text-2xl font-headline font-extrabold text-on-surface">+{growthRate}%</h3>
              </div>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                Above national average
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 flex flex-col justify-between bg-surface-container-low/80 backdrop-blur-xl shadow-lg pointer-events-auto h-28">
              <div>
                <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Net Domestic Migration</span>
                <h3 className="text-2xl font-headline font-extrabold text-on-surface">+{netMigration}K</h3>
              </div>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">south_east</span>
                Strong Inflow
              </span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 flex flex-col justify-between bg-surface-container-low/80 backdrop-blur-xl shadow-lg pointer-events-auto h-28">
              <div>
                <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Top Origin State</span>
                <h3 className="text-2xl font-headline font-extrabold text-on-surface">{inflowOrigin}</h3>
              </div>
              <span className="text-xs text-outline font-medium">~30% of total inflow</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 flex flex-col justify-between bg-surface-container-low/80 backdrop-blur-xl shadow-lg pointer-events-auto h-28">
              <div>
                <span className="text-[10px] font-label text-outline uppercase tracking-wider mb-1 block">Demographic Shift</span>
                <h3 className="text-2xl font-headline font-extrabold text-on-surface">{demographic}</h3>
              </div>
              <span className="text-xs text-outline font-medium">Largest growing cohort</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
