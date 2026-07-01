import { trials } from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
  Tabs,
} from '@bestal/ui';
import { Calendar, FlaskConical, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_CLIENT_ID } from '../../lib/demo-client';

function TrialCard({ trial }: { trial: (typeof trials)[number] }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{trial.candidateName}</h2>
              <StatusBadge status={trial.status} />
            </div>
            <p className="font-medium text-foreground">{trial.title}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(trial.startDate)} – {formatDate(trial.endDate)}
              </span>
              <span>{formatCurrency(trial.rate, trial.currency)}/hr</span>
              <span>{trial.hoursPerWeek} hrs/week</span>
              <span>Recruiter: {trial.recruiter}</span>
            </div>
            {trial.feedback && (
              <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {trial.feedback}
              </p>
            )}
          </div>
          <Link
            to={`/client/candidates/${trial.candidateId}`}
            className="inline-flex h-9 shrink-0 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted/50"
          >
            View candidate
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrialRequestsPage() {
  const clientTrials = useMemo(
    () => trials.filter((t) => t.clientId === DEMO_CLIENT_ID),
    [],
  );

  const active = clientTrials.filter((t) =>
    ['REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'EXTENDED'].includes(t.status),
  );
  const completed = clientTrials.filter((t) =>
    ['COMPLETED', 'CANCELLED'].includes(t.status),
  );

  return (
    <div>
      <PageHeader
        title="Trial Requests"
        description="Manage trial engagements before full deployment"
        actions={
          <Link to="/client/search">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request from search
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-6">
        {clientTrials.length === 0 ? (
          <EmptyState
            icon={<FlaskConical className="h-8 w-8" />}
            title="No trial requests"
            description="Request trials from candidate profiles to evaluate fit before hiring."
          />
        ) : (
          <Tabs
            tabs={[
              {
                id: 'active',
                label: `Active (${active.length})`,
                content: (
                  <div className="grid gap-4">
                    {active.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active trials.</p>
                    ) : (
                      active.map((trial) => <TrialCard key={trial.id} trial={trial} />)
                    )}
                  </div>
                ),
              },
              {
                id: 'history',
                label: `History (${completed.length})`,
                content: (
                  <div className="grid gap-4">
                    {completed.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No completed trials.</p>
                    ) : (
                      completed.map((trial) => <TrialCard key={trial.id} trial={trial} />)
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
