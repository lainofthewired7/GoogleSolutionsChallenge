/**
 * JobGrowthView — Full-page Job Growth Analytics terminal.
 *
 * Matches the obsidian dark design from the reference mockup,
 * powered by live FRED API data (BLS employment for Austin MSA).
 */

import { useState, useEffect } from 'react';
import { useJobGrowthData } from '../hooks/useJobGrowthData';
import type { ObservationPoint, SectorData } from '../services/fred';
import GenerateInsightsModal from './GenerateInsightsModal';
import { generateMarketVelocity } from '../utils/gemini';
import { useAppContext } from '../context/AppContext';

/* ════════════════════════════════════════════
 *  Helper: build SVG polyline from data
 * ════════════════════════════════════════════ */

function buildPolyline(
  points: ObservationPoint[],
  width: number,
  height: number,
  padding = 10,
): string {
  if (points.length < 2) return '';

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  return points
    .map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
      const y = padding + (1 - (p.value - minVal) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');
}

/* Sparkline for the small sector cards */
function buildSparkline(
  points: ObservationPoint[],
  width: number,
  height: number,
): string {
  // Use just the last 24 data points for sparklines
  const recent = points.slice(-24);
  return buildPolyline(recent, width, height, 2);
}

/* ════════════════════════════════════════════
 *  Sub-components
 * ════════════════════════════════════════════ */

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 rounded-xl">
      <span className="material-symbols-outlined text-5xl text-primary animate-pulse">
        trending_up
      </span>
      <div className="text-on-surface-variant text-sm font-label uppercase tracking-widest">
        Loading FRED Data…
      </div>
      <div className="w-48 h-1 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-[shimmer_1.5s_ease-in-out_infinite] w-1/3 rounded-full" />
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="col-span-12 p-6 bg-error-container/20 border border-error/20 rounded-xl text-error flex items-center gap-3">
      <span className="material-symbols-outlined">error</span>
      <div>
        <p className="font-bold">Failed to load job growth data</p>
        <p className="text-sm opacity-80">{message}</p>
      </div>
    </div>
  );
}

/* ── Hero Chart ── */

