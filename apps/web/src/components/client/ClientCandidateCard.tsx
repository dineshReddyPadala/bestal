import { getBestalScore } from '@bestal/mock-data';
import { cn, formatCurrency, formatDate, initials } from '@bestal/shared-utils';
import { Badge, Button, Card, SkillBadge } from '@bestal/ui';
import { Calendar, MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
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
        tier === 'good' && 'bg-brand-light text-brand',
      )}
    >
      <Star className="h-3 w-3 fill-current" />
      {score}
    </div>
  );
}

function ProfilePhotoPanel({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = src?.trim();
  const showImage = Boolean(imageSrc) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [imageSrc]);

  return (
    <div className={cn('relative shrink-0 overflow-hidden bg-muted', className)}>
      {showImage ? (
        <img
          src={imageSrc}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-brand-light">
          <span className="text-3xl font-semibold tracking-tight text-brand">
            {initials(name)}
          </span>
        </div>
      )}
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
    <Card className="flex h-full min-h-[13rem] overflow-hidden transition-shadow hover:shadow-elevated">
      <ProfilePhotoPanel
        name={fullName}
        src={candidate.photoUrl}
        className="w-[44%] min-w-[6.5rem] self-stretch"
      />
      <div className={cn('flex min-w-0 flex-1 flex-col p-4', compact && 'p-3')}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">{fullName}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{candidate.headline}</p>
          </div>
          <ScoreBadge score={score} />
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Previously at
        </p>
        <p className="line-clamp-1 text-sm font-semibold text-foreground">
          {community}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
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

        <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onView} className="flex-1 sm:flex-none">
            View profile
          </Button>
          {onRequestTrial && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestTrial}
              className="hidden sm:inline-flex"
            >
              Trial
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
