import { skillCommunities } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import { Badge, Card, CardContent, CardHeader, CardTitle, PageHeader, resolveIcon } from '@bestal/ui';

export function SkillCommunitiesPage() {
  return (
    <div>
      <PageHeader
        title="Skill Communities"
        description="Talent verticals and specialization groups"
      />

      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {skillCommunities.map((community) => {
          const Icon = resolveIcon(community.icon);
          return (
            <Card key={community.id} className="transition-shadow hover:shadow-elevated">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  {community.featured && <Badge variant="navy">Featured</Badge>}
                </div>
                <CardTitle className="pt-3">{community.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{community.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-semibold">{community.candidateCount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Talent</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-semibold">{community.activeJobs}</p>
                    <p className="text-xs text-muted-foreground">Jobs</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-2">
                    <p className="text-lg font-semibold">
                      {formatCurrency(community.avgRate, community.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
