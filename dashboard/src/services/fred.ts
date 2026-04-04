/**
 * FRED API service — fetches employment and unemployment data from the backend proxy.
 */

import { getAuthHeaders } from './auth';

const API_BASE = '/api';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/* ── Types ── */

export interface ObservationPoint {
  date: string;
  value: number;
}

export interface SectorData {
  series_id: string;
  title: string;
  icon: string;
  color: string;
  observations: ObservationPoint[];
  latest_value: number | null;
  latest_date: string | null;
  yoy_growth_pct: number | null;
  yoy_net_change: number | null;
  units: string;
}

export interface EmploymentResponse {
  market: string;
  msa_code: string;
  period: string;
  sectors: Record<string, SectorData>;
}

export interface UnemploymentResponse {
  market: string;
  series_id: string;
  title: string;
  observations: ObservationPoint[];
  latest_value: number | null;
  latest_date: string | null;
  yoy_change: number | null;
  units: string;
}

export interface RentTrendResponse {
  market: string;
  series_id: string;
  title: string;
  observations: ObservationPoint[];
  latest_value: number | null;
  latest_date: string | null;
  yoy_growth_pct: number | null;
  units: string;
}

/* ── API calls ── */

export async function getEmployment(market = 'austin', years = 5): Promise<EmploymentResponse> {
  return request<EmploymentResponse>(`/fred/employment?market=${encodeURIComponent(market)}&years=${years}`);
}

export async function getUnemployment(market = 'austin', years = 5): Promise<UnemploymentResponse> {
  return request<UnemploymentResponse>(`/fred/unemployment?market=${encodeURIComponent(market)}&years=${years}`);
}

export async function getRentTrend(market = 'austin', years = 5): Promise<RentTrendResponse> {
  return request<RentTrendResponse>(`/fred/rent?market=${encodeURIComponent(market)}&years=${years}`);
}
