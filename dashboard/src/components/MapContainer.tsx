/**
 * MapContainer — Interactive Leaflet map with heatmap overlay and all-market markers.
 *
 * Uses free CartoDB dark-matter basemap tiles (no API key required)
 * and leaflet.heat for weighted rent price visualization.
 * Shows all supported markets as clickable markers.
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import * as api from '../services/api';

// Import leaflet.heat — it extends L automatically
import 'leaflet.heat';

/* ── Map tile providers ── */

const TILE_URL_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_URL_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

/* ── Defaults ── */

const DEFAULT_CENTER: [number, number] = [30.2672, -97.7431];
const DEFAULT_ZOOM = 11;

/* ── Custom marker icons ── */

function createMarkerIcon(isActive: boolean, isDark: boolean) {
  const color = isActive ? (isDark ? '#81ecff' : '#006976') : (isDark ? '#64748b' : '#94a3b8');
  const size = isActive ? 14 : 8;
  const borderColor = isActive 
    ? (isDark ? 'rgba(129,236,255,0.4)' : 'rgba(0,105,118,0.4)') 
    : (isDark ? 'rgba(100,116,139,0.3)' : 'rgba(148,163,184,0.3)');
  const border = isActive ? `3px solid ${borderColor}` : `2px solid ${borderColor}`;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border};box-shadow:0 0 ${isActive ? 12 : 4}px ${color}40;transition:all 0.3s"></div>`,
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
  });
}

