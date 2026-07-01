import type { MockCandidatePricing } from './types.js';

export const candidatePricing = [
  {
    candidateId: 1,
    payRate: 115,
    billRate: 155,
    currency: 'USD',
    effectiveFrom: '2026-05-01',
    notes: 'Staff-level full-stack. Premium for payments domain.',
  },
  {
    candidateId: 2,
    payRate: 130,
    billRate: 175,
    currency: 'USD',
    effectiveFrom: '2026-04-01',
    notes: 'Principal DevOps. High demand skill set.',
  },
  {
    candidateId: 3,
    payRate: 120,
    billRate: 165,
    currency: 'USD',
    effectiveFrom: '2026-06-01',
    notes: 'Senior ML engineer. Active deployment at Spotify.',
  },
  {
    candidateId: 4,
    payRate: 95,
    billRate: 130,
    currency: 'USD',
    effectiveFrom: '2026-05-15',
    notes: 'Senior UX designer.',
  },
  {
    candidateId: 5,
    payRate: 125,
    billRate: 170,
    currency: 'USD',
    effectiveFrom: '2026-04-01',
    notes: 'Staff data engineer.',
  },
  {
    candidateId: 6,
    payRate: 85,
    billRate: 120,
    currency: 'USD',
    effectiveFrom: '2026-06-10',
    notes: 'Mid-level backend. Pending evaluation completion.',
  },
  {
    candidateId: 7,
    payRate: 90,
    billRate: 125,
    currency: 'USD',
    effectiveFrom: '2026-05-01',
    notes: 'Senior frontend engineer.',
  },
  {
    candidateId: 8,
    payRate: 100,
    billRate: 140,
    currency: 'USD',
    effectiveFrom: '2026-05-20',
    notes: 'Security engineer.',
  },
  {
    candidateId: 9,
    payRate: 110,
    billRate: 150,
    currency: 'USD',
    effectiveFrom: '2026-05-01',
    notes: 'Product manager with technical background.',
  },
  {
    candidateId: 10,
    payRate: 135,
    billRate: 180,
    currency: 'USD',
    effectiveFrom: '2026-06-01',
    notes: 'Platform engineer — trading infrastructure.',
  },
  {
    candidateId: 11,
    payRate: 105,
    billRate: 145,
    currency: 'USD',
    effectiveFrom: '2026-05-01',
    notes: 'iOS engineer.',
  },
  {
    candidateId: 12,
    payRate: 95,
    billRate: 135,
    currency: 'USD',
    effectiveFrom: '2026-05-01',
    notes: 'QA automation lead.',
  },
] as const satisfies readonly MockCandidatePricing[];

export function getPricingForCandidate(candidateId: number): MockCandidatePricing | undefined {
  return candidatePricing.find((p) => p.candidateId === candidateId);
}

export function computeMarginPercent(payRate: number, billRate: number): number {
  if (billRate <= 0) return 0;
  return Math.round(((billRate - payRate) / billRate) * 1000) / 10;
}

export type CandidatePricing = typeof candidatePricing;
