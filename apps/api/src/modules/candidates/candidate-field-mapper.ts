import type { Prisma, CandidateAvailabilityStatus, CandidateProfileStatus } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { CreateCandidateInput, UpdateCandidateInput } from './candidate.types.js';

type CandidateScalarInput = Partial<CreateCandidateInput & UpdateCandidateInput>;

export function buildCandidateScalarData(
  data: CandidateScalarInput,
): Prisma.CandidateUncheckedUpdateInput {
  const result: Prisma.CandidateUncheckedUpdateInput = {};

  if (data.firstName !== undefined) result.firstName = data.firstName;
  if (data.lastName !== undefined) result.lastName = data.lastName;
  if (data.email !== undefined) result.email = data.email.toLowerCase();
  if (data.phone !== undefined) result.phone = data.phone;
  if (data.status !== undefined) result.status = data.status;
  if (data.source !== undefined) result.source = data.source;
  if (data.headline !== undefined) result.headline = data.headline;
  if (data.summary !== undefined) result.summary = data.summary;
  if (data.location !== undefined) result.location = data.location;
  if (data.yearsExperience !== undefined) result.yearsExperience = data.yearsExperience;
  if (data.availableFrom !== undefined) {
    result.availableFrom = data.availableFrom ? new Date(data.availableFrom) : null;
  }
  if (data.expectedRate !== undefined) result.expectedRate = data.expectedRate;
  if (data.currency !== undefined) result.currency = data.currency;
  if (data.linkedinUrl !== undefined) result.linkedinUrl = data.linkedinUrl;
  if (data.primarySkillCommunityId !== undefined) {
    result.primarySkillCommunityId = data.primarySkillCommunityId
      ? BigInt(data.primarySkillCommunityId)
      : null;
  }
  if (data.createdById !== undefined) {
    result.createdById = data.createdById ? BigInt(data.createdById) : null;
  }
  if (data.oorwinCandidateId !== undefined) result.oorwinCandidateId = data.oorwinCandidateId;
  if (data.displayName !== undefined) result.displayName = data.displayName;
  if (data.primaryRole !== undefined) result.primaryRole = data.primaryRole;
  if (data.currentCompany !== undefined) result.currentCompany = data.currentCompany;
  if (data.education !== undefined) result.education = data.education;
  if (data.githubUrl !== undefined) result.githubUrl = data.githubUrl;
  if (data.naukriUrl !== undefined) result.naukriUrl = data.naukriUrl;
  if (data.timezone !== undefined) result.timezone = data.timezone;
  if (data.noticePeriod !== undefined) result.noticePeriod = data.noticePeriod;
  if (data.clientBillRate !== undefined) result.clientBillRate = data.clientBillRate;
  if (data.candidatePayRate !== undefined) result.candidatePayRate = data.candidatePayRate;
  if (data.grossMargin !== undefined) result.grossMargin = data.grossMargin;
  if (data.availabilityStatus !== undefined) result.availabilityStatus = data.availabilityStatus;
  if (data.timezoneOverlap !== undefined) result.timezoneOverlap = data.timezoneOverlap;
  if (data.preferredShift !== undefined) result.preferredShift = data.preferredShift;
  if (data.minHoursPerWeek !== undefined) result.minHoursPerWeek = data.minHoursPerWeek;
  if (data.maxHoursPerWeek !== undefined) result.maxHoursPerWeek = data.maxHoursPerWeek;
  if (data.aiSummary !== undefined) result.aiSummary = data.aiSummary;
  if (data.clientProfileSummary !== undefined) {
    result.clientProfileSummary = data.clientProfileSummary;
  }
  if (data.strengths !== undefined) result.strengths = data.strengths;
  if (data.weaknesses !== undefined) result.weaknesses = data.weaknesses;
  if (data.riskFlags !== undefined) result.riskFlags = data.riskFlags;
  if (data.bestalScore !== undefined) result.bestalScore = data.bestalScore;
  if (data.technicalScore !== undefined) result.technicalScore = data.technicalScore;
  if (data.communicationScore !== undefined) {
    result.communicationScore = data.communicationScore;
  }
  if (data.reliabilityScore !== undefined) result.reliabilityScore = data.reliabilityScore;
  if (data.evaluationStatus !== undefined) result.evaluationStatus = data.evaluationStatus;
  if (data.bgvStatus !== undefined) result.bgvStatus = data.bgvStatus;
  if (data.profileStatus !== undefined) result.profileStatus = data.profileStatus;
  if (data.deploymentStatus !== undefined) result.deploymentStatus = data.deploymentStatus;
  if (data.visibility !== undefined) result.visibility = data.visibility;

  return result;
}

