import { shortlists } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { ListChecks, Users } from 'lucide-react';
import { DEMO_CLIENT_ID } from '../../lib/demo-client';

export function ShortlistsPage() {
  const clientShortlists = shortlists.filter((s) => s.clientId === DEMO_CLIENT_ID);

  return (
    <div>
      <PageHeader
        title="Shortlists"
      />

      <div className="p-6">
        {clientShortlists.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="h-8 w-8" />}
            title="No shortlists yet"
          />
        ) : (
          <div className="grid gap-4">
            {clientShortlists.map((shortlist) => (
              <Card key={shortlist.id} className="transition-shadow hover:shadow-elevated">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-foreground">{shortlist.title}</h2>
                        <StatusBadge status={shortlist.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{shortlist.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        Created by {shortlist.createdBy} · {formatDate(shortlist.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-sm">
                      <Users className="h-4 w-4 text-brand" />
                      <span className="font-medium text-foreground">
                        {shortlist.entries.length}
                      </span>
                      <span className="text-muted-foreground">candidates</span>
                    </div>
                  </div>

                  <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
                    {shortlist.entries.map((entry) => (
                      <li
                        key={entry.candidateId}
                        className="flex items-start justify-between gap-4 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            #{entry.rank} {entry.candidateName}
                          </p>
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDate(entry.addedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
