import type { ClientSearchRecord } from '@bestal/mock-data';
import { Avatar, Dialog, SearchInput } from '@bestal/ui';
import { Heart, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { mapApiCandidateToClientSearchRecord } from '../../lib/client-search-api';

export type PickCandidateDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (candidate: ClientSearchRecord) => void;
  title: string;
  /** When true, only candidates eligible for trial pilots are shown. */
  trialEligibleOnly?: boolean;
  shortlistedIds?: number[];
  excludeIds?: number[];
};

export function PickCandidateDialog({
  open,
  onClose,
  onSelect,
  title,
  trialEligibleOnly = false,
  shortlistedIds = [],
  excludeIds = [],
}: PickCandidateDialogProps) {
  const [query, setQuery] = useState('');
  const { data: apiCandidates } = useCandidatesList({ limit: 100 });

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const candidates = useMemo(() => {
    let rows = (apiCandidates?.data ?? [])
      .map(mapApiCandidateToClientSearchRecord)
      .filter((c) => !excludeIds.includes(c.id));
    if (trialEligibleOnly) {
      rows = rows.filter((c) => c.trialEligible);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.community.toLowerCase().includes(q) ||
          c.topSkills.some((s) => s.toLowerCase().includes(q)),
      );
    }

    const shortlisted = new Set(shortlistedIds);
    return [...rows].sort((a, b) => {
      const aShort = shortlisted.has(a.id) ? 0 : 1;
      const bShort = shortlisted.has(b.id) ? 0 : 1;
      if (aShort !== bShort) return aShort - bShort;
      return b.bestalScore - a.bestalScore;
    });
  }, [apiCandidates, query, trialEligibleOnly, shortlistedIds, excludeIds]);

  return (
    <Dialog open={open} onClose={onClose} title={title} scrollable className="max-w-lg">
      <div className="space-y-4">
        <SearchInput
          placeholder="Search by name, role, or skill…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {candidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No candidates found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {trialEligibleOnly
                ? 'No trial-eligible candidates match. Try a different search.'
                : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <ul className="max-h-[min(50vh,420px)] divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {candidates.map((candidate) => {
              const isShortlisted = shortlistedIds.includes(candidate.id);
              return (
                <li key={candidate.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60"
                    onClick={() => {
                      onSelect(candidate);
                      onClose();
                    }}
                  >
                    <Avatar name={candidate.fullName} src={candidate.photoUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-foreground">
                          {candidate.fullName}
                        </span>
                        {isShortlisted && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand">
                            <Heart className="h-3 w-3 fill-current" />
                            Shortlisted
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{candidate.role}</p>
                      <p className="text-xs text-muted-foreground">
                        Score {candidate.bestalScore} · {candidate.community}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
