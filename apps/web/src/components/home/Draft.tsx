import type { ReactNode } from 'react';
import { useCopyReview } from '../../contexts/CopyReview';

type DraftProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

/**
 * Wraps NEW / SUGGESTED copy (Section B of data/homeCopy.ts).
 * Renders plainly by default; outlines itself when review mode is on so the
 * CEO can see exactly which words are not yet approved.
 */
export function Draft({ children, className = '', label = 'Draft' }: DraftProps) {
  const { highlight } = useCopyReview();

  if (!highlight) return <div className={className}>{children}</div>;

  return (
    <div
      className={`relative rounded-[8px] bg-amber-400/10 p-2 outline-dashed outline-1 outline-amber-500/70 ${className}`}
    >
      <span className="mb-1 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
        {label}
      </span>
      {children}
    </div>
  );
}
