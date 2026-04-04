/**
 * MapContainer — manages the Google Maps JavaScript API lifecycle and layers.
 *
 * Ported from dashboard/js/map.js with full TypeScript typing.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import * as api from '../services/api';

/* ── Dark-theme map styles (from original map.js) ── */

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
];

const BOUNDARY_STYLE: google.maps.Data.StyleOptions = {
  fillColor: '#6c63ff',
  fillOpacity: 0.1,
  strokeColor: '#6c63ff',
  strokeWeight: 1.5,
  strokeOpacity: 0.6,
};

export default function MapContainer() {
  const { selectedMarket, marketInfo, layers } = useAppContext();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(
    null,
  );
  const boundaryFeaturesRef = useRef<google.maps.Data.Feature[]>([]);

  /* ── Initialize the map once ── */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    /* If Google Maps script isn't loaded yet, load it dynamically */
    const initMap = () => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 30.2672, lng: -97.7431 },
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
        styles: MAP_STYLES,
      });
      mapInstanceRef.current = map;

      /* Initialize heatmap layer (hidden) */
      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: [],
        map: null,
        radius: 30,
        opacity: 0.7,
      });
      heatmapRef.current = heatmap;
    };

    if (typeof google !== 'undefined' && google.maps) {
      initMap();
    } else {
      /* Dynamically inject the Google Maps script */
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, []);

  /* ── Recenter map when market changes ── */
  useEffect(() => {
    if (!mapInstanceRef.current || !marketInfo) return;
    mapInstanceRef.current.setCenter({
      lat: marketInfo.lat,
      lng: marketInfo.lon,
    });
    mapInstanceRef.current.setZoom(11);
  }, [marketInfo]);

  /* ── Load boundary GeoJSON ── */
  const loadBoundaries = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    /* Clear existing features */
    boundaryFeaturesRef.current.forEach((f) => map.data.remove(f));
    boundaryFeaturesRef.current = [];

    try {
      const geojson = await api.getBoundaries(selectedMarket);
      const features = map.data.addGeoJson(geojson);
      boundaryFeaturesRef.current = features;
      map.data.setStyle(BOUNDARY_STYLE);
    } catch (err) {
      console.error('Failed to load boundaries:', err);
    }
  }, [selectedMarket]);

  /* ── Load heatmap data ── */
  const loadHeatmap = useCallback(async () => {
    if (!heatmapRef.current) return;

    try {
      const response = await api.getHeatmapData(selectedMarket, 'rent');
      const data = (response.points || []).map(
        (p) => new google.maps.LatLng(p.lat, p.lng),
      );
      heatmapRef.current.setData(data);
    } catch (err) {
      console.error('Failed to load heatmap:', err);
    }
  }, [selectedMarket]);

  /* ── Reload layers when market changes ── */
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    loadBoundaries();
    loadHeatmap();
  }, [selectedMarket, loadBoundaries, loadHeatmap]);

  /* ── Toggle heatmap visibility ── */
  useEffect(() => {
    if (!heatmapRef.current || !mapInstanceRef.current) return;
    heatmapRef.current.setMap(layers.heatmap ? mapInstanceRef.current : null);
  }, [layers.heatmap]);

  /* ── Toggle boundary visibility ── */
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.data.setStyle({
      ...BOUNDARY_STYLE,
      visible: layers.boundaries,
    });
  }, [layers.boundaries]);

  return (
    <div className="absolute inset-0 z-0 bg-surface-container-lowest">
      <div className="absolute inset-0 heatmap-overlay z-10 opacity-60 pointer-events-none" />
      <div ref={mapRef} className="w-full h-full object-cover opacity-60" />

      {/* Floating Overlay: Legend & Market Info */}
      <div className="absolute top-6 left-6 z-20 glass-panel p-4 rounded-xl border border-outline-variant/10 active-glow">
        <div className="flex items-center justify-between gap-12 mb-4">
          <div>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {marketInfo?.name || 'Austin–Round Rock'}
            </h2>
            <p className="text-xs font-label text-outline uppercase tracking-widest">
              Market Status: High Growth
            </p>
          </div>
          <div className="bg-primary/10 px-3 py-1 rounded-full">
            <span className="text-primary text-[10px] font-bold tracking-tighter uppercase">
              Live Data
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-outline">Median Rent</span>
            <span className="text-on-surface font-bold">$2,140/mo</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-tertiary w-[75%]"></div>
          </div>
        </div>
      </div>

      {/* Map Tools (Right Floating) */}
      <div className="absolute right-6 top-6 z-20 flex flex-col gap-2">
        <button className="glass-panel w-10 h-10 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/10 cursor-pointer" onClick={() => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom()! + 1)}>
          <span className="material-symbols-outlined">add</span>
        </button>
        <button className="glass-panel w-10 h-10 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/10 cursor-pointer" onClick={() => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom()! - 1)}>
          <span className="material-symbols-outlined">remove</span>
        </button>
        <div className="h-px bg-outline-variant/20 my-1"></div>
        <button className="glass-panel w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-surface-container-highest transition-colors border border-outline-variant/10 cursor-pointer" onClick={() => mapInstanceRef.current?.panTo({lat: marketInfo?.lat || 30.2672, lng: marketInfo?.lon || -97.7431})}>
          <span className="material-symbols-outlined">my_location</span>
        </button>
        <button className="glass-panel w-10 h-10 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/10 cursor-pointer">
          <span className="material-symbols-outlined">3d_rotation</span>
        </button>
      </div>
    </div>
  );
}
