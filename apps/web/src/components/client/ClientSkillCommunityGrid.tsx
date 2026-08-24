import { ArrowRight } from 'lucide-react';
import { SkillCommunityIcon } from '../marketing/SkillCommunityIcon';
import type { SkillCommunityListItem } from '../../lib/api/types';

type ClientSkillCommunityCardProps = {
  community: SkillCommunityListItem;
  onSelect: (community: SkillCommunityListItem) => void;
};

export function ClientSkillCommunityCard({ community, onSelect }: ClientSkillCommunityCardProps) {
  return (
    <button
      type="button"
      className="group flex h-full w-full flex-col rounded-xl border border-border/80 bg-card p-5 text-left shadow-sm transition hover:border-brand/30 hover:shadow-md"
      onClick={() => onSelect(community)}
    >
      <div className="flex items-start gap-3">
        <SkillCommunityIcon
          iconUrl={community.iconUrl}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-brand"
          imageClassName="h-10 w-10 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-foreground">{community.name}</h3>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-brand"
              aria-hidden
            />
          </div>
          {community.description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{community.description}</p>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function ClientSkillCommunityGrid({
  communities,
  isLoading,
  onSelect,
}: {
  communities: SkillCommunityListItem[];
  isLoading: boolean;
  onSelect: (community: SkillCommunityListItem) => void;
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading skill communities…</p>;
  }

  if (communities.length === 0) {
    return <p className="text-sm text-muted-foreground">No skill communities are available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {communities.map((community) => (
        <ClientSkillCommunityCard key={community.id} community={community} onSelect={onSelect} />
      ))}
    </div>
  );
}
