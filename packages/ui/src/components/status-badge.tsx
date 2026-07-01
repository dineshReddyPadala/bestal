import { cn } from '@bestal/shared-utils';
import { Badge, type BadgeProps } from './badge.js';

const statusConfig = {
  NEW: { label: 'New', variant: 'secondary' as const },
  ACTIVE: { label: 'Active', variant: 'success' as const },
  INACTIVE: { label: 'Inactive', variant: 'outline' as const },
  PLACED: { label: 'Placed', variant: 'navy' as const },
  DO_NOT_CONTACT: { label: 'Do Not Contact', variant: 'destructive' as const },
  PENDING: { label: 'Pending', variant: 'warning' as const },
  APPROVED: { label: 'Approved', variant: 'success' as const },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const },
  DRAFT: { label: 'Draft', variant: 'outline' as const },
  PUBLISHED: { label: 'Published', variant: 'success' as const },
  HIDDEN: { label: 'Hidden', variant: 'secondary' as const },
  PROSPECT: { label: 'Prospect', variant: 'secondary' as const },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' as const },
  COMPLETED: { label: 'Completed', variant: 'success' as const },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' as const },
  NOT_STARTED: { label: 'Not Started', variant: 'outline' as const },
  CLEAR: { label: 'Clear', variant: 'success' as const },
  CONSIDER: { label: 'Consider', variant: 'warning' as const },
  FAILED: { label: 'Failed', variant: 'destructive' as const },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' as const },
  TERMINATED: { label: 'Terminated', variant: 'destructive' as const },
  ON_HOLD: { label: 'On Hold', variant: 'warning' as const },
  SCHEDULED: { label: 'Scheduled', variant: 'secondary' as const },
  EXTENDED: { label: 'Extended', variant: 'navy' as const },
  STRONG_HIRE: { label: 'Strong Hire', variant: 'success' as const },
  HIRE: { label: 'Hire', variant: 'success' as const },
  NEUTRAL: { label: 'Neutral', variant: 'outline' as const },
  NO_HIRE: { label: 'No Hire', variant: 'destructive' as const },
  STRONG_NO_HIRE: { label: 'Strong No Hire', variant: 'destructive' as const },
  ARCHIVED: { label: 'Archived', variant: 'outline' as const },
  CONTRACT: { label: 'Contract', variant: 'outline' as const },
  PERMANENT: { label: 'Permanent', variant: 'outline' as const },
  FREELANCE: { label: 'Freelance', variant: 'outline' as const },
  REQUESTED: { label: 'Requested', variant: 'warning' as const },
  CONFIRMED: { label: 'Confirmed', variant: 'success' as const },
  RESCHEDULED: { label: 'Rescheduled', variant: 'warning' as const },
  VIDEO: { label: 'Video', variant: 'outline' as const },
  TECHNICAL: { label: 'Technical', variant: 'outline' as const },
  PANEL: { label: 'Panel', variant: 'outline' as const },
  FINAL: { label: 'Final', variant: 'outline' as const },
  HR: { label: 'HR', variant: 'outline' as const },
  PHONE: { label: 'Phone', variant: 'outline' as const },
  IN_PERSON: { label: 'In Person', variant: 'outline' as const },
} as const;

export type StatusKey = keyof typeof statusConfig;

export type StatusBadgeProps = Omit<BadgeProps, 'variant' | 'children'> & {
  status: StatusKey | string;
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status as StatusKey] ?? {
    label: status,
    variant: 'outline' as const,
  };

  return (
    <Badge variant={config.variant} className={cn('capitalize', className)} {...props}>
      {config.label}
    </Badge>
  );
}
