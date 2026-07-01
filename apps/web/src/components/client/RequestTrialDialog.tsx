import { Button, Dialog, Input, Select } from '@bestal/ui';
import { useState } from 'react';

type RequestTrialDialogProps = {
  open: boolean;
  onClose: () => void;
  candidateName: string;
};

export function RequestTrialDialog({ open, onClose, candidateName }: RequestTrialDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      title="Request 20-Hour Pilot"
      description={`Start a paid pilot engagement with ${candidateName}`}
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
          20-hour pilot request submitted. Your account manager will coordinate start dates.
        </p>
      ) : (
        <form id="trial-request-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="role-title" className="text-sm font-medium">
              Role title
            </label>
            <Input id="role-title" placeholder="e.g. Senior Full-Stack Engineer" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="trial-start" className="text-sm font-medium">
                Start date
              </label>
              <Input id="trial-start" type="date" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="trial-end" className="text-sm font-medium">
                End date
              </label>
              <Input id="trial-end" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="hours" className="text-sm font-medium">
              Hours per week
            </label>
            <Select id="hours" defaultValue="20">
              <option value="20">20 hours (pilot)</option>
              <option value="32">32 hours</option>
              <option value="40">40 hours</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="trial-notes" className="text-sm font-medium">
              Project scope
            </label>
            <textarea
              id="trial-notes"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe the trial project and success criteria…"
              required
            />
          </div>
        </form>
      )}
    </Dialog>
  );
}
