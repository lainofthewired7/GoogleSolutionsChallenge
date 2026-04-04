/**
 * LayerPanel — five checkbox toggles for map layers.
 */

import { useCallback } from 'react';
import { useMapLayers } from '../hooks/useMapLayers';
import type { LayerToggles } from '../types';

const LAYER_OPTIONS: { key: keyof LayerToggles; label: string }[] = [
  { key: 'heatmap', label: 'Rent Heatmap' },
  { key: 'permits', label: 'Permits' },
  { key: 'vacancy', label: 'Vacancy Rates' },
  { key: 'jobs', label: 'Job Growth' },
  { key: 'boundaries', label: 'Boundaries' },
];

export default function LayerPanel() {
  const { layers, toggleLayer } = useMapLayers();

  const handleToggle = useCallback(
    (key: keyof LayerToggles) => () => {
      toggleLayer(key);
    },
    [toggleLayer],
  );

  return (
    <div className="panel" id="layer-panel">
      <h2>Map Layers</h2>
      {LAYER_OPTIONS.map(({ key, label }) => (
        <label key={key}>
          <input
            type="checkbox"
            id={`toggle-${key}`}
            checked={layers[key]}
            onChange={handleToggle(key)}
          />
          {' '}{label}
        </label>
      ))}
    </div>
  );
}
