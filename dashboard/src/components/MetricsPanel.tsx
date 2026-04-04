/**
 * MetricsPanel — displays market metric cards with loading state.
 */

import { useAppContext } from '../context/AppContext';

interface MetricCard {
  label: string;
  value: string;
}

const PLACEHOLDER_METRICS: MetricCard[] = [
  { label: 'Median Rent', value: '—' },
  { label: 'Permits YTD', value: '—' },
  { label: 'Vacancy Rate', value: '—' },
  { label: 'Job Growth', value: '—' },
];

export default function MetricsPanel() {
  const { loading } = useAppContext();

  return (
    <div className="panel" id="metrics-panel">
      <h2>Market Metrics</h2>
      <div id="metrics-content">
        {loading ? (
          <p className="loading">Loading metrics...</p>
        ) : (
          PLACEHOLDER_METRICS.map((m) => (
            <div className="metric-card" key={m.label}>
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
