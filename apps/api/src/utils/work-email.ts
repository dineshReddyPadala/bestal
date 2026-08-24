export const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'live.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
];

function normalizeDomain(value: string): string {
  return value.replace(/^www\./i, '').toLowerCase();
}

export function emailDomain(email: string): string | null {
  const parts = email.trim().toLowerCase().split('@');
  return parts.length === 2 ? normalizeDomain(parts[1]!) : null;
}

export function websiteDomain(website: string): string | null {
  const trimmed = website.trim();
  if (!trimmed) return null;
  try {
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return normalizeDomain(new URL(url).hostname);
  } catch {
    return trimmed.includes('.') ? normalizeDomain(trimmed) : null;
  }
}

const COMPANY_STOP_WORDS = new Set([
  'inc',
  'llc',
  'ltd',
  'corp',
  'corporation',
  'company',
  'co',
  'plc',
  'gmbh',
  'the',
  'and',
  'group',
  'holdings',
  'pty',
  'limited',
]);

export function companyNameTokens(companyName: string): string[] {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !COMPANY_STOP_WORDS.has(word));
}

function domainsMatch(emailDomainValue: string, siteDomain: string): boolean {
  return (
    emailDomainValue === siteDomain ||
    emailDomainValue.endsWith(`.${siteDomain}`) ||
    siteDomain.endsWith(`.${emailDomainValue}`)
  );
}

export function isWorkEmail(email: string): boolean {
  const domain = emailDomain(email);
  return Boolean(domain && !PERSONAL_EMAIL_DOMAINS.includes(domain));
}

export function validateCompanyContactEmail(
  email: string,
  companyName: string,
  website?: string | null,
): { valid: boolean; message?: string } {
  if (!isWorkEmail(email)) {
    return { valid: false, message: 'Please use your company work email address' };
  }

  const domain = emailDomain(email);
  if (!domain) {
    return { valid: false, message: 'Valid email is required' };
  }

  const siteDomain = website?.trim() ? websiteDomain(website) : null;
  if (siteDomain) {
    if (domainsMatch(domain, siteDomain)) {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Contact email must use your company domain (${siteDomain})`,
    };
  }

  const tokens = companyNameTokens(companyName);
  if (tokens.length === 0) {
    return { valid: true };
  }

  const domainBase = domain.split('.')[0] ?? '';
  const matchesCompany = tokens.some(
    (token) =>
      domainBase.includes(token) ||
      token.includes(domainBase) ||
      domain.replace(/\./g, '').includes(token),
  );

  if (!matchesCompany) {
    return {
      valid: false,
      message: 'Contact email must match your company name',
    };
  }

  return { valid: true };
}
