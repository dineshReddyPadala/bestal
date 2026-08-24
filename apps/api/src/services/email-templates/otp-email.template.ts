import {
  BRAND,
  buildEmailHiIntro,
  buildPlainTextFooter,
  buildSecurityNotice,
  buildSupportLine,
  escapeHtml,
  wrapEmailDocument,
} from './brand-email.layout.js';

export type OtpEmailPurpose = 'signup' | 'login';

export type OtpEmailTemplateInput = {
  recipientName: string;
  otp: string;
  expiresInMinutes: number;
  purpose: OtpEmailPurpose;
};

function purposeCopy(purpose: OtpEmailPurpose, recipientName: string): string {
  if (purpose === 'login') {
    return buildEmailHiIntro(
      recipientName,
      'enter the code below to sign in to the BesTal Client Portal.',
    );
  }

  return buildEmailHiIntro(
    recipientName,
    'enter the code below to confirm your email address and complete your BesTal client registration.',
  );
}

function purposeTextIntro(purpose: OtpEmailPurpose, recipientName: string): string {
  if (purpose === 'login') {
    return `Hi ${recipientName},\n\nEnter the code below to sign in to the BesTal Client Portal:`;
  }

  return `Hi ${recipientName},\n\nEnter the code below to confirm your email address and complete your BesTal client registration:`;
}

export function buildOtpEmailSubject(purpose: OtpEmailPurpose = 'signup'): string {
  if (purpose === 'login') {
    return 'Your BesTal client portal sign-in code';
  }

  return 'Verify your BesTal client signup';
}

function buildOtpCodeBlock(otp: string, expiresInMinutes: number): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0 18px;background:${BRAND.otpBox};border:1px solid ${BRAND.line};border-radius:14px;">
      <tr>
        <td align="center" style="padding:24px 20px 20px;">
          <div style="font-size:11px;line-height:1.4;color:${BRAND.inkFaint};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
            Verification code
          </div>
          <div style="margin-top:12px;font-size:42px;line-height:1;font-weight:700;letter-spacing:0.16em;color:${BRAND.tealDark};">
            ${escapeHtml(otp)}
          </div>
          <div style="display:inline-block;margin-top:18px;padding:8px 14px;border-radius:999px;background:${BRAND.surface};border:1px solid ${BRAND.line};font-size:13px;line-height:1.4;color:${BRAND.teal};">
            <span style="display:inline-block;margin-right:6px;">&#128337;</span>
            Expires in ${escapeHtml(String(expiresInMinutes))} minutes
          </div>
        </td>
      </tr>
    </table>
  `;
}

export function buildOtpEmailText(input: OtpEmailTemplateInput): string {
  return [
    purposeTextIntro(input.purpose, input.recipientName),
    '',
    input.otp,
    '',
    `This code expires in ${input.expiresInMinutes} minutes.`,
    '',
    'Do not share this code with anyone. BesTal will never ask for it by phone, chat, or email.',
    "If this wasn't you, ignore this email and your account stays unchanged.",
    '',
    `Need a new code or having trouble verifying? Write to ${BRAND.supportEmail} (Mon–Fri, 9:00–18:00 IST).`,
    ...buildPlainTextFooter(),
  ].join('\n');
}

export function buildOtpEmailHtml(input: OtpEmailTemplateInput): string {
  const bodyHtml = `
    ${purposeCopy(input.purpose, input.recipientName)}
    ${buildOtpCodeBlock(input.otp, input.expiresInMinutes)}
    ${buildSecurityNotice({
      title: 'Do not share this code with anyone',
      body:
        "BesTal will never ask for it by phone, chat, or email. If this wasn't you, ignore this email and your account stays unchanged.",
    })}
    <div style="margin-top:22px;">
      ${buildSupportLine()}
    </div>
  `;

  return wrapEmailDocument({
    headerLabel: 'Verification',
    title: 'Your verification code',
    bodyHtml,
  });
}
