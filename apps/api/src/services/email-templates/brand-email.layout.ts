import { getEmailLogoDataUri, getEmailLogoSrc } from './brand-email.logo.js';

export const BRAND = {
  teal: '#0b6e76',
  tealDark: '#084f55',
  orange: '#f2a93b',
  ink: '#12100e',
  inkMuted: '#535c68',
  inkFaint: '#8a929c',
  line: '#e6e2d7',
  surface: '#ffffff',
  surfaceMuted: '#eef3f7',
  otpBox: '#eef3f7',
  noticeBox: '#eef3f7',
  pageBg: '#e8eaed',
  supportEmail: 'support@bestal.co',
  tagline: 'Remote Talent. Your Time Zone.',
  companyLegalName: 'BesTal Technologies Pvt. Ltd.',
  companyAddress: 'Hyderabad, Telangana, India',
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildSupportTextLine(): string {
  return `Need help? Write to ${BRAND.supportEmail} (Mon–Fri, 9:00–18:00 IST).`;
}

function buildLogoBlock(): string {
  const logoSrc = getEmailLogoSrc() ?? getEmailLogoDataUri();

  if (logoSrc) {
    return `
      <img
        src="${logoSrc}"
        alt="BesTal — ${escapeHtml(BRAND.tagline)}"
        width="200"
        style="display:block;border:0;outline:none;text-decoration:none;max-width:200px;width:200px;height:auto;"
      />
    `;
  }

  return `
    <table role="presentation" cellspacing="0" cellpadding="0">
      <tr>
        <td style="vertical-align:top;padding-right:12px;">
          <div style="width:40px;height:40px;border-radius:12px;background:${BRAND.teal};text-align:center;line-height:40px;">
            <span style="display:inline-block;color:#ffffff;font-size:18px;font-weight:700;">&#10003;</span>
          </div>
        </td>
        <td style="vertical-align:top;">
          <div style="font-size:22px;line-height:1.1;font-weight:700;letter-spacing:-0.02em;">
            <span style="color:${BRAND.teal};">Bes</span><span style="color:${BRAND.orange};">Tal</span>
          </div>
          <div style="margin-top:4px;font-size:12px;line-height:1.4;color:${BRAND.inkFaint};">
            ${BRAND.tagline}
          </div>
        </td>
      </tr>
    </table>
  `;
}

export function buildEmailHeader(headerLabel: string): string {
  return `
    <tr>
      <td style="padding:24px 28px 20px;border-bottom:1px solid ${BRAND.line};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left" style="vertical-align:middle;">
              ${buildLogoBlock()}
            </td>
            <td align="right" style="vertical-align:top;font-size:13px;color:${BRAND.inkFaint};">
              ${escapeHtml(headerLabel)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

export function buildEmailFooter(): string {
  const year = new Date().getFullYear();
  return `
    <tr>
      <td style="padding:20px 28px 24px;background:${BRAND.surfaceMuted};border-top:1px solid ${BRAND.line};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left" style="vertical-align:top;">
              <div style="font-size:14px;font-weight:700;color:${BRAND.tealDark};">
                ${escapeHtml(BRAND.companyLegalName)}
              </div>
              <div style="margin-top:6px;font-size:12px;line-height:1.5;color:${BRAND.inkFaint};">
                ${escapeHtml(BRAND.companyAddress)}
              </div>
            </td>
            <td align="right" style="vertical-align:top;font-size:13px;">
              <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.teal};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>
            </td>
          </tr>
        </table>
        <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:${BRAND.inkFaint};">
          This message and any attachments are intended solely for the named recipient and may contain confidential information. If you received it in error, please notify the sender and delete it.
        </p>
        <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:${BRAND.inkFaint};">
          &copy; ${year} ${escapeHtml(BRAND.companyLegalName)} &middot; All rights reserved
        </p>
      </td>
    </tr>
  `;
}

export function buildEmailTitle(title: string): string {
  return `
    <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;font-weight:700;color:${BRAND.tealDark};">
      ${escapeHtml(title)}
    </h1>
  `;
}

export function buildEmailParagraph(text: string): string {
  return `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.inkMuted};">
      ${text}
    </p>
  `;
}

/** Greeting line with a break after "Hi {name}," — matches branded email reference layout. */
export function buildEmailHiIntro(recipientName: string, continuationHtml: string): string {
  return `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${BRAND.inkMuted};">
      Hi ${escapeHtml(recipientName)},<br />
      ${continuationHtml}
    </p>
  `;
}

export function buildSupportLine(customPrefix?: string): string {
  const prefix = customPrefix ?? 'Need a new code or having trouble verifying? Write to';
  return `
    <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.inkMuted};">
      ${prefix}
      <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.teal};font-weight:600;text-decoration:none;">${BRAND.supportEmail}</a>
      (Mon&ndash;Fri, 9:00&ndash;18:00 IST).
    </p>
  `;
}

export function buildSecurityNotice(options: {
  title: string;
  body: string;
}): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.noticeBox};border:1px solid ${BRAND.line};border-radius:14px;">
      <tr>
        <td style="padding:16px 18px;">
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <td style="vertical-align:top;padding-right:10px;font-size:16px;line-height:1.4;color:${BRAND.ink};">
                &#128274;
              </td>
              <td style="vertical-align:top;">
                <div style="font-size:14px;line-height:1.5;font-weight:700;color:${BRAND.ink};">
                  ${escapeHtml(options.title)}
                </div>
                <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:${BRAND.inkMuted};">
                  ${options.body}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function buildPrimaryButton(href: string, label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:18px 0 8px;">
      <tr>
        <td style="border-radius:999px;background:${BRAND.teal};">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function buildDetailBox(label: string, rows: Array<{ label: string; value: string }>): string {
  const rowHtml = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 0;font-size:13px;line-height:1.5;color:${BRAND.inkFaint};width:34%;vertical-align:top;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:8px 0;font-size:14px;line-height:1.5;color:${BRAND.ink};font-weight:600;vertical-align:top;">
            ${row.value}
          </td>
        </tr>
      `,
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.otpBox};border:1px solid ${BRAND.line};border-radius:14px;">
      <tr>
        <td style="padding:18px 20px;">
          <div style="font-size:11px;line-height:1.4;color:${BRAND.inkFaint};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin-bottom:8px;">
            ${escapeHtml(label)}
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${rowHtml}
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function wrapEmailDocument(options: {
  headerLabel: string;
  title: string;
  bodyHtml: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(options.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.pageBg};font-family:Inter,Arial,Helvetica,sans-serif;color:${BRAND.ink};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.pageBg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:${BRAND.surface};border:1px solid ${BRAND.line};border-radius:16px;overflow:hidden;">
            ${buildEmailHeader(options.headerLabel)}
            <tr>
              <td style="padding:28px 28px 24px;">
                ${buildEmailTitle(options.title)}
                ${options.bodyHtml}
              </td>
            </tr>
            ${buildEmailFooter()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildPlainTextFooter(): string[] {
  return [
    '',
    BRAND.supportEmail,
    `© ${new Date().getFullYear()} ${BRAND.companyLegalName} · All rights reserved`,
  ];
}
