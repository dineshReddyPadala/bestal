import { Button, Dialog, Input, Select } from '@bestal/ui';
import { useState } from 'react';
import { getApiErrorMessage } from '../../lib/api/errors';
import { TIMEZONE_OPTIONS } from '../../lib/timezones';
import { Label } from '../ui/label';

export type DeploymentRequestFormValues = {
  roleTitle: string;
  placementType: 'CONTRACT' | 'PERMANENT' | 'TEMP_TO_PERM' | 'FREELANCE';
  startDate: string;
  endDate: string;
  workLocation: string;
  expectedHoursPerWeek: string;
  timezone: string;
  reportingManagerName: string;
  reportingManagerEmail: string;
};

type RequestDeploymentDialogProps = {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onSubmit: (values: DeploymentRequestFormValues) => void | Promise<void>;
};

const EMPTY: DeploymentRequestFormValues = {
  roleTitle: '',
  placementType: 'CONTRACT',
  startDate: '',
  endDate: '',
  workLocation: '',
  expectedHoursPerWeek: '',
  timezone: 'America/New_York',
  reportingManagerName: '',
  reportingManagerEmail: '',
};

export function RequestDeploymentDialog({
  open,
  onClose,
  candidateName,
  onSubmit,
}: RequestDeploymentDialogProps) {
  const [values, setValues] = useState<DeploymentRequestFormValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof DeploymentRequestFormValues>(
    key: K,
    value: DeploymentRequestFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.roleTitle.trim()) {
      setError('Role title is required');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
      setValues(EMPTY);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Deployment request failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!submitting) onClose();
      }}
      title={`Request deployment — ${candidateName}`}
      className="max-w-2xl"
      scrollable
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="deployment-request-form" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </>
      }
    >
      <form
        id="deployment-request-form"
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-3"
      >
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="roleTitle">Role title *</Label>
          <Input
            id="roleTitle"
            value={values.roleTitle}
            onChange={(e) => setField('roleTitle', e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="placementType">Placement type</Label>
            <Select
              id="placementType"
              value={values.placementType}
              onChange={(e) =>
                setField(
                  'placementType',
                  e.target.value as DeploymentRequestFormValues['placementType'],
                )
              }
            >
              <option value="CONTRACT">Contract</option>
              <option value="PERMANENT">Permanent</option>
              <option value="TEMP_TO_PERM">Temp to perm</option>
              <option value="FREELANCE">Freelance</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={values.timezone}
              onChange={(e) => setField('timezone', e.target.value)}
            >
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={values.startDate}
              onChange={(e) => setField('startDate', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="date"
              value={values.endDate}
              onChange={(e) => setField('endDate', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workLocation">Work location</Label>
            <Input
              id="workLocation"
              placeholder="Remote, hybrid, or office city"
              value={values.workLocation}
              onChange={(e) => setField('workLocation', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expectedHoursPerWeek">Expected hours / week</Label>
            <Input
              id="expectedHoursPerWeek"
              type="number"
              min={1}
              value={values.expectedHoursPerWeek}
              onChange={(e) => setField('expectedHoursPerWeek', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reportingManagerName">Reporting manager</Label>
            <Input
              id="reportingManagerName"
              value={values.reportingManagerName}
              onChange={(e) => setField('reportingManagerName', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reportingManagerEmail">Manager email</Label>
            <Input
              id="reportingManagerEmail"
              type="email"
              value={values.reportingManagerEmail}
              onChange={(e) => setField('reportingManagerEmail', e.target.value)}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
}
