import path from 'node:path';
import { promisify } from 'node:util';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import mammoth from 'mammoth';
import libre from 'libreoffice-convert';
import { BadRequestError } from '../utils/index.js';

const libreConvert = promisify(libre.convert);

export type NormalizableUpload = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const FONT_SIZE = 11;
const LINE_HEIGHT = 14;

function isPdf(mimeType: string, originalName: string): boolean {
  const lower = originalName.toLowerCase();
  return mimeType === 'application/pdf' || lower.endsWith('.pdf');
}

function isDocx(mimeType: string, originalName: string): boolean {
  const lower = originalName.toLowerCase();
  return (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lower.endsWith('.docx')
  );
}

function isLegacyDoc(mimeType: string, originalName: string): boolean {
  const lower = originalName.toLowerCase();
  return mimeType === 'application/msword' || lower.endsWith('.doc');
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function pdfFileName(originalName: string): string {
  const base = path.basename(originalName, path.extname(originalName)) || 'document';
  return `${base}.pdf`;
}

/** pdf-lib StandardFonts use WinAnsi — map/strip characters outside that set. */
const UNICODE_TO_WINANSI: Readonly<Record<number, string>> = {
  0x2610: '[ ]', // ☐ ballot box
  0x2611: '[x]', // ☑ checked
  0x2612: '[x]', // ☒ checked X
  0x25a1: '[ ]', // □ white square
  0x25a0: '[*]', // ■ black square
  0x2022: '-', // • bullet
  0x2023: '>', // ‣
  0x2013: '-', // – en dash
  0x2014: '-', // — em dash
  0x2018: "'", // ‘
  0x2019: "'", // ’
  0x201a: "'", // ‚
  0x201c: '"', // “
  0x201d: '"', // ”
  0x201e: '"', // „
  0x2026: '...', // …
  0x00a0: ' ', // nbsp
  0x200b: '', // zero-width space
  0xfeff: '', // BOM
};

function sanitizeTextForPdfLib(text: string): string {
  let out = '';
  for (const char of text.replace(/\r/g, '')) {
    const mapped = UNICODE_TO_WINANSI[char.charCodeAt(0)];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    const code = char.charCodeAt(0);
    // Tab, LF, ASCII printable, and common Latin-1 (WinAnsi) range
    if (code === 0x09 || code === 0x0a || (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) {
      out += char;
    } else {
      out += ' ';
    }
  }
  return out.replace(/[^\S\n]+/g, ' ').trim();
}

async function textToPdf(text: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const maxWidth = PAGE_WIDTH - 2 * MARGIN;
  const sanitized = sanitizeTextForPdfLib(text);

  if (!sanitized) {
    throw new BadRequestError('Document has no readable text to convert to PDF');
  }

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const drawLine = (line: string) => {
    const safeLine = sanitizeTextForPdfLib(line);
    if (!safeLine) return;
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    page.drawText(safeLine, {
      x: MARGIN,
      y,
      size: FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT;
  };

  for (const paragraph of sanitized.split('\n')) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      y -= LINE_HEIGHT / 2;
      continue;
    }

    let line = '';
    for (const word of trimmed.split(/\s+/)) {
      const safeWord = sanitizeTextForPdfLib(word);
      if (!safeWord) continue;
      const candidate = line ? `${line} ${safeWord}` : safeWord;
      if (font.widthOfTextAtSize(candidate, FONT_SIZE) > maxWidth && line) {
        drawLine(line);
        line = safeWord;
      } else {
        line = candidate;
      }
    }
    if (line) drawLine(line);
    y -= LINE_HEIGHT / 2;
  }

  return Buffer.from(await pdfDoc.save());
}

async function convertWithLibreOffice(buffer: Buffer, extension: string): Promise<Buffer> {
  try {
    const pdf = await libreConvert(buffer, '.pdf', extension);
    if (!pdf?.length) {
      throw new Error('LibreOffice returned an empty PDF');
    }
    return Buffer.from(pdf);
  } catch (error) {
    throw new BadRequestError(
      `Unable to convert ${extension} to PDF. Install LibreOffice on the API host or upload a PDF instead.${
        error instanceof Error && error.message ? ` (${error.message})` : ''
      }`,
    );
  }
}

async function docxToPdf(buffer: Buffer): Promise<Buffer> {
  try {
    return await convertWithLibreOffice(buffer, '.docx');
  } catch {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim();
    if (!text) {
      throw new BadRequestError(
        'Unable to convert DOCX to PDF. Upload a PDF or install LibreOffice on the API server.',
      );
    }
    return textToPdf(text);
  }
}

async function imageToPdf(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const normalized = mimeType.toLowerCase();

  let image;
  if (normalized === 'image/png') {
    image = await pdfDoc.embedPng(buffer);
  } else if (normalized === 'image/jpeg' || normalized === 'image/jpg') {
    image = await pdfDoc.embedJpg(buffer);
  } else if (normalized === 'image/webp') {
    throw new BadRequestError(
      'WEBP images cannot be sent to n8n for extraction. Upload PDF, DOCX, JPEG, or PNG.',
    );
  } else {
    throw new BadRequestError(`Unsupported image type for PDF conversion: ${mimeType}`);
  }

  const width = Math.min(image.width, PAGE_WIDTH - 2 * MARGIN);
  const height = (image.height / image.width) * width;
  const page = pdfDoc.addPage([PAGE_WIDTH, Math.max(PAGE_HEIGHT, height + 2 * MARGIN)]);
  page.drawImage(image, {
    x: MARGIN,
    y: page.getHeight() - MARGIN - height,
    width,
    height,
  });

  return Buffer.from(await pdfDoc.save());
}

/**
 * Converts non-PDF uploads to PDF so n8n extractFromFile (pdf operation) can read them.
 * PDF inputs are returned unchanged.
 */
export async function normalizeUploadToPdf(file: NormalizableUpload): Promise<NormalizableUpload> {
  if (isPdf(file.mimeType, file.originalName)) {
    return file;
  }

  let pdfBuffer: Buffer;

  if (isLegacyDoc(file.mimeType, file.originalName)) {
    pdfBuffer = await convertWithLibreOffice(file.buffer, '.doc');
  } else if (isDocx(file.mimeType, file.originalName)) {
    pdfBuffer = await docxToPdf(file.buffer);
  } else if (isImage(file.mimeType)) {
    pdfBuffer = await imageToPdf(file.buffer, file.mimeType);
  } else {
    throw new BadRequestError(
      `Unsupported file type for AI extraction: ${file.mimeType || path.extname(file.originalName)}. Upload PDF, DOCX, DOC, or an image.`,
    );
  }

  const originalName = pdfFileName(file.originalName);
  return {
    buffer: pdfBuffer,
    originalName,
    mimeType: 'application/pdf',
    size: pdfBuffer.length,
  };
}