export default function MapContainer() {
  const { selectedMarket, marketInfo, layers, markets, setMarket } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
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

    const tl = L.tileLayer(isDark ? TILE_URL_DARK : TILE_URL_LIGHT, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);
    tileLayerRef.current = tl;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;
    setLoading(false);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  /* ── Swap tile layer on theme change ── */
  useEffect(() => {
    if (!mapInstance.current || !tileLayerRef.current) return;
    const newUrl = isDark ? TILE_URL_DARK : TILE_URL_LIGHT;
    tileLayerRef.current.setUrl(newUrl);
  }, [isDark]);

  /* ── Render market markers ── */
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current || markets.length === 0) return;

    markersLayer.current.clearLayers();

    markets.forEach((m) => {
      const isActive = m.code === selectedMarket;
      const marker = L.marker([m.lat, m.lon], {
        icon: createMarkerIcon(isActive, isDark),
        zIndexOffset: isActive ? 1000 : 0,
      });

      marker.bindTooltip(m.name, {
        className: 'market-tooltip',
        direction: 'top',
        offset: [0, -8],
      });

      marker.on('click', () => {
        setMarket(m.code);
      });

      markersLayer.current!.addLayer(marker);
    });
  }, [markets, selectedMarket, setMarket, isDark]);

  /* ── Pan to selected market ── */
  useEffect(() => {
    if (!mapInstance.current || !marketInfo) return;
    mapInstance.current.flyTo(
      [marketInfo.lat, marketInfo.lon],
      DEFAULT_ZOOM,
      { duration: 1.5 },
    );
  }, [marketInfo]);

  /* ── Heatmap Data Management ── */
  const [localHeatmapPoints, setLocalHeatmapPoints] = useState<[number, number, number][]>([]);
  const [globalHeatmapPoints, setGlobalHeatmapPoints] = useState<[number, number, number][]>([]);

  // 1. Fetch Local Heatmap for selected market
  useEffect(() => {
    if (!layers.heatmap || layers.globalHeatmap) return;
    
    async function fetchLocalData() {
      try {
        const response = await api.getHeatmapData(selectedMarket, 'rent');
        const points = (response.points || []).map(
          (p) => [p.lat, p.lng, p.weight || 1] as [number, number, number],
        );
        setLocalHeatmapPoints(points);
      } catch (err) {
        console.error('Failed to load local heatmap:', err);
      }
    }
    fetchLocalData();
  }, [selectedMarket, layers.heatmap, layers.globalHeatmap]);

  // 2. Fetch Global Heatmap (All Markets) - Lazy load when enabled
  useEffect(() => {
    if (!layers.globalHeatmap) return;
    if (globalHeatmapPoints.length > 0) return; // Already loaded

    async function fetchGlobalData() {
      try {
        const response = await api.getGlobalHeatmapData('rent');
        const points = (response.points || []).map(
          (p) => [p.lat, p.lng, p.weight || 1] as [number, number, number],
        );
        setGlobalHeatmapPoints(points);
      } catch (err) {
        console.error('Failed to load global heatmap:', err);
      }
    }
    fetchGlobalData();
  }, [layers.globalHeatmap, globalHeatmapPoints.length]);

  /* ── Render/Toggle Heatmap Layer ── */
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear old layer
    if (heatLayer.current) {
      mapInstance.current.removeLayer(heatLayer.current);
      heatLayer.current = null;
    }

    // Determine which points to show
    const pointsToShow = layers.globalHeatmap ? globalHeatmapPoints : (layers.heatmap ? localHeatmapPoints : []);

    if (pointsToShow.length > 0) {
      const isGlobal = layers.globalHeatmap;
      const heat = L.heatLayer(pointsToShow, {
        radius: isGlobal ? 25 : 30, // Slightly smaller radius for global clusters
        blur: isGlobal ? 15 : 20,
        maxZoom: isGlobal ? 13 : 15,
        max: isGlobal ? 4.5 : 5.0,
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
  }, [layers.heatmap, layers.globalHeatmap, localHeatmapPoints, globalHeatmapPoints]);

  /* ── Zoom controls ── */
  const recenter = () => {
    if (!mapInstance.current) return;
    const lat = marketInfo?.lat || DEFAULT_CENTER[0];
    const lng = marketInfo?.lon || DEFAULT_CENTER[1];
    mapInstance.current.flyTo([lat, lng], DEFAULT_ZOOM, { duration: 1 });
  };

  const showAll = () => {
    if (!mapInstance.current || markets.length === 0) return;
    const bounds = L.latLngBounds(markets.map((m) => [m.lat, m.lon] as [number, number]));
    mapInstance.current.flyToBounds(bounds.pad(0.15), { duration: 1.5 });
  };

  return (
    <div className="absolute inset-0 bg-surface">
      <div ref={mapRef} className="w-full h-full" />

      {/* Tooltip styles */}
      <style>{`
        .market-tooltip {
          background: ${isDark ? 'rgba(15, 23, 36, 0.92)' : 'rgba(255, 255, 255, 0.95)'} !important;
          border: 1px solid ${isDark ? 'rgba(129, 236, 255, 0.2)' : 'rgba(0, 105, 118, 0.2)'} !important;
          color: ${isDark ? '#c8d6e5' : '#1a1c2b'} !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 4px 10px !important;
          border-radius: 8px !important;
          backdrop-filter: blur(12px) !important;
          box-shadow: 0 4px 16px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'} !important;
        }
        .market-tooltip::before {
          border-top-color: ${isDark ? 'rgba(15, 23, 36, 0.92)' : 'rgba(255, 255, 255, 0.95)'} !important;
        }
      `}</style>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/90 z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-on-surface-variant text-sm font-label">Loading Map…</span>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          className="glass-panel w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-surface-container-highest transition-colors border border-outline-variant/10 cursor-pointer"
          onClick={recenter}
          title="Re-center on selected market"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
        <button
          className="glass-panel w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors border border-outline-variant/10 cursor-pointer"
          onClick={showAll}
          title="Show all markets"
        >
          <span className="material-symbols-outlined">zoom_out_map</span>
        </button>
      </div>

      {/* Market info badge */}
      {marketInfo && (
        <div className="absolute top-4 left-4 z-[1000]">
          <div
            className="glass-panel px-4 py-3 rounded-xl border border-outline-variant/20"
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
          className="glass-panel px-3 py-2 rounded-lg border border-outline-variant/20"
        >
          <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-widest mb-1.5">Relative Rent</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-on-surface-variant">Low</span>
            <div className="w-24 h-2.5 rounded-full" style={{ background: 'linear-gradient(to right, #1a9641, #a6d96a, #ffffbf, #fdae61, #f46d43, #d73027)' }} />
            <span className="text-[10px] text-on-surface-variant">High</span>
          </div>
        </div>
      </div>

      {/* Market count */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div
          className="glass-panel px-3 py-1.5 rounded-lg border border-outline-variant/20"
        >
          <span className="text-[10px] text-on-surface-variant">
            <span className="text-primary font-bold">{markets.length}</span> markets tracked
          </span>
        </div>
      </div>
    </div>
  );
}
