import type { NotificationChannel, PrismaClient } from '@prisma/client';

export type CommunicationTemplateDto = {
  id: number;
  key: string;
  channel: NotificationChannel;
  subject: string | null;
  body: string;
  variables: string[];
  updatedAt: string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function renderTemplateString(
  template: string,
  variables: Record<string, string | number | null | undefined>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    const value = variables[key];
    if (value == null) return '';
    return String(value);
  });
}

export async function renderCommunicationTemplate(
  prisma: PrismaClient,
  key: string,
  variables: Record<string, string | number | null | undefined>,
  fallback?: { subject?: string | null; body: string },
): Promise<{ subject: string | null; body: string }> {
  const row = await prisma.communicationTemplate.findUnique({ where: { key } });
  if (!row) {
    return {
      subject: fallback?.subject ?? null,
      body: fallback?.body ?? '',
    };
  }
  return {
    subject: row.subject ? renderTemplateString(row.subject, variables) : null,
    body: renderTemplateString(row.body, variables),
  };
}

export async function listCommunicationTemplates(
  prisma: PrismaClient,
): Promise<CommunicationTemplateDto[]> {
  const rows = await prisma.communicationTemplate.findMany({
    orderBy: { key: 'asc' },
  });
  return rows.map((row) => ({
    id: Number(row.id),
    key: row.key,
    channel: row.channel,
    subject: row.subject,
    body: row.body,
    variables: asStringArray(row.variables),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function upsertCommunicationTemplate(
  prisma: PrismaClient,
  input: {
    key: string;
    channel: NotificationChannel;
    subject?: string | null;
    body: string;
    variables?: string[];
  },
): Promise<CommunicationTemplateDto> {
  const row = await prisma.communicationTemplate.upsert({
    where: { key: input.key },
    create: {
      key: input.key,
      channel: input.channel,
      subject: input.subject ?? null,
      body: input.body,
      variables: input.variables ?? [],
    },
    update: {
      channel: input.channel,
      subject: input.subject ?? null,
      body: input.body,
      variables: input.variables ?? [],
    },
  });
  return {
    id: Number(row.id),
    key: row.key,
    channel: row.channel,
    subject: row.subject,
    body: row.body,
    variables: asStringArray(row.variables),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteCommunicationTemplate(
  prisma: PrismaClient,
  key: string,
): Promise<void> {
  await prisma.communicationTemplate.delete({ where: { key } });
}
