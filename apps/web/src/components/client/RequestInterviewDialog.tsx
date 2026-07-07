import { Button, Dialog } from '@bestal/ui';
import { useState } from 'react';
import { InterviewRequestForm } from '../forms/InterviewRequestForm';
import type { InterviewRequestFormValues } from '../../lib/entity-field-metadata';

type RequestInterviewDialogProps = {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSubmit: (values: InterviewRequestFormValues) => void;
};

export function RequestInterviewDialog({
  open,
  onClose,
  candidateName,
  onSubmit,
}: RequestInterviewDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(values: InterviewRequestFormValues) {
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
      title={`Request interview — ${candidateName}`}
      scrollable
      className="max-w-lg"
      footer={
        !submitted && (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="interview-request-form">
              Submit request
            </Button>
          </>
        )
      }
    >
      {submitted ? (
        <p className="py-4 text-center text-sm text-emerald-600">
          Interview request submitted. Your BesTal recruiter will confirm scheduling.
        </p>
      ) : (
        <InterviewRequestForm
          formId="interview-request-form"
          showActions={false}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Dialog>
  );
}
