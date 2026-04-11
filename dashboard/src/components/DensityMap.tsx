import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import * as api from '../services/api';

const TILE_URL_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_URL_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

const DEFAULT_CENTER: [number, number] = [30.2672, -97.7431];
const DEFAULT_ZOOM = 12;

interface DensityMapProps {
  metric: 'population' | 'migration';
}

export default function DensityMap({ metric }: DensityMapProps) {
  const { selectedMarket, marketInfo } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: marketInfo ? [marketInfo.lat, marketInfo.lon] : DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    const tl = L.tileLayer(isDark ? TILE_URL_DARK : TILE_URL_LIGHT, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 18,
    }).addTo(map);
    tileLayerRef.current = tl;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstance.current = map;
    setLoading(false);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Sync theme
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(isDark ? TILE_URL_DARK : TILE_URL_LIGHT);
    }
  }, [isDark]);

  // Sync market view
  useEffect(() => {
    if (mapInstance.current && marketInfo) {
      mapInstance.current.flyTo([marketInfo.lat, marketInfo.lon], DEFAULT_ZOOM, { duration: 1.5 });
    }
  }, [marketInfo]);

  // Fetch and render heatmap
  useEffect(() => {
    if (!mapInstance.current) return;

    async function fetchDensityData() {
      setLoading(true);
      try {
        const response = await api.getHeatmapData(selectedMarket, metric);
        const points = (response.points || []).map(
          (p) => [p.lat, p.lng, p.weight || 1] as [number, number, number]
        );

        if (heatLayer.current) {
          mapInstance.current!.removeLayer(heatLayer.current);
        }

        if (points.length > 0) {
          const gradient = metric === 'population' 
            ? { 0.0: 'transparent', 0.2: '#4ade80', 0.5: '#22c55e', 0.8: '#16a34a', 1.0: '#15803d' } // Green for population
            : { 0.0: 'transparent', 0.2: '#60a5fa', 0.5: '#3b82f6', 0.8: '#2563eb', 1.0: '#1d4ed8' }; // Blue for migration

          // @ts-ignore - L.heatLayer
          const heat = L.heatLayer(points, {
            radius: metric === 'population' ? 25 : 30, // Adjust radius
            blur: metric === 'population' ? 15 : 20,
            maxZoom: 14,
            max: 5.0,
            gradient
          });
          heat.addTo(mapInstance.current!);
          heatLayer.current = heat;
        }
      } catch (err) {
        console.error(`Failed to load ${metric} heatmap:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchDensityData();
  }, [selectedMarket, metric]);

  const gradientColors = metric === 'population'
    ? 'linear-gradient(to right, #4ade80, #22c55e, #16a34a, #15803d)'
    : 'linear-gradient(to right, #60a5fa, #3b82f6, #2563eb, #1d4ed8)';

  return (
    <div className="absolute inset-0 bg-surface">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-on-surface font-bold uppercase tracking-widest">Fetching Data...</span>
          </div>
        </div>
      )}

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 hidden">
        <div className="p-3 rounded-lg border border-outline-variant/20 bg-surface-container-high/60 backdrop-blur-xl shadow-lg">
          <h4 className="text-[9px] text-on-surface-variant uppercase font-extrabold tracking-widest mb-2">{metric} Density</h4>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-on-surface-variant font-bold">Low</span>
            <div className="w-24 h-1.5 rounded-full" style={{ background: gradientColors }}></div>
            <span className="text-[8px] text-on-surface-variant font-bold">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
