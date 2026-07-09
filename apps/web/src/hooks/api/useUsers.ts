import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type InviteUserBody } from '../../lib/api/users';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useUsersList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.list(params),
  });
}

export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.users.all });

  return {
    invite: useMutation({
      mutationFn: (body: InviteUserBody) => usersApi.invite(body),
      onSuccess: invalidate,
    }),
    inviteBulk: useMutation({
      mutationFn: (users: InviteUserBody[]) => usersApi.inviteBulk(users),
      onSuccess: invalidate,
    }),
  };
}
