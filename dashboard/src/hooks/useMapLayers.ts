/**
 * useMapLayers — convenience hook for layer toggle state from AppContext.
 */

import { useAppContext } from '../context/AppContext';

export function useMapLayers() {
  const { layers, toggleLayer } = useAppContext();

  return { layers, toggleLayer };
}
