import { getBestalScore } from '@bestal/mock-data';
import { cn, formatCurrency, formatDate } from '@bestal/shared-utils';
import { Avatar, Badge, Button, Card, CardContent, SkillBadge } from '@bestal/ui';
import { Calendar, MapPin, Star } from 'lucide-react';
import type { MockCandidate } from '@bestal/mock-data';
import { getPrimaryCommunity, getScoreTier } from '../../lib/client-candidates';

type ClientCandidateCardProps = {
  candidate: MockCandidate;
  onView: () => void;
  onRequestTrial?: () => void;
  compact?: boolean;
};

function ScoreBadge({ score }: { score: number }) {
  const tier = getScoreTier(score);
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        tier === 'elite' && 'bg-amber-50 text-amber-700',
        tier === 'strong' && 'bg-emerald-50 text-emerald-700',
        tier === 'good' && 'bg-blue-50 text-blue-700',
      )}
    >
      <Star className="h-3 w-3 fill-current" />
      {score}
    </div>
  );
}

export function ClientCandidateCard({
  candidate,
  onView,
  onRequestTrial,
  compact = false,
}: ClientCandidateCardProps) {
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const score = getBestalScore(candidate.id);
  const community = getPrimaryCommunity(candidate);

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-elevated">
      <CardContent className={cn('flex flex-1 flex-col p-4 sm:p-5', compact && 'p-4')}>
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar name={fullName} src={candidate.photoUrl} size="lg" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-foreground">{fullName}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{candidate.headline}</p>
              </div>
              <ScoreBadge score={score} />
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {candidate.location}
              </span>
              <span>{candidate.yearsExperience} yrs</span>
              <span className="font-medium text-foreground">
                {formatCurrency(candidate.expectedRate, candidate.currency)}/hr
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-normal">
                {community}
              </Badge>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Available {formatDate(candidate.availableFrom)}
              </span>
            </div>

            {!compact && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {candidate.skills.slice(0, 3).map((skill) => (
                  <SkillBadge
                    key={skill.skillCommunityId}
                    name={skill.skillCommunityName}
                    proficiency={skill.proficiencyLevel}
                    isPrimary={skill.isPrimary}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={onView} className="flex-1 sm:flex-none">
            View profile
          </Button>
          {onRequestTrial && (
            <Button variant="outline" size="sm" onClick={onRequestTrial} className="hidden sm:inline-flex">
              Trial
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
