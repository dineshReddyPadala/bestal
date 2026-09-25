import type { ContactPayload, EnquiryPayload } from '@/types';
import { ApiError, publicApiRequest } from '@/services/api';

export type ServiceResult =
  | { ok: true; referenceCode?: string; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export type ContactMessageTopic =
  | 'GENERAL'
  | 'SALES'
  | 'SUPPORT'
  | 'PRESS'
  | 'PARTNERSHIPS'
  | 'INVESTORS';

type ContactMessageSubmitResponse = {
  data: {
    id: number;
    referenceCode: string;
    message: string;
  };
};

const TOPIC_MAP: Record<string, ContactMessageTopic> = {
  'Technology Consulting': 'SALES',
  'Managed Services': 'SALES',
  'Talent Solutions': 'SALES',
  'Technology Communities': 'GENERAL',
  Partnership: 'PARTNERSHIPS',
  Other: 'GENERAL',
};

const ENQUIRY_TOPIC: Record<EnquiryPayload['kind'], ContactMessageTopic> = {
  consulting: 'SALES',
  security: 'GENERAL',
  general: 'SALES',
};

const FIELD_ALIASES: Record<string, string> = {
  fullName: 'name',
  message: 'details',
};

function mapTopic(label: string): ContactMessageTopic {
  return TOPIC_MAP[label] ?? 'GENERAL';
}

function composeContactMessage(payload: ContactPayload): string {
  const lines = [
    `Discussion: ${payload.topic}`,
    payload.company ? `Company: ${payload.company}` : '',
    payload.role ? `Role: ${payload.role}` : '',
    payload.country ? `Country: ${payload.country}` : '',
    payload.details ? `\n${payload.details}` : '',
  ].filter(Boolean);
  return lines.join('\n').trim();
}

function composeEnquiryMessage(payload: EnquiryPayload): string {
  const kindLabel =
    payload.kind === 'consulting'
      ? 'Technology challenge'
      : payload.kind === 'security'
        ? 'Procurement information'
        : 'General enquiry';
  const lines = [
    `Source: ${kindLabel}`,
    payload.company ? `Company: ${payload.company}` : '',
    payload.details ? `\n${payload.details}` : '',
  ].filter(Boolean);
  return lines.join('\n').trim();
}

function toFailure(error: unknown): ServiceResult {
  if (error instanceof ApiError) {
    const raw = error.fieldErrors();
    const fieldErrors: Record<string, string> = {};
    for (const [field, message] of Object.entries(raw)) {
      fieldErrors[FIELD_ALIASES[field] ?? field] = message;
    }
    return {
      ok: false,
      message: error.message || 'Sorry — that did not send. Please try again.',
      fieldErrors,
    };
  }
  return { ok: false, message: 'Sorry — that did not send. Please try again.' };
}

async function submitContactMessage(input: {
  fullName: string;
  email: string;
  topic: ContactMessageTopic;
  message: string;
  websiteConfirm?: string;
}): Promise<ServiceResult> {
  try {
    const json = await publicApiRequest<ContactMessageSubmitResponse>('/public/contact-messages', {
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      topic: input.topic,
      message: input.message.trim(),
      websiteConfirm: input.websiteConfirm ?? '',
    });
    return {
      ok: true,
      referenceCode: json.data.referenceCode,
      message: json.data.message,
    };
  } catch (error) {
    return toFailure(error);
  }
}

export async function submitContact(
  payload: ContactPayload,
  websiteConfirm = '',
): Promise<ServiceResult> {
  return submitContactMessage({
    fullName: payload.name,
    email: payload.email,
    topic: mapTopic(payload.topic),
    message: composeContactMessage(payload),
    websiteConfirm,
  });
}

export async function submitEnquiry(payload: EnquiryPayload, websiteConfirm = ''): Promise<ServiceResult> {
  return submitContactMessage({
    fullName: payload.name,
    email: payload.email,
    topic: ENQUIRY_TOPIC[payload.kind],
    message: composeEnquiryMessage(payload),
    websiteConfirm,
  });
}
