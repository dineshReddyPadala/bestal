import { cn, formatDate } from '@bestal/shared-utils';
import { Badge, Button, StatusBadge } from '@bestal/ui';
import { Eye, FileText, Link2, Upload } from 'lucide-react';
import { useRef, type ReactNode } from 'react';
import type { CandidateDocumentDto } from '../../lib/api/types';

export function ModernSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-gradient-to-r from-muted/30 to-transparent px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function ModernScoreTile({
  label,
  value,
  accent = 'brand',
}: {
  label: string;
  value: number | string | null | undefined;
  accent?: 'brand' | 'emerald' | 'amber';
}) {
  const accentClass =
    accent === 'emerald'
      ? 'from-emerald-500/10 to-transparent text-emerald-700'
      : accent === 'amber'
        ? 'from-amber-500/10 to-transparent text-amber-700'
        : 'from-brand/10 to-transparent text-brand';

  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 bg-gradient-to-br p-4 text-center shadow-sm',
        accentClass,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value ?? '—'}</p>
    </div>
  );
}

export function DocumentAssetRow({
  label,
  description,
  doc,
  accept,
  canUpload = false,
  onDownload,
  onUpload,
}: {
  label: string;
  description?: string;
  doc?: CandidateDocumentDto | null;
  accept?: string;
  canUpload?: boolean;
  onDownload?: (doc: CandidateDocumentDto) => void;
  onUpload?: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-gradient-to-r from-muted/20 via-background to-background px-4 py-3 transition-colors hover:border-brand/20">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {doc ? (
            <p className="truncate text-xs text-muted-foreground">
              {doc.fileName} · {formatDate(doc.createdAt)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {description ?? 'Not uploaded yet'}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {doc ? <StatusBadge status={doc.status} className="text-[10px]" /> : null}
        {!doc ? <Badge variant="outline">Missing</Badge> : null}
        {canUpload && onUpload ? (
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = '';
              }}
            />
            <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload
            </Button>
          </>
        ) : null}
        {doc && onDownload ? (
          <Button variant="ghost" size="sm" onClick={() => onDownload(doc)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Preview
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ProfileActionBar({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-gradient-to-r from-muted/40 via-background to-brand/5 px-5 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link2 className="h-4 w-4 text-brand" />
        <span>Profile actions</span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export const PROFILE_TAB_CLASS =
  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all';

export function profileTabClass(active: boolean) {
  return cn(
    PROFILE_TAB_CLASS,
    active
      ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
      : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
  );
}
