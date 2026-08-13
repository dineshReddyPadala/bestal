import nodemailer from 'nodemailer';
import type { PrismaClient } from '@prisma/client';
import type { AppConfig } from '../config/index.js';
import type { Role } from '../constants/index.js';
import { readEmailSettings, type EmailSettings } from './system-settings.reader.js';

export type InviteEmailPayload = {
  to: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationName: string;
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

export function resolveMailConfig(
  config: AppConfig,
  dbSettings?: EmailSettings | null,
): ResolvedMailConfig {
  const envEnabled = config.mail.enabled && Boolean(config.mail.from && config.mail.password);
  const fromAddress = dbSettings?.fromAddress ?? config.mail.from;
  const password = dbSettings?.password ?? config.mail.password;
  const user = dbSettings?.user ?? config.mail.from;
  const host = dbSettings?.host ?? config.mail.host;
  const port = dbSettings?.port ?? config.mail.port;
  const enabled =
    dbSettings?.enabled === true
      ? Boolean(fromAddress && password)
      : envEnabled || Boolean(fromAddress && password);

  return {
    enabled,
    host,
    port,
    user,
    password,
    fromAddress,
    fromName: dbSettings?.fromName ?? config.appName,
    secure: dbSettings?.secure ?? port === 465,
  };
}

export async function readResolvedMailConfig(
  config: AppConfig,
  prisma: PrismaClient,
): Promise<ResolvedMailConfig> {
  return resolveMailConfig(config, await readEmailSettings(prisma));
}

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
  private transporter: nodemailer.Transporter | null = null;
  private resolved: ResolvedMailConfig | null = null;

  constructor(
    private readonly config: AppConfig,
    private readonly prisma?: PrismaClient,
  ) {}

  private async ensureReady(): Promise<ResolvedMailConfig> {
    if (this.resolved) return this.resolved;
    const resolved = this.prisma
      ? await readResolvedMailConfig(this.config, this.prisma)
      : resolveMailConfig(this.config);
    this.resolved = resolved;
    if (resolved.enabled && resolved.fromAddress && resolved.password) {
      this.transporter = nodemailer.createTransport({
        host: resolved.host,
        port: resolved.port,
        secure: resolved.secure,
        requireTLS: resolved.port === 587,
        auth: {
          user: resolved.user ?? resolved.fromAddress,
          pass: resolved.password,
        },
      });
    } else {
      this.transporter = null;
      if (this.config.isDevelopment) {
        console.warn(
          '[email] SMTP not configured (Platform Settings or FROM_MAIL). Emails will be logged only.',
        );
      }
    }
    return resolved;
  }

  async isConfigured(): Promise<boolean> {
    const resolved = await this.ensureReady();
    return resolved.enabled && this.transporter !== null;
  }

  async sendInviteCredentials(payload: InviteEmailPayload): Promise<{ sent: boolean }> {
    const resolved = await this.ensureReady();
    const subject = `Your ${payload.organizationName} BesTal account (${portalLabel(payload.role)})`;
    const text = [
      `Hi ${payload.firstName},`,
      '',
      `You have been invited to the ${portalLabel(payload.role)} for ${payload.organizationName}.`,
      '',
      `Sign in here: ${payload.portalLoginUrl}`,
      `Email: ${payload.to}`,
      `Temporary password: ${payload.temporaryPassword}`,
      '',
      'Please sign in and change your password after your first login.',
      '',
      '— BesTal / Amnet Digital',
    ].join('\n');

    const html = `
      <p>Hi ${escapeHtml(payload.firstName)},</p>
      <p>You have been invited to the <strong>${portalLabel(payload.role)}</strong> for <strong>${escapeHtml(payload.organizationName)}</strong>.</p>
      <p>
        <a href="${escapeHtml(payload.portalLoginUrl)}">Sign in to your portal</a>
      </p>
      <ul>
        <li><strong>Email:</strong> ${escapeHtml(payload.to)}</li>
        <li><strong>Temporary password:</strong> <code>${escapeHtml(payload.temporaryPassword)}</code></li>
      </ul>
      <p>Please sign in and change your password after your first login.</p>
      <p>— BesTal / Amnet Digital</p>
    `;

    if (!this.transporter || !resolved.fromAddress) {
      // Dev fallback: log credentials so invites still work without SMTP
      console.info('[email] Mail not configured — invite credentials (dev):', {
        to: payload.to,
        role: payload.role,
        temporaryPassword: payload.temporaryPassword,
        portalLoginUrl: payload.portalLoginUrl,
      });
      return { sent: false };
    }

    try {
      await this.transporter.sendMail({
        from: `"${resolved.fromName}" <${resolved.fromAddress}>`,
        to: payload.to,
        subject,
        text,
        html,
      });
      return { sent: true };
    } catch (err) {
      console.error('[email] Failed to send invite credentials:', {
        to: payload.to,
        error: err instanceof Error ? err.message : err,
      });
      // Do not fail user creation when SMTP is misconfigured — surface via emailSent:false
      return { sent: false };
    }
  }

  async sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<{ sent: boolean }> {
    const resolved = await this.ensureReady();
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
      '— BesTal / Amnet Digital',
    ].join('\n');

    const html = `
      <p>Hi ${escapeHtml(payload.firstName)},</p>
      <p>We received a request to reset your password for the <strong>${escapeHtml(payload.portalLabel)}</strong>.</p>
      <p>
        <a href="${escapeHtml(payload.resetUrl)}">Reset your password</a>
      </p>
      <p>This link expires in ${escapeHtml(payload.expiresIn)}.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>— BesTal / Amnet Digital</p>
    `;

    if (!this.transporter || !resolved.fromAddress) {
      console.info('[email] Mail not configured — password reset (dev):', {
        to: payload.to,
        resetUrl: payload.resetUrl,
      });
      return { sent: false };
    }

    await this.transporter.sendMail({
      from: `"${resolved.fromName}" <${resolved.fromAddress}>`,
      to: payload.to,
      subject,
      text,
      html,
    });

    return { sent: true };
  }

  async sendNotificationEmail(payload: {
    to: string;
    firstName?: string | null;
    title: string;
    body: string;
    actionUrl?: string | null;
    subject?: string | null;
  }): Promise<{ sent: boolean }> {
    const resolved = await this.ensureReady();
    const greeting = payload.firstName ? `Hi ${payload.firstName},` : 'Hi,';
    const text = [
      greeting,
      '',
      payload.title,
      '',
      payload.body,
      ...(payload.actionUrl ? ['', `Open: ${payload.actionUrl}`] : []),
      '',
      '— BesTal / Amnet Digital',
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
      <p>— BesTal / Amnet Digital</p>
    `;

    if (!this.transporter || !resolved.fromAddress) {
      console.info('[email] Mail not configured — notification (dev):', {
        to: payload.to,
        title: payload.title,
        actionUrl: payload.actionUrl,
      });
      return { sent: false };
    }

    await this.transporter.sendMail({
      from: `"${resolved.fromName}" <${resolved.fromAddress}>`,
      to: payload.to,
      subject: payload.subject ?? payload.title,
      text,
      html,
    });

    return { sent: true };
  }

  async sendTestEmail(to: string): Promise<{ sent: boolean }> {
    return this.sendNotificationEmail({
      to,
      title: 'BesTal SMTP test',
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
