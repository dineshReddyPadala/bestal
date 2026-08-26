import { Dialog } from '@bestal/ui';

type DocumentPreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string | null | undefined;
  mimeType?: string | null;
  fileName?: string | null;
};

function canPreviewInline(mimeType?: string | null, fileName?: string | null): boolean {
  if (mimeType?.toLowerCase().includes('pdf')) return true;
  return fileName?.toLowerCase().endsWith('.pdf') ?? false;
}

export function DocumentPreviewDialog({
  open,
  onClose,
  title,
  url,
  mimeType,
  fileName,
}: DocumentPreviewDialogProps) {
  const previewable = Boolean(url) && canPreviewInline(mimeType, fileName);

  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-5xl">
      {previewable ? (
        <iframe
          src={url ?? undefined}
          title={title}
          className="h-[75vh] w-full rounded-lg border border-border bg-white"
        />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Preview is not available for this file type. Contact BesTal for assistance.
        </p>
      )}
    </Dialog>
  );
}
