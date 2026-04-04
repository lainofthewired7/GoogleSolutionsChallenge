/**
 * Sidebar — contains the LayerPanel and MetricsPanel.
 */

import LayerPanel from './LayerPanel';
import MetricsPanel from './MetricsPanel';

export default function Sidebar() {
  return (
    <aside id="sidebar">
      <LayerPanel />
      <MetricsPanel />
    </aside>
  );
}