export function buildCandidateCreateData(
  organizationId: number,
  data: CreateCandidateInput,
): Prisma.CandidateUncheckedCreateInput {
  const scalar = buildCandidateScalarData(data);
  return {
    ...(scalar as Prisma.CandidateUncheckedCreateInput),
    organizationId: BigInt(organizationId),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email.toLowerCase(),
    phone: data.phone,
    status: data.status,
    source: data.source,
    ...(data.skills?.length
      ? {
          skills: {
            create: data.skills.map((skill) => ({
              skillCommunityId:
                skill.skillCommunityId != null
                  ? BigInt(skill.skillCommunityId)
                  : null,
              skillName: skill.skillName?.trim() || 'Skill',
              skillCategory: skill.skillCategory,
              proficiencyLevel: skill.proficiencyLevel ?? 'INTERMEDIATE',
              yearsExperience: skill.yearsExperience,
              isPrimary: skill.isPrimary ?? false,
              notes: skill.notes,
            })),
          },
        }
      : {}),
  };
}

export function mapCandidateExtendedDto(candidate: {
  oorwinCandidateId: string | null;
  sourceCandidateId?: string | null;
  displayName: string | null;
  primaryRole: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  education: string | null;
  timezone: string | null;
  noticePeriod: string | null;
  githubUrl: string | null;
  naukriUrl: string | null;
  clientBillRate: { toString(): string } | null;
  candidatePayRate: { toString(): string } | null;
  grossMargin: { toString(): string } | null;
  availabilityStatus: CandidateAvailabilityStatus | null;
  timezoneOverlap: string | null;
  preferredShift: string | null;
  minHoursPerWeek: number | null;
  maxHoursPerWeek: number | null;
  aiSummary: string | null;
  clientProfileSummary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  riskFlags: string | null;
  bestalScore: number | null;
  technicalScore: number | null;
  communicationScore: number | null;
  reliabilityScore: number | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  profileStatus: CandidateProfileStatus | null;
  deploymentStatus: string | null;
  submittedForApprovalAt: Date | null;
  createdById: bigint | null;
}) {
  return {
    oorwinCandidateId: candidate.oorwinCandidateId,
    sourceCandidateId: candidate.sourceCandidateId ?? null,
    displayName: candidate.displayName,
    primaryRole: candidate.primaryRole,
    currentCompany: candidate.currentCompany,
    currentTitle: candidate.currentTitle,
    education: candidate.education,
    timezone: candidate.timezone ?? null,
    noticePeriod: candidate.noticePeriod ?? null,
    githubUrl: candidate.githubUrl,
    naukriUrl: candidate.naukriUrl,
    clientBillRate: candidate.clientBillRate ? Number(candidate.clientBillRate) : null,
    candidatePayRate: candidate.candidatePayRate ? Number(candidate.candidatePayRate) : null,
    grossMargin: candidate.grossMargin ? Number(candidate.grossMargin) : null,
    availabilityStatus: candidate.availabilityStatus,
    timezoneOverlap: candidate.timezone ?? candidate.timezoneOverlap ?? null,
    preferredShift: candidate.preferredShift,
    minHoursPerWeek: candidate.minHoursPerWeek,
    maxHoursPerWeek: candidate.maxHoursPerWeek,
    aiSummary: candidate.aiSummary,
    clientProfileSummary: candidate.clientProfileSummary,
    strengths: candidate.strengths,
    weaknesses: candidate.weaknesses,
    riskFlags: candidate.riskFlags,
    bestalScore: candidate.bestalScore,
    technicalScore: candidate.technicalScore,
    communicationScore: candidate.communicationScore,
    reliabilityScore: candidate.reliabilityScore,
    evaluationStatus: candidate.evaluationStatus,
    bgvStatus: candidate.bgvStatus,
    profileStatus: candidate.profileStatus,
    deploymentStatus: candidate.deploymentStatus,
    submittedForApprovalAt: candidate.submittedForApprovalAt?.toISOString() ?? null,
    createdById: candidate.createdById ? bigintToNumber(candidate.createdById) : null,
  };
}
