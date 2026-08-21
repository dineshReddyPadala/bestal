import type { CommunityProfileSlide, DemoEngineer, ScoreRow } from './demo-engineers';

export type PublicFeaturedEvaluation = {
  technicalScore: number | null;
  problemSolvingScore: number | null;
  collaborationCulturalFitScore: number | null;
  clientReadinessScore: number | null;
  communicationScore: number | null;
  evaluationSummary: string | null;
  recommendation: string | null;
  evaluatorComments: string | null;
  evaluationDate: string | null;
};

export type PublicFeaturedCandidate = {
  id: number;
  firstName: string;
  lastName: string;
  status: string;
  visibility: string;
  approvalStatus: string;
  headline: string | null;
  location: string | null;
  yearsExperience: number | null;
  primarySkillCommunityName: string | null;
  primaryRole: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  bestalScore: number | null;
  clientBillRate: number | null;
  currency: string | null;
  availabilityStatus: string | null;
  timezoneOverlap: string | null;
  profileImageUrl: string | null;
  skillNames: string[];
  publishedAt: string | null;
  evaluation: PublicFeaturedEvaluation | null;
};

const PLACEHOLDER_NOTE =
  '[PLACEHOLDER: tester note pending — retains structure of a scored, written evaluation from an outside specialist.]';

const EVALUATION_DIMENSIONS = [
  { key: 'technicalScore', label: 'Technical depth' },
  { key: 'problemSolvingScore', label: 'Problem solving' },
  { key: 'collaborationCulturalFitScore', label: 'Collaboration & Cultural Fit' },
  { key: 'communicationScore', label: 'Communication score' },
  { key: 'clientReadinessScore', label: 'Client readiness score' },
] as const satisfies ReadonlyArray<{
  key: keyof PublicFeaturedEvaluation;
  label: string;
}>;

function toDisplayScore(score: number | null | undefined): number | null {
  if (score == null || Number.isNaN(score)) return null;
  if (score <= 10) return Math.round(score * 10) / 10;
  return Math.round((score / 10) * 10) / 10;
}

function scoreTone(value: number): ScoreRow['tone'] {
  return value >= 9 ? 'teal' : 'gold';
}

function buildEvaluationDimensions(
  evaluation: PublicFeaturedEvaluation | null,
): ScoreRow[] {
  if (!evaluation) return [];

  return EVALUATION_DIMENSIONS.flatMap(({ key, label }) => {
    const value = toDisplayScore(evaluation[key] as number | null);
    if (value == null) return [];
    return [{ label, value, tone: scoreTone(value) }];
  });
}

function resolveEvaluationQuote(evaluation: PublicFeaturedEvaluation | null): {
  quote: string;
  quoteIsPlaceholder: boolean;
} {
  if (!evaluation) {
    return { quote: PLACEHOLDER_NOTE, quoteIsPlaceholder: true };
  }

  const quote =
    evaluation.evaluationSummary?.trim() ||
    evaluation.recommendation?.trim() ||
    evaluation.evaluatorComments?.trim() ||
    '';

  if (!quote) {
    return { quote: PLACEHOLDER_NOTE, quoteIsPlaceholder: true };
  }

  return { quote, quoteIsPlaceholder: false };
}

