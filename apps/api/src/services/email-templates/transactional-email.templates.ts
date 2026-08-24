import {
  BRAND,
  buildDetailBox,
  buildEmailHiIntro,
  buildEmailParagraph,
  buildPlainTextFooter,
  buildPrimaryButton,
  buildSecurityNotice,
  buildSupportLine,
  escapeHtml,
  wrapEmailDocument,
} from './brand-email.layout.js';

export function buildInviteEmailHtml(options: {
  firstName: string;
  portalLabel: string;
  portalLoginUrl: string;
  userId: string;
  temporaryPassword: string;
}): string {
  const bodyHtml = `
    ${buildEmailHiIntro(
      options.firstName,
      `you have been invited to the <strong>${escapeHtml(options.portalLabel)}</strong>.`,
    )}
    ${buildDetailBox('Account credentials', [
      { label: 'User ID', value: escapeHtml(options.userId) },
      { label: 'Password', value: `<span style="font-family:Consolas,Monaco,monospace;">${escapeHtml(options.temporaryPassword)}</span>` },
    ])}
    ${buildPrimaryButton(options.portalLoginUrl, 'Sign in to your portal')}
    ${buildEmailParagraph('You must change your password after your first sign-in.')}
    ${buildSecurityNotice({
      title: 'Keep your credentials secure',
      body: 'Do not share your temporary password. BesTal will never ask for it by phone, chat, or email.',
    })}
    <div style="margin-top:22px;">
      ${buildSupportLine('Need help signing in? Write to')}
    </div>
  `;

  return wrapEmailDocument({
    headerLabel: 'Account',
    title: 'Your BesTal account is ready',
    bodyHtml,
  });
}

export function buildInviteEmailText(options: {
  firstName: string;
  portalLabel: string;
  portalLoginUrl: string;
  userId: string;
  temporaryPassword: string;
}): string {
  return [
    `Hi ${options.firstName},`,
    '',
    `You have been invited to the ${options.portalLabel}.`,
    '',
    `Sign in here: ${options.portalLoginUrl}`,
    `User ID: ${options.userId}`,
    `Password: ${options.temporaryPassword}`,
    '',
    'You must change your password after your first sign-in.',
    '',
    `Need help signing in? Write to ${BRAND.supportEmail} (Mon–Fri, 9:00–18:00 IST).`,
    ...buildPlainTextFooter(),
  ].join('\n');
}

export function buildPasswordResetEmailHtml(options: {
  firstName: string;
  portalLabel: string;
  resetUrl: string;
  expiresIn: string;
}): string {
  const bodyHtml = `
    ${buildEmailHiIntro(
      options.firstName,
      `we received a request to reset your password for the <strong>${escapeHtml(options.portalLabel)}</strong>.`,
    )}
    ${buildPrimaryButton(options.resetUrl, 'Reset your password')}
    ${buildEmailParagraph(`This link expires in ${escapeHtml(options.expiresIn)}.`)}
    ${buildSecurityNotice({
      title: 'Did not request a reset?',
      body: 'If you did not request this, you can safely ignore this email and your password will stay unchanged.',
    })}
    <div style="margin-top:22px;">
      ${buildSupportLine('Need help? Write to')}
    </div>
  `;

  return wrapEmailDocument({
    headerLabel: 'Security',
    title: 'Reset your password',
    bodyHtml,
  });
}

export function buildPasswordResetEmailText(options: {
  firstName: string;
  portalLabel: string;
  resetUrl: string;
  expiresIn: string;
}): string {
  return [
    `Hi ${options.firstName},`,
    '',
    `We received a request to reset your password for the ${options.portalLabel}.`,
    '',
    `Reset your password here (expires in ${options.expiresIn}):`,
    options.resetUrl,
    '',
    'If you did not request this, you can safely ignore this email.',
    '',
    `Need help? Write to ${BRAND.supportEmail} (Mon–Fri, 9:00–18:00 IST).`,
    ...buildPlainTextFooter(),
  ].join('\n');
}

