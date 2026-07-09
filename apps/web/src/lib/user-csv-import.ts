/**
 * Parse a CSV of users for bulk invite.
 * Expected headers: firstName,lastName,email,phone,role
 * role = RECRUITER | SALES | ADMIN
 */
export type ParsedUserCsvRow = {
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'RECRUITER' | 'SALES' | 'ADMIN';
  errors: string[];
};

export type UserCsvParseResult = {
  rows: ParsedUserCsvRow[];
  valid: ParsedUserCsvRow[];
  invalid: ParsedUserCsvRow[];
};

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[^a-z]/g, '');
}

const ROLE_MAP: Record<string, 'RECRUITER' | 'SALES' | 'ADMIN'> = {
  recruiter: 'RECRUITER',
  sales: 'SALES',
  admin: 'ADMIN',
};

export function parseUserInviteCsv(text: string): UserCsvParseResult {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], valid: [], invalid: [] };
  }

  const headers = splitCsvLine(lines[0]!).map(normalizeHeader);
  const idx = {
    firstName: headers.findIndex((h) => h === 'firstname' || h === 'first'),
    lastName: headers.findIndex((h) => h === 'lastname' || h === 'last'),
    email: headers.findIndex((h) => h === 'email'),
    phone: headers.findIndex((h) => h === 'phone' || h === 'mobile'),
    role: headers.findIndex((h) => h === 'role'),
  };

  const rows: ParsedUserCsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]!);
    const firstName = idx.firstName >= 0 ? cells[idx.firstName] ?? '' : '';
    const lastName = idx.lastName >= 0 ? cells[idx.lastName] ?? '' : '';
    const email = idx.email >= 0 ? cells[idx.email] ?? '' : '';
    const phone = idx.phone >= 0 ? cells[idx.phone] || undefined : undefined;
    const roleRaw = idx.role >= 0 ? (cells[idx.role] ?? '').toLowerCase() : '';
    const role = ROLE_MAP[roleRaw];

    const errors: string[] = [];
    if (!firstName) errors.push('First name is required');
    if (!lastName) errors.push('Last name is required');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
    if (!role) errors.push('Role must be RECRUITER, SALES, or ADMIN');

    rows.push({
      rowNumber: i + 1,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      role: role ?? 'RECRUITER',
      errors,
    });
  }

  return {
    rows,
    valid: rows.filter((r) => r.errors.length === 0),
    invalid: rows.filter((r) => r.errors.length > 0),
  };
}

export const USER_CSV_TEMPLATE = `firstName,lastName,email,phone,role
Priya,Sharma,priya@amnetdigital.com,+919876543210,RECRUITER
Marcus,Chen,marcus@amnetdigital.com,,SALES
`;
