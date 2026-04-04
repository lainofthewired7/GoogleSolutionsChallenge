/**
 * ComparisonView — side-by-side market comparison page.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import * as api from '../services/api';
import type { MarketInfo } from '../types';
import MetricChart from './MetricChart';

interface MarketMetrics {
  medianRent: string;
  permitsYTD: string;
  vacancyRate: string;
  jobGrowth: string;
}

const EMPTY_METRICS: MarketMetrics = {
  medianRent: '—',
  permitsYTD: '—',
  vacancyRate: '—',
  jobGrowth: '—',
};

export default function ComparisonView() {
  const { markets } = useAppContext();
  const [leftCode, setLeftCode] = useState('austin');
  const [rightCode, setRightCode] = useState('');
  const [leftInfo, setLeftInfo] = useState<MarketInfo | null>(null);
  const [rightInfo, setRightInfo] = useState<MarketInfo | null>(null);
  const [leftMetrics, setLeftMetrics] = useState<MarketMetrics>(EMPTY_METRICS);
  const [rightMetrics, setRightMetrics] = useState<MarketMetrics>(EMPTY_METRICS);

  const loadMetrics = useCallback(
    async (code: string): Promise<MarketMetrics> => {
      try {
        const [rents, permits, vacancy, jobs] = await Promise.all([
          api.getRents(code),
          api.getPermits(code),
          api.getVacancy(code),
          api.getJobGrowth(code),
        ]);
        const r = rents.data?.[0] as Record<string, unknown> | undefined;
        const v = vacancy.data?.[0] as Record<string, unknown> | undefined;
        const j = jobs.data?.[0] as Record<string, unknown> | undefined;
        return {
          medianRent:
            r?.value != null
              ? `$${Number(r.value).toLocaleString()}`
              : '—',
          permitsYTD:
            permits.data?.length?.toString() ?? '—',
          vacancyRate:
            v?.value != null
              ? `${v.value}%`
              : '—',
          jobGrowth:
            j?.value != null
              ? `${Number(j.value) > 0 ? '+' : ''}${j.value}%`
              : '—',
        };
      } catch {
        return EMPTY_METRICS;
      }
    },
    [],
  );

  useEffect(() => {
    if (leftCode) {
      api.getMarket(leftCode).then(setLeftInfo).catch(() => {});
      loadMetrics(leftCode).then(setLeftMetrics);
    }
  }, [leftCode, loadMetrics]);

  useEffect(() => {
    if (rightCode) {
      api.getMarket(rightCode).then(setRightInfo).catch(() => {});
      loadMetrics(rightCode).then(setRightMetrics);
    } else {
      setRightInfo(null);
      setRightMetrics(EMPTY_METRICS);
    }
  }, [rightCode, loadMetrics]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background pt-16 font-body">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant/20">
          <div>
            <Link to="/" className="text-primary hover:text-primary-dim transition-colors text-sm font-bold flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Dashboard
            </Link>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Market Comparison View</h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-lg">
          <div className="flex-1 w-full relative">
            <label className="block text-xs font-label text-outline uppercase tracking-wider mb-2 font-semibold">Primary Market (A)</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl py-3 pl-4 pr-10 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none shadow-sm font-medium"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="material-symbols-outlined text-outline">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 bg-surface-container-highest w-12 h-12 rounded-full flex items-center justify-center border border-outline-variant/20 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
            <span className="text-outline font-bold text-sm tracking-widest">VS</span>
          </div>

          <div className="flex-1 w-full relative">
            <label className="block text-xs font-label text-outline uppercase tracking-wider mb-2 font-semibold">Secondary Market (B)</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl py-3 pl-4 pr-10 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none shadow-sm font-medium"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="material-symbols-outlined text-outline">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <MetricChart
            label="Median Rent"
            leftValue={leftMetrics.medianRent}
            rightValue={rightMetrics.medianRent}
            leftName={leftInfo?.name ?? '—'}
            rightName={rightInfo?.name ?? '—'}
          />
          <MetricChart
            label="Permits YTD"
            leftValue={leftMetrics.permitsYTD}
            rightValue={rightMetrics.permitsYTD}
            leftName={leftInfo?.name ?? '—'}
            rightName={rightInfo?.name ?? '—'}
          />
          <MetricChart
            label="Vacancy Rate"
            leftValue={leftMetrics.vacancyRate}
            rightValue={rightMetrics.vacancyRate}
            leftName={leftInfo?.name ?? '—'}
            rightName={rightInfo?.name ?? '—'}
          />
          <MetricChart
            label="Job Growth"
            leftValue={leftMetrics.jobGrowth}
            rightValue={rightMetrics.jobGrowth}
            leftName={leftInfo?.name ?? '—'}
            rightName={rightInfo?.name ?? '—'}
          />
        </div>
      </div>
    </div>
  );
}
