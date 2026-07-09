import { useQuery } from '@tanstack/react-query';
import { listSkillCommunities } from '../../lib/api/skill-communities';
import { queryKeys } from './query-keys';

export function useSkillCommunitiesList() {
  return useQuery({
    queryKey: queryKeys.skillCommunities.all,
    queryFn: listSkillCommunities,
    staleTime: 5 * 60_000,
  });
}
