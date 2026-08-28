import type { ClientSearchRecord } from '@bestal/mock-data';
import { cn, formatCurrency, formatTimezoneLabel, initials } from '@bestal/shared-utils';
import { Avatar, Button } from '@bestal/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { BesTalScoreStars } from './BesTalScoreStars';
import {
  availabilityStatusClasses,
  isImmediatelyAvailable,
  resolveClientAvailabilityLabel,
} from '../../lib/availability-display';

const DEFAULT_PAGE_SIZE = 10;

export type ClientCandidateSearchTableProps = {
  records: readonly ClientSearchRecord[];
  selectedIds: ReadonlySet<number>;
  onSelectedChange: (id: number, selected: boolean) => void;
  onView: (id: number) => void;
  pageSize?: number;
  fillHeight?: boolean;
  className?: string;
};

function availabilityMeta(record: ClientSearchRecord) {
  const immediate = isImmediatelyAvailable(record);
  return {
    label: resolveClientAvailabilityLabel(record),
    classes: availabilityStatusClasses(immediate),
  };
}

function skillTags(record: ClientSearchRecord): string[] {
  const fromTop = record.topSkills.filter(Boolean);
  if (fromTop.length > 0) return fromTop.slice(0, 3);
  return record.skillNames.filter(Boolean).slice(0, 3);
}

type TableRowProps = {
  record: ClientSearchRecord;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onView: () => void;
};

function ClientCandidateSearchTableRow({
  record,
  selected,
  onSelectedChange,
  onView,
}: TableRowProps) {
  const availability = availabilityMeta(record);
  const tags = skillTags(record);
  const designation = record.currentTitle?.trim() || record.role;
  const timezoneLabel = formatTimezoneLabel(record.timezone);

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onView();
    }
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={onView}
      onKeyDown={handleRowKeyDown}
      className="cursor-pointer border-b border-border/60 bg-white transition-colors last:border-b-0 hover:bg-[var(--shell-table-row-hover)]"
      aria-label={`View profile for ${record.fullName}`}
    >
      <td className="w-10 px-3 py-3" onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange(event.target.checked)}
          className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
          aria-label={`Select ${record.fullName}`}
        />
      </td>
      <td className="px-3 py-3">
        <Avatar name={record.fullName} src={record.photoUrl || undefined} size="sm" />
      </td>
      <td className="min-w-[9rem] px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
            {initials(record.fullName)}
          </span>
          <span className="truncate text-sm font-medium text-foreground">{record.fullName}</span>
        </div>
      </td>
      <td className="hidden min-w-[8rem] max-w-[10rem] px-3 py-3 md:table-cell">
        <span className="line-clamp-2 text-sm text-muted-foreground">{designation}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <BesTalScoreStars score={record.bestalScore} />
      </td>
      <td className="hidden min-w-[8rem] px-3 py-3 lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex max-w-[7rem] truncate rounded-full bg-muted/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold tabular-nums">
        {formatCurrency(record.hourlyRate, record.currency)}
        <span className="text-xs font-normal text-muted-foreground">/hr</span>
      </td>
      <td className="hidden max-w-[9rem] truncate px-3 py-3 text-sm text-muted-foreground xl:table-cell">
        {record.currentCompany?.trim() || '—'}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-3 lg:table-cell">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs',
            availability.classes.text,
          )}
        >
          <span
            className={cn('inline-block h-2 w-2 rounded-full', availability.classes.dot)}
          />
          {availability.label}
        </span>
      </td>
      <td className="hidden max-w-[10rem] truncate px-3 py-3 text-sm text-muted-foreground xl:table-cell">
        {timezoneLabel ? `Timezone: ${timezoneLabel}` : '—'}
      </td>
    </tr>
  );
}

export function ClientCandidateSearchTable({
  records,
  selectedIds,
  onSelectedChange,
  onView,
  pageSize = DEFAULT_PAGE_SIZE,
  fillHeight = false,
  className,
}: ClientCandidateSearchTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const total = records.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPageIndex((prev) => Math.min(prev, Math.max(0, pageCount - 1)));
  }, [pageCount, records]);

  const pageRecords = useMemo(() => {
    const start = pageIndex * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, pageIndex, pageSize]);

  const rangeStart = total === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, total);
  const canPrevious = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-border/70 bg-white shadow-sm',
        fillHeight && 'h-full min-h-0',
        className,
      )}
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-[var(--shell-table-muted)] backdrop-blur">
            <tr className="border-b border-border/70">
              <th className="w-10 px-3 py-2.5" scope="col">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground" scope="col">
                Profile
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground" scope="col">
                Candidate
              </th>
              <th
                className="hidden px-3 py-2.5 text-xs font-semibold text-muted-foreground md:table-cell"
                scope="col"
              >
                Designation
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground" scope="col">
                BesTal Score
              </th>
              <th
                className="hidden px-3 py-2.5 text-xs font-semibold text-muted-foreground lg:table-cell"
                scope="col"
              >
                Top Skills
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground" scope="col">
                Rate
              </th>
              <th
                className="hidden px-3 py-2.5 text-xs font-semibold text-muted-foreground xl:table-cell"
                scope="col"
              >
                Previously…
              </th>
              <th
                className="hidden px-3 py-2.5 text-xs font-semibold text-muted-foreground lg:table-cell"
                scope="col"
              >
                Availability
              </th>
              <th
                className="hidden px-3 py-2.5 text-xs font-semibold text-muted-foreground xl:table-cell"
                scope="col"
              >
                Timezone
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRecords.map((record) => (
              <ClientCandidateSearchTableRow
                key={record.id}
                record={record}
                selected={selectedIds.has(record.id)}
                onSelectedChange={(next) => onSelectedChange(record.id, next)}
                onView={() => onView(record.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {total === 0
            ? '0 of 0'
            : rangeStart === rangeEnd
              ? `${rangeStart} of ${total}`
              : `${rangeStart}–${rangeEnd} of ${total}`}
        </span>
        <div className="-mr-1 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 px-0"
            onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={!canPrevious}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 px-0"
            onClick={() => setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))}
            disabled={!canNext}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
