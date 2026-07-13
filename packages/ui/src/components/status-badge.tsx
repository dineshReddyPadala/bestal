import { cn } from '@bestal/shared-utils';
import { Badge, type BadgeProps } from './badge.js';

const statusConfig = {
  NEW: { label: 'New', variant: 'secondary' as const },
  ACTIVE: { label: 'Active', variant: 'success' as const },
  INACTIVE: { label: 'Inactive', variant: 'outline' as const },
  PLACED: { label: 'Placed', variant: 'navy' as const },
  DO_NOT_CONTACT: { label: 'Do Not Contact', variant: 'destructive' as const },
  SUPER_ADMIN: { label: 'Super Admin', variant: 'navy' as const },
  PENDING: { label: 'Pending', variant: 'warning' as const },
  APPROVED: { label: 'Approved', variant: 'success' as const },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const },
  DRAFT: { label: 'Draft', variant: 'outline' as const },
  PUBLISHED: { label: 'Published', variant: 'success' as const },
  INTERNAL_ONLY: { label: 'Internal Only', variant: 'outline' as const },
  CLIENT_VISIBLE: { label: 'Client Visible', variant: 'success' as const },
  SOURCED: { label: 'Sourced', variant: 'secondary' as const },
  AI_SCREENED: { label: 'AI Screened', variant: 'secondary' as const },
  RECRUITER_SCREENED: { label: 'Recruiter Screened', variant: 'secondary' as const },
  EVALUATION_PENDING: { label: 'Evaluation Pending', variant: 'warning' as const },
  EVALUATION_COMPLETE: { label: 'Evaluation Complete', variant: 'success' as const },
  BGV_PENDING: { label: 'BGV Pending', variant: 'warning' as const },
  BGV_COMPLETE: { label: 'BGV Complete', variant: 'success' as const },
  PROFILE_DRAFT: { label: 'Profile Draft', variant: 'outline' as const },
  ADMIN_APPROVED: { label: 'Admin Approved', variant: 'success' as const },
  SHORTLISTED: { label: 'Shortlisted', variant: 'navy' as const },
  TRIAL: { label: 'Trial', variant: 'warning' as const },
  DEPLOYED: { label: 'Deployed', variant: 'navy' as const },
  IMMEDIATE: { label: 'Immediate', variant: 'success' as const },
  ONE_WEEK: { label: '1 Week', variant: 'outline' as const },
  TWO_WEEKS: { label: '2 Weeks', variant: 'outline' as const },
  THIRTY_DAYS: { label: '30 Days', variant: 'outline' as const },
  FUTURE: { label: 'Future', variant: 'outline' as const },
  NOT_AVAILABLE: { label: 'Not Available', variant: 'destructive' as const },
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
  'Strong Hire': { label: 'Strong Hire', variant: 'success' as const },
  Hire: { label: 'Hire', variant: 'success' as const },
  Borderline: { label: 'Borderline', variant: 'warning' as const },
  Reject: { label: 'Reject', variant: 'destructive' as const },
  ARCHIVED: { label: 'Archived', variant: 'outline' as const },
  CONTRACT: { label: 'Contract', variant: 'outline' as const },
  PERMANENT: { label: 'Permanent', variant: 'outline' as const },
  FREELANCE: { label: 'Freelance', variant: 'outline' as const },
  REQUESTED: { label: 'Requested', variant: 'warning' as const },
  STRONG_PASS: { label: 'Strong Pass', variant: 'success' as const },
  PASS: { label: 'Pass', variant: 'success' as const },
  REVIEW: { label: 'Review', variant: 'warning' as const },
  PROCESSING: { label: 'Processing', variant: 'warning' as const },
  VERIFIED: { label: 'Verified', variant: 'success' as const },
  UPLOADED: { label: 'Uploaded', variant: 'secondary' as const },
  SENT: { label: 'Sent', variant: 'secondary' as const },
  DELIVERED: { label: 'Delivered', variant: 'success' as const },
  READ: { label: 'Read', variant: 'outline' as const },
  NOT_DEPLOYED: { label: 'Not Deployed', variant: 'outline' as const },
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
