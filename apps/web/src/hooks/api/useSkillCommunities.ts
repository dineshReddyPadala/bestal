import { useQuery } from '@tanstack/react-query';
import { listPublicSkillCommunities, listSkillCommunities } from '../../lib/api/skill-communities';
import { queryKeys } from './query-keys';

export function useSkillCommunitiesList() {
  return useQuery({
    queryKey: queryKeys.skillCommunities.all,
    queryFn: listSkillCommunities,
    staleTime: 5 * 60_000,
  });
}

export function usePublicSkillCommunitiesList() {
  return useQuery({
    queryKey: queryKeys.skillCommunities.public,
    queryFn: listPublicSkillCommunities,
    staleTime: 5 * 60_000,
  });
}
