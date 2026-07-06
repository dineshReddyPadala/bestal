import { Button, Dialog, Input, Select } from '@bestal/ui';
import { useState } from 'react';

type RequestInterviewDialogProps = {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSubmitted?: () => void;
};

export function RequestInterviewDialog({
  open,
  onClose,
  candidateName,
  onSubmitted,
}: RequestInterviewDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    onSubmitted?.();
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Request Interview"
      description={`Schedule an interview with ${candidateName}`}
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
          Interview request submitted. Your BesTal recruiter will confirm within 24 hours.
        </p>
      ) : (
        <form id="interview-request-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="interview-type" className="text-sm font-medium">
              Interview type
            </label>
            <Select id="interview-type" defaultValue="VIDEO" required>
              <option value="VIDEO">Video call</option>
              <option value="TECHNICAL">Technical assessment</option>
              <option value="PANEL">Panel interview</option>
              <option value="FINAL">Final round</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="preferred-date" className="text-sm font-medium">
              Preferred date
            </label>
            <Input id="preferred-date" type="date" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duration (minutes)
            </label>
            <Select id="duration" defaultValue="60">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes for recruiter
            </label>
            <textarea
              id="notes"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Topics to cover, team members to include…"
            />
          </div>
        </form>
      )}
    </Dialog>
  );
}
