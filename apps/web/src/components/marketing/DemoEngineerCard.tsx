import { cn } from '@bestal/shared-utils';
import type { DemoEngineer } from '../../lib/demo-engineers';

type DemoEngineerCardProps = {
  engineer: DemoEngineer;
  className?: string;
  compact?: boolean;
};

export function DemoEngineerCard({ engineer, className, compact }: DemoEngineerCardProps) {
  return (
    <article className={cn('mkt-prof', className)}>
      <div className="mkt-dtag">◆ Demo profile · fictional engineer</div>
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
          {engineer.trialEligible ? (
            <span className="mkt-bdg mkt-bdg-amber">20-Hour Trial</span>
          ) : (
            <span className="mkt-bdg mkt-bdg-muted">Trial unavailable</span>
          )}
        </div>

        <div className="mkt-tz-row">
          <div className="mkt-tz-ic">◷</div>
          <div>
            <div className="mkt-tz-l">Works {engineer.timezone}</div>
            <div className="mkt-tz-s">{engineer.timezoneDetail}</div>
          </div>
        </div>

        {!compact && (
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
                    className={cn(
                      'mkt-fl',
                      dim.label === 'Communication' && 'mkt-fl-amber',
                    )}
                    style={{ width: `${dim.value * 10}%` }}
                  />
                </span>
                <span className="mkt-scr-v">{dim.value}</span>
              </div>
            ))}
            <p className="mkt-evl">
              &ldquo;{engineer.evaluation}&rdquo;
              <br />
              <span className="mkt-evl-meta">— Outside specialist, tested Mar 2026</span>
            </p>
          </div>
        )}

        <div className="mkt-avl">
          <span className="mkt-avl-s">● {engineer.availability}</span>
          <span className="mkt-micro">Confirmed {engineer.confirmed}</span>
        </div>

        {!compact && (
          <div className="mkt-pacts">
            {engineer.trialEligible ? (
              <span className="mkt-btn mkt-btn-amber mkt-btn-sm">Start 20-Hour Free Trial</span>
            ) : (
              <span className="mkt-btn mkt-btn-primary mkt-btn-sm">Request availability</span>
            )}
            <span className="mkt-btn mkt-btn-secondary mkt-btn-sm">Shortlist</span>
            {!compact && <span className="mkt-btn mkt-btn-secondary mkt-btn-sm">Compare</span>}
          </div>
        )}
      </div>
    </article>
  );
}
