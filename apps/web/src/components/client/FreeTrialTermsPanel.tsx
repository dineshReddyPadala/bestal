import {
  FREE_TRIAL_TERMS_CHECKBOX_LABEL,
  FREE_TRIAL_TERMS_CLOSING,
  FREE_TRIAL_TERMS_INTRO,
  FREE_TRIAL_TERMS_ITEMS,
} from '../../lib/free-trial-terms';

type FreeTrialTermsPanelProps = {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
};

export function FreeTrialTermsPanel({ accepted, onAcceptedChange }: FreeTrialTermsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="max-h-[min(22rem,50vh)] overflow-y-auto rounded-lg border border-border bg-muted/20 p-4 scrollbar-thin">
        <p className="text-sm leading-relaxed text-muted-foreground">{FREE_TRIAL_TERMS_INTRO}</p>
        <ol className="mt-4 space-y-4">
          {FREE_TRIAL_TERMS_ITEMS.map(({ title, body }, index) => (
            <li key={title} className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">
                {index + 1}. {title}:
              </span>{' '}
              {body}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{FREE_TRIAL_TERMS_CLOSING}</p>
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-brand accent-[#0e6e76]"
        />
        <span className="text-sm leading-snug text-foreground">{FREE_TRIAL_TERMS_CHECKBOX_LABEL}</span>
      </label>
    </div>
  );
}
