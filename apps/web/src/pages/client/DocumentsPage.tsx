import { formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { Download, FileText, Shield } from 'lucide-react';

const documents = [
  {
    id: 1,
    name: 'Master Services Agreement',
    type: 'CONTRACT',
    updatedAt: '2026-05-15T10:00:00Z',
    size: '248 KB',
  },
  {
    id: 2,
    name: 'Statement of Work — Payments Platform',
    type: 'SOW',
    updatedAt: '2026-06-10T14:30:00Z',
    size: '1.2 MB',
  },
  {
    id: 3,
    name: 'NDA — Talent Engagement',
    type: 'LEGAL',
    updatedAt: '2026-04-01T09:00:00Z',
    size: '86 KB',
  },
  {
    id: 4,
    name: 'Insurance Certificate',
    type: 'COMPLIANCE',
    updatedAt: '2026-06-01T11:00:00Z',
    size: '412 KB',
  },
  {
    id: 5,
    name: 'Q2 2026 Engagement Summary',
    type: 'REPORT',
    updatedAt: '2026-06-28T16:00:00Z',
    size: '3.4 MB',
  },
];

const typeIcons: Record<string, typeof FileText> = {
  CONTRACT: FileText,
  SOW: FileText,
  LEGAL: Shield,
  COMPLIANCE: Shield,
  REPORT: FileText,
};

export function DocumentsPage() {
  return (
    <div>
      <PageHeader
        title="Documents"
      />

      <div className="p-6">
        {documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No documents"
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {documents.map((doc) => {
                const Icon = typeIcons[doc.type] ?? FileText;
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size} · Updated {formatDate(doc.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:shrink-0">
                      <StatusBadge status="ACTIVE" />
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