function HeroChart({
  infoSector,
  mfgSector,
  profSector,
}: {
  infoSector: SectorData | undefined;
  mfgSector: SectorData | undefined;
  profSector: SectorData | undefined;
}) {
  const w = 800;
  const h = 300;

  // Generate year labels from data
  const dates = infoSector?.observations.map((o) => o.date) ?? [];
  const years = [...new Set(dates.map((d) => d.slice(0, 4)))];
  const yearLabels = years.filter((_, i) => i % 1 === 0); // show all years

  return (
    <section className="col-span-12 lg:col-span-8 bg-surface-container-low obsidian-glow rounded-xl p-8 relative overflow-hidden group">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold font-headline text-on-surface">
              Job Growth Velocity
            </h3>
            <p className="text-on-surface-variant text-sm">
              5-Year Sector Employment Trajectory (Thousands)
            </p>
          </div>
          <div className="flex gap-5 text-xs font-label">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-primary" /> Information (Tech)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-tertiary" /> Manufacturing
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-secondary" /> Prof Services
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[300px] flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${w} ${h + 30}`}>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                x2={w}
                y1={i * (h / 4)}
                y2={i * (h / 4)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-outline-variant/10"
              />
            ))}

            {/* Year labels */}
            {yearLabels.map((year, i) => (
              <text
                key={year}
                x={10 + (i / (yearLabels.length - 1)) * (w - 20)}
                y={h + 24}
                className="fill-on-surface-variant text-[11px] font-label"
                textAnchor="middle"
              >
                {year}
              </text>
            ))}

            {/* Data lines */}
            {infoSector && infoSector.observations.length > 1 && (
              <>
                <polyline
                  points={buildPolyline(infoSector.observations, w, h)}
                  fill="none"
                  stroke="#81ecff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Glow duplicate */}
                <polyline
                  points={buildPolyline(infoSector.observations, w, h)}
                  fill="none"
                  stroke="#81ecff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.15"
                />
              </>
            )}
            {mfgSector && mfgSector.observations.length > 1 && (
              <polyline
                points={buildPolyline(mfgSector.observations, w, h)}
                fill="none"
                stroke="#a68cff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {profSector && profSector.observations.length > 1 && (
              <polyline
                points={buildPolyline(profSector.observations, w, h)}
                fill="none"
                stroke="#d8e3fb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Ambient gradient */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all duration-700" />
    </section>
  );
}

/* ── Growth Projection Widget ── */

function GrowthProjection({ 
  totalSector, 
  marketName,
  velocitySummary,
  velocityLoading
}: { 
  totalSector: SectorData | undefined;
  marketName: string;
  velocitySummary: string | null;
  velocityLoading: boolean;
}) {
  const yoy = totalSector?.yoy_growth_pct;
  const displayPct = yoy != null ? `${yoy > 0 ? '+' : ''}${yoy}%` : '—';
  const latestDate = totalSector?.latest_date
    ? new Date(totalSector.latest_date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '';
  const barWidth = yoy != null ? Math.min(Math.abs(yoy) * 10, 100) : 0;

  return (
    <section className="col-span-12 lg:col-span-4 bg-gradient-to-br from-surface-container-high to-surface-container-low obsidian-glow rounded-xl p-8 flex flex-col justify-between border border-primary/5">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-sm">
            precision_manufacturing
          </span>
          <h3 className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
            Total Nonfarm YoY Growth
          </h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-headline font-extrabold text-primary">
            {displayPct}
          </span>
          <span className="text-on-surface-variant text-sm font-label">YoY</span>
        </div>
      </div>
      <div className="mt-8">
        <p className="text-on-surface text-sm mb-4">
          Latest data:{' '}
          <span className="text-primary-fixed-dim">{latestDate}</span>
        </p>
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary shadow-[0_0_12px_rgba(129,236,255,0.4)] transition-all duration-1000 ease-out"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <p className="text-on-surface-variant text-xs mt-4 leading-relaxed">
          {velocityLoading ? (
            <span className="flex items-center gap-2 animate-pulse text-primary font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Synthesizing Labor Velocity...
            </span>
          ) : (
             velocitySummary || `Total nonfarm employment for ${marketName}. Data sourced from BLS via FRED.`
          )}
        </p>
      </div>
    </section>
  );
}

/* ── Sector Card ── */

function SectorCard({
  sector,
  colorClass,
  bgClass,
  strokeColor,
}: {
  sector: SectorData;
  colorClass: string;
  bgClass: string;
  strokeColor: string;
}) {
  const yoy = sector.yoy_growth_pct;
  const growthLabel = yoy != null ? `${yoy > 0 ? '+' : ''}${yoy}%` : '—';
  const latestVal = sector.latest_value;
  const displayVal =
    latestVal != null
      ? latestVal >= 100
        ? `${Math.round(latestVal).toLocaleString()}`
        : `${latestVal.toFixed(1)}`
      : '—';
  const netChange = sector.yoy_net_change;
  const changeLabel =
    netChange != null
      ? `${netChange > 0 ? '+' : ''}${netChange.toFixed(1)}K YoY`
      : '';

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 group hover:bg-surface-container-high transition-colors duration-200">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-2 ${bgClass} rounded-lg ${colorClass}`}>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {sector.icon}
          </span>
        </div>
        <span className={`${colorClass} font-bold`}>{growthLabel}</span>
      </div>
      <h4 className="text-on-surface font-bold text-lg mb-1">{sector.title}</h4>
      <p className="text-5xl font-headline font-bold text-on-surface my-4">
        {displayVal}
        <span className="text-lg text-on-surface-variant ml-1">K</span>
      </p>
      <p className="text-on-surface-variant text-sm">{changeLabel}</p>
      <div className="mt-6 h-8 w-full bg-surface-container-highest rounded flex items-center px-1">
        <svg className="w-full h-4 overflow-visible" viewBox="0 0 200 20">
          {sector.observations.length > 1 && (
            <polyline
              points={buildSparkline(sector.observations, 200, 20)}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

/* ── Unemployment Rate Chart ── */

function UnemploymentChart({
  observations,
  latestValue,
  latestDate,
  yoyChange,
  marketName,
}: {
  observations: ObservationPoint[];
  latestValue: number | null;
  latestDate: string | null;
  yoyChange: number | null;
  marketName: string;
}) {
  const w = 600;
  const h = 240;

  // Year labels
  const years = [...new Set(observations.map((o) => o.date.slice(0, 4)))];

  return (
    <section className="col-span-12 lg:col-span-5 bg-surface-container-low rounded-xl p-6 border border-outline-variant/5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-on-surface font-bold font-headline">Unemployment Rate</h3>
          <p className="text-on-surface-variant text-xs">{marketName}</p>
        </div>
        <div className="flex items-center gap-3">
          {latestValue != null && (
            <span className="text-2xl font-headline font-extrabold text-on-surface">
              {latestValue}%
            </span>
          )}
          {yoyChange != null && (
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${
                yoyChange <= 0
                  ? 'bg-primary/10 text-primary'
                  : 'bg-error/10 text-error'
              }`}
            >
              {yoyChange > 0 ? '+' : ''}
              {yoyChange}% YoY
            </span>
          )}
        </div>
      </div>
      <div className="relative h-60 w-full">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${w} ${h + 30}`}>
          {/* Grid */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="0"
              x2={w}
              y1={i * (h / 3)}
              y2={i * (h / 3)}
              stroke="currentColor"
              strokeWidth="1"
              className="text-outline-variant/10"
            />
          ))}

          {/* Year labels */}
          {years.map((year, i) => (
            <text
              key={year}
              x={10 + (i / (years.length - 1)) * (w - 20)}
              y={h + 24}
              className="fill-on-surface-variant text-[11px] font-label"
              textAnchor="middle"
            >
              {year}
            </text>
          ))}

          {/* Area fill */}
          {observations.length > 1 && (
            <>
              <defs>
                <linearGradient id="unempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff716c" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ff716c" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={`${buildPolyline(observations, w, h)} ${w - 10},${h} 10,${h}`}
                fill="url(#unempGrad)"
              />
              <polyline
                points={buildPolyline(observations, w, h)}
                fill="none"
                stroke="#ff716c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}
        </svg>
      </div>
      {latestDate && (
        <p className="text-on-surface-variant text-xs mt-2 text-right">
          As of {new Date(latestDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      )}
    </section>
  );
}

/* ── Sector Table ── */

function SectorTable({ sectors }: { sectors: Record<string, SectorData> }) {
  const rows = Object.entries(sectors).sort((a, b) => {
    const va = a[1].latest_value ?? 0;
    const vb = b[1].latest_value ?? 0;
    return vb - va; // largest first
  });

  return (
    <section className="col-span-12 lg:col-span-7 bg-surface-container-low rounded-xl p-6 border border-outline-variant/5">
      <h3 className="text-on-surface font-bold font-headline mb-6">
        Sector Employment Breakdown
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant/10 text-on-surface-variant font-label text-xs uppercase tracking-widest">
              <th className="pb-4 font-medium">Sector</th>
              <th className="pb-4 font-medium text-center">Employment (K)</th>
              <th className="pb-4 font-medium text-center">YoY Change</th>
              <th className="pb-4 font-medium text-right">Growth</th>
            </tr>
          </thead>
          <tbody className="text-on-surface">
            {rows.map(([key, sector]) => {
              const yoy = sector.yoy_growth_pct;
              const isPositive = yoy != null && yoy > 0;
              const isNegative = yoy != null && yoy < 0;
              return (
                <tr
                  key={key}
                  className="group hover:bg-surface-container-high/50 transition-colors border-t border-outline-variant/5"
                >
                  <td className="py-4 font-bold flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-on-surface-variant"
                      style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}
                    >
                      {sector.icon}
                    </span>
                    {sector.title}
                  </td>
                  <td className="py-4 text-center font-headline">
                    {sector.latest_value != null
                      ? sector.latest_value.toLocaleString(undefined, {
                          maximumFractionDigits: 1,
                        })
                      : '—'}
                  </td>
                  <td className="py-4 text-center">
                    {sector.yoy_net_change != null ? (
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          isPositive
                            ? 'bg-primary/10 text-primary'
                            : isNegative
                              ? 'bg-error/10 text-error'
                              : 'bg-outline-variant/10 text-on-surface-variant'
                        }`}
                      >
                        {sector.yoy_net_change > 0 ? '+' : ''}
                        {sector.yoy_net_change.toFixed(1)}K
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-4 text-right font-headline">
                    {yoy != null ? (
                      <span className={isPositive ? 'text-primary' : isNegative ? 'text-error' : ''}>
                        {yoy > 0 ? '+' : ''}
                        {yoy}%
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
        <p className="text-on-surface-variant text-xs">
          Source: U.S. Bureau of Labor Statistics via FRED
        </p>
        <p className="text-on-surface-variant text-xs">
          Units: Thousands of Persons
        </p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
 *  Main View Component
 * ════════════════════════════════════════════ */

export default function JobGrowthView() {
  const { selectedMarket, marketInfo } = useAppContext();
  const { employment, unemployment, loading, error } = useJobGrowthData(selectedMarket, 5);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [velocitySummary, setVelocitySummary] = useState<string | null>(null);
  const [velocityLoading, setVelocityLoading] = useState(false);

  const sectors = employment?.sectors;
  const infoSector = sectors?.information;
  const mfgSector = sectors?.manufacturing;
  const profSector = sectors?.professional_services;
  const eduSector = sectors?.education_health;
  const totalSector = sectors?.total_nonfarm;

  useEffect(() => {
    if (totalSector?.latest_value != null && totalSector?.yoy_growth_pct != null) {
      const context = `Market: ${marketInfo?.name || selectedMarket}. Total Employment: ${totalSector.latest_value}K. Growth: ${totalSector.yoy_growth_pct}%. Unemployment: ${unemployment?.latest_value || 'N/A'}%.`;
      setVelocityLoading(true);
      generateMarketVelocity(context).then(summary => {
        setVelocitySummary(summary);
        setVelocityLoading(false);
      });
    }
  }, [selectedMarket, totalSector, unemployment, marketInfo]);

  return (
    <div className="absolute inset-0 bg-surface text-on-surface z-10 w-full h-full overflow-y-auto">
      <main className="p-8 relative">
        {loading && <LoadingOverlay />}

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
                {employment?.market || 'Loading...'}
              </h1>
              <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">
                Job Growth Analytics Terminal
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setInsightsOpen(true)}
                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg flex items-center gap-2 text-sm font-bold border border-primary/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Generate Insights
              </button>
              <div className="px-4 py-2 bg-surface-container-high rounded-lg flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(129,236,255,0.8)]" />
                <span className="text-on-surface/80">Live FRED Data</span>
              </div>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 pb-8">
          {error && <ErrorBanner message={error} />}

          {/* Hero Chart + Growth Projection */}
          {sectors && (
            <>
              <HeroChart
                infoSector={infoSector}
                mfgSector={mfgSector}
                profSector={profSector}
              />
              <GrowthProjection 
                totalSector={totalSector} 
                marketName={employment?.market || ''} 
                velocitySummary={velocitySummary}
                velocityLoading={velocityLoading}
              />
            </>
          )}

          {/* Sector Cards */}
          {sectors && (
            <section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {infoSector && (
                <SectorCard
                  sector={infoSector}
                  colorClass="text-primary"
                  bgClass="bg-primary/10"
                  strokeColor="#81ecff"
                />
              )}
              {mfgSector && (
                <SectorCard
                  sector={mfgSector}
                  colorClass="text-tertiary"
                  bgClass="bg-tertiary/10"
                  strokeColor="#a68cff"
                />
              )}
              {eduSector && (
                <SectorCard
                  sector={eduSector}
                  colorClass="text-secondary"
                  bgClass="bg-secondary/10"
                  strokeColor="#d8e3fb"
                />
              )}
            </section>
          )}

          {/* Unemployment Chart + Sector Table */}
          {unemployment && (
            <UnemploymentChart
              observations={unemployment.observations}
              latestValue={unemployment.latest_value}
              latestDate={unemployment.latest_date}
              yoyChange={unemployment.yoy_change}
              marketName={unemployment.market}
            />
          )}
          {sectors && <SectorTable sectors={sectors} />}
        </div>
      </main>

      <GenerateInsightsModal 
        isOpen={insightsOpen} 
        onClose={() => setInsightsOpen(false)} 
        title="Labor Market Insights"
        contextData={`Market: ${marketInfo?.name || selectedMarket}. Total Employment: ${totalSector?.latest_value}K, Growth: ${totalSector?.yoy_growth_pct}%, Unemployment: ${unemployment?.latest_value}%. Sectors: Information ${sectors?.information?.yoy_growth_pct}%, Mfg ${sectors?.manufacturing?.yoy_growth_pct}%.`}
      />
    </div>
  );
}
 