export function buildNotificationEmailHtml(options: {
  greeting: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  actionLabel?: string;
}): string {
  const greetingName = options.greeting.replace(/^Hi\s+/i, '').replace(/,$/, '').trim() || 'there';
  const bodyHtml = `
    ${buildEmailHiIntro(greetingName, escapeHtml(options.body))}
    ${
      options.actionUrl
        ? buildPrimaryButton(options.actionUrl, options.actionLabel ?? 'View details')
        : ''
    }
    <div style="margin-top:22px;">
      ${buildSupportLine('Questions? Write to')}
    </div>
  `;

  return wrapEmailDocument({
    headerLabel: 'Notification',
    title: options.title,
    bodyHtml,
  });
}

export function buildNotificationEmailText(options: {
  greeting: string;
  title: string;
  body: string;
  actionUrl?: string | null;
}): string {
  return [
    options.greeting,
    '',
    options.title,
    '',
    options.body,
    ...(options.actionUrl ? ['', `Open: ${options.actionUrl}`] : []),
    '',
    `Questions? Write to ${BRAND.supportEmail} (Mon–Fri, 9:00–18:00 IST).`,
    ...buildPlainTextFooter(),
  ].join('\n');
}

export function buildClientRegistrationAcknowledgementHtml(options: {
  contactName: string;
  loginUrl: string;
}): string {
  const bodyHtml = `
    ${buildEmailHiIntro(options.contactName, 'thank you for registering with BesTal.')}
    ${buildEmailParagraph('Your account is pending review. You will be able to sign in once a BesTal administrator activates your company account.')}
    <div style="margin-top:22px;">
      ${buildSupportLine('Questions about your registration? Write to')}
    </div>
  `;

  return wrapEmailDocument({
    headerLabel: 'Registration',
    title: 'Registration received',
    bodyHtml,
  });
}

export function buildClientRegistrationAcknowledgementText(options: {
  contactName: string;
  loginUrl: string;
}): string {
  return [
    `Hi ${options.contactName},`,
    '',
    'Thank you for registering. We sent a confirmation email to your inbox.',
    '',
    'Your account is pending review. You will be able to sign in once a BesTal administrator activates your company account.',
    '',
    `Questions? Write to ${BRAND.supportEmail} (Mon–Fri, 9:00–18:00 IST).`,
    ...buildPlainTextFooter(),
  ].join('\n');
}

export function buildClientWelcomeEmailHtml(options: {
  firstName: string;
  companyName: string;
  loginUrl: string;
  userId: string;
  temporaryPassword: string;
}): string {
  const bodyHtml = `
    ${buildEmailHiIntro(
      options.firstName,
      `welcome to BesTal. Your <strong>${escapeHtml(options.companyName)}</strong> account has been activated.`,
    )}
    ${buildDetailBox('Client portal credentials', [
      { label: 'User ID', value: escapeHtml(options.userId) },
      { label: 'Password', value: `<span style="font-family:Consolas,Monaco,monospace;">${escapeHtml(options.temporaryPassword)}</span>` },
    ])}
    ${buildPrimaryButton(options.loginUrl, 'Sign in to the Client Portal')}
    ${buildEmailParagraph('You must change your password after your first sign-in.')}
    ${buildSecurityNotice({
      title: 'Keep your credentials secure',
      body: 'Do not share your temporary password. BesTal will never ask for it by phone, chat, or email.',
    })}
    <div style="margin-top:22px;">
      ${buildSupportLine('Need help getting started? Write to')}
    </div>
  `;

  return wrapEmailDocument({
    headerLabel: 'Welcome',
    title: 'Your Client Portal is active',
    bodyHtml,
  });
}

export function buildClientWelcomeEmailText(options: {
  firstName: string;
  companyName: string;
  loginUrl: string;
  userId: string;
  temporaryPassword: string;
}): string {
  return [
    `Hi ${options.firstName},`,
    '',
    `Welcome to BesTal! Your ${options.companyName} account has been activated.`,
    '',
    'Use the credentials below to sign in to the Client Portal for the first time:',
    '',
    `Sign in: ${options.loginUrl}`,
    `User ID: ${options.userId}`,
    `Password: ${options.temporaryPassword}`,
    '',
    'You must change your password after your first sign-in.',
    '',
    `Need help? Write to ${BRAND.supportEmail} (Mon–Fri, 9:00–18:00 IST).`,
    ...buildPlainTextFooter(),
  ].join('\n');
}
