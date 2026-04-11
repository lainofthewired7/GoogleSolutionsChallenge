/**
 * RentAnalyticsView — provides market-level rent metrics, historical trends, and vacancy data.
 * Adopts the Obsidian Flux bento-grid design.
 */

import { useRentData } from '../hooks/useRentData';
import { useAppContext } from '../context/AppContext';
import GenerateInsightsModal from './GenerateInsightsModal';
import { useState } from 'react';
import { exportToPDF } from '../utils/pdfExport';

export default function RentAnalyticsView() {
  const { selectedMarket } = useAppContext();
  const { fmr, trend, vacancy, heatmap, loading, error } = useRentData(selectedMarket);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportToPDF('rent-report', `${selectedMarket}-Rent-Performance-Report`);
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface/60 font-medium animate-pulse">Analyzing rental markets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-error/10 border border-error/20 rounded-2xl p-6 text-center">
          <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
          <h3 className="text-on-surface font-bold">Failed to load rent analytics</h3>
          <p className="text-on-surface/60 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const latestRent = fmr?.data?.[0]?.value || 'N/A';
  const rentGrowth = trend?.yoy_growth_pct != null ? `${trend.yoy_growth_pct > 0 ? '+' : ''}${trend.yoy_growth_pct}%` : 'N/A';
  const vacancyRate = vacancy?.data?.[0]?.value || 'N/A';

  return (
    <div id="rent-report" key={selectedMarket} className="flex-1 p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700 bg-background text-on-surface">
      {/* Background Accents */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Section */}
      <header className="flex justify-between items-end mb-10 relative z-10">
        <div>
          <nav className="flex gap-2 text-xs font-label text-outline mb-2">
            <span>Market Intelligence</span> / <span className="text-primary capitalize">{selectedMarket}</span>
          </nav>
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">
            Rent Performance <span className="text-primary font-body font-normal text-2xl ml-2">Analytics</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2 bg-surface-container-highest text-on-surface text-sm font-semibold rounded-md hover:bg-surface-variant transition-colors border border-outline-variant/10 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button 
            onClick={() => setInsightsOpen(true)}
            className="px-5 py-2 bg-[#006A75] text-white text-sm font-bold rounded-md hover:brightness-110 transition-all shadow-sm"
          >
            Generate Insights
          </button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 relative z-10">
        
        {/* KPI: Avg Monthly Rent */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-6 rounded-2xl relative group overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
          <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest mb-4">Baseline Rent (FMR)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-headline text-on-surface">{latestRent}</span>
            <span className="text-sm font-semibold text-primary font-label">/mo</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] text-on-surface-variant uppercase tracking-tight">Fair Market Rent for 2BR Units</p>
          </div>
        </div>

        {/* KPI: YoY Growth */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 border-l-2 border-l-secondary">
          <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest mb-4">Rent Inflation (YoY)</p>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-extrabold font-headline text-secondary">{rentGrowth}</span>
            <div className="bg-secondary/10 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-secondary text-sm align-middle">trending_up</span>
            </div>
          </div>
          <div className="mt-6 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: `${Math.min(Math.abs(trend?.yoy_growth_pct || 0) * 10, 100)}%` }} />
          </div>
        </div>

        {/* KPI: Vacancy */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
          <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest mb-4">Vacancy Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-headline text-tertiary">{vacancyRate}</span>
            <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-4 uppercase tracking-tight">Live from Census ACS Estimates</p>
        </div>

        {/* Main Trend Chart Area */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 relative overflow-hidden flex flex-col min-h-[440px]">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-xl font-bold font-headline text-on-surface">Market Inflation Index</h2>
              <p className="text-sm text-on-surface-variant">CPI for Rent of Primary Residence</p>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-lg">
              <span className="text-primary text-[10px] font-bold uppercase">Index Ref: 1982-1984</span>
            </div>
          </div>

          {/* Simple SVG Bar Chart */}
          <div className="flex-1 w-full flex items-end gap-2 relative min-h-[220px] pb-1 border-b border-primary/20">
            {(() => {
              const observations = trend?.observations.slice(-24) || [];
              if (observations.length === 0) {
                return (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-outline text-xs uppercase tracking-widest">No historical data available</p>
                  </div>
                );
              }

              const values = observations.map(o => o.value);
              const maxVal = Math.max(...values);
              const minVal = Math.min(...values);
              const range = maxVal - minVal;

              return observations.map((obs, i) => {
                const height = range > 0 ? ((obs.value - minVal) / range) * 85 + 10 : 50;

                return (
                  <div key={i} className="flex-1 min-w-[16px] flex flex-col items-center group cursor-help relative h-full z-20">
                    <div className="flex-1 w-full flex items-end overflow-visible">
                      <div 
                        className="w-full bg-primary rounded-t-[3px] transition-all group-hover:scale-y-105 group-hover:brightness-125 duration-300 shadow-[0_0_20px_var(--primary-glow)] border border-white/10"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-3 bg-surface-container-highest px-3 py-2 rounded-xl text-[10px] hidden group-hover:block whitespace-nowrap border border-outline-variant/30 z-50 shadow-2xl backdrop-blur-xl ring-1 ring-primary/20">
                      <p className="font-black text-on-surface tracking-tight">{obs.date}</p>
                      <p className="text-primary font-bold">Index Value: {obs.value.toFixed(1)}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          
          <div className="flex justify-between mt-8 px-2 text-[10px] font-label text-outline uppercase tracking-widest font-bold">
            <span>{trend?.observations && trend.observations.length > 0 ? (trend.observations.length > 24 ? trend.observations[trend.observations.length - 24].date.split('-')[0] : trend.observations[0].date.split('-')[0]) : '—'}</span>
            <span>Current Period</span>
          </div>
        </div>

        {/* Insights Card */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">insights</span>
              </div>
              <h2 className="text-xl font-bold font-headline text-on-surface">Market Velocity</h2>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              The rental market in <span className="text-on-surface font-bold capitalize">{selectedMarket}</span> shows a {trend?.yoy_growth_pct && trend.yoy_growth_pct > 2 ? 'sustained upward' : 'moderate'} trend in inflation-adjusted rents. Housing pressure remains {parseFloat(vacancyRate) < 5 ? 'tight' : 'stable'} relative to supply.
            </p>
          </div>
          <div className="space-y-4">
             <div className="glass-panel p-4 rounded-xl border border-outline-variant/10">
                <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Source Methodology</p>
                <p className="text-[12px] text-on-surface-variant">Data aggregated from HUD ZIP-level estimators and BLS Consumer Price Index mappings.</p>
             </div>
          </div>
        </div>

        {/* ZIP-Level Submarket Card */}
        <div className="col-span-12 lg:col-span-12 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[120px]">location_on</span>
           </div>
           
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
              <div>
                 <h2 className="text-2xl font-black font-headline text-on-surface tracking-tight">Top Submarket Concentration</h2>
                 <p className="text-sm text-on-surface-variant">Aggregated ZIP-level rental flux (Census ACS ZCTA Estimates)</p>
              </div>
              <div className="flex gap-2 items-center">
                 <button className="bg-primary/10 text-primary text-[10px] font-bold px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors">VIEW RENT HEATMAP</button>
                 <button className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-4 py-2 rounded-full hover:bg-surface-variant transition-colors">DOWNLOAD CSV</button>
                 <button className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:bg-surface-variant transition-colors border border-outline-variant/10 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {heatmap?.data && heatmap.data.length > 0 ? (
                heatmap.data
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((item, idx) => (
                    <div key={item.zip} className="glass-panel p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/40 transition-all group/zip">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[10px] font-bold text-outline">#{idx + 1}</span>
                           <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{item.zip}</span>
                        </div>
                        <p className="text-2xl font-black font-headline text-on-surface mb-1">${item.value.toLocaleString()}</p>
                        <p className="text-[10px] text-outline uppercase tracking-wider">Median Gross Rent</p>
                        <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                           <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${heatmap.data?.[0]?.value ? (item.value / heatmap.data[0].value) * 100 : 0}%` }} />
                        </div>
                    </div>
                  ))
              ) : (
                <div className="col-span-5 relative h-[320px] rounded-3xl overflow-hidden border border-outline-variant/10 group flex items-center justify-center bg-surface-container-low">
                   <img 
                      src="/assets/rent-heatmap.png" 
                      alt="Rent Heatmap Stream" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80" />
                   <div className="relative text-center p-8 backdrop-blur-sm bg-surface-container-low/40 rounded-2xl border border-white/5 shadow-2xl">
                      <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 animate-pulse">Initializing Data Stream</p>
                      <h3 className="text-on-surface font-headline font-bold text-lg mb-1">Submarket Analytics</h3>
                      <p className="text-on-surface-variant text-xs max-w-[240px]">Connecting to Census ACS ZCTA real-time rental flux indices...</p>
                   </div>
                </div>
              )}
           </div>
        </div>

      </div>
      
      <GenerateInsightsModal 
        isOpen={insightsOpen} 
        onClose={() => setInsightsOpen(false)} 
        title="Rent Performance Insights"
      />
    </div>
  );
}
