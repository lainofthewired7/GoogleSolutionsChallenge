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

export default function PermitMap() {
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

  // Fetch and render permit heatmap
  useEffect(() => {
    if (!mapInstance.current) return;

    async function fetchPermitData() {
      setLoading(true);
      try {
        const response = await api.getHeatmapData(selectedMarket, 'permits');
        const points = (response.points || []).map(
          (p) => [p.lat, p.lng, p.weight || 1] as [number, number, number]
        );

        if (heatLayer.current) {
          mapInstance.current!.removeLayer(heatLayer.current);
        }

        if (points.length > 0) {
          // @ts-ignore - L.heatLayer is added by leaflet.heat
          const heat = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 14,
            max: 5.0,
            gradient: {
                0.0: 'transparent',
                0.2: '#00E5FF', // Cyan / Primary
                0.4: '#00B8D4',
                0.6: '#0097A7',
                0.8: '#FF4081', // Pink / Accent
                1.0: '#F50057'
            }
          });
          heat.addTo(mapInstance.current!);
          heatLayer.current = heat;
        }
      } catch (err) {
        console.error('Failed to load permit heatmap:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPermitData();
  }, [selectedMarket]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-outline-variant/10 shadow-inner">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-on-surface font-bold uppercase tracking-widest">Fetching Permits...</span>
          </div>
        </div>
      )}

      {/* Permit Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="p-3 rounded-lg border border-outline-variant/20 bg-surface-container-high/60 backdrop-blur-xl shadow-lg">
          <h4 className="text-[9px] text-on-surface-variant uppercase font-extrabold tracking-widest mb-2">Permit Intensity</h4>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-on-surface-variant font-bold">Low Value</span>
            <div className="w-24 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #00E5FF, #00B8D4, #0097A7, #FF4081, #F50057)' }}></div>
            <span className="text-[8px] text-on-surface-variant font-bold">High Value</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-10">
        <div className="p-2 px-3 rounded-md border border-primary/20 bg-primary/10 backdrop-blur-md shadow-sm">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00E5FF]"></span>
              <span className="text-[10px] text-on-surface font-bold uppercase tracking-tighter">Live Activity Layer</span>
           </div>
        </div>
      </div>
    </div>
  );
}
