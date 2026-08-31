import { cn } from '@bestal/shared-utils';
import { Info } from 'lucide-react';
import { liveProfile } from '../../data/homeCopy';
import { MAX_COMPARE } from '../../hooks/useSampleTalentShortlist';
import type { DemoEngineer } from '../../lib/demo-engineers';
import { formatUsTimezoneShortLabel } from '../../lib/marketing-timezone';
import { DemoEngineerGenderAvatar } from './DemoEngineerGenderAvatar';

type DemoEngineerCardProps = {
  engineer: DemoEngineer;
  className?: string;
  hideCommunityLabel?: boolean;
  shellless?: boolean;
  variant?: 'default' | 'landing';
  communityLabel?: string;
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

function formatLandingTimezoneLabel(engineer: DemoEngineer): string {
  return formatUsTimezoneShortLabel(engineer.timezone);
}

type LandingProfileCardBodyProps = {
  engineer: DemoEngineer;
  primaryButtonLabel?: string;
  showFootNote?: boolean;
  showTalentActions?: boolean;
  isShortlisted?: boolean;
  isInCompare?: boolean;
  compareDisabled?: boolean;
  onShortlist?: () => void;
  onCompare?: () => void;
};

function LandingProfileCardBody({
  engineer,
  primaryButtonLabel,
  showFootNote = false,
  showTalentActions = false,
  isShortlisted = false,
  isInCompare = false,
  compareDisabled = false,
  onShortlist,
  onCompare,
}: LandingProfileCardBodyProps) {
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
  const timezoneLabel = formatLandingTimezoneLabel(engineer);
  const showTimezone = Boolean(timezoneLabel);
  const resolvedPrimaryLabel =
    primaryButtonLabel ??
    (engineer.trialEligible ? 'Free Trial' : 'Request availability');

  return (
    <div className="mkt-lpc">
      <div className="mkt-lpc-grid">
        <div className="mkt-lpc-left">
          <div className="mkt-lpc-av-wrap">
            <DemoEngineerGenderAvatar gender={engineer.gender} name={engineer.name} />
            <span className="mkt-lpc-av-badge" aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.25 4.75 8.5 9.5 3.75"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

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

          <div className={cn('mkt-lpc-tz-slot', !showTimezone && 'is-empty')}>
            {showTimezone ? (
              <div className="mkt-lpc-exp mkt-lpc-tz-inline" title={`Timezone : ${timezoneLabel}`}>
                Timezone : <strong>{timezoneLabel}</strong>
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

      {showRate || showAvailability ? (
        <div className={cn('mkt-lpc-pricing', !showRate && 'mkt-lpc-pricing--avail-only')}>
          {showRate ? (
            <div className="mkt-lpc-rate">
              ${engineer.rate}
              <span className="mkt-lpc-rate-s">/hr</span>
            </div>
          ) : (
            <span aria-hidden="true" />
          )}
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
      ) : null}

      <div className="mkt-lpc-foot">
        <div className="mkt-lpc-foot-btns">
          <button type="button" className="mkt-lpc-btn mkt-lpc-btn-primary">
            {resolvedPrimaryLabel}
          </button>
          <button type="button" className="mkt-lpc-btn mkt-lpc-btn-secondary">
            Resume
          </button>
        </div>

        {showTalentActions ? (
          <div className="mkt-lpc-talent-actions">
            <button
              type="button"
              className={cn(
                'mkt-lpc-btn mkt-lpc-btn-secondary',
                isShortlisted && 'is-active',
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
                'mkt-lpc-btn mkt-lpc-btn-secondary',
                isInCompare && 'is-active',
              )}
              onClick={onCompare}
              disabled={compareDisabled}
              aria-pressed={isInCompare}
              title={
                compareDisabled
                  ? `Compare up to ${MAX_COMPARE} engineers — remove one to add another`
                  : undefined
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="7" height="16" rx="1.5" />
                <rect x="14" y="4" width="7" height="16" rx="1.5" />
              </svg>
              {isInCompare ? 'In compare' : 'Compare'}
            </button>
          </div>
        ) : null}

        {showFootNote ? (
          <div className="mkt-lpc-foot-note">
            <Info className="mkt-lpc-foot-note-icon" aria-hidden="true" />
            <span>{liveProfile.caption}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DemoEngineerCard({
  engineer,
  className,
  communityLabel,
  hideCommunityLabel = false,
  shellless = false,
  variant = 'default',
  showTalentActions = false,
  isShortlisted = false,
  isInCompare = false,
  compareDisabled = false,
  onShortlist,
  onCompare,
}: DemoEngineerCardProps) {
  const isHomeLanding = variant === 'landing' && !showTalentActions;
  const body = (
    <LandingProfileCardBody
      engineer={engineer}
      primaryButtonLabel={isHomeLanding ? 'Free Trial' : undefined}
      showFootNote={isHomeLanding}
      showTalentActions={showTalentActions}
      isShortlisted={isShortlisted}
      isInCompare={isInCompare}
      compareDisabled={compareDisabled}
      onShortlist={onShortlist}
      onCompare={onCompare}
    />
  );

  if (shellless) {
    return body;
  }

  return (
    <article
      className={cn(
        'mkt-prof mkt-prof-landing',
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
