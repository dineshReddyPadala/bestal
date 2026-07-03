import { backgroundChecks } from './backgroundChecks.js';
import { candidateAvailability } from './availability.js';
import { getCandidateListRecord } from './candidateListing.js';
import { candidatePricing, computeMarginPercent } from './pricing.js';
import { candidates } from './candidates.js';
import { evaluations } from './evaluations.js';
import { getScreeningForCandidate } from './screening.js';
import { getBestalScore } from './candidateScores.js';

export type CandidateProjectHighlight = {
  readonly title: string;
  readonly client: string;
  readonly period: string;
  readonly description: string;
};

export type CandidateCertification = {
  readonly name: string;
  readonly issuer: string;
  readonly year: number;
};

export type CandidateTimelineEvent = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly timestamp: string;
  readonly type: string;
};

export type CandidateActivityEvent = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly actor: string;
  readonly timestamp: string;
  readonly status: string;
};

export type CandidateDetailProfile = {
  readonly candidateId: number;
  readonly overview: {
    readonly displayName: string;
    readonly githubUrl: string | null;
    readonly naukriUrl: string | null;
    readonly currentCompany: string;
    readonly role: string;
    readonly community: string;
    readonly education: string;
    readonly aiSummary: string;
    readonly clientSummary: string;
    readonly strengths: readonly string[];
    readonly weaknesses: readonly string[];
    readonly riskFlags: readonly string[];
    readonly bestalScore: number;
    readonly technicalScore: number;
    readonly communicationScore: number;
    readonly reliabilityScore: number;
    readonly evaluationStatus: string;
    readonly bgvStatus: string;
    readonly deploymentStatus: string;
  };
  readonly experience: {
    readonly projectHighlights: readonly CandidateProjectHighlight[];
    readonly domainExperience: readonly string[];
    readonly platforms: readonly string[];
    readonly certifications: readonly CandidateCertification[];
  };
  readonly evaluationDetail: {
    readonly technicalScore: number | null;
    readonly communicationScore: number | null;
    readonly problemSolvingScore: number | null;
    readonly architectureScore: number | null;
    readonly clientReadinessScore: number | null;
    readonly recommendation: string | null;
    readonly evaluatorComments: string;
    readonly aiEvaluationSummary: string;
    readonly recordingUrl: string | null;
    readonly evaluationPdfFileName: string | null;
  };
  readonly bgvDetail: {
    readonly vendor: string;
    readonly status: string;
    readonly idCheck: string;
    readonly employment: string;
    readonly education: string;
    readonly reference: string;
    readonly address: string;
    readonly criminal: string;
    readonly concernNotes: string | null;
    readonly summary: string;
  };
  readonly availabilityDetail: {
    readonly availability: string;
    readonly startDate: string;
    readonly timezone: string;
    readonly shift: string;
    readonly minHours: number;
    readonly maxHours: number;
  };
  readonly commercial: {
    readonly billRate: number;
    readonly payRate: number;
    readonly marginPercent: number;
    readonly currency: string;
  };
  readonly timeline: readonly CandidateTimelineEvent[];
  readonly activity: readonly CandidateActivityEvent[];
};

const EDUCATION: Record<number, string> = {
  1: 'MS Computer Science, Stanford University (2014)',
  2: 'BS Computer Engineering, MIT (2010)',
  3: 'PhD Computer Science, MIT (2016)',
  4: 'BS Computer Science, University of Miami (2015)',
  5: 'MS Data Science, University of Washington (2013)',
  6: 'MS Cybersecurity, Georgetown University (2008)',
  7: 'BS Computer Science, University of Toronto (2017)',
  8: 'MS Computer Science, University of Illinois (2014)',
  9: 'MFA Design, Konstfack Stockholm (2016)',
  10: 'BS Computer Engineering, Imperial College London (2012)',
  11: 'BS Information Systems, Colorado State (2015)',
  12: 'MS Computer Science, NUS Singapore (2018)',
};

const GITHUB: Record<number, string | null> = {
  1: 'https://github.com/apetrov-dev',
  2: 'https://github.com/jokoro',
  3: 'https://github.com/priyasharma-ml',
  4: 'https://github.com/carlosmendez-mobile',
  5: 'https://github.com/emilynakamura',
  6: 'https://github.com/mbrooks-sec',
  7: 'https://github.com/falrashid',
  8: 'https://github.com/dkowalski-go',
  9: null,
  10: 'https://github.com/rajpatel-platform',
  11: 'https://github.com/lisathompson-qa',
  12: 'https://github.com/weizhang-chain',
};

const NAUKRI: Record<number, string | null> = {
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
  7: 'https://naukri.com/mnjuser/profile?id=fatima-ar',
  8: null,
  9: null,
  10: null,
  11: null,
  12: 'https://naukri.com/mnjuser/profile?id=wei-zhang',
};

function evalForCandidate(id: number) {
  return evaluations.filter(e => e.candidateId === id).sort((a,b) => b.id - a.id)[0];
}

