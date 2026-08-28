export type DocumentPreviewKind =
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'image'
  | 'video'
  | 'other';

export function detectDocumentPreviewKind(
  mimeType?: string | null,
  fileName?: string | null,
): DocumentPreviewKind {
  const mime = mimeType?.toLowerCase() ?? '';
  const name = fileName?.toLowerCase() ?? '';

  if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx';
  }
  if (mime === 'application/msword' || (name.endsWith('.doc') && !name.endsWith('.docx'))) {
    return 'doc';
  }
  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(name)) return 'image';
  if (mime.startsWith('video/') || /\.(mp4|webm|mov)$/.test(name)) return 'video';
  return 'other';
}

export function pdfViewerSrc(url: string): string {
  const [base] = url.split('#');
  return `${base}#toolbar=0&navpanes=0`;
}

export function sanitizePreviewHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export function wrapWordPreviewHtml(bodyHtml: string): string {
  const safe = sanitizePreviewHtml(bodyHtml);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #e8e8e8;
    }
    body {
      font-family: Calibri, Cambria, "Segoe UI", "Times New Roman", serif;
      color: #1a1a1a;
    }
    .word-page {
      box-sizing: border-box;
      width: min(816px, 100%);
      min-height: 1056px;
      margin: 24px auto;
      padding: 72px 90px;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
      line-height: 1.5;
      font-size: 11pt;
    }
    .word-page p { margin: 0 0 8pt; }
    .word-page img { max-width: 100%; height: auto; }
    .word-page table { border-collapse: collapse; width: 100%; }
    .word-page td, .word-page th { border: 1px solid #cfcfcf; padding: 4px 8px; }
  </style>
</head>
<body>
  <div class="word-page">${safe}</div>
</body>
</html>`;
}
