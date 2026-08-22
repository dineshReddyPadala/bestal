import nodemailer from 'nodemailer';
import type { PrismaClient } from '@prisma/client';
import type { AppConfig } from '../config/index.js';
import type { Role } from '../constants/index.js';
import {
  isGmailSmtpConfigured,
  isMicrosoft365GraphConfigured,
  readEmailSettings,
  type EmailSettings,
  type GmailSmtpConfig,
  type Microsoft365GraphConfig,
} from './system-settings.reader.js';
import {
  isMicrosoftGraphMailConfigReady,
  MicrosoftGraphMailClient,
} from './microsoft-graph-mail.client.js';

export type InviteEmailPayload = {
  to: string;
  firstName: string;
  lastName: string;
  role: Role;
  temporaryPassword: string;
  portalLoginUrl: string;
};

export type PasswordResetEmailPayload = {
  to: string;
  firstName: string;
  resetUrl: string;
  portalLabel: string;
  expiresIn: string;
};

export type ClientRegistrationAcknowledgementPayload = {
  to: string;
  contactName: string;
  companyName: string;
  loginUrl: string;
};

export type ClientWelcomeEmailPayload = {
  to: string;
  firstName: string;
  companyName: string;
  loginUrl: string;
  temporaryPassword: string;
};

export type ClientSignupOtpEmailPayload = {
  to: string;
  contactName: string;
  otp: string;
  expiresInMinutes: number;
};

export type ClientLoginOtpEmailPayload = {
  to: string;
  firstName: string;
  otp: string;
  expiresInMinutes: number;
};

type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type EmailTransport =
  | { mode: 'none' }
  | { mode: 'smtp'; fromAddress: string; fromName: string; transporter: nodemailer.Transporter }
  | { mode: 'graph'; fromAddress: string; fromName: string; client: MicrosoftGraphMailClient };

type ResolvedEmailRuntime = {
  enabled: boolean;
  transport: EmailTransport;
};

export type ResolvedMailConfig = {
  enabled: boolean;
  host: string;
  port: number;
  user: string | null;
  password: string | null;
  fromAddress: string | null;
  fromName: string;
  secure: boolean;
};

function resolveEnvSmtpRuntime(config: AppConfig): ResolvedEmailRuntime {
  const fromAddress = config.mail.from;
  const password = config.mail.password;
  const enabled = config.mail.enabled && Boolean(fromAddress && password);

  if (!enabled || !fromAddress || !password) {
    return { enabled: false, transport: { mode: 'none' } };
  }

  const port = config.mail.port;
  return {
    enabled: true,
    transport: {
      mode: 'smtp',
      fromAddress,
      fromName: config.appName,
      transporter: nodemailer.createTransport({
        host: config.mail.host,
        port,
        secure: port === 465,
        requireTLS: port === 587,
        auth: {
          user: fromAddress,
          pass: password,
        },
      }),
    },
  };
}

function resolveGmailRuntime(
  config: AppConfig,
  gmail: GmailSmtpConfig,
  platformEnabled: boolean,
): ResolvedEmailRuntime {
  const fromAddress = gmail.fromAddress;
  const password = gmail.password;
  const enabled = platformEnabled
    ? isGmailSmtpConfigured(gmail)
    : config.mail.enabled && Boolean(fromAddress && password);

  if (!enabled || !fromAddress || !password) {
    return { enabled: false, transport: { mode: 'none' } };
  }

  const port = gmail.port;
  return {
    enabled: true,
    transport: {
      mode: 'smtp',
      fromAddress,
      fromName: gmail.fromName ?? config.appName,
      transporter: nodemailer.createTransport({
        host: gmail.host,
        port,
        secure: gmail.secure ?? port === 465,
        requireTLS: port === 587,
        auth: {
          user: gmail.user ?? fromAddress,
          pass: password,
        },
      }),
    },
  };
}

function resolveMicrosoft365Runtime(
  config: AppConfig,
  graph: Microsoft365GraphConfig,
  platformEnabled: boolean,
): ResolvedEmailRuntime {
  const enabled = platformEnabled && isMicrosoft365GraphConfigured(graph);
  if (!enabled || !isMicrosoftGraphMailConfigReady(graph)) {
    return { enabled: false, transport: { mode: 'none' } };
  }

  const fromName = graph.fromName ?? config.appName;
  return {
    enabled: true,
    transport: {
      mode: 'graph',
      fromAddress: graph.fromAddress,
      fromName,
      client: new MicrosoftGraphMailClient({
        tenantId: graph.tenantId,
        clientId: graph.clientId,
        clientSecret: graph.clientSecret,
        fromAddress: graph.fromAddress,
        fromName,
      }),
    },
  };
}

