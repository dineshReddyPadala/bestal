import { cn } from '@bestal/shared-utils';
import { MAX_COMPARE } from '../../hooks/useSampleTalentShortlist';
import type { DemoEngineer } from '../../lib/demo-engineers';
import { resolveMarketingTimezone } from '../../lib/marketing-timezone';
import { formatDimensionScoreDisplay } from '../../lib/score-display';

type DemoEngineerCardProps = {
  engineer: DemoEngineer;
  className?: string;
  compact?: boolean;
  hideScorecard?: boolean;
  communityLabel?: string;
  hideCommunityLabel?: boolean;
  hideSecondaryActions?: boolean;
  shellless?: boolean;
  variant?: 'default' | 'landing';
  showTalentActions?: boolean;
  isShortlisted?: boolean;
  isInCompare?: boolean;
  compareDisabled?: boolean;
  onShortlist?: () => void;
  onCompare?: () => void;
};

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function VerifyCheckIcon() {
  return (
    <span className="mkt-lpc-check" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="currentColor" />
        <path
          d="M4.75 8.25 6.8 10.3 11.35 5.75"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function formatLandingAvailability(value: string): string {
  if (/^available now$/i.test(value.trim())) return 'Available Now';
  return value;
}

function LandingProfileCardBody({ engineer }: { engineer: DemoEngineer }) {
  const expertise = engineer.skills.slice(0, 2);
  const previousCompany = engineer.previousCompany?.trim();
  const showScore = engineer.score > 0;
  const showRate = engineer.rate > 0;
  const showRole = Boolean(engineer.role.trim());
  const showExperience = Boolean(engineer.experience.trim());
  const showAvailability =
    Boolean(engineer.availability.trim()) && engineer.availability !== 'Check availability';
  const availabilityLabel = showAvailability
    ? formatLandingAvailability(engineer.availability)
    : '';
  const timezoneMeta = resolveMarketingTimezone(engineer.timezone);
  const timezoneName = timezoneMeta.iana;
  const showTimezone = Boolean(timezoneName);

  return (
    <div className="mkt-lpc">
      {showRate ? (
        <div className="mkt-lpc-rate">
          ${engineer.rate}
          <span className="mkt-lpc-rate-s">/hr</span>
        </div>
      ) : null}

      <div className="mkt-lpc-grid">
        <div className="mkt-lpc-left">
          <div className="mkt-lpc-av">{engineer.initials}</div>

          <div className={cn('mkt-lpc-score-slot', !showScore && 'is-empty')}>
            {showScore ? (
              <div className="mkt-lpc-score">
                <div className="mkt-lpc-score-l">Bestal Score</div>
                <div className="mkt-lpc-score-v">
                  <span className="mkt-lpc-star" aria-hidden="true">
                    ★
                  </span>
                  {engineer.score}
                </div>
              </div>
            ) : null}
          </div>

          <div className={cn('mkt-lpc-avail-slot', !showAvailability && 'is-empty')}>
            {showAvailability ? (
              <div
                className={cn(
                  'mkt-lpc-avail',
                  /^available now$/i.test(engineer.availability.trim()) && 'is-now',
                )}
                title={availabilityLabel}
              >
                <span className="mkt-lpc-avail-t">{availabilityLabel}</span>
              </div>
            ) : null}
          </div>

          <div className={cn('mkt-lpc-tz-slot', !showTimezone && 'is-empty')}>
            {showTimezone ? (
              <div className="mkt-lpc-tz-block">
                <div className="mkt-lpc-tz-l">Timezone</div>
                <p className="mkt-lpc-tz-name" title={timezoneName}>
                  {timezoneName}
                </p>
              </div>
            ) : null}
          </div>

          <div className={cn('mkt-lpc-prev-slot', !previousCompany && 'is-empty')}>
            {previousCompany ? (
              <div className="mkt-lpc-prev">
                <div className="mkt-lpc-prev-l">Previously worked at</div>
                <span className="mkt-lpc-company" title={previousCompany}>
                  {previousCompany}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mkt-lpc-right">
          <div className="mkt-lpc-name" title={engineer.name}>
            {engineer.name}
          </div>

          <div className="mkt-lpc-role" title={showRole ? engineer.role : undefined}>
            <BriefcaseIcon />
            <span>{showRole ? engineer.role : '\u00A0'}</span>
          </div>

          <div className={cn('mkt-lpc-expertise', expertise.length === 0 && 'is-empty')}>
            {expertise.length > 0 ? (
              <>
                <div className="mkt-lpc-expertise-l">Expertise</div>
                <div className="mkt-lpc-tags">
                  {expertise.map((skill) => (
                    <span key={skill} className="mkt-lpc-tag" title={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className={cn('mkt-lpc-exp-slot', !showExperience && 'is-empty')}>
            {showExperience ? (
              <div className="mkt-lpc-exp" title={`Experience : ${engineer.experience}`}>
                Experience : <strong>{engineer.experience}</strong>
              </div>
            ) : null}
          </div>

          <div className="mkt-lpc-verify">
            <div className="mkt-lpc-verify-row">
              <span>Tested By Experts</span>
              <VerifyCheckIcon />
            </div>
            <div className="mkt-lpc-verify-row">
              <span>Tech Evaluation</span>
              <VerifyCheckIcon />
            </div>
            <div className="mkt-lpc-verify-row">
              <span>BGV Clear</span>
              <VerifyCheckIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="mkt-lpc-foot">
        <button type="button" className="mkt-lpc-btn mkt-lpc-btn-primary">
          Free Trial
        </button>
        <button type="button" className="mkt-lpc-btn mkt-lpc-btn-secondary">
          Resume
        </button>
      </div>
    </div>
  );
}

export function DemoEngineerCard({
  engineer,
  className,
  compact,
  hideScorecard = false,
  communityLabel,
  hideCommunityLabel = false,
  hideSecondaryActions = false,
  shellless = false,
  variant = 'default',
  showTalentActions = false,
  isShortlisted = false,
  isInCompare = false,
  compareDisabled = false,
  onShortlist,
  onCompare,
}: DemoEngineerCardProps) {
  if (variant === 'landing') {
    const landingBody = <LandingProfileCardBody engineer={engineer} />;

    if (shellless) {
      return landingBody;
    }

    return (
      <article className={cn('mkt-prof mkt-prof-landing', className)}>
        {!hideCommunityLabel && (communityLabel ?? engineer.discipline) ? (
          <div className="mkt-dtag">{communityLabel ?? engineer.discipline}</div>
        ) : null}
        {landingBody}
      </article>
    );
  }

  const body = (
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
        <span className="mkt-bdg mkt-bdg-verified">Tested by Experts</span>
        <span className="mkt-bdg mkt-bdg-verified">Background Verified</span>
        <span className="mkt-bdg mkt-bdg-verified">Identity Verified</span>
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
              <span className="mkt-scr-v">{formatDimensionScoreDisplay(dim.value)}</span>
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
            <span className="mkt-btn mkt-btn-amber mkt-btn-sm">Free trial</span>
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
          ) : !hideSecondaryActions ? (
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
          ) : null}
        </div>
      )}
    </div>
  );

  if (shellless) {
    return body;
  }

  return (
    <article
      className={cn(
        'mkt-prof',
        showTalentActions && isShortlisted && 'is-shortlisted',
        showTalentActions && isInCompare && 'is-in-compare',
        className,
      )}
    >
      {!hideCommunityLabel && (communityLabel ?? engineer.discipline) ? (
        <div className="mkt-dtag">{communityLabel ?? engineer.discipline}</div>
      ) : null}
      {body}
    </article>
  );
}
