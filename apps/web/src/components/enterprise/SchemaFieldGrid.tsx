import { cn } from '@bestal/shared-utils';
import { StatusBadge } from '@bestal/ui';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { type ReactNode } from 'react';

export type SchemaFieldFormat =
  | 'text'
  | 'date'
  | 'datetime'
  | 'currency'
  | 'badge'
  | 'boolean'
  | 'link'
  | 'json';

export type SchemaFieldDef = {
  key: string;
  label: string;
  value: unknown;
  format?: SchemaFieldFormat;
  currency?: string;
  hidden?: boolean;
};

function formatValue(field: SchemaFieldDef): ReactNode {
  const { value, format = 'text', currency = 'USD' } = field;
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">—</span>;
  }
  switch (format) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return formatDate(String(value));
    case 'datetime':
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(String(value)));
    case 'currency':
      return formatCurrency(Number(value), currency);
    case 'badge':
      return <StatusBadge status={String(value)} />;
    case 'link':
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:underline"
        >
          {String(value).replace(/^https?:\/\//, '')}
        </a>
      );
    case 'json':
      return (
        <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    default:
      return String(value);
  }
}

type SchemaFieldGridProps = {
  fields: readonly SchemaFieldDef[];
  columns?: 1 | 2 | 3;
  className?: string;
};

export function SchemaFieldGrid({ fields, columns = 2, className }: SchemaFieldGridProps) {
  const visible = fields.filter((f) => !f.hidden);
  const gridClass =
    columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';

  return (
    <dl className={cn('grid gap-x-8 gap-y-4', gridClass, className)}>
      {visible.map((field) => (
        <div key={field.key} className="min-w-0 border-b border-border/60 pb-3 last:border-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {field.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground break-words">{formatValue(field)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function candidateToFields(c: import('@bestal/mock-data').SchemaCandidate): SchemaFieldDef[] {
  return [
    { key: 'id', label: 'ID', value: c.id },
    { key: 'organizationId', label: 'Organization ID', value: c.organizationId },
    { key: 'firstName', label: 'First Name', value: c.firstName },
    { key: 'lastName', label: 'Last Name', value: c.lastName },
    { key: 'email', label: 'Email', value: c.email },
    { key: 'phone', label: 'Phone', value: c.phone },
    { key: 'headline', label: 'Headline', value: c.headline },
    { key: 'summary', label: 'Summary', value: c.summary },
    { key: 'location', label: 'Location', value: c.location },
    { key: 'yearsExperience', label: 'Years Experience', value: c.yearsExperience },
    { key: 'availableFrom', label: 'Available From', value: c.availableFrom, format: 'date' },
    { key: 'expectedRate', label: 'Expected Rate', value: c.expectedRate, format: 'currency', currency: c.currency ?? 'USD' },
    { key: 'currency', label: 'Currency', value: c.currency },
    { key: 'status', label: 'Status', value: c.status, format: 'badge' },
    { key: 'visibility', label: 'Visibility', value: c.visibility, format: 'badge' },
    { key: 'approvalStatus', label: 'Approval Status', value: c.approvalStatus, format: 'badge' },
    { key: 'source', label: 'Source', value: c.source, format: 'badge' },
    { key: 'primarySkillCommunityId', label: 'Primary Skill Community ID', value: c.primarySkillCommunityId },
    { key: 'resumeDocumentId', label: 'Resume Document ID', value: c.resumeDocumentId },
    { key: 'profileImageDocumentId', label: 'Profile Image Document ID', value: c.profileImageDocumentId },
    { key: 'introVideoDocumentId', label: 'Intro Video Document ID', value: c.introVideoDocumentId },
    { key: 'linkedinUrl', label: 'LinkedIn URL', value: c.linkedinUrl, format: 'link' },
    { key: 'publishedAt', label: 'Published At', value: c.publishedAt, format: 'datetime' },
    { key: 'hiddenAt', label: 'Hidden At', value: c.hiddenAt, format: 'datetime' },
    { key: 'approvedAt', label: 'Approved At', value: c.approvedAt, format: 'datetime' },
    { key: 'approvedById', label: 'Approved By ID', value: c.approvedById },
    { key: 'approvedByName', label: 'Approved By', value: c.approvedByName },
    { key: 'rejectedAt', label: 'Rejected At', value: c.rejectedAt, format: 'datetime' },
    { key: 'rejectedById', label: 'Rejected By ID', value: c.rejectedById },
    { key: 'rejectedByName', label: 'Rejected By', value: c.rejectedByName },
    { key: 'rejectionReason', label: 'Rejection Reason', value: c.rejectionReason },
    { key: 'createdAt', label: 'Created At', value: c.createdAt, format: 'datetime' },
    { key: 'updatedAt', label: 'Updated At', value: c.updatedAt, format: 'datetime' },
    { key: 'deletedAt', label: 'Deleted At', value: c.deletedAt, format: 'datetime' },
  ];
}

export function clientToFields(c: import('@bestal/mock-data').SchemaClient): SchemaFieldDef[] {
  return [
    { key: 'id', label: 'ID', value: c.id },
    { key: 'organizationId', label: 'Organization ID', value: c.organizationId },
    { key: 'name', label: 'Name', value: c.name },
    { key: 'slug', label: 'Slug', value: c.slug },
    { key: 'status', label: 'Status', value: c.status, format: 'badge' },
    { key: 'industry', label: 'Industry', value: c.industry },
    { key: 'website', label: 'Website', value: c.website, format: 'link' },
    { key: 'contactEmail', label: 'Contact Email', value: c.contactEmail },
    { key: 'contactPhone', label: 'Contact Phone', value: c.contactPhone },
    { key: 'accountManagerId', label: 'Account Manager ID', value: c.accountManagerId },
    { key: 'accountManagerName', label: 'Account Manager', value: c.accountManagerName },
    { key: 'addressLine1', label: 'Address Line 1', value: c.addressLine1 },
    { key: 'addressLine2', label: 'Address Line 2', value: c.addressLine2 },
    { key: 'city', label: 'City', value: c.city },
    { key: 'state', label: 'State', value: c.state },
    { key: 'postalCode', label: 'Postal Code', value: c.postalCode },
    { key: 'country', label: 'Country', value: c.country },
    { key: 'notes', label: 'Notes', value: c.notes },
    { key: 'activeDeployments', label: 'Active Deployments', value: c.activeDeployments },
    { key: 'totalSpend', label: 'Total Spend', value: c.totalSpend, format: 'currency', currency: c.totalSpend ? 'USD' : 'USD' },
    { key: 'createdAt', label: 'Created At', value: c.createdAt, format: 'datetime' },
    { key: 'updatedAt', label: 'Updated At', value: c.updatedAt, format: 'datetime' },
    { key: 'deletedAt', label: 'Deleted At', value: c.deletedAt, format: 'datetime' },
  ];
}
