export function deriveCompanyDomain(email: string, website: string): string {
  const fromEmail = email.split('@')[1]?.toLowerCase().trim();
  if (fromEmail) return fromEmail;

  try {
    const normalized = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    return new URL(normalized).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return website.trim().toLowerCase();
  }
}

export function parseSkillsInput(value: string): string[] {
  return value
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

const EXPERIENCE_MAP: Record<string, string> = {
  '0-2': 'Junior',
  '2-5': 'Mid',
  '5-8': 'Senior',
  '8+': 'Lead',
};

const RESOURCES_MAP: Record<string, string> = {
  '1': '1',
  '2': '2-3',
  '3': '2-3',
  '4': '4-5',
  '5+': '6+',
};

export function mapWizardExperience(value: string): string {
  return EXPERIENCE_MAP[value] ?? value;
}

export function mapWizardResources(value: string): string {
  return RESOURCES_MAP[value] ?? value;
}

export function generateReferenceCode(): string {
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `REQ-${new Date().getFullYear()}-${suffix}`;
}
