type GraphTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

export type MicrosoftGraphMailConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  fromAddress: string;
  fromName: string;
};

export type GraphMailAttachment = {
  '@odata.type': '#microsoft.graph.fileAttachment';
  name: string;
  contentType: string;
  contentBytes: string;
  contentId: string;
  isInline: true;
};

export type GraphMailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: GraphMailAttachment[];
};

type CachedToken = {
  accessToken: string;
  expiresAtMs: number;
};

const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

export class MicrosoftGraphMailClient {
  private cachedToken: CachedToken | null = null;

  constructor(private readonly config: MicrosoftGraphMailConfig) {}

  async sendMail(message: GraphMailMessage): Promise<void> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(this.config.fromAddress)}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: message.subject,
            body: {
              contentType: 'HTML',
              content: message.html || message.text.replace(/\n/g, '<br>'),
            },
            toRecipients: [
              {
                emailAddress: {
                  address: message.to,
                },
              },
            ],
            from: {
              emailAddress: {
                address: this.config.fromAddress,
                name: this.config.fromName,
              },
            },
            attachments: message.attachments?.length ? message.attachments : undefined,
          },
          saveToSentItems: true,
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Microsoft Graph sendMail failed (${response.status}): ${body || response.statusText}`,
      );
    }
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAtMs > now) {
      return this.cachedToken.accessToken;
    }

    const response = await fetch(
      `https://login.microsoftonline.com/${encodeURIComponent(this.config.tenantId)}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: GRAPH_SCOPE,
          grant_type: 'client_credentials',
        }),
      },
    );

    const payload = (await response.json()) as GraphTokenResponse;
    if (!response.ok || !payload.access_token) {
      throw new Error(
        payload.error_description ??
          payload.error ??
          `Microsoft Graph token request failed (${response.status})`,
      );
    }

    const expiresInSec = Number(payload.expires_in);
    const ttlMs =
      Number.isFinite(expiresInSec) && expiresInSec > 0
        ? expiresInSec * 1000
        : 3_600_000;

    this.cachedToken = {
      accessToken: payload.access_token,
      expiresAtMs: now + ttlMs - TOKEN_EXPIRY_BUFFER_MS,
    };

    return payload.access_token;
  }
}

export function isMicrosoftGraphMailConfigReady(
  config: {
    tenantId?: string | null;
    clientId?: string | null;
    clientSecret?: string | null;
    fromAddress?: string | null;
    fromName?: string | null;
  } | null | undefined,
): config is MicrosoftGraphMailConfig {
  return Boolean(
    config?.tenantId?.trim() &&
      config?.clientId?.trim() &&
      config?.clientSecret?.trim() &&
      config?.fromAddress?.trim(),
  );
}
