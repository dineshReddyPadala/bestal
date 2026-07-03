import { candidates } from '@bestal/mock-data';
import { cn } from '@bestal/shared-utils';
import { Button } from '@bestal/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ClientRecommendedCandidate } from '@bestal/mock-data';
import { ClientCandidateCard } from './ClientCandidateCard';

type RecommendedCandidatesCarouselProps = {
  items: readonly ClientRecommendedCandidate[];
};

export function RecommendedCandidatesCarousel({ items }: RecommendedCandidatesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div className="absolute -left-1 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
        <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => scroll('left')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
        <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => scroll('right')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          'flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory',
          '[scrollbar-width:thin]',
        )}
      >
        {items.map((rec) => {
          const candidate = candidates.find((c) => c.id === rec.candidateId);
          if (!candidate) return null;
          return (
            <div
              key={rec.candidateId}
              className="w-[min(100%,320px)] shrink-0 snap-start sm:w-[300px]"
            >
              <div className="mb-2 flex items-center justify-between gap-2 px-1">
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  {rec.matchScore}% match
                </span>
                {rec.featured && (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600">
                    Featured
                  </span>
                )}
              </div>
              <ClientCandidateCard
                candidate={candidate}
                compact
                onView={() => navigate(`/client/candidates/${candidate.id}`)}
              />
              <p className="mt-2 line-clamp-2 px-1 text-xs text-muted-foreground">{rec.matchReason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
