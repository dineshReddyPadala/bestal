import nodemailer from 'nodemailer';
import type { AppConfig } from '../config/index.js';
import type { Role } from '../constants/index.js';

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
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: AppConfig) {
    if (config.mail.enabled && config.mail.from && config.mail.password) {
      this.transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.port === 465,
        auth: {
          user: config.mail.from,
          pass: config.mail.password,
        },
      });
    } else {
      this.transporter = null;
    }
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendInviteCredentials(payload: InviteEmailPayload): Promise<{ sent: boolean }> {
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

    if (!this.transporter || !this.config.mail.from) {
      // Dev fallback: log credentials so invites still work without SMTP
      console.info('[email] Mail not configured — invite credentials (dev):', {
        to: payload.to,
        role: payload.role,
        temporaryPassword: payload.temporaryPassword,
        portalLoginUrl: payload.portalLoginUrl,
      });
      return { sent: false };
    }

    await this.transporter.sendMail({
      from: `"${this.config.appName}" <${this.config.mail.from}>`,
      to: payload.to,
      subject,
      text,
      html,
    });

    return { sent: true };
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

    if (!this.transporter || !this.config.mail.from) {
      console.info('[email] Mail not configured — password reset (dev):', {
        to: payload.to,
        resetUrl: payload.resetUrl,
      });
      return { sent: false };
    }

    await this.transporter.sendMail({
      from: `"${this.config.appName}" <${this.config.mail.from}>`,
      to: payload.to,
      subject,
      text,
      html,
    });

    return { sent: true };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
