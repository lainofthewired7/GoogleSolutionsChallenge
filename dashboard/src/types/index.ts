/** TypeScript interfaces for Projectr Analytics.
 *
 * Source of truth: api/schemas.py (Pydantic models) and db/models.py (SQLAlchemy).
 */

/* ── API response types (from api/schemas.py) ── */

export interface MarketInfo {
  code: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
}

export interface MetricPoint {
  date: string;
  value: number;
  metric: string;
  geography: string;
  source: string;
}

export interface MetricsResponse {
  market: string;
  metric: string;
  data: MetricPoint[];
  count: number;
}

/* ── GeoJSON types (from api/routes/geojson.py) ── */

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight?: number;
}

export interface HeatmapResponse {
  market: string;
  metric: string;
  points: HeatmapPoint[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  metadata?: {
    market: string;
    geo_type: string;
  };
}

/* ── Metrics stub response (endpoints not yet implemented) ── */

export interface MetricStubResponse {
  market: string;
  data: unknown[];
  message?: string;
  zip_code?: string | null;
  limit?: number;
}

/* ── Application state types ── */

export interface LayerToggles {
  heatmap: boolean;
  permits: boolean;
  vacancy: boolean;
  jobs: boolean;
  boundaries: boolean;
}

export interface AppState {
  selectedMarket: string;
  layers: LayerToggles;
  marketInfo: MarketInfo | null;
  markets: MarketInfo[];
  loading: boolean;
}
