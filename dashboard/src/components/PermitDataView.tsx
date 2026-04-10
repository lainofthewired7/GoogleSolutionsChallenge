import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getPermits, getProjects } from '../services/api';
import type { MetricStubResponse } from '../types';
import PermitMap from './PermitMap';
import PermitBreakdownChart from './PermitBreakdownChart';
import GenerateInsightsModal from './GenerateInsightsModal';
import { exportToPDF } from '../utils/pdfExport';

export default function PermitDataView() {
  const { selectedMarket, marketInfo } = useAppContext();
  const [permitData, setPermitData] = useState<MetricStubResponse | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportToPDF('permit-report', `${marketInfo?.name || 'Development'}-Pipeline-Report`);
    setExporting(false);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    Promise.all([
      getPermits(selectedMarket),
      getProjects(selectedMarket)
    ])
      .then(([permRes, projRes]) => {
        if (mounted) {
          setPermitData(permRes);
          setProjects(projRes.data || []);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, [selectedMarket]);

  return (
    <div id="permit-report" className="p-8 min-h-screen bg-background">
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <nav className="flex gap-2 text-xs text-on-surface-variant mb-2 font-label">
            <span>{marketInfo?.state_code || 'Texas'}</span>
            <span>/</span>
            <span className="text-primary">{marketInfo?.name || 'MSA'}</span>
          </nav>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface">
            {marketInfo?.name || 'Austin–Round Rock'} Development Pipeline
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

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-on-surface-variant text-sm font-medium">Total Permitted Value</p>
            {permitData?.data?.[0]?.source && (
              <span className="text-[8px] bg-surface-variant px-1.5 py-0.5 rounded text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                {permitData.data[0].source}
              </span>
            )}
          </div>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface">
            {loading ? '...' : (permitData?.data?.find(d => d.key === 'valuation')?.value || 'N/A')}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>{loading ? 'Thinking...' : (permitData?.data?.find(d => d.key === 'valuation')?.trend || 'Live Data')}</span>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-on-surface-variant text-sm font-medium">Avg. Approval Time</p>
          </div>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface">
            {loading ? '...' : (permitData?.data?.find(d => d.key === 'approval_time')?.value || 'N/A')}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-error font-bold">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>{loading ? 'Calculating...' : (permitData?.data?.find(d => d.key === 'approval_time')?.trend || 'Market Avg')}</span>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-on-surface-variant text-sm font-medium">
              {permitData?.data?.[0]?.source === 'FRED' ? 'New Units Authorized' : 'Recent Permit Filings'}
            </p>
          </div>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface">
            {loading ? '...' : (permitData?.data?.find(d => d.key === 'filings')?.value || 'N/A')}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
            <span className="material-symbols-outlined text-sm">add_home</span>
            <span>{loading ? 'Scanning...' : (permitData?.data?.find(d => d.key === 'filings')?.trend || 'L12M Activity')}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 bg-surface-container-low rounded-xl overflow-hidden relative min-h-[400px]">
          <PermitMap />
        </div>

        {/* New Permits Issued Chart */}
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-on-surface font-headline font-bold text-lg">New Permits Issued</h3>
            <p className="text-on-surface-variant text-xs mb-6">Residential vs. Commercial (L12M)</p>
          </div>
          <PermitBreakdownChart />
        </div>
      </div>

      {/* Major Active Projects Table */}
      <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 flex justify-between items-center">
          <h3 className="text-on-surface font-headline font-bold text-lg">Major Active Projects</h3>
          <button className="text-primary text-xs font-bold hover:underline">View All Projects</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/30 text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                <th className="px-6 py-3">Project Name</th>
                <th className="px-6 py-3">Permit Type</th>
                <th className="px-6 py-3 text-right">Valuation</th>
                <th className="px-6 py-3">Current Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {projects.map((proj, idx) => (
                <tr key={idx} className="hover:bg-surface-variant/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-high overflow-hidden border border-outline-variant/20">
                        <img 
                          alt={proj.name} 
                          className="w-full h-full object-cover" 
                          src={idx % 2 === 0 ? "/assets/project-1.png" : "/assets/project-2.png"}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">{proj.name}</div>
                        <div className="text-[10px] text-on-surface-variant font-label">{proj.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-tighter">{proj.type}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-headline font-bold text-on-surface">{proj.valuation}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${proj.status.includes('Active') || proj.status.includes('Ground') ? 'bg-primary animate-pulse' : 'bg-surface-variant'}`}></span>
                      <span className="text-xs text-on-surface">{proj.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Floating Filter Trigger (Mobile Only) */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center z-50">
        <span className="material-symbols-outlined">filter_list</span>
      </button>

      <GenerateInsightsModal 
        isOpen={insightsOpen} 
        onClose={() => setInsightsOpen(false)} 
        title="Development Pipeline Insights"
      />
    </div>
  );
}
