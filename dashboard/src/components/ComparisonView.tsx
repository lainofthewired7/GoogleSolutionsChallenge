import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useComparisonData, type ComparisonData } from '../hooks/useComparisonData';

/* ── Progress Bar Helper ── */
function ProgressBar({ label, value, colorClass, bgClass, shadowClass }: { label: string, value: number | null, colorClass: string, bgClass: string, shadowClass?: string }) {
  const displayVal = value != null ? `${value > 0 ? '+' : ''}${value}%` : '—';
  // scale width up for visual effect, max 100%
  const width = value != null ? Math.min(Math.abs(value) * 5, 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-label">
        <span className="text-on-surface-variant font-medium">{label}</span>
        <span className={`font-bold ${colorClass}`}>{displayVal}</span>
      </div>
      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <div 
          className={`h-full ${bgClass} rounded-full ${shadowClass || ''} transition-all duration-1000 ease-out`} 
          style={{ width: `${width}%` }} 
        />
      </div>
    </div>
  );
}

/* ── Market Column Component ── */
function MarketColumn({
  data,
  colorScheme,
  labelName,
  imageSrc
}: {
  data: ComparisonData;
  colorScheme: 'primary' | 'tertiary';
  labelName: string;
  imageSrc?: string;
}) {
  const accentClass = colorScheme === 'primary' ? 'text-primary' : 'text-tertiary';
  const accentBgClass = colorScheme === 'primary' ? 'bg-primary' : 'bg-tertiary';
  const shadowClass = colorScheme === 'primary' 
    ? 'shadow-[0_0_12px_rgba(129,236,255,0.4)]' 
    : 'shadow-[0_0_12px_rgba(166,140,255,0.4)]';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden h-64 group mb-10 border border-outline-variant/10">
        {imageSrc ? (
          <img 
            alt={data.marketName} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            src={imageSrc} 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface-container-low group-hover:scale-110 transition-transform duration-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        <div className="absolute bottom-6 left-6">
          <div className={`flex items-center gap-2 ${accentClass} mb-1`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <span className="font-label text-[10px] uppercase font-bold tracking-widest">{labelName}</span>
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface">{data.marketName}</h2>
        </div>
        
        {data.loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <span className={`material-symbols-outlined ${accentClass} animate-spin text-4xl`}>sync</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/5">
          <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider block mb-4">HUD 2-Bedroom FMR</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-bold text-on-surface">{data.rent}</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/5">
          <span className="text-on-surface-variant font-label text-xs uppercase tracking-wider block mb-4">Unemployment</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-bold text-on-surface">{data.unemployment}</span>
            <span className={`text-sm font-bold font-label ${data.unemploymentTrend.includes('-') ? 'text-primary-dim' : 'text-error-dim'}`}>
              {data.unemploymentTrend}
            </span>
          </div>
        </div>
      </div>

      {/* Total Job Growth Card */}
      <div className="bg-[#141f38]/50 backdrop-blur-md p-8 rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${accentClass} flex items-center justify-center`} style={{ backgroundColor: colorScheme === 'primary' ? 'rgba(129,236,255,0.1)' : 'rgba(166,140,255,0.1)' }}>
              <span className="material-symbols-outlined">insights</span>
            </div>
            <h3 className="font-headline font-bold text-lg">Total Nonfarm Job Growth</h3>
          </div>
          <span className="text-xs font-label text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full">YoY</span>
        </div>
        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-6xl font-headline font-black text-on-surface drop-shadow-lg">{data.jobGrowth}</span>
        </div>
        {/* Abstract glow */}
        <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${accentBgClass} rounded-full blur-[80px] opacity-20 pointer-events-none`} />
      </div>

      {/* Job Growth Velocity (Sectors) */}
      <div className="p-8 rounded-3xl bg-surface-container-high border border-outline-variant/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${accentClass} flex items-center justify-center`} style={{ backgroundColor: colorScheme === 'primary' ? 'rgba(129,236,255,0.1)' : 'rgba(166,140,255,0.1)' }}>
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <h3 className="font-headline font-bold text-lg">Job Growth Velocity</h3>
          </div>
        </div>
        <div className="space-y-6">
          <ProgressBar label="Tech & Information" value={data.sectors.tech} colorClass={accentClass} bgClass={accentBgClass} shadowClass={shadowClass} />
          <ProgressBar label="Manufacturing" value={data.sectors.mfg} colorClass={accentClass} bgClass={`${accentBgClass}/70`} />
          <ProgressBar label="Professional Services" value={data.sectors.prof} colorClass={accentClass} bgClass={`${accentBgClass}/40`} />
        </div>
      </div>
    </div>
  );
}

export default function ComparisonView() {
  const { markets } = useAppContext();
  const [leftCode, setLeftCode] = useState('austin');
  const [rightCode, setRightCode] = useState('dallas');

  const leftData = useComparisonData(leftCode);
  const rightData = useComparisonData(rightCode);

  return (
    <div className="bg-background font-body w-full h-[calc(100vh-64px)] overflow-y-auto text-on-surface selection:bg-primary/30 selection:text-primary pb-20">
      <div className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Header */}
        <div className="mb-12 flex justify-between items-end">
          <div className="max-w-2xl">
            <span className="font-label text-xs tracking-widest text-primary font-bold uppercase mb-2 block">
              Analytical Lens
            </span>
            <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tighter mb-2">
              Market Comparison
            </h1>
            <p className="text-on-surface-variant font-body text-lg max-w-lg">
              Side-by-side performance audit powered by live FRED and HUD feeds.
            </p>
          </div>
          <div className="flex gap-4">
             <Link to="/" className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant/15 text-on-surface text-sm font-medium hover:bg-surface-container-highest transition-all flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">arrow_back</span>
               Back to Dashboard
             </Link>
          </div>
        </div>

        {/* Market Selectors Wrapper */}
        <div className="bg-[#091328]/80 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/10 shadow-xl mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex-1 w-full relative z-10">
            <label className="block text-xs font-label text-outline uppercase tracking-widest mb-2 font-bold ml-1">Market Alpha</label>
            <div className="relative">
              <select
                className="w-full bg-[#141f38] border border-outline-variant/30 rounded-xl py-3 pl-4 pr-10 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none shadow-sm font-headline font-bold text-lg cursor-pointer"
                value={leftCode}
                onChange={(e) => setLeftCode(e.target.value)}
              >
                <option value="">Select market...</option>
                {markets.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}, {m.state}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-primary">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border border-outline-variant/20 shadow-[0_0_20px_rgba(129,236,255,0.05)] bg-[#192540] z-10 relative mt-6 md:mt-0">
            <span className="text-primary font-headline font-black text-xs tracking-widest">VS</span>
          </div>

          <div className="flex-1 w-full relative z-10">
            <label className="block text-xs font-label text-outline uppercase tracking-widest mb-2 font-bold ml-1">Market Beta</label>
            <div className="relative">
              <select
                className="w-full bg-[#141f38] border border-outline-variant/30 rounded-xl py-3 pl-4 pr-10 text-on-surface focus:outline-none focus:ring-1 focus:ring-tertiary/50 appearance-none shadow-sm font-headline font-bold text-lg cursor-pointer"
                value={rightCode}
                onChange={(e) => setRightCode(e.target.value)}
              >
                <option value="">Select market...</option>
                {markets.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}, {m.state}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-tertiary">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative animate-fade-in-up">
          {/* Central VS Divider (Visual Only) */}
          <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-outline-variant/20 to-transparent items-center justify-center z-10 pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-[#060e20] flex items-center justify-center border border-outline-variant/30 text-outline-variant text-[10px] font-bold"></div>
          </div>

          {/* Left Column */}
          {leftCode ? (
            <MarketColumn 
              data={leftData} 
              colorScheme="primary" 
              labelName="Market Alpha"
              imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBbESSucniPJUVGemxHLPnpYRlxpKBF7NQeW4wHIvdbhcrSp5ucDf3W2lwijFxEgD1EHSj4UTBMKnbr92DQ8J0K8RPby_MATFx3oneF0ct2wdxc0OzAOEyucF4Wleqp3AKFTOPRGn-RWAWtS2QBkKFQtR1lVdhf6dDOMmTh8sX4Rf_jbHLvXXU5QV_Zw35WmsaeZ6aFCmHmnTWCzcKULH2ssfgySPYckLIwY2beUmcE06RkWV9KHKDVaViUn9Nqs6k8BymfaCQ1pUg"
            />
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-outline-variant/20 rounded-3xl p-12 text-center text-outline-variant font-label text-sm uppercase tracking-widest">
              Please Select Market Alpha
            </div>
          )}

          {/* Right Column */}
          {rightCode ? (
            <MarketColumn 
              data={rightData} 
              colorScheme="tertiary" 
              labelName="Market Beta"
              imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCzMfF0osdDmzDn0XJp5kyE5VpAqHnwCIR-urTyZrbcaT8qYkX8CpDPsTYojsWDhLT1ctzwhmyS_gdMVhDw5DhLkL9HFAb6HM_cSY--upMsGIglXCmPxagF0y1fIVh1UsTI3jBNr3sh94PlWwqNP88rtjjaGWD6g59JC88y7rANB76_5ictExL6QeK6T-HALw6XKUnftDWBg34lcs71ptLUNuAoDDbSZg-JdEFDSd0po4P49DFA7VPOareSdJwKyGH9pX0tzmnYjdw"
            />
          ) : (
             <div className="h-full flex items-center justify-center border border-dashed border-outline-variant/20 rounded-3xl p-12 text-center text-outline-variant font-label text-sm uppercase tracking-widest">
              Please Select Market Beta
            </div>
          )}
        </div>

        {/* Detailed Comparison Footnote */}
        <div className="mt-16 bg-gradient-to-r from-[rgba(129,236,255,0.05)] to-[rgba(166,140,255,0.05)] p-8 rounded-3xl border border-outline-variant/10 flex items-center justify-between animate-fade-in-up">
          <div className="flex gap-4 items-center">
            <span className="material-symbols-outlined text-primary text-3xl">verified</span>
            <div>
              <h4 className="font-headline font-bold text-lg text-on-surface">Data Transparency Statement</h4>
              <p className="text-on-surface-variant text-sm mt-1 max-w-3xl leading-relaxed">
                All values above represent precise macro-economic data harvested from the Federal Reserve Economic Data (FRED) API and the HUD Fair Market Rent surveys.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
