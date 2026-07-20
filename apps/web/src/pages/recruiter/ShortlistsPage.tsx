import { formatDate } from '@bestal/shared-utils';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { Loader2, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useShortlist, useShortlistsList } from '../../hooks/api/useShortlists';
import type { ShortlistListItem } from '../../lib/api/types';

function ShortlistCard({ item }: { item: ShortlistListItem }) {
  const { data: detail, isLoading: detailLoading } = useShortlist(item.id);
  const candidates = detail?.candidates ?? [];
  const candidateCount = detail?.candidates.length ?? item.candidateCount;
  const createdByName = detail?.createdByName;

  return (
    <Card className="transition-shadow hover:shadow-elevated">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-sm text-muted-foreground">{item.clientName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</p>
          <p className="text-sm font-medium">{item.roleTitle ?? '—'}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {candidateCount} candidate{candidateCount === 1 ? '' : 's'}
        </div>

        {detailLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading candidates…
          </div>
        ) : candidates.length > 0 ? (
          <div className="space-y-2">
            {candidates.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
              >
                <span className="font-medium">{entry.candidateName}</span>
                <Badge variant="outline">#{entry.rank}</Badge>
              </div>
            ))}
            {candidates.length > 3 && (
              <p className="text-xs text-muted-foreground">+{candidates.length - 3} more</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No candidates added yet.</p>
        )}

        <p className="text-xs text-muted-foreground">
          Created {formatDate(item.createdAt)}
          {createdByName ? ` by ${createdByName}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}

export function ShortlistsPage() {
  const { data, isLoading, isError, error } = useShortlistsList({
    limit: 100,
    sort: '-createdAt',
  });

  const shortlists = useMemo(() => data?.data ?? [], [data]);

  return (
    <div>
      <PageHeader
        title="Shortlists"
        description="Curated candidate lists for client engagements"
      />

      {isError && (
        <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load shortlists'}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 px-6 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading shortlists…
        </div>
      ) : shortlists.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No shortlists yet"
            description="Create shortlists for clients when candidates are ready for review."
          />
        </div>
      ) : (
        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {shortlists.map((shortlist) => (
            <ShortlistCard key={shortlist.id} item={shortlist} />
          ))}
        </div>
      )}
    </div>
  );
}