function formatTestedOn(evaluationDate: string | null | undefined): string {
  if (!evaluationDate) return '—';
  const date = new Date(`${evaluationDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDisplayName(firstName: string, lastName: string): string {
  const initial = lastName.trim().charAt(0);
  return initial ? `${firstName} ${initial}.` : firstName;
}

function formatInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
}

function formatExperience(years: number | null): string {
  if (years == null || years <= 0) return 'Experience on profile';
  return years === 1 ? '1 year' : `${years} years`;
}

function formatAvailability(status: string | null | undefined): string {
  switch (status) {
    case 'AVAILABLE':
    case 'IMMEDIATE':
      return 'Available now';
    case 'ONE_WEEK':
      return 'Available in 1 week';
    case 'TWO_WEEKS':
      return 'Available in 2 weeks';
    case 'THIRTY_DAYS':
      return 'Available in 30 days';
    case 'FUTURE':
      return 'Available on request';
    case 'NOT_AVAILABLE':
      return 'Not available';
    default:
      return 'Check availability';
  }
}

function formatConfirmed(publishedAt: string | null | undefined): string {
  if (!publishedAt) return '';
  const diffMs = Date.now() - new Date(publishedAt).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return '';
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) {
    const value = Math.max(hours, 1);
    return `Confirmed ${value} hour${value === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(hours / 24);
  return `Confirmed ${days} day${days === 1 ? '' : 's'} ago`;
}

function timezoneDetails(overlap: string | null | undefined): {
  zoneLabel: string;
  zoneHours: string;
  timezone: string;
} {
  const raw = overlap?.trim();
  if (!raw) {
    return {
      timezone: 'Central',
      zoneLabel: 'Works US Central hours',
      zoneHours: '9:00am – 6:00pm CST · full business day',
    };
  }

  const lower = raw.toLowerCase();
  if (lower.includes('pacific') || lower.includes('pst') || lower.includes(' pt')) {
    return {
      timezone: 'Pacific',
      zoneLabel: 'Works US Pacific hours',
      zoneHours: '9:00am – 6:00pm PST · full business day',
    };
  }
  if (lower.includes('eastern') || lower.includes('est') || lower.includes(' et')) {
    return {
      timezone: 'Eastern',
      zoneLabel: 'Works US Eastern hours',
      zoneHours: '9:00am – 6:00pm EST · full business day',
    };
  }
  if (lower.includes('mountain') || lower.includes('mst') || lower.includes(' mt')) {
    return {
      timezone: 'Mountain',
      zoneLabel: 'Works US Mountain hours',
      zoneHours: '9:00am – 6:00pm MST · full business day',
    };
  }
  if (lower.includes('central') || lower.includes('cst') || lower.includes(' ct')) {
    return {
      timezone: 'Central',
      zoneLabel: 'Works US Central hours',
      zoneHours: '9:00am – 6:00pm CST · full business day',
    };
  }

  return {
    timezone: raw,
    zoneLabel: raw.includes('overlap') ? raw : `${raw} overlap`,
    zoneHours: 'Full business day overlap',
  };
}

export function mapFeaturedCandidateToDemoEngineer(
  candidate: PublicFeaturedCandidate,
): DemoEngineer {
  const experience = formatExperience(candidate.yearsExperience);
  const location = candidate.location?.trim() || 'Location on profile';
  const { zoneLabel, zoneHours, timezone } = timezoneDetails(candidate.timezoneOverlap);
  const skills =
    candidate.skillNames.length > 0
      ? candidate.skillNames
      : candidate.primarySkillCommunityName
        ? [candidate.primarySkillCommunityName]
        : [];
  const dimensions = buildEvaluationDimensions(candidate.evaluation);
  const { quote, quoteIsPlaceholder } = resolveEvaluationQuote(candidate.evaluation);

  return {
    id: String(candidate.id),
    initials: formatInitials(candidate.firstName, candidate.lastName),
    name: formatDisplayName(candidate.firstName, candidate.lastName),
    role: candidate.primaryRole ?? candidate.headline ?? 'Technology Consultant',
    discipline: candidate.primarySkillCommunityName ?? 'Technology',
    experience,
    location,
    meta: `${experience} · ${location}`,
    rate: candidate.clientBillRate ?? 0,
    skills,
    zoneLabel,
    zoneHours,
    timezone,
    score: candidate.bestalScore ?? 0,
    dimensions,
    quote,
    quoteIsPlaceholder,
    evaluation: quote,
    testedOn: formatTestedOn(candidate.evaluation?.evaluationDate),
    availability: formatAvailability(candidate.availabilityStatus),
    availabilityWeeks:
      candidate.availabilityStatus === 'TWO_WEEKS'
        ? 2
        : candidate.availabilityStatus === 'ONE_WEEK'
          ? 1
          : 0,
    confirmed: formatConfirmed(candidate.publishedAt),
    trialEligible: true,
  };
}

export function mapFeaturedCandidateToProfileSlide(
  candidate: PublicFeaturedCandidate,
): CommunityProfileSlide {
  const community = candidate.primarySkillCommunityName ?? 'Technology';
  return {
    community,
    description: candidate.headline ?? candidate.primaryRole ?? community,
    engineer: mapFeaturedCandidateToDemoEngineer(candidate),
  };
}
