/**
 * useJobGrowthData — fetches and caches FRED employment + unemployment data.
 */

import { useState, useEffect } from 'react';
import {
  getEmployment,
  getUnemployment,
  type EmploymentResponse,
  type UnemploymentResponse,
} from '../services/fred';

export interface JobGrowthState {
  employment: EmploymentResponse | null;
  unemployment: UnemploymentResponse | null;
  loading: boolean;
  error: string | null;
}

export function useJobGrowthData(market = 'austin', years = 5): JobGrowthState {
  const [employment, setEmployment] = useState<EmploymentResponse | null>(null);
  const [unemployment, setUnemployment] = useState<UnemploymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [empData, unempData] = await Promise.all([
          getEmployment(market, years),
          getUnemployment(market, years),
        ]);

        if (active) {
          setEmployment(empData);
          setUnemployment(unempData);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
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

  return { employment, unemployment, loading, error };
}
