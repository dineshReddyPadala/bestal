import { candidates } from './candidates.js';
import {
  getCandidateDetailProfile,
  type CandidateDetailProfile,
  type CandidateProjectHighlight,
} from './candidateDetailProfile.js';

export type ClientGroupedSkill = {
  readonly skillCommunityName: string;
  readonly proficiencyLevel: string;
  readonly yearsExperience: number | null;
  readonly isPrimary: boolean;
};

export type ClientBgvCheck = {
  readonly label: string;
  readonly status: string;
};

export type ClientCandidateProfile = {
  readonly candidateId: number;
  readonly photoUrl: string;
  readonly displayName: string;
  readonly fullName: string;
  readonly role: string;
  readonly location: string;
  readonly yearsExperience: number;
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
  readonly evaluation: {
    readonly technical: number | null;
    readonly communication: number | null;
    readonly architecture: number | null;
    readonly recommendation: string | null;
    readonly status: string;
  };
  readonly bgv: {
    readonly status: string;
    readonly completedChecks: readonly ClientBgvCheck[];
    readonly summary: string;
  };
  readonly availabilityDetail: {
    readonly hoursMin: number;
    readonly hoursMax: number;
    readonly timezone: string;
    readonly availability: string;
    readonly startDate: string;
  };
};

function buildGroupedSkills(candidateId: number): {
  primary: ClientGroupedSkill[];
  secondary: ClientGroupedSkill[];
} {
  const cand = candidates.find((c) => c.id === candidateId);
  if (!cand) return { primary: [], secondary: [] };

  const map = cand.skills.map((s) => ({
    skillCommunityName: s.skillCommunityName,
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
    { label: 'Identity Verification', status: bgvDetail.idCheck },
    { label: 'Employment History', status: bgvDetail.employment },
    { label: 'Education', status: bgvDetail.education },
    { label: 'Professional References', status: bgvDetail.reference },
    { label: 'Address Verification', status: bgvDetail.address },
    { label: 'Criminal Background', status: bgvDetail.criminal },
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
    evaluation: {
      technical: detail.evaluationDetail.technicalScore,
      communication: detail.evaluationDetail.communicationScore,
      architecture: detail.evaluationDetail.architectureScore,
      recommendation: detail.evaluationDetail.recommendation,
      status: detail.overview.evaluationStatus,
    },
    bgv: {
      status: detail.bgvDetail.status,
      completedChecks: buildBgvChecks(detail),
      summary: detail.bgvDetail.summary,
    },
    availabilityDetail: {
      hoursMin: detail.availabilityDetail.minHours,
      hoursMax: detail.availabilityDetail.maxHours,
      timezone: detail.availabilityDetail.timezone.replace(/_/g, ' '),
      availability: detail.availabilityDetail.availability,
      startDate: detail.availabilityDetail.startDate,
    },
  };
}
