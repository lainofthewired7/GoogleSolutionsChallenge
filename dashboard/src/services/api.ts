import type {
  MarketInfo,
  MetricStubResponse,
  GeoJSONFeatureCollection,
  HeatmapResponse,
} from '../types';
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

/* ── Markets ── */

export async function getMarkets(): Promise<MarketInfo[]> {
  return request<MarketInfo[]>('/markets/');
}

export async function getMarket(code: string): Promise<MarketInfo> {
  return request<MarketInfo>(`/markets/${code}`);
}

/* ── Metrics ── */

export async function getRents(
  market: string,
  zipCode?: string,
): Promise<MetricStubResponse> {
  const params = new URLSearchParams({ market });
  if (zipCode) params.append('zip_code', zipCode);
  return request<MetricStubResponse>(`/metrics/rents?${params}`);
}

export async function getPermits(
  market: string,
  limit = 1000,
): Promise<MetricStubResponse> {
  return request<MetricStubResponse>(
    `/metrics/permits?market=${market}&limit=${limit}`,
  );
}

export async function getPermitsBreakdown(
  market: string,
): Promise<any> {
  return request<any>(`/metrics/permits/breakdown?market=${market}`);
}

export async function getVacancy(
  market: string,
): Promise<MetricStubResponse> {
  return request<MetricStubResponse>(`/metrics/vacancy?market=${market}`);
}

export async function getJobGrowth(
  market: string,
): Promise<MetricStubResponse> {
  return request<MetricStubResponse>(`/metrics/jobs?market=${market}`);
}

export async function getProjects(
  market: string,
): Promise<any> {
  return request<any>(`/metrics/projects?market=${market}`);
}

/* ── GeoJSON ── */

export async function getBoundaries(
  market: string,
  geoType = 'zip',
): Promise<GeoJSONFeatureCollection> {
  return request<GeoJSONFeatureCollection>(
    `/geojson/boundaries?market=${market}&geo_type=${geoType}`,
  );
}

export async function getHeatmapData(
  market: string,
  metric = 'rent',
): Promise<HeatmapResponse> {
  return request<HeatmapResponse>(
    `/geojson/heatmap?market=${market}&metric=${metric}`,
  );
}

export async function getGlobalHeatmapData(
  metric = 'rent',
): Promise<HeatmapResponse> {
  return request<HeatmapResponse>(`/geojson/heatmap/all?metric=${metric}`);
}
