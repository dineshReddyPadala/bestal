import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Inline attachment id referenced in HTML: `<img src="cid:bestal-logo@bestal" />` */
export const EMAIL_LOGO_CID = 'bestal-logo@bestal';

/** Source of truth: apps/web/src/asserts/New logo.png */
const WEB_LOGO_FILENAME = 'New logo.png';
const API_LOGO_FILENAME = 'new-logo.png';

function resolveLogoPath(): string | null {
  const candidates = [
    join(process.cwd(), 'apps/web/src/asserts', WEB_LOGO_FILENAME),
    join(process.cwd(), '../web/src/asserts', WEB_LOGO_FILENAME),
    join(__dirname, '../../assets', API_LOGO_FILENAME),
    join(process.cwd(), 'src/assets', API_LOGO_FILENAME),
    join(process.cwd(), 'apps/api/src/assets', API_LOGO_FILENAME),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

let cachedLogoBuffer: Buffer | null | undefined;

export function getEmailLogoBuffer(): Buffer | null {
  if (cachedLogoBuffer !== undefined) {
    return cachedLogoBuffer;
  }

  const logoPath = resolveLogoPath();
  if (!logoPath) {
    cachedLogoBuffer = null;
    return null;
  }

  cachedLogoBuffer = readFileSync(logoPath);
  return cachedLogoBuffer;
}

export function getEmailLogoSrc(): string | null {
  const buffer = getEmailLogoBuffer();
  if (!buffer) {
    return null;
  }

  return `cid:${EMAIL_LOGO_CID}`;
}

/** Nodemailer inline attachment for branded email headers. */
export function getEmailLogoAttachment():
  | {
      filename: string;
      content: Buffer;
      cid: string;
      contentType: string;
      contentDisposition: 'inline';
    }
  | null {
  const buffer = getEmailLogoBuffer();
  if (!buffer) {
    return null;
  }

  return {
    filename: 'bestal-logo.png',
    content: buffer,
    cid: EMAIL_LOGO_CID,
    contentType: 'image/png',
    contentDisposition: 'inline',
  };
}

/** Fallback for clients that inline base64 (e.g. local HTML preview). */
export function getEmailLogoDataUri(): string | null {
  const buffer = getEmailLogoBuffer();
  if (!buffer) {
    return null;
  }

  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/** Microsoft Graph inline file attachment payload. */
export function getEmailLogoGraphAttachment():
  | {
      '@odata.type': '#microsoft.graph.fileAttachment';
      name: string;
      contentType: string;
      contentBytes: string;
      contentId: string;
      isInline: true;
    }
  | null {
  const buffer = getEmailLogoBuffer();
  if (!buffer) {
    return null;
  }

  return {
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: 'bestal-logo.png',
    contentType: 'image/png',
    contentBytes: buffer.toString('base64'),
    contentId: EMAIL_LOGO_CID,
    isInline: true,
  };
}
