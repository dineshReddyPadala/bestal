import { candidates } from './candidates.js';
import { clients } from './clients.js';
import { deployments } from './deployments.js';
import { interviews } from './interviews.js';
import { shortlists } from './shortlists.js';
import { trials } from './trials.js';
import { users } from './users.js';

export type ClientDashboardStat = {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly change?: number;
  readonly changeLabel?: string;
};

export type ClientRecommendedCandidate = {
  readonly candidateId: number;
  readonly matchScore: number;
  readonly matchReason: string;
  readonly featured: boolean;
};

export type ClientActivityItem = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly timestamp: string;
  readonly status: string;
  readonly type: 'INTERVIEW' | 'TRIAL' | 'SHORTLIST' | 'DEPLOYMENT' | 'CANDIDATE' | 'GENERAL';
};

export type ClientNotification = {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: string;
  readonly status: string;
  readonly createdAt: string;
};

export type ClientAccountManager = {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly photoUrl: string;
  readonly title: string;
};

export type ClientInterviewSummary = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly type: string;
  readonly status: string;
  readonly scheduledAt: string | null;
  readonly interviewer: string;
};

export type ClientPilotSummary = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly title: string;
  readonly status: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly pilotType: string;
};

export type ClientDashboardData = {
  readonly clientId: number;
  readonly clientName: string;
  readonly stats: readonly ClientDashboardStat[];
  readonly recommendedCandidates: readonly ClientRecommendedCandidate[];
  readonly accountManager: ClientAccountManager;
  readonly recentActivity: readonly ClientActivityItem[];
  readonly recentInterviews: readonly ClientInterviewSummary[];
  readonly recentPilots: readonly ClientPilotSummary[];
  readonly notifications: readonly ClientNotification[];
};

const JPM_RECOMMENDED: readonly ClientRecommendedCandidate[] = [
  { candidateId: 2, matchScore: 96, matchReason: 'Kubernetes & zero-downtime migration expertise', featured: true },
  { candidateId: 10, matchScore: 94, matchReason: 'Platform engineering for trading infrastructure', featured: true },
  { candidateId: 6, matchScore: 91, matchReason: 'FedRAMP security architect — CISSP certified', featured: true },
  { candidateId: 1, matchScore: 89, matchReason: 'Staff full-stack with payments domain depth', featured: false },
  { candidateId: 8, matchScore: 87, matchReason: 'High-performance backend — Go & distributed systems', featured: false },
  { candidateId: 5, matchScore: 85, matchReason: 'Staff data engineer — Spark & real-time pipelines', featured: false },
];

const ACCOUNT_MANAGERS: Record<number, string> = {
  1: 'Rachel Kim',
  2: 'Tom Bradley',
  3: 'Angela Torres',
  4: 'Angela Torres',
  5: 'Tom Bradley',
  6: 'Sarah Chen',
  7: 'Angela Torres',
};

function buildAccountManager(clientId: number): ClientAccountManager {
  const client = clients.find((c) => c.id === clientId);
  const name = client?.accountManager ?? ACCOUNT_MANAGERS[clientId] ?? 'Angela Torres';
  const user = users.find((u) => `${u.firstName} ${u.lastName}` === name);
  return {
    id: user?.id ?? 4,
    name,
    email: user?.email ?? 'angela.torres@bestal.com',
    phone: '+1 (212) 555-0142',
    photoUrl: user?.photoUrl ?? 'https://ui-avatars.com/api/?name=Angela+Torres&background=1565C0&color=fff',
    title: 'Senior Account Manager',
  };
}

function buildNotifications(clientId: number): ClientNotification[] {
  if (clientId !== 3) return [];
  return [
    {
      id: 'cn-1',
      title: 'Trial in progress',
      message: 'James Okoro — Staff DevOps trial started June 20. Mid-point check-in scheduled.',
      type: 'TRIAL',
      status: 'IN_PROGRESS',
      createdAt: '2026-06-30T09:00:00Z',
    },
    {
      id: 'cn-2',
      title: 'Interview confirmed',
      message: 'Video interview with James Okoro confirmed for July 3 at 10:00 AM ET.',
      type: 'INTERVIEW',
      status: 'CONFIRMED',
      createdAt: '2026-06-29T14:30:00Z',
    },
    {
      id: 'cn-3',
      title: 'New recommended talent',
      message: '3 new candidates match your DevOps & Cloud requirements this week.',
      type: 'CANDIDATE',
      status: 'DELIVERED',
      createdAt: '2026-06-28T11:00:00Z',
    },
    {
      id: 'cn-4',
      title: 'Pilot request received',
      message: 'Michael Brooks — 20-hour security architect pilot request is under review.',
      type: 'TRIAL',
      status: 'REQUESTED',
      createdAt: '2026-06-27T16:45:00Z',
    },
    {
      id: 'cn-5',
      title: 'Deployment update',
      message: 'Raj Patel placement on hold pending compliance sign-off.',
      type: 'DEPLOYMENT',
      status: 'ON_HOLD',
      createdAt: '2026-06-26T10:15:00Z',
    },
  ];
}

