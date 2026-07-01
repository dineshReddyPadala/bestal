import { formatDate } from '@bestal/shared-utils';
import { FileText } from 'lucide-react';
import { StatusBadge } from './status-badge.js';

export type DocumentItem = {
  id: number;
  fileName: string;
  kind: string;
  fileSizeKb: number;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
};

export type DocumentListProps = {
  documents: readonly DocumentItem[];
  emptyMessage?: string;
};

export function DocumentList({
  documents,
  emptyMessage = 'No documents uploaded yet.',
}: DocumentListProps) {
  if (documents.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {documents.map((doc) => (
        <li key={doc.id} className="flex items-center gap-4 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{doc.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {doc.kind.replace(/_/g, ' ')} · {doc.fileSizeKb} KB · {doc.uploadedBy} ·{' '}
              {formatDate(doc.uploadedAt)}
            </p>
          </div>
          <StatusBadge status={doc.status} />
        </li>
      ))}
    </ul>
  );
}
