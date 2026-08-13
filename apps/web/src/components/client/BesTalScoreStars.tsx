import { cn } from '@bestal/shared-utils';
import { Star } from 'lucide-react';

/** Map BesTal score (0–100) to a 0–5 star count for display. */
export function scoreToStarCount(score: number): number {
  const clamped = Math.max(0, Math.min(100, score));
  return Math.round(clamped / 20);
}

export type BesTalScoreStarsProps = {
  score: number;
  showNumeric?: boolean;
  className?: string;
  size?: 'sm' | 'md';
};

export function BesTalScoreStars({
  score,
  showNumeric = true,
  className,
  size = 'sm',
}: BesTalScoreStarsProps) {
  const filled = scoreToStarCount(score);
  const iconClass = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              iconClass,
              index < filled ? 'fill-brand text-brand' : 'fill-muted/30 text-muted-foreground/40',
            )}
          />
        ))}
      </span>
      {showNumeric ? (
        <span className="text-sm font-medium tabular-nums text-foreground">{score}</span>
      ) : null}
    </div>
  );
}
