import type { CandidateListRecord } from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { Avatar, Badge, Button, StatusBadge } from '@bestal/ui';
import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  Eye,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  Upload,
  Globe,
  EyeOff,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type RowAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
};

type CandidateRowActionsProps = {
  basePath: string;
  record: CandidateListRecord;
  onAction: (label: string) => void;
};

export function CandidateRowActions({ basePath, record, onAction }: CandidateRowActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const actions: RowAction[] = [
    { label: 'View', icon: <Eye className="h-3.5 w-3.5" />, onClick: () => onAction('View') },
    { label: 'Edit', icon: <Pencil className="h-3.5 w-3.5" />, onClick: () => onAction('Edit') },
    { label: 'Approve', icon: <CheckCircle className="h-3.5 w-3.5" />, onClick: () => onAction('Approve') },
    { label: 'Run AI', icon: <Sparkles className="h-3.5 w-3.5" />, onClick: () => onAction('Run AI') },
    { label: 'Upload Evaluation', icon: <Upload className="h-3.5 w-3.5" />, onClick: () => onAction('Upload Evaluation') },
    { label: 'Upload BGV', icon: <Upload className="h-3.5 w-3.5" />, onClick: () => onAction('Upload BGV') },
    { label: 'Publish', icon: <Globe className="h-3.5 w-3.5" />, onClick: () => onAction('Publish') },
    { label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => onAction('Delete'), variant: 'danger' },
  ];

  return (
    <div className="relative flex items-center gap-1" ref={ref} onClick={(e) => e.stopPropagation()}>
      <Link
        to={`${basePath}/${record.id}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-brand"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          {actions.map(({ label, icon, onClick, variant }) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted ${
                variant === 'danger' ? 'text-red-600' : 'text-foreground'
              }`}
              onClick={() => {
                onClick();
                setOpen(false);
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BesTalScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 90 ? 'success' : score >= 80 ? 'navy' : score >= 70 ? 'warning' : 'outline';
  return (
    <Badge variant={variant} className="font-semibold tabular-nums">
      {score}
    </Badge>
  );
}

export function AvailabilityBadge({ label }: { label: string }) {
  const key =
    label === 'Immediate'
      ? 'IMMEDIATE'
      : label.includes('2 weeks')
        ? 'WITHIN_2_WEEKS'
        : label.includes('30')
          ? 'WITHIN_30_DAYS'
          : label.includes('60')
            ? 'WITHIN_60_DAYS'
            : 'NOT_AVAILABLE';

  if (key === 'IMMEDIATE') return <StatusBadge status="IMMEDIATE" />;
  return <Badge variant="outline">{label}</Badge>;
}

export function BulkActionBar({
  onAction,
}: {
  onAction: (action: string, count: number) => void;
}) {
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => onAction('Approve', 0)}>
        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
        Approve
      </Button>
      <Button variant="outline" size="sm" onClick={() => onAction('Reject', 0)}>
        <XCircle className="mr-1.5 h-3.5 w-3.5" />
        Reject
      </Button>
      <Button variant="outline" size="sm" onClick={() => onAction('Publish', 0)}>
        <Globe className="mr-1.5 h-3.5 w-3.5" />
        Publish
      </Button>
      <Button variant="outline" size="sm" onClick={() => onAction('Hide', 0)}>
        <EyeOff className="mr-1.5 h-3.5 w-3.5" />
        Hide
      </Button>
      <Button variant="outline" size="sm" onClick={() => onAction('Delete', 0)}>
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        Delete
      </Button>
      <Button variant="outline" size="sm" onClick={() => onAction('Export CSV', 0)}>
        Export CSV
      </Button>
    </>
  );
}

export function formatTimezone(tz: string): string {
  return tz.replace(/_/g, ' ').replace('America/', '').replace('Europe/', '').replace('Asia/', '');
}

export function candidateListingColumns(
  basePath: string,
  onRowAction: (record: CandidateListRecord, action: string) => void,
): ColumnDef<CandidateListRecord>[] {
  return [
    {
      id: 'select',
      header: ({ table }: { table: { getIsAllPageRowsSelected: () => boolean; getToggleAllPageRowsSelectedHandler: () => (e: unknown) => void } }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-brand"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: { getIsSelected: () => boolean; getToggleSelectedHandler: () => (e: unknown) => void } }) => (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-brand"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      id: 'photo',
      header: 'Photo',
      enableSorting: false,
      cell: ({ row }: { row: { original: CandidateListRecord } }) => (
        <Avatar name={row.original.fullName} src={row.original.photoUrl} size="sm" />
      ),
    },
    {
      accessorKey: 'displayName',
      header: 'Display Name',
      cell: ({ row }: { row: { original: CandidateListRecord } }) => (
        <span className="font-medium">{row.original.displayName}</span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <span className="max-w-[200px] truncate text-muted-foreground" title={String(getValue())}>
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'community',
      header: 'Community',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <Badge variant="secondary" className="font-normal">
          {String(getValue())}
        </Badge>
      ),
    },
    {
      accessorKey: 'primarySkill',
      header: 'Primary Skill',
    },
    {
      accessorKey: 'yearsExperience',
      header: 'Experience',
      cell: ({ getValue }: { getValue: () => unknown }) => `${getValue()} yrs`,
    },
    {
      accessorKey: 'currentCompany',
      header: 'Current Company',
    },
    {
      accessorKey: 'bestalScore',
      header: 'BesTal Score',
      cell: ({ row }: { row: { original: CandidateListRecord } }) => (
        <BesTalScoreBadge score={row.original.bestalScore} />
      ),
    },
    {
      accessorKey: 'availability',
      header: 'Availability',
      cell: ({ row }: { row: { original: CandidateListRecord } }) => (
        <AvailabilityBadge label={row.original.availability} />
      ),
    },
    {
      accessorKey: 'timezone',
      header: 'Timezone',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <span className="text-xs text-muted-foreground">{formatTimezone(String(getValue()))}</span>
      ),
    },
    {
      accessorKey: 'billRate',
      header: 'Bill Rate',
      cell: ({ row }: { row: { original: CandidateListRecord } }) =>
        `${formatCurrency(row.original.billRate, row.original.currency)}/hr`,
    },
    {
      accessorKey: 'evaluationStatus',
      header: 'Evaluation',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <StatusBadge status={String(getValue())} />
      ),
    },
    {
      accessorKey: 'bgvStatus',
      header: 'BGV',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <StatusBadge status={String(getValue())} />
      ),
    },
    {
      accessorKey: 'profileStatus',
      header: 'Profile Status',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <StatusBadge status={String(getValue())} />
      ),
    },
    {
      accessorKey: 'visibility',
      header: 'Visibility',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <StatusBadge status={String(getValue())} />
      ),
    },
    {
      accessorKey: 'deploymentStatus',
      header: 'Deployment',
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <StatusBadge status={String(getValue())} />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }: { getValue: () => unknown }) => formatDate(String(getValue())),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }: { row: { original: CandidateListRecord } }) => (
        <CandidateRowActions
          basePath={basePath}
          record={row.original}
          onAction={(action) => onRowAction(row.original, action)}
        />
      ),
    },
  ];
}