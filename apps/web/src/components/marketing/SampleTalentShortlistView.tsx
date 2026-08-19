import { ArrowLeft, Bookmark, Columns2 } from 'lucide-react';
import type { DemoEngineer } from '../../lib/demo-engineers';
import { MAX_COMPARE } from '../../hooks/useSampleTalentShortlist';
import { DemoEngineerCard } from './DemoEngineerCard';

type SampleTalentShortlistViewProps = {
  engineers: DemoEngineer[];
  compareCount: number;
  isShortlisted: (id: string) => boolean;
  isInCompare: (id: string) => boolean;
  compareFull: boolean;
  onShortlist: (id: string) => void;
  onCompare: (id: string) => void;
  onCompareAll: () => void;
  onClear: () => void;
  onGoToBrowse: () => void;
};

export function SampleTalentShortlistView({
  engineers,
  compareCount,
  isShortlisted,
  isInCompare,
  compareFull,
  onShortlist,
  onCompare,
  onCompareAll,
  onClear,
  onGoToBrowse,
}: SampleTalentShortlistViewProps) {
  const canCompareAll =
    engineers.length >= 2 &&
    compareCount < MAX_COMPARE &&
    engineers.some((engineer) => !isInCompare(engineer.id));

  if (engineers.length === 0) {
    return (
      <div className="mkt-st-sl-empty">
        <div className="mkt-st-sl-empty-icon" aria-hidden="true">
          <Bookmark className="h-6 w-6" />
        </div>
        <p className="mkt-st-sl-empty-title">Your shortlist is empty</p>
        <p className="mkt-st-sl-empty-body">
          Save engineers you&apos;re interested in, then review them here or add them to Compare
          before you reach out.
        </p>
        <button type="button" className="mkt-btn mkt-btn-primary mkt-btn-sm mkt-st-sl-empty-cta" onClick={onGoToBrowse}>
          <ArrowLeft className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
          Browse engineers
        </button>
      </div>
    );
  }

  return (
    <div className="mkt-st-shortlist">
      <div className="mkt-st-shortlist-hd">
        <div>
          <h3>Shortlisted engineers</h3>
          <p>
            {engineers.length} profile{engineers.length === 1 ? '' : 's'} saved for review.
            {compareCount > 0 ? ` ${compareCount} also in compare.` : ''}
          </p>
        </div>
        <div className="mkt-st-shortlist-hd-actions">
          {canCompareAll ? (
            <button type="button" className="mkt-btn mkt-btn-secondary mkt-btn-sm" onClick={onCompareAll}>
              <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
              Add all to compare
            </button>
          ) : null}
          <button type="button" className="mkt-st-sl-clear" onClick={onClear}>
            Clear shortlist
          </button>
        </div>
      </div>
      <div className="mkt-eng-grid">
        {engineers.map((engineer) => (
          <DemoEngineerCard
            key={engineer.id}
            engineer={engineer}
            showTalentActions
            isShortlisted={isShortlisted(engineer.id)}
            isInCompare={isInCompare(engineer.id)}
            compareDisabled={compareFull && !isInCompare(engineer.id)}
            onShortlist={() => onShortlist(engineer.id)}
            onCompare={() => onCompare(engineer.id)}
          />
        ))}
      </div>
    </div>
  );
}
