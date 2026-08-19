import { cn } from '@bestal/shared-utils';
import { MAX_COMPARE } from '../../hooks/useSampleTalentShortlist';
import type { DemoEngineer } from '../../lib/demo-engineers';

type DemoEngineerCardProps = {
  engineer: DemoEngineer;
  className?: string;
  compact?: boolean;
  hideScorecard?: boolean;
  communityLabel?: string;
  showTalentActions?: boolean;
  isShortlisted?: boolean;
  isInCompare?: boolean;
  compareDisabled?: boolean;
  onShortlist?: () => void;
  onCompare?: () => void;
};

export function DemoEngineerCard({
  engineer,
  className,
  compact,
  hideScorecard = false,
  communityLabel,
  showTalentActions = false,
  isShortlisted = false,
  isInCompare = false,
  compareDisabled = false,
  onShortlist,
  onCompare,
}: DemoEngineerCardProps) {
  return (
    <article
      className={cn(
        'mkt-prof',
        showTalentActions && isShortlisted && 'is-shortlisted',
        showTalentActions && isInCompare && 'is-in-compare',
        className,
      )}
    >
      {(communityLabel ?? engineer.discipline) ? (
        <div className="mkt-dtag">{communityLabel ?? engineer.discipline}</div>
      ) : null}
      <div className="mkt-pb">
        <div className="mkt-ptop">
          <div className="mkt-av">{engineer.initials}</div>
          <div>
            <div className="mkt-pnm">{engineer.name}</div>
            <div className="mkt-prl">{engineer.role}</div>
            <div className="mkt-pmt">{engineer.meta}</div>
          </div>
          <div className="mkt-rt">
            <div className="mkt-rt-n">${engineer.rate}</div>
            <div className="mkt-rt-l">/ hour</div>
          </div>
        </div>

        <div className="mkt-chips">
          {engineer.skills.map((skill) => (
            <span key={skill} className="mkt-chip">
              {skill}
            </span>
          ))}
        </div>

        <div className="mkt-bdgs">
          <span className="mkt-bdg mkt-bdg-teal">Tested by Experts</span>
          <span className="mkt-bdg mkt-bdg-green">Background Verified</span>
          <span className="mkt-bdg mkt-bdg-green">Identity Verified</span>
          {/* {engineer.trialEligible ? (
            <span className="mkt-bdg mkt-bdg-amber">20-Hour Trial</span>
          ) : (
            <span className="mkt-bdg mkt-bdg-muted">Trial unavailable</span>
          )} */}
        </div>

        <div className="mkt-tz-row">
          <div className="mkt-tz-ic">◷</div>
          <div>
            <div className="mkt-tz-l">{engineer.zoneLabel}</div>
            <div className="mkt-tz-s">{engineer.zoneHours}</div>
          </div>
        </div>

        {!hideScorecard && !compact && (
          <div className="mkt-sc">
            <div className="mkt-sch">
              <span className="mkt-sch-l">Test Results</span>
              <span className="mkt-sch-t">
                {engineer.score}
                <span className="mkt-sch-max">/100</span>
              </span>
            </div>
            {engineer.dimensions.map((dim) => (
              <div key={dim.label} className="mkt-scr">
                <span className="mkt-scr-n">{dim.label}</span>
                <span className="mkt-tr">
                  <span
                    className={cn('mkt-fl', dim.tone === 'gold' && 'mkt-fl-amber')}
                    style={{ width: `${dim.value * 10}%` }}
                  />
                </span>
                <span className="mkt-scr-v">{dim.value}</span>
              </div>
            ))}
            <p className="mkt-evl">
              {engineer.quoteIsPlaceholder ? (
                <span className="italic">{engineer.quote}</span>
              ) : (
                <>“{engineer.quote}”</>
              )}
              <br />
              <span className="mkt-evl-meta">— External Specialist, tested {engineer.testedOn}</span>
            </p>
          </div>
        )}

        <div className="mkt-avl">
          <span className="mkt-avl-s">{engineer.availability}</span>
          <span className="mkt-avl-confirmed">{engineer.confirmed}</span>
        </div>

        {!compact && (
          <div className="mkt-pacts">
            {engineer.trialEligible ? (
              <span className="mkt-btn mkt-btn-amber mkt-btn-sm">Start free trial</span>
            ) : (
              <span className="mkt-btn mkt-btn-primary mkt-btn-sm">Request availability</span>
            )}
            {showTalentActions ? (
              <>
                <button
                  type="button"
                  className={cn(
                    'mkt-btn mkt-btn-sm',
                    isShortlisted ? 'mkt-btn-primary' : 'mkt-btn-secondary',
                  )}
                  onClick={onShortlist}
                  aria-pressed={isShortlisted}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>
                <button
                  type="button"
                  className={cn(
                    'mkt-btn mkt-btn-sm',
                    isInCompare ? 'mkt-btn-primary' : 'mkt-btn-secondary',
                  )}
                  onClick={onCompare}
                  disabled={compareDisabled}
                  aria-pressed={isInCompare}
                  title={compareDisabled ? `Compare up to ${MAX_COMPARE} engineers — remove one to add another` : undefined}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="4" width="7" height="16" rx="1.5" />
                    <rect x="14" y="4" width="7" height="16" rx="1.5" />
                  </svg>
                  {isInCompare ? 'In compare' : 'Compare'}
                </button>
              </>
            ) : (
              <>
                <span className="mkt-btn mkt-btn-secondary mkt-btn-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  Shortlist
                </span>
                <span className="mkt-btn mkt-btn-secondary mkt-btn-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="4" width="7" height="16" rx="1.5" />
                    <rect x="14" y="4" width="7" height="16" rx="1.5" />
                  </svg>
                  Compare
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