export function resolveEmailRuntime(
  config: AppConfig,
  dbSettings?: EmailSettings | null,
): ResolvedEmailRuntime {
  if (!dbSettings) {
    return resolveEnvSmtpRuntime(config);
  }

  if (dbSettings.provider === 'microsoft365') {
    return resolveMicrosoft365Runtime(config, dbSettings.microsoft365, dbSettings.enabled);
  }

  return resolveGmailRuntime(config, dbSettings.gmail, dbSettings.enabled);
}

/** @deprecated Legacy SMTP-only view; prefer resolveEmailRuntime. */
export function resolveMailConfig(
  config: AppConfig,
  dbSettings?: EmailSettings | null,
): ResolvedMailConfig {
  const runtime = resolveEmailRuntime(config, dbSettings);
  const transport = runtime.transport;

  if (transport.mode === 'smtp') {
    const resolved = dbSettings?.provider === 'microsoft365' ? null : dbSettings?.gmail;
    return {
      enabled: runtime.enabled,
      host: resolved?.host ?? config.mail.host,
      port: resolved?.port ?? config.mail.port,
      user: resolved?.user ?? config.mail.from,
      password: resolved?.password ?? config.mail.password,
      fromAddress: transport.fromAddress,
      fromName: transport.fromName,
      secure: resolved?.secure ?? config.mail.port === 465,
    };
  }

  return {
    enabled: runtime.enabled,
    host: config.mail.host,
    port: config.mail.port,
    user: null,
    password: null,
    fromAddress: transport.mode === 'graph' ? transport.fromAddress : null,
    fromName: transport.mode === 'graph' ? transport.fromName : config.appName,
    secure: false,
  };
}

export async function readResolvedMailConfig(
  config: AppConfig,
  prisma: PrismaClient,
): Promise<ResolvedMailConfig> {
  return resolveMailConfig(config, await readEmailSettings(prisma));
}

const EMAIL_SIGNATURE = '— Team BesTal';

function portalLabel(role: Role): string {
  switch (role) {
    case 'RECRUITER':
      return 'Recruiter Portal';
    case 'SALES':
      return 'Sales Portal';
    case 'ADMIN':
    case 'SUPER_ADMIN':
    case 'VIEWER':
      return 'Admin Portal';
    case 'CLIENT':
      return 'Client Portal';
    default:
      return 'Portal';
  }
}

export class EmailService {
  constructor(
    private readonly config: AppConfig,
    private readonly prisma?: PrismaClient,
  ) {}

  private async ensureReady(): Promise<ResolvedEmailRuntime> {
    const dbSettings = this.prisma ? await readEmailSettings(this.prisma) : null;
    const runtime = resolveEmailRuntime(this.config, dbSettings);

    if (runtime.transport.mode === 'none' && this.config.isDevelopment) {
      console.warn(
        '[email] Outbound email not configured (Platform Settings or FROM_MAIL). Emails will be logged only.',
      );
    }

    return runtime;
  }

  async isConfigured(): Promise<boolean> {
    const runtime = await this.ensureReady();
    return runtime.enabled && runtime.transport.mode !== 'none';
  }

  private async sendOutboundEmail(message: OutboundEmail): Promise<{ sent: boolean }> {
    const runtime = await this.ensureReady();
    const transport = runtime.transport;

    if (transport.mode === 'none') {
      return { sent: false };
    }

    try {
      if (transport.mode === 'graph') {
        await transport.client.sendMail(message);
      } else {
        await transport.transporter.sendMail({
          from: `"${transport.fromName}" <${transport.fromAddress}>`,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });
      }
      return { sent: true };
    } catch (err) {
      console.error('[email] Failed to send email:', {
        to: message.to,
        subject: message.subject,
        provider: transport.mode,
        error: err instanceof Error ? err.message : err,
      });
      return { sent: false };
    }
  }

  async sendInviteCredentials(payload: InviteEmailPayload): Promise<{ sent: boolean }> {
    const subject = `Your BesTal account (${portalLabel(payload.role)})`;
    const text = [
      `Hi ${payload.firstName},`,
      '',
      `You have been invited to the ${portalLabel(payload.role)}.`,
      '',
      `Sign in here: ${payload.portalLoginUrl}`,
      `User ID: ${payload.to}`,
      `Password: ${payload.temporaryPassword}`,
      '',
      'You must change your password after your first sign-in.',
      '',
      EMAIL_SIGNATURE,
    ].join('\n');

    const html = `
      <p>Hi ${escapeHtml(payload.firstName)},</p>
      <p>You have been invited to the <strong>${portalLabel(payload.role)}</strong>.</p>
      <p>
        <a href="${escapeHtml(payload.portalLoginUrl)}">Sign in to your portal</a>
      </p>
      <ul>
        <li><strong>User ID:</strong> ${escapeHtml(payload.to)}</li>
        <li><strong>Password:</strong> <code>${escapeHtml(payload.temporaryPassword)}</code></li>
      </ul>
      <p>You must change your password after your first sign-in.</p>
      <p>${escapeHtml(EMAIL_SIGNATURE)}</p>
    `;

    const runtime = await this.ensureReady();
    if (runtime.transport.mode === 'none') {
      console.info('[email] Mail not configured — invite credentials (dev):', {
        to: payload.to,
        role: payload.role,
        temporaryPassword: payload.temporaryPassword,
        portalLoginUrl: payload.portalLoginUrl,
      });
      return { sent: false };
    }

    return this.sendOutboundEmail({ to: payload.to, subject, text, html });
  }

