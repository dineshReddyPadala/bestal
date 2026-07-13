import { evaluations } from './evaluations.js';
import type { MockEvaluation } from './types.js';

export type EvaluationManagementStatus = MockEvaluation['status'];

export type EvaluationType =
  | 'Coding Test'
  | 'Live Technical Interview'
  | 'System Design'
  | 'Platform-Specific'
  | 'Communication'
  | 'Functional'
  | 'Manual Scorecard';

export type EvaluationManagementRecord = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly evaluatorName: string;
  readonly evaluatedDate: string | null;
  readonly evaluationType: EvaluationType;
  readonly technicalScore: number | null;
  readonly communicationScore: number | null;
  readonly architectureScore: number | null;
  readonly problemSolvingScore: number | null;
  readonly recommendation: string | null;
  readonly status: EvaluationManagementStatus;
  readonly hasRecording: boolean;
  readonly hasPdf: boolean;
};

function mapEvaluationType(skillCommunity: string): EvaluationType {
  if (skillCommunity.includes('Full-Stack')) return 'Live Technical Interview';
  if (skillCommunity.includes('Cybersecurity')) return 'Platform-Specific';
  if (skillCommunity.includes('Machine Learning')) return 'System Design';
  return 'Coding Test';
}

function deriveArchitectureScore(ev: MockEvaluation): number | null {
  if (ev.technicalScore == null) return null;
  return Math.min(100, Math.round(ev.technicalScore * 1.02));
}

function deriveProblemSolvingScore(ev: MockEvaluation): number | null {
  if (ev.technicalScore == null) return null;
  return Math.min(100, Math.round(ev.technicalScore * 0.98));
}

function fromEvaluation(ev: MockEvaluation, evaluatedDate: string | null): EvaluationManagementRecord {
  const completed = ev.status === 'COMPLETED';
  return {
    id: ev.id,
    candidateId: ev.candidateId,
    candidateName: ev.candidateName,
    evaluatorName: ev.evaluatorName,
    evaluatedDate: evaluatedDate ?? ev.completedAt,
    evaluationType: mapEvaluationType(ev.skillCommunity),
    technicalScore: ev.technicalScore,
    communicationScore: ev.communicationScore,
    architectureScore: deriveArchitectureScore(ev),
    problemSolvingScore: deriveProblemSolvingScore(ev),
    recommendation: ev.recommendation,
    status: ev.status,
    hasRecording: completed,
    hasPdf: completed,
  };
}

const scheduledDates: Record<number, string> = {
  4: '2026-07-02T14:00:00Z',
  5: '2026-07-08T10:00:00Z',
};

const baseRecords = evaluations.map((ev) =>
  fromEvaluation(ev, ev.completedAt ?? scheduledDates[ev.id] ?? null),
);

const supplementalRecords: EvaluationManagementRecord[] = [
  {
    id: 7,
    candidateId: 4,
    candidateName: 'Sofia Martinez',
    evaluatorName: 'Maria Gonzalez',
    evaluatedDate: '2026-06-20T15:30:00Z',
    evaluationType: 'Communication',
    technicalScore: 82,
    communicationScore: 94,
    architectureScore: 78,
    problemSolvingScore: 80,
    recommendation: 'Hire',
    status: 'COMPLETED',
    hasRecording: true,
    hasPdf: true,
  },
  {
    id: 8,
    candidateId: 12,
    candidateName: 'Lucas Fernandez',
    evaluatorName: 'Kevin O\'Brien',
    evaluatedDate: '2026-05-10T11:00:00Z',
    evaluationType: 'Coding Test',
    technicalScore: 72,
    communicationScore: 78,
    architectureScore: 70,
    problemSolvingScore: 74,
    recommendation: 'Reject',
    status: 'ARCHIVED',
    hasRecording: true,
    hasPdf: true,
  },
  {
    id: 9,
    candidateId: 11,
    candidateName: 'Amara Okafor',
    evaluatorName: 'Dr. Alan Wright',
    evaluatedDate: null,
    evaluationType: 'System Design',
    technicalScore: null,
    communicationScore: null,
    architectureScore: null,
    problemSolvingScore: null,
    recommendation: null,
    status: 'DRAFT',
    hasRecording: false,
    hasPdf: false,
  },
];

export const evaluationManagementRecords: readonly EvaluationManagementRecord[] = [
  ...baseRecords,
  ...supplementalRecords,
];

export const evaluationCandidates = [
  ...new Set(evaluationManagementRecords.map((r) => r.candidateName)),
].sort();

export const evaluationEvaluators = [
  ...new Set(evaluationManagementRecords.map((r) => r.evaluatorName)),
].sort();

export const evaluationTypes: readonly EvaluationType[] = [
  'Coding Test',
  'Live Technical Interview',
  'System Design',
  'Platform-Specific',
  'Communication',
  'Functional',
  'Manual Scorecard',
];

export const evaluationStatuses: readonly EvaluationManagementStatus[] = [
  'DRAFT',
  'IN_PROGRESS',
  'COMPLETED',
  'ARCHIVED',
];

export const evaluationRecommendations = [
  'Strong Hire',
  'Hire',
  'Borderline',
  'Reject',
] as const;

export function getEvaluationManagementById(
  id: number,
): EvaluationManagementRecord | undefined {
  return evaluationManagementRecords.find((r) => r.id === id);
}
