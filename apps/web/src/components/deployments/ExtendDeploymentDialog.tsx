import { Button, Dialog, Input } from '@bestal/ui';
import { useEffect, useState } from 'react';

type ExtendDeploymentDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  initialEndDate?: string | null;
  confirmLabel?: string;
  onClose: () => void;
  onSubmit: (values: { endDate: string; reason?: string }) => Promise<void>;
  /** When true, shows an optional reason field (client extension requests). */
  askReason?: boolean;
};

export function ExtendDeploymentDialog({
  open,
  title,
  description,
  initialEndDate,
  confirmLabel = 'Extend',
  onClose,
  onSubmit,
  askReason = false,
}: ExtendDeploymentDialogProps) {
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEndDate(initialEndDate?.slice(0, 10) ?? '');
    setReason('');
    setError(null);
    setSubmitting(false);
  }, [open, initialEndDate]);

  async function handleConfirm() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
      setError('Enter a valid end date (YYYY-MM-DD)');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        endDate: endDate.trim(),
        reason: askReason ? reason.trim() || undefined : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleConfirm()} disabled={submitting}>
            {submitting ? 'Saving…' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">New end date</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        {askReason ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Reason (optional)</span>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need the extension?"
            />
          </label>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </Dialog>
  );
}