  async sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<{ sent: boolean }> {
    const subject = `Reset your ${payload.portalLabel} password`;
    const text = [
      `Hi ${payload.firstName},`,
      '',
      `We received a request to reset your password for the ${payload.portalLabel}.`,
      '',
      `Reset your password here (expires in ${payload.expiresIn}):`,
      payload.resetUrl,
      '',
      'If you did not request this, you can safely ignore this email.',
      '',
      EMAIL_SIGNATURE,
    ].join('\n');

    const html = `
      <p>Hi ${escapeHtml(payload.firstName)},</p>
      <p>We received a request to reset your password for the <strong>${escapeHtml(payload.portalLabel)}</strong>.</p>
      <p>
        <a href="${escapeHtml(payload.resetUrl)}">Reset your password</a>
      </p>
      <p>This link expires in ${escapeHtml(payload.expiresIn)}.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>${escapeHtml(EMAIL_SIGNATURE)}</p>
    `;

    const runtime = await this.ensureReady();
    if (runtime.transport.mode === 'none') {
      console.info('[email] Mail not configured — password reset (dev):', {
        to: payload.to,
        resetUrl: payload.resetUrl,
      });
      return { sent: false };
    }

    return this.sendOutboundEmail({ to: payload.to, subject, text, html });
  }

  async sendNotificationEmail(payload: {
    to: string;
    firstName?: string | null;
    title: string;
    body: string;
    actionUrl?: string | null;
    subject?: string | null;
  }): Promise<{ sent: boolean }> {
    const greeting = payload.firstName ? `Hi ${payload.firstName},` : 'Hi,';
    const text = [
      greeting,
      '',
      payload.title,
      '',
      payload.body,
      ...(payload.actionUrl ? ['', `Open: ${payload.actionUrl}`] : []),
      '',
      EMAIL_SIGNATURE,
    ].join('\n');

    const html = `
      <p>${escapeHtml(greeting)}</p>
      <p><strong>${escapeHtml(payload.title)}</strong></p>
      <p>${escapeHtml(payload.body)}</p>
      ${
        payload.actionUrl
          ? `<p><a href="${escapeHtml(payload.actionUrl)}">View details</a></p>`
          : ''
      }
      <p>${escapeHtml(EMAIL_SIGNATURE)}</p>
    `;

    const runtime = await this.ensureReady();
    if (runtime.transport.mode === 'none') {
      console.info('[email] Mail not configured — notification (dev):', {
        to: payload.to,
        title: payload.title,
        actionUrl: payload.actionUrl,
      });
      return { sent: false };
    }

    return this.sendOutboundEmail({
      to: payload.to,
      subject: payload.subject ?? payload.title,
      text,
      html,
    });
  }

  async sendClientRegistrationAcknowledgement(
    payload: ClientRegistrationAcknowledgementPayload,
  ): Promise<{ sent: boolean }> {
    const subject = 'BesTal registration received';
    const text = [
      `Hi ${payload.contactName},`,
      '',
      'Thank you for registering. We sent a confirmation email to your inbox.',
      '',
      'Your account is pending review. You will be able to sign in once a BesTal administrator activates your company account.',
      '',
      `Client sign in (after activation): ${payload.loginUrl}`,
      '',
      EMAIL_SIGNATURE,
    ].join('\n');

    const html = `
      <p>Hi ${escapeHtml(payload.contactName)},</p>
      <p>Thank you for registering. We sent a confirmation email to your inbox.</p>
      <p>Your account is pending review. You will be able to sign in once a BesTal administrator activates your company account.</p>
      <p><a href="${escapeHtml(payload.loginUrl)}">Client sign in</a> (available after activation)</p>
      <p>${escapeHtml(EMAIL_SIGNATURE)}</p>
    `;

    const runtime = await this.ensureReady();
    if (runtime.transport.mode === 'none') {
      console.info('[email] Mail not configured — client registration acknowledgement (dev):', {
        to: payload.to,
        companyName: payload.companyName,
        loginUrl: payload.loginUrl,
      });
      return { sent: false };
    }

    return this.sendOutboundEmail({ to: payload.to, subject, text, html });
  }

