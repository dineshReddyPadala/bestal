import { shortlists } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Badge, Card, CardContent, CardHeader, CardTitle, PageHeader, StatusBadge } from '@bestal/ui';
import { Users } from 'lucide-react';

export function ShortlistsPage() {
  return (
    <div>
      <PageHeader
        title="Shortlists"
        description="Curated candidate lists for client engagements"
      />

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {shortlists.map((shortlist) => (
          <Card key={shortlist.id} className="transition-shadow hover:shadow-elevated">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">{shortlist.title}</CardTitle>
                <StatusBadge status={shortlist.status} />
              </div>
              <p className="text-sm text-muted-foreground">{shortlist.clientName}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Role
                </p>
                <p className="text-sm font-medium">{shortlist.jobTitle}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {shortlist.entries.length} candidates
              </div>

              <div className="space-y-2">
                {shortlist.entries.slice(0, 3).map((entry) => (
                  <div
                    key={entry.candidateId}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{entry.candidateName}</span>
                    <Badge variant="outline">#{entry.rank}</Badge>
                  </div>
                ))}
                {shortlist.entries.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{shortlist.entries.length - 3} more
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Created {formatDate(shortlist.createdAt)} by {shortlist.createdBy}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
