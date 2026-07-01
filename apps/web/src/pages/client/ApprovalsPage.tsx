import { approvals } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { Check, CheckSquare, X } from 'lucide-react';
import { DEMO_CLIENT_ID } from '../../lib/demo-client';

export function ApprovalsPage() {
  const clientApprovals = approvals.filter((a) => a.clientId === DEMO_CLIENT_ID);
  const pending = clientApprovals.filter((a) => a.status === 'PENDING');
  const resolved = clientApprovals.filter((a) => a.status !== 'PENDING');

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Review and action pending requests from your BesTal account team"
      />

      <div className="space-y-8 p-6">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pending ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="h-8 w-8" />}
              title="All caught up"
              description="You have no pending approval requests at this time."
            />
          ) : (
            <div className="grid gap-4">
              {pending.map((approval) => (
                <Card key={approval.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {approval.title}
                          </h3>
                          <StatusBadge status={approval.type} />
                        </div>
                        <p className="text-sm text-muted-foreground">{approval.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested by {approval.requestedBy} ·{' '}
                          {formatDate(approval.requestedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="outline" size="sm">
                          <X className="mr-1.5 h-4 w-4" />
                          Reject
                        </Button>
                        <Button size="sm">
                          <Check className="mr-1.5 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {resolved.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recently Resolved
            </h2>
            <div className="grid gap-3">
              {resolved.map((approval) => (
                <div
                  key={approval.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{approval.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Reviewed by {approval.reviewedBy ?? '—'} ·{' '}
                      {approval.reviewedAt ? formatDate(approval.reviewedAt) : '—'}
                    </p>
                  </div>
                  <StatusBadge status={approval.status} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
