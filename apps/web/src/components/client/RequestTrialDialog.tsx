import { Button, Dialog } from '@bestal/ui';
import { useEffect, useState } from 'react';
import { TrialRequestForm } from '../forms/TrialRequestForm';
import type { TrialRequestFormValues } from '../../lib/entity-field-metadata';
import { getApiErrorMessage } from '../../lib/api/errors';
import { FreeTrialTermsPanel } from './FreeTrialTermsPanel';

type RequestTrialDialogProps = {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSubmit: (values: TrialRequestFormValues) => void | Promise<void>;
};

type RequestTrialStep = 'terms' | 'form' | 'success';

export function RequestTrialDialog({
  open,
  onClose,
  candidateName,
  onSubmit,
}: RequestTrialDialogProps) {
  const [step, setStep] = useState<RequestTrialStep>('terms');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep('terms');
    setTermsAccepted(false);
    setSubmitting(false);
    setError(null);
  }, [open]);

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSubmit(values: TrialRequestFormValues) {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
      setStep('success');
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 1200);
    } catch (err) {
      setSubmitting(false);
      setError(getApiErrorMessage(err, 'Trial request failed'));
    }
  }

  if (step === 'terms') {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        title="Terms & Conditions"
        description="Please read and accept the terms and conditions to continue."
        className="max-w-2xl"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={!termsAccepted} onClick={() => setStep('form')}>
              Accept & Start Free Trial
            </Button>
          </div>
        }
      >
        <FreeTrialTermsPanel accepted={termsAccepted} onAcceptedChange={setTermsAccepted} />
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={`Request free trial — ${candidateName}`}
      className="max-w-2xl"
      scrollable
      footer={
        step === 'form' && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="trial-request-form" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </>
        )
      }
    >
      {step === 'success' ? (
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
            onCancel={handleClose}
          />
        </div>
      )}
    </Dialog>
  );
}
