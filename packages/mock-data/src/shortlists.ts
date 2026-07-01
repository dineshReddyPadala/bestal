import type { MockShortlist } from './types.js';

export const shortlists = [
  {
    id: 1,
    title: 'Senior React Engineers — Stripe Payments',
    clientId: 1,
    clientName: 'Stripe',
    status: 'ACTIVE',
    jobTitle: 'Senior Full-Stack Engineer (React/Node)',
    createdBy: 'Rachel Kim',
    createdAt: '2026-06-10T09:00:00Z',
    entries: [
      { candidateId: 1, candidateName: 'Alexandra Petrov', rank: 1, notes: 'Strong system design. Recommended for final panel.', addedAt: '2026-06-10T10:00:00Z' },
      { candidateId: 7, candidateName: 'Fatima Al-Rashid', rank: 2, notes: 'Excellent frontend craft. Design system experience.', addedAt: '2026-06-11T14:00:00Z' },
      { candidateId: 8, candidateName: 'Daniel Kowalski', rank: 3, notes: 'Backend-heavy but solid React skills.', addedAt: '2026-06-12T11:30:00Z' },
    ],
  },
  {
    id: 2,
    title: 'DevOps Staff — JPMorgan Cloud Migration',
    clientId: 3,
    clientName: 'JPMorgan Chase',
    status: 'ACTIVE',
    jobTitle: 'Staff DevOps Engineer',
    createdBy: 'Angela Torres',
    createdAt: '2026-06-05T08:00:00Z',
    entries: [
      { candidateId: 2, candidateName: 'James Okoro', rank: 1, notes: 'Kubernetes expert. Cleared technical eval.', addedAt: '2026-06-05T09:00:00Z' },
      { candidateId: 10, candidateName: 'Raj Patel', rank: 2, notes: 'Platform engineering background. High availability focus.', addedAt: '2026-06-06T15:00:00Z' },
    ],
  },
  {
    id: 3,
    title: 'ML Engineers — Spotify Recommendations',
    clientId: 4,
    clientName: 'Spotify',
    status: 'CLOSED',
    jobTitle: 'Senior Machine Learning Engineer',
    createdBy: 'Rachel Kim',
    createdAt: '2026-05-20T10:00:00Z',
    entries: [
      { candidateId: 3, candidateName: 'Priya Sharma', rank: 1, notes: 'Selected for deployment. Strong NLP background.', addedAt: '2026-05-20T11:00:00Z' },
    ],
  },
  {
    id: 4,
    title: 'Security Architect — FedRAMP Initiative',
    clientId: 3,
    clientName: 'JPMorgan Chase',
    status: 'DRAFT',
    jobTitle: 'Security Architect',
    createdBy: 'Angela Torres',
    createdAt: '2026-06-28T16:00:00Z',
    entries: [
      { candidateId: 6, candidateName: 'Michael Brooks', rank: 1, notes: 'CISSP + FedRAMP experience. Pending client review.', addedAt: '2026-06-28T16:30:00Z' },
    ],
  },
  {
    id: 5,
    title: 'Mobile Lead — Airbnb Experiences',
    clientId: 5,
    clientName: 'Airbnb',
    status: 'ACTIVE',
    jobTitle: 'Lead Mobile Engineer (iOS/Android)',
    createdBy: 'Tom Bradley',
    createdAt: '2026-06-18T13:00:00Z',
    entries: [
      { candidateId: 4, candidateName: 'Carlos Mendez', rank: 1, notes: 'React Native expert. App Store top charts experience.', addedAt: '2026-06-18T14:00:00Z' },
    ],
  },
] as const satisfies readonly MockShortlist[];

export type Shortlists = typeof shortlists;
