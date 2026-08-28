import { Dialog } from '@bestal/ui';
import { renderAsync } from 'docx-preview';
import { useEffect, useRef, useState } from 'react';
import { candidatesApi } from '../../lib/api/candidates';
import { getApiErrorMessage } from '../../lib/api/errors';
import {
  detectDocumentPreviewKind,
  pdfViewerSrc,
  wrapWordPreviewHtml,
  type DocumentPreviewKind,
} from './document-preview-kind';

type DocumentPreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string | null | undefined;
  mimeType?: string | null;
  fileName?: string | null;
  documentId?: number | null;
};

const PREVIEW_UNAVAILABLE = 'Preview is not available for this file type.';

const DOCX_PREVIEW_OPTIONS = {
  inWrapper: true,
  ignoreWidth: false,
  breakPages: true,
  useBase64URL: true,
  renderHeaders: true,
  renderFooters: true,
} as const;

async function loadDocxBuffer(options: {
  url?: string | null;
  documentId?: number | null;
}): Promise<ArrayBuffer> {
  if (options.documentId) {
    return candidatesApi.getDocumentFile(options.documentId);
  }
  if (options.url) {
    const response = await fetch(options.url);
    if (!response.ok) {
      throw new Error('Unable to load this Word document for preview.');
    }
    return response.arrayBuffer();
  }
  throw new Error(PREVIEW_UNAVAILABLE);
}

function WordHtmlFrame({ html }: { html: string }) {
  return (
    <iframe
      title="Word document preview"
      sandbox="allow-same-origin"
      srcDoc={wrapWordPreviewHtml(html)}
      className="h-[75vh] w-full rounded-lg border border-border bg-[#e8e8e8]"
    />
  );
}

function DocxNativePreview({ buffer }: { buffer: ArrayBuffer }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.replaceChildren();
    let cancelled = false;
    void renderAsync(buffer, container, undefined, { ...DOCX_PREVIEW_OPTIONS }).catch((err) => {
      if (!cancelled) {
        setRenderError(getApiErrorMessage(err, PREVIEW_UNAVAILABLE));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [buffer]);

  if (renderError) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{renderError}</p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[75vh] w-full overflow-auto rounded-lg border border-border bg-[#e8e8e8]"
    />
  );
}

function WordPreviewPane({
  kind,
  url,
  documentId,
  fileName,
}: {
  kind: Extract<DocumentPreviewKind, 'docx' | 'doc'>;
  url: string | null | undefined;
  documentId?: number | null;
  fileName?: string | null;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [docxBuffer, setDocxBuffer] = useState<ArrayBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setHtml(null);
      setDocxBuffer(null);

      try {
        if (kind === 'docx') {
          const buffer = await loadDocxBuffer({ url, documentId });
          if (!cancelled) setDocxBuffer(buffer);
          return;
        }

        if (documentId) {
          const data = await candidatesApi.previewWordHtml(documentId);
          if (!cancelled) setHtml(data.html);
          return;
        }

        if (url) {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Unable to load this Word document for preview.');
          }
          const blob = await response.blob();
          const data = await candidatesApi.previewWordHtmlFromFile(
            blob,
            fileName || 'document.doc',
          );
          if (!cancelled) setHtml(data.html);
          return;
        }

        throw new Error(PREVIEW_UNAVAILABLE);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, PREVIEW_UNAVAILABLE));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [kind, url, documentId, fileName]);

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Loading preview…</p>
    );
  }

  if (kind === 'docx') {
    if (error || !docxBuffer) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {error ?? PREVIEW_UNAVAILABLE}
        </p>
      );
    }
    return <DocxNativePreview buffer={docxBuffer} />;
  }

  if (error || !html) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {error ?? PREVIEW_UNAVAILABLE}
      </p>
    );
  }

  return <WordHtmlFrame html={html} />;
}

export function DocumentPreviewDialog({
  open,
  onClose,
  title,
  url,
  mimeType,
  fileName,
  documentId,
}: DocumentPreviewDialogProps) {
  const kind = detectDocumentPreviewKind(mimeType, fileName);

  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-5xl">
      {kind === 'pdf' && url ? (
        <object
          data={pdfViewerSrc(url)}
          type="application/pdf"
          className="h-[75vh] w-full rounded-lg border border-border bg-white"
        >
          <iframe
            src={pdfViewerSrc(url)}
            title={title}
            className="h-[75vh] w-full rounded-lg border-0 bg-white"
          />
        </object>
      ) : kind === 'docx' || kind === 'doc' ? (
        <WordPreviewPane
          kind={kind}
          url={url}
          documentId={documentId}
          fileName={fileName}
        />
      ) : kind === 'image' && url ? (
        <img
          src={url}
          alt={title}
          className="mx-auto max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
        />
      ) : kind === 'video' && url ? (
        <video
          src={url}
          controls
          controlsList="nodownload"
          className="h-[75vh] w-full rounded-lg bg-black"
        />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">{PREVIEW_UNAVAILABLE}</p>
      )}
    </Dialog>
  );
}
