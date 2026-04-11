import React from 'react';

interface KPI {
  label: string;
  value: string;
  trend?: string;
}

interface Project {
  name: string;
  address: string;
  type: string;
  valuation: string;
  status: string;
}

interface Submarket {
  zip: string;
  value: number;
}

interface MarketReportProps {
  marketName: string;
  type: 'permits' | 'rent';
  marketInfo?: any;
  kpis: KPI[];
  projects?: Project[];
  submarkets?: Submarket[];
  insights?: string;
  date?: string;
}

const MarketReport: React.FC<MarketReportProps> = ({
  marketName,
  type,
  marketInfo,
  kpis,
  projects,
  submarkets,
  insights,
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}) => {
  return (
    <div className="w-[210mm] min-h-[297mm] p-[20mm] bg-white text-slate-900 font-sans leading-normal">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Market Intelligence Stat Sheet</p>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
            {marketName} <span className="text-teal-600 font-light">{type === 'permits' ? 'Pipeline' : 'Benchmarks'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">{marketInfo?.state_code || 'USA'} · {date}</p>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            PROJECTR ANALYTICS
          </div>
          <p className="text-[8px] text-slate-400 mt-2">REPORT_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-3 gap-8 mb-10">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="border-l-4 border-teal-600 pl-4 py-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
            {kpi.trend && (
              <p className="text-[10px] font-bold text-teal-700 mt-1">{kpi.trend}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Main Content Section */}
        {type === 'permits' && projects && projects.length > 0 && (
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 mb-4 border-b border-slate-200 pb-2">
              Major Development Pipeline
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900">
                  <th className="py-2 pr-4 font-bold">Project Name</th>
                  <th className="py-2 pr-4 font-bold">Type</th>
                  <th className="py-2 pr-4 font-bold text-right">Valuation</th>
                  <th className="py-2 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((proj, idx) => (
                  <tr key={idx}>
                    <td className="py-3 pr-4">
                      <p className="font-bold">{proj.name}</p>
                      <p className="text-[10px] text-slate-500">{proj.address}</p>
                    </td>
                    <td className="py-3 pr-4 uppercase text-[10px] font-semibold">{proj.type}</td>
                    <td className="py-3 pr-4 text-right font-mono">{proj.valuation}</td>
                    <td className="py-3 text-right font-semibold text-teal-700">{proj.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {type === 'rent' && submarkets && submarkets.length > 0 && (
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 mb-4 border-b border-slate-200 pb-2">
              Submarket Rental Benchmarks
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {submarkets.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 mb-2">ZIP: {item.zip}</p>
                  <p className="text-lg font-black text-slate-900">${item.value.toLocaleString()}</p>
                  <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full" style={{ width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Analysis Section */}
        {insights && (
          <section className="bg-slate-900 p-8 rounded-2xl text-white mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                <span className="material-symbols-outlined text-teal-400 text-sm">auto_awesome</span>
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Projectr AI Strategic Analysis</h3>
            </div>
            <div className="text-sm leading-relaxed text-slate-300 font-light whitespace-pre-line">
              {insights}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center opacity-50">
              <p className="text-[8px] uppercase tracking-widest">Confidential · Beta Market Insights Engine</p>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-teal-500/40" />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-10 text-[8px] text-slate-400 flex justify-between items-end italic">
        <p>© 2026 Projectr Analytics. All data presented as estimated or aggregated from public indices (FRED, Census ACS).</p>
        <p>PAGE 01 / 01</p>
      </div>
    </div>
  );
};

export default MarketReport;
