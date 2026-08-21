import { cn } from '@bestal/shared-utils';

export type PipelineStage = {
  label: string;
  value: number;
  color: string;
};

type HiringPipelineDonutProps = {
  stages: readonly PipelineStage[];
  className?: string;
};

/** BesTal logo palette — teal (Bes), amber (Tal), ink (wordmark dark) */
const BRAND_PIPELINE_COLORS = {
  trials: 'hsl(var(--logo-teal))',
  deployed: 'hsl(var(--logo-amber))',
} as const;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function HiringPipelineDonut({ stages, className }: HiringPipelineDonutProps) {
  const total = stages.reduce((sum, stage) => sum + stage.value, 0);
  const displayTotal = Math.max(total, 1);

  let cumulative = 0;
  const segments = stages.map((stage, index) => {
    const startAngle = (cumulative / displayTotal) * 360;
    cumulative += stage.value;
    const endAngle = (cumulative / displayTotal) * 360;
    const fallback =
      index === 0 ? BRAND_PIPELINE_COLORS.trials : BRAND_PIPELINE_COLORS.deployed;
    const color = stage.color || fallback;
    return { ...stage, startAngle, endAngle, color };
  });

  function arcPath(startAngle: number, endAngle: number, outerR: number, innerR: number): string {
    if (endAngle - startAngle >= 359.99) {
      endAngle = startAngle + 359.99;
    }
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = 50 + outerR * Math.cos(startRad);
    const y1 = 50 + outerR * Math.sin(startRad);
    const x2 = 50 + outerR * Math.cos(endRad);
    const y2 = 50 + outerR * Math.sin(endRad);
    const x3 = 50 + innerR * Math.cos(endRad);
    const y3 = 50 + innerR * Math.sin(endRad);
    const x4 = 50 + innerR * Math.cos(startRad);
    const y4 = 50 + innerR * Math.sin(startRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative mx-auto h-40 w-40 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          {total === 0 ? (
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="hsl(var(--logo-teal-tint))"
              strokeWidth="12"
            />
          ) : (
            segments.map((segment) =>
              segment.value > 0 ? (
                <path
                  key={segment.label}
                  d={arcPath(segment.startAngle, segment.endAngle, 42, 28)}
                  fill={segment.color}
                  className="transition-all duration-300"
                />
              ) : null,
            )
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-[hsl(var(--logo-ink))]">
            {pad2(total)}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Total
          </span>
        </div>
      </div>

      <ul className="flex w-full items-center justify-center gap-8 sm:gap-12">
        {stages.map((stage, index) => {
          const fallback =
            index === 0 ? BRAND_PIPELINE_COLORS.trials : BRAND_PIPELINE_COLORS.deployed;
          const color = stage.color || fallback;
          return (
            <li key={stage.label} className="flex flex-col items-center gap-1 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{stage.label}</span>
              </span>
              <span className="font-semibold tabular-nums text-foreground">{pad2(stage.value)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { BRAND_PIPELINE_COLORS };
