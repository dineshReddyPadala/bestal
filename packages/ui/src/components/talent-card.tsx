import { cn, formatCurrency } from '@bestal/shared-utils';
import { MapPin } from 'lucide-react';
import { Avatar } from './avatar.js';
import { Button } from './button.js';
import { Card, CardContent } from './card.js';
import { SkillBadge } from './skill-badge.js';
import { StatusBadge } from './status-badge.js';

export type TalentCardProps = {
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  yearsExperience: number;
  expectedRate: number;
  currency?: string;
  photoUrl?: string;
  status?: string;
  skills?: Array<{
    skillCommunityName: string;
    proficiencyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    isPrimary?: boolean;
  }>;
  onView?: () => void;
  className?: string;
};

export function TalentCard({
  firstName,
  lastName,
  headline,
  location,
  yearsExperience,
  expectedRate,
  currency = 'USD',
  photoUrl,
  status,
  skills = [],
  onView,
  className,
}: TalentCardProps) {
  const fullName = `${firstName} ${lastName}`;

  return (
    <Card className={cn('transition-shadow hover:shadow-elevated', className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar name={fullName} src={photoUrl} size="lg" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{headline}</p>
              </div>
              {status && <StatusBadge status={status} />}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
              <span>{yearsExperience} yrs exp</span>
              <span className="font-medium text-foreground">
                {formatCurrency(expectedRate, currency)}/hr
              </span>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 4).map((skill) => (
                  <SkillBadge
                    key={skill.skillCommunityName}
                    name={skill.skillCommunityName}
                    proficiency={skill.proficiencyLevel}
                    isPrimary={skill.isPrimary}
                  />
                ))}
                {skills.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{skills.length - 4} more</span>
                )}
              </div>
            )}

            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                View Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
