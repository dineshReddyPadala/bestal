import { useState } from 'react';
import { ArrowLeft, Columns2, X } from 'lucide-react';
import { cn } from '@bestal/shared-utils';
import type { DemoEngineer } from '../../lib/demo-engineers';
import { MAX_COMPARE } from '../../hooks/useSampleTalentShortlist';

type SampleTalentCompareViewProps = {
  engineers: DemoEngineer[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onGoToBrowse: () => void;
};

type CompareRow = {
  label: string;
  highlight?: 'lowest' | 'highest';
  render: (engineer: DemoEngineer) => string;
  value?: (engineer: DemoEngineer) => number;
};

const ROWS: CompareRow[] = [
  { label: 'Role', render: (e) => e.role },
  { label: 'Discipline', render: (e) => e.discipline },
  {
    label: 'Rate',
    highlight: 'lowest',
    render: (e) => `$${e.rate}/hr`,
    value: (e) => e.rate,
  },
  {
    label: 'Test score',
    highlight: 'highest',
    render: (e) => `${e.score}/100`,
    value: (e) => e.score,
  },
  { label: 'Time zone', render: (e) => e.timezone },
  { label: 'Working hours', render: (e) => e.zoneHours },
  { label: 'Availability', render: (e) => e.availability },
  { label: 'Experience', render: (e) => e.experience },
  { label: 'Top skills', render: (e) => e.skills.slice(0, 4).join(', ') },
];

function bestEngineerIds(
  engineers: DemoEngineer[],
  row: CompareRow,
): Set<string> {
  if (!row.highlight || !row.value || engineers.length < 2) {
    return new Set();
  }

  const values = engineers.map((engineer) => row.value!(engineer));
  const target =
    row.highlight === 'lowest' ? Math.min(...values) : Math.max(...values);

  return new Set(
    engineers.filter((engineer) => row.value!(engineer) === target).map((engineer) => engineer.id),
  );
}

function CompareProfileHeader({
  engineer,
  onRemove,
}: {
  engineer: DemoEngineer;
  onRemove: () => void;
}) {
  return (
    <div className="mkt-st-compare-profile">
      <button
        type="button"
        className="mkt-st-compare-remove"
        aria-label={`Remove ${engineer.name} from compare`}
        onClick={onRemove}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="mkt-st-compare-profile-inner">
        <span className="mkt-st-compare-av">{engineer.initials}</span>
        <div className="mkt-st-compare-profile-text">
          <strong>{engineer.name}</strong>
          <span>{engineer.role}</span>
        </div>
      </div>
    </div>
  );
}

function CompareEmptySlot({
  index,
  onGoToBrowse,
}: {
  index: number;
  onGoToBrowse: () => void;
}) {
  return (
    <button type="button" className="mkt-st-compare-profile is-empty" onClick={onGoToBrowse}>
      <div className="mkt-st-compare-empty-inner">
        <span className="mkt-st-compare-empty-av">+</span>
        <div className="mkt-st-compare-profile-text">
          <strong>Add profile</strong>
          <span>Pick from Browse</span>
        </div>
      </div>
      <p className="mkt-st-compare-slot-note">Slot {index + 1} of {MAX_COMPARE}</p>
    </button>
  );
}

export function SampleTalentCompareView({
  engineers,
  onRemove,
  onClear,
  onGoToBrowse,
}: SampleTalentCompareViewProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  if (engineers.length === 0) {
    return (
      <div className="mkt-st-sl-empty">
        <div className="mkt-st-sl-empty-icon" aria-hidden="true">
          <Columns2 className="h-6 w-6" />
        </div>
        <p className="mkt-st-sl-empty-title">No engineers selected to compare</p>
        <p className="mkt-st-sl-empty-body">
          Use the Compare button on up to {MAX_COMPARE} profiles in Browse. We&apos;ll line them up
          side by side on rate, score, skills and test results.
        </p>
        <button type="button" className="mkt-btn mkt-btn-primary mkt-btn-sm mkt-st-sl-empty-cta" onClick={onGoToBrowse}>
          <ArrowLeft className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
          Browse engineers
        </button>
      </div>
    );
  }

  const slots: (DemoEngineer | null)[] = [
    ...engineers,
    ...Array.from({ length: MAX_COMPARE - engineers.length }, () => null),
  ];

  const dimensionLabels = engineers[0]?.dimensions.map((d) => d.label) ?? [];

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClear();
    setConfirmClear(false);
  }

  return (
    <div className="mkt-st-compare">
      <div className="mkt-st-compare-hd">
        <div>
          <h3>Compare engineers</h3>
          <p>
            Up to {MAX_COMPARE} profiles side by side.{' '}
            <span className="mkt-st-compare-count">
              {engineers.length} of {MAX_COMPARE} selected
            </span>
          </p>
          <div className="mkt-st-compare-progress" aria-hidden="true">
            {Array.from({ length: MAX_COMPARE }).map((_, index) => (
              <span
                key={index}
                className={cn('mkt-st-compare-progress-dot', index < engineers.length && 'is-filled')}
              />
            ))}
          </div>
        </div>
        <div className="mkt-st-compare-hd-actions">
          {engineers.length < MAX_COMPARE ? (
            <button type="button" className="mkt-btn mkt-btn-secondary mkt-btn-sm" onClick={onGoToBrowse}>
              Add another
            </button>
          ) : null}
          {confirmClear ? (
            <div className="mkt-st-compare-confirm">
              <span>Clear all?</span>
              <button type="button" className="mkt-st-sl-clear" onClick={handleClear}>
                Yes, clear
              </button>
              <button type="button" className="mkt-st-sl-clear" onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className="mkt-st-sl-clear" onClick={handleClear}>
              Clear compare
            </button>
          )}
        </div>
      </div>

      {engineers.length === 1 ? (
        <p className="mkt-st-compare-tip" role="status">
          Add one more profile to see side-by-side differences highlighted automatically.
        </p>
      ) : null}

      <div className="mkt-st-compare-panel">
        <div className="mkt-st-compare-slots">
          <div className="mkt-st-compare-slots-label" aria-hidden="true">
            Profile
          </div>
          {slots.map((engineer, index) =>
            engineer ? (
              <CompareProfileHeader
                key={engineer.id}
                engineer={engineer}
                onRemove={() => onRemove(engineer.id)}
              />
            ) : (
              <CompareEmptySlot key={`empty-${index}`} index={index} onGoToBrowse={onGoToBrowse} />
            ),
          )}
        </div>

        <div className="mkt-st-compare-scroll">
          <table className="mkt-st-compare-table">
            <tbody>
              {ROWS.map((row) => {
                const bestIds = bestEngineerIds(engineers, row);
                return (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {slots.map((engineer, index) => (
                      <td
                        key={engineer?.id ?? `empty-${index}`}
                        className={cn(engineer && bestIds.has(engineer.id) && 'is-best')}
                      >
                        {engineer ? (
                          <>
                            {row.render(engineer)}
                            {bestIds.has(engineer.id) ? (
                              <span className="mkt-st-compare-best">Best</span>
                            ) : null}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {dimensionLabels.map((label) => {
                const values = engineers.map((engineer) => {
                  const dim = engineer.dimensions.find((d) => d.label === label);
                  return dim?.value ?? -1;
                });
                const bestValue = Math.max(...values);
                const bestDimIds = new Set(
                  engineers
                    .filter((engineer) => {
                      const dim = engineer.dimensions.find((d) => d.label === label);
                      return dim && dim.value === bestValue && engineers.length > 1;
                    })
                    .map((engineer) => engineer.id),
                );

                return (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {slots.map((engineer, index) => {
                      if (!engineer) {
                        return <td key={`empty-${index}`}>—</td>;
                      }
                      const dim = engineer.dimensions.find((d) => d.label === label);
                      return (
                        <td key={engineer.id} className={cn(bestDimIds.has(engineer.id) && 'is-best')}>
                          {dim ? (
                            <span className="mkt-st-compare-score">
                              <span
                                className={cn(
                                  'mkt-st-compare-bar',
                                  dim.tone === 'gold' && 'is-gold',
                                )}
                                style={{ width: `${dim.value * 10}%` }}
                              />
                              {dim.value}/10
                              {bestDimIds.has(engineer.id) ? (
                                <span className="mkt-st-compare-best">Best</span>
                              ) : null}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
