import { Bookmark, Columns2 } from 'lucide-react';
import { MAX_COMPARE } from '../../hooks/useSampleTalentShortlist';
import type { DemoEngineer } from '../../lib/demo-engineers';

type SampleTalentSelectionBarProps = {
  shortlistedCount: number;
  compareCount: number;
  compareEngineers: DemoEngineer[];
  onViewShortlist: () => void;
  onViewCompare: () => void;
};

export function SampleTalentSelectionBar({
  shortlistedCount,
  compareCount,
  compareEngineers,
  onViewShortlist,
  onViewCompare,
}: SampleTalentSelectionBarProps) {
  if (shortlistedCount === 0 && compareCount === 0) {
    return null;
  }

  return (
    <div className="mkt-st-sl-bar" role="region" aria-label="Saved selections">
      <div className="mkt-st-sl-bar-inner">
        <div className="mkt-st-sl-bar-summary">
          {compareCount > 0 ? (
            <div className="mkt-st-sl-bar-compare">
              <span className="mkt-st-sl-bar-label">Compare</span>
              <div className="mkt-st-sl-bar-avatars" aria-hidden="true">
                {compareEngineers.map((engineer) => (
                  <span key={engineer.id} className="mkt-st-sl-bar-av" title={engineer.name}>
                    {engineer.initials}
                  </span>
                ))}
                {Array.from({ length: MAX_COMPARE - compareCount }).map((_, index) => (
                  <span key={`slot-${index}`} className="mkt-st-sl-bar-av is-empty" />
                ))}
              </div>
              <span className="mkt-st-sl-bar-count">
                {compareCount} of {MAX_COMPARE}
              </span>
            </div>
          ) : null}
          {shortlistedCount > 0 ? (
            <p className="mkt-st-sl-bar-note">
              <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
              {shortlistedCount} shortlisted
            </p>
          ) : null}
        </div>
        <div className="mkt-st-sl-bar-actions">
          {shortlistedCount > 0 ? (
            <button type="button" className="mkt-btn mkt-btn-secondary mkt-btn-sm" onClick={onViewShortlist}>
              View shortlist
            </button>
          ) : null}
          {compareCount > 0 ? (
            <button type="button" className="mkt-btn mkt-btn-primary mkt-btn-sm" onClick={onViewCompare}>
              <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
              {compareCount === 1 ? 'View compare' : `Compare ${compareCount}`}
            </button>
          ) : compareCount === 0 && shortlistedCount > 0 ? (
            <span className="mkt-st-sl-bar-hint">Add up to {MAX_COMPARE} profiles to compare</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
