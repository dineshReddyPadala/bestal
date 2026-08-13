import { Button, Dialog } from '@bestal/ui';
import { useState } from 'react';
import { TrialRequestForm } from '../forms/TrialRequestForm';
import type { TrialRequestFormValues } from '../../lib/entity-field-metadata';
import { getApiErrorMessage } from '../../lib/api/errors';

type RequestTrialDialogProps = {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSubmit: (values: TrialRequestFormValues) => void | Promise<void>;
};

export function RequestTrialDialog({
  open,
  onClose,
  candidateName,
  onSubmit,
}: RequestTrialDialogProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: TrialRequestFormValues) {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSubmitting(false);
        onClose();
      }, 1200);
    } catch (err) {
      setSubmitting(false);
      setError(getApiErrorMessage(err, 'Trial request failed'));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!submitting) onClose();
      }}
      title={`Request free trial — ${candidateName}`}
      className="max-w-2xl"
      scrollable
      footer={
        !submitted && (
          <>
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="trial-request-form" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </>
        )
      }
    >
      {submitted ? (
        <p className="py-4 text-center text-sm text-emerald-600">
          Free trial request submitted. Your account manager will review and confirm dates.
        </p>
      ) : (
        <div className="space-y-3">
          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <TrialRequestForm
            formId="trial-request-form"
            showActions={false}
            onSubmit={(values) => {
              void handleSubmit(values);
            }}
            onCancel={onClose}
          />
        </div>
      )}
    </Dialog>
  );
}
