import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Inline attachment id referenced in HTML: `<img src="cid:bestal-logo@bestal" />` */
export const EMAIL_LOGO_CID = 'bestal-logo@bestal';

/** Source of truth: apps/web/src/asserts/Light Theme Website logo (1).svg */
const WEB_LOGO_FILENAMES = ['Light Theme Website logo (1).svg', 'New logo.png'];
const API_LOGO_FILENAMES = ['bestal-logo.svg', 'new-logo.png'];

function resolveLogoPath(): string | null {
  const candidates = [
    ...WEB_LOGO_FILENAMES.flatMap((filename) => [
      join(process.cwd(), 'apps/web/src/asserts', filename),
      join(process.cwd(), '../web/src/asserts', filename),
    ]),
    ...API_LOGO_FILENAMES.flatMap((filename) => [
      join(__dirname, '../../assets', filename),
      join(process.cwd(), 'src/assets', filename),
      join(process.cwd(), 'apps/api/src/assets', filename),
    ]),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function logoContentType(logoPath: string): string {
  return extname(logoPath).toLowerCase() === '.svg' ? 'image/svg+xml' : 'image/png';
}

function logoFilename(logoPath: string): string {
  return extname(logoPath).toLowerCase() === '.svg' ? 'bestal-logo.svg' : 'bestal-logo.png';
}

let cachedLogo:
  | {
      buffer: Buffer;
      contentType: string;
      filename: string;
    }
  | null
  | undefined;

function getEmailLogo(): { buffer: Buffer; contentType: string; filename: string } | null {
  if (cachedLogo !== undefined) {
    return cachedLogo;
  }

  const logoPath = resolveLogoPath();
  if (!logoPath) {
    cachedLogo = null;
    return null;
  }

  cachedLogo = {
    buffer: readFileSync(logoPath),
    contentType: logoContentType(logoPath),
    filename: logoFilename(logoPath),
  };
  return cachedLogo;
}

export function getEmailLogoBuffer(): Buffer | null {
  return getEmailLogo()?.buffer ?? null;
}

export function getEmailLogoSrc(): string | null {
  if (!getEmailLogo()) {
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
  const logo = getEmailLogo();
  if (!logo) {
    return null;
  }

  return {
    filename: logo.filename,
    content: logo.buffer,
    cid: EMAIL_LOGO_CID,
    contentType: logo.contentType,
    contentDisposition: 'inline',
  };
}

/** Fallback for clients that inline base64 (e.g. local HTML preview). */
export function getEmailLogoDataUri(): string | null {
  const logo = getEmailLogo();
  if (!logo) {
    return null;
  }

  return `data:${logo.contentType};base64,${logo.buffer.toString('base64')}`;
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
  const logo = getEmailLogo();
  if (!logo) {
    return null;
  }

  return {
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: logo.filename,
    contentType: logo.contentType,
    contentBytes: logo.buffer.toString('base64'),
    contentId: EMAIL_LOGO_CID,
    isInline: true,
  };
}