function bgvForCandidate(id: number) {
  return backgroundChecks.filter(b => b.candidateId === id).sort((a,b) => b.id - a.id)[0];
}

function deploymentStatus(id: number): string {
  const listRec = getCandidateListRecord(id);
  return listRec?.deploymentStatus ?? 'NOT_DEPLOYED';
}

function evalStatus(id: number): string {
  const ev = evalForCandidate(id);
  return ev?.status ?? 'NOT_STARTED';
}

function bgvStatus(id: number): string {
  const bgv = bgvForCandidate(id);
  return bgv?.status ?? 'NOT_STARTED';
}

function buildProfile(id: number): CandidateDetailProfile {
  const cand = candidates.find(c => c.id === id)!;
  const listRec = getCandidateListRecord(id);
  const avail = candidateAvailability.find(a => a.candidateId === id);
  const pricing = candidatePricing.find(p => p.candidateId === id);
  const screening = getScreeningForCandidate(id);
  const ev = evalForCandidate(id);
  const bgv = bgvForCandidate(id);
  const score = getBestalScore(id);

  const billRate = pricing?.billRate ?? cand.expectedRate;
  const payRate = pricing?.payRate ?? Math.round(billRate * 0.72);
  const margin = computeMarginPercent(payRate, billRate);

  const technicalScore = ev?.technicalScore ?? screening?.skillsMatch ?? Math.round(score * 0.95);
  const commScore = ev?.communicationScore ?? screening?.communicationScore ?? Math.round(score * 0.92);
  const reliabilityScore = Math.round(score * 0.94);

  const strengths = ev?.notes ? [ev.notes.slice(0, 80)] : screening?.summary ? [screening.summary.slice(0,100)] : ['Strong technical background', 'Good communication'];
  const weaknesses = screening?.flags?.length ? [...screening.flags] : ['None significant'];
  const riskFlags = screening?.flags?.length ? [...screening.flags] : [];

  const aiSummary = screening?.summary ?? `AI screening pending for candidate ${id}.`;
  const clientSummary = `${cand.firstName} is a ${listRec?.role ?? cand.headline} with ${cand.yearsExperience} years experience. Recommended for enterprise client profiles. BesTal score ${score}.`;

  const timeline: CandidateTimelineEvent[] = [
    { id: `${id}-t1`, title: 'Profile Created', description: 'Candidate profile created in BesTal', timestamp: listRec?.createdAt ?? '2026-05-01T10:00:00Z', type: 'PROFILE' },
    { id: `${id}-t2`, title: 'Resume Uploaded', description: 'Resume document uploaded', timestamp: '2026-05-12T09:15:00Z', type: 'DOCUMENT' },
    { id: `${id}-t3`, title: 'AI Screening Run', description: 'AI screening completed', timestamp: screening?.runAt ?? '2026-05-18T10:30:00Z', type: 'AI' },
    { id: `${id}-t4`, title: 'Evaluation Completed', description: ev ? `Evaluation ${ev.status}` : 'Evaluation pending', timestamp: ev?.completedAt ?? '2026-06-14T17:00:00Z', type: 'EVALUATION' },
    { id: `${id}-t5`, title: 'BGV Initiated', description: bgv ? `BGV ${bgv.status} via ${bgv.provider}` : 'BGV not started', timestamp: bgv?.requestedAt ?? '2026-06-12T09:00:00Z', type: 'BGV' },
    { id: `${id}-t6`, title: 'Approved for Client Visibility', description: cand.approvalStatus === 'APPROVED' ? 'Candidate approved' : 'Pending approval', timestamp: '2026-05-22T11:00:00Z', type: 'APPROVAL' },
  ];

  const activity: CandidateActivityEvent[] = [
    { id: `${id}-a1`, title: 'AI Screening completed', subtitle: `Score ${score}`, actor: 'BesTal AI', timestamp: screening?.runAt ?? '2026-05-18T10:30:00Z', status: 'COMPLETED' },
    { id: `${id}-a2`, title: 'Evaluation updated', subtitle: ev ? `${ev.status}` : 'No evaluation', actor: ev?.evaluatorName ?? 'System', timestamp: ev?.completedAt ?? '2026-06-14T17:00:00Z', status: ev?.status ?? 'PENDING' },
    { id: `${id}-a3`, title: 'BGV status change', subtitle: bgv?.status ?? 'NOT_STARTED', actor: bgv?.requestedBy ?? 'Rachel Kim', timestamp: bgv?.requestedAt ?? '2026-06-12T09:00:00Z', status: bgv?.status ?? 'PENDING' },
    { id: `${id}-a4`, title: 'Profile viewed', subtitle: 'Admin viewed profile', actor: 'Admin User', timestamp: '2026-06-30T10:00:00Z', status: 'COMPLETED' },
  ];

  return {
    candidateId: id,
    overview: {
      displayName: listRec?.displayName ?? `${cand.firstName} ${cand.lastName.charAt(0)}.`,
      githubUrl: GITHUB[id] ?? null,
      naukriUrl: NAUKRI[id] ?? null,
      currentCompany: listRec?.currentCompany ?? 'Independent',
      role: listRec?.role ?? cand.headline.split('|')[0]?.trim() ?? cand.headline,
      community: listRec?.community ?? 'General',
      education: EDUCATION[id] ?? 'BS Computer Science (2015)',
      aiSummary,
      clientSummary,
      strengths: strengths as readonly string[],
      weaknesses: weaknesses as readonly string[],
      riskFlags: riskFlags as readonly string[],
      bestalScore: score,
      technicalScore: technicalScore,
      communicationScore: commScore,
      reliabilityScore: reliabilityScore,
      evaluationStatus: evalStatus(id),
      bgvStatus: bgvStatus(id),
      deploymentStatus: deploymentStatus(id),
    },
    experience: {
      projectHighlights: [
        { title: `${cand.headline.split('|')[0]?.trim() ?? 'Lead Project'}`, client: listRec?.currentCompany ?? 'Enterprise Client', period: '2022–2025', description: cand.summary.slice(0, 120) },
        { title: 'Previous Major Project', client: 'Previous Employer', period: '2019–2022', description: 'Delivered major enterprise project with measurable business impact.' },
      ],
      domainExperience: [listRec?.community ?? 'Software', 'Enterprise SaaS', 'Cloud Infrastructure'],
      platforms: ['AWS', 'Azure', 'Kubernetes', 'React', 'Node.js'],
      certifications: [
        { name: 'AWS Solutions Architect', issuer: 'Amazon', year: 2023 },
        { name: 'Professional Certification', issuer: 'Industry Body', year: 2022 },
      ],
    },
    evaluationDetail: {
      technicalScore: ev?.technicalScore ?? null,
      communicationScore: ev?.communicationScore ?? null,
      problemSolvingScore: ev ? Math.round((ev.technicalScore ?? 80) * 0.98) : null,
      architectureScore: ev ? Math.round((ev.technicalScore ?? 80) * 1.02) : null,
      clientReadinessScore: ev ? Math.round((ev.overallScore ?? 80) * 0.97) : null,
      recommendation: ev?.recommendation ?? null,
      evaluatorComments: ev?.notes ?? 'Evaluation pending or not started.',
      aiEvaluationSummary: screening?.summary ?? 'AI evaluation summary pending.',
      recordingUrl: ev ? 'https://demo.bestal.local/recordings/eval-recording-demo.mp4' : null,
      evaluationPdfFileName: ev ? `eval-${id}.pdf` : null,
    },
    bgvDetail: {
      vendor: bgv?.provider ?? 'Checkr',
      status: bgv?.status ?? 'NOT_STARTED',
      idCheck: bgv?.status === 'CLEAR' ? 'CLEAR' : bgv?.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : bgv ? 'PENDING' : 'NOT_STARTED',
      employment: bgv?.status === 'CLEAR' ? 'VERIFIED' : bgv ? 'IN_PROGRESS' : 'NOT_STARTED',
      education: bgv?.status === 'CLEAR' ? 'VERIFIED' : bgv ? 'PENDING' : 'NOT_STARTED',
      reference: bgv?.status === 'CLEAR' ? 'VERIFIED' : 'NOT_STARTED',
      address: bgv?.status === 'CLEAR' ? 'VERIFIED' : 'NOT_STARTED',
      criminal: bgv?.status === 'CLEAR' ? 'CLEAR' : bgv?.status === 'IN_PROGRESS' ? 'PENDING' : 'NOT_STARTED',
      concernNotes: screening?.flags?.length ? screening.flags.join('; ') : null,
      summary: bgv ? `BGV ${bgv.status} via ${bgv.provider}. ${bgv.completedAt ? 'Completed '+bgv.completedAt : 'In progress'}` : 'BGV not yet initiated.',
    },
    availabilityDetail: {
      availability: listRec?.availability ?? 'Within 30 days',
      startDate: avail?.availableFrom ?? cand.availableFrom,
      timezone: avail?.timezone ?? listRec?.timezone ?? 'America/New_York',
      shift: 'Flexible / US Business Hours',
      minHours: avail?.hoursPerWeek ? Math.min(avail.hoursPerWeek, 20) : 20,
      maxHours: avail?.hoursPerWeek ?? 40,
    },
    commercial: {
      billRate,
      payRate,
      marginPercent: margin,
      currency: pricing?.currency ?? cand.currency,
    },
    timeline,
    activity,
  };
}

export function getCandidateDetailProfile(candidateId: number): CandidateDetailProfile | undefined {
  if (!candidates.find(c => c.id === candidateId)) return undefined;
  return buildProfile(candidateId);
}

export const candidateDetailProfiles: readonly CandidateDetailProfile[] = candidates.map(c => buildProfile(c.id));