  async sendClientSignupOtpEmail(
    payload: ClientSignupOtpEmailPayload,
  ): Promise<{ sent: boolean }> {
    const subject = 'Verify your BesTal client signup';
    const text = [
      `Hi ${payload.contactName},`,
      '',
      'Use this verification code to complete your BesTal client registration:',
      '',
      payload.otp,
      '',
      `This code expires in ${payload.expiresInMinutes} minutes.`,
      '',
      'If you did not request this, you can safely ignore this email.',
      '',
      EMAIL_SIGNATURE,
    ].join('\n');

    const html = `
      <p>Hi ${escapeHtml(payload.contactName)},</p>
      <p>Use this verification code to complete your BesTal client registration:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:0.2em;">${escapeHtml(payload.otp)}</p>
      <p>This code expires in ${payload.expiresInMinutes} minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>${escapeHtml(EMAIL_SIGNATURE)}</p>
    `;

    const runtime = await this.ensureReady();
    if (runtime.transport.mode === 'none') {
      console.info('[email] Mail not configured — client signup OTP (dev):', {
        to: payload.to,
        otp: payload.otp,
      });
      return { sent: false };
    }

    return this.sendOutboundEmail({ to: payload.to, subject, text, html });
  }

  async sendClientLoginOtpEmail(
    payload: ClientLoginOtpEmailPayload,
  ): Promise<{ sent: boolean }> {
    const subject = 'Your BesTal client portal sign-in code';
    const text = [
      `Hi ${payload.firstName},`,
      '',
      'Use this verification code to sign in to the BesTal Client Portal:',
      '',
      payload.otp,
      '',
      `This code expires in ${payload.expiresInMinutes} minutes.`,
      '',
      'If you did not request this, you can safely ignore this email.',
      '',
      EMAIL_SIGNATURE,
    ].join('\n');

    const html = `
      <p>Hi ${escapeHtml(payload.firstName)},</p>
      <p>Use this verification code to sign in to the BesTal Client Portal:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:0.2em;">${escapeHtml(payload.otp)}</p>
      <p>This code expires in ${payload.expiresInMinutes} minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>${escapeHtml(EMAIL_SIGNATURE)}</p>
    `;

    const runtime = await this.ensureReady();
    if (runtime.transport.mode === 'none') {
      console.info('[email] Mail not configured — client login OTP (dev):', {
        to: payload.to,
        otp: payload.otp,
      });
      return { sent: false };
    }

    return this.sendOutboundEmail({ to: payload.to, subject, text, html });
  }

  async sendClientWelcomeEmail(payload: ClientWelcomeEmailPayload): Promise<{ sent: boolean }> {
    const subject = `Your BesTal Client Portal account is active — ${payload.companyName}`;
    const text = [
      `Hi ${payload.firstName},`,
      '',
      `Welcome to BesTal! Your ${payload.companyName} account has been activated.`,
      '',
      'Use the credentials below to sign in to the Client Portal for the first time:',
      '',
      `Sign in: ${payload.loginUrl}`,
      `User ID: ${payload.to}`,
      `Password: ${payload.temporaryPassword}`,
      '',
      'You must change your password after your first sign-in.',
      '',
      EMAIL_SIGNATURE,
    ].join('\n');

    const html = `
      <p>Hi ${escapeHtml(payload.firstName)},</p>
      <p>Welcome to BesTal! Your <strong>${escapeHtml(payload.companyName)}</strong> account has been activated.</p>
      <p>Use the credentials below to sign in to the Client Portal for the first time:</p>
      <p><a href="${escapeHtml(payload.loginUrl)}">Sign in to the Client Portal</a></p>
      <ul>
        <li><strong>User ID:</strong> ${escapeHtml(payload.to)}</li>
        <li><strong>Password:</strong> <code>${escapeHtml(payload.temporaryPassword)}</code></li>
      </ul>
      <p>You must change your password after your first sign-in.</p>
      <p>${escapeHtml(EMAIL_SIGNATURE)}</p>
    `;

    const runtime = await this.ensureReady();
    if (runtime.transport.mode === 'none') {
      console.info('[email] Mail not configured — client welcome (dev):', {
        to: payload.to,
        companyName: payload.companyName,
        loginUrl: payload.loginUrl,
        temporaryPassword: payload.temporaryPassword,
      });
      return { sent: false };
    }

    return this.sendOutboundEmail({ to: payload.to, subject, text, html });
  }

  async sendTestEmail(to: string): Promise<{ sent: boolean }> {
    return this.sendNotificationEmail({
      to,
      title: 'BesTal email test',
      body: 'This is a test email from BesTal platform settings.',
    });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
