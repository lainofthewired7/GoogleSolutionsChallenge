/**
 * useRentData — aggregate rent metrics from HUD, FRED, and Census.
 */

import { useState, useEffect } from 'react';
import { getRents, getVacancy, getHeatmapData } from '../services/api';
import { getRentTrend, type RentTrendResponse } from '../services/fred';
import type { MetricStubResponse, HeatmapResponse } from '../types';

export interface RentState {
  fmr: MetricStubResponse | null;
  trend: RentTrendResponse | null;
  vacancy: MetricStubResponse | null;
  heatmap: HeatmapResponse | null;
  loading: boolean;
  error: string | null;
}

export function useRentData(market = 'austin', years = 5): RentState {
  const [fmr, setFmr] = useState<MetricStubResponse | null>(null);
  const [trend, setTrend] = useState<RentTrendResponse | null>(null);
  const [vacancy, setVacancy] = useState<MetricStubResponse | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [fmrData, trendData, vacancyData, heatData] = await Promise.all([
          getRents(market),
          getRentTrend(market, years),
          getVacancy(market),
          getHeatmapData(market, 'rent'),
        ]);

        if (active) {
          setFmr(fmrData);
          setTrend(trendData);
          setVacancy(vacancyData);
          setHeatmap(heatData);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to fetch rent data');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { active = false; };
  }, [market, years]);

  return { fmr, trend, vacancy, heatmap, loading, error };
}
