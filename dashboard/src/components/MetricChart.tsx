/**
 * MetricChart — horizontal bar comparison for two market values.
 * Pure CSS implementation (no chart library — Phase 3 will add Chart.js).
 */

interface MetricChartProps {
  label: string;
  leftValue: string;
  rightValue: string;
  leftName: string;
  rightName: string;
}

function parseNumeric(val: string): number {
  const cleaned = val.replace(/[^0-9.\-+]/g, '');
  return parseFloat(cleaned) || 0;
}

export default function MetricChart({
  label,
  leftValue,
  rightValue,
  leftName,
  rightName,
}: MetricChartProps) {
  const leftNum = parseNumeric(leftValue);
  const rightNum = parseNumeric(rightValue);
  const max = Math.max(Math.abs(leftNum), Math.abs(rightNum), 1);
  const leftPct = Math.min((Math.abs(leftNum) / max) * 100, 100);
  const rightPct = Math.min((Math.abs(rightNum) / max) * 100, 100);

  return (
    <div className="metric-chart-card">
      <h4 className="metric-chart-label">{label}</h4>

      <div className="metric-chart-row">
        <span className="metric-chart-name">{leftName}</span>
        <div className="metric-chart-bar-container">
          <div
            className="metric-chart-bar left"
            style={{ width: `${leftPct}%` }}
          />
        </div>
        <span className="metric-chart-value">{leftValue}</span>
      </div>

      <div className="metric-chart-row">
        <span className="metric-chart-name">{rightName}</span>
        <div className="metric-chart-bar-container">
          <div
            className="metric-chart-bar right"
            style={{ width: `${rightPct}%` }}
          />
        </div>
        <span className="metric-chart-value">{rightValue}</span>
      </div>
    </div>
  );
}
