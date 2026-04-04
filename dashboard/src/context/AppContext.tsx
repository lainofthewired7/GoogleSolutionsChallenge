/**
 * Global application context — manages market selection, layer toggles, and loading state.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { MarketInfo, LayerToggles, AppState } from '../types';
import * as api from '../services/api';

/* ── Context shape ── */

interface AppContextValue extends AppState {
  setMarket: (code: string) => Promise<void>;
  toggleLayer: (layer: keyof LayerToggles) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ── Default state ── */

const DEFAULT_LAYERS: LayerToggles = {
  heatmap: true,
  permits: false,
  vacancy: false,
  jobs: false,
  boundaries: true,
};

/* ── Provider ── */

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedMarket, setSelectedMarket] = useState('austin');
  const [layers, setLayers] = useState<LayerToggles>(DEFAULT_LAYERS);
  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [loading, setLoading] = useState(true);

  /* Load available markets on mount */
  useEffect(() => {
    api
      .getMarkets()
      .then(setMarkets)
      .catch((err) => console.error('Failed to load markets:', err));
  }, []);

  /* Load market data whenever selectedMarket changes */
  const loadMarket = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const info = await api.getMarket(code);
      setMarketInfo(info);
    } catch (err) {
      console.error('Failed to load market:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarket(selectedMarket);
  }, [selectedMarket, loadMarket]);

  /* Actions */
  const setMarket = useCallback(
    async (code: string) => {
      setSelectedMarket(code);
    },
    [],
  );

  const toggleLayer = useCallback((layer: keyof LayerToggles) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedMarket,
        layers,
        marketInfo,
        markets,
        loading,
        setMarket,
        toggleLayer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ── Hook ── */

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within <AppProvider>');
  }
  return ctx;
}
