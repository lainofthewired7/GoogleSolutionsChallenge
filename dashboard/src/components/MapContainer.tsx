/**
 * MapContainer — Interactive Leaflet map with heatmap overlay.
 *
 * Uses free CartoDB Voyager basemap tiles (no API key required)
 * and leaflet.heat for weighted rent price visualization.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import * as api from '../services/api';

// Import leaflet.heat — it extends L automatically
import 'leaflet.heat';

/* ── Map tile providers ── */

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

/* ── Default center (Austin) ── */

const DEFAULT_CENTER: [number, number] = [30.2672, -97.7431];
const DEFAULT_ZOOM = 11;

export default function MapContainer() {
  const { selectedMarket, marketInfo, layers } = useAppContext();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Initialize the map ── */
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstance.current = map;
    setLoading(false);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  /* ── Pan to selected market ── */
  useEffect(() => {
    if (!mapInstance.current || !marketInfo) return;
    mapInstance.current.flyTo(
      [marketInfo.lat, marketInfo.lon],
      DEFAULT_ZOOM,
      { duration: 1.5 },
    );
  }, [marketInfo]);

  /* ── Load heatmap data ── */
  const loadHeatmap = useCallback(async () => {
    if (!mapInstance.current) return;

    try {
      const response = await api.getHeatmapData(selectedMarket, 'rent');
      const points = (response.points || []).map(
        (p) => [p.lat, p.lng, p.weight || 1] as [number, number, number],
      );

      // Remove old heat layer
      if (heatLayer.current) {
        mapInstance.current.removeLayer(heatLayer.current);
      }

      if (points.length > 0) {
        const heat = L.heatLayer(points, {
          radius: 30,
          blur: 20,
          maxZoom: 15,
          max: 5.0,
          gradient: {
            0.0: 'transparent',
            0.15: '#1a9641',
            0.35: '#a6d96a',
            0.50: '#ffffbf',
            0.70: '#fdae61',
            0.85: '#f46d43',
            1.0: '#d73027',
          },
        });
        heat.addTo(mapInstance.current);
        heatLayer.current = heat;
      }
    } catch (err) {
      console.error('Failed to load heatmap:', err);
    }
  }, [selectedMarket]);

  /* ── Reload heatmap when market changes or layer toggles ── */
  useEffect(() => {
    if (layers.heatmap) {
      loadHeatmap();
    } else if (heatLayer.current && mapInstance.current) {
      mapInstance.current.removeLayer(heatLayer.current);
      heatLayer.current = null;
    }
  }, [selectedMarket, layers.heatmap, loadHeatmap]);

  /* ── Recenter button ── */
  const recenter = () => {
    if (!mapInstance.current) return;
    const lat = marketInfo?.lat || DEFAULT_CENTER[0];
    const lng = marketInfo?.lon || DEFAULT_CENTER[1];
    mapInstance.current.flyTo([lat, lng], DEFAULT_ZOOM, { duration: 1 });
  };

  return (
    <div className="absolute inset-0 bg-surface" style={{ bottom: '160px' }}>
      <div ref={mapRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/90 z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-on-surface-variant text-sm font-label">Loading Map…</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          className="glass-panel w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-surface-container-highest transition-colors border border-outline-variant/10 cursor-pointer"
          onClick={recenter}
          title="Re-center map"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>

      {marketInfo && (
        <div className="absolute top-4 left-4 z-[1000]">
          <div
            className="px-4 py-3 rounded-xl border border-outline-variant/20"
            style={{ background: 'rgba(15, 23, 36, 0.8)', backdropFilter: 'blur(16px)' }}
          >
            <h3 className="text-on-surface font-headline font-bold text-sm">{marketInfo.name}</h3>
            <p className="text-primary text-[10px] uppercase font-bold tracking-widest mt-1">
              Rent Price Heatmap
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div
          className="px-3 py-2 rounded-lg border border-outline-variant/20"
          style={{ background: 'rgba(15, 23, 36, 0.85)', backdropFilter: 'blur(16px)' }}
        >
          <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-widest mb-1.5">Relative Rent</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-on-surface-variant">Low</span>
            <div className="w-24 h-2.5 rounded-full" style={{ background: 'linear-gradient(to right, #1a9641, #a6d96a, #ffffbf, #fdae61, #f46d43, #d73027)' }} />
            <span className="text-[10px] text-on-surface-variant">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

