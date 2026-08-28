import { candidates } from './candidates.js';
import {
  getCandidateDetailProfile,
  type CandidateDetailProfile,
  type CandidateProjectHighlight,
} from './candidateDetailProfile.js';

export type ClientGroupedSkill = {
  readonly skillCommunityName: string;
  readonly skillName?: string | null;
  readonly proficiencyLevel: string;
  readonly yearsExperience: number | null;
  readonly isPrimary: boolean;
};

export type ClientBgvCheck = {
  readonly label: string;
  readonly status: string;
};

export type ClientProfileAttachment = {
  readonly fileName: string;
  readonly url: string | null;
  readonly fileSize?: number | null;
  readonly createdAt?: string | null;
  readonly categoryLabel?: string;
  readonly mimeType?: string | null;
  readonly documentId?: number | null;
};

export type ClientCandidateProfile = {
  readonly candidateId: number;
  readonly photoUrl: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly role: string;
  readonly location: string;
  readonly yearsExperience: number;
  readonly currentCompany: string;
  readonly currentTitle: string;
  readonly primarySkillCommunityName: string;
  readonly education: string;
  readonly bestalScore: number;
  readonly availability: string;
  readonly billRate: number;
  readonly currency: string;
  readonly clientAiSummary: string;
  readonly strengths: readonly string[];
  readonly industryExperience: readonly string[];
  readonly projects: readonly CandidateProjectHighlight[];
  readonly primarySkills: readonly ClientGroupedSkill[];
  readonly secondarySkills: readonly ClientGroupedSkill[];
  readonly resumeAttachment: ClientProfileAttachment | null;
  readonly evaluation: {
    readonly technical: number | null;
    readonly problemSolving: number | null;
    readonly communication: number | null;
    readonly collaborationCulturalFit: number | null;
    readonly clientReadinessScore: number | null;
    readonly summary: string | null;
    readonly recommendation: string | null;
    readonly status: string;
    readonly attachment: ClientProfileAttachment | null;
  };
  readonly bgv: {
    readonly status: string;
    readonly completedChecks: readonly ClientBgvCheck[];
    readonly summary: string;
    readonly recommendation: string | null;
    readonly attachment: ClientProfileAttachment | null;
  };
  readonly availabilityDetail: {
    readonly hoursMin: number;
    readonly hoursMax: number;
    readonly timezone: string;
    readonly availability: string;
    readonly startDate: string;
  };
  readonly trialEligible: boolean;
};

function buildGroupedSkills(candidateId: number): {
  primary: ClientGroupedSkill[];
  secondary: ClientGroupedSkill[];
} {
  const cand = candidates.find((c) => c.id === candidateId);
  if (!cand) return { primary: [], secondary: [] };

  const map = cand.skills.map((s) => ({
    skillCommunityName: s.skillCommunityName,
    skillName: null,
    proficiencyLevel: s.proficiencyLevel,
    yearsExperience: s.yearsExperience,
    isPrimary: s.isPrimary,
  }));

  return {
    primary: map.filter((s) => s.isPrimary),
    secondary: map.filter((s) => !s.isPrimary),
  };
}

function buildBgvChecks(detail: CandidateDetailProfile): ClientBgvCheck[] {
  const { bgvDetail } = detail;
  return [
    { label: 'ID Check', status: bgvDetail.idCheck },
    { label: 'Criminal Check', status: bgvDetail.criminal },
    { label: 'Employment Verification', status: bgvDetail.employment },
  ];
}

export function getClientCandidateProfile(candidateId: number): ClientCandidateProfile | undefined {
  const cand = candidates.find((c) => c.id === candidateId);
  const detail = getCandidateDetailProfile(candidateId);
  if (!cand || !detail) return undefined;

  if (cand.visibility !== 'CLIENT_VISIBLE' || cand.approvalStatus !== 'APPROVED') {
    return undefined;
  }

  const grouped = buildGroupedSkills(candidateId);

  return {
    candidateId,
    photoUrl: cand.photoUrl,
    displayName: detail.overview.displayName,
    fullName: `${cand.firstName} ${cand.lastName}`,
    role: detail.overview.role,
    location: cand.location,
    yearsExperience: cand.yearsExperience,
    currentCompany: detail.overview.currentCompany ?? '',
    currentTitle: '',
    primarySkillCommunityName:
      detail.overview.community ?? grouped.primary[0]?.skillCommunityName ?? '',
    education: detail.overview.education ?? '',
    bestalScore: detail.overview.bestalScore,
    availability: detail.availabilityDetail.availability,
    billRate: detail.commercial.billRate,
    currency: detail.commercial.currency,
    clientAiSummary: detail.overview.clientSummary,
    strengths: detail.overview.strengths,
    industryExperience: detail.experience.domainExperience,
    projects: detail.experience.projectHighlights,
    primarySkills: grouped.primary,
    secondarySkills: grouped.secondary,
    resumeAttachment: {
      fileName: 'Resume.pdf',
      url: null,
      fileSize: 421888,
      createdAt: null,
      categoryLabel: 'Resume',
    },
    evaluation: {
      technical: detail.evaluationDetail.technicalScore,
      problemSolving: detail.evaluationDetail.problemSolvingScore ?? null,
      communication: detail.evaluationDetail.communicationScore,
      collaborationCulturalFit: detail.evaluationDetail.collaborationCulturalFitScore,
      clientReadinessScore: detail.evaluationDetail.clientReadinessScore,
      summary: detail.evaluationDetail.aiEvaluationSummary?.trim() || null,
      recommendation: detail.evaluationDetail.recommendation,
      status: detail.overview.evaluationStatus,
      attachment: {
        fileName: detail.evaluationDetail.evaluationPdfFileName ?? 'Tech Evaluation.pdf',
        url: null,
        fileSize: 421888,
        createdAt: null,
        categoryLabel: 'Resume',
      },
    },
    bgv: {
      status: detail.bgvDetail.status,
      completedChecks: buildBgvChecks(detail),
      summary: detail.bgvDetail.summary,
      recommendation: null,
      attachment: {
        fileName: 'BGV.pdf',
        url: null,
        fileSize: 421888,
        createdAt: null,
        categoryLabel: 'Resume',
      },
    },
    availabilityDetail: {
      hoursMin: detail.availabilityDetail.minHours,
      hoursMax: detail.availabilityDetail.maxHours,
      timezone: detail.availabilityDetail.timezone.replace(/_/g, ' '),
      availability: detail.availabilityDetail.availability,
      startDate: detail.availabilityDetail.startDate,
    },
    trialEligible:
      detail.overview.evaluationStatus === 'COMPLETED' &&
      (detail.bgvDetail.status === 'CLEAR' || detail.bgvDetail.status === 'COMPLETED_CLEAR'),
  };
}
