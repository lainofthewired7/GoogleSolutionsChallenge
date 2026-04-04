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
    <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-colors duration-300">
      <h4 className="text-xs font-label text-outline uppercase tracking-widest mb-6">{label}</h4>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 relative">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-on-surface/80 text-sm font-medium pr-4">{leftName}</span>
            <span className="text-on-surface text-lg font-bold font-headline">{leftValue}</span>
          </div>
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(129,236,255,0.4)]"
              style={{ width: `${leftPct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 relative">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-on-surface/80 text-sm font-medium pr-4">{rightName}</span>
            <span className="text-on-surface text-lg font-bold font-headline">{rightValue}</span>
          </div>
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-tertiary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(166,140,255,0.4)]"
              style={{ width: `${rightPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
