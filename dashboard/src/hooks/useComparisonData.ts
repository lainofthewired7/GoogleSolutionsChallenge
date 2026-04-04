import { useState, useEffect } from 'react';
import * as api from '../services/api';
import * as fred from '../services/fred';


export interface ComparisonSectors {
  tech: number | null;
  mfg: number | null;
  prof: number | null;
}

export interface ComparisonData {
  marketName: string;
  rent: string;
  rentTrend: string;
  unemployment: string;
  unemploymentTrend: string;
  jobGrowth: string;
  sectors: ComparisonSectors;
  loading: boolean;
}

const EMPTY_DATA: ComparisonData = {
  marketName: '—',
  rent: '—',
  rentTrend: '',
  unemployment: '—',
  unemploymentTrend: '',
  jobGrowth: '—',
  sectors: { tech: null, mfg: null, prof: null },
  loading: false,
};

export function useComparisonData(marketCode: string) {
  const [data, setData] = useState<ComparisonData>(EMPTY_DATA);

  useEffect(() => {
    if (!marketCode) {
      setData(EMPTY_DATA);
      return;
    }

    let isMounted = true;
    setData((prev) => ({ ...prev, loading: true }));

    Promise.all([
      api.getMarket(marketCode).catch(() => null),
      api.getRents(marketCode).catch(() => null),
      fred.getEmployment(marketCode, 2).catch(() => null),
      fred.getUnemployment(marketCode, 2).catch(() => null),
    ]).then(([market, rents, jobs, unemp]) => {
      if (!isMounted) return;

      const rData = rents?.data?.[0] as Record<string, unknown> | undefined;
      const rentStr = rData?.value ? String(rData.value) : '—';
      const rentTrend = rData?.trend ? String(rData.trend) : '';

      const uVal = unemp?.latest_value != null ? `${unemp.latest_value}%` : '—';
      const uTrend = unemp?.yoy_change != null ? `${unemp.yoy_change > 0 ? '+' : ''}${unemp.yoy_change}% YoY` : '';

      const totalGrowth = jobs?.sectors?.total_nonfarm?.yoy_growth_pct;
      const jVal = totalGrowth != null ? `${totalGrowth > 0 ? '+' : ''}${totalGrowth}%` : '—';

      const sectors = {
        tech: jobs?.sectors?.information?.yoy_growth_pct ?? null,
        mfg: jobs?.sectors?.manufacturing?.yoy_growth_pct ?? null,
        prof: jobs?.sectors?.professional_services?.yoy_growth_pct ?? null,
      };

      setData({
        marketName: market?.name ?? marketCode,
        rent: rentStr,
        rentTrend,
        unemployment: uVal,
        unemploymentTrend: uTrend,
        jobGrowth: jVal,
        sectors,
        loading: false,
      });
    });

    return () => {
      isMounted = false;
    };
  }, [marketCode]);

  return data;
}
