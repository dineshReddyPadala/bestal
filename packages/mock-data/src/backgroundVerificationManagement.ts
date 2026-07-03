import { backgroundChecks } from './backgroundChecks.js';
import type { MockBackgroundCheck } from './types.js';

export type BgvOverallStatus = MockBackgroundCheck['status'];

export type BgvCheckStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'VERIFIED'
  | 'CLEAR'
  | 'CONSIDER'
  | 'FAILED';

export type BackgroundVerificationRecord = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly vendor: string;
  readonly status: BgvOverallStatus;
  readonly employment: BgvCheckStatus;
  readonly education: BgvCheckStatus;
  readonly reference: BgvCheckStatus;
  readonly address: BgvCheckStatus;
  readonly criminal: BgvCheckStatus;
  readonly completedAt: string | null;
  readonly hasReport: boolean;
};

type CheckFields = {
  employment: BgvCheckStatus;
  education: BgvCheckStatus;
  reference: BgvCheckStatus;
  address: BgvCheckStatus;
  criminal: BgvCheckStatus;
};

function mapCriminal(status: BgvOverallStatus): BgvCheckStatus {
  switch (status) {
    case 'CLEAR':
      return 'CLEAR';
    case 'CONSIDER':
      return 'CONSIDER';
    case 'FAILED':
      return 'FAILED';
    case 'IN_PROGRESS':
      return 'PENDING';
    case 'PENDING':
      return 'PENDING';
    default:
      return 'NOT_STARTED';
  }
}

function mapVerified(status: BgvOverallStatus): BgvCheckStatus {
  switch (status) {
    case 'CLEAR':
      return 'VERIFIED';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'PENDING':
      return 'PENDING';
    case 'CONSIDER':
      return 'CONSIDER';
    case 'FAILED':
      return 'FAILED';
    default:
      return 'NOT_STARTED';
  }
}

function deriveComprehensiveChecks(status: BgvOverallStatus): CheckFields {
  if (status === 'CLEAR') {
    return {
      employment: 'VERIFIED',
      education: 'VERIFIED',
      reference: 'VERIFIED',
      address: 'VERIFIED',
      criminal: 'CLEAR',
    };
  }
  if (status === 'IN_PROGRESS') {
    return {
      employment: 'IN_PROGRESS',
      education: 'PENDING',
      reference: 'PENDING',
      address: 'VERIFIED',
      criminal: 'PENDING',
    };
  }
  if (status === 'PENDING') {
    return {
      employment: 'PENDING',
      education: 'PENDING',
      reference: 'NOT_STARTED',
      address: 'NOT_STARTED',
      criminal: 'PENDING',
    };
  }
  if (status === 'CONSIDER') {
    return {
      employment: 'VERIFIED',
      education: 'VERIFIED',
      reference: 'VERIFIED',
      address: 'VERIFIED',
      criminal: 'CONSIDER',
    };
  }
  if (status === 'FAILED') {
    return {
      employment: 'VERIFIED',
      education: 'FAILED',
      reference: 'VERIFIED',
      address: 'VERIFIED',
      criminal: 'CLEAR',
    };
  }
  return {
    employment: 'NOT_STARTED',
    education: 'NOT_STARTED',
    reference: 'NOT_STARTED',
    address: 'NOT_STARTED',
    criminal: 'NOT_STARTED',
  };
}

function fromBackgroundCheck(check: MockBackgroundCheck): BackgroundVerificationRecord {
  const base: CheckFields = {
    employment: 'NOT_STARTED',
    education: 'NOT_STARTED',
    reference: 'NOT_STARTED',
    address: 'NOT_STARTED',
    criminal: 'NOT_STARTED',
  };

  if (check.type === 'COMPREHENSIVE') {
    Object.assign(base, deriveComprehensiveChecks(check.status));
  } else if (check.type === 'CRIMINAL') {
    base.criminal = mapCriminal(check.status);
  } else if (check.type === 'EMPLOYMENT') {
    base.employment = mapVerified(check.status);
  } else if (check.type === 'EDUCATION') {
    base.education = mapVerified(check.status);
  } else if (check.type === 'REFERENCE') {
    base.reference = mapVerified(check.status);
  }

  return {
    id: check.id,
    candidateId: check.candidateId,
    candidateName: check.candidateName,
    vendor: check.provider,
    status: check.status,
    ...base,
    completedAt: check.completedAt,
    hasReport: check.completedAt != null && check.status === 'CLEAR',
  };
}

const supplementalRecords: BackgroundVerificationRecord[] = [
  {
    id: 7,
    candidateId: 4,
    candidateName: 'Sofia Martinez',
    vendor: 'Checkr',
    status: 'CONSIDER',
    employment: 'VERIFIED',
    education: 'VERIFIED',
    reference: 'VERIFIED',
    address: 'VERIFIED',
    criminal: 'CONSIDER',
    completedAt: '2026-06-22T12:00:00Z',
    hasReport: true,
  },
  {
    id: 8,
    candidateId: 12,
    candidateName: 'Lucas Fernandez',
    vendor: 'Sterling',
    status: 'FAILED',
    employment: 'VERIFIED',
    education: 'FAILED',
    reference: 'VERIFIED',
    address: 'VERIFIED',
    criminal: 'CLEAR',
    completedAt: '2026-06-15T09:30:00Z',
    hasReport: true,
  },
  {
    id: 9,
    candidateId: 11,
    candidateName: 'Amara Okafor',
    vendor: 'Checkr',
    status: 'NOT_STARTED',
    employment: 'NOT_STARTED',
    education: 'NOT_STARTED',
    reference: 'NOT_STARTED',
    address: 'NOT_STARTED',
    criminal: 'NOT_STARTED',
    completedAt: null,
    hasReport: false,
  },
];

export const backgroundVerificationRecords: readonly BackgroundVerificationRecord[] = [
  ...backgroundChecks.map(fromBackgroundCheck),
  ...supplementalRecords,
];

export const bgvCandidates = [
  ...new Set(backgroundVerificationRecords.map((r) => r.candidateName)),
].sort();

export const bgvVendors = [
  ...new Set(backgroundVerificationRecords.map((r) => r.vendor)),
].sort();

export const bgvOverallStatuses: readonly BgvOverallStatus[] = [
  'NOT_STARTED',
  'PENDING',
  'IN_PROGRESS',
  'CLEAR',
  'CONSIDER',
  'FAILED',
  'SUSPENDED',
  'CANCELLED',
];

export function getBackgroundVerificationById(
  id: number,
): BackgroundVerificationRecord | undefined {
  return backgroundVerificationRecords.find((r) => r.id === id);
}