function buildActivity(clientId: number): ClientActivityItem[] {
  const items: ClientActivityItem[] = [];
  interviews
    .filter((i) => i.clientId === clientId)
    .forEach((i) => {
      items.push({
        id: `act-int-${i.id}`,
        title: `Interview — ${i.candidateName}`,
        subtitle: `${i.type.replace('_', ' ')} · ${i.status}`,
        timestamp: i.scheduledAt ?? '2026-06-30T12:00:00Z',
        status: i.status,
        type: 'INTERVIEW',
      });
    });
  trials
    .filter((t) => t.clientId === clientId)
    .forEach((t) => {
      items.push({
        id: `act-trial-${t.id}`,
        title: `Pilot — ${t.candidateName}`,
        subtitle: t.title,
        timestamp: `${t.startDate}T09:00:00Z`,
        status: t.status,
        type: 'TRIAL',
      });
    });
  shortlists
    .filter((s) => s.clientId === clientId)
    .forEach((s) => {
      s.entries.forEach((e) => {
        items.push({
          id: `act-sl-${s.id}-${e.candidateId}`,
          title: `Shortlisted — ${e.candidateName}`,
          subtitle: s.jobTitle,
          timestamp: e.addedAt,
          status: s.status,
          type: 'SHORTLIST',
        });
      });
    });
  deployments
    .filter((d) => d.clientId === clientId)
    .forEach((d) => {
      items.push({
        id: `act-dep-${d.id}`,
        title: `Deployment — ${d.candidateName}`,
        subtitle: d.title,
        timestamp: `${d.startDate}T08:00:00Z`,
        status: d.status,
        type: 'DEPLOYMENT',
      });
    });
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
}

export function getClientDashboard(clientId: number): ClientDashboardData {
  const client = clients.find((c) => c.id === clientId);
  const clientName = client?.name ?? 'Client';

  const clientShortlists = shortlists.filter((s) => s.clientId === clientId);
  const shortlistedCount = clientShortlists.reduce((n, s) => n + s.entries.length, 0);

  const clientInterviews = interviews.filter((i) => i.clientId === clientId);
  const interviewRequests = clientInterviews.filter((i) =>
    ['REQUESTED', 'SCHEDULED', 'CONFIRMED', 'RESCHEDULED'].includes(i.status),
  ).length;

  const clientTrials = trials.filter((t) => t.clientId === clientId);
  const trialRequests = clientTrials.filter((t) =>
    ['REQUESTED', 'SCHEDULED', 'IN_PROGRESS'].includes(t.status),
  ).length;

  const activeDeployments = deployments.filter(
    (d) => d.clientId === clientId && ['ACTIVE', 'ON_HOLD', 'PENDING'].includes(d.status),
  ).length;

  const recommended =
    clientId === 3
      ? JPM_RECOMMENDED
      : candidates.slice(0, 4).map((c, i) => ({
          candidateId: c.id,
          matchScore: 90 - i * 2,
          matchReason: c.headline.slice(0, 60),
          featured: i < 2,
        }));

  const stats: ClientDashboardStat[] = [
    {
      id: 'recommended',
      label: 'Recommended Candidates',
      value: recommended.length,
      change: 12,
      changeLabel: 'new this week',
    },
    {
      id: 'shortlisted',
      label: 'Shortlisted',
      value: shortlistedCount,
      change: 2,
      changeLabel: 'added recently',
    },
    {
      id: 'interviews',
      label: 'Interview Requests',
      value: interviewRequests,
    },
    {
      id: 'trials',
      label: 'Trial Requests',
      value: trialRequests,
    },
    {
      id: 'deployments',
      label: 'Active Deployments',
      value: activeDeployments,
    },
  ];

  const recentInterviews: ClientInterviewSummary[] = clientInterviews
    .slice()
    .sort((a, b) => {
      const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      candidateId: i.candidateId,
      candidateName: i.candidateName,
      type: i.type,
      status: i.status,
      scheduledAt: i.scheduledAt,
      interviewer: i.interviewer,
    }));

  const recentPilots: ClientPilotSummary[] = clientTrials
    .slice()
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      candidateId: t.candidateId,
      candidateName: t.candidateName,
      title: t.title,
      status: t.status,
      startDate: t.startDate,
      endDate: t.endDate,
      pilotType: t.pilotType,
    }));

  return {
    clientId,
    clientName,
    stats,
    recommendedCandidates: recommended,
    accountManager: buildAccountManager(clientId),
    recentActivity: buildActivity(clientId),
    recentInterviews,
    recentPilots,
    notifications: buildNotifications(clientId),
  };
}

/** Default dashboard for demo client (JPMorgan Chase, id 3). */
export const clientDashboard = getClientDashboard(3);
