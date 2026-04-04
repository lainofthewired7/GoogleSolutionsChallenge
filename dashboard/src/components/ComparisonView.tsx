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
    <div className="comparison-page">
      <div className="comparison-header">
        <Link to="/" className="back-link">
          ← Back to Dashboard
        </Link>
        <h2>Market Comparison</h2>
      </div>

      <div className="comparison-selectors">
        <div className="comparison-selector">
          <label>Market A</label>
          <select
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
        </div>

        <div className="comparison-vs">VS</div>

        <div className="comparison-selector">
          <label>Market B</label>
          <select
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
        </div>
      </div>

      <div className="comparison-grid">
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
  );
}
