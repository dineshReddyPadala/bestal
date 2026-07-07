import { Button, Dialog } from '@bestal/ui';
import { useState } from 'react';
import { TrialRequestForm } from '../forms/TrialRequestForm';
import type { TrialRequestFormValues } from '../../lib/entity-field-metadata';

type RequestTrialDialogProps = {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSubmit: (values: TrialRequestFormValues) => void;
};

export function RequestTrialDialog({
  open,
  onClose,
  candidateName,
  onSubmit,
}: RequestTrialDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(values: TrialRequestFormValues) {
    onSubmit(values);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Request trial — ${candidateName}`}
      scrollable
      className="max-w-lg"
      footer={
        !submitted && (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="trial-request-form">
              Submit request
            </Button>
          </>
        )
      }
    >
      {submitted ? (
        <p className="py-4 text-center text-sm text-emerald-600">
          Trial request submitted. Your account manager will review and confirm dates.
        </p>
      ) : (
        <TrialRequestForm
          formId="trial-request-form"
          showActions={false}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Dialog>
  );
}
